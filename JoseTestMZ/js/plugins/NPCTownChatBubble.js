(() => {
    // Sprite-based quick text message that doesn't block input
    window.showQuickMessage = function(text, duration = 60, x = "center", y = "bottom") {
        const scene = SceneManager._scene;
        if (!scene || !scene.children) {
            console.warn("❌ Scene not ready for message");
            return;
        }

        const padding = 24;
        const fontSize = 22;
        const lineSpacing = 4;

        const lines = text.split("\n");
        const temp = new Bitmap(1, 1);
        temp.fontSize = fontSize;

        const lineWidths = lines.map(line => temp.measureTextWidth(line));
        const textWidth = Math.max(...lineWidths);
        const totalWidth = Math.ceil(textWidth + padding * 2);
        const totalHeight = (fontSize + lineSpacing) * lines.length + padding * 2;

        const bitmap = new Bitmap(totalWidth, totalHeight);
        bitmap.fontSize = fontSize;
        bitmap.textColor = "#ffffff";
        bitmap.outlineColor = "rgba(0, 0, 0, 0.6)";
        bitmap.outlineWidth = 4;

        lines.forEach((line, i) => {
            const y = padding + i * (fontSize + lineSpacing);
            bitmap.drawText(line, 0, y, totalWidth, fontSize, "center");
        });

        const sprite = new Sprite(bitmap);

        // With this:
        if (typeof x === "number") {
            sprite.x = x - (totalWidth / 2); // Center the actual bitmap around x
        } else if (x === "center") {
            sprite.x = (Graphics.width - totalWidth) / 2;
        } else {
            sprite.x = 0;
        }

        if (typeof y === "number") {
            sprite.y = y;
        } else if (y === "bottom") {
            sprite.y = Graphics.height - totalHeight - 24;
        } else if (y === "top") {
            sprite.y = 24;
        } else {
            sprite.y = Graphics.height / 2 - totalHeight / 2;
        }

        sprite.z = 9999;
        sprite.opacity = 255;
        scene.addChild(sprite);

        // Fade out
        let frames = duration;
        sprite.update = function () {
            if (frames-- <= 0) {
                this.opacity -= 8;
                if (this.opacity <= 0) {
                    scene.removeChild(this);
                }
            }
        };
    };



    // NPC-attached quick message (based on event ID)
    window.showNpcMessage = function(eventId, text, duration = 60, offsetY = -96) {
        const event = $gameMap.event(eventId);
        if (!event) {
            console.warn(`❌ Event ID ${eventId} not found`);
            return;
        }

        const centerX = event.screenX();
        const y = event.screenY() + offsetY;

        showQuickMessage(text, duration, centerX, y); // Just send centerX, let quickMessage handle it
    };

})();
