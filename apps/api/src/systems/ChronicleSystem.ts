/**
 * ChronicleSystem — Sprint Kingdom Chronicles (MVP)
 *
 * O "Livro" de cada personagem: só observa eventos que já existem no
 * EventBus (mesmo padrão de WelcomeRewardSystem/KingdomNewsSystem) e
 * grava, via ChronicleRepository, entradas permanentes — nunca um
 * buffer em memória como a Timeline/Jornal do Reino, porque o critério
 * de sucesso desta Sprint é reler a própria jornada "depois de meses
 * jogando".
 *
 * Dois tipos de marco:
 * 1. "Primeira vez" (chegada, primeiro item, primeiro nível, primeiro
 *    Boss, primeira expedição) — no máximo UMA entrada por personagem
 *    para sempre, garantida por insertOnce() (condicional no próprio
 *    INSERT, sem depender de nenhuma outra coluna/flag).
 * 2. Marcos que se repetem legitimamente (título desbloqueado, cargo
 *    assumido, drop raro) — cada ocorrência é, por natureza, rara o
 *    bastante para merecer sua própria linha; usam insertAlways().
 *
 * boss.defeated não carrega characterId (é um evento de canal, não de
 * personagem) — por isso, ao reagir a ele, este System consulta
 * BossParticipationRepository.listByBoss() (mesma leitura que
 * BossRewardSystem já faz) para saber quem participou de verdade
 * (ticksPresent > 0) e credita "primeiro Boss derrotado" a cada um.
 *
 * Nenhum texto usa o nome do personagem — o Livro é escrito na
 * perspectiva de "aquele aventureiro", como um cronista narraria,
 * nunca como um sistema relatando um evento.
 */
import type { EventBus } from "../engine/EventBus.js";
import type {
  BossDefeatedEvent,
  BossParticipationRepository,
  ChronicleRepository,
  DropGrantedEvent,
  ExpeditionCompletedEvent,
  IdentityTitleUnlockedEvent,
  KingdomRoleChangedEvent,
  LevelUpEvent,
  SessionStartedEvent,
  XPGrantedEvent,
} from "../engine/types.js";

interface ChapterTemplate {
  icon: string;
  title: string;
  text: string;
}

function pick(templates: ChapterTemplate[]): ChapterTemplate {
  return templates[Math.floor(Math.random() * templates.length)];
}

function format(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
}

const ARRIVAL_TEMPLATES: ChapterTemplate[] = [
  { icon: "🚪", title: "A Chegada", text: "Chegou ao Reino usando apenas um velho par de Luvas Rasgadas." },
  { icon: "🚪", title: "Primeiros Passos", text: "Descobriu que coragem e equipamento raramente chegam juntos." },
  { icon: "🚪", title: "Um Novo Rosto", text: "Atravessou os portões da Capital pela primeira vez, sem saber o que esperar." },
  { icon: "🚪", title: "O Início", text: "Chegou ao Reino sem fama, sem posses, sem nada além de vontade." },
  { icon: "🚪", title: "Passos Incertos", text: "Entrou na Capital como tantos outros antes: apenas mais um rosto novo." },
  { icon: "🚪", title: "Um Estranho na Capital", text: "Ninguém sabia seu nome. Isso estava prestes a mudar, aos poucos." },
  { icon: "🚪", title: "A Primeira Manhã", text: "Acordou pela primeira vez dentro dos limites do Reino." },
  { icon: "🚪", title: "Chão Novo", text: "Pisou pela primeira vez nas ruas da Capital, sem ideia do que viria." },
  { icon: "🚪", title: "Um Começo Qualquer", text: "Como tantos outros, chegou sem plano e sem certeza." },
  { icon: "🚪", title: "Antes de Tudo", text: "Antes de qualquer feito, houve apenas a chegada." },
  { icon: "🚪", title: "Sem Nome Ainda", text: "O Reino ainda não sabia quem era. Isso levaria tempo." },
  { icon: "🚪", title: "O Primeiro Olhar", text: "Olhou pela primeira vez para a Capital e não soube dizer se ficaria." },
  { icon: "🚪", title: "Uma Jornada Começa", text: "Nenhuma grande história começa no meio. Essa começou aqui." },
  { icon: "🚪", title: "Terra Desconhecida", text: "Chegou a um Reino que já existia havia muito antes dele." },
  { icon: "🚪", title: "O Primeiro Dia", text: "Foi só mais um dia para o Reino. Para ele, foi o início de tudo." },
];

