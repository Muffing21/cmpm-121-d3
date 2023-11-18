import leaflet from "leaflet";
//import * as constants from "./constants.ts";


export interface Cell {
    readonly i: number;
    readonly j: number;
}

export class Board {
    readonly tileWidth: number;
    readonly tileVisibilityRadius: number;
    private readonly knownCells: Map<string, Cell>;

    constructor(tileWidth: number, tileVisibilityRadius: number) {
        this.tileWidth = tileWidth;
        this.tileVisibilityRadius = tileVisibilityRadius;
        this.knownCells = new Map<string, Cell>();
    }

    private getCanonicalCell(cell: Cell): Cell {
        const { i, j } = cell;
        const key = [i, j].toString();
        if (this.knownCells.get(key) == undefined) {
            this.knownCells.set(key, cell);
        }
        return this.knownCells.get(key)!;
    }

    getCellForPoint(point: leaflet.LatLng): Cell {
        return this.getCanonicalCell({
            i: Math.floor(point.lat / this.tileWidth), j: Math.floor(point.lng / this.tileWidth)
        });
    }
    // getCellBounds(playerLocation: Cell, cell: Cell): leaflet.LatLngBounds {
    //     const { i, j } = cell;
    //     const playerLat = playerLocation.i;
    //     const playerLong = playerLocation.j;
    //     return new leaflet.LatLngBounds([
    //         [playerLat + i * this.tileWidth, playerLocation.j + j * this.tileWidth],
    //         [playerLong + (i + 1) * this.tileWidth, playerLocation.j + (j + 1) * this.tileWidth],
    //     ]);
    // }
    getCellBounds(cell: Cell): leaflet.LatLngBounds {
        const { i, j } = cell;
        return new leaflet.LatLngBounds([
            [i * this.tileWidth, j * this.tileWidth],
            [(i + 1) * this.tileWidth, (j + 1) * this.tileWidth],
        ]);
    }

    getCellsNearPoint(point: leaflet.LatLng): Cell[] {
        const resultCells: Cell[] = [];
        const originCell = this.getCellForPoint(point);
        for (let i = -this.tileVisibilityRadius; i < this.tileVisibilityRadius; i++) {
            for (let j = -this.tileVisibilityRadius; j < this.tileVisibilityRadius; j++) {
                const x = (i + originCell.i) * this.tileWidth;
                const y = (j + originCell.j) * this.tileWidth;
                //resultCells.push(this.getCanonicalCell({ i: (i + originCell.i) * this.tileWidth, j: (j + originCell.j) * this.tileWidth }));
                resultCells.push({ i: x, j: y });
            }
        }
        return resultCells;
    }
}