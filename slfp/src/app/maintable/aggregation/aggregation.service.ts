import { Injectable } from '@angular/core';
import {DatastoreService} from "../../data/datastore.service";
import {Inoutcome} from "../../data/model/inoutcome";
import {Investment} from "../../data/model/investment";
import {InvestmentYear} from "../../data/model/investmentYear";
import {InvestmentCategory} from "../../data/model/investmentCategory";

@Injectable({
  providedIn: 'root'
})
export class AggregationService {

  yearFrom: number;
  yearTo: number;

  constructor(private datastore: DatastoreService) { }

  getYears(): number[] {
    let years: number[];
    years = this.datastore.getInoutcomes().map(inoutcome => {
      return inoutcome.year;
    });
    this.yearFrom = years[0];
    this.yearTo = years[years.length-1];
    return years;
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

  getInvestmentsByRate(rate: number): Investment[] {
    let investmnetsByRate: Investment[] = [];
    this.datastore.getInvestments().forEach(investment => {
      if (investment.rate === rate) {
        investmnetsByRate.push(investment);
      }
    });
    return investmnetsByRate;
  }

  getTaxoffsByYear(investment: Investment): number[] {
    let taxoffs:number[] = [];
    let totalEff: number = investment.totalCorr ? investment.totalCorr : investment.total;
    let investmentYears:InvestmentYear[] = investment.investmentYears;
    let investedEff = investment.investmentYears.reduce((total, investmentYear) => total + investmentYear.invest, 0);
    let taxoffPerYear:number = 0;
    let taxoffStartYear:number = 0;
    if (investedEff === totalEff) {
      taxoffPerYear = investedEff/(100/investment.rate);
      taxoffStartYear = investment.investmentYears[investment.investmentYears.length-1].year;
    }
    for(let i:number = this.yearFrom;i<=this.yearTo;i++) {
      if (taxoffStartYear <= i) {
        taxoffs.push(taxoffPerYear);
      } else {
        taxoffs.push(0);
      }
    }
    return taxoffs;
  }

  getInvestmentCategories(): InvestmentCategory[] {
    return [
      { name: 'Abschreibungen (je nach Art) gemäss Invetitionsplanung HRM 2', rate: 1.25},
      { name: 'Abschreibungen (je nach Art) gemäss Invetitionsplanung HRM 3', rate: 2.5},
      { name: 'Abschreibungen (je nach Art) gemäss Invetitionsplanung HRM 4', rate: 3},
      { name: 'Abschreibungen (je nach Art) gemäss Invetitionsplanung HRM 5', rate: 4},
      { name: 'Abschreibungen (je nach Art) gemäss Invetitionsplanung HRM 6', rate: 5},
      { name: 'Abschreibungen (je nach Art) gemäss Invetitionsplanung HRM 7', rate: 6.67},
      { name: 'Abschreibungen (je nach Art) gemäss Invetitionsplanung HRM 8', rate: 10},
      { name: 'Abschreibungen (je nach Art) gemäss Invetitionsplanung HRM 9', rate: 20}
    ];
  }
}
