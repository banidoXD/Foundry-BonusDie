import {registerSettings} from "./Settings.js";
import {handle} from "./BonusDice.js";
import {socketsHandle} from "./socketsHandler.js";


const injectBonusDice = () => {
    // 1. Busca a lista usando o seletor que comprovamos que funciona
    const playerList = document.querySelector("#player-list") || document.querySelector("#players");
    
    if (!playerList) return;

    // 2. Pega os jogadores
    // Convertendo para Array 
    const playersItems = Array.from(playerList.querySelectorAll("li.player"));

    if (playersItems.length === 0) return;

    // 3. Prepara a função 
    const processor = handle(game.users);

    playersItems.forEach((li, index) => {
        // Verifica se já tem o botão para não duplicar
        if (li.querySelector(".BonusDie-button-container")) return;

        // Chama a função do BonusDice.js 
      
        processor(index, li);
    });
};

Hooks.on("init", async () => {
    await registerSettings();
});

Hooks.on("ready", () => {
    game.socket.on('module.BonusDie', socketsHandle());

   
    const targetNode = document.querySelector("#players") || document.body;
    
  
    const config = { childList: true, subtree: true };

    const observer = new MutationObserver((mutationsList, observer) => {
        
        injectBonusDice();
    });

    // Começa a vigiar
    observer.observe(targetNode, config);
    
    // Roda uma vez agora pra garantir
    injectBonusDice();
});
