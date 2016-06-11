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
            tempProgram.setStart(4, 0);
            tempProgram.setEnd(4, 8);

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
        var testForm = $('#test-form');
        testForm.find('button:first').click(() => this.generateTestVector());
        testForm.find('button:last').click(() => this.loadFromTestVector());
        testForm.find('input').val('');

        $("#add-test").click(() => this.addTest());
    }

    clearProgramGeneratedAndLoadStrings() {
        $('#json-form').find('input').val('');
        $('#manufactoria-form').find('input').val('');
    }

    clearTestTags() {
        $(".test-success").remove();
        $(".test-failure").remove();
        $("test-form").find('input').val('');
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

    loadFromTestVector() {
        var testForm = $('#test-form');
        var testVectorString = testForm.find('input').val().trim();
        var strings = testVectorString.split(";");
        strings.map(x => this.addTest(x));
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

    generateTestVector() {
        var list = [];
        $("#test-editor").find("span.test-string").each(function () {
            list.push($(this).html());
        });
        $("#test-form").find("input").val(list.join(";"));
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

    addTest(t) {
        var el = $("<span>").prop("contenteditable", true).addClass("test-string");

        console.log(t);
        if (t != null) {
            el.html(s);
        }

        el.keydown(e => {
            if (e.which == 13) {
                e.preventDefault();
                if (e.ctrlKey) {
                    this.testProgram();
                } else {
                    this.parseTests();
                    this.addTest();
                }
                return false;
            }
            if (!(e.which >= 37 && e.which <= 40)) {
                // Wasn't the arrow keys; means it's an edit, clear the test results
                this.clearTestTags();
            }
        });
        $("#add-test").before(el);
        $("#add-test").before($("<br>"));
        el.focus();
    }

    parseTests() {

        var testVector = [];

        // [string]:[A or R][:][Output tape (optional)];

        var parts = $("#test-editor").find(".test-string");
        parts.each(function () {
            var testString = $(this).html().trim();
            var parts = testString.split(':').map(x => x.trim());
            testVector.push({
                string: parts[0],
                result: parts[1],
                output: parts.length > 2 ? parts[2] : null,
                spanElement: this
            });
        });

        this.testVector = testVector;
    }

    testProgram() {

        try {
            this.parseTests() ;
        } catch (e) {
            alert("Invalid test strings");
            return;
        }

        this.clearTestTags();

        var runner = new Interpreter();
        runner.setProgram(this.program);

        for (var t of this.testVector) {
            var inputTape = new core.Tape();
            inputTape.setFromString(t.string);

            runner.setTape(inputTape);
            runner.start();
            while (runner.running) runner.step();
            console.log(t, runner.accept);

            var resultMatch = (t.result == "A" && runner.accept) || (t.result == "R" && !runner.accept);
            var outputMatch = true;
            if (t.output != null) {
                var referenceTape = new core.Tape();
                referenceTape.setFromString(t.output);
                outputMatch = core.Tape.isEqual(runner.tape, referenceTape);
            }

            var pass = resultMatch && outputMatch;

            var tag;
            if (pass) {
                tag = $("<span>").addClass("test-success").html("PASS");
                $(t.spanElement).after(tag);
            } else {
                tag = $("<span>").addClass("test-failure").html("FAIL");
                $(t.spanElement).after(tag);
                if (t.output != null) tag.after($("<span>").addClass("test-failure").html("Ending Tape: " + runner.tape.toString()));
            }
        }
    }
}

export default App;
