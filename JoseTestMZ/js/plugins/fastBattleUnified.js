// FastBattleMerged.js - Combined Fast Battle Plugin

let battleSpeed = 2.0; // Default multiplier

window.toggleBattleSpeed = function () {
    battleSpeed = battleSpeed === 1.0 ? 2.0 : 1.0;
    debugLog(`⚡ Battle Speed set to x${battleSpeed}`);
};

// Sprite Enemy Tint Reset
const _Sprite_Enemy_update = Sprite_Enemy.prototype.update;
Sprite_Enemy.prototype.update = function () {
    _Sprite_Enemy_update.call(this);
    if (PluginControl && PluginControl.isEnabled("fastBattle")) {
        if (this._resetTintTimer !== undefined) {
            this._resetTintTimer--;
            if (this._resetTintTimer <= 0) {
                this.setColorTone([0, 0, 0, 0]);
                delete this._resetTintTimer;
            }
        }
    }
};

window.getEnemySprite = function (enemy) {
    const sprites = SceneManager._scene?._spriteset?._enemySprites;
    if (!sprites) return null;
    return sprites.find(sprite => sprite._battler === enemy);
};

// Accelerate Animation
if (typeof Sprite_Animation !== 'undefined') {
    const _Sprite_Animation_updateMain = Sprite_Animation.prototype.updateMain;
    Sprite_Animation.prototype.updateMain = function () {
        if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
            _Sprite_Animation_updateMain.call(this);
        } else {
            if (!this._duration || this._duration <= 0) return;
            this._frameCount += battleSpeed;
            while (this._frameCount >= 1 && this._duration > 0) {
                this._frameCount--;
                _Sprite_Animation_updateMain.call(this);
            }
            if (this._duration <= 0) this.onEnd();
        }
    };
}

// BattleLog Wait Tweaks
const _Window_BattleLog_wait = Window_BattleLog.prototype.wait;
Window_BattleLog.prototype.wait = function () {
    if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
        _Window_BattleLog_wait.call(this);
    } else {
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
    } else {
        return false;
    }
};

// BattleManager Action Wait
const _BattleManager_actionWait = BattleManager.actionWait;
BattleManager.actionWait = function () {
    if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
        _BattleManager_actionWait.call(this);
    } else {
        return false;
    }
};

// Scene_Battle Wait Count
const _Scene_Battle_updateWaitCount = Scene_Battle.prototype.updateWaitCount;
Scene_Battle.prototype.updateWaitCount = function () {
    if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
        return _Scene_Battle_updateWaitCount.call(this);
    } else {
        if (this._waitCount > 0) {
            this._waitCount = Math.max(0, this._waitCount - battleSpeed);
        }
        return this._waitCount > 0;
    }
};

// Fast Attack Execution
const _Game_Battler_useItem = Game_Battler.prototype.useItem;
Game_Battler.prototype.useItem = function (item) {
    if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
        _Game_Battler_useItem.call(this, item);
    } else {
        this._isFastAttack = DataManager.isSkill(item) && item.id === this.attackSkillId();
        _Game_Battler_useItem.call(this, item);
    }
};

const _Scene_Battle_startAction = Scene_Battle.prototype.startAction;
Scene_Battle.prototype.startAction = function () {
    if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
        _Scene_Battle_startAction.call(this);
    } else {
        const subject = BattleManager._subject;
        const action = subject.currentAction();
        const item = action.item();
        const isFastAttack = subject._isFastAttack;

        if (isFastAttack) {
            const targets = action.makeTargets();
            subject.spriteReturnHome();
            subject.performActionStart();
            subject.performAttack();

            for (const target of targets) {
                const animationId = item.animationId;
                if (animationId >= 0) {
                    target.startAnimation(animationId, false, 0);
                }
            }

            action.applyGlobal();
            for (const target of targets) {
                action.apply(target);
                target.startDamagePopup();
                if (target.isDead()) target.performCollapse();
            }

            BattleManager._logWindow.push("wait");
            BattleManager._logWindow.waitForMovement();
            BattleManager.endAction();
        } else {
            _Scene_Battle_startAction.call(this);
        }
    }
};

// Auto Victory & Reward Skip
const _Scene_Battle_startVictory = Scene_Battle.prototype.startVictory;
Scene_Battle.prototype.startVictory = function () {
    if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
        _Scene_Battle_startVictory.call(this);
    } else {
        this._autoVictoryTimer = 0;
        this._victoryPhase = 1;
    }
};

const _Scene_Battle_updateVictoryPhase = Scene_Battle.prototype.updateVictoryPhase;
Scene_Battle.prototype.updateVictoryPhase = function () {
    if (!PluginControl || !PluginControl.isEnabled("fastBattle")) {
        _Scene_Battle_updateVictoryPhase.call(this);
    } else {
        const VICTORY_WAIT = 30;
        const REWARDS_WAIT = 60;
        switch (this._victoryPhase) {
            case 1:
                if (this._autoVictoryTimer++ >= VICTORY_WAIT) {
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
                if (this._autoVictoryTimer++ >= REWARDS_WAIT) {
                    this.gainRewards();
                    this.endBattle(0);
                }
                break;
            case 3:
                this.updateVictoryFadeOut();
                break;
        }
    }
};