# New Roadmap — Foundation Refactor

**Status:** 🟢 Canônico. Única sequência oficial de Sprints para a fase pós-RC1 (era Kingdom/World-Foundation). Revisado em 2026-07-31 numa passagem de consistência documental — ver Seção 0 para o histórico da revisão. `docs/roadmap.md` continua sendo a sequência oficial de um eixo diferente (a ordem de sistemas de RC1 → Economy Core → ... → Early Access, já majoritariamente concluída) e não é substituído por este documento — os dois não compartilham nenhum item, não há conflito de ordem entre eles (ver Seção 0.3).

## 0. Nota de consistência (2026-07-31)

Este documento passou por uma revisão explícita porque uma versão anterior dele (mesma Sprint "Foundation Refactor") havia proposto uma sequência ligeiramente diferente da que o usuário depois considerou correta. Este é o único documento do projeto que declara a ordem completa de Sprints da era Kingdom/World-Foundation — a partir de agora, nenhum outro documento deve reafirmar essa ordem de forma independente; todos apontam para este arquivo.

### 0.1 O que mudou em relação à versão anterior deste documento

1. **Identity Core e Login Providers fundem-se em uma única Sprint.** Decisão de produto, não técnica: o jogador nunca percebe a diferença entre "a Identidade existir sem depender de um provedor" e "os provedores de login existirem" — são duas metades do mesmo problema (identidade do jogador), entregues melhor juntas do que separadas. Os documentos de referência (`identity-core.md`, `login-providers.md`) continuam sendo dois arquivos distintos — a fusão é de **entrega de Sprint**, nunca de documentação de referência (mantendo a disciplina do projeto de nunca reunir tópicos diferentes num arquivo único).

2. **Trade Routes move para logo depois de Kingdom Treasury**, antes de Guild System (na versão anterior, vinha depois de Kingdom Wars, quase no fim). Não existe dependência técnica que force Trade Routes a vir depois de Guild System ou de World Events — a única dependência real de Trade Routes é Kingdom Domain (vocação econômica) e a Adventure Session/Expeditions já existente (RC1). Colocar Trade Routes logo após Treasury agrupa toda a **cadeia econômica** (Kingdom Domain → Citizen System → Housing → Real Estate → Treasury → Trade Routes) de forma contígua, antes de abrir a **cadeia social/política** (Guild System → World Events → Seasons) — um agrupamento por família de domínio mais limpo do que a intercalação da versão anterior, que não tinha uma razão de dependência clara para separar Treasury de Trade Routes com Guild System no meio.

3. **Kingdom Wars move para o final, logo antes de Endgame** (na versão anterior, vinha logo depois de World Events, no meio da sequência). Esta é a mudança mais significativa, e a que mais vale justificar: Kingdom Wars é, das treze Sprints, a de maior risco — conquista e liderança contestada entre Reinos, uma mecânica que `kingdom-domain-2.0.md` já registra explicitamente como a parte mais delicada do domínio (a Seção 5 daquele documento defere território exclusivo exatamente por essa razão). Construir Kingdom Wars só depois que Trade Routes, Guild System, World Events, Seasons e Cross Platform já estiverem maduros significa testar o sistema de conquista sobre um mundo social e econômico já estável — em vez de introduzir a mecânica mais instável e mais difícil de balancear no meio da sequência, arriscando ter que revisitar tudo que vem depois dela. Isso segue o mesmo princípio que o projeto já usou antes para justificar "Boss antes de Economia 1.0" (`docs/design/gold-architecture-phase1.md`/histórico do projeto): sistemas de alto risco/alta incerteza vêm depois dos sistemas que eles vão testar sob pressão, nunca antes.

4. **Seasons move para antes de Cross Platform** (na versão anterior, vinha depois). Não há dependência técnica entre os dois — Seasons depende de World Events/Citizen System/Chronicles, nenhum dos quais depende de Cross Platform. A ordem escolhida prioriza aprofundar o loop social/competitivo central do jogo antes de expandir alcance de plataforma — coerente com o princípio já estabelecido nesta mesma revisão de produto de que integrações de plataforma nunca são o centro do jogo, só uma porta de entrada adicional (`cross-platform.md`).

**Conclusão desta revisão**: a nova ordem (a que o usuário propôs) é, nesta análise, tecnicamente melhor que a versão anterior deste documento — não apenas uma preferência equivalente adotada por decisão de produto. Ela agrupa por dependência real de domínio (cadeia econômica antes da cadeia social) e sequencia o sistema de maior risco (Kingdom Wars) por último, de forma consistente com um princípio de sequenciamento que este projeto já usa em outros contextos. A única mudança desta lista que é puramente decisão de produto, sem argumento técnico a favor de uma ordem sobre a outra, é a posição de Seasons vs. Cross Platform (Item 4) — registrada como tal, não como correção técnica.

### 0.2 Divisão Housing / Real Estate — confirmada, não uma mudança

