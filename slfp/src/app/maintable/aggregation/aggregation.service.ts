import { Injectable } from '@angular/core';
import {DatastoreService} from "../../data/datastore.service";
import {Investment} from "../../data/model/investment";
import {InvestmentCategory} from "../../data/model/investmentCategory";
import {ForeignPayback} from "../../data/model/foreignPayback";
import {ForeignContainer} from "../../data/model/foreignContainer";
import {GrantGUI} from "./model/grantGUI";
import {MoneyPipe} from "../../utility/money.pipe";
import {InvestmentService} from "../investment/investment.service";
import {InvestmentGUI} from "./model/investmentGUI";
import {MemoizerService} from "../../utility/memoizer.service";


@Injectable({
  providedIn: 'root'
})

export class AggregationService {

  investmentCategory: InvestmentCategory[];

  constructor(private datastore: DatastoreService,
              private money:MoneyPipe,
              private investment:InvestmentService,
              private memoizer:MemoizerService) {
    this.load();
  }


  /*
  Static Getters
   */
  getInvestmentCategories(): InvestmentCategory[] {
    return this.investmentCategory;
  }


  /*
  Transient Getters
   */

  // year
  getYears(): number[] {
    return this.memoizer.mem('years', () => {
      let years: number[];
      years = this.datastore.getInoutcomes().map(inoutcome => {
        return inoutcome.year;
      });
      return years;
    });
  }

  // foreign Container
  getForeignContainer(): ForeignContainer {
    return this.memoizer.mem('foreign', () => {
      for (let i: number = this.datastore.getActualVersion().yearFrom; i <= this.datastore.getActualVersion().yearTo; i++) {
        let payback: ForeignPayback = this.datastore.getForeignContainer().foreignPayback.find(payback => payback.year === i);
        if (!payback) {
          this.datastore.getForeignContainer().foreignPayback.push(new ForeignPayback(i));
        }
      }
      this.datastore.getForeignContainer().foreignPayback.sort((payback1, payback2) => payback1.year - payback2.year);
      return this.datastore.getForeignContainer();
    });
  }

  // Investment
  hasInvestmentsByRate(rate: number):boolean {
    return this.memoizer.mem('hasInvestmentsByRate'+rate, () => {
      return this.datastore.getInvestmentsWithoutIndexed().find((element) => {
        return element.rate == rate;
      }) != undefined;
    });
  }

  getInvestmentsByRate(rate: number): Investment[] {
    return this.memoizer.mem('getInvestmentsByRate'+rate, () => {
      let investmnetsByRate: Investment[] = [];
      this.datastore.getInvestmentsWithoutIndexed().forEach(investment => {
        if (investment.rate === rate) {
          investmnetsByRate.push(investment);
        }
      });
      return investmnetsByRate;
    });
  }

  getInvestmentsTotal(): InvestmentGUI[] {
    return this.memoizer.mem('investmentTotal', () => {
      let investments: InvestmentGUI[] = new Array(this.datastore.getActualVersion().yearTo - this.datastore.getActualVersion().yearFrom + 1);
      for (let i = 0; i < investments.length; i++) {
        investments[i] = new InvestmentGUI();
        investments[i].year = this.datastore.getActualVersion().yearFrom + i;
      }
      this.datastore.getInvestments().forEach(investment => {
        investment.investmentYears.forEach(investmentYear => {
            let index = investmentYear.year - this.datastore.getActualVersion().yearFrom;
            if (investments[index].investmentTotal < 0) {
              investments[index].investmentTotal += -investmentYear.invest;
            } else {
              investments[index].investmentTotal = -investmentYear.invest;
            }
            investments[index].tooltip += this.getTooltipLine(investment, investmentYear.invest, '');
          }
        );
      });
      return investments;
    });
  }

  // Deinvestment
  getDeinvestmentsTotal(): InvestmentGUI[] {
    return this.memoizer.mem('deinvestmentTot', () => {
      let deinvestments: InvestmentGUI[] = new Array(this.datastore.getActualVersion().yearTo - this.datastore.getActualVersion().yearFrom + 1);
      for (let i = 0; i < deinvestments.length; i++) {
        deinvestments[i] = new InvestmentGUI();
        deinvestments[i].year = this.datastore.getActualVersion().yearFrom + i;
      }
      this.datastore.getInvestments().forEach(investment => {
        if (this.investment.isInvestmentComplete(investment)) {
          let taxoffYears = this.investment.getTaxoffYearsCount(investment);
          let taxoffStartYear = investment.investmentYears[investment.investmentYears.length - 1].year;
          let index = taxoffStartYear + taxoffYears - this.datastore.getActualVersion().yearFrom;
          if (deinvestments[index].investmentTotal > 0) {
            deinvestments[index].investmentTotal += investment.deinvestment;
          } else {
            deinvestments[index].investmentTotal = investment.deinvestment;
          }
          deinvestments[index].tooltip += this.getTooltipLine(investment, investment.deinvestment, '');
        }
      });
      return deinvestments;
    });
  }

