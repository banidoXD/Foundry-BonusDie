import {registerSettings} from "./Settings.js";
import {handle} from "./BonusDice.js";
import {socketsHandle} from "./socketsHandler.js";

Hooks.on("init", async () => await registerSettings());

Hooks.on("ready", () => {
    // Escuta eventos de socket para atualizar dados
    // Nota: Removi os parenteses de socketsHandle() se ele for a função de callback, 
    // mas mantive como no original caso ele retorne uma função.
    game.socket.on('module.BonusDie', socketsHandle());
})

/* CORREÇÃO PARA FOUNDRY V13 */
Hooks.on("renderPlayerList", (playerList, html, players) => {
    // Na V13, 'html' é um elemento nativo (HTMLElement).
    // O código original usa .find(), que é do jQuery.
    // Solução: Envolvemos o html em $() para transformá-lo em jQuery de novo.
    const $html = $(html);
    
    // Agora o .find funciona e passa os elementos jQuery para a função handle
    $html.find('ol').children().each(handle(players));
});
