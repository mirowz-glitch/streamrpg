# Housing Phase I — Implementação (Sprint 5, Vision 2.0)

**Status:** ✅ Implementado, testado e validado em navegador. A Casa é o primeiro ativo verdadeiramente permanente do mundo — pertence ao Reino, não ao personagem. Infraestrutura pura: nenhum mercado, imposto, decoração, upgrade ou construção modular.

## 1. Arquitetura

### 1.1 Auditoria (Fase 1)

Localizar qualquer sistema que assuma propriedade diretamente-Character-scoped, para contrastar com o novo modelo Kingdom-owned de House:

| Sistema | Modelo de posse | Classificação |
|---|---|---|
| `character_items`/`equipped_items` (Economy Core, Merchant, Blacksmith, Salvage) | Character-owned direto, para sempre — item pertence a quem o encontrou/comprou | **Correto, não muda.** Itens são posse individual real, nunca deveriam pertencer ao Reino — a distinção é intencional, não um bug a corrigir. |
| `citizens` (Citizen System) | Character↔Kingdom, mas a *cidadania em si* nunca é "possuída" por ninguém — é uma relação | Eixo diferente, não comparável a posse de ativo |
| `kingdoms.founder_profile_id`/`leader_profile_id` | Pessoa associada ao Reino, mas o Reino não "pertence" à pessoa (mesmo princípio que House usa) | **Precedente direto** — House repete o mesmo padrão fundação-permanente/posse-transitória, um nível abaixo |

Nenhum sistema existente precisou mudar. O gap real era a ausência total de um domínio de propriedade Kingdom-owned — House é aditivo puro.

### 1.2 O domínio House (Fase 2)

```
House
  id
  kingdom_id                     — a quem a Casa pertence de verdade
  district, plot                 — texto livre nesta Sprint
  name
  current_owner_character_id     — quem cuida dela agora (transitório)
  original_builder_character_id  — quem construiu (permanente, nunca muda)
  created_at
  status                         — 'active' | 'abandoned' (só 'active' é escrito aqui)
  house_type                     — texto livre, só 'residencia' nesta Sprint
  history                        — log append-only (HouseHistoryEvent[])
```

`is_founder`/`is_leader`/`character_display_name` do Citizen já tinham estabelecido o padrão "derivado via join, nunca coluna" — House estende isso para `current_owner_display_name`/`original_builder_display_name`/`kingdom_name`.

### 1.3 Quem pode construir? (decisão desta Sprint)

`citizen-progression-implementation.md` Fase 8 deixou em aberto "quem pode construir casas? Será decidido em Housing." Esta Sprint responde: **qualquer cidadão ativo do Reino alvo** (Residente ou acima) — nenhum rank mínimo maior (Cidadão/Veterano) é exigido. `createHouse()` rejeita com `not-a-citizen` quem não é cidadão ativo daquele Reino específico, mas não distingue entre estágios da escada.

### 1.4 Engine (Fase 5)

Auditoria confirmou zero referência a `House` em `apps/api/src/engine/`. Nada foi adicionado — mesma decisão já tomada em Citizen Progression Fase 5 (não criar um alias de tipo sem consumidor real).

## 2. Arquivos Alterados

| Arquivo | Responsabilidade |
|---|---|
| `packages/shared/src/types.ts` | `House`, `HouseStatus`, `HouseHistoryEvent` |
| `apps/api/src/config/schema.ts` | Nova tabela `houses` (aditiva) |
| `apps/api/src/services/housing.service.ts` (novo) | `createHouse`/`getHouse`/`listHouses`/`listKingdomHouses`/`transferOwnership` |
| `apps/api/src/services/housing.service.test.ts` (novo) | 11 testes |
| `apps/api/src/routes/housing.ts` (novo) | `POST /api/houses`, `GET /api/houses`, `GET /api/house/:id`, `GET /api/kingdom/:id/houses`, `PUT /api/house/:id/owner` |
| `apps/api/src/server.ts` | Registra `housingRoutes` |
| `apps/web/src/pages/HousingPage.tsx` (novo) | Lista + construção + detalhe, tela mínima |
| `apps/web/src/lib/router.tsx` | Rota `/app/housing` |
| `apps/web/src/components/ui/AppNav.tsx` | Link "🏠 Casas" |

## 3. Modelo `House`

Ver Seção 1.2. Decisão central: `original_builder_character_id` nunca muda; `current_owner_character_id` nasce igual ao construtor e só muda via `transferOwnership`. Nenhum ON DELETE CASCADE/SET NULL nessas duas colunas — deletar um personagem nunca deveria apagar ou orfanar uma Casa (a própria filosofia da Sprint).

## 4. Banco de Dados

Nenhuma migração `ALTER TABLE` — `houses` é inteiramente nova. `district`/`plot` são texto livre (a divisão real em bairros com capacidade, per `housing-phase1.md` Seção 2, é escopo futuro). `history` é serializado em JSON numa coluna TEXT — cada fato (`built`, depois cada `transferred`) é acrescentado, nunca reescrito.

## 5. Serviços

`createHouse(builderCharacterId, input)` — rejeita Reino inexistente, nome vazio, ou quem não é cidadão ativo daquele Reino; grava o construtor como proprietário inicial e o primeiro evento `built` no histórico. `getHouse`/`listHouses`/`listKingdomHouses` — leitura pura. `transferOwnership(houseId, newOwnerCharacterId)` — infraestrutura administrativa (nenhuma compra/venda/preço), rejeita Casa ou personagem de destino inexistentes, preserva `original_builder_character_id` para sempre, acrescenta um evento `transferred` ao histórico.

