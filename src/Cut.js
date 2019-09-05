var Transitions = (function (my) {

    /**
     * Cut transition. Slices the old scene in half and the slices slide revealing the new one.
     * @constructor
     * @memberOf Transitions
     * @extends Transitions.Transition_Base
     */
    var Transition_Cut = my.Transition_Cut = function () {
        this.initialize.apply(this, arguments);
    };

    Transition_Cut.prototype = Object.create(my.Transition_Base.prototype);
    Transition_Cut.prototype.constructor = Transition_Cut;

    /**
     * Constructor.
     * @param screen Sprite on which the transition will be drawn.
     * @param white Ignored.
     * @param fadeSign Sign parameter. Only fade outs (+1) will melt the screen.
     */
    Transition_Cut.prototype.initialize = function (screen, white, fadeSign) {
        my.Transition_Base.prototype.initialize.call(this, screen, white, fadeSign);

        this.snaps = [];
        var w = $gameSystem.snap.width;
        var h = $gameSystem.snap.height;
        var bmp = new Bitmap(w, h);
        bmp.blt($gameSystem.snap, 0, 0, w, h, 0, 0, w, h);
        this.snaps.push(bmp);
        bmp = new Bitmap(w, h);
        bmp.blt($gameSystem.snap, 0, 0, w, h, 0, 0, w, h);
        this.snaps.push(bmp);

    };

    /**
     * Starts the effect. The actual duration is twice the passed value.
     * @param duration Duration of the effect.
     */
    Transition_Cut.prototype.start = function (duration) {
        if (this.snaps.length >= 2 && this.fadeSign > 0) {

            this.angle = Math.random() * 2 * Math.PI;
            this.dx = this.screen.width / 2 + Math.random() * 50 - 25;
            this.dy = this.screen.height / 2 + Math.random() * 50 - 25;

            var a;
            var b;

            if (Math.abs(Math.cos(this.angle)) < 0.001) {
                var x = this.dx;
                var y = this.screen.height;
                a = {x: Math.floor(x), y: Math.floor(y)};
                x = this.dx;
                y = 0;
                b = {x: Math.floor(x), y: Math.floor(y)};
            }
            else {
                var x = 0;
                var y = Math.tan(this.angle) * (x - this.dx) + this.dy;
                a = {x: Math.floor(x), y: Math.floor(y)};
                x = this.screen.width;
                y = Math.tan(this.angle) * (x - this.dx) + this.dy;
                b = {x: Math.floor(x), y: Math.floor(y)};
            }

            this.screen._bitmap.clear();
            var w = this.snaps[0].width;
            var h = this.snaps[0].height;

            if (Math.abs(Math.cos(this.angle)) < 0.001) {
                this.snaps[0]._context.globalCompositeOperation = 'destination-in';
                this.snaps[0]._context.fillStyle = "white";
                this.snaps[0]._context.beginPath();
                this.snaps[0]._context.moveTo(0, 0);
                this.snaps[0]._context.lineTo(b.x, b.y);
                this.snaps[0]._context.lineTo(a.x, a.y);
                this.snaps[0]._context.lineTo(0, a.y);
                this.snaps[0]._context.lineTo(0, 0);
                this.snaps[0]._context.closePath();
                this.snaps[0]._context.fill();

                this.snaps[1]._context.globalCompositeOperation = 'destination-in';
                this.snaps[1]._context.fillStyle = "white";
                this.snaps[1]._context.beginPath();
                this.snaps[1]._context.moveTo(w, 0);
                this.snaps[1]._context.lineTo(b.x, b.y);
                this.snaps[1]._context.lineTo(a.x, a.y);
                this.snaps[1]._context.lineTo(w, a.y);
                this.snaps[1]._context.lineTo(w, 0);
                this.snaps[1]._context.closePath();
                this.snaps[1]._context.fill();
            }
            else {
                var ptsA = [];
                var ptsB = [];


                var q = this.dy - Math.tan(this.angle) * this.dx;
                [{x: 0, y: 0}, {x: w, y: 0}, {x: w, y: h}, {x: 0, y: h}].forEach(p => {
                    if (a.y > p.y && a.x === p.x) {
                        ptsA.push(a);
                        ptsB.push(a);
                    }
                    if (b.y < p.y && b.x === p.x) {
                        ptsA.push(b);
                        ptsB.push(b);
                    }


                    if (-Math.tan(this.angle) * p.x + p.y - q > 0) {
                        ptsA.push(p);
                    }
                    else {
                        ptsB.push(p);
                    }

                    if (b.y > p.y && b.x === p.x) {
                        ptsA.push(b);
                        ptsB.push(b);
                    }
                    if (a.y < p.y && a.x === p.x) {
                        ptsA.push(a);
                        ptsB.push(a);
                    }
                });

                this.snaps[0]._context.globalCompositeOperation = 'destination-in';
                this.snaps[0]._context.fillStyle = "white";
                this.snaps[0]._context.beginPath();
                this.snaps[0]._context.moveTo(ptsA[0].x, ptsA[0].y);
                for (var i = 1; i < ptsA.length; i++) {
                    this.snaps[0]._context.lineTo(ptsA[i].x, ptsA[i].y);
                }
                this.snaps[0]._context.lineTo(ptsA[0].x, ptsA[0].y);
                this.snaps[0]._context.closePath();
                this.snaps[0]._context.fill();

                this.snaps[1]._context.globalCompositeOperation = 'destination-in';
                this.snaps[1]._context.fillStyle = "white";
                this.snaps[1]._context.beginPath();
                this.snaps[1]._context.moveTo(ptsB[0].x, ptsB[0].y);
                for (var i = 1; i < ptsB.length; i++) {
                    this.snaps[1]._context.lineTo(ptsB[i].x, ptsB[i].y);
                }
                this.snaps[1]._context.lineTo(ptsB[0].x, ptsB[0].y);
                this.snaps[1]._context.closePath();
                this.snaps[1]._context.fill();
            }

            this.screen._bitmap.blt(this.snaps[0], 0, 0, w, h, 0, 0, w, h);
            this.screen._bitmap.blt(this.snaps[1], 0, 0, w, h, 0, 0, w, h);

            this.screen._bitmap._context.beginPath();
            this.screen._bitmap._context.strokeStyle = "white";
            this.screen._bitmap._context.moveTo(a.x, a.y);
            this.screen._bitmap._context.lineTo(b.x, b.y);
            this.screen._bitmap._context.closePath();
            this.screen._bitmap._context.stroke();

            this.distance = 0;
            this.duration = duration * 2;
            this.remainingDuration = duration * 2;
            this.active = true;
        }
    };

    Transition_Cut.prototype.update = function () {
        if (this.active) {
            var a;
            var b;

            if (Math.abs(Math.cos(this.angle)) < 0.001) {
                // retta verticale
                a = {x: Math.floor(this.dx), y: this.screen.height};
                b = {x: Math.floor(this.dx), y: 0};
            }
            else {
                // altra retta
                var x = 0;
                var y = Math.tan(this.angle) * (x - this.dx) + this.dy;
                a = {x: Math.floor(x), y: Math.floor(y)};
                x = this.screen.width;
                y = Math.tan(this.angle) * (x - this.dx) + this.dy;
                b = {x: Math.floor(x), y: Math.floor(y)};
            }

            var w = this.screen.width;
            var h = this.screen.height;
            this.distance += Math.max(w, h) / this.duration;

            this.screen._bitmap.clear();
            this.screen._bitmap.blt(this.snaps[0], 0, 0, w, h, this.distance * Math.cos(this.angle), this.distance * Math.sin(this.angle), w, h);
            this.screen._bitmap.blt(this.snaps[1], 0, 0, w, h, this.distance * Math.cos(this.angle + Math.PI), this.distance * Math.sin(this.angle + Math.PI), w, h);

            this.screen._bitmap._context.beginPath();
            this.screen._bitmap._context.strokeStyle = "white";
            this.screen._bitmap._context.moveTo(a.x, a.y);
            this.screen._bitmap._context.lineTo(b.x, b.y);
            this.screen._bitmap._context.closePath();
            this.screen._bitmap._context.stroke();

            this.remainingDuration--;
            this.active = (this.distance <= Math.sqrt(w * w + h * h));

            if (!this.active) {
                this.screen._bitmap.clear();
            }
        }
    };

    my.transitions['cut'] = "my.Transition_Cut";

    return my;
})(Transitions || {});