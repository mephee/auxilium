import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {DatastoreService} from "../../data/datastore.service";
import {Category} from "../../data/model/category";
import {Investment} from "../../data/model/investment";
import {InvestmentYear} from "../../data/model/investmentYear";
import {AggregationService} from "../aggregation/aggregation.service";
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

  constructor(private dataStore: DatastoreService, private aggregation:AggregationService) { }

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

  getCoupleOfYears(index: number): number[] {
    let years:number[] = [];
    let startIndex:number;
    if (index == 0) {
      startIndex = 2018;
    } else {
      startIndex = this._investment.investmentYears[index-1].year+1;
    }
    for (let i = startIndex;i<startIndex+10;i++) {
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
    this._investment.investmentYears.push(new InvestmentYear());
  }

}
