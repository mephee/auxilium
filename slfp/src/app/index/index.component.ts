import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DatastoreService} from "../data/datastore.service";
import {Index} from "../data/model";
import {CalculatorService} from "../maintable/calc/calculator.service";
declare var $:any;

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  @Input()  open: boolean;
  @Output() closed = new EventEmitter<void>();

  constructor(private datastore:DatastoreService,
              private calculator:CalculatorService) { }

  ngOnInit() {
    $('#index').draggable({
      handle: '.modal-header'
    });
  }

  tracker(index:number, item:any):number {
    return index;
  }

  save(): void {
    this.datastore.saveIndexes();
    this.calculator.calculateBalances();
    this.open = false;
    this.closed.emit();
  }

  getIndexes():Index[] {
    return this.datastore.getIndexes();
  }

  addIndex():void {
    let index = new Index();
    if (this.datastore.getIndexes().length>0) {
      index.year = this.datastore.getIndexes()[this.datastore.getIndexes().length-1].year +1;
      index.index = this.datastore.getIndexes()[this.datastore.getIndexes().length-1].index;
    } else {
      index.year = 2018;
      index.index = 1;
    }
    this.datastore.saveIndex(index);
  }

}
