# Identity Core

**Status:** 🚧 Preparação — conceitual, nenhuma implementação. Parte da Sprint "Foundation Refactor". Ver `world-foundation-4.0.md` Seção 2.1 para a auditoria completa do estado atual.

## 1. O princípio

O personagem pertence ao mundo. Nunca ao streamer. Nunca ao canal. Nunca ao provedor de login que autenticou aquela sessão.

Hoje, `profiles.twitch_id NOT NULL UNIQUE` faz da identidade Twitch a própria definição de quem o jogador é — não existe hoje um caminho de criar um `profile` sem um usuário Twitch real por trás. Isso é o ponto de acoplamento mais duro de todo o codebase (mais até que Kingdom, que pelo menos já tem `owner_profile_id` nullable).

## 2. O modelo conceitual

Uma **Identidade** (`profile`) é a pessoa. Um **Vínculo de Autenticação** (login provider) é uma das possivelmente-várias formas dessa pessoa provar quem é. A relação é 1-para-N: uma Identidade pode ter zero, um, ou vários vínculos conectados (Google e Discord e Twitch, simultaneamente, todos levando à mesma conta) — nunca o inverso (um vínculo nunca pertence a mais de uma Identidade).

```
Identidade (profile)
   ├── Vínculo: Google         (opcional)
   ├── Vínculo: Discord        (opcional)
   ├── Vínculo: E-mail         (opcional)
   ├── Vínculo: Twitch         (opcional)
   ├── Vínculo: Kick           (opcional)
   └── Vínculo: YouTube        (opcional)
```

Nenhum vínculo é obrigatório sozinho — o que é obrigatório é **pelo menos um**, qualquer um.

## 3. O que já está certo e não precisa mudar

`middleware/auth.ts` — o mecanismo de sessão (cookie HTTP-only `streamrpg_session`, tabela `sessions`, resolução via `profile_id`) já não sabe nada sobre Twitch. Ele resolve `profileId` a partir de um `sessionId`, ponto final. Isso significa que **a parte mais sensível do sistema de autenticação (a sessão em si) está pronta para qualquer provedor, hoje, sem mudança nenhuma.**

O que precisa mudar é só o que acontece *antes* da sessão existir: como um `profileId` é resolvido ou criado a partir de uma prova de identidade externa.

## 4. O que muda

- `profiles` deixa de exigir uma identidade externa específica na própria criação da linha — a criação de conta e a conexão de um provedor deixam de ser o mesmo evento.
- O fluxo de "criar personagem" deixa de estar amarrado ao callback de um único provedor (`routes/auth.ts`'s `GET /api/auth/callback`, hoje o único lugar do código que cria um `character` a partir de um `profile` novo) — esse fluxo passa a ser disparado por "primeiro login bem-sucedido de qualquer provedor", não por "login Twitch especificamente".
- Dados hoje copiados diretamente do usuário Twitch para `profiles` (`username`, `avatar_url`, `email`) passam a ter uma fonte por provedor, com uma regra de precedência simples para quando há mais de um vínculo (ex.: o provedor mais recentemente conectado atualiza o perfil visível, ou o jogador escolhe explicitamente — decisão de UX, não de arquitetura).

## 5. O que não muda

Personagem, Inventário, Adventure Session, Economy Core — nenhum desses sistemas hoje lê `twitch_id` diretamente (confirmado por auditoria: só `profiles`, `streamer_channels`, e a subquery residual em `identity.service.ts` tocam esse campo). Uma vez que Identity Core resolve `profileId` corretamente, todo o resto do jogo continua funcionando exatamente como hoje — porque já é `profileId`/`character_id` que eles consomem, nunca `twitch_id`.

## 6. Consequência para Founder Identity / Titles

Alguns títulos de fundador (`titles`/`character_titles`) e a lógica de "primeiro a chegar" em `identity.service.ts` hoje derivam parcialmente de `viewer_sessions` (primeiro ping registrado). Uma vez que Identity Core existe, "primeiro a chegar" deveria ser medido por **primeiro login bem-sucedido no mundo**, independente de provedor — um jogador que criou conta via Google no dia 1 é tão fundador quanto um que criou via Twitch.

## 7. Riscos a nomear (não resolver aqui)

- **Fusão de contas** — o que acontece se alguém logar primeiro via Google, depois tentar conectar um Discord que já está vinculado a outro `profile` existente? Precisa de uma decisão explícita (bloquear, ou oferecer fusão de conta) antes da implementação — não decidido neste documento.
- **Perda de acesso** — um jogador que só tem um vínculo (ex.: só e-mail) e perde acesso àquele e-mail precisa de um caminho de recuperação — mesma categoria de problema que qualquer sistema de conta multi-provedor enfrenta, fora do escopo de game design, dentro do escopo de implementação futura.

---

*Referências: `world-foundation-4.0.md` Seção 2.1; `login-providers.md` (o lado de "como cada provedor autentica"); `docs/architecture/decisions.md` (nenhuma decisão congelada aqui é violada — Identity Core é aditivo à sessão existente).*
