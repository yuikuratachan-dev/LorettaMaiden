//=============================================================================
// TRP_CommandManager.js
//=============================================================================
/*:
 * @author Thirop
 * @plugindesc 独自形式のコマンド引数を導入
 * @target MZ
 * @help
 * 【更新履歴】
 * 1.0.0 初版(TRP_MoveRouteEx用)
 *
 * @param disableMetaParameters
 * @text \MT制御文字を無効化
 * @desc ONにすると制御文字\MT[メタ名]でのメタパラメータの使用を無効化。（競合対策用）
 * @default false
 * @type boolean
 */
//============================================================================= 



// Utilities



function TRP_CommandManager(){};

(function(){
'use strict';

var pluginName = 'TRP_CommandManager';
var parameters = PluginManager.parameters(pluginName);
var disableMetaParameters = parameters.disableMetaParameters==='true';



TRP_CommandManager.COMMANDS = {};
TRP_CommandManager.COMMAND_MAP = {};
TRP_CommandManager.register = function(name,defaults,process,map=null,keys=null){
	this.COMMANDS[name.toLowerCase()] = {
		defaults,
		map,
		keys,
		process
	};
};
TRP_CommandManager.registerCommandMap = function(name,original){
	this.COMMAND_MAP[name] = original;
};

TRP_CommandManager.commandData = function(command){
	command = command.toLowerCase();
	command = TRP_CommandManager.COMMAND_MAP[command] || command;

	var commandData = this.COMMANDS[command];
	if(!commandData){
		return null;
	}

	if(!commandData.keys && commandData.defaults){
		commandData.keys = Object.keys(commandData.defaults);
	}

	return commandData;
};

TRP_CommandManager.makeCommand = function(command,args,commandSeparator=' ',splitter=' ',tailFix='',minimize=false){
	var ret = '';

	var commandData = this.commandData(command);
	if(commandData.defaults){
		var defaults = commandData.defaults;
		var keys = commandData.keys;

		var length = keys.length;
		var argsLen = args.length;
		var isBelowDefault = true;
		for(var i=length-1; i>=0; i=(i-1)|0){
			var key = keys[i];

			var value = i<argsLen ? args[i] : defaults[key];

			if(value===defaults[key]){
				if(isBelowDefault){
					continue;
				}
			}
			isBelowDefault = false;
			
			if(minimize){
				ret = value+ret;
			}else{
				ret = key+':'+value + ret;
			}

			if(i===0){
				ret = commandSeparator+ret;
			}else{
				ret = splitter+ret;
			}
	    }
	}

	ret = command+ret;

	return ret;
};






//=============================================================================
// process
//=============================================================================
TRP_CommandManager.process = function(orgArgs,subject=null){
	var command = orgArgs.shift();
	var commandData = this.commandData(command);
	if(!commandData){
		throw new Error('command not found:'+command+', args:'+args,', subject:'+(subject?(subject.name?subject.name():(subject.data?subject.data().name:null)):null));
		return true;
	}

	var defaults,map,keys;
	var args = orgArgs;
	if(commandData.defaults){
		args = this.reorderKeyValueArgs(
			orgArgs,commandData.defaults,
			commandData.map,
			commandData.keys,
			subject
		);
	}

	//return quitFlag
	return commandData.process(args,subject,orgArgs)||false;
};


TRP_CommandManager.reorderKeyValueArgs = function(elems,defaults,map=null,keys=Object.keys(defaults),subject){
	var ret = [];

	var keyLen = keys.length;
    for(var i = 0; i<keyLen; i=(i+1)|0){
        ret[i] = defaults[keys[i]];
    }

    var meta = null;
    if(!disableMetaParameters && subject){
    	var data = this.subjectData(subject);
    	meta = data ? (data.meta||null) : null;
    }

	var elemLen = elems.length;
	var keyIdx = 0;
	for(var elem of elems){
		if(map && map[elem]){
			elem = map[elem];
		}

		var index = elem.indexOf(':');
		if(index<=0){
			//noKeyValue > inArrOrder
			if(keys.contains(elem)){
				//flag
				index = elem.length;
				elem += ':true';
			}else{
				ret[keyIdx] = this.convertValue(elem,defaults[keys[keyIdx]],subject,meta);
				keyIdx += 1;
				continue;
			}
		}

		var key = elem.substring(0,index);
		if(map && map[key]){
			key = map[key];
		}

		var order = keys.indexOf(key)
		if(order<0){
			//no key match > inArrOrder
			ret[keyIdx] = this.convertValue(elem,defaults[keys[keyIdx]],subject,meta);
			keyIdx += 1;
			continue;
		}

		//key match with order
		var valueStr = elem.substring(index+1);
		ret[order] = this.convertValue(valueStr,defaults[key],subject,meta);

		if(order===keyIdx){
			keyIdx += 1;
		}
	}

	return ret;
};

TRP_CommandManager.convertValue = function(value,defaultValue,subject=null,meta=null){
	if(/(?:\\)|(?:\x1b)/.test(value)){
		value = this.convertEscapeCharacters(value,subject,meta);
	}

	if(value==='def' || value==='d'){
		return defaultValue;
	}

	switch(typeof defaultValue){
	case 'boolean':
		if(value==='f'||value==='false'||value==='0'||value==='off'){
			return false;
		}else{
			return true;
		}
	case 'number':
		return Number(value);
	default:
		return value;
	}
};

TRP_CommandManager.convertEscapeCharacters = function(text,subject=null,meta=null){
    text = text.replace(/\\/g, "\x1b");
    text = text.replace(/\x1b\x1b/g, "\\");

    //Meta
    if(!!meta){
	    text = text.replace(/\x1b(?:MT|ME)\[([a-zA-Z0-9]+)(?:@([a-zA-Z0-9]+))?\]/gi, (_, p1, p2) =>
	    	(meta[p1]!==undefined ? meta[p1] : p2)
	    );
    }

    //variable x2
    text = text.replace(/\x1bV\[(\d+)\]/gi, (_, p1) =>
        $gameVariables.value(parseInt(p1))
    );
    text = text.replace(/\x1bV\[(\d+)\]/gi, (_, p1) =>
        $gameVariables.value(parseInt(p1))
    );

    //random
    text = text.replace(/\x1b(?:RN|RD)\[([\-0-9\.]+)(?:,([\-0-9\.]+))?\]/gi, (_, p1,p2) => {
    	if(p2){
    		if(p1.contains('.')||p2.contains('.')){
    			return (Number(p1)+Math.random()*(Number(p2)-Number(p1)))||0;
    		}else{
    			return (Number(p1)+Math.randomInt(Number(p2)-Number(p1)+1))||0;
    		}
    	}else{
    		if(p1.contains('.')){
    			return (Number(p1)*Math.random())||0;
    		}else{
    			return (Math.randomInt(Number(p1)+1))||0;
    		}
    	}
    });

    //switch
    text = text.replace(/\x1bSW\[([0-9]+)\]/gi, (_, p1) =>
    	$gameSwitches.value(Number(p1))
    );
    //self switch
    if(!!subject && (subject instanceof Game_Event)){
	    text = text.replace(/\x1bSS\[([a-zA-Z0-9]+)\]/gi, (_, p1) =>
	    	$gameSelfSwitches.value([subject._mapId,subject._eventId,p1])
	    );
    }

    //eventId
    text = text.replace(/\x1bEID/gi, 
    	subject instanceof Game_Event ? subject._eventId : 0
    );
    text = text.replace(/\x1bCID/gi, 
    	TRP_CommandManager.characterId(subject)
    );


    // text = text.replace(/\x1bN\[(\d+)\]/gi, (_, p1) =>
    //     this.actorName(parseInt(p1))
    // );
    // text = text.replace(/\x1bP\[(\d+)\]/gi, (_, p1) =>
    //     this.partyMemberName(parseInt(p1))
    // );


    // text = text.replace(/\x1bG/gi, TextManager.currencyUnit);
    return text;
};
TRP_CommandManager.actorName = Window_Base.prototype.actorName;
TRP_CommandManager.partyMemberName = Window_Base.prototype.partyMemberName;





//=============================================================================
// Utilities
//=============================================================================
TRP_CommandManager.metaParameter = function(subject,key,opt=false){
	var data = this.subjectData(subject);
	if(!data || !data.meta){
		return opt;
	}
	if(data.meta[key]===undefined){
		return opt;
	}else{
		return data.meta[key];
	}
};
TRP_CommandManager.subjectData = function(subject){
	if(subject === $gamePlayer){
		var actor = $gameParty.leader();
		if(actor instanceof Game_Actor){
			return actor.actor();
		}
	}else if(subject instanceof Game_Event){
		return subject.event();
	}else if(subject instanceof Game_Follower){
		var actor = subject.actor();
		if(actor instanceof Game_Actor){
			return actor.actor();
		}
	}else if(subject instanceof Game_Actor){
		return subject.actor();
	}else if(subject instanceof Game_Enemy){
		return subject.enemy();
	}
	return null;
};
TRP_CommandManager.characterId = function(subject){
	if(subject === $gamePlayer)return 0;
	if(subject instanceof Game_Event) return subject._eventId;
	if(subject instanceof Game_Follower) return -subject._memberIndex;

	return 0;
};



})();