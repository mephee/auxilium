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
import {AdditionalTaxoff} from "./model/additionalTaxoff";
import {Reserve} from "./model/reserve";
import {Index} from "./model";
import {MigrationService} from "../migration/migration.service";

declare var storage:any;
declare var fs:any;
declare var $:any;

@Injectable({
  providedIn: 'root'
})
export class DatastoreService {

  private categories: Category[];
  private indexes: Index[];
  private actualVersion: Version;
  private versions: Version[];
  private versionInitialized:boolean = false;
  private appVersion:number = 1;

  constructor(private ngZone:NgZone, private communication:CommunicationService, private migration:MigrationService) {
    this.categories = MOCK.categories.sort((a,b)=>a.name.localeCompare(b.name));
    this.versions = [];

    if (typeof storage !== 'undefined') {
      this.loadIndexes();
    } else {
      this.indexes = [];
      this.loadDefaultVersions();
      this.communication.versionReady(this.actualVersion);
    }
  }

  /*
  Load from file
   */
  private loadVersions(){
    storage.has('versions', (error, has) => {
      if (error) throw error;
      if (has) {
        storage.get('versions', (error, versions) => {
          this.ngZone.run(() => {
            if (error) {
              throw error;
            } else if (versions) {
              this.versions = versions;
              if (this.migration.migrate(this.versions)) {
                this.save();
              }
              this.actualVersion = versions[0];
              this.communication.versionReady(this.actualVersion);
            }
          });
        });
      } else {
        this.communication.versionReady(null);
      }
    });
  }

  private loadIndexes() {
    storage.has('indexes', (error, has) => {
      if (error) throw error;
      if (has) {
        storage.get('indexes', (error, indexes) => {
          if (error) {
            throw error;
          } else if (indexes) {
            this.indexes = indexes;
            this.loadVersions();
          }
        });
      } else {
        this.indexes = [];
        this.loadVersions();
      }
    });
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
    version.investmentHRM1Container.yearCount = 10;
    version.investments = [];
    version.liquidityStart = new LiquidityStart();
    version.liquidityStart.liquidity = 0;
    version.additionalTaxoffs = [];
    version.reserves = [];
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
    version.yearTo = version.yearFrom + 50;
    let index = this.versions.indexOf(version);
    if (index !== -1) {
      this.versions[index] = version;
    } else {
      this.versions.push(version);
    }
    this.actualVersion = version;
    this.updateVersionYearFromTo(version.yearFrom, version.yearTo);
  }

  renameVersion(newName:string):void {
    this.getActualVersion().name = newName;
  }

  copyActualVersion():void {
    this.versions.push(JSON.parse(JSON.stringify(this.actualVersion)));
    this.versions[this.versions.length-1].name = "Kopie von " +this.versions[this.versions.length-1].name;
    this.actualVersion = this.versions[this.versions.length-1];
  }

  deleteVersion(version:Version):void {
    let index = this.versions.indexOf(version);
    if (index > -1) {
      this.versions.splice(index, 1);
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
    lastInoutcome.additionalOutcome = 0;
    lastInoutcome.income = 0;
    lastInoutcome.additionalIncome = 0;
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
        inoutcome.additionalIncome = lastInoutcome.additionalIncome;
        inoutcome.outcome = lastInoutcome.outcome;
        inoutcome.additionalOutcome = lastInoutcome.additionalOutcome;
        this.actualVersion.inoutComes.push(inoutcome);
      } else {
        lastInoutcome = inoutcome;
      }

      let foreignPayback:ForeignPayback = this.actualVersion.foreignContainer.foreignPayback.find(foreign => foreign.year === i);
      if (!foreignPayback) {
        foreignPayback = new ForeignPayback(i);
        foreignPayback.payback = 0;
        foreignPayback.year = i;
        this.actualVersion.foreignContainer.foreignPayback.push(foreignPayback);
      }

      let additionalTaxoff:AdditionalTaxoff = this.actualVersion.additionalTaxoffs.find(addTaxoff => addTaxoff.year === i);
      if (!additionalTaxoff) {
        additionalTaxoff = new AdditionalTaxoff();
        additionalTaxoff.year = i;
        additionalTaxoff.taxoff = 0;
        this.actualVersion.additionalTaxoffs.push(additionalTaxoff);
      }

      let reserve:Reserve = this.actualVersion.reserves.find(reserve => reserve.year === i);
      if (!reserve) {
        reserve = new Reserve();
        reserve.year = i;
        reserve.reserve = 0;
        this.actualVersion.reserves.push(reserve);
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

  getInvestmentsWithoutIndexed(): Investment[] {
    return this.getInvestments().filter(investment => !(investment.reinvestParentId));
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

  getAdditionalTaxoffs(): AdditionalTaxoff[] {
    return this.actualVersion.additionalTaxoffs;
  }

  getReserves(): Reserve[] {
    return this.actualVersion.reserves;
  }

  getIndexes(): Index[] {
    return this.indexes;
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

  deleteInvestment(investment: Investment) {
    let reinvestments:Investment[] = this.getInvestments().filter(reinvestment => (reinvestment.reinvestParentId === investment.id));
    reinvestments.forEach(reinvestment => {
      let index = this.getInvestments().indexOf(investment);
      if (index > -1) {
        this.getInvestments().splice(index, 1);
      }
    });
    let index = this.getInvestments().indexOf(investment);
    if (index > -1) {
      this.getInvestments().splice(index, 1);
    }
  }

  saveIndex(index:Index) {
    let idx = this.indexes.indexOf(index);
    if (idx !== -1) {
      this.indexes[idx] = index;
    } else {
      this.indexes.push(index);
    }
  }

  deleteIndex(index: Index) {
    let idx = this.indexes.indexOf(index);
    if (idx > -1) {
      this.indexes.splice(idx, 1);
    }
  }

  save():void {
    storage.set('versions', this.versions);
  }

  saveIndexes():void {
    storage.set('indexes', this.indexes);
  }

  // saveAs(fileName:string):void {
  //   try {
  //     fs.writeFileSync(fileName, this.versions, 'utf-8'); }
  //   catch(e) {
  //     console.log('Failed to save the file !');
  //   }
  // }

  setVersionInitialized():void {
    this.versionInitialized = true;
    this.enableTooltips();
  }

  isVersionInitialized():boolean {
    return this.versionInitialized;
  }

  enableTooltips() {
    setTimeout(() => {
      $('[data-toggle="popover"]').popover();
    }, 2000);
  }

}
