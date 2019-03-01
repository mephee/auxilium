import {Inoutcome} from "../../data/model/inoutcome";
import {ForeignPayback} from "../../data/model/foreignPayback";

export class ColumnGUI {
  year: number;
  inoutcome: Inoutcome;
  balanceAfterOutcome: number;
  liquidityOfLastYear: number;
  foreignPayback: ForeignPayback;
  balanceBeforeWriteoff: number;
  taxoffCat1: number;
  taxoffCat2: number;
  taxoffCat3: number;
  taxoffCat4: number;
  taxoffCat5: number;
  taxoffCat6: number;
  taxoffCat7: number;
  taxoffCat8: number;

  // aggregation.getTaxoffsByYear(investment)  // pro investment, wenn kategorie geöffnet

  taxoffHRM1: number;
  taxoffAdditional: number;
  taxoffTotal: number;

  deinvestment: number;
  cashflow: number;
  investment: number;
  grant: number;
  balanceAfterInvestment: number;
  balanceAfterReserve: number;

  constructor() {
    this.year = 0;
  }
}