const FIRST_ITEM_TEMPLATES: ChapterTemplate[] = [
  { icon: "🧤", title: "Luvas Rasgadas", text: "Equipou seu primeiro item: um par de luvas encontrado atrás da forja." },
  { icon: "🧤", title: "Melhor que Nada", text: "Descobriu que coragem e equipamento raramente chegam juntos." },
  { icon: "🧤", title: "O Primeiro Equipamento", text: "Vestiu, pela primeira vez, algo além da própria coragem." },
  { icon: "🧤", title: "Um Começo Modesto", text: "Não era uma espada lendária. Era o suficiente para começar." },
  { icon: "🧤", title: "Mãos Protegidas", text: "Sentiu, pela primeira vez, o peso de carregar algo próprio." },
  { icon: "🧤", title: "Pouco, mas Seu", text: "O item não valia muito. Ainda assim, era dele." },
  { icon: "🧤", title: "Primeiro Passo Real", text: "Equipar algo, por menor que fosse, mudou a forma como caminhava." },
  { icon: "🧤", title: "Nada de Especial", text: "Ninguém reparou. Ele reparou." },
  { icon: "🧤", title: "Aquilo que Restava", text: "Pegou o que encontrou e seguiu em frente, sem reclamar." },
  { icon: "🧤", title: "Um Símbolo Pequeno", text: "Aquele item, por mais simples, marcava um início." },
  { icon: "🧤", title: "O Início do Equipamento", text: "Descobriu que todo aventureiro começa com quase nada." },
  { icon: "🧤", title: "Rasgado, mas Funcional", text: "As luvas não impressionavam ninguém. Cumpriam o que prometiam." },
  { icon: "🧤", title: "Primeira Posse", text: "Aprendeu que até o item mais simples merece cuidado." },
  { icon: "🧤", title: "Uma Escolha Simples", text: "Não escolheu o item. O item o escolheu primeiro." },
  { icon: "🧤", title: "O Peso das Luvas", text: "Aquelas luvas pesavam pouco. A decisão de usá-las, nem tanto." },
];

const FIRST_LEVEL_UP_TEMPLATES: ChapterTemplate[] = [
  { icon: "⭐", title: "Um Aprendizado Silencioso", text: "Já era possível perceber que aquele aventureiro aprenderia rápido." },
  { icon: "⭐", title: "O Primeiro Avanço", text: "Algo mudou, ainda que pouco. Foi o bastante para notar." },
  { icon: "⭐", title: "Mais Forte que Ontem", text: "Sem perceber exatamente quando, já não era mais o mesmo de antes." },
  { icon: "⭐", title: "Pequenos Sinais", text: "A experiência começava a aparecer, discreta, mas real." },
  { icon: "⭐", title: "Primeiro Degrau", text: "Subiu um degrau que muitos nem percebem existir." },
  { icon: "⭐", title: "Aprendendo aos Poucos", text: "Nada grandioso aconteceu. Só um pouco mais de firmeza nos passos." },
  { icon: "⭐", title: "Menos Perdido", text: "Já não parecia tão perdido quanto no primeiro dia." },
  { icon: "⭐", title: "Um Progresso Modesto", text: "O Reino ganhou, discretamente, mais um aventureiro em formação." },
  { icon: "⭐", title: "A Curva Começa", text: "Foi um avanço pequeno. Mas todo avanço grande começa pequeno." },
  { icon: "⭐", title: "Primeira Virada", text: "Algo em sua postura já não era mais de iniciante." },
  { icon: "⭐", title: "Notado por Poucos", text: "Ninguém comemorou. Ele soube, e isso bastou." },
  { icon: "⭐", title: "Crescendo Devagar", text: "Não era herói ainda. Mas já não era o mesmo novato de antes." },
  { icon: "⭐", title: "Um Passo à Frente", text: "Ficou, ainda que pouco, mais preparado do que estava." },
  { icon: "⭐", title: "O Começo da Experiência", text: "Aprendeu que crescer, no Reino, acontece aos poucos." },
  { icon: "⭐", title: "Sinais de Evolução", text: "Pela primeira vez, sentiu que talvez conseguisse ir mais longe." },
];

