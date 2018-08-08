import {InvestmentYear} from "./investmentYear";

export class Investment {
  name: string;
  projectNr: string;
  total: number;
  totalCorr: number;
  rate: number;
  investmentYears: InvestmentYear[];
}
