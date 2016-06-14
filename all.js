System.register('app', ['program', 'interpreter', 'graphics', 'view', 'tmath', 'loader', 'editor', 'core', 'gui', 'modal', 'stage', 'level', 'manufactoriaLevels'], function (_export) {
    /*global radio */

    'use strict';

    var program, Interpreter, graphics, view, tmath, loader, editor, core, Palette, TileControl, PlayControl, Modal, Stage, LevelEditor, LevelRunner, Level, manufactoriaLevels, MARGIN, PROGRAM_WIDTH, PROGRAM_HEIGHT, CONTROL_X, mhelper, App;

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function setViewbox(svgel, x, y, width, height) {
        svgel.setAttribute('viewBox', [x, y, width, height].join(','));
    }

    function cartesianProduct() {
        for (var _len = arguments.length, arrays = Array(_len), _key = 0; _key < _len; _key++) {
            arrays[_key] = arguments[_key];
        }

        function _inner() {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            if (arguments.length > 1) {
                var _ret = (function () {
                    var arr2 = args.pop(); // arr of arrs of elems
                    var arr1 = args.pop(); // arr of elems
                    return {
                        v: _inner.apply(undefined, args.concat([arr1.map(function (e1) {
                            return arr2.map(function (e2) {
                                return [e1].concat(_toConsumableArray(e2));
                            });
                        }).reduce(function (arr, e) {
                            return arr.concat(e);
                        }, [])]))
                    };
                })();

                if (typeof _ret === 'object') return _ret.v;
            } else {
                return args[0];
            }
        };
        return _inner.apply(undefined, arrays.concat([[[]]]));
    }

    function genStringsOfLength(n) {
        var arrs = [];
        for (var i = 0; i < n; i++) {
            arrs.push(['B', 'R']);
        }
        var prod = cartesianProduct.apply(undefined, arrs);
        return prod.map(function (x) {
            return x.join('');
        });
    }

    return {
        setters: [function (_program) {
            program = _program['default'];
        }, function (_interpreter) {
            Interpreter = _interpreter.Interpreter;
        }, function (_graphics) {
            graphics = _graphics['default'];
        }, function (_view) {
            view = _view;
        }, function (_tmath) {
            tmath = _tmath['default'];
        }, function (_loader) {
            loader = _loader['default'];
        }, function (_editor) {
            editor = _editor['default'];
        }, function (_core) {
            core = _core['default'];
        }, function (_gui) {
            Palette = _gui.Palette;
            TileControl = _gui.TileControl;
            PlayControl = _gui.PlayControl;
        }, function (_modal) {
            Modal = _modal.Modal;
        }, function (_stage) {
            Stage = _stage.Stage;
        }, function (_level) {
            LevelEditor = _level.LevelEditor;
            LevelRunner = _level.LevelRunner;
            Level = _level.Level;
        }, function (_manufactoriaLevels) {
            manufactoriaLevels = _manufactoriaLevels['default'];
        }],
        execute: function () {
            MARGIN = 10;
            PROGRAM_WIDTH = 56 * 9;
            PROGRAM_HEIGHT = PROGRAM_WIDTH;
            CONTROL_X = MARGIN + PROGRAM_WIDTH + MARGIN;
            ;mhelper = {
                tapeToNumber: function tapeToNumber(input) {
                    var s = input.replace(/R/g, "0");
                    s = s.replace(/B/g, "1");
                    return parseInt(s, 2);
                },
                numberToTape: function numberToTape(input) {
                    var b = input.toString(2);
                    var s = b.replace(/0/g, "R");
                    s = s.replace(/1/g, "B");
                    return s;
                }
            };

            App = (function () {
                function App(width, height) {
                    _classCallCheck(this, App);

                    this.levelEditor = null;
                    this.interpreter = null;
                    this.taggle = null;
                    this.canvasSize = {
                        width: width,
                        height: height
                    };
                }

                _createClass(App, [{
                    key: 'main',
                    value: function main() {
                        var _this = this;

                        var paper = Snap(document.getElementById('main-svg'));

                        setViewbox(paper.node, 0, 0, this.canvasSize.width, this.canvasSize.height);

                        var bounds = paper.node.viewBox.baseVal;
                        paper.rect(bounds.x, bounds.y, bounds.width, bounds.height).addClass('game-bg');
                        this.paper = paper;
                        this.scratch = paper.g();

                        this.stage = new Stage(paper);

                        editor.init();

                        graphics.preload(paper).then(function () {

                            var tempProgram = new program.Program(9, 9);

                            // fill in start and end with defaults
                            tempProgram.setDefaultStartEnd();

                            var level = new Level('Test', tempProgram, [{ accept: true, input: new core.Tape(), output: new core.Tape(), limit: 0 }]);
                            _this.stage.clear();

                            var ed = new LevelEditor(_this.paper, 0, 0, _this.canvasSize.width, _this.canvasSize.height, level);
                            ed.init();
                            _this.stage.push(ed);

                            _this.levelEditor = ed;

                            _this.clearProgramGeneratedAndLoadStrings();
                        });

                        var jsonForm = $('#json-form');
                        jsonForm.find('button:first').click(function () {
                            return _this.generateJson();
                        });
                        jsonForm.find('button:last').click(function () {
                            return _this.loadFromJson();
                        });
                        jsonForm.find('input').val('');
                        var manufactoriaForm = $('#manufactoria-form');
                        manufactoriaForm.find('button:first').click(function () {
                            return _this.generateManufactoria();
                        });
                        manufactoriaForm.find('button:last').click(function () {
                            return _this.loadFromManufactoria();
                        });
                        manufactoriaForm.find('input').val('');

                        $("#test-button").click(function () {
                            return _this.testProgram();
                        });
                        $("#max-length").val("6");
                        $("#hang-number").val("1000");

                        this.specEditor = ace.edit("spec-editor");
                        this.specEditor.setTheme("ace/theme/twilight");
                        this.specEditor.session.setMode("ace/mode/javascript");
                        this.specEditor.setValue('testString = function(input) {\n    // Input is a string of B\'s and R\'s\n    // Return true or false\n    // For input-output problems, return a string representing the correct state of the tape after the program has run\n    // An \'mhelper\' object is available with the following functions:\n    //     mhelper.tapeToNumber(s): Returns the value of the tape as a number, using the convention 0=R, B=1\n    //     mhelper.numberTotape(n): Returns a tape representing a number, using the convention 0=R, B=1\n}', -1);

                        this.populateSetLevels();

                        $("#test-select").on("change", function (e) {
                            var n = $(e.target).val();
                            if (n != "blank") _this.loadSetLevel(parseInt(n));
                        });
                    }
                }, {
                    key: 'clearProgramGeneratedAndLoadStrings',
                    value: function clearProgramGeneratedAndLoadStrings() {
                        $('#json-form').find('input').val('');
                        $('#manufactoria-form').find('input').val('');
                    }
                }, {
                    key: 'loadFromJson',
                    value: function loadFromJson() {
                        var jsonForm = $('#json-form'),
                            programString = jsonForm.find('input').val().trim();
                        var prog = loader.jsonToProgram(JSON.parse(programString));
                        if (prog) {
                            this.levelEditor.setProgram(prog);
                            this.clearProgramGeneratedAndLoadStrings();
                        } else {
                            console.log('Unable to load program string');
                            return null;
                        }
                    }
                }, {
                    key: 'loadFromManufactoria',
                    value: function loadFromManufactoria() {
                        var manufactoriaForm = $('#manufactoria-form'),
                            programString = manufactoriaForm.find('input').val().trim();
                        var prog = program.readLegacyProgramString(programString);
                        if (prog) {
                            this.levelEditor.setProgram(prog);
                            this.clearProgramGeneratedAndLoadStrings();
                        } else {
                            console.log('Unable to load program string');
                            return null;
                        }
                    }
                }, {
                    key: 'generateJson',
                    value: function generateJson() {
                        if (this.levelEditor.level.program != null) {
                            var json = loader.programToJson(this.levelEditor.level.program);
                            $('#json-form').find('input').val(JSON.stringify(json));
                        }
                    }
                }, {
                    key: 'generateManufactoria',
                    value: function generateManufactoria() {
                        if (this.levelEditor.level.program != null) {
                            var str = program.generateLegacyProgramString(this.levelEditor.level.program);
                            $('#manufactoria-form').find('input').val(str);
                        }
                    }
                }, {
                    key: 'populateSetLevels',
                    value: function populateSetLevels() {
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = manufactoriaLevels[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var level = _step.value;

                                $("#test-select").append($("<option>").attr("value", level.number.toString()).html("Level " + level.number + " (" + level.name + ")"));
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator['return']) {
                                    _iterator['return']();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }
                    }
                }, {
                    key: 'loadSetLevel',
                    value: function loadSetLevel(n) {
                        var level = manufactoriaLevels.find(function (x) {
                            return x.number == n;
                        });
                        if (level == null) return;
                        this.specEditor.setValue(level.testFunction, -1);
                        $("#test-select").val("blank");
                    }
                }, {
                    key: 'testProgram',
                    value: function testProgram() {

                        var specFunction = this.specEditor.getValue();

                        var testString;
                        console.log(mhelper);
                        eval(specFunction);

                        var maxLength = parseInt($("#max-length").val());
                        var hangNumber = parseInt($("#hang-number").val());

                        var runner = new Interpreter();
                        runner.setProgram(this.levelEditor.level.program);

                        var testVector = [];
                        for (var i = 0; i <= maxLength; i++) {
                            testVector.push.apply(testVector, _toConsumableArray(genStringsOfLength(i)));
                        }

                        var failed = [];

                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = testVector[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var t = _step2.value;

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

                                if (typeof specResult == "boolean") {
                                    pass = specResult == runner.accept;
                                    if (!pass) failed.push({ input: t, correct: specResult, actual: runner.accept });
                                } else if (typeof specResult == "string") {
                                    var runnerTape = runner.tape.toString();
                                    pass = specResult == runnerTape;
                                    if (!pass) failed.push({ input: t, correct: specResult, actual: runnerTape });
                                }
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                                    _iterator2['return']();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }

                        this.printResults(failed);
                    }
                }, {
                    key: 'notifyNonHalting',
                    value: function notifyNonHalting(nonHalting) {
                        $("#test-results").empty();
                        $("#test-results").append($("<span>").addClass("test-failure").html("Program failed to halt in the specified number of steps on input string: " + nonHalting));
                    }
                }, {
                    key: 'printResults',
                    value: function printResults(failed) {
                        $("#test-results").empty();
                        if (failed.length == 0) {
                            $("#test-results").append($("<span>").addClass("test-success").html("Programs match behavior on all tested strings."));
                        } else {
                            var _iteratorNormalCompletion3 = true;
                            var _didIteratorError3 = false;
                            var _iteratorError3 = undefined;

                            try {
                                for (var _iterator3 = failed[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                    var f = _step3.value;

                                    var string = "Failed on input string: " + f.input;
                                    $("#test-results").append($("<span>").addClass("test-failure").html(string));

                                    var correctString = typeof f.correct == "boolean" ? f.correct ? "ACCEPT" : "REJECT" : f.correct;
                                    var actualString = typeof f.actual == "boolean" ? f.actual ? "ACCEPT" : "REJECT" : f.actual;

                                    $("#test-results").append($("<span>").addClass("test-failure").html("Correct: " + correctString));
                                    $("#test-results").append($("<span>").addClass("test-failure").html("Actual: " + actualString));
                                    $("#test-results").append($("<br>"));
                                }
                            } catch (err) {
                                _didIteratorError3 = true;
                                _iteratorError3 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                                        _iterator3['return']();
                                    }
                                } finally {
                                    if (_didIteratorError3) {
                                        throw _iteratorError3;
                                    }
                                }
                            }
                        }
                    }
                }]);

                return App;
            })();

            _export('default', App);
        }
    };
});
// Space between elements
// program view width, not to exceed
System.register('codeCell', ['program', 'core'], function (_export) {
    'use strict';

    var program, core, codeCells;
    return {
        setters: [function (_program) {
            program = _program['default'];
        }, function (_core) {
            core = _core['default'];
        }],
        execute: function () {
            codeCells = {

                /**
                 Conveyor
                   Moves execution UP to the next cell
                 Makes no changes to the tape
                 */
                Conveyor: function Conveyor(head) {
                    return [false, null, program.directions.UP];
                },

                /**
                 CrossConveyor
                   Moves execution UP if the previous facing was UP or DOWN
                 Moves execution RIGHT if the previous facing was RIGHT or LEFT
                 Makes no changes to the tape
                 (This cell, like conveyor, will handle orientation implicitly by letting the default orientation be ^>)
                 */
                CrossConveyor: function CrossConveyor(head, previousFacing) {
                    if (previousFacing.equals(program.directions.UP) || previousFacing.equals(program.directions.DOWN)) {
                        return [false, null, program.directions.UP];
                    } else if (previousFacing.equals(program.directions.LEFT) || previousFacing.equals(program.directions.RIGHT)) {
                        return [false, null, program.directions.RIGHT];
                    }
                },

                /**
                 BranchBR
                   If head is RED, pop tape and move LEFT
                 If head is BLUE, pop tape and move RIGHT
                 Otherwise, don't pop and move UP
                 */
                BranchBR: function BranchBR(head) {
                    if (head === core.RED) {
                        return [true, null, program.directions.LEFT];
                    }

                    if (head === core.BLUE) {
                        return [true, null, program.directions.RIGHT];
                    }

                    return [false, null, program.directions.UP];
                },

                /**
                 BranchGY
                   If head is GREEN, pop tape and move LEFT
                 If head is YELLOW, pop tape and move RIGHT
                 Otherwise, don't pop and move UP
                 */
                BranchGY: function BranchGY(head) {
                    if (head === core.GREEN) {
                        return [true, null, program.directions.LEFT];
                    }

                    if (head === core.YELLOW) {
                        return [true, null, program.directions.RIGHT];
                    }

                    return [false, null, program.directions.UP];
                },

                /**
                 Writers
                 Append <color>
                 Move UP
                 */
                WriteB: function WriteB(head) {
                    return [false, core.BLUE, program.directions.UP];
                },

                WriteR: function WriteR(head) {
                    return [false, core.RED, program.directions.UP];
                },

                WriteG: function WriteG(head) {
                    return [false, core.GREEN, program.directions.UP];
                },

                WriteY: function WriteY(head) {
                    return [false, core.YELLOW, program.directions.UP];
                }

            };

            _export('default', {
                codeCells: codeCells
            });
        }
    };
});
System.register('copyTask', [], function (_export) {
  'use strict';

  var gulp, newer;
  return {
    setters: [],
    execute: function () {
      gulp = require('gulp');
      newer = require('gulp-newer');

      /**
       * Builds a function that makes it easy to create gulp copy tasks
       * @param  {Array<string>} defaultTasks Array into which to push tasks that are created by this fn
       * @param  {Map<string,string>} paths object literal or map that maps names to paths
       * @param  {String} defaultDest  The glob path that is the default destination when one is not provided
       * @return {fn(name,dest)}              A function taking the task name and an optional destination that
       *                                      creates copy tasks
       */
      module.exports = function (defaultTasks, paths, defaultDest) {
        if (!Array.isArray(defaultTasks)) {
          throw new Error('defaultTasks needs to be an array');
        }
        if (paths === undefined) {
          throw new Error('paths should be object literal to look names up in and find input paths');
        }
        if (defaultDest === undefined) {
          throw new Error('defaultDest should be a string output path to be used by default when not ' + 'specified or available in the paths map');
        }
        return function copyTask(name, dest) {
          if (dest === undefined) {
            if (paths.hasOwnProperty(name + 'Out')) {
              dest = paths[name + 'Out'];
            } else {
              dest = defaultDest;
            }
          }
          gulp.task(name, function () {
            return gulp.src(paths[name]).pipe(newer(dest)).pipe(gulp.dest(dest));
          });
          defaultTasks.push(name);
        };
      };
    }
  };
});
System.register('core', ['signals.js', 'loader'], function (_export) {

    /* Symbols */
    'use strict';

    var signals, tapeToJson, EMPTY, RED, BLUE, GREEN, YELLOW, symbols, Tape;

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    return {
        setters: [function (_signalsJs) {
            signals = _signalsJs['default'];
        }, function (_loader) {
            tapeToJson = _loader.tapeToJson;
        }],
        execute: function () {
            EMPTY = { symbol: 'empty' };
            RED = { symbol: 'red' };
            BLUE = { symbol: 'blue' };
            GREEN = { symbol: 'green' };
            YELLOW = { symbol: 'yellow' };
            symbols = {
                R: RED,
                B: BLUE,
                G: GREEN,
                Y: YELLOW
            };

            _export('RED', RED);

            _export('GREEN', GREEN);

            _export('BLUE', BLUE);

            _export('YELLOW', YELLOW);

            _export('symbols', symbols);

            /* Tape
             Represents an ordered queue of symbols
             */

            Tape = (function () {
                function Tape() {
                    _classCallCheck(this, Tape);

                    this.symbols = [];
                    this.changed = new signals.Signal();
                }

                _createClass(Tape, [{
                    key: 'setFromString',
                    value: function setFromString(s) {
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = s[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var c = _step.value;

                                if (c == "0") c = "R";
                                if (c == "1") c = "B";
                                this.append(symbols[c]);
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator['return']) {
                                    _iterator['return']();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }
                    }
                }, {
                    key: 'toString',
                    value: function toString() {
                        var codes = { 'red': 'R', 'blue': 'B', 'green': 'G', 'yellow': 'Y' };
                        return this.symbols.map(function (x) {
                            return codes[x.symbol];
                        }).join('');
                    }
                }, {
                    key: 'head',
                    value: function head() {
                        if (this.symbols.length > 0) {
                            return this.symbols[0];
                        } else {
                            return this.symbols.EMPTY;
                        }
                    }
                }, {
                    key: 'pop',
                    value: function pop() {
                        if (this.symbols.length > 0) {
                            var popped = this.symbols.shift();
                            this.changed.dispatch('pop');
                            return popped;
                        } else {
                            return this.symbols.EMPTY;
                        }
                    }
                }, {
                    key: 'append',
                    value: function append(s) {
                        this.symbols.push(s);
                        this.changed.dispatch('append');
                    }
                }], [{
                    key: 'clone',
                    value: function clone(otherTape) {
                        var newTape = new Tape();
                        newTape.symbols = otherTape.symbols.slice(0);
                        return newTape;
                    }
                }, {
                    key: 'isEqual',
                    value: function isEqual(t1, t2) {
                        return tapeToJson(t1) == tapeToJson(t2);
                    }
                }]);

                return Tape;
            })();

            _export('Tape', Tape);

            ;

            _export('default', {
                Tape: Tape,
                RED: RED,
                GREEN: GREEN,
                BLUE: BLUE,
                YELLOW: YELLOW,
                symbols: symbols
            });
        }
    };
});
System.register('editor', ['program', 'graphics', 'view', 'tmath'], function (_export) {
    /*global radio */

    'use strict';

    var program, graphics, view, tmath, orientationByName, isMirrored, nameFromOrientation, events, mousePosition, IDLE, PLACING, INPLACE, cycleOrientation, Editor;

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function trigger(event, args) {
        radio(event).broadcast(args);
    }

    function registerEvents(evts) {
        Object.keys(evts).forEach(function (key) {
            radio(events[key]).subscribe(evts[key]);
        });
    }

    function unregisterEvents(evts) {
        Object.keys(evts).forEach(function (key) {
            radio(events[key]).unsubscribe(evts[key]);
        });
    }

    function init() {
        document.body.addEventListener('keydown', dispatchKeyEvents);
        document.body.addEventListener('mousemove', trackMouse);
    }

    function dispatchKeyEvents(evt) {
        var data = _.clone(mousePosition),
            what = null,
            key = evt.key || String.fromCharCode(evt.keyCode).toLowerCase();

        switch (key) {
            case 'r':
                what = events.rotate;
                break;
            case 'm':
                what = events.mirror;
                break;
            case 's':
                what = events.setDirection;
                data.dir = 'UP';
                break;
            case 'd':
                what = events.setDirection;
                data.dir = 'RIGHT';
                break;
            case 'w':
                what = events.setDirection;
                data.dir = 'DOWN';
                break;
            case 'a':
                what = events.setDirection;
                data.dir = 'LEFT';
                break;
            case 'x':
                what = events['delete'];
                break;
        }

        if (!what) {
            what = events.hotKey;
            data.key = key;
        }

        trigger(what, data);
    }

    function trackMouse(evt) {
        mousePosition.x = evt.clientX;
        mousePosition.y = evt.clientY;
    }

    function cycleGenerator() {
        var os = ['UP', 'RIGHT', 'DOWN', 'LEFT'];

        return function (current) {
            if (!current) current = 'LEFT';

            var index = (os.indexOf(current) + 1) % os.length,
                oName = os[index];

            return oName;
        };
    }return {
        setters: [function (_program) {
            program = _program['default'];
        }, function (_graphics) {
            graphics = _graphics['default'];
        }, function (_view) {
            view = _view;
        }, function (_tmath) {
            tmath = _tmath['default'];
            orientationByName = _tmath.orientationByName;
            isMirrored = _tmath.isMirrored;
            nameFromOrientation = _tmath.nameFromOrientation;
        }],
        execute: function () {
            events = {
                tileSelected: 'tile-selected',
                cellSelected: 'cell-selected',
                mirror: 'mirror',
                rotate: 'rotate',
                setDirection: 'set-direction',
                'delete': 'delete',
                hotKey: 'hot-key'
            };
            ;;mousePosition = {
                x: 0,
                y: 0
            };
            IDLE = Symbol('IDLE');
            PLACING = Symbol('PLACING');
            INPLACE = Symbol('INPLACE');
            ;

            cycleOrientation = cycleGenerator();

            Editor = (function () {
                function Editor(paper, programView, tileControl) {
                    var _this = this;

                    _classCallCheck(this, Editor);

                    this.paper = paper;
                    this.programView = programView;

                    //this.tileCursor = null;
                    this.state = IDLE;

                    // this.currentTile = null;
                    // this.currentOrientation = "UP";
                    //this.mirror = false;
                    this.tileControl = tileControl;

                    this._events = {
                        tileSelected: function tileSelected(data) {
                            return _this.onTileSelected(data);
                        },
                        cellSelected: function cellSelected(data) {
                            return _this.onCellSelected(data);
                        },
                        rotate: function rotate(data) {
                            return _this.onRotateCell(data);
                        },
                        mirror: function mirror(data) {
                            return _this.onMirror(data);
                        },
                        setDirection: function setDirection(data) {
                            return _this.onSetDirection(data);
                        },
                        'delete': function _delete(data) {
                            return _this.onDelete(data);
                        }
                    };
                }

                _createClass(Editor, [{
                    key: 'enable',
                    value: function enable() {
                        registerEvents(this._events);
                        this.tileControl.show(true);
                    }
                }, {
                    key: 'disable',
                    value: function disable() {
                        //this.clearCursor();
                        unregisterEvents(this._events);
                        this.tileControl.show(false);
                    }
                }, {
                    key: 'move',
                    value: function move(evt, x, y) {
                        if (this.state == PLACING && this.tileCursor) {

                            var mousePoint = graphics.screenPointToLocal(mousePosition.x, mousePosition.y, this.paper),
                                oName = this.currentOrientation,
                                o = orientationByName(oName, this.mirror),
                                rotate = view.toTransformString(Snap.matrix(o.a, o.b, o.c, o.d, 0, 0)),
                                translate = Snap.matrix().translate(mousePoint.x - 56 / 2, mousePoint.y - 56 / 2).toTransformString().toUpperCase();

                            this.tileCursor.transform(rotate + translate);
                        }
                    }
                }, {
                    key: 'onTileSelected',
                    value: function onTileSelected(data) {

                        this.tileControl.onTileSelected(data.tile);

                        if (this.state === IDLE || this.state === PLACING) {
                            this.state = PLACING;
                        } else if (this.state === INPLACE) {
                            this.setInplace();
                        }

                        //this.currentTile = data.tile;

                        // if (this.tileCursor != null)
                        //     this.tileCursor.remove();

                        // var tileGraphic = this.paper.g(graphics.getGraphic(data.tile)),
                        //     mousePoint = graphics.screenPointToLocal(data.x, data.y, this.paper);

                        // tileGraphic.node.style.pointerEvents = "none"; // disable click events

                        // this.paper.mousemove(
                        //     this.move.bind(this)
                        // );

                        // this.tileCursor = tileGraphic;

                        // this.move(data, data.x, data.y);
                    }
                }, {
                    key: 'onCellSelected',
                    value: function onCellSelected(data) {
                        if (this.state == PLACING && this.tileControl.currentTile) {
                            // We can now place the tile

                            var curCell = this.programView.program.getCell(data.cell.x, data.cell.y);

                            if (curCell.type != 'Start' && curCell.type != 'End') {

                                this.programView.program.setCell(data.cell.x, data.cell.y, this.tileControl.currentTile, orientationByName(this.tileControl.currentOrientation, this.tileControl.mirror));

                                // Mirror mode only persists for one placing
                                if (this.tileControl.mirror) {
                                    this.tileControl.onMirror();
                                }
                            }
                        } else if (this.state == IDLE) {
                            var cellIndex = { x: data.cell.x, y: data.cell.y },
                                curCell = this.programView.program.getCell(cellIndex.x, cellIndex.y),
                                type = curCell.type;

                            if (type != 'Start' && type != 'End' && type != 'Empty') {
                                this.state = INPLACE;

                                // Highlight selected cell
                                radio('highlighted').broadcast(cellIndex);

                                this.highlightedCell = cellIndex;

                                var cellState = nameFromOrientation(curCell);

                                this.tileControl.currentOrientation = cellState.direction;
                                this.tileControl.mirror = cellState.mirrored;

                                this.tileControl.onTileSelected(curCell.type);
                            }
                        } else if (this.state == INPLACE) {

                            if (this.highlightedCell && data && data.cell) {
                                var cellIndex = { x: data.cell.x, y: data.cell.y },
                                    curCell = this.programView.program.getCell(cellIndex.x, cellIndex.y),
                                    type = curCell.type;

                                if (type != 'Start' && type != 'End' && type != 'Empty') {
                                    this.state = INPLACE;

                                    // Highlight selected cell
                                    radio('highlighted').broadcast(cellIndex);

                                    this.highlightedCell = cellIndex;

                                    var cellState = nameFromOrientation(curCell);

                                    this.tileControl.currentOrientation = cellState.direction;
                                    this.tileControl.mirror = cellState.mirrored;

                                    this.tileControl.onTileSelected(curCell.type);
                                } else if (type == 'Empty') {
                                    this.clearHighlight();
                                    this.state = IDLE;
                                }
                            } else {
                                this.clearHighlight();
                                this.state = IDLE;
                            }
                        }
                    }
                }, {
                    key: 'onRotateCell',
                    value: function onRotateCell(data) {
                        if (this.state == PLACING) {
                            this.tileControl.onRotate();
                        } else if (this.state == IDLE && data.x !== undefined && data.y !== undefined) {

                            // see if we are hovering over the programview
                            var el = Snap.getElementByPoint(data.x, data.y);
                            var info = el.data('tileInfo');

                            if (el && info) {
                                // Now have reference to cell
                                var o = info.cell.orientation,
                                    type = info.cell.type,
                                    x = info.x,
                                    y = info.y;
                                o = o.compose(tmath.Mat2x2.kROT1);

                                this.programView.program.setCell(x, y, type, o);
                            }
                        } else if (this.state === INPLACE && this.tileControl.currentTile && this.highlightedCell) {
                            // Rotate highlighted cell
                            this.tileControl.onRotate();

                            this.programView.program.setCell(this.highlightedCell.x, this.highlightedCell.y, this.tileControl.currentTile, orientationByName(this.tileControl.currentOrientation, this.tileControl.mirror));
                        }
                    }
                }, {
                    key: 'onSetDirection',
                    value: function onSetDirection(data) {
                        if (this.state == PLACING || this.state == INPLACE) {
                            this.tileControl.onSetDirection(data.dir);
                        } else if (this.state == IDLE && data && data.x && data.y) {
                            // see if we are hovering over the programview
                            var el = Snap.getElementByPoint(data.x, data.y);
                            var info = el.data('tileInfo');

                            if (el && info) {
                                // Now have reference to cell
                                var type = info.cell.type,
                                    x = info.x,
                                    y = info.y,
                                    o = info.cell.orientation,
                                    mirrored = isMirrored(o);

                                if (type != 'Start' && type != 'End' && type != 'Empty') this.programView.program.setCell(x, y, type, orientationByName(data.dir, mirrored));
                            }
                        }

                        if (this.state == INPLACE) {
                            this.setInplace();
                        }
                    }
                }, {
                    key: 'setInplace',
                    value: function setInplace() {
                        if (this.tileControl.currentTile && this.highlightedCell) {

                            this.programView.program.setCell(this.highlightedCell.x, this.highlightedCell.y, this.tileControl.currentTile, orientationByName(this.tileControl.currentOrientation, this.tileControl.mirror));
                        }
                    }
                }, {
                    key: 'onMirror',
                    value: function onMirror(data) {
                        if (this.state == PLACING || this.state == INPLACE) {
                            var noMirror = this.tileControl.currentTile == "Conveyor" || this.tileControl.currentTile == "CrossConveyor";
                            if (!noMirror) this.tileControl.onMirror();
                        } else if (this.state == IDLE && data && data.x && data.y) {
                            // see if we are hovering over the programview
                            var el = Snap.getElementByPoint(data.x, data.y);
                            var info = el.data('tileInfo');

                            if (el && info) {
                                // Now have reference to cell
                                var o = info.cell.orientation,
                                    type = info.cell.type,
                                    x = info.x,
                                    y = info.y;
                                var noMirror = type == "Conveyor" || type == "CrossConveyor";
                                o = noMirror ? o : tmath.Mat2x2.kMIR.compose(o);
                                if (type != 'Start' && type != 'End' && type != 'Empty') this.programView.program.setCell(x, y, type, o);
                            }
                        }

                        if (this.state == INPLACE) {
                            this.setInplace();
                        }
                    }
                }, {
                    key: 'clearCursor',
                    value: function clearCursor() {
                        this.state = IDLE;
                        if (this.tileCursor) {
                            this.tileCursor.remove();
                            this.tileCursor.unmousemove(this.move);
                            this.tileCursor = null;
                        }

                        this.currentTile = null;
                    }
                }, {
                    key: 'onDelete',
                    value: function onDelete(data) {
                        if (this.state == PLACING) {
                            // Reset orientation for next time
                            this.tileControl.clear();
                            this.state = IDLE;
                        } else if (this.state == IDLE && data && data.x && data.y) {
                            // see if we are hovering over the programview

                            var el = Snap.getElementByPoint(data.x, data.y),
                                info = el.data('tileInfo');

                            if (el && info) {
                                // Now have reference to cell
                                var p = info.program,
                                    type = info.cell.type,
                                    x = info.x,
                                    y = info.y;
                                if (type != 'Start' && type != 'End' && type != 'Empty') p.setCell(x, y, 'Empty');
                            }
                        } else if (this.state === INPLACE) {
                            if (this.highlightedCell) {
                                var c = this.highlightedCell;

                                this.programView.program.setCell(c.x, c.y, 'Empty');
                            }

                            this.tileControl.clear();
                            this.clearHighlight();
                            this.state = IDLE;
                        }
                    }
                }, {
                    key: 'clearHighlight',
                    value: function clearHighlight() {
                        this.highlightedCell = null;
                        this.tileControl.clear();
                        radio('unhighlighted').broadcast();
                    }
                }]);

                return Editor;
            })();

            ;

            _export('Editor', Editor);

            _export('init', init);

            _export('events', events);

            _export('trigger', trigger);

            _export('registerEvents', registerEvents);

            _export('unregisterEvents', unregisterEvents);

            _export('cycleGenerator', cycleGenerator);

            _export('default', {
                Editor: Editor,
                init: init,
                events: events,
                trigger: trigger,
                registerEvents: registerEvents,
                unregisterEvents: unregisterEvents,
                cycleGenerator: cycleGenerator
            });
        }
    };
});
System.register('graphics', [], function (_export) {
    'use strict';

    var imageMap, globalCanvas, allImagePromises, preloadPromise;

    function preload(paper) {
        globalCanvas = paper.g().attr({ visibility: 'hidden' });
        return preloadPromise;
    }

    function getGraphic(name) {
        var original = imageMap[name];

        if (original.parent() !== globalCanvas) globalCanvas.append(original);

        if (original) {
            return globalCanvas.use(original).attr({ visibility: 'visible' });
        }

        return null;
    }

    function screenPointToLocal(x, y, element) {
        var svg = element.node.ownerSVGElement || element.node,
            spt = svg.createSVGPoint(),
            mat = element.node.getScreenCTM();

        spt.x = x;
        spt.y = y;

        return spt.matrixTransform(mat.inverse());
    }

    function getSVG(url) {
        if (!getSVG.cache) {
            getSVG.cache = {};
        }

        if (getSVG.cache[url] == undefined) {
            // retrieve the graphic
            var p = new Promise(function (resolve, reject) {
                Snap.load(url, function (fragment) {
                    var g = fragment.select('g');
                    getSVG.cache[url] = Promise.resolve(g);

                    resolve(g.clone());
                });
            });

            getSVG.cache[url] = p;

            return p;
        } else {
            return Promise.resolve(getSVG.cache[url]).then(function (g) {
                return g.clone();
            });
        }
    }return {
        setters: [],
        execute: function () {
            imageMap = {
                Conveyor: 'img/conveyor.svg',
                ConveyorElbow: 'img/conveyor-elbow.svg',
                ConveyorTee: 'img/conveyor-tee.svg',
                ConveyorTeeTwo: 'img/conveyor-tee-2.svg',
                ConveyorEx: 'img/conveyor-ex.svg',
                CrossConveyor: 'img/cross-conveyor.svg',
                BranchBR: 'img/branch-br.svg',
                BranchGY: 'img/branch-gy.svg',
                WriteB: 'img/write-blue.svg',
                WriteR: 'img/write-red.svg',
                WriteY: 'img/write-yellow.svg',
                WriteG: 'img/write-green.svg',
                WriterConnector: 'img/writer-connector.svg',
                Start: 'img/start.svg',
                End: 'img/end.svg',

                DeleteButton: 'img/delete-button.svg',
                MirrorButton: 'img/mirror-button.svg',
                SizeUpButton: 'img/size-up-button.svg',
                SizeDownButton: 'img/size-down-button.svg',
                StopButton: 'img/stop-button.svg'
            };
            globalCanvas = null;
            allImagePromises = Object.keys(imageMap).map(function (key) {
                var url = imageMap[key];

                var p = getSVG(url);

                p.then(function (svg) {
                    imageMap[key] = svg;
                });

                return p;
            });
            preloadPromise = Promise.all(allImagePromises);
            ;;;

            _export('preload', preload);

            _export('getGraphic', getGraphic);

            _export('screenPointToLocal', screenPointToLocal);

            _export('default', { preload: preload, getGraphic: getGraphic, screenPointToLocal: screenPointToLocal });

            ;
        }
    };
});
System.register('gui', ['editor', 'graphics', 'codeCell', 'view', 'picker', 'tmath'], function (_export) {
    /**
     * User interaction classes
     */

    'use strict';

    var editor, graphics, codeCell, toTransformString, LockedPicker, orientationByName, BaseControl, Palette, TileControl, SizeControl;

    var _get = function get(_x8, _x9, _x10) { var _again = true; _function: while (_again) { var object = _x8, property = _x9, receiver = _x10; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x8 = parent; _x9 = property; _x10 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function makeButton(x, y, layer, image) {
        var mainClass = arguments.length <= 4 || arguments[4] === undefined ? '' : arguments[4];
        var subClass = arguments.length <= 5 || arguments[5] === undefined ? '' : arguments[5];
        var margin = arguments.length <= 6 || arguments[6] === undefined ? 1 : arguments[6];
        var r = arguments.length <= 7 || arguments[7] === undefined ? 2 : arguments[7];

        var button = layer.g(graphics.getGraphic(image));
        button.addClass(mainClass).addClass(subClass);

        var bg = button.rect(margin, margin, 32 - 2 * margin, 32 - 2 * margin, r, r).prependTo(button);
        bg.attr({ fill: 'gray' }).addClass('bg');

        button.transform('T' + x + ',' + y);

        return button;
    }
    return {
        setters: [function (_editor) {
            editor = _editor['default'];
        }, function (_graphics) {
            graphics = _graphics['default'];
        }, function (_codeCell) {
            codeCell = _codeCell['default'];
        }, function (_view) {
            toTransformString = _view.toTransformString;
        }, function (_picker) {
            LockedPicker = _picker.LockedPicker;
        }, function (_tmath) {
            orientationByName = _tmath.orientationByName;
        }],
        execute: function () {
            BaseControl = (function () {
                function BaseControl(paper, x, y) {
                    _classCallCheck(this, BaseControl);

                    this.paper = paper;
                    this._x = x;
                    this._y = y;

                    this._layer = paper.g();
                    this._translate();

                    this.visible = false;
                }

                _createClass(BaseControl, [{
                    key: '_translate',
                    value: function _translate() {
                        this._layer.transform(Snap.matrix().translate(this._x, this._y));
                    }
                }, {
                    key: 'show',
                    value: function show(shouldShow) {
                        shouldShow = shouldShow !== undefined ? shouldShow : true;
                        this._layer.attr({
                            opacity: shouldShow ? 1 : 0
                        });
                    }
                }, {
                    key: 'onVisible',
                    value: function onVisible() {
                        this.visible = true;
                    }
                }, {
                    key: 'onHidden',
                    value: function onHidden() {
                        this.visible = false;
                    }
                }, {
                    key: '_translate',
                    value: function _translate() {
                        this._layer.transform(Snap.matrix().translate(this._x, this._y));
                    }
                }, {
                    key: 'remove',
                    value: function remove() {
                        this._layer.remove();
                    }
                }, {
                    key: 'x',
                    get: function get() {
                        return this._x;
                    },
                    set: function set(_x) {
                        this._x = _x;
                        this._translate();
                    }
                }, {
                    key: 'y',
                    get: function get() {
                        return this._y;
                    },
                    set: function set(_y) {
                        this._y = _y;
                        this._translate();
                    }
                }]);

                return BaseControl;
            })();

            _export('BaseControl', BaseControl);

            ;

            Palette = (function (_BaseControl) {
                _inherits(Palette, _BaseControl);

                function Palette(paper, x, y, maxWidth, columns, margin) {
                    var _this = this;

                    _classCallCheck(this, Palette);

                    _get(Object.getPrototypeOf(Palette.prototype), 'constructor', this).call(this, paper, x, y);

                    this.columns = columns > 0 ? columns : 1; // negative columns?
                    this.columnWidth = 56;
                    this.tiles = this._layer.g();
                    this.maxWidth = maxWidth;
                    this.margin = margin || 20;
                    this.tileWidth = 56; // tiles are 56 x 56 px

                    // Get names of all types to draw
                    this.typesToDraw = Object.keys(codeCell.codeCells);

                    var actualColumns = this.columns <= this.typesToDraw.length ? this.columns : this.typesToDraw.length;

                    this.baseWidth = actualColumns * (this.tileWidth + this.margin) - this.margin;

                    this.width = this.baseWidth * this.getScale();

                    this.drawPalette();

                    this._events = {
                        hotKey: function hotKey(data) {
                            return _this.hotKey(data);
                        }
                    };

                    editor.registerEvents(this._events);
                }

                _createClass(Palette, [{
                    key: 'getScale',
                    value: function getScale() {
                        return this.maxWidth / this.baseWidth;
                    }
                }, {
                    key: 'hotKey',
                    value: function hotKey(data) {
                        var num = parseInt(data.key);
                        if (!isNaN(num) && num > 0 && num <= this.typesToDraw.length) {
                            editor.trigger(editor.events.tileSelected, {
                                tile: this.typesToDraw[num - 1],
                                x: data.x,
                                y: data.y
                            });
                        }
                    }
                }, {
                    key: 'drawPalette',
                    value: function drawPalette() {
                        this.tiles.clear();

                        var SCALE_X = this.getScale();

                        // 56 pixel tile + 10 pixel text + 10 pixel padding
                        var HEIGHT = 56 + 20,
                            WIDTH = 56 + 20,
                            cellImages = this.typesToDraw.map((function (name) {
                            var image = this.paper.g(graphics.getGraphic(name));
                            if (image != null) return { name: name, image: image };else return undefined;
                        }).bind(this)).filter(_.negate(_.isUndefined));

                        cellImages.map(function (image, index) {

                            var group = this.tiles.g(),
                                X_INDEX = index % this.columns,
                                Y_INDEX = Math.floor(index / this.columns),
                                transform = Snap.matrix().scale(SCALE_X).translate(X_INDEX * WIDTH, Y_INDEX * HEIGHT);

                            group.click(function (evt, x, y) {
                                editor.trigger(editor.events.tileSelected, {
                                    tile: image.name,
                                    event: evt,
                                    x: x,
                                    y: y
                                });
                            });

                            group.transform(transform.toTransformString());

                            var r = group.rect(-1, -1, 58, 58);
                            r.attr({
                                stroke: '#111',
                                fill: '#fff',
                                strokeWidth: 2
                            }).addClass('palette-tile-bg');

                            image.image.addClass('palette-tile');
                            group.append(image.image);

                            var label = group.text(56 / 2, HEIGHT - 8, image.name);
                            label.attr({
                                textAnchor: 'middle',
                                text: index + 1
                            }).addClass('label-text');

                            var title = Snap.parse('<title>' + image.name + '</title>');

                            group.append(title);
                        }, this);
                    }
                }]);

                return Palette;
            })(BaseControl);

            _export('Palette', Palette);

            ;

            /**
             * TileControl
             * GUI control for manipulating tile before placing
             *
             * @param {Snap.Element} paper Snap layer to place content
             * @param {number} x X coordinate
             * @param {number} y Y coordinate
             * @param {number} width Maximum width to fit content
             * @param {number} height Maximum height to fit contentxs
             */

            TileControl = (function (_BaseControl2) {
                _inherits(TileControl, _BaseControl2);

                function TileControl(paper, x, y, width, height) {
                    _classCallCheck(this, TileControl);

                    _get(Object.getPrototypeOf(TileControl.prototype), 'constructor', this).call(this, paper, x, y);

                    this.width = width;
                    this.height = height;
                    this.currentTile = null;
                    this.currentOrientation = 'UP';
                    this.mirror = false;

                    this.cycleOrientation = editor.cycleGenerator();

                    this.layer = this._layer.g();
                    this.tileLayer = this.layer.g();

                    this.tileLayer.transform('T20,20');

                    this.tileLayer.click(function (evt) {
                        editor.trigger(editor.events.rotate, {});
                    });

                    this.calculateScale();

                    var down = this._makeDirButton(32, 0, 0),
                        right = this._makeDirButton(20 + 56, 32, 90),
                        up = this._makeDirButton(32, 20 + 56, 180),
                        left = this._makeDirButton(0, 32, 270);

                    function bt(el, dir) {
                        el.click(function () {
                            return editor.trigger(editor.events.setDirection, { dir: dir });
                        });
                    }

                    bt(up, 'UP');bt(right, 'RIGHT');bt(down, 'DOWN');bt(left, 'LEFT');

                    var del = this._makeDeleteButton(96 + 32, 96 * 2 / 3, 'tile-control-button', 'delete');

                    del.click(function () {
                        return editor.trigger(editor.events['delete'], {});
                    });

                    var mirror = this._makeMirrorButton(96 + 32, 96 / 3, 'tile-control-button', 'mirror');

                    mirror.click(function () {
                        return editor.trigger(editor.events.mirror);
                    });
                }

                _createClass(TileControl, [{
                    key: '_makeDirButton',
                    value: function _makeDirButton(x, y) {
                        var angle = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

                        var button = this.layer.g();
                        button.addClass('tile-control-button').addClass('direction');

                        var rect = button.rect(1, 1, 30, 18, 2, 2).attr({ fill: 'gray' });
                        rect.addClass('bg');

                        var arrow = button.path('M6,16L16,4L26,16L6,16');
                        arrow.attr({ fill: 'white' });

                        if (angle == 90) {
                            x += 20;
                        } else if (angle == 180) {
                            y += 20;
                            x += 32;
                        } else if (angle == 270) {
                            y += 32;
                        }

                        button.transform('r' + angle + ',0,0' + 'T' + x + ',' + y);

                        return button;
                    }
                }, {
                    key: '_makeDeleteButton',
                    value: function _makeDeleteButton(x, y) {
                        return makeButton(x, y, this.layer, 'DeleteButton', 'tile-control-button', 'delete');
                    }
                }, {
                    key: '_makeMirrorButton',
                    value: function _makeMirrorButton(x, y) {
                        return makeButton(x, y, this.layer, 'MirrorButton', 'tile-control-button', 'mirror');
                    }
                }, {
                    key: 'calculateScale',
                    value: function calculateScale() {
                        /*
                         Graphics are laid out with 56x56 tile in center with 20px gutters on all other sides
                         Unscaled width = 56 + 20 + 20 = 96
                         */
                        var X_SCALE = this.width / 96;
                        this.layer.transform('s' + X_SCALE);
                    }
                }, {
                    key: 'onTileSelected',
                    value: function onTileSelected(tile) {
                        if (tile != this.currentTile) {
                            this.currentTile = tile;
                            this.drawTile();
                            this.orientTile();
                        }
                    }
                }, {
                    key: 'drawTile',
                    value: function drawTile() {
                        this.tileLayer.clear();

                        var tileGraphic = this.tileLayer.g(graphics.getGraphic(this.currentTile));

                        if (tileGraphic) {
                            this.currentGraphic = tileGraphic;
                            this.orientTile();
                        } else {
                            this.currentGraphic = null;
                        }
                    }
                }, {
                    key: 'clear',
                    value: function clear() {

                        this.tileLayer.clear();

                        this.currentGraphic = null;
                        this.currentTile = null;
                        this.currentOrientation = 'UP';
                        this.mirror = false;
                    }
                }, {
                    key: 'orientTile',
                    value: function orientTile() {
                        if (this.currentGraphic) {
                            var oName = this.currentOrientation,
                                o = orientationByName(oName, this.mirror),
                                rotate = toTransformString(Snap.matrix(o.a, o.b, o.c, o.d, 0, 0));

                            this.currentGraphic.transform(rotate + 'S' + 40 / 56);
                        }
                    }
                }, {
                    key: 'onRotate',
                    value: function onRotate() {
                        this.currentOrientation = this.cycleOrientation(this.currentOrientation);
                        this.orientTile();
                    }
                }, {
                    key: 'onSetDirection',
                    value: function onSetDirection(dir) {
                        this.currentOrientation = dir;
                        this.orientTile();
                    }
                }, {
                    key: 'onMirror',
                    value: function onMirror() {
                        this.mirror = !!!this.mirror;
                        this.orientTile();
                    }
                }]);

                return TileControl;
            })(BaseControl);

            _export('TileControl', TileControl);

            ;

            SizeControl = (function (_BaseControl3) {
                _inherits(SizeControl, _BaseControl3);

                function SizeControl(paper, x, y) {
                    var height = arguments.length <= 3 || arguments[3] === undefined ? 32 : arguments[3];

                    _classCallCheck(this, SizeControl);

                    _get(Object.getPrototypeOf(SizeControl.prototype), 'constructor', this).call(this, paper, x, y);
                    this.height = height;

                    this.buttonLayer = this._layer.g();

                    this.buttonLayer.transform('s' + height / 32);

                    this.sizeDown = makeButton(0, 0, this.buttonLayer, 'SizeDownButton', 'play-control', 'size-down');
                    this.sizeUp = makeButton(32, 0, this.buttonLayer, 'SizeUpButton', 'play-control', 'size-up');

                    this.picker = new LockedPicker({
                        el: this.buttonLayer.node,
                        children: '.play-control',
                        enableClass: 'enable',
                        disableClass: 'disable',
                        rules: {}
                    });

                    function bc(btn, which) {
                        btn.click(function () {
                            radio(which + '-clicked').broadcast();
                        });
                    }

                    bc(this.sizeUp, 'size-up');
                    bc(this.sizeDown, 'size-down');
                }

                _createClass(SizeControl, [{
                    key: 'width',
                    get: function get() {
                        return this.height * 3;
                    }
                }]);

                return SizeControl;
            })(BaseControl);

            _export('SizeControl', SizeControl);

            ;
        }
    };
});
System.register('interpreter', ['program', 'codeCell', 'tmath', 'core'], function (_export) {
    'use strict';

    var program, codeCell, tmath, core, Interpreter;

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    return {
        setters: [function (_program) {
            program = _program['default'];
        }, function (_codeCell) {
            codeCell = _codeCell['default'];
        }, function (_tmath) {
            tmath = _tmath['default'];
        }, function (_core) {
            core = _core['default'];
        }],
        execute: function () {
            Interpreter = (function () {
                function Interpreter() {
                    _classCallCheck(this, Interpreter);

                    this.tape = new core.Tape();
                    this.program = null;

                    this.accept = false;
                    this.running = false;

                    this.position = new tmath.Vec2(0, 0);
                    this.facing = program.directions.UP;

                    this.cycles = 0;
                }

                _createClass(Interpreter, [{
                    key: 'setProgram',
                    value: function setProgram(program) {
                        this.program = program;
                    }
                }, {
                    key: 'setTape',
                    value: function setTape(tape) {
                        this.tape = tape;
                    }
                }, {
                    key: 'start',
                    value: function start() {
                        this.accept = false;
                        this.running = true;
                        this.cycles = 0;

                        // Go to the start
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = _.range(this.program.cols)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var x = _step.value;
                                var _iteratorNormalCompletion2 = true;
                                var _didIteratorError2 = false;
                                var _iteratorError2 = undefined;

                                try {
                                    for (var _iterator2 = _.range(this.program.rows)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                        var y = _step2.value;

                                        if (this.program.getCell(x, y).type == 'Start') {
                                            this.position.x = x;
                                            this.position.y = y;
                                        }
                                    }
                                } catch (err) {
                                    _didIteratorError2 = true;
                                    _iteratorError2 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                                            _iterator2['return']();
                                        }
                                    } finally {
                                        if (_didIteratorError2) {
                                            throw _iteratorError2;
                                        }
                                    }
                                }
                            }

                            // Face +y;
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator['return']) {
                                    _iterator['return']();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }

                        this.facing = program.directions.UP;
                    }
                }, {
                    key: 'convertDirectionGlobalToCell',
                    value: function convertDirectionGlobalToCell(d, cell) {
                        return cell.orientation.apply(d);
                    }
                }, {
                    key: 'convertDirectionCellToGlobal',
                    value: function convertDirectionCellToGlobal(d, cell) {
                        return cell.orientation.invert().apply(d);
                    }

                    // Returns tuple [pop tape head or not (bool), symbol to push (maybe null), new facing direction]
                }, {
                    key: 'evalCell',
                    value: function evalCell(cell, tapeHead) {

                        var cellFunc = codeCell.codeCells[cell.type];

                        var result = null;

                        if (cellFunc) {
                            if (cell.type == 'CrossConveyor') {
                                // Special case. Convert this.facing into cell coordinates for CrossConveyor's function:
                                var cellFacing = this.convertDirectionGlobalToCell(this.facing, cell);
                                result = cellFunc(tapeHead, cellFacing);
                            } else {
                                // No knowledge of current facing needed
                                result = cellFunc(tapeHead);
                            }

                            // Convert cell's returned direction into global direction
                            result[2] = this.convertDirectionCellToGlobal(result[2], cell);
                            return result;
                        }

                        return [false, null, program.directions.UP];
                    }
                }, {
                    key: 'step',
                    value: function step() {

                        if (!this.running) return;

                        // Get state
                        var cell = this.program.getCell(this.position.x, this.position.y);
                        var head = this.tape.head();

                        // Check if done
                        if (cell == null || cell.type == 'Empty' || cell.type == 'Start' && this.cycles > 0) {
                            this.running = false;
                            this.accept = false;
                        } else if (cell.type == 'End') {
                            this.running = false;
                            this.accept = true;
                        } else {

                            // Evaluate cell
                            var result = this.evalCell(cell, head);

                            // Perform result
                            if (result[0]) {
                                this.tape.pop();
                            }

                            if (result[1] != null) {
                                this.tape.append(result[1]);
                            }

                            this.facing = result[2];

                            // Move 'facing' direction:
                            this.position = this.position.add(this.facing);
                            this.cycles += 1;
                        }
                    }
                }, {
                    key: 'run',
                    value: function run(n) {
                        var i = 0;
                        this.start();
                        while (this.running && i < n) {
                            this.step();
                            i += 1;
                        }
                        var halted = i < n;
                        return halted;
                    }
                }]);

                return Interpreter;
            })();

            _export('Interpreter', Interpreter);

            ;

            _export('default', {
                Interpreter: Interpreter
            });
        }
    };
});
System.register("layout", [], function (_export) {
    "use strict";

    var MARGIN, PROGRAM_WIDTH, PROGRAM_HEIGHT, CONTROL_X;
    return {
        setters: [],
        execute: function () {
            MARGIN = 10;
            PROGRAM_WIDTH = 56 * 9;
            PROGRAM_HEIGHT = PROGRAM_WIDTH;
            CONTROL_X = MARGIN + PROGRAM_WIDTH + MARGIN;

            _export("default", {
                MARGIN: MARGIN,
                PROGRAM_WIDTH: PROGRAM_WIDTH,
                PROGRAM_HEIGHT: PROGRAM_HEIGHT,
                CONTROL_X: CONTROL_X
            });
        }
    };
});
// Space between elements
// program view width, not to exceed
System.register('level', ['gui', 'layout', 'editor', 'view', 'core', 'interpreter'], function (_export) {
    /*global radio */

    'use strict';

    var BaseControl, Palette, TileControl, SizeControl, layout, Editor, ProgramView, TapeView, colorForSymbol, Tape, Interpreter, LevelDisplay, LevelEditor, TestVectorProgression, LevelRunner, Level;

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    return {
        setters: [function (_gui) {
            BaseControl = _gui.BaseControl;
            Palette = _gui.Palette;
            TileControl = _gui.TileControl;
            SizeControl = _gui.SizeControl;
        }, function (_layout) {
            layout = _layout['default'];
        }, function (_editor) {
            Editor = _editor.Editor;
        }, function (_view) {
            ProgramView = _view.ProgramView;
            TapeView = _view.TapeView;
            colorForSymbol = _view.colorForSymbol;
        }, function (_core) {
            Tape = _core.Tape;
        }, function (_interpreter) {
            Interpreter = _interpreter.Interpreter;
        }],
        execute: function () {
            LevelDisplay = (function (_BaseControl) {
                _inherits(LevelDisplay, _BaseControl);

                function LevelDisplay(paper, x, y, width, height, level) {
                    _classCallCheck(this, LevelDisplay);

                    _get(Object.getPrototypeOf(LevelDisplay.prototype), 'constructor', this).call(this, paper, x, y);
                    this.width = width;
                    this.height = height;
                    this.level = level;
                    this.programView = null;

                    //this._createControls();
                }

                _createClass(LevelDisplay, [{
                    key: 'init',
                    value: function init() {

                        this.programView = new ProgramView(this._layer, layout.MARGIN, layout.MARGIN, this.level.program, layout.PROGRAM_WIDTH, layout.PROGRAM_HEIGHT);
                    }
                }, {
                    key: 'teardown',
                    value: function teardown() {
                        this.programView.remove();
                    }
                }]);

                return LevelDisplay;
            })(BaseControl);

            LevelEditor = (function (_LevelDisplay) {
                _inherits(LevelEditor, _LevelDisplay);

                function LevelEditor(paper, x, y, width, height, level) {
                    _classCallCheck(this, LevelEditor);

                    _get(Object.getPrototypeOf(LevelEditor.prototype), 'constructor', this).call(this, paper, x, y, width, height, level);

                    this.palette = null;
                    this.editor = null;

                    //this._createControls();
                }

                _createClass(LevelEditor, [{
                    key: 'init',
                    value: function init() {
                        _get(Object.getPrototypeOf(LevelEditor.prototype), 'init', this).call(this);

                        var CONTROL_WIDTH = this.width - layout.CONTROL_X;

                        this.palette = new Palette(this._layer, layout.CONTROL_X + CONTROL_WIDTH / 8, this.height / 2, CONTROL_WIDTH * 3 / 4, 4);

                        this.tileControl = new TileControl(this._layer, layout.CONTROL_X + 40, // x
                        layout.MARGIN, // y
                        CONTROL_WIDTH / 2 - layout.MARGIN / 2, // width
                        0 // height
                        );

                        this.sizeControls = new SizeControl(this._layer, layout.CONTROL_X, this.height - 68 - layout.MARGIN, 68);

                        this.sizeControls.x = layout.CONTROL_X + CONTROL_WIDTH / 2 - this.sizeControls.width / 2;

                        this.editor = new Editor(this._layer, this.programView, this.tileControl);

                        this.programView.drawProgram();

                        this.editor.enable();
                    }
                }, {
                    key: 'teardown',
                    value: function teardown() {
                        _get(Object.getPrototypeOf(LevelEditor.prototype), 'teardown', this).call(this);
                        this.palette.remove();
                        this.tileControl.remove();
                        this.sizeControls.remove();
                        this.editor.disable();
                    }
                }, {
                    key: 'setProgram',
                    value: function setProgram(p) {
                        this.teardown();
                        this.level.program = p;
                        this.init();
                    }
                }, {
                    key: 'onVisible',
                    value: function onVisible() {
                        _get(Object.getPrototypeOf(LevelEditor.prototype), 'onVisible', this).call(this);

                        radio('size-up-clicked').subscribe([this._onSizeUpClicked, this]);
                        radio('size-down-clicked').subscribe([this._onSizeDownClicked, this]);
                    }
                }, {
                    key: 'onHidden',
                    value: function onHidden() {
                        _get(Object.getPrototypeOf(LevelEditor.prototype), 'onHidden', this).call(this);

                        radio('size-up-clicked').unsubscribe(this._onSizeUpClicked);
                        radio('size-down-clicked').unsubscribe(this._onSizeDownClicked);
                    }
                }, {
                    key: '_onSizeUpClicked',
                    value: function _onSizeUpClicked() {
                        // this.teardown();
                        // this.level.program = this.level.program.expand();
                        // this.init();
                        this.setProgram(this.level.program.expand());
                        radio('editor:whole-program-changed').broadcast({ program: this.level.program, sender: this });
                    }
                }, {
                    key: '_onSizeDownClicked',
                    value: function _onSizeDownClicked() {
                        this.setProgram(this.level.program.contract());
                        radio('editor:whole-program-changed').broadcast({ program: this.level.program, sender: this });
                    }
                }]);

                return LevelEditor;
            })(LevelDisplay);

            _export('LevelEditor', LevelEditor);

            ;

            TestVectorProgression = (function () {
                function TestVectorProgression(testCases) {
                    _classCallCheck(this, TestVectorProgression);

                    this.testCases = testCases;
                    this.index = 0;
                }

                _createClass(TestVectorProgression, [{
                    key: 'skip',
                    value: function skip() {
                        this.index++;
                    }
                }, {
                    key: 'current',
                    get: function get() {
                        if (this.index < this.testCases.length) {
                            return this.testCases[this.index];
                        } else {
                            return null;
                        }
                    }
                }]);

                return TestVectorProgression;
            })();

            LevelRunner = (function (_LevelDisplay2) {
                _inherits(LevelRunner, _LevelDisplay2);

                function LevelRunner(paper, x, y, width, height, level) {
                    _classCallCheck(this, LevelRunner);

                    _get(Object.getPrototypeOf(LevelRunner.prototype), 'constructor', this).call(this, paper, x, y, width, height, level);

                    this.tapeView = null;
                    this.playControls = null;

                    this.progression = new TestVectorProgression(this.level.testCases);
                    this.currentTest = null;

                    // Time between program iterations
                    this.stepTime = 500;

                    this._createControls();
                }

                _createClass(LevelRunner, [{
                    key: '_createControls',
                    value: function _createControls() {
                        _get(Object.getPrototypeOf(LevelRunner.prototype), '_createControls', this).call(this);

                        var CONTROL_WIDTH = this.width - layout.CONTROL_X;

                        this.tapeView = new TapeView(this._layer, layout.CONTROL_X, layout.MARGIN, CONTROL_WIDTH - 10, (CONTROL_WIDTH - 10) / 10, new Tape(), Math.floor((this.height / 2 - layout.MARGIN) / ((CONTROL_WIDTH - 10) / 10)));

                        this.tapeView.drawTape();
                        this.programView.drawProgram();
                    }
                }, {
                    key: 'onVisible',
                    value: function onVisible() {
                        _get(Object.getPrototypeOf(LevelRunner.prototype), 'onVisible', this).call(this);

                        radio('play-clicked').subscribe([this._onPlayClicked, this]);
                        radio('pause-clicked').subscribe([this._onPauseClicked, this]);
                        radio('stop-clicked').subscribe([this._onStopClicked, this]);
                    }
                }, {
                    key: 'onHidden',
                    value: function onHidden() {
                        _get(Object.getPrototypeOf(LevelRunner.prototype), 'onHidden', this).call(this);

                        radio('play-clicked').unsubscribe(this._onPlayClicked);
                        radio('pause-clicked').unsubscribe(this._onPauseClicked);
                        radio('stop-clicked').unsubscribe(this._onStopClicked);
                    }
                }, {
                    key: '_onPlayClicked',
                    value: function _onPlayClicked() {
                        this.start();
                    }
                }, {
                    key: '_onPauseClicked',
                    value: function _onPauseClicked() {
                        this.pause(true);
                    }
                }, {
                    key: '_onStopClicked',
                    value: function _onStopClicked() {
                        this.stop();

                        radio('runner:stop').broadcast({ level: this.level, sender: this });
                    }
                }, {
                    key: 'drawToken',
                    value: function drawToken(mat, animate, callback) {
                        if (!this.token) {
                            this.token = this._layer.circle(0, 0, 10);
                        }

                        this._layer.append(this.token);

                        // make sure token is on top
                        var head = this.tapeView.tape.head(),
                            fill = undefined;
                        if (head && head.symbol != 'empty') {
                            fill = colorForSymbol(head);
                        } else {
                            fill = '#E0E';
                        }

                        this.token.animate({ fill: fill }, this.stepTime / 2);
                        if (!animate) {
                            this.token.transform(mat);
                        } else {
                            this.token.animate({ transform: mat }, this.stepTime, mina.linear, function () {
                                //field.drawTape();
                                if (callback) callback();
                            });
                        }
                    }
                }, {
                    key: 'start',
                    value: function start() {
                        this.isRunning = true;
                        this.isPaused = false;
                        this.interpreter = new Interpreter();

                        this.currentTest = this.progression.current;

                        if (!this.currentTest) return;

                        var currentTape = Tape.clone(this.currentTest.input);

                        this.tapeView.setTape(currentTape);

                        this.tapeView.drawTape();
                        this.interpreter.setProgram(this.level.program);
                        this.interpreter.setTape(currentTape);
                        this.interpreter.start();
                        this.update();
                    }
                }, {
                    key: 'stop',
                    value: function stop() {
                        this.isRunning = false;
                        this.isPaused = false;
                        this.token && this.token.remove();
                    }
                }, {
                    key: 'pause',
                    value: function pause(shouldPause) {
                        this.isPaused = shouldPause;
                    }

                    // Governor for state when game is running
                    // Responsibilities are:
                    // Determine if test case has been passed or failed
                    // Call run
                }, {
                    key: 'update',
                    value: function update() {
                        var _this = this;

                        var test = this.currentTest,
                            int = this.interpreter;

                        if (this.isRunning) {
                            if (!int.running) {
                                // Interpreter has stopped
                                var finishedProperly = int.accept == test.accept,
                                    correctOuput = test.output.symbols.length > 0 ? Tape.isEqual(int.tape, test.output) : // compare if output not empty
                                true;

                                // otherwise ignore final tape
                                console.log('Test finished.');
                                console.log(finishedProperly && correctOuput ? 'Passed' : 'Failed');

                                if (finishedProperly && correctOuput) {

                                    this.progression.skip();

                                    var nextTest = this.progression.current;

                                    // If there is another test to run, start it
                                    if (nextTest !== null) {
                                        window.requestAnimationFrame(function () {
                                            return _this.start();
                                        });
                                    }
                                }

                                this.isRunning = false;
                            } else {
                                this._step();
                            }
                        }
                    }
                }, {
                    key: 'run',
                    value: function run() {
                        // If we aren't running, set everything up and start the loop
                        if (this.isRunning) {
                            // We're running. See if the interpreter has stopped
                            if (this.interpreter.running) {
                                this._step();
                            } else {
                                console.log('Program stopped.');
                                console.log('Accepted: ' + this.interpreter.accept);
                                this.isRunning = false;
                            }
                        }
                    }

                    // Calls interpreter's step and manages animation
                }, {
                    key: '_step',
                    value: function _step() {

                        if (!this.isPaused) {

                            var oldPos = this.interpreter.position,
                                corner = this.exchange(this.programView.gridView.getGlobalCellMatrix(oldPos.x, oldPos.y, false));

                            this.drawToken(corner);
                            this.interpreter.step();

                            var curPos = this.interpreter.position,
                                curCorner = this.exchange(this.programView.gridView.getGlobalCellMatrix(curPos.x, curPos.y, false));

                            this.drawToken(curCorner, true, this.update.bind(this));
                        } else {
                            requestAnimationFrame(this.update.bind(this));
                        }
                    }

                    /**
                     Convert one coordinate system to another.
                     Converts from system with global matrix g to system with global matrix l
                       */
                }, {
                    key: 'exchange',
                    value: function exchange(g) {
                        return this._layer.transform().globalMatrix.invert().add(g);
                    }
                }]);

                return LevelRunner;
            })(LevelDisplay);

            _export('LevelRunner', LevelRunner);

            ;

            Level = function Level(title, program, testCases) {
                _classCallCheck(this, Level);

                this.title = title;
                this.program = program;
                this.testCases = testCases;
            };

            _export('Level', Level);

            ;
        }
    };
});
System.register('loader', ['core', 'codeCell', 'tmath', 'program'], function (_export) {
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

    'use strict';

    var core, codeCell, tmath, program;

    function isTape(t) {
        // Ensure tapeDesc only contains B,R,G,Y
        var invalidChars = t.match(/[^RGBY]/);
        if (invalidChars != null) return false;
        return true;
    }

    function isOrientation(o) {
        var index = ['ID', 'ROT1', 'ROT2', 'ROT3', 'MIR', 'MROT1', 'MROT2', 'MROT3'].indexOf(o);
        if (index == -1) return false;
        return true;
    }

    function isCellType(t) {
        var validTypes = Object.keys(codeCell.codeCells);
        var index = validTypes.indexOf(t);
        if (index == -1) {
            return false;
        }

        return true;
    }

    function isCoordinate(c) {
        return !isNaN(c);
    }

    function hasAll(ob, required) {
        var keys = Object.keys(ob);
        return required.every(_.partial(_.contains, keys, _));
    }

    function isCellDesc(cellDesc) {

        if (!hasAll(cellDesc, ['type', 'x', 'y', 'orientation'])) {
            return false;
        }

        return allTrue([isCellType(cellDesc.type), isOrientation(cellDesc.orientation), isCoordinate(cellDesc.x), isCoordinate(cellDesc.y)]);
    }

    function isEndpoint(e) {
        if (!hasAll(e, ['orientation', 'x', 'y'])) {
            return false;
        }

        return allTrue([isOrientation(e.orientation), isCoordinate(e.x), isCoordinate(e.y)]);
    }

    function isWithinBounds(MAX_X, MAX_Y) {
        return function (cell) {
            return cell.x >= 0 && cell.x <= MAX_X && cell.y >= 0 && cell.y <= MAX_Y;
        };
    }

    function allTrue(l) {
        return l.every(function (p) {
            return Boolean(p);
        });
    }

    function isProgram(p) {
        if (!hasAll(p, ['start', 'end', 'cols', 'rows', 'cells'])) {
            return false;
        }

        var basic = allTrue([isCoordinate(p.cols), isCoordinate(p.rows), p.cells.every(isCellDesc), isEndpoint(p.start), isEndpoint(p.end)]);

        var bounds = isWithinBounds(p.cols - 1, p.rows - 1);

        return basic && p.cells.every(bounds) && bounds(p.start) && bounds(p.end);
    }

    function isValid(level) {
        if (!hasAll(level, ['title', 'testCases', 'program'])) {
            return false;
        }

        return allTrue([level.testCases.every(isTestVector), isProgram(level.program)]);
    }

    function orientationToJson(o) {
        var mat = tmath.Mat2x2;

        if (_.isEqual(o, mat.kID)) return 'ID';else if (_.isEqual(o, mat.kROT1)) return 'ROT1';else if (_.isEqual(o, mat.kROT2)) return 'ROT2';else if (_.isEqual(o, mat.kROT3)) return 'ROT3';else if (_.isEqual(o, mat.kMIR)) return 'MIR';else if (_.isEqual(o, mat.kMROT1)) return 'MROT1';else if (_.isEqual(o, mat.kMROT2)) return 'MROT2';else if (_.isEqual(o, mat.kMROT3)) return 'MROT3';else return 'INVALID';
    }

    function jsonToOrientation(json) {
        var mat = tmath.Mat2x2;

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
        var json = {
            cols: p.cols,
            rows: p.rows,
            cells: [],
            start: null,
            end: null
        };

        p.cells.forEach(function (column, x) {
            column.forEach(function (cell, y) {
                if (cell.type != 'Empty') {
                    var ob = { x: x, y: y, orientation: orientationToJson(cell.orientation) };
                    if (cell.type == 'Start') json.start = ob;else if (cell.type == 'End') json.end = ob;else {
                        ob.type = cell.type;
                        json.cells.push(ob);
                    }
                }
            });
        });

        return json;
    }

    function jsonToProgram(json) {
        var p = new program.Program(parseInt(json.cols), parseInt(json.rows));

        json.cells.forEach(function (cell) {
            p.setCell(cell.x, cell.y, cell.type, jsonToOrientation(cell.orientation));
        });

        p.setStart(json.start.x, json.start.y, jsonToOrientation(json.end.orientation));

        p.setEnd(json.end.x, json.end.y, jsonToOrientation(json.end.orientation));

        return p;
    }

    function tapeToJson(t) {
        return t.symbols.reduce(function (prev, cur) {
            var end = '';
            if (cur == core.RED) end = 'R';
            if (cur == core.BLUE) end = 'B';
            if (cur == core.GREEN) end = 'G';
            if (cur == core.YELLOW) end = 'Y';
            return prev + end;
        }, '');
    }

    function jsonToTape(json) {
        var t = new core.Tape();

        Array.prototype.forEach.call(json, function (letter) {
            t.append(core.symbols[letter]);
        });

        return t;
    }

    /**
     Validate test vector string
     */
    function isTestVector(json) {
        var parts = json.split(':');

        if (parts.length < 3) {
            console.log('ERROR: test vector string does not contain all required parts');
            return false;
        }

        if (parts.length == 3) {
            parts[3] = 0; // fill in optional field with default value
        }

        return allTrue([parts[0].match(/^[ar]$/), isTape(parts[1]), isTape(parts[2]), !isNaN(parseInt(parts[3]))]);
    }

    /**
     Convert test vector object to string
     */
    function testVectorToJson(ob) {
        return [ob.accept ? 'a' : 'r', tapeToJson(ob.input), tapeToJson(ob.output), ob.limit].join(':');
    }

    /**
     Parse test vector string to object
     */
    function jsonToTestVector(json) {
        var parts = json.split(':'),
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
        var json = {
            title: title,
            testCases: (_.isArray(testCases) ? testCases : [testCases]).map(testVectorToJson),
            program: programToJson(prog)
        };

        return json;
    }

    function jsonToLevel(json) {
        var level = {
            title: json.title,
            testCases: json.testCases.map(jsonToTestVector),
            program: jsonToProgram(json.program)
        };

        return level;
    }

    function fromJson(jsonString) {
        try {
            var dejsoned = JSON.parse(jsonString);

            if (!isValid(dejsoned)) return null;

            return jsonToLevel(dejsoned);
        } catch (e) {
            return null;
        }
    }

    function toJson(title, tapes, prog) {
        return JSON.stringify(levelToJson(title, tapes, prog));
    }return {
        setters: [function (_core) {
            core = _core['default'];
        }, function (_codeCell) {
            codeCell = _codeCell['default'];
        }, function (_tmath) {
            tmath = _tmath['default'];
        }, function (_program) {
            program = _program['default'];
        }],
        execute: function () {
            ;;

            _export('isTape', isTape);

            _export('isOrientation', isOrientation);

            _export('isCellType', isCellType);

            _export('isCoordinate', isCoordinate);

            _export('hasAll', hasAll);

            _export('isCellDesc', isCellDesc);

            _export('isEndpoint', isEndpoint);

            _export('isWithinBounds', isWithinBounds);

            _export('allTrue', allTrue);

            _export('isProgram', isProgram);

            _export('isValid', isValid);

            _export('orientationToJson', orientationToJson);

            _export('jsonToOrientation', jsonToOrientation);

            _export('programToJson', programToJson);

            _export('jsonToProgram', jsonToProgram);

            _export('tapeToJson', tapeToJson);

            _export('jsonToTape', jsonToTape);

            _export('isTestVector', isTestVector);

            _export('testVectorToJson', testVectorToJson);

            _export('jsonToTestVector', jsonToTestVector);

            _export('levelToJson', levelToJson);

            _export('jsonToLevel', jsonToLevel);

            _export('fromJson', fromJson);

            _export('toJson', toJson);

            _export('default', {
                fromJson: fromJson,
                toJson: toJson,
                programToJson: programToJson,
                jsonToProgram: jsonToProgram
            });
        }
    };
});
System.register("manufactoriaLevels", [], function (_export) {
	"use strict";

	var manufactoriaLevels, level1, level2, level3, level4, level4, level5, level6, level7, level8, level9, level10, level11, level12, level13, level14, level15, level16, level17, level18, level20;
	return {
		setters: [],
		execute: function () {
			manufactoriaLevels = [];

			_export("default", manufactoriaLevels);

			level1 = "testString = function(input) {\n\n\t// Accept everything (Recommended size limit: 5x5)\n\n\treturn true;\n\n}";
			level2 = "testString = function(input) {\n\n\t// Accept strings that start with blue\n\n\treturn input.startsWith(\"B\");\n\n}";
			level3 = "testString = function(input) {\n\n\t// Accept if string contains three or more blues\n\n\tvar b = 0;\n\tfor (var c of input) {\n\t\tif (c == \"B\") b += 1;\n\t}\n\n\treturn (b >= 3);\n\n}";
			level4 = "testString = function(input) {\n\n\t// Accept if string contains no red\n\n\treturn (input.indexOf(\"R\") == -1);\n\n}";
			level4 = "testString = function(input) {\n\n\t// Accept if string contains no red\n\n\treturn (input.indexOf(\"R\") == -1);\n\n}";
			level5 = "testString = function(input) {\n\n\t// Accept if string has alternating colors\n\n\tif (input.length == 0) return true;\n\n\tvar current = input[0];\n\tfor (var c of input.slice(1)) {\n\t\tif (c == current) return false;\n\t\tcurrent = c;\n\t}\n\n\treturn true;\n\n}";
			level6 = "testString = function(input) {\n\n\t// Accept if string ends with two blues\n\n\treturn input.endsWith(\"BB\");\n\n}";
			level7 = "testString = function(input) {\n\n\t// Accept if string begins and ends with same color\n\n\tif (input.length == 0) return true;\n\n\treturn (input[0] == input[input.length - 1]);\n\n}";
			level8 = "testString = function(input) {\n\n\t// Return input, but with the first symbol at the end\n\n\tif (input.length == 0) return \"\";\n\n\treturn input.slice(1) + input[0];\n\n}";
			level9 = "testString = function(input) {\n\n\t// Replace blue with green, and red with yellow\n\n\tvar r = input.replace(/B/g, \"G\");\n\tr = r.replace(/R/g, \"Y\");\n\treturn r;\n\n}";
			level10 = "testString = function(input) {\n\n\t// Put a green at the beginning and a yellow at the end\n\n\treturn \"G\" + input + \"Y\";\n\n}";
			level11 = "testString = function(input) {\n\n\t// With R=0, B=1, accept odd binary strings\n\n\treturn input.endsWith(\"B\");\n\n}";
			level12 = "testString = function(input) {\n\n\t// With R=0, B=1, return input multiplied by 8\n\n\tvar num = mhelper.tapeToNumber(input);\n\tnum = num * 8;\n\treturn mhelper.numberToTape(num);\n\n}";
			level13 = "testString = function(input) {\n\n\t// With R=0, B=1, return input + 1\n\n\tvar num = mhelper.tapeToNumber(input);\n\tnum += 1;\n\treturn mhelper.numberToTape(num);\n\n}";
			level14 = "testString = function(input) {\n\n\t// With R=0, B=1, subtract 1 from input\n\n\tvar num = mhelper.tapeToNumber(input);\n\tnum -= 1;\n\treturn mhelper.numberToTape(num);\n\n}";
			level15 = "testString = function(input) {\n\n\t// With R=0, B=1, accept values greater than 15\n\n\tvar num = mhelper.tapeToNumber(input);\n\treturn (num > 15);\n\n}";
			level16 = "testString = function(input) {\n\n\t// With R=0, B=1, accept powers of 4\n\n\tvar num = mhelper.tapeToNumber(input);\n\tvar check = 1;\n\twhile (check < num) {\n\t\tcheck *= 4;\n\t\tif (check == num) return true;\n\t}\n\n\treturn false;\n\n}";
			level17 = "testString = function(input) {\n\n\t// Accept strings that start with some number of blue, followed by the same number of red\n\n\tvar b = 0, r = 0;\n\tvar onBlue = true;\n\tfor (var c of input) {\n\t\tif (c == \"R\") onBlue = false;\n\t\tif ((onBlue && c == \"R\") || (!onBlue && c == \"B\")) return false;\n\t\tif (c == \"B\") b += 1;\n\t\tif (c == \"R\") r += 1;\n\t}\n\n\treturn (b == r);\n\n}";
			level18 = "testString = function(input) {\n\n\t// Accept strings that contain an equal amount of blue and red\n\n\tvar b = 0, r = 0;\n\tfor (var c of input) {\n\t\tif (c == \"B\") b += 1;\n\t\tif (c == \"R\") r += 1;\n\t}\n\n\treturn (b == r);\n\n}";

			// This one needs some more infrastructure to support
			// var level19 = `testString = function(input) {
			//
			// 	// Put a yellow in the middle of the even-length string
			//
			// 	if (input.length == 0) return "Y";
			// 	if (input.length % 2 != 0) return false;
			//
			// 	var half = input.length/2;
			//
			// 	return (input.substr(0, half) == input.substr(half, half));
			//
			// }`;

			level20 = "testString = function(input) {\n\n\t// Accept even length strings that repeat half-way through\n\n\tif (input.length == 0) return true;\n\tif (input.length % 2 != 0) return false;\n\n\tvar half = input.length/2;\n\n\treturn (input.substr(0, half) == input.substr(half, half));\n\n}";

			manufactoriaLevels.push({ number: 1, name: "Robotoast!", testFunction: level1 });
			manufactoriaLevels.push({ number: 2, name: "Robocoffee!", testFunction: level2 });
			manufactoriaLevels.push({ number: 3, name: "Robolamp!", testFunction: level3 });
			manufactoriaLevels.push({ number: 4, name: "Robofish!", testFunction: level4 });
			manufactoriaLevels.push({ number: 5, name: "Robobugs!", testFunction: level5 });
			manufactoriaLevels.push({ number: 6, name: "Robocats!", testFunction: level6 });
			manufactoriaLevels.push({ number: 7, name: "Robobears!", testFunction: level7 });
			manufactoriaLevels.push({ number: 8, name: "RC Cars!", testFunction: level8 });
			manufactoriaLevels.push({ number: 9, name: "Robocars!", testFunction: level9 });
			manufactoriaLevels.push({ number: 10, name: "Robostils!", testFunction: level10 });
			manufactoriaLevels.push({ number: 11, name: "Milidogs!", testFunction: level11 });
			manufactoriaLevels.push({ number: 12, name: "Soldiers", testFunction: level12 });
			manufactoriaLevels.push({ number: 13, name: "Officers!", testFunction: level13 });
			manufactoriaLevels.push({ number: 14, name: "Generals!", testFunction: level14 });
			manufactoriaLevels.push({ number: 15, name: "Robotanks!", testFunction: level15 });
			manufactoriaLevels.push({ number: 16, name: "Robospies!", testFunction: level16 });
			manufactoriaLevels.push({ number: 17, name: "Androids!", testFunction: level17 });
			manufactoriaLevels.push({ number: 18, name: "Robo-children!", testFunction: level18 });
			//manufactoriaLevels.push({number: 19, name: "Police!", testFunction: level19});
			manufactoriaLevels.push({ number: 20, name: "Judiciary!", testFunction: level20 });
		}
	};
});
System.register("modal", [], function (_export) {
    /*global Snap, mina */

    /**
     * Modal
     * Manages content that can be hidden or displayed at will
     * @param {Snap.Element} paper Element to add modal and content as child
     * @param {Snap.Element} content Child content to show
     * @param {number} fadeTime Time in milliseconds to take fading in and out
     */
    "use strict";

    var Modal;

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    return {
        setters: [],
        execute: function () {
            Modal = (function () {
                function Modal(paper, content) {
                    var fadeTime = arguments.length <= 2 || arguments[2] === undefined ? 300 : arguments[2];
                    var visible = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

                    _classCallCheck(this, Modal);

                    this.paper = paper;
                    this._layer = this.paper.g();
                    this.content = content;
                    this._layer.add(content);
                    this.fadeTime = fadeTime;

                    // make content invisible at start
                    if (!visible) this._layer.attr({ opacity: 0 });
                }

                _createClass(Modal, [{
                    key: "show",
                    value: function show() {
                        var _this = this;

                        var p = new Promise(function (resolve, reject) {
                            if (_this._layer.attr().opacity == 1) resolve();else if (_this.fadeTime == 0) {
                                resolve();
                                _this._layer.attr({ opacity: 1 });
                            } else {
                                _this._layer.animate({ opacity: 1 }, _this.fadeTime, mina.linear, function () {
                                    return resolve();
                                });
                            }
                        });

                        return p;
                    }
                }, {
                    key: "hide",
                    value: function hide() {
                        var _this2 = this;

                        var p = new Promise(function (resolve, reject) {
                            if (_this2._layer.attr().opacity == 0) resolve();else if (_this2.fadeTime == 0) {
                                resolve();
                                _this2._layer.attr({ opacity: 0 });
                            } else {
                                _this2._layer.animate({ opacity: 0 }, _this2.fadeTime, mina.linear, function () {
                                    return resolve();
                                });
                            }
                        });

                        return p;
                    }
                }, {
                    key: "remove",
                    value: function remove() {
                        this._layer.remove();
                    }
                }]);

                return Modal;
            })();

            _export("Modal", Modal);
        }
    };
});
System.register('picker', [], function (_export) {
    'use strict';

    var Picker, LockedPicker;

    var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    return {
        setters: [],
        execute: function () {
            Picker = (function () {
                function Picker(root) {
                    _classCallCheck(this, Picker);

                    var args = {
                        // Root element for picker
                        el: null,

                        // Selector for children
                        children: '*',

                        // Class to add to picked children
                        'class': 'picker-selected'
                    };

                    if (_.isUndefined(root)) console.log('Must pass argument to Picker constructor');

                    if (_.isObject(root)) args = _.defaults(_.clone(root), args);else args.el = root;

                    if (_.isString(args.el)) {
                        args.el = document.querySelector(args.el);
                    } else if (!_.isElement(args.el)) {
                        console.log('Must pass string or element to picker');
                    }

                    // copy properties to this
                    _.extend(this, args);
                    this._assignHandlers();
                }

                _createClass(Picker, [{
                    key: '_assignHandlers',
                    value: function _assignHandlers() {
                        var children = this.el.querySelectorAll(this.children);

                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var child = _step.value;

                                child.addEventListener('click', this._clickHandler.bind(this));
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator['return']) {
                                    _iterator['return']();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }
                    }
                }, {
                    key: '_clickHandler',
                    value: function _clickHandler(mouseEvt) {
                        this.clear();

                        var elem = mouseEvt.currentTarget;
                        elem.classList.add(this['class']);
                    }
                }, {
                    key: 'clear',
                    value: function clear() {
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = this.el.querySelectorAll(this.children)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var child = _step2.value;

                                child.classList.remove(this['class']);
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                                    _iterator2['return']();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }
                    }
                }]);

                return Picker;
            })();

            _export('Picker', Picker);

            ;

            /**
             * @class LockedPicker
             *
             * Applies classes to elements depending on rules
             *
             * Rules are specified as an object, where the key is a selector for a child
             * which, when clicked, applies the ruleset to the other children
             *
             * For example:
             * {
             *   ".play": {
             *     enable: [".pause", ".stop"],
             *     disable: [".play"]
             *   },
             *   ".pause": {
             *     enable: [".play", ".stop"],
             *     disable: [".pause"]
             *   }
             * }
             *
             * @param {Object} args Argument object
             */

            LockedPicker = (function (_Picker) {
                _inherits(LockedPicker, _Picker);

                function LockedPicker(args) {
                    _classCallCheck(this, LockedPicker);

                    _get(Object.getPrototypeOf(LockedPicker.prototype), 'constructor', this).call(this, args);

                    this.enableClass = args.enableClass || 'enable';
                    this.disableClass = args.disableClass || 'disable';
                    this.rules = args.rules || {};
                }

                _createClass(LockedPicker, [{
                    key: '_clickHandler',
                    value: function _clickHandler(evt) {
                        // try to identify which selector matches the clicked element
                        var sels = Object.keys(this.rules),
                            target = evt.currentTarget,
                            targetSel = null;

                        // Check if target is disabled, bail if it is
                        if (target.classList.contains(this.disableClass)) return;

                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = sels[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var sel = _step3.value;

                                var candidates = this.el.querySelectorAll(sel);

                                if (Array.prototype.some.call(candidates, function (el) {
                                    return el === target;
                                })) {
                                    targetSel = sel;
                                    break;
                                }
                            }
                        } catch (err) {
                            _didIteratorError3 = true;
                            _iteratorError3 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                                    _iterator3['return']();
                                }
                            } finally {
                                if (_didIteratorError3) {
                                    throw _iteratorError3;
                                }
                            }
                        }

                        if (targetSel) {
                            this.clear();
                            this.applyRule(this.rules[targetSel]);
                        }
                    }
                }, {
                    key: 'applyRule',
                    value: function applyRule(rule) {
                        var _this = this;

                        var _iteratorNormalCompletion4 = true;
                        var _didIteratorError4 = false;
                        var _iteratorError4 = undefined;

                        try {
                            for (var _iterator4 = rule.enable[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                var toEnable = _step4.value;

                                Array.prototype.forEach.call(this.el.querySelectorAll(toEnable), function (el) {
                                    return el.classList.add(_this.enableClass);
                                });
                            }
                        } catch (err) {
                            _didIteratorError4 = true;
                            _iteratorError4 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion4 && _iterator4['return']) {
                                    _iterator4['return']();
                                }
                            } finally {
                                if (_didIteratorError4) {
                                    throw _iteratorError4;
                                }
                            }
                        }

                        var _iteratorNormalCompletion5 = true;
                        var _didIteratorError5 = false;
                        var _iteratorError5 = undefined;

                        try {
                            for (var _iterator5 = rule.disable[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                var toDisable = _step5.value;

                                Array.prototype.forEach.call(this.el.querySelectorAll(toDisable), function (el) {
                                    return el.classList.add(_this.disableClass);
                                });
                            }
                        } catch (err) {
                            _didIteratorError5 = true;
                            _iteratorError5 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion5 && _iterator5['return']) {
                                    _iterator5['return']();
                                }
                            } finally {
                                if (_didIteratorError5) {
                                    throw _iteratorError5;
                                }
                            }
                        }
                    }
                }, {
                    key: 'clear',
                    value: function clear() {
                        var _iteratorNormalCompletion6 = true;
                        var _didIteratorError6 = false;
                        var _iteratorError6 = undefined;

                        try {
                            for (var _iterator6 = this.el.querySelectorAll(this.children)[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                var child = _step6.value;

                                child.classList.remove(this.enableClass, this.disableClass);
                            }
                        } catch (err) {
                            _didIteratorError6 = true;
                            _iteratorError6 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion6 && _iterator6['return']) {
                                    _iterator6['return']();
                                }
                            } finally {
                                if (_didIteratorError6) {
                                    throw _iteratorError6;
                                }
                            }
                        }
                    }
                }]);

                return LockedPicker;
            })(Picker);

            _export('LockedPicker', LockedPicker);

            ;
        }
    };
});
System.register('program', ['core', 'tmath'], function (_export) {
    'use strict';

    var core, tmath, dir, cellTypes, Program;

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    // +x

    function makeCellClass(typeID) {
        return function () {
            this.type = typeID;
            this.orientation = tmath.Mat2x2.ID();
        };
    }

    function readLegacyProgramString(url) {

        // pleasingfungus.com/Manufactoria/?[lvlString]&[codeString]&[metaInfo]

        var s = url.split('?')[1];

        var i = 0;

        var attrStrings = s.split('&');
        var attrs = {};

        for (i = 0; i < attrStrings.length; i++) {
            if (attrStrings[i].startsWith('lvl=')) {
                attrs.lvl = parseInt(attrStrings[i].slice(4));
            }

            if (attrStrings[i].startsWith('code=')) {
                attrs.codeString = attrStrings[i].slice(5);
            }

            if (attrStrings[i].startsWith('ctm=')) {

                // [name];[description];[test case string];[rows/cols count];[??? always 3];[??? 1 or 0 for binary or 'normal']

                var ctmParts = attrStrings[i].slice(4).split(';');
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

        var typeMap = { c: 'Conveyor', b: 'WriteB', r: 'WriteR', g: 'WriteG', y: 'WriteY', p: 'BranchBR', q: 'BranchGY', i: 'CrossConveyor' };

        var p = new Program(attrs.cols, attrs.rows);
        var parts = attrs.codeString.split(';');

        for (var _i = 0; _i < parts.length; _i++) {

            // [type][column]:[row]f[orientation]

            var partString = parts[_i].trim();

            if (partString.length == 0) continue;

            var fInd = _.indexOf(partString, 'f');
            var cInd = _.indexOf(partString, ':');

            var original = { type: partString[0], x: parseInt(partString.slice(1, cInd)), y: parseInt(partString.slice(cInd + 1, fInd)), orientation: parseInt(partString.slice(fInd + 1)) };

            var cellProps = {};

            cellProps.type = typeMap[original.type];
            cellProps.x = original.x - Math.round(-0.5 * (p.cols - 9) + 8);
            cellProps.y = original.y - Math.round(-0.5 * (p.cols - 9) + 3); // Lol this coordinate system

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
    }

    function generateLegacyProgramString(prog) {
        var lvlString = "lvl=32";
        var metaInfo = "ctm=Program;(Generated);:*;" + prog.rows + ";3;0";

        var codeParts = [];

        var reverseTypeMap = new Map([['Conveyor', 'c'], ['WriteB', 'b'], ['WriteR', 'r'], ['WriteG', 'g'], ['WriteY', 'y'], ['BranchBR', 'p'], ['BranchGY', 'q'], ['CrossConveyor', 'i']]);

        var x = 0,
            y = 0;
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

    return {
        setters: [function (_core) {
            core = _core['default'];
        }, function (_tmath) {
            tmath = _tmath['default'];
        }],
        execute: function () {
            dir = { // regardless of how graphics are handled, these mean:
                UP: new tmath.Vec2(0, 1), // +y
                DOWN: new tmath.Vec2(0, -1), // -y
                LEFT: new tmath.Vec2(-1, 0), // -x
                RIGHT: new tmath.Vec2(1, 0) };
            ;

            cellTypes = {
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

            Program = (function () {
                function Program(cols, rows) {
                    _classCallCheck(this, Program);

                    this.cols = cols;
                    this.rows = rows;
                    this.cells = [];
                    this.changed = new signals.Signal();

                    this.metaInfo = null;

                    for (var x = 0; x < cols; ++x) {
                        this.cells.push([]);
                        for (var y = 0; y < rows; ++y) {
                            this.cells[x].push(new cellTypes.Empty());
                        }
                    }
                }

                _createClass(Program, [{
                    key: 'getCell',
                    value: function getCell(x, y) {
                        return this.cells[x][y];
                    }
                }, {
                    key: 'setCell',
                    value: function setCell(x, y, type, orientation) {
                        var s = new cellTypes[type]();

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
                }, {
                    key: 'setStart',
                    value: function setStart(x, y) {
                        this.setCell(x, y, 'Start');
                    }
                }, {
                    key: 'setEnd',
                    value: function setEnd(x, y) {
                        this.setCell(x, y, 'End');
                    }
                }, {
                    key: 'setDefaultStartEnd',
                    value: function setDefaultStartEnd() {
                        var x = Math.floor(this.cols / 2);
                        this.setStart(x, 0);
                        this.setEnd(x, this.rows - 1);
                    }
                }, {
                    key: 'expand',
                    value: function expand() {
                        // Increase program rows/cols by two, maintaining the contents
                        var newRows = this.rows + 2;
                        var newCols = this.cols + 2;

                        var p = new Program(newCols, newRows);

                        for (var x = 0; x < this.cols; ++x) {
                            for (var y = 0; y < this.rows; ++y) {
                                var c = this.getCell(x, y);
                                if (!(c.type == "Start" || c.type == "End" || c.type == "Empty")) {
                                    p.setCell(x + 1, y + 1, c.type, c.orientation);
                                }
                            }
                        }

                        p.setDefaultStartEnd();
                        return p;
                    }
                }, {
                    key: 'contract',
                    value: function contract() {
                        // Decrease program rows/cols by two, maintaining the contents
                        var newRows = this.rows - 2;
                        var newCols = this.cols - 2;

                        var p = new Program(newCols, newRows);

                        for (var x = 0; x < this.cols - 1; ++x) {
                            for (var y = 0; y < this.rows - 1; ++y) {
                                var c = this.getCell(x, y);
                                if (!(c.type == "Start" || c.type == "End" || c.type == "Empty")) {
                                    p.setCell(x - 1, y - 1, c.type, c.orientation);
                                }
                            }
                        }

                        p.setDefaultStartEnd();
                        return p;
                    }
                }]);

                return Program;
            })();

            ;;
            _export('default', {
                directions: dir,
                cellTypes: cellTypes,
                Program: Program,
                readLegacyProgramString: readLegacyProgramString,
                generateLegacyProgramString: generateLegacyProgramString
            });
        }
    };
});
System.register('stage', [], function (_export) {
    /**
     * @class Stage
     * Manages a stack of layers
     *
     * @param {Snap.Element} paper Snap parent element
     */

    'use strict';

    var Stage;

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    return {
        setters: [],
        execute: function () {
            Stage = (function () {
                function Stage(paper) {
                    _classCallCheck(this, Stage);

                    this.paper = paper;

                    this.layers = [];

                    this._layer = paper.g().addClass('stage');
                }

                /**
                 * push
                 * Place object at front of stage and display its layer
                 * Calls onHidden on object at top of old stack, and onVisible on new top of stack
                 * @param {Object} layer Object with `_layer` property, which is a Snap.Element
                 * @return layer
                 */

                _createClass(Stage, [{
                    key: 'push',
                    value: function push(layer) {
                        var layerCount = this.layers.length;

                        if (layerCount > 0) {
                            var _top = this.layers[layerCount - 1];

                            if (_top.onHidden) {
                                _top.onHidden();
                            }
                        }

                        this.layers.push(layer);
                        this._layer.clear();
                        this._layer.add(layer._layer);

                        if (layer.onVisible) {
                            layer.onVisible();
                        }

                        return layer;
                    }

                    /**
                     * pop
                     * Remove topmost object from stage, removing its `_layer` property and calling `remove`
                     * Also calls onHidden on layer being removed, and onVisible on object at top of stack
                     * @return The popped object
                     */
                }, {
                    key: 'pop',
                    value: function pop() {
                        var top = this.layers.pop();

                        if (top) {
                            if (top.onHidden) {
                                top.onHidden();
                            }

                            top.remove();
                        }

                        this._layer.clear();

                        var layerCount = this.layers.length;

                        if (layerCount > 0) {
                            var newTop = this.layers[layerCount - 1];

                            this._layer.add(newTop._layer);

                            if (newTop.onVisible) {
                                newTop.onVisible();
                            }
                        }

                        return top;
                    }

                    /**
                     * clear
                     * Pops all layers from stack
                     */
                }, {
                    key: 'clear',
                    value: function clear() {

                        this._layer.clear();

                        while (this.layers.length > 0) {
                            var p = this.layers.pop();
                            if (p) {
                                p.onHidden && p.onHidden();
                                p.remove && p.remove();
                            }
                        }
                    }
                }]);

                return Stage;
            })();

            _export('Stage', Stage);

            ;
        }
    };
});
System.register("tmath", [], function (_export) {
    "use strict";

    var tmath, Vec2, Mat2x2;

    _export("orientationByName", orientationByName);

    _export("isMirrored", isMirrored);

    _export("nameFromOrientation", nameFromOrientation);

    function orientationByName(dir, mirror) {
        var m = tmath.Mat2x2,
            regular = {
            "UP": m.kID,
            "RIGHT": m.kROT1,
            "DOWN": m.kROT2,
            "LEFT": m.kROT3
        },
            mirrored = {
            "UP": m.kMIR,
            "RIGHT": m.kMROT1,
            "DOWN": m.kMROT2,
            "LEFT": m.kMROT3
        };

        return mirror ? mirrored[dir] : regular[dir];
    }

    function isMirrored(orientation) {
        var m = tmath.Mat2x2,
            l = [m.kMIR, m.kMROT1, m.kMROT2, m.kMROT3];

        return l.some(function (mat) {
            return _.isEqual(mat, orientation);
        });
    }

    function nameFromOrientation(o) {
        var mirror = isMirrored(o),
            direction = "UP",
            m = tmath.Mat2x2;

        if (_.isEqual(o, m.kID) || _.isEqual(o, m.kMIR)) direction = "UP";
        if (_.isEqual(o, m.kROT1) || _.isEqual(o, m.kMROT1)) direction = "RIGHT";
        if (_.isEqual(o, m.kROT2) || _.isEqual(o, m.kMROT2)) direction = "DOWN";
        if (_.isEqual(o, m.kROT3) || _.isEqual(o, m.kMROT3)) direction = "LEFT";

        return { direction: direction, mirror: mirror };
    }

    return {
        setters: [],
        execute: function () {
            tmath = tmath || {};

            _export("default", tmath);

            Vec2 = function Vec2(x, y) {
                this.x = x;
                this.y = y;
            };

            Vec2.prototype.add = function (v2) {
                return new Vec2(this.x + v2.x, this.y + v2.y);
            };

            Vec2.prototype.equals = function (v2) {
                return this.x == v2.x && this.y == v2.y;
            };

            tmath.Vec2 = Vec2;

            Mat2x2 = function Mat2x2(a, b, c, d) {
                this.a = a;
                this.b = b;
                this.c = c;
                this.d = d;
            };

            Mat2x2.ID = function () {
                return new Mat2x2(1, 0, 0, 1);
            };Mat2x2.kID = Mat2x2.ID();
            Mat2x2.ROT1 = function () {
                return new Mat2x2(0, -1, 1, 0);
            };Mat2x2.kROT1 = Mat2x2.ROT1();
            Mat2x2.ROT2 = function () {
                return new Mat2x2(-1, 0, 0, -1);
            };Mat2x2.kROT2 = Mat2x2.ROT2();
            Mat2x2.ROT3 = function () {
                return new Mat2x2(0, 1, -1, 0);
            };Mat2x2.kROT3 = Mat2x2.ROT3();
            Mat2x2.MIR = function () {
                return new Mat2x2(-1, 0, 0, 1);
            };Mat2x2.kMIR = Mat2x2.MIR();
            Mat2x2.MROT1 = function () {
                return new Mat2x2(0, 1, 1, 0);
            };Mat2x2.kMROT1 = Mat2x2.MROT1();
            Mat2x2.MROT2 = function () {
                return new Mat2x2(1, 0, 0, -1);
            };Mat2x2.kMROT2 = Mat2x2.MROT2();
            Mat2x2.MROT3 = function () {
                return new Mat2x2(0, -1, -1, 0);
            };Mat2x2.kMROT3 = Mat2x2.MROT3();

            Mat2x2.prototype.apply = function (v) {
                return new Vec2(this.a * v.x + this.b * v.y, this.c * v.x + this.d * v.y);
            };

            Mat2x2.prototype.scale = function (s) {
                return new Mat2x2(s * this.a, s * this.b, s * this.c, s * this.d);
            };

            Mat2x2.prototype.invert = function () {
                return new Mat2x2(this.d, -this.b, -this.c, this.a).scale(this.a * this.d - this.b * this.c);
            };

            Mat2x2.prototype.compose = function (m2) {
                return new Mat2x2(this.a * m2.a + this.b * m2.c, this.a * m2.b + this.b * m2.d, this.c * m2.a + this.d * m2.c, this.c * m2.b + this.d * m2.d);
            };

            Mat2x2.prototype.equals = function (m2) {
                return this.a == m2.a && this.b == m2.b && this.c == m2.c && this.d == m2.d;
            };

            tmath.Mat2x2 = Mat2x2;
        }
    };
});
System.register('view', ['core', 'graphics', 'editor', 'codeCell', 'tmath', 'program'], function (_export) {
    /*global radio */

    'use strict';

    var core, graphics, editor, codeCell, tmath, program, TapeView, GridView, ProgramView;

    var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

    _export('colorForSymbol', colorForSymbol);

    /**
     GridView
    
     Draws a grid on the canvas
     */

    _export('classForSymbol', classForSymbol);

    _export('toTransformString', toTransformString);

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

    function colorForSymbol(symbol) {
        if (symbol === core.RED) {
            return '#E10';
        } else if (symbol === core.BLUE) {
            return '#01F';
        } else if (symbol === core.GREEN) {
            return '#0F0';
        } else if (symbol === core.YELLOW) {
            return '#FF0';
        } else {
            return '#FA3';
        }
    }

    function classForSymbol(symbol) {
        if (symbol && symbol.symb && symbol.symbol != 'empty') {
            if (symbol === core.RED) {
                return 'symbol-red';
            } else if (symbol === core.BLUE) {
                return 'symbol-blue';
            } else if (symbol === core.GREEN) {
                return 'symbol-green';
            } else if (symbol === core.YELLOW) {
                return 'symbol-yellow';
            }
        }

        return '';
    }

    function getNeighbors(prog, cell, x, y) {
        var o = cell.orientation,
            position = new tmath.Vec2(x, y),
            down = cellToGlobal(program.directions.DOWN, o).add(position),
            left = cellToGlobal(program.directions.LEFT, o).add(position),
            right = cellToGlobal(program.directions.RIGHT, o).add(position),
            neighbors = {
            down: { cell: null, position: null },
            left: { cell: null, position: null },
            right: { cell: null, position: null }
        };

        function safeGetCell(prog, pos) {
            try {
                var _cell = prog.getCell(pos.x, pos.y);
                if (_cell) return _cell;else return { type: 'Empty' };
            } catch (e) {
                return { type: 'Empty' };
            }
        }

        // Now we have vectors that point to our down, left, and right neighbors

        var downNeighbor = safeGetCell(prog, down);
        if (downNeighbor.type != 'Empty') {
            neighbors.down.cell = downNeighbor;
            neighbors.down.position = down;
        }

        var leftNeighbor = safeGetCell(prog, left);
        if (leftNeighbor.type != 'Empty') {
            neighbors.left.cell = leftNeighbor;
            neighbors.left.position = left;
        }

        var rightNeighbor = safeGetCell(prog, right);
        if (rightNeighbor.type != 'Empty') {
            neighbors.right.cell = rightNeighbor;
            neighbors.right.position = right;
        }

        return neighbors;
    }

    function isPointingTo(source, target) {
        var direction = cellToGlobal(program.directions.UP, source.cell.orientation),
            pointedTo = source.position.add(direction),
            same = pointedTo.equals(target.position);

        var isBranch = source.cell.type.indexOf('Branch') != -1;

        if (!same && (source.cell.type == 'CrossConveyor' || isBranch)) {
            // Additional test for crossconveyor
            direction = cellToGlobal(program.directions.RIGHT, source.cell.orientation);
            pointedTo = source.position.add(direction);
            same = pointedTo.equals(target.position);

            if (!same && isBranch) {
                direction = cellToGlobal(program.directions.LEFT, source.cell.orientation);
                pointedTo = source.position.add(direction);
                same = pointedTo.equals(target.position);
            }
        }

        return same;
    }

    function cellToGlobal(d, orientation) {
        return orientation.invert().apply(d);
    }

    function coordClass(x, y) {
        return 'cell-x' + x + '-y' + y;
    }

    /**
     Utility function that converts a Snap.Matrix to a Snap transform string
     */

    function toTransformString(matrix) {
        var E = '';
        var s = matrix.split();
        if (! +s.shear.toFixed(9)) {
            s.scalex = +s.scalex.toFixed(4);
            s.scaley = +s.scaley.toFixed(4);
            s.rotate = +s.rotate.toFixed(4);
            return (s.dx || s.dy ? 't' + [+s.dx.toFixed(4), +s.dy.toFixed(4)] : E) + (s.scalex != 1 || s.scaley != 1 ? 's' + [s.scalex, s.scaley] : E) + (s.rotate ? 'r' + [s.scalex * s.scaley < 0 ? 360 - s.rotate.toFixed(4) : +s.rotate.toFixed(4)] : E);

            // This is the same as what Snap.svg does by default with two major differences (original is in matrix.js)
            //
            // 1. No ",0,0" is appended to the rotate and scale strings, so they will now default to the center of the element
            //
            // 2. The complicated one: If we have been mirrored in either x or y but not both (i.e., either scalex or scaley is
            //    negative, but not both (just test if their product is negative)), our interpretation of "rotate" changes.
            //    in particular, in the mirrored case, rotate needs to be interpreted as going "backward" or "clockwise". So,
            //    to get the actual correct rotation in this case, we subtract it from 360. Whether or not the original behavior is
            //    actually incorrect on the part of Snap needs more study.
        } else {
                return 'm' + [matrix.get(0), matrix.get(1), matrix.get(2), matrix.get(3), matrix.get(4), matrix.get(5)];
            }
    }

    return {
        setters: [function (_core) {
            core = _core['default'];
        }, function (_graphics) {
            graphics = _graphics['default'];
        }, function (_editor) {
            editor = _editor['default'];
        }, function (_codeCell) {
            codeCell = _codeCell['default'];
        }, function (_tmath) {
            tmath = _tmath['default'];
        }, function (_program) {
            program = _program['default'];
        }],
        execute: function () {
            TapeView = (function () {
                function TapeView(paper, x, y, width, radius, tape, rows) {
                    _classCallCheck(this, TapeView);

                    this.paper = paper;
                    this.tapeView = paper.g();
                    this.width = width;
                    this.rows = rows || 1;
                    this.height = radius * this.rows;
                    this.x = x;
                    this.y = y;

                    this._sw = radius;
                    this._MAX_PER_ROW = Math.floor(this.width / this._sw);
                    this._MAX = this.rows * this._MAX_PER_ROW;

                    this.setTape(tape);
                }

                /**
                 Performs a clean draw of the tape with no animation
                 */

                _createClass(TapeView, [{
                    key: 'drawTape',
                    value: function drawTape() {
                        var MAX = this._MAX,
                            sw = this._sw;

                        this.tapeView.clear();

                        for (var i = 0; i < this.tape.symbols.length && i < MAX; ++i) {
                            var curSym = this.tape.symbols[i];
                            this._appendSymbol(i, curSym);
                        }

                        for (var r = 1; r < this.rows; ++r) {
                            this.tapeView.line(0, r * this._sw, this.width, r * this._sw).addClass('tape-view-divider').attr({ stroke: '#fff' });
                        }

                        this.tapeView.transform('');
                        this.tapeView.transform('t' + this.x + ',' + this.y);
                    }
                }, {
                    key: '_coordinateForIndex',
                    value: function _coordinateForIndex(index) {
                        var row = Math.floor(index / this._MAX_PER_ROW),
                            col = index % this._MAX_PER_ROW;

                        return {
                            x: col * this._sw + this._sw / 2,
                            y: row * this._sw + this._sw / 2
                        };
                    }
                }, {
                    key: '_appendSymbol',
                    value: function _appendSymbol(index, symbol, offset, color) {
                        offset = offset || 0;

                        var sw = this._sw,
                            length = this.tapeView.selectAll('circle').length,
                            coord = this._coordinateForIndex(index);

                        var circle = this.tapeView.circle(coord.x + offset * sw, coord.y, sw / 2 - 2);

                        if (symbol === core.EMPTY) {
                            circle.attr({
                                stroke: '#111',
                                strokeWidth: 2,
                                fill: '#FFF'
                            });
                        } else {
                            if (color) {
                                circle.attr({
                                    fill: '#FFF'
                                });
                            } else {
                                circle.attr({
                                    fill: colorForSymbol(symbol)
                                }).addClass(classForSymbol(symbol));
                            }
                        }

                        return circle;
                    }
                }, {
                    key: 'animate',
                    value: function animate(action) {

                        var pop = function pop(head, callback) {
                            head.animate({ opacity: 0 }, 100, mina.linear, function () {
                                head.remove();
                                if (callback) callback();
                            });
                        };

                        var slide = (function () {
                            var sw = this._sw,
                                allSymbols = this.tapeView.selectAll('circle'),
                                length = allSymbols.length;

                            // Append symbol if necessary
                            if (length < this._MAX && this.tape.symbols.length > length) {
                                var c = this._appendSymbol(length, this.tape.symbols[length - 1], 1);
                                c.attr({ opacity: 0 });
                            }

                            // Slide left
                            this.tapeView.selectAll('circle').animate({
                                cx: '-=' + sw,
                                opacity: 1
                            }, 200, mina.easeinout);

                            // Iterate over all symbols that are the beginning of a row other than the first
                            for (var beginIndex = this._MAX_PER_ROW - 1; beginIndex < length; beginIndex += this._MAX_PER_ROW) {

                                var rowFront = allSymbols[beginIndex],
                                    coord = this._coordinateForIndex(beginIndex);

                                rowFront.stop(); // cancel sliding animation

                                rowFront.animate({
                                    cx: coord.x,
                                    cy: coord.y,
                                    opacity: 1
                                }, 200, mina.linear);
                            }
                        }).bind(this);

                        if (action == 'pop') {
                            // Dissolve first element, then slide left
                            var head = this.tapeView.selectAll('circle')[0];
                            pop(head, slide);
                        } else if (action == 'append') {
                            // Append symbol if it will fit
                            var _length = this.tapeView.selectAll('circle').length;
                            if (_length < this._MAX && this.tape.symbols.length > _length) {
                                var c = this._appendSymbol(_length, this.tape.symbols[_length], 0);
                                c.attr({ opacity: 0 });
                                c.animate({
                                    opacity: 1
                                }, 50, mina.easeinout);
                            }
                        }
                    }
                }, {
                    key: 'setTape',
                    value: function setTape(newTape) {
                        if (this.tape) {
                            this.tape.changed.remove(this.animate);
                        }

                        this.tape = newTape;

                        if (newTape) {
                            // Register for tape's changed signal
                            newTape.changed.add(this.animate, this);
                        }
                    }
                }, {
                    key: 'remove',
                    value: function remove() {
                        this.setTape(null);

                        this.tapeView.remove();
                    }
                }]);

                return TapeView;
            })();

            _export('TapeView', TapeView);

            ;

            GridView = (function () {
                function GridView(paper, x, y, width, height, rows, cols) {
                    _classCallCheck(this, GridView);

                    this.paper = paper;
                    this.grid = paper.g();
                    this.width = width;
                    this.height = height;
                    this.x = x;
                    this.y = y;
                    this.cols = cols;
                    this.rows = rows;

                    this.grid.click(this.onClick.bind(this));

                    radio('highlighted').subscribe([this.highlight, this]);
                    radio('unhighlighted').subscribe([this.clearHighlight, this]);
                }

                _createClass(GridView, [{
                    key: 'onClick',
                    value: function onClick(evt, x, y) {
                        var cell = this.screenPointToCell(evt.clientX, evt.clientY);

                        if (cell.x >= 0 && cell.x < this.cols && cell.y >= 0 && cell.y < this.rows) {
                            editor.trigger(editor.events.cellSelected, { cell: cell });
                        }
                    }
                }, {
                    key: 'highlight',
                    value: function highlight(cell) {

                        if (cell && cell.x !== undefined && cell.y !== undefined) {
                            this.clearHighlight();

                            var sw = this.width / this.cols,
                                sh = this.height / this.rows,
                                highlight = this.grid.rect(cell.x * sw, cell.y * sh, sw, sh).addClass('highlight').attr({ fill: 'white' });
                        }
                    }
                }, {
                    key: 'clearHighlight',
                    value: function clearHighlight() {
                        this.grid.selectAll('.highlight').forEach(function (el) {
                            return el.remove();
                        });
                    }
                }, {
                    key: 'remove',
                    value: function remove() {
                        this.grid.remove();
                        radio('hightlighted').unsubscribe(this.highlight);
                        radio('unhightlighted').unsubscribe(this.clearHighlight);
                    }
                }, {
                    key: 'drawGrid',
                    value: function drawGrid() {
                        this.grid.clear();

                        var r = this.paper.rect(0, 0, this.width, this.height);
                        r.attr({ fill: '#FFF' });
                        r.addClass('grid-bg');
                        this.grid.append(r);

                        var sw = this.width / this.cols;
                        var sy = this.height / this.rows;

                        for (var x = 0; x <= this.cols; ++x) {
                            var l = this.grid.line(x * sw, 0, x * sw, this.height);
                            l.addClass('grid-line');
                        }

                        for (var y = 0; y <= this.rows; ++y) {
                            var l = this.grid.line(0, y * sy, this.width, y * sy);
                            l.addClass('grid-line');
                        }

                        this.grid.attr({ stroke: '#888', strokeWidth: 1 });

                        this.grid.transform('');
                        this.grid.transform('t' + this.x + ',' + this.y);
                    }

                    /**
                     GridView.getCellMatrix(col, row, corner) -> Matrix
                       Returns local matrix describing location of cell
                       If corner == true, uses top left corner of cell
                       Otherwise, uses center of cell
                       */
                }, {
                    key: 'getCellMatrix',
                    value: function getCellMatrix(col, row, corner) {
                        var mat = Snap.matrix(),
                            sw = this.width / this.cols,
                            sy = this.height / this.rows;

                        if (!corner) {
                            mat.translate(sw / 2, sy / 2);
                        }

                        mat.translate(sw * col, sy * row);

                        return mat;
                    }

                    /**
                     GridView.getGlobalCellMatrix(col, row, corner) -> Matrix
                       Returns global matrix describing location of cell
                       If corner == true, uses top left corner of cell
                       Otherwise, uses center of cell
                       */
                }, {
                    key: 'getGlobalCellMatrix',
                    value: function getGlobalCellMatrix(col, row, corner) {

                        var transform = this.grid.transform();
                        var globalMatrix = transform.globalMatrix.clone();

                        var sw = this.width / this.cols;
                        var sy = this.height / this.rows;

                        if (!corner) {
                            globalMatrix.translate(sw / 2, sy / 2);
                        }

                        globalMatrix.translate(sw * col, sy * row);

                        return globalMatrix;
                    }
                }, {
                    key: 'screenPointToCell',
                    value: function screenPointToCell(x, y) {
                        var localPoint = graphics.screenPointToLocal(x, y, this.grid),
                            sw = this.width / this.cols,
                            sy = this.height / this.rows,
                            INDEX_X = Math.floor(localPoint.x / sw),
                            INDEX_Y = Math.floor(localPoint.y / sy);

                        console.log('I think you want ' + INDEX_X + ', ' + INDEX_Y);

                        return { x: INDEX_X, y: INDEX_Y };
                    }
                }]);

                return GridView;
            })();

            _export('GridView', GridView);

            ;

            ProgramView = (function () {
                function ProgramView(paper, x, y, program, maxWidth, maxHeight) {
                    _classCallCheck(this, ProgramView);

                    this.paper = paper;

                    this.x = x;
                    this.y = y;

                    this.program = program;

                    this._maxWidth = maxWidth;
                    this._maxHeight = maxHeight;

                    this.tileSize = 56;

                    this._layer = paper.g().addClass('program-view');

                    this.cells = this._layer.g().addClass('cells');

                    this.gridView = new GridView(this._layer, 0, 0, program.cols * this.tileSize, program.rows * this.tileSize, program.rows, program.cols);

                    this.width = this.gridView.width;
                    this.height = this.gridView.height;

                    this.gridView.drawGrid();

                    this.calculateTransform();

                    var binding = this.program.changed.add(this.updateCell);
                    binding.context = this;
                }

                _createClass(ProgramView, [{
                    key: 'calculateTransform',
                    value: function calculateTransform() {
                        var maxw = this._maxHeight,
                            maxh = this._maxWidth,
                            SCALE_X = maxw / this.gridView.width,
                            SCALE_Y = maxh / this.gridView.height,
                            scale = Math.min(SCALE_X, SCALE_Y);

                        this._layer.transform('T' + this.x + ',' + this.y + 's' + scale + ',0,0');
                    }
                }, {
                    key: 'setProgram',
                    value: function setProgram(p) {
                        if (this.program) this.program.changed.remove(this.drawProgram);

                        this.program = p;

                        this.gridView.remove();

                        if (p) {
                            this.gridView = new GridView(this._layer, this.x, this.y, p.cols * this.tileSize, p.rows * this.tileSize, p.rows, p.cols);

                            this.gridView.drawGrid();
                            this.cells.clear();

                            this.calculateTransform();
                        }
                    }
                }, {
                    key: 'remove',
                    value: function remove() {
                        // Set program to null, which also removes this.gridView
                        this.setProgram(null);

                        // Destroy our layer
                        this._layer.remove();
                    }
                }, {
                    key: 'updateCell',
                    value: function updateCell(data) {
                        // coordinates of updated cell
                        var x = data.x,
                            y = data.y;

                        // remove old cells in the region and redraw each
                        for (var cx = x - 1; cx <= x + 1; ++cx) {
                            for (var cy = y - 1; cy <= y + 1; ++cy) {
                                if (cx >= 0 && cx < this.program.cols && cy >= 0 && cy < this.program.rows) {

                                    this.gridView.grid.selectAll('.' + coordClass(cx, cy)).forEach(function (el) {
                                        return el.remove();
                                    });

                                    this.drawTile(this.program.getCell(cx, cy), cx, cy);
                                }
                            }
                        }
                    }
                }, {
                    key: 'drawTile',
                    value: function drawTile(cell, x, y) {
                        var _this = this;

                        var c = cell,
                            paper = this.paper,
                            grid = this.gridView;

                        if (c.type != 'Empty') {
                            var container = undefined;
                            if (c.type == 'Conveyor') {
                                container = this.drawConveyor(c, x, y);
                            } else if (c.type.startsWith('Write')) {
                                container = this.drawWriter(c, x, y);
                            } else {
                                var image = graphics.getGraphic(c.type);

                                if (image) {

                                    paper.append(image);

                                    var group = paper.g(image);
                                    this.cells.append(group);

                                    var corner = grid.getCellMatrix(x, y, true).toTransformString().toUpperCase();

                                    var o = c.orientation;

                                    var transform = Snap.matrix(o.a, o.b, o.c, o.d, 0, 0);
                                    var tstring = toTransformString(transform);

                                    group.transform(tstring + corner);

                                    container = group;
                                }
                            }

                            if (container) {
                                container.selectAll('*').forEach(function (el) {
                                    el.data('tileInfo', {
                                        cell: c,
                                        x: x,
                                        y: y,
                                        program: _this.program
                                    }).addClass('tile-part');
                                });

                                container.addClass(coordClass(x, y));
                            }
                        }
                    }
                }, {
                    key: 'drawProgram',
                    value: function drawProgram() {
                        var paper = this.paper,
                            grid = this.gridView,
                            program = this.program;

                        this.cells.clear();
                        this.cells.appendTo(this.gridView.grid);

                        for (var x = 0; x < program.cols; ++x) {
                            for (var y = 0; y < program.rows; ++y) {
                                var c = program.getCell(x, y);
                                this.drawTile(c, x, y);
                            }
                        }
                    }
                }, {
                    key: 'drawConveyor',
                    value: function drawConveyor(cell, x, y) {
                        var neighbors = getNeighbors(this.program, cell, x, y),
                            target = { cell: cell, position: new tmath.Vec2(x, y) },
                            hasLeft = neighbors.left.cell != null ? isPointingTo(neighbors.left, target) : false,
                            hasRight = neighbors.right.cell != null ? isPointingTo(neighbors.right, target) : false,
                            hasDown = neighbors.down.cell != null ? isPointingTo(neighbors.down, target) : false;

                        var image = null,
                            mirror = false;

                        if (!hasLeft && !hasRight) {

                            image = 'Conveyor';
                        } else if (!hasLeft && hasRight || hasLeft && !hasRight) {

                            image = hasDown ? 'ConveyorTeeTwo' : 'ConveyorElbow';

                            mirror = hasLeft;
                        } else if (!hasDown && hasLeft && hasRight) {

                            image = 'ConveyorTee';
                        } else {

                            image = 'ConveyorEx';
                        }

                        image = graphics.getGraphic(image);

                        if (image) {

                            this.paper.append(image);

                            var group = this.paper.g(image);
                            this.cells.append(group);

                            var corner = this.gridView.getCellMatrix(x, y, true).toTransformString().toUpperCase();

                            var o = cell.orientation;

                            if (mirror) {
                                o = tmath.Mat2x2.kMIR.compose(o);
                            }

                            var transform = Snap.matrix(o.a, o.b, o.c, o.d, 0, 0);
                            var tstring = toTransformString(transform);

                            group.transform(tstring + corner);

                            return group;
                        }

                        return null;
                    }
                }, {
                    key: 'drawWriter',
                    value: function drawWriter(cell, x, y) {
                        var neighbors = getNeighbors(this.program, cell, x, y),
                            target = { cell: cell, position: new tmath.Vec2(x, y) },
                            hasLeft = neighbors.left.cell != null ? isPointingTo(neighbors.left, target) : false,
                            hasRight = neighbors.right.cell != null ? isPointingTo(neighbors.right, target) : false;

                        var image = null,
                            leftConnector = null,
                            rightConnector = null;

                        image = graphics.getGraphic(cell.type);

                        if (image) {

                            this.paper.append(image);

                            var group = this.paper.g(image);
                            this.cells.append(group);

                            if (hasRight) {
                                rightConnector = graphics.getGraphic('WriterConnector');
                                group.append(rightConnector);
                            }

                            if (hasLeft) {
                                leftConnector = group.g(graphics.getGraphic('WriterConnector'));
                                group.append(leftConnector);
                                var rot = tmath.Mat2x2.kROT2,
                                    m = Snap.matrix(rot.a, rot.b, rot.c, rot.d, 0, 0);
                                leftConnector.transform(toTransformString(m));
                            }

                            var corner = this.gridView.getCellMatrix(x, y, true).toTransformString().toUpperCase();

                            var o = cell.orientation;

                            var transform = Snap.matrix(o.a, o.b, o.c, o.d, 0, 0);
                            var tstring = toTransformString(transform);

                            group.transform(tstring + corner);

                            return group;
                        }

                        return null;
                    }
                }]);

                return ProgramView;
            })();

            _export('ProgramView', ProgramView);

            ;;
        }
    };
});
//# sourceMappingURL=all.js.map
