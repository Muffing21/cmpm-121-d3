import { Cell } from "./board.ts";


export class Coin {
    constructor(readonly originCell: Cell, readonly serial: number) {
    }

    toString() {
        return `Coin: ${this.originCell.i},${this.originCell.j}#${this.serial}<br/>`;
    }
}