import {AfterViewChecked, Component, ElementRef, OnInit} from '@angular/core';
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
declare var $:any;

@Component({
  selector: 'app-maintable',
  templateUrl: './maintable.component.html',
  styleUrls: ['./maintable.component.css']
})
export class MaintableComponent implements OnInit, AfterViewChecked {

  selectedInvestment: Investment;
  showInvestment: boolean;

  constructor(private dataStore: DatastoreService, private aggregation: AggregationService, private elementRef: ElementRef) { }

  ngOnInit() {
    this.showInvestment = false;
  }

  ngAfterViewChecked() {
    $('[data-toggle="popover"]').popover();  // TODO Performance Bottleneck
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

  changedTaxVolume(event, inoutcome:Inoutcome) {
    inoutcome.taxvolume = event;
    this.calculateTaxVolume(inoutcome);
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
