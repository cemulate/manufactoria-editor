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

import manufactoriaLevels from 'manufactoriaLevels';

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

var mhelper = {
    tapeToNumber: function(input) {
        if (input.length == 0) return 0;
        var s = input.replace(/R/g, "0");
        s = s.replace(/B/g, "1");
        return parseInt(s, 2);
    },
    numberToTape: function(input) {
        var b = input.toString(2);
        var s = b.replace(/0/g, "R");
        s = s.replace(/1/g, "B");
        return s;
    },
    genStringsOfLength: function(n) {
        var arrs = [];
        for (var i = 0; i < n; i ++) {
            arrs.push(['B', 'R']);
        }
        var prod = cartesianProduct(...arrs);
        return prod.map(x => x.join(''));
    },
    genStringsUpToLength: function(n) {
        var strings = [];
        for (var i = 0; i <= n; i ++) {
            strings.push(...mhelper.genStringsOfLength(i));
        }
        return strings;
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

        var otherFormatForm = $('#other-format-form');
        otherFormatForm.find('button:first').click(() => this.generateOther());
        otherFormatForm.find('button:last').click(() => $("#other-format-file-input").click());
        $("#other-format-file-input").on('change', () => this.loadFromOther());
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

    return false;
}`, -1);

        this.populateSetLevels();

        $("#test-select").on("change", e => {
            var n = $(e.target).val();
            if (n != "blank") this.loadSetLevel(parseInt(n));
        });

    }

    clearProgramGeneratedAndLoadStrings() {
        $('#json-form').find('input').val('');
        $('#manufactoria-form').find('input').val('');
    }

    loadFromOther() {
        var file = $("#other-format-file-input").get(0).files[0];
        var reader = new FileReader();
        reader.onload = () => {
            var text = reader.result;
            if ($("#other-format-select").val() == "json") {
                var prog = loader.jsonToProgram(JSON.parse(text));
                if (prog) {
                    this.levelEditor.setProgram(prog);
                    this.clearProgramGeneratedAndLoadStrings();
                } else {
                    alert("Error reading selected program file");
                }
            }
            if ($("#other-format-select").val().startsWith("esolang")) {
                alert("Format not yet supported for loading");
            }
        }

        reader.readAsText(file);
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

    generateOther() {
        var text = null;
        if ($("#other-format-select").val() == "json") {
            var json = loader.programToJson(this.levelEditor.level.program);
            var text = JSON.stringify(json);
        }
        if ($("#other-format-select").val() == "esolang") {
            var text = loader.programToEsolang(this.levelEditor.level.program, true);
        }
        var blob = new Blob([text]);
        var url = window.URL.createObjectURL(blob);
        var link = $("<a>").attr("target", "_blank").attr("href", url);
        link.get(0).click();
    }

    generateManufactoria() {
        if (this.levelEditor.level.program != null) {
            var str = program.generateLegacyProgramString(this.levelEditor.level.program);
            $('#manufactoria-form').find('input').val(str);
        }
    }

    populateSetLevels() {
        for (var level of manufactoriaLevels) {
            $("#test-select").append($("<option>").attr("value", level.number.toString()).html("Level " + level.number + " (" + level.name + ")"));
        }
    }

    loadSetLevel(n) {
        var level = manufactoriaLevels.find(x => x.number == n);
        if (level == null) return;
        this.specEditor.setValue(level.testFunction, -1);
    }

    testProgram() {

        var specFunction = this.specEditor.getValue();

        var maxLength = parseInt($("#max-length").val());
        var hangNumber = parseInt($("#hang-number").val());

        var runner = new Interpreter();
        runner.setProgram(this.levelEditor.level.program);

        var testVector = mhelper.genStringsUpToLength(maxLength);
        var testString = null;
        var numericEquivalence = false;
        eval(specFunction);

        var failed = [];

        for (var t of testVector) {

            var specResult;
            try {
                specResult = testString(t);
            } catch (e) {
                this.notifyTestError();
                return;
            }

            if (specResult == null) continue; // Skip test

            var inputTape = new core.Tape();
            inputTape.setFromString(t);

            runner.setTape(inputTape);
            var didHalt = runner.run(hangNumber);

            if (!didHalt) {
                this.notifyNonHalting(t);
                return;
            }

            var pass;

            if (typeof(specResult) == "boolean") {
                pass = (specResult == runner.accept)
                if (!pass) failed.push({input: t, correct: specResult, actual: runner.accept});
            } else if (typeof(specResult) == "string") {
                var runnerTape = runner.tape.toString();
                if (numericEquivalence) {
                    pass = (mhelper.tapeToNumber(specResult) == mhelper.tapeToNumber(runnerTape));
                } else {
                    pass = (specResult == runnerTape);
                }
                if (!pass) failed.push({input: t, correct: specResult, actual: runnerTape});
            }
        }

        this.printResults(failed);
    }

    notifyTestError() {
        $("#test-results").empty();
        $("#test-results").append($("<span>").addClass("test-failure").html("There was an error in your submitted javascript code"));
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
