# 2. Princípios permanentes

**Status:** ✅ Estável

Estes não são detalhes de implementação — são compromissos de arquitetura.
Qualquer proposta de código que violar um destes deve ser sinalizada antes de
implementar, não corrigida depois. Ver capítulo 13 (Eventos) para as regras
específicas de escopo de evento derivadas destes princípios.

1. **Progressão sempre pertence ao Character.**
   Nunca a uma sessão, canal ou plataforma. XP, level, itens, ouro — tudo é
   estado do personagem, independente de onde ele estava presente quando o
   ganhou.

2. **Presença pertence à Platform.**
   Twitch, YouTube, Kick, mobile, o que vier depois — presença é "quem está
   aqui agora", nunca progressão. `SessionManager` conhece presença; nenhum
   System de gameplay conhece plataforma.

3. **Gameplay nunca conhece Twitch (ou qualquer plataforma específica).**
   Nenhum System de jogo importa um SDK de plataforma ou faz `fetch` para uma
   API externa de stream. Isso vive na camada de Presence/Platform, nunca
   dentro de XPSystem, DropSystem, BossSystem, etc.

   **Exceção conhecida, ainda não corrigida:** hoje `XPSystemV2` importa e
   chama `isChannelLive()` (de `twitch.service.ts`) diretamente para decidir
   se concede XP num tick. Isso viola este princípio na implementação atual
   — é uma dívida técnica registrada, não um exemplo a seguir. Quando um
   segundo Provider de presença (YouTube/Kick) existir, essa checagem
   precisa migrar para uma abstração de Presence Provider (ver capítulo 14),
   não continuar como chamada direta a um serviço específico de Twitch.

4. **Systems nunca chamam outros Systems diretamente.**
   Toda comunicação entre Systems passa pelo EventBus. Um System não importa
   outro System, não guarda referência a outro System, não invoca método de
   outro System.

5. **Tudo que altera progressão emite um evento.**
   Nenhuma mutação de estado de gameplay é silenciosa. Se XP mudou, evento. Se
   um item foi concedido, evento. Se um Boss morreu, evento. Isso é o que
   permite qualquer System futuro (incluindo um MetricsSystem) reagir sem
   acoplamento direto.

6. **Repositories nunca contêm regra de jogo.**
   Um Repository responde "existe?", "qual o valor?", "concede isso" — nunca
   decide chance de drop, raridade, dano, ou qualquer regra de balanceamento.
   Regra de jogo vive nos Systems; Repository só persiste/consulta.

7. **A Engine nunca conhece UI.**
   GameEngine, EventBus, GameClock, SessionManager e os Systems não sabem que
   existe um frontend, um overlay, um bot de Discord ou um app mobile. Eles
   emitem eventos; quem consome a UI decide como mostrar isso.

## Precedentes já aplicados

Não são exemplos hipotéticos — já aconteceram no código:

- Eventos de gameplay (`xp.granted`, `level.up`, `drop.granted`) nunca
  carregam `channelId` — decisão explícita, documentada em
  `apps/api/src/engine/types.ts`.
- `ItemRepository.grantToCharacter()` foi desenhado sem exigir `channelId`
  como parâmetro — persistência de "onde foi obtido" é detalhe de
  implementação, não parte do contrato de concessão (Sprint D4).
- A remoção do legado (Sprint E4) incluiu apagar a flag `USE_ENGINE_XP`
  inteira, não só o código morto óbvio — porque uma flag que pode desligar
  toda a progressão silenciosamente, sem nenhum fallback, viola o espírito do
  princípio 5, ainda que indiretamente.

## Dependências

Nenhuma — capítulo fundacional. Todos os demais capítulos dependem destes
princípios, não o contrário.
