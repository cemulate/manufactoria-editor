/**
 Utilities for loading and saving a program and set of tapes in JSON format

 The basic format is like this:
 {
	title: title-string,
	desc: desc-string,
	testCases: [test-case-description1, ..., test-case-description2],
 	program: { ... program-description ... },
 }

 tape-description:
 A string of the characters R,B,G,Y in any combination or order

 test-case-description:
 A test vector for the user's program. Specified using a string with this format:
 [a|r]:tape-description:tape-description[:cycle-limit]
   1           2                3              4
 1: Accept or reject
 2: Input tape (can be empty)
 3: Output tape (can be empty)
 4: Max iterations as number (optional)

 program-description:
 {
 	cols: Number,
 	rows: Number,
	cells: [ cell-description1, cell-description2 ],
 	start: {
 		x: Number,
		y: Number,
 		orientation: orientation-description
	},
	end: {
		x: Number,
		y: Number,
 		orientation: orientation-description
	}
 }

 cell-description:
 {
	type: type-description,
 	x: Number,
	y: Number,
 	orientation: orientation-description
 }

 orientation-description:
 One of the strings ID, ROT1, ROT2, ROT3, MIR, MROT1, MROT2, MROT3

 type-description:
 String specifying the type of the cell. Currently these are:
 Conveyor
 CrossConveyor
 BranchBR
 BranchGY
 WriteB
 WriteR
 WriteG
 WriteY

*/

import core from 'core';
import codeCell from 'codeCell';
import tmath from 'tmath';
import program from 'program';

function isTape(t) {
    // Ensure tapeDesc only contains B,R,G,Y
    const invalidChars = t.match(/[^RGBY]/);
    if (invalidChars != null)
        return false;
    return true;
}

function isOrientation(o) {
    const index = ['ID', 'ROT1', 'ROT2', 'ROT3', 'MIR', 'MROT1', 'MROT2', 'MROT3'].indexOf(o);
    if (index == -1)
        return false;
    return true;
}

function isCellType(t) {
    const validTypes = Object.keys(codeCell.codeCells);
    const index = validTypes.indexOf(t);
    if (index == -1) {
        return false;
    }

    return true;
}

function isCoordinate(c) {
    return !isNaN(c);
}

function hasAll(ob, required) {
    const keys = Object.keys(ob);
    return required.every(_.partial(_.contains, keys, _));
}

function isCellDesc(cellDesc) {

    if (!hasAll(cellDesc, ['type', 'x', 'y', 'orientation'])) {
        return false;
    }

    return allTrue([
        isCellType(cellDesc.type),
        isOrientation(cellDesc.orientation),
        isCoordinate(cellDesc.x),
        isCoordinate(cellDesc.y)
    ]);
}

function isEndpoint(e) {
    if (!hasAll(e, ['orientation', 'x', 'y'])) {
        return false;
    }

    return allTrue([
        isOrientation(e.orientation),
        isCoordinate(e.x),
        isCoordinate(e.y)
    ]);
}

function isWithinBounds(MAX_X, MAX_Y) {
    return function(cell) {
        return (cell.x >= 0 && cell.x <= MAX_X && cell.y >= 0 && cell.y <= MAX_Y);
    };
}

function allTrue(l) {
    return l.every(function(p) {
        return Boolean(p);
    });
}

function isProgram(p) {
    if (!hasAll(p, ['start', 'end', 'cols', 'rows', 'cells'])) {
        return false;
    }

    const basic = allTrue([
        isCoordinate(p.cols),
        isCoordinate(p.rows),
        p.cells.every(isCellDesc),
        isEndpoint(p.start),
        isEndpoint(p.end)
    ]);

    const bounds = isWithinBounds(p.cols - 1, p.rows - 1);

    return basic && p.cells.every(bounds) && bounds(p.start) && bounds(p.end);
}

function isValid(level) {
    if (!hasAll(level, ['title', 'testCases', 'program'])) {
        return false;
    }

    return allTrue([
        level.testCases.every(isTestVector),
        isProgram(level.program)
    ]);
}

function orientationToJson(o) {
    const mat = tmath.Mat2x2;

    if (_.isEqual(o, mat.kID))
        return 'ID';
    else if (_.isEqual(o, mat.kROT1))
        return 'ROT1';
    else if (_.isEqual(o, mat.kROT2))
        return 'ROT2';
    else if (_.isEqual(o, mat.kROT3))
        return 'ROT3';
    else if (_.isEqual(o, mat.kMIR))
        return 'MIR';
    else if (_.isEqual(o, mat.kMROT1))
        return 'MROT1';
    else if (_.isEqual(o, mat.kMROT2))
        return 'MROT2';
    else if (_.isEqual(o, mat.kMROT3))
        return 'MROT3';
    else
        return 'INVALID';
}

