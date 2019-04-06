import { Injectable } from '@angular/core';
import {Balance} from "../../data/model/balance";
import {InvestmentCategories} from "../investmentcategories/investment-categories.service";
import {Inoutcome} from "../../data/model/inoutcome";
import {InvestmentGUI} from "./model/investmentGUI";
import {ForeignContainer} from "../../data/model/foreignContainer";
import {GrantGUI} from "./model/grantGUI";
import {Reserve} from "../../data/model/reserve";
import {DatastoreService} from "../../data/datastore.service";
import {IndexService} from "../../index/index.service";
import {MemoizerService} from "../../utility/memoizer.service";
import {ColumnGUI} from "./model/columnGUI";
import {TaxoffForRateGUI} from "./model/taxoffsForRateGUI";
import {InvestmentCategory} from "../investmentcategories/model/investmentCategory";
import {ForeignPayback} from "../../data/model/foreignPayback";
import {Investment} from "../../data/model/investment";
import {InvestmentService} from "../investment/investment.service";
import {MoneyPipe} from "../../utility/money.pipe";

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {

  // calculated balances
  balanceAfterOutcome: Balance[];
  balanceBeforeWriteoff: Balance[];
  balanceAfterWriteoff: Balance[];
  cashFlowAfterWriteoff: Balance[];
  balanceAfterInvestments: Balance[] = [];
  balanceAfterReserves: Balance[] = [];
  private dataColumns: ColumnGUI[] = [];

  constructor(private investmentCategories:InvestmentCategories,
              private datastore:DatastoreService,
              private index:IndexService,
              private investment:InvestmentService,
              private money:MoneyPipe,
              private memoizer:MemoizerService) { }

  getDataColumns(): ColumnGUI[] {
    return this.dataColumns;
  }

  /*
  Calculations
  This method calculates all balances column by column and fills a special GUI-Model called "columnGUI" at the same time
  -> The GUI is rendered Column-wise so that horizontal infinite scrolling can be implemented
  -> Filling this columnGUI is tricky because we have to layout row-wise Data ibn a column-wise manner -> see code below
  */
  calculateBalances(): void {
    console.log('recalculate balances');
    console.time('balances');

    this.memoizer.reset();

    this.balanceAfterOutcome = [];
    this.balanceBeforeWriteoff = [];
    this.balanceAfterWriteoff = [];
    this.cashFlowAfterWriteoff = [];
    this.balanceAfterInvestments = [];
    this.balanceAfterReserves = [];
    this.dataColumns = [];
    this.index.generateIndexedReinvestments();

    let taxoffs:number[] = this.getTaxoffsTotal();  // passt ggf yearTo an, deshalb zuoberst
    let inoutComes:Inoutcome[] = this.datastore.getInoutcomes();
    let investments:InvestmentGUI[] = this.getInvestmentsTotal();
    let deinvestments:InvestmentGUI[] = this.getDeinvestmentsTotal();
    let foreignContainer: ForeignContainer = this.getForeignContainer();
    let grants:GrantGUI[] = this.getGrants();
    let reserves:Reserve[] = this.datastore.getReserves();
    let counter:number = 0;

    let yearFrom = this.datastore.getActualVersion().yearFrom;
    let yearTo = this.datastore.getActualVersion().yearTo;

    // calc sums per year
    for(let i:number = yearFrom;i<=yearTo;i++) {

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


      // data Column for column-wise GUI (allows horizontal virtual scroll)
      let dataColumn = new ColumnGUI();
      dataColumn.year = i;
      dataColumn.inoutcome = inoutComes[counter];
      dataColumn.balanceAfterOutcome = this.balanceAfterOutcome[counter].value;
      dataColumn.foreignPayback = foreignContainer.foreignPayback[counter];
      dataColumn.balanceBeforeWriteoff = this.balanceBeforeWriteoff[counter].value;
      dataColumn.taxoffTotal = taxoffs[counter];
      dataColumn.deinvestment = deinvestments[counter];
      dataColumn.cashflow = this.cashFlowAfterWriteoff[counter].value;
      dataColumn.investment = investments[counter];
      dataColumn.grant = grants[counter];
      dataColumn.balanceAfterInvestment = this.balanceAfterInvestments[counter].value;
      if (counter == 0) {
        dataColumn.liquidityOfLastYear = this.datastore.getLiquidityStart().liquidity;
      } else {
        dataColumn.liquidityOfLastYear = this.balanceAfterInvestments[counter-1].value;
      }
      dataColumn.reserve = reserves[counter].reserve;
      dataColumn.balanceAfterReserve = this.balanceAfterReserves[counter].value;
      this.dataColumns.push(dataColumn);

      counter++;
    }

    /*
    fill the rest of dataColumn -> this is where things get tricky because we have to layout row-wise data into column-wise objects
    */
    let investmentCategories:InvestmentCategory[] = this.investmentCategories.getInvestmentCategories();
    let categoryTotal = investmentCategories.length;

    // generate container for each category in each column
    this.dataColumns.forEach((dataColumn) => {
      for (let i=0;i<categoryTotal;i++) {
        dataColumn.taxoffForRate.push(new TaxoffForRateGUI());
      }
    });

    // loop über alle kategorien
    let categoryCount = -1;
    investmentCategories.forEach((investmentCategory) => {
      investmentCategory.investments = [];
      categoryCount++;
      let investmentCount = -1;
      // pro kategorie alle investments
      this.getInvestmentsByRate(investmentCategory.rate).forEach((investment) => {
        investmentCategory.investments.push(investment);
        investmentCount++;
        let yearCount = -1;
        // pro investment alle jahre (taxoffs)
        this.getTaxoffsByYear(investment).forEach(taxoff => {
          yearCount++;
          if (this.dataColumns.length > yearCount) {
            this.dataColumns[yearCount].taxoffForRate[categoryCount].taxoffs.push(taxoff);
          } else {
            console.log('something went wrong!: ' + yearCount + ', ' + investment.name);
          }
        });
      });
    });

    // total taxoff pro kategorie rechnen
    this.dataColumns.forEach((dataColumn) => {
      dataColumn.taxoffForRate.forEach((taxoffForRate) => {
        taxoffForRate.taxoffTotal = taxoffForRate.taxoffs.reduce((previous, current) => previous+current, 0);
      });
    });

    this.datastore.enableTooltips();  // wegen Subventionen-Tooltips..
    console.timeEnd('balances');
  }


  /*
  Helper
   */
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

  // Investments
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
            if (investments.length > index) {
              investments[index].investmentTotal += -investmentYear.invest;
              investments[index].tooltip += this.getTooltipLine(investment, investmentYear.invest, '');
            } else {
              console.log('no good, no index for investment at ' + index + ' for investment: ' + investment.name);
            }
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
          if (deinvestments.length > index) {
            deinvestments[index].investmentTotal += investment.deinvestment;
            deinvestments[index].tooltip += this.getTooltipLine(investment, investment.deinvestment, '');
          } else {
            console.log('deinvestment would overflow x-axis: ' + index + ' for investment: ' + investment.name);
          }
        }
      });
      return deinvestments;
    });
  }

  // Taxoffs
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
        console.log('update year to: ' + this.datastore.getActualVersion().yearTo);
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
}
