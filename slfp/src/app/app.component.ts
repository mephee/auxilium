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
  hasLicense:boolean = false;
  showLicense:boolean = false;

  showIndex:boolean;

  constructor(private datastore:DatastoreService, private exportToExcel:ExportToExcelService, private ngZone:NgZone) {}

  ngOnInit() {
    this.showIndex = false;

    // Menubefehle
    ipcRenderer.on('export-excel', (event, arg) => this.exportToExcel.export(arg));
    ipcRenderer.on('indextable', () => {
      this.ngZone.run(() => {
        this.showIndex = true
      });
    });

    // Zoom wiederherstellen
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
    this.datastore.enableTooltips();
    this.checkLicense();
  }

  checkLicense():void {
    storage.has('license', (error, has) => {
      if (error) throw error;
      if (has) {
        storage.get('license', (error, license) => {
          this.ngZone.run(() => {
            if (error) throw error;
            else if (license) {
              if (license.key === 'AUX01-8512-5612-7800-XA98') {
                this.hasLicense = true;
              } else {
                this.showLicense = true;
              }
            } else {
              this.showLicense = true;
            }
          });
        });
      } else {
        this.showLicense = true;
      }
    });
  }

  onLicenseClose():void {
    this.hasLicense = true;
    this.showLicense = false;
  }

  isVersionInitialized():boolean {
    return this.hasLicense && this.datastore.isVersionInitialized();
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

  onClosedIndex() {
    this.showIndex = false;
  }


}
