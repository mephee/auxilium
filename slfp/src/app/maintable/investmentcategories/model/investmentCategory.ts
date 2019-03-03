import {InvestmentGUI} from "../../calc/model/investmentGUI";
import {Investment} from "../../../data/model/investment";

export class InvestmentCategory {
  name: string;
  rate: number;
  show: boolean;
  investments: Investment[];
}
