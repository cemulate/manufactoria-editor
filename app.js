/*global radio */

import program from 'program';
import {Interpreter} from 'interpreter';
import graphics from 'graphics';
import * as view from 'view';
import tmath from 'tmath';
import loader from 'loader';
import editor from 'editor';
import core from 'core';
import {Palette, TileControl, PlayControl} from 'gui';
import {Modal} from 'modal';
import {Stage} from 'stage';

import {LevelEditor,
        LevelRunner,
        Level} from 'level';

const MARGIN = 10, // Space between elements
      PROGRAM_WIDTH = 56 * 9, // program view width, not to exceed
      PROGRAM_HEIGHT = PROGRAM_WIDTH,
      CONTROL_X = MARGIN + PROGRAM_WIDTH + MARGIN;

function setViewbox(svgel, x, y, width, height) {
    svgel.setAttribute('viewBox', [x, y, width, height].join(','));
}

function cartesianProduct(...arrays) {
    function _inner(...args) {
		if (arguments.length > 1) {
			let arr2 = args.pop(); // arr of arrs of elems
			let arr1 = args.pop(); // arr of elems
			return _inner(...args,
  			arr1.map(e1 => arr2.map(e2 => [e1, ...e2]))
  			    .reduce((arr, e) => arr.concat(e), []));
		} else {
			return args[0];
		}
	};
	return _inner(...arrays, [[]]);
};

function genStringsOfLength(n) {
    var arrs = [];
    for (var i = 0; i < n; i ++) {
        arrs.push(['B', 'R']);
    }
    var prod = cartesianProduct(...arrs);
    return prod.map(x => x.join(''));
}

var mhelper = {
    tapeToNumber: function(input) {
        var s = input.replace(/R/g, "0");
        s = s.replace(/B/g, "1");
        return parseInt(s, 2);
    },
    numberToTape: function(input) {
        var b = input.toString(2);
        var s = b.replace(/0/g, "R");
        s = s.replace(/1/g, "B");
        return s;
    }
}

class App {
    constructor(width, height) {
        this.levelEditor = null;
        this.interpreter = null;
        this.taggle = null;
        this.canvasSize = {
            width: width,
            height: height
        };
    }

    main() {
        let paper = Snap(document.getElementById('main-svg'));

        setViewbox(paper.node, 0, 0, this.canvasSize.width, this.canvasSize.height);

        const bounds = paper.node.viewBox.baseVal;
        paper.rect(bounds.x, bounds.y, bounds.width, bounds.height).addClass('game-bg');
        this.paper = paper;
        this.scratch = paper.g();

        this.stage = new Stage(paper);

        editor.init();

        graphics.preload(paper).then(() => {

            let tempProgram = new program.Program(9, 9);

            // fill in start and end with defaults
            tempProgram.setDefaultStartEnd();

            var level = new Level(
                'Test',
                tempProgram,
                [{accept: true, input: new core.Tape(), output: new core.Tape(), limit: 0}]
            );
            this.stage.clear();

            var ed = new LevelEditor(this.paper, 0, 0, this.canvasSize.width, this.canvasSize.height, level);
            ed.init();
            this.stage.push(ed);

            this.levelEditor = ed;

            this.clearProgramGeneratedAndLoadStrings();
        });

        var jsonForm = $('#json-form');
        jsonForm.find('button:first').click(() => this.generateJson());
        jsonForm.find('button:last').click(() => this.loadFromJson());
        jsonForm.find('input').val('');
        var manufactoriaForm = $('#manufactoria-form');
        manufactoriaForm.find('button:first').click(() => this.generateManufactoria());
        manufactoriaForm.find('button:last').click(() => this.loadFromManufactoria());
        manufactoriaForm.find('input').val('');

        $("#test-button").click(() => this.testProgram());
        $("#max-length").val("6");
        $("#hang-number").val("1000");

        this.specEditor = ace.edit("spec-editor");
        this.specEditor.setTheme("ace/theme/twilight");
        this.specEditor.session.setMode("ace/mode/javascript");
        this.specEditor.setValue(`testString = function(input) {
    // Input is a string of B's and R's
    // Return true or false
    // For input-output problems, return a string representing the correct state of the tape after the program has run
    // An 'mhelper' object is available with the following functions:
    //     mhelper.tapeToNumber(s): Returns the value of the tape as a number, using the convention 0=R, B=1
    //     mhelper.numberTotape(n): Returns a tape representing a number, using the convention 0=R, B=1
}`);

    }

