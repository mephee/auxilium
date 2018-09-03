import {Component, OnInit} from '@angular/core';
import {Version} from "../data/model/version";
import {DatastoreService} from "../data/datastore.service";

@Component({
  selector: 'app-versions',
  templateUrl: './versions.component.html',
  styleUrls: ['./versions.component.css']
})
export class VersionsComponent implements OnInit {

  showVersion:boolean = false;

  constructor(private dataStore: DatastoreService) { }

  ngOnInit() {
  }

  setActualVersion(version:Version) {
    this.dataStore.setActualVersion(version);
    this.dataStore.save();
  }

  getVersions():Version[] {
    return this.dataStore.getVersions();
  }

  addVersion() {
    this.showVersion = true;
  }

  deleteVersion() {
    this.dataStore.deleteVersion(this.dataStore.getActualVersion());
  }

  onCloseVersion() {
    this.showVersion = false;
  }

  getActualVersionName():string {
    if (this.dataStore.getActualVersion()) {
      return this.dataStore.getActualVersion().name;
    } else {
      return '';
    }
  }
}
