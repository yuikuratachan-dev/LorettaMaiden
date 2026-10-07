//=============================================================================
// TRP_ParticleMZ_ExViewer.js
//=============================================================================
/*:
 * @target MZ
 * @author Thirop
 * @plugindesc <開発用>パーティクルビューワ
 * @help
 * ※TRP_ParticleMZ_Editor、TRP_AnimationExより下に配置
 * パーティクル編集画面でプリセットまたはデータリストピッカーを表示時に
 * Ctrl(MacはCmd)+L(またはP)を押すことでパーティクルビューワを呼び出し。
 *
 * 左右（←→）キー：ページの切り替え
 * 上下（↑↓）キー：カテゴリー(表示対象)の切り替え
 * Escキー：キャンセル
 *
 *
 * 【パーティクルの表示範囲】
 * 各セルで表示されるパーティクルは、随時表示範囲を計測して
 * 拡大率、表示位置が調整されます。
 * また、表示範囲データはdata/DevTrpParticleViewer.jsonに保存されます。
 *
 * 【screen/weather対象】
 * screen/weather対象のパーティクルは、小さなセル範囲で見やすいように
 * 自動で「表示位置・範囲」「射出頻度」が調整されるため、実際のパーティクル
 * の動作・見え方と違います。
 *
 * 【動作パフォーマンス】
 * 多数のパーティクルを同時に表示するため、動作負荷は高めです。
 * 動作のカクつきがひどい場合はプラグイン設定よりパラメータを調整してください。
 * 
 * 
 *
 * 【更新履歴】
 * 1.0.0 <2022/07/24> 初版
 *
 *
 * @param maxParticles
 * @text パーティクル最大数制限
 * @desc ビューワで表示するパーティクルの最大数
 * @default 10000
 * @type number
 *
 * @param adjustInterval
 * @text 計測インターバル
 * @desc 表示範囲の計測間隔。小さい数値ほど負荷大
 * @default 4
 * @type number
 * @min 1
 *
 *
 */
//============================================================================= 


var $devParticleViewer = null;

