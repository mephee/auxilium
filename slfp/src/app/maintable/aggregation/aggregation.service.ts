import { Injectable } from '@angular/core';
import {DatastoreService} from "../../data/datastore.service";
import {Inoutcome} from "../../data/model/inoutcome";
import {Investment} from "../../data/model/investment";
import {InvestmentYear} from "../../data/model/investmentYear";
import {InvestmentCategory} from "../../data/model/investmentCategory";
import {init} from "protractor/built/launcher";
import {Balance} from "../../data/model/balance";
import {ForeignPayback} from "../../data/model/foreignPayback";
import {ForeignContainer} from "../../data/model/foreignContainer";
import {count} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AggregationService {

  yearFrom: number;
  yearTo: number;
  balanceAfterOutcome: Balance[];
  balanceBeforeWriteoff: Balance[];
  balanceAfterWriteoff: Balance[];
  balanceAfterInvestments: Balance[] = [];

  investmentCategory: InvestmentCategory[];

  constructor(private datastore: DatastoreService) {
    this.load();
  }



  getYears(): number[] {
    let years: number[];
    years = this.datastore.getInoutcomes().map(inoutcome => {
      return inoutcome.year;
    });
    this.yearFrom = years[0];
    this.yearTo = years[years.length-1];
    return years;
  }

  calculateTaxIncome(inoutcome: Inoutcome): void {
    inoutcome.income = inoutcome.taxvolume/(100/inoutcome.taxrate);
  }


  getInvestmentsByYear(investment: Investment): number[] {
    let investments:number[] = [];
    let investmentYears:InvestmentYear[] = investment.investmentYears;
    for(let i:number = this.yearFrom;i<=this.yearTo;i++) {
      let investmentYear:InvestmentYear = investmentYears.find(investmentYear => investmentYear.year === i);
      if (investmentYear) {
        investments.push(investmentYear.invest)
      } else {
        investments.push(0);
      }
    }
    return investments;
  }

  getForeignContainer(): ForeignContainer {
    for(let i:number = this.yearFrom;i<=this.yearTo;i++) {
      let payback:ForeignPayback = this.datastore.getForeignContainer().foreignPayback.find(payback => payback.year === i);
      if (!payback) {
        this.datastore.getForeignContainer().foreignPayback.push(new ForeignPayback(i));
      }
    }
    this.datastore.getForeignContainer().foreignPayback.sort((payback1,payback2)=> payback1.year - payback2.year);
    return this.datastore.getForeignContainer();
  }

  getLiquidityOfLastYear(): number[] {
    this.calculateBalances();
    let liquidity: number[] = [];
    let counter:number = 0;
    for(let i:number = this.yearFrom;i<this.yearTo;i++) {
      liquidity.push(this.balanceAfterInvestments[counter].value);
      counter++;
    }
    return liquidity;
  }

  getInvestmentsByRate(rate: number): Investment[] {
    let investmnetsByRate: Investment[] = [];
    this.datastore.getInvestments().forEach(investment => {
      if (investment.rate === rate) {
        investmnetsByRate.push(investment);
      }
    });
    return investmnetsByRate;
  }

  getTaxoffsByCategory(investmentCategory: InvestmentCategory): number[] {
    let taxoffs: number[] = new Array(this.yearTo - this.yearFrom + 1);
    let counter:number;
    this.getInvestmentsByRate(investmentCategory.rate).forEach(investment => {
      counter = -1;
      this.getTaxoffsByYear(investment).forEach(taxoff => {
        counter++;
          if (taxoffs[counter]>0) {
            taxoffs[counter] += taxoff;
          } else {
            taxoffs[counter] = taxoff;
          }
        }
      );
    });
    return taxoffs;
  }

  getTaxoffsByYear(investment: Investment): number[] {
    let taxoffs:number[] = [];
    let totalEff: number = investment.totalCorr > 0 ? investment.totalCorr : investment.total;
    let investedEff = investment.investmentYears.reduce((total, investmentYear) => total + investmentYear.invest, 0);
    let taxoffPerYear:number = 0;
    let taxoffStartYear:number = 0;
    if (investedEff === totalEff) {
      taxoffPerYear = investedEff/(100/investment.rate);
      taxoffStartYear = investment.investmentYears[investment.investmentYears.length-1].year;
    }
    let taxoffTotal:number = 0;
    for(let i:number = this.yearFrom;i<=this.yearTo;i++) {
      if ((taxoffStartYear <= i) && (taxoffTotal < investedEff)) {
        taxoffs.push(taxoffPerYear);
        taxoffTotal += taxoffPerYear;
      } else {
        taxoffs.push(0);
      }
    }
    return taxoffs;
  }

  getTaxoffsHRM1ByYear() {
    let taxoffs:number[] = [];
    let total:number = this.datastore.getInvestmentHRM1Container().value;
    let taxoffPerYear:number = total/(100/this.datastore.getInvestmentHRM1Container().rate);
    let taxoffTotal:number = 0;
    for(let i:number = this.yearFrom;i<=this.yearTo;i++) {
      if (taxoffTotal < total) {
        taxoffs.push(taxoffPerYear);
        taxoffTotal += taxoffPerYear;
      } else {
        taxoffs.push(0);
      }
    }
    return taxoffs;
  }

  getInvestmentCategories(): InvestmentCategory[] {
    return this.investmentCategory;
  }


  // Calculations (Balances)
  private calculateBalances(): void {

    this.balanceBeforeWriteoff = [];
    this.balanceAfterWriteoff = [];
    this.balanceAfterInvestments = [];

    let investments:number[] = this.getInvestmentsTotal();
    let foreignContainer: ForeignContainer = this.getForeignContainer();
    let taxoffs:number[] = this.getTaxoffsTotal();
    let counter:number = 0;
    for(let i:number = this.yearFrom;i<=this.yearTo;i++) {

      // before writeoff
      let balance = new Balance();
      balance.year = i;
      balance.type = 'beforewriteoff';
      if (counter == 0) {
        balance.value = this.balanceAfterOutcome[counter].value + this.datastore.getLiquidityStart().liquidity;
      } else {
        balance.value = this.balanceAfterOutcome[counter].value + this.balanceAfterInvestments[counter-1].value;
      }
      if (foreignContainer.foreignPayback[counter].payback) {
        balance.value += foreignContainer.foreignPayback[counter].payback;
      }
      this.balanceBeforeWriteoff.push(balance);


      // after writeoff
      balance = new Balance();
      balance.year = i;
      balance.type = 'afterwriteoff';
      balance.value = this.balanceBeforeWriteoff[counter].value + taxoffs[counter];
      this.balanceAfterWriteoff.push(balance);

      // after investment
      balance = new Balance();
      balance.year = i;
      balance.type = 'afterinvestment';
      balance.value = this.balanceAfterWriteoff[counter].value;
      if (investments[counter]<0) {
        balance.value += investments[counter];
      }
      this.balanceAfterInvestments.push(balance);

      counter++;
    }
  }

  getBalanceAfterOutcome(): Balance[] {
    this.balanceAfterOutcome = this.datastore.getInoutcomes().map(inoutcome => {
      let balance = new Balance();
      balance.year = inoutcome.year;
      balance.type = 'inoutcome';
      balance.value = inoutcome.income + inoutcome.outcome;
      return balance;
    });
    return this.balanceAfterOutcome;
  }

  getBalanceBeforeWriteoff(): Balance[] {
    this.calculateBalances();
    return this.balanceBeforeWriteoff;
  }

  getBalanceAfterWriteoff(): Balance[] {
    this.calculateBalances();
    return this.balanceAfterWriteoff;

  }

  getTaxoffsTotal(): number[] {
    let taxoffs: number[] = new Array(this.yearTo - this.yearFrom + 1);
    let counter:number;
    this.datastore.getInvestments().forEach(investment => {
      counter = -1;
      this.getTaxoffsByYear(investment).forEach(taxoff => {
        counter++;
        if (taxoffs[counter]>0) {
          taxoffs[counter] += taxoff;
        } else {
          taxoffs[counter] = taxoff;
        }
      });
    });
    counter = -1;
    this.getTaxoffsHRM1ByYear().forEach(taxoff => {
      counter++;
      if (taxoffs[counter]>0) {
        taxoffs[counter] += taxoff;
      } else {
        taxoffs[counter] = taxoff;
      }
    });
    return taxoffs;
  }

  getInvestmentsTotal(): number[] {
    let investments:number[] = new Array(this.yearTo - this.yearFrom + 1);
    this.datastore.getInvestments().forEach(investment => {
      investment.investmentYears.forEach(investmentYear => {
          let index = investmentYear.year - this.yearFrom;
          if (investments[index] < 0) {
            investments[index] += -investmentYear.invest;
          } else {
            investments[index] = -investmentYear.invest;
          }
        }
      );
    });
    return investments;
  }

  getBalanceAfterInvestments(): Balance[] {
    this.calculateBalances();
    return this.balanceAfterInvestments;
  }



  // Private shit
  private load() {
    this.investmentCategory = [
      { name: 'Abschreibungen gemäss Investitionsplaung HRM 2', rate: 1.25, show: false},
      { name: 'Abschreibungen gemäss Investitionsplaung HRM 2', rate: 2.5, show: false},
      { name: 'Abschreibungen gemäss Investitionsplaung HRM 2', rate: 3, show: false},
      { name: 'Abschreibungen gemäss Investitionsplaung HRM 2', rate: 4, show: false},
      { name: 'Abschreibungen gemäss Investitionsplaung HRM 2', rate: 5, show: false},
      { name: 'Abschreibungen gemäss Investitionsplaung HRM 2', rate: 6.67, show: false},
      { name: 'Abschreibungen gemäss Investitionsplaung HRM 2', rate: 10, show: false},
      { name: 'Abschreibungen gemäss Investitionsplaung HRM 2', rate: 20, show: false}
    ];
  }
}
