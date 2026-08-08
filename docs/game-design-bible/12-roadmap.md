# 12. Roadmap

**Status:** 🗂️ Histórico — válido como registro do que foi decidido até Marco
1.0, mas **não é mais a sequência vigente a partir de Kingdoms em diante**.
A ordem oficial de Sprints para a era Kingdom/World-Foundation (tudo depois
do RC1 vertical slice) vive exclusivamente em
[`docs/design/new-roadmap.md`](../design/new-roadmap.md) — este capítulo não
deve ser lido como concorrente daquele documento. A lista "BossSystem →
QuestSystem → Kingdoms → Economia 1.0 → Marketplace → Referral →
MetricsSystem" abaixo é a ordem que fazia sentido na era do Engine
legado (EventBus/Systems, anterior ao RC1 vertical slice e ao pivot de
independência da Twitch) — mantida aqui só como registro histórico de
decisão, nunca como guia de sequenciamento atual.

## Migração da Engine — concluída (Marco 1.0)

Sprints D3 → E4: DropSystem em shadow mode → escrita real → ativação do XP
da Engine em teste → teste de carga → remoção do legado. Marco 1.0 atingido
quando XP, Level, Welcome Reward e Drop passaram a ser concedidos
exclusivamente via `EventBus`/`Systems`. Gold é a única exceção deliberada,
ainda não migrada.

A partir daqui o projeto deixa de ser "Migração" e passa a ser "StreamRPG
Platform" — evolução, não mais fundação.

## Ordem confirmada, a partir daqui

BossSystem → QuestSystem → Kingdoms → Economia 1.0 → Marketplace → Referral
(Hero Token) → MetricsSystem.

Marketplace vem depois da Economia 1.0 deliberadamente (ver capítulo 11).

## Auditoria de Plataforma (pendente, oferecida quando fizer sentido)

Quando a base de jogadores ou o catálogo de features justificar, existe uma
auditoria de plataforma completa combinada, em 5 frentes: Performance,
Economia, Exploits (recorrente, não pontual), Escalabilidade (SQLite/
EventBus/filas/sharding), Produto (dados de uso real, não intuição). Cada
uma com métricas específicas já definidas — não é uma revisão de código, é
uma revisão de plataforma "saindo do beta".

## Dependências

Nenhuma — este capítulo consolida a sequência de construção decidida até
Marco 1.0. Para a sequência vigente a partir de Kingdoms, ver
`docs/design/new-roadmap.md`, não este capítulo.
