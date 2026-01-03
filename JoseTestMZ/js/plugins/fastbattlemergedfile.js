//(() => {


    //NEED TO TEST FAST BATTLE, THIS WAS NOT WRAPPED IN FUNCTION

    // do nothing if fast battle is disabled.
//

//    }else {


        let battleSpeed = 2.0; // Default multiplier

        window.toggleBattleSpeed = function () {
            battleSpeed = battleSpeed === 1.0 ? 2.0 : 1.0;
            console.log(`⚡ Battle Speed set to x${battleSpeed}`);
        };

        window.addEventListener('keydown', (e) => {
            if (e.shiftKey && e.key === 'F1') {
                toggleBattleSpeed();
            }
        });
        console.log("✅ FastBattleFlowFinal.js v2 loaded with Speed Control");

        // Battle Speed Multiplier (adjustable)
        // Removed duplicate battleSpeed declaration

        // Global helper to get Sprite_Enemy for a Game_Enemy
        window.getEnemySprite = function (enemy) {
            const sprites = SceneManager._scene?._spriteset?._enemySprites;
            if (!sprites) return null;
            return sprites.find(sprite => sprite._battler === enemy);
        };

        // Accelerate animation frames
        if (typeof Sprite_Animation !== 'undefined') {
            const _Sprite_Animation_updateMain = Sprite_Animation.prototype.updateMain;
            Sprite_Animation.prototype.updateMain = function () {
                if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
                    _Sprite_Animation_updateMain.call(this)
                }else{
                    if (!this._duration || this._duration <= 0) return;

                    this._frameCount += battleSpeed;
                    while (this._frameCount >= 1 && this._duration > 0) {
                        this._frameCount--;
                        _Sprite_Animation_updateMain.call(this);
                    }

                    if (this._duration <= 0) {
                        //print(this
                        this.onEnd();
                    }

                }
            };
        }

        // Accelerate battle log waits
        if (typeof Window_BattleLog !== 'undefined') {
            const _Window_BattleLog_wait = Window_BattleLog.prototype.wait;
            Window_BattleLog.prototype.wait = function () {
                if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
                    _Window_BattleLog_wait.call(this);
                }else{
                    if (this._waitCount > 0) {
                        this._waitCount = Math.min(this._waitCount, Math.ceil(30 / battleSpeed));
                    }
                    _Window_BattleLog_wait.call(this);

                }
            };
            const _Window_BattleLog_waitForMovement = Window_BattleLog.prototype.waitForMovement;
            Window_BattleLog.prototype.waitForMovement = function () {
                if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
                    _Window_BattleLog_waitForMovement.call(this);
                }else{
                    return false;
                }

            };
        }

        const _BattleManager_actionWait = BattleManager.actionWait
        BattleManager.actionWait = function () {
            if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
                _BattleManager_actionWait.call(this)
            }else{
                return false;
            }

        };

        const _Scene_Battle_updateWaitCount = Scene_Battle.prototype.updateWaitCount;
        Scene_Battle.prototype.updateWaitCount = function () {
            if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
                _Scene_Battle_updateWaitCount.call(this)
            }else{
                if (this._waitCount > 0) {
                    this._waitCount = Math.max(0, this._waitCount - battleSpeed);
                }
                return this._waitCount > 0;
            }
        };

        // Victory Skip + BGM Restore
        const _BattleManager_processVictory = BattleManager.processVictory;
        BattleManager.processVictory = function () {
            if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
                _BattleManager_processVictory.call(this)
            }else{
                console.log("🎉 Victory detected!");
                this.makeRewards();
                console.log("💰 Rewards:", this._rewards);
                this.gainRewards();
                this.replayBgmAndBgs();
                this.endBattle(0);
            }
        };

        // Unified processTurn
        const _BattleManager_processTurn = BattleManager.processTurn;
        BattleManager.processTurn = function () {
            if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
                _BattleManager_processTurn.call(this);
            }else{
                console.log("i am processing turn")
                let step = 1;
                const subject = this._subject;
                if (!subject) {
                    return _BattleManager_processTurn.call(this);
                }

                const action = subject.currentAction?.();
                if (!action) {
                    return _BattleManager_processTurn.call(this);
                }

                const item = action.item();
                if (!item) {
                    console.warn(`⚠️ ${subject.name()}'s action.item() is null`);
                    return _BattleManager_processTurn.call(this);
                }

                // Enemy Visual Effects
                if (subject.isEnemy() && action.isForOpponent()) {
                    const sprite = window.getEnemySprite(subject);
                    if (sprite) {
                        sprite.startEffect('whiten');
                        if (action.isMagicSkill()) {
                            sprite.setColorTone([128, 0, 255, 0]);
                            sprite._resetTintTimer = 20;
                            console.log(`✨ Magic skill detected for ${subject.name()}`);
                        }
                    }
                }
                if (subject && subject.canPaySkillCost(item)) {
                    subject.paySkillCost(item);
                }
                // Simultaneous Multi-Target Enemy Skills
                const targets = action.makeTargets();
                if (subject.isEnemy() && targets.length > 1 && action.isForOpponent()) {

                    console.log(`🚀 Simultaneous multi-target action: ${item.name}`);

                    const fallback_animationId = item.animationId;
                    if (fallback_animationId > 0) {
                        targets.forEach(t => {
                            console.log(`💥 Applying damage to: ${t.name()}`);
                            action.apply(t);
                            console.log(`⏩ Damage applied to ${t.name()}`);
                            const popupSprite = window.getEnemySprite(t);
                            if (popupSprite) {
                                t.startDamagePopup();
                                console.log(`⏩ Popup started for ${t.name()}`);
                            } else {
                                console.warn(`⚠️ No sprite found for ${t.name()}, skipping damage popup.`);
                            }
                            BattleManager._logWindow._waitCount = 10;
                            console.log(`⏩ Wait triggered`);
                            if (t.isDead()) {
                                console.log(`💀 ${t.name()} collapses`);
                                //t.performCollapse();
                            }
                        });
                    }

                    console.log(`▶ Step ${step++}: Removing action for ${subject.name()}`);
                    // i might need to uncomment this code but will leave it as is right now
                    //subject.removeCurrentAction();
                    console.log(`▶ Step ${step++}: Ending action phase for ${subject.name()}`);
                    //this.endAction();
                    console.log(`▶ Step ${step++}: Clearing subject.`);
                    //this._subject = null;
                } else {
                    console.log("i am in fallback")
                    // Fallback: process actor or single-target action manually
                    const targetsFallback = action.makeTargets();
                    const animationId = item.animationId;
                    if (animationId > 0) {
                        targetsFallback.forEach(t => {
                            console.log(`▶ Step ${step++}: Starting animation on ${t.name()}`);
                            //t.startAnimation(animationId, false, 0);
                        });
                    }
                    console.log("apply global start")
                    //action.applyGlobal();
                    console.log("apply global end")
                    targetsFallback.forEach(t => {
                        console.log(`▶ Step ${step++}: Applying damage to ${t.name()}`);
                        try {
                            action.apply(t);
                            console.log(`⏩ Post-apply state for ${t.name()}: isDead=${t.isDead()}, isActor=${t.isActor()}`);
                            console.log(`⏩ Damage applied to ${t.name()}`);
                        } catch (e) {
                            console.error(`❌ ERROR applying action to ${t.name()}:`, e);
                        }
                        console.log("starting damage popup")
                        t.startDamagePopup();
                        console.log("finish damage popup")
                        if (t.isDead()) {
                            console.log(`▶ Step ${step++}: ${t.name()} collapses`);
                            //t.performCollapse();
                        }
                    });

                    subject.removeCurrentAction();
                    //this.endAction();
                    //this._subject = null;


                }
                //if (!subject) {
                console.log("processing turn")
                _BattleManager_processTurn.call(this);
                //}

            }
        } // end if-else for multi-target vs fallback

        // Tint Reset for Sprite_Enemy
        const _Sprite_Enemy_update = Sprite_Enemy.prototype.update;
        Sprite_Enemy.prototype.update = function () {
            if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
                _Sprite_Enemy_update.call(this)
            }else{
                _Sprite_Enemy_update.call(this);

                if (this._resetTintTimer !== undefined) {
                    this._resetTintTimer--;
                    if (this._resetTintTimer <= 0) {
                        this.setColorTone([0, 0, 0, 0]);
                        delete this._resetTintTimer;
                    }
                }

            }
        };
//    }
// })();
