import {Inoutcome} from "../../../data/model/inoutcome";
import {ForeignPayback} from "../../../data/model/foreignPayback";
import {InvestmentGUI} from "./investmentGUI";
import {GrantGUI} from "./grantGUI";
import {TaxoffForRateGUI} from "./taxoffsForRateGUI";

export class ColumnGUI {
  year: number;
  inoutcome: Inoutcome;
  balanceAfterOutcome: number;
  liquidityOfLastYear: number;
  foreignPayback: ForeignPayback;
  balanceBeforeWriteoff: number;
  taxoffForRate: TaxoffForRateGUI[];
  taxoffHRM1: number;
  taxoffAdditional: number;
  taxoffTotal: number;

  deinvestment: InvestmentGUI;
  cashflow: number;
  investment: InvestmentGUI;
  grant: GrantGUI;
  balanceAfterInvestment: number;
  reserve: number;
  balanceAfterReserve: number;

  constructor() {
    this.taxoffForRate = [];
  }
}
