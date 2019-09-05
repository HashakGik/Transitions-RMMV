var Transitions = (function (my) {

    /**
     * DOOM melt transition class. Makes the old scene melt vertically, revealing the new scene.
     * @constructor
     * @memberOf Transitions
     * @extends Transitions.Transition_Base
     */
    var Transition_Melt = my.Transition_Melt = function () {
        this.initialize.apply(this, arguments);
    };

    Transition_Melt.prototype = Object.create(my.Transition_Base.prototype);
    Transition_Melt.prototype.constructor = Transition_Melt;

    /**
     * Constructor.
     * @param screen Sprite on which the transition will be drawn.
     * @param white Ignored.
     * @param fadeSign Sign parameter. Only fade outs (+1) will melt the screen.
     */
    Transition_Melt.prototype.initialize = function (screen, white, fadeSign) {
        my.Transition_Base.prototype.initialize.call(this, screen, white, fadeSign);

        this.slices = 500;
        this.snap = $gameSystem.snap;
    };

    /**
     * Starts the effect. The actual duration is twice the passed value.
     * @param duration Duration of the effect.
     */
    Transition_Melt.prototype.start = function (duration) {
        if (this.fadeSign > 0) {
            this.heights = [];
            this.heights.push(-Math.floor(Math.random() * 100));
            for (var i = 1; i < this.slices; i++) {
                var tmp = Math.floor(Math.random() * 50) - 25 + this.heights[this.heights.length - 1];
                if (tmp > 0) {
                    tmp = 0;
                }
                this.heights.push(tmp);
            }

            this.duration = duration * 2;
            this.remainingDuration = duration * 2;
            this.active = true;
        }
    };

    Transition_Melt.prototype.update = function () {
        if (this.active) {
            var w = Math.ceil(this.snap.width / this.slices);
            var h = this.snap.height;

            this.screen._bitmap.clear();
            this.active = false;

            for (var i = 0; i < this.slices; i++) {
                this.heights[i] += Math.floor(this.snap.height / this.duration);
                this.active |= this.heights[i] <= this.screen.height;
            }

            for (var i = 0; i < this.slices; i++) {
                var dh = (this.heights[i] < 0) ? 0 : this.heights[i];

                this.screen._bitmap.blt(this.snap, i * w, 0, w, h, i * w, dh, w, h);
            }

            this.remainingDuration--;
        }
    };

    my.transitions['melt'] = "my.Transition_Melt";

    return my;
})(Transitions || {});