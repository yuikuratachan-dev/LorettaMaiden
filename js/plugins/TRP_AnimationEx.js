//=============================================================================
// TRP_AnimationEx.js
//=============================================================================
/*:
 * @author Thirop
 * @target MZ
 * @plugindesc アニメーション拡張&表示調整
 * @base TRP_CommandManager
 * @orderAfter TRP_CommandManager
 * @help
 * ※TRP_CommandManager.jsの下に導入してください
 *
 * [アセット登録について]
 * プラグイン設定「アセット登録」をONにすることで、
 * アニメーション編集完了時に、使用するSE/画像を「TRP_PluginAsset.js」
 * プラグインにアセットとして自動で登録します。
 * 
 * 生成される「TRP_PluginAsset.js」をプラグインとして導入することで
 * 登録したアセットはデプロイメント時に「未使用ファイル」として除外されなくなります。
 *  
 *
 * 【更新履歴】
 * 1.0.7 <2023/12/11> パラメータに「z:8」などでz値が変更可能。
 * 1.0.4 <2022/08/05> MZ形式の通常表示時にSEが再生されない不具合修正
 *                    ピッカーに最後のIDのデータが表示されない不具合修正
 * 1.0.3 <2022/07/25> TRP_PluginAssets対応
 * 1.0.2 <2022/01/08> 移動ルート拡張対応
 * 1.0.0 <2021/12/23> 初版
 *
 *
 * @param categoryViewer
 * @text 【Viewer設定】
 * @desc （このパラメータはカテゴリ整理用のダミーです）
 *
 * @param maxCols
 * @text 列数
 * @desc ビューワに表示するアニメーションの列数
 * @default 5
 * @type number
 * @parent categoryViewer
 *
 * @param maxRows
 * @text 行数
 * @desc ビューワに表示するアニメーションの行数
 * @default 4
 * @type number
 * @parent categoryViewer
 *
 * @param scale
 * @text 拡大率(MZ)
 * @desc ビューワに表示するエフェクシア形式アニメーションの拡大率(%)
 * @default 25
 * @type number
 * @parent categoryViewer
 *
 * @param delay
 * @text 再生ループ間隔
 * @desc ビューワで再生するアニメーションのループ間のフレーム数
 * @default 10
 * @min 1
 * @type number
 * @parent categoryViewer
 *
 *
 * @param registerAsset
 * @text アセット登録
 * @desc ONにすると、調整終了時にアニメーションで使用する画像/SEをアセットとしてこのプラグイン(.js)に記録
 * @default true
 * @type boolean
 *
 *
 * @command show
 * @text アニメーション表示
 * @desc MV形式のコマンドを実行します。調整する時はコマンドそのままでOK。調整完了後にコマンド引数にペースト
 * 
 * @arg command
 * @text コマンド
 * @desc MV形式コマンド。対象は「this」の他に「player」「event:イベントID」など。最後にeditで調整モード。
 * @type string
 * @default animation this edit
 *
 *
 */
//============================================================================= 



// Game_Interpreter
// Game_Temp
// Game_Character

// Spriteset_Base
// Sprite_AnimationTrpEx
// Sprite_AnimationMVTrpEx

// AnimationEditor
// AnimationViewer


var TRP_CORE = TRP_CORE || {};

