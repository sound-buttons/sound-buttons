import { EventEmitter, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class DisplayService {
  public OnConfigChanged: EventEmitter<string> = new EventEmitter();
  private filterText = '';

  constructor(private router: Router, private route: ActivatedRoute) {
    this.route.queryParams.subscribe((params) => {
      if (params.filter && params.filter !== this.filterText) {
        this.setFilterText(params.filter ?? '');
      }
    });
  }

  public setFilterText(s: string): void {
    if (s === this.filterText) return;

    this.filterText = s;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { filter: s ? s : null },
      queryParamsHandling: 'merge',
    });

    this.OnConfigChanged.emit(this.filterText);
  }
  public getFilterText(): string {
    return this.filterText;
  }
}
