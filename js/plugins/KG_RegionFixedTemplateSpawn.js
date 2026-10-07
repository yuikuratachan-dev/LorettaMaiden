/*:
 * @plugindesc 指定リージョンに確実にテンプレートイベントを配置するプラグイン (IDまたは名前対応)
 * @author Custom
 * @target MZ
 * @base EventReSpawn
 * @orderAfter EventReSpawn
 * 
 * @param ResetSelfSwitch
 * @text セルフスイッチリセット
 * @desc イベント配置時にセルフスイッチをリセットするか
 * @default false
 * @type boolean
 * 
 * @command SetRegionTemplate
 * @text リージョンにテンプレートを設定
 * @desc 指定リージョンにテンプレートイベントを割り当てる (ID または 名前)
 * 
 * @arg regionId
 * @text リージョンID
 * @desc 配置するリージョンのID
 * @type number
 * @min 1
 * 
 * @arg template
 * @text テンプレートイベント (IDまたは名前)
 * @desc 配置するテンプレートイベント (IDまたは名前)
 * @type string
 * 
 * @command ClearRegionTemplates
 * @text リージョン設定をクリア
 * @desc すべてのリージョン設定を削除する
 * 
 * @command SpawnRegionTemplates
 * @text リージョンのテンプレートを配置
 * @desc 現在の設定に基づいてテンプレートイベントを配置する
 * 
 * @help KG_RegionFixedTemplateSpawn.js
 * 
 * 【主な機能】
 * - 指定リージョンにテンプレートイベントを確実に配置
 * - 既に同じ場所にイベントがある場合は置き換え
 * - プラグインコマンドでリージョン設定を動的に変更可能 (ID または 名前)
 * 
 * 【プラグインコマンド】
 * - `SetRegionTemplate`: 指定リージョンにテンプレートイベントを設定 (ID または 名前)
 * - `ClearRegionTemplates`: すべての設定をリセット
 * - `SpawnRegionTemplates`: 設定したリージョンにテンプレートイベントを配置
 * 
 * 【テンプレート指定の例】
 * - `SetRegionTemplate` → `regionId: 41, template: 10` (ID指定)
 * - `SetRegionTemplate` → `regionId: 41, template: "EnemySpawner"` (名前指定)
 * 
 * 【注意】
 * - `EventReSpawn.js` が必須です。
 */

(() => {
    'use strict';

    const pluginName = 'KG_RegionFixedTemplateSpawn';
    const params = PluginManager.parameters(pluginName);
    const resetSelfSwitch = params['ResetSelfSwitch'] === 'true';

    const initRegionTemplateMap = () => {
        if (!$gameSystem) return;
        if (!$gameSystem._regionTemplateMap) {
            $gameSystem._regionTemplateMap = {};
        }
    };

    PluginManager.registerCommand(pluginName, 'SetRegionTemplate', args => {
        if (!$gameSystem) return;
        initRegionTemplateMap();
    
        const regionId = Number(args.regionId);
        const template = args.template;
    
        if (!isNaN(regionId) && template) {
            $gameSystem._regionTemplateMap[regionId] = isNaN(template) ? template : Number(template);
        }

        $gameMap.spawnFixedTemplateEvents();
    });
    

    PluginManager.registerCommand(pluginName, 'ClearRegionTemplates', () => {
        if (!$gameSystem) return;
        $gameSystem._regionTemplateMap = {};
    });

    PluginManager.registerCommand(pluginName, 'SpawnRegionTemplates', () => {
        if (!$gameSystem) return;
        initRegionTemplateMap();
        $gameMap.spawnFixedTemplateEvents();
    });

    Game_Map.prototype.spawnFixedTemplateEvents = function() {
        if (!$gameSystem) return;
        initRegionTemplateMap();
    
        for (let x = 0; x < this.width(); x++) {
            for (let y = 0; y < this.height(); y++) {
                const regionId = this.regionId(x, y);
                if ($gameSystem._regionTemplateMap[regionId]) {
                    const template = $gameSystem._regionTemplateMap[regionId];
    
                    const templateId = isNaN(template) ? this.findTemplateEventIdByName(template) : template;
    
                    if (templateId > 0) {
                        const existingEventId = this.eventIdXy(x, y);
                        if (existingEventId) {
                            this.eraseEvent(existingEventId);
                        }
    
                        this.spawnEvent(templateId, x, y, true);
    
                        if (resetSelfSwitch) {
                            ['A', 'B', 'C', 'D'].forEach(sw => {
                                const key = [this._mapId, this._lastSpawnEventId, sw];
                                $gameSelfSwitches.setValue(key, false);
                            });
                        }
                    }
                }
            }
        }
    };
    
    Game_Map.prototype.findTemplateEventIdByName = function(eventName) {
        if (typeof $dataTemplateEvents !== 'undefined' && $dataTemplateEvents.length) {
            for (let i = 1; i < $dataTemplateEvents.length; i++) {
                const event = $dataTemplateEvents[i];
                if (event && event.name === eventName) {
                    return i;
                }
            }
        }
        return 0;
    };
})();