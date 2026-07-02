# Atomic Update Guideline

**O que isto é:** o registro de uma lição aprendida na Sprint P1
(Gold race + Welcome Reward race, 2026-07-02). **Não é um padrão
obrigatório, não é uma abstração.** O objetivo único é: daqui a seis
meses, ninguém escreve o mesmo bug de novo por não lembrar que ele já
aconteceu.

---

## Como reconhecer o formato de risco

A sequência sempre tem esta forma:

```
SELECT (lê um valor)
   ↓
await (qualquer ponto que cede controle — rede, outra Promise)
   ↓
UPDATE (escreve algo CALCULADO em JavaScript a partir do valor lido)
```

O sinal de alerta específico não é "existe um await na função" — é
**o valor escrito depender de um valor lido antes do await**, calculado
fora do banco, e não recalculado dentro do próprio `UPDATE`.

## Quando isso representa risco real

Só quando as duas coisas são verdadeiras ao mesmo tempo:

1. Existe pelo menos um `await` genuíno entre a leitura e a escrita
   (I/O real — rede, disco, outra chamada assíncrona).
2. A mesma linha pode ser tocada por uma segunda chamada concorrente
   antes da primeira terminar (duplo clique, duas abas, retry de rede,
   duas sessões quase simultâneas do mesmo personagem).

**Contraste seguro, encontrado no próprio projeto:**
`CharacterRepository.applyXP()` também lê e escreve `characters`, mas
não tem nenhum `await` entre a leitura e a escrita — é inteiramente
síncrono por baixo (`node:sqlite` bloqueia a única thread do processo
durante cada chamada). Por isso XP nunca teve esse bug e Gold teve:
aparência parecida, garantia diferente por baixo. **A pergunta certa
não é "essa função é async?" — é "existe algum await entre o read e o
write desta função especificamente?"**

## Quando um UPDATE atômico resolve

Quando a operação toca **uma linha, de uma tabela**, e o resultado final
pode ser expresso inteiramente dentro da própria instrução SQL — nunca
calculado em JavaScript a partir de uma leitura anterior.

Os dois casos reais desta Sprint:

- **Gold** (`apps/api/src/services/xp.service.ts`) — incremento:
  `UPDATE characters SET gold = gold + ? WHERE id = ?`
- **Welcome Reward** (`SQLiteCharacterRepository.markWelcomeRewardGranted`)
  — conquista condicional:
  `UPDATE characters SET first_join_reward_at = ? WHERE id = ? AND first_join_reward_at IS NULL`,
  retornando se a linha foi realmente afetada (`changes > 0`), pra quem
  chamou saber se foi ele quem reivindicou ou se alguém chegou primeiro.

## Quando um UPDATE atômico NÃO resolve

Quando a operação precisa mudar **mais de uma tabela, ou mais de uma
linha, como uma coisa só** — tudo com sucesso, ou nada.

Exemplo concreto e já previsível: uma compra no Marketplace precisaria,
ao mesmo tempo, debitar Gold do comprador (`characters`), creditar Gold
do vendedor (outra linha de `characters`), transferir o item
(`character_items`), talvez decrementar estoque, e registrar a transação
(uma tabela de log). Um único `UPDATE col = col + ?` protege **uma**
dessas partes — não impede, por exemplo, debitar o comprador e falhar ao
entregar o item.

Isso exige uma transação de verdade (`BEGIN`/`COMMIT`/`ROLLBACK`), não o
truque de uma instrução isolada. É uma ferramenta estruturalmente
diferente da usada nesta Sprint, não "a mesma técnica, só que maior".

O projeto não usa transações multi-statement em nenhum lugar hoje — isso
não é uma dívida a resolver agora, é conhecimento a aplicar quando
Marketplace/Economia 1.0 forem desenhados de verdade.

## O que este documento não é

Não vira Lock Manager, Mutex, Helper genérico, camada de transação, ou
"Atomic Repository". Nenhuma dessas abstrações tem consumidores reais
suficientes hoje — só dois casos concretos (Gold, Welcome) e um caso
futuro hipotético (Marketplace). Revisitar esta pergunta quando/se
Marketplace realmente precisar de transação multi-tabela — não antes.