const FIRST_BOSS_TEMPLATES: ChapterTemplate[] = [
  { icon: "🐉", title: "Sangue e Glória", text: "Derrotou o primeiro Boss, ao lado de outros que também arriscaram tudo." },
  { icon: "🐉", title: "Contra Algo Maior", text: "Enfrentou algo muito maior que ele, e ainda assim permaneceu até o fim." },
  { icon: "🐉", title: "Um Nome na Vitória", text: "Fez parte da queda de um Boss. Seu nome ficou ligado a isso." },
  { icon: "🐉", title: "Sobrevivente", text: "Muitos fogem de uma luta assim. Ele ficou até o final." },
  { icon: "🐉", title: "A Primeira Grande Batalha", text: "Participou de algo que o Reino inteiro comentaria depois." },
  { icon: "🐉", title: "Cicatriz de Honra", text: "Voltou de uma luta contra um Boss carregando mais do que ferimentos." },
  { icon: "🐉", title: "Entre os Vencedores", text: "Esteve entre aqueles que fizeram um Boss cair." },
  { icon: "🐉", title: "Coragem Testada", text: "Sua coragem foi posta à prova diante de algo imenso. Não recuou." },
  { icon: "🐉", title: "Um Feito Raro", text: "Poucos aventureiros podem dizer que ajudaram a derrotar um Boss. Ele pode." },
  { icon: "🐉", title: "A Queda do Gigante", text: "Testemunhou, e participou, da queda de algo que parecia invencível." },
  { icon: "🐉", title: "Do Lado Certo da História", text: "Quando o Boss caiu, ele estava lá, e isso importava." },
  { icon: "🐉", title: "Prova de Fogo", text: "Enfrentou o tipo de perigo que separa quem desiste de quem continua." },
  { icon: "🐉", title: "Um Marco na Jornada", text: "Essa vitória contra o Boss ficaria marcada, de um jeito ou de outro." },
  { icon: "🐉", title: "Mais que Sorte", text: "Não foi sorte. Foi presença, esforço, e um pouco de coragem." },
  { icon: "🐉", title: "O Peso da Vitória", text: "Sentiu, pela primeira vez, o peso real de vencer algo grande." },
];

const FIRST_EXPEDITION_TEMPLATES: ChapterTemplate[] = [
  { icon: "🗺️", title: "A Primeira Jornada", text: "Sobreviveu à primeira expedição, ainda incerto sobre o que tinha visto." },
  { icon: "🗺️", title: "De Volta Inteiro", text: "Voltou da primeira expedição com histórias, mesmo que pequenas." },
  { icon: "🗺️", title: "Fora dos Muros", text: "Pela primeira vez, deixou a segurança da Capital para trás." },
  { icon: "🗺️", title: "O Mundo Além dos Portões", text: "Descobriu que o Reino era bem maior do que parecia de dentro dos muros." },
  { icon: "🗺️", title: "Primeiros Perigos", text: "Encontrou seus primeiros perigos reais, longe de casa." },
  { icon: "🗺️", title: "Caminhos Desconhecidos", text: "Andou por caminhos que nunca tinha visto antes." },
  { icon: "🗺️", title: "A Volta para Casa", text: "Retornou à Capital como alguém que já tinha visto um pouco mais do mundo." },
  { icon: "🗺️", title: "Primeira Prova", text: "A primeira expedição não foi fácil. Nenhuma realmente é." },
  { icon: "🗺️", title: "Um Passo Além dos Muros", text: "Descobriu que aventura, de perto, é mais cansativa do que parece." },
  { icon: "🗺️", title: "Terras Novas", text: "Pisou em solo que nunca tinha visto antes, e voltou para contar." },
  { icon: "🗺️", title: "O Primeiro Retorno", text: "Nem toda expedição termina em glória. Essa terminou em sobrevivência." },
  { icon: "🗺️", title: "Além da Capital", text: "Aprendeu que o Reino não termina onde os muros acabam." },
  { icon: "🗺️", title: "Uma Rota Qualquer", text: "Seguiu um caminho sorteado pelo destino, e voltou inteiro." },
  { icon: "🗺️", title: "Primeiros Encontros", text: "Viu de perto o que antes só ouvia em histórias de taverna." },
  { icon: "🗺️", title: "O Começo da Estrada", text: "Entendeu, na primeira expedição, que a estrada seria uma companhia constante." },
];

