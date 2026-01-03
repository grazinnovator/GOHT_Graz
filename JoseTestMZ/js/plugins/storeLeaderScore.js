(() => {
    const SUBMIT_SWITCH_ID = 24;
    const REPLAY_VAR_ID = 10;
    const API_URL = "http://gsd.servegame.com:3000/leaderboard";

    let hasSubmitted = false;

    const _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function () {
        _Scene_Battle_update.call(this);
        if ($gameSwitches.value(SUBMIT_SWITCH_ID) && !hasSubmitted) {
            hasSubmitted = true;
            submitScorePrompt();
        }
    };

    function submitScorePrompt() {
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.zIndex = "1000";
        container.style.top = "40%";
        container.style.left = "50%";
        container.style.transform = "translate(-50%, -50%)";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.alignItems = "center";
        container.style.gap = "10px";

        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.placeholder = "Enter your name";
        nameInput.style.fontSize = "24px";
        nameInput.style.padding = "10px";
        nameInput.style.borderRadius = "8px";
        nameInput.style.border = "2px solid #444";
        nameInput.style.backgroundColor = "#fff";
        nameInput.maxLength = 20;

        const backspaceBtn = document.createElement("button");
        backspaceBtn.textContent = "⌫";
        backspaceBtn.style.fontSize = "18px";
        backspaceBtn.style.padding = "6px 12px";
        backspaceBtn.style.borderRadius = "6px";
        backspaceBtn.style.cursor = "pointer";
        backspaceBtn.onclick = () => {
            nameInput.value = nameInput.value.slice(0, -1);
        };

        const submitBtn = document.createElement("button");
        submitBtn.textContent = "Submit";
        submitBtn.style.fontSize = "20px";
        submitBtn.style.padding = "10px 20px";
        submitBtn.style.borderRadius = "8px";
        submitBtn.style.cursor = "pointer";

        submitBtn.onclick = async () => {
            const name = nameInput.value.trim();
            if (name.length === 0) return;

            const payload = {
                name: name,
                time: $gameSystem.playtime(),
                deaths: $gameVariables.value(9),
                stats: $gameParty.members().map(actor => ({
                    id: actor.actorId(),
                    name: actor.name(),
                    level: actor.level,
                    hp: actor.hp,
                    mp: actor.mp,
                    atk: actor.atk,
                    def: actor.def,
                    agi: actor.agi,
                    luk: actor.luk
                })),
                replay: $gameVariables.value(10)
            };

            try {
                await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                console.log("✅ Score submitted!");
            } catch (err) {
                console.error("❌ Error submitting score:", err);
            } finally {
                $gameSwitches.setValue(SUBMIT_SWITCH_ID, false);
                document.body.removeChild(container);
                document.body.removeChild(overlay);
            }
        };

        const overlay = document.createElement("div");
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        overlay.style.zIndex = "999";
        document.body.appendChild(overlay);

        container.appendChild(nameInput);
        container.appendChild(backspaceBtn);
        container.appendChild(submitBtn);
        document.body.appendChild(container);

        // nameInput.focus();

        // Defer focus to user tap
        const focusHandler = () => {
            nameInput.focus();
            document.body.removeEventListener("touchstart", focusHandler);
        };

        document.body.addEventListener("touchstart", focusHandler, { once: true });

        // Also add fallback for mouse users
        document.body.addEventListener("mousedown", focusHandler, { once: true });
    }
})();