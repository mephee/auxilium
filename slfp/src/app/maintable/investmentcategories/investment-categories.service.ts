import { Injectable } from '@angular/core';
import {InvestmentCategory} from "./model/investmentCategory";


@Injectable({
  providedIn: 'root'
})

export class InvestmentCategories {

  investmentCategory: InvestmentCategory[];

  constructor() {
    this.init();
  }

  getInvestmentCategories(): InvestmentCategory[] {
    return this.investmentCategory;
  }

  private init() {
    this.investmentCategory = [
      { name: 'Abschreibungen gemäss Investitionsplanung HRM 2', rate: 1.25, show: false, investments: []},
      { name: 'Abschreibungen gemäss Investitionsplanung HRM 2', rate: 2.5, show: false, investments: []},
      { name: 'Abschreibungen gemäss Investitionsplanung HRM 2', rate: 3, show: false, investments: []},
      { name: 'Abschreibungen gemäss Investitionsplanung HRM 2', rate: 4, show: false, investments: []},
      { name: 'Abschreibungen gemäss Investitionsplanung HRM 2', rate: 5, show: false, investments: []},
      { name: 'Abschreibungen gemäss Investitionsplanung HRM 2', rate: 6.67, show: false, investments: []},
      { name: 'Abschreibungen gemäss Investitionsplanung HRM 2', rate: 10, show: false, investments: []},
      { name: 'Abschreibungen gemäss Investitionsplanung HRM 2', rate: 20, show: false, investments: []}
    ];
  }
}
