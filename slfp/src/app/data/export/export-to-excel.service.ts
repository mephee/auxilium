import { Injectable } from '@angular/core';
import {DatastoreService} from "../datastore.service";
import {AggregationService} from "../../maintable/aggregation/aggregation.service";
import {MoneyPipe} from "../../maintable/money.pipe";

declare var XLSX:any;
declare var storage:any;

@Injectable({
  providedIn: 'root'
})
export class ExportToExcelService {

  constructor(private datastore:DatastoreService, private aggregation:AggregationService, private money:MoneyPipe) {}

  export():void {
    // let workbook = XLSX.readFile('C:\\Design\\auxilium\\slfp\\template.xlsx', {cellNF: true, cellStyles: true, });
    // storage.set('workbook', workbook);
    let workbook = {
      SheetNames: [],
      Sheets: {}
    };
    this.datastore.getVersions().forEach(version=>{
      workbook.SheetNames.push(version.name);
      let sheet = {};
      let rowCounter = 0;

      // Jahr
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = {
        t: 's',  // type: s, n,
        v: 'Jahr',  // raw value
      };
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = {
        t: 's',  // type: s, n,
        v: 'Bestände Planung',  // raw value
      };
      rowCounter++;

      // Steuereinnahmen
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = {
        t: 's',  // type: s, n,
        v: 'Steuervolumen',  // raw value
      };
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = {
        t: 's',  // type: s, n,
        v: '',  // raw value
      };
      rowCounter++;
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = {
        t: 's',  // type: s, n,
        v: 'Steueranlage',  // raw value
      };
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = {
        t: 's',  // type: s, n,
        v: '',  // raw value
      };
      rowCounter++;
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = {
        t: 's',  // type: s, n,
        v: 'Steuereinkommen',  // raw value
      };
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = {
        t: 's',  // type: s, n,
        v: '',  // raw value
      };
      rowCounter++;

      // Aufwände
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = {
        t: 's',  // type: s, n,
        v: 'Betriebsaufwände',  // raw value
      };
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = {
        t: 's',  // type: s, n,
        v: '',  // raw value
      };
      rowCounter++;

      // Summe 1
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = {
        t: 's',  // type: s, n,
        v: 'Überschuss/Fehlbetrag aus laufender Rechnung',  // raw value
      };
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = {
        t: 's',  // type: s, n,
        v: '',  // raw value
      };
      rowCounter++;

      // Flüssige Mittel Vorjahr
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = {
        t: 's',  // type: s, n,
        v: 'Bestand flüssige Mittel aus ende Vorjahr (31.12.XXXX)',  // raw value
      };
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = {
        t: 's',  // type: s, n,
        v: '',  // raw value
      };
      rowCounter++;

      // Fremdkapital
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = {
        t: 's',  // type: s, n,
        v: 'Aufnahme / Rückzahlung Fremdkapital',  // raw value
      };
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = {
        t: 'n',  // type: s, n,
        v: version.foreignContainer.foreignValue,  // raw value
        w: this.money.transform(version.foreignContainer.foreignValue, 1000),
        z: '#,###,\\ ;[Red]\\-#,###,\\ '
      };
      rowCounter++;

      // Summe 2
      sheet[XLSX.utils.encode_cell({c:0,r:rowCounter})] = {
        t: 's',  // type: s, n,
        v: 'Total Liquiditätsbestand vor Abschreibungen',  // raw value
      };
      sheet[XLSX.utils.encode_cell({c:1,r:rowCounter})] = {
        t: 's',  // type: s, n,
        v: '',  // raw value
      };
      rowCounter++;

      let inoutcomes = version.inoutComes;
      let colCounter = 2;
      for(let i = version.yearFrom;i<=version.yearTo;i++) {
        rowCounter = 0;

        // Jahr
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = {
          t: 's',  // type: s, n,
          v: '' + i,  // raw value
        };
        rowCounter++;

        // Steuern
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = {
          t: 'n',  // type: s, n,
          v: version.inoutComes[colCounter-2].taxvolume,  // raw value
          w: this.money.transform(version.inoutComes[colCounter-2].taxvolume, 1000),
          z: '#,###,\\ ;[Red]\\-#,###,\\ '
        };
        rowCounter++;
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = {
          t: 'n',  // type: s, n,
          v: version.inoutComes[colCounter-2].taxrate,  // raw value
        };
        rowCounter++;
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = {
          t: 'n',  // type: s, n,
          v: version.inoutComes[colCounter-2].income,  // raw value
          w: this.money.transform(version.inoutComes[colCounter-2].income, 1000),
          z: '#,###,\\ ;[Red]\\-#,###,\\ '
        };
        rowCounter++;

        // Aufwände
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = {
          t: 'n',  // type: s, n,
          v: version.inoutComes[colCounter-2].outcome,  // raw value
          w: this.money.transform(version.inoutComes[colCounter-2].outcome, 1000),
          z: '#,###,\\ ;[Red]\\-#,###,\\ '
        };
        rowCounter++;

        // Summe 1
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = {
          t: 'n',  // type: s, n,
          v: this.aggregation.getBalanceAfterOutcome()[colCounter-2].value,  // raw value
          w: this.money.transform(this.aggregation.getBalanceAfterOutcome()[colCounter-2].value, 1000),
          z: '#,###,\\ ;[Red]\\-#,###,\\ '
        };
        rowCounter++;

        // flüssige Mittel aus Vorjahr
        if (colCounter == 2) {
          sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = {
            t: 'n',  // type: s, n,
            v: version.liquidityStart.liquidity,  // raw value
            w: this.money.transform(version.liquidityStart.liquidity, 1000),
            z: '#,###,\\ ;[Red]\\-#,###,\\ '
          };
        } else {
          sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = {
            t: 'n',  // type: s, n,
            v: this.aggregation.getLiquidityOfLastYear()[colCounter-3],  // raw value
            w: this.money.transform(this.aggregation.getLiquidityOfLastYear()[colCounter-3], 1000),
            z: '#,###,\\ ;[Red]\\-#,###,\\ '
          };
        }
        rowCounter++;

        // Fremdkapital
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = {
          t: 'n',  // type: s, n,
          v: version.foreignContainer.foreignPayback[colCounter-2].payback,  // raw value
          w: this.money.transform(version.foreignContainer.foreignPayback[colCounter-2].payback, 1000),
          z: '#,###,\\ ;[Red]\\-#,###,\\ '
        };
        rowCounter++;

        // Summe 1
        sheet[XLSX.utils.encode_cell({c:colCounter,r:rowCounter})] = {
          t: 'n',  // type: s, n,
          v: this.aggregation.getBalanceBeforeWriteoff()[colCounter-2].value,  // raw value
          w: this.money.transform(this.aggregation.getBalanceBeforeWriteoff()[colCounter-2].value, 1000),
          z: '#,###,\\ ;[Red]\\-#,###,\\ '
        };
        rowCounter++;

        colCounter++;
      }
      sheet['!ref'] = XLSX.utils.encode_range({c:0,r:0},{c:colCounter-1,r:rowCounter-1});
      workbook.Sheets[version.name] = sheet;
    });
    XLSX.writeFile(workbook, 'C:\\Data\\export.xlsx')
  }
}
