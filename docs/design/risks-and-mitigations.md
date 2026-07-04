# Riscos e Mitigações (Partes 5 e 6)

Cada risco abaixo é um risco **real**, encontrado na documentação e nas
reviews já existentes — nenhum foi inventado especulativamente. Cada
mitigação é uma proposta de arquitetura/design, nunca uma implementação.

---

## 1. Jogador sem objetivo

**Onde já foi observado:** `world-design-review.md` confirma que não há
conteúdo repetível além da Fortaleza Sombria (nível 35+), e que as quatro
regiões iniciais (Bosque, Pântano, Colinas, Planície) "têm motivo fraco
de retorno" além de eventos aleatórios raros. `first-player-experience-review.md`
mediu Diversão 2/10 nas primeiras horas, antes das Sprints de UX
recentes.

**Mitigação proposta:**
- Nenhuma região deveria ser "terminada" — o objetivo de retorno vem de
  **Kingdom** (descobertas permanentes por canal, `exploration.md`) e de
  **Ranking**/**Estado do Reino**, não de conteúdo pessoal infinito.
- Antes de expandir o grafo de regiões (Expansion 1), fechar pelo menos
  um "Dungeon" real (início/fim definidos, cooldown de tentativa) — o
  próprio `world-design-review.md` já aponta isso como "a lacuna mais
  concreta encontrada": hoje só existem "áreas de mapa escondidas", nunca
  uma estrutura de Dungeon de verdade.
- Endgame de 300h+ não deveria depender só de subir de nível — Marketplace
  e Season 1 (Modificadores de Boss crescendo) dão objetivo horizontal,
  não vertical.

## 2. Power creep

**Onde já foi observado:** `boss-reward-balance-study.md` mediu que o
modelo de recompensa atual (100% presença) tem **zero incentivo real de
equipamento** — um personagem com 1250 de dano e um com 1 de dano
recebem exatamente a mesma recompensa se presentes o mesmo tempo. Ao
mesmo tempo, Boss Escala (Tiers 2+) nunca foi calibrada — só Tier 1
existe.

**Mitigação proposta:**
- Adotar o Modelo C (80% presença / 20% dano) já recomendado pelo
  próprio estudo de balanço — é o primeiro ponto em que gear passa a
  importar (91 vs. 53 XP, ~1.7x) sem esmagar o jogador novo (53 ainda é
  80% do valor de hoje). Isso é uma recomendação já existente sendo
  citada aqui, não uma nova.
- Cada Tier de Boss deve ter um teto de recompensa por participante,
  não uma escala ilimitada por poder — já é a decisão estrutural do
  modelo de tiers (Bible cap. 6), só falta calibrar Tiers 2+.
- Resistência (física/mágica) já é uma porcentagem, não um valor bruto
  (`canonical-formula.md`) — isso por si só desacelera power creep,
  porque mitigação nunca ultrapassa 100%, diferente de um "DEF" bruto que
  cresceria sem teto.

## 3. Economia infinita

**Onde já foi observado:** `docs/game-design-bible/10-economy.md`
confirma: **nenhum sink de Gold ou item existe hoje** — nada para gastar,
fundir ou destruir. `operations-panel.md` já registra que a métrica "Gold
destruído" é estruturalmente sempre zero até o primeiro sink nascer.

**Mitigação proposta:**
- Nenhum sink deveria ser adicionado isoladamente — a Bible já decidiu
  que Economia 1.0 precisa resolver RNG, `DROP_CHANCE`, pesos de
  raridade, Gold e sinks **juntos**, exatamente para não trocar um
  problema por outro (`consistency-report.md`).
- Craft (hoje só uma palavra repetida) é o candidato natural a primeiro
  sink de item — mas só depois de Economia 1.0 decidir os pesos de
  raridade reais, senão Craft consome itens cujo valor real ainda nem foi
  calibrado.
- Marketplace com taxa (fee) é um sink de Gold natural — já cogitado em
  Bible cap. 11 ("taxa de reino"), ainda não decidido.

## 4. Coleções sem valor

**Onde já foi observado:** Coleções não existe em nenhum documento de
design lido — é a única categoria do inventário de objetivos sem nenhum
rascunho prévio.

**Mitigação proposta:**
- Não desenhar Coleções antes de Marketplace ou Kingdom terem uma forma
  de dar valor de troca ou exibição social a ela — senão vira número
  decorativo sem propósito, o próprio risco que o nome já descreve.
- Se e quando desenhada, ancorar em algo que já existe (raridades de
  item, regiões visitadas, Bosses derrotados) em vez de criar uma nova
  categoria de "item colecionável" paralela ao sistema de itens.

## 5. Craft inútil

**Onde já foi observado:** Craft é mencionado 6+ vezes no World Design
("viés em material de craft") sem nenhuma receita, sistema ou sink
definido — `world-design-review.md` já registra isso como pendência para
Economia 1.0.

**Mitigação proposta:**
- Craft só deveria ser desenhado depois de Economia 1.0 decidir os
  pesos de raridade reais — desenhar receitas contra números que ainda
  vão mudar é o retrabalho que `consistency-report.md` já nomeia como
  risco de "decidir fora de ordem."
- Craft deveria consumir itens/materiais de baixo valor (drops comuns
  atuais, com o bug do RNG corrigido) para produzir algo de valor médio —
  nunca competir diretamente com loot raro de Boss/Marketplace, senão
  esvazia os dois sistemas ao mesmo tempo.

## 6. Marketplace obrigatório

**Onde já foi observado:** `boss-reward-balance-study.md` já identificou
uma tensão real: um modelo de recompensa que aumenta o valor do
Marketplace também incentiva jogadores fortes a **guardar** itens raros
em vez de negociá-los — o oposto da filosofia já registrada em Bible cap.
11 ("o mercado tem que estar fluindo").

**Mitigação proposta:**
- Marketplace deveria ser estritamente opcional para progressão pessoal
  — todo conteúdo do MVP/MVP+ (Boss, Exploração, Quests) precisa ser
  jogável com itens obtidos por drop/recompensa direta, nunca exigindo
  compra.
- O "vazamento de referral fake" já registrado como risco aberto (Bible
  cap. 10, Hero Token circulando antes de resgate) deveria ser resolvido
  antes de qualquer item de alto valor circular livremente — ligado
  diretamente ao front de Exploits do futuro Platform Audit (Bible cap.
  12).

## 7. Ranking tóxico

**Onde já foi observado:** Ranking hoje mostra posição, gap de XP para o
próximo colocado, e reserva espaço para título futuro
(`identity-progression-review.md`) — nenhum sinal de toxicidade
reportado ainda, mas a superfície de comparação direta entre jogadores já
existe e vai crescer com Classes/Marketplace.

**Mitigação proposta:**
- Preferir rankings por Kingdom/canal em vez de um único ranking global
  público — já é consistente com "Kingdom = instância por canal": cada
  Reino compete com sua própria história, não com todos os jogadores do
  mundo ao mesmo tempo.
- Título equipável (espaço já reservado na UI) deveria ser sempre
  cosmético, nunca comparativo de poder — reduz o incentivo de
  humilhação pública que rankings de poder puro costumam gerar.
- Evitar exibir publicamente "quem caiu de posição" — mostrar progresso
  absoluto (gap de XP) é mais saudável que destacar quedas.

## 8. Eventos repetitivos

**Onde já foi observado:** O próprio `random-events.md` já se
autodiagnostica: "a maioria dos eventos compartilha a mesma estrutura
mecânica subjacente (combate extra, loot extra, informação) — a sensação
de 'mundo vivo' depende mais de frequência/mistura do que da quantidade
bruta de eventos." 105 eventos locais estão listados, mas a maioria cai
em poucas categorias funcionais.

**Mitigação proposta:**
- Priorizar profundidade de mistura sobre quantidade — rotacionar um
  conjunto menor de eventos com boa variedade perceptível é melhor do
  que manter 105 eventos redundantes ativos ao mesmo tempo.
- Eventos de Season (Modificadores de Boss) já têm uma vantagem
  estrutural aqui: mudam a *regra* do encontro, não só a decoração —
  esse é o padrão a repetir em vez do padrão "combate extra" genérico.

---

## Riscos adicionais encontrados (não estavam na lista de exemplo, mas são reais)

### 9. Eventos Globais vs. Kingdoms Independentes (risco arquitetural)

**Onde já foi observado:** `world-events.md` e `world-design-review.md`
(achado 3.7) já identificam que eventos verdadeiramente Global-scope
(Estações, Lua Vermelha) exigiriam sincronizar estado entre milhares de
instâncias de Kingdom simultaneamente — em conflito direto com a premissa
"Kingdom = instância por canal, independente" que sustenta o resto do
World Design.

**Mitigação proposta:** reinterpretar "Global" como **"a mesma regra
aplicada de forma idêntica e independente a cada Kingdom"**, não como
"estado literalmente sincronizado entre instâncias." Uma Season, por
exemplo, pode ser um parâmetro de calendário (a mesma tabela de
Modificadores ativa para todo mundo ao mesmo tempo) lido
independentemente por cada Kingdom — sem exigir uma única instância
compartilhada nem comunicação entre canais. Isso resolve a tensão sem
exigir infraestrutura de sincronização cross-instância, mas precisa ser
uma decisão explícita do capítulo 8 (Kingdoms) antes de qualquer Season
prometer um evento "global" — não deveria ficar implícito como está hoje.

### 10. Identidade de Classe fraca (Druida/Xamã convergem)

**Onde já foi observado:** `gameplay-combat-final-review.md` encontrou
que, após a remoção de DEF, Druida e Xamã convergem quase completamente
em números — a única diferença real está no **comportamento** de SUS
(cura em grupo vs. cura só em si), não nos atributos.

**Mitigação proposta:** ao desenhar Classes de verdade (Bible cap. 4),
tratar "teste de esconder o nome" (se dois arquétipos são
indistinguíveis só pelos números, a identidade está fraca) como critério
de aceite formal — já é o método usado para descobrir esse problema,
vale promovê-lo a prática permanente para os 4 arquétipos e qualquer um
futuro.

### 11. Gold com duplo caminho nunca resolvido

**Onde já foi observado:** Gold continua no caminho legado
(`applyPing()`), fora do Engine/EventBus, por decisão deliberada mas
ainda não migrada — memória do projeto já trata isso como decisão
congelada (emissão vs. ledger/gasto).

**Mitigação proposta:** resolver a migração de Gold **antes** de
Marketplace precisar de transações multi-tabela reais (débito do
comprador, crédito do vendedor, transferência de item, log) —
`atomic-update-guideline.md` já avisa que o projeto não usa transações
multi-statement em lugar nenhum hoje, e Marketplace é o primeiro sistema
que vai precisar disso de verdade.

### 12. Superfície técnica que quebra sob escala (não é risco de design, mas afeta se o roadmap é sustentável)

**Onde já foi observado:** `integration-readiness-review.md` já lista:
`isChannelLive()` sem cache compartilhado (4 chamadas independentes,
maior risco de rate-limit da Twitch); `SessionManager` é singleton em
memória, single-process; `refreshChannelPositions()` reescreve a posição
de todos os personagens ranqueados a cada ping.

**Mitigação proposta:** nenhuma mudança de design aqui — é
explicitamente do escopo do futuro Platform Audit (Bible cap. 12, front
de Escalabilidade), que já está desenhado para revisitar exatamente isso
quando a base de jogadores justificar. Citado aqui só para registrar que
nenhum risco de progressão de 500h deveria ser resolvido *escondendo*
esse debt técnico — ele precisa ser resolvido antes de Kingdoms permitir
múltiplas réplicas do servidor.
