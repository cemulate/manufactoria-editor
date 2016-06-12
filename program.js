
import core from 'core';
import tmath from 'tmath';

const dir = {                     // regardless of how graphics are handled, these mean:
    UP:     new tmath.Vec2(0, 1),     // +y
    DOWN:   new tmath.Vec2(0, -1),    // -y
    LEFT:   new tmath.Vec2(-1, 0),    // -x
    RIGHT:  new tmath.Vec2(1, 0)      // +x
};

function makeCellClass(typeID) {
    return function() {
        this.type = typeID;
        this.orientation = tmath.Mat2x2.ID();
    };
};

let cellTypes = {
    Empty: makeCellClass('Empty'),
    Start: makeCellClass('Start'),
    End: makeCellClass('End'),
    Conveyor: makeCellClass('Conveyor'),
    CrossConveyor: makeCellClass('CrossConveyor'),
    BranchBR: makeCellClass('BranchBR'),
    BranchGY: makeCellClass('BranchGY'),
    WriteB: makeCellClass('WriteB'),
    WriteR: makeCellClass('WriteR'),
    WriteG: makeCellClass('WriteG'),
    WriteY: makeCellClass('WriteY')
};

class Program {

    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.cells = [];
        this.changed = new signals.Signal();

        this.metaInfo = null;

        for (let x = 0; x < cols; ++x) {
            this.cells.push([]);
            for (let y = 0; y < rows; ++y) {
                this.cells[x].push(new cellTypes.Empty());
            }
        }
    }

    getCell(x, y) {
        return this.cells[x][y];
    }

    setCell(x, y, type, orientation) {
        const s = new cellTypes[type]();

        if (orientation) {
            s.orientation = orientation;
        }

        this.cells[x][y] = s;

        this.changed.dispatch({
            event: 'set',
            x: x,
            y: y,
            type: type,
            orientation: orientation
        });
    }

    setStart(x, y) {
        this.setCell(x, y, 'Start');
    }

    setEnd(x, y) {
        this.setCell(x, y, 'End');
    }

    setDefaultStartEnd() {
        var x = Math.floor(this.cols/2);
        this.setStart(x, 0);
        this.setEnd(x, this.rows - 1);
    }

    expand() {
        // Increase program rows/cols by two, maintaining the contents
        var newRows = this.rows + 2;
        var newCols = this.cols + 2;

        var newCells = [];
        for (let x = 0; x < newCols; ++x) {
            newCells.push([]);
            for (let y = 0; y < newRows; ++y) {
                newCells[x].push(new cellTypes.Empty());
            }
        }

        for (let x = 0; x < this.cols; ++x) {
            for (let y = 0; y < this.rows; ++y) {
                var c = this.getCell(x, y);
                if (!(c.type == "Start" || c.type == "End" || c.type == "Empty")) {
                    newCells[x+1][y+1] = c;
                }
            }
        }

        this.rows = newRows;
        this.cols = newCols;
        this.cells = newCells;

        this.setDefaultStartEnd();
    }

    contract() {
        // Decrease program rows/cols by two, maintaining the contents
        var newRows = this.rows - 2;
        var newCols = this.cols - 2;

        var newCells = [];
        for (let x = 0; x < newCols; ++x) {
            newCells.push([]);
            for (let y = 0; y < newRows; ++y) {
                newCells[x].push(new cellTypes.Empty());
            }
        }

        for (let x = 0; x < this.cols - 1; ++x) {
            for (let y = 0; y < this.rows - 1; ++y) {
                var c = this.getCell(x, y);
                if (!(c.type == "Start" || c.type == "End" || c.type == "Empty")) {
                    newCells[x-1][y-1] = c;
                }
            }
        }

        this.rows = newRows;
        this.cols = newCols;
        this.cells = newCells;

        this.setDefaultStartEnd();
    }
};

