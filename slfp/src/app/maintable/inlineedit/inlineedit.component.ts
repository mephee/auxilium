import {Component, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MoneyPipe} from "../money.pipe";

@Component({
  selector: 'inlineedit',
  templateUrl: './inlineedit.component.html',
  styleUrls: ['./inlineedit.component.css']
})
export class InlineeditComponent implements OnInit {

  @Input() value: number;
  @Output() valueChange = new EventEmitter();
  private valueFormatted: string;

  constructor(private moneyPipe: MoneyPipe) {
  }

  ngOnInit() {
    this.valueFormatted = this.moneyPipe.transform(this.value);
  }

  onFocus(): void {
    // this.valueFormatted = this.moneyPipe.parse(this.valueFormatted).toString();
    this.valueFormatted = this.value.toString();
  }

  onBlur(): void {
    this.valueChange.emit(+this.valueFormatted);
    this.value = +this.valueFormatted;
    this.valueFormatted = this.moneyPipe.transform(+this.valueFormatted);
  }

  onDbClickInput():void {
  }
}
