import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Version} from "../../data/model/version";
import {DatastoreService} from "../../data/datastore.service";
import {InvestmentCategories} from "../../maintable/investmentcategories/investment-categories.service";
declare var $:any;

@Component({
  selector: 'app-rename',
  templateUrl: './rename.component.html',
  styleUrls: ['./rename.component.css']
})
export class RenameComponent implements OnInit {

  version: Version;
  _open: boolean;
  @Output() closed = new EventEmitter<void>();
  constructor(private dataStore:DatastoreService) {
    this.version = new Version();
  }

  ngOnInit() {
    $('#rename').draggable({
      handle: '.modal-header'
    });
  }

  @Input()
  set open(open:boolean) {
    let tempVersion:Version = this.dataStore.getActualVersion();  // Version is undefined on startup
    if (tempVersion != undefined) {
      this.version = tempVersion;
    }
    this._open = open;
  }

  save(): void {
    this.dataStore.renameVersion(this.version.name);
    this.dataStore.save();
    this.open = false;
    this.closed.emit();
  }

  close(): void {
    this._open = false;
    this.closed.emit();
  }

}
