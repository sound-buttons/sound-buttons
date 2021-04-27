import { ISource } from './../sound-buttons/Buttons';
import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {


  audioQueue: HTMLAudioElement[] = [];

  public lastSource: ISource | undefined = undefined;
  public OnSourceChanged: EventEmitter<ISource> = new EventEmitter();

  constructor() { }

  public add(url: string, source?: ISource, volume = 1): void {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.addEventListener('ended', (event) => {
      this.audioQueue.splice(this.audioQueue.indexOf(audio), 1);
    });
    this.audioQueue.push(audio);
    audio.play();

    this.lastSource = source;
    this.OnSourceChanged.emit(source);
  }

  public stop(): void {
    this.audioQueue.forEach(audio => {
      audio.pause();
      audio.remove();
    });
    this.audioQueue = [];
  }

  public faster(): void {
    this.audioQueue.forEach(audio => {
      audio.playbackRate += 0.1;
    });
  }

  public slower(): void {
    this.audioQueue.forEach(audio => {
      if (audio.playbackRate > 0.1) {
        audio.playbackRate -= 0.1;
      }
    });
  }

  public recover(): void{
    this.audioQueue.forEach(audio => {
      audio.playbackRate = 1;
    });
  }
}
