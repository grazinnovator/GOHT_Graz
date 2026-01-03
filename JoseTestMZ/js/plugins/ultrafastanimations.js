(() => {
    console.log("✅ UltraFastBattleFlow.js loaded");

    // Remove wait counts (visual pacing only)
    Scene_Battle.prototype.updateWaitCount = function() {
        this._waitCount = 0;
        return false;
    };

    // Minimize log text wait times
    const _Window_BattleLog_wait = Window_BattleLog.prototype.wait;
    Window_BattleLog.prototype.wait = function() {
        if (this._waitCount > 0) {
            this._waitCount = Math.min(this._waitCount, 2);
        }
        _Window_BattleLog_wait.call(this);
    };

    // Disable movement waits (front-view safe)
    Window_BattleLog.prototype.waitForMovement = function() {
        return false;
    };

    // Disable action wait delays
    BattleManager.actionWait = function() {
        return false;
    };

    // Enhanced Logging for updateAction
    const _BattleManager_updateAction = BattleManager.updateAction;
    BattleManager.updateAction = function() {
        console.log("🔄 updateAction triggered");

        const subject = this._subject;
        if (!subject) {
            console.warn("⚠️ No subject found in BattleManager.updateAction");
            return;
        }
        console.log(`🎭 Subject: ${subject.name()}`);

        const action = subject.currentAction();
        if (!action) {
            console.warn(`⚠️ ${subject.name()} has no currentAction()`);
            this.endAction();
            return;
        }

        const item = action.item();
        if (!item) {
            console.warn(`⚠️ ${subject.name()}'s action.item() is null`);
            subject.removeCurrentAction();
            this.endAction();
            return;
        }

        console.log(`📝 Processing Action: ${item.name}`);

        const targets = action.makeTargets();
        console.log(`🎯 Targets: ${targets.map(t => t.name()).join(", ")}`);

        if (subject.isEnemy() && targets.length > 1 && action.isForOpponent()) {
            console.log(`🚀 Simultaneous Multi-Target Action: ${item.name}`);

            const animationId = item.animationId;
            if (animationId > 0) {
                targets.forEach(target => {
                    target.startAnimation(animationId, false, 0);
                    console.log(`🎞 Animation ${animationId} on: ${target.name()}`);
                });
            }

            action.applyGlobal();

            targets.forEach(target => {
                console.log(`💥 Applying damage to: ${target.name()}`);
                action.apply(target);
                target.startDamagePopup();
                if (target.isDead()) {
                    console.log(`💀 ${target.name()} collapses`);
                    target.performCollapse();
                }
            });

            subject.removeCurrentAction();
            console.log(`✅ Finished ${subject.name()}'s action`);
            this.endAction();
        } else {
            console.log(`➡️ Normal action flow for ${subject.name()}`);
            _BattleManager_updateAction.call(this);
        }
    };
})();
