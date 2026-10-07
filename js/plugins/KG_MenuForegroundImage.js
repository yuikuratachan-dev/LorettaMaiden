/*:
 * @plugindesc メニューを開いたときに最前面に指定した画像を表示します。
 * @target MZ
 * @param ImageName
 * @text 画像ファイル名
 * @desc 表示する画像のファイル名（img/pictures フォルダに配置）。
 * @default
 * @type file
 * @dir img/pictures
 * 
 * @param ImageX
 * @text 画像X座標
 * @desc 画像のX座標位置。
 * @default 0
 * @type number
 * 
 * @param ImageY
 * @text 画像Y座標
 * @desc 画像のY座標位置。
 * @default 0
 * @type number
 * 
 * @param ImageZ
 * @text 画像のZインデックス
 * @desc 画像のZインデックス。値が大きいほど前面に表示されます。
 * @default 10
 * @type number
 * 
 * @help
 * このプラグインは、メニューを開いたときに指定した画像を最前面に表示します。
 * 
 * 表示する画像は img/pictures フォルダに配置してください。
 * 
 * プラグインコマンドは必要ありません。
 */

(() => {
    const parameters = PluginManager.parameters('KG_MenuForegroundImage');
    const imageName = String(parameters['ImageName'] || '');
    const imageX = Number(parameters['ImageX'] || 0);
    const imageY = Number(parameters['ImageY'] || 0);
    const imageZ = Number(parameters['ImageZ'] || 10);

    const _Scene_Menu_create = Scene_Menu.prototype.create;
    Scene_Menu.prototype.create = function() {
        _Scene_Menu_create.call(this);
        this.createForegroundImage();
    };

    Scene_Menu.prototype.createForegroundImage = function() {
        if (imageName) {
            const sprite = new Sprite();
            sprite.bitmap = ImageManager.loadPicture(imageName);
            sprite.x = imageX;
            sprite.y = imageY;
            sprite.z = imageZ;
            this.addChild(sprite);
        }
    };
})();
