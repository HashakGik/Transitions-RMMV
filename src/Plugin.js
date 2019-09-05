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