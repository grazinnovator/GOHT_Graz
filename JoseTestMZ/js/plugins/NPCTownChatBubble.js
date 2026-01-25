(() => {
    // Track active message sprites for cleanup
    if (!window._activeMessageSprites) {
        window._activeMessageSprites = [];
    }
    
    // Safe fallback functions in case plugin is disabled (prevents crashes)
    if (!window.showQuickMessage) {
        window.showQuickMessage = function() { /* no-op */ };
    }
    if (!window.showNpcMessage) {
        window.showNpcMessage = function() { /* no-op */ };
    }

    // Clean up old sprites before creating new ones (performance optimization)
    function cleanupOldMessages() {
        const scene = SceneManager._scene;
        if (!scene) return;
        
        window._activeMessageSprites = window._activeMessageSprites.filter(sprite => {
            if (!sprite.parent || sprite.opacity <= 0) {
                if (sprite.parent) {
                    scene.removeChild(sprite);
                }
                // Bitmap cleanup is handled by the engine, no need to destroy manually
                return false;
            }
            return true;
        });
    }

    // Sprite-based quick text message that doesn't block input
    window.showQuickMessage = function(text, duration = 60, x = "center", y = "bottom") {
        const scene = SceneManager._scene;
        if (!scene || !scene.children) {
            console.warn("❌ Scene not ready for message");
            return;
        }

        // Clean up old messages first (performance optimization)
        // Only clean up if we have many sprites to avoid overhead
        if (window._activeMessageSprites.length > 5) {
            cleanupOldMessages();
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

        // Track this sprite
        window._activeMessageSprites.push(sprite);

        // Optimized fade out - only update when actually fading (performance optimization)
        let frames = duration;
        sprite.update = function () {
            // Skip ALL updates when message window is open (performance fix)
            // Check multiple ways to detect if message is showing
            const messageActive = $gameMessage && (
                $gameMessage.isBusy() || 
                $gameMessage.hasText() ||
                (SceneManager._scene && SceneManager._scene._messageWindow && 
                 SceneManager._scene._messageWindow.isOpen())
            );
            
            if (messageActive) {
                return; // Skip completely - don't even decrement frames
            }
            
            // Skip update if sprite is already removed (safety check)
            if (!this.parent) {
                return;
            }
            
            // Only do work when actually fading, not during countdown
            if (frames > 0) {
                frames--;
                return; // Early return - no work needed during countdown
            }
            
            // Now we're fading
            this.opacity -= 8;
            if (this.opacity <= 0) {
                if (this.parent) {
                    scene.removeChild(this);
                }
                // Bitmap cleanup is handled by the engine
            }
        };
        
        // Mark this sprite so we can identify it later
        sprite._isChatBubble = true;
    };



    // NPC-attached quick message (based on event ID)
    window.showNpcMessage = function(eventId, text, duration = 60, offsetY = -96) {
        const event = $gameMap.event(eventId);
        if (!event) {
            console.warn(`❌ Event ID ${eventId} not found`);
            return;
        }

        // Cache screen position to avoid multiple calls (performance optimization)
        const centerX = event.screenX();
        const y = event.screenY() + offsetY;

        showQuickMessage(text, duration, centerX, y); // Just send centerX, let quickMessage handle it
    };

})();
