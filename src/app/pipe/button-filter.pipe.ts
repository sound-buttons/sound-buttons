import { Pipe, PipeTransform } from '@angular/core';
import { IButtonGroup } from './../sound-buttons/ButtonGroup';

@Pipe({
  name: 'buttonFilter',
})
export class ButtonFilterPipe implements PipeTransform {
  transform(items: IButtonGroup[], term: string): IButtonGroup[] {
    (items as IButtonGroup[]).forEach((group) => {
      group.buttons = group.buttons.filter((button) => button.text.indexOf(term) !== -1);
    });
    return items;
  }
}