Housing e Real Estate permanecem como duas Sprints distintas (não haveria razão técnica ou de produto para fundi-las). Housing cria o objeto permanente (a casa, o bairro, a posse, o abandono); Real Estate cria o mercado sobre esse objeto (compra, venda, separação entre propriedade física e status do dono anterior). São dois sistemas que podem evoluir em ritmos diferentes — Housing pode, por exemplo, ganhar novos tipos de construção sem que o Mercado precise mudar nada, e o Mercado pode ganhar regras anti-especulação sem que Housing precise mudar nada. Mesma disciplina de separação já aplicada a Merchant vs. Blacksmith vs. Salvage no RC1 (três consumidores do mesmo Economy Core, cada um evoluindo independente).

### 0.3 Por que `docs/roadmap.md` não é tocado nesta revisão

`docs/roadmap.md` declara uma sequência diferente, de um eixo diferente: RC1 → Economy Core → Merchant → Blacksmith → Salvage → Crafting → World Map → Endgame → Early Access — a ordem de construção dos sistemas de jogo do RC1 vertical slice, majoritariamente já concluída (só Crafting/World Map/Endgame/Early Access restam). Nenhum item dessa lista aparece na sequência deste documento, e nenhum item deste documento aparece naquela — não existe uma única Sprint que as duas listas ordenem de forma diferente, porque não há sobreposição de itens entre elas. Não é uma segunda "verdade oficial" concorrente com esta — é um eixo complementar, do mesmo jeito que `commercial/roadmap/project-valuation-roadmap.md` já convive com `docs/roadmap.md` sem conflito (dois eixos, dois vocabulários de sistemas, zero item em comum). Se, no futuro, algum sistema aparecer nas duas listas com ordens conflitantes, essa seria a hora de unificá-las — não é o caso hoje.

---

## A Sequência Oficial

```
1. Identity Core + Login Providers
        ↓
2. Kingdom Domain
        ↓
3. Citizen System
        ↓
4. Housing
        ↓
5. Real Estate
        ↓
6. Kingdom Treasury
        ↓
7. Trade Routes
        ↓
8. Guild System
        ↓
9. World Events
        ↓
10. Seasons
        ↓
11. Cross Platform
        ↓
12. Kingdom Wars
        ↓
13. Endgame
```

---

## 1. Identity Core + Login Providers

**Objetivo**: uma única Sprint entregando as duas metades do mesmo problema — separar a Identidade (`profile`) de qualquer provedor de autenticação específico (remover `twitch_id NOT NULL UNIQUE` como fundação obrigatória) **e** entregar Google/Discord/E-mail como login core e Twitch/Kick/YouTube como vínculos opcionais, todos gerando exatamente a mesma forma de conta. Ver `identity-core.md` e `login-providers.md` (dois documentos de referência, uma Sprint de entrega).

**Dependências**: nenhuma — novo ponto de partida, substituindo RC1 na posição de "a coisa que tudo depende".

**Critérios de conclusão**: um `profile` pode existir sem `twitch_id`; qualquer um dos seis provedores cria/resolve a mesma forma de conta; o mecanismo de sessão (já agnóstico, `middleware/auth.ts`) permanece sem alteração; teste de equivalência ("funciona sem Twitch?") responde sim para todo o fluxo de criação de personagem; nenhum sistema de jogo existente quebra.

## 2. Kingdom Domain

**Objetivo**: Reino como entidade permanente, liderança plugável (Coroa/Streamer/Eleito/Guilda/Conquistado/Mérito). Ver `kingdom-domain-2.0.md`.

**Dependências**: Identity Core + Login Providers (fundação de Reino precisa de um `profileId` estável, independente de provedor).

**Critérios de conclusão**: Reino existe sem streamer, sem live, sem ninguém online; Reino Oficial (Coroa) existe por padrão; os 6 cargos de prestígio já existentes continuam funcionando com nova fonte de dado.

## 3. Citizen System

**Objetivo**: os cinco estágios de cidadania (Visitante → Residente → Cidadão → Veterano → Lenda), substituindo "assistiu = membro". Ver `citizen-system.md`.

**Dependências**: Kingdom Domain.

**Critérios de conclusão**: pertencimento a um Reino nunca depende de `viewer_sessions`/`channel_rankings`; um jogador sem nenhuma conexão de streaming consegue atingir Cidadão/Veterano normalmente.

## 4. Housing

**Objetivo**: bairros, casas, construção, ciclo de vida completo (construção → posse → abandono → recuperação). Ver `housing-phase1.md`.

**Dependências**: Citizen System (só Residentes/Cidadãos podem construir).

**Critérios de conclusão**: uma casa nunca é deletada; nome do construtor permanece para sempre, mesmo após múltiplas trocas de dono.

## 5. Real Estate

**Objetivo**: mercado imobiliário, com separação estrita entre objeto físico e título/prestígio. Ver `real-estate.md`.

