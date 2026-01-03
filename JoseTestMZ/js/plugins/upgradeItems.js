/*:
 * @target MZ
 * @plugindesc Simple Item Upgrade System - Allows item-to-item upgrades with gold cost. v1.0
 * @author GPT
 *
 * @help
 * This plugin enables a basic item upgrade mechanic.
 * Define item upgrade paths in the UPGRADE_RECIPES object.
 *
 * Example usage in event: Script Call -> tryUpgradeItem(100);
 */

(() => {
    // Format: itemId: { next: itemId, cost: number }
    const UPGRADE_RECIPES = [
        //shield upgrade
        { type:"armor",from: 13, to: 21, gold: 150000 },
        { type:"armor",from: 21, to: 22, gold: 300000 },
        { type:"armor",from: 22, to: 23, gold: 450000 },
        { type:"armor",from: 23, to: 24, gold: 800000 },

        //
        //hat upgrade
        { type:"armor",from: 14, to: 25, gold: 150000 },
        { type:"armor",from: 25, to: 26, gold: 300000 },
        { type:"armor",from: 26, to: 27, gold: 450000 },
        { type:"armor",from: 27, to: 28, gold: 800000 },

        //cloth upgrade
        { type:"armor",from: 15, to: 29, gold: 150000 },
        { type:"armor",from: 29, to: 30, gold: 300000 },
        { type:"armor",from: 30, to: 31, gold: 450000 },
        { type:"armor",from: 31, to: 32, gold: 800000 },

        //weapon upgrade
        { type:"weapon",from: 7, to: 9, gold: 150000 },
        { type:"weapon",from: 9, to: 10, gold: 300000 },
        { type:"weapon",from: 10, to: 11, gold: 450000 },
        { type:"weapon",from: 11, to: 12, gold: 800000 }

    ];

    function checkItemCost(type, fromId){
        const party = $gameParty;
        const hasItem = {
            weapon: () => party.hasItem($dataWeapons[fromId]),
            item:   () => party.hasItem($dataItems[fromId]),
            armor:  () => party.hasItem($dataArmors[fromId])
        }[type];

        if (!hasItem || !hasItem()) {
            console.warn(`Missing required ${type} ${fromId}`);
            return false;
        }
        return true;

    }

    function checkGoldCost(type,fromId){
        const recipe = UPGRADE_RECIPES.find(r => r.type === type && r.from === fromId);

        const party = $gameParty;

        if (party.gold() < recipe.gold) {
            console.warn("Not enough gold!");
            return false;
        }

        return true;

    }

    window.tryUpgrade = function(type, fromId) {
        const recipe = UPGRADE_RECIPES.find(r => r.type === type && r.from === fromId);
        if (!recipe) {
            console.warn("No recipe found for", type, fromId);
            return false;
        }

        const party = $gameParty;


        if (!checkItemCost(type,fromId)) {
            console.warn(`Missing required ${type} ${fromId}`);
            return false;
        }

        if (!checkGoldCost(type,fromId)) {
            console.warn("Not enough gold!");
            return false;
        }


        // Remove original, add new, deduct gold

        if (type === "weapon") {
            party.loseItem($dataWeapons[fromId], 1);
            party.gainItem($dataWeapons[recipe.to], 1);
        } else if (type === "armor") {
            party.loseItem($dataArmors[fromId], 1);
            party.gainItem($dataArmors[recipe.to], 1);
        } else {
            party.loseItem($dataItems[fromId], 1);
            party.gainItem($dataItems[recipe.to], 1);
        }

        party.loseGold(recipe.gold);
        console.log(`✅ Upgraded ${type} ${fromId} to ${recipe.to} for ${recipe.gold} gold`);
        return true;

    }
})();