function readLegacyProgramString(url) {

    // pleasingfungus.com/Manufactoria/?[lvlString]&[codeString]&[metaInfo]

    var s = url.split('?')[1];

    let i = 0;

    const attrStrings = s.split('&');
    const attrs = {};

    for (i = 0; i < attrStrings.length; i++) {
        if (attrStrings[i].startsWith('lvl=')) {
            attrs.lvl = parseInt(attrStrings[i].slice(4));
        }

        if (attrStrings[i].startsWith('code=')) {
            attrs.codeString = attrStrings[i].slice(5);
        }

        if (attrStrings[i].startsWith('ctm=')) {

            // [name];[description];[test case string];[rows/cols count];[??? always 3];[??? 1 or 0 for binary or 'normal']

            const ctmParts = attrStrings[i].slice(4).split(';');
            attrs.name = ctmParts[0];
            attrs.description = ctmParts[1];
            attrs.testCaseString = ctmParts[2];
            attrs.rows = ctmParts[3];
            attrs.cols = ctmParts[3];
        }
    }

    if (attrs.lvl < 32) {
        // The level string doesn't specify the program dimensions if it's one of the fixed levels, because it "knows" (ugh)
        var fixedSizes = [5, 5, 7, 5, 9, 9, 9, 5, 7, 9, 7, 9, 13, 13, 11, 9, 9, 11, 13, 13, 13, 13, 13, 13, 7, 7, 9, 11, 11, 13, 13];
        attrs.rows = fixedSizes[attrs.lvl - 1];
        attrs.cols = fixedSizes[attrs.lvl - 1];
    }

    // Now parse the codeString part

    const typeMap = {c: 'Conveyor', b: 'WriteB', r: 'WriteR', g: 'WriteG', y: 'WriteY', p: 'BranchBR', q: 'BranchGY', i: 'CrossConveyor'};

    const p = new Program(attrs.cols, attrs.rows);
    const parts = attrs.codeString.split(';');

    for (let i = 0; i < parts.length; i++) {

        // [type][column]:[row]f[orientation]

        const partString = parts[i].trim();

        if (partString.length == 0) continue;

        const fInd = _.indexOf(partString, 'f');
        const cInd = _.indexOf(partString, ':');

        const original = {type: partString[0], x: parseInt(partString.slice(1, cInd)), y: parseInt(partString.slice(cInd + 1, fInd)), orientation: parseInt(partString.slice(fInd + 1))};

        const cellProps = {};

        cellProps.type = typeMap[original.type];
        cellProps.x = original.x - Math.round(-0.5 * (p.cols - 9) + 8);
        cellProps.y = original.y - Math.round(-0.5 * (p.cols - 9) + 3); // Lol this coordinate system
        console.log(cellProps);

        //console.log(cellProps.type, original.orientation);
        if (cellProps.type.startsWith('Branch')) {
            if (original.orientation == 0) cellProps.orientation = tmath.Mat2x2.MROT3();
            if (original.orientation == 1) cellProps.orientation = tmath.Mat2x2.MROT2();
            if (original.orientation == 2) cellProps.orientation = tmath.Mat2x2.MROT1();
            if (original.orientation == 3) cellProps.orientation = tmath.Mat2x2.MIR();
            if (original.orientation == 4) cellProps.orientation = tmath.Mat2x2.ROT3();
            if (original.orientation == 5) cellProps.orientation = tmath.Mat2x2.ROT2();
            if (original.orientation == 6) cellProps.orientation = tmath.Mat2x2.ROT1();
            if (original.orientation == 7) cellProps.orientation = tmath.Mat2x2.ID();
        } else if (!(cellProps.type == 'CrossConveyor')) {
            if (original.orientation == 0 || original.orientation == 4) cellProps.orientation = tmath.Mat2x2.ROT3();
            if (original.orientation == 1 || original.orientation == 5) cellProps.orientation = tmath.Mat2x2.ROT2();
            if (original.orientation == 2 || original.orientation == 6) cellProps.orientation = tmath.Mat2x2.ROT1();
            if (original.orientation == 3 || original.orientation == 7) cellProps.orientation = tmath.Mat2x2.ID();
        } else {
            // CrossConveyer is weird
            if (original.orientation == 5 || original.orientation == 7) cellProps.orientation = tmath.Mat2x2.ID();
            if (original.orientation == 1 || original.orientation == 6) cellProps.orientation = tmath.Mat2x2.ROT3();
            if (original.orientation == 0 || original.orientation == 2) cellProps.orientation = tmath.Mat2x2.ROT2();
            if (original.orientation == 3 || original.orientation == 4) cellProps.orientation = tmath.Mat2x2.ROT1();
        }

        p.setCell(cellProps.x, cellProps.y, cellProps.type, cellProps.orientation);

    }

    p.setStart(Math.floor(p.cols / 2), 0);
    p.setEnd(Math.floor(p.cols / 2), p.rows - 1);

    // Need to save this in order to generate a string from this program.
    p.metaInfo = attrs;

    return p;
};

