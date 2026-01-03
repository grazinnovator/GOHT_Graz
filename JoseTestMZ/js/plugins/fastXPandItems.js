(() => {
    // do nothing if fast battle is disabled.


    console.log("✅ InstantBattleEnd.js loaded");

    // Wrap core battle phase methods to log when they're used
    const _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            _Scene_Battle_update.call(this)
        }else{
            _Scene_Battle_update.call(this);
            if (this._battlePhase) {
                console.log("🔄 Battle Phase:", this._battlePhase);
            }

        }
    };

    const _Scene_Battle_endVictory = Scene_Battle.prototype.endVictory;
    Scene_Battle.prototype.endVictory = function() {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            _Scene_Battle_endVictory.call(this)
        }else{
            console.log("🏁 endVictory called");
            _Scene_Battle_endVictory.call(this);

        };
    };

    const _Scene_Battle_startVictory = Scene_Battle.prototype.startVictory;
    Scene_Battle.prototype.startVictory = function() {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            _Scene_Battle_startVictory.call(this)
        }else{
            console.log("✅ startVictory called");
            _Scene_Battle_startVictory.call(this);
            this._victoryAutoTimer = 0;
            this._battlePhase = "victory";
        }
    };

    const _Scene_Battle_updateVictoryPhase = Scene_Battle.prototype.updateVictoryPhase;
    Scene_Battle.prototype.updateVictoryPhase = function() {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            _Scene_Battle_updateVictoryPhase.call(this)
        }else{
            if (this._victoryAutoTimer === 0) {
                console.log("👣 updateVictoryPhase started");
            }

            this._victoryAutoTimer++;

            if (this._victoryAutoTimer === 30) {
                console.log("✅ Auto-ending battle (rewards and end)");
                this.makeRewards();
                this.gainRewards();
                this.endBattle(0);
            }

            _Scene_Battle_updateVictoryPhase.call(this);

        }
    };
})();
