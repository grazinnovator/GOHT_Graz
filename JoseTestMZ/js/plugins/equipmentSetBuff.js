const _Game_Actor_refresh = Game_Actor.prototype.refresh;
Game_Actor.prototype.refresh = function() {
    _Game_Actor_refresh.call(this);

    const setItems = this.equips().filter(e => e && e.note?.includes("<LockedSlot>"));
    const setCount = setItems.length;

    if (setCount >= 5) {
        if (!this.isStateAffected(13)) {
            if (this._classId!==5)
            {
                this.addState(13);
                this.removeState(17);
                //this.changeClass(5,false); // lets change hero class!
                setTimeout(() => {
                    //SceneManager.playVideo("classupgrade");
                    $gameTemp.reserveCommonEvent(7);
                }, 100);

            }
            console.log(`🛡 Set bonus applied to ${this.name()}: Sleep immunity`);
        }
    } else {
        /*
        if (setCount == 1){
            if (!this.isStateAffected(14)) {
                this.addState(14);
                console.log("added state 14")
            }
        }
        if (setCount == 2){
            if (!this.isStateAffected(15)) {
                this.addState(15);
                console.log("added state 15")

                this.removeState(14);
                console.log("removed 14")

            }
        }
        if (setCount == 3){
            if (!this.isStateAffected(16)) {
                this.removeState(15);
                console.log("removed 15")
                this.addState(16);
                console.log("added 16")
            }
        }
        if (setCount == 4){
            if (!this.isStateAffected(17)) {
                this.removeState(16);
                console.log("removed 16")
                this.addState(17);
                console.log("added 17")

            }
        }
        */
        if (this.isStateAffected(13)) {
            this.removeState(13);
            console.log(`🧹 Set bonus removed from ${this.name()}`);
        }
    }
};