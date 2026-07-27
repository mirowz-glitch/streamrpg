# Gold Architecture — Plano de Preparação (para a Sprint "Gold Architecture")

**Status:** 🚧 Preparação — nenhuma funcionalidade econômica foi implementada a partir deste documento. Escrito ao final da Sprint "City Foundation Phase I", que deu aos prédios (Mercador, Ferreiro, Alquimista, Banco) um papel narrativo claro sem nenhuma transação real — e documentou, prédio por prédio, o que cada um vai precisar do Ouro quando essa Sprint chegar.

Este documento não implementa nada. Responde, conforme pedido pelo Entregável 8 da Sprint anterior, as 6 perguntas mínimas de arquitetura de Economia — pra que a Sprint "Gold Architecture" comece direto na implementação, sem reabrir a decisão conceitual.

---

## 0. A decisão já congelada — ponto de partida, não uma pergunta em aberto

Uma decisão arquitetural sobre Ouro já foi tomada e congelada antes desta preparação (2026-07-02, ver memória "Gold ownership decision"): **Ouro não é uma coisa só — divide-se em dois problemas com donos diferentes.**

- **Emissão** (conceder Ouro — ex.: ao concluir uma expedição, derrotar um Chefe) é estruturalmente idêntica a conceder XP: ninguém disputa esse Ouro, não há corrida. **Dono: a Engine**, do mesmo jeito que XP já é.
- **Ledger/gasto** (debitar Ouro numa compra, com risco real de corrida — duas compras concorrendo pelo mesmo saldo) precisa de garantias síncronas/atômicas/transacionais. **Dono: NÃO é o EventBus** (fire-and-forget, sem propagação de erro — correto pra emissão, errado pra "conferir saldo, debitar, creditar item, atomicamente, desfazer se falhar").

Esta Sprint de preparação não reabre essa decisão — só a aplica concretamente às 6 perguntas abaixo.

## 1. O que já existe hoje (auditoria real, não hipotética)

- **Emissão real e funcional**: `POST /api/character/adventure/gold` (`apps/api/src/routes/character.ts`) — reaproveita `characterRepository.grantGold()`, só soma (`Math.max(0, ...)`), chamado pelo `persistTick()` do motor de Aventura sempre que uma sessão ganha ouro. Já segue exatamente o padrão "Engine-side, grant-only" que a decisão congelada pede pro lado de emissão.
- **Nenhuma rota de gasto existe** — confirmado nesta auditoria: nenhuma rota subtrai Ouro em lugar nenhum de `apps/api`.
- **`characters.gold`** é hoje só uma coluna simples, sem tabela de transações/ledger, sem controle de concorrência.
- **City Foundation Phase I** já documentou, prédio por prédio, o que vai depender de Ouro (ver Seção 3 abaixo — reaproveitado diretamente daquela Sprint, nenhuma repetição de análise).

## 2. Como o ouro será obtido?

Sem mudança na Engine: continua exatamente como já funciona — `AdventureSession`/`Presentation Layer` concede Ouro por eventos reais (loot, conclusão de expedição, Chefe derrotado), e a Adventure Session persiste via `POST /api/character/adventure/gold`, chamando `grantGold()`. Nenhuma nova fonte de emissão precisa ser inventada — o único trabalho real da Sprint futura aqui é, na melhor das hipóteses, dar a esse grant-only um registro auditável (ver Seção 4), nunca mudar COMO o Ouro é concedido.

## 3. Onde será armazenado?

`characters.gold` continua sendo o saldo atual (fonte da verdade pro "quanto eu tenho agora") — nenhuma mudança aqui, é simples e já funciona pro lado de emissão. O que precisa ser ADICIONADO (nunca substituído) é uma tabela de transações (`gold_transactions` ou nome equivalente: `character_id, delta, reason, created_at`) que registra CADA emissão e CADA gasto individualmente — não pra recalcular o saldo a partir dela (isso seria reconstruir estado a partir de fatos, um padrão já identificado como "hipótese, não implementar sem evidência" nesta linha de memória do projeto), só pra auditoria e debug ("por que meu saldo mudou de X pra Y").

## 4. Como será persistido?

