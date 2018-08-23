import { Injectable } from '@angular/core';
import {MOCK} from "./mockdata";
import {Inoutcome} from "./model/inoutcome";
import {Category} from "./model/category";
import {Investment} from "./model/investment";
import {ForeignContainer} from "./model/foreignContainer";
import {LiquidityStart} from "./model/liquidityStart";

@Injectable({
  providedIn: 'root'
})
export class DatastoreService {

  private inoutComes: Inoutcome[];
  private categories: Category[];
  private investments: Investment[];
  private foreignContainer: ForeignContainer;

  liquidityStart: LiquidityStart;

  constructor() {
    this.inoutComes = MOCK.inoutcomes;
    this.categories = MOCK.categories;
    this.investments = MOCK.investments;
    this.foreignContainer = MOCK.foreignContainer;
    this.liquidityStart = new LiquidityStart();
    this.liquidityStart.liquidity = 3000;
  }

  getInoutcomes(): Inoutcome[] {
    return this.inoutComes;
  }

  getCategories(): Category[] {
    return this.categories
  }

  getInvestments(): Investment[] {
    return this.investments;
  }

  getForeignContainer(): ForeignContainer {
    return this.foreignContainer;
  }

  getLiquidityStart(): LiquidityStart {
    return this.liquidityStart;
  }

  saveInvestment(investment: Investment) {
    let index = this.investments.indexOf(investment);
    if (index !== -1) {
      this.investments[index] = investment;
    } else {
      this.investments.push(investment);
    }
  }
}
