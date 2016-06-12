
import program from 'program';
import codeCell from 'codeCell';
import tmath from 'tmath';
import core from 'core';

export class Interpreter {
    constructor() {
        this.tape = new core.Tape();
        this.program = null;

        this.accept = false;
        this.running = false;

        this.position = new tmath.Vec2(0, 0);
        this.facing = program.directions.UP;

        this.cycles = 0;
    }

    setProgram(program) {
        this.program = program;
    }

    setTape(tape) {
        this.tape = tape;
    }

    start() {
        this.accept = false;
        this.running = true;
        this.cycles = 0;

        // Go to the start
        for (let x of _.range(this.program.cols)) {
            for (let y of _.range(this.program.rows)) {
                if (this.program.getCell(x, y).type == 'Start') {
                    this.position.x = x;
                    this.position.y = y;
                }
            }
        }

        // Face +y;
        this.facing = program.directions.UP;
    }

    convertDirectionGlobalToCell(d, cell) {
        return cell.orientation.apply(d);
    }

    convertDirectionCellToGlobal(d, cell) {
        return cell.orientation.invert().apply(d);
    }

    // Returns tuple [pop tape head or not (bool), symbol to push (maybe null), new facing direction]
    evalCell(cell, tapeHead) {

        let cellFunc = codeCell.codeCells[cell.type];

        let result = null;

        if (cellFunc) {
            if (cell.type == 'CrossConveyor') {
                // Special case. Convert this.facing into cell coordinates for CrossConveyor's function:
                let cellFacing = this.convertDirectionGlobalToCell(this.facing, cell);
                result = cellFunc(tapeHead, cellFacing);
            } else {
                // No knowledge of current facing needed
                result = cellFunc(tapeHead);
            }

            // Convert cell's returned direction into global direction
            result[2] = this.convertDirectionCellToGlobal(result[2], cell);
            return result;
        }

        console.log('Invalid cell type.');

        return [false, null, program.directions.UP];
    }

    step() {

        if (!this.running) return;

        // Get state
        let cell = this.program.getCell(this.position.x, this.position.y);
        let head = this.tape.head();

        // Check if done
        if (cell == null || cell.type == 'Empty' || (cell.type == 'Start' && this.cycles > 0)) {
            this.running = false;
            this.accept = false;
        } else if (cell.type == 'End') {
            this.running = false;
            this.accept = true;
        } else {

            // Evaluate cell
            let result = this.evalCell(cell, head);

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
};

export default {
    Interpreter
};
