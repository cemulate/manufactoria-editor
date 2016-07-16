/*global Snap, mina */

/**
 * Modal
 * Manages content that can be hidden or displayed at will
 * @param {Snap.Element} paper Element to add modal and content as child
 * @param {Snap.Element} content Child content to show
 * @param {number} fadeTime Time in milliseconds to take fading in and out
 */
export class Modal {
    constructor(paper, content, fadeTime=300, visible=false) {
        this.paper = paper;
        this._layer = this.paper.g();
        this.content = content;
        this._layer.add(content);
        this.fadeTime = fadeTime;

        // make content invisible at start
        if (!visible)
            this._layer.attr({opacity: 0});
    }

    show() {
        let p = new Promise((resolve, reject) => {
            if (this._layer.attr().opacity == 1)
                resolve();
            else if (this.fadeTime == 0) {
                resolve();
                this._layer.attr({opacity: 1});
            } else {
                this._layer.animate(
                    {opacity: 1},
                    this.fadeTime,
                    mina.linear,
                    () => resolve()
                );
            }
        });

        return p;
    }

    hide() {
        let p = new Promise((resolve, reject) => {
            if (this._layer.attr().opacity == 0)
                resolve();
            else if (this.fadeTime == 0) {
                resolve();
                this._layer.attr({opacity: 0});
            } else {
                this._layer.animate(
                    {opacity: 0},
                    this.fadeTime,
                    mina.linear,
                    () => resolve()
                );
            }
        });

        return p;
    }

    remove() {
        this._layer.remove();
    }
}
