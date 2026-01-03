/*:
 * @target MZ
 * @plugindesc Auto-saves after any battle ends if Switch 25 is ON. v1.3
 * @author GPT
 *
 * @help
 * When Switch 25 is ON, the game will auto-save after any battle ends (victory, defeat, or escape).
 * It overwrites the most recent save file.
 */

(() => {
    const AUTO_SAVE_SWITCH_ID = 25;

    function autoSaveAfterBattle() {
        if (!$gameSwitches.value(AUTO_SAVE_SWITCH_ID)) return;

        setTimeout(() => {
            try {
                const lastFileId = DataManager.latestSavefileId();
                if (lastFileId > 0) {
                    console.log("💾 Auto-saving after battle...");
                    DataManager.saveGame(lastFileId).then(success => {
                        if (success) {
                            console.log("✅ Auto-save successful.");
                        } else {
                            console.warn("❌ Auto-save failed.");
                        }
                    });
                } else {
                    console.warn("⚠️ No existing save file found. Auto-save skipped.");
                }
            } catch (e) {
                console.error("❌ Auto-save error:", e);
            }
        }, 500);
    }

    const _BattleManager_endBattle = BattleManager.endBattle;
    BattleManager.endBattle = function(result) {
        _BattleManager_endBattle.call(this, result);
        autoSaveAfterBattle();
    };
})();