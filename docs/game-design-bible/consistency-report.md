# Game Design Bible — Relatório de auditoria de consistência

Auditoria da Bible completa (capítulos 1-14 + backlog de perguntas), feita
em 2026-07-01. Não altera nenhuma decisão — só audita o que já existe.
Atualizado no mesmo dia após o fechamento dos 3 blocos restantes do
capítulo 6 (Recompensas, Escala, Ranking/MVP) — capítulo 6 inteiro está
decidido agora.

## Inconsistências encontradas e corrigidas nesta auditoria

- **Capítulo 13 (Eventos):** a seção de Escopos afirmava que "nenhum evento
  usa o escopo Global ainda", mas a tabela de referência do mesmo capítulo
  já listava `world.tick` com escopo Global — contradição direta entre
  prosa e tabela no mesmo capítulo. Corrigido: a prosa agora reconhece
  `world.tick` como o exemplo atual de escopo Global.
- **Capítulos 8 (Kingdoms) e 11 (Marketplace):** referenciavam "Auditoria de
  Escalabilidade" e "Auditoria de Exploits" como se fossem seções próprias
  do capítulo 12 — na prática, o capítulo 12 só lista essas 5 frentes
  dentro de uma única seção ("Auditoria de Plataforma"), sem subtítulo
  individual por frente. Corrigido para refletir a estrutura real do
  capítulo 12.

Nenhuma outra contradição, referência numérica quebrada ou repetição
indevida foi encontrada — os números de capítulo (`ver capítulo N`) em
todos os arquivos foram conferidos manualmente contra o índice atual do
README e batem.

## O que está sólido

- **Princípios permanentes (capítulo 2):** aplicados de forma consistente
  em todos os outros capítulos, sem exceção não-documentada. As duas
  exceções que existem (Welcome Reward modificando Character a partir de
  evento de Platform; `XPSystemV2` chamando `isChannelLive()` diretamente)
  estão ambas documentadas explicitamente como exceções, não como
  contradições silenciosas.
- **Eventos (capítulo 13) e Arquitetura (capítulo 14):** descrevem o
  sistema real, já implementado e validado (Sprints D3-E4) — não são
  aspiração, são o estado atual verificado em código.
- **Progressão (capítulo 5):** reflete o Marco 1.0 real, testado
  ponta a ponta (harnesses de E2/E3/E4), não uma intenção futura.
- **Bosses (capítulo 6) — design fechado, todos os 6 blocos decididos.**
  Internamente consistente (ex.: "dano coletivo" do Combate não contradiz o
  "dano como bônus" da Participação; a Escala em tiers não contradiz a
  recompensa também em tiers, ambas justificadas pela mesma lógica de
  proteção de economia do Cooldown) e consistente com a filosofia de
  economia já registrada. Escopo do MVP deliberadamente contido (XP+Itens
  só, sem Gold/Hero Token/coletiva/ranking) — mesma disciplina aplicada em
  todos os 6 blocos, não só nos 3 primeiros.

## O que depende de outro capítulo (não pode ser fechado isoladamente)

- **Classes (capítulo 4)** não pode ser fechado sem olhar para Economia
  (Hero Token como via de obtenção) — e Bosses (capítulo 6) já pressupõe um
  valor numérico de Classe na fórmula de dano, então fechar Classes tarde
  demais bloqueia a implementação real do BossSystem, não só o design.
- **A fórmula de dano de Bosses** depende de Classes e de um stat de poder
  em Equipamentos que não existe hoje em `items` — já documentado no
  próprio capítulo 6 como "dependência ainda não modelada".
- **Marketplace (capítulo 11)** depende inteiramente de Economia (capítulo
  10) estar fechada antes — por desenho, não por acidente (ver ordem de
  construção, capítulo 12).
- **Kingdoms (capítulo 8)** depende de uma decisão de infraestrutura
  (sharding), não só de design de jogo — está fora do controle só da Game
  Design Bible, precisa da Auditoria de Plataforma (capítulo 12).

## O que pode gerar retrabalho se decidido fora de ordem

- **Corrigir o bug de RNG isoladamente** (capítulo 10) — o próprio capítulo
  já registra esse risco explicitamente: corrigir sem revisar
  `DROP_CHANCE`/pesos junto arrisca trocar um problema por outro.
- **Implementar a fórmula de dano de Boss com valores provisórios de
  Classe/Equipamento** antes de Classes e o stat de itens existirem de
  fato — quase certamente precisa ser refeita quando esses capítulos
  fecharem. Ainda um risco real (não mitigado pelas decisões do bloco
  Recompensas/Escala).
- **Calibrar os valores numéricos dos tiers de Escala** (vida/recompensa
  por faixa) sem dados reais de playtest — risco baixo, não médio: o
  próprio modelo foi escolhido (tiers em vez de fórmula contínua)
  exatamente para que recalibrar uma faixa não exija reescrever o
  `BossSystem` nem as outras faixas. O risco de retrabalho está isolado
  aos números, não à arquitetura.
- **Construir Marketplace antes de Economia 1.0** — já é a razão
  documentada para a ordem de construção inteira (capítulo 11/12); listada
  aqui só para reforçar que é o exemplo mais claro desse risco no projeto.

## O que já pode ser considerado regra permanente

- Os 7 Princípios permanentes (capítulo 2).
- A taxonomia de eventos — categorias (Engine/Platform/Gameplay/World) e
  escopos (Global/World/Character/Session) (capítulo 13).
- O fluxo de arquitetura Twitch → Presence → SessionManager → WorldTick →
  EventBus → Systems → Repositories → SQLite (capítulo 14).
- A regra de que cooldown de Boss nunca pode ser removido por completo,
  só reduzido dentro de um piso — mesmo que o valor exato do cooldown
  mude, essa restrição é uma decisão de proteção de economia, não um
  número de balanceamento.
- A regra de que Marketplace só é construído depois de Economia 1.0.

## O que ainda é hipótese

- Praticamente todos os números concretos do capítulo 6 (Bosses) estão
  marcados com "ex.:" ou "ilustrativo" no próprio texto (3 horas de
  cooldown, 15 minutos de timeout de invocação, 10 minutos de duração, os
  limites de cada tier de Escala) — são exemplos, não valores calibrados.
  A *estrutura* das decisões (modelo por tiers, dano fixo, cooldown nunca
  removível) é estável; os *números* dentro dessa estrutura são hipótese
  até haver dados de playtest.
- O comportamento do Hero Token (circular no Marketplace antes do resgate,
  ou não) — explicitamente marcado como decisão em aberto no capítulo 10.
- A filosofia "o mercado tem que estar fluindo" (capítulo 11) é uma aposta
  de design ainda não testada contra exploits reais — a própria Bible já
  registra a ressalva de que isso precisa ser validado pela frente de
  Exploits da Auditoria de Plataforma antes do Marketplace existir.
