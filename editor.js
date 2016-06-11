/*global radio */

import program from 'program';
import graphics from 'graphics';
import * as view from 'view';
import tmath from 'tmath';
import {orientationByName, isMirrored, nameFromOrientation} from 'tmath';

let events = {
    tileSelected: 'tile-selected',
    cellSelected: 'cell-selected',
    mirror: 'mirror',
    rotate: 'rotate',
    setDirection: 'set-direction',
    delete: 'delete',
    hotKey: 'hot-key'
};

function trigger(event, args) {
    radio(event).broadcast(args);
};

function registerEvents(evts) {
    Object.keys(evts).forEach(function(key) {
        radio(events[key]).subscribe(evts[key]);
    });
}

function unregisterEvents(evts) {
    Object.keys(evts).forEach(function(key) {
        radio(events[key]).unsubscribe(evts[key]);
    });
}

function init() {
    document.body.addEventListener('keydown', dispatchKeyEvents);
    document.body.addEventListener('mousemove', trackMouse);
};

function dispatchKeyEvents(evt) {
    var data = _.clone(mousePosition),
        what = null,
        key = evt.key || String.fromCharCode(evt.keyCode).toLowerCase();

    switch (key) {
        case 'r':
            what = events.rotate;
            break;
        case 'm':
            what = (events.mirror);
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
            what = events.delete;
            break;
    }

    if (!what) {
        what = events.hotKey;
        data.key = key;
    }

    trigger(what, data);
}

let mousePosition = {
    x: 0,
    y: 0
};

function trackMouse(evt) {
    mousePosition.x = evt.clientX;
    mousePosition.y = evt.clientY;
}

let IDLE = Symbol('IDLE'),
    PLACING = Symbol('PLACING'),
    INPLACE = Symbol('INPLACE');

function cycleGenerator() {
    let os = ['UP',
              'RIGHT',
              'DOWN',
              'LEFT'];

    return function(current) {
        if (!current)
            current = 'LEFT';

        let index = (os.indexOf(current) + 1) % os.length,
            oName = os[index];

        return oName;
    };
};

let cycleOrientation = cycleGenerator();

class Editor {
    constructor(paper, programView, tileControl) {
        this.paper = paper;
        this.programView = programView;

        //this.tileCursor = null;
        this.state = IDLE;

        // this.currentTile = null;
        // this.currentOrientation = "UP";
        //this.mirror = false;
        this.tileControl = tileControl;

        this._events = {
            tileSelected: (data) => this.onTileSelected(data),
            cellSelected: (data) => this.onCellSelected(data),
            rotate: (data) => this.onRotateCell(data),
            mirror: (data) => this.onMirror(data),
            setDirection: (data) => this.onSetDirection(data),
            delete: (data) => this.onDelete(data)
        };
    }

    enable() {
        registerEvents(this._events);
        this.tileControl.show(true);
    }

    disable() {
        //this.clearCursor();
        unregisterEvents(this._events);
        this.tileControl.show(false);
    }

    move(evt, x, y) {
        if (this.state == PLACING && this.tileCursor) {

            var mousePoint = graphics.screenPointToLocal(mousePosition.x, mousePosition.y, this.paper),

                oName = this.currentOrientation,

                o = orientationByName(oName, this.mirror),

                rotate = view.toTransformString(
                    Snap.matrix(o.a, o.b, o.c, o.d, 0, 0)
                ),

                translate = Snap.matrix()
                    .translate(mousePoint.x - 56 / 2, mousePoint.y - 56 / 2)
                    .toTransformString().toUpperCase();

            this.tileCursor.transform(rotate + translate);
        }
    }

