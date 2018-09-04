import {Inoutcome} from "./inoutcome";
import {LiquidityStart} from "./liquidityStart";
import {Investment} from "./investment";
import {Category} from "./category";
import {ForeignContainer} from "./foreignContainer";
import {InvestmentHRM1Container} from "./investmentHRM1Container";

export class Version {
  name:string;
  yearFrom:number;
  yearTo:number;
  inoutComes: Inoutcome[];
  investments: Investment[];
  foreignContainer: ForeignContainer;
  liquidityStart: LiquidityStart;
  investmentHRM1Container: InvestmentHRM1Container;
}
