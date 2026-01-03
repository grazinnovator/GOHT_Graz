/*:
 * @target MZ
 * @plugindesc In-game debug overlay using Sprite. Use Shift+F3 to toggle. Use debug(...) to log messages manually.
 * @author You
 * @help
 * - Use debug("message") to add lines to the overlay
 * - Shift+F3 toggles the overlay on/off
 * - Shows last 10 debug lines
 */

(() => {
    // Global debug log and function
    window.$debugLog = [];
    window.debug = function (...args) {
        const text = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
        $debugLog.push(text);
        if ($debugLog.length > 50) $debugLog.shift();
    };

    // Debug overlay sprite
    class Sprite_DebugOverlay extends Sprite {
        constructor() {
            super(new Bitmap(Graphics.boxWidth - 40, 220));
            this.x = 20;
            this.y = Graphics.boxHeight - this.height - 20;
            this._lastCount = 0;
        }

        update() {
            super.update();
            if (this._lastCount !== $debugLog.length) {
                this.refresh();
                this._lastCount = $debugLog.length;
            }
        }

        refresh() {
            const bmp = this.bitmap;
            bmp.clear();
            bmp.fontSize = 18;
            const lines = $debugLog.slice(-10);
            for (let i = 0; i < lines.length; i++) {
                bmp.drawText(lines[i], 0, i * 22, bmp.width, 22, 'left');
            }
        }
    }

    // Inject into Scene_Map
    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function () {
        _Scene_Map_start.call(this);
        this._debugOverlay = new Sprite_DebugOverlay();
        this._debugOverlay.visible = false;
        this.addChild(this._debugOverlay);
        //this._debugOverlay.visible=true;
        window.addEventListener('keydown', (e) => {
            if (e.shiftKey && e.code === 'F3') {
                if (this._debugOverlay) {
                    this._debugOverlay.visible = !this._debugOverlay.visible;
                }
            }
        });
    };

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
        _Scene_Map_update.call(this);
        if (this._debugOverlay && this._debugOverlay.visible) {
            this._debugOverlay.update();
        }
    };
})();