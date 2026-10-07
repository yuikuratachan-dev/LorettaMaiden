//=============================================================================
// SePicker.js
//=============================================================================
/*:
 * @author Thirop
 * @target MZ
 * @plugindesc SEピッカー
 * @help
 * ※TRP_CommandManagerを導入する場合はTRP_CommandManagerより下に配置
 *
 * [アセット登録について]
 * プラグイン設定「アセット登録」をONにすることで、
 * SEピッカー終了時に、使用するSEを「TRP_PluginAsset.js」
 * プラグインにアセットとして自動で登録します。
 * 
 * 生成される「TRP_PluginAsset.js」をプラグインとして導入することで
 * 登録したアセットはデプロイメント時に「未使用ファイル」として除外されなくなります。
 *
 * 【更新履歴】
 * 1.03 2022/08/06 MZ形式コマンドで正しく再生されない不具合修正
 * 
 * @command se
 * @text SE再生
 * @desc SEを再生<ピッカー呼び出し>
 * 
 * @arg params
 * @text パラメータ
 * @desc 未設定でピッカー呼び出し。ピッカー終了後にクリップボードにコピーされた値をここにペースト
 * @type text
 *
 * @arg editMode
 * @text _Editモード
 * @desc ON/trueとすると実行時にピッカー呼び出し。
 * @type boolean
 * @default false
 *
 * @param noAnalyze
 * @text フォルダ解析スキップ
 * @desc seフォルダの解析を行わず、保存データ(dataEx/TrpDevSePicker.json)を読み込み
 * @default false
 * @type boolean
 * 
 * @param maxVolume
 * @text 最大ボリューム
 * @desc ピッカーで設定できる最大ボリューム
 * @default 100
 * @type number
 * @min 0
 *
 * @param registerAsset
 * @text アセット登録
 * @desc ピッカー終了時にseファイルを使用素材としてTRP_PluginAsset.jsに登録
 * @default true
 * @type boolean
 *
 * @param bgmVolume
 * @text BGMボリューム
 * @desc ピッカー表示中にBGMボリュームを変更（-1で無変更）
 * @default -1
 * @type number
 * @min -1
 * @max 100
 *
 * @param bgsVolume
 * @text BGSボリューム
 * @desc ピッカー表示中にBGSボリュームを変更（-1で無変更）
 * @default -1
 * @type number
 * @min -1
 * @max 100
 * 
 * @param seVolume
 * @text SEボリューム
 * @desc ピッカー表示中にSEボリュームを変更（-1で無変更）
 * @default -1
 * @type number
 * @min -1
 * @max 100
 *
 * @param meVolume
 * @text MEボリューム
 * @desc ピッカー表示中にMEボリュームを変更（-1で無変更）
 * @default -1
 * @type number
 * @min -1
 * @max 100
 *
 *
 */
//============================================================================= 


var TRP_CORE = TRP_CORE || {};

