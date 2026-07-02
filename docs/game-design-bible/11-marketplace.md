# 11. Marketplace

**Status:** 🚧 Em discussão

Ordem confirmada: Marketplace vem **depois** da Economia 1.0 (capítulo 10),
deliberadamente fora da ordem "óbvia". Marketplace é consumidor da economia,
não o contrário — quem define o valor de um item é a economia; construir o
Marketplace antes disso é montar uma vitrine sem saber quanto as coisas
valem.

## Filosofia (registrada antes da feature existir)

"O mercado tem que estar fluindo." Não tentar controlar demais: um jogador
que escolheu uma classe e se arrependeu deveria poder vender; quem quer
testar algo raro deveria conseguir comprar; quem investiu tempo num
personagem raro deveria conseguir negociar. O valor do Marketplace vem de
jogadores tomando decisões diferentes, não de regras rígidas.

## Ressalva registrada (não uma contradição)

Liquidez alta sem nenhum controle é o cenário onde manipulação de preço e
lavagem de ouro ficam mais fáceis de esconder (Exploits é uma das 5 frentes
da Auditoria de Plataforma, capítulo 12). Isso não significa controlar o
mercado — significa que essas
decisões (o que constitui manipulação, que sinais auditar) precisam ser
resolvidas na Economia 1.0, antes do Marketplace existir, não depois.

Nada mais definido (preço, taxa do reino, formato de leilão) — preencher
quando esta feature entrar em Sprint.

## Dependências

Marketplace depende de:
- Economia (define o valor dos itens antes do Marketplace existir)
- Personagens/Progressão (itens e ouro negociados pertencem ao Character)
