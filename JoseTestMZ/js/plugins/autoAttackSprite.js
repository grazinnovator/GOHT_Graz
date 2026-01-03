(() => {
    const AUTO_ATTACK_SWITCH_ID = 40;

    class Sprite_AutoAttackButton extends Sprite {
        constructor() {
            const width = 120;
            const height = 36;
            const bitmap = new Bitmap(width, height);
            super(bitmap);

            this._width = width;
            this._height = height;
            this._rect = new Rectangle(0, 0, width, height);

            // Position: right side, 10px margin
            this.x = Graphics.width - width - 10;
            this.y = 10;

            this.refresh();
        }

        refresh() {
            const bmp = this.bitmap;
            bmp.clear();

            const isOn = $gameSwitches.value(AUTO_ATTACK_SWITCH_ID);

            // Base color
            bmp.fillRect(0, 0, this._width, this._height, isOn ? "#228822" : "#555");

            // Grainy effect
            for (let i = 0; i < 150; i++) {
                const x = Math.floor(Math.random() * this._width);
                const y = Math.floor(Math.random() * this._height);
                const color = Math.random() < 0.5 ? "#333" : "#777";
                bmp.fillRect(x, y, 1, 1, color);
            }

            // Text
            bmp.fontSize = 20;
            bmp.textColor = "#ffffff";
            bmp.drawText(isOn ? "Auto: ON" : "Auto: OFF", 0, 0, this._width, this._height, "center");
        }

        update() {
            super.update();
            this.visible = this.shouldShow();

            if (this.visible && TouchInput.isTriggered()) {
                const x = TouchInput.x;
                const y = TouchInput.y;
                if (this.hitTest(x, y)) {
                    const newState = !$gameSwitches.value(AUTO_ATTACK_SWITCH_ID);
                    $gameSwitches.setValue(AUTO_ATTACK_SWITCH_ID, newState);
                    SoundManager.playOk();
                    this.refresh();
                }
            }
        }

        hitTest(x, y) {
            return (
                x >= this.x &&
                y >= this.y &&
                x < this.x + this._width &&
                y < this.y + this._height
            );
        }

        shouldShow() {
            return (
                SceneManager._scene instanceof Scene_Battle &&
                !$gameMessage.isBusy() &&
                !BattleManager._rewardsPending &&
                BattleManager._phase !== 'battleEnd' &&
                BattleManager._phase !== 'init' &&
                BattleManager._phase !== 'start' &&
                !SceneManager._scene._fadeOutDuration &&
                !SceneManager.isSceneChanging()
            );
        }
    }

    const _Scene_Battle_createSpriteset = Scene_Battle.prototype.createSpriteset;
    Scene_Battle.prototype.createSpriteset = function() {
        _Scene_Battle_createSpriteset.call(this);
        this.createAutoAttackButton();
    };

    Scene_Battle.prototype.createAutoAttackButton = function() {
        this._autoAttackButton = new Sprite_AutoAttackButton();
        this.addChild(this._autoAttackButton);
    };
})();