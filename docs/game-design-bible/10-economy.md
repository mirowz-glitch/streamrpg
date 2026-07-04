# 10. Economia

**Status:** 🚧 Em discussão

## Estado atual dos números

- `DROP_CHANCE = 0.15` (15% por ping/tick de XP).
- `RARITY_WEIGHTS`: common 60%, uncommon 25%, rare 13%, epic 1.8%,
  legendary 0.2% (proporção pretendida do peso total).
- `GOLD_PER_PING = 0.3` — único faucet de ouro hoje, ainda pelo caminho
  legado (ver capítulo 5).
- Não existe nenhum sink de item ou de ouro hoje (nada para gastar, fundir,
  ou destruir).

## Bug conhecido: RNG compartilhado (não corrigir isoladamente)

`pickRarity()` reutiliza o mesmo valor de `rng` usado no gate de
`DROP_CHANCE`. Como o gate só deixa passar `rng ≤ 0.15`, e o primeiro corte
de raridade (`common`) só termina em 60% do peso total, o valor de `rng`
nunca é grande o suficiente para ultrapassar `common`. Resultado: **hoje,
100% dos drops resolvem como `common`** — não é desbalanceamento, é
impossibilidade matemática com os parâmetros atuais.

Decisão registrada: não corrigir isso isoladamente. A correção (dois rolls
independentes) é uma decisão da Economia 1.0, junto com revisão de
`DROP_CHANCE` e pesos — corrigir o bug sozinho, sem revisar esses números
junto, arrisca trocar um problema por outro.

## Escopo da Economia 1.0 (ainda não iniciada)

RNG independente, `DROP_CHANCE`, pesos de raridade, ouro, marketplace, craft,
sinks de item, inflação, referral (Hero Token), token de classe.

## Hero Token (conceito)

Rebranding do "token de convite/referral" — representa ter trazido alguém
para o mundo do StreamRPG.

- Utilizável meses depois de obtido (não expira).
- Pode ser vendido, guardado, ou gasto numa classe exclusiva (ver capítulo
  4) — funciona como sink de economia e como ativo negociável ao mesmo
  tempo.

**Decisão fechada em `docs/design/classes-final-architecture.md`
(Etapa 8, Sprint "Classes Architecture"):** o token circula livremente no
Marketplace uma vez emitido — o controle contra referral falso acontece
na **emissão** (a conta indicada precisa atingir um limiar real de
engajamento antes do token existir), não na circulação. Ver aquele
documento para todas as 8 perguntas fechadas sobre o Hero Token (quando
usar, quantidade, raridade, venda, troca, destruição, classe exclusiva,
reset). Este capítulo continua sendo a fonte oficial do resto da
Economia (RNG, `DROP_CHANCE`, pesos, sinks) — só o Hero Token tem fonte
própria agora.

## Dependências

Economia depende de:
- Progressão (gold ainda concedido pelo caminho legado)
- Bosses (se conceder recompensas, entra diretamente no faucet de item/gold)
- Classes (Hero Token gasto em classe exclusiva)

Não depende de Marketplace — a ordem de construção (capítulo 12) exige que
a Economia esteja fechada *antes* do Marketplace existir, não o contrário.
