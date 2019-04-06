import {InvestmentYear} from "./investmentYear";
import {GrantYear} from "./grantYear";
import { v4 as uuid } from 'uuid';

export class Investment {
  id: string;
  reinvestParentId: string;
  name: string;
  projectNr: string;
  total: number;
  totalCorr: number;
  rate: number;
  categoryId: number;
  specialId: number;

  grantFederal:number;
  grantCanton:number;

  investmentYears: InvestmentYear[];
  grantYearsFederal: GrantYear[];
  grantYearsCanton: GrantYear[];

  // Indexbereinigte Reinvestition
  reinvestCount:number;

  // Deinvestition / Wert bei Verkauf
  deinvestment:number;


  constructor() {
    this.id = uuid();
    this.reinvestParentId = '';
    this.total = 0;
    this.totalCorr = 0;
    this.rate = 0;
    this.categoryId = 0;
    this.investmentYears = [];
    this.grantYearsFederal = [];
    this.grantYearsCanton = [];
    this.grantCanton = 0;
    this.grantFederal = 0;
    this.reinvestCount = 0;
    this.deinvestment = 0;
    this.specialId = 0;
  }
}
