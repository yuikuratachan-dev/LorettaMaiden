/*: @target MZ
 * @base TRP_ParticleMZ
 * @plugindesc 自作パーティクル設定の一覧
 * @help
 * Actor2TP4 <character> ＠2025/3/3
 * bigfire1 <character> ＠2025/2/5
 * bigfire10 <character> ＠2025/2/5
 * bigfire11 <character> ＠2025/2/5
 * bigfire12 <character> ＠2025/2/5
 * bigfire2 <character> ＠2025/2/5
 * bigfire3 <character> ＠2025/2/5
 * bigfire4 <character> ＠2025/2/5
 * bigfire5 <character> ＠2025/2/5
 * bigfire6 <character> ＠2025/2/5
 * bigfire7 <character> ＠2025/2/5
 * bigfire8 <character> ＠2025/2/5
 * bigfire9 <character> ＠2025/2/5
 * fire1 <character> ＠2025/2/4
 * fire10 <character> ＠2025/2/4
 * fire2 <character> ＠2025/2/4
 * fire3 <character> ＠2025/2/4
 * fire4 <character> ＠2025/2/4
 * fire5 <character> ＠2025/2/4
 * fire6 <character> ＠2025/2/4
 * fire7 <character> ＠2025/2/4
 * fire8 <character> ＠2025/2/4
 * fire9 <character> ＠2025/2/4
 * glass <character> ＠2025/2/7
 * hanabi1 <character> ＠2025/2/4
 * icefloor <character> ＠2025/2/11
 * light <character> ＠2025/2/14
 * nudia_fire <character> ＠2025/2/9
 * nudia_fire2 <character> ＠2025/2/15
 * smoke <character> ＠2025/2/10
 * test <character> ＠---
 * title <screen> ＠2025/3/7
 * wearfire <character> ＠2025/2/9
 * wearice <character> ＠2025/2/9
 *
 * @command set_character
 * @text set/表示 > キャラ対象(31)
 * @desc パーティクル表示
 *
 * @arg id
 * @text 管理ID
 * @desc 他と被らない管理ID。「def」で設定名,「-EID」で設定名-EID
 * @default def
 *
 * @arg target
 * @text ターゲット
 * @desc thisでこのイベント。「event:イベントID」「player」「weather」など
 * @default weather
 *
 * @arg name
 * @text 《データ名》
 * @desc データ名。defとすると管理IDをデータ名として使用。（重み同じデータ名を複数表示するときは管理IDを分ける）
 * @default 《呼び出す設定を選択》
 * @type select
 * @option Actor2TP4 <character> ＠2025/3/3
 * @value Actor2TP4
 * @option bigfire1 <character> ＠2025/2/5
 * @value bigfire1
 * @option bigfire10 <character> ＠2025/2/5
 * @value bigfire10
 * @option bigfire11 <character> ＠2025/2/5
 * @value bigfire11
 * @option bigfire12 <character> ＠2025/2/5
 * @value bigfire12
 * @option bigfire2 <character> ＠2025/2/5
 * @value bigfire2
 * @option bigfire3 <character> ＠2025/2/5
 * @value bigfire3
 * @option bigfire4 <character> ＠2025/2/5
 * @value bigfire4
 * @option bigfire5 <character> ＠2025/2/5
 * @value bigfire5
 * @option bigfire6 <character> ＠2025/2/5
 * @value bigfire6
 * @option bigfire7 <character> ＠2025/2/5
 * @value bigfire7
 * @option bigfire8 <character> ＠2025/2/5
 * @value bigfire8
 * @option bigfire9 <character> ＠2025/2/5
 * @value bigfire9
 * @option fire1 <character> ＠2025/2/4
 * @value fire1
 * @option fire10 <character> ＠2025/2/4
 * @value fire10
 * @option fire2 <character> ＠2025/2/4
 * @value fire2
 * @option fire3 <character> ＠2025/2/4
 * @value fire3
 * @option fire4 <character> ＠2025/2/4
 * @value fire4
 * @option fire5 <character> ＠2025/2/4
 * @value fire5
 * @option fire6 <character> ＠2025/2/4
 * @value fire6
 * @option fire7 <character> ＠2025/2/4
 * @value fire7
 * @option fire8 <character> ＠2025/2/4
 * @value fire8
 * @option fire9 <character> ＠2025/2/4
 * @value fire9
 * @option icefloor <character> ＠2025/2/11
 * @value icefloor
 * @option light <character> ＠2025/2/14
 * @value light
 * @option nudia_fire <character> ＠2025/2/9
 * @value nudia_fire
 * @option nudia_fire2 <character> ＠2025/2/15
 * @value nudia_fire2
 * @option smoke <character> ＠2025/2/10
 * @value smoke
 * @option test <character> ＠---
 * @value test
 * @option wearfire <character> ＠2025/2/9
 * @value wearfire
 * @option wearice <character> ＠2025/2/9
 * @value wearice
 *
 * @arg z
 * @text Z値
 * @desc 重なり順。above:上、below:後ろ、screen、spritesetなど。数値指定も可
 * @default def
 *
 * @arg tag
 * @text 管理タグ
 * @desc 管理用のタグ名
 *
 * @arg edit
 * @text Editモード
 * @desc ONにするとエディタを呼び出し(テストプレイ時のみ有効)
 * @default false
 * @type boolean
 *
 * @arg delay
 * @text _ディレイ
 * @desc 1以上とすると、指定フレーム後にコマンドを実効
 * @default 0
 * @type number
 * @min 0
 *
 *
 * @command set_screen
 * @text set/表示 > スクリーン/天候/リージョン(1)
 * @desc パーティクル表示
 *
 * @arg id
 * @text 管理ID
 * @desc 他と被らない管理ID。「def」で設定名,「-EID」で設定名-EID
 * @default def
 *
 * @arg target
 * @text ターゲット
 * @desc thisでこのイベント。「event:イベントID」「player」「weather」など
 * @default this
 *
 * @arg name
 * @text 《データ名》
 * @desc データ名。defとすると管理IDをデータ名として使用。（重み同じデータ名を複数表示するときは管理IDを分ける）
 * @default 《呼び出す設定を選択》
 * @type select
 * @option title <screen> ＠2025/3/7
 * @value title
 *
 * @arg z
 * @text Z値
 * @desc 重なり順。above:上、below:後ろ、screen、spritesetなど。数値指定も可
 * @default def
 *
 * @arg tag
 * @text 管理タグ
 * @desc 管理用のタグ名
 *
 * @arg edit
 * @text Editモード
 * @desc ONにするとエディタを呼び出し(テストプレイ時のみ有効)
 * @default false
 * @type boolean
 *
 * @arg delay
 * @text _ディレイ
 * @desc 1以上とすると、指定フレーム後にコマンドを実効
 * @default 0
 * @type number
 * @min 0
 *
 *
 * @command play_character
 * @text play/１回再生 > キャラ対象(2)
 * @desc パーティクルを１回だけ再生
 *
 * @arg id
 * @text 管理ID
 * @desc 他と被らない管理ID。「def」で設定名,「-EID」で設定名-EID
 * @default def
 *
 * @arg target
 * @text ターゲット
 * @desc thisでこのイベント。「event:イベントID」「player」「weather」など
 * @default weather
 *
 * @arg name
 * @text 《データ名》
 * @desc データ名。defとすると管理IDをデータ名として使用。（重み同じデータ名を複数表示するときは管理IDを分ける）
 * @default 《呼び出す設定を選択》
 * @type select
 * @option glass <character> ＠2025/2/7
 * @value glass
 * @option hanabi1 <character> ＠2025/2/4
 * @value hanabi1
 *
 * @arg z
 * @text Z値
 * @desc 重なり順。above:上、below:後ろ、screen、spritesetなど。数値指定も可
 * @default def
 *
 * @arg tag
 * @text 管理タグ
 * @desc 管理用のタグ名
 *
 * @arg edit
 * @text Editモード
 * @desc ONにするとエディタを呼び出し(テストプレイ時のみ有効)
 * @default false
 * @type boolean
 *
 * @arg delay
 * @text _ディレイ
 * @desc 1以上とすると、指定フレーム後にコマンドを実効
 * @default 0
 * @type number
 * @min 0
 *
 *
 *
 * @requiredAssets img/particles/line2
 * @requiredAssets img/particles/line_oval2
 * @requiredAssets img/particles/smog2
 * @requiredAssets img/particles/smoke2
 * @requiredAssets img/particles/smoke1
 * @requiredAssets img/particles/flame1
 * @requiredAssets img/particles/shine2
 * @requiredAssets img/particles/shine1
 * @requiredAssets img/particles/shine1g
 * @requiredAssets img/particles/shine3
 * @requiredAssets img/particles/line_ray3
 * @requiredAssets img/particles/flare
 * @requiredAssets img/particles/shine_thin3
 * @requiredAssets img/particles/cloud3
 * @requiredAssets img/particles/cloud2
 * @requiredAssets img/particles/cloud1
 * @requiredAssets img/particles/particle4
 * @requiredAssets img/particles/snow3g
 * @requiredAssets img/particles/snow1g
 * @requiredAssets img/particles/snow5g
 * @requiredAssets img/particles/snow4g
 * @requiredAssets img/particles/snow2g
 */