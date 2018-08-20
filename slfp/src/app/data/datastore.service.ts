import { Injectable } from '@angular/core';
import {MOCK} from "./mockdata";
import {Inoutcome} from "./model/inoutcome";
import {Category} from "./model/category";
import {Investment} from "./model/investment";

@Injectable({
  providedIn: 'root'
})
export class DatastoreService {

  inoutComes: Inoutcome[];
  categories: Category[];
  investments: Investment[];

  constructor() {
    this.inoutComes = MOCK.inoutcomes;
    this.categories = MOCK.categories;
    this.investments = MOCK.investments;
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

  saveInvestment(investment: Investment) {
    let index = this.investments.indexOf(investment);
    if (index !== -1) {
      this.investments[index] = investment;
    } else {
      this.investments.push(investment);
    }
  }
}
