import { Injectable } from '@angular/core';
import {Subject} from "rxjs/index";
import {Version} from "../data/model/version";

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {

  private versionReadySubject = new Subject<Version>();
  versionReady$ = this.versionReadySubject.asObservable();

  private alertSubject = new Subject<string>();
  alert$ = this.alertSubject.asObservable();

  constructor() { }

  versionReady(value:Version) {
    this.versionReadySubject.next(value);
  }

  alert(value:string) {
    this.alertSubject.next(value);
  }
}