function jsonToOrientation(json) {
    const mat = tmath.Mat2x2;

    switch (json) {
        case 'ID':
            return mat.kID;
        case 'ROT1':
            return mat.kROT1;
        case 'ROT2':
            return mat.kROT2;
        case 'ROT3':
            return mat.kROT3;

        case 'MIR':
            return mat.kMIR;
        case 'MROT1':
            return mat.kROT1;
        case 'MROT2':
            return mat.kROT2;
        case 'MROT3':
            return mat.kROT3;
        default:
            return null;
    }
}

function programToJson(p) {
    const json = {
        cols: p.cols,
        rows: p.rows,
        cells: [],
        start: null,
        end: null
    };

    p.cells.forEach(function(column, x) {
        column.forEach(function(cell, y) {
            if (cell.type != 'Empty') {
                const ob = {x:x, y:y, orientation: orientationToJson(cell.orientation)};
                if (cell.type == 'Start')
                    json.start = ob;
                else if (cell.type == 'End')
                    json.end = ob;
                else {
                    ob.type = cell.type;
                    json.cells.push(ob);
                }
            }
        });
    });

    return json;

}

function jsonToProgram(json) {
    const p = new program.Program(parseInt(json.cols), parseInt(json.rows));

    json.cells.forEach(function(cell) {
        p.setCell(cell.x, cell.y, cell.type, jsonToOrientation(cell.orientation));
    });

    p.setStart(
        json.start.x,
        json.start.y,
        jsonToOrientation(json.end.orientation)
    );

    p.setEnd(
        json.end.x,
        json.end.y,
        jsonToOrientation(json.end.orientation)
    );

    return p;

}

function programToEsolang(p) {
    var out = "";

    p.cells.forEach(function(column, x) {
        var line = "";
        column.forEach(function(cell, y) {
            if (cell.type == 'Empty') line += " ";
            if (cell.type == 'Start') line += "@";
            if (cell.type == 'End') line += ";";
        });
    });
}

function esolangToProgram(elang) {

}

function tapeToJson(t) {
    return t.symbols.reduce(
        function(prev, cur) {
            let end = '';
            if (cur == core.RED)
                end = 'R';
            if (cur == core.BLUE)
                end = 'B';
            if (cur == core.GREEN)
                end = 'G';
            if (cur == core.YELLOW)
                end = 'Y';
            return prev + end;
        },

        ''
    );

}

function jsonToTape(json) {
    const t = new core.Tape();

    Array.prototype.forEach.call(json, function(letter) {
        t.append(core.symbols[letter]);
    });

    return t;
}

/**
 Validate test vector string
 */
function isTestVector(json) {
    const parts = json.split(':');

    if (parts.length < 3) {
        console.log('ERROR: test vector string does not contain all required parts');
        return false;
    }

    if (parts.length == 3) {
        parts[3] = 0; // fill in optional field with default value
    }

    return allTrue([
        parts[0].match(/^[ar]$/),
        isTape(parts[1]),
        isTape(parts[2]),
        !isNaN(parseInt(parts[3]))
    ]);
}

/**
 Convert test vector object to string
 */
function testVectorToJson(ob) {
    return [
        ob.accept ? 'a' : 'r',
        tapeToJson(ob.input),
        tapeToJson(ob.output),
        ob.limit
    ].join(':');
}

/**
 Parse test vector string to object
 */
function jsonToTestVector(json) {
    const parts = json.split(':'),
        accept = parts[0] == 'a' ? true : false,
        input = parts[1],
        output = parts[2],
        limit = parts.length > 3 ? parseInt(parts[3]) : 0;

    return {
        accept: accept,
        input: jsonToTape(input),
        output: jsonToTape(output),
        limit: isNaN(limit) ? 0 : limit
    };
}

function levelToJson(title, testCases, prog) {
    const json = {
        title: title,
        testCases: (_.isArray(testCases) ? testCases : [testCases]).map(testVectorToJson),
        program: programToJson(prog)
    };

    return json;
}

function jsonToLevel(json) {
    const level = {
        title: json.title,
        testCases: json.testCases.map(jsonToTestVector),
        program: jsonToProgram(json.program)
    };

    return level;
}

function fromJson(jsonString) {
    try {
        const dejsoned = JSON.parse(jsonString);

        if (!isValid(dejsoned))
            return null;

        return jsonToLevel(dejsoned);

    } catch (e) {
        return null;
    }


};

function toJson(title, tapes, prog) {
    return JSON.stringify(levelToJson(title, tapes, prog));
};

export {
    isTape,
    isOrientation,
    isCellType,
    isCoordinate,
    hasAll,
    isCellDesc,
    isEndpoint,
    isWithinBounds,
    allTrue,
    isProgram,
    isValid,
    orientationToJson,
    jsonToOrientation,
    programToJson,
    jsonToProgram,
    tapeToJson,
    jsonToTape,
    isTestVector,
    testVectorToJson,
    jsonToTestVector,
    levelToJson,
    jsonToLevel,
    fromJson,
    toJson
};

export default {
    fromJson,
    toJson,
    programToJson,
    jsonToProgram
};
