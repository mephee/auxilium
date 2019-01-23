import { Injectable } from '@angular/core';
import {DatastoreService} from "../../data/datastore.service";
import {Inoutcome} from "../../data/model/inoutcome";
import {Investment} from "../../data/model/investment";
import {InvestmentCategory} from "../../data/model/investmentCategory";
import {Balance} from "../../data/model/balance";
import {ForeignPayback} from "../../data/model/foreignPayback";
import {ForeignContainer} from "../../data/model/foreignContainer";
import {Reserve} from "../../data/model/reserve";
import {GrantGUI} from "./model/grantGUI";
import {MoneyPipe} from "../money.pipe";
import {IndexService} from "../../index/index.service";
import {InvestmentService} from "../investment/investment.service";
import {InvestmentGUI} from "./model/investmentGUI";


@Injectable({
  providedIn: 'root'
})

export class AggregationService {

  cache:Map<string, any>;

  // Fix members
  yearFrom: number;
  yearTo: number;
  investmentCategory: InvestmentCategory[];

  // calculated balances
  balanceAfterOutcome: Balance[];
  balanceBeforeWriteoff: Balance[];
  balanceAfterWriteoff: Balance[];
  cashFlowAfterWriteoff: Balance[];
  balanceAfterInvestments: Balance[] = [];
  balanceAfterReserves: Balance[] = [];

  // calculated (cashed) transient getters, see checkCache

  constructor(private datastore: DatastoreService,
              private money:MoneyPipe,
              private index:IndexService,
              private investment:InvestmentService) {
    this.load();
    this.cache = new Map<string, any>();
  }


  /*
  Static Getters
   */
  getInvestmentCategories(): InvestmentCategory[] {
    return this.investmentCategory;
  }

  getBalanceAfterOutcome(): Balance[] {
    return this.balanceAfterOutcome;
  }

  getBalanceBeforeWriteoff(): Balance[] {
    return this.balanceBeforeWriteoff;
  }

  getCashflowAfterWriteoff(): Balance[] {
    return this.cashFlowAfterWriteoff;
  }

  getBalanceAfterWriteoff(): Balance[] {
    return this.balanceAfterWriteoff;
  }

  getBalanceAfterInvestments(): Balance[] {
    return this.balanceAfterInvestments;
  }

  getBalanceAfterReserves(): Balance[] {
    return this.balanceAfterReserves;
  }

  /*
  Memorizer for caching heavy function results
   */
  memoize(type:string, callback:() => any):any {
    if (this.cache.has(type)) {
      return this.cache.get(type);
    } else {
      return this.cache.set(type, callback()).get(type);
    }
  }

  /*
  Transient Getters
   */

  // year
  getYears(): number[] {
    return this.memoize('years', () => {
    console.log('calc years');
    let years: number[];
    years = this.datastore.getInoutcomes().map(inoutcome => {
      return inoutcome.year;
    });
    return years;
    });
  }

  getLiquidityOfLastYear(): number[] {
    return this.memoize('liquidity', () => {
    console.log('calc Liquidity');
    let liquidity = [];
    let counter:number = 0;
    for(let i:number = this.yearFrom;i<this.yearTo;i++) {
      liquidity.push(this.balanceAfterInvestments[counter].value);
      counter++;
    }
    return liquidity;
    });
  }

