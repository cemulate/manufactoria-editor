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

var loader = loader || {},
    core = core || {},
    codeCell = codeCell || {},
    tmath = tmath || {},
    program = program || {};

(function() {
    function isTape(t) {
        // Ensure tapeDesc only contains B,R,G,Y
        var invalidChars = t.match(/[^RGBY]/);
        if (invalidChars != null)
            return false;
        return true;
    }

    loader.isTape = isTape;

    function isOrientation(o) {
        var index = ["ID", "ROT1", "ROT2", "ROT3", "MIR", "MROT1", "MROT2", "MROT3"].indexOf(o);
        if (index == -1)
            return false;
        return true;
    }

    loader.isOrientation = isOrientation;

    function isCellType(t) {
        var validTypes = Object.keys(codeCell.codeCells);
        var index = validTypes.indexOf(t);
        if (index == -1) {
            return false;
        }
        return true;
    }

    loader.isCellType = isCellType;

    function isCoordinate(c) {
        return !isNaN(c);
    }

    loader.isCoordinate = isCoordinate;

    function hasAll(ob, required) {
        var keys = Object.keys(ob);
        return required.every(_.partial(_.contains, keys, _));
    }

    loader.hasAll = hasAll;

    function isCellDesc(cellDesc) {

        if (!hasAll(cellDesc, ["type", "x", "y", "orientation"])) {
            return false;
        }

        return allTrue([
            isCellType(cellDesc.type),
            isOrientation(cellDesc.orientation),
            isCoordinate(cellDesc.x),
            isCoordinate(cellDesc.y)
        ]);
    }

    loader.isCellDesc = isCellDesc;

    function isEndpoint(e) {
        if (!hasAll(e, ["orientation", "x", "y"])) {
            return false;
        }

        return allTrue([
            isOrientation(e.orientation),
            isCoordinate(e.x),
            isCoordinate(e.y)
        ]);
    }

    loader.isEndpoint = isEndpoint;

    function isWithinBounds(max_x, max_y) {
        return function(cell) {
            return (cell.x >= 0 && cell.x <= max_x && cell.y >= 0 && cell.y <= max_y);
        };
    }

    loader.isWithinBounds = isWithinBounds;

    function allTrue(l) {
        return l.every(function(p) {
            return Boolean(p);
        });
    }

    loader.allTrue = allTrue;

    function isProgram(p) {
        if (!hasAll(p, ["start", "end", "cols", "rows", "cells"])) {
            return false;
        }

        var basic = allTrue([
            isCoordinate(p.cols),
            isCoordinate(p.rows),
            p.cells.every(isCellDesc),
            isEndpoint(p.start),
            isEndpoint(p.end)
        ]);

        var bounds = isWithinBounds(p.cols - 1, p.rows - 1);

        return basic && p.cells.every(bounds) && bounds(p.start) && bounds(p.end);
    }

    loader.isProgram = isProgram;

    function isValid(level) {
        if (!hasAll(level, ["title", "testCases", "program"])) {
            return false;
        }

        return allTrue([
            level.testCases.every(isTestVector),
            isProgram(level.program)
        ]);
    }

    loader.isValid = isValid;

    function orientationToJson(o) {
        var mat = tmath.Mat2x2;

        if (_.isEqual(o, mat.kID))
            return "ID";
        else if (_.isEqual(o, mat.kROT1))
            return "ROT1";
        else if (_.isEqual(o, mat.kROT2))
            return "ROT2";
        else if (_.isEqual(o, mat.kROT3))
            return "ROT3";
        else if (_.isEqual(o, mat.kMIR))
            return "MIR";
        else if (_.isEqual(o, mat.kMROT1))
            return "MROT1";
        else if (_.isEqual(o, mat.kMROT2))
            return "MROT2";
        else if (_.isEqual(o, mat.kMROT3))
            return "MROT3";
        else
            return "INVALID";
    }

    loader.orientationToJson = orientationToJson;


    function jsonToOrientation(json) {
        var mat = tmath.Mat2x2;

        switch (json) {
            case "ID":
                return mat.kID;
            case "ROT1":
                return mat.kROT1;
            case "ROT2":
                return mat.kROT2;
            case "ROT3":
                return mat.kROT3;

            case "MIR":
                return mat.kMIR;
            case "MROT1":
                return mat.kROT1;
            case "MROT2":
                return mat.kROT2;
            case "MROT3":
                return mat.kROT3;
            default:
                return null;
        }
    }

    loader.jsonToOrientation = jsonToOrientation;

    function programToJson(p) {
        var json = {
            cols: p.cols,
            rows: p.rows,
            cells: [],
            start: null,
            end: null
        };

        p.cells.forEach(function(column, x) {
            column.forEach(function(cell, y){
                if (cell.type != "Empty") {
                    var ob = {x:x, y:y, orientation: orientationToJson(cell.orientation)};
                    if (cell.type == "Start")
                        json.start = ob;
                    else if (cell.type == "End")
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

    loader.programToJson = programToJson;

    function jsonToProgram(json) {
        var p = new program.Program(parseInt(json.cols), parseInt(json.rows));

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

    loader.jsonToProgram = jsonToProgram;

    function tapeToJson(t) {
        return t.symbols.reduce(
            function(prev, cur) {
                var end = "";
                if (cur == core.RED)
                    end = "R";
                if (cur == core.BLUE)
                    end = "B";
                if (cur == core.GREEN)
                    end = "G";
                if (cur == core.YELLOW)
                    end = "Y";
                return prev + end;
            },
            ""
        );

    }

    loader.tapeToJson = tapeToJson;

    function jsonToTape(json) {
        var t = new core.Tape();

        Array.prototype.forEach.call(json, function(letter) {
            t.append(core.symbols[letter]);
        });

        return t;
    }

    loader.jsonToTape = jsonToTape;

    /**
     Validate test vector string
     */
    function isTestVector(json) {
        var parts = json.split(":");

        if (parts.length < 3) {
            console.log("ERROR: test vector string does not contain all required parts");
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

    loader.isTestVector = isTestVector;

    /**
     Convert test vector object to string
     */
    function testVectorToJson(ob) {
        return [
            ob.accept ? "a" : "r",
            tapeToJson(ob.input),
            tapeToJson(ob.output),
            ob.limit
        ].join(":");
    }

    loader.testVectorToJson = testVectorToJson;

    /**
     Parse test vector string to object
     */
    function jsonToTestVector(json) {
        var parts = json.split(":"),
            accept = parts[0] == "a" ? true : false,
            input = parts[1],
            output = parts[2],
            limit = parts.length > 3 ? parseInt(parts[3]) : 0;

        if (isNaN(limit))
            limit = 0;

        return {
            accept: accept,
            input: jsonToTape(input),
            output: jsonToTape(output),
            limit: limit
        };
    }

    loader.jsonToTestVector = jsonToTestVector;

    function levelToJson(title, testCases, prog) {
        var json = {
            title: title,
            testCases: (_.isArray(testCases) ? testCases : [testCases]).map(testVectorToJson),
            program: programToJson(prog)
        };

        return json;
    }

    loader.levelToJson = levelToJson;

    function jsonToLevel(json) {
        var level = {
            title: json.title,
            testCases: json.testCases.map(jsonToTestVector),
            program: jsonToProgram(json.program)
        };

        return level;
    }

    loader.jsonToLevel = jsonToLevel;

    loader.fromJson = function(jsonString) {
        var dejsoned = JSON.parse(jsonString);
        if (!isValid(dejsoned))
            return null;

        return jsonToLevel(dejsoned);
    };

    loader.toJson = function(title, tapes, prog) {
        return JSON.stringify(levelToJson(title, tapes, prog));
    };

})();
