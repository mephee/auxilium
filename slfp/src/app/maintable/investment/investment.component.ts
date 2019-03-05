import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {DatastoreService} from "../../data/datastore.service";
import {Category} from "../../data/model/category";
import {Investment} from "../../data/model/investment";
import {InvestmentYear} from "../../data/model/investmentYear";
import {GrantYear} from "../../data/model/grantYear";
import {CommunicationService} from "../../communication/communication.service";
import {MoneyPipe} from "../../utility/money.pipe";
import {InvestmentService} from "./investment.service";
import {IndexService} from "../../index/index.service";
import {CalculatorService} from "../calc/calculator.service";
import {Special} from "../special/model/special";
import {SpecialService} from "../special/special.service";
declare var $:any;

@Component({
  selector: 'app-investment',
  templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.css']
})
export class InvestmentComponent implements OnInit {

  _investment: Investment = new Investment();
  @Input()  open: boolean;
  @Output() closed = new EventEmitter<void>();
  selectedCategory: Category;
  selectedSpecial: Special;

  reinvestments:string[] = [];
  reinvestmentsActive:boolean = false;

  constructor(private dataStore: DatastoreService,
              private communication:CommunicationService,
              private money:MoneyPipe,
              private investmentService:InvestmentService,
              private indexService:IndexService,
              private calculator:CalculatorService,
              private specialService:SpecialService) { }

  ngOnInit() {
    $('#investment').draggable({
      handle: '.modal-header'
    });
  }

  @Input()
  set investment(investment:Investment) {
    this._investment = investment;
    if (investment) {
      this.selectedCategory = this.dataStore.getCategories().find(category => category.id == this._investment.categoryId);
      this.selectedSpecial = this.specialService.getSpecials().find(special => special.id == this._investment.specialId);
    }
    this.calculateReinvestments();
  }

  calcYears(): number {
    if (this.selectedCategory) {
      return 100/this.selectedCategory.rate;
    }
  }

  calcWriteoffPerYear(): number {
    if (this.selectedCategory) {
      if (this._investment.totalCorr) {
        return this._investment.totalCorr/(100/this.selectedCategory.rate);
      } else {
        return this._investment.total/(100/this.selectedCategory.rate);
      }
    }
  }

  calcGrantFederal():number {
    if (this._investment.totalCorr) {
      return this._investment.totalCorr/(100/this._investment.grantFederal);
    } else {
      return this._investment.total/(100/this._investment.grantFederal);
    }
  }

  calcGrantCanton():number {
    if (this._investment.totalCorr) {
      return this._investment.totalCorr/(100/this._investment.grantCanton);
    } else {
      return this._investment.total/(100/this._investment.grantCanton);
    }
  }

  getCoupleOfYears(index: number, grant:string): number[] {
    let years:number[] = [];
    let startIndex:number;
    if (index == 0) {
      if (grant) {
        startIndex = (this._investment.investmentYears.length > 0) ? this._investment.investmentYears[this._investment.investmentYears.length-1].year : 2018;
      } else {
        startIndex = 2018;
      }
    } else {
      if (grant) {
        let grantYears:GrantYear[] = (grant == 'federal') ? this._investment.grantYearsFederal : this._investment.grantYearsCanton;
        startIndex = grantYears[index-1].year+1;
      } else {
        startIndex = this._investment.investmentYears[index-1].year+1;
      }
    }
    for (let i = startIndex;i<startIndex+30;i++) {
      years.push(i);
    }
    return years;
  }

  save(): void {
    this.updateCategory();
    this.updateSpecial();
    this.dataStore.saveInvestment(this._investment);
    this.dataStore.save();
    this.calculator.calculateBalances();
    this.open = false;
    this.closed.emit();
  }

  close(): void {
    this.open = false;
    this.closed.emit();
  }

  delete(): void {
    this.communication.confirm({
      message: "Wollen sie diese Investition wirklich löschen?",
      callback: () => {
        this.dataStore.deleteInvestment(this._investment);
        this.dataStore.save();
        this.calculator.calculateBalances();
        this.open = false;
        this.closed.emit();
      }
    });
  }

  getCategories(): Category[] {
    return this.dataStore.getCategories();
  }

  getSpecials(): Special[] {
    return this.specialService.getSpecials();
  }

  removeInvestmentYear(investmentYear: InvestmentYear): void {
    let index = this._investment.investmentYears.indexOf(investmentYear);
    if (index !== -1) {
      this._investment.investmentYears.splice(index, 1);
    }
  }

