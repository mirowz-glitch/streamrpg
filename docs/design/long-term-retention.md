# Long-Term Retention

**Status:** 🚧 Preparação — conceitual, nenhuma implementação. Parte da Sprint "Foundation Refactor". Este documento também consolida Riscos e Oportunidades da visão inteira (não têm arquivo próprio na lista de entregáveis desta Sprint).

## 1. Por que alguém joga, por horizonte de tempo

**1 semana.** O loop de Aventura idle já existente (RC1) — exploração automática, loot, progressão de personagem — é suficiente sozinho. Nada deste documento precisa existir para a primeira semana funcionar; é exatamente por isso que a base técnica não precisa mudar (`world-foundation-4.0.md` Seção 4).

**1 mês.** O jogador declara residência num Reino, começa a acumular cidadania (`citizen-system.md`), talvez constrói sua primeira casa (`housing-phase1.md`). O ciclo social diário (`social-loop.md`) começa a competir por atenção com o combate puro.

**1 ano.** O jogador atinge Cidadão ou Veterano, tem uma propriedade com história própria, talvez já trocou de mãos uma vez (comprada de outro jogador). Presenciou pelo menos um evento de mundo real (`world-events.md`) e uma temporada competitiva completa.

**5 anos.** O jogador é, possivelmente, Lenda de um Reino — citado na própria Crônica dele. Viu Reinos nascerem, crescerem, e alguns ficarem silenciosos sob a Coroa. Sua propriedade original pode ter sido vendida, recomprada, ou ele pode ainda morar na mesma casa que construiu no ano 1 — ambos os casos são histórias válidas que o sistema precisa suportar igualmente bem.

**10 anos.** O mundo tem história real que nenhum jogador novo pode replicar instantaneamente — mas também não pode ser impedido de construir a sua própria (ver Seção 3.f, late-joiners). O jogo, neste ponto, vende-se sozinho pela profundidade da própria história acumulada — "este Reino existe há 8 anos, teve 6 Coroas, sobreviveu a 4 guerras" é, sozinha, uma frase de marketing mais forte que qualquer trailer.

## 2. O modelo de duas camadas como mecanismo central de retenção de longo prazo

Detalhado em `world-events.md` Seção 3 — a camada permanente dá ao veterano algo que nunca se perde; a camada sazonal dá a ele um motivo genuíno de continuar competindo sem contradizer essa permanência. Sem essa reconciliação, "nada nunca desaparece" tende, ao longo de anos reais de operação, a significar "nada nunca é novo" para quem já está no jogo há muito tempo — o risco mais silencioso e mais tardio de toda a visão, porque só se manifesta depois que o jogo já é velho o suficiente para o problema aparecer.

## 3. Riscos — consolidado (arquiteturais, gameplay, economia, comunidade)

### Arquiteturais
- **Fusão de contas** ao conectar múltiplos provedores de login à mesma pessoa — não resolvido neste conjunto de documentos, precisa de decisão explícita antes da implementação de `identity-core.md`.
- **Contenção de escrita no Tesouro do Reino** — múltiplos jogadores creditando o mesmo saldo simultaneamente; mitigado na análise de `kingdom-treasury.md`, mas só resolvido de fato quando o Reino puder gastar de forma competitiva.

### Gameplay
- **Reino como "canal com skin trocada"** — o maior risco de disciplina, não técnico: renomear `streamer_channels` para `kingdoms` sem mudar a definição de pertencimento produziria um jogo que parece independente da Twitch mas cuja definição de comunidade continua sendo "quem assistiu mais". Isso falharia silenciosamente no primeiro Reino sem streamer.
- **Apatia de governança** — eleições sem candidatos, conselhos de guilda vazios; a maioria dos jogadores não quer governar, só quer jogar. Mitigado pelo modelo de Mérito Automático (`kingdom-domain-2.0.md`), mas estrutural, não cosmético.
- **Oligarquia de guilda dominante** — sem mecanismo de desafio periódico, a mesma guilda nunca perde a liderança de um Reino-de-Guilda.

### Economia
- **Cidadania e presença exploráveis por bot/farm** — "presença", "sequência de dias", "expedições completadas" são exatamente o tipo de métrica que scripts automatizados otimizam melhor que humanos; mesma categoria de risco já registrada no audit de Exploits do Platform Phase.
- **Mercado imobiliário como vetor de RMT** — um castelo raro, vendável por gold, atrai comércio de dinheiro real por fora do jogo; mitigações nomeadas em `real-estate.md` Seção 3, não decididas em detalhe.
- **Reinos-fantasma** — a maioria dos Reinos fundados nunca vai atingir maturidade; a maioria vai estagnar em Coroa-administrada, pequena, silenciosa. Não é uma falha a "consertar" — é o estado estatístico normal a aceitar.

### Comunidade
- **Late-joiner disadvantage** — um jogador entrando no ano 3 encontra bairros "prontos", guildas estabelecidas, história "de outros". Mitigação: (1) novos Reinos sempre podem ser fundados, a fronteira nunca fecha; (2) oferta de moradia expande proceduralmente com a população, nunca é um número fixo escasso desde o dia 1; (3) legado é inspiração, não gatekeeping — a Crônica de um jogador novo começa em branco e cresce em paralelo à dos veteranos, nunca competindo contra ela.
- **A Coroa não é grátis** — Reinos sem líder ativo (a maioria, estatisticamente) precisam de conteúdo/eventos gerados pela produção para não parecer sem vida; isso é trabalho contínuo de live-ops, não automação que "simplesmente funciona".

## 4. Oportunidades — consolidado

- Um jogo que não depende de "está tendo live agora" tem, em teoria, jogadores 24/7 — teto de audiência estruturalmente maior que o modelo original.
- Reinos como unidade de retenção social permanente (não só de audiência) — a comunidade de um streamer vira um ativo do jogo, não um artefato do momento da live.
- Login sem fricção de Twitch abre o funil de aquisição (Google/Discord/E-mail são bem mais amplos que só Twitch).
- Cidadania genuína abre monetização baseada em identidade/pertencimento (personalização, símbolos de Reino), estruturalmente mais saudável que pay-to-win.
- Liderança plugável permite, no futuro, Reinos patrocinados por marcas/eventos reais/parcerias sem nenhuma mudança arquitetural — a extensibilidade já está desenhada.
- O trabalho narrativo já construído (Kingdom Prestige System, Hall da Fama, Founder Identity, Chronicles) não é desperdiçado — a maior parte sobrevive como conceito e UI, só a fonte de dado muda.
- Um mundo com história real de anos vende-se sozinho — a melhor peça de marketing é o próprio estado do jogo, não um trailer produzido.

---

*Referências: todos os documentos irmãos desta Sprint; `project_streamrpg_platform_phase` (audit de Exploits já registrado, reaplicado a cidadania); a análise crítica final da revisão "World Design 3.0" desta sessão de projeto, formalizada aqui.*
