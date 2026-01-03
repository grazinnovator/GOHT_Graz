(() => {
    class Sprite_EnemyHpBar extends Sprite {
        constructor(battler) {
            super(new Bitmap(64, 8));
            this._battler = battler;
            this.anchor.x = 0.5;
            this.anchor.y = 1;
            this._lastHp = -1;
            this._lastMhp = -1;
            this.update();
        }

        update() {
            super.update();
            if (!this._battler || !this._battler.isAlive()) {
                this.visible = false;
                return;
            }

            if (this._battler.hp !== this._lastHp || this._battler.mhp !== this._lastMhp) {
                this._lastHp = this._battler.hp;
                this._lastMhp = this._battler.mhp;
                this.redraw();
            }
        }

        redraw() {
            const bmp = this.bitmap;
            bmp.clear();

            const rate = this._battler.hp / this._battler.mhp;
            const w = bmp.width;
            const h = bmp.height;

            bmp.fillRect(0, 0, w, h, '#000000');
            bmp.fillRect(1, 1, Math.floor((w - 2) * rate), h - 2, '#ff4444');
        }
    }

    // Inject HP bar into each enemy sprite
    const _Sprite_Enemy_initMembers = Sprite_Enemy.prototype.initMembers;
    Sprite_Enemy.prototype.initMembers = function() {
        _Sprite_Enemy_initMembers.call(this);
        this._hpBar = null;
    };

    const _Sprite_Enemy_setBattler = Sprite_Enemy.prototype.setBattler;
    Sprite_Enemy.prototype.setBattler = function(battler) {
        _Sprite_Enemy_setBattler.call(this, battler);
        if (!this._hpBar && battler) {
            this._hpBar = new Sprite_EnemyHpBar(battler);
            this.addChild(this._hpBar);
        }
    };

    const _Sprite_Enemy_update = Sprite_Enemy.prototype.update;
    Sprite_Enemy.prototype.update = function() {
        _Sprite_Enemy_update.call(this);
        if (this._hpBar) {
            this._hpBar.x = 0;
            this._hpBar.y = -this.bitmap.height / 2 - 8;
            this._hpBar.update();
        }
    };
})();