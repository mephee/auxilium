import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MaintableComponent } from './maintable/maintable.component';
import { InvestmentComponent } from './maintable/investment/investment.component';
import { MoneyPipe } from './maintable/money.pipe';

@NgModule({
  declarations: [
    AppComponent,
    MaintableComponent,
    InvestmentComponent,
    MoneyPipe
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
