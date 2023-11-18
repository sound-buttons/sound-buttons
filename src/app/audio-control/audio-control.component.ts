import { from } from 'rxjs';
import { filter, last, mergeMap, reduce, switchMap, tap } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import random from 'random';
import { ConfigService } from './../services/config.service';
import { AudioService } from './../services/audio.service';
import { IButton } from '../sound-buttons/Buttons';

@Component({
  selector: 'app-audio-control',
  templateUrl: './audio-control.component.html',
  styleUrls: ['./audio-control.component.scss'],
})
export class AudioControlComponent implements OnInit {
  constructor(public audioService: AudioService, private configService: ConfigService) {}

  volume = 0.5;
  buttons = this.audioService.getQueuedButtons;

  ngOnInit(): void {
    this.audioService.volume(this.volume);
  }

  OnStopClick = this.audioService.stop;

  OnShuffleClick(): void {
    if (this.configService.config?.buttonGroups === undefined) return;

    this.audioService.stop();

    from(this.configService.config.buttonGroups)
      .pipe(
        filter(
          (buttonGroup) =>
            !buttonGroup.name.includes('大叫') &&
            !buttonGroup.name.includes('悲鳴') &&
            !buttonGroup.name.includes('自肥')
        ),
        mergeMap((buttonGroup) => buttonGroup.buttons),
        reduce((acc: IButton[], value) => {
          const rand = random.int(0, acc.length);
          acc.splice(rand, 0, value);
          return acc;
        }, []),
        switchMap((buttons) => from(buttons)),
        tap((button) => this.audioService.add(button)),
        last()
      )
      .subscribe(() => {
        if (!this.audioService.isPaused() && !this.audioService.isPlaying())
          this.audioService.play();
      });
  }

  OnPlayClick = this.audioService.play;

  OnPauseClick = this.audioService.pause;

  OnVolumeChange($event: Event): void {
    this.audioService.volume(+($event.target as HTMLInputElement).value);
  }

  buttonClick($event: MouseEvent, button: IButton): void {
    this.audioService.remove(button.index!);
  }

  trackById(_index: number, item: IButton): string {
    return item.id;
  }
}