    onTileSelected(data) {

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

    onCellSelected(data) {
        if (this.state == PLACING && this.tileControl.currentTile) {
            // We can now place the tile

            let curCell = this.programView.program.getCell(
                data.cell.x,
                data.cell.y
            );

            if (curCell.type != 'Start' && curCell.type != 'End') {

                this.programView.program.setCell(data.cell.x,
                                                 data.cell.y,
                                                 this.tileControl.currentTile,
                                                 orientationByName(
                                                     this.tileControl.currentOrientation,
                                                     this.tileControl.mirror)
                                                );
            }
        } else if (this.state == IDLE) {
            let cellIndex = {x: data.cell.x, y: data.cell.y},

                curCell = this.programView.program.getCell(
                    cellIndex.x,
                    cellIndex.y
                ),

                type = curCell.type;

            if (type != 'Start' && type != 'End' && type != 'Empty') {
                this.state = INPLACE;

                // Highlight selected cell
                radio('highlighted').broadcast(cellIndex);

                this.highlightedCell = cellIndex;

                let cellState = nameFromOrientation(curCell);

                this.tileControl.currentOrientation = cellState.direction;
                this.tileControl.mirror = cellState.mirrored;

                this.tileControl.onTileSelected(curCell.type);
            }
        } else if (this.state == INPLACE) {

            if (this.highlightedCell && data && data.cell) {
                let cellIndex = {x: data.cell.x, y: data.cell.y},

                    curCell = this.programView.program.getCell(
                        cellIndex.x,
                        cellIndex.y
                    ),

                    type = curCell.type;

                if (type != 'Start' && type != 'End' && type != 'Empty') {
                    this.state = INPLACE;

                    // Highlight selected cell
                    radio('highlighted').broadcast(cellIndex);

                    this.highlightedCell = cellIndex;

                    let cellState = nameFromOrientation(curCell);

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

    onRotateCell(data) {
        if (this.state == PLACING) {
            this.tileControl.onRotate();
        } else if (this.state == IDLE &&
                   data.x !== undefined &&
                   data.y !== undefined) {

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
        } else if (this.state === INPLACE &&
                   this.tileControl.currentTile &&
                   this.highlightedCell) {
            // Rotate highlighted cell
            this.tileControl.onRotate();

            this.programView.program.setCell(
                this.highlightedCell.x,
                this.highlightedCell.y,
                this.tileControl.currentTile,
                orientationByName(
                    this.tileControl.currentOrientation,
                    this.tileControl.mirror)
            );

        }
    }

    onSetDirection(data) {
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

                if (type != 'Start' && type != 'End' && type != 'Empty')

                    this.programView.program.setCell(x, y, type, orientationByName(data.dir, mirrored));
            }
        }

        if (this.state == INPLACE) {
            this.setInplace();
        }
    }

    setInplace() {
        if (this.tileControl.currentTile &&
            this.highlightedCell) {

            this.programView.program.setCell(
                this.highlightedCell.x,
                this.highlightedCell.y,
                this.tileControl.currentTile,
                orientationByName(
                    this.tileControl.currentOrientation,
                    this.tileControl.mirror)
            );
        }
    }

    onMirror(data) {
        if (this.state == PLACING || this.state == INPLACE) {
            this.tileControl.onMirror();
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
                o = tmath.Mat2x2.kMIR.compose(o);
                if (type != 'Start' && type != 'End' && type != 'Empty')
                    this.programView.program.setCell(x, y, type, o);
            }
        }

        if (this.state == INPLACE) {
            this.setInplace();
        }
    }

    clearCursor() {
        this.state = IDLE;
        if (this.tileCursor) {
            this.tileCursor.remove();
            this.tileCursor.unmousemove(this.move);
            this.tileCursor = null;
        }

        this.currentTile = null;
    }

    onDelete(data) {
        if (this.state == PLACING) {
            // Reset orientation for next time
            this.tileControl.clear();
            this.state = IDLE;
        } else if (this.state == IDLE && data && data.x && data.y) {
            // see if we are hovering over the programview

            let el = Snap.getElementByPoint(data.x, data.y),

                info = el.data('tileInfo');

            if (el && info) {
                // Now have reference to cell
                let p = info.program,
                    type = info.cell.type,
                    x = info.x,
                    y = info.y;
                if (type != 'Start' && type != 'End' && type != 'Empty')
                    p.setCell(x, y, 'Empty');
            }
        } else if (this.state === INPLACE) {
            if (this.highlightedCell) {
                let c = this.highlightedCell;

                this.programView.program.setCell(c.x, c.y, 'Empty');
            }

            this.tileControl.clear();
            this.clearHighlight();
            this.state = IDLE;
        }
    }

    clearHighlight() {
        this.highlightedCell = null;
        this.tileControl.clear();
        radio('unhighlighted').broadcast();
    }
};

export {
    Editor,
    init,
    events,
    trigger,
    registerEvents,
    unregisterEvents,
    cycleGenerator
};

export default {
    Editor,
    init,
    events,
    trigger,
    registerEvents,
    unregisterEvents,
    cycleGenerator
};
