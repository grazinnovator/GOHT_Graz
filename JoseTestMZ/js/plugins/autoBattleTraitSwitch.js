(() => {
    const ACTOR_ID = 1;
    const SWITCH_ID = 40;
    const STATE_ID = 12; // <-- your Auto Battle state ID
    const DEBUG_SWITCH = 39;

    function debugLog(msg) {
        if ($gameSwitches?.value(DEBUG_SWITCH) && typeof debug === "function") {
            debug(`[AutoBattle] ${msg}`);
        }
    }

    function updateAutoBattleState() {
        const actor = $gameActors.actor(ACTOR_ID);
        const enable = $gameSwitches.value(SWITCH_ID);
        if (!actor) return;

        const hasState = actor.isStateAffected(STATE_ID);

        if (enable && !hasState) {
            actor.addState(STATE_ID);
            debugLog(`Applied Auto Battle state to actor ${ACTOR_ID}`);
        } else if (!enable && hasState) {
            actor.removeState(STATE_ID);
            debugLog(`Removed Auto Battle state from actor ${ACTOR_ID}`);
        }
    }

    const _Game_Switches_setValue = Game_Switches.prototype.setValue;
    Game_Switches.prototype.setValue = function(switchId, value) {
        _Game_Switches_setValue.call(this, switchId, value);
        if (switchId === SWITCH_ID) {
            updateAutoBattleState();

            if ($gameParty.inBattle()) {
                const actor = $gameParty.battleMembers().find(a => a.actorId() === ACTOR_ID);
                if (actor) {
                    updateAutoBattleState();
                }
            }
        }
    };

    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        updateAutoBattleState();
        debugLog(`Scene_Map start → ensured Auto Battle state sync`);
    };

    const _Game_Actor_recoverAll = Game_Actor.prototype.recoverAll;
    Game_Actor.prototype.recoverAll = function() {
        _Game_Actor_recoverAll.call(this);

        const AUTO_BATTLE_SWITCH = 40;
        const AUTO_BATTLE_STATE = 12;

        if ($gameSwitches.value(AUTO_BATTLE_SWITCH)) {
            if (!this.isStateAffected(AUTO_BATTLE_STATE)) {
                debugLog(`♻️ Re-applying state ${AUTO_BATTLE_STATE} to ${this.name()} after recoverAll.`);
                this.addState(AUTO_BATTLE_STATE);
            }
        }
    };

})();