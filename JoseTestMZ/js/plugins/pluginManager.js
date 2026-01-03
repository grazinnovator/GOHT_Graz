(() => {
    const parameters = PluginManager.parameters("PluginControl");

    const autoBattleTrait = {
        code: 52,     // Auto Battle
        dataId: 0,    // Not used for this trait
        value: 1      // Always 1 for auto battle
    };
    // Store plugin toggles here
    window.PluginControl = {


        // Optional: link to switches or variables
        isEnabled(featureName) {
            if ($gameSwitches){
                if (featureName == "fastBattle"){
                    return $gameSwitches.value(36)
                }
                if (featureName == "visibleEncounters"){
                    return $gameSwitches.value(37)
                }
                if (featureName == "autoBattle"){
                    return $gameSwitches.value(40)
                }
                if (featureName == "autoSave"){
                    return $gameSwitches.value(25)
                }

            }

            // return this.features[featureName];
        },

        setOptionValue(featureName,status){
            if ($gameSwitches){
                if (featureName === "fastBattle"){
                    $gameSwitches.setValue(36,status)
                }
                if (featureName === "visibleEncounters"){
                    $gameSwitches.setValue(37,status)
                }
                if (featureName === "autoBattle"){
                    $gameSwitches.setValue(40,status)
                    //updateAutoBattleFromSwitch(1,status)
                }
                if (featureName === "autoSave"){
                    $gameSwitches.setValue(25,status)
                    //updateAutoBattleFromSwitch(1,status)
                }
            }

        },

        enable(featureName) {
            if (featureName === "fastBattle"){
                $gameSwitches.setValue(36,true)
            }
            if (featureName === "visibleEncounters"){
                $gameSwitches.setValue(37,true)
            }
            if (featureName === "autoBattle"){
                $gameSwitches.setValue(40,true)
                //updateAutoBattleFromSwitch(1,true)
            }
            if (featureName === "autoSave"){
                $gameSwitches.setValue(25,true)
                //updateAutoBattleFromSwitch(1,true)
            }
            //this.features[featureName] = true;
        },

        disable(featureName) {
            if (featureName === "fastBattle"){
                $gameSwitches.setValue(36,false)
            }
            if (featureName === "visibleEncounters"){
                $gameSwitches.setValue(37,false)
            }
            if (featureName === "autoBattle"){
                $gameSwitches.setValue(40,false)
                //updateAutoBattleFromSwitch(1,false)
            }
            if (featureName === "autoSave"){
                $gameSwitches.setValue(25,false)
                //updateAutoBattleFromSwitch(1,false)
            }
        },

        toggle(featureName) {
            if (featureName === "fastBattle"){
                $gameSwitches.setValue(36,!$gameSwitches.value(36))
            }
            if (featureName === "visibleEncounters"){
                $gameSwitches.setValue(37,!$gameSwitches.value(37))
            }
            if (featureName === "autoBattle"){
                $gameSwitches.setValue(40,!$gameSwitches.value(40))
                //updateAutoBattleFromSwitch(1,!$gameSwitches.value(40))
            }
            if (featureName === "autoSave"){
                $gameSwitches.setValue(25,!$gameSwitches.value(25))
                //updateAutoBattleFromSwitch(1,!$gameSwitches.value(40))
            }
        }
    };

    const _Window_Options_addGeneralOptions = Window_Options.prototype.addGeneralOptions;
    Window_Options.prototype.addGeneralOptions = function() {
        _Window_Options_addGeneralOptions.call(this);

        this.addCommand("Fast Battle", "fastBattle");
        this.addCommand("Visible Encounters", "visibleEncounters");
        this.addCommand("Auto Battle mode", "autoBattle");
        this.addCommand("Auto Save mode", "autoSave");
    };

    const _ConfigManager_makeData = ConfigManager.makeData;
    ConfigManager.makeData = function() {
        const config = _ConfigManager_makeData.call(this);
        if ($gameSwitches){
            config.fastBattle = PluginControl.isEnabled("fastBattle");
            //config.fastBattle = PluginControl.features.fastBattle;
            //config.visibleEncounters = PluginControl.features.visibleEncounters;
            config.visibleEncounters = PluginControl.isEnabled("visibleEncounters");
            config.autoBattle = PluginControl.isEnabled("autoBattle");
            config.autoSave = PluginControl.isEnabled("autoSave");
        }
        return config;
    };

    const _ConfigManager_applyData = ConfigManager.applyData;
    ConfigManager.applyData = function(config) {
        _ConfigManager_applyData.call(this, config);
        if ($gameSwitches){
            PluginControl.setOptionValue("fastBattle",this.readFlag(config, "fastBattle"));
            PluginControl.setOptionValue("visibleEncounters",this.readFlag(config, "visibleEncounters"));
            PluginControl.setOptionValue("autoBattle",this.readFlag(config, "autoBattle"));
            PluginControl.setOptionValue("autoSave",this.readFlag(config, "autoSave"));

        }
    };

    const _ConfigManager_fastBattle = Object.getOwnPropertyDescriptor(ConfigManager.__proto__, 'fastBattle');
    Object.defineProperty(ConfigManager, 'fastBattle', {
        get() { return PluginControl.isEnabled("fastBattle"); },
        set(value) { PluginControl.setOptionValue("fastBattle",value); }
    });
    Object.defineProperty(ConfigManager, 'visibleEncounters', {
        get() { return PluginControl.isEnabled("visibleEncounters"); },
        set(value) { PluginControl.setOptionValue("visibleEncounters",value); }
    });
    Object.defineProperty(ConfigManager, 'autoBattle', {
        get() { return PluginControl.isEnabled("autoBattle"); },
        set(value) { PluginControl.setOptionValue("autoBattle",value); }
    });
    Object.defineProperty(ConfigManager, 'autoSave', {
        get() { return PluginControl.isEnabled("autoSave"); },
        set(value) { PluginControl.setOptionValue("autoSave",value); }
    });

    // disable random encounters
    const _Game_Player_executeEncounter = Game_Player.prototype.executeEncounter;
    Game_Player.prototype.executeEncounter = function() {
        const disableEncounters = $gameSwitches.value(37); // Replace 42 with your switch ID

        if (disableEncounters) {
            return false; // Completely blocks random encounters
        }

        return _Game_Player_executeEncounter.call(this);
    };



    console.log("✅ PluginControl loaded");


})();