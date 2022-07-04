import { ISource } from './../sound-buttons/Buttons';
import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  audioQueue: HTMLAudioElement[] = [];

  public lastSource: ISource | undefined = undefined;
  public OnSourceChanged: EventEmitter<ISource | undefined> = new EventEmitter();
  private nowVolume = 1;
  private nowSpeed = 1;

  public add(url: string, source?: ISource, volume = 1): void {
    const audio = new Audio(url);
    audio.volume = volume * this.nowVolume;
    audio.playbackRate = this.nowSpeed;
    audio.addEventListener('ended', () => {
      this.audioQueue.splice(this.audioQueue.indexOf(audio), 1);
    });
    this.audioQueue.push(audio);
    audio.play();

    this.lastSource = source;
    this.OnSourceChanged.emit(source);
  }

  public stop(): void {
    this.audioQueue.forEach((audio) => {
      audio.pause();
      audio.remove();
    });
    this.audioQueue = [];
  }

  public faster(): void {
    if (this.nowSpeed < 4) {
      this.nowSpeed += 0.1;
      this.audioQueue.forEach((audio) => {
        audio.playbackRate = this.nowSpeed;
      });
    }
  }

  public slower(): void {
    if (this.nowSpeed > 0.5) {
      this.nowSpeed -= 0.1;
      this.audioQueue.forEach((audio) => {
        audio.playbackRate = this.nowSpeed;
      });
    }
  }

  public recover(): void {
    this.nowSpeed = 1;
    this.audioQueue.forEach((audio) => {
      audio.playbackRate = 1;
    });
  }

  public volume(volume: number): void {
    // 使之不為0，乘上0原數值就回不來了
    if (volume === 0) {
      volume = 0.0001;
    }

    this.audioQueue.forEach((audio) => {
      audio.volume /= this.nowVolume;
      audio.volume *= volume;
    });
    this.nowVolume = volume;
  }
}
