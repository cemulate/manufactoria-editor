
export class Picker {

    constructor(root) {
        let args = {
            // Root element for picker
            el: null,

            // Selector for children
            children: '*',

            // Class to add to picked children
            class: 'picker-selected'
        };

        if (_.isUndefined(root))
            console.log('Must pass argument to Picker constructor');

        if (_.isObject(root))
            args = _.defaults(_.clone(root), args);
        else
            args.el = root;

        if (_.isString(args.el)) {
            args.el = document.querySelector(args.el);
        } else if (!_.isElement(args.el)) {
            console.log('Must pass string or element to picker');
        }

        // copy properties to this
        _.extend(this, args);
        this._assignHandlers();
    }

    _assignHandlers() {
        var children = this.el.querySelectorAll(this.children);

        for (var child of children) {
            child.addEventListener('click', this._clickHandler.bind(this));
        }
    }

    _clickHandler(mouseEvt) {
        this.clear();

        let elem = mouseEvt.currentTarget;
        elem.classList.add(this.class);
    }

    clear() {
        for (let child of this.el.querySelectorAll(this.children)) {
            child.classList.remove(this.class);
        }
    }

};

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
export class LockedPicker extends Picker {
    constructor(args) {
        super(args);

        this.enableClass = args.enableClass || 'enable';
        this.disableClass = args.disableClass || 'disable';
        this.rules = args.rules || {};
    };

    _clickHandler(evt) {
        // try to identify which selector matches the clicked element
        let sels = Object.keys(this.rules),

            target = evt.currentTarget,

            targetSel = null;

        // Check if target is disabled, bail if it is
        if (target.classList.contains(this.disableClass))
            return;

        for (let sel of sels) {
            let candidates = this.el.querySelectorAll(sel);

            if (Array.prototype.some.call(candidates, (el) => el === target)) {
                targetSel = sel;
                break;
            }
        }

        if (targetSel) {
            this.clear();
            this.applyRule(this.rules[targetSel]);
        }
    }

    applyRule(rule) {
        for (let toEnable of rule.enable) {
            Array.prototype.forEach.call(
                this.el.querySelectorAll(toEnable),
                (el) => el.classList.add(this.enableClass)
            );
        }

        for (let toDisable of rule.disable) {
            Array.prototype.forEach.call(
                this.el.querySelectorAll(toDisable),
                (el) => el.classList.add(this.disableClass)
            );
        }
    }

    clear() {
        for (let child of this.el.querySelectorAll(this.children)) {
            child.classList.remove(this.enableClass, this.disableClass);
        }
    }

};
