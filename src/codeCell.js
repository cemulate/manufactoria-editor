
import program from 'program';
import core from 'core';

let codeCells = {

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

export default {
    codeCells: codeCells
};
