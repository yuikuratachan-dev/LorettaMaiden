(function() {
    function updateActor3State() {
        const actor = $gameActors.actor(3);
        if (!actor) return;
        
        const variableValue = $gameVariables.value(112);
        const hasArmor54 = actor.isEquipped($dataArmors[54]);
        let newState = null;

        if (hasArmor54) {
            newState = 64;
        } else if (variableValue >= 100) {
            newState = 64;
        } else if (variableValue >= 50) {
            newState = 63;
        } else if (variableValue >= 25) {
            newState = 62;
        }

        // 既存のステートを削除
        actor.states().forEach(state => {
            if ([62, 63, 64].includes(state.id)) {
                actor.removeState(state.id);
            }
        });

        // 新しいステートを付与
        if (newState) {
            actor.addState(newState);
        }
    }

    const _Game_Actor_changeEquip = Game_Actor.prototype.changeEquip;
    Game_Actor.prototype.changeEquip = function(slotId, item) {
        _Game_Actor_changeEquip.call(this, slotId, item);
        updateActor3State();
    };

    const _Game_Variables_setValue = Game_Variables.prototype.setValue;
    Game_Variables.prototype.setValue = function(variableId, value) {
        _Game_Variables_setValue.call(this, variableId, value);
        if (variableId === 112) {
            updateActor3State();
        }
    };

    const _Scene_Battle_start = Scene_Battle.prototype.start;
    Scene_Battle.prototype.start = function() {
        _Scene_Battle_start.call(this);
        updateActor3State();
    };

    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        updateActor3State();
    };
})();