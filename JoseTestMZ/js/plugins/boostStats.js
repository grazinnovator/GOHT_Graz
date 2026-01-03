// === StatSwitchEffects Module ===
(() => {
    console.log("✅ StatSwitchEffects loaded");

    /*
    | ID | Param  |
| -- | ------ |
| 0  | Max HP |
| 1  | Max MP |
| 2  | ATK    |
| 3  | DEF    |
| 4  | MAT    |
| 5  | MDF    |
| 6  | AGI    |
| 7  | LUK    |

21 - hp
22 - mp
23 - atk
24 - def
25 - m atk
26 - m def

     */

    // Define which switches control which stat bonuses
    const BOOSTS = {
        61: {0: 500},
        62: {0: 500},
        63: {0: 500},
        64: {0: 500},
        65: {0: 500},
        66: {0: 1000},
        67: {0: 1000},
        68: {0: 1000},
        69: {0: 1000},
        70: {0: 1000},
        71: {0: 2000},
        72: {0: 2000},
        73: {0: 2000},
        74: {0: 2000},
        75: {0: 2000},
        76: {0: 3000},
        77: {0: 3000},
        78: {0: 3000},
        79: {0: 3500},
        // MP
        81: {1: 50},
        82: {1: 50},
        83: {1: 50},
        84: {1: 50},
        85: {1: 50},
        86: {1: 100},
        87: {1: 100},
        88: {1: 100},
        89: {1: 100},
        90: {1: 100},
        91: {1: 200},
        92: {1: 200},
        93: {1: 200},
        94: {1: 200},
        95: {1: 200},
        96: {1: 300},
        97: {1: 300},
        98: {1: 300},
        99: {1: 350},
        // ATK

        101: {2: 15},
        102: {2: 15},
        103: {2: 15},
        104: {2: 15},
        105: {2: 15},
        106: {2: 30},
        107: {2: 30},
        108: {2: 30},
        109: {2: 30},
        110: {2: 30},
        111: {2: 60},
        112: {2: 60},
        113: {2: 60},
        114: {2: 60},
        115: {2: 60},
        116: {2: 90},
        117: {2: 90},
        118: {2: 90},
        119: {2: 100},
        // DEF

        121: {3: 15},
        122: {3: 15},
        123: {3: 15},
        124: {3: 15},
        125: {3: 15},
        126: {3: 30},
        127: {3: 30},
        128: {3: 30},
        129: {3: 30},
        130: {3: 30},
        131: {3: 60},
        132: {3: 60},
        133: {3: 60},
        134: {3: 60},
        135: {3: 60},
        136: {3: 90},
        137: {3: 90},
        138: {3: 90},
        139: {3: 100},
        // M ATK

        141: {4: 15},
        142: {4: 15},
        143: {4: 15},
        144: {4: 15},
        145: {4: 15},
        146: {4: 30},
        147: {4: 30},
        148: {4: 30},
        149: {4: 30},
        150: {4: 30},
        151: {4: 60},
        152: {4: 60},
        153: {4: 60},
        154: {4: 60},
        155: {4: 60},
        156: {4: 90},
        157: {4: 90},
        158: {4: 90},
        159: {4: 100},
        // M DEF

        161: {5: 15},
        162: {5: 15},
        163: {5: 15},
        164: {5: 15},
        165: {5: 15},
        166: {5: 30},
        167: {5: 30},
        168: {5: 30},
        169: {5: 30},
        170: {5: 30},
        171: {5: 60},
        172: {5: 60},
        173: {5: 60},
        174: {5: 60},
        175: {5: 60},
        176: {5: 90},
        177: {5: 90},
        178: {5: 90},
        179: {5: 100}
        //5: { 2: 50 }, // Switch 5 boosts ATK by 50
        //6: { 3: 25 }, // Switch 6 boosts DEF by 25
        //7: { 6: 30 }  // Switch 7 boosts AGI by 30
    };

    window.costCalculation= function(buffLevelVariable){
        const cost = Math.ceil(2/15*(buffLevelVariable*buffLevelVariable*buffLevelVariable*buffLevelVariable*buffLevelVariable*buffLevelVariable))

        return cost
    }

    window.setCostToVariable = function(variableBuff){
        const cost = costCalculation($gameVariables.value(variableBuff))
        $gameVariables.setValue(variableBuff+20,cost)
    }

    window.enoughGold= function(switchId, buffLevelVariable) {
        const cost = costCalculation(buffLevelVariable)
        if ($gameParty.gold() >= cost) {
            return true
        }else {
            return false
        }
    }

    // Allow event script: buySwitch(5, 100);
    window.buySwitch = function(switchId, buffLevelVariable,variableBuff) {

        console.log(switchId)
        const cost = costCalculation(buffLevelVariable)
        console.log(cost)
        if ($gameParty.gold() >= cost) {
            $gameParty.loseGold(cost);
            $gameSwitches.setValue(switchId, true);
            console.log(`🪙 Bought Switch ${switchId} for ${cost}G`);
            $gameVariables.setValue(variableBuff,$gameVariables.value(variableBuff)+1)

        } else {
            console.warn("🚫 Not enough gold to buy switch.");
        }
    };

    // Inject stat bonus logic dynamically
    const _Game_Actor_param = Game_Actor.prototype.param;
    Game_Actor.prototype.param = function(paramId) {
        let base = _Game_Actor_param.call(this, paramId);
        for (const [switchId, bonuses] of Object.entries(BOOSTS)) {
            if ($gameSwitches.value(Number(switchId)) && bonuses[paramId]) {
                base += bonuses[paramId];
            }
        }
        return base;
    };
})();
