import { Component, OnInit } from '@angular/core';
import { Container } from "../data/container";
import { MOCK } from "../data/container-mock";
import {Inoutcome} from "../data/inoutcome";
import {Category} from "../data/category";

@Component({
  selector: 'app-maintable',
  templateUrl: './maintable.component.html',
  styleUrls: ['./maintable.component.css']
})
export class MaintableComponent implements OnInit {

  container = MOCK;

  selectedCategory = null;
  total = 0;

  constructor() { }

  ngOnInit() {
  }

  calc(inoutcome: Inoutcome): number {
    return inoutcome.income - inoutcome.outcome;
  }

  change(): void {
    console.log(this.selectedCategory.name);
  }

}
