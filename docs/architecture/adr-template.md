# ADR Template & Processo de Numeração

**Status:** 🟢 Canônico. Um ADR (Architecture Decision Record) é o registro PERMANENTE de uma decisão arquitetural já tomada — nunca é apagado, só marcado como superado por um ADR posterior. Diferente de um RFC (`docs/architecture/rfc-process.md`), que é a proposta que pode ser aceita ou rejeitada, o ADR só existe depois que uma decisão real foi tomada.

## Quando um ADR é criado

- Todo RFC aceito (`docs/architecture/rfc-process.md`) gera exatamente um ADR.
- Uma decisão arquitetural relevante tomada FORA do fluxo de RFC (ex.: durante uma Sprint de feature, quando uma escolha estrutural precisou ser feita ali mesmo) também pode gerar um ADR diretamente — não é obrigatório passar por um RFC formal para toda decisão, só para as que se enquadram nos gatilhos de `docs/architecture/architecture-freeze-rc1.md`. As 8 decisões já registradas em `docs/architecture/decisions.md` (D1-D8) são exemplos desse segundo caso: nasceram organicamente ao longo do RC1, e foram formalizadas retroativamente, não por um RFC prévio.

## Onde os ADRs vivem

`docs/architecture/adr/NNNN-titulo-curto.md`, um arquivo por decisão, numerados sequencialmente a partir de `0001`. Um índice (`docs/architecture/adr/README.md`) lista todos em ordem, com status atual de cada um — este índice deve ser criado junto com o primeiro ADR real (não existe ainda, porque nenhum ADR formal foi emitido além dos registros D1-D8 de `decisions.md`, que antecedem este processo).

## Numeração

Sequencial, sem reuso — `0001`, `0002`, `0003`, ... Um ADR nunca é renumerado, mesmo se depois for superado; o número é o identificador permanente da decisão no tempo em que foi tomada.

## Template

```markdown
# ADR-NNNN: Título curto da decisão

## Contexto
O que estava acontecendo, tecnicamente, que levou a esta decisão precisar ser
tomada. Referencie o RFC que originou este ADR, se houver
(`docs/architecture/rfc-process.md`), ou a Sprint onde a decisão surgiu
organicamente.

## Decisão
A decisão em si, em uma ou duas frases diretas. Não é o lugar para
justificar longamente (isso é Contexto) — é o registro do QUE foi decidido.

## Status
Um destes, exatamente:
- **Proposto** — ainda em RFC, não implementado.
- **Aceito** — decidido e implementado.
- **Superado por ADR-MMMM** — uma decisão posterior substituiu esta; o
  ADR permanece no histórico, nunca é apagado.
- **Rejeitado** — considerado e descartado (raro registrar como ADR, mas
  válido quando a decisão de NÃO fazer algo é ela mesma importante de
  não ser reaberta sem motivo novo).

## Consequências
O que esta decisão facilita, o que ela impede, e qualquer dívida técnica
consciente que ela introduz. Seções "Positivas" e "Negativas" separadas,
se ambas existirem — toda decisão real tem trade-off; um ADR sem nenhuma
consequência negativa provavelmente não documentou a decisão com
honestidade suficiente.

## Referências
Link para o RFC que originou esta decisão (se houver), para
`docs/architecture/decisions.md` (se relacionado a uma das 8 decisões
fundacionais), e para qualquer Sprint/relatório relevante.
```

## Relação com `docs/architecture/decisions.md`

As 8 decisões já registradas em `decisions.md` (D1-D8) são o precedente estrutural para todo ADR futuro — mesmo formato de raciocínio (motivação, alternativas descartadas, consequências), só que sem numeração sequencial e sem estarem em arquivos individuais, porque foram formalizadas de uma vez, retroativamente, na Sprint de congelamento do RC1. Novos ADRs a partir de agora seguem o formato NNNN acima, em arquivos próprios — `decisions.md` não ganha novas entradas D9, D10, etc.; ele permanece como o registro fundacional do RC1, e os ADRs numerados são o mecanismo daqui para frente.

---

*Referências: `docs/architecture/rfc-process.md` (o que precede um ADR), `docs/architecture/decisions.md` (o precedente de formato e as 8 decisões fundacionais), `docs/architecture/architecture-freeze-rc1.md` (o que um ADR pode estar alterando).*
