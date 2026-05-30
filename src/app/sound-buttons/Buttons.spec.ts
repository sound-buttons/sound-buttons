import { Button, defaultBaseRoute } from './Buttons';
import { makeSource } from '../../testing/fixtures';

// Capability: configuration-loading — Button model re-instantiation defaults.
describe('Button (model)', () => {
  it('defaults text to filename, baseRoute to assets/sound/, volume 1, SASToken empty', () => {
    const b = new Button('id1', 'clip.webm');

    expect(b.id).toBe('id1');
    expect(b.filename).toBe('clip.webm');
    expect(b.text).toBe('clip.webm');
    expect(b.baseRoute).toBe(defaultBaseRoute);
    expect(b.volume).toBe(1);
    expect(b.SASToken).toBe('');
  });

  it('keeps an explicit string text and provided baseRoute/source', () => {
    const source = makeSource();
    const b = new Button('id2', 'a.webm', 'Hi', 'custom/route/', 0.5, source, '?sas');

    expect(b.text).toBe('Hi');
    expect(b.baseRoute).toBe('custom/route/');
    expect(b.volume).toBe(0.5);
    expect(b.source).toBe(source);
    expect(b.SASToken).toBe('?sas');
  });

  it('resolves a multilingual text object to a string via LanguageService', () => {
    const b = new Button('id3', 'a.webm', { zh: '中文', ja: '日本語' } as never);

    expect(typeof b.text).toBe('string');
    expect(['中文', '日本語']).toContain(b.text as string);
  });
});
