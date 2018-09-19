import {Component, ElementRef, OnInit} from '@angular/core';
import {Inoutcome} from "../data/model/inoutcome";
import {DatastoreService} from "../data/datastore.service";
import {Investment} from "../data/model/investment";
import {AggregationService} from "./aggregation/aggregation.service";
import {InvestmentCategory} from "../data/model/investmentCategory";
import {Balance} from "../data/model/balance";
import {ForeignContainer} from "../data/model/foreignContainer";
import {LiquidityStart} from "../data/model/liquidityStart";
import {InvestmentHRM1Container} from "../data/model/investmentHRM1Container";
import {ForeignPayback} from "../data/model/foreignPayback";
import {AdditionalTaxoff} from "../data/model/additionalTaxoff";
import {Reserve} from "../data/model/reserve";
import {CommunicationService} from "../communication/communication.service";
import {GrantGUI} from "./aggregation/model/grantGUI";
declare var $:any;

@Component({
  selector: 'app-maintable',
  templateUrl: './maintable.component.html',
  styleUrls: ['./maintable.component.css']
})
export class MaintableComponent implements OnInit {

  selectedInvestment: Investment = new Investment();
  showInvestment: boolean;
  alertText:string;
  actualGrantTooltip:string;
  actualGrantYear:string;

  constructor(private dataStore: DatastoreService, private aggregation: AggregationService, private elementRef: ElementRef, private communication:CommunicationService) { }

  ngOnInit() {
    this.showInvestment = false;

    this.communication.alert$.subscribe(
      value => {
        this.showAlert(value);
      }
    );

  }

  getStartYear() {
    return this.aggregation.yearFrom;
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
    this.dataStore.save();
  }

  changedTaxVolume(event, inoutcome:Inoutcome) {
    inoutcome.taxvolume = event;
    this.calculateTaxVolume(inoutcome);
    this.copyTaxvolume(inoutcome.year);
    this.dataStore.save();
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
    let saldo:number = 0;
    for (let i = this.aggregation.yearFrom;i<payback.year;i++) {
      saldo+=this.aggregation.getForeignContainer().foreignPayback[i-this.aggregation.yearFrom].payback;
    }
    if ((saldo + event + this.dataStore.getForeignContainer().foreignValue) < 0) {
      this.showAlert('Rückzahlungen übesteigen das Total Fremdkapital. Die Rückzahlung wurde automatisch angepasst.');
      setTimeout(()=>{
        payback.payback = -(saldo + this.dataStore.getForeignContainer().foreignValue);
      });
    } else {
      payback.payback = event;
    }
    this.dataStore.save();
  }

  editOutcome(event, inoutcome:Inoutcome): void {
    if (event>0) {
      event = -1*event;
    }
    inoutcome.outcome = event;
    this.copyOutcome(inoutcome.year);
    this.dataStore.save();
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

  getBalanceAfterReserves(): Balance[] {
    return this.aggregation.getBalanceAfterReserves();
  }

  getForeignContainer(): ForeignContainer {
    return this.aggregation.getForeignContainer();
  }

  getForeignOK():string {
    let foreignTot = this.aggregation.getForeignContainer().foreignPayback.reduce((total, foreign) => total + foreign.payback, 0);
    if (foreignTot + this.aggregation.getForeignContainer().foreignValue != 0) {
      return 'Fremdkapital prüfen!';
    } else {
      return '';
    }
  }

  hasInvestmentsForRate(rate:number):boolean {
    return this.aggregation.hasInvestmentsByRate(rate);
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

  isVersionInitialized(): boolean {
    return this.dataStore.isVersionInitialized();
  }

  getInvestmentHRM1Container(): InvestmentHRM1Container {
    return this.dataStore.getInvestmentHRM1Container();
  }

  getTaxoffsHRM1ByYear(): number[] {
    return this.aggregation.getTaxoffsHRM1ByYear();
  }

  getGrants(): GrantGUI[] {
    return this.aggregation.getGrants();
  }

  getAdditionalTaxoffs(): AdditionalTaxoff[] {
    return this.dataStore.getAdditionalTaxoffs();
  }

  getReserves(): Reserve[] {
    return this.dataStore.getReserves();
  }


  // Edit
  newInvestment(): void {
    this.hideGrantPopup();
    this.selectedInvestment = new Investment();
    this.showInvestment = true;

  }

  editInvestment(investment: Investment): void {
    this.hideGrantPopup();
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

  mouseEnter(event, grant:GrantGUI) {
    this.actualGrantTooltip = grant.tooltip;
    this.actualGrantYear = grant.year + '';
    if (this.actualGrantTooltip != '') {
      let left = $(event.target).offset().left;
      let top = $(event.target).offset().top;
      let grantPopover = $('.grantpopover');
      grantPopover.show();
      setTimeout(()=>{
        let actualHeight = grantPopover.height();
        grantPopover.css('left', left+'px');
        grantPopover.css('top', (top-actualHeight-5)+'px');
      },20);
    } else {
      this.hideGrantPopup();
    }
  }

  mouseLeave(grant:GrantGUI) {
    this.hideGrantPopup();
    this.actualGrantTooltip = "";
  }

  hideGrantPopup() {
    $('.grantpopover').hide();
  }


  // This is somewhat ugly -> Alerts can be used through communicationservice fronm other components
  showAlert(text:string):void {
    this.alertText = text;
    $('.floatalert').show();
  }

  closeAlert():void {
    $('.floatalert').hide();
  }


}
