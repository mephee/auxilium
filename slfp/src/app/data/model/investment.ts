import {InvestmentYear} from "./investmentYear";
import {GrantYear} from "./grantYear";

export class Investment {
  name: string;
  projectNr: string;
  total: number;
  totalCorr: number;
  rate: number;

  grantFederal:number;
  grantCanton:number;

  investmentYears: InvestmentYear[];
  grantYears: GrantYear[];

  constructor() {
    this.total = 0;
    this.totalCorr = 0;
    this.rate = 0;
    this.investmentYears = [new InvestmentYear()];
    this.grantYears = [];
  }
}