function generateLegacyProgramString(prog) {
    var lvlString = "lvl=32";
    var metaInfo = "ctm=Program;(Generated);:*;" + prog.rows + ";3;0";

    var codeParts = [];

    var reverseTypeMap = new Map([
        ['Conveyor', 'c'], ['WriteB', 'b'],   ['WriteR', 'r'],   ['WriteG', 'g'],
        ['WriteY', 'y'],   ['BranchBR', 'p'], ['BranchGY', 'q'], ['CrossConveyor', 'i']
    ]);

    var x = 0, y = 0;
    while (x < prog.rows) {
        y = 0;
        while (y < prog.rows) {
            var cell = prog.getCell(x, y);
            if (cell.type != 'Empty' && cell.type != 'Start' && cell.type != 'End') {
                var type = reverseTypeMap.get(cell.type);
                var column = x + Math.round(-0.5 * (prog.cols - 9) + 8);
                var row = y + Math.round(-0.5 * (prog.cols - 9) + 3); // Lol
                var orientation;
                if (cell.type.startsWith('Branch')) {
                    if (cell.orientation.equals(tmath.Mat2x2.kMROT3)) orientation = 0;
                    if (cell.orientation.equals(tmath.Mat2x2.kMROT2)) orientation = 1;
                    if (cell.orientation.equals(tmath.Mat2x2.kMROT1)) orientation = 2;
                    if (cell.orientation.equals(tmath.Mat2x2.kMIR)) orientation = 3;
                    if (cell.orientation.equals(tmath.Mat2x2.kROT3)) orientation = 4;
                    if (cell.orientation.equals(tmath.Mat2x2.kROT2)) orientation = 5;
                    if (cell.orientation.equals(tmath.Mat2x2.kROT1)) orientation = 6;
                    if (cell.orientation.equals(tmath.Mat2x2.kID)) orientation = 7;
                    // The remainder doesn't work with mirrored pieces yet because dihedral groups blegh.
                } else if (!(cell.type == 'CrossConveyor')) {
                    if (cell.orientation.equals(tmath.Mat2x2.kROT3)) orientation = 0;
                    if (cell.orientation.equals(tmath.Mat2x2.kROT2)) orientation = 1;
                    if (cell.orientation.equals(tmath.Mat2x2.kROT1)) orientation = 2;
                    if (cell.orientation.equals(tmath.Mat2x2.kID)) orientation = 3;
                } else {
                    if (cell.orientation.equals(tmath.Mat2x2.kID)) orientation = 5;
                    if (cell.orientation.equals(tmath.Mat2x2.kROT3)) orientation = 1;
                    if (cell.orientation.equals(tmath.Mat2x2.kROT2)) orientation = 0;
                    if (cell.orientation.equals(tmath.Mat2x2.kROT1)) orientation = 3;
                }
                codeParts.push(type + column + ":" + row + "f" + orientation);
            }
            y += 1;
        }
        x += 1;
    }

    var codeString = "code=" + codeParts.join(';');
    var final = [lvlString, codeString, metaInfo].join('&');
    return "http://pleasingfungus.com/Manufactoria/?" + final;
}

export default {
    directions: dir,
    cellTypes,
    Program,
    readLegacyProgramString,
    generateLegacyProgramString
};
