import { Component } from '@angular/core';
import {DatastoreService} from "./data/datastore.service";

declare var webFrame:any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  actualZoom:string = '100%';
  actualZoomNumber:number = 100;

  constructor(private datastore:DatastoreService) {}

  isVersionInitialized():boolean {
    return this.datastore.isVersionInitialized();
  }

  zoomIn():void {
    this.actualZoomNumber = this.actualZoomNumber + 5;
    this.actualZoom = this.actualZoomNumber + '%';
    webFrame.setZoomFactor(this.actualZoomNumber/100);
  }

  zoomOut():void {
    this.actualZoomNumber = this.actualZoomNumber - 5;
    this.actualZoom = this.actualZoomNumber + '%';
    webFrame.setZoomFactor(this.actualZoomNumber/100);
  }
}
