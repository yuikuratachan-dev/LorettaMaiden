/*---------------------------------------------------------------------------*
 * Torigoya_SkillChangeTo.js
 *---------------------------------------------------------------------------*
 * 2020/06/20 ru_shalm
 * http://torigoya.hatenadiary.jp/
 *---------------------------------------------------------------------------*/

/*:
 * @plugindesc skill change conditional plugin
 * @author ru_shalm
 *
 * @help
 *
 * Skill Note:
 *   <ChangeTo[2]: ...>   # change to skill[2], when conditional (...)is true.
 *
 * about conditional:
 *   the subject assign to variable `a`. (likely damage formula. but cannot use `b`.)
 *
 *   ex)
 *      <ChangeTo[10]: a.hp < 100>          # change skill when subject hp is less than 100
 *      <ChangeTo[10]: Math.random() < 0.1> # change skill with 10% chance
 */

/*:ja
 * @plugindesc スキル変化条件設定さん for MV
 * @author ru_shalm
 *
 * @help
 * そのスキルを発動した際に、設定した条件を満たしている場合は
 * 別のスキルに変化するようにできます。
 *
 * 例えば、普段は2連続攻撃だが、HPが25%以下になると
 * 超必殺技に変化する！のようなスキルがつくれます。
 *
 * ------------------------------------------------------------
 * ■ 設定方法
 * ------------------------------------------------------------
 * スキルのメモ欄に以下のように記述します
 *
 * <ChangeTo[変化先のスキル番号]: 条件式>
 *
 * ● 変化先のスキル番号？
 * 条件を満たしたときに代わりに発動するスキルの番号を設定してください。
 *
 * ● 条件式？
 * ダメージ計算式の欄と同じような記述ができます。
 *
 * a という変数にスキルを使った本人のsubjectが入っています。
 * ※ただし b はありません
 *
 * ------------------------------------------------------------
 * ■ 設定の例
 * ------------------------------------------------------------
 *
 * ● 使用者のHPが100未満だったらスキルID: 10番に変化
 * <ChangeTo[10]: a.hp < 100>
 *
 * ● 使用者のHPが25%以下だったらスキルID: 11番に変化
 * <ChangeTo[11]: a.hp < (a.mhp * 0.25)>
 *
 * ● ランダムに10%の確率でスキルID: 12番に変化
 * <ChangeTo[12]: Math.random() < 0.10>
 */

/*---------------------------------------------------------------------------*
 * Torigoya_SkillChangeTo.js (修正版: アクターごとの記憶対応)
 *---------------------------------------------------------------------------*/

