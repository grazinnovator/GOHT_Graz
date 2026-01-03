(() => {
    const _Game_Enemy_die = Game_Enemy.prototype.die;
    Game_Enemy.prototype.die = function() {
        const enemyId = this.enemyId();
        const varBase = 100; // starting variable ID for tracking
        const varId = varBase + enemyId;

        const current = $gameVariables.value(varId);
        $gameVariables.setValue(varId, current + 1);
        $gameParty.loseGold($gameParty.gold() % 1);
        _Game_Enemy_die.call(this);
    };


})();