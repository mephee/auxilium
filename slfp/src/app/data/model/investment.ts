import {InvestmentYear} from "./investmentYear";

export class Investment {
  name: string;
  projectNr: string;
  total: number;
  totalCorr: number;
  rate: number;

  grantFederal:number;
  grantCanton:number;

  investmentYears: InvestmentYear[];

  constructor() {
    this.total = 0;
    this.totalCorr = 0;
    this.rate = 0;
  }
}
