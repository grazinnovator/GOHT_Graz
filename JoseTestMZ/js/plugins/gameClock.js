/*:
 * @target MZ
 * @plugindesc Hard mode countdown clock — top right corner, game over on timeout, saves state, ignores towns & battles
 * @author You
 */

(() => {
    window.$gameClock = null;
    const HARD_MODE_SWITCH_ID = 38;
    const CLOCK_TIME_START = 40 * 60; // seconds
    const TOWN_MAP_IDS = [1, 13, 16, 22, 10, 23];

    window.$debugLog = [];
    window.debug = function (...args) {
        const text = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
        $debugLog.push(text);
        if ($debugLog.length > 50) $debugLog.shift();
    };

    // Game_Clock handles ticking and save data
    class Game_Clock {
        constructor() {
            this.timeLeft = CLOCK_TIME_START;
        }

        update() {
            if (this.shouldTick()) {
                this.timeLeft -= 1 / 60; // Called every frame
                if (this.timeLeft <= 0) {
                    debug("Clock reached zero. Game Over.");
                    SceneManager.goto(Scene_Gameover);
                }
            }
        }

        shouldTick() {
            const mapId = $gameMap.mapId();
            const inTown = TOWN_MAP_IDS.includes(mapId);
            const inBattle = $gameParty.inBattle();
            return !inTown && !inBattle;
        }
    }

    // Sprite for drawing the clock
    class Sprite_ClockDisplay extends Sprite {
        constructor() {
            super(new Bitmap(160, 40));
            this.x = Graphics.boxWidth - this.width - 10;
            this.y = 10;
            this._lastTime = -1;
            this._sandFrame = 0; // For simple animation loop
            this._sandTick = 0; // Controls how often sand animates
        }

        update() {
            super.update();

            if (!$gameClock) {
                this.visible = false;
                return;
            }

            this.visible = true;

            // Only advance sand every 10 frames
            this._sandTick++;
            if (this._sandTick >= 10) {
                this._sandTick = 0;
                this._sandFrame++;
                if (this._sandFrame > 30) this._sandFrame = 0;
                this.refresh(); // Refresh sand
            }

            // Update time text when time actually changes
            const newTime = Math.floor($gameClock.timeLeft);
            if (newTime !== this._lastTime) {
                this._lastTime = newTime;
                this.refresh();
            }
        }

        refresh() {
            const bmp = this.bitmap;
            bmp.clear();
            bmp.fontSize = 20;

            // Background box
            bmp.fillRect(0, 0, this.width, this.height, 'rgba(0, 0, 0, 0.6)');

            const cx = 20; // center x
            const cy = 20; // center y
            const size = 12;
            const ctx = bmp.context;

            // Hourglass outline
            this.drawLine(bmp, cx - size, cy - size, cx + size, cy - size); // top
            this.drawLine(bmp, cx - size, cy - size, cx, cy); // top left
            this.drawLine(bmp, cx + size, cy - size, cx, cy); // top right
            this.drawLine(bmp, cx - size, cy + size, cx + size, cy + size); // bottom
            this.drawLine(bmp, cx - size, cy + size, cx, cy); // bottom left
            this.drawLine(bmp, cx + size, cy + size, cx, cy); // bottom right

            // Animated sand
            const phase = this._sandFrame;

            // Top sand (shrinks)
            const topHeight = 5 - Math.floor(phase / 6);
            ctx.fillStyle = 'gold';
            for (let i = 0; i < topHeight; i++) {
                const w = size - i;
                ctx.fillRect(cx - w / 2, cy - size + 1 + i, w, 1);
            }

            // Falling sand
            if (phase % 6 < 3) {
                ctx.fillRect(cx - 1, cy - 1, 2, 4);
            }

            // Bottom sand (grows)
            const pileHeight = Math.floor(phase / 6);
            for (let i = 0; i < pileHeight; i++) {
                const w = i + 2;
                ctx.fillRect(cx - w / 2, cy + size - i, w, 1);
            }

            bmp._setDirty();

            // Timer text
            const total = Math.max(0, Math.floor($gameClock.timeLeft));
            const mins = Math.floor(total / 60);
            const secs = total % 60;
            const text = `${mins}:${secs.toString().padStart(2, '0')}`;
            bmp.drawText(text, 40, 0, this.width - 40, this.height, 'left');
        }
    }

    // Scene_Map inject: create/update HUD and clock
    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function () {
        _Scene_Map_start.call(this);

        if ($gameSwitches.value(HARD_MODE_SWITCH_ID)) {
            if (!$gameClock) {
                $gameClock = new Game_Clock();
                debug("Hard mode clock started:", $gameClock.timeLeft);
            }

            this._clockDisplay = new Sprite_ClockDisplay();
            this.addChild(this._clockDisplay);
        }
    };

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
        _Scene_Map_update.call(this);
        if ($gameClock) {
            $gameClock.update();
        }
        if (this._clockDisplay) {
            this._clockDisplay.update();
        }
    };

    // Save / Load clock state
    const _DataManager_makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function () {
        const contents = _DataManager_makeSaveContents.call(this);
        contents.clock = $gameClock ? { timeLeft: $gameClock.timeLeft } : null;
        if (!contents.variables) contents.variables = {};
        contents.variables._clockTimeLeft = $gameClock?.timeLeft ?? null;
        return contents;
    };

    const _DataManager_makeSavefileInfo = DataManager.makeSavefileInfo;
    DataManager.makeSavefileInfo = function () {
        const info = _DataManager_makeSavefileInfo.call(this);
        if ($gameSwitches.value(38) && $gameClock) {
            info.clock = { timeLeft: $gameClock.timeLeft };
        }
        return info;
    };

    const _DataManager_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function (contents) {
        _DataManager_extractSaveContents.call(this, contents);
        if ($gameSwitches.value(HARD_MODE_SWITCH_ID) && contents.clock) {
            $gameClock = new Game_Clock();
            $gameClock.timeLeft = contents.clock.timeLeft;
            debug("Clock restored from save:", $gameClock.timeLeft);
        }
    };

    const _Window_SavefileList_drawContents = Window_SavefileList.prototype.drawContents;
    Window_SavefileList.prototype.drawContents = function (info, rect) {
        _Window_SavefileList_drawContents.call(this, info, rect);

        if (info && info.clock && typeof info.clock.timeLeft === "number") {
            const total = Math.max(0, Math.floor(info.clock.timeLeft));
            const mins = Math.floor(total / 60);
            const secs = total % 60;
            const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
            const x = rect.x + 220;
            const y = rect.y + this.lineHeight() * 1.5;
            this.drawText(`Time Left: ${timeStr}`, x, y, 200, 'left');
        }
    };

    Sprite_ClockDisplay.prototype.drawLine = function (bmp, x1, y1, x2, y2, color = 'white', width = 2) {
        const ctx = bmp.context;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
        bmp._setDirty();
    };
})();