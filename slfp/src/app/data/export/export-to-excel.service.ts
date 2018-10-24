import { Injectable } from '@angular/core';
import {DatastoreService} from "../datastore.service";
import {AggregationService} from "../../maintable/aggregation/aggregation.service";
import {MoneyPipe} from "../../maintable/money.pipe";
import {Version} from "../model/version";

declare var XLSX:any;
declare var storage:any;

@Injectable({
  providedIn: 'root'
})
export class ExportToExcelService {

  constructor(private datastore:DatastoreService, private aggregation:AggregationService, private money:MoneyPipe) {}

  export(fileName:string):void {
    let workbook = {
      SheetNames: [],
      Sheets: {}
    };
    let actualVersion:Version = this.datastore.getActualVersion();
    this.datastore.getVersions().forEach(version=>{
      this.datastore.setActualVersion(version);
      this.aggregation.calculateBalances();
      workbook.SheetNames.push(version.name);
      let sheet = {};
      let rowCounter = 0;

      // Jahr
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Jahr');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('Bestände Planung');
      rowCounter++;

      // Steuereinnahmen
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Steuervolumen');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      rowCounter++;
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Steueranlage');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      rowCounter++;
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Steuereinkommen');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // Aufwände
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Betriebsaufände');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // Summe 1
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Überschuss/Fehlbetrag aus laufender Rechnung');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // Flüssige Mittel Vorjahr
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Bestand flüssige Mittel aus ende Vorjahr (31.12.XXXX)');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // Fremdkapital
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Aufnahme / Rückzahlung Fremdkapital');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getNumCell1000(version.foreignContainer.foreignValue);
      rowCounter++;

      // Summe 2
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Total Liquiditätsbestand vor Abschreibungen');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // Investitionen und Abschreibungen
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Investitionen und Abschreibungen');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      rowCounter++;
      let investments = {};
      this.aggregation.getInvestmentCategories().forEach(category=>{
        sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell(category.name);
        sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell(category.rate + '%');
        investments[category.rate+''] = this.aggregation.getTaxoffsByCategory(category);
        rowCounter++;
      });

      // Abschreibungen HRM1
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('HRM1 Verwaltungsvermögen per 31.12.2017');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getNumCell1000(version.investmentHRM1Container.value);
      let taxoffsHRM1 = this.aggregation.getTaxoffsHRM1ByYear();
      rowCounter++;

      // zusätzliche Abschreibungen nach HRM2 (finanzpolitische Reserve)
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('zusätzliche Abschreibungen nach HRM2 (finanzpolitische Reserve)');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // Total Abschreibungen
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Total Abschreibungen pro Jahr');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      let taxoffsTotal = this.aggregation.getTaxoffsTotal();
      rowCounter++;

      // Total Liquiditätszufluss -Abfluss aus Rechnung (Cash flow)
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Total Liquiditätszufluss -Abfluss aus Rechnung (Cash flow)');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // Total Ausgaben Investitionen (Liquiditätsabfluss)
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Total Ausgaben Investitionen (Liquiditätsabfluss)');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      let investmentsTotal = this.aggregation.getInvestmentsTotal();
      rowCounter++;

      // Subventionen
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Subventionen');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      let grants = this.aggregation.getGrants();
      rowCounter++;

      // Liquiditätsbestand Total Ende Jahr
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Liquiditätsbestand Total Ende Jahr');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // Abzüglich zweckgebundene Reserve (finanzpolitische Reserve
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Abzüglich zweckgebundene Reserve (finanzpolitische Reserve)');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // Verfügbare Liquidität
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Verfügbare Liquidität');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      let colCounter = 2;
      for(let i = version.yearFrom;i<=version.yearTo;i++) {
        rowCounter = 0;

        // Jahr
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getTextCell(''+i);
        rowCounter++;

        // Steuern
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(version.inoutComes[colCounter-2].taxvolume);
        rowCounter++;
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell(version.inoutComes[colCounter-2].taxrate);
        rowCounter++;
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(version.inoutComes[colCounter-2].income);
        rowCounter++;

        // Aufwände
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(version.inoutComes[colCounter-2].outcome);
        rowCounter++;

        // Summe 1
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(this.aggregation.getBalanceAfterOutcome()[colCounter-2].value);
        rowCounter++;

        // flüssige Mittel aus Vorjahr
        if (colCounter == 2) {
          sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(version.liquidityStart.liquidity);
        } else {
          sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(this.aggregation.getLiquidityOfLastYear()[colCounter-3]);
        }
        rowCounter++;

        // Fremdkapital
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(version.foreignContainer.foreignPayback[colCounter-2].payback);
        rowCounter++;

        // Summe 2
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(this.aggregation.getBalanceBeforeWriteoff()[colCounter-2].value);
        rowCounter++;

        // Investitionen und Abschreibungen
        rowCounter++;  // skip title row
        this.aggregation.getInvestmentCategories().forEach(category=>{
          sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(investments[category.rate+''][colCounter-2]);
          rowCounter++;
        });

        // Abschreibungen HRM1
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(taxoffsHRM1[colCounter-2]);
        rowCounter++;

        // zusätzliche Abschreibungen nach HRM2 (finanzpolitische Reserve)
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(version.additionalTaxoffs[colCounter-2].taxoff);
        rowCounter++;

        // Abschreibungen Total
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(taxoffsTotal[colCounter-2]);
        rowCounter++;

        // Summe 3
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(this.aggregation.getBalanceAfterWriteoff()[colCounter-2].value);
        rowCounter++;

        // Investitionen Total
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(investmentsTotal[colCounter-2].investmentTotal);
        rowCounter++;

        // Subventionen
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(grants[colCounter-2].grantTotal);
        rowCounter++;

        // Liquiditätsbestand Total Ende Jahr
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(this.aggregation.getBalanceAfterInvestments()[colCounter-2].value);
        rowCounter++;

        // Reserve
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(version.reserves[colCounter-2].reserve);
        rowCounter++;

        // Verfügbare Liquidität
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(this.aggregation.getBalanceAfterReserves()[colCounter-2].value);
        rowCounter++;

        colCounter++;
      }
      sheet['!ref'] = XLSX.utils.encode_range({c:0,r:0},{c:colCounter-1,r:rowCounter-1});
      let wscols = [
        {wch:65},
        {wch:20},
      ];
      sheet['!cols'] = wscols;
      workbook.Sheets[version.name] = sheet;
    });
    XLSX.writeFile(workbook, fileName);

    this.datastore.setActualVersion(actualVersion);
    this.aggregation.calculateBalances();
  }

  private getTextCell(text:string) {
    return {
      t: 's',  // type: s, n,
      v: text,  // raw value
    };
  }

  private getNumCell1000(value:number) {
    return {
      t: 'n',  // type: s, n,
      v: value,  // raw value
      w: this.money.transform(value, 1000),
      z: '#,###,\\ ;[Red]\\-#,###,\\ '
    };
  }

  private getNumCell(value:number) {
    return {
      t: 'n',  // type: s, n,
      v: value,  // raw value
    };
  }
}