(function(){
'use strict';


var isMZ = Utils.RPGMAKER_NAME==='MZ';

var pluginName = 'TRP_AnimationEx';
var parameters = PluginManager.parameters(pluginName);

TRP_CommandManager.register(
	'animation',
	{//defaults
		target:'this',
		animationId:1,
		mirror:false,
		delay:0,
		scale:100,
		angle:0,
		x:0,
		y:0,
		stay:false,
		volume:100,
		noFlash:false,
		z:8,

		edit:false,
	},
	function(params,subject){
		var subjectArg = params.shift();

		var subject = Game_Interpreter.trpAnimationSubject(subjectArg,subject);
		if(!subject)return;

		if(isMZ){
			$gameTemp.requestAnimationTrpEx([subject],...params)
		}else{
			subject.requestAnimationTrpEx(...params);
		}
	},
	{//map
		id:'animationId',
		mute:'volume:0',
		nose:'volume:0',
		se:'volume',
		sevolume:'volume',
		nomirror:'mirror:false',
	}
);
TRP_CommandManager.registerCommandMap('anim','animation');
TRP_CommandManager.registerCommandMap('アニメーション','animation');
TRP_CommandManager.registerCommandMap('アニメ','animation')
TRP_CommandManager.registerCommandMap('mr_animation','animation')
TRP_CommandManager.registerCommandMap('mr_anim','animation')
TRP_CommandManager.registerCommandMap('mr_アニメーション','animation');
TRP_CommandManager.registerCommandMap('mr_アニメ','animation')




//=============================================================================
// Game_Interpreter
//=============================================================================
var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command,args){
	if(command==='animation'||command==='anim'){
		this.processAnimationTrpEx(args);
	}else{
		_Game_Interpreter_pluginCommand.call(this,command,args);
	}
};

Game_Interpreter.prototype.processAnimationTrpEx = function(args){
	args.unshift('animation');
	TRP_CommandManager.process(args,this.character(0)||$gamePlayer);
};

Game_Interpreter.trpAnimationSubject = function(param,subject){
	if(param.indexOf('target:')===0){
		param = param.substring(7);
	}
	if(param==='player'||param==='プレイヤー'){
		subject = $gamePlayer;
	}else{
		var splitterIdx = param.indexOf(':');
		if(splitterIdx>=0){
			var id = Number(param.substring(splitterIdx+1));
			switch(param.substring(0,splitterIdx)){
			case 'event':
			case 'イベント':
				subject = $gameMap.event(id);
				break;
			case 'follower':
			case 'フォロワー':
				subject = $gamePlayer.followers().follower(id);
				break;
			}
		}
	}
	return subject;
};



//=============================================================================
// common funcs
//=============================================================================
function setupStayPos(pos){
	this._stayPos = pos;
	this._lastScreenX = $gameMap._displayX;
	this._lastScreenY = $gameMap._displayY;
};
function updateStayPos(){
	if(this._lastScreenX !== $gameMap._displayX){
		this._stayPos.x -= ($gameMap._displayX-this._lastScreenX)*48;
		this._lastScreenX = $gameMap._displayX;
	}
	if(this._lastScreenY !== $gameMap._displayY){
		this._stayPos.y -= ($gameMap._displayY-this._lastScreenY)*48;
		this._lastScreenY = $gameMap._displayY;
	}
};
function initMembersTrpEx(){
	this._scale = 1;
	this._rotationX = 0;
	this._rotationY = 0;
	this._rotationZ = 0;
	this._dx = 0;
	this._dy = 0;
	this._stay = false;
	this._stayPos = null;
	this._lastScreenX = 0;
	this._lastScreenY = 0;

	this._volume = 1;
	this._noFlash = false;
};


//=============================================================================
// for MZ
//=============================================================================
(()=>{
	if(!isMZ)return;
//=============================================================================
// PluginManager
//=============================================================================
	PluginManager.registerCommand(pluginName, 'show', function(args){
		var argsArr = args.command.split(' ');
		var command = argsArr.shift();
		this.pluginCommand(command,argsArr);
	});


	//=============================================================================
	// Game_Temp
	//=============================================================================
	var _Game_Temp_initialize = Game_Temp.prototype.initialize;
	Game_Temp.prototype.initialize = function(){
		_Game_Temp_initialize.call(this);
		this._animationTrpExQueue = [];
	};
	Game_Temp.prototype.retrieveAnimationEx = function() {
	    return this._animationTrpExQueue ? this._animationTrpExQueue.shift() : null;
	};


	Game_Temp.prototype.requestAnimationTrpEx = function(targets,animationId,mirror,...params){
	    if(!$dataAnimations[animationId])return;
	    const request = {
	        targets: targets,
	        animationId: animationId,
	        mirror: mirror,
	        params: params,
	    };

	    this._animationTrpExQueue = this._animationTrpExQueue||[];
	    this._animationTrpExQueue.push(request);
	    for (const target of targets) {
	        if (target.startAnimation) {
	            target.startAnimation();
	        }
	    }
	};

	//=============================================================================
	// Spriteset_Base
	//=============================================================================
	var _Spriteset_Base_processAnimationRequests = Spriteset_Base.prototype.processAnimationRequests
	Spriteset_Base.prototype.processAnimationRequests = function() {
		_Spriteset_Base_processAnimationRequests.call(this);

	    for (;;) {
	        const request = $gameTemp.retrieveAnimationEx();
	        if (request) {
	            this.createAnimationEx(request);
	        } else {
	            break;
	        }
	    }
	};

	Spriteset_Base.prototype.createAnimationEx = function(request){
	    var animation = $dataAnimations[request.animationId];
	    var targets = request.targets;
	    var mirror = request.mirror;
	    var params = request.params;
	    var delay = this.animationBaseDelay();
	    var nextDelay = this.animationNextDelay();
	    if (this.isAnimationForEach(animation)) {
	        for (var target of targets) {
	            this.createAnimationSpriteTrpEx([target], animation, mirror, delay, ...request.params);
	            delay += nextDelay;
	        }
	    } else {
	        this.createAnimationSpriteTrpEx(targets, animation, mirror, delay, ...request.params);
	    }
	};

	Spriteset_Base.prototype.createAnimationSpriteTrpEx = function(targets,animation,mirror,delay,paramDelay,...params) {
	    var mv = this.isMVAnimation(animation);
	    var sprite = new (mv ? Sprite_AnimationMVTrpEx : Sprite_AnimationTrpEx)();
	    var targetSprites = this.makeTargetSprites(targets);
	    var baseDelay = this.animationBaseDelay();
	    var previous = delay > baseDelay ? this.lastAnimationSprite() : null;
	    if (this.animationShouldMirror(targets[0])) {
	        mirror = !mirror;
	    }
	    sprite.targetObjects = targets;

	    delay += paramDelay;
	    sprite.setup(targetSprites, animation, mirror, delay, previous,...params);
	    this._effectsContainer.addChild(sprite);
	    this._animationSprites.push(sprite);
	};


	//=============================================================================
	// Sprite_AnimationTrpEx
	//=============================================================================
	function Sprite_AnimationTrpEx(){
	    this.initialize.apply(this, arguments);
	}
	Sprite_AnimationTrpEx.prototype = Object.create(Sprite_Animation.prototype);
	Sprite_AnimationTrpEx.prototype.constructor = Sprite_AnimationTrpEx;

	Sprite_AnimationTrpEx.prototype.initMembers = function(){
		Sprite_Animation.prototype.initMembers.call(this);
		this.initMembersTrpEx();
	};

	Sprite_AnimationTrpEx.prototype.initMembersTrpEx = initMembersTrpEx;

	Sprite_AnimationTrpEx.prototype.setup = function(targets, animation, mirror, delay, previous,...params){
		Sprite_Animation.prototype.setup.call(this,targets,animation,mirror,delay,previous);

		this._scale = params[0]/100 * this._animation.scale/100;

		var r = Math.PI/180;
		this._rotationX = r*this._animation.rotation.x;
		this._rotationY = r*this._animation.rotation.y;
		this._rotationZ = r*(-params[1]+this._animation.rotation.z);
		this._dx = params[2];
		this._dy = params[3];
		this._stay = params[4];
		this._stayPos = null;

		this._volume = params[5]/100;
		this._noFlash = params[6];

		this.z = params[7]===undefined ? this.z : params[7];
	};

	Sprite_AnimationTrpEx.prototype.targetPosition = function(renderer) {
		if(this._stayPos){
			this.updateStayPos();
			return this._stayPos;
		}

	    var pos = Sprite_Animation.prototype.targetPosition.call(this,renderer);
	    pos.x += this._dx;
	    pos.y += this._dy;

	    if(this._stay){
	    	this.setupStayPos(pos);
	    }
	    return pos;
	};
	Sprite_AnimationTrpEx.prototype.setupStayPos = setupStayPos;
	Sprite_AnimationTrpEx.prototype.updateStayPos = updateStayPos;


	Sprite_AnimationTrpEx.prototype.updateEffectGeometry = function() {
	    if (this._handle) {
	        this._handle.setLocation(0, 0, 0);
	        this._handle.setRotation(this._rotationX, this._rotationY, this._rotationZ);
	        this._handle.setScale(this._scale,this._scale,this._scale);
	        this._handle.setSpeed(this._animation.speed / 100);
	    }
	};

	Sprite_AnimationTrpEx.prototype.processSoundTimings = function(){
		for (const timing of this._animation.soundTimings) {
	        if (timing.frame === this._frameIndex) {
	        	var v = timing.se.volume;
	    		timing.se.volume *= this._volume;
	            AudioManager.playSe(timing.se);
	            timing.se.volume = v;
	        }
	    }
	};

	Sprite_AnimationTrpEx.prototype.updateMain = function() {
		if(this._volume>0){
			this.processSoundTimings();	
		}
		if(!this._noFlash){
			this.processFlashTimings();
		}
	    this._frameIndex++;
	    this.checkEnd();
	};
})();



//=============================================================================
// Sprite_AnimationMVTrpEx
//=============================================================================
function Sprite_AnimationMVTrpEx(){
    this.initialize.apply(this, arguments);
}
(()=>{
	var superclass = isMZ ? Sprite_AnimationMV : Sprite_Animation;
	Sprite_AnimationMVTrpEx.prototype = Object.create(superclass.prototype);
	Sprite_AnimationMVTrpEx.prototype.constructor = Sprite_AnimationMVTrpEx;

	Sprite_AnimationMVTrpEx.prototype.initMembers = function(){
		superclass.prototype.initMembers.call(this);
		this.initMembersTrpEx();
	};

	Sprite_AnimationMVTrpEx.prototype.initMembersTrpEx = initMembersTrpEx;

	Sprite_AnimationMVTrpEx.prototype.setup = function(targets, animation, mirror, delay,previous,...params){
		superclass.prototype.setup.call(this,targets,animation,mirror,delay,previous);

		this._scale = params[0]/100;
		this._rotationZ = Math.PI/180*params[1];
		this._dx = params[2];
		this._dy = params[3];
		this._stay = params[4];
		this._stayPos = null;

		this._volume = params[5]/100;
		this._noFlash = params[6];
		this.z = params[7]===undefined ? this.z : params[7];

		this.scale.set(this._scale,this._scale);
		this.rotation = this._rotationZ;
	};

	Sprite_AnimationMVTrpEx.prototype.updatePosition = function() {
		if(this._stayPos){
			this.updateStayPos();
			this.x = this._stayPos.x;
			this.y = this._stayPos.y;
			return;
		}

		superclass.prototype.updatePosition.call(this);

		this.x += this._dx;
		this.y += this._dy;
		if(this._stay){
			this.setupStayPos(new Point(this.x,this.y));
		}
	};

	Sprite_AnimationMVTrpEx.prototype.setupStayPos = setupStayPos;
	Sprite_AnimationMVTrpEx.prototype.updateStayPos = updateStayPos;

	Sprite_AnimationMVTrpEx.prototype.processTimingData = function(timing) {
	    if(!this._noFlash){
	    	const duration = timing.flashDuration * this._rate;
		    switch (timing.flashScope) {
		        case 1:
		            this.startFlash(timing.flashColor, duration);
		            break;
		        case 2:
		            this.startScreenFlash(timing.flashColor, duration);
		            break;
		        case 3:
		            this.startHiding(duration);
		            break;
		    }
	    }
	    if (timing.se && this._volume) {
	    	var v = timing.se.volume;
	    	timing.se.volume *= this._volume;
	        AudioManager.playSe(timing.se);
	        timing.se.volume = v;
	    }
	};
})();




(()=>{
	if(isMZ)return;

	//=============================================================================
	// Game_Character
	//=============================================================================

var _Game_Character_initMembers = Game_Character.prototype.initMembers;
Game_Character.prototype.initMembers = function(){
	_Game_Character_initMembers.call(this);
	this._animationsTrpEx = [];
};

Game_Character.prototype.requestAnimationTrpEx = function(animationId,mirror,...params){
	this._animationsTrpEx = this._animationsTrpEx||[];
	this._animationsTrpEx.push({
		animationId,
		mirror,
		params:params
	});
};

Game_Character.prototype.nextAnimationTrpEx = function(){
	return this._animationsTrpEx ? this._animationsTrpEx.pop() : null;
};

var _Game_Character_isAnimationPlaying = Game_Character.prototype.isAnimationPlaying;
Game_Character.prototype.isAnimationPlaying = function(){
	return (this._animationsTrpEx&&this._animationsTrpEx.length)||_Game_Character_isAnimationPlaying.call(this);
};



	//=============================================================================
	// Sprite_Character
	//=============================================================================
	var _Sprite_Character_setupAnimation = Sprite_Character.prototype.setupAnimation;
	Sprite_Character.prototype.setupAnimation = function() {
		_Sprite_Character_setupAnimation.call(this);

		var data;
		while(!!(data=this._character.nextAnimationTrpEx())){
			var animation = $dataAnimations[data.animationId];
			this.startAnimationTrpEx(animation,data.mirror,...data.params);
	        this._character._animationPlaying = true;
	    }
	};


	//=============================================================================
	// Sprite_Base
	//=============================================================================
	Sprite_Base.prototype.startAnimationTrpEx = function(animation,mirror,delay, ...params) {
	    var sprite = new Sprite_AnimationMVTrpEx();

	    var dummyPrev = null;
	    sprite.setup(this._effectTarget, animation,mirror,delay,dummyPrev, ...params);
	    this.parent.addChild(sprite);
	    this._animationSprites.push(sprite);

	    return sprite;
	};

})();







//=============================================================================
// AnimationEditor
//=============================================================================
function AnimationEditor(){};
(()=>{
	if(!Utils.isOptionValid('test'))return;


	function copyToClipboard(text,noLog=false){
		var listener = function(e){
			e.clipboardData.setData('text/plain' , text);
			e.preventDefault();
			document.removeEventListener('copy', listener);
		}
		document.addEventListener('copy' , listener);
		document.execCommand('copy');

		if(!noLog){
			console.log(text);
		}
	};

	var _TRP_CommandManager_COMMANDS_animation_process = TRP_CommandManager.COMMANDS.animation.process;
	TRP_CommandManager.COMMANDS.animation.process = function(params,subject){
		var targetParam;
		var isEdit = params[params.length-1];
		if(isEdit){
			//edit
			targetParam = params[0];
		}
		_TRP_CommandManager_COMMANDS_animation_process.call(this,params,subject);

		if(isEdit){
			AnimationEditor.start(targetParam,subject);
		}
	};


	var PARAM_IDXES = {
		delay:0,
		scale:1,
		angle:2,
		x:3,
		y:4,
		stay:5,
		volume:6,
		noFlash:7,
		z:8,

		edit:9,
	};

	AnimationEditor._end = false;
	AnimationEditor._request = null;
	AnimationEditor._params = null;
	AnimationEditor._spriteset = null;
	AnimationEditor._animationSprites = null;
	AnimationEditor._animationSprite = null;
	AnimationEditor._savedUpdate = null;
	
	AnimationEditor._targetParam = '';
	AnimationEditor._target = null;
	AnimationEditor._targetSprite = null;

	AnimationEditor.commandSeparator = '';
	AnimationEditor.splitter = '';
	AnimationEditor.tailFix = '';

	AnimationEditor._guideSprite = null;
	AnimationEditor._paramSprite = null;


	function activeInterpreter(){
		var interpreter;
		if($gameTroop.inBattle() && $gameTroop.isEventRunning()){
			interpreter = $gameTroop._interpreter;
		}else if($gameMap.isEventRunning()){
			interpreter = $gameMap._interpreter;
		}else{
			return null;
		}

		while(interpreter._childInterpreter){
			interpreter = interpreter._childInterpreter;
		}
		return interpreter;
	};

	AnimationEditor.start = function(targetParam,subject=null,commandSeparator=' ',splitter=' ',tailFix=''){
		var interpreter = activeInterpreter();
		if(interpreter){
			interpreter.wait(1);
		}


		this._targetParam = targetParam;
		this._commandSeparator = commandSeparator;
		this._splitter = splitter;
		this._tailFix = tailFix;
		this._end = false;

		this._spriteset = SceneManager._scene._spriteset;

		var target = Game_Interpreter.trpAnimationSubject(targetParam,subject);
		this._target = target;

		var request;
		if(isMZ){
			this._animationSprites = this._spriteset._animationSprites
			this._spriteset._animationSprites = [];
			request = $gameTemp._animationTrpExQueue.pop();
		}else{
			request = target._animationsTrpEx.pop();

			var sprites = this._spriteset._characterSprites;
			for(const sprite of sprites){   
				if(sprite&&sprite._character === target){
					this._targetSprite = sprite;
				}
		    }

		    if(!this._targetSprite){
		    	this._processEnd();
		    	return;
		    }
		}

		this._request = request;
		this._params = request.params;

        this._savedUpdate = SceneManager._scene.update;
		SceneManager._scene.update = function(){
			AnimationEditor.update();
		};

		this.startAnimation();
		this.setupGuide();
		this.createParamSprite();
		this.refreshParamSprite();
	};

	AnimationEditor.startAnimation = isMZ ? function(){
		//mz
		var sprset = this._spriteset;
		sprset.createAnimationEx(this._request);
	} : function(){
		//mv
		var sprite = this._targetSprite.startAnimationTrpEx(
			$dataAnimations[this._request.animationId],
			this._request.mirror,
			...this._params
		);
		this._animationSprite = sprite;
	}

	AnimationEditor.didPickAnimationId = function(animationId){
		if(animationId<=0)return;
		this._request.animationId = animationId;

		this.refreshParamSprite()
	};

	var animKey = Input.keyMapper[65]||'a';
	Input.keyMapper[65] = animKey;//A

	AnimationEditor.startPickingId = function(){
		AnimationViewer.start(this._request.animationId,this.didPickAnimationId.bind(this));
	};
	AnimationEditor.update = function(){
		if(Input.isRepeated(animKey)){
			this.startPickingId();
		}else if(Input.isRepeated('up')){
			if(Input.isPressed('control')){
				this._params[PARAM_IDXES.scale] += Input.isPressed('shift')?1:10;
			}else{
				this._params[PARAM_IDXES.y] -= Input.isPressed('shift')?1:20;
			}
			this.refreshParamSprite();
		}else if(Input.isRepeated('down')){
			if(Input.isPressed('control')){
				this._params[PARAM_IDXES.scale] -= Input.isPressed('shift')?1:10;
			}else{
				this._params[PARAM_IDXES.y] += Input.isPressed('shift')?1:20;
			}
			this.refreshParamSprite();
		}else if(Input.isRepeated('left')){
			if(Input.isPressed('control')){
				this._params[PARAM_IDXES.angle] -= (Input.isPressed('shift')?1:10);
			}else{
				this._params[PARAM_IDXES.x] -= Input.isPressed('shift')?1:20;
			}
			this.refreshParamSprite();
		}else if(Input.isRepeated('right')){
			if(Input.isPressed('control')){
				this._params[PARAM_IDXES.angle] += (Input.isPressed('shift')?1:10);	
			}else{
				this._params[PARAM_IDXES.x] += Input.isPressed('shift')?1:20;
			}
			this.refreshParamSprite();
		}else if(Input.isRepeated('pageup')){
			this._request.mirror = !this._request.mirror;
			this.refreshParamSprite();
		}else if(Input.isRepeated('pagedown')){
			this._request.mirror = !this._request.mirror;
			this.refreshParamSprite();
		}else if(Input.isRepeated('cancel')){

		}else if(Input.isTriggered('ok')){
			this.processEnd();
			return;
		}

		if(this._end)return;

		var allEnd = true;
		if(isMZ){
			var sprites = this._spriteset._animationSprites;
			for(var i=sprites.length-1; i>=0; i=(i-1)|0){
				var sprite = sprites[i];

	         	sprite.update();
	         	if(!sprite.isPlaying()){
	         		this._spriteset.removeAnimation(sprite);
	         	}else{
	         		allEnd = false;
	         	}
		    }	
		}else{
			this._animationSprite.update();

			allEnd = this._animationSprite.isReady() && !this._animationSprite.isPlaying();
			if(allEnd){
				this._animationSprite.remove();
			}
		}
	    if(allEnd){
	    	this.startAnimation();
	    }

	    this._guideSprite.update();
	};

	AnimationEditor.makeCommand = function(minimize=false){
		var args = this._params.concat();
		var request = this._request;

		if(args[PARAM_IDXES.stay]){
			args[PARAM_IDXES.stay] = 'stay';
		}
		if(args[PARAM_IDXES.volume]===0){
			args[PARAM_IDXES.volume] = 'mute';
		}
		if(args[PARAM_IDXES.noFlash]){
			args[PARAM_IDXES.noFlash] = 'noFlash';
		}

		args.unshift(request.mirror ? 'mirror' : false);
		args.unshift(request.animationId);
		args.unshift(this._targetParam);

		args.pop();//edit

		return TRP_CommandManager.makeCommand('animation',args,this._commandSeparator,this._splitter,this._tailFix,minimize);
	}
	AnimationEditor.processEnd = function(){
		var command = this.makeCommand(true);
		copyToClipboard(command);

		if(parameters.registerAsset==='true'){
			this.registerAsset(this._request.animationId);
		}

		this._processEnd();
	};

	AnimationEditor._processEnd = function(){
		this._end = true;

		if(isMZ && this._spriteset._animationSprites){
			for(const sprite of this._spriteset._animationSprites){
           		this._spriteset.removeAnimation(sprite);
		    }
		}

		SceneManager._scene.update = this._savedUpdate;
		this._spriteset._animationSprites = this._animationSprites;
		this._spriteset = null;
		this._animationSprites = null;

		this._savedUpdate = null;
		this._request = this._params = null;

		if(this._animationSprite){
			if(this._animationSprite.parent){
				this._animationSprite.parent.removeChild(this._animationSprite)
			}
			this._animationSprite = null;
		}
		this._animationSprite = null;

		this._targetSprite = null;
		this._target = null;

		if(this._paramSprite){
			this._paramSprite.parent.removeChild(this._paramSprite);
			this._paramSprite = null;
		}
		if(this._guideSprite){
			this._guideSprite.parent.removeChild(this._guideSprite);
			this._guideSprite = null;
		}
	};

	/* paramSprite
	===================================*/
	AnimationEditor.PARAM_FONT_SIZE = 16;
	AnimationEditor.createParamSprite = function(){
		var bitmap = new Bitmap(Graphics.width,this.PARAM_FONT_SIZE+4);
		bitmap.fontSize = this.PARAM_FONT_SIZE;
		bitmap.outlineWidth = 6;
		bitmap.outlineColor = 'black';

		var sprite = new Sprite(bitmap);
		this._paramSprite = sprite;
		SceneManager._scene.addChild(sprite);
	};

	AnimationEditor.refreshParamSprite = function(){
		var sprite = this._paramSprite;
		var bitmap = sprite.bitmap;
		bitmap.clear();

		var command = this.makeCommand(false);
		command = command.replace('animation'+this._commandSeparator,'');

		var elems = command.split(this._splitter);
		var text = '';
		for(var i=0; i<elems.length; i=(i+1)|0){
			var elem = elems[i];
			if(elem.indexOf('target:')===0){
			}else if(elem==='mirror:false'){
			}else if(elem.indexOf('delay')===0){
			}else if(elem.indexOf('volume')===0){
			}else{
				text += (text?' ':'') +elem;
			}
		}

		bitmap.drawText(text,0,0,bitmap.width,bitmap.height);
	};
		
	/* guideSprite
	===================================*/
	AnimationEditor.setupGuide = function(){
		this._guideSprite = new GuideSprite();
		SceneManager._scene.addChild(this._guideSprite);

		this._guideSprite.setTexts(AnimationEditor.GUIDE_DISPLAY_SETTING);
	};
	AnimationEditor.GUIDE_DISPLAY_SETTING = [
		'カーソル：移動',
		'ctrl/opt+カーソル↑↓：拡大',
		'ctrl/opt+カーソル←→：回転',
		'shift：押下時は変化量小',
		'Q/W：反転',
		null,
		'A：アニメーションID選択',
		'Enter：終了&コマンドコピー',
		null,
		'G：ガイドを隠す'
	];



	/* registerAsset
	===================================*/
	AnimationEditor.registerAsset = function(animationId){
		var data = $dataAnimations[animationId];
		if(!data)return;

		var seNames = [];
		var imgNames = [];
		if(isMZ && !Spriteset_Base.prototype.isMVAnimation.call(this,data)){
			//mz
			for(const timing of data.soundTimings){
				if(timing.se && timing.se.name && !seNames.contains(timing.se.name)){
					seNames.push(timing.se.name);
				}
		    }
		}else{
			//mv
			for(const timing of data.timings){
				if(timing.se && timing.se.name && !seNames.contains(timing.se.name)){
					seNames.push(timing.se.name);
				}
		    }

		    if(data.animation1Name && !imgNames.contains(data.animation1Name)){
		    	imgNames.push(data.animation1Name);
		    }
		    if(data.animation2Name && !imgNames.contains(data.animation2Name)){
		    	imgNames.push(data.animation2Name);
		    }
		}


		//read plugin file
		var fs = require('fs');
		var path = require('path');
		var base = path.dirname(process.mainModule.filename);

		var pluginName = 'TRP_PluginAssets';
		var pluginPath = path.join(base,'js/plugins/'+pluginName+'.js');
		var plugin;
		if(fs.existsSync(pluginPath)){
			plugin = fs.readFileSync(pluginPath, {encoding:'utf8'});
		}else{
			plugin = '//=============================================================================\n// TRP_PluginAssets.js\n//=============================================================================\n/*'+':\n * @author Thirop\n * @plugindesc プラグイン使用アセット登録用\n * \n * \n */\n//=============================================================================';
		}

		//analyze plugin
	    var regExp = new RegExp(' * '+'@requiredAssets ([^ \n\t]+)','gi');
	    for (;;) {
	        var match = regExp.exec(plugin);
	        if (!match)break;

	        var url = match[1];
	        var elems = url.split('/');
	        var fileName = elems[elems.length-1];
	        if(url.contains('/se/')){
	        	if(!seNames.contains(fileName)){
	        		seNames.push(fileName);
	        	}
	        }else{
	        	if(!imgNames.contains(fileName)){
	        		imgNames.push(fileName);
	        	}
	        }
	    }

	    var assetText = '';
		seNames.sort();
		imgNames.sort();
		for(const img of imgNames){
         	assetText += ' * '+'@requiredAssets img/animations/'+img+'\n';
	    }
	    for(const se of seNames){
         	assetText += ' * '+'@requiredAssets audio/se/'+se+'\n';
	    }


	    //register assset
	    var assetStartIdx = plugin.indexOf(' * '+'@requiredAssets');
		var endIdx = plugin.indexOf(' *'+'/');
		if(assetStartIdx>=0){
			plugin = plugin.slice(0,assetStartIdx)+plugin.slice(endIdx);
			endIdx = assetStartIdx;
		}

		plugin = plugin.slice(0,endIdx)+ assetText + plugin.slice(endIdx);

		//write plugin file
		fs.writeFileSync(pluginPath,plugin);
	};






	//=============================================================================
	// GuideSprite
	//=============================================================================
	var GuideSprite = TRP_CORE.GuideSprite =  function GuideSprite(){
	    this.initialize.apply(this, arguments);
	}

	var guideKey = Input.keyMapper[71]||'g';
	Input.keyMapper[71] = guideKey;//G
	GuideSprite.prototype = Object.create(Sprite.prototype);
	GuideSprite.prototype.constructor = GuideSprite;

	GuideSprite.LINE_HEIGHT = 20;
	GuideSprite.prototype.initialize = function() {
	    Sprite.prototype.initialize.call(this);

	    var bitmap = new Bitmap(256,256);
	    this.bitmap = bitmap;
	    this._texts = null;
	    this._folding = false;
	    this._backColor = 'rgba(0,0,0,0.5)';

	    bitmap.fontSize = GuideSprite.LINE_HEIGHT - 4;
	    bitmap.outlineWidth = 3;
	    bitmap.outlineColor = 'black';

	    this.hideOnFold = false;
	};

	GuideSprite.prototype.setTexts = function(texts,color='rgba(0,0,0,0.5)'){
		this._backColor = color;
		if(!texts){
			this._texts = null;
			this.vibible = false;
			return;
		}else if(this._texts && texts.equals(this._texts)){
			return;
		}else{
			this._texts = texts;
			if(!this._folding){
				this.refreshTexts(texts);
			}
		}
	};

	GuideSprite.prototype.refreshTexts = function(texts){
		var bitmap = this.bitmap;
		bitmap.clear();

		var lineHeight = GuideSprite.LINE_HEIGHT;
		var x = 0;
		var y = 0;


		var length = texts.length;
	    for(var i = 0; i<length; i=(i+1)|0){
	        var text = texts[i];
	        if(!text){
	        	y += Math.floor(lineHeight/2);
	        	continue;
	        }

	        var textWidth = bitmap.measureTextWidth(text);
	        textWidth = (textWidth+4).clamp(0,bitmap.width);
	        bitmap.fillRect(bitmap.width-textWidth,y,textWidth,lineHeight,this._backColor);

	        bitmap.drawText(text,x+2,y,bitmap.width-4,lineHeight,'right');

	        y += lineHeight;
	    }

	    this.x = Graphics.width - this.width;
	    this.y = Graphics.height - y - 10;
	};

	GuideSprite.prototype.update = function(){
		Sprite.prototype.update.call(this);
		if(Input.isTriggered(guideKey)){
			SoundManager.playCursor();
			if(this._folding){
				this.open();
			}else{
				this.fold();
			}
		}
	};

	GuideSprite.prototype.open = function(){
		if(!this._folding)return;
		this._folding = false;

		if(this._texts){
			this.refreshTexts(this._texts);
		}
		this.opacity = 255;
	};

	GuideSprite.FOLDING_TEXTS = ['G：ガイドを表示']
	GuideSprite.prototype.fold = function(){
		if(this._folding)return;
		this._folding = true;

		this.refreshTexts(GuideSprite.FOLDING_TEXTS);
		if(this.hideOnFold){
			this.opacity = 64;
		}
	};




	//=============================================================================
	// AnimationViewer
	//=============================================================================
	var AnimationViewer = TRP_CORE.AnimationViewer = function AnimationViewer(){
	    this.initialize.apply(this, arguments);
	}

	AnimationViewer.MARGIN = 4;
	AnimationViewer.FOOTER_HEIGHT = 20;



	var $setting = {
		maxCols : Number(parameters.maxCols)||5,
		maxRows : Number(parameters.maxRows)||4,
		delay : Number(parameters.delay)||10,
		scale : Number(parameters.scale)||25,

	    sizeW:0,
	    sizeH:0,
	};




	//=============================================================================
	// AnimationViewer
	//=============================================================================
	AnimationViewer.instance = null;
	AnimationViewer.imageCacheKeys = null;
	AnimationViewer.start = function(id,completion){
		if(this.instance)return;

		var instance = new AnimationViewer(id,completion);
		this.instance = instance;
		SceneManager._scene.addChild(instance);

		if(isMZ){
			this.imageCacheKeys = Object.keys(ImageManager._cache);
		}

        var update = SceneManager._scene.update;
		SceneManager._scene.update = function(){
			if(!instance.update()){
				instance.terminate();
				SceneManager._scene.update = update;
				AnimationViewer.instance = null;

				AnimationViewer.clearAnimationImageCache();
				AnimationViewer.imageCacheKeys = null;
			}
		};
	};
	AnimationViewer.clearAnimationImageCache = function(){
		if(!isMZ)return;
		if(!this.imageCacheKeys)return;

		var keys = Object.keys(ImageManager._cache);
		for(var i=keys.length-1; i>=0; i=(i-1)|0){
			var key = keys[i];
			if(key.contains('animations')&&!this.imageCacheKeys.contains(key)){
				ImageManager._cache[key].destroy();
				delete ImageManager._cache[key];
			}
		}
	};

	AnimationViewer.prototype = Object.create(PIXI.Container.prototype);
	AnimationViewer.prototype.constructor = AnimationViewer;
	AnimationViewer.prototype.initialize = function(id=-1,completion=null) {
	    PIXI.Container.call(this);
	    this.initMembers();

	    this._completion = completion;
	    this._data = $dataAnimations.filter(function(data){
	    	return data && data.name;
	    });

	    this.width = Graphics.width;
	    this.height = Graphics.height;

	    this._backSprite = new Sprite(new Bitmap(Graphics.width,Graphics.height));
	    this._backSprite.bitmap.fillAll('black');
	    this.addChild(this._backSprite);

	    this.start(id);
	    this.setupGuide();
	};

	AnimationViewer.prototype.initMembers = function(){
		this._completion = null;
		this._selectedId = -1;

		this._onKeyDown = null;
		this._onWheel = null;
		this._data = null;

		this._quit = false;
		this._animationIndex = -1;

		this._sprites = [];
	    this._mzSprites = [];
	    this._showingSprites = [];

	    this._targets = [];
		this._backSprite = null;
		this._wheelWait = 0;

		this._guideSprite = null;
	};
	AnimationViewer.prototype.setting = function(){
		return $setting;
	}

	AnimationViewer.prototype.start = function(id) {
		var setting = this.setting();
		setting.sizeW = (Graphics.width-(setting.maxCols-1)*AnimationViewer.MARGIN)/setting.maxCols;
		setting.sizeH = (Graphics.height-(setting.maxRows-1)*AnimationViewer.MARGIN-(setting.maxRows*AnimationViewer.FOOTER_HEIGHT))/setting.maxRows;

	    this._animationIndex = 0;
	  //   if(id>0){
	  //   	var length = this._data.length;
			// for(var i=0; i<length; i=(i+1)|0){
			// 	var data = this._data[i];
			// 	if(data && data.id===id){
			// 		this._animationIndex = i;
			// 		break;
			// 	}
			// }
	  //   }

	    this._selectedId = -1;
	    this._quit = false;

	    this._onKeyDown = AnimationViewer.prototype.onKeyDown.bind(this);
	    document.addEventListener("keydown", this._onKeyDown);

	    this._onWheel = AnimationViewer.prototype.onWheel.bind(this);
	    document.addEventListener("wheel", this._onWheel);

	    this.refresh();
	};


	AnimationViewer.prototype.setIndexTop = function(id){
	    var data = this._data;
		var length = data.length;
		var i = Math.min(id,length-1);
		for(;i>=0 ;(i=i-1)|0){
			if(data[i].id < id){
				if(this._animationIndex !== i+1){
					this._animationIndex = i+1;
					this.refresh();
				}
				return;
			}
		}
	};

	AnimationViewer.prototype.exceedIndex = function(){
	    var data = this._data;

	    var setting = this.setting();
		var maxNum = setting.maxRows*setting.maxCols;
		var newIndex = this._animationIndex+maxNum;

		newIndex = Math.min(newIndex, data.length-maxNum);
		if(this._animationIndex !== newIndex){
			this._animationIndex = newIndex;
			this.refresh();
		}
	};
	AnimationViewer.prototype.decreeseIndex = function(){
		var setting = this.setting();
		var maxNum = setting.maxRows*setting.maxCols;
		var newIndex = this._animationIndex - maxNum;
		newIndex = Math.max(0,newIndex);
		if(this._animationIndex !== newIndex){
			this._animationIndex = newIndex;
			this.refresh();
		}
	};


	AnimationViewer.prototype.cacheShowingSprites = function(){
		var sprites = this._showingSprites;
		for(const sprite of sprites){
			if(sprite instanceof (isMZ?Sprite_AnimationMV:Sprite_Animation)){
				this._sprites.push(sprite);
			}else{
				this._mzSprites.push(sprite);
			}

			sprite.parent.removeChild(sprite);
			this._targets.push(sprite._target||sprite._targets[0]);
	    }
		sprites.length = 0;
	};

	AnimationViewer.prototype.isMVAnimation = isMZ ? Spriteset_Base.prototype.isMVAnimation : function(){return true};
	AnimationViewer.prototype.animation = function(){
		var sprite = this._mzSprites.pop() || new Sprite_AnimationForViewer(this.setting());
		return sprite;
	}
	AnimationViewer.prototype.animationMV = function(){
		var sprite = this._sprites.pop() || new Sprite_AnimationMVForViewer(this.setting());
		return sprite;
	}

	AnimationViewer.prototype.refresh = function(){
		this.cacheShowingSprites();
		AnimationViewer.clearAnimationImageCache();

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

	    for(; num<maxNum && i<length; i=(i+1)|0){
		    var animation = data[i];
		    if(!animation || !animation.name){
		    	continue;
		    };

		    var isMV = this.isMVAnimation(animation);
		    var sprite = isMV ? this.animationMV() : this.animation();

	        var x = margin+(sizeW+margin)*(num%setting.maxCols);
	        var y = margin+(sizeH+nameHeight)*Math.floor(num/$setting.maxCols);
	        var target;
	        if(isMV){
	            target = this.dummyTarget(x,y);
	        }else{
	        	target = this.dummyTarget(x+sizeW/2,y+sizeH/2);
	        }

		    contents.fontSize = 24;
		    contents.textColor = 'white';
		    contents.drawText(animation.id.padZero(4),x,y+sizeH,45,nameHeight);

		    contents.fontSize = 12;
		    contents.textColor = 'rgb(200,200,200)';
		    var text = animation.name.substr(0,12);
		    contents.drawText(text,x+50,y+sizeH,sizeW-35,nameHeight);

	        if(!isMV){
	        	animation = JsonEx.makeDeepCopy(animation);
	            animation.scale = scale;
	        }

		    sprite.initMembers();
		    sprite._num = num;

		    sprite.setup(isMZ?[target]:target,animation,false,0);
		    this.addChild(sprite);

		    this._showingSprites.push(sprite);

		    num+=1;
	    }
	};

	AnimationViewer.prototype.update = function() {
		this._wheelWait -= 1;

		for(const child of this.children){
         	if(child.update)child.update();  
	    }

		if(Input._latestButton){
			this.updateInput();
		}
		if(TouchInput.isTriggered()){
			this.updateTouch();
		}
		return !this._quit;
	};

	AnimationViewer.prototype.updateInput = function(){
	    if(Input.isTriggered('cancel') || Input.isTriggered('ok')){
	    	this._quit = true;
	    	SoundManager.playCancel();
	    }else if(Input.isTriggered('left') || Input.isTriggered('up')||Input.isTriggered('pageup')){
			this.decreeseIndex();
			SoundManager.playCursor();
		}else if(Input.isTriggered('up') || Input.isTriggered('right')||Input.isTriggered('pagedown')){
			this.exceedIndex();
			SoundManager.playCursor();
		}
	};
	AnimationViewer.prototype.onWheel = function(event){
		if(this._wheelWait>0)return;

		if(event.deltaY>10){
			this.decreeseIndex();
			SoundManager.playCursor();
			this._wheelWait = 5;
		}else if(event.deltaY<-10){
			this.exceedIndex();
			SoundManager.playCursor();
			this._wheelWait = 5;
		}
	    event.stopPropagation();
	};
	AnimationViewer.prototype.onKeyDown = function(event){
		if(!event.key || isNaN(event.key))return;

		var num = Number(event.key);
		if(num!==0){
			if(Input.isPressed('shift')){
				this.setIndexTop(1000+100*num);
			}else{
				this.setIndexTop(100*num);
			}
		}else{
			if(Input.isPressed('shift')){
				this.setIndexTop(1000);
			}else{
				if(this._animationIndex !== 0){
					this._animationIndex = 0;
					this.refresh();
				}
			}
		}
	}
	AnimationViewer.prototype.updateTouch = function(){
		var x = TouchInput.x;
		var y = TouchInput.y;

		var setting = this.setting();
		var col = Math.floor(x/(AnimationViewer.MARGIN+setting.sizeW));
		var row = Math.floor(y/(AnimationViewer.MARGIN+setting.sizeH+AnimationViewer.FOOTER_HEIGHT));

		var idx = this._animationIndex+col+row*setting.maxCols;
		this.didSelect(idx);
	};
	AnimationViewer.prototype.didSelect = function(idx){
		this._selectedId = this._data[idx].id;
		this._quit = true;
	};

	AnimationViewer.prototype.terminate = function() {
		this.parent.removeChild(this);

		if(this._completion){
			this._completion(this._selectedId);
			this._completion = null;
		}

		document.removeEventListener('keydown',this._onKeyDown);
		this._onKeyDown = null;

		document.removeEventListener('wheel',this._onWheel);
		this._onWheel = null;
	};

	AnimationViewer.prototype.dummyTarget = function(x,y){
		var target = this._targets.pop() || new AnimationDummyTarget();
		target.x = x;
		target.y = y;
		return target;
	};


	/* guideSprite
	===================================*/
	AnimationViewer.prototype.setupGuide = function(){
		this._guideSprite = new GuideSprite();
		this._guideSprite.hideOnFold = true;
		this.addChild(this._guideSprite);

		this._guideSprite.setTexts(this.guideTexts());
	};
	AnimationViewer.prototype.guideTexts = function(){
		return AnimationViewer.GUIDE_DISPLAY_SETTING;
	};
	AnimationViewer.GUIDE_DISPLAY_SETTING = [
		'カーソル←→：ページ切り替え',
		'Enter/Esc：終了',
		null,
		'G：ガイドを隠す'
	];



	//=============================================================================
	// AnimationDummyTarget
	//=============================================================================
	function AnimationDummyTarget(){
	    this.initialize.apply(this, arguments);
	}
	AnimationDummyTarget.prototype.initialize = function(x,y){
		this.x = 0;
		this.y = 0;
	    this.width = 0;
	    this.height = 0;
	};
	AnimationDummyTarget.prototype.setBlendColor = function(){};
	AnimationDummyTarget.prototype.show = function(){};
	AnimationDummyTarget.prototype.hide = function(){};




	function Sprite_AnimationForViewer(){
	    this.initialize.apply(this, arguments);
	}
	(()=>{
		if(!isMZ)return;
		//=============================================================================
		// Sprite_AnimationForViewer
		//=============================================================================
		Sprite_AnimationForViewer.prototype = Object.create(Sprite_Animation.prototype);
		Sprite_AnimationForViewer.prototype.constructor = Sprite_AnimationForViewer;
		Sprite_AnimationForViewer.prototype.initialize = function(setting){
			Sprite_Animation.prototype.initialize.call(this);
			this.setting = setting;
		}
		Sprite_AnimationForViewer.prototype.targetPosition = function(renderer) {
		    return new Point((this._target||this._targets[0]).x,(this._target||this._targets[0]).y);
		};

		Sprite_AnimationForViewer.prototype.update = function(){
		    Sprite_Animation.prototype.update.call(this);
		    if(!this.isPlaying()){
		        this._playing = true;
		        this._started = false;
		        this._frameIndex = 0;
		    }
		};

		Sprite_AnimationForViewer.prototype.setViewport = function(renderer) {
			var setting = this.setting;
		    const vw = this._viewportSize;
		    const vh = this._viewportSize;
		    const vx = this._animation.offsetX - vw / 2;
		    const vy = this._animation.offsetY - vh / 2;
		    const pos = this.targetPosition(renderer);
		    renderer.gl.viewport(vx + pos.x, vy + pos.y, vw, vh);

		    renderer.gl.enable(renderer.gl.SCISSOR_TEST)

		    renderer.gl.scissor(
		        pos.x + this._animation.offsetX-setting.sizeW/2,
		        pos.y + this._animation.offsetY-setting.sizeH/2,
		        setting.sizeW, setting.sizeH
		    );
		};
		Sprite_AnimationForViewer.prototype.resetViewport = function(renderer){
			renderer.gl.disable(renderer.gl.SCISSOR_TEST);
			Sprite_Animation.prototype.resetViewport.call(this,renderer);
		}
		Sprite_AnimationForViewer.prototype.processSoundTimings = function() {
		};
	})();


	//=============================================================================
	// Sprite_AnimationMVForViewer
	//=============================================================================
	function Sprite_AnimationMVForViewer(){
	    this.initialize.apply(this, arguments);
	}

	(()=>{
		var superclass = isMZ ? Sprite_AnimationMV : Sprite_Animation;
		Sprite_AnimationMVForViewer.prototype = Object.create(superclass.prototype);
		Sprite_AnimationMVForViewer.prototype.constructor = Sprite_AnimationMVForViewer;

		Sprite_AnimationMVForViewer.prototype.initialize = function(setting){
			superclass.prototype.initialize.call(this);
			this.setting = setting;
		}
		Sprite_AnimationMVForViewer.prototype.initMembers = function() {
			this._setting = null;
		    this._targets = null;
		    this._animation = null;
		    this._mirror = false;
		    this._delay = 0;
		    this._rate = 4;
		    this._duration = 0;
		    this._flashColor = [0, 0, 0, 0];
		    this._flashDuration = 0;
		    this._screenFlashDuration = 0;
		    this._hidingDuration = 0;
		    this._bitmap1 = null;
		    this._bitmap2 = null;

		    if(this._cellSprites){
		        this._cellSprites.forEach(function(cell){
		            cell.bitmap = null;
		            cell.visible = false;
		        });
		    }else{
		        this._cellSprites = [];
		    }
		    this._screenFlashSprite = this._screenFlashSprite || null;
		    this._duplicated = false;
		    this.z = 8;


		    this._calcSize = true;
		    this._rate = 1;

		    this._sx = 9999999;
		    this._sy = 9999999;
		    this._ex = -9999999;
		    this._ey = -9999999;
		    this._shiftX = 0;
		    this._shiftY = 0;
		};

		Sprite_AnimationMVForViewer.prototype.setup = function(){
			superclass.prototype.setup.call(this,...arguments);
			if(!this._cellSprites || this._cellSprites.length===0){
				this.createCellSprites();
			}
		}

		Sprite_AnimationMVForViewer.prototype.setupRate = function(){
		    if(this._calcSize){
		        this._rate = 1;
		        return;
		    }
		    
		   superclass.prototype.setupRate.call(this);
		};


		Sprite_AnimationMVForViewer.prototype.setupDuration = function() {
		    this._duration = this._animation.frames.length * this._rate + 1;

		    var setting = this.setting;
		    this._delay = setting.delay||0;
		    if(this._delay){
		        this.visible = false;
		    }
		};
		Sprite_AnimationMVForViewer.prototype.updateFlash = function() {
		    if (this._flashDuration > 0) {
		        var d = this._flashDuration--;
		        this._flashColor[3] *= (d - 1) / d;
		    }
		};
		Sprite_AnimationMVForViewer.prototype.updateScreenFlash = function() {
		    if (this._screenFlashDuration > 0) {
		        var d = this._screenFlashDuration--;
		        if (this._screenFlashSprite) {
		            this._screenFlashSprite.x = -this.absoluteX();
		            this._screenFlashSprite.y = -this.absoluteY();
		            this._screenFlashSprite.opacity *= (d - 1) / d;
		            this._screenFlashSprite.visible = (this._screenFlashDuration > 0);
		        }
		    }
		};


		Sprite_AnimationMVForViewer.prototype.updateCellSprite = function(sprite, cell) {
		    var pattern = cell[0];
		    if (pattern >= 0) {
		        var sx = pattern % 5 * 192;
		        var sy = Math.floor(pattern % 100 / 5) * 192;
		        var mirror = this._mirror;
		        sprite.bitmap = pattern < 100 ? this._bitmap1 : this._bitmap2;
		        sprite.setFrame(sx, sy, 192, 192);
		        sprite.x = cell[1];
		        sprite.y = cell[2];
		        sprite.rotation = cell[4] * Math.PI / 180;
		        sprite.scale.x = cell[3] / 100;

		        if(cell[5]){
		            sprite.scale.x *= -1;
		        }
		        if(mirror){
		            sprite.x *= -1;
		            sprite.rotation *= -1;
		            sprite.scale.x *= -1;
		        }

		        sprite.scale.y = cell[3] / 100;
		        sprite.opacity = cell[6];
		        sprite.blendMode = cell[7];
		        sprite.visible = true;

		        if(this._calcSize){
		            this._sx = Math.min(this._sx,sprite.x - Math.abs(sprite.anchor.x*sprite.scale.x*sprite.width));
		            this._sy = Math.min(this._sy,sprite.y - Math.abs(sprite.anchor.y*sprite.scale.y*sprite.height));
		            this._ex = Math.max(this._ex,sprite.x + Math.abs((1-sprite.anchor.x)*sprite.scale.x*sprite.width));
		            this._ey = Math.max(this._ey,sprite.y + Math.abs((1-sprite.anchor.y)*sprite.scale.y*sprite.height));
		        }
		    }else if(sprite){
		        sprite.visible = false;
		    }
		};
		Sprite_AnimationMVForViewer.prototype.loadBitmaps = function() {
		    var name1 = this._animation.animation1Name;
		    var name2 = this._animation.animation2Name;
		    this._bitmap1 = ImageManager.loadAnimation(name1);
		    this._bitmap2 = ImageManager.loadAnimation(name2);

		    var frameSize = 192;
		    if(name1){
		        var matchSize = name1.match(/_x([0-9]+)/);
		        if(matchSize){
		            frameSize = Number(matchSize[1]);
		        }       
		    }
		    this._frameSize1 = frameSize;

		    frameSize = 192;
		    if(name2){
		        var matchSize = name2.match(/_x([0-9]+)/);
		        
		        if(matchSize){
		            frameSize = Number(matchSize[1]);
		        }       
		    }
		    this._frameSize2 = frameSize;
		};
		Sprite_AnimationMVForViewer.prototype.createScreenFlashSprite = function() {};

		Sprite_AnimationMVForViewer.prototype.adjustSize = function(){
		    var maxWidth = this._ex-this._sx;
		    var maxHeight = this._ey-this._sy;
		    var maxSize = Math.max(maxWidth,maxHeight);

		    var nameHeight = AnimationViewer.FOOTER_HEIGHT;
		    var margin = AnimationViewer.MARGIN;
		    var setting = this.setting;
		    var size = Math.min(setting.sizeW,setting.sizeH);

		    if(maxSize>size){
		        this.scale.x = this.scale.y = size/maxSize;        
		    }else{
		        this.scale.x = this.scale.y = 1;
		    }

		    this._shiftX = -this._sx*this.scale.x;
		    this._shiftY = -this._sy*this.scale.y;
		};
		Sprite_AnimationMVForViewer.prototype.updatePosition = function() {
		    this.x = (this._target||this._targets[0]).x + this._shiftX;
		    this.y = (this._target||this._targets[0]).y + this._shiftY;
		};

		Sprite_AnimationMVForViewer.prototype.updateMain = function() {
		    if (this.isPlaying()) {
		        if (this.isReady()) {

		            if (this._delay > 0) {
		                this._delay--;
		            } else {
		                this.visible = true;
		                this._duration--;
		                this.updatePosition();
		                if (this._duration % this._rate === 0) {
		                    this.updateFrame();
		                }
		            }
		            if(this._calcSize){
		                this.updateMain();
		            }
		        }
		    }else{
		        if(this._calcSize && this.isReady() && this._sx!==9999999){
		            this._calcSize = false;
		            this.adjustSize();
		            this.setupRate();
		        }
		        this.setupDuration();
		    }
		};


		Sprite_AnimationMVForViewer.prototype.processTimingData = function(timing) {
		    var duration = timing.flashDuration * this._rate;
		    switch (timing.flashScope) {
		    case 1:
		        this.startFlash(timing.flashColor, duration);
		        break;
		    case 2:
		        this.startScreenFlash(timing.flashColor, duration);
		        break;
		    case 3:
		        this.startHiding(duration);
		        break;
		    }
		    if (!this._duplicated && timing.se) {
		        // AudioManager.playSe(timing.se);
		    }
		};
	})();


})();//end AnimationEditor

})();//end main
