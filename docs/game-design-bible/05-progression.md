# 5. Progressão

**Status:** ✅ Estável

Progressão pertence ao Character (princípio 1). Estado atual:

- **XP, Level, Welcome Reward e Drop** são concedidos exclusivamente pela
  Engine (`XPSystem`, `WelcomeRewardSystem`, `DropSystem` via `EventBus`) —
  Marco 1.0, alcançado na Sprint E4.
- **Gold** é a única exceção deliberada: ainda concedido pelo caminho legado
  (`applyPing()`), não migrado para a Engine.
- Cadência: 1 ping por minuto (cooldown), Engine processa em ticks de 60s.

## Débito conhecido: feedback de UI (UI-001)

Os popups de "Level up!" e "Drop: X" na tela do personagem não refletem mais
a realidade — progressão agora é concedida de forma assíncrona (via tick),
desacoplada da resposta HTTP do ping. O dado não é perdido (XP/level/itens
continuam corretos no banco e reaparecem ao recarregar o personagem); falta
só um mecanismo de notificação. Rastreado como task em background, não
bloqueia nenhuma feature nova.

## Bug conhecido: RNG compartilhado

Ver capítulo 10 (Economia) — o bug torna impossível qualquer raridade de
item além de `common`. Correção adiada para a Economia 1.0, não deve ser
corrigida isoladamente antes disso.

## Dependências

Progressão depende de:
- Princípios permanentes (progressão pertence ao Character)
- Personagens (XP/level/gold são atributos do Character)
