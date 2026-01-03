console.log("✅ EnemyAttackVisuals.js loaded");

const _BattleManager_processTurn = BattleManager.processTurn;
BattleManager.processTurn = function() {
    console.log("🔄 EnemyAttackVisuals: processTurn called");

    const subject = this._subject;
    if (!subject) {
        console.warn("⚠️ No subject in EnemyAttackVisuals");
        return _BattleManager_processTurn.call(this);
    }

    console.log(`🎭 Subject: ${subject.name()}`);

    const action = subject.currentAction();
    if (!action) {
        console.warn(`⚠️ ${subject.name()} has no currentAction()`);
        return _BattleManager_processTurn.call(this);
    }

    const item = action.item();
    if (!item) {
        console.warn(`⚠️ ${subject.name()}'s action.item() is null`);
        return _BattleManager_processTurn.call(this);
    }

    if (action.isForOpponent()) {
        console.log(`⚡ Enemy ${subject.name()} uses ${item.name}`);

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
