import { Injectable } from '@angular/core';
import {MOCK} from "./mockdata";
import {Inoutcome} from "./model/inoutcome";
import {Category} from "./model/category";
import {Investment} from "./model/investment";
import {ForeignContainer} from "./model/foreignContainer";
import {LiquidityStart} from "./model/liquidityStart";
import {Version} from "./model/version";

@Injectable({
  providedIn: 'root'
})
export class DatastoreService {

  private categories: Category[];
  private actualVersion: Version;
  private versions: Version[];

  constructor() {
    // todo load default from disk
    this.categories = MOCK.categories;
    this.versions = [];
    this.actualVersion = this.createVersion();
    this.actualVersion.name = 'Version 1';
    this.versions.push(this.actualVersion);
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

  saveInvestment(investment: Investment) {
    let index = this.actualVersion.investments.indexOf(investment);
    if (index !== -1) {
      this.actualVersion.investments[index] = investment;
    } else {
      this.actualVersion.investments.push(investment);
    }
  }

  createVersion():Version {
    let version:Version = new Version();
    version.yearFrom = (new Date()).getFullYear()+1;
    version.yearTo = version.yearFrom + 50;
    version.inoutComes = [];
    for(let i = version.yearFrom; i <= version.yearTo; i++) {
      let inoutcome:Inoutcome = new Inoutcome();
      inoutcome.year = i;
      version.inoutComes.push(inoutcome);
    }
    version.foreignContainer = new ForeignContainer();
    version.foreignContainer.foreignValue = 0;
    version.investments = [];
    version.liquidityStart = new LiquidityStart();
    version.liquidityStart.liquidity = 0;
    return version;
  }

}
