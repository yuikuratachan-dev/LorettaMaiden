// SkillEffectScript.js Ver.1.0.0
// MIT License (C) 2021 あわやまたな
// http://opensource.org/licenses/mit-license.php

/*:
* @target MZ
*
* @plugindesc スキル・アイテム発動時にスクリプトを実行できるようにします。
* @author あわやまたな (Awaya_Matana)
* @url https://awaya3ji.seesaa.net/
* @help
* 【使い方】
* スキル・アイテムのメモがスクリプト入力欄として使用可能になります。
* スクリプトはスキル・アイテム発動後に実行されます。
* メモに書き込んだ<script>より後、</script>より前の文字列がスクリプト扱い
* になります。
* ダメージ計算式と同じく、a、b、vが使用できます。
*
* [更新履歴]
* 2021/08/01：Ver.1.0.0　公開
*
* @param hitOnly
* @text 成功時のみ
* @desc 発動に成功した時にしかスクリプトが実行されなくなります。
* @default true
* @type boolean
*
*/

'use strict'
{
	//プラグイン名取得
	const pluginName = document.currentScript.src.replace(/^.*\/(.*).js$/, function() {
		return arguments[1];
	});
	//プラグインパラメーター取得
	const param = PluginManager.parameters(pluginName);
	const hitOnly = param['hitOnly'] === 'true';
	
	//データベース読み込みが完了して起動準備ができた時に割り込む
	const _Scene_Boot_isReady  = Scene_Boot.prototype.isReady;
	Scene_Boot.prototype.isReady = function() {
		if (_Scene_Boot_isReady.call(this)) {
			addItems();
		}
		return _Scene_Boot_isReady.call(this);
	};

	function addItems() {
		analyticsItems($dataSkills);
		analyticsItems($dataItems);
	};

	function analyticsItems($data) {
		for (const item of $data) {
			if (item && item.note) {
				let match;
				const match1 = /<script>(.+?)$/is.exec(item.note);
				const match2 = /^(.+?)<\/script>/is.exec(item.note);

				if (match1 && match2) {
					match = /<script>(.+?)<\/script>/ims.exec(item.note);
					match = match[1];
				} else {
					match = match1 && match1[1] || match2 && match2[1] || null;
				}

				if (match) {
					item.effectScript = new Function('a','b','v',match);
				}
			}
		}
	};

	const _Game_Action_apply = Game_Action.prototype.apply;
	Game_Action.prototype.apply = function(target) {
		_Game_Action_apply.call(this,target);
		this.applyScript(target);
	};

	Game_Action.prototype.applyScript = function(target) {
		const item = this.item();
		const a = this.subject();
		const b = target;
		const v = $gameVariables._data;
		if (item.effectScript) {
			item.effectScript.call(this, a, b, v);
		}
	};

	if (hitOnly) {
		const _Game_Action_applyScript = Game_Action.prototype.applyScript;
		Game_Action.prototype.applyScript = function(target) {
			if (target.result().isHit()) {
				_Game_Action_applyScript.call(this, target);
			}
		};
	}
}