# Citizen Progression — Implementação (Sprint 4, Vision 2.0)

**Status:** ✅ Implementado, testado e validado em navegador. Formaliza os 5 estágios de cidadania (Visitante → Residente → Cidadão → Veterano → Lenda) como domínio próprio — infraestrutura pura, nenhum critério de promoção, nenhum benefício.

## 1. Arquitetura

### 1.1 Auditoria (Fase 1)

Busca por qualquer lugar que trate todos os cidadãos como iguais, isto é, que exiba/consulte cidadania sem nunca diferenciar por rank:

| Achado | Classificação |
|---|---|
| `KingdomsPage.tsx` — a lista de cidadãos (Sprint 3) mostrava só nome + coroa de fundador, nunca o rank de cada um; o próprio jogador não via seu rank em lugar nenhum | **Precisava mudar** — corrigido nesta Sprint (Fase 7) |
| `CitizenRank` (shared, Sprint 3) — só tinha 4 valores persistidos, sem um conceito formal para "Visitante" | **Precisava mudar** — corrigido nesta Sprint (Fase 2) |
| `kingdom-prestige.service.ts` (Hall da Fama, 6 cargos) — eixo de prestígio completamente separado de cidadania/rank, não lê `citizens` | **Pode permanecer** — sistema paralelo, não é "tratar cidadãos como iguais", é um domínio diferente (já classificado assim desde `citizen-system-implementation.md` Fase 1) |
| "Quem pode construir casas/comprar terrenos/votar/liderar" | **Fica para Housing** (construir/terrenos) — nenhuma decisão tomada aqui, per Fase 8 |
| Modelo de liderança plugável (Coroa/Eleição/Guilda/Conquista) | **Fica para Kingdom Wars/Guild System** — não avaliado nesta Sprint |

Nenhuma nova dependência de audiência (`viewer_sessions` etc.) encontrada — a auditoria de `citizen-system-implementation.md` Fase 1 continua válida e completa.

### 1.2 CitizenRank (Fase 2)

```
PersistedCitizenRank = "residente" | "cidadao" | "veterano" | "lenda"
CitizenRank = "visitante" | PersistedCitizenRank
```

`PersistedCitizenRank` é o subconjunto que de fato vira uma linha em `citizens.rank` (inalterado desde a Sprint 3). `CitizenRank` é a escada completa de 5 estágios — usada por qualquer leitura que precise responder "qual o rank deste personagem agora", incluindo o caso derivado (sem linha ativa = `"visitante"`). `CITIZEN_RANK_ORDER` (residente→cidadao→veterano→lenda) e `CITIZEN_RANK_LADDER` (visitante + a ordem acima) são as duas constantes que `promote()`/`demote()` e a UI consomem — nenhum outro lugar do código deveria hardcodar a ordem dos estágios.

**Nenhum critério de promoção foi definido.** Nenhum valor, nenhum número de dias, nenhum limiar de contribuição — exatamente per Fase 2 do brief ("os critérios poderão mudar depois").

### 1.3 Engine (Fase 5)

Auditoria confirmou zero referência a `Citizen`/`CitizenRank` em `apps/api/src/engine/` — nenhum System hoje precisa saber de rank. Nada foi adicionado ali: não há necessidade de expor um tipo que nenhum consumidor real usa ainda (mesma disciplina de "não construir infraestrutura sem uso real" já seguida em Kingdom Domain). Quando um System futuro precisar de `CitizenRank`, deve importar o tipo já existente em `@streamrpg/shared`, nunca duplicá-lo.

## 2. Arquivos Alterados

