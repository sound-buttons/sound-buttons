/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Bootstraps third-party analytics (Cloudflare RUM + Google Analytics + Microsoft Clarity).
 *
 * Extracted from the `AppModule` constructor so the behavior can be unit-tested
 * with injected `window`/`document`/`navigator`/`env` doubles. Behavior is
 * preserved exactly:
 *  - Global Privacy Control enabled -> install a no-op `gtag`, inject nothing.
 *  - Non-production -> install a debug `gtag`, inject nothing.
 *  - Production -> inject the Cloudflare RUM beacon (when a token is configured),
 *    then the real GA + Clarity scripts using the configured IDs.
 */
export function bootstrapAnalytics(
  env: any,
  win: Window & typeof globalThis = window,
  doc: Document = document,
  nav: Navigator = navigator
): void {
  if (nav.globalPrivacyControl) {
    win.gtag = () => {};
    console.log(
      '%cWe can see that you have enabled the Global Privacy Control, indicating that you do not wish to have your information sold or shared.',
      'font-weight:bold; color: lightgreen;',
      '\nYour privacy is important to us, and we completely honor your choice.',
      'As a result, we have deactivated Google Analytics, Microsoft Clarity, and Cloudflare RUM. 😉'
    );
    return;
  }

  if (!env.production) {
    // Add dummy gtag for dev
    win.gtag = (...args: any[]) => {
      console.debug('gtag', args);
    };
    return;
  }

  // Setup Cloudflare RUM (Real User Measurements)
  if (env.CLOUDFLARE_RUM_TOKEN) {
    (function (token: string) {
      const rumScript = doc.createElement('script');
      rumScript.defer = true;
      rumScript.src = 'https://static.cloudflareinsights.com/beacon.min.js';
      rumScript.setAttribute('data-cf-beacon', JSON.stringify({ token: token }));
      doc.head.appendChild(rumScript);
    })(env.CLOUDFLARE_RUM_TOKEN);
  }

  // Setup GA
  (function (id) {
    const gtagScript = doc.createElement('script');
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;

    doc.head.appendChild(gtagScript);

    const dataLayerScript = doc.createElement('script');
    dataLayerScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${id}');`;
    doc.head.appendChild(dataLayerScript);
  })(env.google.GA_TRACKING_ID);

  // Setup Clarity
  (function (c: any, l: Document, a: string, r: string, i: string, t: any, y: any) {
    c[a] =
      c[a] ||
      function (...args: any[]) {
        (c[a].q = c[a].q || []).push(args);
      };
    t = l.createElement(r);
    t.async = 1;
    t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(win, doc, 'clarity', 'script', env.CLARITY_TRACKING_ID, undefined, undefined);
}
