var Transitions = (function (my) {

    /**
     * Mechanical iris transition. Divides the old scene in six blades, opening a hole in the center which reveals the new scene.
     * @constructor
     * @memberOf Transitions
     * @extends Transitions.Transition_Base
     */
    var Transition_Iris = my.Transition_Iris = function () {
        this.initialize.apply(this, arguments);
    };

    Transition_Iris.prototype = Object.create(my.Transition_Base.prototype);
    Transition_Iris.prototype.constructor = Transition_Iris;

    /**
     * Constructor.
     * @param screen Sprite on which the transition will be drawn.
     * @param white Ignored.
     * @param fadeSign Sign parameter. Only fade outs (+1) will melt the screen.
     */
    Transition_Iris.prototype.initialize = function (screen, white, fadeSign) {
        my.Transition_Base.prototype.initialize.call(this, screen, white, fadeSign);

        this.blades = 6;
        this.snaps = [];
        var w = $gameSystem.snap.width;
        var h = $gameSystem.snap.height;
        for (var i = 0; i < this.blades; i++) {
            var bmp = new Bitmap(w, h);
            bmp.blt($gameSystem.snap, 0, 0, w, h, 0, 0, w, h);
            this.snaps.push(bmp);
        }
    };

    /**
     * Starts the effect. The actual duration is five times the passed value.
     * @param duration Duration of the effect.
     */
    Transition_Iris.prototype.start = function (duration) {
        if (this.fadeSign > 0) {
            var w = this.snaps[0].width;
            var h = this.snaps[0].height;
            var angle = 2 * Math.PI / this.snaps.length;
            var radius = Math.sqrt(w * w + h * h);


            for (var i = 0; i < this.snaps.length; i++) {
                this.snaps[i]._context.globalCompositeOperation = 'destination-in';

                this.snaps[i]._context.fillStyle = "white";
                this.snaps[i]._context.beginPath();
                this.snaps[i]._context.moveTo(w / 2, h / 2);
                this.snaps[i]._context.lineTo(w / 2 + radius * Math.cos(angle * i), h / 2 + radius * Math.sin(angle * i));
                for (var j = 1; j < Math.floor(this.snaps.length / 2); j++) {
                    this.snaps[i]._context.lineTo(w / 2 + radius * Math.cos(angle * ((i + j) % this.snaps.length)), h / 2 + radius * Math.sin(angle * ((i + j) % this.snaps.length)));
                }

                this.snaps[i]._context.lineTo(w / 2, h / 2);
                this.snaps[i]._context.closePath();
                this.snaps[i]._context.fill();

                this.screen._bitmap.blt(this.snaps[i], 0, 0, w, h, 0, 0, w, h);
            }


            this.distance = 0;

            this.duration = duration * 5;
            this.remainingDuration = duration * 5;
            this.active = true;
        }
    };

    Transition_Iris.prototype.update = function () {
        if (this.active) {
            var w = this.snaps[0].width;
            var h = this.snaps[0].height;
            var angle = 2 * Math.PI / this.snaps.length;
            this.screen._bitmap.clear();



            for (var i = 0; i < this.snaps.length; i++) {
                this.screen._bitmap.blt(this.snaps[i], 0, 0, w, h, this.distance * Math.cos(angle * i), this.distance * Math.sin(angle * i), w, h);
            }

            this.distance += Math.max(w, h) / this.duration;

            this.active = this.distance <= Math.sqrt(w * w + h * h);

            this.remainingDuration--;
        }
    };

    my.transitions['iris'] = "my.Transition_Iris";

    return my;
})(Transitions || {});