
/*:
 * @target MZ
 * @plugindesc Moving Platform Plugin v1.1 - Moves only when player is on it
 */

(() => {

    let _originalDashSetting = null;
    let _platformRiding = false;

    function startPlatformRide() {
        if (!_platformRiding) {
            _platformRiding = true;
            _originalDashSetting = ConfigManager.alwaysDash;
            ConfigManager.alwaysDash = false;
            $gamePlayer.refresh();
        }
    }

    function endPlatformRide() {
        if (_platformRiding) {
            _platformRiding = false;
            ConfigManager.alwaysDash = _originalDashSetting;
            $gamePlayer.refresh();
        }
    }

    class PlatformManager {
        constructor() {
            this._platforms = [];

        }

        setupPlatforms() {
            this._platforms = $gameMap.events().filter(e => {
                return e.event().note?.match(/<Platform route="(\d+)">/);
            }).map(e => new MovingPlatform(e));
        }

        update() {
            this._platforms.forEach(p => p.update());
        }
    }

    class MovingPlatform {
        constructor(event) {
            this._event = event;
            this._route = this.parseRoute();
            this._index = 0;
            this._wait = 0;
            this._active = false;
            this._loop = true; // Can be extended to be configurable later
            //this._wasDashing = ConfigManager.alwaysDash;
        }

        parseRoute() {
            const match = this._event.event().note.match(/<Platform route="(\d+)">/);
            const routeId = match ? parseInt(match[1]) : 0;
            const routeTable = {
                1: [2,2],  // down down down
                2: [8,8]   // up up up
            };
            return routeTable[routeId] || [];
        }

        isPlayerOnPlatform() {
            return $gamePlayer.x === this._event.x && $gamePlayer.y === this._event.y && $gameSwitches.value(Number(407));
        }


        update() {
            if (this._route.length === 0) return;
            if (!this.isPlayerOnPlatform()) { endPlatformRide();return; } // Only move when player is on platform

            if (this._wait > 0) {
                this._wait--;
                if(this._wait === 20){}
                return;
            }else{
                startPlatformRide();
            }

            const player = $gamePlayer;
            const direction = this._route[this._index];
            //const wasDashing = ConfigManager.alwaysDash;

            //const oldSpeed = $gameSystem.alwaysDash;

            // Disable dash temporarily
            //ConfigManager.alwaysDash = false;
            //$gamePlayer.refresh(); // Apply new config

            //this._wait = 60; // Wait some frames between moves

            if (direction) {

                this._wait = 30; // Wait some frames between moves

                player._through = true; // Temporarily ignore passability
                //player.setMoveSpeed(this._event.moveSpeed());
                player._dashing=1;
                //player.setMoveSpeed(5);
                //startPlatformRide();
                this._event.moveStraight(direction);
                player.moveStraight(direction);
                //endPlatformRide();


                this._index++;
                //if (this._index >= this._route.length) {
                //    this._index = 0; // Loop the route
                //    ConfigManager.alwaysDash = this._wasDashing;
                //   $gamePlayer.refresh(); // Reapply config

                //}
                player._through = false; // Reset after move

                //Lets make the speed what it used to be prior to the platform
                //player._dashing=oldSpeed;

                // Restore dash state
                //if (!$gamePlayer.isMoving()) {
                    /*
                    setTimeout(() => {
                        ConfigManager.alwaysDash = wasDashing;
                        $gamePlayer.refresh(); // Reapply config
                        //this._wait = 30; // Wait some frames between moves
                    }, 50); // After movement step

                     */
  //              }

            }
        }
    }

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
        _Scene_Map_update.call(this);
        if (!this._platformManager) {
            this._platformManager = new PlatformManager();
            this._platformManager.setupPlatforms();
        }
        this._platformManager.update();
    };
})();

/*
Direction Numbers:
2 = Down
4 = Left
6 = Right
8 = Up
*/