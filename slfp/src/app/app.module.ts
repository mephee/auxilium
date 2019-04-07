import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MaintableComponent } from './maintable/maintable.component';
import { InvestmentComponent } from './maintable/investment/investment.component';
import { MoneyPipe } from './utility/money.pipe';
import { InlineeditComponent } from './maintable/inlineedit/inlineedit.component';
import { VersionsComponent } from './versions/versions.component';
import { WizardComponent } from './versions/wizard/wizard.component';
import {ExportToExcelService} from "./data/export/export-to-excel.service";
import { SafeHtmlPipe } from './utility/safe-html.pipe';
import { IndexComponent } from './index/index.component';
import { RenameComponent } from './versions/rename/rename.component';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { LicenseComponent } from './license/license.component';
import {ChartsModule} from "ng2-charts";
import { ChartComponent } from './maintable/chart/chart.component';
import { CustomspecialComponent } from './customspecial/customspecial.component';

@NgModule({
  declarations: [
    AppComponent,
    MaintableComponent,
    InvestmentComponent,
    MoneyPipe,
    InlineeditComponent,
    VersionsComponent,
    WizardComponent,
    SafeHtmlPipe,
    IndexComponent,
    RenameComponent,
    LicenseComponent,
    ChartComponent,
    CustomspecialComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    ScrollingModule,
    ChartsModule
  ],
  exports: [
    ScrollingModule
  ],
  providers: [MoneyPipe, ExportToExcelService],
  bootstrap: [AppComponent]
})
export class AppModule { }
