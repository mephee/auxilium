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
  grantYearsFederal: GrantYear[];
  grantYearsCanton: GrantYear[];

  constructor() {
    this.total = 0;
    this.totalCorr = 0;
    this.rate = 0;
    this.investmentYears = [new InvestmentYear()];
    this.grantYearsFederal = [];
    this.grantYearsCanton = [];
    this.grantCanton = 0;
    this.grantFederal = 0;
  }
}
