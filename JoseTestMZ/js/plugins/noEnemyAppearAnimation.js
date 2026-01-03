/*:
 * @target MZ
 * @plugindesc Completely disables enemy "emerge" animation and message at battle start (no blank box, no crash). v4.0
 * @author Jose Schmidt
 */

(() => {
    // do nothing if fast battle is disabled.


    // 1. Disable the "emerge" animation by overriding performAppear
    const _Game_Enemy_performAppear = Game_Enemy.prototype.performAppear
    Game_Enemy.prototype.performAppear = function() {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            _Game_Enemy_performAppear.call(this);
        }
        // Do nothing to suppress the emerge animation
    };

    // 2. Make all enemies count as already appeared to skip emergence
    const _Game_Enemy_isAppeared = Game_Enemy.prototype.isAppeared;
    Game_Enemy.prototype.isAppeared = function() {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            _Game_Enemy_isAppeared.call(this);
        }
        return true;
    };

    // 3. Override troop setup to suppress messages and ensure enemies are properly initialized
    const _BattleManager_setup = BattleManager.setup;
    BattleManager.setup = function(troopId, canEscape, canLose) {
        if (!PluginControl || PluginControl.isEnabled("fastBattle")) {
            _BattleManager_setup.call(this, troopId, canEscape, canLose);

            // Ensure all enemies are initialized and displayed without the emerge animation
            $gameTroop.members().forEach(enemy => {
                //enemy.setup(enemy.enemyId()); // Initialize the enemy
                enemy.performAppear(); // Suppress the emerge animation
                enemy.refresh(); // Force refresh to ensure sprite is visible
            });

            // Clear the battle log and any queued messages
            $gameMessage.clear();
        }
        else{
            _BattleManager_setup.call(this, troopId, canEscape, canLose);
        };
    };
    /*
    // 4. Override createSpriteset to manually add the enemy sprites to the battle layer
    const _Scene_Battle_createSpriteset = Scene_Battle.prototype.createSpriteset;
    Scene_Battle.prototype.createSpriteset = function() {
        _Scene_Battle_createSpriteset.call(this);

        // Log the current state of enemySprites
        console.log("Enemy Sprites Array:", this._spriteset._enemySprites);

        $gameTroop.members().forEach((enemy, index) => {
            // Check if sprite exists in _enemySprites
            let sprite = this._spriteset._enemySprites.find(sprite => sprite._enemy === enemy);

            if (!sprite) {
                console.log(`Enemy sprite for ${enemy.name()} not found, creating one manually.`);

                // Manually create sprite for the enemy
                sprite = new Sprite_Enemy(enemy);
                this._spriteset.addChild(sprite); // Add it to the spriteset

                // Set the sprite's position (use default position for now if NaN)
                const xPos = 0; // Default x position
                const yPos = 200; // Default y position

                console.log(`Created sprite for ${enemy.name()} at x: ${xPos}, y: ${yPos}`);
                sprite.x = xPos;
                sprite.y = yPos;

                // Ensure the sprite is visible
                sprite.visible = true;

                // Add sprite to _enemySprites array for tracking
                this._spriteset._enemySprites.push(sprite);
            }
        });

        console.log("Spriteset initialized with enemies:", this._spriteset._enemySprites);
    };
    */
    // 5. Override displayStartMessages to avoid showing start messages
    const _Window_BattleLog_displayStartMessages = Window_BattleLog.prototype.displayStartMessages;
    Window_BattleLog.prototype.displayStartMessages = function() {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            _Window_BattleLog_displayStartMessages.call(this)
        };
        // Do nothing to avoid displaying any start messages
    };

    // 6. Block any blank or whitespace-only log messages (prevents empty box)
    const _Window_BattleLog_addText = Window_BattleLog.prototype.addText;
    Window_BattleLog.prototype.addText = function(text) {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            _Window_BattleLog_addText.call(this,text)
        }else{
            // Only add non-empty, non-whitespace messages to the battle log
            if (text && text.trim() !== "") {
                if (!text.includes("appear!")){
                    _Window_BattleLog_addText.call(this, text);
                }
            }

        }
    };

    // 7. Prevent intro text from appearing at the beginning of the battle
    const _BattleManager_displayVictoryMessage = BattleManager.displayVictoryMessage;
    BattleManager.displayVictoryMessage = function() {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            _BattleManager_displayVictoryMessage.call(this);
        };
        // Prevent victory message from appearing
    };

    // 8. Add additional safety by overriding the method that handles message queuing.
    const _Game_Message_add = Game_Message.prototype.add;
    Game_Message.prototype.add = function(text) {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            _Game_Message_add.call(this,text);
        }else{
            // Prevent adding empty or unwanted messages to the queue
            if (text && text.trim() !== "") {
                if (!text.includes("appear!")){
                    this._texts.push(text);

                }
            }
        }
    };
})();
