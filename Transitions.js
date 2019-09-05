//=============================================================================
// Transitions.js
//=============================================================================

/*:
 * @plugindesc Replaces the default fade in/out behaviour of scenes with custom transitions.
 * @author Hash'ak'Gik
 *
 * @help
 * Plugin commands:
 * SetTransition base transition_name # Sets the default fade transition for every scene (title, menus, etc.).
 * SetTransition fade transition_name # Sets the transition for fade in and fade out event commands.
 * SetTransition battle transition_name # Sets the transition between the map and an enemy encounter.
 * SetTransition transfer transition_name # Sets the transition used for player transfers (event commands must have the fade parameter set to either white or black).
 *
 * Predefined transitions:
 * base: the default white/black fade.
 * melt: DOOM style melt effect.
 * cut: the screen is cut into two slices which slide away from each other.
 * iris: the screen opens like a camera iris.
 *
 */

/**
 * @namespace Transitions
 */
var Transitions = (function (my) {
    my.transitions = {};

    var _Game_Interpreter_pluginCommand =
        Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'SetTransition') {
            if (["base", "fade", "battle", "transfer"].indexOf(args[0]) !== -1) {
                if (args[1] && my.transitions[args[1]] != null) {
                    $gameSystem.transitions[args[0]] = my.transitions[args[1]];
                }
            }
        }
    };

    var _gsInitialize = Game_System.prototype.initialize;
    /**
     * Store the current transitions' settings in $gameSystem (which, unlike $gameScreen, is serialised in save files).
     */
    Game_System.prototype.initialize = function () {
        _gsInitialize.call(this);

        this.transitions = {};
        this.transitions['base'] = "my.Transition_Base";
        this.transitions['fade'] = "my.Transition_Base";
        this.transitions['battle'] = "my.Transition_Base";
        this.transitions['transfer'] = "my.Transition_Base";
        this.snap = new Bitmap(Graphics.width, Graphics.height);
    };

    //===============================================
    // Methods overrides for "base" transitions.
    //===============================================

    /**
     * Replaces the default Scene_Base.isBusy() method.
     * @returns {boolean} True if a transition is playing.
     */
    Scene_Base.prototype.isBusy = function () {
        return this.transition && this.transition.active;
    };

    /**
     * Replaces the default Scene_Base.updateFade() method.
     */
    Scene_Base.prototype.updateFade = function () {
        if (this.transition && this.transition.active) {
            this.transition.update();
        }
    };

    /**
     * Replaces the default Scene_Base.startFadeIn(duration, white) method.
     * Reads the current setting for "base" transitions and creates a new one in "fadeIn" (+1) mode.
     * @param duration Fade duration.
     * @param white White/black parameter, can be ignored by transitions.
     */
    Scene_Base.prototype.startFadeIn = function (duration, white) {
        var regex = /my\.Transition_[0-9a-zA-Z_]+/;
        if (!this._fadeSprite) {
            this._fadeSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
            this.addChild(this._fadeSprite);
        }

        if (regex.exec($gameSystem.transitions['base']) != null) {
            this.transition = eval("new " + $gameSystem.transitions['base'] + "(this._fadeSprite, white, +1);");
        }
        else {
            this.transition = new my.Transition_Base(this._fadeSprite, white, +1);
        }

        this.transition.start(duration || 30);
    };

    /**
     * Replaces the default Scene_Base.startFadeOut(duration, white). Instead of fading, stores a snapshot of the screen,
     * for later use.
     * @param duration Ignored.
     * @param white Ignored.
     */
    Scene_Base.prototype.startFadeOut = function (duration, white) {
        // Stores the snapshot, but does not start any transition
        $gameSystem.snap = SceneManager.snap();
    };

    //===============================================
    // Methods overrides for "transfer" transitions.
    //===============================================

    /**
     * Replaces the default Scene_Map.fadeInForTransfer().
     * Reads the current setting for "transfer" transitions and creates a new one in "fadeIn" (+1) mode.
     */
    Scene_Map.prototype.fadeInForTransfer = function () {
        var fadeType = $gamePlayer.fadeType();
        var regex = /my\.Transition_[0-9a-zA-Z_]+/;
        if (!this._fadeSprite) {
            this._fadeSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
            this.addChild(this._fadeSprite);
        }

        if (regex.exec($gameSystem.transitions['transfer']) != null) {
            this.transition = eval("new " + $gameSystem.transitions['transfer'] + "(this._fadeSprite, fadeType, +1);");
        }
        else {
            this.transition = new my.Transition_Base(this._fadeSprite, fadeType, +1);
        }

        this.transition.start(this.fadeSpeed());
    };

    /**
     * Replaces the default Scene_Map.fadeOutForTransfer() method.
     * Reads the current setting for "transfer" transitions and creates a new one in "fadeOut" (-1) mode.
     */
    Scene_Map.prototype.fadeOutForTransfer = function () {

        var fadeType = $gamePlayer.fadeType();
        var regex = /my\.Transition_[0-9a-zA-Z_]+/;
        if (!this._fadeSprite) {
            this._fadeSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
            this.addChild(this._fadeSprite);
        }

        if (regex.exec($gameSystem.transitions['transfer']) != null) {
            this.transition = eval("new " + $gameSystem.transitions['transfer'] + "(this._fadeSprite, fadeType, -1);");
        }
        else {
            this.transition = new my.Transition_Base(this._fadeSprite, fadeType, -1);
        }

        $gameSystem.snap = SceneManager.snap();
        this.transition.start(this.fadeSpeed());
    };

    //===============================================
    // Methods overrides for "battle" transitions.
    //===============================================

    /**
     * Replaces the default Scene_Map.startEncounterEffect() method.
     * Disables the default zooming effect, reads the current setting for "transfer" transitions
     * and creates a new one in "fadeOut" (-1) mode.
     */
    Scene_Map.prototype.startEncounterEffect = function () {
        var regex = /my\.Transition_[0-9a-zA-Z_]+/;
        if (!this._fadeSprite) {
            this._fadeSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
            this.addChild(this._fadeSprite);
        }

        if (regex.exec($gameSystem.transitions['battle']) != null) {
            this.transition = eval("new " + $gameSystem.transitions['battle'] + "(this._fadeSprite, 0, -1);");
        }
        else {
            this.transition = new my.Transition_Base(this._fadeSprite, 0, -1);
        }

        $gameSystem.snap = SceneManager.snap();
        this._spriteset.hideCharacters();
        this.snapForBattleBackground();

        this.transition.start(30);
    };

    /**
     * Replaces the default Scene_Map.updateEncounterEffect() method.
     * Does nothing.
     */
    Scene_Map.prototype.updateEncounterEffect = function () {
    };

    var _battleUpdate = Scene_Battle.prototype.update;
    /**
     * Overrides the default Scene_Battle.update() method.
     * If the scene has just been created, executes a first scene update (to display the enemies),
     * Otherwise pauses the scene and updates the transition (until it's over).
     */
    Scene_Battle.prototype.update = function () {
        if (this.transition && this.transition.active && !this.init) {
            this.init = true;
            _battleUpdate.call(this);
        }
        else if (this.transition && this.transition.active && this.init) {
            this.transition.update();
        }
        else {
            _battleUpdate.call(this);
        }
    };

    /**
     * Scene_Battle.startFadeIn(duration, white) method.
     * @param duration Fade duration.
     * @param white White/black parameter, can be ignored by transitions.
     */
    Scene_Battle.prototype.startFadeIn = function (duration, white) {
        var regex = /my\.Transition_[0-9a-zA-Z_]+/;
        if (!this._fadeSprite) {
            this._fadeSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
            this.addChild(this._fadeSprite);
        }

        if (regex.exec($gameSystem.transitions['battle']) != null) {
            this.transition = eval("new " + $gameSystem.transitions['battle'] + "(this._fadeSprite, white, +1);");
        }
        else {
            this.transition = new my.Transition_Base(this._fadeSprite, white, +1);
        }

        this.transition.start(duration || 30);
    };


    //===============================================
    // Methods overrides for "fade" transitions.
    //===============================================

    /**
     * Replaces the default Game_Screen.startFadeOut(duration) method.
     * @param duration Fade duration.
     */
    Game_Screen.prototype.startFadeOut = function (duration) {
        this.fadeSign = +1;
        this.duration = duration;
        this.starting = true;

        $gameSystem.snap = SceneManager.snap();
    };

    /**
     * Replaces the default Game_Screen.startFadeIn(duration) method.
     * @param duration Fade duration.
     */
    Game_Screen.prototype.startFadeIn = function (duration) {
        this.fadeSign = -1;
        this.duration = duration;
        this.starting = true;

        $gameSystem.snap = SceneManager.snap();
    };

    /**
     * Replaces the default Game_Screen.updateFadeOut() method.
     * Does nothing.
     */
    Game_Screen.prototype.updateFadeOut = function () {
    };

    /**
     * Replaces the default Game_Screen.updateFadeIn() method.
     * Does nothing.
     */
    Game_Screen.prototype.updateFadeIn = function () {
    };

    /**
     * Replaces the default Game_Screen.clearFade() method.
     */
    Game_Screen.prototype.clearFade = function () {
        this._brightness = 255;
        this.fadeSign = 0;
        this.duration = 0;
        this.starting = false;
    };

    /**
     * Replaces the default Spriteset_Base.createScreenSprites() method.
     */
    Spriteset_Base.prototype.createScreenSprites = function () {
        this._flashSprite = new ScreenSprite();
        this._fadeSprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
        this.addChild(this._flashSprite);
        this.addChild(this._fadeSprite);
    };

    /**
     * Replaces the default Spriteset_Base.updateScreenSprites() method.
     * If a transition is starting, it reads the current setting for "fade" transitions and creates a new one in the appropriate mode ($gameScreen.fadeSign),
     * otherwise it updates the preexisting transition.
     */
    Spriteset_Base.prototype.updateScreenSprites = function () {
        var color = $gameScreen.flashColor();
        this._flashSprite.setColor(color[0], color[1], color[2]);
        this._flashSprite.opacity = color[3];

        if ($gameScreen.starting) {
            var regex = /my\.Transition_[0-9a-zA-Z_]+/;
            if (regex.exec($gameSystem.transitions['fade']) != null) {
                this.transition = eval("new " + $gameSystem.transitions['fade'] + "(this._fadeSprite, 0, " + $gameScreen.fadeSign + ");");
            }
            else {
                this.transition = new my.Transition_Base(this._fadeSprite, 0, $gameScreen.fadeSign);
            }

            this.transition.start($gameScreen.duration);
            $gameScreen.starting = false;
        }
        if (this.transition && this.transition.active) {
            this.transition.update();
        }
    };

    return my;
})(Transitions || {});

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

