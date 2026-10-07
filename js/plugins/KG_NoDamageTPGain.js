/*:
 * @plugindesc ダメージ時のTP回復を0にするプラグイン
 * @target MZ
 * @author Kagart
 *
 * @help NoDamageTPGain.js
 *
 * このプラグインは、戦闘中にダメージを受けた際のTP回復を
 * 無効化するシンプルなプラグインです。
 *
 * プレイヤーキャラクターと敵キャラクターの両方に適用されます。
 *
 * プラグインコマンドは不要です。
 */

(() => {
    const _Game_Battler_gainSilentTp = Game_Battler.prototype.gainSilentTp;
    Game_Battler.prototype.gainSilentTp = function(value) {
        if (value > 0) {
            value = 0; // ダメージ時のTP回復を無効化。
        }
        _Game_Battler_gainSilentTp.call(this, value);
    };
})();
