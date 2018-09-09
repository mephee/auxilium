import { Injectable } from '@angular/core';
import {Subject} from "rxjs/index";
import {Version} from "../data/model/version";

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  private componentMethodCallSource = new Subject<Version>();
  componentMethodCalled$ = this.componentMethodCallSource.asObservable();

  constructor() { }

  callComponentMethod(value:Version) {
    this.componentMethodCallSource.next(value);
  }
}
