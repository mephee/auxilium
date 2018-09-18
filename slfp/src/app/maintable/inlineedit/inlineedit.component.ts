import {Component, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MoneyPipe} from "../money.pipe";
import {DatastoreService} from "../../data/datastore.service";
import {AggregationService} from "../aggregation/aggregation.service";
declare var $:any;

@Component({
  selector: 'inlineedit',
  templateUrl: './inlineedit.component.html',
  styleUrls: ['./inlineedit.component.css']
})
export class InlineeditComponent implements OnInit {

  private _value: number;
  private mouseUpCatched:boolean = false;
  valueFormatted: string;

  private key = { left: 37, up: 38, right: 39, down: 40, enter: 13, escape: 27 };

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
    if (this.tableStyle) {
      this.datastore.save();
      this.aggregation.calculateBalances();
    }
  }

  onKeyDown(event) {
    // shortcut for key other than arrow keys
    if ($.inArray(event.which, [this.key.left, this.key.up, this.key.right, this.key.down, this.key.enter, this.key.escape]) < 0) { return; }

    let input = event.target;
    let td = $(event.target).closest('td');
    let moveToInput = null;
    switch (event.which) {
      case this.key.left: {
        if (input.selectionStart == 0) {
          td.prev('td:has(input)').find('input').each((i, input)=>{
            moveToInput = input;
          });
        }
        break;
      }
      case this.key.right: {
        if (input.selectionEnd == input.value.length) {
          td.next('td:has(input)').find('input').each((i, input)=>{
            moveToInput = input;
          });
        }
        break;
      }
      case this.key.up:
      case this.key.down:
      case this.key.enter: {
        let tr = td.closest('tr');
        let pos = td[0].cellIndex;
        let moveToRow = null;
        if (event.which == this.key.down || event.which == this.key.enter) {

          // TODO clean code
          moveToRow = tr.nextAll('tr:has(input)').each((i, tr)=>{
            $(tr.cells[pos]).find('input').each((i, input) => {
              moveToInput = input;
              return false;  // break
            });
            if (moveToInput) return false; //break
          });
        }
        else if (event.which == this.key.up) {
          moveToRow = tr.prevAll('tr:has(input)').each((i, tr)=>{
            $(tr.cells[pos]).find('input').each((i, input)=>{
              moveToInput = input;
              return false;
            });
            if (moveToInput) return false;
          });
        }
        break;
      }
      case this.key.escape: {
        this.valueFormatted = this._value.toString();
        input.blur();
        break;
      }
    }
    if (moveToInput) {
      event.preventDefault();
      moveToInput.focus();
      setTimeout(()=> {
        moveToInput.select();
      },10);
    } else if (event.which == this.key.enter) {
      input.blur();
    }
  }

  private updateInternalValue():void {
    if (this.inThousand) {
      this.valueFormatted = this.moneyPipe.transform(this._value, 1000);
    } else {
      this.valueFormatted = this.moneyPipe.transform(this._value, 1);
    }
  }
}
