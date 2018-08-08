import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MaintableComponent } from './maintable/maintable.component';
import { InvestmentComponent } from './maintable/investment/investment.component';

@NgModule({
  declarations: [
    AppComponent,
    MaintableComponent,
    InvestmentComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
