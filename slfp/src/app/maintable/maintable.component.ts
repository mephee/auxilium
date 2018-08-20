import { Component, OnInit } from '@angular/core';
import {Inoutcome} from "../data/model/inoutcome";
import {DatastoreService} from "../data/datastore.service";
import {Investment} from "../data/model/investment";
import {InvestmentYear} from "../data/model/investmentYear";
import {AggregationService} from "./aggregation/aggregation.service";
import {InvestmentCategory} from "../data/model/investmentCategory";

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

  calc(inoutcome: Inoutcome): number {
    return inoutcome.income - inoutcome.outcome;
  }

  getYears(): number[] {
    return this.aggregation.getYears();
  }

  getInoutcomes(): Inoutcome[] {
    return this.dataStore.getInoutcomes();
  }

  getInvestmentsByRate(rate: number): Investment[] {
    return this.aggregation.getInvestmentsByRate(rate);
  }

  getInvestmentsByYear(investment: Investment): number[] {
    return this.aggregation.getInvestmentsByYear(investment);
  }

  getTaxoffsByYear(investment: Investment): number[] {
    return this.aggregation.getTaxoffsByYear(investment);
  }

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

  toggle(investmentCategory: InvestmentCategory): void {
    investmentCategory.show = !investmentCategory.show;
  }


}
