/*:
 * @target MZ
 * @plugindesc Mobile Attack Button — Moves to nearest enemy and triggers it. Mid-right position, town maps excluded.
 * @author GPT
 */

(() => {
    const TOWN_MAP_IDS = [1, 13, 16, 22, 10, 23];
    const BUTTON_ICON    = "Find  enemy ⚔️";
    const BUTTON_REFRESH = "Refresh map 🔄"

    const BUTTON_WIDTH = 48*4;
    const BUTTON_HEIGHT = 48;
    const BUTTON_MARGIN_RIGHT = 8;
    const BUTTON_VERTICAL_CENTER_RATIO = 0.95;
    const BUTTON_VERTICAL_CENTER_RATIO_REFRESH = 1;

    class Sprite_AttackButton extends Sprite {
        constructor(type) {
            let bmp = new Bitmap(BUTTON_WIDTH, BUTTON_HEIGHT);
            /*switch(type){
                case "attack":
                    this._createAttackButtonBitmap();
                case "refresh":
                    this._createRefreshButtonBitmap();
            }*/

            super(bmp);
            //this._createAttackButtonBitmap();
            //this._createRefreshButtonBitmap();
            this.type=type;
            this._targetEvent = null;
            this._isMoving = false;
        }

        _createAttackButtonBitmap() {
            let bmp = this.bitmap;
            bmp.clear();
            bmp.fillRect(0, 0, BUTTON_WIDTH, BUTTON_HEIGHT, "rgba(0,0,0,0.6)");
            bmp.textColor = "#ffffff";
            bmp.fontSize = 24;
            bmp.drawText(BUTTON_ICON, 0, 0, BUTTON_WIDTH, BUTTON_HEIGHT, "center");
            bmp._setDirty?.();
        }

        _createRefreshButtonBitmap() {
            let bmp = this.bitmap;
            bmp.clear();
            bmp.fillRect(0, 0, BUTTON_WIDTH, BUTTON_HEIGHT, "rgba(0,0,0,0.6)");
            bmp.textColor = "#ffffff";
            bmp.fontSize = 24;
            bmp.drawText(BUTTON_REFRESH, 0, 0, BUTTON_WIDTH, BUTTON_HEIGHT, "center");
            bmp._setDirty?.();
        }

        update() {
            //super.update();
            this.visible = !$gameMap || !TOWN_MAP_IDS.includes($gameMap.mapId());
            if (!this.visible) return;

            if(this._isMoving){
                debug("Its moving")
            }

            if(this._targetEvent){
                debug("i have a target")
            }

            if (this._isMoving && this._targetEvent) {
                debug("i am trying")
                const e = this._targetEvent;

                if (!e || e._erased || !e.page()) {

                    this._reset();
                    return;
                }

                // Only act if player is not already moving
                if (!$gamePlayer.isMoving()) {
                    debug("i am able to move and going to move to target")
                    const dx = e.x - $gamePlayer.x;
                    const dy = e.y - $gamePlayer.y;

                    // Reached or adjacent
                    const closeEnough = (Math.abs(dx) + Math.abs(dy)) <= 1;
                    if (closeEnough) {
                        debug(closeEnough)
                        debug("i am close enough")
                        e.start();
                        this._reset();
                    } else {
                        debug("i need to get close")
                        const dir = $gamePlayer.findDirectionTo(e.x, e.y);
                        debug(dir)
                        if (dir > 0) {
                            $gamePlayer.moveStraight(dir);
                        } else {
                            // No valid path found
                            this._reset();
                        }
                    }
                }
            }
        }

        _reset() {
            debug("i reset")
            this._isMoving = false;
            this._targetEvent = null;
        }

        attackActivate() {

            if (this._isMoving) return;

            const enemies = $gameMap.events().filter(e =>
                e.page() &&
                !e._erased &&
                e.event().note?.includes("<Enemy>") &&
                e.isNormalPriority() // Only same-level events
            );

            debug("Filtered enemies (same floor only):", enemies.length);
            if (enemies.length === 0) return;

            const reachable = enemies.filter(e => $gamePlayer.canPass(e.x, e.y));
            const nearest = (reachable.length ? reachable : enemies).reduce((a, b) =>
                $gamePlayer.distanceSquaredTo(a) < $gamePlayer.distanceSquaredTo(b) ? a : b
            );
            //const raw = JSON.stringify(nearest, null, 2); // Pretty JSON output
            // for (let i = 0; i < raw.length; i += 200) {
            //    debug(raw.slice(i, i + 200));
            //}
            this._targetEvent = nearest;
            this._isMoving = true;

            // Save original speed and set custom speed
            this._originalSpeed = $gamePlayer.moveSpeed();
            $gamePlayer.setMoveSpeed(4); // Lower is slower (default is 4)
            //this.update();
        }

        refreshActivate(){
            let tempVisibleMonstersValue;
            // Reset switches if they are blocking
            $gameSwitches.setValue(1, false);
            $gameSwitches.setValue(41, false);

            tempVisibleMonstersValue = $gameSwitches.value(37)
            $gameSwitches.setValue(37, false);

            // Reset map variables
            const originalMapId = $gameMap.mapId();
            const originalX = $gamePlayer.x;
            const originalY = $gamePlayer.y;
            const originalDir = $gamePlayer.direction();
            const dummyMapId = 23;

            // Full interpreter reset
            if ($gameMap._interpreter) $gameMap._interpreter.clear();
            if (SceneManager._scene && SceneManager._scene._interpreter) SceneManager._scene._interpreter.clear();
            if (BattleManager._interpreter) BattleManager._interpreter.clear();
            $gameMap._events.forEach(e => {
                if (e && e._interpreter) e._interpreter.clear();
                if (e) {
                    e._starting = false;
                    e._locked = false;
                }
            });

            // Kill common events
            if ($gameTemp._commonEventQueue) $gameTemp._commonEventQueue.length = 0;

            // Reset temporary flags
            $gameTemp._destinationX = null;
            $gameTemp._destinationY = null;
            $gameTemp._needsBattleRefresh = false;

            // Force clear scene transfer state
            SceneManager._sceneStarted = false;
            SceneManager._transfer = null;
            if (SceneManager._scene) {
                SceneManager._scene._transfer = false;
                if (SceneManager._scene._interpreter) SceneManager._scene._interpreter.clear();
            }

            // Force reload via dummy
            $gamePlayer.reserveTransfer(dummyMapId, 0, 0, 2, 0);
            setTimeout(() => {
                $gamePlayer.reserveTransfer(originalMapId, originalX, originalY, originalDir, 0);
                SceneManager.goto(Scene_Map);
                debug("✅ Hard map reset triggered.");

            }, 500);
            $gameSwitches.setValue(37, tempVisibleMonstersValue);

        };

        fullInterpreterReset() {
            if ($gameMap._interpreter) $gameMap._interpreter.clear();
            if (SceneManager._scene?._interpreter) SceneManager._scene._interpreter.clear();
            if (BattleManager._interpreter) BattleManager._interpreter.clear();
            if ($gameTroop && $gameTroop._interpreter) $gameTroop._interpreter.clear();
            if ($gameSystem._interpreter) $gameSystem._interpreter.clear?.();

            $gamePlayer._locked = false;
            $gamePlayer._starting = false;
            $gameTemp.clearDestination();
            $gameMessage.clear();

            $gameMap.events().forEach(e => {
                e._locked = false;
                e._starting = false;
                if (e._interpreter) e._interpreter.clear();
                if (e.event().pages) e.event().pages.forEach(p => p.condition = {});
            });


            $gameSwitches.setValue(1, false);
            $gameSwitches.setValue(41, false);

            if ($gameMap._interpreter) $gameMap._interpreter._list = null;
            if (SceneManager._scene._interpreter) SceneManager._scene._interpreter._list = null;
            if (BattleManager._interpreter) BattleManager._interpreter._list = null;

            PluginControl.setOptionValue("visibleEncounters",false)
            setTimeout(() => {
                PluginControl.setOptionValue("visibleEncounters",true)
            }, 500)


            SceneManager.goto(Scene_Map);

            console.log("🧹 All interpreters and event states cleared.");
        }

        containsTouch(x, y) {
            return (
                x >= this.x &&
                x < this.x + BUTTON_WIDTH &&
                y >= this.y &&
                y < this.y + BUTTON_HEIGHT
            );
        }
    }

    Game_CharacterBase.prototype.distanceSquaredTo = function (target) {
        const dx = this.x - target.x;
        const dy = this.y - target.y;
        return dx * dx + dy * dy;
    };

    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function () {
        _Scene_Map_start.call(this);
        this.createAttackButton();
        this.createRefreshButton();
    };

    Scene_Map.prototype.createAttackButton = function () {
        const btn = new Sprite_AttackButton("attack");

        // Position on the left side, aligned with the HUD box
        btn.x = 220;
        // btn.y = Graphics.boxHeight * BUTTON_VERTICAL_CENTER_RATIO - BUTTON_HEIGHT / 2;
        btn.y = Graphics.height - 120 - 25;
        btn._createAttackButtonBitmap();
        this._attackButton = btn;
        this.addChild(btn);
    };

    Scene_Map.prototype.createRefreshButton = function () {
        const btnB = new Sprite_AttackButton("refresh");

        // Position on the left side, aligned with the HUD box
        btnB.x = 220;
        //btnB.y = Graphics.boxHeight * BUTTON_VERTICAL_CENTER_RATIO_REFRESH - BUTTON_HEIGHT / 2;
        btnB.y = Graphics.height - 120 - 25+77;
        btnB._createRefreshButtonBitmap()
        this._refreshButton = btnB;
        this.addChild(btnB);
    };


    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
        _Scene_Map_update.call(this);
        if (!this._attackButton || !this._refreshButton || !$gameMap) return;

        //this._Button.update();
        //if(this._attackButton){
        this._attackButton.update();
        //}


        if (TouchInput.isTriggered()) {
            const x = TouchInput.x;
            const y = TouchInput.y;
            if (this._attackButton.visible && this._attackButton.containsTouch(x, y)) {
                debug("attack detected")
                this._attackButton.attackActivate();
                SoundManager.playOk();
                $gameTemp.clearDestination(); // prevent default walk
            }
            if (this._refreshButton.visible && this._refreshButton.containsTouch(x, y)) {
                debug("refresh map detected")
                this._refreshButton.refreshActivate();
                SoundManager.playOk();
                $gameTemp.clearDestination(); // prevent default walk
            }
            else if(!this._refreshButton.containsTouch(x, y) && !this._attackButton.containsTouch(x, y)){
                debug("i am landing in touch reset")
                this._attackButton._reset();
                //this._refreshButton._reset();
            }
        }
    };


    const _Scene_Map_updateDestination = Scene_Map.prototype.updateDestination;
    Scene_Map.prototype.updateDestination = function() {
        if (this._attackButton && this._attackButton.visible) {
            const x = TouchInput.x;
            const y = TouchInput.y;
            if (TouchInput.isTriggered() && this._attackButton.containsTouch(x, y)) {
                // Skip default destination setting
                return;
            }
        }

        _Scene_Map_updateDestination.call(this);
    };

    Sprite_AttackButton.prototype._moveToTarget = function(targetEvent) {


        const path = $gameMap.findPath($gamePlayer.x, $gamePlayer.y, targetEvent.x, targetEvent.y);

        if (!path || path.length === 0) return;

        const route = {
            list: [],
            repeat: false,
            skippable: false,
            wait: true
        };

        for (const step of path) {
            const dx = step.x - $gamePlayer.x;
            const dy = step.y - $gamePlayer.y;

            if (dx > 0) route.list.push({ code: 12 }); // right
            else if (dx < 0) route.list.push({ code: 14 }); // left
            else if (dy > 0) route.list.push({ code: 13 }); // down
            else if (dy < 0) route.list.push({ code: 11 }); // up

            $gamePlayer.setPosition(step.x, step.y); // simulate step for loop
        }

        route.list.push({ code: 0 }); // End of route
        $gamePlayer.forceMoveRoute(route);
    };



})();