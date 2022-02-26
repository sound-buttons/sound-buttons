import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DisplayService {

  public OnConfigChanged: EventEmitter<number> = new EventEmitter();
  private displaySet = 0;

  constructor() { }

  public setDisplay(i: number): void {
    this.displaySet = i;
    this.OnConfigChanged.emit(this.displaySet);
  }
  public getDisplay(): number{
    return this.displaySet;
  }
}
