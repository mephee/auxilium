import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'money'
})
export class MoneyPipe implements PipeTransform {

  transform(value: number): string {
    let transformed: string = '';
    if (value) {
      transformed = value.toLocaleString('de-CH');
    }
    return transformed;
  }

}
