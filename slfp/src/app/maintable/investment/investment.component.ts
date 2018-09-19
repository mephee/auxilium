import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {DatastoreService} from "../../data/datastore.service";
import {Category} from "../../data/model/category";
import {Investment} from "../../data/model/investment";
import {InvestmentYear} from "../../data/model/investmentYear";
import {AggregationService} from "../aggregation/aggregation.service";
import {forEach} from "@angular/router/src/utils/collection";
import {GrantYear} from "../../data/model/grantYear";
import {CommunicationService} from "../../communication/communication.service";
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

  constructor(private dataStore: DatastoreService, private aggregation:AggregationService, private communicatrion:CommunicationService) { }

  ngOnInit() {
    $('#investment').draggable({
      handle: '.modal-header'
    });
  }

  @Input()
  set investment(investment:Investment) {
    this._investment = investment;
    if (investment) {
      this.selectedCategory = this.dataStore.getCategories().find(category => category.rate == this._investment.rate);
    }
  }


  changeCategory(): void {
    this._investment.rate = this.selectedCategory.rate;
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
    this._investment.rate = this.selectedCategory.rate;
    this.dataStore.saveInvestment(this._investment);
    this.dataStore.save();
    this.aggregation.calculateBalances();
    this.open = false;
    this.closed.emit();
  }

  close(): void {
    this.open = false;
    this.closed.emit();
  }



  getCategories(): Category[] {
    return this.dataStore.getCategories();
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
      investYear.year = this.aggregation.yearFrom;
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
      grantYear.year = this.aggregation.yearFrom;
    }
    grantYears.push(grantYear);
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
      this.communicatrion.alert('Teilzahlungen übersteigen Total Investitionen. Die Teilzahlung wurde automatisch angepasst.');
      setTimeout(()=>{
        actualInvestYear.invest = totalPlanned - investTotal;
      });
    } else {
      actualInvestYear.invest = event;
    }
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
}
