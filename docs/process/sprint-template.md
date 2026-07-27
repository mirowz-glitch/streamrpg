# Sprint Template — StreamRPG

**Status:** 🟢 Canônico. Modelo oficial para toda Sprint futura — formaliza a estrutura que já era usada informalmente em toda Sprint do RC1 (o brief que o usuário já escreve para cada Sprint segue quase exatamente este formato). Este documento existe para que essa estrutura seja explícita e não dependa de repetição manual a cada vez.

## Template

```markdown
# STREAMRPG — <NOME DA SPRINT>

## Objetivo
O que esta Sprint entrega, em uma ou duas frases — o resultado, não a lista
de tarefas.

## Contexto
O que já existe, o que a Sprint anterior deixou pronto (documentos de
preparação relevantes, decisões já congeladas que se aplicam), e por que
esta Sprint acontece agora e não antes/depois.

## Escopo
O que EXATAMENTE será construído/alterado nesta Sprint — específico,
verificável, sem ambiguidade sobre onde termina.

## Fora do Escopo
O que deliberadamente NÃO será feito, mesmo que relacionado — a lista
"NÃO IMPLEMENTAR" já usada em toda Sprint do RC1. Esta seção é o que
mais protege contra scope creep.

## Fases
Numeradas, cada uma com um objetivo próprio verificável — o padrão
"FASE 1 — Auditoria" (nunca pular direto para código sem entender o
estado real primeiro) já é obrigatório desde o início do RC1 e continua
sendo.

## Critérios de Aprovação
Lista objetiva do que precisa ser verdade para a Sprint ser considerada
concluída — geralmente inclui, no mínimo, os itens de
`docs/process/definition-of-done.md`, mais critérios específicos do
domínio da Sprint.

## Entregáveis
O que precisa existir ao final — documentos, relatórios, preparação
para a Sprint seguinte. Numerados, cada um com sua própria descrição
do que deve conter.

## Compatibilidade
O que não pode regredir — nomeado explicitamente, sistema por sistema,
não deixado implícito.

## Browser Validation
Se a Sprint toca UI ou é observável indiretamente em uma tela, o fluxo
de navegação que precisa ser validado antes da Sprint ser considerada
concluída.
```

## Por que este formato, e não outro

Cada seção do template corresponde a uma decisão já tomada durante o RC1 sobre como Sprints deveriam funcionar:

- **Fases numeradas começando por Auditoria**: nenhuma Sprint do RC1 pulou para código sem primeiro entender o estado real — a auditoria pegou, por exemplo, a lacuna de dado (região/auto-equip não persistidos) ANTES de qualquer código de Backpack Experience ser escrito.
- **Fora do Escopo explícito**: a Sprint "City Foundation" só evitou construir uma Cidade funcional prematuramente (sobre uma decisão de Ouro ainda não tomada) porque seu escopo negativo estava explícito desde o brief.
- **Compatibilidade nomeada, não implícita**: todo relatório final de Sprint do RC1 confirma sistema por sistema ("Combate não mudou, Loot não mudou...") — nomear evita que "nada mudou" vire uma suposição não verificada.
- **Entregáveis com Preparação para a Próxima Sprint**: o padrão que permitiu que cada Sprint do RC1 começasse já sabendo o contexto, sem precisar redescobri-lo.

## Quando usar este template

Toda Sprint nova — de feature, de arquitetura, ou puramente documental (como as duas Sprints mais recentes: RC1 Retrospective, Engineering Standards). O template se adapta ao conteúdo (uma Sprint documental tem "Fases" descrevendo documentos a escrever, não código), mas a ESTRUTURA das seções não muda.

---

*Referências: `docs/process/definition-of-done.md` (a base dos Critérios de Aprovação), `docs/process/project-governance.md` (como este template se encaixa no processo geral).*
