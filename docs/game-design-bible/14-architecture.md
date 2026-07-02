# 14. Arquitetura

**Status:** ✅ Estável

Este capítulo responde só a uma pergunta: como o jogo funciona por dentro?

## Fluxo

```
Twitch
   ↓
Presence
   ↓
SessionManager
   ↓
WorldTick
   ↓
EventBus
   ↓
Systems
   ↓
Repositories
   ↓
SQLite
```

- **Twitch é apenas um Provider de Presence.** Hoje é o único provider
  existente (chamado a partir da rota de ping); YouTube/Kick/Discord entram
  no mesmo lugar, sem tocar em nada abaixo de `SessionManager`.
- **Os Systems não conhecem Twitch.** Eles reagem a eventos do `EventBus`,
  nunca fazem chamada de rede a uma plataforma. (Exceção conhecida hoje:
  `XPSystemV2` ainda chama `isChannelLive()` diretamente — ver a nota na
  regra 3 do capítulo 2. É dívida técnica, não o modelo a seguir.)
- **Gameplay depende apenas do EventBus.** `XPSystem`, `DropSystem`,
  `WelcomeRewardSystem` (e, no futuro, `BossSystem`/`QuestSystem`) só
  conhecem eventos e Repositories — nunca uns aos outros, nunca uma
  plataforma.
- **Repositories persistem.** `CharacterRepository`, `ItemRepository` — só
  leem/escrevem, nunca decidem regra de jogo (princípio 6).
- **Engine governa a progressão.** Desde o Marco 1.0 (Sprint E4), nenhuma
  regra de XP/Level/Welcome/Drop vive fora do `EventBus`/`Systems`. Gold é a
  única exceção deliberada, ainda no caminho legado.

## Por que isso importa agora

Este documento vira valioso no dia em que aparecer um segundo Provider de
presença (YouTube, Kick, Discord). Se a separação acima estiver correta,
adicionar um provider novo é só mais uma fonte alimentando
`SessionManager.reportPresent()` — nenhum System de gameplay precisa mudar.

## Dependências

Arquitetura depende de:
- Princípios permanentes
- Eventos (o fluxo descrito aqui é a materialização das categorias/escopos
  do capítulo 13)
