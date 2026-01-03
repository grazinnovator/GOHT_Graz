(() => {
    console.log("✅ VictorySkipCore.js loaded");

    // Save map BGM & BGS at the start of battle
    const _BattleManager_startBattle = BattleManager.startBattle;
    BattleManager.startBattle = function() {
        console.log("🎵 Saving map BGM and BGS");
        this._savedBgm = AudioManager.saveBgm();
        this._savedBgs = AudioManager.saveBgs();
        _BattleManager_startBattle.call(this);
    };

    // Override processVictory to skip reward window and restore music
    const _BattleManager_processVictory = BattleManager.processVictory;
    BattleManager.processVictory = function() {
        console.log("🎉 Victory detected!");

        // Gain rewards
        this.makeRewards();
        console.log("💰 Rewards:", this._rewards);
        this.gainRewards();

        // Restore map music and end battle
        console.log("🎵 Restoring map BGM and BGS");
        this.replayBgmAndBgs();
        this.endBattle(0); // 0 = Victory
    };
})();
