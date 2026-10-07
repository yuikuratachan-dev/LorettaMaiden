/*:
 * @target MZ
 * @plugindesc イベントの当たり判定と画像位置をメモ欄で変更するプラグイン
 * @author 紅紫かがらーと
 * 
 * @help
 * イベントのメモ欄に以下の形式で指定してください：
 *
 * <SizeX: 2>
 * <SizeY: 2>
 * 
 * ・SizeX: 横方向の当たり判定の大きさ（デフォルトは1）
 * ・SizeY: 縦方向の当たり判定の大きさ（デフォルトは1）
 * 
 * 指定されたサイズに基づき、当たり判定を変更します。
 * また、画像位置も自動的に調整されます。
 *
 * このプラグインにはプラグインコマンドはありません。
 */

(() => {
    // メモ欄を解析してサイズを取得
    const getEventSize = event => {
        if (!event || !event.event()) {
            return { sizeX: 1, sizeY: 1 }; // デフォルトのサイズを返す
        }
    
        const meta = event.event().meta || {};
        const sizeX = meta.SizeX ? parseInt(meta.SizeX) : 1;
        const sizeY = meta.SizeY ? parseInt(meta.SizeY) : 1;
        return { sizeX, sizeY };
    };
    

    // 当たり判定を変更（プレイヤーとイベント）
    const _Game_Event_isCollidedWithPlayer = Game_Event.prototype.isCollidedWithPlayer;
    Game_Event.prototype.isCollidedWithPlayer = function(x, y) {
        const { sizeX, sizeY } = getEventSize(this);
        const evX = this.x;
        const evY = this.y;

        // サイズに基づいて範囲内かどうか判定
        return x >= evX && x < evX + sizeX && y >= evY && y < evY + sizeY;
    };

    // 当たり判定を変更（イベント同士の衝突）
    const _Game_Event_isCollidedWithEvents = Game_Event.prototype.isCollidedWithEvents;
    Game_Event.prototype.isCollidedWithEvents = function() {
        const { sizeX, sizeY } = getEventSize(this);
        return $gameMap.events().some(event => {
            const evX = event.x;
            const evY = event.y;
            return this !== event &&
                evX < this.x + sizeX &&
                evX + sizeX > this.x &&
                evY < this.y + sizeY &&
                evY + sizeY > this.y;
        });
    };

    // 画像の位置を調整
    const _Sprite_Character_updatePosition = Sprite_Character.prototype.updatePosition;
    Sprite_Character.prototype.updatePosition = function() {
        _Sprite_Character_updatePosition.call(this);
        const character = this._character;
        if (character instanceof Game_Event) {
            const { sizeX, sizeY } = getEventSize(character);
            // 中央揃えにするための補正
            const offsetX = (sizeX - 1) * -24; // 1マス = 48px の半分
            const offsetY = (sizeY - 1) * -24;
            this.x += offsetX;
            this.y += offsetY;
        }
    };
})();
