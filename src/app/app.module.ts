/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, NgModule } from '@angular/core';
import { environment } from './../environments/environment';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { IntroductionComponent } from './introduction/introduction.component';
import { SoundButtonsComponent } from './sound-buttons/sound-buttons.component';
import { ContainerComponent } from './container/container.component';
import { HomePageComponent } from './home-page/home-page.component';
import { UploadComponent } from './upload/upload.component';
import { DialogComponent } from './dialog/dialog.component';
import { ColorService } from './services/color.service';
import { ConfigService } from './services/config.service';
import { LanguageService } from './services/language.service';
import { AudioService } from './services/audio.service';
import { DialogService } from './services/dialog.service';
import { ShareService } from './services/share.service';
import { ToastrModule } from 'ngx-toastr';
import { AudioControlComponent } from './audio-control/audio-control.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ButtonFilterPipe } from './pipe/button-filter.pipe';
import { OverlayModule } from '@angular/cdk/overlay';
import { ContextMenuComponent } from './sound-buttons/context-menu/context-menu.component';
import { ContextMenuTriggerDirective } from './sound-buttons/context-menu/context-menu-trigger.directive';
import { CharaImageComponent } from './chara-image/chara-image.component';
import { ScrollToTopButtonComponent } from './scroll-to-top-button/scroll-to-top-button.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}

import { EnvironmentToken } from './environment.token';
import { bootstrapAnalytics } from './analytics.bootstrap';
/** Default global toast configuration (bottom-center, no auto-timeout). */
export const TOASTR_CONFIG = {
  disableTimeOut: true,
  positionClass: 'toast-bottom-center',
};
export { EnvironmentToken } from './environment.token';

declare global {
  interface Navigator {
    globalPrivacyControl?: boolean;
  }
}

@NgModule({ declarations: [
        AppComponent,
        HeaderComponent,
        FooterComponent,
        IntroductionComponent,
        SoundButtonsComponent,
        ContainerComponent,
        HomePageComponent,
        UploadComponent,
        DialogComponent,
        AudioControlComponent,
        ButtonFilterPipe,
        ContextMenuComponent,
        ContextMenuTriggerDirective,
        CharaImageComponent,
    ],
    bootstrap: [AppComponent],
    exports: [ButtonFilterPipe], imports: [BrowserModule,
        ButtonsModule,
        ModalModule,
        AppRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        OverlayModule,
        BrowserAnimationsModule,
        CollapseModule,
        ToastrModule.forRoot(TOASTR_CONFIG),
        TypeaheadModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
            defaultLanguage: 'zh',
        }),
        ScrollToTopButtonComponent], providers: [
        { provide: EnvironmentToken, useValue: environment },
        LanguageService,
        ConfigService,
        ColorService,
        AudioService,
        DialogService,
        ShareService,
        ButtonFilterPipe,
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class AppModule {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(@Inject(EnvironmentToken) private env: any) {
    bootstrapAnalytics(this.env);
  }
}
