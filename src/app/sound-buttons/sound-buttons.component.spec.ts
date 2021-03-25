import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundButtonsComponent } from './sound-buttons.component';

describe('SoundButtonsComponent', () => {
  let component: SoundButtonsComponent;
  let fixture: ComponentFixture<SoundButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SoundButtonsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SoundButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
