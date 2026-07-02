# 1. Visão do jogo

**Status:** ✅ Estável

StreamRPG começou como "um Taskbar Hero melhor" para Twitch. Essa não é mais
a visão do projeto.

Hoje o StreamRPG é entendido como um motor de RPG persistente para criadores
de conteúdo. O overlay de Twitch é apenas uma das interfaces que vão consumir
a mesma Engine — não a definição do produto.

Interfaces previstas, todas consumindo a mesma Engine:

- Overlay na Twitch
- Overlay no YouTube
- Overlay na Kick
- Aplicativo mobile
- Site do Marketplace
- Armory web
- API pública
- Discord Bot

A separação entre Engine e plataforma (ver capítulo 2) é a decisão que torna
essa lista viável sem reescrever o núcleo do jogo a cada nova interface.

## Dependências

Nenhuma — capítulo fundacional, ponto de partida dos demais.
