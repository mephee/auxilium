import {ForeignPayback} from "./foreignPayback";

export class ForeignContainer {
  foreignValue: number;
  foreignPayback: ForeignPayback[];

  constructor() {
    this.foreignPayback = [];
  }
}
