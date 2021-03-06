import {Component, NgZone, OnInit} from '@angular/core';
import {Version} from "../data/model/version";
import {DatastoreService} from "../data/datastore.service";
import {CommunicationService} from "../communication/communication.service";
import {InvestmentCategories} from "../maintable/investmentcategories/investment-categories.service";
import {CalculatorService} from "../maintable/calc/calculator.service";

@Component({
  selector: 'app-versions',
  templateUrl: './versions.component.html',
  styleUrls: ['./versions.component.css']
})
export class VersionsComponent implements OnInit {

  showVersion:boolean;
  showRename:boolean;

  constructor(private dataStore: DatastoreService,
              private communication:CommunicationService,
              private ngZone:NgZone,
              private calculator:CalculatorService) {
    this.communication.versionReady$.subscribe(
      value => {
        ngZone.run(()=> {
          if (!value) {
            this.addVersion();
          } else {
            this.calculator.calculateBalances();
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
    this.calculator.calculateBalances();
    this.dataStore.setVersionInitialized();
  }

  getVersions():Version[] {
    return this.dataStore.getVersions();
  }

  addVersion() {
    this.showVersion = true;
  }

  renameVersion() {
    this.showRename = true;
  }

  copyVersion() {
    this.dataStore.copyActualVersion();
    this.renameVersion();
  }

  deleteVersion() {
    this.communication.confirm({
      message: "Wollen sie diese Variante wirklich löschen?",
      callback: () => {
        this.ngZone.run(() => {
          this.dataStore.deleteVersion(this.dataStore.getActualVersion());
          this.dataStore.save();
        });
      }
    });
  }

  onCloseVersion() {
    this.showVersion = false;
  }

  onCloseRename() {
    this.showRename = false;
  }

  getActualVersionName():string {
    if (this.dataStore.getActualVersion()) {
      return this.dataStore.getActualVersion().name;
    } else {
      return '';
    }
  }
}
