import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { IntroductionComponent } from './introduction/introduction.component';
import { SoundButtonsComponent } from './sound-buttons/sound-buttons.component';
import { ContainerComponent } from './container/container.component';
import { HomePageComponent } from './home-page/home-page.component';
import { UploadComponent } from './upload/upload.component';
import { ColorService } from './services/color.service';
import { ConfigService } from './services/config.service';
import { LanguageService } from './services/language.service';
import { AudioService } from './services/audio.service';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    IntroductionComponent,
    SoundButtonsComponent,
    ContainerComponent,
    HomePageComponent,
    UploadComponent
  ],
  imports: [
    BrowserModule,
    ButtonsModule.forRoot(),
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [
    LanguageService,
    ConfigService,
    ColorService,
    AudioService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
