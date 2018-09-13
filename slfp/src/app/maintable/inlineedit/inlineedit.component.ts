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

  private arrow = { left: 37, up: 38, right: 39, down: 40, enter: 13, escape: 27 };

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

  keyDown(event) {
    // shortcut for key other than arrow keys
    if ($.inArray(event.which, [this.arrow.left, this.arrow.up, this.arrow.right, this.arrow.down, this.arrow.enter, this.arrow.escape]) < 0) { return; }

    let input = event.target;
    let td = $(event.target).closest('td');
    let moveTo = null;
    switch (event.which) {
      case this.arrow.left: {
        if (input.selectionStart == 0) {
          moveTo = td.prev('td:has(input)');
        }
        break;
      }
      case this.arrow.right: {
        if (input.selectionEnd == input.value.length) {
          moveTo = td.next('td:has(input)');
        }
        break;
      }
      case this.arrow.up:
      case this.arrow.down:
      case this.arrow.enter: {
        let tr = td.closest('tr');
        let pos = td[0].cellIndex;
        let moveToRow = null;
        if (event.which == this.arrow.down || event.which == this.arrow.enter) {
          moveToRow = tr.nextAll('tr:has(input)');
        }
        else if (event.which == this.arrow.up) {
          moveToRow = tr.prevAll('tr:has(input)');
        }
        if (moveToRow.length) {
          moveTo = $(moveToRow[0].cells[pos]);
          if (!moveTo || !moveTo.length) {
            if (event.which == this.arrow.down || event.which == this.arrow.enter) {
              moveToRow = tr.nextAll('tr:has(input)');
            }
            else if (event.which == this.arrow.up) {
              moveToRow = tr.prevAll('tr:has(input)');
            }
            if (moveToRow.length) {
              moveTo = $(moveToRow[0].cells[pos]);
            }
          }
        }
        break;
      }
      case this.arrow.escape: {
        this.valueFormatted = this._value.toString();
        input.blur();
        break;
      }
    }
    if (moveTo && moveTo.length) {
      event.preventDefault();
      moveTo.find('input').each(function (i, input) {
        input.focus();
        setTimeout(()=> {
          input.select();
        },10);
      });
    } else if (event.which == this.arrow.enter) {
      input.blur();
    }
  }

  updateInternalValue():void {
    if (this.inThousand) {
      this.valueFormatted = this.moneyPipe.transform(this._value, 1000);
    } else {
      this.valueFormatted = this.moneyPipe.transform(this._value, 1);
    }
  }
}
