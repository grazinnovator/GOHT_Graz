(() => {

    /*
    if (typeof Bitmap.prototype.drawIcon !== 'function') {
        Bitmap.prototype.drawIcon = function(iconIndex, x, y) {
            const pw = ImageManager.iconWidth;
            const ph = ImageManager.iconHeight;
            const sx = (iconIndex % 16) * pw;
            const sy = Math.floor(iconIndex / 16) * ph;
            const iconSet = ImageManager.loadSystem("IconSet");
            this.blt(iconSet, sx, sy, pw, ph, x, y);
        };
    }

     */

    if (!Bitmap.prototype.drawIcon && Window_Base.prototype.drawIcon) {
        Bitmap.prototype.drawIcon = function(iconIndex, x, y) {
            const fakeWindow = new Window_Base(new Rectangle(0, 0, 1, 1));
            fakeWindow.contents = this;
            fakeWindow.drawIcon(iconIndex, x, y);
        };
    }

    class Sprite_HudBox extends Sprite {
        constructor(x, y, width = 200, height = 50) {
            super(new Bitmap(width, height));
            this.x = x;
            this.y = y;
            this._width = width;
            this._height = height;
            // Track previous values to only update when they change
            this._lastHp = -1;
            this._lastMhp = -1;
            this._lastGold = -1;
            this._lastTotalBattles = -1;
            this.drawBox();
            //this.drawStats(text,)
        }

        drawBox() {
            const ctx = this.bitmap.context;
            ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            ctx.fillRect(0, 0, this._width, this._height);

            this.bitmap.textColor = "#ffffff";
            this.bitmap.fontSize = 20;

            let totalBattles=$gameVariables.value(81)+$gameVariables.value(82)+
                $gameVariables.value(83)+$gameVariables.value(84)+
                $gameVariables.value(85)+$gameVariables.value(86)+
                $gameVariables.value(87)+$gameVariables.value(88)

            let text = "HP: " + $gameParty.leader().hp+" / "+$gameParty.leader().mhp;
            text = text+"\n"+"GOLD: " + $gameParty.gold();
            //enemy counters are from 81 to 88

            text = text+"\n"+"Total Battles: " + totalBattles;

            if ($dataMap.note?.includes("<Dungeon 1>")){
                text = text+"\n"+"L1 Battles: " + $gameVariables.value(81);
            }
            if ($dataMap.note?.includes("<Dungeon 2>")){
                text = text+"\n"+"L2 Battles: " + $gameVariables.value(82);
            }
            if ($dataMap.note?.includes("<Dungeon 3>")){
                text = text+"\n"+"L3 Battles: " + $gameVariables.value(83);
            }
            if ($dataMap.note?.includes("<Dungeon 4>")){
                text = text+"\n"+"L4 Battles: " + $gameVariables.value(84);
            }
            if ($dataMap.note?.includes("<Dungeon 5>")){
                text = text+"\n"+"L5 Battles: " + $gameVariables.value(85);
            }

            if ($dataMap.note?.includes("<Dungeon 6>")){``
                text = text+"\n"+"L6 Battles: " + $gameVariables.value(86);
            }
            if ($dataMap.note?.includes("<Dungeon 7>")){
                text = text+"\n"+"L7 Battles: " + $gameVariables.value(87);
            }
            if ($dataMap.note?.includes("<Dungeon 8>")){
                text = text+"\n"+"L8 Battles: " + $gameVariables.value(88);
            }


            const lines = text.split("\n");
            const lineHeight = this.bitmap.fontSize + 4;

            lines.forEach((line, index) => {
                const y = 10 + index * lineHeight;
                this.bitmap.drawText(line, 10, y, this._width - 20, lineHeight, "left");
            });

            this.bitmap._baseTexture.update();


        }

        update() {
            super.update();
            
            // Skip updates when message window is open (performance optimization)
            if ($gameMessage && $gameMessage.isBusy()) {
                return;
            }
            
            // Only update when values actually change (performance optimization)
            const leader = $gameParty.leader();
            if (!leader) return;
            
            const currentHp = leader.hp;
            const currentMhp = leader.mhp;
            const currentGold = $gameParty.gold();
            const totalBattles = $gameVariables.value(81) + $gameVariables.value(82) +
                $gameVariables.value(83) + $gameVariables.value(84) +
                $gameVariables.value(85) + $gameVariables.value(86) +
                $gameVariables.value(87) + $gameVariables.value(88);
            
            // Only redraw if values changed
            if (currentHp !== this._lastHp || currentMhp !== this._lastMhp || 
                currentGold !== this._lastGold || totalBattles !== this._lastTotalBattles) {
                this._lastHp = currentHp;
                this._lastMhp = currentMhp;
                this._lastGold = currentGold;
                this._lastTotalBattles = totalBattles;
                this.bitmap.clear();
                this.drawBox();
            }
        }
    }

    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        const y = Graphics.height - 120 - 25;

        if ($dataMap.note?.includes("<Dungeon>")){
            //stats
            if (!this._customHudBox) {
                this._customHudBox = new Sprite_HudBox(16, y, 180, 125);
                this.addChild(this._customHudBox);
            }

            //items
            if (!this._lastItemsHud) {
                this._lastItemsHud = new Sprite_LastItemsHud(Graphics.width - 220,y, 200, 125);
                this.addChild(this._lastItemsHud);
            }

        }


    };

    const _BattleManager_gainRewards = BattleManager.gainRewards;
    BattleManager.gainRewards = function() {
        _BattleManager_gainRewards.call(this);

        window._lastBattleItems = this._rewards.items.concat(this._rewards.weapons, this._rewards.armors);

        // Limit to last 5
        window._lastBattleItems = window._lastBattleItems.slice(-5);
    };

    class Sprite_LastItemsHud extends Sprite {
        constructor(x = Graphics.width - 220, y = 16, width = 200, height = 120) {
            const bmp = new Bitmap(width, height);
            super(bmp);
            this.x = x;
            this.y = y;
            this._width = width;
            this._height = height;
            this._lastItems = [];
            this.refresh();
        }

        refresh() {
            this.bitmap.clear();
            const padding = 6;
            const lineHeight = 28;
            const fontSize = 20;


            this.bitmap.fontSize = fontSize;
            this.bitmap.textColor = "#ffffff";
            this.bitmap.outlineColor = "rgba(0,0,0,0.6)";
            this.bitmap.outlineWidth = 3;

            const items = window._lastBattleItems || [];


            const ctx = this.bitmap.context;
            ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            ctx.fillRect(0, 0, this._width, this._height);

            //Title:
            let text="Items won last battle"
            this.bitmap.drawText(text, padding, padding, this._width - 36, lineHeight, "left");

            items.forEach((item, i) => {
                if (!item) return;
                const y = padding + (i+1) * lineHeight;//include title
                if (item.iconIndex) {
                    console.log("bitmap type:", this.bitmap);
                    console.log("bitmap constructor:", this.bitmap?.constructor?.name);
                    this.bitmap.drawIcon(item.iconIndex, padding, y);
                }
                this.bitmap.drawText(item.name, padding + 36, y, this._width - 36, lineHeight, "left");
            });

            this.bitmap._baseTexture.update?.(); // Safe update
        }

        update() {
            super.update();
            
            // Skip updates when message window is open (performance optimization)
            if ($gameMessage && $gameMessage.isBusy()) {
                return;
            }
            
            // Only refresh if items changed
            const currentItems = window._lastBattleItems || [];
            if (JSON.stringify(this._lastItems) !== JSON.stringify(currentItems)) {
                this.refresh();
                this._lastItems = JSON.parse(JSON.stringify(currentItems));
            }
        }
    }
})();