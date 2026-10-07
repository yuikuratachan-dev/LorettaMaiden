/*:
 * @target MZ
 * @plugindesc 指定したアクターを変身させるプラグイン（ステート53がある間だけ）
 * @author 
 *
 * @command Transform
 * @text 変身
 * @desc 指定したアクターを別のアクターに変身させる
 *
 * @arg targetActorId
 * @text 変身対象アクターID
 * @desc 変身先となるアクターのID
 * @type actor
 *
 * @command Revert
 * @text 変身解除
 * @desc 変身を元に戻す
 */

(function() {
    const TRANSFORM_STATE_ID = 53; // 変身ステートID
    let originalData = {}; // 元のアクター1のデータ保存用
    
    Game_BattlerBase.prototype.isTransformed = function() {
        return this.isStateAffected(TRANSFORM_STATE_ID);
    };

    Game_Actor.prototype.transformInto = function(targetActorId) {
        const targetActor = $gameActors.actor(targetActorId);
        const actor1 = $gameActors.actor(1);
        
        if (!targetActor || !actor1) return;
        
        // 元のデータを保存（初回のみ）
        if (!originalData[1]) {
            originalData[1] = {
                classId: actor1._classId,
                mp: actor1._mp,
                skills: actor1._skills.slice(),
            };
        }

        // 変身
        actor1.changeClass(targetActor._classId, true);
        actor1._mp = targetActor._mp;
        actor1._skills = targetActor._skills.slice(); // スキルを引き継ぐ
        actor1.refresh();

    };
    
    Game_Actor.prototype.revertTransformation = function() {
        const actor1 = $gameActors.actor(1);
        if (!originalData[1] || !actor1) return;
        
        // 元の状態に戻す
        actor1.changeClass(originalData[1].classId, true);
        actor1._mp = originalData[1].mp;
        actor1._skills = originalData[1].skills.slice(); // 元のスキルに戻す
        actor1.refresh();
        
        // データをクリア
        delete originalData[1];
    };
    
    const _Game_Battler_addNewState = Game_Battler.prototype.addNewState;
    Game_Battler.prototype.addNewState = function(stateId) {
        _Game_Battler_addNewState.call(this, stateId);
        
        if (this.isActor() && this.actorId() === 1 && stateId === TRANSFORM_STATE_ID) {
            const storedActorId = $gameVariables.value(7);
            console.log("変数7のアクターID:", storedActorId);
            if (storedActorId) {
                $gameActors.actor(1).transformInto(storedActorId);
            }
        }
    };
    
    const _Game_Battler_removeState = Game_Battler.prototype.removeState;
    Game_Battler.prototype.removeState = function(stateId) {
        console.log(`ステート${stateId}が解除されました`);
    
        _Game_Battler_removeState.call(this, stateId);
        
        if (this.isActor() && this.actorId() === 1 && stateId === TRANSFORM_STATE_ID) {
            console.log("変身解除を実行");
            this.revertTransformation();
    
            // スイッチ51～55をOFFにする
            for (let i = 51; i <= 55; i++) {
                console.log(`スイッチ${i}をOFF`);
                $gameSwitches.setValue(i, false);
            }
    
            // 変数153を255に設定
            console.log("変数153を255に設定");
            $gameVariables.setValue(153, 255);
        }
    };
    
    
    const _BattleManager_endBattle = BattleManager.endBattle;
    BattleManager.endBattle = function(result) {
        console.log("戦闘終了");
        _BattleManager_endBattle.call(this, result);
        const actor1 = $gameActors.actor(1);
        if (actor1.isTransformed()) {
            console.log("変身解除処理を実行");
            actor1.revertTransformation();
        }
    };
    
    
    PluginManager.registerCommand("ActorTransformation", "Transform", args => {
        const targetActorId = Number(args.targetActorId);
        if (targetActorId > 0) {
            $gameActors.actor(1).transformInto(targetActorId);
        }
    });
    
    PluginManager.registerCommand("ActorTransformation", "Revert", args => {
        $gameActors.actor(1).revertTransformation();
    });
})();
