# 04. Build

**Status: 🟠 Rascunho.** Não é capítulo da Bible. Recupera e formaliza a
Missão 7 da Sprint de Gameplay original (só existia em conversa).

## O que é uma build, neste jogo

Build = a combinação de Classe (capítulo 06) + Equipamento (capítulo 05)
+ (no futuro) escolha de Skill que define os atributos do capítulo 01
(ATQ/VEL/SUS/UTI) e a Resistência física/mágica do Combat Model
(`docs/combat-model/canonical-formula.md`) de um personagem. **Nota
(Sprint 4):** DEF não existe mais como atributo — foi substituído
inteiramente por Resistência (física/mágica), ver capítulo 01. Não existe
"ponto de build" alocado manualmente — a build emerge inteiramente das
escolhas de classe e equipamento, consistente com a decisão do capítulo
01 de não ter alocação manual de atributo.

## Por que nenhuma build deveria dominar sozinha

Princípio central: cada build deveria otimizar um **recurso diferente**,
não competir todas no mesmo eixo ("quem causa mais dano").

| Build (arquétipo) | Recurso otimizado | Onde se destaca |
|---|---|---|
| Dano (ATQ alto) | Velocidade de expedição — mais loot por hora | Combate direto, encontros comuns |
| Tanque (Resistência alta) | Acesso — sobrevive a conteúdo que outras builds não tentam | Regiões de dificuldade alta (Deserto de Vidro, Fortaleza Sombria) |
| Suporte (SUS alto) | Valor social — regeneração pode se estender ao grupo (ver capítulo 06, Xamã), torna o grupo inteiro mais viável | Qualquer grupo, mais que sozinho |
| Velocidade (VEL alto) | Alcance — mais ações por combate, chega mais longe por ciclo | Ambientes com penalidade de VEL (Gelo, Picos Congelados) |
| Utilidade (UTI alto) | Variância/nicho — resistência a controle, detecção de armadilha (nunca crítico, ver Sprint 4) | Ruínas Esquecidas (armadilhas), Minas Abandonadas (escuridão) |

Se cada build otimiza um recurso diferente, a "melhor" depende do que o
grupo/jogador valoriza — escolha real, não ilusória. Isso só funciona se
o jogo realmente recompensar esses recursos de forma diferenciada (mais
loot/hora vs. acesso a conteúdo vs. valor social) — algo que hoje **não
existe em nenhum sistema real**, é a peça que este capítulo propõe, não
descreve.

## Risco reconhecido, não resolvido aqui

Se um único recurso (ex.: "ouro por hora") acabar valendo mais que todos
os outros na prática, a build de Dano se torna secretamente dominante
mesmo com essa estrutura — a auto-crítica da Sprint de Gameplay original
já havia nomeado isso, e continua sem solução: só playtest real prova ou
refuta.

## Interface com Regiões (World Design)

Cada região do World Design já tem um "traço mecânico" que favorece um
tipo de build (ver capítulo 07 deste diretório para a tabela completa de
mapeamento) — é a peça que fecha o círculo: build não é só "melhor ou
pior" em abstrato, é melhor ou pior **num contexto específico**, o que dá
sentido real a "cada região tem identidade".

## Nota de honestidade

A tabela acima assume que "recurso otimizado" (velocidade de expedição,
acesso, valor social, alcance, variância) pode ser medido e comparado de
forma que nenhum sobressaia sozinho — isso é uma aposta de balanceamento,
não uma garantia. Nenhum destes recursos tem hoje uma métrica real no
jogo.
