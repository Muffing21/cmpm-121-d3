import "leaflet/dist/leaflet.css";
import "./style.css";
import leaflet from "leaflet";
import luck from "./luck";
import "./leafletWorkaround";
import { Board } from "./board.ts";
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

let points = 0;
const statusPanel = document.querySelector<HTMLDivElement>("#statusPanel")!;
statusPanel.innerHTML = "No points yet...";
const board = new Board(constants.TILE_DEGREES, constants.NEIGHBORHOOD_SIZE);

function makePit(i: number, j: number) {
    // const bounds = leaflet.latLngBounds([
    //     [MERRILL_CLASSROOM.lat + i * constants.TILE_DEGREES,
    //     MERRILL_CLASSROOM.lng + j * constants.TILE_DEGREES],
    //     [MERRILL_CLASSROOM.lat + (i + 1) * constants.TILE_DEGREES,
    //     MERRILL_CLASSROOM.lng + (j + 1) * constants.TILE_DEGREES],
    // ]);

    const bounds = board.getCellBounds(MERRILL_CLASSROOM, { i, j });

    const pit = leaflet.rectangle(bounds) as leaflet.Layer;

    const coinsInPit = Math.floor(luck([i, j, "initialValue"].toString()) * 10);

    const coinArray = [];

    for (let n = 0; n < coinsInPit; n++) {
        const uniqueCoin = new Coin(board.getCellForPoint(leaflet.latLng({ lat: i, lng: j })), n);
        coinArray.push(uniqueCoin);
    }


    pit.bindPopup(() => {
        let value = Math.floor(luck([i, j, "initialValue"].toString()) * 10);
        const container = document.createElement("div");
        container.innerHTML = `
                <div>There is a pit here at "${i},${j}". It has value <span id="value">${value}</span>.</div>
                <button id="poke">poke</button>
                <button id = "deposit">deposit</button>`;
        const poke = container.querySelector<HTMLButtonElement>("#poke")!;
        const deposit = container.querySelector<HTMLButtonElement>("#deposit")!;
        const noPitValue = 0;
        poke.addEventListener("click", () => {
            if (value > noPitValue) {
                value--;
                container.querySelector<HTMLSpanElement>("#value")!.innerHTML = value.toString();
                points++;
                statusPanel.innerHTML = `${points} points accumulated`;
            }
        });

        const noPoints = 0;
        deposit.addEventListener("click", () => {
            if (points > noPoints) {
                value++;
                container.querySelector<HTMLSpanElement>("#value")!.innerHTML = value.toString();
                points--;
                statusPanel.innerHTML = `${points} points accumulated`;
            }
        });
        return container;
    });
    pit.addTo(map);
}

// for (let i = -constants.NEIGHBORHOOD_SIZE; i < constants.NEIGHBORHOOD_SIZE; i++) {
//     for (let j = - constants.NEIGHBORHOOD_SIZE; j < constants.NEIGHBORHOOD_SIZE; j++) {
//         if (luck([i, j].toString()) < constants.PIT_SPAWN_PROBABILITY) {
//             console.log(i, j);
//             makePit(i, j);
//         }
//     }
// }

const cells = board.getCellsNearPoint(MERRILL_CLASSROOM);
for (const cell of cells) {
    const { i, j } = cell;
    if (luck([i, j].toString()) < constants.PIT_SPAWN_PROBABILITY) {
        console.log(cell.i, cell.j);
        makePit(i, j);
    }
}
