import { Pipe, PipeTransform } from '@angular/core';
import { ButtonGroup, IButtonGroup } from './../sound-buttons/ButtonGroup';

@Pipe({
  name: 'buttonFilter',
})
export class ButtonFilterPipe implements PipeTransform {
  transform(items: IButtonGroup[], term: string): IButtonGroup[] {
    return (items as IButtonGroup[]).map(
      (group) =>
        new ButtonGroup(
          group.name,
          group.baseRoute,
          group.buttons.filter((button) => button.text.indexOf(term) !== -1)
        )
    );
  }
}
