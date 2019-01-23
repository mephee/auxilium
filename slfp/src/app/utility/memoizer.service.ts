import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MemoizerService {

  cache:Map<string, any>;

  constructor() {
    this.cache = new Map<string, any>();
  }

  mem(type:string, callback:() => any):any {
    if (this.cache.has(type)) {
      return this.cache.get(type);
    } else {
      return this.cache.set(type, callback()).get(type);
    }
  }

  reset() {
    this.cache.clear();
  }
}
