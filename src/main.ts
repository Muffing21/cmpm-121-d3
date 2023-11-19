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
// eslint-disable-next-line @typescript-eslint/naming-convention


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

const playerLatLng: leaflet.LatLng[] = [MERRILL_CLASSROOM];

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

const bus = new EventTarget();

type EventName = "player-moved";
function notify(name: EventName) {
    bus.dispatchEvent(new Event(name));
}

bus.addEventListener("player-moved", redraw);

let playerMoveX = 0;
let playerMoveY = 0;

redraw();

document.getElementById("north")?.addEventListener(("click"), () => {
    playerWalk("north");
    playerMoveY++;
    notify("player-moved");
});
document.getElementById("south")?.addEventListener(("click"), () => {
    playerWalk("south");
    playerMoveY--;
    notify("player-moved");
});
document.getElementById("west")?.addEventListener(("click"), () => {
    playerWalk("west");
    playerMoveX--;
    notify("player-moved");
});
document.getElementById("east")?.addEventListener(("click"), () => {
    playerWalk("east");
    playerMoveX++;
    notify("player-moved");
});

function redraw() {
    for (let i = -constants.NEIGHBORHOOD_SIZE + playerMoveY; i < constants.NEIGHBORHOOD_SIZE + playerMoveY; i++) {
        for (let j = - constants.NEIGHBORHOOD_SIZE + playerMoveX; j < constants.NEIGHBORHOOD_SIZE + playerMoveX; j++) {
            if (luck([i, j].toString()) < constants.PIT_SPAWN_PROBABILITY) {
                cacheCoins.set([i, j].toString(), makeGeoCoins(i, j));
                leaflet.polyline(playerLatLng, {
                    stroke: true,
                    color: "red",
                    weight: 10,
                    opacity: 10,
                    smoothFactor: 1
                }).addTo(map);
                makeGeoCache(i, j);
            }
        }
    }
}

function playerWalk(direction: string) {
    if (direction === "north") {
        MERRILL_CLASSROOM.lat += constants.PLAYER_MOVE_DISTANCE;
        playerLatLng.push(MERRILL_CLASSROOM);
        playerMarker.setLatLng(MERRILL_CLASSROOM);
    } else if (direction === "south") {
        MERRILL_CLASSROOM.lat -= constants.PLAYER_MOVE_DISTANCE;
        playerLatLng.push(MERRILL_CLASSROOM);
        playerMarker.setLatLng(MERRILL_CLASSROOM);
    } else if (direction === "west") {
        MERRILL_CLASSROOM.lng -= constants.PLAYER_MOVE_DISTANCE;
        playerLatLng.push(MERRILL_CLASSROOM);
        playerMarker.setLatLng(MERRILL_CLASSROOM);
    } else if (direction === "east") {
        MERRILL_CLASSROOM.lng += constants.PLAYER_MOVE_DISTANCE;
        playerLatLng.push(MERRILL_CLASSROOM);
        playerMarker.setLatLng(MERRILL_CLASSROOM);
    }
}
