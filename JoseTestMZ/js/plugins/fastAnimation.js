//=============================================================================
// FastAnimations.js - Play all battle animations at double speed
//=============================================================================

(() => {
    const SPEED_MULTIPLIER = 2; // 0.5 = half the time (double speed)

    const _Sprite_Animation_updateMain = Sprite_Animation.prototype.updateMain;
    Sprite_Animation.prototype.updateMain = function() {
        // Skip frames based on speed multiplier
        if (!this._duration || this._duration <= 0) return;
        this._frameCount += SPEED_MULTIPLIER;
        while (this._frameCount >= 1) {
            this._frameCount--;
            _Sprite_Animation_updateMain.call(this);
        }
    };

    const _Sprite_Animation_initMembers = Sprite_Animation.prototype.initMembers;
    Sprite_Animation.prototype.initMembers = function() {
        _Sprite_Animation_initMembers.call(this);
        this._frameCount = 0;
    };
})();
