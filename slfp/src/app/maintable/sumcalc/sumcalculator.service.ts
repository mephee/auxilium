import { Injectable } from '@angular/core';
import {Balance} from "../../data/model/balance";
import {AggregationService} from "../aggregation/aggregation.service";
import {Inoutcome} from "../../data/model/inoutcome";
import {InvestmentGUI} from "../aggregation/model/investmentGUI";
import {ForeignContainer} from "../../data/model/foreignContainer";
import {GrantGUI} from "../aggregation/model/grantGUI";
import {Reserve} from "../../data/model/reserve";
import {DatastoreService} from "../../data/datastore.service";
import {IndexService} from "../../index/index.service";
import {MemoizerService} from "../../utility/memoizer.service";
import {ColumnGUI} from "./columnGUI";

@Injectable({
  providedIn: 'root'
})
export class SumcalculatorService {

  // calculated balances
  balanceAfterOutcome: Balance[];
  balanceBeforeWriteoff: Balance[];
  balanceAfterWriteoff: Balance[];
  cashFlowAfterWriteoff: Balance[];
  balanceAfterInvestments: Balance[] = [];
  balanceAfterReserves: Balance[] = [];
  dataColumns: ColumnGUI[] = [];

  constructor(private aggregation:AggregationService,
              private datastore:DatastoreService,
              private index:IndexService,
              private memoizer:MemoizerService) { }

  /*
  Static Getters
   */
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

  getDataColumns(): ColumnGUI[] {
    return this.dataColumns;
  }

  /*
  Calculations
  */
  calculateBalances(): void {
    console.log('recalculate balances');

    this.memoizer.reset();

    let yearFrom = this.datastore.getActualVersion().yearFrom;
    let yearTo = this.datastore.getActualVersion().yearTo;

    this.balanceAfterOutcome = [];
    this.balanceBeforeWriteoff = [];
    this.balanceAfterWriteoff = [];
    this.cashFlowAfterWriteoff = [];
    this.balanceAfterInvestments = [];
    this.balanceAfterReserves = [];
    this.dataColumns = [];

    this.index.generateIndexedReinvestments();

    let taxoffs:number[] = this.aggregation.getTaxoffsTotal();  // passt ggf yearTo an, deshalb zuoberst
    let inoutComes:Inoutcome[] = this.datastore.getInoutcomes();
    let investments:InvestmentGUI[] = this.aggregation.getInvestmentsTotal();
    let deinvestments:InvestmentGUI[] = this.aggregation.getDeinvestmentsTotal();
    let foreignContainer: ForeignContainer = this.aggregation.getForeignContainer();
    let grants:GrantGUI[] = this.aggregation.getGrants();
    let reserves:Reserve[] = this.datastore.getReserves();
    let counter:number = 0;
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


      // data Column
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
      dataColumn.reserve = reserves[counter].reserve;
      dataColumn.balanceAfterReserve = this.balanceAfterReserves[counter].value;
      this.dataColumns.push(dataColumn);

      counter++;
    }

    // fill the rest of dataColumns




    this.datastore.enableTooltips();  // wegen Subventionen-Tooltips..
  }


  calculateTaxIncome(inoutcome: Inoutcome): void {
    inoutcome.income = inoutcome.taxvolume/(100/inoutcome.taxrate);
  }

  getLiquidityOfLastYear(): number[] {
    return this.memoizer.mem('liquidity', () => {
      let liquidity = [];
      let counter:number = 0;
      let yearFrom = this.datastore.getActualVersion().yearFrom;
      let yearTo = this.datastore.getActualVersion().yearTo;
      for(let i:number = yearFrom;i<yearTo;i++) {
        liquidity.push(this.balanceAfterInvestments[counter].value);
        counter++;
      }
      return liquidity;
    });
  }
}