  // Taxoffs
  getTaxoffsByCategory(investmentCategory: InvestmentCategory): number[] {
    return this.memoizer.mem('taxoffsByCategory'+investmentCategory.rate, () => {
      let taxoffs: number[] = new Array(this.datastore.getActualVersion().yearTo - this.datastore.getActualVersion().yearFrom + 1);
      let counter: number;
      this.getInvestmentsByRate(investmentCategory.rate).forEach(investment => {
        counter = -1;
        this.getTaxoffsByYear(investment).forEach(taxoff => {
            counter++;
            if (taxoffs[counter] > 0) {
              taxoffs[counter] += taxoff;
            } else {
              taxoffs[counter] = taxoff;
            }
          }
        );
      });
      return taxoffs;
    });
  }

  getTaxoffsByYear(investment: Investment): number[] {
    return this.memoizer.mem('taxoffsByYear'+investment.id, () => {
      let taxoffs: number[] = [];
      let investedEff = this.investment.getTotalInvested(investment);
      let taxoffPerYear: number = 0;
      let taxoffStartYear: number = 0;

      // fertig investiert?
      let doTaxoff: boolean = false;
      if (this.investment.isInvestmentComplete(investment)) {
        doTaxoff = true;
        taxoffPerYear = investedEff / (100 / investment.rate);
        taxoffStartYear = investment.investmentYears[investment.investmentYears.length - 1].year;
      }
      let taxoffTotal: number = 0;
      for (let i: number = this.datastore.getActualVersion().yearFrom; i <= this.datastore.getActualVersion().yearTo; i++) {
        if (doTaxoff && (taxoffStartYear <= i) && (taxoffTotal < investedEff)) {
          taxoffTotal += taxoffPerYear;
          if (taxoffTotal > investedEff) {  // letztes Jahr kann einen kleineren Betrag haben weil eventuell Rate nicht aufgeht mit Jahren
            taxoffPerYear = (taxoffPerYear - taxoffTotal + investedEff);
            taxoffTotal = investedEff;
          }
          taxoffs.push(taxoffPerYear);
        } else {
          taxoffs.push(0);
        }
      }

      // add Years if Investment if still not "abgeschrieben"
      if (doTaxoff && (investedEff > taxoffTotal)) {
        while (investedEff > taxoffTotal) {
          taxoffs.push(taxoffPerYear);
          taxoffTotal += taxoffPerYear;
          this.datastore.getActualVersion().yearTo++;
        }
        this.datastore.updateVersionYearFromTo(this.datastore.getActualVersion().yearFrom, this.datastore.getActualVersion().yearTo);
      }

      // add indexed reinvestments (caution, this is a recursion!)
      let reinvestments: Investment[] = this.datastore.getInvestments().filter(reinvestment => reinvestment.reinvestParentId === investment.id && reinvestment.reinvestParentId);
      reinvestments.forEach(reinvestment => {
        let lastTaxoffs = taxoffs;
        taxoffs = this.getTaxoffsByYear(reinvestment);
        for (let i = 0; i < lastTaxoffs.length; i++) {
          taxoffs[i] += lastTaxoffs[i];
        }
      });

      return taxoffs;
    });
  }

  getTaxoffsHRM1ByYear() {
    return this.memoizer.mem('taxoffhrm1Year', () => {
      let taxoffs: number[] = [];
      let total: number = this.datastore.getInvestmentHRM1Container().value;
      let rate: number = Math.ceil(this.datastore.getInvestmentHRM1Container().rate * 100) / 100;  // Aufrunden nötig, sonst wird bei ungerader Menge Jahren ein Jahr zu viel abgeschrieben
      let taxoffPerYear: number = total / (100 / rate);
      let taxoffTotal: number = 0;
      for (let i: number = 2018; i <= this.datastore.getActualVersion().yearTo; i++) {
        if (taxoffTotal < total) {
          if (i >= this.datastore.getActualVersion().yearFrom) {
            taxoffs.push(taxoffPerYear);
          }
          taxoffTotal += taxoffPerYear;
        } else {
          if (i >= this.datastore.getActualVersion().yearFrom) {
            taxoffs.push(0);
          }
        }
      }
      return taxoffs;
    });
  }

