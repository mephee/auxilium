import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {CalculatorService} from "../calc/calculator.service";
import {MoneyPipe} from "../../utility/money.pipe";

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {

  @Output() closed = new EventEmitter<void>();

  private data:number[];
  private labels:string[];

  public lineChartType = 'line';
  public chartLegend = false;
  public chartOptions;
  public chartLabels;
  public chartData;

  constructor(private calculator:CalculatorService,
              private money:MoneyPipe) {
    this.init();
    this.chartData = [{
      data: this.data,
      fill: false
    }];
    this.chartLabels = this.labels;
    this.chartOptions = {
      scaleShowVerticalLines: false,
      responsive: true,
      aspectRatio: 3,
      tooltips: {
        callbacks: {
          label: function(tooltip, data) {
            return money.transform(tooltip.value, 1000);
          }
        }
      },
      scales: {
        yAxes: [{
          ticks: {
            callback: function(value, index, values) {
              return money.transform(value, 1000);
            }
          },
          scaleLabel: {
            display: true,
            labelString: 'Verfügbare Liquidität (in Tausend)'
          }
        }],
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Jahr'
          }
        }]
      }
    };
  }

  ngOnInit() {

  }

  private init() {
    let index = 0;
    this.labels = [];
    this.data = [];
    let count = (this.calculator.balanceAfterReserves.length > 50 ? 50 : this.calculator.balanceAfterReserves.length);
    for (let i=0;i<count;i++) {
        this.data.push(this.calculator.balanceAfterReserves[i].value);
        this.labels.push(this.calculator.balanceAfterReserves[i].year + '');
    }
  }

  close() {
    this.closed.emit();
  }
}
