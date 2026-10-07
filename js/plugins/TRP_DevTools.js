//=============================================================================
// TRP_DevTools.js
//=============================================================================
/*:
 * @target MZ
 * @author Thirop
 * @plugindesc ビューワ呼び出し・テストプレイ用ツール
 * @help
 * 【更新履歴】
 * 1.05 2023/01/22 プラグインコマンド形式対応
 * 1.03 2022/10/11 パーティクルグループエディタとの競合修正
 * 1.02 2022/09/25 一覧表示、再実行機能を追加。
 *                 ショートカットキーにShiftキーでの大文字対応
 * 1.01 2022/08/04 スクリプト実行時の不具合修正。
 *                 立ち絵プラグインとの競合修正。
 *
 * 【タイプ:inputについて】
 * スクリプト入力用のプロンプトが表示され、入力内容を実行します。
 * パラメータに設定したテキストが初期入力されてます。
 * 例）：パラメータを下のように入力
 * 「$gameSelfSwitches.setValue([$gameMap._mapId,イベントID,'A'],true)」
 * 実行時に表示されるプロンプトで、「イベントID」「'A'」を任意に変更すれば
 * セルフスイッチをいつでも変更可能。といった形で活用できます。
 *
 * 
 * 【マウスの拡張ボタン活用のすすめ】
 * マウスに拡張ボタンが着いている場合は、再実行キーなどを割り当てて使うのがオススメ。
 *
 * 【デバッグ用のテキスト表示】
 * ショートカットキー一覧の表示で使用している開発用のテキスト表示は
 * スクリプトから独自に表示可能です。
 *
 * 「TRP_CORE._showDevToolsShortCutList(['1行目テキスト','2行目テキスト',...],フレーム数);
 * フレーム数は省略可。-1とするとずっと表示
 * 
 *
 *
 * 
 * @param key
 * @text ショートカットキー
 * @desc ショートカットキー。Ctrl(Cmd)を押しながら設定したキーを押すと表示。（デフォ値：t）
 * @default t
 *
 * @param toolWindows
 * @text 独自ツールウィンドウ
 * @desc 独自ツールウィンドウの登録
 * @default ["{\"key\":\"d\",\"commands\":\"[\\\"{\\\\\\\"type\\\\\\\":\\\\\\\"victory\\\\\\\",\\\\\\\"param\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"name\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"key\\\\\\\":\\\\\\\"v\\\\\\\",\\\\\\\"closeWindow\\\\\\\":\\\\\\\"true\\\\\\\"}\\\",\\\"{\\\\\\\"type\\\\\\\":\\\\\\\"defeat\\\\\\\",\\\\\\\"param\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"name\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"closeWindow\\\\\\\":\\\\\\\"true\\\\\\\"}\\\",\\\"{\\\\\\\"type\\\\\\\":\\\\\\\"doubleSpeed\\\\\\\",\\\\\\\"param\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"name\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"closeWindow\\\\\\\":\\\\\\\"true\\\\\\\"}\\\",\\\"{\\\\\\\"type\\\\\\\":\\\\\\\"eventSkip\\\\\\\",\\\\\\\"param\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"name\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"closeWindow\\\\\\\":\\\\\\\"true\\\\\\\"}\\\",\\\"{\\\\\\\"type\\\\\\\":\\\\\\\"gainAllItems\\\\\\\",\\\\\\\"param\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"name\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"key\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"closeWindow\\\\\\\":\\\\\\\"true\\\\\\\"}\\\",\\\"{\\\\\\\"type\\\\\\\":\\\\\\\"gainGold\\\\\\\",\\\\\\\"param\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"name\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"key\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"closeWindow\\\\\\\":\\\\\\\"true\\\\\\\"}\\\",\\\"{\\\\\\\"type\\\\\\\":\\\\\\\"levelMax\\\\\\\",\\\\\\\"param\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"name\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"key\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"closeWindow\\\\\\\":\\\\\\\"true\\\\\\\"}\\\"]\"}"]
 * @type struct<ToolWindow>[]
 *
 * @param skipRate
 * @text イベント高速化の倍率
 * @desc イベント高速化の倍率。高速再生はプラグインコマンド（MV形式は「stopEventSkip」）で解除
 * @default 5
 * @type num
 * @min 1
 *
 * @command stopEventSkip
 * @text イベント高速化OFF
 * @desc イベント高速化状態を中段
 *
 * @param redoKey
 * @text コマンド再実行キー
 * @desc 最後に使ったコマンドを呼び出すショートカットキー。「Ctrl+キー」で実行。履歴情報はコンフィグデータに保存。デフォ値：Ctrl+Shift+Z
 * @default R
 * 
 * @param helpKey
 * @text ヘルプ表示キー
 * @desc ウィンドウ/コマンドのショートカット一覧を表示するためのキー。「Ctrl+キー」で実行。デフォ値：Ctrl+Shift+H
 * @default H
 * @type string
 * 
 */
 /*~struct~ToolWindow:
 * @param name
 * @text カテゴリ名
 * @desc 
 * @default 
 * 
 * @param key
 * @text キー名
 * @desc このツールウィンドウを呼び出すキー名（Ctrl+キー名で呼び出し）。Shiftでの大文字・小文字の区別可
 *
 * @param commands
 * @text コマンド登録
 * @desc このウィンドウに表示するコマンドの登録
 * @type struct<Command>[]
 */
