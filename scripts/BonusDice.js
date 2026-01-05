import {getCounter, getSetting, setCounter} from "./Settings.js"
import {createNewMessage} from "./MessageHandle.js";

// ... (Mantenha todas as funções auxiliares: createWarning, getJQueryObjectFromId, etc. até chegar na handle) ...
// SE PREFERIR, PODE COPIAR O ARQUIVO INTEIRO ABAIXO QUE JÁ CONTÉM TUDO:

/* -------------------------------------------------------------------------- */
/* COLE ISTO SUBSTITUINDO O ARQUIVO INTEIRO PARA GARANTIR QUE NADA FALTE */
/* -------------------------------------------------------------------------- */

const createWarning = (checkSource, type) => {
    if (checkSource === game.user._id) ui.notifications.warn(getSetting(type));
}

const getJQueryObjectFromId = (id) => $(`#BonusDie-${id}`);

const updateCounter = (counter, newValue) => {
    if (Array.isArray(counter)) {
        counter.forEach((entity) => getJQueryObjectFromId(entity).text(newValue[entity]));
    } else {
         Object.keys(newValue).forEach(key => getJQueryObjectFromId(key).text(newValue[key]));
    }
}

const createShouldModifyObject = (counter, players, modifiers) => {
    let returnValue = true;
    let reason = 'nothing';
    const maxNrDice = getSetting('maxNrOfBonusDice');
    players.forEach((current, index) => {
        if (counter[current] === 0 && modifiers[index] === -1) {
            returnValue = false;
            reason = 'onModifyNegative';
        }
        if (maxNrDice !== 0 && (counter[current] === maxNrDice && modifiers[index] === 1)) {
            returnValue = false;
            reason = 'onOverLimit';
        }
    })
    return { state: returnValue, reason: reason };
}

const warnings = (source, modify) => {
    if (!source) return ui.notifications.warn(getSetting(modify.reason));
    game.socket.emit('module.BonusDie', {
        action: 'warningFallBack',
        source: source,
        reason: modify.reason
    })
}

const createMessageOnModification = async (context, players) =>
    context === 'gift' ? await createNewMessage(context, players[1], players[0]) : await createNewMessage(context, players[0])

const modifyCounter = (players, counter, modifiers) => {
    players.forEach((pl, index) => {
        if (isNaN(counter[pl])) counter[pl] = 0;
        counter[pl] = Math.max(counter[pl] + modifiers[index], 0);
    })
    return counter;
}

const updateCounterAndDisplay = (counter, players) => {
    setCounter(counter).then(() => {
        updateCounter(players, counter);
        game.socket.emit('module.BonusDie', {
            action: 'updatePlayerDisplay',
            targetId: players,
            counter: counter
        })
    });
}

const modifyBonusDieAmountGM = async (players, modifiers, context, source) => {
    if (!game.user.isGM) return;
    let counter = getCounter();
    const modify = createShouldModifyObject(counter, players, modifiers);
    if (!modify.state) return warnings(source, modify);
    await createMessageOnModification(context, players);
    counter = modifyCounter(players, counter, modifiers);
    updateCounterAndDisplay(counter, players);
}

const modifyBonusDieAmountPlayer = async (player, modifier, context, source) => {
    await game.socket.emit('module.BonusDie', {
        action: 'requestCounterUpdate',
        players: player,
        modifier: modifier,
        context: context,
        source: source
    })
}

const methodSelector = (type, player) => async (event) => {
    event.preventDefault();
    event.stopPropagation();
    switch (type) {
        case 'increase': return modifyBonusDieAmountGM([player], [1], 'increase');
        case 'decrease': return modifyBonusDieAmountGM([player], [-1], 'decrease');
        case 'use': return await modifyBonusDieAmountPlayer([player], [-1], 'use', player);
        case 'gift': return await modifyBonusDieAmountPlayer([player, game.user._id], [1, -1], 'gift', game.user._id);
    }
}

const iconSelector = (type) => `fas ${type === 'increase' ? 'fa-plus' : type === 'decrease' ? 'fa-minus' : type === 'use' ? 'fa-dice-d20' : 'fa-gift'}`;

const button = (player) => (type) => {
    const iconType = iconSelector(type);
    let createdButton = $(`<a class="bonus-die-btn" title="${type}"><i class="${iconType}"></i></a>`);
    createdButton.on('click', methodSelector(type, player));
    return createdButton;
}

const getBonusDieValue = (player) => {
    const counter = getCounter();
    if (counter?.[player]) return counter[player];
    else return 0;
}

const getSpanId = (index) => `BonusDie-${index}`;

const bonusDieStructure = (player) => $(`<span class="bonus-die-count" id="${getSpanId(player)}" style="margin: 0 5px; font-weight: bold;">${getBonusDieValue(player)}</span>`);

const getControlsForSingleUser = (user) => {
    const playerId = user.id;
    const $bonusDie = bonusDieStructure(playerId);
    const buttonWithPlayer = button(playerId);

    if (game.user.isGM) {
        const buttonPlus = buttonWithPlayer('increase');
        const buttonMinus = buttonWithPlayer('decrease');
        // REMOVA A LINHA ABAIXO SE QUISER VER OS BOTOES SENDO GM NO SEU PROPRIO NOME
        // if (user.isGM) return []; 
        return [$bonusDie, buttonPlus, buttonMinus];
    } else {
        const buttonUse = game.user._id === playerId ? buttonWithPlayer('use') : '';
        const buttonGift = game.user._id !== playerId ? buttonWithPlayer('gift') : '';
        if (user.isGM) return [];
        return [$bonusDie, buttonUse, buttonGift];
    }
}

/**
 * Handle principal - Atualizado para aceitar tanto Elemento HTML quanto jQuery
 */
const handle = (players) => (index, playerHTML) => {
    // Garante jQuery
    const $playerLi = $(playerHTML);
    
    // Verifica duplicidade mais uma vez por segurança
    if ($playerLi.find('.BonusDie-button-container').length > 0) return;

    // Pega o ID
    const userId = $playerLi.data("user-id") || $playerLi.attr("data-user-id");
    if (!userId) return;

    const user = game.users.get(userId);
    if (!user) return;

    const $container = $('<div class="BonusDie-button-container flexrow" style="flex: 0 0 auto; justify-content: flex-end; gap: 3px; font-size: 0.9em;"></div>');
    
    const controls = getControlsForSingleUser(user);
    
    if (controls.length > 0) {
        $container.append(...controls);
        $playerLi.append($container);
    }
}

export {handle, updateCounter, modifyBonusDieAmountGM, createWarning}
