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

    // Process multiple log methods per frame for instant damage display
    const _Window_BattleLog_callNextMethod = Window_BattleLog.prototype.callNextMethod;
    Window_BattleLog.prototype.callNextMethod = function() {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            _Window_BattleLog_callNextMethod.call(this);
        } else {
            // Process multiple methods per frame (up to 10) for instant damage resolution
            let processed = 0;
            while (this._methods.length > 0 && processed < 10) {
                _Window_BattleLog_callNextMethod.call(this);
                processed++;
            }
        }
    };

    // Accelerate battle log waits - MORE AGGRESSIVE
    const _Window_BattleLog_wait = Window_BattleLog.prototype.wait;
    Window_BattleLog.prototype.wait = function () {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            _Window_BattleLog_wait.call(this);
        } else {
            // More aggressive: cap at 1 frame for faster damage resolution
            if (this._waitCount > 0) {
                this._waitCount = Math.min(this._waitCount, 1);
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

    // Process ALL targets at once for instant damage resolution
    const _BattleManager_updateAction = BattleManager.updateAction;
    BattleManager.updateAction = function() {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            _BattleManager_updateAction.call(this);
        } else {
            // Process ALL remaining targets immediately in one frame
            if (this._targets && this._targets.length > 0) {
                // Process all targets at once
                const targets = this._targets.slice(); // Copy array
                this._targets.length = 0; // Clear array
                
                // Apply damage to all targets immediately
                targets.forEach(target => {
                    this.invokeAction(this._subject, target);
                });
                
                // End action after all targets processed
                this.endAction();
            } else {
                // No targets left, end action normally
                this.endAction();
            }
        }
    };
    
    // Also reduce waits in displayActionResults
    const _Window_BattleLog_displayActionResults = Window_BattleLog.prototype.displayActionResults;
    Window_BattleLog.prototype.displayActionResults = function(subject, target) {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            _Window_BattleLog_displayActionResults.call(this, subject, target);
        } else {
            // Skip waitForNewLine to speed up multi-target processing
            if (target.result().used) {
                this.push('pushBaseLine');
                this.displayCritical(target);
                this.push('popupDamage', target);
                this.push('popupDamage', subject);
                this.displayDamage(target);
                this.displayAffectedStatus(target);
                this.displayFailure(target);
                // Skip waitForNewLine - removed for speed
                this.push('popBaseLine');
            }
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

    // ===== ACCELERATE ENEMY COLLAPSE =====
    
    const _Sprite_Enemy_updateEffect = Sprite_Enemy.prototype.updateEffect;
    Sprite_Enemy.prototype.updateEffect = function () {
        if (PluginControl && PluginControl.isEnabled("fastBattle")) {
            // Accelerate collapse effects by reducing duration faster (4x speed)
            if (this._effectDuration > 0 && 
                (this._effectType === 'collapse' || 
                 this._effectType === 'bossCollapse' || 
                 this._effectType === 'instantCollapse')) {
                // Reduce duration by battleSpeed * 2 (4x faster than normal)
                this._effectDuration = Math.max(0, this._effectDuration - (battleSpeed * 2));
            }
        }
        _Sprite_Enemy_updateEffect.call(this);
    };
    
    // Make collapse effects not block battle flow
    const _Sprite_Enemy_isEffecting = Sprite_Enemy.prototype.isEffecting;
    Sprite_Enemy.prototype.isEffecting = function () {
        if (PluginControl && PluginControl.isEnabled("fastBattle")) {
            // Don't count collapse effects as "effecting" so battle doesn't wait
            if (this._effectType === 'collapse' || 
                this._effectType === 'bossCollapse' || 
                this._effectType === 'instantCollapse') {
                return false; // Don't wait for collapse
            }
        }
        return _Sprite_Enemy_isEffecting.call(this);
    };

    // ===== ACCELERATE DAMAGE POPUPS =====
    
    // Speed up damage popup duration (default is 90 frames)
    if (typeof Sprite_Damage !== 'undefined') {
        const _Sprite_Damage_update = Sprite_Damage.prototype.update;
        Sprite_Damage.prototype.update = function () {
            if (PluginControl && PluginControl.isEnabled("fastBattle")) {
                // Accelerate damage popup by reducing duration faster
                if (this._duration > 0) {
                    // Reduce duration by battleSpeed * 2 (4x faster)
                    this._duration = Math.max(0, this._duration - (battleSpeed * 2));
                }
            }
            _Sprite_Damage_update.call(this);
        };
    }
})();