| Arquivo | Responsabilidade |
|---|---|
| `packages/shared/src/types.ts` | `PersistedCitizenRank`, `CitizenRank`, `CITIZEN_RANK_ORDER`, `CITIZEN_RANK_LADDER`; `Citizen.rank` agora tipado como `PersistedCitizenRank` |
| `apps/api/src/services/citizen.service.ts` | +`getRank`/`promote`/`demote`/`updateRank` |
| `apps/api/src/services/citizen.service.test.ts` | +10 testes (getRank/promote/demote/updateRank) |
| `apps/api/src/routes/citizen.ts` | +`GET /api/citizen/rank`, +`POST /api/citizen/rank` |
| `apps/web/src/lib/citizenRank.ts` (novo) | `citizenRankLabel`/`citizenRankLadder` — função pura, rótulos em português |
| `apps/web/src/lib/citizenRank.test.ts` (novo) | 2 testes |
| `apps/web/src/pages/KingdomsPage.tsx` | Escada de rank no detalhe do Reino + rank de cada cidadão na lista |
| `apps/web/styles.css` | `.citizen-rank-ladder`/`.citizen-rank-current` |

*(Nenhuma tabela nova — ver Seção 4.)*

## 3. Modelo `CitizenRank`

Ver Seção 1.2. Nenhuma mudança de schema — a tabela `citizens` (Sprint 3) já tinha exatamente a coluna `rank` com o `CHECK` correto (`'residente'|'cidadao'|'veterano'|'lenda'`), então o "domínio oficial" pedido por esta Sprint já existia fisicamente; o que faltava era o tipo `CitizenRank` completo (incluindo Visitante) e a infraestrutura de serviço/rota/UI em cima dele.

## 4. Banco de Dados

**Nenhuma migração.** A coluna `citizens.rank`, criada na Sprint 3, já registra exatamente "o Rank atual" pedido pela Fase 3 desta Sprint — confirmado via auditoria antes de escrever qualquer schema novo, evitando uma coluna duplicada ou uma segunda fonte de verdade.

## 5. Serviços

`getRank(characterId)` — devolve o rank persistido, ou `"visitante"` se não há cidadania ativa. `promote(characterId)` / `demote(characterId)` — movem um estágio por vez dentro de `CITIZEN_RANK_ORDER`, nunca pulam estágio; `promote` rejeita no topo (`already-max-rank`), `demote` rejeita na base (`already-min-rank` — nunca desce a "visitante": sair do Reino continua sendo `leaveKingdom()`, não `demote()`). `updateRank(characterId, rank)` — define o rank diretamente, valida contra `CITIZEN_RANK_ORDER`. Nenhuma das quatro funções decide sozinha quando deveria ser chamada — nenhum gatilho de jogo as invoca nesta Sprint.

## 6. Rotas

`GET /api/citizen/rank` (autenticado, devolve o rank do jogador atual, incluindo `"visitante"`), `POST /api/citizen/rank` (autenticado, `{rank}`, chama `updateRank`). Confirmado sem colisão com `GET /api/citizen` (0 segmentos extras vs. 1 segmento extra `/rank`).

## 7. Interface Mínima

Em `KingdomsPage.tsx`, tela de detalhe: "Seu rank neste Reino" — lista dos 5 estágios (Visitante/Residente/Cidadão/Veterano/Lenda), o atual destacado por CSS (borda + peso de fonte, sem animação). Lista de cidadãos agora mostra `Nome — Rank` para cada um. Nenhum botão de promover/rebaixar exposto ao jogador — a UI é somente leitura, per Fase 7 ("nenhuma animação, nenhum efeito, nenhum progresso visual complexo").

## 8. Regras (Fase 8)

- **Quem pode construir casas?** Será decidido em Housing.
- **Quem pode comprar terrenos?** Será decidido em Housing.
- **Quem pode votar?** Será decidido em Sprint futura (Guild System/Kingdom Wars).
- **Quem pode liderar?** Será decidido em Sprint futura (liderança plugável, `kingdom-domain-2.0.md` Seção 2).

Nenhuma dessas perguntas foi respondida nesta Sprint — apenas nomeadas, per instrução explícita do brief.

## 9. Testes

