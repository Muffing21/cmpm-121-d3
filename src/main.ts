/* eslint-disable @typescript-eslint/no-unused-vars */
import "leaflet/dist/leaflet.css";
import "./style.css";
import leaflet from "leaflet";
import luck from "./luck";
import "./leafletWorkaround";
//import { Board } from "./board.ts";
import { Cell } from "./board.ts";
import * as constants from "./constants";
import { Coin } from "./coin.ts";


const MERRILL_CLASSROOM = leaflet.latLng({
    lat: 36.9995,
    lng: - 122.0533
});

const mapContainer = document.querySelector<HTMLElement>("#map")!;

const map = leaflet.map(mapContainer, {
    center: MERRILL_CLASSROOM,
    zoom: constants.GAMEPLAY_ZOOM_LEVEL,
    minZoom: constants.GAMEPLAY_ZOOM_LEVEL,
    maxZoom: constants.GAMEPLAY_ZOOM_LEVEL,
    zoomControl: false,
    scrollWheelZoom: false
});

leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
}).addTo(map);

const playerMarker = leaflet.marker(MERRILL_CLASSROOM);
playerMarker.bindTooltip("That's you!");
playerMarker.addTo(map);

const sensorButton = document.querySelector("#sensor")!;
sensorButton.addEventListener("click", () => {
    navigator.geolocation.watchPosition((position) => {
        playerMarker.setLatLng(leaflet.latLng(position.coords.latitude, position.coords.longitude));
        map.setView(playerMarker.getLatLng());
    });
});

const playerCoinCollection: Coin[] = [];
const cacheCoins = new Map<string, Coin[]>();
const statusPanel = document.querySelector<HTMLDivElement>("#statusPanel")!;
statusPanel.innerHTML = "No points yet...";

function makeGeoCoins(i: number, j: number): Coin[] {
    const coinsInPit = Math.floor(luck([i, j, "initialValue"].toString()) * 10);
    const temp = [];
    for (let n = 0; n < coinsInPit; n++) {
        temp.push(new Coin({ i, j }, n));
    }
    console.log(temp.toString());
    return temp;
}

// function collect2(coin: Coin, cell: Cell) {
//     add this coin to player inven
//     remove this coin from that cell inven
//     update local storage

// }
function collectCoin(coins: Coin[]) {
    const coin = coins.pop();
    if (coin) {
        playerCoinCollection.push(coin);

    }
}

function depositCoin(cell: Cell) {
    const coin = playerCoinCollection.pop();
    if (coin) {
        cacheCoins.get([cell.i, cell.j].toString())?.push(coin);

    }
}

function createButtons(pit: leaflet.Layer, i: number, j: number) {
    pit.bindPopup(() => {
        const container = document.createElement("div");
        container.innerHTML = `
                <div>There is a pit here at "${i},${j}". <br> ${cacheCoins.get([i, j].toString())?.toString()}</div>
                <button id="collect">collect</button>
                <button id = "deposit">deposit</button>`;
        const collect = container.querySelector<HTMLButtonElement>("#collect")!;
        const deposit = container.querySelector<HTMLButtonElement>("#deposit")!;
        collect.addEventListener("click", () => {
            const exist = cacheCoins.get([i, j].toString());
            if (exist) {
                collectCoin(exist);
                statusPanel.innerHTML = playerCoinCollection.toString();
            }
        });
        deposit.addEventListener("click", () => {
            depositCoin({ i, j });
            statusPanel.innerHTML = playerCoinCollection.toString();
        });
        return container;
    });
}

function makeGeoCache(i: number, j: number) {
    const bounds = leaflet.latLngBounds([
        [MERRILL_CLASSROOM.lat + i * constants.TILE_DEGREES,
        MERRILL_CLASSROOM.lng + j * constants.TILE_DEGREES],
        [MERRILL_CLASSROOM.lat + (i + 1) * constants.TILE_DEGREES,
        MERRILL_CLASSROOM.lng + (j + 1) * constants.TILE_DEGREES],
    ]);

    const pit = leaflet.rectangle(bounds) as leaflet.Layer;

    createButtons(pit, i, j);

    pit.addTo(map);
}


for (let i = -constants.NEIGHBORHOOD_SIZE; i < constants.NEIGHBORHOOD_SIZE; i++) {
    for (let j = - constants.NEIGHBORHOOD_SIZE; j < constants.NEIGHBORHOOD_SIZE; j++) {
        if (luck([i, j].toString()) < constants.PIT_SPAWN_PROBABILITY) {
            cacheCoins.set([i, j].toString(), makeGeoCoins(i, j));
            makeGeoCache(i, j);
        }
    }
}


// function makePit(i: number, j: number) {
//     const bounds = leaflet.latLngBounds([
//         [MERRILL_CLASSROOM.lat + i * constants.TILE_DEGREES,
//         MERRILL_CLASSROOM.lng + j * constants.TILE_DEGREES],
//         [MERRILL_CLASSROOM.lat + (i + 1) * constants.TILE_DEGREES,
//         MERRILL_CLASSROOM.lng + (j + 1) * constants.TILE_DEGREES],
//     ]);

//     const coinsInPit = Math.floor(luck([i, j, "initialValue"].toString()) * 10);
//     for (let n = 0; n < coinsInPit; n++) {
//         const uniqueCoin = new Coin({ i, j }, n);
//         coinArray.push(uniqueCoin);
//     }
//     // const bounds = board.getCellBounds({ i, j });

//     const pit = leaflet.rectangle(bounds) as leaflet.Layer;


//     pit.bindPopup(() => {
//         let value = Math.floor(luck([i, j, "initialValue"].toString()) * 10);
//         const container = document.createElement("div");
//         container.innerHTML = `
//                 <div>There is a pit here at "${i},${j}". It has value <span id="value">${value}</span>.</div>
//                 <button id="poke">poke</button>
//                 <button id = "deposit">deposit</button>`;
//         const poke = container.querySelector<HTMLButtonElement>("#poke")!;
//         const deposit = container.querySelector<HTMLButtonElement>("#deposit")!;
//         const noPitValue = 0;
//         poke.addEventListener("click", () => {
//             if (value > noPitValue) {
//                 value--;
//                 container.querySelector<HTMLSpanElement>("#value")!.innerHTML = value.toString();
//                 points++;
//                 statusPanel.innerHTML = `${points} points accumulated`;
//             }
//         });

//         const noPoints = 0;
//         deposit.addEventListener("click", () => {
//             if (points > noPoints) {
//                 value++;
//                 container.querySelector<HTMLSpanElement>("#value")!.innerHTML = value.toString();
//                 points--;
//                 statusPanel.innerHTML = `${points} points accumulated`;
//             }
//         });
//         return container;
//     });
//     pit.addTo(map);
// }

// function updateGeoCache(cell: Cell, pit: leaflet.Layer) {
//     const cellI = cell.i;
//     const cellJ = cell.j;
//     pit.bindPopup(() => {
//         // const value = coinsInPit;
//         const container = document.createElement("div");
//         container.innerHTML = `
//                 <div>There is a pit here at "${cellI},${cellJ}". It has these coins: <span id="coinNum">${value}</span>.</div>
//                 <button id="poke">poke</button>
//                 <button id = "deposit">deposit</button>`;
//         const poke = container.querySelector<HTMLButtonElement>("#poke")!;
//         const deposit = container.querySelector<HTMLButtonElement>("#deposit")!;


//         return container;
//     });
// }