/*~struct~Command:
 * @param type
 * @text コマンドタイプ
 * @desc 実行するコマンドの種類を選択。(コモンイベントのID、スクリプト内容は「パラメータ」で設定）
 * @type select
 * @option commonEvent/コモンイベント
 * @value commonEvent
 * @option mvPluginCommand/MV形式プラグインコマンド
 * @value mvPluginCommand
 * @option script/スクリプト
 * @value script
 * @option input/スクリプト入力
 * @value input
 * @option victory/敵全滅
 * @value victory
 * @option defeat/味方全滅
 * @value defeat
 * @option doubleSpeed/倍速切り替え
 * @value doubleSpeed
 * @option eventSkip/イベント高速化の切り替え
 * @value eventSkip
 * @option gainAllItems/全アイテム取得
 * @value gainAllItems
 * @option gainGold/ゴールド取得
 * @value gainGold
 * @option levelMax/レベル最大
 * @value levelMax
 *
 * @param param
 * @text パラメータ
 * @desc タイプ別。コモンイベント=>ID、スクリプト=>スクリプト分、スクリプト入力=>初期文
 *
 * @param name
 * @text 名前
 * @desc 表示するコマンド名。コモンイベントの場合は省略するとコモンイベント名
 *
 * @param key
 * @text キー
 * @desc 設定すると、「Ctrl+キー」でコマンドを直接呼び出し。Shiftでの大文字・小文字の区別可
 *
 * @param closeWindow
 * @text ウィンドウを閉じる
 * @desc ON/trueで、コマンド実行後にウィンドウを閉じる
 * @default true
 * @type boolean
 *
 * 
 */
//============================================================================= 



// Redo
// Help


var TRP_CORE = TRP_CORE||{};

