import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Version} from "../../data/model/version";
import {DatastoreService} from "../../data/datastore.service";
import {AggregationService} from "../../maintable/aggregation/aggregation.service";
declare var $:any;

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css']
})
export class WizardComponent implements OnInit {

  version: Version = new Version();
  _open: boolean;
  @Output() closed = new EventEmitter<void>();
  constructor(private dataStore:DatastoreService, private aggregation:AggregationService) { }

  ngOnInit() {
    $('#wizard').draggable({
      handle: '.modal-header'
    });
  }

  @Input()
  set open(open:boolean) {
    this.version = this.dataStore.createVersion();
    this._open = open;
  }

  getYearsForFrom():number[] {
    let years:number[] = [];
    let yearFrom = (new Date()).getFullYear()+1;
    for (let i = yearFrom;i<yearFrom+20;i++) {
      years.push(i);
    }
    return years;
  }

  getYearsForTo():number[] {
    let years:number[] = [];
    let yearFrom = this.version.yearFrom+1;
    for (let i = yearFrom;i<yearFrom+80;i++) {
      years.push(i);
    }
    return years;
  }

  save(): void {
    this.dataStore.saveVersion(this.version);
    this.dataStore.save();
    this.aggregation.calculateBalances();
    this.dataStore.setVersionInitialized();
    this.open = false;
    this.closed.emit();
  }

  close(): void {
    this._open = false;
    this.closed.emit();
  }

}
