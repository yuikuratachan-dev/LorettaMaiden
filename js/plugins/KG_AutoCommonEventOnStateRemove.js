/*:
 * @target MZ
 * @plugindesc ステート32~46が解除された時に自動でコモンイベントを実行するプラグイン
 * @author 紅紫かがらーと
 *
 * @param CommonEventId
 * @text コモンイベントID
 * @desc ステートが解除されたときに実行するコモンイベントのIDを指定してください。
 * @type common_event
 * @default 1
 *
 * @help
 * このプラグインは、ステート32~46が解除されたときに指定した
 * コモンイベントを自動で実行します。
 *
 * プラグインコマンドやスクリプトを使用する必要はありません。
 *
 * 利用規約:
 *  - 商用・非商用問わず使用可能
 *  - クレジット表記不要
 *  - 改変・再配布自由
 */

(() => {
    const parameters = PluginManager.parameters("KG_AutoCommonEventOnStateRemove");
    const commonEventId = Number(parameters["CommonEventId"] || 1);

    const _Game_BattlerBase_removeState = Game_BattlerBase.prototype.removeState;
    Game_BattlerBase.prototype.removeState = function(stateId) {
        _Game_BattlerBase_removeState.call(this, stateId);
        
        if (stateId >= 32 && stateId <= 46) {
            $gameTemp.reserveCommonEvent(commonEventId);
        }
    };
})();