(function (global) {
    'use strict';

    var SkillChangeTo = {
        name: 'Torigoya_SkillChangeTo'
    };

    var skillCache = {};
    var itemCache = {};

    SkillChangeTo.obtainChangeList = function (item) {
        var isSkill = item.hasOwnProperty('stypeId');
        var cache = isSkill ? skillCache : itemCache;
        if (cache[item.id] === undefined) {
            if (item.note.indexOf('<ChangeTo[') !== -1) {
                cache[item.id] = item.note.split(/\r?\n/).map(function (n) {
                    var match = n.match(/^<ChangeTo\[(\d+)\]:(.+)>$/);
                    if (match) {
                        return {
                            id: ~~match[1],
                            conditional: match[2]
                        };
                    } else {
                        return null;
                    }
                }).filter(function (n) { return n; });
            } else {
                cache[item.id] = [];
            }
        }
        return cache[item.id];
    };

    SkillChangeTo.evalConditional = function (evalText, a) {
        try {
            return eval(evalText);
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    SkillChangeTo.run = function () {
        var subject = this._subject;
        var action = subject.currentAction();
        if (!action) return;
        var item = action.item();
        if (!item) return;

        var ifList = SkillChangeTo.obtainChangeList(item);
        for (var i = 0; i < ifList.length; ++i) {
            if (!SkillChangeTo.evalConditional(ifList[i].conditional, subject)) continue;

            if (action.isSkill()) {
                action.setSkill(ifList[i].id);
            } else if (action.isItem()) {
                action.setItem(ifList[i].id);
            }
            break;
        }
    };

    var upstream_BattleManager_startAction = BattleManager.startAction;
    BattleManager.startAction = function () {
        SkillChangeTo.run.apply(this);
        upstream_BattleManager_startAction.apply(this);
    };

    SkillChangeTo.actorColors = {
        2: '\\c[2]',
        3: '\\c[3]',
        4: '\\c[4]',
        5: '\\c[27]',
        6: '\\c[13]'
    };

    var _Window_BattleSkill_makeItemList = Window_BattleSkill.prototype.makeItemList;
    Window_BattleSkill.prototype.makeItemList = function () {
        _Window_BattleSkill_makeItemList.call(this);
        this._data = this._data.map(function (skill) {
            var actor = this._actor;
            var changeList = SkillChangeTo.obtainChangeList(skill);
            for (var i = 0; i < changeList.length; ++i) {
                if (SkillChangeTo.evalConditional(changeList[i].conditional, actor)) {
                    var colorCode = SkillChangeTo.actorColors[actor.actorId()] || '\\c[0]';
                    skill = $dataSkills[changeList[i].id];
                    skill._displayName = `${colorCode}${skill.name}\\c[0]`;
                    return skill;
                }
            }
            skill._displayName = skill.name;
            return skill;
        }, this);
    };

    var _Window_SkillList_drawItemName = Window_SkillList.prototype.drawItemName;
    Window_SkillList.prototype.drawItemName = function (item, x, y, width) {
        if (item && item._displayName) {
            this.drawTextEx(item._displayName, x, y);
        } else {
            _Window_SkillList_drawItemName.call(this, item, x, y, width);
        }
    };

    SkillChangeTo.actorCommandMemory = {};
    SkillChangeTo.actorSkillMemory = {};

    function rememberActorCommand(symbol) {
        const actor = BattleManager.actor();
        if (actor) {
            SkillChangeTo.actorCommandMemory[actor.actorId()] = symbol;
        }
    }

    const _Scene_Battle_commandFight = Scene_Battle.prototype.commandFight;
    Scene_Battle.prototype.commandFight = function () {
        rememberActorCommand('attack');
        _Scene_Battle_commandFight.call(this);
    };

    const _Scene_Battle_commandSkill = Scene_Battle.prototype.commandSkill;
    Scene_Battle.prototype.commandSkill = function () {
        rememberActorCommand('skill');
        _Scene_Battle_commandSkill.call(this);

        const skillWindow = this._skillWindow;
        const actor = BattleManager.actor();
        const memory = SkillChangeTo.actorSkillMemory[actor.actorId()];
        if (memory) {
            const index = skillWindow._data.findIndex(skill => skill && skill.id === memory);
            if (index >= 0) skillWindow.select(index);
        }
    };

    const _Scene_Battle_commandGuard = Scene_Battle.prototype.commandGuard;
    Scene_Battle.prototype.commandGuard = function () {
        rememberActorCommand('guard');
        _Scene_Battle_commandGuard.call(this);
    };

    const _Scene_Battle_commandItem = Scene_Battle.prototype.commandItem;
    Scene_Battle.prototype.commandItem = function () {
        rememberActorCommand('item');
        _Scene_Battle_commandItem.call(this);
    };

    const _Window_ActorCommand_setup = Window_ActorCommand.prototype.setup;
    Window_ActorCommand.prototype.setup = function (actor) {
        _Window_ActorCommand_setup.call(this, actor);
        if (actor && SkillChangeTo.actorCommandMemory[actor.actorId()]) {
            const symbol = SkillChangeTo.actorCommandMemory[actor.actorId()];
            const index = this._list.findIndex(cmd => cmd.symbol === symbol);
            if (index >= 0) this.select(index);
        }
    };

    const _Window_SkillList_select = Window_SkillList.prototype.select;
    Window_SkillList.prototype.select = function (index) {
        _Window_SkillList_select.call(this, index);
        const skill = this.item();
        const actor = this._actor;
        if (skill && actor) {
            SkillChangeTo.actorSkillMemory[actor.actorId()] = skill.id;
        }
    };

    const _Scene_Battle_onSkillOk = Scene_Battle.prototype.onSkillOk;
    Scene_Battle.prototype.onSkillOk = function () {
        const action = BattleManager.inputtingAction();
        const actor = BattleManager.actor();
        if (actor) {
            const skillId = SkillChangeTo.actorSkillMemory[actor.actorId()];
            if (skillId) action.setSkill(skillId);
        }
        _Scene_Battle_onSkillOk.call(this);
    };

    global.Torigoya = global.Torigoya || {};
    global.Torigoya.SkillChangeTo = SkillChangeTo;
})(this);