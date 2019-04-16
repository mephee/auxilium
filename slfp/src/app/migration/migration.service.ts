import { Injectable } from '@angular/core';
import {Version} from "../data/model/version";

@Injectable({
  providedIn: 'root'
})
export class MigrationService {

  constructor() { }

  migrate(versions:Version[]): boolean {
    let migrated:boolean = false;
    for (let i=0;i<versions.length;i++) {
      if (versions[i].version == undefined) {
        console.log('migrate data from undefined to 1');
        for (let j=0;j<versions[i].inoutComes.length;j++) {
          versions[i].inoutComes[j].additionalOutcome = 0;
          versions[i].inoutComes[j].additionalIncome = 0;
        }
        versions[i].version = 1;
        migrated = true;
      }
      if (versions[i].version == 1) {
        console.log('migrate data from 1 to 2');
        for (let j=0;j<versions[i].investments.length;j++) {
          versions[i].investments[j].deinvestment = 0;
        }
        versions[i].version = 2;
        migrated = true;
      }
      if (versions[i].version == 2) {  // etc
        console.log('migrate data from 2 to 3');
        for (let j=0;j<versions[i].investments.length;j++) {
          versions[i].investmentHRM1Container.year = 2018;
        }
        versions[i].version = 3;
        migrated = true;
      }

    }
    return migrated;
  }
}
