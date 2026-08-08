# Login Providers

**Status:** 🚧 Preparação — conceitual, nenhuma implementação. Parte da Sprint "Foundation Refactor".

## 1. O princípio

Todos os provedores autenticam. Nenhum possui vantagem. Todos geram exatamente a mesma conta — a mesma Identidade descrita em `identity-core.md`, com os mesmos direitos, o mesmo personagem, o mesmo acesso ao mundo.

## 2. Os seis provedores

| Provedor | Papel no MVP | Papel de longo prazo |
|---|---|---|
| **Google** | Login core (MVP) | Login core |
| **Discord** | Login core (MVP) | Login core + integração social (ver `cross-platform.md`) |
| **E-mail** | Login core (MVP) | Login core, caminho de recuperação de conta |
| **Twitch** | Integração opcional | Integração opcional + caminho de fundação de Reino-Streamer |
| **Kick** | Integração opcional | Integração opcional, mesmo modelo de Twitch |
| **YouTube** | Integração opcional | Integração opcional, mesmo modelo de Twitch |

A distinção MVP-vs-opcional não é sobre importância técnica (todos os seis autenticam da mesma forma) — é sobre ordem de rollout: Google/Discord/E-mail cobrem o caso "eu só quero jogar", que precisa existir primeiro; Twitch/Kick/YouTube cobrem o caso "eu quero trazer minha comunidade", que já era o caso coberto hoje e continua existindo, só que como opção.

## 3. Regra de equivalência — o teste

Qualquer decisão de design sobre login deve responder "sim" à pergunta: *se um jogador nunca conectar nenhum provedor de streaming, ele consegue fazer absolutamente tudo que um jogador que conectou Twitch consegue?* Se a resposta for "não", o provedor de streaming virou requisito disfarçado, e a decisão precisa ser revertida.

Consequência prática: nenhum bônus de XP, gold, item, ou acesso a conteúdo pode depender de qual provedor autenticou a conta. A única coisa que um provedor de streaming pode desbloquear é **caminhos de liderança de Reino específicos daquele tipo** (ex.: só quem conectou Twitch pode fundar um Reino-Streamer) — porque isso não é vantagem de jogo, é uma categoria de jogo diferente (governança), coberta em `kingdom-domain-2.0.md`.

## 4. O que muda tecnicamente (descrito conceitualmente, sem schema)

- A rota de callback de autenticação deixa de ser uma única rota Twitch-específica e passa a ser uma família de rotas, uma por provedor, todas convergindo para a mesma resolução final: "encontrar ou criar um `profileId`, então criar uma sessão".
- Cada provedor devolve um conjunto diferente de dados de perfil (Google/E-mail não têm `display_name` de streamer, por exemplo) — o Identity Core precisa de uma forma canônica de perfil (nome de exibição, avatar) que qualquer provedor possa preencher, com valores default sensatos quando um provedor não oferece algo (ex.: e-mail não tem avatar — usar um avatar gerado).
- A sessão (`middleware/auth.ts`) não muda — ela já é agnóstica.

## 5. O que não muda

Personagem, progressão, tudo que já não depende de `twitch_id` diretamente continua idêntico. Um jogador que loga via Google hoje teria, no mundo novo, exatamente a mesma primeira experiência de personagem que um jogador Twitch tem hoje.

## 6. Streamer como vínculo, não como conta

Conectar Twitch/Kick/YouTube a uma conta existente (em vez de ser o próprio login) é a forma correta de modelar isso na visão nova: um jogador já pode ter jogado por meses via Google, e um dia decidir conectar Twitch para transformar seu Reino em um Reino-Streamer. Esse vínculo não cria uma segunda conta — enriquece a conta existente com uma nova capacidade (liderar via aquele modelo).

---

*Referências: `identity-core.md` (o modelo de Identidade que este documento assume); `kingdom-domain-2.0.md` Seção sobre Liderança Streamer; `world-foundation-4.0.md` Seção 2.1.*
