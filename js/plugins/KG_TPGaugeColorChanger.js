/*:
 * @target MZ
 * @plugindesc TPゲージの色を変更するプラグイン
 * @author かがらーと
 * 
 * @help このプラグインは、TPゲージの色を変更するためのプラグインです。
 * プラグインパラメータで色を指定してください。
 * 
 * @param tpGaugeColor1
 * @text TPゲージ色1
 * @desc TPゲージの開始色を指定します。（#RRGGBB 形式で指定）
 * @default #00FF00
 * 
 * @param tpGaugeColor2
 * @text TPゲージ色2
 * @desc TPゲージの終了色を指定します。（#RRGGBB 形式で指定）
 * @default #00AA00
 * 
 */

(() => {
    const parameters = PluginManager.parameters('KG_TPGaugeColorChanger');
    const tpGaugeColor1 = parameters['tpGaugeColor1'] || "#00FF00";
    const tpGaugeColor2 = parameters['tpGaugeColor2'] || "#00AA00";

    const _Sprite_Gauge_gaugeColor1 = Sprite_Gauge.prototype.gaugeColor1;
    Sprite_Gauge.prototype.gaugeColor1 = function() {
        if (this._statusType === "tp") {
            return tpGaugeColor1; // プラグインパラメータから取得したTPゲージの開始色
        } else {
            return _Sprite_Gauge_gaugeColor1.call(this); // 既存の処理
        }
    };

    const _Sprite_Gauge_gaugeColor2 = Sprite_Gauge.prototype.gaugeColor2;
    Sprite_Gauge.prototype.gaugeColor2 = function() {
        if (this._statusType === "tp") {
            return tpGaugeColor2; // プラグインパラメータから取得したTPゲージの終了色
        } else {
            return _Sprite_Gauge_gaugeColor2.call(this); // 既存の処理
        }
    };
})();
