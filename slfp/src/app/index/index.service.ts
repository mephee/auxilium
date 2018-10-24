import { Injectable } from '@angular/core';
import {Investment} from "../data/model/investment";
import {DatastoreService} from "../data/datastore.service";
import { v4 as uuid } from 'uuid';
import {InvestmentService} from "../maintable/investment/investment.service";
import {Index} from "../data/model";
import index from "@angular/cli/lib/cli";

@Injectable({
  providedIn: 'root'
})
export class IndexService {

  constructor(private datastore:DatastoreService,
              private investment:InvestmentService) { }

  generateIndexedReinvestments():void {

    // remove all indexed reinvestments -> will be gennerated new
    this.datastore.getActualVersion().investments = this.datastore.getInvestmentsWithoutIndexed();

    // regenerate reinvestments if needed
    this.datastore.getInvestments().forEach(investment=>{
      if (this.investment.isInvestmentComplete(investment)) {
        let totalPlanned:number = this.investment.getTotalEffective(investment);
        let taxoffYears = this.investment.getTaxoffYearsCount(investment);
        let investTimeSpan = this.investment.getInvestmentTimespan(investment);

        let lastInvestmentYear = this.investment.getLastInvestmentYear(investment);
        let indexToday:number = this.getIndexForYear(lastInvestmentYear);
        for (let i=1;i<=investment.reinvestCount;i++) {
          let reinvestmentYear = lastInvestmentYear + (taxoffYears + investTimeSpan)*i;
          let indexRe:number = this.getIndexForYear(reinvestmentYear);
          let indexedTotal = ~~((totalPlanned/indexToday)*indexRe);
          let reinvestment:Investment = JSON.parse(JSON.stringify(investment));
          reinvestment.reinvestParentId = investment.id;
          reinvestment.reinvestCount = 0;
          reinvestment.id = uuid();
          reinvestment.grantYearsFederal = [];
          reinvestment.grantYearsCanton = [];
          reinvestment.total = indexedTotal;
          reinvestment.totalCorr = 0;
          let indexedTotalSum:number = 0;
          for(let j=0;j<reinvestment.investmentYears.length;j++) {
            reinvestment.investmentYears[j].year+=(taxoffYears + investTimeSpan)*i;
            reinvestment.investmentYears[j].invest = ~~((reinvestment.investmentYears[j].invest/indexToday)*indexRe);
            indexedTotalSum += reinvestment.investmentYears[j].invest;
          }

          // Durch Rundungsfehler könntem die Teilzahlungen nicht gleich hoch sein wie das Total -> korrigieren
          if (indexedTotalSum != indexedTotal) {
            reinvestment.investmentYears[reinvestment.investmentYears.length-1].invest += (indexedTotal-indexedTotalSum);
          }

          this.datastore.saveInvestment(reinvestment);
        }
      }
    });

  }

  getIndexForYear(year:number):number {
    let indexToday:Index = this.datastore.getIndexes().find(index=>index.year === year);
    if (!indexToday) {
      if (this.datastore.getIndexes().length>0) {
        indexToday = this.datastore.getIndexes()[this.datastore.getIndexes().length-1];
      } else {
        indexToday = new Index();
        indexToday.index = 100;
      }
    }
    return indexToday.index;
  }
}