const TITLE_UNLOCKED_TEMPLATES: ChapterTemplate[] = [
  { icon: "👑", title: "Um Nome a Mais", text: "Recebeu o título de {titulo}." },
  { icon: "👑", title: "Reconhecimento", text: "O Reino passou a chamá-lo de {titulo}." },
  { icon: "👑", title: "Um Novo Capítulo", text: "Ganhou o direito de carregar o nome {titulo}." },
  { icon: "👑", title: "Título Conquistado", text: "Não foi dado. Foi conquistado: {titulo}." },
  { icon: "👑", title: "Mais que um Nome", text: "{titulo} deixou de ser só palavra e virou parte de quem ele era." },
  { icon: "👑", title: "Merecido", text: "Poucos recebem o título de {titulo}. Ele recebeu." },
  { icon: "👑", title: "Uma Nova Identidade", text: "A partir de agora, seria lembrado também como {titulo}." },
  { icon: "👑", title: "Reconhecido pelo Reino", text: "O título de {titulo} chegou até ele, e ele o aceitou." },
  { icon: "👑", title: "Prova de Percurso", text: "{titulo}: um título que carrega uma história inteira por trás." },
  { icon: "👑", title: "O Peso de um Título", text: "Carregar o nome {titulo} não era pouca coisa." },
  { icon: "👑", title: "Um Novo Marco", text: "Tornou-se, oficialmente, {titulo}." },
  { icon: "👑", title: "Assim Ficou Conhecido", text: "De agora em diante, muitos o chamariam de {titulo}." },
  { icon: "👑", title: "Um Título Raro", text: "Nem todos alcançam o título de {titulo}. Ele alcançou." },
  { icon: "👑", title: "Marcado pela História", text: "{titulo} passou a fazer parte do que ele era, não só do que fazia." },
  { icon: "👑", title: "Reconhecimento Merecido", text: "O Reino reconheceu seus feitos com o título de {titulo}." },
];

const ROLE_CHANGED_TEMPLATES: ChapterTemplate[] = [
  { icon: "🏛️", title: "Um Novo Posto", text: "Tornou-se {cargo} do Reino." },
  { icon: "🏛️", title: "Ocupando um Lugar de Destaque", text: "Assumiu o posto de {cargo}, diante de todo o Reino." },
  { icon: "🏛️", title: "Reconhecimento do Reino", text: "O Reino passou a vê-lo como seu {cargo}." },
  { icon: "🏛️", title: "Um Cargo Conquistado", text: "Tornou-se {cargo}, superando quem ocupava o posto antes." },
  { icon: "🏛️", title: "Novo Nome no Hall da Fama", text: "Seu nome passou a ocupar o posto de {cargo}." },
  { icon: "🏛️", title: "Ascensão", text: "De aventureiro comum a {cargo} do Reino." },
  { icon: "🏛️", title: "Um Lugar de Respeito", text: "Assumiu, com méritos, o cargo de {cargo}." },
  { icon: "🏛️", title: "Um Novo Nome no Cargo", text: "O Reino tinha, agora, um novo {cargo}." },
  { icon: "🏛️", title: "Mudança no Hall da Fama", text: "Tomou o lugar de {cargo}, feito por feito." },
  { icon: "🏛️", title: "Reconhecido Entre Todos", text: "Não foi discreto. Tornar-se {cargo} raramente é." },
  { icon: "🏛️", title: "Um Posto Disputado", text: "Chegou ao posto de {cargo} depois de muito esforço." },
  { icon: "🏛️", title: "Nova Posição", text: "Assumiu o cargo de {cargo}, para surpresa de alguns." },
  { icon: "🏛️", title: "O Peso do Cargo", text: "Ser {cargo} trazia expectativa junto com o reconhecimento." },
  { icon: "🏛️", title: "Um Nome Que Ficou", text: "Enquanto ocupou o posto de {cargo}, seu nome não seria esquecido." },
  { icon: "🏛️", title: "Do Anonimato ao Destaque", text: "Tornou-se {cargo}, e o Reino inteiro tomou nota." },
];

