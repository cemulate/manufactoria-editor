/*global radio */


import {BaseControl,
        Palette,
        TileControl,
        SizeControl} from 'gui';

import layout from 'layout';

import {Editor} from 'editor';

import {ProgramView, TapeView, colorForSymbol} from 'view';

import {Tape} from 'core';

import {Interpreter} from 'interpreter';

class LevelDisplay extends BaseControl {
    constructor(paper, x, y, width, height, level) {
        super(paper, x, y);
        this.width = width;
        this.height = height;
        this.level = level;
        this.programView = null;

        //this._createControls();
    }

    init() {

        this.programView = new ProgramView(
            this._layer,
            layout.MARGIN, layout.MARGIN,
            this.level.program,
            layout.PROGRAM_WIDTH,
            layout.PROGRAM_HEIGHT
        );
    }

    teardown() {
        this.programView.remove();
    }
}

export class LevelEditor extends LevelDisplay {
    constructor(paper, x, y, width, height, level) {
        super(paper, x, y, width, height, level);

        this.palette = null;
        this.editor = null;

        //this._createControls();
    }

    init() {
        super.init();

        const CONTROL_WIDTH = this.width - layout.CONTROL_X;

        this.palette = new Palette(
            this._layer,
            layout.CONTROL_X + CONTROL_WIDTH / 8,
            this.height / 2,
            CONTROL_WIDTH * 3 / 4,
            4
        );

        this.tileControl = new TileControl(
            this._layer,
            layout.CONTROL_X + 40, // x
            layout.MARGIN, // y
            CONTROL_WIDTH / 2 - layout.MARGIN / 2, // width
            0    // height
        );

        this.sizeControls = new SizeControl(
            this._layer,
            layout.CONTROL_X,
            this.height - 68 - layout.MARGIN,
            68
        );

        this.sizeControls.x = layout.CONTROL_X + CONTROL_WIDTH / 2 - this.sizeControls.width / 2;

        this.editor = new Editor(this._layer, this.programView, this.tileControl);

        this.programView.drawProgram();

        this.editor.enable();
    }

    teardown() {
        super.teardown();
        this.palette.remove();
        this.tileControl.remove();
        this.sizeControls.remove();
        this.editor.disable();
    }

    setProgram(p) {
        this.teardown();
        this.level.program = p;
        this.init();
    }

    onVisible() {
        super.onVisible();

        radio('size-up-clicked').subscribe([this._onSizeUpClicked, this]);
        radio('size-down-clicked').subscribe([this._onSizeDownClicked, this]);
    }

    onHidden() {
        super.onHidden();

        radio('size-up-clicked').unsubscribe(this._onSizeUpClicked);
        radio('size-down-clicked').unsubscribe(this._onSizeDownClicked);
    }

    _onSizeUpClicked() {
        // this.teardown();
        // this.level.program = this.level.program.expand();
        // this.init();
        this.setProgram(this.level.program.expand());
        radio('editor:whole-program-changed').broadcast({program: this.level.program, sender: this});
    }

    _onSizeDownClicked() {
        this.setProgram(this.level.program.contract());
        radio('editor:whole-program-changed').broadcast({program: this.level.program, sender: this});
    }
};

class TestVectorProgression {
    constructor(testCases) {
        this.testCases = testCases;
        this.index = 0;
    }

    skip() {
        this.index++;
    }

    get current() {
        if (this.index < this.testCases.length) {
            return this.testCases[this.index];
        } else {
            return null;
        }
    }

}

export class LevelRunner extends LevelDisplay {
    constructor(paper, x, y, width, height, level) {
        super(paper, x, y, width, height, level);

        this.tapeView = null;
        this.playControls = null;

        this.progression = new TestVectorProgression(this.level.testCases);
        this.currentTest = null;

        // Time between program iterations
        this.stepTime = 500;

        this._createControls();
    }

    _createControls() {
        super._createControls();

        const CONTROL_WIDTH = this.width - layout.CONTROL_X;

        this.tapeView = new TapeView(
            this._layer,
            layout.CONTROL_X,
            layout.MARGIN,
            CONTROL_WIDTH - 10,
            (CONTROL_WIDTH - 10) / 10,
            new Tape(),
            Math.floor((this.height / 2 - layout.MARGIN) / ((CONTROL_WIDTH - 10) / 10))
        );

        this.tapeView.drawTape();
        this.programView.drawProgram();
    }

