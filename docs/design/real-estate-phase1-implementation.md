# Real Estate Phase I — Implementação (Sprint 6, Vision 2.0)

**Status:** ✅ Implementado, testado e validado em navegador com dois personagens reais (vendedor e comprador). A Casa se torna patrimônio negociável entre jogadores — a primeira transação verdadeiramente peer-to-peer do jogo (Gold sai de um personagem real e entra em outro, não "do sistema"). O Reino continua dono; só o proprietário muda; o histórico só cresce.

## 1. Arquitetura

### 1.1 Auditoria (Fase 1)

Verificar se algum código assume que `current_owner_character_id` de uma Casa nunca muda:

| Sistema | Suposição encontrada | Classificação |
|---|---|---|
| `housing.service.ts` (`transferOwnership`) | Já projetado em Housing Phase I para mudar o dono — é a própria função que este Sprint reutiliza | **Nenhuma correção necessária.** O ponto de mutação já existia, só faltava um motivo econômico real para chamá-lo. |
| `HousingPage.tsx` (detalhe da Casa) | Lê `current_owner_character_id` a cada carga de página, nunca cacheia como imutável | Compatível sem alteração |
| `Citizen`/`Kingdom`/`Economy`/`Merchant` | Nenhuma referência a posse de Casa | Não aplicável, confirmado via grep |

Conclusão: nenhum código presumia posse estática. O gap real era a ausência de um mecanismo de **venda voluntária com preço** — `transferOwnership()` já existia como movimento administrativo puro, sem conceito de pagamento.

### 1.2 O domínio HouseSale (Fase 2)

```
HouseSale
  id
  house_id
  seller_character_id
  asking_price
  created_at
  status                  — 'active' | 'sold' | 'cancelled'
  buyer_character_id      — null até a venda
  sold_at                 — null até a venda
  (derivados via join: house_name, kingdom_name, seller_display_name)
```

Mesmo padrão "derivado via join, nunca coluna" que Citizen/House já estabeleceram.

### 1.3 "Reutilizar transferOwnership(), nunca duplicar regra" (decisão desta Sprint)

`buyHouse()` não reimplementa a troca de dono — chama a mesma `transferOwnership()` de Housing Phase I, agora estendida com um parâmetro opcional `{ event, price }`. Isso satisfaz ao mesmo tempo a instrução explícita do brief e o requisito de histórico mais rico (Seção 8): um evento `"sold"` carrega `price`, um `"transferred"` administrativo não.

### 1.4 Peer-to-peer real (primeira vez no jogo)

Merchant/Blacksmith/Salvage sempre moveram Gold entre um personagem e "o sistema" (venda a NPC, custo de melhoria). `buyHouse()` é a primeira transação que debita um personagem real e credita outro, dentro da mesma transação SQL — compõe `debitCharacterResourceInTransaction`/`creditCharacterResourceInTransaction` (ADR-0001) com a chamada a `transferOwnership()` e a atualização do `house_sales.status`, tudo dentro de um único `BEGIN`/`COMMIT`.

## 2. Arquivos Alterados

| Arquivo | Responsabilidade |
|---|---|
| `packages/shared/src/types.ts` | `HouseHistoryEvent` estendido com `"sold"` + `price?`; novos `HouseSaleStatus`, `HouseSale` |
| `apps/api/src/config/schema.ts` | Nova tabela `house_sales` (aditiva, nunca altera `houses`) |
| `apps/api/src/services/housing.service.ts` | `transferOwnership()` estendido com `TransferOwnershipOptions` opcional (`event`, `price`) |
| `apps/api/src/services/realEstate.service.ts` (novo) | `createSale`/`cancelSale`/`buyHouse`/`listSales`/`getSale` |
| `apps/api/src/services/realEstate.service.test.ts` (novo) | 14 testes |
| `apps/api/src/routes/realEstate.ts` (novo) | 5 rotas de venda |
| `apps/api/src/server.ts` | Registra `realEstateRoutes` **antes** de `housingRoutes` (evita colisão de rota, ver Seção 13) |
| `apps/web/src/pages/RealEstatePage.tsx` (novo) | Mercado: lista de anúncios ativos, Comprar/Cancelar |
| `apps/web/src/pages/HousingPage.tsx` | Botão "Vender esta Casa" no detalhe, visível só ao proprietário atual |
| `apps/web/src/lib/router.tsx` | Rota `/app/real-estate` |
| `apps/web/src/components/ui/AppNav.tsx` | Link "💰 Mercado" |

