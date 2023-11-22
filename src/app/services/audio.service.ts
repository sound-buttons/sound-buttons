import { Injectable } from '@angular/core';
import { IButton } from './../sound-buttons/Buttons';
import { ClickService } from './click.service';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  public readonly audioQueue: sound[] = [];

  private nowVolume = 1;
  private _pause = false;
  private _playing = false;
  private index = 0;
  private soundPlayCounts = 0;

  constructor(private clickService: ClickService) {}

  public isEmpty = () => this.audioQueue.length === 0;
  public canPlay = () => this.audioQueue.length !== 0 && this._pause;
  public canPause = () => this.audioQueue.length !== 0 && !this._pause;
  public isPaused = () => this._pause;
  public isPlaying = () => this._playing;
  public getQueuedButtons = () => this.audioQueue.map((sound) => sound.button);

  public add = (button: IButton): void => {
    const _button = Object.assign({}, button);
    const audio = new Audio(`${_button.baseRoute}${_button.filename}${_button.SASToken}`);
    audio.volume = Math.min(1, _button.volume * this.nowVolume);
    if (this.isEmpty()) {
      audio.preload = 'auto';
    } else {
      audio.preload = 'metadata';
    }
    _button.index = this.index++;
    const sound: sound = {
      button: _button,
      element: audio,
    };
    this.audioQueue.push(sound);

    audio.addEventListener(
      'ended',
      () => {
        this.remove(_button.index!);
        if (!this.isEmpty()) {
          this.audioQueue[0].element.play();
        } else {
          this._playing = false;
        }

        this.clickService.StepClicks();

        gtag('event', 'sound_play', {
          page: window.location.pathname,
          button: _button.id,
          name: _button.text,
        });
        gtag('event', 'sound_play_count', {
          count: ++this.soundPlayCounts,
        });
      },
      { once: true }
    );
  };

  public play = (): void => {
    this._pause = false;
    this._playing = true;
    if (this.isEmpty()) return;

    this.audioQueue[0].element.play();
  };

  public pause = (): void => {
    this._pause = true;
    this._playing = false;
    if (this.isEmpty()) return;

    this.audioQueue.forEach((sound) => {
      sound.element.pause();
    });
  };

  public stop = (): void => {
    this.audioQueue.forEach((sound) => {
      sound.element.pause();
      sound.element.remove();
    });
    this.audioQueue.length = 0;
    this._pause = false;
    this._playing = false;
  };

  public volume = (volume: number): void => {
    // 使之不為0，乘上0原數值就回不來了
    if (volume === 0) {
      volume = 0.0001;
    }

    this.audioQueue.forEach((sound) => {
      sound.element.volume /= this.nowVolume;
      sound.element.volume *= volume;
    });
    this.nowVolume = volume;
  };

  public remove = (index: number): void => {
    const soundIndex = this.audioQueue.findIndex((sound) => sound.button.index === index);
    if (soundIndex === -1) return;

    const sound = this.audioQueue[soundIndex];
    sound.element.pause();
    sound.element.remove();
    this.audioQueue.splice(soundIndex, 1);
    if (!this.isEmpty()) {
      if (!this._pause) this.audioQueue[0].element.play();
    } else {
      this._playing = false;
      this._pause = false;
    }
  };
}

interface sound {
  button: IButton;
  element: HTMLAudioElement;
}
