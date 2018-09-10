import {Component, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MoneyPipe} from "../money.pipe";

@Component({
  selector: 'inlineedit',
  templateUrl: './inlineedit.component.html',
  styleUrls: ['./inlineedit.component.css']
})
export class InlineeditComponent implements OnInit {

  private _value: number;
  private mouseUpCatched:boolean = false;
  valueFormatted: string;

  @Output() valueChange = new EventEmitter();
  @Input() tableStyle:boolean = true;

  constructor(private moneyPipe: MoneyPipe, private elementRef:ElementRef) {
  }

  @Input()
  set value(value:number) {
    this._value = value;
    this.updateInternalValue();
  }

  ngOnInit() {
    this.updateInternalValue();
  }

  onFocus(event): void {
    this.valueFormatted = this._value.toString();
  }

  onMouseUp(event):void {
    if (!this.mouseUpCatched) {
      if (this.valueFormatted == '0') {
        event.target.select();
      }
      this.mouseUpCatched = true;
    }
  }

  onBlur(): void {
    this.valueChange.emit(+this.valueFormatted);
    this._value = +this.valueFormatted;
    this.valueFormatted = this.moneyPipe.transform(+this.valueFormatted);
    this.mouseUpCatched = false;
  }

  updateInternalValue():void {
    this.valueFormatted = this.moneyPipe.transform(this._value);
  }
}
