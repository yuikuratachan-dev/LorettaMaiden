/*:
 * @target MZ
 * @plugindesc 装備メニューから「最強装備」の項目を削除します。
 * @author 
 * 
 * @help
 * このプラグインを導入すると、装備メニューの「最強装備」コマンドが
 * 表示されなくなります。
 * 
 * 使用方法:
 * プラグイン管理から有効化するだけです。
 */

(() => {
    const _Window_EquipCommand_makeCommandList = Window_EquipCommand.prototype.makeCommandList;
    Window_EquipCommand.prototype.makeCommandList = function() {
        _Window_EquipCommand_makeCommandList.call(this);
        this._list = this._list.filter(command => command.symbol !== "optimize");
    };
})();
