
/**
 * @class Stage
 * Manages a stack of layers
 *
 * @param {Snap.Element} paper Snap parent element
 */

export class Stage {
    constructor(paper) {
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
    push(layer) {
        let layerCount = this.layers.length;

        if (layerCount > 0) {
            let top = this.layers[layerCount - 1];

            if (top.onHidden) {
                top.onHidden();
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
    pop() {
        const top = this.layers.pop();

        if (top) {
            if (top.onHidden) {
                top.onHidden();
            }

            top.remove();
        }

        this._layer.clear();

        const layerCount = this.layers.length;

        if (layerCount > 0) {
            let newTop = this.layers[layerCount - 1];

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
    clear() {

        this._layer.clear();

        while (this.layers.length > 0) {
            let p = this.layers.pop();
            if (p) {
                p.onHidden && p.onHidden();
                p.remove && p.remove();
            }
        }
    }

};
