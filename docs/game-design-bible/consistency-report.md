# Game Design Bible — Relatório de auditoria de consistência

Auditoria da Bible completa (capítulos 1-14 + backlog de perguntas), feita
em 2026-07-01, logo após o fechamento dos blocos Nascimento, Participação e
Combate do capítulo 6. Não altera nenhuma decisão — só audita o que já
existe.

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
- **Bosses — blocos Nascimento, Participação e Combate:** internamente
  consistentes entre si (ex.: "dano coletivo" do Combate não contradiz o
  "dano como bônus" da Participação — a nota explícita no capítulo já
  resolve essa aparente tensão) e consistentes com a filosofia de economia
  já registrada (o cooldown do Nascimento cita explicitamente proteção de
  Economia/Marketplace, capítulos 10/11).

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
- **Boss conceder gold antes de uma decisão mais ampla sobre a migração de
  gold** (capítulo 6, bloco Recompensas) — seria o primeiro caso de gold
  saindo do caminho legado; decidir isso só no contexto de Boss, sem
  pensar na migração de gold como um todo, é candidato real a retrabalho
  quando gold for migrado de verdade.
- **Implementar a fórmula de dano de Boss com valores provisórios de
  Classe/Equipamento** antes de Classes e o stat de itens existirem de
  fato — quase certamente precisa ser refeita quando esses capítulos
  fecharem.
- **Escolher um modelo de escala (capítulo 6, bloco Escala) antes da
  Economia 1.0 fechar `DROP_CHANCE`/pesos** — os dois números interagem
  (recompensa por participação × escala de recompensa total); calibrar um
  sem o outro é otimizar pela metade.
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
  marcados com "ex.:" no próprio texto (3 horas de cooldown, 15 minutos de
  timeout de invocação, 10 minutos de duração) — são ilustrativos, não
  valores calibrados. Vale não tratá-los como decisão numérica final em
  nenhuma implementação futura.
- Todo o bloco Escala (capítulo 6) é explicitamente hipótese — nenhum
  modelo de escala foi escolhido, só mapeado.
- O comportamento do Hero Token (circular no Marketplace antes do resgate,
  ou não) — explicitamente marcado como decisão em aberto no capítulo 10.
- A filosofia "o mercado tem que estar fluindo" (capítulo 11) é uma aposta
  de design ainda não testada contra exploits reais — a própria Bible já
  registra a ressalva de que isso precisa ser validado pela frente de
  Exploits da Auditoria de Plataforma antes do Marketplace existir.
- Se Boss deveria ou não conceder Hero Token como recompensa — levantado
  como pergunta, não como hipótese de design testável ainda.
