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

class App {
    constructor(width, height) {
        this.program = null;
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

            this.setToProgram(tempProgram);
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
    // input is a string of B's and R's
    // return true or false
    // for input-output problems, return a string representing the correct state of the tape after the program has run

    // Example for Manufactoria level 6 (Robocats!)
    // Manufactoria implementation can be loaded with the following URL:
    // http://pleasingfungus.com/Manufactoria/?lvl=6&code=c11:5f2;p12:5f7;p13:5f7;p14:5f6;c12:4f3;c14:4f3;c14:6f0;c13:6f0;i12:6f6;c11:6f1;c15:5f3;c15:6f3;c15:7f3;c15:8f3;c15:9f3;c15:10f3;c15:11f0;c14:11f0;c13:11f0;
    return input.endsWith("BB");
}`);

        radio('editor:whole-program-changed').subscribe((info) => {
            console.log(info.program);
            this.setToProgram(info.program);
        });
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
            this.setToProgram(prog);
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
            this.setToProgram(prog);
            this.clearProgramGeneratedAndLoadStrings();
        } else {
            console.log('Unable to load program string');
            return null;
        }
    }

    generateJson() {
        if (this.program != null) {
            var json = loader.programToJson(this.program);
            $('#json-form').find('input').val(JSON.stringify(json));
        }
    }

    generateManufactoria() {
        if (this.program != null) {
            var str = program.generateLegacyProgramString(this.program);
            $('#manufactoria-form').find('input').val(str);
        }
    }

    setToProgram(prog) {
        const level = new Level(
            'Test',
            prog,
            [{accept: true, input: new core.Tape(), output: new core.Tape(), limit: 0}]
        );
        this.stage.clear();
        this.stage.push(new LevelEditor(
                this.paper,
                0, 0,
                this.canvasSize.width,
                this.canvasSize.height,
                level
            )
        );
        this.program = prog;
    }

    testProgram() {

        var specFunction = this.specEditor.getValue();

        var testString;
        eval(specFunction);

        var maxLength = parseInt($("#max-length").val());
        var hangNumber = parseInt($("#hang-number").val());

        var runner = new Interpreter();
        runner.setProgram(this.program);

        var testVector = [""];
        for (var i = 0; i < Math.pow(2, maxLength); i ++) {
            var s = i.toString(2);
            s = s.replace(/0/g, "R");
            s = s.replace(/1/g, "B");
            testVector.push(s);
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
