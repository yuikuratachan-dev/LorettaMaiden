/*:
 * @target MZ
 * @plugindesc スイッチの状態に応じてメインメニューに画像を表示します（座標調整可能）。
 * @author かがらーと
 * @help このプラグインは、スイッチの状態によってメインメニューに指定の画像を表示します。
 * スイッチ22～25のいずれかがオンの場合、対応する画像がメインメニューに表示されます。
 * 
 * 画像は「img/pictures/button/」フォルダに配置してください。
 *
 * 表示される画像:
 * スイッチ22がオン -> pictures/button/Morning.png
 * スイッチ23がオン -> pictures/button/Noon.png
 * スイッチ24がオン -> pictures/button/Evening.png
 * スイッチ25がオン -> pictures/button/Night.png
 * 
 * 画像の表示位置はプラグインパラメータで調整できます。
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
    const parameters = PluginManager.parameters('KG_SwitchBasedMenuImage');
    const xOffset = Number(parameters['xOffset'] || 0);
    const yOffset = Number(parameters['yOffset'] || 0);

    const imageSettings = [
        { switchId: 22, fileName: 'Morning' },
        { switchId: 23, fileName: 'Noon' },
        { switchId: 24, fileName: 'Evening' },
        { switchId: 25, fileName: 'Night' }
    ];

    // メニューシーンの作成
    const _Scene_Menu_create = Scene_Menu.prototype.create;
    Scene_Menu.prototype.create = function() {
        _Scene_Menu_create.call(this);
        this.createMenuImage();
    };

    // 画像の作成
    Scene_Menu.prototype.createMenuImage = function() {
        imageSettings.forEach(setting => {
            if ($gameSwitches.value(setting.switchId)) {
                const bitmap = ImageManager.loadPicture(`button/${setting.fileName}`);
                bitmap.addLoadListener(() => {
                    const sprite = new Sprite(bitmap);
                    sprite.x = xOffset;
                    sprite.y = yOffset;
                    this.addChild(sprite);
                });
            }
        });
    };
})();
