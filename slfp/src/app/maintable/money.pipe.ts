import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'money'
})
export class MoneyPipe implements PipeTransform {

  transform(value: number): string {
    let transformed: string = '';
    if (value) {
      value = ~~(value/1000);
      transformed = value.toLocaleString('de-CH');
    }
    return transformed;
  }

  parse(valueString: string): number {
    return +(valueString.replace('’', ''))*1000;
  }

}
