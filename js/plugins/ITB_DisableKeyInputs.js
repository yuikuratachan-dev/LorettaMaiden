//ITB_DisableKeyInputs.js
//version 1.1
//アイストマトバズーカのゲーム制作日記
//https://icedtomatobazooka.site

/*:
* @plugindesc 指定したキー入力を無効化します。
* @target MZ 
* @author アイストマトバズーカ

* @help 
* プラグインコマンドで指定したキーの入力を無効化します。
* プラグイン導入後、イベントコマンドの"プラグインコマンド"で
* 本プラグインを選択し、無効化したいキーの値をtrueにしてください。
* コマンドが実行されるとそれ以降指定したキーの入力が無効化されます。
* 最有効化は再度プラグインコマンドでfalseを選択してください。
* 
* 
*

* 利用規約:
*   ・改変、再配布、利用形態の制限はありません。
*   ・本プラグインによるトラブル等、一切の責任を負いかねます。
* 
* 
* @command setkeys
* @text キー入力の無効化
* @desc 指定したキー入力を無効化/有効化します。

* @arg upkey
* @text 上
* @desc 入力無効:true　入力有効:false
* @default false
* @type boolean

* @arg rightkey
* @text 右
* @desc 入力無効:true　入力有効:false
* @default false
* @type boolean

* @arg leftkey
* @text 左
* @desc 入力無効:true　入力有効:false
* @default false
* @type boolean

* @arg downkey
* @text 下
* @desc 入力無効:true　入力有効:false
* @default false
* @type boolean

* @arg okkey
* @text 決定
* @desc 入力無効:true　入力有効:false
* @default false
* @type boolean

* @arg escapekey
* @text キャンセル
* @desc 入力無効:true　入力有効:false
* @default false
* @type boolean

* @arg shiftkey
* @text シフト
* @desc 入力無効:true　入力有効:false
* @default false
* @type boolean

* @arg pageupkey
* @text ページアップ
* @desc 入力無効:true　入力有効:false
* @default false
* @type boolean

* @arg pagedownkey
* @text ページダウン
* @desc 入力無効:true　入力有効:false
* @default false
* @type boolean

* @arg touch
* @text タッチ操作
* @desc 入力無効:true　入力有効:false
* @default false
* @type boolean

*  
*/

(() => {
    'use strict';

    const pluginName = document.currentScript.src.split("/").pop().replace(/\.js$/, "");

    let KeyArr = {};

    PluginManager.registerCommand(pluginName, "setkeys", args => {
        KeyArr = {
            up:args.upkey,
            right:args.rightkey,
            left:args.leftkey,
            down:args.downkey,
            ok:args.okkey,
            escape:args.escapekey,
            cancel:args.escapekey,
            manu:args.escapekey,
            shift:args.shiftkey,
            pageup:args.pageupkey,
            pagedown:args.pagedownkey,
            touch:args.touch
        }; 
    });

    Input._onKeyDown = function(event) {
        if (this._shouldPreventDefault(event.keyCode)) {
            event.preventDefault();
        }
        if (event.keyCode === 144) {
            // Numlock
            this.clear();
        }
        const buttonName = this.keyMapper[event.keyCode];
        if (buttonName && KeyArr[buttonName] !== "true") {
            this._currentState[buttonName] = true;
        }
        else{
            Input._latestButton = "";
        }
    };

    Input._updateGamepadState = function(gamepad) {
        const lastState = this._gamepadStates[gamepad.index] || [];
        const newState = [];
        const buttons = gamepad.buttons;
        const axes = gamepad.axes;
        const threshold = 0.5;
        newState[12] = false;
        newState[13] = false;
        newState[14] = false;
        newState[15] = false;
        for (let i = 0; i < buttons.length; i++) {
            newState[i] = buttons[i].pressed;
        }
        if (axes[1] < -threshold) {
            newState[12] = true; // up
        } else if (axes[1] > threshold) {
            newState[13] = true; // down
        }
        if (axes[0] < -threshold) {
            newState[14] = true; // left
        } else if (axes[0] > threshold) {
            newState[15] = true; // right
        }
        for (let j = 0; j < newState.length; j++) {
            if (newState[j] !== lastState[j]) {
                const buttonName = this.gamepadMapper[j];
                if (buttonName && KeyArr[buttonName] !== "true") {
                    this._currentState[buttonName] = newState[j];
                }
                else{
                    this._currentState[buttonName] = "";
                }
            }
        }
        this._gamepadStates[gamepad.index] = newState;
    };

    TouchInput.update = function() {
        if(KeyArr["touch"] === "true"){
            this.clear;
        }
        else{
            this._currentState = this._newState;
            this._newState = this._createNewState();
            this._clicked = this._currentState.released && !this._moved;
            if (this.isPressed()) {
                this._pressedTime++;
            }
        }
        
    };

})();