const RARE_DROP_TEMPLATES: ChapterTemplate[] = [
  { icon: "💎", title: "Um Achado Raro", text: "Encontrou {item}, um item difícil de ignorar." },
  { icon: "💎", title: "Sorte ou Destino", text: "{item} apareceu em seu caminho, sem aviso." },
  { icon: "💎", title: "Mais que um Item", text: "{item} carregava um valor que ia além do óbvio." },
  { icon: "💎", title: "Um Brilho Diferente", text: "Encontrou {item}, e soube na hora que era diferente do resto." },
  { icon: "💎", title: "Recompensa Rara", text: "{item} não é algo que se encontra todo dia." },
  { icon: "💎", title: "Um Momento de Sorte", text: "Poucos encontram {item}. Ele encontrou." },
  { icon: "💎", title: "Digno de Nota", text: "Guardou {item} com o cuidado que a raridade exige." },
  { icon: "💎", title: "Achado Incomum", text: "{item} passou a fazer parte de sua história, não só de seu inventário." },
  { icon: "💎", title: "Uma Descoberta Notável", text: "Encontrou {item} onde menos esperava." },
  { icon: "💎", title: "Prêmio Inesperado", text: "{item} surgiu como recompensa por perseverança, mesmo sem ser óbvio." },
  { icon: "💎", title: "Um Tesouro Pequeno", text: "Nem todo tesouro é grande. {item} já bastava." },
  { icon: "💎", title: "Raro de Verdade", text: "{item}: um item que poucos aventureiros chegam a ver de perto." },
  { icon: "💎", title: "Sorte Rara", text: "Encontrar {item} não é sorte comum." },
  { icon: "💎", title: "Um Item para Lembrar", text: "{item} entrou para sua coleção, e para sua história." },
  { icon: "💎", title: "Recompensa Merecida", text: "{item} chegou como reconhecimento de um esforço real." },
];

// Só drops raros o bastante viram capítulo — comum/incomum aconteceria
// toda hora, o que contradiria "nunca registrar tudo".
const RARE_ENOUGH_RARITIES = new Set(["rare", "epic", "legendary"]);

export class ChronicleSystem {
  constructor(
    private chronicleRepo: ChronicleRepository,
    private participationRepo: BossParticipationRepository,
  ) {}

