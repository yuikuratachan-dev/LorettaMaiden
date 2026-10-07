/*:
 * @target MZ
 * @plugindesc アクターや敵が行動した後に指定したコモンイベントを毎回実行
 * @author
 *
 * @param CommonEventId
 * @text コモンイベントID
 * @type common_event
 * @desc 行動終了後に実行するコモンイベントのID
 * @default 1
 *
 * @help
 * アクターや敵が行動した後に指定したコモンイベントを実行します。
 *
 * このプラグインにはプラグインコマンドはありません。
 */
 
(() => {
    const parameters = PluginManager.parameters("KG_ExecuteCommoneventAfterAction");
    const commonEventId = Number(parameters["CommonEventId"] || 1);

    const _BattleManager_endAction = BattleManager.endAction;
    BattleManager.endAction = function() {
        _BattleManager_endAction.call(this);
        if (commonEventId > 0) {
            $gameTemp.reserveCommonEvent(commonEventId);
        }
    };
})();
