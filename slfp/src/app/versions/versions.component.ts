import {Component, NgZone, OnInit} from '@angular/core';
import {Version} from "../data/model/version";
import {DatastoreService} from "../data/datastore.service";
import {CommunicationService} from "../communication/communication.service";
import {AggregationService} from "../maintable/aggregation/aggregation.service";

@Component({
  selector: 'app-versions',
  templateUrl: './versions.component.html',
  styleUrls: ['./versions.component.css']
})
export class VersionsComponent implements OnInit {

  showVersion:boolean;

  constructor(private dataStore: DatastoreService, private communication:CommunicationService, private ngZone:NgZone, private aggregation:AggregationService) {
    this.communication.componentMethodCalled$.subscribe(
      value => {
        ngZone.run(()=> {
          if (!value) {
            this.addVersion();
          } else {
            this.aggregation.calculateBalances();
            this.dataStore.setVersionInitialized();
          }
        });
      }
    );
  }

  ngOnInit() {
  }

  setActualVersion(version:Version) {
    this.dataStore.setActualVersion(version);
    this.dataStore.save();
    this.aggregation.calculateBalances();
  }

  getVersions():Version[] {
    return this.dataStore.getVersions();
  }

  addVersion() {
    this.showVersion = true;
  }

  deleteVersion() {
    this.dataStore.deleteVersion(this.dataStore.getActualVersion());
    this.dataStore.save();
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
