# 12. Roadmap

**Status:** ✅ Estável

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

Nenhuma — este capítulo consolida a sequência de construção já decidida em
todos os outros; reflete decisões, não impõe novas.
