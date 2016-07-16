/*global radio */

import core from 'core';
import graphics from 'graphics';
import editor from 'editor';
import codeCell from 'codeCell';
import tmath from 'tmath';
import program from 'program';

export class TapeView {
    constructor(paper, x, y, width, radius, tape, rows) {
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
    drawTape() {
        const MAX = this._MAX,
              sw = this._sw;

        this.tapeView.clear();

        for (let i = 0; i < this.tape.symbols.length && i < MAX; ++i) {
            let curSym = this.tape.symbols[i];
            this._appendSymbol(i, curSym);
        }

        for (let r = 1; r < this.rows; ++r) {
            this.tapeView.line(0, r * this._sw, this.width, r * this._sw)
                .addClass('tape-view-divider')
                .attr({stroke: '#fff'});
        }

        this.tapeView.transform('');
        this.tapeView.transform('t' + this.x + ',' + this.y);
    }

    _coordinateForIndex(index) {
        let row = Math.floor(index / this._MAX_PER_ROW),
            col = index % this._MAX_PER_ROW;

        return {
            x: col * this._sw + this._sw / 2,
            y: row * this._sw + this._sw / 2
        };
    }

    _appendSymbol(index, symbol, offset, color) {
        offset = offset || 0;

        const sw = this._sw,
              length = this.tapeView.selectAll('circle').length,
              coord = this._coordinateForIndex(index);

        const circle = this.tapeView.circle(coord.x + offset * sw, coord.y, sw / 2 - 2);

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

    animate(action) {

        const pop = function(head, callback) {
            head.animate(
                {opacity: 0},
                100,
                mina.linear,
                function() {
                    head.remove();
                    if (callback)
                        callback();
                }
            );
        };

        const slide = (function() {
            const sw = this._sw,
                  allSymbols = this.tapeView.selectAll('circle'),
                  length = allSymbols.length;

            // Append symbol if necessary
            if (length < this._MAX && this.tape.symbols.length > length) {
                const c = this._appendSymbol(length, this.tape.symbols[length - 1], 1);
                c.attr({opacity: 0});
            }

            // Slide left
            this.tapeView.selectAll('circle').animate(
                {
                    cx: '-=' + sw,
                    opacity: 1
                },
                200,
                mina.easeinout
            );

            // Iterate over all symbols that are the beginning of a row other than the first
            for (let beginIndex = this._MAX_PER_ROW - 1;
                 beginIndex < length;
                 beginIndex += this._MAX_PER_ROW) {

                let rowFront = allSymbols[beginIndex],
                    coord = this._coordinateForIndex(beginIndex);

                rowFront.stop(); // cancel sliding animation

                rowFront.animate(
                    {
                        cx: coord.x,
                        cy: coord.y,
                        opacity: 1
                    },
                    200,
                    mina.linear
                );
            }

        }).bind(this);

        if (action == 'pop') {
            // Dissolve first element, then slide left
            const head = this.tapeView.selectAll('circle')[0];
            pop(head, slide);

        } else if (action == 'append') {
            // Append symbol if it will fit
            const length = this.tapeView.selectAll('circle').length;
            if (length < this._MAX && this.tape.symbols.length > length) {
                const c = this._appendSymbol(length, this.tape.symbols[length], 0);
                c.attr({opacity: 0});
                c.animate(
                    {
                        opacity: 1
                    },
                    50,
                    mina.easeinout
                );
            }
        }
    }

    setTape(newTape) {
        if (this.tape) {
            this.tape.changed.remove(this.animate);
        }

        this.tape = newTape;

        if (newTape) {
            // Register for tape's changed signal
            newTape.changed.add(this.animate, this);
        }
    }

    remove() {
        this.setTape(null);

        this.tapeView.remove();
    }
};

export function colorForSymbol(symbol) {
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

export function classForSymbol(symbol) {
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

/**
 GridView

 Draws a grid on the canvas
 */
export class GridView {

    constructor(paper, x, y, width, height, rows, cols) {
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

    onClick(evt, x, y) {
        const cell = this.screenPointToCell(evt.clientX, evt.clientY);

        if (cell.x >= 0 && cell.x < this.cols &&
            cell.y >= 0 && cell.y < this.rows) {
            editor.trigger(editor.events.cellSelected, {cell: cell});
        }
    }

    highlight(cell) {

        if (cell && cell.x !== undefined && cell.y !== undefined) {
            this.clearHighlight();

            let sw = this.width / this.cols,
                sh = this.height / this.rows,

                highlight = this.grid.rect(cell.x * sw, cell.y * sh, sw, sh).
                    addClass('highlight').attr({fill: 'white'});
        }
    }

    clearHighlight() {
        this.grid.selectAll('.highlight').forEach((el) => el.remove());
    }

    remove() {
        this.grid.remove();
        radio('hightlighted').unsubscribe(this.highlight);
        radio('unhightlighted').unsubscribe(this.clearHighlight);
    }

    drawGrid() {
        this.grid.clear();

        const r = this.paper.rect(0, 0, this.width, this.height);
        r.attr({fill: '#FFF'});
        r.addClass('grid-bg');
        this.grid.append(r);

        const sw = this.width / this.cols;
        const sy = this.height / this.rows;

        for (let x = 0; x <= this.cols; ++x) {
            let l = this.grid.line(x * sw, 0, x * sw, this.height);
            l.addClass('grid-line');
        }

        for (let y = 0; y <= this.rows; ++y) {
            let l = this.grid.line(0, y * sy, this.width, y * sy);
            l.addClass('grid-line');
        }

        this.grid.attr({stroke: '#888', strokeWidth: 1});

        this.grid.transform('');
        this.grid.transform('t' + this.x + ',' + this.y);
    }

    /**
     GridView.getCellMatrix(col, row, corner) -> Matrix

     Returns local matrix describing location of cell

     If corner == true, uses top left corner of cell

     Otherwise, uses center of cell

     */
    getCellMatrix(col, row, corner) {
        const mat = Snap.matrix(),
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
    getGlobalCellMatrix(col, row, corner) {

        const transform = this.grid.transform();
        const globalMatrix = transform.globalMatrix.clone();

        const sw = this.width / this.cols;
        const sy = this.height / this.rows;

        if (!corner) {
            globalMatrix.translate(sw / 2, sy / 2);
        }

        globalMatrix.translate(sw * col, sy * row);

        return globalMatrix;
    }

    screenPointToCell(x, y) {
        const localPoint = graphics.screenPointToLocal(x, y, this.grid),
              sw = this.width / this.cols,
              sy = this.height / this.rows,
              INDEX_X = Math.floor(localPoint.x / sw),
              INDEX_Y = Math.floor(localPoint.y / sy);

        console.log('I think you want ' + INDEX_X + ', ' + INDEX_Y);

        return {x: INDEX_X, y: INDEX_Y};
    }
};

export class ProgramView {

    constructor(paper, x, y,  program, maxWidth, maxHeight) {
        this.paper = paper;

        this.x = x;
        this.y = y;

        this.program = program;

        this._maxWidth = maxWidth;
        this._maxHeight = maxHeight;

        this.tileSize = 56;

        this._layer = paper.g().addClass('program-view');

        this.cells = this._layer.g().addClass('cells');

        this.gridView = new GridView(this._layer, 0, 0,
                                     program.cols * this.tileSize,
                                     program.rows * this.tileSize,
                                     program.rows, program.cols);

        this.width = this.gridView.width;
        this.height = this.gridView.height;

        this.gridView.drawGrid();

        this.calculateTransform();

        var binding = this.program.changed.add(this.updateCell);
        binding.context = this;
    }

    calculateTransform() {
        let maxw = this._maxHeight,
            maxh = this._maxWidth,

            SCALE_X = maxw / this.gridView.width,
            SCALE_Y = maxh / this.gridView.height,

            scale = Math.min(SCALE_X, SCALE_Y);

        this._layer.transform('T' + this.x + ',' + this.y + 's' + scale + ',0,0');

    }

    setProgram(p) {
        if (this.program)
            this.program.changed.remove(this.drawProgram);

        this.program = p;

        this.gridView.remove();

        if (p) {
            this.gridView = new GridView(
                this._layer, this.x, this.y,
                p.cols * this.tileSize,
                p.rows * this.tileSize,
                p.rows, p.cols
            );

            this.gridView.drawGrid();
            this.cells.clear();

            this.calculateTransform();
        }
    }

    remove() {
        // Set program to null, which also removes this.gridView
        this.setProgram(null);

        // Destroy our layer
        this._layer.remove();
    }

    updateCell(data) {
        // coordinates of updated cell
        const x = data.x,
              y = data.y;

        // remove old cells in the region and redraw each
        for (let cx = x - 1; cx <= x + 1; ++cx) {
            for (let cy = y - 1; cy <= y + 1; ++cy) {
                if (cx >= 0 && cx < this.program.cols &&
                    cy >= 0 && cy < this.program.rows) {

                    this.gridView.grid.selectAll('.' + coordClass(cx, cy))
                        .forEach((el) => el.remove());

                    this.drawTile(this.program.getCell(cx, cy), cx, cy);
                }
            }
        }

    }

    drawTile(cell, x, y) {
        const c = cell,
              paper = this.paper,
              grid = this.gridView;

        if (c.type != 'Empty') {
            let container;
            if (c.type == 'Conveyor') {
                container = this.drawConveyor(c, x, y);
            } else if (c.type.startsWith('Write')) {
                container = this.drawWriter(c, x, y);
            } else {
                const image = graphics.getGraphic(c.type);

                if (image) {

                    paper.append(image);

                    const group = paper.g(image);
                    this.cells.append(group);

                    const corner = grid.getCellMatrix(x, y, true)
                              .toTransformString()
                              .toUpperCase();

                    const o = c.orientation;

                    const transform = Snap.matrix(o.a, o.b, o.c, o.d, 0, 0);
                    const tstring = toTransformString(transform);

                    group.transform(
                        tstring + corner
                    );

                    container = group;
                }
            }

            if (container) {
                container.selectAll('*').forEach((el) => {
                    el.data('tileInfo', {
                        cell: c,
                        x: x,
                        y: y,
                        program: this.program
                    }).addClass('tile-part');
                });

                container.addClass(coordClass(x, y));

            }
        }
    }

    drawProgram() {
        const paper = this.paper,
              grid = this.gridView,
              program = this.program;

        this.cells.clear();
        this.cells.appendTo(this.gridView.grid);

        for (let x = 0; x < program.cols; ++x) {
            for (let y = 0; y < program.rows; ++y) {
                let c = program.getCell(x, y);
                this.drawTile(c, x, y);
            }
        }
    }

    drawConveyor(cell, x, y) {
        const neighbors = getNeighbors(this.program, cell, x, y),

              target = {cell: cell, position: new tmath.Vec2(x, y)},

              hasLeft = neighbors.left.cell != null ? isPointingTo(neighbors.left, target) : false,

              hasRight = neighbors.right.cell != null ? isPointingTo(neighbors.right, target) : false,

              hasDown = neighbors.down.cell != null ? isPointingTo(neighbors.down, target) : false;

        let image = null,

            mirror = false;

        if (!hasLeft && !hasRight) {

            image = 'Conveyor';

        } else if (!hasLeft && hasRight ||
                   hasLeft && !hasRight) {

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

            const group = this.paper.g(image);
            this.cells.append(group);

            const corner = this.gridView.getCellMatrix(x, y, true)
                      .toTransformString()
                      .toUpperCase();

            let o = cell.orientation;

            if (mirror) {
                o = tmath.Mat2x2.kMIR.compose(o);
            }

            const transform = Snap.matrix(o.a, o.b, o.c, o.d, 0, 0);
            const tstring = toTransformString(transform);

            group.transform(
                tstring + corner
            );

            return group;
        }

        return null;

    }

    drawWriter(cell, x, y) {
        const neighbors = getNeighbors(this.program, cell, x, y),

              target = {cell: cell, position: new tmath.Vec2(x, y)},

              hasLeft = neighbors.left.cell != null ? isPointingTo(neighbors.left, target) : false,

              hasRight = neighbors.right.cell != null ? isPointingTo(neighbors.right, target) : false;

        let image = null,

            leftConnector = null,

            rightConnector = null;

        image = graphics.getGraphic(cell.type);

        if (image) {

            this.paper.append(image);

            const group = this.paper.g(image);
            this.cells.append(group);

            if (hasRight) {
                rightConnector = graphics.getGraphic('WriterConnector');
                group.append(rightConnector);
            }

            if (hasLeft) {
                leftConnector = group.g(graphics.getGraphic('WriterConnector'));
                group.append(leftConnector);
                const rot = tmath.Mat2x2.kROT2,
                      m = Snap.matrix(rot.a, rot.b, rot.c, rot.d, 0, 0);
                leftConnector.transform(toTransformString(m));
            }

            const corner = this.gridView.getCellMatrix(x, y, true)
                      .toTransformString()
                      .toUpperCase();

            const o = cell.orientation;

            const transform = Snap.matrix(o.a, o.b, o.c, o.d, 0, 0);
            const tstring = toTransformString(transform);

            group.transform(
                tstring + corner
            );

            return group;
        }

        return null;

    }
};

function getNeighbors(prog, cell, x, y) {
    const o = cell.orientation,
          position = new tmath.Vec2(x, y),
          down = cellToGlobal(program.directions.DOWN, o).add(position),
          left = cellToGlobal(program.directions.LEFT, o).add(position),
          right = cellToGlobal(program.directions.RIGHT, o).add(position),
          neighbors = {
              down: {cell: null, position: null},
              left: {cell: null, position: null},
              right:{cell: null, position: null}
          };

    function safeGetCell(prog, pos) {
        try {
            const cell = prog.getCell(pos.x, pos.y);
            if (cell)
                return cell;
            else
                return {type: 'Empty'};
        } catch (e) {
            return {type: 'Empty'};
        }
    }

    // Now we have vectors that point to our down, left, and right neighbors

    const downNeighbor = safeGetCell(prog, down);
    if (downNeighbor.type != 'Empty') {
        neighbors.down.cell = downNeighbor;
        neighbors.down.position = down;
    }

    const leftNeighbor = safeGetCell(prog, left);
    if (leftNeighbor.type != 'Empty') {
        neighbors.left.cell = leftNeighbor;
        neighbors.left.position = left;
    }

    const rightNeighbor = safeGetCell(prog, right);
    if (rightNeighbor.type != 'Empty') {
        neighbors.right.cell = rightNeighbor;
        neighbors.right.position = right;
    }

    return neighbors;
}

function isPointingTo(source, target) {
    let direction = cellToGlobal(program.directions.UP, source.cell.orientation),
        pointedTo = source.position.add(direction),
        same = pointedTo.equals(target.position);

    const isBranch = source.cell.type.indexOf('Branch') != -1;

    if (!same && (source.cell.type == 'CrossConveyor' ||
                  isBranch)) {
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
export function toTransformString(matrix) {
    const E = '';
    const s = matrix.split();
    if (!+s.shear.toFixed(9)) {
        s.scalex = +s.scalex.toFixed(4);
        s.scaley = +s.scaley.toFixed(4);
        s.rotate = +s.rotate.toFixed(4);
        return (s.dx || s.dy ? 't' + [+s.dx.toFixed(4), +s.dy.toFixed(4)] : E) +
            (s.scalex != 1 || s.scaley != 1 ? 's' + [s.scalex, s.scaley] : E) +
            (s.rotate ? 'r' + [s.scalex * s.scaley < 0 ? 360 - s.rotate.toFixed(4) : +s.rotate.toFixed(4)] : E);

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
};
