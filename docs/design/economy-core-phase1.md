# Economy Core — Especificação Inicial (Fase 1)

**Status:** 🚧 Preparação — nenhuma funcionalidade econômica foi implementada a partir deste documento. Escrito ao final da Sprint "RC1 Retrospective & Architecture Freeze", assumindo que toda a arquitetura do RC1 (`docs/architecture/overview.md`, `decisions.md`, `architecture-freeze-rc1.md`) já está congelada e serve de base. Este documento reconcilia e formaliza, em forma de especificação, o que `docs/design/gold-architecture-phase1.md` já havia preparado — não o substitui, o implementa em nível de arquitetura genérica.

## 0. Reconciliação necessária com `gold-architecture-phase1.md`

`gold-architecture-phase1.md` Seção 7 afirma: "o lado de GASTO vive inteiramente em `apps/api`... nunca em `packages/shared`". Isso permanece verdadeiro e não é contradito aqui — mas precisa de uma distinção explícita que aquele documento não precisava fazer ainda:

- **A REGRA de como um Ledger genérico credita/debita/valida saldo** (independente de SQL, independente de HTTP) é lógica determinística, testável, sem I/O — segundo `docs/architecture/decisions.md` D1/D3, isso pertence à Engine (`packages/shared`), no mesmo molde de `idle/`, `presentation/`, `hud/`.
- **A PERSISTÊNCIA transacional/atômica desse saldo em SQLite** (o `BEGIN`/`COMMIT`/`ROLLBACK` que `gold-architecture-phase1.md` Seção 4 já identificou como a única peça genuinamente nova) continua vivendo inteiramente em `apps/api` — a Engine nunca importa `node:sqlite`, nunca sabe que uma tabela existe.

Não há contradição: o Ledger como CONJUNTO DE REGRAS é Engine; o Ledger como REGISTRO PERSISTIDO é `apps/api`. A mesma separação que já existe hoje entre "a Engine concede XP" e "a API grava XP no banco" — aplicada a recursos em geral, não só a Ouro.

## 1. Objetivos da Arquitetura Econômica

- Um modelo de `ResourceId` genérico (`gold | materials | reputation | essence | token`, extensível) — nenhuma lógica de negócio especial-casada por recurso.
- Um Resource Ledger capaz de creditar, debitar, validar saldo, impedir saldo negativo, e registrar toda transação — testável isoladamente, sem interface, sem banco.
- Uma Transaction Layer que formaliza cada operação (origem, destino, tipo, recurso, quantidade, timestamp, resultado) como o único caminho permitido para mexer em saldo — nenhum componente React ou rota de API pode mutar saldo por fora dela.
- Um conjunto de eventos econômicos (`GoldGranted`, `GoldSpent`, `MaterialGranted`, etc.) seguindo o mesmo padrão de `PresentationEvent` já usado pelo resto da Engine — preparados para emissão, sem integração com Living World ainda.
- Uma estratégia de persistência explícita (onde/quando gravar e carregar) sem criar nenhuma migração de Ouro real nesta fase.

## 2. Integração com o Estado Global

O Economy Core **não estende** `hudState` nesta fase — nenhuma tela lê saldo de recurso através de `useAdventureSession()` ainda, porque não existe nenhuma interface econômica no escopo desta preparação. Quando uma Sprint futura (Merchant) precisar exibir saldo, o padrão correto é o mesmo já estabelecido: uma leitura pontual (análoga a como `hudState.region`/`hudState.expedition` já expõem estado read-only), nunca uma segunda fonte de verdade paralela ao Ledger.

## 3. Integração com a Cidade

A Cidade (`CityPage`, `cityWelcome.ts`, `citySuggestions.ts`) permanece **apenas leitora** em relação à Economia nesta fase e na fase seguinte de Merchant inicial — ela pode, no futuro, refletir saldo/transações recentes na mensagem contextual (o mesmo padrão já usado para refletir achados recentes da Mochila), mas nunca decide ou executa uma transação. A decisão de negócio sempre vem do Ledger/Transaction Layer; a Cidade só narra o resultado.

## 4. Integração com o Sistema de Eventos

