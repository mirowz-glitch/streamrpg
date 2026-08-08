# Citizen System

**Status:** 🚧 Preparação — conceitual, nenhuma implementação. Parte da Sprint "Foundation Refactor".

## 1. O problema que este documento resolve

Hoje, `kingdom-prestige.service.ts` define pertencimento a um Reino como "ter uma linha em `viewer_sessions` ou `channel_rankings`" — ou seja, **ter assistido**. Este documento substitui essa definição por uma baseada inteiramente em jogo real, nunca em audiência.

## 2. Os cinco estágios

Cidadania não é um número — é um percurso com portões, cada portão exigindo um tipo de prova diferente.

```
Visitante → Residente → Cidadão → Veterano → Lenda
```

**Visitante.** Qualquer personagem que jogue no Reino, sem compromisso — pode explorar, comerciar, visitar. Zero obrigação, zero direito além do acesso.

**Residente.** Declarou aquele Reino como residência atual (equivalente ressignificado de `character.primary_channel_id`). Ganha acesso a mecânicas locais mais profundas (comprar propriedade ali, por exemplo). Reversível a qualquer momento, sem penalidade — mudar de residência é sempre permitido.

**Cidadão.** Residência sustentada por um período mínimo, mais alguma contribuição real mensurável: impostos pagos, expedições completadas partindo dali, presença de personagem — nunca audiência de stream. É aqui que o jogador começa a acumular as métricas que alimentam os cargos de prestígio existentes (Guardião, Herói do Reino etc.).

**Veterano/Pilar.** Cidadania sustentada por muito tempo, com contribuição consistentemente alta. Ganha reconhecimento visível — talvez elegibilidade para cargos de liderança em modelos eleitos, prioridade em decisões coletivas, título cosmético permanente.

**Lenda.** O jogador cuja Crônica pessoal se cruzou com a Crônica do Reino de forma marcante o suficiente para ser citado na própria história dele ("o Reino venceu 17 guerras, 3 lideradas por [nome]"). Este estágio nunca é atingido por métrica automática pura — é resultado de eventos reais acontecendo (guerras, marcos, feitos únicos), não de grind.

## 3. Por que estágios, não uma fórmula única

Um jogador casual que nunca vai virar Guardião não é um fracasso de design — ele pode, sem drama, ficar para sempre em Residente ou Cidadão, e isso ainda é uma relação válida e recompensadora com o Reino. O percurso em estágios evita a armadilha de tratar cidadania como corrida — trata como uma relação que aprofunda com o tempo, como uma comunidade real.

## 4. Migração entre Reinos

Um personagem pode mudar de Reino de residência ao longo da vida, sem penalidade dura — isso apenas reinicia o relógio de cidadania no novo Reino, sem apagar o que ele construiu no antigo (que continua registrado como história dele naquele lugar, permanentemente, mesmo depois de partir).

## 5. Métricas candidatas por estágio (ilustrativas, não calibradas)

| Estágio | Sinal principal |
|---|---|
| Residente | Declaração explícita de residência |
| Cidadão | Tempo de residência + ao menos um sinal de contribuição real (imposto pago, expedição completada, Boss enfrentado) |
| Veterano | Tempo de cidadania sustentado + contribuição consistente acima da média do Reino |
| Lenda | Evento único e citável (nunca automático puro) |

Mesma honestidade de todo valor não calibrado do projeto: os limiares exatos são decisão de balanceamento futura, não arquitetura.

## 6. Risco explícito — cidadania como alvo de exploit

"Presença", "sequência de dias", "expedições completadas" são exatamente o tipo de métrica que scripts automatizados sabem otimizar melhor que humanos — a mesma categoria de risco já registrada no audit de Exploits do Platform Phase ("multi-tab, bots, alt accounts"). Cidadania precisa herdar essa mesma vigilância quando for implementada, não ser tratada como um domínio novo e ingênuo.

---

*Referências: `kingdom-domain-2.0.md`; `world-foundation-4.0.md` Seção 2.3 (a auditoria do `kingdom-prestige.service.ts` atual); `long-term-retention.md` (como cidadania se conecta a retenção de longo prazo).*