  // foreign Container
  getForeignContainer(): ForeignContainer {
    return this.memoize('foreign', () => {
      for (let i: number = this.yearFrom; i <= this.yearTo; i++) {
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
    return this.memoize('hasInvestmentsByRate'+rate, () => {
      return this.datastore.getInvestmentsWithoutIndexed().find((element) => {
        return element.rate == rate;
      }) != undefined;
    });
  }

  getInvestmentsByRate(rate: number): Investment[] {
    return this.memoize('getInvestmentsByRate'+rate, () => {
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
    return this.memoize('investmentTotal', () => {
      let investments: InvestmentGUI[] = new Array(this.yearTo - this.yearFrom + 1);
      for (let i = 0; i < investments.length; i++) {
        investments[i] = new InvestmentGUI();
        investments[i].year = this.yearFrom + i;
      }
      this.datastore.getInvestments().forEach(investment => {
        investment.investmentYears.forEach(investmentYear => {
            let index = investmentYear.year - this.yearFrom;
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
    return this.memoize('deinvestmentTot', () => {
      let deinvestments: InvestmentGUI[] = new Array(this.yearTo - this.yearFrom + 1);
      for (let i = 0; i < deinvestments.length; i++) {
        deinvestments[i] = new InvestmentGUI();
        deinvestments[i].year = this.yearFrom + i;
      }
      this.datastore.getInvestments().forEach(investment => {
        if (this.investment.isInvestmentComplete(investment)) {
          let taxoffYears = this.investment.getTaxoffYearsCount(investment);
          let taxoffStartYear = investment.investmentYears[investment.investmentYears.length - 1].year;
          let index = taxoffStartYear + taxoffYears - this.yearFrom;
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
    return this.memoize('taxoffsByCategory'+investmentCategory.rate, () => {
      let taxoffs: number[] = new Array(this.yearTo - this.yearFrom + 1);
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
    return this.memoize('taxoffsByYear'+investment.id, () => {
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
      for (let i: number = this.yearFrom; i <= this.yearTo; i++) {
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
          this.yearTo++;
        }
        this.datastore.updateVersionYearFromTo(this.yearFrom, this.yearTo);
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
    return this.memoize('taxoffhrm1Year', () => {
      let taxoffs: number[] = [];
      let total: number = this.datastore.getInvestmentHRM1Container().value;
      let rate: number = Math.ceil(this.datastore.getInvestmentHRM1Container().rate * 100) / 100;  // Aufrunden nötig, sonst wird bei ungerader Menge Jahren ein Jahr zu viel abgeschrieben
      let taxoffPerYear: number = total / (100 / rate);
      let taxoffTotal: number = 0;
      for (let i: number = 2018; i <= this.yearTo; i++) {
        if (taxoffTotal < total) {
          if (i >= this.yearFrom) {
            taxoffs.push(taxoffPerYear);
          }
          taxoffTotal += taxoffPerYear;
        } else {
          if (i >= this.yearFrom) {
            taxoffs.push(0);
          }
        }
      }
      return taxoffs;
    });
  }

  getTaxoffsTotal(): number[] {
    return this.memoize('taxoffsTotal', () => {
      let taxoffs: number[] = new Array(this.yearTo - this.yearFrom + 1);
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
    return this.memoize('grants', () => {
      let grants: GrantGUI[] = new Array(this.yearTo - this.yearFrom + 1);
      for (let i = 0; i < grants.length; i++) {
        grants[i] = new GrantGUI();
        grants[i].year = this.yearFrom + i;
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
                grants[grantYear.year - this.yearFrom].grantTotal += grantYear.grant;
                grants[grantYear.year - this.yearFrom].tooltip += this.getTooltipLine(investment, grantYear.grant, 'Bund effektiv');

              });
            } else {
              if (investment.grantFederal > 0) {
                grants[taxoffStartYear - this.yearFrom].grantTotal += investedEff * investment.grantFederal / 100;
                grants[taxoffStartYear - this.yearFrom].tooltip += this.getTooltipLine(investment, investedEff * investment.grantFederal / 100, 'Bund geplant');
              }
            }
            if (hasGrantYearsCanton) {
              investment.grantYearsCanton.forEach(grantYear => {
                grants[grantYear.year - this.yearFrom].grantTotal += grantYear.grant;
                grants[grantYear.year - this.yearFrom].tooltip += this.getTooltipLine(investment, grantYear.grant, 'Kanton effektiv');

              });
            } else {
              if (investment.grantCanton > 0) {
                grants[taxoffStartYear - this.yearFrom].grantTotal += investedEff * investment.grantCanton / 100;
                grants[taxoffStartYear - this.yearFrom].tooltip += this.getTooltipLine(investment, investedEff * investment.grantCanton / 100, 'Kanton geplant');
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


  /*
  Calculations
   */
  // Balances
  calculateBalances(): void {
    console.log('recalculate balances');

    this.cache.clear();

    this.yearFrom = this.datastore.getActualVersion().yearFrom;
    this.yearTo = this.datastore.getActualVersion().yearTo;

    this.balanceAfterOutcome = [];
    this.balanceBeforeWriteoff = [];
    this.balanceAfterWriteoff = [];
    this.cashFlowAfterWriteoff = [];
    this.balanceAfterInvestments = [];
    this.balanceAfterReserves = [];

    this.index.generateIndexedReinvestments();

    let taxoffs:number[] = this.getTaxoffsTotal();  // passt ggf yearTo an, deshalb zuoberst
    let inoutComes:Inoutcome[] = this.datastore.getInoutcomes();
    let investments:InvestmentGUI[] = this.getInvestmentsTotal();
    let deinvestments:InvestmentGUI[] = this.getDeinvestmentsTotal();
    let foreignContainer: ForeignContainer = this.getForeignContainer();
    let grants:GrantGUI[] = this.getGrants();
    let reserves:Reserve[] = this.datastore.getReserves();
    let counter:number = 0;
    for(let i:number = this.yearFrom;i<=this.yearTo;i++) {

      // After Outcome
      let balance = new Balance();
      balance.year = inoutComes[counter].year;
      balance.type = 'inoutcome';
      balance.value = inoutComes[counter].income + inoutComes[counter].additionalIncome + inoutComes[counter].outcome + inoutComes[counter].additionalOutcome;
      this.balanceAfterOutcome.push(balance);

      // before writeoff
      balance = new Balance();
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

      // cashflow writeoff
      balance = new Balance();
      balance.year = i;
      balance.type = 'cashflow';
      balance.value = this.balanceAfterOutcome[counter].value + taxoffs[counter] + deinvestments[counter].investmentTotal;
      this.cashFlowAfterWriteoff.push(balance);


      // after investment
      balance = new Balance();
      balance.year = i;
      balance.type = 'afterinvestment';
      balance.value = this.balanceAfterWriteoff[counter].value;
      if (investments[counter].investmentTotal<0) {
        balance.value += investments[counter].investmentTotal;
      }
      balance.value += grants[counter].grantTotal;
      this.balanceAfterInvestments.push(balance);


      // after Reserve
      balance = new Balance();
      balance.year = i;
      balance.type = 'afterreserve';
      balance.value = this.balanceAfterInvestments[counter].value + reserves[counter].reserve;
      this.balanceAfterReserves.push(balance);

      counter++;
    }
    this.datastore.enableTooltips();  // wegen Subventionen-Tooltips..
  }


  // Taxincome
  calculateTaxIncome(inoutcome: Inoutcome): void {
    inoutcome.income = inoutcome.taxvolume/(100/inoutcome.taxrate);
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
