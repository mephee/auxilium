import { Injectable } from '@angular/core';
import {Special} from "./model/special";
import {InvestmentCategory} from "../investmentcategories/model/investmentCategory";

@Injectable({
  providedIn: 'root'
})
export class SpecialService {

  private specials:Special[];

  constructor() {
    this.init();
  }

  getSpecials(): Special[] {
    return this.specials;
  }

  private init() {
    this.specials = [
      { name: 'SF Wasser', id: 1},
      { name: 'SF Abwasser', id: 2},
      { name: 'SF Feuerwehr', id: 3}
    ];
  }
}
