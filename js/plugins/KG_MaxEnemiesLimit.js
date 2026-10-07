/*:
 * @plugindesc 戦闘開始時の敵数を制限するプラグイン
 * @target MZ
 * @author 紅紫かがらーと
 *
 * @help
 * スイッチ123がオフの間は敵の最大数を2体に制限します。
 * スイッチ126がオンになると最大3体までになります。
 * スイッチ127がオンになると最大4体までになります。
 * それ以上のスイッチがオンなら制限解除され、通常通りのエンカウントになります。
 *
 * 【使用方法】
 * 1. プラグインを導入すると自動で敵数を制限します。
 * 2. スイッチ123をオンにすると最大2体までエンカウント可能。
 * 3. スイッチ126をオンにすると最大3体までエンカウント可能。
 * 4. スイッチ127をオンにすると最大4体までエンカウント可能。
 * 5. 127より大きいスイッチがオンになった場合、敵の制限が解除される。
 */

(() => {
    'use strict';

    const MAX_ENEMIES_LIMIT_1 = 2; // スイッチ123がオフのときの最大敵数
    const MAX_ENEMIES_LIMIT_2 = 3; // スイッチ126がオンのときの最大敵数
    const MAX_ENEMIES_LIMIT_3 = 4; // スイッチ127がオンのときの最大敵数
    const SWITCH_LIMIT_1 = 123; // 2体制限解除のスイッチ
    const SWITCH_LIMIT_2 = 126; // 3体制限解除のスイッチ
    const SWITCH_LIMIT_3 = 127; // 4体制限解除のスイッチ
    const SWITCH_DISABLE_LIMIT = 130; // 制限解除用スイッチ

    const _Game_Troop_setup = Game_Troop.prototype.setup;
    Game_Troop.prototype.setup = function(troopId) {
        _Game_Troop_setup.call(this, troopId);

        console.log("スイッチの状態:", {
            123: $gameSwitches.value(SWITCH_LIMIT_1),
            126: $gameSwitches.value(SWITCH_LIMIT_2),
            127: $gameSwitches.value(SWITCH_LIMIT_3),
            130: $gameSwitches.value(SWITCH_DISABLE_LIMIT),
        });

        // **スイッチ130がオンなら制限解除**
        if ($gameSwitches.value(SWITCH_DISABLE_LIMIT)) {
            console.log(`スイッチ${SWITCH_DISABLE_LIMIT}がオンなので制限解除`);
            return;
        }

        // デフォルトの最大敵数を決定
        let maxEnemies = MAX_ENEMIES_LIMIT_1;

        if ($gameSwitches.value(SWITCH_LIMIT_2)) {
            maxEnemies = MAX_ENEMIES_LIMIT_2;
        }
        if ($gameSwitches.value(SWITCH_LIMIT_3)) {
            maxEnemies = MAX_ENEMIES_LIMIT_3;
        }

        console.log(`適用される最大敵数: ${maxEnemies}`);
        console.log(`現在の敵の数: ${this._enemies.length}`);

        // **敵数を制限し、元の敵リストも保持**
        if (this._enemies.length > maxEnemies) {
            this._originalEnemies = [...this._enemies]; // **元の敵リストを保持**
            this._enemies = this._enemies.slice(0, maxEnemies);
            console.log(`敵の数を制限: ${this._enemies.length} 体`);
        } else {
            console.log("敵の数は制限以下なので変更なし");
        }
    };

    // **戦闘終了後、元の敵リストを復元**
    const _BattleManager_endBattle = BattleManager.endBattle;
    BattleManager.endBattle = function(result) {
        _BattleManager_endBattle.call(this, result);
        if ($gameTroop._originalEnemies) {
            console.log("戦闘終了後に敵リストを復元");
            $gameTroop._enemies = [...$gameTroop._originalEnemies];
            delete $gameTroop._originalEnemies;
        }
    };
})();

