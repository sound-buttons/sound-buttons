import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { SEOService } from './seo.service';

// Capability: content-routing-and-seo — meta/OG/Twitter/canonical tag management.
describe('SEOService', () => {
  let service: SEOService;
  let title: Title;
  let meta: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SEOService, Title, Meta] });
    service = TestBed.inject(SEOService);
    title = TestBed.inject(Title);
    meta = TestBed.inject(Meta);
  });

  afterEach(() => {
    document.head.querySelector("link[rel='canonical']")?.remove();
  });

  it('setTitle sets <title> and og:title / og:site_name', () => {
    service.setTitle('My Title');

    expect(title.getTitle()).toBe('My Title');
    expect(meta.getTag("property='og:title'")?.content).toBe('My Title');
    expect(meta.getTag("property='og:site_name'")?.content).toBe('My Title');
  });

  it('setDescription sets description and og:description', () => {
    service.setDescription('A description');

    expect(meta.getTag("name='description'")?.content).toBe('A description');
    expect(meta.getTag("property='og:description'")?.content).toBe('A description');
  });

  it('setUrl sets og:url and a single canonical link', () => {
    service.setUrl('https://example.com/a');
    service.setUrl('https://example.com/b'); // should replace, not duplicate

    expect(meta.getTag("property='og:url'")?.content).toBe('https://example.com/b');
    const canonicals = document.head.querySelectorAll("link[rel='canonical']");
    expect(canonicals.length).toBe(1);
    expect(canonicals[0].getAttribute('href')).toBe('https://example.com/b');
  });

  it('setImage sets og:image and twitter:image', () => {
    service.setImage('https://example.com/i.png');

    expect(meta.getTag("property='og:image'")?.content).toBe('https://example.com/i.png');
    expect(meta.getTag("name='twitter:image'")?.content).toBe('https://example.com/i.png');
  });
});
