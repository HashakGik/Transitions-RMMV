var Transitions = (function (my) {

    /**
     * Transitions' base class.
     * @constructor
     * @memberOf Transitions
     */
    var Transition_Base = my.Transition_Base = function () {
        this.initialize.apply(this, arguments);
    };

    Transition_Base.prototype = Object.create(Object.prototype);
    Transition_Base.prototype.constructor = Transition_Base;

    /**
     * Constructor.
     * @param screen Sprite on which the transition will be drawn.
     * @param white White parameter (used only by transfers). The engine passes 0 for "black", 1 for "white" and 2 for "none".
     * @param fadeSign Sign parameter. The engine passes -1 for fade outs and +1 for fade ins.
     */
    Transition_Base.prototype.initialize = function (screen, white, fadeSign) {
        this.screen = screen;
        this.active = false;

        this.fadeSign = fadeSign;
        this.white = white;
    };

    /**
     * Starts the transition. Fills the screen with a color appropriate for this.white.
     * @param duration Duration of the effect.
     */
    Transition_Base.prototype.start = function (duration) {
        this.duration = duration;
        this.remainingDuration = duration;
        this.active = true;

        if (this.white === 1) {
            this.screen._bitmap.fillAll("white");
        }
        else if (this.white === 0) {
            this.screen._bitmap.fillAll("black");
        }
        else {
            this.active = false;
        }
    };

    /**
     * Updates the transition. If it's a fade in, decreases the opacity, otherwise increases it.
     */
    Transition_Base.prototype.update = function () {
        if (this.active) {
            if (this.fadeSign > 0) {
                this.screen.opacity -= this.screen.opacity / this.remainingDuration;
            }
            else {
                this.screen.opacity += (255 - this.screen.opacity) / this.remainingDuration;
            }

            this.remainingDuration--;
            this.active = (this.remainingDuration > 0);
        }
    };

    my.transitions['base'] = "my.Transition_Base";

    return my;
})(Transitions || {});