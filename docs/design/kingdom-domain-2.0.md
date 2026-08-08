# Kingdom Domain 2.0

**Status:** 🚧 Preparação — conceitual, nenhuma implementação. Parte da Sprint "Foundation Refactor", formalizando a revisão "Kingdom como Domínio Permanente" conduzida nesta mesma sessão de projeto.

## 1. O que é um Reino agora

Um Reino não pertence a ninguém — é ocupado por alguém. Dois conceitos que hoje estão fundidos em `streamer_channels.owner_profile_id` precisam se separar:

- **Fundação** (quem/o que trouxe este Reino à existência) — permanente, nunca muda, é história.
- **Liderança atual** (quem governa agora) — transitória, pode trocar, pode ficar vaga, pode até não ter dono nenhum sem o Reino deixar de existir.

O Reino existe independentemente de streamer, de live, de qualquer jogador estar online. Ele existe porque foi fundado, ponto final — a mesma garantia de permanência que uma Casa (`housing-phase1.md`) ou uma Propriedade (`real-estate.md`) tem, um nível acima.

## 2. Liderança como conceito plugável

A peça central deste redesenho: liderança é uma interface, não um campo fixo. Um Reino tem um **tipo de liderança** e a identidade de quem lidera é resolvida de forma diferente conforme o tipo — mas todo Reino, não importa o tipo, responde às mesmas três perguntas: *quem lidera agora? desde quando? como essa liderança pode mudar de mãos?*

### 2.1 Os modelos, vantagens e riscos

| Modelo | Como resolve "quem lidera" | Vantagem | Risco |
|---|---|---|---|
| **Coroa** | O próprio mundo/jogo — sem jogador por trás | Nunca falha, nunca fica vago; default seguro para Reinos novos/pequenos e para o Reino Oficial | Pode parecer "sem vida" sem geração de conteúdo/eventos própria (ver `world-events.md`) |
| **Streamer** | Quem fundou via identidade de streamer conectada | Traz comunidade pronta, liderança carismática desde o dia 1 | Frágil no longo prazo — depende de uma pessoa continuar ativa por anos |
| **Eleito** | Voto periódico entre cidadãos ativos | Sensação genuína de autogoverno | Apatia de eleitor é a falha clássica de qualquer sistema eleitoral em jogo |
| **Guilda** | A liderança da Guilda dominante no Reino | Liderança já organizada, incentivo natural para guildas competirem por Reinos | Pode virar oligarquia sem mecanismo de desafio periódico |
| **Conquistado** | Resultado de um evento de guerra/PvP | Dá propósito real para guerra, narrativa dramática | Conquista permanente demais frustra o lado perdedor — precisa de "direito de reconquista" |
| **Mérito Automático** | O cidadão de maior prestígio real (mesma métrica que já alimenta "Herói do Reino") assume interinamente, sem eleição | Preenche o vazio entre Coroa fria e eleição sem candidatos; reconhece dedicação de jogo pura | Pode se sobrepor mal a Eleito/Guilda se não houver prioridade clara entre modelos concorrentes num mesmo Reino |

O ponto arquitetural, não de game design: **nada fora do domínio Kingdom precisa saber qual tipo de liderança está ativo.** Hall da Fama, Tesouro, Propriedades — tudo consulta "quem lidera este Reino" através de uma única pergunta genérica, e recebe uma resposta, seja ela a Coroa, um streamer ou o resultado de uma eleição.

## 3. Ciclo de vida completo de um Reino

**Como nascem.** Um Reino nasce por fundação deliberada — nunca como efeito colateral de login (ao contrário de hoje, onde `connectStreamerChannel()` cria um canal em todo login). Quem pode fundar (qualquer jogador com prestígio mínimo? só quem conectar Twitch? um número curado pela produção?) é decisão de game design a resolver antes da implementação de `kingdom-domain-2.0` — o modelo aqui suporta qualquer resposta sem mudar de forma. O Reino Oficial (Coroa) existe desde a gênese do mundo, sem fundação por jogador.

**Como crescem.** Cidadania se acumula (`citizen-system.md`), bairros se expandem conforme demanda real (`housing-phase1.md`), vocação econômica emerge do que os cidadãos mais praticam ali (`trade-routes.md`), a Crônica do Reino acumula marcos.

**Como ficam ricos.** Tesouro cresce por impostos/manutenção de propriedades (`kingdom-treasury.md`) e por comércio favorável via vocação (`trade-routes.md`). Um Reino rico deveria parecer diferente visualmente (mesma lógica de Building Progression já usada nos prédios da Cidade), não só numericamente.

**Como empobrecem.** Propriedades abandonadas reduzem receita de manutenção; cidadãos migram para Reinos mais atrativos; liderança fraca ou vaga por muito tempo reduz eventos/investimento (Coroa sem geração de conteúdo, streamer inativo, eleição sem candidato).

**Como envelhecem.** Um Reino velho acumula Crônica extensa (marcos de primeira-vez, guerras, trocas de liderança, propriedades com múltiplos donos ao longo dos anos) — a idade de um Reino é medida em história acumulada, não em um contador de dias.

**Como nunca morrem.** Mesmo no pior declínio — sem líder, tesouro baixo, poucos cidadãos — o Reino nunca é deletado. No mínimo, vira um Reino pequeno e silencioso, administrado pela Coroa por padrão, com sua Crônica intacta, sempre disponível para um novo ciclo de crescimento.

## 4. Vacância e sucessão

Um Reino pode ficar temporariamente sem liderança ativa (streamer sumiu, eleição não ocorreu ainda) sem deixar de existir, sem deixar de ter cidadãos, sem deixar de ter tesouro. A Coroa preenche esse vazio administrativamente. Cada tipo de liderança define sua própria regra de troca — streamer inativo N dias aciona sucessão (para Mérito Automático, por padrão); eleição vence no prazo; conquista resolve na guerra. O mesmo princípio das Propriedades ("o Reino recupera, fica disponível, o construtor original permanece registrado") se aplica, um nível acima, à própria liderança do Reino.

## 5. Território — decisão explicitamente em aberto

Reino não reivindica regiões do mundo explorável (`packages/shared/src/regions.ts`) como território exclusivo — pelo menos não nesta fase. Regiões continuam sendo mundo compartilhado, explorável por qualquer cidadão de qualquer Reino. O que cada Reino tem de seu é sua Capital (cidade-sede com seus próprios prédios) e seu tesouro/economia. Território exclusivo (guerra por terreno, zonas contestadas) fica deliberadamente fora de escopo desta fase — não fechado para sempre, só não resolvido agora.

## 6. O que sobrevive do que já existe

`kingdom-prestige.service.ts` (Hall da Fama, os 6 cargos), `GuildBuilding.tsx`, `bosses`/`boss_participation`/`boss_rewards`, `streamer_channels` como tabela física — todos sobrevivem como conceito e UI. O que muda é exclusivamente a fonte de dado de "quem pertence" e "quem lidera" (ver `world-foundation-4.0.md` Seção 2 para o detalhe por módulo).

---

*Referências: `world-foundation-4.0.md`; `citizen-system.md` (a definição de pertencimento que este documento pressupõe); `kingdom-treasury.md`; `docs/design/gold-architecture-phase1.md` (precedente de decisão econômica congelada antes do domínio grande depender dela).*
