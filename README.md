Bonus Die (V13 Fork)
Compatibilidade: Foundry VTT v13+

Este é um fork do módulo original Bonus Die criado por HadaIonut, atualizado e modernizado para funcionar nativamente no Foundry VTT V13.

O que é?
O Bonus Die permite ao Mestre (GM) dar aos jogadores "Dados Bônus" que podem ser gastos à vontade ou trocados entre os jogadores. Gastar um dado bônus dispara uma mensagem no chat e, nesta versão, rola um dado 3D real.

As mensagens são totalmente personalizáveis e utilizam palavras-chave que são substituídas automaticamente.

✨ Novidades neste Fork (v1.0.3+)
Além da compatibilidade total com a V13 (sem depender de jQuery ou Hooks antigos), este fork adiciona:

🎲 Rolagem 3D Real: Agora, ao usar um dado bônus, o sistema realmente rola um dado (ex: 1d6, 1d8) no chat, em vez de apenas enviar um texto.

⚙️ Fórmula Configurável: Escolha qual dado será rolado nas configurações (d6, d8, d20, etc.).

🔇 Controle de Mensagens: Opções para ocultar mensagens específicas (ex: esconder o aviso quando o GM remove um dado, mas manter quando o jogador ganha).

⚡ Performance: Código reescrito usando MutationObserver e ES Modules para maior estabilidade na interface da V13.

Instalação
Como este é um fork não oficial na lista principal (ainda), você deve instalar usando o link do manifesto:

No Foundry, vá na aba Add-on Modules.

Clique em Install Module.

No campo "Manifest URL", cole o link: https://raw.githubusercontent.com/banidoXD/Foundry-BonusDie/master/module.json

Clique em Install.

Configuração e Palavras-Chave
Você pode alterar todas as mensagens e comportamentos no menu Configure Settings do módulo.

Lista de Palavras-Chave (Keywords)
Estas tags serão substituídas automaticamente nas mensagens de chat:

[$player] - Nome do jogador que disparou a ação.

[$targetPlayer] - Nome do alvo da ação (ex: quem recebeu o presente).

[$bonusDie] - Nome do dado bônus (configurável, ex: "Inspiração", "Dado da Sorte").

Créditos
Autor Original: HadaIonut

Fork V13 & Novas Features: banidoXD
