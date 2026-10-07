/*
 * --------------------------------------------------
 * MNKR_RandomEnemies.js
 *   Ver.1.0.5
 * Copyright (c) 2020 Munokura
 * This software is released under the MIT license.
 * http://opensource.org/licenses/mit-license.php
 * --------------------------------------------------
 */

/*:
 * @target MZ MV
 * @url https://raw.githubusercontent.com/munokura/MNKR-MZ-plugins/master/MNKR_RandomEnemies.js
 * @plugindesc 敵グループの敵キャラをランダムに入れ替えます。
 * @help
 * 敵グループの敵キャラをランダムに入れ替えます。
 *
 * 敵キャラのメモ欄に下記のようにタグを入れてください。
 * <RandomEnemy:敵キャラID>
 * <RandomEnemy:敵キャラID,敵キャラID,敵キャラID>
 * 0は非表示になります。
 *
 * 例
 * <RandomEnemy:0,0,1,1,2,3>
 * 
 * 注意！
 * 下記のタグは無限ループが発生するため、使用しないでください。
 * <RandomEnemy:0>
 *
 * プラグインコマンドはありません。
 *
 *
 * 利用規約:
 *   MITライセンスです。
 *   https://licenses.opensource.jp/MIT/MIT.html
 *   作者に無断で改変、再配布が可能で、
 *   利用形態（商用、18禁利用等）についても制限はありません。
 */

(() => {
    'use strict';

    const _Game_Troop_setup = Game_Troop.prototype.setup;
    Game_Troop.prototype.setup = function (troopId) {
        _Game_Troop_setup.call(this, troopId);
        let condition = true;
        let isOriginalSet = false; // 元の敵が設定済みかどうかを判定
        while (condition) {
            this.clear();
            this._troopId = troopId;
            this._enemies = [];
            let availablePositions = this.troop().members.map(member => ({
                x: member.x,
                y: member.y
            })); // 空いている位置リスト

            this.troop().members.forEach(function (member) {
                let randomEnemyId;

                // まだ元の敵を設定していない場合は元の敵をそのまま使用
                if (!isOriginalSet) {
                    randomEnemyId = member.enemyId;
                    isOriginalSet = true; // 元の敵を設定したことを記録
                } else {
                    // ランダムな敵を選択
                    randomEnemyId = selectEnemyId($dataEnemies[member.enemyId]);
                }

                if (randomEnemyId === 0) {
                    // 0の場合は位置を詰める（スキップ）
                    return;
                }

                // 配置可能な位置を取得して設定
                const position = availablePositions.shift(); // 次の位置を取得
                if (position) {
                    const enemy = new Game_Enemy(randomEnemyId || member.enemyId, position.x, position.y);
                    this._enemies.push(enemy);
                }

                condition = false; // ループ条件解除
            }, this);

            this.makeUniqueNames();
        }
    };

    function selectEnemyId(enemyArray) {
        if (!enemyArray.meta.RandomEnemy) {
            return null;
        }
        const pool = enemyArray.meta.RandomEnemy.split(',').map(Number);
        return Number(pool[Math.randomInt(pool.length)]);
    }
})();
