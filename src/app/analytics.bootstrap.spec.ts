import { bootstrapAnalytics } from './analytics.bootstrap';

// Capability: privacy-and-analytics — GPC opt-out, dev stub, and production loading.
describe('bootstrapAnalytics', () => {
  let win: { gtag?: unknown; clarity?: unknown; dataLayer?: unknown } & Record<string, unknown>;
  let doc: jasmine.SpyObj<Document>;
  let head: { appendChild: jasmine.Spy };
  let createdScripts: Array<{
    src: string;
    async: boolean;
    defer: boolean;
    innerHTML: string;
    attrs: Record<string, string>;
  }>;
  let firstScriptParent: { insertBefore: jasmine.Spy };

  function makeNavigator(gpc: boolean): Navigator {
    return { globalPrivacyControl: gpc } as unknown as Navigator;
  }

  beforeEach(() => {
    win = {};
    createdScripts = [];
    head = { appendChild: jasmine.createSpy('appendChild') };
    firstScriptParent = { insertBefore: jasmine.createSpy('insertBefore') };
    doc = jasmine.createSpyObj<Document>('Document', ['createElement', 'getElementsByTagName']);
    (doc.createElement as jasmine.Spy).and.callFake(() => {
      const el = {
        src: '',
        async: false,
        defer: false,
        innerHTML: '',
        attrs: {} as Record<string, string>,
        setAttribute(name: string, value: string): void {
          this.attrs[name] = value;
        },
      };
      createdScripts.push(el);
      return el as unknown as HTMLElement;
    });
    (doc.getElementsByTagName as jasmine.Spy).and.returnValue([
      { parentNode: firstScriptParent },
    ] as unknown as HTMLCollectionOf<Element>);
    Object.defineProperty(doc, 'head', { value: head, configurable: true });
  });

  it('with GPC enabled: installs a no-op gtag and injects no scripts', () => {
    bootstrapAnalytics(
      { production: true, google: { GA_TRACKING_ID: 'GA' }, CLARITY_TRACKING_ID: 'CL' },
      win as never,
      doc,
      makeNavigator(true)
    );

    expect(typeof win.gtag).toBe('function');
    expect(win.gtag).not.toThrow();
    expect(doc.createElement).not.toHaveBeenCalled();
    expect(head.appendChild).not.toHaveBeenCalled();
  });

  it('in non-production (GPC off): installs a debug gtag and injects no scripts', () => {
    bootstrapAnalytics(
      { production: false, google: { GA_TRACKING_ID: 'GA' }, CLARITY_TRACKING_ID: 'CL' },
      win as never,
      doc,
      makeNavigator(false)
    );

    expect(typeof win.gtag).toBe('function');
    expect(doc.createElement).not.toHaveBeenCalled();
  });

  it('in production (GPC off): injects GA + Clarity using the configured IDs', () => {
    bootstrapAnalytics(
      { production: true, google: { GA_TRACKING_ID: 'GA-123' }, CLARITY_TRACKING_ID: 'CL-456' },
      win as never,
      doc,
      makeNavigator(false)
    );

    // GA: a gtag/js script + an inline dataLayer script appended to <head>.
    const gaScript = createdScripts.find((s) => s.src.includes('googletagmanager.com'));
    expect(gaScript?.src).toBe('https://www.googletagmanager.com/gtag/js?id=GA-123');
    const inline = createdScripts.find((s) => s.innerHTML.includes("gtag('config', 'GA-123')"));
    expect(inline).toBeDefined();
    expect(head.appendChild).toHaveBeenCalledTimes(2);

    // Clarity: a script pointing at the Clarity tag id, inserted before the first script.
    const clarityScript = createdScripts.find((s) => s.src.includes('clarity.ms'));
    expect(clarityScript?.src).toBe('https://www.clarity.ms/tag/CL-456');
    expect(firstScriptParent.insertBefore).toHaveBeenCalled();
    expect(typeof (win as { clarity?: unknown }).clarity).toBe('function');

    // No Cloudflare RUM token configured -> the beacon is not injected.
    expect(createdScripts.some((s) => s.src.includes('cloudflareinsights.com'))).toBeFalse();
  });

  it('in production with a Cloudflare RUM token: injects the deferred beacon before GA', () => {
    bootstrapAnalytics(
      {
        production: true,
        google: { GA_TRACKING_ID: 'GA-123' },
        CLARITY_TRACKING_ID: 'CL-456',
        CLOUDFLARE_RUM_TOKEN: 'cf-token-789',
      },
      win as never,
      doc,
      makeNavigator(false)
    );

    const rumScript = createdScripts.find((s) => s.src.includes('cloudflareinsights.com'));
    expect(rumScript?.src).toBe('https://static.cloudflareinsights.com/beacon.min.js');
    expect(rumScript?.defer).toBeTrue();
    expect(rumScript?.attrs['data-cf-beacon']).toBe(JSON.stringify({ token: 'cf-token-789' }));
    // RUM beacon + GA gtag + GA dataLayer are all appended to <head>.
    expect(head.appendChild).toHaveBeenCalledTimes(3);
  });

  it('in production with an empty Cloudflare RUM token: skips the beacon', () => {
    bootstrapAnalytics(
      {
        production: true,
        google: { GA_TRACKING_ID: 'GA-123' },
        CLARITY_TRACKING_ID: 'CL-456',
        CLOUDFLARE_RUM_TOKEN: '',
      },
      win as never,
      doc,
      makeNavigator(false)
    );

    expect(createdScripts.some((s) => s.src.includes('cloudflareinsights.com'))).toBeFalse();
    expect(head.appendChild).toHaveBeenCalledTimes(2);
  });
});
