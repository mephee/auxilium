import { Component, OnInit } from '@angular/core';
import { Container } from "../data/container";
import { MOCK } from "../data/container-mock";
import {Inoutcome} from "../data/inoutcome";

@Component({
  selector: 'app-maintable',
  templateUrl: './maintable.component.html',
  styleUrls: ['./maintable.component.css']
})
export class MaintableComponent implements OnInit {

  container = MOCK;

  constructor() { }

  ngOnInit() {
  }

  calc(inoutcome: Inoutcome): number {
    return inoutcome.income - inoutcome.outcome;
  }

}
