/*:
 * @target MZ
 * @plugindesc Render choices as mobile-friendly green buttons. Clear styling for visibility. v1.1
 * @author GPT
 */

(() => {
    class Window_ChoiceButtonList extends Window_ChoiceList {
        constructor(messageWindow) {
            super(messageWindow);
        }

        maxCols() {
            return 1;
        }

        maxItems() {
            return $gameMessage.choices().length;
        }

        itemHeight() {
            return 48;
        }

        updatePlacement() {
            this.width = 300;
            this.height = this.fittingHeight(this.maxItems());
            this.x = (Graphics.boxWidth - this.width) / 2;
            this.y = Graphics.boxHeight - this.height - 100;
        }

        refresh() {
            this.contents.clear();
            this.contents.fontSize = 20;
            for (let i = 0; i < this.maxItems(); i++) {
                this.drawChoiceButton(i);
            }
        }

        drawChoiceButton(index) {
            const rect = this.itemRect(index);
            const text = this.commandName(index);
            const isEnabled = this.isCommandEnabled(index);

            // Draw green background
            const bgColor = isEnabled ? '#00AA00' : '#555555';
            this.contents.paintOpacity = 255;
            this.contents.fillRect(rect.x, rect.y, rect.width, rect.height - 4, bgColor);

            // Draw black border
            this.contents.context.strokeStyle = '#000000';
            this.contents.context.lineWidth = 2;
            this.contents.context.strokeRect(rect.x, rect.y, rect.width, rect.height - 4);

            // Draw white text
            this.contents.textColor = '#FFFFFF';
            this.drawText(text, rect.x + 10, rect.y, rect.width - 20, 'center');
        }
    }

    Scene_Message.prototype.createChoiceWindow = function() {
        const rect = this.choiceWindowRect();
        const choiceWindow = new Window_ChoiceButtonList(this._messageWindow);
        choiceWindow.setHandler('ok', this.onChoiceOk.bind(this));
        choiceWindow.setHandler('cancel', this.onChoiceCancel.bind(this));
        this.addWindow(choiceWindow);
        this._choiceWindow = choiceWindow;
    };
})();