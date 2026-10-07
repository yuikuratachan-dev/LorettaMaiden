/*:
 * @target MZ
 * @plugindesc メニューでアクターごとに画像を配置し、座標を設定できます（メンバーは最大4人まで表示されます）。
 * @author かがらーと
 * @help このプラグインは、メニュー画面で各アクターごとに対応する画像を配置し、座標を調整できます。
 * 画像は「img/pictures/button/main_actor<アクターID>」という形式の名前で指定されます。
 *
 * 例: アクターIDが1の場合、画像のパスは「img/pictures/button/main_actor1.png」となります。
 * 
 * 使用方法:
 * 1. 画像ファイルを「img/pictures/button/」フォルダに配置してください。
 * 2. プラグインをツクールMZのプラグイン管理で追加してください。
 * 3. プラグインパラメータでX座標とY座標を設定できます。
 *
 * @param xOffset
 * @text X座標オフセット
 * @desc 画像のX座標に加算するオフセット値です。
 * @default 0
 * @type number
 * 
 * @param yOffset
 * @text Y座標オフセット
 * @desc 画像のY座標に加算するオフセット値です。
 * @default 0
 * @type number
 */

(() => {
    const parameters = PluginManager.parameters('KG_ActorMenuImage'); // ファイル名を設定
    const xOffset = Number(parameters['xOffset'] || 0);
    const yOffset = Number(parameters['yOffset'] || 0);

    const _Window_MenuStatus_initialize = Window_MenuStatus.prototype.initialize;
    Window_MenuStatus.prototype.initialize = function(rect) {
        _Window_MenuStatus_initialize.call(this, rect);
        this._actorSprites = [];
    };

    const _Window_MenuStatus_refresh = Window_MenuStatus.prototype.refresh;
    Window_MenuStatus.prototype.refresh = function() {
        _Window_MenuStatus_refresh.call(this);
        this.createActorBackgrounds();
    };

    Window_MenuStatus.prototype.createActorBackgrounds = function() {
        // 既存のスプライトをすべて削除
        if (this._actorSprites && this._actorSprites.length > 0) {
            this._actorSprites.forEach(sprite => this.removeChild(sprite));
        }
        this._actorSprites = [];

        // アクターごとに背景スプライトを作成
        let members = $gameParty.members(); // アクターリストを直接取得
        if (!members || members.length === 0) return;

        // メンバーを4人までに制限
        members = members.slice(0, 4);

        members.forEach((actor, index) => {
            const bitmap = ImageManager.loadPicture(`button/main_actor${actor.actorId()}`);

            // 画像の読み込み完了時の処理を設定
            bitmap.addLoadListener(() => {
                const sprite = new Sprite(bitmap);
                const rect = this.itemRect(index);
                sprite.x = rect.x + xOffset;
                sprite.y = rect.y + yOffset;

                // 背景より上、ステータスより下に配置
                this.addChildAt(sprite, this.children.indexOf(this._scrollBase) + 1);

                this._actorSprites.push(sprite);
            });
        });
    };
})();
