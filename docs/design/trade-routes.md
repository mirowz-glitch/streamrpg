# Trade Routes

**Status:** 🚧 Preparação — conceitual, nenhuma implementação. Parte da Sprint "Foundation Refactor".

## 1. O problema que este documento resolve

Sem um mercado inter-Reino, "vocação econômica" é decoração sem consequência — um Reino de mineração e um Reino de alquimia nunca precisam um do outro. Este é o pilar que faltava nas revisões anteriores: transforma o mundo de "N Reinos paralelos e independentes" em uma rede econômica interdependente, que é, honestamente, o que faz um mundo parecer um mundo em vez de N cópias do mesmo jogo lado a lado.

## 2. Vocação, não exclusividade

Cada Reino desenvolve identidade econômica (mineração, alquimia, comércio, caça, agricultura) — nunca recursos exclusivos. Vocação é sobre onde é **mais vantajoso** fazer algo, nunca sobre onde é a **única forma** de fazer algo. Um Reino de mineração dá materiais mais baratos/mais rápidos ali, mas nunca é a única fonte — preservando a promessa idle-solo (um jogador nunca fica travado por não ter acesso a um Reino específico) enquanto ainda cria motivo real para Reinos comercializarem entre si.

Vocação emerge organicamente do que os cidadãos mais praticam ali — não é decretada por design no momento da fundação do Reino. Um Reino pode até mudar de vocação ao longo dos anos, conforme sua população muda de comportamento — mais um elemento de história viva (`world-foundation-4.0.md`).

## 3. Rota Comercial — o mecanismo

Cidadãos podem levar recursos de um Reino para vender em outro **fisicamente, através de uma expedição real** — não um botão de teletransporte instantâneo. Isso reaproveita o sistema de Expedições já existente (`packages/shared` — origin/destination/progress) em vez de inventar um segundo mecanismo de "viagem" paralelo. O lucro vem da diferença de preço local entre Reinos, causada pela diferença de vocação.

## 4. Por que isso deveria reaproveitar o Economy Core, não criar uma segunda economia

Preço local por Reino é uma variação de apresentação/cálculo sobre o mesmo `ResourceId` já existente (materials, gold) — nunca uma segunda moeda. Um jogador levando materiais do Reino de mineração para vender no Reino de alquimia continua movimentando o mesmo saldo pessoal de `materials`/`gold` que já existe hoje; o que muda é só o preço de compra/venda local, não o tipo de recurso.

**Recomendação explícita**, resolvendo uma tensão que o documento anterior (World Design 3.0) só nomeou sem decidir: manter **uma moeda universal** (gold/materials continuam sendo os mesmos, não importa o Reino), com **preços/mercados locais variando por vocação** — em vez de um sistema de câmbio/moeda-por-Reino. A alternativa (moeda própria por Reino, câmbio entre elas) adiciona uma camada de complexidade genuína (taxas de câmbio, arbitragem, inflação regional) que não parece justificada para o estágio atual do jogo — mas fica nomeada aqui como alternativa considerada e descartada, não silenciosamente ignorada.

## 5. O que isso não é

Não é um sistema de logística/transporte com risco de perda de carga, escolta, ou PvP em rota — isso poderia vir depois, como uma camada de profundidade opcional, mas não é núcleo desta fase. O núcleo é só: vocação real + diferença de preço real + expedição real como o meio de aproveitar essa diferença.

---

*Referências: `kingdom-domain-2.0.md` (vocação como parte do crescimento de um Reino); `kingdom-treasury.md` (se rotas comerciais tributarem o Reino); a revisão "World Design 3.0" desta sessão (onde este pilar foi identificado como lacuna, não como parte do documento original).*
