import { LanguageService } from './language.service';

// Capability: internationalization — browser-driven language resolution.
describe('LanguageService', () => {
  describe('GetTextFromObject', () => {
    it('returns the entry matching the current browser language when present', () => {
      const original = LanguageService.BrowserLanguage;
      (LanguageService as { BrowserLanguage: string }).BrowserLanguage = 'ja';

      expect(LanguageService.GetTextFromObject({ zh: '中文', ja: '日本語' })).toBe('日本語');

      (LanguageService as { BrowserLanguage: string }).BrowserLanguage = original;
    });

    it('falls back to the first key when no language matches', () => {
      const original = LanguageService.BrowserLanguage;
      (LanguageService as { BrowserLanguage: string }).BrowserLanguage = 'fr';

      expect(LanguageService.GetTextFromObject({ zh: '中文', ja: '日本語' })).toBe('中文');

      (LanguageService as { BrowserLanguage: string }).BrowserLanguage = original;
    });
  });

  it('maps the browser language to its first subtag (e.g. zh-TW -> zh)', () => {
    // BrowserLanguage is derived once from navigator.language at load time.
    const firstSubtag = (navigator.language || navigator.languages[0]).match(/^([^-_]*)/)?.[0];
    expect(LanguageService.BrowserLanguage).toBe(firstSubtag ?? 'zh');
  });

  it('exposes no in-app language switching API (language is derived, not set)', () => {
    expect((LanguageService as unknown as { setLanguage?: unknown }).setLanguage).toBeUndefined();
    expect((LanguageService.prototype as { use?: unknown }).use).toBeUndefined();
  });
});
