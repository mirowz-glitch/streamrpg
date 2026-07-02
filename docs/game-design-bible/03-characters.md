# 3. Personagens

**Status:** 🚧 Em discussão

O que existe hoje:

- Um Character tem `level`, `xp`, `gold`, `total_minutes` assistidos.
- Equipa itens em 6 slots: `weapon`, `armor`, `helmet`, `boots`, `amulet`,
  `ring`.
- Um personagem por perfil (`profile_id` único) — sem múltiplos personagens
  por conta ainda.
- Recompensa única de "boas-vindas" (Welcome Reward) na primeira presença
  detectada.

O que ainda não existe (a definir quando houver necessidade real, não por
especulação):

- Atributos além de level (força, sorte, etc.).
- Múltiplos personagens por conta.
- Identidade visual/customização do personagem.

## Dependências

Personagens depende de:
- Princípios permanentes (progressão sempre pertence ao Character)