var TRP_CORE = TRP_CORE || {};
(function(){
'use strict';

if (!Utils.isNwjs() || !Utils.isOptionValid('test')){
	return;
}

var pluginName = 'TRP_ParticleMZ_ExViewer';
var parameters = PluginManager.parameters(pluginName);

var AnimationViewer = TRP_CORE.AnimationViewer;

var AnimationPicker = ParticleEditor.AnimationPicker;
var PickerBase = ParticleEditor.PickerBase;
var PresetPicker = ParticleEditor.PresetPicker;
var LoadPicker = ParticleEditor.LoadPicker;
var ParticleParam = ParticleEditor.ParticleParam;
var GroupPresetPicker = ParticleEditor.GroupPresetPicker||null;
var GroupLoadPicker = ParticleEditor.GroupLoadPicker||null;
var KEY_CODE = ParticleParam.KEY_CODE;

var TARGET_TYPES = ParticleEmitter.TARGET_TYPES;

PresetPicker.prototype.onKeyDown = function(keyCode,event){
	if((keyCode===KEY_CODE.p||keyCode===KEY_CODE.l) && (event.ctrlKey||event.metaKey)){
		var isPreset = !(this instanceof ParticleEditor.LoadPicker);
		var isGroup = !(this.constructor===PresetPicker.prototype.constructor||this.constructor===LoadPicker.prototype.constructor);
		ParticleViewer.start(this,isPreset,isGroup);
	}else{
		PickerBase.prototype.onKeyDown.call(this,...arguments);
	}
};


//supply group pickers
if(window['$dataTrpParticleGroupsPreset'] && !GroupPresetPicker){
	GroupPresetPicker = function GroupPresetPicker(){
	    this.initialize.apply(this, arguments);
	};
	GroupPresetPicker.prototype = Object.create(ParticleEditor.PresetPicker.prototype);
	GroupPresetPicker.prototype.constructor = GroupPresetPicker;
	GroupPresetPicker.prototype.rawData = function(){
		return $dataTrpParticleGroupsPreset;
	};	
}
if(window['$dataTrpParticleGroups'] && !GroupLoadPicker){
	GroupLoadPicker = function GroupLoadPicker(){
	    this.initialize.apply(this, arguments);
	};
	GroupLoadPicker.prototype = Object.create(ParticleEditor.LoadPicker.prototype);
	GroupLoadPicker.prototype.constructor = GroupLoadPicker;
	GroupLoadPicker.prototype.rawData = function(){
		return $dataTrpParticleGroups;
	};
}



//=============================================================================
// ParticleViewer
//=============================================================================
var ParticleViewer = TRP_CORE.ParticleViewer = function ParticleViewer(){
    this.initialize.apply(this, arguments);
}

ParticleViewer.DIR_PATH = 'dataEx/'
ParticleViewer.FILE_PATH = ParticleViewer.DIR_PATH+'TRPParticleExViewer.json';


(function(){
	"use strict";

    var fs = require('fs');
	var path = require('path');
    var base = path.dirname(process.mainModule.filename);

    var dirPath = path.join(base, ParticleViewer.DIR_PATH);
    if(!fs.existsSync(dirPath)){
    	fs.mkdirSync(dirPath);
    }

    var filePath = path.join(base, ParticleViewer.FILE_PATH);
    if(!fs.existsSync(filePath)){
    	var file = '{}';
    	fs.writeFileSync(filePath,file);
    }

    $devParticleViewer = JSON.parse(fs.readFileSync(filePath,{encoding:'utf8'}));
})();


ParticleViewer.start = function(picker,isPreset=false,isGroup=false){
	if(!picker){
		if(isGroup){
			picker = new GroupPresetPicker();
		}else{
			picker = new PresetPicker();
		}
		picker.startPicking(this,0,null);
	}

	var instance = new ParticleViewer();
	SceneManager._scene.addChild(instance);
	instance.start(picker,isPreset,isGroup);

    var update = SceneManager._scene.update;
	SceneManager._scene.update = function(){
		if(!instance.update()){
			instance.terminate();
			SceneManager._scene.update = update;
		}
	};
};

//dummy funcs for picker owner
ParticleViewer.applyData = function(){};
ParticleViewer.didEndPicking = function(){};


ParticleViewer.prototype = Object.create(AnimationViewer.prototype);
ParticleViewer.prototype.constructor = ParticleViewer;
ParticleViewer.prototype.initialize = function() {
    PIXI.Container.call(this);
    this.initMembers();

    this._completion = null;
    this._data = null;

    this.width = Graphics.width;
    this.height = Graphics.height;

    this._backSprite = new Sprite(new Bitmap(Graphics.width,Graphics.height));
    this._backSprite.bitmap.fillAll('black');
    this.addChild(this._backSprite);

    this.setupGuide();
};

ParticleViewer.prototype.initMembers = function(){
	AnimationViewer.prototype.initMembers.call(this);
	this._picker = null;

	this._srcPicker = null;
	this._oppositePicker = null;
	this._oppositeMode = false;

	this._particleCache = null;
	this._particleSystem = null;
	this._isGroup = false;
	this._isPreset = false;
	this._systemParticlesCache = null;
	this._headerSprite = null;

	this._groupDataCache = null;

	this._dataSet = null;
	this._cells = [];
	this._names = [];
	this._ids = [];
	this._count = 0;
};

ParticleViewer.prototype.start = function(picker,isPreset=false,isGroup=false){
	var setting = this.setting();
	setting.sizeW = (Graphics.width-(setting.maxCols-1)*AnimationViewer.MARGIN)/setting.maxCols;
	setting.sizeH = (Graphics.height-(setting.maxRows-1)*AnimationViewer.MARGIN-(setting.maxRows*AnimationViewer.FOOTER_HEIGHT))/setting.maxRows;

	this._picker = picker;
	this._srcPicker = picker;
	this._particle = $gameScreen._particle;
	this._isGroup = isGroup;
	this._isPreset = isPreset;

	this._systemParticlesCache = ParticleSystem.systemParticles;
	ParticleSystem.systemParticles = [];

	this._headerSprite = picker._headerSprite;
	this.addChild(this._headerSprite);

	$gameScreen._particle = new Game_Particle();
	this._particleSystem = new ParticleSystem();

	if($gameScreen._particle.particleGroupSet){
		this._groupDataCache = ParticleGroup.prototype.data;
		ParticleGroup.prototype.data = function(){
			if(!this._data){
				var data = Game_Particle.groupData(this);
				var list = data.list.concat();
				for(var i=list.length-1; i>=0; i=(i-1)|0){
					var command = list[i];
					var args = command.split(' ');
					ParticleGroup.processParticleSubCommand(args);
					if(args[0]==='set'||args[0]==='play'||args[0]==='edit'){
						args[2] = 'target';
						if(args[4])args[4] = 'def';

						command = '';
						for(const arg of args){
							command = (command?command+' ':command) + arg;
						}
						list[i] = command;
					}
				}
				this._data = {
					repeat:data.repeat,
					list:list,
					targetType:data.targetType,
					comment:data.comment
				};
			}
			return this._data;
		};
	}


	$gameScreen._particle.maxParticles = Number(parameters.maxParticles)||10000;

	this.setupData(picker);

	AnimationViewer.prototype.start.call(this,picker,-1);
};

ParticleViewer.prototype.terminate = function() {
	this.clearAllParticles();

	$gameScreen._particle = this._particle;
	ParticleSystem.systemParticles = this._systemParticlesCache;

	this._picker.addChild(this._headerSprite);
	this._headerSprite = null;

	if(this._groupDataCache){
		ParticleGroup.prototype.data = this._groupDataCache;
		this._groupDataCache = null;
	}

	this._particle = null;
	this._particleSystem = null;
	this._picker = null;
	this._oppositePicker = null;
	this._srcPicker = null;
	this._systemParticlesCache = null;

	AnimationViewer.prototype.terminate.call(this);


	var file = JSON.stringify($devParticleViewer);

    var fs = require('fs');
	var path = require('path');
    var base = path.dirname(process.mainModule.filename);
	var filePath = path.join(base, ParticleViewer.FILE_PATH);
    fs.writeFileSync(filePath, file);
};

ParticleViewer.prototype.dataSet = function(){
	return this._dataSet;
};


ParticleViewer.prototype.setupData = function(picker=this._picker){
	var names = picker._allNames[picker._categoryIndex];

	this._dataSet = picker.allData()[picker._categoryIndex];
	this._data = names;

	this._animationIndex = 0;

};

ParticleViewer.GUIDE_DISPLAY_SETTING = [
	'カーソル←→：ページ切り替え',
	'カーソル↑↓：対象切り替え',
	'Shift：プリセット<->自作データ',
	'Enter/Esc：終了',
	null,
	'G：ガイドを隠す'
];
ParticleViewer.prototype.guideTexts = function(){
	return ParticleViewer.GUIDE_DISPLAY_SETTING;
}

ParticleViewer.prototype.update = function(){
	$gameScreen._particle.update();
	this._particleSystem.update(SceneManager._scene);

	this._count += 1;
	var interval = Number(parameters.adjustInterval)||1;
	var surplus = this._count%interval;

	var length = this._names.length;
	for(var i=0; i<length; i=(i+1)|0){
		if(i%interval===surplus && this._names[i]){
			this.adjustRange(i);
		}
	}
	// this.adjustRange(this._count%this._names.length);
	this.updateHeaderSprite();


	if(TouchInput.isCancelled()){
		this.processPageUp();
	}

	return AnimationViewer.prototype.update.call(this);
};
ParticleViewer.prototype.updateHeaderSprite = PickerBase.prototype.updateHeaderSprite;

ParticleViewer.prototype.didSelect = function(idx){
	if(!this._data[idx])return;

	var name = this._data[idx];
	copyToClipboard(name);

	this._picker.didPickData(idx);
	this._quit = true;
	TouchInput.clear();
};

function copyToClipboard(text){
	var listener = function(e){
		e.clipboardData.setData('text/plain' , text);
		e.preventDefault();
		document.removeEventListener('copy', listener);
	}
	document.addEventListener('copy' , listener);
	document.execCommand('copy');
};


ParticleViewer.prototype.updateInput = function(){
	if(Input.isTriggered('shift')){
		this.switchMode();
	}else if(Input.isTriggered('left')||Input.isTriggered('pageup')){
		this.decreeseIndex();
		SoundManager.playCursor();
	}else if(Input.isTriggered('right')||Input.isTriggered('pagedown')){
		this.exceedIndex();
		SoundManager.playCursor();
	}else if(Input.isTriggered('up')){
		this.processPageDown();
	}else if(Input.isTriggered('down')){
		this.processPageUp();
	}else{
		AnimationViewer.prototype.updateInput.call(this);
	}
};
ParticleViewer.prototype.switchMode = function(){
	this._oppositeMode = !this._oppositeMode;
	this._isPreset = !this._isPreset;

	this._picker.addChild(this._picker._headerSprite);
	this._headerSprite = null;

	var picker;
	if(this._oppositeMode){
		if(!this._oppositePicker){
			if(this._isGroup){
			 	if(this._isPreset){
			 		picker = new GroupPresetPicker();
			 	}else{
			 		picker = new GroupLoadPicker();
			 	}
			}else{
			 	if(this._isPreset){
			 		picker = new PresetPicker();
			 	}else{
			 		picker = new LoadPicker();
			 	}
			}
			picker.startPicking();
			this._oppositePicker = picker;
			picker._owner = this._srcPicker._owner;
		}
		picker = this._oppositePicker;
	}else{
		picker = this._srcPicker;
	}

	this._picker = picker;
	this._headerSprite = picker._headerSprite;
	this.addChild(this._headerSprite);

	this.setupData();
	this.refresh();
	SoundManager.playCursor();
}

ParticleViewer.prototype.processPageDown = function(){
	this._picker.processPageDown();
	this.setupData();
	this.refresh();
};
ParticleViewer.prototype.processPageUp = function(){
	this._picker.processPageUp();
	this.setupData();
	this.refresh();
};
ParticleViewer.prototype.particleTargetId = function(id){
	return this._isGroup ? ('group:'+id) : id;
}

ParticleViewer.prototype.clearAllParticles = function(){
	for(const id of this._ids){
		if(id===undefined)continue;
		$gameScreen._particle.particleClear(this.particleTargetId(id),true);
	}
	this._names.length = 0;
	this._ids.length = 0;

	this._particleSystem.update(SceneManager._scene);
	$gameScreen._particle.update();
};

ParticleViewer.prototype.refresh = function(){
	this.clearAllParticles();

	var contents = this._backSprite.bitmap;
    contents.clear();
    contents.fillAll('rgb(20,20,20)');

    var num = 0;
    var data = this._data;

    var length = data.length;
    var setting = this.setting();
    var maxNum = setting.maxRows*setting.maxCols;
    var i = this._animationIndex;


    var nameHeight = AnimationViewer.FOOTER_HEIGHT;
    var margin = AnimationViewer.MARGIN;
    var sizeW = setting.sizeW;
    var sizeH = setting.sizeH;
    var scale = setting.scale;
    	
    var dataSet = this.dataSet();
    var target = this._backSprite;
    var idPrefix = this._group ? 'GR_' : '';
    idPrefix += this._isPreset ? 'PR_' : '';
	var trimR = ParticleViewer.SCREEN_TRIM_R;
    for(; num<maxNum && i<length; i=(i+1)|0){
	    var name = data[i];
	    var config = dataSet[i];
	    if(!config){
	    	continue;
	    };
	    if(Array.isArray(config)){
	    	config = dataSet[i] = Game_Particle.decompressConfigDataFromArray(config)
	    }

	    var targetType = config.targetType;
	    if(this._isGroup){
	    	var list = config.list;
	    	config = null;

	    	for(const command of list){
				var args = command.split(' ');
				ParticleGroup.processParticleSubCommand(args);
				if(args[0]==='set'||args[0]==='play'||args[0]==='edit'){
					var subId = args[1];
					var replacedName = name.replace('/h','');
					if(/^_auto:[0-9]+$/.test(subId)){
						subId += ':'+replacedName+'/h';
					}
					var subName = (args[3]&&args[3]!=='def') ? args[3] : subId;
					config = $dataTrpParticles[subName]||$dataTrpParticlePreset[subName];
					if(Array.isArray(config)){
				    	config = Game_Particle.decompressConfigDataFromArray(config)
				    	if($dataTrpParticles[subName]){
				    		$dataTrpParticles[subName] = config;
				    	}else{
				    		$dataTrpParticlePreset[subName] = config
				    	}
				    }
					break;
				}
			}
	    }
	    if(!config)continue;


	    var id = idPrefix+name;
	    this._names[num] = name;
	    this._ids[num] = id;

	    
        var x = margin+(sizeW+margin)*(num%setting.maxCols);
        var y = margin+(sizeH+nameHeight)*Math.floor(num/setting.maxCols);

        /* draw name
		===================================*/
	    contents.fontSize = 20;
	    contents.textColor = 'white';
	    contents.drawText(name,x,y+sizeH,sizeW,nameHeight);

	    /* cell sprites
		===================================*/
		var cell = this._cells[num];
        if(!cell){
        	cell = new PIXI.Container();
        	this.addChild(cell);
        	this._cells[num] = cell;
        	cell.x = x+sizeW/2;
			cell.y = y+sizeH/2;

	        var bg = new PIXI.Graphics();
	        cell.addChild(bg);

	        var parent = new PIXI.Container();
	        cell.addChild(parent);

        	var target = new PIXI.Container();
        	parent.addChild(target);

	        var mask = new PIXI.Graphics();
	        cell.addChild(mask);
	        cell.mask = mask;
		    mask.beginFill(0xffffff)
		    	.drawRect(-sizeW/2,-sizeH/2,sizeW,sizeH)
		    	.endFill();
		}
		cell.visible = true;

		var bg = cell.children[0];
		bg.clear();
	    bg.beginFill(config.blendMode==="MULTIPLY" ? 0xaaaaaa : 0x000000)
	    	.drawRect(-sizeW/2,-sizeH/2,sizeW,sizeH)
	    	.endFill();


    	var forScreen = false;
    	var half = false;
	    $devParticleViewer[id] = $devParticleViewer[id]||{
    		x0:Number.MAX_SAFE_INTEGER,
    		y0:Number.MAX_SAFE_INTEGER,
    		x1:Number.MIN_SAFE_INTEGER,
    		y1:Number.MIN_SAFE_INTEGER,
    		x:0,
    		y:0,
    		scale:1,
    		half:this._isGroup?false:half,
    		forScreen:forScreen,
    	};
    	var dispSetting = $devParticleViewer[id];

    	var parent = cell.children[1];
    	var target = parent.children[0];
    	if(this._isGroup){
    		$gameScreen._particle.particleGroupSet(0,id,target,null,name);
    	}else{
    		$gameScreen._particle.particleSet(0,id,target,name);
    	}

    	id = this.particleTargetId(id);
    	var commandDelay = this._isGroup ? 2 : 0;

    	parent.x = dispSetting.x;
		parent.y = dispSetting.y;
		parent.scale.x = parent.scale.y = dispSetting.scale;

		switch(targetType){
		case TARGET_TYPES.weather:
		case TARGET_TYPES.screen:
		case TARGET_TYPES.battle:
		case TARGET_TYPES.battleWeather:
			half = false;
			forScreen = true;
			if(!this._isGroup){
				switch(config.spawnType){
				case 'rect':
					half = true;
					// $gameScreen._particle.particleUpdate([id,'rect',trimR*config.spawnRect.x,trimR*config.spawnRect.y,trimR*config.spawnRect.w,trimR*config.spawnRect.h]);
					$gameScreen._particle.reservePluginCommand(commandDelay,null,[
						'update',id,'rect',trimR*config.spawnRect.x,trimR*config.spawnRect.y,trimR*config.spawnRect.w,trimR*config.spawnRect.h
					]);
					break;
				case 'circle':
					half = true;
					// $gameScreen._particle.particleUpdate([id,'circle',trimR*config.spawnCircle.x,trimR*config.spawnCircle.y,trimR*config.spawnCircle.r]);
					$gameScreen._particle.reservePluginCommand(commandDelay,null,[
						'update',id,'circle',trimR*config.spawnCircle.x,trimR*config.spawnCircle.y,trimR*config.spawnCircle.r
					]);
					break;
				}
			}

			dispSetting.forScreen = forScreen;
			dispSetting.half = half;
		}

    	if(half){
    		$gameScreen._particle.reservePluginCommand(commandDelay,null,[
    			'update',id,'frequency',config.frequency/Math.pow(trimR,1.5)
    		]);
			// $gameScreen._particle.particleUpdate([id,'frequency',config.frequency/Math.pow(trimR,1.5)]);
			if($gameScreen._particle.maxParticles<config.maxParticles){
				$gameScreen._particle.reservePluginCommand(commandDelay,null,[
	    			'update',id,'maxParticles',config.maxParticles*trimR
	    		]);
				// $gameScreen._particle.particleUpdate([id,'maxParticles',config.maxParticles*trimR]);
			}
			if(config.pos.x||config.pos.y){
				// $gameScreen._particle.particleUpdate([id,'pos',trimR*config.pos.x,trimR*config.pos.x]);
				$gameScreen._particle.reservePluginCommand(commandDelay,null,[
	    			'update',id,'pos',trimR*config.pos.x,trimR*config.pos.x
	    		]);
			}
		}
		if(config.emitterLifetime<0){
			/* update to balance
			===================================*/
			var freq = config.frequency;
			var spawnChance = config.spawnChance;
			if(freq/spawnChance > config.lifetime.min){
				$gameScreen._particle.reservePluginCommand(commandDelay,null,[
					'update',id,'spawnChance',1
				]);
				// $gameScreen._particle.particleUpdate([id,'spawnChance',1]);
				$gameScreen._particle.reservePluginCommand(commandDelay,null,[
					'update',id,'frequency',config.lifetime.min
				]);
				// $gameScreen._particle.particleUpdate([id,'frequency',config.lifetime.max]);
				freq = config.lifetime.max;
				spawnChance = 1;
			}else{
				var spawnAt = freq/spawnChance;
				var time = spawnAt + config.lifetime.max;
				// $gameScreen._particle.particleExceed(id,time);
				$gameScreen._particle.reservePluginCommand(commandDelay+2,null,[
	    			'exceed',id,time
	    		]);
			}
		}
	    num+=1;
    }
    for(; num<maxNum; num=(num+1)|0){
		var cell = this._cells[num];
		if(cell){
			cell.visible = false;
		}
	}

    this.addChild(this._headerSprite);
    this.addChild(this._guideSprite);
};

ParticleViewer.SCREEN_TRIM_R = 0.3;
ParticleViewer.prototype.adjustRange = function(idx){
	var name = this._names[idx];

	var id = this._ids[idx];
	var targetId = this.particleTargetId(id);

	var config = this.dataSet()[this._data.indexOf(name)];

	if(!this._isGroup){
		if(config.emitterLifetime>0){
			$gameScreen._particle.particleOn(targetId);
		}
	}else if(!$gameScreen._particle._groups[id]){

		var targets = $gameScreen._particle.targetIds('group:'+id);
		if(targets.length===0){
			var cell = this._cells[idx];
			var parent = cell.children[1];
	    	var target = parent.children[0];
			$gameScreen._particle.particleGroupSet(0,id,target,null,name);
		}
	}

	var dispSetting = $devParticleViewer[id];
	var ids = $gameScreen._particle.targetIds(targetId);

	for(var i=ids.length-1; i>=0; i=(i-1)|0){
		this._adjustRange(idx,name,config,dispSetting,ids[i]);
	}
};

ParticleViewer.prototype._adjustRange = function(idx,name,config,dispSetting,id){
	var emitter = this._particleSystem._emitters[id];
	if(!emitter)return;

	var x0 = dispSetting.x0;
	var y0 = dispSetting.y0;
	var x1 = dispSetting.x1;
	var y1 = dispSetting.y1;

	// var data = $gameScreen._particle._data[id];
	// var name = data.name;
	// var config = (this._isPreset&&!this._isGroup) ? $dataTrpParticlePreset[name] : ($dataTrpParticles[name]||$dataTrpParticlePreset[name]);

	var parent = this._cells[idx].children[1];
	var container = emitter._container;
	var children = container.children;

	var s = parent.scale.x;
	var maxAlpha = 0;
	for(var i=children.length-1; i>=0; i=(i-1)|0){
		maxAlpha = Math.max(children[i].alpha,maxAlpha);
	}
	for(var i=children.length-1; i>=0; i=(i-1)|0){
		var child = children[i];
		if(child.alpha<maxAlpha*0.2)continue;

		if(child.x-child.width/2<x0){
			x0 = child.x-child.width/2;
		}
		if(child.x+child.width/2>x1){
			x1 = child.x+child.width/2;
		}
		if(child.y-child.height/2<y0){
			y0 = child.y-child.height/2;
		}
		if(child.y+child.height/2>y1){
			y1 = child.y+child.height/2;
		}
	}

	if(dispSetting.forScreen){
		var trimR = dispSetting.half ? ParticleViewer.SCREEN_TRIM_R : 1;
		var sh = 1.0*Graphics.height/2*trimR;
		var sw = 1.0*Graphics.width/2*trimR;
		x0 = x0.clamp(-sw,sw);
		x1 = x1.clamp(-sw,sw);
		y0 = y0.clamp(-sh,sh);
		y1 = y1.clamp(-sh,sh);
	}

	if(x0===dispSetting.x0 && x1===dispSetting.x1
		&& y0===dispSetting.y0 && y1===dispSetting.y1)
	{
		return;
	}

	var setting = this.setting();
	var sizeW = setting.sizeW;
	var sizeH = setting.sizeH;
	var w = (x1-x0);
	var h = (y1-y0);

	var changed = false;
	if(s*w>sizeW || s*h>sizeH){
		w *= 1.1;
		h *= 1.1;
		s = Math.min(sizeW/(w||1), sizeH/(h||1));
		parent.scale.set(s,s);
	}
	parent.x = -s*Math.floor((x0+x1)/2);
	parent.y = -s*Math.floor((y0+y1)/2);

	dispSetting.x0 = x0;
	dispSetting.x1 = x1;
	dispSetting.y0 = y0;
	dispSetting.y1 = y1;
	dispSetting.x = parent.x;
	dispSetting.y = parent.y;
	dispSetting.scale = parent.scale.x;
};




})();