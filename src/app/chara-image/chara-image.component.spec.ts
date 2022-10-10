import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CharaImageComponent } from './chara-image.component';

describe('CharaImageComponent', () => {
  let component: CharaImageComponent;
  let fixture: ComponentFixture<CharaImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CharaImageComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CharaImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
