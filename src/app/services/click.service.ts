import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ClickService {
  public UpdateClicks: EventEmitter<number> = new EventEmitter();
  constructor(private http: HttpClient) {
    this.GetClicks();
  }

  public GetClicks() {
    this.http.get('https://view-counter.sound-buttons.click').subscribe((res) => {
      this.UpdateClicks.emit(+res);
    });
  }

  public StepClicks() {
    this.http.post('https://view-counter.sound-buttons.click', {}).subscribe((res) => {
      this.UpdateClicks.emit(+res);
    });
  }
}
