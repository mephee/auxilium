import {Component, EventEmitter, Input, NgZone, OnInit, Output} from '@angular/core';

declare var storage:any;

@Component({
  selector: 'app-license',
  templateUrl: './license.component.html',
  styleUrls: ['./license.component.css']
})
export class LicenseComponent implements OnInit {

  @Output() closed = new EventEmitter<void>();

  enableTest:boolean = false;
  daysLeft:number;
  trialStart:Date;
  licenseKey:string;

  constructor(private ngZone:NgZone) { }

  ngOnInit() {
    storage.has('license', (error, has) => {
      if (error) throw error;
      if (has) {
        storage.get('license', (error, license) => {
          this.ngZone.run(() => {
            if (error) throw error;
            else if (license) {
              if (!license.date) {
                license.date = new Date();
              }
              this.licenseKey = license.key;
              this.getTrialDaysLeft(license.date);
            }
          });
        });
      } else {
        let license = {
          date: new Date(),
          key: ''
        };
        storage.set('license', license, (error)=>{
          if (error) console.log(error);
        });
        this.licenseKey = license.key;
        this.getTrialDaysLeft(license.date);
      }
    });
  }

  save():void {
    this.closed.emit();
  }

  activate():void {
    let license = {
      date: this.trialStart,
      key: 'AUX01-8512-5612-7800-XA98'
    };
    storage.set('license', license, (error)=>{
      if (error) console.log(error);
    });
    this.closed.emit();
  }

  keyValid():boolean {
    console.log('trialequal');
    return this.licenseKey == 'AUX01-8512-5612-7800-XA98';
  }

  private getTrialDaysLeft(date:Date):void {
    let thirtyDays = new Date(date);
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    let today = new Date();
    let difference = Math.round((thirtyDays.getTime()-today.getTime())/(1000*60*60*24));
    if (difference<0) {
      difference = 0;
    }
    this.daysLeft = difference;
    this.enableTest = (this.daysLeft > 0);
    this.trialStart = date;
  }

}