- **Emissão**: continua exatamente como hoje — uma escrita simples, sem necessidade de transação (`grantGold`, soma pura, sem condição de corrida real).
- **Gasto**: precisa de uma transação SQL única (`BEGIN`/`COMMIT`/`ROLLBACK`, já suportado por `node:sqlite`) que: (1) lê o saldo atual, (2) confirma que é suficiente, (3) debita, (4) credita o efeito da compra (item/upgrade/reputação), tudo atomicamente — nunca dois passos separados que possam ser intercalados por uma segunda requisição concorrente. Esta é a única peça genuinamente NOVA que a Sprint futura precisa construir; não existe hoje em lugar nenhum do código.

## 5. Quais transações utilizarão ouro?

Direto do que City Foundation Phase I já documentou por prédio (Fase 8, nenhuma repetição de análise):

| Prédio | Ação | Depende de |
| --- | --- | --- |
| Mercador | Comprar | Ouro (jogador paga) |
| Mercador | Vender | Ouro (jogador recebe) |
| Mercador | Avaliar item | Grátis (só leitura) |
| Ferreiro | Reforjar/upgrade | Ouro (+ possivelmente materiais/sucata, decisão de uma Sprint de Ferreiro dedicada) |
| Ferreiro | Consultar equipamento | Grátis (já existe hoje) |
| Alquimista | Poções/receitas | Provavelmente materiais, não necessariamente Ouro — decisão de uma Sprint de Alquimia futura, fora do escopo deste documento |
| Banco | Consulta | Grátis (já existe hoje) |
| Banco | Armazenamento extra futuro | Ouro ou reputação, a definir quando existir uma necessidade real (mochila com limite sentido já implementado, Backpack Experience Phase I) |

## 6. Como evitar duplicações e inconsistências?

- **Um único ponto de escrita pro gasto** — toda dedução de Ouro passa por UMA função/serviço (`spendGold()` ou equivalente), nunca SQL solto espalhado por rotas diferentes (o mesmo problema que a decisão congelada já apontou em `applyPing()` — Ouro tangled dentro de uma rota que também escreve outras tabelas).
- **Idempotência** — qualquer chamada de gasto que possa ser reenviada (retry de rede, duplo clique) precisa de uma chave de idempotência (ex.: um id de transação gerado no cliente, checado antes de debitar de novo).
- **Nunca ler-modificar-escrever em passos separados** — a transação da Seção 4 é o mecanismo que evita a corrida (dois cliques "comprar" ao mesmo tempo nunca devem conseguir gastar mais ouro do que o jogador tem).

## 7. Como integrar Economia, Mercador, Ferreiro e futuras mecânicas sem alterar a Engine de exploração?

O lado de GASTO vive inteiramente em `apps/api` (rotas + um novo serviço transacional) — nunca em `packages/shared`. A Engine de exploração (Combate/Loot/XP/AutoEquip/Dungeon/Boss, todos protegidos por todas as Sprints anteriores) continua só CONCEDENDO Ouro exatamente como já faz hoje, nunca sabendo que existe um Mercador, um saldo, ou uma transação de compra — a mesma separação que já existe entre "o motor concede XP" e "a UI mostra XP", agora aplicada a Ouro. Isso significa que a Sprint Gold Architecture pode ser implementada inteiramente em `apps/api`/`apps/web`, sem tocar em nenhum arquivo de `packages/shared`.

## 8. O Que NÃO Fazer Nesta Preparação

- Não implementar a tabela `gold_transactions`, o serviço de gasto transacional, ou nenhuma rota de compra/venda.
- Não decidir os valores/preços de nenhuma transação — isso é uma decisão de Economia/Balance, não de arquitetura.
- Não tocar Ferreiro/Mercador/Alquimista/Banco além do que City Foundation Phase I já fez (papel narrativo, sem transação).
- Não alterar `packages/shared` — o lado de emissão já está correto e intocado.

---

*Referências: memória "Gold ownership decision" (2026-07-02, congelada); `docs/design/city-foundation-phase1.md` (papéis dos prédios); `docs/design/idle-experience-redesign.md` Seção 7 (Cidade) e Seção 13 (Sprint 4, Functional City); `commercial/roadmap/project-valuation-roadmap.md` Seção 8.*