19 testes na suíte do `citizen.service.test.ts` (9 pré-existentes da Sprint 3 + 10 novos: `getRank` visitante/residente, `promote`/`demote` rejeitam não-cidadão, `promote` avança sem pular estágio, `promote` rejeita além do topo, `demote` recua e nunca desce abaixo de residente, `updateRank` rejeita não-cidadão e define diretamente). 2 testes novos em `citizenRank.test.ts` (rótulos, ordem da escada). Passaram 100% em todas as execuções. Suíte completa da API rodada 3 vezes: falhas confinadas exclusivamente à dívida SQLITE_BUSY já documentada (`economy.service.test.ts`, `SQLiteCharacterRepository.test.ts`, `salvage.service.test.ts` sob concorrência) — nunca `citizen.service.test.ts`/`kingdom.service.test.ts`. Shared 507/507 inalterado, Web 100/100 (98 + 2 novos).

## 10. Typecheck / Build

Shared e Web: zero erros. API: mesma baseline de dívida pré-existente exata, zero erros novos. Build (`build:web`) limpa.

## 11. Browser Validation

Fluxo completo (executado duas vezes nesta Sprint, devido a uma queda de sessão no meio da primeira execução — ambas confirmaram o mesmo resultado): Login (fixture com personagem+500 Gold+3 itens) → Adventure (idle rodando) → Kingdoms → Entrar em Reino Oficial ("Você pertence a este Reino") → **Mostrar Rank** (escada com "Residente" destacado; `GET /api/citizen/rank` confirmado via fetch direto devolvendo `{"rank":"residente"}`; lista de cidadãos mostrando "Nome — Residente" para cada um) → Merchant (venda real: "Adaga vendido por 7/14 de Ouro") → Blacksmith (melhoria real: "Cinto melhorado por 40 de Ouro. Poder agora: 45.") → Salvage (desmontagem real: "Adaga desmontado. Recebeu 32 de materials.") → Adventure (idle nunca parou, Nível 1→3 na segunda execução). Zero erros de console em todo o fluxo, nas duas execuções.

## 12. Compatibilidade

RC1/Economy/Merchant/Blacksmith/Salvage/Equipment Lock/Living Character/Living World/Backpack/City/Kingdom Domain/Citizen System — todos confirmados funcionando exatamente iguais via transações reais.

## 13. Problemas Encontrados

Nenhum bug novo. Um evento externo: a sessão de trabalho caiu no meio da Browser Validation (MCP do navegador desconectou), derrubando o servidor dev e o servidor QA de fixture — recuperado reiniciando ambos e repetindo o fluxo do zero, com o mesmo resultado.

**Risco arquitetural nomeado (não um bug, uma limitação deliberada a vigiar)**: `POST /api/citizen/rank` está autenticado (exige sessão), mas só verifica que o chamador é cidadão ativo — não existe hoje nenhum sistema de autoridade/moderação que restrinja quem pode chamar essa rota para o próprio personagem. Como nenhuma tela de jogador expõe essa ação (Fase 7 é somente leitura) e nenhum benefício/vantagem está ligado a rank ainda, o impacto de um jogador chamar a rota diretamente hoje é nulo — mas isso muda assim que Housing (ou qualquer Sprint futura) passar a gatear algo por rank. Documentado explicitamente aqui, mesma disciplina de `citizen-system.md` Seção 6 ("cidadania precisa herdar a mesma vigilância contra exploit que outras métricas de jogo").

## 14. Próximos Passos (Housing Phase I)

Housing deve decidir, antes de implementar: (a) o critério real de promoção residente→cidadão (tempo + contribuição, per `citizen-system.md` Seção 5, ainda não calibrado); (b) se a permissão de construir exige Residente ou Cidadão; (c) se/como fechar o buraco de autoridade nomeado na Seção 13 antes de ligar qualquer benefício a rank. `getRank(characterId)` e `promote`/`demote`/`updateRank` desta Sprint já estão prontos para Housing consumir sem precisar reinventar a leitura/escrita de rank.

---

*Referências: `docs/design/citizen-system.md`, `docs/design/citizen-system-implementation.md`, `docs/design/kingdom-domain-2.0.md`, `docs/design/housing-phase1.md`, `docs/design/real-estate.md`, `docs/design/new-roadmap.md`, `docs/game-design-bible/00-philosophy.md`, `docs/architecture/decisions.md` (D2/D5/D7 respeitados).*