## 6. Rotas

`POST /api/houses` (autenticado), `GET /api/houses` (pública), `GET /api/house/:id` (pública), `GET /api/kingdom/:id/houses` (pública), `PUT /api/house/:id/owner` (autenticado, administrativa). Confirmado sem colisão com `/api/kingdom/:id/citizens` (Citizen System) nem `/api/kingdom/:slug`/`/api/kingdom/:channel/me` — sufixos literais distintos.

## 7. Interface Mínima

`HousingPage.tsx`: resolve `GET /api/citizen` primeiro — se o jogador não é cidadão de nenhum Reino, mostra "Você precisa ser cidadão de um Reino para construir uma casa" e para aí. Se é cidadão, lista as Casas do Reino atual + formulário (Nome, Bairro opcional, Lote opcional) + detalhe ao clicar (Nome, Reino, Bairro/Lote se houver, Tipo, Construtor original, Proprietário atual, data). Nenhuma decoração, mapa ou visualização 3D. Nenhum botão de transferência exposto — `PUT /api/house/:id/owner` é infra sem UI, ver Seção 13.

## 8. Legado (Fase 8)

Cada Casa grava permanentemente quem construiu (`original_builder_character_id`, imutável) e mantém `current_owner_character_id` sempre presente (nunca nulo). O log `history` nunca é editado — só recebe eventos novos. Confirmado via teste: transferir posse preserva o construtor original e soma um segundo evento ao histórico sem apagar o primeiro.

## 9. Testes

11 testes novos (`housing.service.test.ts`): `createHouse` (Reino inexistente, nome vazio, não-cidadão do Reino alvo, cidadão de Reino diferente, construção bem-sucedida com histórico de 1 evento), `getHouse`/`listHouses`/`listKingdomHouses` (busca, filtro por Reino, lista global), `transferOwnership` (Casa inexistente, personagem de destino inexistente, transferência real preservando construtor + histórico de 2 eventos). Passaram 100% em todas as execuções. Suíte completa da API rodada 3 vezes: falhas confinadas exclusivamente à dívida SQLITE_BUSY já documentada (`SQLiteCharacterRepository.test.ts`, `economy.service.test.ts`, `kingdom.service.test.ts`, `merchant.service.test.ts`, `salvage.service.test.ts` sob concorrência) — nunca `housing.service.test.ts`. Shared 507/507 e Web 100/100 inalterados (nenhuma lógica de negócio em `HousingPage.tsx`, per D2/D5, então nenhum teste web novo).

## 10. Typecheck / Build

Shared e Web: zero erros. API: mesma baseline de dívida pré-existente exata, zero erros novos. Build (`build:web`) limpa.

## 11. Browser Validation

Fluxo completo: Login (fixture com personagem+500 Gold+3 itens) → Adventure (idle rodando) → Kingdoms → Entrar em Reino Oficial → **Housing** (estado vazio correto → construiu "Casa da Colina" no Bairro Velho → detalhe mostrando Nome/Reino/Bairro/Tipo/Construtor original/Proprietário atual, ambos "QA Morador" → apareceu na lista com "Proprietário: QA Morador") → Merchant (venda real: "Cinto vendido por 7 de Ouro") → Blacksmith (melhoria real: "Cinto melhorado por 40 de Ouro. Poder agora: 37.") → Salvage (desmontagem real: "Cajado desmontado. Recebeu 8 de materials.") → Adventure (idle nunca parou, Nível 1→7, 53 encontros, dentro de uma Dungeon). Zero erros de console em todo o fluxo.

## 12. Compatibilidade

RC1/Economy/Merchant/Blacksmith/Salvage/Equipment Lock/Living Character/Living World/Backpack/City/Kingdom Domain/Citizen System/Citizen Progression — todos confirmados funcionando exatamente iguais via transações reais.

## 13. Problemas Encontrados

Um bug de schema: backticks dentro de um comentário SQL (a palavra `history`) quebraram o template literal, mesma classe de erro já documentada em Sprints anteriores — corrigido antes de qualquer teste rodar.

**Risco arquitetural nomeado (mesma classe já registrada em Citizen Progression)**: `PUT /api/house/:id/owner` é autenticado mas não verifica que o chamador é o proprietário atual da Casa nem exige nenhuma autoridade especial — aceita qualquer `new_owner_character_id` de qualquer sessão válida. Nenhuma tela desta Sprint expõe uma ação de jogador que chame essa rota (HousingPage.tsx é só leitura + construção), então o impacto real hoje é nulo, mas isso precisa ser fechado (ou substituído pela lógica real de venda) antes de Real Estate Phase I depender de transferência de posse.

## 14. Próximos Passos (Real Estate Phase I)

Real Estate deve decidir: fórmula de preço, leilão vs. preço fixo, mitigação de RMT/especulação (per `real-estate.md` Seção 3) e como `transferOwnership()` desta Sprint vira o mecanismo real por trás de uma venda voluntária — incluindo fechar o gap de autoridade da Seção 13 antes de expor a rota a jogadores. `listKingdomHouses`/`getHouse` já estão prontos para alimentar um mercado consultável sem reinventar a leitura.

---

*Referências: `docs/design/housing-phase1.md`, `docs/design/real-estate.md`, `docs/design/citizen-system.md`, `docs/design/citizen-progression-implementation.md`, `docs/design/kingdom-domain-2.0.md`, `docs/design/new-roadmap.md`, `docs/game-design-bible/00-philosophy.md`, `docs/architecture/decisions.md` (D2/D5/D7 respeitados).*
