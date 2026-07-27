# Pull Request Template — StreamRPG

**Status:** 🟢 Canônico. Formato oficial para toda PR a partir desta Sprint. Cada seção abaixo é obrigatória — uma PR sem alguma delas não está pronta para revisão.

## Template

```markdown
## Resumo
Uma a três frases: o que esta PR faz e por quê (a motivação, não só a
descrição mecânica da mudança).

## Escopo
O que esta PR efetivamente entrega — lista objetiva, não aspiracional.

## Fora do escopo
O que foi deliberadamente deixado de fora (e por quê, se não for óbvio).
Evita o revisor perguntar "por que você não fez X" quando X já foi uma
decisão consciente de não fazer nesta PR.

## Arquivos Alterados
Lista de arquivos tocados, com uma frase por arquivo (ou grupo de
arquivos relacionados) explicando a responsabilidade da mudança —
não é suficiente listar caminhos, cada um precisa de contexto de
por que foi alterado.

## Compatibilidade
Confirmação explícita, sistema por sistema, de que nada relevante
regrediu (mesmo formato usado em toda Sprint do RC1: "Combate não
mudou. Loot não mudou..."). Se esta PR TEM a intenção de mudar
comportamento existente, isso deve estar aqui, marcado como
intencional, não descoberto na revisão.

## Testes
- Testes novos adicionados (arquivo + o que cobrem).
- Resultado da suíte completa (não só os testes novos) — número de
  testes, passou/falhou.
- Typecheck: limpo ou não.
- Build: limpa ou não.

## Browser Validation
Fluxo de navegação testado, passo a passo, com resultado observado
em cada passo relevante — não "testei e funcionou", mas o que
especificamente foi clicado/observado. Se a mudança não é
visível/navegável (ex.: uma mudança puramente de Engine sem
superfície de UI), declarar isso explicitamente em vez de omitir a
seção.

## Próximos Passos
O que esta PR deliberadamente prepara para uma Sprint futura (um
documento de preparação escrito, um ADR pendente, uma decisão
adiada) — o mesmo padrão de "preparação para a próxima Sprint" já
usado em todo relatório de Sprint do RC1.
```

## Por que este formato

Cada seção existe para responder a uma pergunta que um revisor (humano ou uma sessão futura) precisaria fazer de qualquer forma — o template só torna essas perguntas explícitas de antemão, em vez de forçar uma rodada de comentários de revisão para extraí-las depois. "Fora do escopo" e "Próximos Passos" em particular vêm diretamente do padrão que toda Sprint do RC1 já seguia nos relatórios finais (`docs/design/*-phase1.md`) — esta PR só aplica o mesmo hábito ao nível de commit/PR, não só ao nível de Sprint inteira.

## Relação com Definition of Done

Uma PR só deveria ser aberta depois que `docs/process/definition-of-done.md` já foi satisfeito localmente — o template acima é como isso é COMUNICADO ao revisor, não um substituto para realmente ter feito o trabalho.

---

*Referências: `docs/process/definition-of-done.md` (o que precisa estar verdadeiro antes de abrir a PR), `docs/process/code-review-checklist.md` (o que o revisor confere ao ler esta PR), `docs/process/git-workflow.md` (onde esta PR se encaixa no fluxo de branches).*
