import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ClickService {
  public OnClick: EventEmitter<number> = new EventEmitter();
  constructor(private http: HttpClient) {
    this.StepClicks();
  }

  public StepClicks() {
    this.http.get('https://view-counter.sound-buttons.click').subscribe((res) => {
      this.OnClick.emit(+res);
    });
  }
}