  addInvestmentYear(): void {
    let investYear:InvestmentYear = new InvestmentYear();
    if (this._investment.investmentYears.length > 0) {
      investYear.year = this._investment.investmentYears[this._investment.investmentYears.length-1].year+1;
    } else {
      investYear.year = this.dataStore.getActualVersion().yearFrom;
    }
    this._investment.investmentYears.push(investYear);
  }

  removeGrantYear(grantYear: GrantYear, type:string): void {
    let grantYears:GrantYear[] = (type == 'federal') ? this._investment.grantYearsFederal : this._investment.grantYearsCanton;
    let index = grantYears.indexOf(grantYear);
    if (index !== -1) {
      grantYears.splice(index, 1);
    }
  }

  addGrantYear(type:string): void {
    let grantYear:GrantYear = new GrantYear();
    let grantYears:GrantYear[] = (type == 'federal') ? this._investment.grantYearsFederal : this._investment.grantYearsCanton;
    if (grantYears.length > 0) {
      grantYear.year = grantYears[grantYears.length-1].year+1;
    } else {
      grantYear.year = this.dataStore.getActualVersion().yearFrom;
    }
    grantYears.push(grantYear);
  }

  changedProjectNr() {
    if (this.dataStore.getInvestmentsWithoutIndexed().find(investment => (investment.projectNr === this._investment.projectNr) && (investment.id != this._investment.id)) != undefined) {
      this.communication.alert('Eine Investition mit dieser Projekt-Nr. existiert bereits! Die Projekt-Nr. wurde angepasst.');
      this._investment.projectNr += "_1";
    }
  }

  changedInvestValue(event, actualInvestYear:InvestmentYear) {
    let totalPlanned: number = this._investment.totalCorr > 0 ? this._investment.totalCorr : this._investment.total;
    let investTotal:number = this._investment.investmentYears.reduce(function(total, investmentYear) {
      if (actualInvestYear.year != investmentYear.year) {
        total = total + investmentYear.invest;
      }
      return total;
    }, 0);
    if (investTotal + event > totalPlanned) {
      this.communication.alert('Teilzahlungen übersteigen Total Investitionen. Die Teilzahlung wurde automatisch angepasst.');
      setTimeout(()=>{
        actualInvestYear.invest = totalPlanned - investTotal;
      });
    } else {
      actualInvestYear.invest = event;
    }
    this.calculateReinvestments();
  }

  getMoveOptions():string[] {
    let moveoptions:string[] = [];
    for(let i:number = 1;i<11;i++) {
      if (i == 1) {
        moveoptions.push("um 1 Jahr");
      }  else {
        moveoptions.push("um " + i + " Jahre")
      }
    }
    return moveoptions;
  }

  selectMoveOption(index:number):void {
    this._investment.investmentYears.forEach(investmentYear => investmentYear.year += index + 1);
  }

  selectReinvestmentCount(count:number):void {
    this._investment.reinvestCount = count;
    this.calculateReinvestments();
  }

  calculateReinvestments():void {
    this.updateCategory();
    let totalPlanned: number = this.investmentService.getTotalEffective(this._investment);
    this.reinvestments = [];
    this.reinvestmentsActive = false;
    if (this.investmentService.isInvestmentComplete(this._investment)) {
      this.reinvestmentsActive = true;
      let taxoffYears = this.investmentService.getTaxoffYearsCount(this._investment);
      let taxoffStartYear = this._investment.investmentYears[this._investment.investmentYears.length-1].year;
      let investTimeSpan = this.investmentService.getInvestmentTimespan(this._investment);

      let lastInvestmentYear = this.investmentService.getLastInvestmentYear(this._investment);
      let indexToday:number = this.indexService.getIndexForYear(lastInvestmentYear);

      for (let i=1;i<=this._investment.reinvestCount;i++) {
        taxoffStartYear = taxoffStartYear + taxoffYears + investTimeSpan;
        let indexRe:number = this.indexService.getIndexForYear(taxoffStartYear);
        let indexedTotal = ~~((totalPlanned/indexToday)*indexRe);
        this.reinvestments.push(i + '. Reinvestition im Jahr ' + taxoffStartYear + ':   ' + this.money.transform(indexedTotal, 1));
      }
    }
  }

  private updateCategory() {
    if (this.selectedCategory) {
      this._investment.rate = this.selectedCategory.rate;
      this._investment.categoryId = this.selectedCategory.id;
    }
  }

  private updateSpecial() {
    if (this.selectedSpecial) {
      this._investment.specialId = this.selectedSpecial.id;
    }
  }

}
