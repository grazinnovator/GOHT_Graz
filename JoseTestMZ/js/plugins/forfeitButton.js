(() => {
    class Sprite_ForfeitButton extends Sprite {
        constructor() {
            const width = 100;
            const height = 36;
            const bitmap = new Bitmap(width, height);
            super(bitmap);

            this._width = width;
            this._height = height;
            this._rect = new Rectangle(10, 10, width, height);
            this.x = this._rect.x;
            this.y = this._rect.y;

            if ($gameSwitches.value(35)){
                bitmap.fontSize = 20;
                bitmap.fillRect(0, 0, width, height, "#aa0000");
                bitmap.textColor = "#ffffff";
                bitmap.drawText("Forfeit", 0, 0, width, height, "center");

                this.visible = true;

            }
        }

        update() {
            super.update();

            // Only show the button if battle is active
            /*
            const active = this.isBattleActive();
            this.visible = active;
            */
            const active =this.isForfeitVisible();
                this.visible = active;

            if (active && TouchInput.isTriggered()) {
                const x = TouchInput.x;
                const y = TouchInput.y;
                if (this._rect.contains(x, y)) {
                    this.forfeitParty();
                }
            }
        }

        /*
        isBattleActive() {
            // Do not show if the battle is ending, or already won/lost
            return (
                !$gameParty.inBattle() ? false :
                    BattleManager._phase !== 'battleEnd' &&
                    !BattleManager._escaped &&
                    !BattleManager._victoryPhase &&
                    $gameParty.aliveMembers().length > 0
            );
        }
        */
        isBattleActive() {
            const phase = BattleManager._phase;
            const allowed = ["input", "turn", "action"];
            return (
                $gameParty.inBattle() &&
                allowed.includes(phase) &&
                !$gameMessage.isBusy()
            );
        }



        forfeitParty() {
            console.log("[Forfeit] Activated.");
            $gameParty.members().forEach(actor => actor.setHp(0));
            BattleManager.checkBattleEnd();
        }

        isForfeitVisible = function () {
            return (
                SceneManager._scene instanceof Scene_Battle &&
                !$gameMessage.isBusy() &&
                !BattleManager._rewardsPending &&
                BattleManager._phase !== 'battleEnd' &&
                BattleManager._phase !== 'init' &&
                BattleManager._phase !== 'start'&&
                !SceneManager._scene._fadeOutDuration &&
                !SceneManager.isSceneChanging()
            );
        };

    }



    const _Scene_Battle_createSpriteset = Scene_Battle.prototype.createSpriteset;
    Scene_Battle.prototype.createSpriteset = function() {
        _Scene_Battle_createSpriteset.call(this);
        this.createForfeitButton();
    };

    Scene_Battle.prototype.createForfeitButton = function() {
        this._forfeitButton = new Sprite_ForfeitButton();
        this.addChild(this._forfeitButton);
    };
})();