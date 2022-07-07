import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class SEOService {
  constructor(
    @Inject(DOCUMENT) private dom: Document,
    private titleSvc: Title,
    private metaSvc: Meta
  ) {}

  setTitle(title: string): void {
    this.titleSvc.setTitle(title);
  }

  setDescription(content: string): void {
    this.metaSvc.updateTag({ name: 'description', content });
  }

  setCanonicalLink(url: string): void {
    this.dom.head.querySelector("link[rel='canonical']")?.remove();

    const link: HTMLLinkElement = this.dom.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    this.dom.head.appendChild(link);
  }

  setOgUrl(url: string): void {
    this.metaSvc.updateTag({ property: 'og:url', content: url });
  }
}
