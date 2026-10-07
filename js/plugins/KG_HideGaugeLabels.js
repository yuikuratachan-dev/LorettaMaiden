/*:
 * @target MZ
 * @plugindesc メニュー画面のHP、MP、TPのゲージラベルを非表示にします。
 * @help このプラグインは、メニュー画面でHP、MP、TPゲージのラベル（「HP」「MP」「TP」など）を非表示にします。
 * ゲージ自体やゲージの数値は表示されたままです。
 *
 * 使用方法:
 * プラグインファイルを作成し、ツクールMZのプラグイン管理で追加するだけです。
 */

(() => {
    // Window_StatusBase クラスの drawGauge メソッドを上書きして、ゲージのラベルを非表示にします
    const _Sprite_Gauge_drawLabel = Sprite_Gauge.prototype.drawLabel;
    Sprite_Gauge.prototype.drawLabel = function() {
        // ラベルの描画を行わないようにします
        // 元の関数を呼び出さないことでラベルが非表示になります
    };

})();
