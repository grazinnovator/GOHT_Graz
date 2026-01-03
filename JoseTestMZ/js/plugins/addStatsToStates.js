// This plugin adds flat stat boosts from <paramPlus:x,y> note tags
(() => {
    const PARAM_PLUS_TAG = /<paramPlus:(\d+),\s*(-?\d+)>/i;

    const _Game_BattlerBase_paramPlus = Game_BattlerBase.prototype.paramPlus;
    Game_BattlerBase.prototype.paramPlus = function(paramId) {
        let bonus = _Game_BattlerBase_paramPlus.call(this, paramId);

        this.states().forEach(state => {
            if (state.meta.paramPlus) {
                const list = Array.isArray(state.meta.paramPlus)
                    ? state.meta.paramPlus
                    : [state.meta.paramPlus];

                list.forEach(tag => {
                    const match = PARAM_PLUS_TAG.exec(`<paramPlus:${tag}>`);
                    if (match && Number(match[1]) === paramId) {
                        bonus += Number(match[2]);
                    }
                });
            }
        });

        return bonus;
    };
})();