Os eventos econômicos seguem exatamente o padrão de `PresentationEventBase { tickIndex; timestamp }` mais campos específicos por `kind`, como qualquer outro evento da Presentation Layer (`LootDropped`, `LevelUp`, etc.). A diferença: eventos econômicos nascem de uma TRANSAÇÃO (Ledger), não de um TICK de exploração — o campo `tickIndex` não se aplica da mesma forma; a integração exata (like um `tickIndex` sintético, ou um union type paralelo) é uma decisão de implementação da própria Sprint Economy Core, não desta preparação. O que já está decidido: o formato do evento é gerado a partir do resultado de uma transação (`ResourceId` + tipo + quantidade + origem/destino + timestamp), nunca inventado separadamente por quem chama o Ledger.

## 5. Estratégia de Persistência

- **O que persiste**: o saldo atual por `ResourceId` e por personagem (uma extensão natural de `characters.gold`, generalizada para múltiplos recursos) — mais, opcionalmente, um histórico de transações para auditoria (nunca para reconstruir o saldo a partir dele, ver `gold-architecture-phase1.md` Seção 3).
- **Quando é gravado**: toda transação bem-sucedida grava imediatamente e atomicamente (mesma exigência já registrada para Ouro — `BEGIN`/`COMMIT`/`ROLLBACK` via `node:sqlite`). Créditos sem contenção real (emissão, ex.: loot de Ouro) podem continuar como escrita simples, como já é hoje.
- **Quando é carregado**: no momento de montar a sessão do personagem, análogo a como `gold`/`items` já são carregados hoje — nenhuma mudança no ciclo de vida de carregamento existente.
- **Como evitar inconsistências**: um único ponto de escrita por operação de débito (nunca SQL solto espalhado por rotas diferentes — o mesmo problema já identificado em `applyPing()` antes da decisão de Gold ser congelada); nunca ler-modificar-escrever em passos separados fora da transação atômica.

## 6. Responsabilidades do Resource Ledger

- Adicionar recursos (crédito) e validar que a quantidade é positiva.
- Remover recursos (débito) e validar que o saldo é suficiente ANTES de mutar qualquer estado — rejeitar (não lançar exceção destrutiva) uma transação com saldo insuficiente, registrando o resultado como rejeitado, nunca deixando o saldo ficar negativo.
- Registrar toda transação (aceita ou rejeitada) para auditoria futura.
- Nunca conhecer a interface — o Ledger não sabe que existe um Mercador, um botão "Comprar", ou uma tela de Cidade. Ele só conhece `ResourceId`, quantidade, origem, destino.
- Ser genuinamente reutilizável por qualquer `ResourceId` — nenhuma ramificação de código exclusiva para Ouro dentro do Ledger em si (diferenças de comportamento por recurso, se existirem, são dados/configuração, não `if (resourceId === "gold")`).

## 7. Riscos Conhecidos

- **Concorrência real só existe no lado de gasto** (duas "compras" simultâneas disputando o mesmo saldo) — emissão nunca teve esse risco (mesma conclusão já registrada na decisão congelada de Gold, 2026-07-02). A Sprint Economy Core precisa decidir explicitamente o mecanismo de atomicidade antes de expor qualquer rota de débito.
- **Tentação de acoplar o Ledger a Ouro especificamente** — o maior risco de design desta Sprint é escrever o Ledger "pensando só em Ouro" e descobrir depois que Materiais/Reputação não se encaixam sem refatoração. Mitigação: qualquer teste do Ledger deve cobrir pelo menos dois `ResourceId` diferentes desde o primeiro commit, nunca só `gold`.
- **Persistência de histórico crescendo sem limite** — um log de transações por personagem, se implementado sem retenção/paginação, pode crescer indefinidamente; não é um risco urgente (auditoria é um "nice to have" desta fase, não um requisito), mas vale registrar antes de a tabela existir.

## 8. Critérios de Sucesso

- `ResourceId` cobre pelo menos `gold`, `materials`, `reputation`, `essence`, `token`, sem necessidade de alterar a lógica do Ledger para adicionar um sexto valor.
- O Resource Ledger credita, debita, valida saldo e nunca permite saldo negativo — comprovado por teste automatizado, não só por inspeção.
- A Transaction Layer é o único caminho de mutação de saldo — nenhuma prova de regressão nesta Sprint deveria encontrar uma segunda via de escrita.
- Eventos econômicos são emitidos no mesmo padrão da Presentation Layer, prontos para consumo futuro (mesmo sem nenhum consumidor ainda).
- Zero regressão em Engine/AdventureSession/Estado Global/Living World/Backpack/City Foundation — confirmado por Browser Validation completa (mesmo sem nenhuma interface econômica nova).
- `docs/design/merchant-phase1.md` (ou nome equivalente) preparado ao final, assumindo que o Economy Core já existe.

