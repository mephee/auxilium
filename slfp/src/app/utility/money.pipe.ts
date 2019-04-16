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

        if (~~(value/divider) == 0) {
          value = Math.floor((value/divider)*100)/100;
        } else {
          value = ~~(value/divider);
        }
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
