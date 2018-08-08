import { Injectable } from '@angular/core';
import {MOCK} from "./mockdata";
import {Inoutcome} from "./model/inoutcome";
import {Category} from "./model/category";
import {Investment} from "./model/investment";

@Injectable({
  providedIn: 'root'
})
export class DatastoreService {

  constructor() { }

  getInoutcomes(): Inoutcome[] {
    return MOCK.inoutcomes;
  }

  getCategories(): Category[] {
    return MOCK.categories;
  }

  getInvestments(): Investment[] {
    return MOCK.investments;
  }

  addInvestment(investment: Investment) {
    MOCK.investments.push(investment);
  }
}
