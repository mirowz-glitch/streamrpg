# Roadmap Oficial — StreamRPG

**Status:** 🟢 Canônico. Sequência de sistemas de jogo entre o RC1 e Early Access. Este documento responde "em que ORDEM os sistemas nascem, e por quê" — não confundir com `commercial/roadmap/project-valuation-roadmap.md`, que responde "em que ordem o trabalho aumenta valor de mercado" (intercalando itens comerciais — trailer, Steam page, identidade visual — que não são sistemas de jogo). Os dois roadmaps são complementares: este é o eixo de dependência técnica/de sistema; aquele é o eixo de prioridade comercial. Nenhum item aqui contradiz o outro documento — ver Seção 8 daquele roadmap para como Economia se encaixa na sequência comercial mais ampla.

## A Sequência

```
RC1 (Vertical Slice)
     ↓
Economy Core
     ↓
Merchant
     ↓
Blacksmith
     ↓
Salvage
     ↓
Crafting
     ↓
World Map
     ↓
Endgame
     ↓
Early Access
```

---

## RC1 — Vertical Slice

**Objetivo**: provar que existe um ciclo completo de exploração — Engine calibrada, Estado Global compartilhado, Aventura idle, Personagem/Mochila/Cidade narrativos, tudo persistente entre sessões.

**Dependências**: nenhuma — é o ponto de partida.

**Critérios de conclusão**: ✅ atendidos nesta Sprint de congelamento — ver `docs/releases/rc1.md` para escopo e métricas completas.

---

## Economy Core

**Objetivo**: infraestrutura genérica de recursos e transações (`ResourceId`, Resource Ledger, Transaction Layer, eventos econômicos) reutilizável por Ouro, Materiais, Reputação, Essências e futuras moedas — sem implementar nenhuma economia real ainda.

**Dependências**: decisão de arquitetura de Ouro já congelada (`docs/design/gold-architecture-phase1.md`, 2026-07-02) — Economy Core é a implementação dessa decisão em forma de arquitetura genérica, não uma reabertura dela.

**Critérios de conclusão**: existe um Ledger testável e independente de interface; existe uma camada de transações com origem/destino/tipo/recurso/quantidade/timestamp/resultado; nenhum componente React executa lógica de transação; compatibilidade total com Engine/AdventureSession/Estado Global confirmada; `docs/design/merchant-phase1.md` (ou equivalente) preparado para a próxima Sprint.

---

## Merchant

**Objetivo**: primeira transação econômica real do jogo — vender itens da Mochila por Ouro, usando o Ledger do Economy Core.

**Dependências**: Economy Core concluído (Ledger + Transaction Layer + eventos já existem); Backpack Experience já sinaliza "sucata"/itens candidatos a venda (`buildRecentFinds`, `deriveBackpackSignals`).

**Critérios de conclusão**: fluxo de venda de item valida saldo/estoque via Ledger, emite evento econômico (`GoldGranted` ou equivalente), atualiza a Mochila, e a Cidade reflete a transação em sua mensagem contextual — sem nenhuma regra de venda vivendo em `apps/web`.

---

## Blacksmith

**Objetivo**: dar função real ao Ferreiro — resolver o excedente de equipamento que a Mochila acumula (upgrade, fusão, ou mecânica equivalente a definir nessa Sprint).

**Dependências**: Merchant concluído (o Ledger já provou funcionar com uma transação real); decisão de design sobre a forma exata da mecânica (upgrade vs. fusão) ainda em aberto — não é uma decisão de arquitetura, é uma decisão de gameplay a ser tomada quando esta Sprint começar.

**Critérios de conclusão**: transação de Ferreiro usa o mesmo Ledger/Transaction Layer do Merchant (nenhuma lógica de transação duplicada); resultado da transação é visível no equipamento do personagem via os mesmos caminhos já existentes (AutoEquip, Power Score).

---

## Salvage

**Objetivo**: converter itens não-equipáveis/sucata em um recurso de transformação (materiais), fechando o ciclo "mochila cheia → sucata → recurso útil" que `idle-experience-redesign.md` Seção 7 já nomeou como papel do Mercador/Ferreiro.

**Dependências**: Merchant e Blacksmith concluídos (o recurso "materiais" só faz sentido depois que existe algo real para gastá-lo — Blacksmith); `ResourceId.materials` já existe desde o Economy Core, sem precisar de trabalho de arquitetura novo.

**Critérios de conclusão**: taxa de conversão item→material é uma regra de dados (Engine ou tabela), nunca hardcoded em componente; nenhuma duplicação da lógica de venda do Merchant.

---

## Crafting

**Objetivo**: permitir ao jogador transformar materiais em equipamento/consumível, dando agência real sobre progressão além de "achar loot".

**Dependências**: Salvage concluído (fonte de materiais); confirmação por playtest de que "achar loot" sozinho não é suficiente (já nomeado como pré-requisito em `commercial/roadmap/project-valuation-roadmap.md` Seção 8, item 6) — risco real de fragmentar o sistema de progressão que o Continuous Affix Scaling acabou de unificar, se implementado sem essa confirmação.

**Critérios de conclusão**: receitas de craft são dados (não lógica hardcoded); resultado usa o mesmo pipeline de geração de item já existente (`itemgen/`), não um pipeline paralelo.

---

## World Map

**Objetivo**: uma representação navegável do Reino além da lista linear de regiões atual — ainda sem especificação de arquitetura própria.

**Dependências**: Crafting concluído (nenhuma dependência técnica direta, mas mantido nesta posição porque conteúdo novo de região — item 3 da Seção 8 de `project-valuation-roadmap.md` — já deveria ter herdado a calibração de Global Gameplay Rebalance antes de ganhar uma camada de navegação nova sobre ele).

**Critérios de conclusão**: a definir quando esta Sprint nascer — nenhuma decisão de arquitetura foi tomada ainda.

---

## Endgame

**Objetivo**: aprofundar o conteúdo pós-Dungeon (já parcialmente coberto por Global Gameplay Rebalance Phase I, que corrigiu 2 Dungeons com 0% de conclusão) — não um sistema novo, uma extensão do que já existe.

**Dependências**: World Map (para que "conteúdo de fim de jogo" tenha um lugar coerente de existir no mapa) e Endgame Funnel Fix (item já nomeado em `project-valuation-roadmap.md` Seção 1, item 2 — mortalidade de Picos Congelados já caiu de ~82% para ~21% como efeito colateral do Item Generator, mas a decisão de investir uma Sprint dedicada ainda depende de nova medição).

**Critérios de conclusão**: a definir — depende da medição pendente citada acima.

---

## Early Access

**Objetivo**: o jogo está pronto para ser jogado por um público externo amplo, não só um ciclo de playtest controlado.

**Dependências**: todos os itens acima, mais os itens comerciais paralelos já sequenciados em `commercial/roadmap/project-valuation-roadmap.md` (Visual Polish, Identity, Steam Vertical Slice, Trailer, Steam Page) — Early Access não é só "os sistemas de jogo existem", é a confluência dos dois roadmaps.

**Critérios de conclusão**: a definir — este documento será atualizado quando a proximidade real dessa etapa justificar critérios concretos, em vez de aspiracionais.

---

*Este roadmap é uma sequência de DEPENDÊNCIA, não uma previsão de tempo. Itens sem dependência técnica direta entre si (ex.: playtest externo, Visual Polish) podem e devem rodar em paralelo — ver `commercial/roadmap/project-valuation-roadmap.md` Seção 8 para a orquestração completa entre os dois eixos.*
