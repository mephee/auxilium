import { Component, OnInit, Input } from '@angular/core';
import {DatastoreService} from "../../data/datastore.service";
import {Category} from "../../data/model/category";
import {Investment} from "../../data/model/investment";

@Component({
  selector: 'app-investment',
  templateUrl: './investment.component.html',
  styleUrls: ['./investment.component.css']
})
export class InvestmentComponent implements OnInit {

  @Input() investment: Investment;
  selectedCategory: Category;

  constructor(private dataStore: DatastoreService) { }

  ngOnInit() {
    this.investment.investmentYears = [{year: 2018, invest: 95000}, {year: 2019, invest: 120000}];
  }

  changeCategory(): void {
    this.investment.rate = this.selectedCategory.rate;
  }

  calcYears(): number {
    return 100/this.selectedCategory.rate;
  }

  calcWriteoffPerYear(): number {
    if (this.investment.totalCorr) {
      return this.investment.totalCorr/(100/this.selectedCategory.rate);
    } else {
      return this.investment.total/(100/this.selectedCategory.rate);
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
    this.dataStore.addInvestment(this.investment);
  }

  getCategories(): Category[] {
    return this.dataStore.getCategories();
  }

}
