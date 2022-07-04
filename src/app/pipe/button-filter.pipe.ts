import { Pipe, PipeTransform } from '@angular/core';
import { IButton } from '../sound-buttons/Buttons';

@Pipe({
  name: 'buttonFilter',
})
export class ButtonFilterPipe implements PipeTransform {
  transform(items: IButton[], term: string): IButton[] {
    return items.filter((item) => item.text.indexOf(term) !== -1);
  }
}
