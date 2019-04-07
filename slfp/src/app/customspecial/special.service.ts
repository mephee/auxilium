import { Injectable } from '@angular/core';
import {Special} from "./model/special";
import {DatastoreService} from "../data/datastore.service";

@Injectable({
  providedIn: 'root'
})
export class SpecialService {

  private specials:Special[];

  constructor(private datastore:DatastoreService) {
    this.init();
  }

  getSpecials(): Special[] {
    return this.specials.concat(this.datastore.getCustomspecials());
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
