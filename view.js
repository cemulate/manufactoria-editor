
import core from "core";
import graphics from "graphics";
import editor from "editor";
import codeCell from "codeCell";
import tmath from "tmath";
import program from "program";

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
        var MAX = this._MAX,
            sw = this._sw;

        this.tapeView.clear();

        for (var i = 0; i < this.tape.symbols.length && i < MAX; ++i) {
            var curSym = this.tape.symbols[i];
            this._appendSymbol(i, curSym);
        }


        for (var r = 1; r < this.rows; ++r) {
            this.tapeView.line(0, r * this._sw, this.width, r * this._sw)
                .addClass("tape-view-divider")
                .attr({stroke: "#fff"});
        }

        this.tapeView.transform("");
        this.tapeView.transform("t" + this.x + "," + this.y);
    }


    _coordinateForIndex(index) {
        var row = Math.floor(index / this._MAX_PER_ROW),
            col = index % this._MAX_PER_ROW;

        return {
            x: col * this._sw + this._sw / 2,
            y: row * this._sw + this._sw / 2
        };
    }

    _appendSymbol(index, symbol, offset, color) {
        offset = offset || 0;

        var sw = this._sw,
            length = this.tapeView.selectAll("circle").length,
            coord = this._coordinateForIndex(index);

        var circle = this.tapeView.circle(coord.x + offset * sw, coord.y, sw/2 - 2);

        if (symbol === core.EMPTY) {
            circle.attr({
                stroke: "#111",
                strokeWidth: 2,
                fill: "#FFF"
            });
        } else {
            if (color) {
                circle.attr({
                    fill: "#FFF"
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

        var pop = function(head, callback) {
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

        var slide = (function() {
            var sw = this._sw,
                allSymbols = this.tapeView.selectAll("circle"),
                length = allSymbols.length;

            // Append symbol if necessary
            if (length < this._MAX && this.tape.symbols.length > length) {
                var c = this._appendSymbol(length, this.tape.symbols[length - 1], 1);
                c.attr({opacity: 0});
            }

            // Slide left
            this.tapeView.selectAll("circle").animate(
                {
                    cx: "-=" + sw,
                    opacity: 1
                },
                200,
                mina.easeinout
            );

            // Iterate over all symbols that are the beginning of a row other than the first
            for (var beginIndex = this._MAX_PER_ROW - 1;
                 beginIndex < length;
                 beginIndex += this._MAX_PER_ROW) {

                var rowFront = allSymbols[beginIndex],
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

        if (action == "pop") {
            // Dissolve first element, then slide left
            var head = this.tapeView.selectAll("circle")[0];
            pop(head, slide);

        } else if (action == "append") {
            // Append symbol if it will fit
            var length = this.tapeView.selectAll("circle").length;
            if (length < this._MAX && this.tape.symbols.length > length) {
                var c = this._appendSymbol(length, this.tape.symbols[length], 0);
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
        if (this.tape)
            this.tape.changed.remove(this.animate);
        this.tape = null;

        this.tapeView.remove();
    }
};

export function colorForSymbol(symbol) {
    if (symbol === core.RED) {
        return "#E10";
    } else if (symbol === core.BLUE) {
        return "#01F";
    } else if (symbol === core.GREEN) {
        return "#0F0";
    } else if (symbol === core.YELLOW) {
        return "#FF0";
    } else {
        return "#FA3";
    }
}

export function classForSymbol(symbol) {
    if (symbol && symbol.symb && symbol.symbol != "empty") {
        if (symbol === core.RED) {
            return "symbol-red";
        } else if (symbol === core.BLUE) {
            return "symbol-blue";
        } else if (symbol === core.GREEN) {
            return "symbol-green";
        } else if (symbol === core.YELLOW) {
            return "symbol-yellow";
        }
    }
    return "";
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
    }

    onClick(evt, x, y) {
        var cell = this.screenPointToCell(evt.clientX, evt.clientY);

        if (cell.x >= 0 && cell.x < this.cols &&
            cell.y >= 0 && cell.y < this.rows) {
            editor.trigger(editor.events.cellSelected, {cell: cell});
        }
    }

    remove() {
        this.grid.remove();
    }

    drawGrid() {
        this.grid.clear();

        var r = this.paper.rect(0,0, this.width, this.height);
        r.attr({fill: "#FFF"});
        r.addClass("grid-bg");
        this.grid.append(r);

        var sw = this.width / this.cols;
        var sy = this.height / this.rows;

        for (var x = 0; x <= this.cols; ++x) {
            var l = this.grid.line(x*sw, 0, x*sw, this.height);
            l.addClass("grid-line");
        }

        for (var y = 0; y <= this.rows; ++y) {
            var l = this.grid.line(0, y*sy, this.width, y*sy);
            l.addClass("grid-line");
        }

        this.grid.attr({stroke: "#888", strokeWidth: 1});

        this.grid.transform("");
        this.grid.transform("t1,1t" + this.x + "," + this.y);
    }

    /**
     GridView.getCellMatrix(col, row, corner) -> Matrix

     Returns local matrix describing location of cell

     If corner == true, uses top left corner of cell

     Otherwise, uses center of cell

     */
    getCellMatrix(col, row, corner) {
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
    getGlobalCellMatrix(col, row, corner) {

        var transform = this.grid.transform();
        var globalMatrix = transform.localMatrix.clone();

        var sw = this.width / this.cols;
        var sy = this.height / this.rows;

        if (!corner) {
            globalMatrix.translate(sw / 2, sy / 2);
        }

        globalMatrix.translate(sw * col, sy * row);

        return globalMatrix;
    }

    screenPointToCell(x, y) {
        var localPoint = graphics.screenPointToLocal(x, y, this.grid),
            sw = this.width / this.cols,
            sy = this.height / this.rows,
            index_x = Math.floor(localPoint.x / sw),
            index_y = Math.floor(localPoint.y / sy);

        console.log("I think you want " + index_x + ", " + index_y);

        return {x: index_x, y: index_y};
    }
};

export class ProgramView {

    constructor(paper, x, y, tileSize, program) {
        this.paper = paper;
        this.program = program;
        this.tileSize = tileSize;
        this.cells = paper.g().addClass("cells");
        this.x = x;
        this.y = y;
        this.gridView = new GridView(paper, x, y,
                                     program.cols*tileSize,
                                     program.rows*tileSize,
                                     program.rows, program.cols);

        this.width = this.gridView.width;
        this.height = this.gridView.height;

        this.gridView.drawGrid();

        var binding = this.program.changed.add(this.updateCell);
        binding.context = this;
    }

    setProgram(p) {
        if (this.program)
            this.program.changed.remove(this.drawProgram);

        this.program = p;
        this.gridView.remove();
        this.gridView = new GridView(this.paper, this.x, this.y,
                                     p.cols*this.tileSize,
                                     p.rows*this.tileSize,
                                     p.rows, p.cols);
        this.gridView.drawGrid();
        this.cells.clear();
    }

    updateCell(data) {
        // coordinates of updated cell
        var x = data.x,
            y = data.y;

        // remove old cells in the region and redraw each
        for (var c_x = x - 1; c_x <= x + 1; ++c_x) {
            for (var c_y = y - 1; c_y <= y + 1; ++c_y) {
                if (c_x >= 0 && c_x < this.program.cols &&
                    c_y >= 0 && c_y < this.program.rows) {

                    this.gridView.grid.selectAll("." + coordClass(c_x, c_y))
                        .forEach((el) => el.remove());

                    this.drawTile(this.program.getCell(c_x, c_y), c_x, c_y);
                }
            }
        }

    }

    drawTile(cell, x, y) {
        var c = cell,
            paper = this.paper,
            grid = this.gridView;

        console.log("draw");

        if (c.type != "Empty") {
            var container;
            if (c.type == "Conveyor") {
                container = this.drawConveyor(c, x, y);
            } else if (c.type.startsWith("Write")) {
                container = this.drawWriter(c, x, y);
            } else {
                var image = graphics.getGraphic(c.type);

                if (image) {

                    paper.append(image);

                    var group = paper.g(image);
                    this.cells.append(group);

                    var corner = grid.getCellMatrix(x, y, true)
                            .toTransformString()
                            .toUpperCase();

                    var o = c.orientation;

                    var transform = Snap.matrix(o.a, o.b, o.c, o.d, 0, 0);
                    var tstring = toTransformString(transform);

                    group.transform(
                        tstring + corner
                    );

                    container = group;
                }
            }
            if (container) {
                container.selectAll("*").forEach((el) => {
                    el.data("tileInfo", {
                        cell: c,
                        x: x,
                        y: y,
                        program: this.program
                    }).addClass("tile-part");
                });

                container.addClass(coordClass(x, y));

            }
        }
    }


    drawProgram() {
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

    drawConveyor(cell, x, y) {
        var neighbors = getNeighbors(this.program, cell, x, y),

            target = {cell: cell, position: new tmath.Vec2(x, y)},

            hasLeft = neighbors.left.cell != null ? isPointingTo(neighbors.left, target) : false,

            hasRight = neighbors.right.cell != null ? isPointingTo(neighbors.right, target) : false,

            hasDown = neighbors.down.cell != null ? isPointingTo(neighbors.down, target) : false,

            image = null,

            mirror = false;

        if (!hasLeft && !hasRight) {

            image = "Conveyor";

        } else if (!hasLeft && hasRight ||
                   hasLeft && !hasRight) {

            image = hasDown ? "ConveyorTeeTwo" : "ConveyorElbow";

            mirror = hasLeft;

        } else if (!hasDown && hasLeft && hasRight) {

            image = "ConveyorTee";

        } else {

            image = "ConveyorEx";

        }

        image = graphics.getGraphic(image);

        if (image) {

            this.paper.append(image);

            var group = this.paper.g(image);
            this.cells.append(group);

            var corner = this.gridView.getCellMatrix(x, y, true)
                    .toTransformString()
                    .toUpperCase();

            var o = cell.orientation;

            if (mirror) {
                o = tmath.Mat2x2.kMIR.compose(o);
            }

            var transform = Snap.matrix(o.a, o.b, o.c, o.d, 0, 0);
            var tstring = toTransformString(transform);

            group.transform(
                tstring + corner
            );

            return group;
        }

        return null;

    }

    drawWriter(cell, x, y) {
        var neighbors = getNeighbors(this.program, cell, x, y),

            target = {cell: cell, position: new tmath.Vec2(x, y)},

            hasLeft = neighbors.left.cell != null ? isPointingTo(neighbors.left, target) : false,

            hasRight = neighbors.right.cell != null ? isPointingTo(neighbors.right, target) : false,

            image = null,

            leftConnector = null,

            rightConnector = null;

        image = graphics.getGraphic(cell.type);

        if (image) {

            this.paper.append(image);

            var group = this.paper.g(image);
            this.cells.append(group);

            if (hasRight) {
                rightConnector = graphics.getGraphic("WriterConnector");
                group.append(rightConnector);
            }

            if (hasLeft) {
                leftConnector = group.g(graphics.getGraphic("WriterConnector"));
                group.append(leftConnector);
                var rot = tmath.Mat2x2.kROT2,
                    m = Snap.matrix(rot.a, rot.b, rot.c, rot.d, 0, 0);
                leftConnector.transform(toTransformString(m));
            }

            var corner = this.gridView.getCellMatrix(x, y, true)
                    .toTransformString()
                    .toUpperCase();

            var o = cell.orientation;

            var transform = Snap.matrix(o.a, o.b, o.c, o.d, 0, 0);
            var tstring = toTransformString(transform);

            group.transform(
                tstring + corner
            );

            return group;
        }

        return null;

    }
}

function getNeighbors(prog, cell, x, y) {
    var o = cell.orientation,
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
            var cell = prog.getCell(pos.x, pos.y);
            if (cell)
                return cell;
            else
                return {type: "Empty"};
        } catch (e) {
            return {type: "Empty"};
        }
    }
    // Now we have vectors that point to our down, left, and right neighbors

    var downNeighbor = safeGetCell(prog, down);
    if (downNeighbor.type != "Empty") {
        neighbors.down.cell = downNeighbor;
        neighbors.down.position = down;
    }

    var leftNeighbor = safeGetCell(prog, left);
    if (leftNeighbor.type != "Empty") {
        neighbors.left.cell = leftNeighbor;
        neighbors.left.position = left;
    }

    var rightNeighbor = safeGetCell(prog, right);
    if (rightNeighbor.type != "Empty") {
        neighbors.right.cell = rightNeighbor;
        neighbors.right.position = right;
    }

    return neighbors;
}

function isPointingTo(source, target) {
    var direction = cellToGlobal(program.directions.UP, source.cell.orientation),
        pointedTo = source.position.add(direction),
        same = pointedTo.equals(target.position),
        isBranch = source.cell.type.indexOf("Branch") != -1;

    if (!same && (source.cell.type == "CrossConveyor" ||
                  isBranch)  ) {
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
    return "cell-x" + x + "-y" + y;
}


export class Palette {

    constructor(paper, x, y, max_width, columns, margin) {
        this.paper = paper;
        this.x = x;
        this.y = y;
        this.columns = columns > 0 ? columns : 1; // negative columns?
        this.columnWidth = 56;
        this.tiles = paper.g();
        this.maxWidth = max_width;
        this.margin = margin || 20;
        this.tileWidth = 56; // tiles are 56 x 56 px

        // Get names of all types to draw
        this.typesToDraw = Object.keys(codeCell.codeCells);

        var actualColumns = this.columns <= this.typesToDraw.length ?
                this.columns :
                this.typesToDraw.length;

        this.baseWidth = actualColumns * (this.tileWidth + this.margin) - this.margin;

        this.width = this.baseWidth * this.getScale();

        this.tiles.transform(Snap.matrix().translate(x, y));
        this.drawPalette();

        this._events = {
            hotKey: (data) => this.hotKey(data)
        };

        editor.registerEvents(this._events);
    }

    hotKey(data) {
        var num = parseInt(data.key);
        if (!isNaN(num) && num > 0 && num <= this.typesToDraw.length) {
            editor.trigger(
                editor.events.tileSelected,
                {
                    tile: this.typesToDraw[num - 1],
                    x: data.x,
                    y: data.y
                }
            );
        }
    }

    show(shouldShow) {
        shouldShow = shouldShow !== undefined ? shouldShow : true;
        this.tiles.attr({
            opacity: shouldShow ? 1 : 0
        });
    }

    getScale() {
        if (this.baseWidth <= this.maxWidth)
            return 1.0; // no scaling required
        else
            return this.maxWidth / this.baseWidth;
    }

    drawPalette() {
        this.tiles.clear();

        var scale_x = this.getScale();

        var height = 56 + 20; // 56 pixel tile + 10 pixel text + 10 pixel padding
        var width = 56 + 20;
        var cellImages = this.typesToDraw.map(function(name) {
            var image = this.paper.g(graphics.getGraphic(name));
            if (image != null) return {name:name, image:image};
            else return undefined;

        }.bind(this)).filter(_.negate(_.isUndefined));

        cellImages.map(function(image, index){

            var group = this.tiles.g(),
                x_index = index % this.columns,
                y_index = Math.floor(index / this.columns),
                transform = Snap.matrix().scale(scale_x).translate(x_index * width, y_index * height);

            group.click(
                (evt, x, y) => {
                    editor.trigger(
                        editor.events.tileSelected,
                        {
                            tile: image.name,
                            event: evt,
                            x: x,
                            y: y
                        }
                    );
                });

            group.transform(transform.toTransformString());

            var r = group.rect(-1, -1, 58, 58);
            r.attr({
                stroke: "#111",
                fill: "#fff",
                strokeWidth: 2
            }).addClass("palette-tile-bg");

            image.image.addClass("palette-tile");
            group.append(image.image);



            var label = group.text(56/2, height - 8, image.name);
            label.attr({
                fontFamily: "monospace",
                fontSize: 10,
                textAnchor: "middle",
                text: index + 1
            }).addClass("label-text");

            var title = Snap.parse('<title>'+image.name+'</title>');

            group.append(title);


        }, this);
    }
}


/**
 Utility function that converts a Snap.Matrix to a Snap transform string
 */
export function toTransformString(matrix) {
    var E = "";
    var s = matrix.split();
    if (!+s.shear.toFixed(9)) {
        s.scalex = +s.scalex.toFixed(4);
        s.scaley = +s.scaley.toFixed(4);
        s.rotate = +s.rotate.toFixed(4);
        return  (s.dx || s.dy ? "t" + [+s.dx.toFixed(4), +s.dy.toFixed(4)] : E) +
            (s.scalex != 1 || s.scaley != 1 ? "s" + [s.scalex, s.scaley] : E) +
            (s.rotate ? "r" + [s.scalex*s.scaley < 0 ? 360 - s.rotate.toFixed(4) : +s.rotate.toFixed(4)] : E);

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
        return "m" + [matrix.get(0), matrix.get(1), matrix.get(2), matrix.get(3), matrix.get(4), matrix.get(5)];
    }
};
