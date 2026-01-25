/*:
 * @target MZ
 * @plugindesc Temporary performance debug tool - remove after finding bottleneck
 * @author Debug
 */

(() => {
    let frameCount = 0;
    let slowFrames = 0;
    const _Scene_Map_update = Scene_Map.prototype.update;
    
    // Profile specific functions
    function profileFunction(obj, funcName, label) {
        const original = obj[funcName];
        if (!original) return;
        
        obj[funcName] = function(...args) {
            const start = performance.now();
            const result = original.apply(this, args);
            const duration = performance.now() - start;
            
            if (duration > 5 && $gameMessage && $gameMessage.isBusy()) {
                console.log(`🐌 ${label}: ${duration.toFixed(2)}ms`);
            }
            return result;
        };
    }
    
    // Profile common suspects
    if (Scene_Map.prototype.update) {
        profileFunction(Scene_Map.prototype, 'update', 'Scene_Map.update');
    }
    
    // Profile HUD updates
    if (window.Sprite_HudBox && window.Sprite_HudBox.prototype.update) {
        profileFunction(window.Sprite_HudBox.prototype, 'update', 'Sprite_HudBox.update');
    }
    
    // Profile sprite updates - count chat bubble sprites
    // Get the current override (might be from NPCTownChatBubble)
    const _Sprite_update_original = Sprite.prototype.update;
    let chatBubbleUpdateCount = 0;
    let chatBubbleSkippedCount = 0;
    let totalSpriteUpdates = 0;
    let chatBubbleSpritesFound = 0;
    Sprite.prototype.update = function() {
        totalSpriteUpdates++;
        
        // Check if this is a chat bubble sprite (from NPCTownChatBubble plugin)
        if (this._isChatBubble) {
            chatBubbleSpritesFound++;
            const messageActive = $gameMessage && (
                $gameMessage.isBusy() || 
                $gameMessage.hasText() ||
                (SceneManager._scene && SceneManager._scene._messageWindow && 
                 SceneManager._scene._messageWindow.isOpen())
            );
            if (messageActive) {
                chatBubbleSkippedCount++;
                // Should be skipped - log if it's not
                console.log(`⚠️ Chat bubble sprite updating during message!`);
                return; // Skip it
            } else {
                chatBubbleUpdateCount++;
            }
        }
        
        // Call the original (which might have its own checks)
        _Sprite_update_original.call(this);
    };
    
    Scene_Map.prototype.update = function() {
        const start = performance.now();
        
        // Check what's taking time
        const t1 = performance.now();
        _Scene_Map_update.call(this);
        const baseUpdate = performance.now() - t1;
        
        const duration = performance.now() - start;
        
        frameCount++;
        if (duration > 16.67) { // Slower than 60fps
            slowFrames++;
            if ($gameMessage && $gameMessage.isBusy()) {
                // Count sprites to see if that's the issue
                let spriteCount = 0;
                if (this.children) {
                    const countSprites = (obj) => {
                        if (obj instanceof Sprite) spriteCount++;
                        if (obj.children) {
                            obj.children.forEach(countSprites);
                        }
                    };
                    this.children.forEach(countSprites);
                }
                console.log(`⚠️ Slow frame: ${duration.toFixed(2)}ms (base: ${baseUpdate.toFixed(2)}ms, sprites: ${spriteCount}) frame ${frameCount}`);
            }
        }
        
        if (frameCount % 60 === 0) {
            console.log(`📊 Last 60 frames: ${slowFrames} slow frames, ${totalSpriteUpdates} sprite updates, ${chatBubbleUpdateCount} chat bubble updates, ${chatBubbleSkippedCount} skipped, ${chatBubbleSpritesFound} found`);
            slowFrames = 0;
            totalSpriteUpdates = 0;
            chatBubbleUpdateCount = 0;
            chatBubbleSkippedCount = 0;
            chatBubbleSpritesFound = 0;
        }
        
        // Log during slow frames with message
        if (duration > 16.67 && $gameMessage && $gameMessage.isBusy()) {
            console.log(`🐌 Frame ${frameCount}: ${totalSpriteUpdates} sprite updates, ${chatBubbleUpdateCount} chat bubbles updating, ${chatBubbleSkippedCount} skipped, ${chatBubbleSpritesFound} total found`);
        }
        
        // Also count active chat bubble sprites in scene
        if (frameCount % 60 === 0 && $gameMessage && $gameMessage.isBusy()) {
            let activeChatBubbles = 0;
            if (SceneManager._scene && SceneManager._scene.children) {
                const countChatBubbles = (obj) => {
                    if (obj._isChatBubble) activeChatBubbles++;
                    if (obj.children) {
                        obj.children.forEach(countChatBubbles);
                    }
                };
                SceneManager._scene.children.forEach(countChatBubbles);
            }
            console.log(`💬 Active chat bubble sprites in scene: ${activeChatBubbles}`);
        }
    };
    
    // Also profile Window_Message update
    const _Window_Message_update = Window_Message.prototype.update;
    Window_Message.prototype.update = function() {
        if ($gameMessage && $gameMessage.isBusy()) {
            const start = performance.now();
            _Window_Message_update.call(this);
            const duration = performance.now() - start;
            if (duration > 5) {
                console.log(`🐌 Window_Message.update: ${duration.toFixed(2)}ms`);
            }
        } else {
            _Window_Message_update.call(this);
        }
    };
})();

