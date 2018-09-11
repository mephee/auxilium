import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'money'
})
export class MoneyPipe implements PipeTransform {

  transform(value: number, divider:number): string {
    let transformed: string = '';
    if (!divider || divider < 1) {
      divider = 1000;
    }
    if (value) {
      if (divider != 1) {
        value = ~~(value/divider);
      }
      transformed = value.toLocaleString('de-CH');
    }
    return transformed;
  }

  parse(valueString: string, divider:number): number {
    if (!divider || divider < 1) {
      divider = 1000;
    }
    return +(valueString.replace('’', ''))*divider;
  }

}