## 3. Modelo `HouseSale`

Ver Seção 1.2. `asking_price` é fixo no momento do anúncio — sem leilão, sem negociação, sem flutuação. Um `house_id` só pode ter um anúncio `active` por vez (`createSale` rejeita com `already-listed` caso já exista um).

## 4. Banco de Dados

Nenhum `ALTER TABLE` em `houses` — `house_sales` é inteiramente nova, referenciando `house_id`/`seller_character_id`/`buyer_character_id` via `REFERENCES`. Dois índices (`idx_house_sales_house`, `idx_house_sales_status`) para as duas consultas reais (anúncios de uma Casa, lista de anúncios ativos). Nenhum comentário SQL usa backtick — bug de 3 Sprints anteriores evitado deliberadamente desta vez.

## 5. Serviços

`createSale(sellerCharacterId, houseId, askingPrice)` — rejeita Casa inexistente, quem não é o proprietário atual, preço ≤ 0, ou anúncio ativo duplicado. `cancelSale(sellerCharacterId, saleId)` — rejeita anúncio inexistente ou vendedor incorreto; libera a Casa para novo anúncio. `buyHouse(buyerCharacterId, saleId)` — dentro de um único `BEGIN`/COMMIT: debita o comprador (`debitCharacterResourceInTransaction`, rejeita com `debit-rejected` sem tocar em nada se Gold insuficiente), credita o vendedor, chama `transferOwnership(houseId, buyerCharacterId, { event: "sold", price })`, marca o anúncio `sold`. `listSales()`/`getSale()` — leitura pura, só `status = 'active'` em `listSales`.

## 6. Rotas

`POST /api/house/sell`, `POST /api/house/cancel`, `POST /api/house/buy` (autenticadas), `GET /api/house/sales`, `GET /api/house/sale/:id` (públicas). `realEstateRoutes` registrado antes de `housingRoutes` em `server.ts` — ver Seção 13 para o motivo.

## 7. Interface Mínima

`RealEstatePage.tsx`: lista de anúncios ativos (Casa/Preço/Reino/Proprietário), botão "Comprar" para todos, trocado por "Cancelar" quando o anúncio é do próprio jogador. Sem filtros, sem mapa, sem animação, sem paginação — exatamente como pedido. Anunciar acontece no detalhe da Casa (`HousingPage.tsx`), não aqui: um novo bloco "Vender esta Casa" (campo de preço + botão) aparece só quando `citizen.character_id === current_owner_character_id`.

## 8. Legado / Histórico (Fase 8)

`HouseHistoryEvent` ganhou um terceiro tipo de evento, `"sold"`, com `price` opcional — sem criar uma estrutura de histórico paralela. Verificado em teste e em Browser Validation: uma Casa carrega `built` → `sold` (com `from`/`to`/`price` corretos) na mesma lista `history`, nunca sobrescrita.

## 9. Testes

14 testes novos (`realEstate.service.test.ts`): `createSale` (Casa inexistente, não-proprietário, preço inválido, anúncio bem-sucedido, anúncio duplicado rejeitado), `cancelSale` (anúncio inexistente, vendedor incorreto, cancelamento libera novo anúncio), `buyHouse` (anúncio inexistente, comprar a própria Casa rejeitado, débito insuficiente sem alterar Casa/anúncio, compra completa — debita comprador/credita vendedor/transfere posse/marca vendido/acrescenta evento `sold`, comprar anúncio já vendido rejeitado), `listSales`/`getSale` (só anúncios ativos). Passaram 100% em todas as execuções. Suíte completa da API rodada 3 vezes: falhas confinadas à dívida SQLITE_BUSY já documentada, nunca em `realEstate.service.test.ts`/`housing.service.test.ts`. Shared e Web inalterados (nenhuma lógica de negócio em `RealEstatePage.tsx`, per D2/D5).

