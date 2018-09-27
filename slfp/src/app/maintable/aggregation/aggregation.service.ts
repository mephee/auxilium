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

@Injectable({
  providedIn: 'root'
})
export class AggregationService {

  // Fx members
  yearFrom: number;
  yearTo: number;
  investmentCategory: InvestmentCategory[];

  // calculated members
  balanceAfterOutcome: Balance[];
  balanceBeforeWriteoff: Balance[];
  balanceAfterWriteoff: Balance[];
  balanceAfterInvestments: Balance[] = [];
  balanceAfterReserves: Balance[] = [];

  constructor(private datastore: DatastoreService,
              private money:MoneyPipe,
              private index:IndexService,
              private investment:InvestmentService) {
    this.load();
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

  getLiquidityOfLastYear(): number[] {
    let liquidity: number[] = [];
    let counter:number = 0;
    for(let i:number = this.yearFrom;i<this.yearTo;i++) {
      liquidity.push(this.balanceAfterInvestments[counter].value);
      counter++;
    }
    return liquidity;
  }

  getBalanceBeforeWriteoff(): Balance[] {
    return this.balanceBeforeWriteoff;
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
  Transient Getters
   */

  // year
  getYears(): number[] {
    let years: number[];
    years = this.datastore.getInoutcomes().map(inoutcome => {
      return inoutcome.year;
    });
    return years;
  }

  // foreign Container
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

  // Investment
  hasInvestmentsByRate(rate: number):boolean {
    return this.datastore.getInvestmentsWithoutIndexed().find((element) => {
      return element.rate == rate;
    }) != undefined;
  }

  getInvestmentsByRate(rate: number): Investment[] {
    let investmnetsByRate: Investment[] = [];
    this.datastore.getInvestmentsWithoutIndexed().forEach(investment => {
      if (investment.rate === rate) {
        investmnetsByRate.push(investment);
      }
    });
    return investmnetsByRate;
  }

  getInvestmentsTotal(): number[] {
    let investments:number[] = new Array(this.yearTo - this.yearFrom + 1).fill(0);
    this.datastore.getInvestments().forEach(investment => {
      investment.investmentYears.forEach(investmentYear => {
          let index = investmentYear.year - this.yearFrom;
          // todo tooltip
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

  // Taxoffs
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
    let investedEff = this.investment.getTotalInvested(investment);
    let taxoffPerYear:number = 0;
    let taxoffStartYear:number = 0;

    // fertig investiert?
    let doTaxoff:boolean = false;
    if (this.investment.isInvestmentComplete(investment)) {
      doTaxoff = true;
      taxoffPerYear = investedEff/(100/investment.rate);
      taxoffStartYear = investment.investmentYears[investment.investmentYears.length-1].year;
    }
    let taxoffTotal:number = 0;
    for(let i:number = this.yearFrom;i<=this.yearTo;i++) {
      if (doTaxoff && (taxoffStartYear <= i) && (taxoffTotal < investedEff)) {
        taxoffs.push(taxoffPerYear);
        taxoffTotal += taxoffPerYear;
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
    let reinvestments:Investment[] = this.datastore.getInvestments().filter(reinvestment=> reinvestment.reinvestParentId === investment.id && reinvestment.reinvestParentId);
    reinvestments.forEach(reinvestment=>{
      let lastTaxoffs = taxoffs;
      taxoffs = this.getTaxoffsByYear(reinvestment);
      for(let i=0;i<lastTaxoffs.length;i++) {
        taxoffs[i] += lastTaxoffs[i];
      }
    });

    return taxoffs;
  }

  getTaxoffsHRM1ByYear() {
    let taxoffs:number[] = [];
    let total:number = this.datastore.getInvestmentHRM1Container().value;
    let taxoffPerYear:number = total/(100/this.datastore.getInvestmentHRM1Container().rate);
    let taxoffTotal:number = 0;
    for(let i:number = 2018;i<=this.yearTo;i++) {
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
  }

  getTaxoffsTotal(): number[] {
    let taxoffs: number[] = new Array(this.yearTo - this.yearFrom + 1);
    let counter:number;
    this.datastore.getInvestmentsWithoutIndexed().forEach(investment => {
      counter = -1;
      this.getTaxoffsByYear(investment).forEach(taxoff => {
        counter++;
        if (taxoffs.length <= counter) {  //taxoffsbyyear can add years -> make shure you check this
          taxoffs.push(0);
        }
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
    counter = -1;
    this.datastore.getAdditionalTaxoffs().forEach(taxoff => {
      counter++;
      if (taxoffs[counter]>0) {
        taxoffs[counter] += taxoff.taxoff;
      } else {
        taxoffs[counter] = taxoff.taxoff;
      }
    });
    return taxoffs;
  }


  // Grants
  getGrants(): GrantGUI[] {
    let grants: GrantGUI[] = new Array(this.yearTo - this.yearFrom + 1);
    for(let i = 0;i<grants.length;i++) {
      grants[i] = new GrantGUI();
      grants[i].year = this.yearFrom + i;
    }
    this.datastore.getInvestments().forEach(investment => {
      let hasGrantYearsFederal:boolean = (investment.grantYearsFederal.length > 0) && (investment.grantYearsFederal[0].grant > 0);
      let hasGrantYearsCanton:boolean = (investment.grantYearsCanton.length > 0) && (investment.grantYearsCanton[0].grant > 0);
      if ((investment.grantCanton > 0) || (investment.grantFederal > 0) || hasGrantYearsFederal || hasGrantYearsCanton) {
        if (this.investment.isInvestmentComplete(investment)) {
          let investedEff = this.investment.getTotalEffective(investment);
          let taxoffStartYear:number = 0;
          taxoffStartYear = investment.investmentYears[investment.investmentYears.length-1].year+1;
          if (hasGrantYearsFederal) {
            investment.grantYearsFederal.forEach(grantYear => {
              grants[grantYear.year - this.yearFrom].grantTotal += grantYear.grant;
              grants[grantYear.year - this.yearFrom].tooltip += this.getGrantTooltipLine(investment, grantYear.grant, 'Bund effektiv');

            });
          } else {
            if (investment.grantFederal > 0) {
              grants[taxoffStartYear - this.yearFrom].grantTotal += investedEff*investment.grantFederal/100;
              grants[taxoffStartYear - this.yearFrom].tooltip += this.getGrantTooltipLine(investment,investedEff*investment.grantFederal/100, 'Bund geplant');
            }
          }
          if (hasGrantYearsCanton) {
            investment.grantYearsCanton.forEach(grantYear => {
              grants[grantYear.year - this.yearFrom].grantTotal += grantYear.grant;
              grants[grantYear.year - this.yearFrom].tooltip += this.getGrantTooltipLine(investment, grantYear.grant, 'Kanton effektiv');

            });
          } else {
            if (investment.grantCanton > 0) {
              grants[taxoffStartYear - this.yearFrom].grantTotal += investedEff*investment.grantCanton/100;
              grants[taxoffStartYear - this.yearFrom].tooltip += this.getGrantTooltipLine(investment,investedEff*investment.grantCanton/100, 'Kanton geplant');
            }
          }
        }
      }
    });
    return grants;
  }

  private getGrantTooltipLine(investment:Investment, grant:number, type:string):string {
    let tooltipline =
    "<div class='row'>" +
      "<div class='col-8'>"+investment.name + " ("+investment.projectNr+") ("+type+")</div>" +
      "<div class='col-4 text-right'><b>" + this.money.transform(grant, 1000) + "</b></div>"+
    "</div>";
    return tooltipline;
  }


  /*
  Calculations
   */
  // Balances
  calculateBalances(): void {
    this.yearFrom = this.datastore.getActualVersion().yearFrom;
    this.yearTo = this.datastore.getActualVersion().yearTo;

    this.balanceAfterOutcome = [];
    this.balanceBeforeWriteoff = [];
    this.balanceAfterWriteoff = [];
    this.balanceAfterInvestments = [];
    this.balanceAfterReserves = [];

    this.index.generateIndexedReinvestments();

    let taxoffs:number[] = this.getTaxoffsTotal();  // passt ggf yearTo an, deshalb zuoberst
    let inoutComes:Inoutcome[] = this.datastore.getInoutcomes();
    let investments:number[] = this.getInvestmentsTotal();
    let foreignContainer: ForeignContainer = this.getForeignContainer();
    let grants:GrantGUI[] = this.getGrants();
    let reserves:Reserve[] = this.datastore.getReserves();
    let counter:number = 0;
    for(let i:number = this.yearFrom;i<=this.yearTo;i++) {

      // After Outcome
      let balance = new Balance();
      balance.year = inoutComes[counter].year;
      balance.type = 'inoutcome';
      balance.value = inoutComes[counter].income + inoutComes[counter].outcome;
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


      // after investment
      balance = new Balance();
      balance.year = i;
      balance.type = 'afterinvestment';
      balance.value = this.balanceAfterWriteoff[counter].value;
      if (investments[counter]<0) {
        balance.value += investments[counter];
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