(function(){
'use strict';


//Editor
function ParticleEditor(){this.initialize.apply(this,arguments)}!function(){"use strict";navigator.userAgent.match(/Macintosh|Mac/),ParticleEditor.GUIDE_TEXTS={},ParticleEditor.EDITING_EMITTER=null,ParticleEditor.prototype=Object.create(PIXI.Container.prototype),ParticleEditor.prototype.constructor=ParticleEditor,ParticleEditor.prototype.initialize=function(a,b,c){},ParticleEditor.prototype.initMembers=function(){this._id="",this._mainId="",this._subId="",this._particle=null,this._terminated=!1,this._data=null,this._subData=null,this._config=null,this._subConfig=null,this._image="",this._lastEditingIndex=-1,this._editingIndex=-1,this._particleCount=0,this._particleCountInterval=0,this._commands=[],this._menuCommands=[],this._saveButton=null,this._hiddenButton=null,this._guideSprite=null,this._guideCache=null,this._countHandler=null,this._keydownListener=null,this._keyupListener=null,this._keyCode=0,this._key="",this._parts=[],this._particleCountSprite=null,this._inputtingWords=null,this._colorPicker=null,this._imagePicker=null,this._tilePicker=null,this._animationPicker=null,this._presetPicker=null,this._loadPicker=null,this._activePicker=null,this._menuSprites=[]},ParticleEditor.prototype.terminate=function(){this._terminated=!0;var a=ParticleEditor.EDITING_EMITTER;ParticleEditor.EDITING_EMITTER=null,this._data&&(delete this._data.editing,delete this._data.editingSubData,a&&a._emitter&&a._emitter._emitterLife>=0&&(this._data.clear=!0)),this._subData&&delete this._subData.editing,this._countHandler=null,this._particle=null,this._data=null,this._subData=null,this._config=null,this.removeEventListeners(),a=null},ParticleEditor.prototype.isTerminated=function(){return this._terminated},ParticleEditor.prototype.trySearchImageNames=function(){if(!parameters.imageNames){for(var f=require("fs"),c=require("path"),k=c.dirname(process.mainModule.filename),d=c.join(k,ParticleEditor.IMAGE_PATH),g=[],l=[],e=f.readdirSync(d),h=e.length,a=0;a<h;a=a+1|0){var b=e[a],i=c.join(d,b);f.statSync(i).isFile()&&/.*\.png$/.test(b)&&(0!==b.indexOf("_ANIM_")?g.push(b.replace(".png","")):l.push(b.replace(".png","")))}g.sort(),parameters.imageNames=g,parameters.splitAnimImageNames=l,d=c.join(k,ParticleEditor.ANIMATION_PATH);for(var j=[],e=f.readdirSync(d),h=e.length,a=0;a<h;a=a+1|0){var b=e[a],i=c.join(d,b);f.statSync(i).isFile()&&/.*\.png$/.test(b)&&j.push(b.replace(".png",""))}j.sort(),parameters.animationNames=j}},ParticleEditor.prototype.targetData=function(){return this._subData||this._data},ParticleEditor.prototype.registerKeyListeners=function(){var a=this._onKeyDown.bind(this);this._keydownListener=a,document.addEventListener("keydown",a),a=this._onKeyUp.bind(this),this._keyupListener=a,document.addEventListener("keyup",a),a=this.processCopy.bind(this),this._copyListener=a,document.addEventListener("copy",a),a=this.processPaste.bind(this),this._pasteListener=a,document.addEventListener("paste",a)},ParticleEditor.prototype.removeEventListeners=function(){this._keydownListener&&(document.removeEventListener("keydown",this._keydownListener),this._keydownListener=null),this._keyupListener&&(document.removeEventListener("keyup",this._keyupListener),this._keyupListener=null),this._copyListener&&(document.removeEventListener("copy",this._copyListener),this._copyListener=null),this._pasteListener&&(document.removeEventListener("paste",this._pasteListener),this._pasteListener=null)},ParticleEditor.prototype._onKeyDown=function(a){if((a.ctrlKey||a.metaKey)&&a.keyCode===e.g){this.processHide();return}if(this._activePicker){this._activePicker.onKeyDown(a.keyCode,a);return}a.ctrlKey||a.metaKey?this._onControlKeyDown(a):a.ctrlKey||a.altKey||(this._keyCode=a.keyCode,this._key=a.key)},ParticleEditor.prototype._onControlKeyDown=function(a){a.keyCode===e.w&&this.processQuit()},ParticleEditor.prototype._onKeyUp=function(a){},ParticleEditor.prototype.resetInputingWords=function(){""!==this._inputtingWords&&(this._inputtingWords="",this.prepareInputtingCandidates())},ParticleEditor.prototype.prepareInputtingCandidates=function(){this._inputtingCandidates=this._commands.concat(),this._inputtingCandidates.push("SCREEN")},ParticleEditor.prototype.pushInputtingCharacter=function(g){this._inputtingWords+=g;for(var d=this._inputtingWords,c=this._inputtingCandidates,e=c.length,b=null,a=0;a<e;a=a+1|0){var f=c[a];0!==f.indexOf(d)?(c.splice(a,1),a-=1,e-=1):b=b||f}if(!b){this.prepareInputtingCandidates();for(var e=(c=this._inputtingCandidates).length;d.length>0&&!b;){for(var a=0;a<e;a=a+1|0)if(0===c[a].indexOf(d)){b=c[a];break}b||(d=d.substr(1))}if(b)for(var a=e-1;a>=0;a=a-1|0)0===c[a].indexOf(d)&&c.splice(a,1);this._inputtingWords=d}b&&this.tryInputtingFirstHit(b)},ParticleEditor.prototype.tryInputtingFirstHit=function(b){var c=this._inputtingWords===b;if("SCREEN"===b){if(c){var a=this._commands.indexOf("RECT");this.targetData().params.rect=[-Graphics.width/2,-Graphics.height/2,Graphics.width,Graphics.height],this._parts[a].refreshParts(),this.startEditing(a)}}else{var a=this._commands.indexOf(b);this.startEditing(a)}},ParticleEditor.prototype.update=function(){if(!this._terminated){if(this.updateParticleCount&&this.updateParticleCount(),this._activePicker){this._activePicker.update(),this._keyCode=0,this._key="";return}for(var c=this.children,a=c.length-1;a>=0;a-=1){var b=c[a];b&&b.update&&b.update()}TouchInput.isTriggered()||TouchInput.isPressed()?this.processTouch():(Input._latestButton||this._keyCode)&&this.processInput(),this._keyCode=0,this._key=""}},ParticleEditor.prototype.processTouch=function(){for(var f=this._parts,c=f.length,d=TouchInput.x,e=TouchInput.y,i=ParticleEditor.SELECTOR_MARGIN,a=0;a<c;a=a+1|0){var g=f[a];if(g.processTouch(d,e,i)){TouchInput.clear(),this.startEditing(a);return}this._editingIndex===a&&g.hasSaveData()&&this.saveEditingParams()}for(var h=this._menuSprites,c=h.length,a=0;a<c;a=a+1|0){var b=h[a];if(b.visible&&b.x<=d&&d<=b.x+b.width&&b.y<=e&&e<=b.y+b.height){this.processMenuCommand(a),TouchInput.clear();return}}},ParticleEditor.prototype.processInput=function(){if(Input.isRepeated("down")&&98!==this._keyCode){var a=this._editingIndex;do a=(a+1)%this._parts.length;while(this._parts[a].isSpawnParam())this.startEditing(a),this.resetInputingWords()}else if(Input.isRepeated("up")&&104!==this._keyCode){var a=this._editingIndex;do(a-=1)<0&&(a=this._parts.length-1);while(this._parts[a].isSpawnParam())this.startEditing(a),this.resetInputingWords()}else if(this._keyCode>=e.alphabet&&this._keyCode<=e.alphabetEnd)this.pushInputtingCharacter(String.fromCharCode(this._keyCode));else{var b=this._editingIndex>=0?this.editingParts():null;b?b.processInput(this._keyCode,this._key)?(this.selectParts(this._editingIndex),b.hasSaveData()&&this.saveEditingParams()):this.endEditing():Input.isTriggered("cancel")&&96!==this._keyCode&&(this._saveButton.opacity<255?this.processQuit():SoundManager.playBuzzer()),0!==this._keyCode&&this.resetInputingWords()}},ParticleEditor.prototype.saveEditingParams=function(){var a=this.editingParts();if(a){this.supplyEditingParams(a);var b=a.handOverSaveData();b&&(this.saveEditingData(b),a.didSaveParams())}},ParticleEditor.prototype.supplyEditingParams=function(a){},ParticleEditor.prototype.saveEditingData=function(b){var a=this.editingParts();a&&this._saveEditingData(a._title,b)},ParticleEditor.prototype._saveEditingData=function(b,a){a.unshift(b),a.unshift(this._id),this._applySaveData(a),this._saveButton.opacity=255},ParticleEditor.prototype._applySaveData=function(a){if(this._subData){a.shift();var c=a.shift(),b=this._subData;this._particle.tryUpdateSpawnType(c,b),b.params[c]=a,b.pChanged=!0}else this._particle.particleUpdate(a)},ParticleEditor.prototype.startEditing=function(b){if(!(b<0)&&this._editingIndex!==b){SoundManager.playCursor();var a=this._parts[b];if(this._editingIndex>=0&&(this._endEditing(),(b=this._parts.indexOf(a))<0)){this._editingIndex=-1,this.deselectParts();return}if(!a){this.refreshPartsHidden();return}this._editingIndex=b,a.startEditing();var c=a.title();if(this.showGuideWithTitle(c),"color"===a.type()&&a.setPicker(this._colorPicker),a.isSpawnParam()){var d=a.paramSaveData();this.saveEditingData(d)}this.refreshPartsHidden(),this.selectParts(b)}},ParticleEditor.prototype.spawnType=function(){var a=this._config.spawnType,b=this.targetData().params;return b.rect?a="rect":b.circle?a="circle":b.ring?a="ring":b.burst?a="burst":(b.pos||b.point||b.spawnPos)&&(a="point"),("position"===a||"pos"===a)&&(a="point"),a},ParticleEditor.prototype.refreshPartsHidden=function(){for(var d=this.spawnType(),c=this._parts,e=c.length,a=0;a<e;a=a+1|0){var b=c[a];b.isSpawnParam()&&b._title!==d?b.hide():b.show()}},ParticleEditor.prototype.endEditing=function(){SoundManager.playCancel(),this._lastEditingIndex=this._editingIndex,this._endEditing(),this._editingIndex=-1,this.deselectParts()},ParticleEditor.prototype._endEditing=function(){var a=this.editingParts();a&&(a.endEditing(),a.hasSaveData()&&this.saveEditingParams())},ParticleEditor.prototype.editingParts=function(){return this._parts[this._editingIndex]},ParticleEditor.prototype.createSelectorSprite=function(){var c=b.LINE_HEIGHT,d=new Bitmap(c,c);d.fillAll("rgb(255,255,255)");var a=new Sprite(d);a.opacity=150,this._selectorSprite=a,this.addChild(a),a.visible=!1},ParticleEditor.SELECTOR_MARGIN=20,ParticleEditor.prototype.selectParts=function(c){var b=this._parts[c],a=this._selectorSprite,d=a.bitmap.height;a.y=b.y,"right"===b._align?(a.anchor.set(1,0),a.x=Graphics.width):(a.anchor.set(0,0),a.x=0),a.scale.x=(b._width+ParticleEditor.SELECTOR_MARGIN)/d,a.visible=!0},ParticleEditor.prototype.deselectParts=function(){this._selectorSprite.visible=!1},ParticleEditor.POS_PARAMS=["point","rect","circle","ring","burst"],ParticleEditor.prototype.addValueParts=function(c,d,e,f,a,g){var h=new b.ValueParam(d,e,f,a,g);return this._addParts(c,h,a)},ParticleEditor.prototype._addParts=function(b,a,c){return a.refresh(),this.addChild(a),this._commands.push(c.toUpperCase()),this._parts.push(a),a.y=b,a._height},ParticleEditor.prototype.createMenuButtons=function(){var a=this._menuCommands,b=0;a.push("processQuit"),this.menuButtonSprite(b++,54,"rgb(100,100,100)","\u7D42\u4E86&\u30B3\u30D4\u30FC","(ctrl+W)"),this._saveButton=new Sprite},ParticleEditor.prototype.usePickingMenuButtons=function(){return!0},ParticleEditor.BUTTON_FONT_SIZE=16,ParticleEditor.BUTTON_WIDTH=144,ParticleEditor.BUTTON_MIN_HEIGHT=24,ParticleEditor.prototype.menuButtonSprite=function(i,j,k,l,m){var b=ParticleEditor.BUTTON_FONT_SIZE,e=b-2,g=2,n=b+e+2*g,h=Math.max(ParticleEditor.BUTTON_MIN_HEIGHT,n),c=ParticleEditor.BUTTON_WIDTH,a=new Bitmap(c,h),d=new Sprite(a);this._menuSprites.push(d),this.addChild(d),a.fillAll("rgba(255,255,255,0.8)");var f=g;return a.fontSize=b,a.textColor=k,a.outlineWidth=0,a.drawText(l,0,f,c,b,"center"),f+=b,a.fontSize=e,a.drawText(m,0,f,c,e,"center"),d.x=Graphics.width-4-i*(c+4)-c-j,d.y=Graphics.height-4-h,d},ParticleEditor.prototype.hideButtonSprite=function(){var b=new Bitmap(42,30),c=new Sprite(b);this._menuSprites.push(c),this.addChild(c),c.x=Graphics.width-42-5,this._menuSprites[0],c.y=Graphics.height-30-4;var a=b._context;a.save(),a.fillStyle="rgba(255,255,255,0.8)",a.beginPath(),a.moveTo(5,0),a.lineTo(37,0),a.arc(37,5,5,-90*Math.PI/180,0,!1),a.lineTo(42,25),a.arc(37,25,5,0,90*Math.PI/180,!1),a.lineTo(5,30),a.arc(5,25,5,90*Math.PI/180,180*Math.PI/180,!1),a.lineTo(0,5),a.arc(5,5,5,180*Math.PI/180,270*Math.PI/180,!1),a.fill(),a.restore();var d=Math.floor(9)+2;a.save(),a.fillStyle=a.strokeStyle="rgb(160,160,160)",a.lineWidth=2,a.beginPath(),a.arc(21,d,4,0,2*Math.PI,!1),a.fill(),a.beginPath(),a.arc(21,d+9,15,-140*Math.PI/180,-40*Math.PI/180),a.arc(21,d-9,15,40*Math.PI/180,140*Math.PI/180),a.closePath(),a.stroke(),a.restore(),b.fontSize=10,b.textColor="black",b.outlineWidth=0,b.drawText("ctrl+G",0,18,42,12,"center")},ParticleEditor.prototype.processMenuCommand=function(a){this[this._menuCommands[a]]()},ParticleEditor.prototype.processSave=function(){this._saveButton.opacity<255||(this.executeSave(),SoundManager.playSave(),this._saveButton.opacity=100)},ParticleEditor.prototype.processQuit=function(){this.executeQuit()},ParticleEditor.prototype.executeQuit=function(){this.terminate(),SoundManager.playCancel()},ParticleEditor.prototype.processComplete=function(){this.processSave(),this.executeQuit()},ParticleEditor.prototype.startPicking=function(a){this.endEditing(),this._activePicker=a,this.addChild(a),this.hideMenu(),this.hideParts();var b=a.x+a._width;this.slideNumSpritesX(b),this._guideSprite&&(this._guideSprite.visible=!1)},ParticleEditor.prototype.didEndPicking=function(){var a=-this._activePicker.x-this._activePicker._width;this.slideNumSpritesX(a),this._activePicker.parent.removeChild(this._activePicker),this._activePicker=null,this.showParts(),this.showMenu(),this._lastEditingIndex>=0&&this.startEditing(this._lastEditingIndex),this._guideSprite&&(this._guideSprite.visible=!0)},ParticleEditor.prototype.slideNumSpritesX=function(d){for(var c,b=SceneManager._scene._particleSystem,a=0;a<3;a=a+1|0)(c=0===a?this._particleCountSprite:1===a?b?b._countSprite:null:b?b._limitedSprite:null)&&(c.x+=d)},ParticleEditor.prototype.hideParts=function(){for(var b=this._parts,c=b.length,a=0;a<c;a=a+1|0)b[a].alpha=.3},ParticleEditor.prototype.showParts=function(){for(var b=this._parts,c=b.length,a=0;a<c;a=a+1|0)b[a].alpha=1},ParticleEditor.prototype._addPicker=function(a){this.addChild(a),a.x=10,a.y=0},ParticleEditor.PARTICLE_NUM_HEADER_WIDTH=128,ParticleEditor.PARTICLE_NUM_HEIGHT=20,ParticleEditor.prototype.createNumInfo=function(){var a=new Sprite;this._particleCountSprite=a},ParticleEditor.PARTICLE_COUNT_INTERVAL=10,ParticleEditor.prototype.updateParticleCount=function(){},ParticleEditor.GUIDE_TEXT_MARGIN=5,ParticleEditor.GUIDE_TEXT_FONT_SIZE=14,ParticleEditor.GUIDE_TEXT_LINE_HEIGHT=18,ParticleEditor.GUIDE_TEXT_MAX_ROW=12,ParticleEditor.prototype.createGuideSprite=function(){var c=ParticleEditor.GUIDE_TEXT_MAX_ROW,d=ParticleEditor.GUIDE_TEXT_FONT_SIZE,e=ParticleEditor.GUIDE_TEXT_LINE_HEIGHT,f=$gameSystem.isJapanese()?300:500,g=e*c+2*ParticleEditor.GUIDE_TEXT_MARGIN,b=new Bitmap(f,g),a=new Sprite(b);this.addChild(a),this._guideSprite=a,a.anchor.set(0,1),a.visible=!1,a.x=5,a.y=Graphics.height-ParticleEditor.GUIDE_TEXT_LINE_HEIGHT-20,b.fontSize=d,b.outlineColor="black",b.outlineWidth=4},ParticleEditor.prototype.guideTexts=function(a){return ParticleEditor.GUIDE_TEXTS[a]},ParticleEditor.prototype.showGuideWithTitle=function(f){var c=this._guideSprite,d=this.guideTexts(f);if(!d||0===d.length){c.visible=!1;return}if(c.visible=!0,this._guideCache!==f){this._guideCache=f;var a=c.bitmap;a.clear(),a.fillAll("rgba(0,0,0,0.3)");for(var g=ParticleEditor.GUIDE_TEXT_MARGIN,h=a.width,i=ParticleEditor.GUIDE_TEXT_LINE_HEIGHT,k=Math.min(ParticleEditor.GUIDE_TEXT_MAX_ROW,d.length),e=ParticleEditor.GUIDE_TEXT_MARGIN,b=0;b<k;b=b+1|0){var j=d[b];j?(0===b?a.textColor="rgb(255,200,150)":1===b&&(a.textColor="white"),a.drawText(j,g,e,h-2*g,i)):a.textColor="rgb(220,220,255)",e+=i}e+=g,c.setFrame(0,0,h,e)}},ParticleEditor.prototype.executeSave=function(){},ParticleEditor.prototype.editingDataObject=function(){return{}},ParticleEditor.prototype.writeSaveData=function(c,a=this.saveFilePath()){var d=require("fs"),b=require("path"),e=b.dirname(process.mainModule.filename);a=b.join(e,a),d.writeFileSync(a,c)},ParticleEditor.prototype.saveFilePath=function(){return ParticleEditor.FILE_PATH},ParticleEditor.prototype.adjustSpawnParamData=function(a,b){},ParticleEditor.prototype.writeHelpFile=function(){},ParticleEditor.helpFileListText=function(a,b,c){},ParticleEditor.prototype.helpPluginExtraHelpTexts=function(){},ParticleEditor.prototype.helpPluginCommandTexts=function(a=$dataTrpParticles){},ParticleEditor.prototype.processCopy=function(a){},ParticleEditor.prototype.processPaste=function(a){},ParticleEditor.prototype.hideMenu=function(){for(var b=this._menuSprites,c=b.length,a=0;a<c;a=a+1|0)b[a].opacity=76.5},ParticleEditor.prototype.showMenu=function(){for(var b=this._menuSprites,c=b.length,a=0;a<c;a=a+1|0)b[a].opacity=255},ParticleEditor.prototype.processHide=function(){1===this.alpha?this.alpha=.25:this.alpha=1,SoundManager.playCursor()},ParticleEditor.ParticleParam=function(){this.initialize.apply(this,arguments)};var b=ParticleEditor.ParticleParam;b.FONT_SIZE=18,b.LINE_HEIGHT=b.FONT_SIZE+4,b.prototype=Object.create(PIXI.Container.prototype),b.prototype.constructor=b,b.prototype.initialize=function(c,d,e,a){PIXI.Container.call(this),this.width=Graphics.width,this.height=Graphics.height,this._data=c,this._config=d,this._configNames=e,this._title=a,this._hidden=!1,this._align="right",this._isSpawnParam=ParticleEditor.POS_PARAMS.contains(a),this._width=0,this._height=b.LINE_HEIGHT,this._titleWidth=0,this._titleSprite=null,this._parts=[],this._textsCache=[],this._saveData=null,this._editingIndex=-1,this._inputting=""},b.prototype.title=function(){return this._title},b.prototype.type=function(){return"value"},b.prototype.isSpawnParam=function(){return this._isSpawnParam},b.prototype.refreshWithConfigData=function(a){this.refresh()},b.prototype.refresh=function(){this.refreshParts()},b.prototype.titleColor=function(){return this._isSpawnParam?"rgb(255,200,100)":"rgb(100,200,255)"},b.prototype.partsColor=function(){return this._isSpawnParam?"rgb(255,255,200)":"rgb(200,255,255)"},b.prototype.titleText=function(){return"["+this._title+"]"},b.prototype.createTitleSprite=function(){var a=new Sprite;this.addChild(a),this._titleSprite=a,this.refreshTitleSprite()},b.prototype.refreshTitleSprite=function(){var c=this.titleText(),d=this._titleSprite,a=d.bitmap,e=b.FONT_SIZE,f=c.length*e+4,g=e+4;a&&a.width<f?a.clear():(a=new Bitmap(f,g),d.bitmap=a),d.anchor.set("right"===this._align?1:0,0),a.fontSize=e,a.outlineColor="black",a.outlineWidth=5,a.textColor=this.titleColor(),a.drawText(c,0,0,f,g,this._align),this._titleWidth=a.measureTextWidth(c)},b.prototype.setAlign=function(a){this._align=a||"right"},b.prototype.refreshParts=function(){for(var b=this._parts,d=this.partsNum(),a=0;a<d;a=a+1|0){var e=this.partsText(a),c=b[a];c?c.visible=!0:(c=this.createPartsSprite(),this.addChild(c),b[a]=c,this._textsCache[a]=null),this.checkChangeFromCache(e,a)&&this.refreshPartsText(c,e,a)}for(var f=b.length;a<f;a=a+1|0)b[a].parent.removeChild(b[a]);b.length=d,this.layout()},b.prototype.checkChangeFromCache=function(a,b){return this._textsCache[b]!==a&&(this._textsCache[b]=a,!0)},b.prototype.partsNum=function(){return 1},b.prototype.partsText=function(a){},b.prototype.defaultValue=function(){return 0},b.prototype.pushSaveDataParams=function(a){},b.prototype.configValue=function(c,a){var b=c.split(".");for(a=a||this._config;b.length>0&&a;)a=a[b.shift()];return a||this.defaultValue()},b.prototype.defaultValue=function(){return 0},b.MAX_PARTS_WIDTH=128,b.prototype.maxPartsWidth=function(){return b.MAX_PARTS_WIDTH},b.prototype.createPartsSprite=function(){var c=b.FONT_SIZE,d=this.maxPartsWidth(),a=new Bitmap(d,c+4);return a.fontSize=c,a.outlineColor="black",a.outlineWidth=5,a.textColor=this.partsColor(),new Sprite(a)},b.prototype.refreshPartsText=function(b,c,g){var a=b.bitmap;a.clear();var d=a.width,e=a.height,f=Math.min(d,a.measureTextWidth(c)+2);a.drawText(c,1,0,d-2,e),b._frame.width=f,b._refresh()},b.prototype.layout=function(){this._titleSprite||this.createTitleSprite();var a,d="right"===this._align,e=this._titleSprite;d?a=Graphics.width-5:(a=5,e.x=a,a+=this._titleWidth+5);var f=this._parts,g=f.length;if(d)for(var b=g-1;b>=0;b=b-1|0){var c=f[b];c.visible=!this._hidden,c.visible&&(a-=c.width,c.x=a,a-=5)}else for(var b=0;b<g;b=b+1|0){var c=f[b];c.visible=!this._hidden,c.visible&&(c.x=a,a+=c.width+5)}var e=this._titleSprite;d?(e.x=a,this._width=Graphics.width-a+this._titleWidth):this._width=a-5},b.prototype.show=function(){this._hidden&&(this._hidden=!1,this.layout())},b.prototype.hide=function(){this._hidden||(this._hidden=!0,this.layout())},b.prototype.processTouch=function(b,d,e){if(d<this.y||d>this.y+this._height)return!1;if("right"===this._align){if(b<Graphics.width-this._width-e)return!1}else if(this._width+e<b)return!1;for(var f=this._parts,g=f.length,a=0;a<g;a=a+1|0){var c=f[a];if(c.x<=b&&b<=c.x+c.width){this.setEditing(a);break}}return!0},b.prototype.startEditing=function(){this.setEditing(Math.max(0,this._editingIndex))},b.prototype.setEditing=function(b){var c=this._parts,d=c.length;b%=d,this._editingIndex=b,this.clearInputting();for(var a=0;a<d;a=a+1|0)c[a].opacity=a===b?255:150;this.refreshParts()},b.prototype.endEditing=function(){var c=this._editingIndex>=0;this._editingIndex=-1;for(var b=this._parts,d=b.length,a=0;a<d;a=a+1|0)b[a].opacity=255;c&&this.refreshParts()},b.KEY_CODE={backSpace:8,tab:9,delete:46,num:48,alphabet:65,a:65,c:67,e:69,f:70,g:71,i:73,l:76,p:80,s:83,t:84,v:86,w:87,alphabetEnd:90,tenkey:96,minus:189,tenkeyMinus:109,dot:190,tenkeyDot:110,at:192,bracket:219};var e=b.KEY_CODE;b.prototype.processInput=function(b,c){if(Input.isTriggered("cancel")&&96!==b)return!1;if(Input.isTriggered("ok"))this.clearInputting();else if(b===e.tab||Input.isTriggered("right")&&102!==b){var a=this._editingIndex+1;a>this._parts.length-1&&(a=0),this.setEditing(a)}else if(Input.isTriggered("left")&&100!==b){var a=this._editingIndex-1;a<0&&(a=this._parts.length-1),this.setEditing(a)}else b===e.backSpace?(this.clearInputting(!0),this.applyEditing()):this._processCharacterInput(b,c);return!0},b.prototype._processCharacterInput=function(a){var c=e.num,d=e.tenkey,b=null;a>=c&&a<c+10?b=Number(a-c):a>=d&&a<d+10?b=Number(a-d):a===e.minus||a===e.tenkeyMinus?(b="-",this._inputting=""):a!==e.dot&&a!==e.tenkeyDot||this._inputting.contains(".")||(b="."),null!==b&&(this._inputting+=b,this.applyEditing())},b.prototype.clearInputting=function(){this._inputting=""},b.prototype.applyEditing=function(){var a=this._editingIndex;if(!(a<0)){var c=this.valueWithInputting(),b=this.paramSaveData(a,c);b&&this.saveToParam(b),this.refreshParts()}},b.prototype.valueWithInputting=function(){return this._inputting,"color"===this.type()?this._inputting:Number(this._inputting)},b.prototype.value=function(a){return 0},b.prototype.shouldSave=function(a){return!0},b.prototype.isEqualsToLast=function(){},b.prototype.saveToParam=function(a){if(!this.shouldSave(a))return!1;(a=a||this.paramSaveData())&&(this._saveData=a)},b.prototype.hasSaveData=function(){return!!this._saveData},b.prototype.handOverSaveData=function(){var a=this._saveData;return this._saveData=null,a},b.prototype.didSaveParams=function(){},b.ValueParam=function(){this.initialize.apply(this,arguments)};var c=b.ValueParam;c.prototype=Object.create(b.prototype),c.prototype.constructor=c,c.prototype.initialize=function(a,c,d,e,f){b.prototype.initialize.call(this,a,c,d,e),this._headers=f},c.prototype.partsHeader=function(b){var a=this._headers;return a&&0!==a.length?1===a.length?a[0]:a[b]:""},c.prototype.partsNum=function(){return this._configNames.length},c.prototype.partsText=function(b){var a=b===this._editingIndex?this._inputting:String(this.value(b));""===a&&(a=String(this.value(b)));var c=this.partsHeader(b);return c&&(a=c+":"+a),a},c.prototype.paramSaveData=function(c,a){var b=this.values();if("frequency"===this._configNames[0]&&0===a)return null;if(void 0!==a){if(isNaN(a))return null;b[c]=Number(a)}return b},c.prototype.values=function(){for(var b=[],c=this._parts.length,a=0;a<c;a=a+1|0){var d=this.value(a);b.push(d)}return b},c.prototype.value=function(a){var d=this._title,b=this._data.params[d];if(void 0!==b)return b[a];var c=this.configValue(this._configNames[a]);return void 0!==c?c:0},c.prototype.pushSaveDataParams=function(g){for(var e=this.paramSaveData(),h=e.length,a=0;a<h;a=a+1|0){for(var i=e[a],f=this._configNames[a],c=(f=f.replace("point","pos")).split("."),b=g;c.length>1;){var d=c.shift();b[d]||(b[d]={}),b=b[d]}b[c[0]]=i}},c.prototype.refreshWithConfigData=function(d){for(var e=this._configNames,g=e.length,c=this._data.params[this._title],a=0;a<g;a=a+1|0){var h=e[a],f=this.configValue(h,d);if(null==f){c&&delete this._data.params[this._title];return}c||(c=this._data.params[this._title]=[]),c[a]=f}b.prototype.refreshWithConfigData.call(this,d)},b.prototype.applyAll=function(){this._configNames.length;var a=this.paramSaveData();a&&this.saveToParam(a)};var a=ParticleEditor.PickerBase=function(){this.initialize.apply(this,arguments)};a.TINT_SEVERAL=11206655,a.TINT_NORMAL=16777130,a.TINT_SEARCH=11206570,a.LAYOUT={marginTopBottom:5},a.prototype=Object.create(PIXI.Container.prototype),a.prototype.constructor=a,a.prototype.initialize=function(){PIXI.Container.call(this),this.initMembers(),this.createBackSprite(),this.createHighlightBitmap(),this.createGuideSprite(),this.createHeaderSprite()},a.prototype.initMembers=function(){this._header="",this._headerSprite=null,this._topRow=0,this._maxRow=0,this._dispRows=0,this._maxTopRow=0,this._owner=null,this._severalMode=!1,this._severalModeSwitched=!1,this._selectingIndexes=[],this._backSprite=null,this._highlightSprites=[],this._highlightBitmap=null,this._guideSprite=null,this._searchSprite=null,this._listType=null,this._categoryIndex=0},a.prototype.startPicking=function(b){if(this.visible=!0,this._owner=b,Input.clear(),TouchInput.clear(),this.registerWheelListener(),this.refresh(),this._headerSprite.opacity=255,this._headerSprite.visible=!0,this._guideSprite){var a=this._guideSprite;a.x=this._width+10,a.y=Graphics.height-50+this._topRow*this.itemHeight()}},a.prototype.end=function(){this._owner&&this._owner.didEndPicking(),this._owner=null,this.resignWheelListener(),this.visible=!1,SoundManager.playCancel(),Input.clear(),TouchInput.clear()},a.prototype.refresh=function(){var a=this.categoryType();this._listType!==a&&(this.setListType(a),this.isReady()&&this._refresh())},a.prototype.isReady=function(){return!0},a.prototype._refresh=function(){var b=this.maxColumns(),d=this.itemWidth(),e=this.itemHeight(),c=a.LAYOUT.marginTopBottom,f=this.maxItems(),g=this.itemMarginX(),h=this.itemMarginY();this._maxRow=Math.ceil(f/b),this._dispRows=Math.floor((Graphics.height-2*c)/(e+h)),this._maxTopRow=Math.max(0,this._maxRow-this._dispRows-1),this._maxRow,this._width=d*b+g*(b-1)+2*c,this._height=Graphics.height,this.refreshBackSprite(),this.refreshItems()},a.prototype.setListType=function(a){this._listType=a,this.refreshHeaderSprite()},a.prototype.refreshItems=function(){},a.prototype.maxColumns=function(){return 4},a.prototype.itemHeight=function(){return 48},a.prototype.itemWidth=function(){return 48},a.prototype.maxItems=function(){return 0},a.prototype.guideTexts=function(){return null},a.prototype.itemMarginX=function(){return 0},a.prototype.itemMarginY=function(){return 0},a.prototype.categoryType=function(){return 1},a.prototype.headerText=function(){return""},a.prototype.maxCategories=function(){return 1},a.prototype.isCategoryValid=function(a){return!0},a.prototype.isSeveralModeValid=function(){return!0},a.prototype.applyData=function(){},a.prototype.deselectIndex=function(c){if(!(c<0)){var a=this._selectingIndexes.indexOf(c);if(!(a<0)){this._selectingIndexes.splice(a,1);var b=this._highlightSprites[a];b&&(this._highlightSprites.splice(a,1),b.parent.removeChild(b))}}},a.prototype.didPickData=function(a){this._selectingIndexes.contains(a)?this.deselectIndex(a):this.setSelectingIndex(a),this.applyData()},a.prototype.update=function(){this._headerSprite.visible&&this.updateHeaderSprite(),this._searchSprite&&this._searchSprite.opacity>0&&(this._searchSprite.opacity-=3),Input._latestButton?this.processInput():TouchInput.isLongPressed()&&this.isSeveralModeValid()?this._severalModeSwitched||(this.switchSelectingMode(),this._severalModeSwitched=!0,0===this._selectingIndexes.length&&this.processTouch(),this.applyData()):TouchInput.isTriggered()&&(this.processTouch(),this._severalModeSwitched=!1)},a.prototype.onKeyDown=function(b,a){if(!a.ctrlKey&&!a.metaKey&&b>=e.alphabet&&b<=e.alphabetEnd){var c=a.key;this.search(c)}},a.prototype.search=function(a){},a.prototype.didSuccessSearch=function(c){this.setTopIndex(c);var b=this._searchSprite;b||(b=this.createHighlightSprite(),this._searchSprite=b,b.tint=a.TINT_SEARCH),this.setHighlightSpritePosition(b,c),b.opacity=150},a.prototype.processTouch=function(){var c=TouchInput.x-this.x,g=TouchInput.y-this.y;if(c<0||c>this._width){this.end();return}for(var j=this.maxColumns(),k=this.maxItems(),e=a.LAYOUT.marginTopBottom,l=this.itemMarginX(),m=this.itemMarginY(),n=this.itemWidth(),o=this.itemHeight(),h=n+l,i=o+m,d=e/2,f=e/2,b=0;b<k;b=b+1|0)if(0===b||(b%j==0?(d=e/2,f+=i):d+=h),d<=c&&c<=d+h&&f<=g&&g<=f+i){this.didPickData(b);return}},a.prototype.setSelectingIndex=function(c){SoundManager.playCursor();var b=null,d=c<0;if(this._severalMode){if(this._selectingIndexes.contains(c))return;this._selectingIndexes.push(c)}else if(this._selectingIndexes[0]=c,b=this._highlightSprites[0],d){b&&(this._highlightSprites.length=0,b.parent.removeChild(b));return}d||(b||(b=this.createHighlightSprite(),this._highlightSprites.push(b)),b.tint=this._severalMode?a.TINT_SEVERAL:a.TINT_NORMAL,this.setHighlightSpritePosition(b,c))},a.prototype.setHighlightSpritePosition=function(b,c){var d=this.maxColumns(),e=a.LAYOUT.marginTopBottom,h=this.itemMarginX(),i=this.itemMarginY(),j=this.itemWidth(),k=this.itemHeight(),f=c%d,g=Math.floor(c/d);b.visible=!0,b.x=e+f*j+(f-1)*h,b.y=e+g*k+(g-1)*i},a.prototype.deselectAll=function(){for(var b=this._highlightSprites,d=b.length,a=0;a<d;a=a+1|0){var c=b[a];c.parent.removeChild(c)}b.length=0,this._selectingIndexes.length=0},a.prototype.createHeaderSprite=function(){var a=new Bitmap(256,24),b=new Sprite(a);a.fontSize=21,a.textColor="white",a.outlineWidth=6,this.addChild(b),this._headerSprite=b},a.prototype.refreshHeaderSprite=function(){var a=this.headerText();this.showHeaderSprite(a)},a.prototype.showHeaderSprite=function(c,d="rgb(0,0,200)"){if(c!==this._header){this._header=c;var b=this._headerSprite,a=b.bitmap;a.clear(),a.outlineColor=d,a.drawText(c,1,0,a.width-2,a.height),b.opacity=255,b.visible=!0,this.addChild(b)}},a.prototype.updateHeaderSprite=function(){this._headerSprite.opacity>200?this._headerSprite.opacity-=1:this._headerSprite.opacity-=5,this._headerSprite.opacity<=0&&(this._headerSprite.visible=!1)},a.prototype.createBackSprite=function(){var a,b;b=new Bitmap(16,16),a=new Sprite(b),this.addChild(a),this._backSprite=a,a.opacity=150,b.fillAll("black")},a.prototype.refreshBackSprite=function(){var a=this._width,b=Graphics.height;this._backSprite.scale.set(a/16,b/16)},a.prototype.createHighlightBitmap=function(){var a=new Bitmap(16,16);a.fillAll("white"),this._highlightBitmap=a},a.prototype.createHighlightSprite=function(){var c=this.itemHeight(),d=this._width/this.maxColumns(),b=this._highlightBitmap,a=new Sprite(b);return this.addChild(a),a.opacity=100,a.scale.set(d/b.width,c/b.height),a},a.prototype.createGuideSprite=function(){var a=this.guideTexts();if(a){var f=14,g=$gameSystem.isJapanese()?200:400,d=f+4,i=d*a.length,b=new Bitmap(g,i),e=new Sprite(b);this.addChild(e),this._guideSprite=e,e.anchor.set(0,1),b.fontSize=f,b.fillAll("rgb(0,0,150,0.6)");for(var h=0,j=a.length,c=0;c<j;c=c+1|0){var k=a[c];b.drawText(k,1,h,g-2,d),h+=d}}},a.prototype.setTopIndex=function(b){var a=Math.floor(b/this.maxColumns()).clamp(0,this._maxTopRow);this._topRow!==a&&(this._topRow=a,this.refreshPosition())},a.prototype.setTopRowNext=function(){var a=(this._topRow-1)*this.maxColumns();this.setTopIndex(a)},a.prototype.setTopRowPrevious=function(){var a=(this._topRow+1)*this.maxColumns();this.setTopIndex(a)},a.prototype.refreshPosition=function(){var c=this.y;this.y=-this._topRow*this.itemHeight(),0!==this._topRow&&(this.y-=a.LAYOUT.marginTopBottom);var b=this.y-c;this._backSprite.y-=b,this._guideSprite&&(this._guideSprite.y-=b),this._headerSprite&&(this._headerSprite.y-=b)},a.prototype.processInput=function(){Input.isTriggered("ok")||Input.isTriggered("cancel")?this.end():Input.isRepeated("up")?(SoundManager.playCursor(),this.setTopRowNext()):Input.isRepeated("down")?(SoundManager.playCursor(),this.setTopRowPrevious()):Input.isRepeated("left")?this.processPageDown():Input.isRepeated("right")&&this.processPageUp()},a.prototype.processPageUp=function(){if(SoundManager.playCursor(),this.maxCategories()>1){this._topRow=0;var a=this._categoryIndex;do(a+=1)>=this.maxCategories()&&(a=0);while(a!==this._categoryIndex&&!this.isCategoryValid(a))this._categoryIndex=a,this.refreshCategory()}else this._topRow=Math.min(this._maxTopRow,this._topRow+this._dispRows),this.refreshPosition()},a.prototype.processPageDown=function(){if(SoundManager.playCursor(),this.maxCategories()>1){this._topRow=0;var a=this._categoryIndex;do(a-=1)<0&&(a=this.maxCategories()-1);while(a!==this._categoryIndex&&!this.isCategoryValid(a))this._categoryIndex=a,this.refreshCategory()}else this._topRow=Math.max(0,this._topRow-this._dispRows),this.refreshPosition()},a.prototype.refreshCategory=function(){this.deselectAll(),this.refresh(),this.refreshPosition()},a.prototype.switchSelectingMode=function(){this.setSeveralMode(!this._severalMode)},a.prototype.setSeveralMode=function(a){this._severalMode!==a&&(this._severalMode=a,this.deselectAll())},a.prototype.registerWheelListener=function(){var a=this._onWheel.bind(this);this._wheelListener=a,document.addEventListener("wheel",a)},a.prototype.resignWheelListener=function(){this._wheelListener&&(document.removeEventListener("wheel",this._wheelListener),this._wheelListener=null)},a.prototype._onWheel=function(a){a.deltaY>0?this.setTopRowNext():a.deltaY<0&&this.setTopRowPrevious(),a.stopPropagation()},ParticleEditor.ImagePickerBase=function(){this.initialize.apply(this,arguments)};var d=ParticleEditor.ImagePickerBase;d.prototype=Object.create(a.prototype),d.prototype.constructor=d,d.prototype.initialize=function(){a.prototype.initialize.call(this)},d.prototype.applyData=function(){if(this._owner){var a=this.imageName();this._owner.didPickImage(a)}},d.prototype.imageName=function(){return""}}()


var pluginName = 'TRP_SEPicker';
var parameters = PluginManager.parameters(pluginName);

parameters.bgmVolume = Number(parameters.bgmVolume)||0;
parameters.bgsVolume = Number(parameters.bgsVolume)||0;
parameters.seVolume = Number(parameters.seVolume)||-1;
parameters.meVolume = Number(parameters.meVolume)||0;


if(PluginManager.registerCommand){
	PluginManager.registerCommand(pluginName, 'se', function(args){
		var paramsStr = args.params;
		if(paramsStr.indexOf('edit ')===0){
			paramStr.splice(0,5);
			SeEditor._startWithPluginCommand(paramsStr);
		}else if(!paramsStr || args.editMode==='true'){
			SeEditor._startWithPluginCommand(paramsStr);
		}else{
			var params = paramsStr.split(' ');
			var length = params.length;
			for(var i=0; i<length; i=(i+6)|0){
				var name = params[i+1];
		    	var volume = supplementNum(100,params[i+2]);
			    var pitch = supplementNum(100,params[i+3]);
			    var pan = supplementNum(0,params[i+4]);
			    var delay = supplementNum(0,params[i+5]);
			    AudioManager.trpPlaySeName(name,volume,pitch,pan,delay);
		    }
		}
	});
}

var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
	if(command==='se'){
		this.pluginCommandTrpSe(args);
	}else{
		_Game_Interpreter_pluginCommand.call(this,command,args);
	}
}

Game_Interpreter.prototype.pluginCommandTrpSe = function(args){
    var isEditMode = false;
    if(args[0]==='edit' || args.length===0 || args[args.length-1]==='edit'){
    	if(args[0]==='edit'){
    		args.shift();
    	}else if(args[args.length-1]==='edit'){
    		args.pop();
    	}
        if (Utils.isNwjs() && Utils.isOptionValid('test')){
            SeEditor.startWithPluginCommand(args,this);
            return;
        }
    }

    args.unshift('se')
    var length = args.length;
	for(var i=0; i<length; i=(i+6)|0){
		var name = args[i+1];
    	var volume = supplementNum(100,args[i+2]);
	    var pitch = supplementNum(100,args[i+3]);
	    var pan = supplementNum(0,args[i+4]);
	    var delay = supplementNum(0,args[i+5]);
	    AudioManager.trpPlaySeName(name,volume,pitch,pan,delay);
    }
};

function supplement(defaultValue,optionArg){
	if(optionArg === undefined){
		return defaultValue;
	}
	return optionArg;
};
function supplementNum(defaultValue,optionArg){
	return Number(supplement(defaultValue,optionArg));
};



var _SceneManager_updateMain = SceneManager.updateMain;
SceneManager.updateMain = function() {
	_SceneManager_updateMain.call(this,...arguments);
	AudioManager.trpUpdate();
};

AudioManager._trpReservedSe = [];
AudioManager.trpUpdate = function(){
	for(var i=this._trpReservedSe.length-1; i>=0; i=(i-1)|0){
        var info = this._trpReservedSe[i];
        info[0] -= 1;
        if(info[0]<=0){
            this.playSe(info[1]);
            this._trpReservedSe.splice(i,1);
        }
    }
};

AudioManager.trpPlaySe = function(se,delay=0) {
    if(delay>0){
        this._trpReservedSe.push([delay,se]);
    }else{
    	this.playSe(se);
    }
};

AudioManager.trpPlaySeName = function(name,volume=90,pitch=100,pan=0,delay=0){
    this.trpPlaySe({
        name,volume,pitch,pan
    },delay);
};
AudioManager.trpPlaySeGroup = function(seArr){
    if(!seArr){
        if (Utils.isNwjs() && Utils.isOptionValid('test')){
            this.playSeGroupEdit();
        }
        return;
    }
    for(const se of seArr){
        this.trpPlaySeName(...se);
    }
};
AudioManager.trpEditSeGroup = AudioManager.trpPlaySeGroupEdit = AudioManager.trpPlaySeGroup;


if(window.TRP_CommandManager){
	TRP_CommandManager.register(
		'mr_se',
		{},
		function(params,subject,orgParams){
			orgParams.unshift('se');
			if(orgParams[1]==='edit'||orgParams.length===1||orgParams[orgParams.length-1]==='edit'){
				if(orgParams[1]==='edit'){
					orgParams.splice(1,1);
				}else if(orgParams[orgParams.length-1]==='edit'){
					orgParams.pop();
				}
				var text = '';
				for(let param of orgParams){	
					if(text){
						if(param==='se'){
							text += '\n';
						}
					}
					text += param+' ';
				}
				SeEditor.start(text,null,'route')
			}else{
				var length = orgParams.length;
				for(var i=0; i<length; i=(i+6)|0){
					AudioManager.trpPlaySeName(
						orgParams[i+1],
						Number(orgParams[i+2]),
						Number(orgParams[i+3])||100,
						Number(orgParams[i+4])||0,
						Number(orgParams[i+5])||0,
					);
				}
				return;
			}
		}
	);
}



//=============================================================================
// forDev
//=============================================================================
if(!Utils.isNwjs() || !Utils.isOptionValid('test'))return;

var SeEditor = TRP_CORE.SeEditor = function SeEditor(){
    this.initialize.apply(this, arguments);
};


//=============================================================================
// PluginCommand
//=============================================================================
SeEditor.startWithPluginCommand = function(args,interpreter){
	var param = '';
	for(const arg of args){
		if(param)param+=' ';
		param += arg;
	}
	this._startWithPluginCommand(param);
};

SeEditor._startWithPluginCommand = function(param){
	var text = '';
	var commands = param.split('se ');
	for(let command of commands){	
		if(command==='se'){
			command += ' ';
		}
		if(text)text += '\n';
		text += command;
	}
	this.start(text,null,'plugin');
};


//=============================================================================
// start
//=============================================================================
AudioManager.trpEditSeGroup = AudioManager.trpPlaySeGroupEdit = function(seArr){
    SeEditor.start(seArr,null,'script')  
};

SeEditor.instance = null;
SeEditor.SE_CATEGORIES = null;
SeEditor._bgmVolume = 0;
SeEditor._bgsVolume = 0;
SeEditor._seVolume = 0;
SeEditor._meVolume = 0;

SeEditor.instance = null;
SeEditor.start = function(command='',completion=null,type='plugin'){
	if(this.instance){
		alert('すでにSeEditorが呼び出し中です')
		return;
	}

	this._bgmVolume = ConfigManager.bgmVolume;
	this._bgsVolume = ConfigManager.bgsVolume;
	this._seVolume = ConfigManager.seVolume;
	this._meVolume = ConfigManager.meVolume;
	if(parameters.bgmVolume>=0){
		ConfigManager.bgmVolume = parameters.bgmVolume;
	}
	if(parameters.bgsVolume>=0){
		ConfigManager.bgsVolume = parameters.bgsVolume;
	}
	if(parameters.seVolume>=0){
		ConfigManager.seVolume = parameters.seVolume;
	}
	if(parameters.meVolume>=0){
		ConfigManager.meVolume = parameters.meVolume;
	}

	var owner = SceneManager._scene;
	var update = owner.update;
	var dominant = TouchInput._dominantObject;
	var freezed = TouchInput._freezed;
	var iFreezed = Input._freezed;
	TouchInput._dominantObject = null;
	TouchInput._freezed = false;
	Input._freezed = false;

	var editor = new SeEditor(command,type);
	SeEditor.instance = editor;

	owner.addChild(editor);
	owner.update = function(){
		editor.update();

		if(editor.isTerminated()){
			if(editor.parent){
				editor.parent.removeChild(editor);
			}
			SeEditor.instance = null;

			var command = editor._savedCommand;
			if(command && completion){
				//apply command for temp
				completion(command);
			}

			editor = null;
			owner.update = update;

			Input._freezed = iFreezed;
			TouchInput._freezed = freezed;
			TouchInput._dominantObject = dominant;

			if(parameters.bgmVolume>=0){
				ConfigManager.bgmVolume = SeEditor._bgmVolume
			}
			if(parameters.bgsVolume>=0){
				ConfigManager.bgsVolume = SeEditor._bgsVolume;
			}
			if(parameters.seVolume>=0){
				ConfigManager.seVolume = SeEditor._seVolume;
			}
			if(parameters.meVolume>=0){
				ConfigManager.meVolume = SeEditor._meVolume;
			}
		}
	};
};

var SE_CATEGORIES = null;

SeEditor.FILE_PATH = 'dataEx/TrpDevSePicker.json';
SeEditor.analyzeSeCategories = function(){
	var fs = require('fs');
	var path = require('path');
	var base = path.dirname(process.mainModule.filename);
	var dirPath = path.join(base,'audio/se');
	var filePath = path.join(base, SeEditor.FILE_PATH);

	//make dataEx dir
	var dataExDirPath = path.join(base,'dataEx');
    if(!fs.existsSync(dataExDirPath)){
    	fs.mkdirSync(dataExDirPath);
    }

	if(parameters.noAnalyze==='true'){
		try{
			var file = fs.readFileSync(filePath,{encoding:'utf8'});
			SE_CATEGORIES = JSON.parse(file);
			return;
		}catch(e){}
	}

	if(!SE_CATEGORIES){
		SE_CATEGORIES = {};
		var files = fs.readdirSync(dirPath)
		var dir = '';
		this._analyzeSeCategoriesDirs(SE_CATEGORIES,fs,path,dirPath,dir,files);

	    fs.writeFileSync(filePath, JSON.stringify(SE_CATEGORIES));
	}
};

SeEditor._analyzeSeCategories = function(categories,fs,path,dirPath,dir='',name=''){
	var files = fs.readdirSync(dirPath)
	var length = files.length;
	for(var i=0; i<length; i=(i+1)|0){
		var file = files[i];
		var fp = path.join(dirPath,file);
		if(fs.statSync(fp).isDirectory()){
			categories[name] = {};
			categories = categories[name];
			this._analyzeSeCategoriesDirs(categories,fs,path,dirPath,dir,files);
			break;
		}else if(file.contains('.ogg')||file.contains('.mp3')||file.contains('.wav')){
			var arr = [];
			categories[name] = arr;
			this._analyzeSeCategoriesFiles(arr,fs,path,dirPath,dir,files);
			break;
		}
	}
};

SeEditor._analyzeSeCategoriesDirs = function(categories,fs,path,dirPath,dir,files){
	var length = files.length;
    for(var i = 0; i<length; i=(i+1)|0){
        var file = files[i];
    	var fp = path.join(dirPath,file);
    	if(!fs.statSync(fp).isDirectory())continue;

    	var subPath = path.join(dirPath,file);
    	this._analyzeSeCategories(categories,fs,path,subPath,dir+file+'/',file);
    }
};

SeEditor._analyzeSeCategoriesFiles = function(arr,fs,path,dirPath,dir,files){
	var length = files.length;
    for(var i = 0; i<length; i=(i+1)|0){
        var file = files[i];
    	var fp = path.join(dirPath,file);
    	if(!fs.statSync(fp).isFile())continue;
    	if(!file.contains('.mp3')&&!file.contains('.wav')&&!file.contains('.ogg')&&!file.contains('.m4a'))continue;

    	file = file.replace('.mp3','');
    	file = file.replace('.wav','');
    	file = file.replace('.ogg','');
    	file = file.replace('.m4a','');

    	var name = file;
    	if(Utils.RPGMAKER_NAME==="MZ"){
    		name = dir+name;
    	}
    	if(!arr.contains(name)){
    		arr.push(name);
    	}
    }
};





//=============================================================================
// SeEditor
//=============================================================================
SeEditor.prototype = Object.create(ParticleEditor.prototype);
SeEditor.prototype.constructor = SeEditor;

SeEditor.MAX_NUM = 5;
SeEditor.prototype.initialize = function(command='',type='plugin'){
    PIXI.Container.call(this);

    this.initMembers();
    this._savedCommand = '';
    this._commandType = type;

    this.analyzeCommand(command,type);


    this.width = Graphics.width;
    this.height = Graphics.height;
    Input.clear();

    this._seNames = SeEditor.analyzeSeNames(true);



    this._guideSprite = new Sprite();
    this._config = {};

   	this.createSelectorSprite();
    this.createParts(/*targetData,config*/);
    this.createMenuButtons();

    this.registerKeyListeners();
    this.resetInputingWords();
};

SeEditor.prototype.initMembers = function(){
	ParticleEditor.prototype.initMembers.call(this);
};



SeEditor.prototype.analyzeCommand = function(command,type=''){
	this._wholeHeader = '';
	this._commandOptPrefix = '';
	this._commandHeader = '';
	this._nameQuotation = '';
	this._paramSplitter = '';
	this._commandTail = '';
	this._commandSplitter = '';
	this._wholeTail = ''

	if(type==='plugin'){
		// this._commandOptPrefix = '@plugin value=value="';
		this._commandHeader = 'se ';
		this._paramSplitter = ' ';
		this._commandTail = ' ';

		this._commandSplitter = ' ';
	}else if(type==='script'){
		this._wholeHeader = 'AudioManager.trpPlaySeGroup(['
		this._commandHeader = '[';
		this._nameQuotation = '"';
		this._paramSplitter = ','
		this._commandTail = ']';
		this._commandSplitter = ',';
		this._wholeTail = ']);'
	}else{
		// this._commandOptPrefix = 'cmd ';
		this._wholeHeader = 'cmd ';
		this._commandHeader = 'se ';
		this._paramSplitter = ' ';
		this._commandTail = ' ';
	}

	this._configs = [];
	if(Array.isArray(command)){
		for(var i=0; i<SeEditor.MAX_NUM; i=(i+1)|0){
			var se = command[i];
			if(se){
				this._configs.push({
					name:se[0],
					volume:se[1],
					pitch:se[2],
					pan:se[3],
					delay:se[4],
				});
			}else{
				this._configs.push({name:'',volume:100,pitch:100,pan:0,delay:0});
			}
		}
	}else{
		var commands = command.split('\n');
		var name,volume,pitch,pan,delay;
		for(var i=0; i<SeEditor.MAX_NUM; i=(i+1)|0){
			if(commands[i]){
				var command = commands[i].replace(this._commandHeader,'')
				if(this._commandTail!==this._paramSplitter){
					command = command.replace(this._commandTail,'');
				}
				var args = command.split(this._paramSplitter);
				name = args[0].trim();
				volume = supplementNum(100,args[1]);
				pitch = supplementNum(100,args[2]);
				pan = supplementNum(0,args[3]);
				delay = supplementNum(0,args[4]);
			}else{
				name = '';
				volume = 100;
				pitch = 100;
				pan = 0;
				delay = 0;
			}
			this._configs.push({
				name,volume,pitch,pan,delay
			});
		}
	}
}

SeEditor.analyzeSeNames = function(toLowerCase=false){
	var fs = require('fs');
	var path = require('path');
	var base = path.dirname(process.mainModule.filename);
	var dirPath = path.join(base,'audio/se/');

	var names = [];
	var files = fs.readdirSync(dirPath)
	var length = files.length;
    for(var i = 0; i<length; i=(i+1)|0){
        var file = files[i];
    	var fp = path.join(dirPath,file);

    	if(!fs.statSync(fp).isFile())continue;
    	if(!(/.*\.(ogg|m4a)$/.test(file)))continue;

    	file = file.replace('.ogg','');
    	file = file.replace('.m4a','');
    	if(toLowerCase){
    		file = file.toLowerCase();
    	}
    	if(!names.contains(file)){
    		names.push(file);
    	}
    }
    names = names.sort(function(a,b){
    	if(a.toLowerCase()>b.toLowerCase()){
    		return 1
    	}else{
    		return -1;
    	}
    });
    return names;
}





/* parts
===================================*/
SeEditor.prototype.createParts = function(data,config){
	var title,configNames,headers;
	var y = 5;

	this._data = {params:{}};
	for(var i=0; i<SeEditor.MAX_NUM; i=(i+1)|0){
		var config = this._configs[i];

		title = 'SE'+(i+1)+'名前';
		var data = [config.name];
		this._data.params[title] = data;
		configNames = ['name'];
		headers = ['name'];
		y += this.addNameParts(y,this._data,config,configNames,title,headers);

		title = 'SE'+(i+1);
		var data = [config.volume,config.pitch,config.delay];
		this._data.params[title] = data;
		configNames = ['volume','pitch','delay'];
		headers = ['volume','pitch','delay'];
		y += this.addValueParts(y,this._data,config,configNames,title,headers);

		y += 30;
	}
};

ParticleEditor.ParticleParam.prototype.valueWithInputting = function(){
	var input = this._inputting;
	var value = Number(this._inputting);
	var name = this._configNames[this._editingIndex];

	if(value === NaN){
		value = this.value(this._editingIndex);
	}

	switch(name){
	case 'volume':
		value = value.clamp(0,Number(parameters.maxVolume)||100);
		break;
	case 'pitch':
		value = value.clamp(0,10000);
		break;
	case 'delay':
		value = value.clamp(0,10000);
		break;
	}

	this._inputting = String(value);

	return value;
};

SeEditor.prototype.addNameParts = function(y,data,config,configNames,title,headers){
	var parts = new NameParam(data,config,configNames,title,headers);
	return this._addParts(y,parts,title);
};


SeEditor.slideNumSpritesX = function(){};


SeEditor.prototype._applySaveData = function(saveData){
	saveData.shift();
	this._data.params[saveData.shift()] = saveData;
};

SeEditor.prototype.executeQuit = function(){
	var text = this._wholeHeader;
	var data = this._data.params;
	var num = 0;
	var names = [];
	for(var i=0; i<SeEditor.MAX_NUM; i=(i+1)|0){
		var name = data['SE'+(i+1)+'名前'][0];
		if(!name)continue;

		if(!names.contains(name)){
			names.push(name);
		}

		if(num>0){
			text += this._commandSplitter;
		}
		num += 1;

		var params = data['SE'+(i+1)];
		text += this._commandOptPrefix;
		text += this._commandHeader;

		text += (this._nameQuotation+name+this._nameQuotation)+ this._paramSplitter;
		text += params[0] + this._paramSplitter; // volume
		text += params[1] + this._paramSplitter; //pitch
		text += '0' + this._paramSplitter; //pan
		text += params[2]; //delay
	}
	text += this._wholeTail;

	
	this._savedCommand = text;

	SoundManager.playSave();
	copyToClipboard(text);

	ParticleEditor.prototype.executeQuit.call(this);
	
	if(parameters.registerAsset==='true'){
		SeEditor.registerAsset(names);
	}
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


/* play se
===================================*/
SeEditor.prototype.playSe = function(){
	var names = this._seNames;
	for(var i=0; i<SeEditor.MAX_NUM; i=(i+1)|0){
		var name = this._data.params['SE'+(i+1)+'名前'][0];
		var params = this._data.params['SE'+(i+1)];
		var volume = params[0];
		var pitch = params[1];
		var pan = 0;
		var delay = params[2];
		if(!name)continue;

		AudioManager.trpPlaySeName(name,volume,pitch,pan,delay);
	}
};

SeEditor.prototype.processInput = function(keyCode,key){
	if(this._key === ' '){
		this.playSe();
	}else if(Input.isTriggered('ok') && this._editingIndex%2===0){
		this.processPickSe();
	}else{
		ParticleEditor.prototype.processInput.call(this,keyCode,key);
		if(Input.isTriggered('ok')){
			this.playSe();
		}
	}
};

SeEditor.prototype.pushInputtingCharacter = function(chara){
	var editing = this._editingIndex>=0 ? this.editingParts() : null;
	if(editing){
		if(!editing.processInput(this._keyCode,this._key)){
			this.endEditing();	
		}else{
			this.selectParts(this._editingIndex);
			if(editing.hasSaveData()){
				this.saveEditingParams();
			}
		}
	}else if(Input.isTriggered('cancel')&&this._keyCode!==96){
		if(this._saveButton.opacity<255){
			this.processQuit();
		}else{
			SoundManager.playBuzzer();
		}
	}
	if(this._keyCode!==0){
		this.resetInputingWords();
	}
};

SeEditor.prototype.processPickSe = function(){
	if(!this._sePicker){
		var picker = new NamePicker();
		this._sePicker = picker;
		this._addPicker(picker);
	}

	var editing = this.editingParts();
	var name = editing.value(0);
	var pitch = this._parts[this._editingIndex+1].value(1);

	this._sePicker.startPicking(this,this._editingIndex,name,pitch);
	this.startPicking(this._sePicker);
};

SeEditor.prototype.didEndPicking = function(){
	TouchInput.clear();
	Input.clear();
	ParticleEditor.prototype.didEndPicking.call(this);
};

SeEditor.prototype.applyData = function(index,data){
	var name = data[0];
	var pitch = data[1];

	var editing = this._parts[index];
	editing._data.params[editing._title][0] = name;
	editing.refreshParts();

	var params = this._parts[index+1];
	params._data.params[params._title][1] = pitch;
	params.refreshParts();
};

SeEditor.prototype.processTouch = function(){
	this._touching = true;
	ParticleEditor.prototype.processTouch.call(this);
	this._touching = false;
};

SeEditor.prototype.startEditing = function(index){
	ParticleEditor.prototype.startEditing.call(this,index);

	if(this._touching && this._editingIndex%2===0){
		this.processPickSe();
	}
};

SeEditor.registerAsset = function(names){
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
        var fileName = url.replace('audio/se/','')
    	if(!names.contains(fileName)){
    		names.push(fileName);
    	}
    }
    names.sort();

    var assetText = '';
	for(const name of names){
     	assetText += ' * '+'@requiredAssets audio/se/'+name+'\n';
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
// NameParam
//=============================================================================
var ParticleParam = ParticleEditor.ParticleParam;
var ValueParam = ParticleParam.ValueParam;

function NameParam(){
    this.initialize.apply(this, arguments);
}
NameParam.prototype = Object.create(ValueParam.prototype);
NameParam.prototype.constructor = NameParam;
NameParam.prototype.initialize = function(data,config,configNames,title) {
    ValueParam.prototype.initialize.call(this,data,config,configNames,title);

    this._inputting = undefined;
};

NameParam.prototype._processCharacterInput = function(keyCode,key){
};

NameParam.prototype.clearInputting = function(){
	this._inputting = '';
};

NameParam.prototype.valueWithInputting = function(){
	var value = this._inputting;
	if(value===undefined){
		value = this.value(this._editingIndex);
		this._inputting = String(value);
	}

	return value;
};

NameParam.prototype.paramSaveData = function(index,value){
	var values = this.values();
	if(value !== undefined){
		values[index] = value;
	}

	return values;
};





//=============================================================================
// NamePicker
//=============================================================================
function NamePicker(){
    this.initialize.apply(this, arguments);
}

var ImagePickerBase = ParticleEditor.ImagePickerBase;
var PresetPicker = ParticleEditor.PresetPicker;
NamePicker.prototype = Object.create(ParticleEditor.ImagePickerBase.prototype);
NamePicker.prototype.constructor = NamePicker;

NamePicker._init = false;
NamePicker.init = function(){
	if(this._init)return;
	this._init = true;

	SeEditor.analyzeSeCategories();

	var names = SeEditor.analyzeSeNames(false);
	SE_CATEGORIES.SE = names;
};

NamePicker.prototype.initialize = function() {
    ImagePickerBase.prototype.initialize.call(this);
	NamePicker.init();

	this._originalName = '';
	this._dirLog = [];
	this._indexLog = [];
	this._headerLog = [];
    this.setDirectory(SE_CATEGORIES);

    this._headerSprite.x = 250;
};

var _NamePicker_startPicking = NamePicker.prototype.startPicking;
NamePicker.prototype.startPicking = function(owner,index,name,pitch){
	var categories = SE_CATEGORIES;
	if(!this.searchNameForInit(name,categories)){
		// this.setSelectingIndex(0);
	}

	this._editingIndex = index;
	this._pitch = pitch;
	this._currentData = [name,pitch];

	_NamePicker_startPicking.call(this,owner);
};
NamePicker.prototype.searchNameForInit = function(name,categories){
	if(Array.isArray(categories)){
		var idx = categories.indexOf(name);
		if(idx>=0){
			this.setDirectory(categories);
			this.setSelectingIndex(idx);
			this.setTopIndex(idx);
			return true;
		}else{
			return false;
		}
	}else{
		var dirs = Object.keys(categories);
		var length = dirs.length;

		this._dirLog.push(categories);
		for(var i=0; i<length; i=(i+1)|0){
			var dir = dirs[i];
			this._indexLog.push(i);
			this._headerLog.push(dir);

			if(this.searchNameForInit(name,categories[dir])){
				return true;
			}else{
				this._indexLog.pop();
				this._headerLog.pop();
			}
		}
		this._dirLog.pop();
	}
};


NamePicker.prototype.setDirectory = function(directory){
	if(!directory){
		var dirName = this._list[this._selectingIndexes[0]];
		if(!dirName){
			SoundManager.playBuzzer();
			return;
		}

		directory = this._directory[dirName];
		this._indexLog.push(this._selectingIndexes[0]);
		this._headerLog.push(dirName);
	}

	if(!this._dirLog.contains(directory)){
		this._dirLog.push(directory);
	}
	this._directory = directory;
	this._isFileDir = Array.isArray(directory);

	if(this._isFileDir){
		this._list = directory;
	}else{
		this._list = Object.keys(directory);
		if(directory===SE_CATEGORIES){
			var idx = this._list.indexOf('SE');
			if(idx>=0)this._list.splice(idx,1);
			this._list.unshift('SE');
		}
	}
};

NamePicker.prototype.maxItems = function(){
	return this._list.length;
};
NamePicker.prototype.maxColumns = function(){
	return 1;
};
NamePicker.prototype.itemHeight = function(){
	return 24;
};
NamePicker.prototype.itemWidth = function(){
	return 250;
};
NamePicker.prototype.itemMarginX = function(){
	return 0;
};
NamePicker.prototype.itemMarginY = function(){
	return 0;
};
NamePicker.prototype.guideTexts = function(){
	return null;
};

NamePicker.prototype.maxCategories = function(){return 1};
NamePicker.prototype.categoryType = function(){
	return this._directory;
};
NamePicker.prototype.isSeveralModeValid = function(){return false};


NamePicker.prototype._refresh = function(){
	ParticleEditor.PickerBase.prototype._refresh.call(this);

	for(const sprite of this._highlightSprites){
		sprite.scale.x = this.itemWidth()/sprite.bitmap.width;
	}
};

NamePicker.prototype.refreshItems = function(){
	this.createContentsSprite();
	if(this._headerSprite && this._headerSprite.parent){
		this._headerSprite.parent.addChild(this._headerSprite);
	}

	var width = this.itemWidth();
	var lineHeight = this.itemHeight();
	var list = this._list;
	var length = list.length;
	var height = lineHeight * length;

	var bitmap = this._contentsSprite.bitmap;
	bitmap.clear();
	var children = this._contentsSprite.children;
	for(var i=children.length-1; i>=0; i=(i-1)|0){
		children[i].bitmap.clear();
	}

	var margin = 5;
	var names = this._list;
	var length = list.length;
    for(var i = 0; i<length; i=(i+1)|0){
        var name = list[i];
        if(!this._isFileDir){
        	name = '【'+name+'】';
        }
        var x = margin;
        var y = i*lineHeight;
        var bitmapIdx = Math.floor(y/NamePicker.MAX_BITMAP_SIZE);
        y = y%NamePicker.MAX_BITMAP_SIZE;
        if(bitmapIdx===0){
        	bitmap = this._contentsSprite.bitmap;
        }else{
        	bitmap = this._contentsSprite.children[bitmapIdx-1].bitmap;
        }

        bitmap.fontSize = lineHeight-3;
        bitmap.drawText(name,x,y,bitmap.width-x-margin,lineHeight);
    }
};

NamePicker.MAX_BITMAP_SIZE = 2000;
NamePicker.prototype.createContentsSprite = function(){
	var maxNum = this.maxItems();
    var width = this.itemWidth();
    var height = this.itemHeight()*maxNum;

    var leftHeigth = 0;
    var maxHeight = NamePicker.MAX_BITMAP_SIZE;
    if(height>maxHeight){
    	leftHeigth = height-maxHeight;
    	height = maxHeight;
    }

    if(!this._contentsSprite){
		this._contentsSprite =  new Sprite(bitmap);
		this.addChild(this._contentsSprite);
	}
	var sprite = this._contentsSprite;
	var bitmap = sprite.bitmap;
	if(bitmap && bitmap.height>=height+48){
		bitmap.clear();
	}else{
		bitmap = new Bitmap(width,height+48);
		sprite.bitmap = bitmap;
	}
	sprite.y = 5;

	var y = height;
	while(leftHeigth>0){
		height = leftHeigth
		leftHeigth = 0;
		if(height>maxHeight){
	    	leftHeigth = height-maxHeight;
	    	height = maxHeight;
	    }
		var bitmap = new Bitmap(width,height+48);
		var sprite = new Sprite(bitmap);
		this._contentsSprite.addChild(sprite)
		sprite.y = y;
		y += height;
	}
};

var _NamePicker_onKeyDown = NamePicker.prototype.onKeyDown;
NamePicker.prototype.onKeyDown = function(keyCode,event){
	if(keyCode===8){
		//backspace
		this.processBack();
		Input.clear();
	}else if(keyCode===13){
		//enter
		this.processOk();
		Input.clear();
	}else if(keyCode===27){
		//esc
		this._owner.applyData(this._editingIndex,this._currentData);
		this.end();
		Input.clear();
	}else{
		if((!event.ctrlKey&&!event.metaKey)){
			var chara = event.key;
			this.search(chara);
		}
	}
};
NamePicker.prototype.processBack = function(){
	if(this._directory===SE_CATEGORIES){			
	}else{
		this._dirLog.pop();
		this.setDirectory(this._dirLog.pop());
		this._selectingIndexes = [];

		this._headerLog.pop();

		var idx = this._indexLog.pop()
		this.didPickData(idx);
		this.refresh();

		this.setTopIndex(idx);
	}
}

NamePicker.prototype.search = function(chara){
	if(chara===' '){
		SeEditor.instance.playSe();
		Input.clear();
	}

	for(var i=0; i<2; i=(i+1)|0){
		this._search = (this._search||'')+chara;

		var names = this._list;
		var length = names.length;
	    for(var j = 0; j<length; j=(j+1)|0){
	        var name = names[j];
	        if(name.toLowerCase().indexOf(this._search)===0){
	        	this.didSuccessSearch(j);
	        	return;
	        }
	    }
	    this._search = '';
	}
};

/* input
===================================*/
var _NamePicker_processInput = NamePicker.prototype.processInput;
NamePicker.prototype.processInput = function(){
	if(Input.isPressed('shift')&&Input.isRepeated('left')){
		this._pitch-=5;
		this.playSe();
	}else if(Input.isPressed('shift')&&Input.isRepeated('right')){
		this._pitch+=5;
		this.playSe();
	}else if(Input.isPressed('shift')&&(Input.isRepeated('up')||Input.isRepeated('down'))){
		this._pitch = this._currentData[1];
		this.playSe();

	}else if(Input.isRepeated('down')){
		this.selectNext();
		this._search = '';
	}else if(Input.isRepeated('up')){
		this.selectPrevious();
		this._search = '';
	}else{
		_NamePicker_processInput.call(this);
	}
};

var _NamePicker_update = NamePicker.prototype.update;
NamePicker.prototype.update = function(){
	_NamePicker_update.call(this);

	if(TouchInput.isCancelled()){
		this.processBack();
	}
}
NamePicker.prototype.processOk = function(){
	if(this._isFileDir){
		this._owner.applyData(this._editingIndex,[this._directory[this._selectingIndexes[0]],this._pitch]);
		this.end();
	}else{
		this.setDirectory();
		this.didPickData(0);
		this.refresh();
	}
};
NamePicker.prototype.didSuccessSearch = function(index){
	this.setTopIndex(index);
	this.didPickData(index);
};

NamePicker.prototype.selectNext = function(){
	var index = this._selectingIndexes.length ? this._selectingIndexes[0] : -1;
	index += 1;
	if(index>=this.maxItems()){
		SoundManager.playBuzzer();
		return;
	}
	this.didPickData(index);
	if(index > this._topRow+this._dispRows){
		this.setTopRowPrevious();
	}
};
NamePicker.prototype.selectPrevious = function(){
	var index = this._selectingIndexes.length ? this._selectingIndexes[0] : this.maxItems();
	index -= 1;
	if(index<0){
		SoundManager.playBuzzer();
		return;
	}
	this.didPickData(index);
	if(index < this._topRow){
		this.setTopRowNext();
	}
};


NamePicker.prototype.didPickData = function(index){
	if(!this._selectingIndexes.contains(index)){
		var playCursor = SoundManager.playCursor;
		if(this._isFileDir){
			SoundManager.playCursor = function(){};
		}
		this.setSelectingIndex(index);
		if(this._isFileDir){
			SoundManager.playCursor = playCursor;
		}
	}

	if(this._isFileDir){
		this.playSe();
		this._owner.applyData(this._editingIndex,[this._directory[this._selectingIndexes[0]],this._pitch]);
	}else{
		if(TouchInput.isTriggered()){
			this.processOk();
		}
	}
};

NamePicker.prototype.playSe = function(){
	var name = this._list[this._selectingIndexes[0]];
	if(!name)return;

	AudioManager.trpPlaySeName(name,130,this._pitch);
};


NamePicker.prototype.headerText = function(){
	return '【'+(this._headerLog[this._headerLog.length-1]||'TOP')+'】';
};









})();