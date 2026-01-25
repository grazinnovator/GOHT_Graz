/*:
 * @target MZ
 * @plugindesc Moves the message window to the top of the screen.
 * @author Jose Schmidt
 * 
 * This plugin forces the message window to appear at the top.
 * No parameters. Compatible with most message plugins.
 */

(() => {
    const _Window_Message_updatePlacement =
        Window_Message.prototype.updatePlacement;

    Window_Message.prototype.updatePlacement = function() {
        _Window_Message_updatePlacement.call(this);

        // Move message window to top
        this.y = 0;
    };
})();