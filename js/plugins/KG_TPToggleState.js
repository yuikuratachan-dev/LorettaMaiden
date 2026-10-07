/*:
 * @plugindesc TP閾値によるアクター別自動ステート付与プラグイン
 * @target MZ
 * @author 紅紫かがらーと
 *
 * @help
 * 各アクターのTPが指定の閾値を超えると、指定したステートが付与されます。
 * 閾値未満になるとステートが解除されます。
 *
 * このプラグインにはプラグインコマンドはありません。
 */

(function() {
    const TP_THRESHOLD = 50;   // TPの閾値
    const ActorStates = {
        2: 47,  // アクターID 2 -> ステートID 47
        3: 48,  // アクターID 3 -> ステートID 48
        4: 49,  // アクターID 4 -> ステートID 49
        5: 50,  // アクターID 5 -> ステートID 50
        6: 51   // アクターID 6 -> ステートID 51
    };

    // TP変化時に各アクターのステート付与/解除をチェック
    const _Game_BattlerBase_setTp = Game_BattlerBase.prototype.setTp;
    Game_BattlerBase.prototype.setTp = function(tp) {
        _Game_BattlerBase_setTp.call(this, tp);

        if (this.isActor() && ActorStates[this.actorId()]) {
            const stateId = ActorStates[this.actorId()];
            if (this.tp >= TP_THRESHOLD) {
                if (!this.isStateAffected(stateId)) {
                    this.addState(stateId);
                }
            } else {
                if (this.isStateAffected(stateId)) {
                    this.removeState(stateId);
                }
            }
        }
    };
})();
