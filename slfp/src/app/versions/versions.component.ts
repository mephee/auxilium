import { Component, OnInit } from '@angular/core';
import {Version} from "../data/model/version";
import {DatastoreService} from "../data/datastore.service";

@Component({
  selector: 'app-versions',
  templateUrl: './versions.component.html',
  styleUrls: ['./versions.component.css']
})
export class VersionsComponent implements OnInit {

  actualVersionName: string;
  showVersion:boolean = false;

  constructor(private dataStore: DatastoreService) { }

  ngOnInit() {
    this.actualVersionName = this.dataStore.getActualVersion().name;
  }

  setActualVersion(version:Version) {
    this.actualVersionName = version.name;
    this.dataStore.setActualVersion(version);
  }

  getVersions():Version[] {
    return this.dataStore.getVersions();
  }

  addVersion() {
    this.showVersion = true;
    this.actualVersionName = this.dataStore.getActualVersion().name;
  }

  deleteVersion() {
    this.dataStore.deleteVersion(this.dataStore.getActualVersion());
    this.actualVersionName = this.dataStore.getActualVersion().name;
  }

  onCloseVersion() {
    this.showVersion = false;
    this.actualVersionName = this.dataStore.getActualVersion().name;
  }

}
