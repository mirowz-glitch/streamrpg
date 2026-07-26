# 11. False Positive Prevention

Regras para evitar que a análise de um ciclo chegue a uma conclusão precipitada — um "achado" que parece um padrão real, mas na verdade é ruído, viés de um perfil específico, ou um problema de ambiente sem relação com o produto.

## Opinião isolada

**Risco**: um comentário bem articulado de um único participante parece mais importante do que é, só porque foi dito com convicção ou detalhe.
**Tratamento**: nunca promovida sozinha (ver [Evidence Rules](09-evidence-rules.md#quando-um-comentário-individual-pode-gerar-uma-ação)). Fica em "Problemas Isolados" no [Modelo de Consolidação](06-consolidation-template.md) até (e a menos que) reapareça em ciclos futuros.

## Jogador muito experiente

**Risco**: um jogador de ARPG veterano acha algo "fácil demais" ou "óbvio demais" porque já internalizou convenções do gênero que um público mais amplo não tem — sua régua de dificuldade/clareza não representa a maioria dos [Tester Profiles](01-goals-and-profiles.md#tester-profiles) prioritários.
**Tratamento**: registrar a observação, mas rebaixar a Confiança da Evidência para Média/Baixa (ver [Priority Matrix](10-priority-matrix.md#critério-de-confiança-da-evidência)) quando o mesmo achado não aparece em perfis casuais/sem experiência prévia. Se um achado de dificuldade/clareza vem SÓ de jogadores experientes, tratar como sinal de segmentação de público (ver "Divergências" no Modelo de Consolidação), não como problema universal.

## Jogador completamente iniciante

**Risco simétrico ao anterior**: alguém sem nenhuma experiência prévia em jogos pode se confundir com convenções básicas do meio (ex: não saber que um ícone de coração significa vida), o que não é um problema do StreamRPG especificamente — é ausência de alfabetização em jogos, fora do escopo de correção do produto.
**Tratamento**: distinguir na Ficha de Observação se a confusão é sobre uma convenção universal de jogos (fora de escopo) ou sobre algo específico do StreamRPG (dentro de escopo, ex: não entender o que é "Checkpoint de Expedição", um termo próprio do jogo). Só o segundo tipo conta como achado válido de onboarding.

## Erro causado por bug temporário

**Risco**: uma sessão trava ou se comporta de forma anômala por causa de um problema de ambiente (conexão instável, navegador incompatível, servidor de dev fora do ar), não por um problema real do produto.
**Tratamento**: se o moderador suspeitar de causa técnica externa durante a sessão, registrar isso explicitamente na Ficha de Observação no momento (não reconstruir a suspeita depois, de memória). Na Consolidação, achados com essa suspeita entram com Confiança **Baixa** e nunca contam para o limiar de frequência de um padrão, a menos que o mesmo comportamento se repita em participantes com ambientes/condições diferentes (o que descartaria a hipótese de ser só ambiente).

## Regra geral de desempate

Quando houver dúvida sobre se um achado é real ou um falso positivo, a decisão correta nunca é "assumir que é real, por precaução" nem "descartar, por segurança" — é **registrar como observação de baixa confiança e esperar o próximo ciclo confirmar ou refutar**, seguindo [Roadmap Integration](07-roadmap-integration.md#quando-um-achado-deve-apenas-ser-registrado). O tempo entre ciclos é a própria ferramenta de validação — não precisa ser resolvido no calor do primeiro ciclo.

Ver também: [Priority Matrix](10-priority-matrix.md), [Cross Validation](12-cross-validation.md), [Evidence Rules](09-evidence-rules.md).