---

## 9. Processo — ADRs exigidos antes da implementação

Adicionado na Sprint "Engineering Standards & RFC Process", que criou o processo formal de RFC/ADR (`docs/architecture/rfc-process.md`, `docs/architecture/adr-template.md`) depois deste documento já existir. Esta seção não altera nenhum objetivo/fase/critério acima — só identifica, à luz do novo processo, quais decisões já descritas neste documento precisam virar um ADR formal (`docs/architecture/adr/0001-...`, `0002-...`, numeração sequencial a partir daqui, já que nenhum ADR formal existe ainda) **antes** de a Sprint Economy Core escrever a primeira linha de código — não porque cada uma delas viole uma regra congelada, mas porque Economy Core é o primeiro sistema a tocar "praticamente todas as camadas do projeto" (conforme o próprio brief da Sprint de processo nomeou), tornando essas decisões caras de reverter se tomadas sem registro.

| Decisão deste documento | Por que precisa de ADR | Gatilho de RFC (se houver) |
| --- | --- | --- |
| Split Regra (Ledger em `packages/shared/src/economy/`) vs. Persistência atômica (`apps/api`) — Seção 0 | Estabelece a fronteira entre Engine e API para um domínio inteiro novo; toda Sprint futura de Merchant/Blacksmith/Salvage/Crafting herda essa fronteira sem questionar | Nenhum — não viola D1/D8, só os aplica a um domínio novo; ADR documenta a aplicação, não pede RFC |
| Modelo genérico de `ResourceId` (extensível, sem caso especial) — Seção 1/6 | É um contrato que todo sistema econômico futuro (Merchant, Blacksmith, Salvage) depende de nunca precisar quebrar; mudar a forma desse contrato depois de Merchant existir seria caro | Nenhum, se aceito como está aqui — mas se a Sprint Economy Core decidir DESVIAR deste modelo (ex.: introduzir caso especial por recurso), isso reabre a decisão e exige RFC |
| Mecanismo de atomicidade do débito (transação SQL `BEGIN`/`COMMIT`/`ROLLBACK`) — Seção 5 | Primeira vez que o projeto precisa de garantia transacional real (nenhum sistema anterior teve contenção de escrita); a escolha de mecanismo aqui vira precedente para qualquer transação futura | Nenhum — é uma decisão nova, não uma alteração de regra existente; ADR documenta a escolha para reuso futuro |
| Formato dos eventos econômicos dentro (ou paralelo a) `PresentationEvent` — Seção 4 | Decide se o domínio econômico estende a união discriminada existente ou cria uma união paralela — afeta diretamente o padrão já estabelecido pela Presentation Layer | **Sim, potencialmente** — se a decisão for estender `PresentationEvent` de um jeito que quebre a suposição de `tickIndex` sempre vir de um tick de exploração, isso se aproxima do gatilho 1 (mover/alterar padrão de um sistema já congelado) e merece avaliação explícita via RFC antes do ADR |
| Transaction Layer como único caminho de mutação de saldo — Seção 6 | Introduz um invariante novo em nível de projeto (nenhum componente/rota pode mutar saldo fora dela) — precisa estar registrado para o Code Review Checklist (`docs/process/code-review-checklist.md`) poder ser aplicado com autoridade contra ele | Nenhum — é a aplicação de D2/D5 a um domínio novo, não uma exceção a eles |

**Como isso muda o início da Sprint Economy Core**: antes da Fase 2 (Modelo de Recursos) daquela Sprint escrever qualquer tipo, os ADRs correspondentes às 5 linhas acima devem existir (mesmo que curtos) — não é burocracia nova, é o mesmo raciocínio que já era feito informalmente nesta preparação, agora com um número e um arquivo permanente em vez de ficar só neste documento de design.

---

*Referências: `docs/design/gold-architecture-phase1.md` (decisão de origem, ainda válida), `docs/design/city-foundation-phase1.md` (papéis de prédio que o Economy Core vai eventualmente habilitar), `docs/architecture/decisions.md` D1/D3/D8 (por que o Ledger nasce em `packages/shared` e a persistência em `apps/api`), `docs/architecture/rfc-process.md` e `docs/architecture/adr-template.md` (o processo aplicado na Seção 9 acima), memória "Gold ownership decision" (2026-07-02, congelada).*
