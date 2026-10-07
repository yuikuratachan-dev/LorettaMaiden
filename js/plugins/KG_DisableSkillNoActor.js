/*:
 * @target MZ
 * @plugindesc 対象のアクターがいない時にスキルをグレーアウト（使用不可）にするプラグイン
 * @author
 * 
 * @param RequiredActors
 * @type struct<SkillActorRequirement>[]
 * @desc 各スキルごとに必要なアクターを設定します。
 * 
 * @help
 * このプラグインは、スキルの対象となるアクターが存在しない場合に
 * スキルをグレーアウトし、使用できなくするものです。
 * 
 * ■使い方
 * 1. プラグイン管理でこのプラグインをONにする。
 * 2. プラグインパラメータでスキルごとに必要なアクターを設定する。
 *    
 */

/*~struct~SkillActorRequirement:
 * @param SkillID
 * @type skill
 * @desc 必要なアクターを設定するスキルのID。
 * 
 * @param ActorIDs
 * @type actor[]
 * @desc スキルを使用するために必要なアクターのID。
 */

(() => {
    const parameters = PluginManager.parameters("KG_DisableSkillNoActor");
    const requiredActorsList = JSON.parse(parameters["RequiredActors"] || "[]").map(entry => {
        const data = JSON.parse(entry);
        return {
            skillId: Number(data.SkillID),
            actorIds: JSON.parse(data.ActorIDs).map(Number)
        };
    });

    const additionalSkillIds = [467, 471, 472, 474, 475, 477, 478, 481];

    const _Window_SkillList_isEnabled = Window_SkillList.prototype.isEnabled;
    Window_SkillList.prototype.isEnabled = function(item) {
        if (!item) return false;

        // 指定スキルがアクター1しかいない場合にグレーアウト
        if (additionalSkillIds.includes(item.id)) {
            const partyMembers = $gameParty.aliveMembers(); // 生存しているパーティメンバー
            if (partyMembers.length === 1 && partyMembers[0].actorId() === 1) {
                return false; // グレーアウト
            }
        }

        // 既存のスキル使用条件
        const requirement = requiredActorsList.find(req => req.skillId === item.id);
        if (requirement) {
            const available = requirement.actorIds.some(id => {
                const actor = $gameActors.actor(id);
                return actor && $gameParty.members().includes(actor) && actor.isAlive();
            });
            return available && _Window_SkillList_isEnabled.call(this, item);
        }

        return _Window_SkillList_isEnabled.call(this, item);
    };
})();
