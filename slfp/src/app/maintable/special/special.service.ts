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

  getSpecialNameForId(id:number):string {
      return this.specials.find(special=>{
        return special.id == id;
      }).name;
  }

  private init() {
    this.specials = [
      { name: 'keine', id: 0},
      { name: 'SF Wasser', id: 1},
      { name: 'SF Abwasser', id: 2},
      { name: 'SF Abfall', id: 3},
      { name: 'SF Feuerwehr', id: 4}
    ];
  }
}
