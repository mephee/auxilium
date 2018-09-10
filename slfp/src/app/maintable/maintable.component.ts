import {Component, ElementRef, OnInit} from '@angular/core';
import {Inoutcome} from "../data/model/inoutcome";
import {DatastoreService} from "../data/datastore.service";
import {Investment} from "../data/model/investment";
import {InvestmentYear} from "../data/model/investmentYear";
import {AggregationService} from "./aggregation/aggregation.service";
import {InvestmentCategory} from "../data/model/investmentCategory";
import {Balance} from "../data/model/balance";
import {ForeignContainer} from "../data/model/foreignContainer";
import {LiquidityStart} from "../data/model/liquidityStart";
import {InvestmentHRM1Container} from "../data/model/investmentHRM1Container";
import {ForeignPayback} from "../data/model/foreignPayback";
declare var $:any;

@Component({
  selector: 'app-maintable',
  templateUrl: './maintable.component.html',
  styleUrls: ['./maintable.component.css']
})
export class MaintableComponent implements OnInit {

  selectedInvestment: Investment;
  showInvestment: boolean;

  constructor(private dataStore: DatastoreService, private aggregation: AggregationService, private elementRef: ElementRef) { }

  ngOnInit() {
    this.showInvestment = false;
    setTimeout(() => {
      $('[data-toggle="popover"]').popover();
    }, 2000);
  }

  getYears(): number[] {
    return this.aggregation.getYears();
  }

  getInoutcomes(): Inoutcome[] {
    return this.dataStore.getInoutcomes();
  }

  calculateTaxVolume(inoutcome: Inoutcome): void {
    this.aggregation.calculateTaxIncome(inoutcome);
  }

  changedTaxrate(event, inoutcome:Inoutcome) {
    inoutcome.taxrate = event;
    this.calculateTaxVolume(inoutcome);
    this.copyTaxrate(inoutcome.year);
  }

  changedTaxVolume(event, inoutcome:Inoutcome) {
    inoutcome.taxvolume = event;
    this.calculateTaxVolume(inoutcome);
    this.copyTaxvolume(inoutcome.year);
  }

  copyTaxvolume(year:number): void {
    let inoutcomes:Inoutcome[] = this.dataStore.getInoutcomes();
    let taxvolumeToCopy:number;
    for (let i = 0;i<inoutcomes.length;i++){
      if (inoutcomes[i].year == year) {
        taxvolumeToCopy = inoutcomes[i].taxvolume;
      }
      if (inoutcomes[i].year>year) {
        inoutcomes[i].taxvolume = taxvolumeToCopy;
        this.calculateTaxVolume(inoutcomes[i]);
      }
    }
  }

  copyTaxrate(year:number): void {
    let inoutcomes:Inoutcome[] = this.dataStore.getInoutcomes();
    let taxrateToCopy:number;
    for (let i = 0;i<inoutcomes.length;i++){
      if (inoutcomes[i].year == year) {
        taxrateToCopy = inoutcomes[i].taxrate;
      }
      if (inoutcomes[i].year>year) {
        inoutcomes[i].taxrate = taxrateToCopy;
        this.calculateTaxVolume(inoutcomes[i]);
      }
    }
  }

  editPayback(event, payback:ForeignPayback): void {
    let paybackTotal:number = this.aggregation.getForeignContainer().foreignPayback.reduce((total, foreignPaypack) => total + foreignPaypack.payback, 0);
    if (paybackTotal + event > this.dataStore.getForeignContainer().foreignValue) {
      // TODO alert
      payback.payback = this.dataStore.getForeignContainer().foreignValue - paybackTotal;
    } else {
      payback.payback = event;
    }
  }

  editOutcome(event, inoutcome:Inoutcome): void {
    if (event>0) {
      event = -1*event;
    }
    inoutcome.outcome = event;
    this.copyOutcome(inoutcome.year);
  }

  copyOutcome(year:number): void {
    let inoutcomes:Inoutcome[] = this.dataStore.getInoutcomes();
    let outcomeToCopy:number;
    for (let i = 0;i<inoutcomes.length;i++){
      if (inoutcomes[i].year == year) {
        outcomeToCopy = inoutcomes[i].outcome;
      }
      if (inoutcomes[i].year>year) {
        inoutcomes[i].outcome = outcomeToCopy;
      }
    }
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

  hasActualVersion(): boolean {
    return this.dataStore.getActualVersion() != null;
  }

  getInvestmentHRM1Container(): InvestmentHRM1Container {
    return this.dataStore.getInvestmentHRM1Container();
  }

  getTaxoffsHRM1ByYear(): number[] {
    return this.aggregation.getTaxoffsHRM1ByYear();
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
