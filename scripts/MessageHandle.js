import {getSetting} from "./Settings.js";

// Mapeamento para saber qual mensagem pegar
const messageType = {
    increase: 'messageOnIncrease',
    decrease: 'messageOnDecrease',
    use: 'messageOnUse',
    gift: 'messageOnGift'
}

// Mapeamento para saber qual Toggle (checkbox) verificar
const toggleType = {
    increase: 'showMsgIncrease',
    decrease: 'showMsgDecrease',
    use: 'showMsgUse',
    gift: 'showMsgGift'
}

const processorMethod = (playerOwner, playerTarget) => () => (valueToReplace) => {
    switch (valueToReplace) {
        case '[$player]':
            return game?.users?.get(playerOwner)?.name;
        case '[$bonusDie]':
            return getSetting('nameOfBonusDie');
        case '[$targetPlayer]':
            return game?.users?.get(playerTarget)?.name;
        default:
            return `'${valueToReplace}' is not on the list of supported tags`;
    }
}

const parseRawMessages = (unparsedMessage, processorWithPlayerData) => {
    return unparsedMessage.replace(/\[\$([A-z]+)\]/g, processorWithPlayerData())
}

const getMessageContent = (context, processorWithPlayerData) => {
    const unparsedMessage = getSetting(messageType[context]);
    return parseRawMessages(unparsedMessage, processorWithPlayerData);
}

const createNewMessage = async (context, playerOwner, playerTarget) => {
    // 1. VERIFICAR SE A MENSAGEM ESTÁ ATIVADA NAS CONFIGURAÇÕES
    const isEnabled = getSetting(toggleType[context]);
    
    // Se estiver desligado (false), para a execução aqui e não manda nada pro chat.
    if (!isEnabled) return;

    const processorWithPlayerData = processorMethod(playerOwner, playerTarget);
    const contentText = getMessageContent(context, processorWithPlayerData);
    const aliasName = getSetting('nameOfAlias');

    // 2. LÓGICA ESPECIAL PARA ROLAGEM DE DADOS (CONTEXTO 'USE')
    if (context === 'use') {
        const formula = getSetting('dieFormula') || "1d6";
        
        // Cria a rolagem
        const roll = new Roll(formula);
        await roll.evaluate(); // Avalia (rola) o dado - Obrigatório na V12/V13 ser async

        // Cria a mensagem contendo a rolagem 3D
        return roll.toMessage({
            flavor: contentText, // O texto da mensagem vai como "Flavor" (cabeçalho)
            speaker: {
                alias: aliasName
            }
        });
    }

    // 3. MENSAGEM PADRÃO (SEM ROLAGEM) PARA OS OUTROS CASOS (GIFT, INCREASE...)
    return ChatMessage.create({
        content: contentText,
        speaker: {
            alias: aliasName
        }
    });
}

export {createNewMessage};
