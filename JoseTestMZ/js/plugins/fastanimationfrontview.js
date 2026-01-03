(() => {

    // do nothing if fast battle is disabled.


    console.log("✅ FastBattleFlow.js loaded");

    // Reduce log window wait times (damage popups, messages, etc.)
    const _Window_BattleLog_wait = Window_BattleLog.prototype.wait;
    Window_BattleLog.prototype.wait = function() {
        if (!PluginControl || PluginControl.isEnabled("fastBattle")) {
            if (this._waitCount > 0) {
                // Reduce wait counts aggressively (default is ~30+ frames)
                this._waitCount = Math.min(this._waitCount, 5); // Adjust to taste
            }

        }
        _Window_BattleLog_wait.call(this);
    };

    // Skip wait for movement (front-view doesn't need this anyway)
    const _Window_BattleLog_waitForMovement = Window_BattleLog.prototype.waitForMovement;
    Window_BattleLog.prototype.waitForMovement = function() {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            _Window_BattleLog_waitForMovement.call(this);
        }
        else{
            return false; // Always skip
        }
    };

    // Speed up action wait phase between subject and targets
    const _BattleMananger_actionWait = BattleManager.actionWait;
    BattleManager.actionWait = function() {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            _BattleMananger_actionWait.call(this);
        }else{
            return false; // Disables built-in waits after actions
        }
    };

    // Reduce popup wait when showing damage effects
    const _BattleManager_updateAction = BattleManager.updateAction;
    BattleManager.updateAction = function() {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            const originalWait = this._logWindow._waitCount;
            this._logWindow._waitCount = Math.min(originalWait, 5); // was ~30+
        }
        _BattleManager_updateAction.call(this);
    };
})();
