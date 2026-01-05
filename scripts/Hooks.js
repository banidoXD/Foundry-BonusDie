import {registerSettings} from "./Settings.js";
import {handle} from "./BonusDice.js";
import {socketsHandle} from "./socketsHandler.js";

// Função que faz o trabalho pesado
const injectBonusDice = () => {
    // 1. Busca a lista usando o seletor que comprovamos que funciona
    const playerList = document.querySelector("#player-list") || document.querySelector("#players");
    
    if (!playerList) return;

    // 2. Pega os jogadores
    // Convertendo para Array para facilitar
    const playersItems = Array.from(playerList.querySelectorAll("li.player"));

    if (playersItems.length === 0) return;

    // 3. Prepara a função de manipulação (Handle)
    // Passamos game.users direto
    const processor = handle(game.users);

    playersItems.forEach((li, index) => {
        // Verifica se já tem o botão para não duplicar (IMPORTANTE no MutationObserver)
        if (li.querySelector(".BonusDie-button-container")) return;

        // Chama a função do BonusDice.js passando o elemento cru (HTMLElement)
        // O BonusDice.js vai converter pra jQuery se precisar
        processor(index, li);
    });
};

Hooks.on("init", async () => {
    await registerSettings();
});

Hooks.on("ready", () => {
    game.socket.on('module.BonusDie', socketsHandle());

    // --- A ESTRATÉGIA DO VIGIA (MUTATION OBSERVER) ---
    const targetNode = document.querySelector("#players") || document.body;
    
    // Configura o observador: qualquer mudança nos filhos ou netos dispara o código
    const config = { childList: true, subtree: true };

    const observer = new MutationObserver((mutationsList, observer) => {
        // Tenta injetar sempre que houver mudança
        injectBonusDice();
    });

    // Começa a vigiar
    observer.observe(targetNode, config);
    
    // Roda uma vez agora pra garantir
    injectBonusDice();
});
