# RFC Process — Mudanças Arquitetônicas

**Status:** 🟢 Canônico. Escrito na Sprint "Engineering Standards & RFC Process", imediatamente após o congelamento do RC1 (`docs/architecture/architecture-freeze-rc1.md`). Este documento formaliza o mecanismo que aquele já havia anunciado ("exige RFC") sem detalhar o processo em si — este é o detalhe.

## Quando um RFC é obrigatório

Um RFC é necessário sempre que uma mudança proposta se enquadra em pelo menos um dos gatilhos já listados em `docs/architecture/architecture-freeze-rc1.md`:

1. Move uma regra de gameplay para fora de `packages/shared` (ou cria uma segunda cópia dela em outro lugar).
2. Introduz um segundo mecanismo de estado compartilhado entre telas.
3. Permite que um componente React decida um resultado de jogo, não só apresente um já decidido.
4. Faz `apps/api` e `apps/web` importarem um do outro.
5. Remove ou enfraquece a obrigatoriedade de Browser Validation para alguma classe de mudança.
6. Propõe reescrever uma camada inteira já congelada, em vez de estendê-la.

Uma Sprint de FEATURE normal — incluindo Economy Core, Merchant, Blacksmith, e todo o resto do roadmap (`docs/roadmap.md`) — **não precisa de RFC** para trabalhar dentro das partes congeladas. RFC é para mudar a REGRA, não para usá-la.

## O Fluxo Oficial

```
Identificar gatilho (lista acima)
     ↓
Escrever o RFC (formato abaixo)
     ↓
Revisão — confronto com docs/architecture/decisions.md e overview.md
     ↓
Decisão: Aceito / Rejeitado / Precisa de mais informação
     ↓
Se aceito: gera um ADR (docs/architecture/adr-template.md) registrando a decisão
     ↓
Implementação segue o Plano de Migração do próprio RFC
     ↓
docs/architecture/architecture-freeze-rc1.md é atualizado (o item muda de CONGELADA para o novo estado)
```

Um RFC nunca é implementado antes de virar um ADR aceito — o ADR é o registro permanente da decisão; o RFC é o documento de proposta que a originou (podendo, inclusive, ser rejeitado sem nunca gerar um ADR).

## Formato Obrigatório de um RFC

Todo RFC deve conter, nesta ordem, as 8 seções abaixo. Um RFC incompleto (faltando qualquer seção) não deve ser considerado pronto para revisão.

### 1. Problema
O que hoje não funciona, não escala, ou impede o próximo trabalho — descrito com evidência concreta (um caso real, uma limitação medida), nunca com preferência estética ("seria mais elegante se...").

### 2. Motivação
Por que resolver isso agora, e por que a arquitetura atual não é suficiente — deve referenciar explicitamente qual decisão congelada (`docs/architecture/decisions.md`) está sendo questionada, e por quê ela deixou de servir.

### 3. Alternativas Consideradas
Toda alternativa real avaliada, incluindo explicitamente **"não mudar nada"** como uma das opções — um RFC que não considerou o custo de não agir não demonstrou que a mudança é necessária.

### 4. Impacto Esperado
O que melhora, quantificado sempre que possível (não "fica mais rápido", mas "elimina N chamadas duplicadas" ou equivalente) — e o que piora ou fica mais complexo como efeito colateral aceito.

### 5. Compatibilidade
Quais Sprints/sistemas anteriores dependem da regra atual (blast radius) e como cada um é afetado. Se a resposta for "nenhum", isso deve ser demonstrado (não assumido) — buscar por usos reais do que está sendo mudado.

### 6. Estratégia de Migração
Como a mudança é aplicada sem quebrar o que já existe — mantendo o princípio de arquitetura incremental (D7, `docs/architecture/decisions.md`) mesmo para o próprio processo de mudar a arquitetura. Migração "big bang" (trocar tudo de uma vez, sem etapa intermediária) deve ser justificada explicitamente, nunca ser o padrão default.

### 7. Plano de Rollback
Como reverter a mudança se ela se provar errada depois de parcialmente aplicada — se não houver rollback possível (ex.: uma migração de schema já aplicada em produção), isso deve ser dito explicitamente como um risco assumido, não omitido.

### 8. Critérios de Aceitação
O que precisa ser verdade para considerar o RFC bem-sucedido — específico e verificável (testes passando, uma métrica movendo na direção esperada, Browser Validation cobrindo o novo fluxo), nunca "parece certo".

## Quem decide

Este projeto não tem um comitê de arquitetura formal — a decisão de aceitar/rejeitar um RFC é do desenvolvedor/equipe conduzindo o projeto, usando o RFC como ferramenta de raciocínio explícito, não como burocracia para atrasar uma decisão que já seria óbvia. Um RFC que responde às 8 seções acima com honestidade já cumpriu sua função mesmo que a decisão final seja tomada em uma frase.

## Relação com ADRs

RFC é o documento de PROPOSTA (pode ser rejeitado, pode gerar debate, é descartável). ADR (`docs/architecture/adr-template.md`) é o documento de REGISTRO (permanente, nunca é apagado, só marcado como superado por um ADR posterior). Todo RFC aceito gera exatamente um ADR; nem todo RFC vira um ADR (RFCs rejeitados não geram registro formal, só ficam arquivados como histórico, se preservados).

---

*Referências: `docs/architecture/architecture-freeze-rc1.md` (o que exige este processo), `docs/architecture/decisions.md` (o que um RFC está, na prática, propondo alterar), `docs/architecture/adr-template.md` (o registro que resulta de um RFC aceito).*
