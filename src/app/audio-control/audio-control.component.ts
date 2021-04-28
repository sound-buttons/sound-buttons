import { AudioService } from './../services/audio.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-audio-control',
  templateUrl: './audio-control.component.html',
  styleUrls: ['./audio-control.component.scss']
})
export class AudioControlComponent implements OnInit {

  constructor(
    private audioService: AudioService
  ) { }

  ngOnInit(): void {
  }

  OnStopClick(): void {
    this.audioService.stop();
  }

  OnFastClick(): void {
    this.audioService.faster();
  }

  OnSlowClick(): void {
    this.audioService.slower();
  }

  OnRecover(): void {
    this.audioService.recover();
  }

  OnVolumeChange($event: any): void {
    console.log($event);
    this.audioService.volume(+($event.target as HTMLInputElement).value);
  }

}
