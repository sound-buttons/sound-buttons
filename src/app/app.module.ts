import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
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
import { ToastrModule } from 'ngx-toastr';
import { AudioControlComponent } from './audio-control/audio-control.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
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
    AudioControlComponent
  ],
  imports: [
    BrowserModule,
    ButtonsModule.forRoot(),
    ModalModule.forRoot(),
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
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
        deps: [HttpClient]
      },
      defaultLanguage: 'zh'
    }),
  ],
  providers: [
    LanguageService,
    ConfigService,
    ColorService,
    AudioService,
    DialogService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
