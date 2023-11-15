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
        }); // integer
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
    getCellBounds(playerLocation: leaflet.LatLng, cell: Cell): leaflet.LatLngBounds {
        const { i, j } = cell;
        const playerLat = playerLocation.lat;
        const playerLong = playerLocation.lng;
        return new leaflet.LatLngBounds([
            [playerLat + i * this.tileWidth, playerLong + j * this.tileWidth],
            [playerLat + (i + 1) * this.tileWidth, playerLong + (j + 1) * this.tileWidth],
        ]);
    }

    getCellsNearPoint(point: leaflet.LatLng): Cell[] {
        const resultCells: Cell[] = [];
        const originCell = this.getCellForPoint(point);
        if (originCell) {
            for (let i = -this.tileVisibilityRadius; i < this.tileVisibilityRadius; i++) {
                for (let j = -this.tileVisibilityRadius; j < this.tileVisibilityRadius; j++) {
                    resultCells.push({ i, j });
                    //leaflet.latLng({ lat: (i * this.tileWidth) + originCell.i, lng: (j * this.tileWidth) + originCell.j }))
                }
            }
        }
        return resultCells;
    }
}