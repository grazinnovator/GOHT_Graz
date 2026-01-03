(() => {
    console.log("✅ EnemyAttackVisuals.js loaded");

    window.getEnemySprite = function(enemy) {
        const sprites = SceneManager._scene?._spriteset?._enemySprites;
        if (!sprites) return null;
        return sprites.find(sprite => sprite._battler === enemy);
    };

    const _BattleManager_processTurn = BattleManager.processTurn;
    BattleManager.processTurn = function() {
        const subject = this._subject;
        if (!subject || !subject.isEnemy()) {
            return _BattleManager_processTurn.call(this);
        }

        const action = subject.currentAction();
        if (!action || !action.item()) {
            return _BattleManager_processTurn.call(this);
        }

        if (action.isForOpponent()) {
            console.log(`⚡ Enemy ${subject.name()} uses ${action.item().name}`);

            const sprite = getEnemySprite(subject);
            if (sprite) {
                sprite.startEffect('whiten');

                if (action.isMagicSkill()) {
                    console.log("✨ Magic skill detected, applying tint");
                    sprite.setColorTone([128, 0, 255, 0]);
                    sprite._resetTintTimer = 20;
                }
            } else {
                console.warn("❗ No sprite found for enemy", subject.name());
            }
        }

        _BattleManager_processTurn.call(this);
    };

    // Tint reset logic
    const _Sprite_Enemy_update = Sprite_Enemy.prototype.update;
    Sprite_Enemy.prototype.update = function() {
        _Sprite_Enemy_update.call(this);

        if (this._resetTintTimer !== undefined) {
            this._resetTintTimer--;
            if (this._resetTintTimer <= 0) {
                this.setColorTone([0, 0, 0, 0]);
                delete this._resetTintTimer;
            }
        }
    };
})();
