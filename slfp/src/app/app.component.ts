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

  constructor(private datastore:DatastoreService) {}

  isVersionInitialized():boolean {
    return this.datastore.isVersionInitialized();
  }

  zoomIn():void {
    let actualZoom:number = webFrame.getZoomFactor();
    webFrame.setZoomFactor(actualZoom+0.05);
    this.actualZoom = ~~((actualZoom + 0.05) * 100) + '%';
  }

  zoomOut():void {
    let actualZoom:number = webFrame.getZoomFactor();
    webFrame.setZoomFactor(actualZoom-0.05);
    this.actualZoom = ~~((actualZoom - 0.05) * 100) + '%';
  }
}