  getTaxoffsTotal(): number[] {
    return this.memoizer.mem('taxoffsTotal', () => {
      let taxoffs: number[] = new Array(this.datastore.getActualVersion().yearTo - this.datastore.getActualVersion().yearFrom + 1);
      let counter: number;
      this.datastore.getInvestmentsWithoutIndexed().forEach(investment => {
        counter = -1;
        this.getTaxoffsByYear(investment).forEach(taxoff => {
          counter++;
          if (taxoffs.length <= counter) {  //taxoffsbyyear can add years -> make shure you check this
            taxoffs.push(0);
          }
          if (taxoffs[counter] > 0) {
            taxoffs[counter] += taxoff;
          } else {
            taxoffs[counter] = taxoff;
          }
        });
      });
      counter = -1;
      this.getTaxoffsHRM1ByYear().forEach(taxoff => {
        counter++;
        if (taxoffs[counter] > 0) {
          taxoffs[counter] += taxoff;
        } else {
          taxoffs[counter] = taxoff;
        }
      });
      counter = -1;
      this.datastore.getAdditionalTaxoffs().forEach(taxoff => {
        counter++;
        if (taxoffs[counter] > 0) {
          taxoffs[counter] += taxoff.taxoff;
        } else {
          taxoffs[counter] = taxoff.taxoff;
        }
      });
      return taxoffs;
    });
  }


  // Grants
  getGrants(): GrantGUI[] {
    return this.memoizer.mem('grants', () => {
      let grants: GrantGUI[] = new Array(this.datastore.getActualVersion().yearTo - this.datastore.getActualVersion().yearFrom + 1);
      for (let i = 0; i < grants.length; i++) {
        grants[i] = new GrantGUI();
        grants[i].year = this.datastore.getActualVersion().yearFrom + i;
      }
      this.datastore.getInvestments().forEach(investment => {
        let hasGrantYearsFederal: boolean = (investment.grantYearsFederal.length > 0) && (investment.grantYearsFederal[0].grant > 0);
        let hasGrantYearsCanton: boolean = (investment.grantYearsCanton.length > 0) && (investment.grantYearsCanton[0].grant > 0);
        if ((investment.grantCanton > 0) || (investment.grantFederal > 0) || hasGrantYearsFederal || hasGrantYearsCanton) {
          if (this.investment.isInvestmentComplete(investment)) {
            let investedEff = this.investment.getTotalEffective(investment);
            let taxoffStartYear: number = 0;
            taxoffStartYear = investment.investmentYears[investment.investmentYears.length - 1].year + 1;
            if (hasGrantYearsFederal) {
              investment.grantYearsFederal.forEach(grantYear => {
                grants[grantYear.year - this.datastore.getActualVersion().yearFrom].grantTotal += grantYear.grant;
                grants[grantYear.year - this.datastore.getActualVersion().yearFrom].tooltip += this.getTooltipLine(investment, grantYear.grant, 'Bund effektiv');

              });
            } else {
              if (investment.grantFederal > 0) {
                grants[taxoffStartYear - this.datastore.getActualVersion().yearFrom].grantTotal += investedEff * investment.grantFederal / 100;
                grants[taxoffStartYear - this.datastore.getActualVersion().yearFrom].tooltip += this.getTooltipLine(investment, investedEff * investment.grantFederal / 100, 'Bund geplant');
              }
            }
            if (hasGrantYearsCanton) {
              investment.grantYearsCanton.forEach(grantYear => {
                grants[grantYear.year - this.datastore.getActualVersion().yearFrom].grantTotal += grantYear.grant;
                grants[grantYear.year - this.datastore.getActualVersion().yearFrom].tooltip += this.getTooltipLine(investment, grantYear.grant, 'Kanton effektiv');

              });
            } else {
              if (investment.grantCanton > 0) {
                grants[taxoffStartYear - this.datastore.getActualVersion().yearFrom].grantTotal += investedEff * investment.grantCanton / 100;
                grants[taxoffStartYear - this.datastore.getActualVersion().yearFrom].tooltip += this.getTooltipLine(investment, investedEff * investment.grantCanton / 100, 'Kanton geplant');
              }
            }
          }
        }
      });
      return grants;
    });
  }

  private getTooltipLine(investment:Investment, amount:number, type:string):string {
    let tooltipline =
    "<div class='row'>" +
      "<div class='col-8'>"+investment.name + " ("+investment.projectNr+") ";
    if (type != "") {
      tooltipline += "("+type+")";
    }
    tooltipline +=
      "</div>"+
      "<div class='col-4 text-right'><b>" + this.money.transform(amount, 1000) + "</b></div>"+
    "</div>";
    return tooltipline;
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
