// Capability: audio-submission.
// Integration tests for the contribution upload form: validation rules, client-side
// file handling, multipart submission, status polling, result feedback, and the
// post-submit live-update redirect. Assertions exercise REAL behavior, not smoke checks.

import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';

import { UploadComponent } from './upload.component';
import { ConfigService, IFullConfig } from '../services/config.service';
import { DialogService } from '../services/dialog.service';
import { EnvironmentToken } from '../environment.token';
import { translateTestingImports, makeDialogServiceSpy } from '../../testing/angular';
import { makeFullConfig } from '../../testing/fixtures';

const ENV = { origin: 'https://x', api: 'https://api.example', version: 'v' };
const API = 'https://api.example/sound-buttons';
const HEALTHZ = 'https://api.example/healthz';
const VALID_YT = 'https://youtu.be/dQw4w9WgXcQ';

describe('UploadComponent (audio-submission)', () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;
  let httpMock: HttpTestingController;
  let dialogSpy: ReturnType<typeof makeDialogServiceSpy>;
  let configSpy: jasmine.SpyObj<ConfigService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let onConfigChanged: EventEmitter<IFullConfig | undefined>;

  beforeEach(async () => {
    onConfigChanged = new EventEmitter<IFullConfig | undefined>();
    dialogSpy = makeDialogServiceSpy();
    configSpy = jasmine.createSpyObj<ConfigService>('ConfigService', ['reloadConfig'], {
      OnConfigChanged: onConfigChanged,
    });
    (configSpy as unknown as { name: string }).name = 'template';
    (configSpy as unknown as { groupNames: string[] }).groupNames = [];
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [UploadComponent],
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        FormsModule,
        ...translateTestingImports(),
      ],
      providers: [
        { provide: ConfigService, useValue: configSpy },
        { provide: DialogService, useValue: dialogSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ name: 'template' }) } },
        },
        { provide: EnvironmentToken, useValue: ENV },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  /** Fill the form with one valid YouTube source so `form.valid` is true. */
  function fillValidForm(): void {
    component.form.patchValue({
      nameZH: '楓',
      group: '問候',
      videoId: VALID_YT,
      start: 0,
      end: 10,
    });
    component.updateValueAndValidity();
    component.form.get('nameZH')?.updateValueAndValidity();
    component.form.get('group')?.updateValueAndValidity();
  }

  // ----- Submission form and required fields -----

  it('keeps the form valid only when nameZH and group are filled (Validators.required)', () => {
    component.form.patchValue({ videoId: VALID_YT });
    component.updateValueAndValidity();
    expect(component.getFormControl('nameZH').valid).toBeFalse();
    expect(component.getFormControl('group').valid).toBeFalse();

    fillValidForm();
    expect(component.getFormControl('nameZH').valid).toBeTrue();
    expect(component.getFormControl('group').valid).toBeTrue();
    expect(component.form.valid).toBeTrue();
  });

  it('renders the submit button disabled while the form is invalid ([disabled]="form.invalid")', () => {
    component.config = makeFullConfig();
    fixture.detectChanges(); // runs ngOnInit (fires healthz warm-up) and renders
    httpMock.expectOne(HEALTHZ).flush({});
    fixture.detectChanges();

    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(btn).withContext('submit button rendered').not.toBeNull();
    expect(btn.disabled).toBeTrue();
  });

  // ----- Exactly one audio source -----

  it('Scenario: Exactly one source provided — only videoId set leaves all source controls valid', () => {
    component.form.patchValue({ videoId: VALID_YT });
    component.updateValueAndValidity();
    expect(component.getFormControl('videoId').valid).toBeTrue();
    expect(component.getFormControl('file').valid).toBeTrue();
    expect(component.getFormControl('clip').valid).toBeTrue();
  });

  it('Scenario: Multiple sources provided — videoId + clip invalidates all source controls', () => {
    component.form.patchValue({
      videoId: VALID_YT,
      clip: 'https://youtube.com/clip/UgkxAbc123',
    });
    component.updateValueAndValidity();
    expect(component.getFormControl('videoId').invalid).toBeTrue();
    expect(component.getFormControl('clip').invalid).toBeTrue();
    expect(component.getFormControl('file').invalid).toBeTrue();
  });

  it('Scenario: No source provided — submit is blocked with a "請填入必填欄位" toast and no POST', () => {
    component.config = makeFullConfig({ name: 'template' });
    component.OnSubmit();
    expect(dialogSpy.toastError).toHaveBeenCalledWith('請填入必填欄位!');
    httpMock.expectNone(API);
  });

  // ----- YouTube link and clip validation -----

  it('Scenario: Valid YouTube share link — extracts the id and builds the embed', () => {
    component.form.patchValue({ videoId: VALID_YT });
    component.OnYoutubeLinkChange({} as Event);
    expect(component.youtubeEmbedLink).withContext('embed link set').toBeTruthy();
    expect(dialogSpy.toastError).not.toHaveBeenCalled();
    expect(component.getFormControl('videoId').valid).toBeTrue();
  });

  it('Scenario: Invalid YouTube link — clears the embed and toasts "Invalid Link: ..."', () => {
    component.form.patchValue({ videoId: 'abc' });
    component.OnYoutubeLinkChange({} as Event);
    expect(component.youtubeEmbedLink).toBe('');
    expect(dialogSpy.toastError).toHaveBeenCalledWith('Invalid Link: abc');
  });

  it('Scenario: Valid clip URL — YouTube/Twitch clip patterns are accepted without a toast', () => {
    component.form.patchValue({ clip: 'https://youtube.com/clip/UgkxAbc123' });
    component.OnYoutubeClipChange();
    component.updateValueAndValidity();
    expect(dialogSpy.toastError).not.toHaveBeenCalled();
    expect(component.getFormControl('clip').valid).toBeTrue();
  });

  it('Scenario: Invalid clip URL — toasts "Invalid Clip Link: ..."', () => {
    component.form.patchValue({ clip: 'https://example.com/foo' });
    component.OnYoutubeClipChange();
    expect(dialogSpy.toastError).toHaveBeenCalledWith('Invalid Clip Link: https://example.com/foo');
  });

  // ----- Clip timing constraints -----

  it('Scenario: Negative start — start control is invalid when videoId is dirty', () => {
    component.getFormControl('videoId').markAsDirty();
    component.form.patchValue({ start: -5 });
    component.getFormControl('start').updateValueAndValidity();
    expect(component.getFormControl('start').hasError('start')).toBeTrue();
  });

  it('Scenario: End not after start — end control is invalid', () => {
    component.getFormControl('videoId').markAsDirty();
    component.form.patchValue({ start: 10, end: 5 });
    component.updateValueAndValidity();
    expect(component.getFormControl('end').hasError('end')).toBeTrue();
  });

  it('Scenario: Clip too long (>180s) — end control is invalid', () => {
    component.getFormControl('videoId').markAsDirty();
    component.form.patchValue({ start: 0, end: 200 });
    component.updateValueAndValidity();
    expect(component.getFormControl('end').hasError('end')).toBeTrue();
  });

  it('accepts an in-range clip (end > start, length <= 180s)', () => {
    component.getFormControl('videoId').markAsDirty();
    component.form.patchValue({ start: 0, end: 100 });
    component.updateValueAndValidity();
    expect(component.getFormControl('end').valid).toBeTrue();
  });

  // ----- Uploaded file handling -----

  it('Scenario: Oversized file — clears the file and toasts the "音檔上限" key', () => {
    const file = { size: 30000001, type: 'audio/mpeg', name: 'big.mp3' } as File;
    component.OnFileUpload({ target: { files: { item: () => file } } } as unknown as Event);
    expect(dialogSpy.toastError).toHaveBeenCalledWith('音檔上限!!');
    expect(component.file).toBeUndefined();
  });

  it('Scenario: Wrong file type — clears the file and toasts "僅限上傳音訊檔案"', () => {
    const file = { size: 100, type: 'application/pdf', name: 'doc.pdf' } as File;
    component.OnFileUpload({ target: { files: { item: () => file } } } as unknown as Event);
    expect(dialogSpy.toastError).toHaveBeenCalledWith('僅限上傳音訊檔案!!');
    expect(component.file).toBeUndefined();
  });

  it('Scenario: Reading duration to patch end — end = ceil(start + duration)', () => {
    component.form.patchValue({ start: 12 });
    component.duration = 7.2;
    component.patchEnd();
    expect(component.getFormControl('end').value).toBe(Math.ceil(12 + 7.2)); // 20
  });

  // ----- Multipart submission and status polling -----

  it('Scenario: Posting the contribution — builds FormData and POSTs to ${api}/sound-buttons', fakeAsync(() => {
    fillValidForm();
    component.config = makeFullConfig({ name: 'template' });
    component.OnSubmit();

    const req = httpMock.expectOne(API);
    expect(req.request.method).toBe('POST');
    const fd = req.request.body as FormData;

    expect(fd.get('nameZH')).toBe('楓');
    expect(fd.get('nameJP')).toBe(''); // useSTT unchecked -> raw nameJP
    expect(fd.get('group')).toBe('問候');
    expect(fd.get('videoId')).toBe(VALID_YT);
    expect(fd.get('directory')).toBe('template'); // = active character name
    expect(fd.get('volume')).toBe('1');
    expect(fd.get('toastId')).toBe('1'); // toastPending() spy returns 1
    expect(fd.get('start')).toBe('0');
    expect(fd.get('end')).toBe('10');

    // No SAS token, captcha, or anti-spam token is sent.
    expect(fd.has('SASToken')).toBeFalse();
    expect(fd.has('sasToken')).toBeFalse();
    expect(fd.has('sasContainerToken')).toBeFalse();
    expect(fd.has('captcha')).toBeFalse();
    expect(fd.has('token')).toBeFalse();

    req.flush({}); // no statusQueryGetUri -> ends the stream (see missing-uri test)
    tick();
  }));

  it('substitutes "[useSTT]" for nameJP when the STT flag is set', fakeAsync(() => {
    fillValidForm();
    component.form.patchValue({ useSTT: true });
    component.config = makeFullConfig({ name: 'template' });
    component.OnSubmit();

    const req = httpMock.expectOne(API);
    expect((req.request.body as FormData).get('nameJP')).toBe('[useSTT]');
    req.flush({});
    tick();
  }));

  it('Scenario: Missing polling URI — clears pending and toasts the missing-URI error', fakeAsync(() => {
    fillValidForm();
    component.config = makeFullConfig({ name: 'template' });
    component.OnSubmit();

    httpMock.expectOne(API).flush({}); // statusQueryGetUri absent
    tick();

    expect(dialogSpy.clearPending).toHaveBeenCalled();
    expect(dialogSpy.toastError).toHaveBeenCalledWith('上傳失敗，伺服器未回應輪詢 URI');
  }));

  it('Scenario: Successful processing — output truthy -> toastSuccess + reloadConfig', fakeAsync(() => {
    fillValidForm();
    component.config = makeFullConfig({ name: 'template' });
    component.OnSubmit();

    httpMock.expectOne(API).flush({ statusQueryGetUri: 'https://api.example/poll/1' });
    tick(10000); // first poll fires at timer(10000, 20000)

    const poll = httpMock.expectOne('https://api.example/poll/1');
    expect(poll.request.method).toBe('GET');
    poll.flush(
      { output: true, input: { toastId: '1', nameZH: 'X' } },
      { status: 200, statusText: 'OK' }
    );
    tick();

    expect(dialogSpy.disablePending).toHaveBeenCalledWith(1);
    expect(dialogSpy.toastSuccess).toHaveBeenCalledWith('X 上傳成功');
    expect(configSpy.reloadConfig).toHaveBeenCalled();
  }));

  it('Scenario: Backend output=false — surfaces an error toast and adds no extra reset/redirect', fakeAsync(() => {
    fillValidForm();
    component.config = makeFullConfig({ name: 'template' });
    component.OnSubmit();

    // The reset + redirect are dispatched synchronously exactly once on submit.
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);

    httpMock.expectOne(API).flush({ statusQueryGetUri: 'https://api.example/poll/1' });
    tick(10000);
    httpMock
      .expectOne('https://api.example/poll/1')
      .flush(
        { output: false, input: { toastId: '1', nameZH: 'X' } },
        { status: 200, statusText: 'OK' }
      );
    tick();

    expect(dialogSpy.toastError).toHaveBeenCalledWith('X 上傳失敗');
    expect(dialogSpy.toastSuccess).not.toHaveBeenCalled();
    // The failure callback does not trigger a second navigation.
    expect(routerSpy.navigate).toHaveBeenCalledTimes(1);
  }));

  // ----- Submission result feedback: error responses by status -----

  function submitThenFail(flush: (req: ReturnType<HttpTestingController['expectOne']>) => void) {
    fillValidForm();
    component.config = makeFullConfig({ name: 'template' });
    component.OnSubmit();
    flush(httpMock.expectOne(API));
  }

  it('Scenario: 400 error -> toastError "上傳失敗，欄位錯誤"', fakeAsync(() => {
    submitThenFail((req) => req.flush('bad', { status: 400, statusText: 'Bad Request' }));
    tick();
    expect(dialogSpy.toastError).toHaveBeenCalledWith(jasmine.stringMatching('上傳失敗，欄位錯誤'));
  }));

  it('Scenario: status 0 (browser timeout) -> toastError "上傳回應超時"', fakeAsync(() => {
    submitThenFail((req) =>
      req.error(new ProgressEvent('error'), { status: 0, statusText: '' })
    );
    tick();
    expect(dialogSpy.toastError).toHaveBeenCalledWith(jasmine.stringMatching('上傳回應超時'));
  }));

  it('Scenario: 408 error -> toastError "上傳回應超時"', fakeAsync(() => {
    submitThenFail((req) => req.flush('timeout', { status: 408, statusText: 'Request Timeout' }));
    tick();
    expect(dialogSpy.toastError).toHaveBeenCalledWith(jasmine.stringMatching('上傳回應超時'));
  }));

  it('Scenario: 500 error -> toastError "上傳失敗，伺服器錯誤"', fakeAsync(() => {
    submitThenFail((req) => req.flush('boom', { status: 500, statusText: 'Server Error' }));
    tick();
    expect(dialogSpy.toastError).toHaveBeenCalledWith(jasmine.stringMatching('上傳失敗，伺服器錯誤'));
  }));

  it('Scenario: other status -> toastWarning "上傳回應異常"', fakeAsync(() => {
    submitThenFail((req) => req.flush('weird', { status: 503, statusText: 'Unavailable' }));
    tick();
    expect(dialogSpy.toastWarning).toHaveBeenCalledWith(jasmine.stringMatching('上傳回應異常'));
  }));

  // ----- Post-submit redirect to live preview -----

  it('Scenario: Redirecting after submit — resets the form and navigates with liveUpdate=1', fakeAsync(() => {
    fillValidForm();
    component.config = makeFullConfig({ name: 'template' });
    component.OnSubmit();

    expect(component.youtubeEmbedLink).toBe('');
    expect(component.getFormControl('nameZH').value).toBeNull(); // form.reset()
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/', 'template'], {
      queryParams: { liveUpdate: '1' },
      queryParamsHandling: 'merge',
    });

    httpMock.expectOne(API).flush({});
    tick();
  }));

  // ----- Backend warm-up -----

  it('Scenario: Warming up the backend — GETs ${api}/healthz on init', () => {
    fixture.detectChanges(); // ngOnInit
    const req = httpMock.expectOne(HEALTHZ);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
