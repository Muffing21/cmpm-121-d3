import { Cell } from "./board.ts";


export class Coin {
    originalCell: Cell;
    serial: number;

    constructor(originCell: Cell, serial: number) {
        this.originalCell = originCell;
        this.serial = serial;
    }
}