import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DatastoreService} from "../data/datastore.service";
import {CalculatorService} from "../maintable/calc/calculator.service";
import {Index} from "../data/model";
import {Special} from "./model/special";
import {SpecialService} from "./special.service";
declare var $:any;

@Component({
  selector: 'app-customspecial',
  templateUrl: './customspecial.component.html',
  styleUrls: ['./customspecial.component.css']
})
export class CustomspecialComponent implements OnInit {

  @Input()  open: boolean;
  @Output() closed = new EventEmitter<void>();

  constructor(private datastore:DatastoreService,
              private special:SpecialService) { }

  ngOnInit() {
    $('#customspecial').draggable({
      handle: '.modal-header'
    });
  }

  tracker(index:number, item:any):number {
    return index;
  }

  save(): void {
    this.datastore.saveCustomspecials();
    this.open = false;
    this.closed.emit();
  }

  getSpecials():Special[] {
    return this.special.getSpecials();
  }

  addCustomspecial():void {
    let special = new Special();
    special.id = this.datastore.getCustomspecials().length + 5;
    special.name = '';
    this.datastore.saveCustomspecial(special);
  }

}