## 10. Typecheck / Build

Shared, API e Web: zero erros novos, mesma baseline de dívida pré-existente exata (`SQLiteCharacterRepository.test.ts`, `EventBus.test.ts`/`GameEngine.test.ts`, `SQLiteBossParticipationRepository.ts`/`SQLiteBossRepository.ts`). `npm run build:web` limpa.

## 11. Browser Validation

Fluxo completo com dois personagens reais (fixtures via QA seed, deletado ao final): **QA Vendedor** (500 Gold) fez login → Adventure (idle rodando) → Kingdoms → entrou em Reino Oficial → Housing → construiu "Casa QA Real Estate" → **anunciou por 200 Gold** ("Anunciada. Veja no Mercado Imobiliário."). Troquei de sessão para **QA Comprador** (1000 Gold) → Mercado Imobiliário mostrou o anúncio → **comprou** (listagem sumiu do mercado, sem erro). Voltei à sessão do vendedor → Housing mostrou "Casa QA Real Estate — Proprietário: QA Comprador" (posse transferida) → confirmado via API que `history` contém `built` (QA Vendedor) → `sold` (de QA Vendedor para QA Comprador, price: 200) → Gold do vendedor: 500 → 700 (creditado corretamente) → **Merchant** (venda real de item: +7 Gold), **Blacksmith** (melhoria real: −40 Gold, upgrade_level 0→1), **Salvage** (desmontagem real: +16 materials) todos funcionando sobre a mesma sessão → voltei para Adventure: idle nunca parou (avançou sozinho de Nível 4 para Nível 8, Gold 757→807 via loot automático, durante todo o teste do Mercado). Zero erros de console em todo o fluxo.

## 12. Compatibilidade

RC1/Economy/Merchant/Blacksmith/Salvage/Equipment Lock/Living Character/Living World/Backpack/City/Kingdom Domain/Citizen System/Citizen Progression/Housing — todos confirmados funcionando exatamente iguais via transações reais executadas na mesma sessão de validação.

## 13. Problemas Encontrados

**Colisão de rota corrigida antes de qualquer teste manual**: `GET /api/house/sales` e `GET /api/house/:id` (de Housing Phase I) têm o mesmo método e a mesma contagem de segmentos — o roteador (`matchRoute()`, primeiro-registro-vence) casaria `/api/house/sales` com a rota dinâmica `:id`, tratando `"sales"` como um id de Casa inexistente. Corrigido registrando `realEstateRoutes` antes de `housingRoutes` em `server.ts`, com comentário explicando o motivo. `GET /api/house/sale/:id` (3 segmentos) não tem esse conflito.

**Nenhum novo risco de autoridade introduzido**: diferente do gap já documentado em `PUT /api/house/:id/owner` (Housing Phase I) e `POST /api/citizen/rank` (Citizen Progression), as três rotas de escrita desta Sprint (`sell`/`cancel`/`buy`) todas verificam a identidade do chamador contra `seller_character_id`/proprietário atual antes de agir — não repetem aquele padrão de risco.

## 14. Próximos Passos (Kingdom Treasury Phase I)

Kingdom Treasury deve decidir: se o Reino recebe alguma fração da venda (imposto de transação, ainda fora de escopo por decisão explícita desta Sprint), como o Gold do Reino é acumulado e para que serve, e se `house_sales` precisa de um campo adicional para rastrear receita do Reino no futuro. `listSales()`/`getSale()` já estão prontos para alimentar qualquer relatório econômico sem reinventar a leitura.

---

*Referências: `docs/design/real-estate.md`, `docs/design/housing-phase1-implementation.md`, `docs/design/citizen-progression-implementation.md`, `docs/design/kingdom-domain-2.0.md`, `docs/design/new-roadmap.md`, `docs/game-design-bible/00-philosophy.md`, `docs/architecture/decisions.md` (D1/D2/D5/D7 respeitados, ADR-0001 reaplicado).*
