/*:
 * @plugindesc ステート32～46が誰かに付いている場合、スキル452～466をグレーアウト
 * @target MZ
 * @author
 *
 * @help
 * ステートID 32～46のいずれかがパーティ内の誰かに付与されている場合、
 * スキルID 452～466を一時的に使用不可にし、スキルリストでグレーアウトします。
 */

(() => {
    // ステート32～46のリスト
    const restrictedStates = Array.from({ length: 15 }, (_, i) => i + 32);
    // グレーアウトするスキル452～466のリスト
    const restrictedSkills = Array.from({ length: 15 }, (_, i) => i + 452);

    // 誰かがステート32～46を持っているかを判定
    function isAnyActorAffected() {
        return $gameParty.members().some(actor => 
            actor.states().some(state => restrictedStates.includes(state.id))
        );
    }

    // スキルリストでスキルをグレーアウトする（有効判定を変更）
    const _Window_SkillList_isEnabled = Window_SkillList.prototype.isEnabled;
    Window_SkillList.prototype.isEnabled = function(item) {
        if (item && restrictedSkills.includes(item.id) && isAnyActorAffected()) {
            return false; // スキルをグレーアウト（使用不可）
        }
        return _Window_SkillList_isEnabled.call(this, item);
    };

    // スキルが使用できるか判定（戦闘時含む）
    const _Game_BattlerBase_isSkillUsable = Game_BattlerBase.prototype.isSkillUsable;
    Game_BattlerBase.prototype.isSkillUsable = function(skill) {
        if (skill && restrictedSkills.includes(skill.id) && isAnyActorAffected()) {
            return false; // 使用不可
        }
        return _Game_BattlerBase_isSkillUsable.call(this, skill);
    };
})();
