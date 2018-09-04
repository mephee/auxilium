import {Injectable, NgZone} from '@angular/core';
import {MOCK} from "./mockdata";
import {Inoutcome} from "./model/inoutcome";
import {Category} from "./model/category";
import {Investment} from "./model/investment";
import {ForeignContainer} from "./model/foreignContainer";
import {LiquidityStart} from "./model/liquidityStart";
import {Version} from "./model/version";
import {CommunicationService} from "../communication/communication.service";
import {InvestmentHRM1Container} from "./model/investmentHRM1Container";

declare var storage:any;

@Injectable({
  providedIn: 'root'
})
export class DatastoreService {

  private categories: Category[];
  private actualVersion: Version;
  private versions: Version[];

  constructor(private ngZone:NgZone, private communication:CommunicationService) {
    this.categories = MOCK.categories;
    this.versions = [];

    if (storage) {
      storage.has('versions', (error, has) => {
        if (error) throw error;
        if (has) {
          storage.get('versions', (error, versions) => {
            ngZone.run(() => {
              if (error) {
                throw error;
              } else if (versions) {
                this.versions = versions;
                this.actualVersion = versions[0];
                this.communication.callComponentMethod(this.actualVersion);
              }
            });
          });
        } else {
          this.communication.callComponentMethod(null);
        }
      });
    } else {
      this.loadDefaultVersions();
    }
  }

  /*
  Versions
   */
  private loadDefaultVersions():void {
    this.actualVersion = this.createVersion();
    this.actualVersion.name = 'Version 1';
    this.versions.push(this.actualVersion);
  }


  createVersion():Version {
    let version:Version = new Version();
    version.yearFrom = (new Date()).getFullYear()+1;
    version.yearTo = version.yearFrom + 50;
    version.inoutComes = [];
    for(let i = version.yearFrom; i <= version.yearTo; i++) {
      let inoutcome:Inoutcome = new Inoutcome();
      inoutcome.year = i;
      inoutcome.taxvolume = 0;
      inoutcome.taxrate = 0;
      inoutcome.income = 0;
      inoutcome.outcome = 0;
      version.inoutComes.push(inoutcome);
    }
    version.foreignContainer = new ForeignContainer();
    version.foreignContainer.foreignValue = 0;
    version.investmentHRM1Container = new InvestmentHRM1Container();
    version.investmentHRM1Container.value = 0;
    version.investmentHRM1Container.rate = 10;
    version.investments = [];
    version.liquidityStart = new LiquidityStart();
    version.liquidityStart.liquidity = 0;
    return version;
  }

  getVersions(): Version[] {
    return this.versions;
  }

  setActualVersion(version:Version):void {
    this.actualVersion = version;
  }

  getActualVersion():Version {
    return this.actualVersion;
  }

  saveVersion(version:Version):void {
    let index = this.versions.indexOf(version);
    if (index !== -1) {
      this.versions[index] = version;
    } else {
      this.versions.push(version);
    }
    this.actualVersion = version;
  }

  deleteVersion(version:Version):void {
    let index = this.versions.indexOf(version);
    if (index !== -1) {
      this.versions.splice(index);
    }
    if (this.versions.length > 0) {
      this.actualVersion = this.versions[0];
    } else {
      this.actualVersion = this.createVersion();
      this.actualVersion.name = 'Version 1';
      this.versions.push(this.actualVersion);
    }
  }


  /*
  Entities
   */
  getInoutcomes(): Inoutcome[] {
    return this.actualVersion.inoutComes;
  }

  getCategories(): Category[] {
    return this.categories
  }

  getInvestments(): Investment[] {
    return this.actualVersion.investments;
  }

  getForeignContainer(): ForeignContainer {
    return this.actualVersion.foreignContainer;
  }

  getLiquidityStart(): LiquidityStart {
    return this.actualVersion.liquidityStart;
  }

  getInvestmentHRM1Container(): InvestmentHRM1Container {
    return this.actualVersion.investmentHRM1Container;
  }


  /*
  Edits
   */
  saveInvestment(investment: Investment) {
    let index = this.actualVersion.investments.indexOf(investment);
    if (index !== -1) {
      this.actualVersion.investments[index] = investment;
    } else {
      this.actualVersion.investments.push(investment);
    }
  }

  save():void {
    storage.set('versions', this.versions);
  }

}
