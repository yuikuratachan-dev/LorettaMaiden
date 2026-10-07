(function() {
    // 戦闘開始時にスイッチ39をON
    const _BattleManager_startBattle = BattleManager.startBattle;
    BattleManager.startBattle = function() {
        _BattleManager_startBattle.call(this);
        $gameSwitches.setValue(39, true);
    };

    // アクターごとのコマンド入力時にコモンイベントを並列処理
    const _Scene_Battle_startActorCommandSelection = Scene_Battle.prototype.startActorCommandSelection;
    Scene_Battle.prototype.startActorCommandSelection = function() {
        _Scene_Battle_startActorCommandSelection.call(this);
        this._processActorCommandParallel();
    };

    Scene_Battle.prototype._processActorCommandParallel = function() {
        const actor = BattleManager.actor();
        if (!actor) return;
        
        const actorId = actor.actorId();
        const commonEventMap = {
            1: 51,
            2: 52,
            3: 53,
            4: 54,
            5: 55,
            6: 56
        };

        if (commonEventMap[actorId]) {
            const eventId = commonEventMap[actorId];
            // `$gameTemp.reserveCommonEvent()` を使用して安全にコモンイベントを予約
            $gameTemp.reserveCommonEvent(eventId);
        }
    };
})();