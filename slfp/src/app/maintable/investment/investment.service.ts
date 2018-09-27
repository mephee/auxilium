import { Injectable } from '@angular/core';
import {Investment} from "../../data/model/investment";
import {retry} from "rxjs/internal/operators";

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {

  constructor() { }

  isInvestmentComplete(investment:Investment):boolean {
    let totalPlanned:number = investment.totalCorr > 0 ? investment.totalCorr : investment.total;
    let investTotal:number = this.getTotalInvested(investment);
    return (totalPlanned === investTotal && investTotal > 0);
  }

  getTotalEffective(investment:Investment):number {
    return investment.totalCorr > 0 ? investment.totalCorr : investment.total;
  }

  getTotalInvested(investment:Investment):number {
    return investment.investmentYears.reduce((total, investmentYear) => total + investmentYear.invest, 0);
  }

  getTaxoffYearsCount(investment:Investment):number {
    return ~~(100/investment.rate);
  }

  getInvestmentTimespan(investment:Investment):number {
    return investment.investmentYears[investment.investmentYears.length-1].year - investment.investmentYears[0].year;
  }

  getLastInvestmentYear(investment:Investment) {
    return investment.investmentYears[investment.investmentYears.length-1].year;
  }

}
