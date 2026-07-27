# Governança Técnica — StreamRPG

**Status:** 🟢 Canônico. Documento guarda-chuva escrito ao final da Sprint "Engineering Standards & RFC Process" — reúne, sem duplicar conteúdo, todos os processos formalizados nesta Sprint. Se você só vai ler um documento de processo, seja este; ele aponta para todos os outros.

## O Princípio

"Arquitetura evolui por decisão consciente. Nunca por acidente." (Princípio Fundamental desta Sprint.) Toda a governança abaixo existe para tornar isso operacional, não só aspiracional.

## Os Seis Processos

### 1. RFC Process — `docs/architecture/rfc-process.md`
Como uma mudança arquitetural relevante é PROPOSTA. Obrigatório quando a mudança se enquadra em um dos 6 gatilhos (mover regra de gameplay para fora da Engine, criar segundo estado compartilhado, dar a React poder de decisão de jogo, acoplar `apps/api`↔`apps/web`, enfraquecer Browser Validation, reescrever camada congelada). Toda Sprint de feature normal opera livremente DENTRO da arquitetura congelada sem precisar de RFC.

### 2. ADR — `docs/architecture/adr-template.md`
Como uma decisão (vinda de um RFC aceito, ou tomada organicamente durante uma Sprint) é REGISTRADA permanentemente. Numerados sequencialmente (`docs/architecture/adr/NNNN-titulo.md`), nunca apagados, só marcados como superados.

### 3. Git Workflow — `docs/process/git-workflow.md`
Como o código realmente se move: `main` (estável) ← `release/*` (marco em estabilização, ex.: `release/vertical-slice-rc1`) ← `sprint/*` (feature isolada, quando necessário). Tags marcam congelamentos oficiais — prática que existia informalmente (commits de "freeze") mas nunca foi tagueada; corrigido a partir de agora.

### 4. Code Review Checklist — `docs/process/code-review-checklist.md`
O que se confere em toda PR, além da qualidade normal de código — cada pergunta do checklist existe porque uma das 8 decisões congeladas (`docs/architecture/decisions.md`) já identificou aquele risco específico antes.

### 5. Definition of Done — `docs/process/definition-of-done.md`
Os 7 critérios mínimos (typecheck, testes, build, Browser Validation, documentação, compatibilidade, ausência de regressão conhecida) que precisam ser verdade — verificados, não presumidos — antes de qualquer Sprint ser considerada concluída.

### 6. Templates — `docs/process/pull-request-template.md` e `docs/process/sprint-template.md`
O formato padrão de uma PR (Resumo/Escopo/Fora do escopo/Arquivos/Compatibilidade/Testes/Browser Validation/Próximos Passos) e de uma Sprint inteira (Objetivo/Contexto/Escopo/Fora do Escopo/Fases/Critérios/Entregáveis/Compatibilidade/Browser Validation) — ambos formalizando um formato que já era seguido na prática desde o início do RC1.

## Como as peças se encaixam

```
Uma mudança é proposta
     ↓
Ela viola uma regra congelada? (docs/architecture/architecture-freeze-rc1.md)
     ↓ sim                                  ↓ não
Escrever RFC                       Segue como Sprint normal
(rfc-process.md)                   (sprint-template.md)
     ↓
Aceito?
     ↓ sim                    ↓ não
Criar ADR                Arquivado, sem
(adr-template.md)         implementação
     ↓
Implementar via Sprint
(sprint-template.md)
     ↓
Definition of Done
(definition-of-done.md)
     ↓
Abrir PR
(pull-request-template.md)
     ↓
Code Review
(code-review-checklist.md)
     ↓
Merge
(git-workflow.md)
```

## Responsabilidades

Este projeto não opera com papéis formais separados (arquiteto vs. desenvolvedor vs. revisor) — quem conduz uma Sprint é responsável por seguir o processo acima integralmente, incluindo a autorrevisão contra o Code Review Checklist antes de considerar o trabalho pronto. A ausência de um comitê formal não dispensa o rigor do processo — só significa que ele é aplicado pela mesma pessoa/equipe em papéis diferentes, em momentos diferentes (proponente ao escrever o RFC, revisor ao aplicar o checklist).

## Quando este documento muda

Este documento (e os seis que ele referencia) são, eles mesmos, arquitetura de PROCESSO, não de código — mudanças aqui não precisam de RFC no sentido de `docs/architecture/rfc-process.md` (que é sobre arquitetura de sistema), mas deveriam, no mínimo, ser propostas com a mesma honestidade de motivação/alternativas que um RFC exige, dado que todo o resto do processo depende deste documento estar correto.

---

*Referências: todos os seis documentos de processo linkados acima; `docs/architecture/architecture-freeze-rc1.md` (o que este processo protege); `docs/roadmap.md` (as próximas Sprints que vão operar sob este processo, a partir de Economy Core).*
