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

  OnStopClick() {
    this.audioService.stop();
  }

  OnFastClick() {
    this.audioService.faster();
  }

  OnSlowClick() {
    this.audioService.slower();
  }

  OnRecover() {
    this.audioService.recover();
  }

}
