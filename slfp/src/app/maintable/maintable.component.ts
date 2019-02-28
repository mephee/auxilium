import {Component, ElementRef, OnInit} from '@angular/core';
import {Inoutcome} from "../data/model/inoutcome";
import {DatastoreService} from "../data/datastore.service";
import {Investment} from "../data/model/investment";
import {AggregationService} from "./aggregation/aggregation.service";
import {InvestmentCategory} from "../data/model/investmentCategory";
import {ForeignPayback} from "../data/model/foreignPayback";
import {CommunicationService} from "../communication/communication.service";
import {Confirm} from "../communication/model/confirm";
import {SumcalculatorService} from "./sumcalc/sumcalculator.service";
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
  confirm:Confirm = {message:"",callback:null};
  actualDynTooltip:string;
  actualDynTooltipYear:string;

  constructor(public dataStore: DatastoreService,
              public aggregation: AggregationService,
              public sumcalculator: SumcalculatorService,
              private elementRef: ElementRef,
              private communication:CommunicationService) { }

  ngOnInit() {
    this.showInvestment = false;

    this.communication.alert$.subscribe(
      value => {
        this.showAlert(value);
      }
    );

    this.communication.confirm$.subscribe(
      value => {
        this.showConfirm(value);
      }
    );

  }

  tracker(index:number, item:any):number {
    return index;
  }


  /*
  Edits
   */
  changedTaxrate(event, inoutcome:Inoutcome) {
    inoutcome.taxrate = event;
    this.sumcalculator.calculateTaxIncome(inoutcome);
    this.copyTaxrate(inoutcome.year);
    this.dataStore.save();
  }

  changedTaxVolume(event, inoutcome:Inoutcome) {
    inoutcome.taxvolume = event;
    this.sumcalculator.calculateTaxIncome(inoutcome);
    this.copyTaxvolume(inoutcome.year);
    this.dataStore.save();
  }

  changedIncome(event, inoutcome:Inoutcome) {
    inoutcome.income = event;
    this.copyIncome(inoutcome.year);
    this.dataStore.save();
  }

  changedAddIncome(event, inoutcome:Inoutcome) {
    inoutcome.additionalIncome = event;
    this.copyAddIncome(inoutcome.year);
    this.dataStore.save();
  }

  changedAddOutcome(event, inoutcome:Inoutcome) {
    if (event>0) {
      event = -1*event;
    }
    inoutcome.additionalOutcome = event;
    this.copyAddOutcome(inoutcome.year);
    this.dataStore.save();
  }

  changedHRM1Years(event) {
    this.dataStore.getInvestmentHRM1Container().yearCount = event;
    this.dataStore.getInvestmentHRM1Container().rate = 100/event;
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
        this.sumcalculator.calculateTaxIncome(inoutcomes[i]);
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
        this.sumcalculator.calculateTaxIncome(inoutcomes[i]);
      }
    }
  }

  copyIncome(year:number): void {
    let inoutcomes:Inoutcome[] = this.dataStore.getInoutcomes();
    let incomeToCopy:number;
    for (let i = 0;i<inoutcomes.length;i++){
      if (inoutcomes[i].year == year) {
        incomeToCopy = inoutcomes[i].income;
      }
      if (inoutcomes[i].year>year) {
        inoutcomes[i].income = incomeToCopy;
      }
    }
  }

  copyAddIncome(year:number): void {
    let inoutcomes:Inoutcome[] = this.dataStore.getInoutcomes();
    let incomeToCopy:number;
    for (let i = 0;i<inoutcomes.length;i++){
      if (inoutcomes[i].year == year) {
        incomeToCopy = inoutcomes[i].additionalIncome;
      }
      if (inoutcomes[i].year>year) {
        inoutcomes[i].additionalIncome = incomeToCopy;
      }
    }
  }

  copyAddOutcome(year:number): void {
    let inoutcomes:Inoutcome[] = this.dataStore.getInoutcomes();
    let outcomeToCopy:number;
    for (let i = 0;i<inoutcomes.length;i++){
      if (inoutcomes[i].year == year) {
        outcomeToCopy = inoutcomes[i].additionalOutcome;
      }
      if (inoutcomes[i].year>year) {
        inoutcomes[i].additionalOutcome = outcomeToCopy;
      }
    }
  }

  changedOutcome(event, inoutcome:Inoutcome): void {
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

  editPayback(event, payback:ForeignPayback): void {
    let saldo:number = 0;
    for (let i = this.dataStore.getActualVersion().yearFrom;i<payback.year;i++) {
      saldo+=this.aggregation.getForeignContainer().foreignPayback[i-this.dataStore.getActualVersion().yearFrom].payback;
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

  toggleInvestmentCategory(investmentCategory: InvestmentCategory): void {
    investmentCategory.show = !investmentCategory.show;
  }



  /*
  Getter
   */
  getForeignOK():string {
    let foreignTot = this.aggregation.getForeignContainer().foreignPayback.reduce((total, foreign) => total + foreign.payback, 0);
    if (foreignTot + this.aggregation.getForeignContainer().foreignValue != 0) {
      return 'Fremdkapital prüfen!';
    } else {
      return '';
    }
  }


  /*
  Investmentdetail
   */
  newInvestment(): void {
    this.hideDynTooltip();
    this.selectedInvestment = new Investment();
    this.showInvestment = true;

  }

  editInvestment(investment: Investment): void {
    this.hideDynTooltip();
    this.selectedInvestment = investment;
    this.showInvestment = true;
  }

  onClosed(): void {
    this.showInvestment = false;
  }


  /*
  Dynamic Tooltip
   */
  mouseEnterTT(event, tooltip:string, year:string) {
    this.actualDynTooltip = tooltip;
    this.actualDynTooltipYear = year;
    if (this.actualDynTooltip != '') {
      let left = $(event.target).offset().left;
      let top = $(event.target).offset().top;
      let dyntooltip = $('.dyntooltip');
      dyntooltip.show();
      setTimeout(()=>{
        let actualHeight = dyntooltip.height();
        dyntooltip.css('left', (left-300)+'px');
        dyntooltip.css('top', (top-actualHeight-5)+'px');
      },20);
    } else {
      this.hideDynTooltip();
    }
  }

  mouseLeaveTT() {
    this.hideDynTooltip();
    this.actualDynTooltip = "";
  }

  hideDynTooltip() {
    $('.dyntooltip').hide();
  }


  /*
  Alert
   */
  // This is somewhat ugly -> Alerts can be used through communicationservice fronm other components
  showAlert(text:string):void {
    this.alertText = text;
    $('.customalert').show();
  }

  closeAlert():void {
    $('.customalert').hide();
  }

  showConfirm(confirm:Confirm):void {
    this.confirm = confirm;
    $('.customconfirm').show();
  }

  cancelConfirm():void {
    $('.customconfirm').hide();
  }

  acceptConfirm(): void {
    this.cancelConfirm();
    if (this.confirm.callback) {
      this.confirm.callback();
    }
  }

}
