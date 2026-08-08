# 8. Kingdoms

**Status:** 📌 Placeholder

Nada definido ainda.

Dois fios já puxados:

- A Auditoria de Plataforma (capítulo 12) já lista "sharding" como uma das
  frentes de Escalabilidade a revisar — Kingdoms pode implicar uma
  unidade de particionamento de dados própria, não só uma feature de
  gameplay. Vale considerar isso ao desenhar, não só o design de jogo.
- **Ideia registrada, não decidida (2026-07-01):** o Boss (capítulo 6) foi
  desenhado com escopo por canal — um Boss por canal, canais
  independentes entre si. Existe uma alternativa nunca avaliada: um Boss
  Global do servidor inteiro, compartilhado por todos os canais. Isso não
  foi escolhido para o MVP do Boss, mas afeta diretamente como Kingdoms
  pode ser desenhado (um Kingdom é uma coisa por canal, ou uma estrutura
  que atravessa vários canais?) — vale revisitar esta pergunta quando
  Kingdoms entrar em Sprint, não antes.

Preencher com perguntas de design antes de qualquer código, no mesmo padrão
do capítulo 6 (Bosses).

## Dependências

Kingdoms depende de:
- Bosses e Quests (ordem de construção histórica, ver capítulo 12)
- Roadmap (Auditoria de Plataforma — frente de Escalabilidade/sharding)

**Nota (2026-07-31):** o desenho real de Kingdom nasceu fora desta Bible,
em `docs/design/kingdom-domain-2.0.md` (Reino permanente, liderança
plugável) — este capítulo ainda não foi reconciliado com aquele documento
(ver nota do README). A ordem de Sprint de Kingdom/Citizen/Housing/etc. vive
em `docs/design/new-roadmap.md`, não neste capítulo nem no capítulo 12.
