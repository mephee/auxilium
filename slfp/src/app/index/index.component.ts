import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DatastoreService} from "../data/datastore.service";
import {Index} from "../data/model";
import {AggregationService} from "../maintable/aggregation/aggregation.service";
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
              private aggregation:AggregationService) { }

  ngOnInit() {
    $('#index').draggable({
      handle: '.modal-header'
    });
  }

  save(): void {
    this.datastore.saveIndexes();
    this.aggregation.calculateBalances();
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
