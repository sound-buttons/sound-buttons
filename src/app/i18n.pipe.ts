import { LanguageService } from './services/language.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'i18n'
})
export class I18nPipe implements PipeTransform {

  constructor(
    private languageService: LanguageService
  ) { }

  transform = (value: string) =>
    this.languageService.GetTextFromJson(value);

}
