//=============================================================================
// KG_NotifyStateRemove.js
// ステート解除時に通知メッセージを表示（Torigoya.NotifyMessage用）
//=============================================================================
/*:
 * @target MZ
 * @plugindesc ステート解除時に通知メッセージを表示（Torigoya.NotifyMessage用／マップのみ）
 * @author 紅紫かがらーと
 * @url 
 *
 * @help
 * ステートが解除された際に、Torigoya.NotifyMessageプラグインを使って
 * 通知を表示します（マップ画面のみ）。
 *
 * このプラグインをTorigoya.NotifyMessage.jsより下に配置してください。
 *
 * 表示内容は「ステートの解除時の文章（メッセージ4）」です。
 */

(() => {
    'use strict';

    const _Game_Battler_removeState = Game_Battler.prototype.removeState;
    Game_Battler.prototype.removeState = function (stateId) {
        const hadState = this.isStateAffected(stateId);
        _Game_Battler_removeState.call(this, stateId);

        if (hadState && $gameParty.inBattle() === false) {
            const state = $dataStates[stateId];
            const text = state.message4; // ステート解除時の文章をそのまま使う
            if (text && window.Torigoya?.NotifyMessage?.Manager) {
                const NotifyItem = window.Torigoya.NotifyMessage.NotifyItem;
                const item = new NotifyItem({
                    message: text.format(this.name()),
                    icon: state.iconIndex || 0,
                    note: ''
                });
                window.Torigoya.NotifyMessage.Manager.notify(item);
            }

            // メッセージ抑制：足を止めないようにメッセージログを空にする
            if (this._result) {
                this._result.removedStates = this._result.removedStates.filter(id => id !== stateId);
            }
        }
    };

    const _Game_Battler_displayRemovedStates = Game_Battler.prototype.displayRemovedStates;
    Game_Battler.prototype.displayRemovedStates = function () {
        if ($gameParty.inBattle()) {
            _Game_Battler_displayRemovedStates.call(this);
        } else {
            this._removedStates = [];
        }
    };
})();