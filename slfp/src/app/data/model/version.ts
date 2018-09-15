import {Inoutcome} from "./inoutcome";
import {LiquidityStart} from "./liquidityStart";
import {Investment} from "./investment";
import {ForeignContainer} from "./foreignContainer";
import {InvestmentHRM1Container} from "./investmentHRM1Container";
import {AdditionalTaxoff} from "./additionalTaxoff";
import {Reserve} from "./reserve";

export class Version {
  name:string;
  yearFrom:number;
  yearTo:number;
  inoutComes: Inoutcome[];
  investments: Investment[];
  foreignContainer: ForeignContainer;
  liquidityStart: LiquidityStart;
  investmentHRM1Container: InvestmentHRM1Container;
  additionalTaxoffs: AdditionalTaxoff[];
  reserves: Reserve[];
}
