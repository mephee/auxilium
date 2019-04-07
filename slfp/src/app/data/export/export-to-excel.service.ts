import { Injectable } from '@angular/core';
import {DatastoreService} from "../datastore.service";
import {InvestmentCategories} from "../../maintable/investmentcategories/investment-categories.service";
import {MoneyPipe} from "../../utility/money.pipe";
import {Version} from "../model/version";
import {CalculatorService} from "../../maintable/calc/calculator.service";
import {ColumnGUI} from "../../maintable/calc/model/columnGUI";
import {SpecialService} from "../../customspecial/special.service";

declare var XLSX:any;
declare var storage:any;

@Injectable({
  providedIn: 'root'
})
export class ExportToExcelService {

  constructor(private datastore:DatastoreService,
              private investmentCategories:InvestmentCategories,
              private money:MoneyPipe,
              private calculator:CalculatorService,
              private special:SpecialService) {}

  export(fileName:string):void {
    let workbook = {
      SheetNames: [],
      Sheets: {}
    };
    let actualVersion:Version = this.datastore.getActualVersion();
    this.datastore.getVersions().forEach(version=>{
      this.datastore.setActualVersion(version);
      this.calculator.calculateBalances();
      workbook.SheetNames.push(version.name);
      let sheet = {};
      let rowCounter = 0;

      // Jahr
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Jahr');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('Bestände Planung / Projektnummer');
      sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell('Spezialfinanzierung');
      rowCounter++;

      // Steuereinnahmen
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Steuervolumen');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell('');
      rowCounter++;
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Steueranlage');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell('');
      rowCounter++;
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Steuereinkommen');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell('');
      rowCounter++;
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Übrige Erträge');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // Aufwände
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Betriebsaufände');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell('');
      rowCounter++;
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Übrige Aufwände');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // Summe 1
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Überschuss/Fehlbetrag aus laufender Rechnung');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // Flüssige Mittel Vorjahr
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Bestand flüssige Mittel aus ende Vorjahr (31.12.XXXX)');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // Fremdkapital
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Aufnahme / Rückzahlung Fremdkapital');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getNumCell1000(version.foreignContainer.foreignValue);
      sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // Summe 2
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Total Liquiditätsbestand vor Abschreibungen');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // Investitionen und Abschreibungen
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Investitionen und Abschreibungen');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell('');
      rowCounter++;
      this.investmentCategories.getInvestmentCategories().forEach(category=>{
        sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell(category.name + ' (' + category.rate + '%)');
        sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
        sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell('');
        rowCounter++;
        this.calculator.getInvestmentsByRate(category.rate).forEach(investment=>{
          sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('- ' + investment.name);
          sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell(investment.projectNr);
          sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell(this.special.getSpecialNameForId(investment.specialId));
          rowCounter++;
        });
      });

      // Abschreibungen HRM1
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('HRM1 Verwaltungsvermögen per 31.12.2017');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getNumCell1000(version.investmentHRM1Container.value);
      sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // zusätzliche Abschreibungen nach HRM2 (finanzpolitische Reserve)
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Wertberichtigung Abschreibungen (auch finanzpolitische Reserve)');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // Total Abschreibungen
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Total Abschreibungen pro Jahr');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // Total Deinvestitionen
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Total Deinvestitionen pro Jahr');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // Total Liquiditätszufluss -Abfluss aus Rechnung (Cash flow)
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Total Liquiditätszufluss -Abfluss aus Rechnung (Cash flow)');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // Total Ausgaben Investitionen (Liquiditätsabfluss)
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Total Ausgaben Investitionen (Liquiditätsabfluss)');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // Subventionen
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Subventionen');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // Liquiditätsbestand Total Ende Jahr
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Liquiditätsbestand Total Ende Jahr');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // Abzüglich zweckgebundene Reserve (finanzpolitische Reserve
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Abzüglich zweckgebundene Reserve (finanzpolitische Reserve)');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      // Verfügbare Liquidität
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = this.getTextCell('Verfügbare Liquidität');
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = this.getTextCell('');
      sheet[XLSX.utils.encode_cell({c:2,r:rowCounter})] = this.getTextCell('');
      rowCounter++;

      let columns:ColumnGUI[] = this.calculator.getDataColumns();
      let colCounter = 3;
      columns.forEach((column) => {
        rowCounter = 0;

        // Jahr
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getTextCell('' + column.year);
        rowCounter++;

        // Steuern
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(column.inoutcome.taxvolume);
        rowCounter++;
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell(column.inoutcome.taxrate);
        rowCounter++;
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(column.inoutcome.income);
        rowCounter++;
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(column.inoutcome.additionalIncome);
        rowCounter++;

        // Aufwände
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(column.inoutcome.outcome);
        rowCounter++;
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(column.inoutcome.additionalOutcome);
        rowCounter++;

        // Summe 1
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(column.balanceAfterOutcome);
        rowCounter++;

        // flüssige Mittel aus Vorjahr
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(column.liquidityOfLastYear);
        rowCounter++;

        // Fremdkapital
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(column.foreignPayback.payback);
        rowCounter++;

        // Summe 2
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(column.balanceBeforeWriteoff);
        rowCounter++;

        // Investitionen und Abschreibungen
        rowCounter++;  // skip title row
        column.taxoffForRate.forEach(taxoffForRate=>{
          sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(taxoffForRate.taxoffTotal);
          rowCounter++;
          taxoffForRate.taxoffs.forEach(taxoff=>{
            sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(taxoff);
            rowCounter++;
          })
        });

        // Abschreibungen HRM1
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(column.taxoffHRM1);
        rowCounter++;

        // zusätzliche Abschreibungen nach HRM2 (finanzpolitische Reserve)
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(column.taxoffAdditional);
        rowCounter++;

        // Abschreibungen Total
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(column.taxoffTotal);
        rowCounter++;

        // Deinvestitionen Total
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(column.deinvestment.investmentTotal);
        rowCounter++;

        // Summe 3
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(column.cashflow);
        rowCounter++;

        // Investitionen Total
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(column.investment.investmentTotal);
        rowCounter++;

        // Subventionen
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(column.grant.grantTotal);
        rowCounter++;

        // Liquiditätsbestand Total Ende Jahr
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(column.balanceAfterInvestment);
        rowCounter++;

        // Reserve
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(column.reserve);
        rowCounter++;

        // Verfügbare Liquidität
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = this.getNumCell1000(column.balanceAfterReserve);
        rowCounter++;

        colCounter++;
      });
      sheet['!ref'] = XLSX.utils.encode_range({c:0,r:0},{c:colCounter-1,r:rowCounter-1});
      let wscols = [
        {wch:65},
        {wch:30},
        {wch:30},
      ];
      sheet['!cols'] = wscols;
      workbook.Sheets[version.name] = sheet;
    });
    XLSX.writeFile(workbook, fileName);

    this.datastore.setActualVersion(actualVersion);
    this.calculator.calculateBalances();
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
