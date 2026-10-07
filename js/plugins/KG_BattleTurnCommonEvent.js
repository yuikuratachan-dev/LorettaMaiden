/*:
 * @target MZ
 * @plugindesc 毎ターンの最初に指定したコモンイベントを実行する
 * @help このプラグインは、戦闘中の各ターン開始時に
 * 指定したコモンイベントを自動で呼び出します。
 * 
 * @param CommonEventID
 * @text コモンイベントID
 * @type common_event
 * @desc 毎ターンの最初に実行するコモンイベントのIDを設定します。
 * @default 1
 * 
 * @author 紅紫かがらーと
 * @url 
 */
 
(() => {
    const parameters = PluginManager.parameters("KG_BattleTurnCommonEvent");
    const commonEventId = Number(parameters["CommonEventID"] || 1);
    
    const _BattleManager_startTurn = BattleManager.startTurn;
    BattleManager.startTurn = function() {
        if (commonEventId > 0) {
            $gameTemp.reserveCommonEvent(commonEventId);
        }
        _BattleManager_startTurn.call(this);
    };
})();
