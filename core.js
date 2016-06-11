
import signals from 'signals.js';
import {tapeToJson} from 'loader';

/* Symbols */
let EMPTY = {symbol: 'empty'},
    RED = {symbol: 'red'},
    BLUE = {symbol: 'blue'},
    GREEN = {symbol: 'green'},
    YELLOW = {symbol: 'yellow'},

    symbols = {
        R: RED,
        B: BLUE,
        G: GREEN,
        Y: YELLOW
    };

export {RED, GREEN, BLUE, YELLOW, symbols};

/* Tape
 Represents an ordered queue of symbols
 */
export class Tape {
    constructor() {
        this.symbols = [];
        this.changed = new signals.Signal();
    }

    setFromString(s) {
        for (var c of s) {
            this.append(symbols[c]);
        }
    }

    toString() {
        var codes = {'red': 'R', 'blue': 'B', 'green': 'G', 'yellow': 'Y'};
        return this.symbols.map(x => codes[x.symbol]).join('');
    }

    head() {
        if (this.symbols.length > 0) {
            return this.symbols[0];
        } else {
            return this.symbols.EMPTY;
        }
    }

    pop() {
        if (this.symbols.length > 0) {
            var popped = this.symbols.shift();
            this.changed.dispatch('pop');
            return popped;
        } else {
            return this.symbols.EMPTY;
        }
    }

    append(s) {
        this.symbols.push(s);
        this.changed.dispatch('append');
    }

    static clone(otherTape) {
        var newTape = new Tape();
        newTape.symbols = otherTape.symbols.slice(0);
        return newTape;
    }

    static isEqual(t1, t2) {
        return tapeToJson(t1) == tapeToJson(t2);
    }

};

export default {
    Tape: Tape,
    RED: RED,
    GREEN: GREEN,
    BLUE: BLUE,
    YELLOW: YELLOW,
    symbols: symbols
};
