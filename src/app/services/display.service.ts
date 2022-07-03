import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DisplayService {
  public OnConfigChanged: EventEmitter<[number, string]> = new EventEmitter();
  private displaySet = 0;
  private filterText = '';

  public setDisplay(i: number): void {
    this.displaySet = i;
    this.OnConfigChanged.emit([this.displaySet, this.filterText]);
  }
  public getDisplay(): number {
    return this.displaySet;
  }

  public setFilterText(s: string): void {
    this.filterText = s;
    this.OnConfigChanged.emit([this.displaySet, this.filterText]);
  }
  public getFilterText(): string {
    return this.filterText;
  }
}
