(() => {
    // Add Change Log to title command list
    const _Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
    Window_TitleCommand.prototype.makeCommandList = function() {
        _Window_TitleCommand_makeCommandList.call(this);
        this.addCommand("Change Log", "changeLog");
    };

    // Hook it to the title scene
    const _Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
    Scene_Title.prototype.createCommandWindow = function() {
        _Scene_Title_createCommandWindow.call(this);
        this._commandWindow.setHandler("changeLog", this.commandChangeLog.bind(this));
    };

    Scene_Title.prototype.commandChangeLog = function() {
        SceneManager.push(Scene_ChangeLogSprite);
    };

    // The new sprite-based scene
    class Scene_ChangeLogSprite extends Scene_Base {
        create() {
            super.create();
            this.createBackground();
            this.createTextSprite();
            this.createCloseButton();
        }

        createBackground() {
            this._backgroundSprite = new Sprite();
            this._backgroundSprite.bitmap = new Bitmap(Graphics.width, Graphics.height);
            this._backgroundSprite.bitmap.fillRect(0, 0, Graphics.width, Graphics.height, '#00000088');
            this.addChild(this._backgroundSprite);
        }

        createTextSprite() {
            const bmpWidth = Graphics.width - 80;
            const bmpHeight = 1000;
            const bitmap = new Bitmap(bmpWidth, bmpHeight);
            bitmap.fontSize = 24;

            // Initial text
            bitmap.drawText("Loading...", 0, 0, bmpWidth, 32, "left");

            // Create and attach sprite
            this._scrollSprite = new Sprite(bitmap);
            this._scrollSprite.x = 40;
            this._scrollSprite.y = 40;
            this._scrollY = 0;
            this.addChild(this._scrollSprite);

            // Load file and render when ready
            loadChangelogFileJSON("changeLog.json", lines => {
                if (!lines.length) lines = ["⚠️ Could not load changelog file."];

                bitmap.clear();
                let y = 0;
                for (const line of lines) {
                    bitmap.drawText(line, 0, y, bmpWidth, 32, "left");
                    y += 32;
                }
            });
        }

        update() {
            super.update();
            const scrollSpeed = 4;

            if (Input.isPressed("down")) this._scrollY += scrollSpeed;
            if (Input.isPressed("up")) this._scrollY -= scrollSpeed;

            this._scrollY = Math.max(0, Math.min(this._scrollY, this._scrollSprite.bitmap.height - (Graphics.height - 80)));
            this._scrollSprite.y = 40 - this._scrollY;

            if (Input.isTriggered("cancel") || Input.isTriggered("ok")) {
                SoundManager.playCancel();
                SceneManager.pop();
            }

            if (TouchInput.isTriggered()) {
                const x = TouchInput.x;
                const y = TouchInput.y;
                if (this._closeButtonArea.contains(x, y)) {
                    SoundManager.playCancel();
                    SceneManager.pop();
                }
            }

        }

        createCloseButton() {
            const width = 100;
            const height = 36;

            const bitmap = new Bitmap(width, height);
            bitmap.fontSize = 20;
            bitmap.fillRect(0, 0, width, height, "#333");
            bitmap.textColor = "#ffffff";
            bitmap.drawText("Close", 0, 0, width, height, "center");

            const button = new Sprite(bitmap);
            button.x = Graphics.width - width - 20;
            button.y = 20;

            this._closeButton = button;
            this._closeButtonArea = new Rectangle(button.x, button.y, width, height);

            this.addChild(button);
        }
    }

    function loadChangelogFileJSON(filename, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", filename);
        xhr.overrideMimeType("application/json");
        xhr.onload = function() {
            if (xhr.status < 400) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    callback(data);
                } catch (e) {
                    console.error("❌ Failed to parse changelog JSON:", e);
                    callback([]);
                }
            } else {
                console.error("❌ Failed to load changelog:", xhr.statusText);
                callback([]);
            }
        };
        xhr.onerror = function() {
            console.error("❌ Error loading changelog file.");
            callback([]);
        };
        xhr.send();
    }
})();