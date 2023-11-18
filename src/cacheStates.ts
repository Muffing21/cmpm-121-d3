// import { Coin } from "./coin.ts";

// interface Momento<T> {
//     toMomento(): T;
//     fromMomento(momento: T): void;
// }

// class Geocache implements Momento<string> {
//     i: number;
//     j: number;
//     numCoins: number;
//     constructor(i: number, j: number, numCoins: number) {
//         this.i = i;
//         this.j = j;
//         this.numCoins = numCoins;
//     }
//     toMomento() {
//         return this.numCoins.toString();
//     }
//     fromMomento(momento: string) {
//         this.numCoins = 0;
//     }
// }