(function(){
'use strict';

if (!Utils.isNwjs() || !Utils.isOptionValid('test')){
	return;
}


var pluginName = 'TRP_DevTools';
var parameters = PluginManager.parameters(pluginName);

var skipRate = Number(parameters.skipRate)||1;
var keyToolWindowMap = {};
var keyCommandMap = {};
var toolWindows = null;
var doubleSpeedEnabled = false;
var eventSkipEnabled = false;

(()=>{
    /* validate parameters
    ===================================*/
    toolWindows = JSON.parse(parameters.toolWindows);
    for(var i=toolWindows.length-1; i>=0; i=(i-1)|0){
        toolWindows[i] = JSON.parse(toolWindows[i]);
        var toolWindow = toolWindows[i];
        if(!toolWindow)continue;

        if(toolWindow.key){
            if(keyToolWindowMap[toolWindow.key] ||parameters.key===toolWindow.key || keyCommandMap[toolWindow.key]){
                throw new Error('ツールウィンドウの呼び出しキー「'+toolWindow.key+'」が重複登録されています。')
            }
            keyToolWindowMap[toolWindow.key] = toolWindow;
        }

        toolWindow.commands = JSON.parse(toolWindow.commands);
        var commands = toolWindow.commands;
        for(var j=commands.length-1; j>=0; j=(j-1)|0){
            commands[j] = JSON.parse(commands[j]);
            var command = commands[j];
            command.closeWindow = command.closeWindow==='true';
            if(command.key){
                if(keyToolWindowMap[command.key] ||parameters.key===command.key || keyCommandMap[command.key]){
                    throw new Error('ツールウィンドウの呼び出しキー「'+toolWindow.key+'」が重複登録されています。');
                }
                keyCommandMap[command.key] = command;
            }
            switch(command.type){
            case 'doubleSpeed':
                doubleSpeedEnabled = true;
                break;
            case 'eventSkip':
                eventSkipEnabled = true;
                break;
            case 'commonEventId':
                if(!$dataCommonEvents[Number(command.param)]){
                    throw new Error('ツールウィンドウのコマンド登録エラー：コモンイベントID「%1」のデータが存在しません。'.format(command.param));
                }
                break;
            }
        }
    }
})();


var isMZ = Utils.RPGMAKER_NAME==="MZ";

if(isMZ){
    PluginManager.registerCommand(pluginName,'stopEventSkip',()=>{
        TRP_CORE.eventSkip = false;
    });
}
var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args){
    if(command.toLowerCase()==='stopeventskip'){
        TRP_CORE.eventSkip = false;
    }else{
        _Game_Interpreter_pluginCommand.call(this,command,args);
    }
};


var _SceneManager_onKeyDown = SceneManager.onKeyDown;
SceneManager.onKeyDown = function(event){
	if(event.ctrlKey||event.metaKey){
        if(TRP_CORE.onKeyDownForDevTools(event)){
            return;
        }
	}
	_SceneManager_onKeyDown.call(this,event);
};

TRP_CORE.onKeyDownForDevTools = function(event){
    if(TRP_CORE.devToolsDisabled)return;
    if(TRP_CORE.showingToolsWindow)return;

    if(SceneManager._scene){
        if(SceneManager._scene.update!==SceneManager._scene.constructor.prototype.update){
            //update override maybe for any devTool
            return;
        }
        if(SceneManager._scene._particleEditor || SceneManager._scene._particleGroupEditor){
            //particle editor
            return;
        }
    }
    if(window.TRP_SkitDevPicker && TRP_SkitDevPicker._expPicker){
        //exp picker
        return;
    }
    if(!event.key)return;


    var key = event.key;
    if(event.shiftKey){
        key = key.toUpperCase();
    }

    if(key===parameters.key){
        TRP_CORE.showDevToolsWindow(key);
        return true;
    }else if(keyToolWindowMap[key]){
        TRP_CORE.showDevToolsWindow(key);    
        return true;
    }else if(keyCommandMap[key]){
        TRP_CORE.processDevToolsCommand(keyCommandMap[key]);
        SoundManager.playCursor();
        return true;
    }else if(key === parameters.helpKey){
        TRP_CORE.showDevToolsShortCutList();
        return true;
    }else if(key === parameters.redoKey){
        TRP_CORE.tryRedoDevToolsCommand();
        return true;
    }



    return false;
}

TRP_CORE.showingToolsWindow = null;
TRP_CORE.showDevToolsWindow = function(key){
    var setting;
    if(key===parameters.key){
        setting = parameters;
    }else{
        setting = keyToolWindowMap[key];
    }
	if(!setting || TRP_CORE.showingToolsWindow===setting){
		SoundManager.playBuzzer();
		return;
	}

	TRP_CORE.showingToolsWindow = setting;
	SoundManager.playOk();

    var window;
    if(key===parameters.key){
        window = new Window_TrpDevTools();
    }else{
        window = new Window_TrpCustomDevTools(setting);
    }

    var scene = SceneManager._scene;
    scene.addChild(window);
    window.setup();

    var update = scene.update;
    scene.update = function(){
    	window.update();
    	if(window.isClosed()){
    		scene.update = update;
    		TRP_CORE.showingToolsWindow = null;
    	}
    };
};
TRP_CORE.processDevToolsCommand = function(command){
    switch(command.type){
    case 'commonEvent':
        $gameTemp.reserveCommonEvent(Number(command.param));
        break;
    case 'mvPluginCommand':
        this.processPluginCommand(command.param);
        break;
    case 'script':
        this.processEval(command.param);
        break;
    case 'input':
        var script = window.prompt('スクリプトを入力',command.param||'');
        this.processEval(script);

        if(parameters.redoKey){
            var newCommand = JsonEx.makeDeepCopy(command);
            newCommand.param = script;
            ConfigManager.trpDevLastCommand = newCommand;
            ConfigManager.save();
        }
        break;
    case 'doubleSpeed':
        TRP_CORE.doubleSpeed = !TRP_CORE.doubleSpeed;
        break;
    case 'eventSkip':
        TRP_CORE.eventSkip = !TRP_CORE.eventSkip;
        break;

    case 'victory':
        if(!$gameParty.inBattle()){
            SoundManager.playBuzzer();
        }else{
            $gameTroop.members().forEach(m=>{
                m.setHp(0);
            });
            BattleManager.checkBattleEnd();
        }
        break;
    case 'defeat':
        $gameParty.members().forEach(m=>{
            m.setHp(0);
        });
        if($gameParty.inBattle()){
            BattleManager.checkBattleEnd();
        }
        break;

    case 'gainGold':
        $gameParty.gainGold(9999999);
        break;
    case 'gainAllItems':
        [$dataItems,$dataWeapons,$dataArmors].forEach((dataSet)=>{
            for(const data of dataSet){
                if(data && data.name){
                    $gameParty.gainItem(data,99);
                }
            }
        });
        break;
    case 'levelMax':
        for(const member of $gameParty.members()){
            if(member.isMaxLevel())continue;

            var maxLevel = member.maxLevel();
            var exp = member.expForLevel(maxLevel);
            member.changeExp(exp,false);
        }
        break;
    }
};

TRP_CORE.processPluginCommand = function(param){
    if(!param || typeof param!=='string')return;

    var args = param.split(" ");
    var command = args.shift();

    var interpreter = $gameMap._interpreter || $gameTroop._interpreter;
    if(interpreter){
        interpreter.pluginCommand(command, args);
    }
};

TRP_CORE.processEval = function(script){
    try{
        eval(script);
    }catch(e){
        var lines = [
            '【スクリプトエラー】',
            'スクリプト:'+script,
            'エラー:'+e.message
        ];
        this._showDevToolsShortCutList(lines);

        SoundManager.playBuzzer();
    }
};



//=============================================================================
// Redo
//=============================================================================
TRP_CORE.tryRedoDevToolsCommand = function(){};

if(parameters.redoKey)(()=>{
    TRP_CORE.tryRedoDevToolsCommand = function(){
        var lastCommand = ConfigManager.trpDevLastCommand;
        if(!lastCommand){
            SoundManager.playBuzzer();
            return;
        }

        TRP_CORE.processDevToolsCommand(lastCommand);
        SoundManager.playCursor();
    };

    var TRP_CORE_processDevToolsCommand = TRP_CORE.processDevToolsCommand;
    TRP_CORE.processDevToolsCommand = function(command){
        if(command){
            ConfigManager.trpDevLastCommand = command;
            ConfigManager.save();
        }
        TRP_CORE_processDevToolsCommand.call(this,...arguments);
    };

    ConfigManager.trpDevLastCommand = null;
    var _ConfigManager_makeData = ConfigManager.makeData;
    ConfigManager.makeData = function() {
        var config = _ConfigManager_makeData.call(this,...arguments);
        config.trpDevLastCommand = this.trpDevLastCommand||null;
        return config;
    };

    var _ConfigManager_applyData = ConfigManager.applyData;
    ConfigManager.applyData = function(config) {
        _ConfigManager_applyData.call(this,...arguments);
        this.trpDevLastCommand = config.trpDevLastCommand||null;
    };
})();




//=============================================================================
// Help
//=============================================================================
TRP_CORE._devToolsHelpSprite = null;;
TRP_CORE.showDevToolsShortCutList = function(){
    var lines = [];

    if(parameters.key){
        lines.push(
            '[%1]：各種ピッカー呼び出し'.format(parameters.key)
        );
    }

    var keys = Object.keys(keyToolWindowMap);
    for(const key of keys){
        var window = keyToolWindowMap[key];
        var name = window.name||'(名前未設定）'
        lines.push(
            '[%1]：%2'.format(window.key,name)
        );

        var commands = window.commands;
        for(const command of commands){
            if(!command || !command.key)continue;
            var cmdName = Window_TrpCustomDevTools.commandName(command);
            lines.push(
                '└[%1]：%2'.format(command.key,cmdName)
            );
        }
    }

    if(parameters.redoKey){
        lines.push(
            '[%1]：コマンド再実行'.format(parameters.redoKey)
        );
    }


    if(lines.length===0)return;
    this._showDevToolsShortCutList(lines);
};
TRP_CORE._showDevToolsShortCutList = function(lines,duration=0){
    SoundManager.playCursor();

    var sprite = TRP_CORE._devToolsHelpSprite;
    if(!sprite || !sprite.transform){
        sprite = TRP_CORE._devToolsHelpSprite = new TempInfoSprite();
    }
    SceneManager._scene.addChild(sprite);

    duration = duration||(60+30*lines.length);
    sprite.show(lines,duration);
};

function TempInfoSprite(){
    this.initialize.apply(this, arguments);
}
TempInfoSprite.prototype = Object.create(Sprite.prototype);
TempInfoSprite.prototype.constructor = Sprite;
TempInfoSprite.prototype.initialize = function(bitmap){
    Sprite.prototype.initialize.call(this,bitmap);
    this._duration = 0;
    this._fadeSpeed = 26;
};
TempInfoSprite.prototype.show = function(lines,duration=60){
    this._duration = duration;
    this.visible = true;
    this.opacity = 255;


    var fontSize = 18;
    var lineHeight = fontSize+4;
    var width = Math.floor(Graphics.width*2/3);
    var height = lines.length*lineHeight;
    var bitmap = new Bitmap(width,height);
    bitmap.fillAll('rgb(0,0,0,0.5');
    bitmap.fontSize = fontSize;
    bitmap.outlineColor = 'black';
    bitmap.outlineWidth = 4;

    var y = 0;
    var m = 2;
    var maxW = 0;
    for(const line of lines){
        bitmap.drawText(line,2,y,width-2*m,lineHeight);
        y += lineHeight;
        maxW = (bitmap.measureTextWidth(line)+4).clamp(maxW,width);
    }
    this.bitmap = bitmap;
    this.setFrame(0,0,maxW,height);
};
TempInfoSprite.prototype.update = function(){
    if(!this.visible)return;
    Sprite.prototype.update.call(this);

    if(this._duration>0){
        this._duration -= 1;
        if(this._duration<=0)this._duration = 0;
    }else if(this._duration<0){
        //permanent
    }else{
        this.opacity -= this._fadeSpeed;
        if(this.opacity<=0){
            this.visible = false;
        }
    }
}; 






//=============================================================================
// Window_TrpDevToolsBase
//=============================================================================
function Window_TrpDevToolsBase(){
    this.initialize.apply(this, arguments);
}
Window_TrpDevToolsBase.prototype = Object.create(Window_Command.prototype);
Window_TrpDevToolsBase.prototype.constructor = Window_TrpDevToolsBase;
Window_TrpDevToolsBase.prototype.initialize = function() {
    var width = this.windowWidth();
    var height = this.windowHeight();
    var x = (Graphics.width-width)/2;
    var y = (Graphics.height-height)/2;

    if(isMZ){
        var rect = new Rectangle(x,y,width,height)
        Window_Command.prototype.initialize.call(this, rect);
    }else{
        Window_Command.prototype.initialize.call(this,x,y);
    }

    this.openness = 0;
    this.deactivate();

    this.setHandler('cancel', ()=>{
        this.close();
    });
};

Window_TrpDevToolsBase.prototype.windowWidth = function(){
    return Math.min(Graphics.width-100,500);
};
Window_TrpDevToolsBase.prototype.windowHeight = function(){
    var lines = this.commands().length;

    var height;
    do{
        height = this.fittingHeight(lines);
        lines -= 1;
    }while(height>Graphics.height-10 && lines>0);

    return height;
};
Window_TrpDevToolsBase.prototype.makeCommandList = function() {
    var commands = this.commands();
    var names = this.commandNames(commands);
    var length = commands.length;
    for(var i=0; i<length; i=(i+1)|0){
        var command = commands[i];
        var name = names[i];
        this.addCommand(name,command);
    }
};
Window_TrpDevToolsBase.prototype.setup = function() {
    this.refresh();
    if(isMZ){
        this.forceSelect(0);
    }else{
        this.select(0);
    }
    this.activate();
    this.open();
};

Window_TrpDevToolsBase.prototype.commands = null;
Window_TrpDevToolsBase.prototype.commandNames = null;


//=============================================================================
// Window_TrpCustomDevTools
//=============================================================================
function Window_TrpCustomDevTools(){
    this.initialize.apply(this, arguments);
}
Window_TrpCustomDevTools.prototype = Object.create(Window_TrpDevToolsBase.prototype);
Window_TrpCustomDevTools.prototype.constructor = Window_TrpCustomDevTools;
Window_TrpCustomDevTools.prototype.initialize = function(setting){
    this._setting = setting;
    Window_TrpDevToolsBase.prototype.initialize.call(this);

    var commands = setting.commands;
    var length = commands.length;
    for(var i=0; i<length; i=(i+1)|0){
        this.registerCommandHandler(i,commands[i]);
    }
};

Window_TrpCustomDevTools.prototype.registerCommandHandler = function(i,command){
    this.setHandler('command:'+i,()=>{
        TRP_CORE.processDevToolsCommand(command);

        if(command.closeWindow){
            this.visible = false;
            this.close();
        }else{
            this.activate();
        }
    });
};

Window_TrpCustomDevTools.prototype.commands = function(){
    var commands = [];
    var length = this._setting.commands.length;
    for(var i=0; i<length; i=(i+1)|0){
        commands.push('command:'+i)
    }
    commands.push('cancel');

    return commands;
};
Window_TrpCustomDevTools.prototype.commandNames = function(commands){
    var names = [];
    var commands = this._setting.commands;
    for(const command of commands){
        var name = Window_TrpCustomDevTools.commandName(command);
        if(command.key){
            name += '<'+command.key+'>';
        }
        names.push(name);
    }
    names.push('キャンセル');
    return names;
};

Window_TrpCustomDevTools.commandName = function(command){
    var name = command.name;
    if(!name){
        switch(command.type){
        case 'victory':
            name = '敵全滅';
            break;
        case 'defeat':
            name = '味方全滅';
            break;
        case 'doubleSpeed':
            name = '倍速切り替え';
            break;
        case 'eventSkip':
            name = 'イベント高速化の切り替え';
            break;
        case 'gainGold':
            name = 'ゴールド取得';
            break;
        case 'gainAllItems':
            name = '全アイテム取得';
            break;
        case 'levelMax':
            name = 'レベル最大';
            break;


        case 'script':
            name = command.param;
            if(name.length>20){
                name = name.substring(0,Math.min(20,name.length))+'…';
            }
            break;
        case 'input':
            name = command.param ? ('入力:'+command.param) : 'スクリプト入力';
            if(name.length>20){
                name = name.substring(0,Math.min(20,name.length))+'…';
            }
            break;
        case 'commonEvent':
            var commonEventId = Number(command.param);
            var commonEvent = $dataCommonEvents[commonEventId];
            name = commonEvent.name;
            break;
        }
    }
    return name;
}


//=============================================================================
// Window_TrpDevTools
//=============================================================================
function Window_TrpDevTools() {
    this.initialize(...arguments);
};
Window_TrpDevTools.prototype = Object.create(Window_TrpDevToolsBase.prototype);
Window_TrpDevTools.prototype.constructor = Window_TrpDevTools;

Window_TrpDevTools.prototype.initialize = function(){
    Window_TrpDevToolsBase.prototype.initialize.call(this);

    this.setHandler('animation', ()=>{
        this.close();
        TRP_CORE.AnimationViewer.start(0,null);
    });
    this.setHandler('se',()=>{
        TRP_CORE.SeEditor.start('',null);
        this.visible = false;
        this.close();
    });
    this.setHandler('particle', ()=>{
        TRP_CORE.ParticleViewer.start(null,true,false);
        this.visible = false;
        this.close();
    });
    this.setHandler('particleGroup', ()=>{
        TRP_CORE.ParticleViewer.start(null,true,true);
        this.visible = false;
        this.close();
    });
};

Window_TrpDevTools.prototype.commands = function(){
    var commands = [];
    if(PluginManager._scripts.contains('TRP_AnimationEx')){
        commands.push('animation');
    }
    if(PluginManager._scripts.contains('TRP_SEPicker')){
        commands.push('se');    
    }
    if(PluginManager._scripts.contains('TRP_ParticleMZ_ExViewer')){
        commands.push('particle');
        if(PluginManager._scripts.contains('TRP_ParticleMZ_Group')
            || PluginManager._scripts.contains('TRP_Particle_Group')
        ){
            commands.push('particleGroup');
        }
    }
    commands.push('cancel');

    return commands;
}
Window_TrpDevTools.COMMAND_NAMES = {
    animation:'アニメーションピッカー',
    se:'SEピッカー',
    particle:'パーティクルピッカー',
    particleGroup:'パーティクルグループピッカー',
    cancel:'キャンセル',
};
Window_TrpDevTools.prototype.commandNames = function(commands=this.commands()){
    var names = [];
    for(const command of commands){
        names.push(Window_TrpDevTools.COMMAND_NAMES[command]);
    }
    return names;
}




//=============================================================================
// TRP_CORE
//=============================================================================
TRP_CORE.doubleSpeed = false;
TRP_CORE.eventSkip = false;
TRP_CORE.devToolsDisabled = false;

TRP_CORE.isEventRunning = function(){
    if(TRP_CORE.showingToolsWindow)return false;
    return $gameParty.inBattle() ? $gameTroop.isEventRunning() : $gameMap.isEventRunning();
}
if(doubleSpeedEnabled||eventSkipEnabled)(()=>{
    SceneManager._trpSkipUpdateMain = false;
    if(isMZ){
        var _SceneManager_determineRepeatNumber = SceneManager.determineRepeatNumber;
        SceneManager.determineRepeatNumber = function(deltaTime) {
            var num = _SceneManager_determineRepeatNumber.call(this,deltaTime);
            if(TRP_CORE.eventSkip && TRP_CORE.isEventRunning()){
                num += (Number(parameters.skipRate)||1)-1;
            }else if(TRP_CORE.doubleSpeed){
                num += 1;
            }
            return num;
        };

        var _SceneManager_updateMain = SceneManager.updateMain;
        SceneManager.updateMain = function(){
            if(this._trpSkipUpdateMain)return;
            _SceneManager_updateMain.call(this,...arguments);
        }

        var _SceneManager_update = SceneManager.update;
        SceneManager.update = function(deltaTime) {
            this._trpSkipUpdateMain = false;
            _SceneManager_update.call(this,...arguments);
        };

    }else{
        var _SceneManager_updateScene = SceneManager.updateScene;
        SceneManager.updateScene = function() {
            _SceneManager_updateScene.call(this);

            if (this._scene && this.isCurrentSceneStarted()){
                var num = 0;
                if(TRP_CORE.eventSkip && TRP_CORE.isEventRunning()){
                    num += (Number(parameters.skipRate)||1)-1;
                }else if(TRP_CORE.doubleSpeed){
                    num += 1;
                }

                this._trpSkipUpdateMain = false;
                for(var i=0; i<num; i=(i+1)|0){
                    this.updateInputData();
                    this._scene.update();

                    if(SceneManager._trpSkipUpdateMain)break;
                }
            }
        };
    }
})();


if(eventSkipEnabled)(()=>{
    var _Window_ScrollText_isFastForward = Window_ScrollText.prototype.isFastForward;
    Window_ScrollText.prototype.isFastForward = function(){
        if ($gameMessage.scrollNoFast())return false;

        if(TRP_CORE.eventSkip && TRP_CORE.isEventRunning())return true;
        return _Window_ScrollText_isFastForward.call(this);
    };


    var _Window_Message_isTriggered = Window_Message.prototype.isTriggered;
    Window_Message.prototype.isTriggered = function() {
        if(TRP_CORE.eventSkip && TRP_CORE.isEventRunning()){
            return true;
        }
        return _Window_Message_isTriggered.call(this,...arguments);
    };
})();





})();