import {Inoutcome} from "./inoutcome";
import {LiquidityStart} from "./liquidityStart";
import {Investment} from "./investment";
import {Category} from "./category";
import {ForeignContainer} from "./foreignContainer";

export class Version {
  name:string;
  yearFrom:number;
  yearTo:number;
  inoutComes: Inoutcome[];
  investments: Investment[];
  foreignContainer: ForeignContainer;
  liquidityStart: LiquidityStart;
}
