(() => {
    console.log("✅ Locked Equipment logic enabled");

    // Prevent removing items with <LockedSlot> note tag
    const _Game_Actor_isEquipChangeOk = Game_Actor.prototype.isEquipChangeOk;
    Game_Actor.prototype.isEquipChangeOk = function(slotId) {
        const item = this.equips()[slotId];
        if (item && item.note?.includes("<LockedSlot>")) {
            console.warn(`🔒 Cannot remove locked equipment: ${item.name}`);
            return false; // block equip change
        }
        return _Game_Actor_isEquipChangeOk.call(this, slotId);
    };
})();