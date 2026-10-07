/*=============================================================================
 DifficultyOption.js
----------------------------------------------------------------------------
 (C)2023 Triacontane
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
----------------------------------------------------------------------------
 Version
 1.0.0 2023/10/13 初版
----------------------------------------------------------------------------
 [Blog]   : https://triacontane.blogspot.jp/
 [Twitter]: https://twitter.com/triacontane/
 [GitHub] : https://github.com/triacontane/
=============================================================================*/

/*:
 * @plugindesc 難易度設定プラグイン
 * @target MZ
 * @url https://github.com/triacontane/RPGMakerMV/tree/mz_master/DifficultyOption.js
 * @base PluginCommonBase
 * @orderAfter PluginCommonBase
 * @author トリアコンタン
 *
 * @param difficultyList
 * @text 難易度リスト
 * @desc 難易度の設定リストです。より下に高い難度のデータを指定してください。
 * @default []
 * @type struct<Difficulty>[]
 *
 * @param difficultyVariableId
 * @text 難易度変数ID
 * @desc 現在の難易度を指定する変数IDです。この変数に格納された値が難易度リストのインデックスになります。
 * @default 1
 * @type variable
 *
 * @help DifficultyOption.js
 *
 * 難易度を設定できるようになります。
 * 設定した難易度は敵キャラのパラメータ倍率に影響します。
 * 指定した難度以上のときだけONになるスイッチも作成できます。
 * ただし、パフォーマンス上の理由から、このスイッチのON/OFFは
 * マップ画面でしか更新されません。
 *
 * 難易度の変更はパラメータ「難易度変数ID」の値を変更することで実現します。
 * オプション画面などで変更させたい場合は、別途公開している
 * 「オプション任意項目作成プラグイン」などと連携してください。
 *
 * さらに、以下のプラグインと組み合わせれば、難易度に応じて様々な
 * 仕様を変更できます。
 * ・初期ステートプラグイン
 * ・敵キャラ報酬レート設定プラグイン
 *　
 * このプラグインの利用にはベースプラグイン『PluginCommonBase.js』が必要です。
 * 『PluginCommonBase.js』は、RPGツクールMZのインストールフォルダ配下の
 * 以下のフォルダに格納されています。
 * dlc/BasicResources/plugins/official
 *
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

/*~struct~Difficulty:
 *
 * @param name
 * @text 難易度名称
 * @desc 難易度の名称です。識別用の項目なので特に意味はありません。
 * @default Normal
 *
 * @param switchId
 * @text 難易度スイッチID
 * @desc この難易度もしくはより上位の難易度が有効になったときに自動でONになるスイッチです。条件を満たさないときはOFFになります。
 * @default 0
 * @type switch
 *
 * @param hpRate
 * @text HP倍率
 * @desc この難易度が有効なときのHPの倍率です。100を指定すると通常の倍率になります。
 * @default 100
 * @type number
 * @min 1
 *
 * @param mpRate
 * @text MP倍率
 * @desc この難易度が有効なときのMPの倍率です。100を指定すると通常の倍率になります。
 * @default 100
 * @type number
 * @min 1
 *
 * @param atkRate
 * @text 攻撃力倍率
 * @desc この難易度が有効なときの攻撃力の倍率です。100を指定すると通常の倍率になります。
 * @default 100
 * @type number
 * @min 1
 *
 * @param defRate
 * @text 防御力倍率
 * @desc この難易度が有効なときの防御力の倍率です。100を指定すると通常の倍率になります。
 * @default 100
 * @type number
 * @min 1
 *
 * @param matRate
 * @text 魔法力倍率
 * @desc この難易度が有効なときの魔法力の倍率です。100を指定すると通常の倍率になります。
 * @default 100
 * @type number
 * @min 1
 *
 * @param mdfRate
 * @text 魔法防御倍率
 * @desc この難易度が有効なときの魔法防御の倍率です。100を指定すると通常の倍率になります。
 * @default 100
 * @type number
 * @min 1
 *
 * @param agiRate
 * @text 敏捷性倍率
 * @desc この難易度が有効なときの敏捷性の倍率です。100を指定すると通常の倍率になります。
 * @default 100
 * @type number
 * @min 1
 *
 * @param lukRate
 * @text 運倍率
 * @desc この難易度が有効なときの運の倍率です。100を指定すると通常の倍率になります。
 * @default 100
 * @type number
 * @min 1
 * 
 * @param partySizeModifiers
 * @text パーティ人数補正
 * @desc パーティ人数ごとの補正倍率を指定（例：1人時=140, 2人時=120, 3人時=110, 4人時=100）
 * @default ["140", "120", "110", "100"]
 * @type string[]
 *
 */

