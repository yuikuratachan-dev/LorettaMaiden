//=============================================================================
// TRP_MoveRouteEx.js
//=============================================================================
/*:
 * @author Thirop
 * @target MZ
 * @base TRP_CommandManager
 * @plugindesc 移動ルートのコマンド形式入力
 * @help
 * 【更新履歴】
 * 0.0.1 <2021/12/23> 初版(TRP_AnimationEx用)
 *
 *
 * @param commands
 * @text 登録済みコマンド名
 * @desc ここで登録したコマンドは「cmd」を抜かして実行可能。カンマ(,)つなぎで複数指定
 * @default animation
 */
//============================================================================= 

(function(){
'use strict';

var pluginName = 'TRP_MoveRouteEx';
var parameters = PluginManager.parameters(pluginName);
var commands = (parameters.commands||'').split(',');

//=============================================================================
// Game_Character
//=============================================================================
Game_Character.isTrpMoveRouteScriptCommand = function(command){
    var param = command.parameters[0].trim();
    var idx = param.indexOf(' ');
    if(idx <= 0)return false;

    var name = param.substring(0,idx);
    if(name==='cmd' || commands.contains(name)){
        return true;
    }

    return false;
};


var _Game_Character_processMoveCommand = Game_Character.prototype.processMoveCommand;
Game_Character.prototype.processMoveCommand = function(command) {
    if(command.code===Game_Character.ROUTE_SCRIPT && Game_Character.isTrpMoveRouteScriptCommand(command)){
        this.processTrpRouteCommand(command.parameters[0]);
    }else{
        _Game_Character_processMoveCommand.call(this,command);
    }
};

Game_Character.prototype.processTrpRouteCommand = function(params){
    var commentIdx = params.indexOf('//');
    if(commentIdx>=0){
        params = params.substring(0,commentIdx);
    }

    //trim side space
    params = params.trim();

    var commands = params.split(/ *; */)
    var length = commands.length;
    var value;

    var goNext = false;
    for(var i = 0; i<length; i=(i+1)|0){
        params = commands[i].split(' ');
        
        if(params[0]==='cmd'){
            params.shift();
        }

        if(!params[0])continue;
        params[0] = 'mr_'+params[0];

        if(params[params.length-1]==='@'||params[params.length-1]==='＠'){
            goNext = true;
            params.pop();
        }

        if(TRP_CommandManager.process(params,this)){
            break;
        }
    }

    if(goNext){
        this.processTrpRouteNext();
    }
};


})();