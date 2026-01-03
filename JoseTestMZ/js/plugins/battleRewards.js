// AutoSkipVictoryRewards.js
(() => {

    // do nothing if fast battle is disabled.


    const VICTORY_WAIT = 30; // 0.5 seconds
    const REWARDS_WAIT = 60; // 1 second

    const _Scene_Battle_startVictory = Scene_Battle.prototype.startVictory;
    Scene_Battle.prototype.startVictory = function() {
        if (!PluginControl || PluginControl.isEnabled("fastBattle")) {
            _Scene_Battle_startVictory.call(this);
            this._autoVictoryTimer = 0;
            this._victoryPhase = 1;

        }else{
            _Scene_Battle_startVictory.call(this);
        }//_Scene_Battle_startVictory.call(this);
    };

    const _Scene_Battle_updateVictoryPhase = Scene_Battle.prototype.updateVictoryPhase;
    Scene_Battle.prototype.updateVictoryPhase = function() {
        if (!PluginControl || PluginControl.isEnabled("fastBattle")) {
            switch (this._victoryPhase) {
                case 1:
                    if (this._autoVictoryTimer === 0) {
                        this.showVictoryMessage();
                    }
                    this._autoVictoryTimer++;
                    if (this._autoVictoryTimer >= VICTORY_WAIT) {
                        this._victoryPhase = 2;
                        this._autoVictoryTimer = 0;
                    }
                    break;

                case 2:
                    if (this._autoVictoryTimer === 0) {
                        this.makeRewards();
                        this._rewardsWindow = new Window_BattleRewards();
                        this._rewardsWindow.hide();
                        this.addWindow(this._rewardsWindow);
                        this._rewardsWindow.start(this._rewards);
                    }
                    this._autoVictoryTimer++;
                    if (this._autoVictoryTimer >= REWARDS_WAIT) {
                        this.gainRewards();
                        this.endBattle(0);
                    }
                    break;

                case 3:
                    this.updateVictoryFadeOut();
                    break;
            }

        }else{
            _Scene_Battle_updateVictoryPhase.call(this);
        }
    };
})();
