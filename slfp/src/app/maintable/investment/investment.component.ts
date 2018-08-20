import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {DatastoreService} from "../../data/datastore.service";
import {Category} from "../../data/model/category";
import {Investment} from "../../data/model/investment";
import {InvestmentYear} from "../../data/model/investmentYear";

@Component({
  selector: 'app-investment',
  templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.css']
})
export class InvestmentComponent implements OnInit {

  @Input() investment: Investment;
  @Input()  open: boolean;
  @Output() closed = new EventEmitter<void>();
  selectedCategory: Category;

  constructor(private dataStore: DatastoreService) { }

  ngOnInit() {
  }

  changeCategory(): void {
    this.investment.rate = this.selectedCategory.rate;
  }

  calcYears(): number {
    if (this.selectedCategory) {
      return 100/this.selectedCategory.rate;
    }
  }

  calcWriteoffPerYear(): number {
    if (this.selectedCategory) {
      if (this.investment.totalCorr) {
        return this.investment.totalCorr/(100/this.selectedCategory.rate);
      } else {
        return this.investment.total/(100/this.selectedCategory.rate);
      }
    }
  }

  getCoupleOfYears(): number[] {
    return [
      2010,
      2011,
      2012,
      2013,
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
      2021,
      2022,
      2023,
      2024,
      2025
    ]
  }

  save(): void {
    this.investment.rate = this.selectedCategory.rate;
    this.dataStore.saveInvestment(this.investment);
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
    let index = this.investment.investmentYears.indexOf(investmentYear);
    if (index !== -1) {
      this.investment.investmentYears.splice(index, 1);
    }
  }

  addInvestmentYear(): void {
    this.investment.investmentYears.push(new InvestmentYear());
  }

}
