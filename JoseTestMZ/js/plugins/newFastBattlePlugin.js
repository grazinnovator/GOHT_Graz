/* ========================================
 * WORKING VERSION - DO NOT BREAK
 * ========================================
 * This version is confirmed working:
 * - Fast battles with speed multipliers
 * - Animations show and are faster
 * - Messages display (but faster)
 * - Victory skip works
 * - No crashes
 * 
 * TODO: Reduce dead gaps between actions
 * ======================================== */

(() => {
    let battleSpeed = 2.0;

    window.toggleBattleSpeed = function () {
        battleSpeed = battleSpeed === 1.0 ? 2.0 : 1.0;
        console.log(`⚡ Battle Speed set to x${battleSpeed}`);
    };

    window.addEventListener('keydown', (e) => {
        if (e.shiftKey && e.key === 'F1') {
            toggleBattleSpeed();
        }
    });

    console.log("✅ FastBattleFlowFinal.js v2 loaded");

    // ===== SPEED MULTIPLIERS =====
    
    // Disable action wait delays
    const _BattleManager_actionWait = BattleManager.actionWait;
    BattleManager.actionWait = function () {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            return _BattleManager_actionWait.call(this);
        }
        return false;
    };

    // Disable movement waits
    const _Window_BattleLog_waitForMovement = Window_BattleLog.prototype.waitForMovement;
    Window_BattleLog.prototype.waitForMovement = function () {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            return _Window_BattleLog_waitForMovement.call(this);
        }
        return false;
    };

    // Accelerate battle log waits - MORE AGGRESSIVE
    const _Window_BattleLog_wait = Window_BattleLog.prototype.wait;
    Window_BattleLog.prototype.wait = function () {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            _Window_BattleLog_wait.call(this);
        } else {
            // More aggressive: cap at 5 frames instead of calculated value
            if (this._waitCount > 0) {
                this._waitCount = Math.min(this._waitCount, 5);
            }
            _Window_BattleLog_wait.call(this);
        }
    };

    // Disable wait for effects (animations, etc.)
    const _Window_BattleLog_waitForEffect = Window_BattleLog.prototype.waitForEffect;
    Window_BattleLog.prototype.waitForEffect = function () {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            return _Window_BattleLog_waitForEffect.call(this);
        }
        return false; // Don't wait for effects
    };

    // Reduce waitForNewLine delays
    const _Window_BattleLog_waitForNewLine = Window_BattleLog.prototype.waitForNewLine;
    Window_BattleLog.prototype.waitForNewLine = function () {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            return _Window_BattleLog_waitForNewLine.call(this);
        }
        // Skip the wait, just do the newline
        return;
    };

    // More aggressive: reduce wait counts in updateAction
    const _BattleManager_updateAction = BattleManager.updateAction;
    BattleManager.updateAction = function() {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            _BattleManager_updateAction.call(this);
        } else {
            // Reduce wait counts before processing
            if (this._logWindow && this._logWindow._waitCount > 0) {
                this._logWindow._waitCount = Math.min(this._logWindow._waitCount, 3);
            }
            _BattleManager_updateAction.call(this);
        }
    };

    // Accelerate scene wait counts
    const _Scene_Battle_updateWaitCount = Scene_Battle.prototype.updateWaitCount;
    Scene_Battle.prototype.updateWaitCount = function () {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            return _Scene_Battle_updateWaitCount.call(this);
        }
        if (this._waitCount > 0) {
            this._waitCount = Math.max(0, this._waitCount - battleSpeed);
        }
        return this._waitCount > 0;
    };

    // Accelerate animation frames - SIMPLER APPROACH
    if (typeof Sprite_Animation !== 'undefined') {
        const _Sprite_Animation_update = Sprite_Animation.prototype.update;
        Sprite_Animation.prototype.update = function () {
            if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
                _Sprite_Animation_update.call(this);
            } else {
                // Speed up by reducing duration faster
                if (this._duration > 0) {
                    this._duration = Math.max(0, this._duration - battleSpeed);
                }
                _Sprite_Animation_update.call(this);
            }
        };
    }

    // ===== MESSAGES =====
    // Messages like "Actor casts Spark!" will still show, but speed multipliers
    // will make them display faster without adding extra delays

    // ===== VICTORY SKIP =====
    
    const _BattleManager_processVictory = BattleManager.processVictory;
    BattleManager.processVictory = function () {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            _BattleManager_processVictory.call(this);
        } else {
            this.makeRewards();
            this.gainRewards();
            this.replayBgmAndBgs();
            this.endBattle(0);
        }
    };

    // ===== ENEMY VISUAL EFFECTS (Magic tint) =====
    
    window.getEnemySprite = function (enemy) {
        const sprites = SceneManager._scene?._spriteset?._enemySprites;
        if (!sprites) return null;
        return sprites.find(sprite => sprite._battler === enemy);
    };

    const _Sprite_Enemy_update = Sprite_Enemy.prototype.update;
    Sprite_Enemy.prototype.update = function () {
        _Sprite_Enemy_update.call(this);
        if (PluginControl && PluginControl.isEnabled("fastBattle")) {
            if (this._resetTintTimer !== undefined) {
                this._resetTintTimer--;
                if (this._resetTintTimer <= 0) {
                    this.setColorTone([0, 0, 0, 0]);
                    delete this._resetTintTimer;
                }
            }
        }
    };
})();