(() => {
    'use strict';
    const script = document.currentScript;
    const param = PluginManagerEx.createParameter(script);
    if (!param.difficultyList) {
        param.difficultyList = [];
    }

    // **パーティ人数補正倍率を取得し、undefined の場合はデフォルトを設定**
    const partySizeModifiers = (param.partySizeModifiers && param.partySizeModifiers.length === 4) 
        ? param.partySizeModifiers.map(Number) 
        : [25, 50, 75, 100]; // **デフォルト: 1人=25%, 2人=50%, 3人=75%, 4人=100%**

    // **変数22の補正値を設定**
    const variable22Modifiers = {
        1: 125,
        2: 150,
        3: 175,
        4: 100
    };

    Game_System._paramNames = ['hpRate', 'mpRate', 'atkRate', 'defRate', 'matRate', 'mdfRate', 'agiRate', 'lukRate'];

    Game_System.prototype.getDifficultyIndex = function() {
        return $gameVariables.value(param.difficultyVariableId);
    };

    Game_System.prototype.getDifficulty = function() {
        const index = this.getDifficultyIndex();
        return param.difficultyList[index];
    };

    Game_System.prototype.getDifficultyParamRate = function(paramId) {
        const difficulty = this.getDifficulty();
        let baseRate = difficulty ? difficulty[Game_System._paramNames[paramId]] : 100;

        // **変数22の値を取得し、補正を適用（ここで先に適用する）**
        const var22Value = $gameVariables.value(22);
        const var22Modifier = variable22Modifiers[var22Value] || 100; // **デフォルト100%**

        // **HPの場合のみ、パーティ補正を適用**
        let finalRate;
        if (paramId === 0) { // **paramId 0 は HP**
            let partySize = $gameParty.members().length;
            partySize = Math.max(1, Math.min(partySize, 4)); // **パーティ人数を1～4の範囲に制限**
            const partyModifier = partySizeModifiers[partySize - 1] || 100; // **適切な補正値を取得**
            finalRate = Math.round(baseRate * var22Modifier * partyModifier / 10000);
        } else {
            finalRate = Math.round(baseRate * var22Modifier / 100);
        }

        return finalRate;
    };

    Game_System.prototype.updateDifficultySwitch = function() {
        const index = this.getDifficultyIndex();
        if (index === this._defficultySwitchIndex) {
            return;
        }
        this._defficultySwitchIndex = index;
        param.difficultyList.forEach((difficulty, i) => {
            $gameSwitches.setValue(difficulty.switchId, i <= index);
        });
    };

    const _Game_Enemy_paramBase = Game_Enemy.prototype.paramBase;
    Game_Enemy.prototype.paramBase = function(paramId) {
        const baseValue = _Game_Enemy_paramBase.apply(this, arguments);
        const rate = $gameSystem.getDifficultyParamRate(paramId);
        const newValue = Math.round(baseValue * rate / 100);

        return newValue;
    };

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.apply(this, arguments);
        $gameSystem.updateDifficultySwitch();
    };

    const _Scene_Options_terminate = Scene_Options.prototype.terminate;
    Scene_Options.prototype.terminate = function() {
        _Scene_Options_terminate.apply(this, arguments);
        $gameSystem.updateDifficultySwitch();
    };
})();
