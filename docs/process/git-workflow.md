# Git Workflow — StreamRPG

**Status:** 🟢 Canônico. Formaliza a convenção de branches a partir de agora — descreve tanto o que já era praticado (`sprint/*` já existe como convenção real, ver `sprint/wolves-ecosystem-content-connections`) quanto o que passa a ser exigido de forma explícita (tags de release, processo de merge).

## Branch Principal

`main` — rastreia `origin/main`. Representa o estado publicável mais recente. Nenhum commit direto nela fora de merge de PR.

## Branches de Release

`release/<nome>` (ex.: `release/vertical-slice-rc1`, a branch de trabalho atual). Uma branch de release existe para estabilizar um marco (Vertical Slice, uma versão de Early Access futura) através de várias Sprints sucessivas antes de eventualmente ser mesclada em `main`. Commits de Sprint acontecem aqui diretamente ou via merge de branch de feature, dependendo do tamanho da mudança (ver Processo de Merge abaixo).

## Branches de Feature

`sprint/<nome-da-sprint>` — convenção já em uso (`sprint/wolves-ecosystem-content-connections`). Usada quando uma Sprint é grande o suficiente para justificar isolamento antes de entrar na branch de release, ou quando múltiplas Sprints precisam progredir em paralelo sem interferir uma na outra. Nem toda Sprint precisa de sua própria branch de feature — Sprints pequenas/sequenciais podem commitar direto na branch de release ativa, como aconteceu ao longo do arco Global Idle System → City Foundation.

## Convenção de Nomes

| Tipo | Padrão | Exemplo |
| --- | --- | --- |
| Release | `release/<marco>` | `release/vertical-slice-rc1` |
| Feature/Sprint | `sprint/<nome-descritivo-kebab-case>` | `sprint/economy-core-phase1` |
| Correção pontual fora de Sprint | `fix/<descrição-curta>` | `fix/inventory-empty-section` |

Nomes em inglês, kebab-case, descritivos o suficiente para identificar a Sprint/mudança sem abrir a branch.

## Estratégia de Tags

**Ainda não praticada neste projeto** (nenhuma tag existe hoje, apesar de marcos reais já terem acontecido — ex.: o commit "Freeze: Vertical Slice RC1 baseline"). A partir desta Sprint, todo marco de congelamento oficial (RC1, futuros RCs, releases de Early Access) deve receber uma tag anotada no momento do commit de congelamento:

```bash
git tag -a rc1-freeze -m "Vertical Slice RC1 — architecture frozen"
git push origin rc1-freeze
```

Convenção de nome de tag: `<marco>-<evento>` (ex.: `rc1-freeze`, `rc1-final`, `early-access-launch`) — minúsculo, kebab-case, sem prefixo `v` (este projeto não segue versionamento semântico de biblioteca, segue marcos de produto).

## Processo de Merge

1. Trabalho acontece em `sprint/*` (Sprint grande/paralela) ou diretamente em `release/*` (Sprint pequena/sequencial, o padrão mais comum até agora).
2. Ao final da Sprint, Definition of Done (`docs/process/definition-of-done.md`) precisa estar satisfeita antes de abrir PR.
3. PR segue o formato de `docs/process/pull-request-template.md`, revisado contra `docs/process/code-review-checklist.md`.
4. Merge para `release/*` (se a Sprint trabalhou em `sprint/*`) ou direto para o histórico de `release/*` (se já trabalhava lá).
5. `release/*` só é mesclada em `main` num marco real de congelamento (ex.: fim do RC1) — nunca a cada Sprint individual — e esse merge deve coincidir com uma tag (ver acima).
6. Nunca force-push em `main` ou em uma branch de release compartilhada — reverter um commit problemático usa um novo commit de reversão, não reescrita de histórico.

## O que NÃO fazer

- Não commitar diretamente em `main` fora de um merge de PR.
- Não deixar um marco de congelamento sem tag correspondente — é a lacuna real identificada nesta Sprint (RC1 foi congelado duas vezes em commits distintos sem nenhuma tag marcando nenhum dos dois).
- Não usar `git push --force` em branch compartilhada sem confirmação explícita do dono do repositório.

---

*Referências: `docs/process/definition-of-done.md` (o que precisa estar pronto antes do merge), `docs/process/pull-request-template.md` (formato da PR que acompanha o merge), `docs/releases/rc1.md` (o marco mais recente que deveria ter sido tagueado).*
