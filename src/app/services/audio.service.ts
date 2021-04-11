import { ISource } from './../sound-buttons/Buttons';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  audioQueue: HTMLAudioElement[] = [];

  public lastSource: ISource | undefined = undefined;

  constructor() { }

  public add(url: string, source?: ISource): void {
    this.lastSource = source;

    const audio = new Audio(url);
    audio.addEventListener('ended', (event) => {
      this.audioQueue.splice(this.audioQueue.indexOf(audio), 1);
    });
    this.audioQueue.push(audio);
    audio.play();
  }

  public stopAll(): void {
    this.audioQueue.forEach(audio => {
      audio.pause();
      audio.remove();
    });
    this.audioQueue = [];
  }

}
