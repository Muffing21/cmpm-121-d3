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
    // lat: 36.9995,
    // lng: - 122.0533
    lat: 0,
    lng: 0
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

function redraw() {
    for (let i = -constants.NEIGHBORHOOD_SIZE; i < constants.NEIGHBORHOOD_SIZE; i++) {
        for (let j = - constants.NEIGHBORHOOD_SIZE; j < constants.NEIGHBORHOOD_SIZE; j++) {
            if (luck([i, j].toString()) < constants.PIT_SPAWN_PROBABILITY) {
                cacheCoins.set([i, j].toString(), makeGeoCoins(i, j));
                makeGeoCache(i, j);
            }
        }
    }
}

redraw();

document.getElementById("north")?.addEventListener(("click"), () => {
    playerWalk("north");
    redraw();
});
document.getElementById("south")?.addEventListener(("click"), () => {
    playerWalk("south");
    redraw();
});
document.getElementById("west")?.addEventListener(("click"), () => {
    playerWalk("west");
    redraw();
});
document.getElementById("east")?.addEventListener(("click"), () => {
    playerWalk("east");
    redraw();
});



function playerWalk(direction: string) {
    if (direction === "north") {
        MERRILL_CLASSROOM.lat += constants.PLAYER_MOVE_DISTANCE;
        playerMarker.setLatLng(MERRILL_CLASSROOM);
    } else if (direction === "south") {
        MERRILL_CLASSROOM.lat -= constants.PLAYER_MOVE_DISTANCE;
        playerMarker.setLatLng(MERRILL_CLASSROOM);
    } else if (direction === "west") {
        MERRILL_CLASSROOM.lng -= constants.PLAYER_MOVE_DISTANCE;
        playerMarker.setLatLng(MERRILL_CLASSROOM);
    } else if (direction === "east") {
        MERRILL_CLASSROOM.lng += constants.PLAYER_MOVE_DISTANCE;
        playerMarker.setLatLng(MERRILL_CLASSROOM);
    }
}
