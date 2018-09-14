import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MaintableComponent } from './maintable/maintable.component';
import { InvestmentComponent } from './maintable/investment/investment.component';
import { MoneyPipe } from './maintable/money.pipe';
import { InlineeditComponent } from './maintable/inlineedit/inlineedit.component';
import { VersionsComponent } from './versions/versions.component';
import { WizardComponent } from './versions/wizard/wizard.component';
import {ExportToExcelService} from "./data/export/export-to-excel.service";

@NgModule({
  declarations: [
    AppComponent,
    MaintableComponent,
    InvestmentComponent,
    MoneyPipe,
    InlineeditComponent,
    VersionsComponent,
    WizardComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [MoneyPipe, ExportToExcelService],
  bootstrap: [AppComponent]
})
export class AppModule { }