    onVisible() {
        super.onVisible();

        radio('play-clicked').subscribe([this._onPlayClicked, this]);
        radio('pause-clicked').subscribe([this._onPauseClicked, this]);
        radio('stop-clicked').subscribe([this._onStopClicked, this]);
    }

    onHidden() {
        super.onHidden();

        radio('play-clicked').unsubscribe(this._onPlayClicked);
        radio('pause-clicked').unsubscribe(this._onPauseClicked);
        radio('stop-clicked').unsubscribe(this._onStopClicked);
    }

    _onPlayClicked() {
        this.start();
    }

    _onPauseClicked() {
        this.pause(true);
    }

    _onStopClicked() {
        this.stop();

        radio('runner:stop').broadcast({level: this.level, sender: this});
    }

    drawToken(mat, animate, callback) {
        if (!this.token) {
            this.token = this._layer.circle(0, 0, 10);
        }

        this._layer.append(this.token);

        // make sure token is on top
        let head = this.tapeView.tape.head(), fill;
        if (head && head.symbol != 'empty') {
            fill = colorForSymbol(head);
        } else {
            fill = '#E0E';
        }

        this.token.animate({ fill: fill }, this.stepTime / 2);
        if (!animate) {
            this.token.transform(mat);
        } else {
            this.token.animate({ transform: mat }, this.stepTime, mina.linear, () => {
                //field.drawTape();
                if (callback)
                    callback();
            });
        }
    }

    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.interpreter = new Interpreter();

        this.currentTest = this.progression.current;

        if (!this.currentTest)
            return;

        const currentTape = Tape.clone(this.currentTest.input);

        this.tapeView.setTape(currentTape);

        this.tapeView.drawTape();
        this.interpreter.setProgram(this.level.program);
        this.interpreter.setTape(currentTape);
        this.interpreter.start();
        this.update();
    }

    stop() {
        this.isRunning = false;
        this.isPaused = false;
        this.token && this.token.remove();
    }

    pause(shouldPause) {
        this.isPaused = shouldPause;
    }

    // Governor for state when game is running
    // Responsibilities are:
    // Determine if test case has been passed or failed
    // Call run
    update() {
        const test = this.currentTest, int = this.interpreter;

        if (this.isRunning) {
            if (!int.running) {
                // Interpreter has stopped
                const finishedProperly = int.accept == test.accept,

                      correctOuput = test.output.symbols.length > 0 ?
                          Tape.isEqual(int.tape, test.output) : // compare if output not empty
                          true;

                // otherwise ignore final tape
                console.log('Test finished.');
                console.log(finishedProperly && correctOuput ? 'Passed' : 'Failed');

                if (finishedProperly && correctOuput) {

                    this.progression.skip();

                    let nextTest = this.progression.current;

                    // If there is another test to run, start it
                    if (nextTest !== null) {
                        window.requestAnimationFrame(() => this.start());
                    }
                }

                this.isRunning = false;
            } else {
                this._step();
            }
        }
    }

    run() {
        // If we aren't running, set everything up and start the loop
        if (this.isRunning) {
            // We're running. See if the interpreter has stopped
            if (this.interpreter.running) {
                this._step();
            } else {
                console.log('Program stopped.');
                console.log(`Accepted: ${ this.interpreter.accept }`);
                this.isRunning = false;
            }
        }
    }

    // Calls interpreter's step and manages animation
    _step() {

        if (!this.isPaused) {

            let oldPos = this.interpreter.position,

                corner = this.exchange(
                    this.programView.gridView.getGlobalCellMatrix(oldPos.x, oldPos.y, false)
                );

            this.drawToken(corner);
            this.interpreter.step();

            let curPos = this.interpreter.position,

                curCorner = this.exchange(
                    this.programView.gridView.getGlobalCellMatrix(curPos.x, curPos.y, false)
                );

            this.drawToken(curCorner, true, this.update.bind(this));

        } else {
            requestAnimationFrame(this.update.bind(this));
        }
    }

    /**
     Convert one coordinate system to another.
     Converts from system with global matrix g to system with global matrix l

     */
    exchange(g) {
        return this._layer.transform().globalMatrix.invert().add(g);
    }
};

export class Level {
    constructor(title, program, testCases) {
        this.title = title;
        this.program = program;
        this.testCases = testCases;
    }
};
