import {Component, NgZone, OnInit} from '@angular/core';
import {DatastoreService} from "./data/datastore.service";
import {ExportToExcelService} from "./data/export/export-to-excel.service";

declare var webFrame:any;
declare var ipcRenderer:any;
declare var storage:any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  actualZoom:string = '100%';
  actualZoomNumber:number = 100;

  constructor(private datastore:DatastoreService, private exportToExcel:ExportToExcelService, private ngZone:NgZone) {}

  ngOnInit() {
    ipcRenderer.on('export-excel', (event, arg) => {
      this.exportToExcel.export(arg);
    });
    storage.has('zoom', (error, has) => {
      if (error) throw error;
      if (has) {
        storage.get('zoom', (error, zoom) => {
          this.ngZone.run(() => {
            if (error) {
              throw error;
            } else if (zoom) {
              this.setZoom(zoom.zoom);
            }
          });
        });
      }
    });
  }

  isVersionInitialized():boolean {
    return this.datastore.isVersionInitialized();
  }

  zoomIn():void {
    this.actualZoomNumber = this.actualZoomNumber + 5;
    this.actualZoom = this.actualZoomNumber + '%';
    webFrame.setZoomFactor(this.actualZoomNumber/100);
    storage.set('zoom', {zoom:this.actualZoomNumber});
  }

  zoomOut():void {
    this.actualZoomNumber = this.actualZoomNumber - 5;
    this.actualZoom = this.actualZoomNumber + '%';
    webFrame.setZoomFactor(this.actualZoomNumber / 100);
    storage.set('zoom', {zoom:this.actualZoomNumber});
  }

  setZoom(zoom:number) {
    this.actualZoomNumber = zoom;
    this.actualZoom = this.actualZoomNumber + '%';
    webFrame.setZoomFactor(this.actualZoomNumber / 100);
  }


}