**Dependências**: Housing.

**Critérios de conclusão**: comprar uma propriedade nunca concede o status do dono anterior; mitigações anti-especulação nomeadas antes da implementação real.

## 6. Kingdom Treasury

**Objetivo**: saldo econômico do Reino, extensão do Economy Core existente. Ver `kingdom-treasury.md`.

**Dependências**: Housing/Real Estate (fontes de receita), Economy Core (RC1, já existente).

**Critérios de conclusão**: nenhuma regra de negócio de Reino vive no Ledger genérico; modelo de consistência (crédito simples vs. débito contestado) decidido explicitamente antes da implementação, mesma disciplina de `docs/design/gold-architecture-phase1.md`.

## 7. Trade Routes

**Objetivo**: comércio inter-Reino via expedição real, vocações econômicas emergentes. Ver `trade-routes.md`.

**Dependências**: Kingdom Domain (vocação), Kingdom Treasury (opcional — tributação de rotas), Adventure Session/Expeditions (RC1, já existente — reaproveitado, não duplicado).

**Critérios de conclusão**: nenhum recurso é exclusivo de um Reino; moeda universal preservada (sem câmbio entre Reinos); Treasury pode opcionalmente tributar rotas.

## 8. Guild System

**Objetivo**: Guilda como sub-domínio dentro de (ou atravessando) Reinos, consumindo o mesmo padrão de liderança plugável do Kingdom Domain. `GuildBuilding.tsx` já existe como UI — este item conecta a lógica real por trás dela.

**Dependências**: Kingdom Domain, Citizen System.

**Critérios de conclusão**: uma Guilda pode assumir a liderança de um Reino sob o modelo "Guilda" sem duplicar a lógica de liderança já existente para os outros modelos.

## 9. World Events

**Objetivo**: eventos naturais emergentes de estado real + o modelo de duas camadas (permanente vs. sazonal). Ver `world-events.md`.

**Dependências**: Kingdom Domain, Kingdom Treasury, Citizen System (os gatilhos de evento leem estado desses três domínios).

**Critérios de conclusão**: nenhum evento depende de streamer/live para disparar; a camada sazonal se funde corretamente na Crônica permanente ao terminar.

## 10. Seasons

**Objetivo**: formalizar a camada sazonal como sistema — rankings competitivos com início/fim, fusão do resultado na Crônica permanente ao encerrar.

**Dependências**: World Events, Citizen System, Chronicles (RC1, já existente).

**Critérios de conclusão**: uma temporada nunca apaga histórico; o resultado de uma temporada é permanentemente citável mesmo depois que o quadro competitivo reseta.

## 11. Cross Platform

**Objetivo**: Twitch/Kick/YouTube/Discord formalmente como integrações — chat, notificações, raids, eventos, recompensas cosméticas, integração social. Ver `cross-platform.md`.

**Dependências**: Identity Core + Login Providers (o vínculo já existe), Kingdom Domain (liderança Streamer já é um dos modelos).

**Critérios de conclusão**: toda mecânica de integração passa no teste de equivalência ("funciona sem Twitch?"); nenhuma vantagem de poder/progressão exclusiva de plataforma conectada.

## 12. Kingdom Wars

**Objetivo**: o modelo de liderança "Conquistado" ganha mecânica real — guerra entre Reinos com resultado de liderança, nunca território de exploração exclusivo (ver `kingdom-domain-2.0.md` Seção 5, território deliberadamente fora de escopo).

**Dependências**: Kingdom Domain, World Events, Guild System (guildas como participantes plausíveis de guerra), Trade Routes (rotas comerciais como possível alvo/motivação de conflito).

**Critérios de conclusão**: conquista nunca é permanente sem direito de reconquista; nenhuma mudança ao mundo explorável compartilhado (regiões continuam globais); o sistema é construído sobre uma cadeia social/econômica já estável, não sobre domínios ainda recém-lançados.

## 13. Endgame

**Objetivo**: definido em Sprint futura, uma vez que Kingdom/Citizen/Housing/Treasury/Trade/Guild/WorldEvents/Seasons/Wars já estejam operando — endgame de um MMORPG social/persistente é qualitativamente diferente do endgame de progressão individual já coberto pelo RC1 (Fortaleza Sombria etc.), e merece seu próprio documento quando o resto desta sequência estiver mais maduro.

**Dependências**: todos os itens anteriores.

---

*Referências: `docs/roadmap.md` (eixo complementar, não conflitante — ver Seção 0.3); `docs/game-design-bible/00-philosophy.md` (a Filosofia que toda esta sequência precisa obedecer); todos os documentos de referência citados por item (`identity-core.md`, `login-providers.md`, `kingdom-domain-2.0.md`, `citizen-system.md`, `housing-phase1.md`, `real-estate.md`, `kingdom-treasury.md`, `trade-routes.md`, `world-events.md`, `cross-platform.md`, `social-loop.md`, `long-term-retention.md`).*
