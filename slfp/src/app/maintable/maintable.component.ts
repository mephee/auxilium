import { Component, OnInit } from '@angular/core';
import {Inoutcome} from "../data/model/inoutcome";
import {DatastoreService} from "../data/datastore.service";
import {Investment} from "../data/model/investment";
import {InvestmentYear} from "../data/model/investmentYear";
import {AggregationService} from "./aggregation/aggregation.service";
import {InvestmentCategory} from "../data/model/investmentCategory";
import {Balance} from "../data/model/balance";
import {ForeignContainer} from "../data/model/foreignContainer";
import {LiquidityStart} from "../data/model/liquidityStart";

@Component({
  selector: 'app-maintable',
  templateUrl: './maintable.component.html',
  styleUrls: ['./maintable.component.css']
})
export class MaintableComponent implements OnInit {

  selectedInvestment: Investment;
  showInvestment: boolean;

  constructor(private dataStore: DatastoreService, private aggregation: AggregationService) { }

  ngOnInit() {
    this.showInvestment = false;
  }

  getYears(): number[] {
    return this.aggregation.getYears();
  }

  getInoutcomes(): Inoutcome[] {
    return this.dataStore.getInoutcomes();
  }

  getBalanceAfterOutcome(): Balance[] {
    return this.aggregation.getBalanceAfterOutcome();
  }

  getBalanceBeforeWriteoff(): Balance[] {
    return this.aggregation.getBalanceBeforeWriteoff();
  }

  getBalanceAfterWriteoff(): Balance[] {
    return this.aggregation.getBalanceAfterWriteoff();
  }

  getTaxoffsTotal(): number[] {
    return this.aggregation.getTaxoffsTotal();
  }

  getInvestmentsTotal(): number[] {
    return this.aggregation.getInvestmentsTotal();
  }

  getBalanceAfterInvestments(): Balance[] {
    return this.aggregation.getBalanceAfterInvestments();
  }

  getForeignContainer(): ForeignContainer {
    return this.aggregation.getForeignContainer();
  }

  getInvestmentsByRate(rate: number): Investment[] {
    return this.aggregation.getInvestmentsByRate(rate);
  }

  getTaxoffsByCategory(investmentCategory: InvestmentCategory): number[] {
    return this.aggregation.getTaxoffsByCategory(investmentCategory);
  }

  getTaxoffsByYear(investment: Investment): number[] {
    return this.aggregation.getTaxoffsByYear(investment);
  }

  getLiquidityStart(): LiquidityStart {
    return this.dataStore.getLiquidityStart();
  }

  getLiquidityOfLastYear(): number[] {
    return this.aggregation.getLiquidityOfLastYear();
  }


  // Edit
  newInvestment(): void {
    this.selectedInvestment = new Investment();
    this.selectedInvestment.investmentYears = [new InvestmentYear()];
    this.showInvestment = true;

  }

  editInvestment(investment: Investment): void {
    this.selectedInvestment = investment;
    this.showInvestment = true;
  }

  getInvestmentCategories(): InvestmentCategory[] {
    return this.aggregation.getInvestmentCategories();
  }

  onClosed(): void {
    this.showInvestment = false;
  }

  toggleInvestmentCategory(investmentCategory: InvestmentCategory): void {
    investmentCategory.show = !investmentCategory.show;
  }


}
