import {Component, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MoneyPipe} from "../money.pipe";
import {DatastoreService} from "../../data/datastore.service";
import {AggregationService} from "../aggregation/aggregation.service";

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
  @Input() inThousand:boolean = true;

  constructor(private moneyPipe: MoneyPipe, private elementRef:ElementRef, private datastore:DatastoreService, private aggregation:AggregationService) {
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
    if (this.inThousand) {
      this.valueFormatted = this.moneyPipe.transform(+this.valueFormatted, 1000);
    } else {
      this.valueFormatted = this.moneyPipe.transform(+this.valueFormatted, 1);
    }
    this.mouseUpCatched = false;

    // save on every change
    this.datastore.save();
    this.aggregation.calculateBalances();
  }

  updateInternalValue():void {
    if (this.inThousand) {
      this.valueFormatted = this.moneyPipe.transform(this._value, 1000);
    } else {
      this.valueFormatted = this.moneyPipe.transform(this._value, 1);
    }
  }
}
