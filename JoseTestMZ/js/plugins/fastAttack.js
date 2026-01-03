//=============================================================================
// FastAttack.js - Makes normal attacks execute faster in battle.
//=============================================================================

(() => {
    // do nothing if fast battle is disabled.


    const _Game_Battler_useItem = Game_Battler.prototype.useItem;
    Game_Battler.prototype.useItem = function(item) {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            _Game_Battler_useItem.call(this,item)
        }else{
            // Flag that a normal attack is being used
            this._isFastAttack = DataManager.isSkill(item) && item.id === this.attackSkillId();
            _Game_Battler_useItem.call(this, item);

        }
    };

    const _Scene_Battle_startAction = Scene_Battle.prototype.startAction;
    Scene_Battle.prototype.startAction = function() {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            debug("fast attack is not enabled");
            _Scene_Battle_startAction.call(this)
        }else{
            const subject = BattleManager._subject;
            const action = subject.currentAction();
            const item = action.item();
            const isFastAttack = subject._isFastAttack;

            // if (isFastAttack) {
                const targets = action.makeTargets();
                subject.spriteReturnHome(); // No step forward
                subject.performActionStart();
                subject.performAttack(); // Just show weapon motion
                subject.paySkillCost(item);
                // Play the animation directly
                for (const target of targets) {
                    const animationId = item.animationId;
                    if (animationId >= 0) {
                        target.startAnimation(animationId, false, 0);
                    }
                }

                // Apply the effects instantly
                action.applyGlobal();
                for (const target of targets) {
                    action.apply(target);
                    target.startDamagePopup();
                    if (target.isDead()) target.performCollapse();
                }

                BattleManager._logWindow.push("wait");
                BattleManager._logWindow.waitForMovement();
                BattleManager.endAction();
            //} else {
                _Scene_Battle_startAction.call(this);
            //}

        }
    };
})();
