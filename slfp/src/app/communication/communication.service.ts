import { Injectable } from '@angular/core';
import {Subject} from "rxjs/index";
import {Version} from "../data/model/version";
import {Confirm} from "./model/confirm";

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  private versionReadySubject = new Subject<Version>();
  versionReady$ = this.versionReadySubject.asObservable();

  private alertSubject = new Subject<string>();
  alert$ = this.alertSubject.asObservable();

  private confirmSubject = new Subject<Confirm>();
  confirm$ = this.confirmSubject.asObservable();

  constructor() { }

  versionReady(value:Version) {
    this.versionReadySubject.next(value);
  }

  alert(value:string) {
    this.alertSubject.next(value);
  }

  confirm(value:Confirm) {
    this.confirmSubject.next(value);
  }
}
