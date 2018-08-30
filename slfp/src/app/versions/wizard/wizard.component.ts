import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Investment} from "../../data/model/investment";
import {Version} from "../../data/model/version";
import {DatastoreService} from "../../data/datastore.service";

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css']
})
export class WizardComponent implements OnInit {

  private version: Version;
  _open: boolean;
  @Output() closed = new EventEmitter<void>();
  constructor(private dataStore:DatastoreService) { }

  ngOnInit() {
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
    this.open = false;
    this.closed.emit();
  }

  close(): void {
    this._open = false;
    this.closed.emit();
  }

}