  register(bus: EventBus): () => void {
    const unsubs = [
      bus.subscribe("session.started", async (event) => {
        const { characterId, timestamp } = event as SessionStartedEvent;
        try {
          const t = pick(ARRIVAL_TEMPLATES);
          await this.chronicleRepo.insertOnce(characterId, "arrival", t.icon, t.title, t.text, timestamp);
        } catch (err) {
          console.error(`[ChronicleSystem] Erro (arrival) ${characterId}:`, err);
        }
      }),

      bus.subscribe("xp.granted", async (event) => {
        const { characterId, source, timestamp } = event as XPGrantedEvent;
        if (source !== "quest") return; // FirstItemQuestSystem — único source ligado ao primeiro item
        try {
          const t = pick(FIRST_ITEM_TEMPLATES);
          await this.chronicleRepo.insertOnce(characterId, "first_item", t.icon, t.title, t.text, timestamp);
        } catch (err) {
          console.error(`[ChronicleSystem] Erro (first_item) ${characterId}:`, err);
        }
      }),

      bus.subscribe("level.up", async (event) => {
        const { characterId, timestamp } = event as LevelUpEvent;
        try {
          const t = pick(FIRST_LEVEL_UP_TEMPLATES);
          await this.chronicleRepo.insertOnce(characterId, "first_level_up", t.icon, t.title, t.text, timestamp);
        } catch (err) {
          console.error(`[ChronicleSystem] Erro (first_level_up) ${characterId}:`, err);
        }
      }),

      // boss.defeated não carrega characterId (evento de canal) — busca
      // quem participou de verdade (mesma leitura que BossRewardSystem
      // já faz) para creditar "primeiro Boss" a cada participante.
      bus.subscribe("boss.defeated", async (event) => {
        const { bossId, timestamp } = event as BossDefeatedEvent;
        try {
          const participants = await this.participationRepo.listByBoss(bossId);
          for (const participant of participants) {
            if (participant.ticksPresent <= 0) continue;
            try {
              const t = pick(FIRST_BOSS_TEMPLATES);
              await this.chronicleRepo.insertOnce(participant.characterId, "first_boss", t.icon, t.title, t.text, timestamp);
            } catch (err) {
              console.error(`[ChronicleSystem] Erro (first_boss) ${participant.characterId}:`, err);
            }
          }
        } catch (err) {
          console.error(`[ChronicleSystem] Erro ao buscar participantes do Boss ${bossId}:`, err);
        }
      }),

      bus.subscribe("expedition.completed", async (event) => {
        const { characterId, timestamp } = event as ExpeditionCompletedEvent;
        try {
          const t = pick(FIRST_EXPEDITION_TEMPLATES);
          await this.chronicleRepo.insertOnce(characterId, "first_expedition", t.icon, t.title, t.text, timestamp);
        } catch (err) {
          console.error(`[ChronicleSystem] Erro (first_expedition) ${characterId}:`, err);
        }
      }),

      // Título/cargo/drop raro: cada ocorrência é, por natureza, rara —
      // grava sempre, nunca condicionada a "primeira vez".
      bus.subscribe("identity.title_unlocked", async (event) => {
        const { characterId, titleName, timestamp } = event as IdentityTitleUnlockedEvent;
        try {
          const t = pick(TITLE_UNLOCKED_TEMPLATES);
          await this.chronicleRepo.insertAlways(
            characterId,
            "title_unlocked",
            t.icon,
            format(t.title, { titulo: titleName }),
            format(t.text, { titulo: titleName }),
            timestamp,
          );
        } catch (err) {
          console.error(`[ChronicleSystem] Erro (title_unlocked) ${characterId}:`, err);
        }
      }),

      bus.subscribe("kingdom.role_changed", async (event) => {
        const { characterId, roleName, timestamp } = event as KingdomRoleChangedEvent;
        try {
          const t = pick(ROLE_CHANGED_TEMPLATES);
          await this.chronicleRepo.insertAlways(
            characterId,
            "role_changed",
            t.icon,
            format(t.title, { cargo: roleName }),
            format(t.text, { cargo: roleName }),
            timestamp,
          );
        } catch (err) {
          console.error(`[ChronicleSystem] Erro (role_changed) ${characterId}:`, err);
        }
      }),

      bus.subscribe("drop.granted", async (event) => {
        const { characterId, itemName, itemRarity, timestamp } = event as DropGrantedEvent;
        if (!RARE_ENOUGH_RARITIES.has(itemRarity)) return;
        try {
          const t = pick(RARE_DROP_TEMPLATES);
          await this.chronicleRepo.insertAlways(
            characterId,
            "rare_drop",
            t.icon,
            format(t.title, { item: itemName }),
            format(t.text, { item: itemName }),
            timestamp,
          );
        } catch (err) {
          console.error(`[ChronicleSystem] Erro (rare_drop) ${characterId}:`, err);
        }
      }),
    ];

    return () => unsubs.forEach((unsub) => unsub());
  }
}
