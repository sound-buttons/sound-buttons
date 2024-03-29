/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, InjectionToken, NgModule } from '@angular/core';
import { environment } from './../environments/environment';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
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
import { ContextMenuModule } from '@ctrl/ngx-rightclick';
import { ContextMenuComponent } from './sound-buttons/context-menu/context-menu.component';
import { CharaImageComponent } from './chara-image/chara-image.component';
import { ScrollToTopButtonComponent } from './scroll-to-top-button/scroll-to-top-button.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}

export const EnvironmentToken = new InjectionToken('ENVIRONMENT');

declare global {
  interface Navigator {
    globalPrivacyControl?: boolean;
  }
}

@NgModule({
  declarations: [
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
    CharaImageComponent,
  ],
  providers: [
    { provide: EnvironmentToken, useValue: environment },
    LanguageService,
    ConfigService,
    ColorService,
    AudioService,
    DialogService,
    ShareService,
    ButtonFilterPipe,
  ],
  bootstrap: [AppComponent],
  exports: [ButtonFilterPipe],
  imports: [
    BrowserModule,
    ButtonsModule.forRoot(),
    ModalModule.forRoot(),
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    ContextMenuModule,
    BrowserAnimationsModule,
    CollapseModule.forRoot(),
    ToastrModule.forRoot({
      disableTimeOut: true,
      positionClass: 'toast-bottom-center',
    }),
    TypeaheadModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      defaultLanguage: 'zh',
    }),
    ScrollToTopButtonComponent,
  ],
})
export class AppModule {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(@Inject(EnvironmentToken) private env: any) {
    if (navigator.globalPrivacyControl) {
      window.gtag = () => {};
      console.log(
        '%cWe can see that you have enabled the Global Privacy Control, indicating that you do not wish to have your information sold or shared.',
        'font-weight:bold; color: lightgreen;',
        '\nYour privacy is important to us, and we completely honor your choice.',
        'As a result, we have deactivated Google Analytics and Microsoft Clarity. 😉'
      );
      return;
    }

    if (!this.env.production) {
      // Add dummy gtag for dev
      window.gtag = (...args: any[]) => {
        console.debug('gtag', args);
      };
      return;
    }

    // Setup GA
    (function (id) {
      const gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;

      document.head.appendChild(gtagScript);

      const dataLayerScript = document.createElement('script');
      dataLayerScript.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');`;
      document.head.appendChild(dataLayerScript);
    })(this.env.google.GA_TRACKING_ID);

    // Setup Clarity
    (function (c: any, l: Document, a: string, r: string, i: string, t: any, y: any) {
      c[a] =
        c[a] ||
        function (...args: any[]) {
          (c[a].q = c[a].q || []).push(args);
        };
      t = l.createElement(r);
      t.async = 1;
      t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', this.env.CLARITY_TRACKING_ID, undefined, undefined);
  }
}
