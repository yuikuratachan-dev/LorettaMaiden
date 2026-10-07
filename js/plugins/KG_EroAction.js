/*:
 * @target MZ
 * @plugindesc えっち攻撃用
 * @author
 *
 * @help
 * ターゲットの選定とスキルを選定し次のターンで実行させる。
 *
 * このプラグインにはプラグインコマンドはありません。
 */
 
(function() {
    var _Game_Enemy_initMembers = Game_Enemy.prototype.initMembers;
    Game_Enemy.prototype.initMembers = function() {
        _Game_Enemy_initMembers.call(this);
        this._followUpTarget = null;
    };

    var _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        _Game_Action_apply.call(this, target);
        if (this.subject().isEnemy() && this.item().id === 312) {
            this.subject()._followUpTarget = target.actorId();
        }
    };

    var _Game_Enemy_makeActions = Game_Enemy.prototype.makeActions;
    Game_Enemy.prototype.makeActions = function() {
        _Game_Enemy_makeActions.call(this);
        if (this._followUpTarget) {
            var action = new Game_Action(this);
            action.setSkill(313);
            var target = $gameActors.actor(this._followUpTarget);
            if (target && target.isAlive()) {
                action.setTarget(target.index());
                this._actions.unshift(action);
            }
            this._followUpTarget = null; // 一度使用したらリセット
        }
    };
})();