    clearProgramGeneratedAndLoadStrings() {
        $('#json-form').find('input').val('');
        $('#manufactoria-form').find('input').val('');
    }

    loadFromJson() {
        const jsonForm = $('#json-form'),
              programString = jsonForm.find('input').val().trim();
        const prog = loader.jsonToProgram(JSON.parse(programString));
        if (prog) {
            this.levelEditor.setProgram(prog);
            this.clearProgramGeneratedAndLoadStrings();
        } else {
            console.log('Unable to load program string');
            return null;
        }
    }

    loadFromManufactoria() {
        const manufactoriaForm = $('#manufactoria-form'),
              programString = manufactoriaForm.find('input').val().trim();
        const prog = program.readLegacyProgramString(programString);
        if (prog) {
            this.levelEditor.setProgram(prog);
            this.clearProgramGeneratedAndLoadStrings();
        } else {
            console.log('Unable to load program string');
            return null;
        }
    }

    generateJson() {
        if (this.levelEditor.level.program != null) {
            var json = loader.programToJson(this.levelEditor.level.program);
            $('#json-form').find('input').val(JSON.stringify(json));
        }
    }

    generateManufactoria() {
        if (this.levelEditor.level.program != null) {
            var str = program.generateLegacyProgramString(this.levelEditor.level.program);
            $('#manufactoria-form').find('input').val(str);
        }
    }

    testProgram() {

        var specFunction = this.specEditor.getValue();

        var testString;
        console.log(mhelper);
        eval(specFunction);

        var maxLength = parseInt($("#max-length").val());
        var hangNumber = parseInt($("#hang-number").val());

        var runner = new Interpreter();
        runner.setProgram(this.levelEditor.level.program);

        var testVector = [];
        for (var i = 0; i <= maxLength; i ++) {
            testVector.push(...genStringsOfLength(i));
        }

        var failed = [];

        for (var t of testVector) {
            var inputTape = new core.Tape();
            inputTape.setFromString(t);

            runner.setTape(inputTape);
            var didHalt = runner.run(hangNumber);

            if (!didHalt) {
                this.notifyNonHalting(t);
                return;
            }

            var pass;
            var specResult = testString(t);

            if (typeof(specResult) == "boolean") {
                pass = (specResult == runner.accept)
                if (!pass) failed.push({input: t, correct: specResult, actual: runner.accept});
            } else if (typeof(specResult) == "string") {
                var runnerTape = runner.tape.toString();
                pass = (specResult == runnerTape);
                if (!pass) failed.push({input: t, correct: specResult, actual: runnerTape});
            }
        }

        this.printResults(failed);
    }

    notifyNonHalting(nonHalting) {
        $("#test-results").empty();
        $("#test-results").append($("<span>").addClass("test-failure").html("Program failed to halt in the specified number of steps on input string: " + nonHalting));
    }

    printResults(failed) {
        $("#test-results").empty();
        if (failed.length == 0) {
            $("#test-results").append($("<span>").addClass("test-success").html("Programs match behavior on all tested strings."));
        } else {
            for (var f of failed) {
                var string = "Failed on input string: " + f.input;
                $("#test-results").append($("<span>").addClass("test-failure").html(string));

                var correctString = typeof(f.correct) == "boolean" ? (f.correct ? "ACCEPT" : "REJECT") : f.correct;
                var actualString = typeof(f.actual) == "boolean" ? (f.actual ? "ACCEPT" : "REJECT") : f.actual;

                $("#test-results").append($("<span>").addClass("test-failure").html("Correct: " + correctString));
                $("#test-results").append($("<span>").addClass("test-failure").html("Actual: " + actualString));
                $("#test-results").append($("<br>"));
            }
        }
    }
}

export default App;
