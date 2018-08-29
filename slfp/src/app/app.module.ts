import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MaintableComponent } from './maintable/maintable.component';
import { InvestmentComponent } from './maintable/investment/investment.component';
import { MoneyPipe } from './maintable/money.pipe';
import { InlineeditComponent } from './maintable/inlineedit/inlineedit.component';

@NgModule({
  declarations: [
    AppComponent,
    MaintableComponent,
    InvestmentComponent,
    MoneyPipe,
    InlineeditComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [MoneyPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
