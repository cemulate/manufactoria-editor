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

class App {
    constructor(width, height) {
        this.program = null;
        this.interpreter = null;
        this.canvasSize = {
            width: width,
            height: height
        };
        const jsonForm = $('#json-form');
        jsonForm.find('button:first').click(this.generateJson.bind(this));
        jsonForm.find('button:last').click(this.loadFromJson.bind(this));
        jsonForm.find('input').val('');
        const manufactoriaForm = $('#manufactoria-form');
        manufactoriaForm.find('button:first').click(this.generateManufactoria.bind(this));
        manufactoriaForm.find('button:last').click(this.loadFromManufactoria.bind(this));
        manufactoriaForm.find('input').val('');

        $("#test-button").click(this.testProgram.bind(this));
    }

    clearGeneratedAndLoadStrings() {
        $('#json-form').find('input').val('');
        $('#manufactoria-form').find('input').val('');
    }

    loadFromJson() {
        const jsonForm = $('#json-form'),
              programString = jsonForm.find('input').val().trim();
        const prog = loader.jsonToProgram(JSON.parse(programString));
        if (prog) {
            this.setToProgram(prog);
            this.clearGeneratedAndLoadStrings();
        } else {
            console.log('Unable to load program string');
            return null;
        }
    }

    loadFromManufactoria() {
        const manufactoriaForm = $('#manufactoria-form'),
              programString = manufactoriaForm.find('input').val().trim();
        const prog = program.readLegacyProgramString(programString);
        console.log(prog);
        if (prog) {
            this.setToProgram(prog);
            this.clearGeneratedAndLoadStrings();
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
        var text = $("#test-strings").val();
        var strings = text.split('\n');

        var newStrings = [];

        var runner = new Interpreter();
        runner.setProgram(this.program);

        for (var s of strings) {
            var tape = new core.Tape();
            for (var c of s) {
                tape.append(core.symbols[c]);
            }

            runner.setTape(tape);
            console.log(runner);
        }
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
            this.clearGeneratedAndLoadStrings();
        });
    }
}

function setViewbox(svgel, x, y, width, height) {
    svgel.setAttribute('viewBox', [
        x,
        y,
        width,
        height
    ].join(','));
}

export default App;    /*
                        Example hash level:
                        #{"title":"Sample","tape":["BYRGGYRYRGRRGBYRGYRYRGYRGBRYRRBRBGBBYRBYRBGBRBYRRYRYRGBGGBGRYRRGRRYRYRRYRBRRBYRGGRBYRBRBYRRYRGRRGGRRRGYRBYRRRRRRBYRBBGBBRG"],"program":{"cols":9,"rows":9,"cells":[{"x":2,"y":1,"orientation":"ROT3","type":"Conveyor"},{"x":2,"y":2,"orientation":"ROT3","type":"BranchBR"},{"x":2,"y":3,"orientation":"ROT3","type":"BranchBR"},{"x":2,"y":4,"orientation":"ROT3","type":"BranchGY"},{"x":2,"y":5,"orientation":"ROT3","type":"BranchGY"},{"x":3,"y":1,"orientation":"ROT2","type":"Conveyor"},{"x":3,"y":2,"orientation":"ROT2","type":"BranchBR"},{"x":3,"y":3,"orientation":"ROT2","type":"BranchBR"},{"x":3,"y":4,"orientation":"ROT2","type":"BranchGY"},{"x":3,"y":5,"orientation":"ROT2","type":"BranchGY"},{"x":4,"y":1,"orientation":"ROT1","type":"Conveyor"},{"x":4,"y":2,"orientation":"ROT1","type":"BranchBR"},{"x":4,"y":3,"orientation":"ROT1","type":"BranchBR"},{"x":4,"y":4,"orientation":"ROT1","type":"BranchGY"},{"x":4,"y":5,"orientation":"ROT1","type":"BranchGY"},{"x":5,"y":1,"orientation":"ID","type":"Conveyor"},{"x":5,"y":2,"orientation":"MIR","type":"BranchBR"},{"x":5,"y":3,"orientation":"ID","type":"BranchBR"},{"x":5,"y":4,"orientation":"MIR","type":"BranchGY"},{"x":5,"y":5,"orientation":"ID","type":"BranchGY"}],"start":{"x":4,"y":0,"orientation":"ID"},"end":{"x":4,"y":8,"orientation":"ID"}}}
                        */
