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
import {ForeignPayback} from "./model/foreignPayback";

declare var storage:any;

@Injectable({
  providedIn: 'root'
})
export class DatastoreService {

  private categories: Category[];
  private actualVersion: Version;
  private versions: Version[];
  private versionInitialized:boolean = false;

  constructor(private ngZone:NgZone, private communication:CommunicationService) {
    this.categories = MOCK.categories;
    this.versions = [];

    if (typeof storage !== 'undefined') {
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
      this.communication.callComponentMethod(this.actualVersion);
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
    version.yearTo = version.yearFrom + 50
    let index = this.versions.indexOf(version);
    if (index !== -1) {
      this.versions[index] = version;
    } else {
      this.versions.push(version);
    }
    this.actualVersion = version;
    this.updateVersionYearFromTo(version.yearFrom, version.yearTo);
  }

  deleteVersion(version:Version):void {
    let index = this.versions.indexOf(version);
    if (index !== -1) {
      this.versions.splice(index);
    }
    if (this.versions.length > 0) {
      this.actualVersion = this.versions[0];
    } else {
      this.actualVersion = undefined;
      this.versionInitialized = false;
    }
  }

  updateVersionYearFromTo(yearFrom:number, yearTo:number):void {
    this.actualVersion.yearFrom = yearFrom;
    this.actualVersion.yearTo = yearTo;
    let lastInoutcome:Inoutcome = new Inoutcome();
    lastInoutcome.outcome = 0;
    lastInoutcome.income = 0;
    lastInoutcome.taxrate = 0;
    lastInoutcome.taxvolume = 0;
    for(let i = yearFrom; i <= yearTo; i++) {
      let inoutcome:Inoutcome = this.actualVersion.inoutComes.find(itInoutcome => itInoutcome.year === i);
      if (!inoutcome) {
        inoutcome = new Inoutcome();
        inoutcome.year = i;
        inoutcome.taxvolume = lastInoutcome.taxvolume;
        inoutcome.taxrate = lastInoutcome.taxrate;
        inoutcome.income = lastInoutcome.income;
        inoutcome.outcome = lastInoutcome.outcome;
        this.actualVersion.inoutComes.push(inoutcome);
      } else {
        lastInoutcome = inoutcome;
      }

      let foreignPayback:ForeignPayback = this.actualVersion.foreignContainer.foreignPayback.find(foreign => foreign.year === i);
      if (!foreignPayback) {
        foreignPayback = new ForeignPayback(i);
        foreignPayback.payback = 0;
        this.actualVersion.foreignContainer.foreignPayback.push(foreignPayback);
      }
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

  setVersionInitialized():void {
    this.versionInitialized = true;
  }

  isVersionInitialized():boolean {
    return this.versionInitialized;
  }

}
