// Sprint Kingdom Museum — infraestrutura do Museu do Reino, reutilizando
// a mesma arquitetura da Biblioteca/Bestiário (catálogo estático, sem
// backend, sem banco, sem escrita). Puramente apresentação: nenhum
// registro aqui é Lore definitiva — cada um é só um placeholder, pronto
// para receber texto real numa Sprint futura sem precisar mudar esta
// estrutura.
export type MuseumCategory =
  | "grandes-herois"
  | "grandes-bosses"
  | "grandes-descobertas"
  | "reliquias-historicas"
  | "primeiros-aventureiros"
  | "fundacao-do-reino"
  | "grandes-tragedias"
  | "grandes-conquistas"
  | "monumentos"
  | "misterios";

export interface MuseumCategoryDefinition {
  slug: MuseumCategory;
  label: string;
  icon: string;
}

// Etapa "Alas" — só a estrutura das 10 categorias, mesmo que hoje nem
// todas tenham um registro no catálogo ainda.
export const MUSEUM_CATEGORIES: MuseumCategoryDefinition[] = [
  { slug: "grandes-herois", label: "Grandes Heróis", icon: "🦸" },
  { slug: "grandes-bosses", label: "Grandes Bosses", icon: "🐲" },
  { slug: "grandes-descobertas", label: "Grandes Descobertas", icon: "🔎" },
  { slug: "reliquias-historicas", label: "Relíquias Históricas", icon: "🏺" },
  { slug: "primeiros-aventureiros", label: "Primeiros Aventureiros", icon: "🥇" },
  { slug: "fundacao-do-reino", label: "Fundação do Reino", icon: "🏰" },
  { slug: "grandes-tragedias", label: "Grandes Tragédias", icon: "🕯️" },
  { slug: "grandes-conquistas", label: "Grandes Conquistas", icon: "🏆" },
  { slug: "monumentos", label: "Monumentos", icon: "🗿" },
  { slug: "misterios", label: "Mistérios", icon: "🔮" },
];

// Etapa "Status" — só um estado aceito pela interface, igual à
// Biblioteca/Bestiário: nenhuma lógica de desbloqueio real ainda.
export type MuseumEntryStatus = "bloqueado" | "conhecido" | "registrado";

export const MUSEUM_STATUS_LABEL: Record<MuseumEntryStatus, string> = {
  bloqueado: "🔒 Bloqueado",
  conhecido: "📘 Conhecido",
  registrado: "✅ Registrado",
};

export interface MuseumEntry {
  id: string;
  title: string;
  category: MuseumCategory;
  description: string;
  // Markdown simples (mesmo `renderMarkdownLite` da Biblioteca): só
  // **negrito**, *itálico* e parágrafos. Nada além disso nesta Sprint.
  pages: string[];
  status: MuseumEntryStatus;
  locked: boolean;
  unlockCondition: string;
  icon: string;
  year: string;
  author: string;
}

const PLACEHOLDER_PAGES = [
  "**Este registro ainda está sendo compilado.**\n\nO Curador continua reunindo relatos e evidências antes de fechar a exposição.",
  "*Registro em desenvolvimento...*\n\nVolte ao Museu em outra ocasião.",
  "**Fim do registro conhecido.**\n\nO restante desta história ainda não foi documentado.",
];

// Etapa "Dados" — 5 registros, só texto placeholder, nenhuma Lore
// definitiva. Categorias/anos/status variados só para provar que os
// filtros funcionam.
export const MUSEUM_ENTRIES: MuseumEntry[] = [
  {
    id: "a-fundacao-do-reino",
    title: "A Fundação do Reino",
    category: "fundacao-do-reino",
    description: "Registro em desenvolvimento.",
    pages: PLACEHOLDER_PAGES,
    status: "registrado",
    locked: false,
    unlockCondition: "Disponível desde o início",
    icon: "🏰",
    year: "Ano 1 do Reino",
    author: "Curador Alaric",
  },
  {
    id: "o-primeiro-boss",
    title: "O Primeiro Boss",
    category: "grandes-bosses",
    description: "Registro em desenvolvimento.",
    pages: PLACEHOLDER_PAGES,
    status: "conhecido",
    locked: false,
    unlockCondition: "Disponível desde o início",
    icon: "🐲",
    year: "Ano 3 do Reino",
    author: "Curador Alaric",
  },
  {
    id: "a-ponte-antiga",
    title: "A Ponte Antiga",
    category: "monumentos",
    description: "Registro em desenvolvimento.",
    pages: PLACEHOLDER_PAGES,
    status: "conhecido",
    locked: false,
    unlockCondition: "Disponível desde o início",
    icon: "🗿",
    year: "Desconhecido",
    author: "Curador Alaric",
  },
  {
    id: "o-grande-incendio",
    title: "O Grande Incêndio",
    category: "grandes-tragedias",
    description: "Registro em desenvolvimento.",
    pages: PLACEHOLDER_PAGES,
    status: "bloqueado",
    locked: true,
    unlockCondition: "Desconhecida",
    icon: "🕯️",
    year: "Desconhecido",
    author: "Curador Alaric",
  },
  {
    id: "o-explorador-desconhecido",
    title: "O Explorador Desconhecido",
    category: "primeiros-aventureiros",
    description: "Registro em desenvolvimento.",
    pages: PLACEHOLDER_PAGES,
    status: "bloqueado",
    locked: true,
    unlockCondition: "Desconhecida",
    icon: "🥇",
    year: "Desconhecido",
    author: "Curador Alaric",
  },

  // ============================================================
  // Sprint History of the Kingdom (Phase I) — 40 acontecimentos
  // históricos + 10 monumentos, todos com páginas reais (não
  // PLACEHOLDER_PAGES). Nenhuma resposta definitiva: fontes discordam
  // de propósito, mesma regra usada em history.ts.
  // ============================================================

  // ---- Fundação do Reino (8) ----
  { id: "fundacao-da-capital", title: "Fundação da Capital", category: "fundacao-do-reino", description: "O marco mais citado — e mais discutido — da história do Reino.", pages: ["Toda criança da Capital aprende uma data de fundação. O problema é que nenhum historiador concorda em qual data é essa. Os registros mais antigos encontrados já tratam a Capital como algo estabelecido, nunca como algo recém-criado."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🏰", year: "Disputado", author: "Curador Alaric" },
  { id: "primeira-coroacao", title: "Primeira Coroação", category: "fundacao-do-reino", description: "O primeiro registro de uma coroação formal no Reino.", pages: ["Sabemos que aconteceu. Não sabemos, com certeza, quem foi coroado primeiro — dois nomes aparecem em fontes diferentes, e nenhuma das duas fontes menciona a outra pessoa."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "👑", year: "Era do Primeiro Reino", author: "Curador Alaric" },
  { id: "primeiro-codigo-de-leis", title: "Assinatura do Primeiro Código de Leis", category: "fundacao-do-reino", description: "O documento que formalizou as primeiras leis escritas do Reino.", pages: ["Atribuído ao 'Juiz Sem Nome'. Fragmentos do código original ainda existem, mas boa parte foi reescrita tantas vezes que já não sabemos quanto resta do texto original."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "📜", year: "Era do Primeiro Reino", author: "Curador Alaric" },
  { id: "fundacao-da-guilda", title: "Fundação da Guilda dos Aventureiros", category: "fundacao-do-reino", description: "O início formal da organização que hoje Elenya lidera.", pages: ["Creditada a Dorel. Alguns registros sugerem que Garrick — apontado depois como o primeiro Guildmaster — era, na verdade, a mesma pessoa que Dorel, só com outro nome adotado depois."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🗡️", year: "Era da Reunificação", author: "Curador Alaric" },
  { id: "construcao-da-primeira-muralha", title: "Construção da Primeira Muralha", category: "fundacao-do-reino", description: "A primeira estrutura defensiva erguida ao redor do que viria a ser a Capital.", pages: ["Simples, de pedra empilhada, sem argamassa. Durou o suficiente pra proteger a vila que cresceu atrás dela — mas nenhum registro explica por que foi derrubada e reconstruída só uma geração depois."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🧱", year: "Era da Primeira Fundação", author: "Curador Alaric" },
  { id: "reunificacao-dos-territorios", title: "Reunificação dos Territórios", category: "fundacao-do-reino", description: "O momento em que os territórios divididos voltaram a ter uma coroa comum.", pages: ["Creditada à Rainha Meira. Historiadores discordam se ela negociou a reunificação pessoalmente ou apenas assinou um acordo que outros já tinham costurado nos bastidores."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🤝", year: "Era da Reunificação", author: "Curador Alaric" },
  { id: "primeira-moeda-do-reino", title: "Criação da Primeira Moeda do Reino", category: "fundacao-do-reino", description: "A cunhagem oficial da primeira moeda reconhecida pelo Primeiro Reino.", pages: ["O nome do responsável muda de registro pra registro — 'Contador da Primeira Moeda' é o único título que se repete em todos eles, sem exceção."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🪙", year: "Era do Primeiro Reino", author: "Curador Alaric" },
  { id: "estabelecimento-das-fronteiras-atuais", title: "Estabelecimento das Fronteiras Atuais", category: "fundacao-do-reino", description: "A definição das divisas entre as regiões que conhecemos hoje.", pages: ["Nenhum tratado único define essas fronteiras — elas se consolidaram devagar, ao longo de gerações, e ninguém consegue apontar o momento exato em que pararam de mudar."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🗺️", year: "Era da Reunificação", author: "Curador Alaric" },

  // ---- Grandes Tragédias (8) ----
  { id: "grande-incendio", title: "Grande Incêndio", category: "grandes-tragedias", description: "Um dos maiores incêndios já registrados dentro da Capital.", pages: ["Destruiu um bairro inteiro numa única noite. A causa nunca foi determinada — um relato culpa uma forja, outro culpa um raio, e um terceiro não culpa nada, só descreve o fogo."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🔥", year: "Disputado", author: "Curador Alaric" },
  { id: "quebra-do-primeiro-reino", title: "Quebra do Primeiro Reino", category: "grandes-tragedias", description: "O colapso que encerrou o Primeiro Reino e deu início à Era da Quebra.", pages: ["O evento mais discutido por historiadores da Capital. Guerra, sucessão contestada, fome — cada fonte aponta uma causa diferente, e nenhuma delas cita as outras duas possibilidades."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "💔", year: "Era da Quebra", author: "Curador Alaric" },
  { id: "inverno-longo", title: "Inverno Longo", category: "grandes-tragedias", description: "Um único inverno que, segundo relatos, durou mais de um ano inteiro.", pages: ["Colheitas perdidas, fome generalizada, decisões impopulares da Rainha do Inverno. Até hoje, lavradores e moleiros guardam excedente por causa do que aconteceu nessa época."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "❄️", year: "Era do Inverno Longo", author: "Curador Alaric" },
  { id: "peste-das-colinas", title: "A Peste das Colinas", category: "grandes-tragedias", description: "Uma doença que se espalhou rapidamente pelas Colinas Áridas.", pages: ["Contida, segundo a lenda, por uma única curandeira. Outros historiadores sugerem que a peste simplesmente perdeu força sozinha, sem nenhuma intervenção decisiva."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🕯️", year: "Disputado", author: "Curador Alaric" },
  { id: "desabamento-das-minas-antigas", title: "O Desabamento das Minas Antigas", category: "grandes-tragedias", description: "Um colapso que fechou parte das galerias hoje conhecidas como Minas Abandonadas.", pages: ["Diários de mineiros da época mencionam um som estranho nos dias anteriores. Ninguém confirmou se o som e o desabamento estão de fato relacionados."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "⛏️", year: "Desconhecido", author: "Curador Alaric" },
  { id: "seca-de-sete-anos", title: "A Seca de Sete Anos", category: "grandes-tragedias", description: "Um longo período de estiagem que afetou a Planície Dourada.", pages: ["Encerrada, segundo a lenda, quando o Poceiro Real encontrou uma fonte que salvou a Capital. Nenhum outro poceiro depois conseguiu repetir o método dele."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🏜️", year: "Desconhecido", author: "Curador Alaric" },
  { id: "naufragio-da-frota-do-litoral", title: "O Naufrágio da Frota do Litoral", category: "grandes-tragedias", description: "A perda de boa parte da frota pesqueira do Litoral Quebrado numa única tempestade.", pages: ["A reconstrução das comunidades afetadas foi liderada por alguém lembrado só como 'a Viúva do Litoral' — seu nome verdadeiro nunca foi registrado."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🌊", year: "Desconhecido", author: "Curador Alaric" },
  { id: "noite-da-muralha-caida", title: "A Noite da Muralha Caída", category: "grandes-tragedias", description: "O colapso repentino de uma muralha que se acreditava sólida.", pages: ["O nome do arquiteto responsável pela muralha foi apagado dos registros logo depois — alguns dizem que de propósito, outros dizem que foi só o tempo que apagou."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🧱", year: "Desconhecido", author: "Curador Alaric" },

  // ---- Grandes Conquistas (8) ----
  { id: "primeira-ponte", title: "Primeira Ponte", category: "grandes-conquistas", description: "A primeira grande ponte de pedra construída no território do Reino.", pages: ["Projetada por Ilda, a Construtora — ou por vários engenheiros lembrados sob um único nome, segundo alguns historiadores. A ponte segue de pé até hoje."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🌉", year: "Era das Grandes Construções", author: "Curador Alaric" },
  { id: "torre-do-portao-norte", title: "Construção da Torre do Portão Norte", category: "grandes-conquistas", description: "A torre que hoje o Guarda Roth vigia, erguida na Era das Grandes Construções.", pages: ["O arquiteto responsável cometeu um erro de cálculo na fundação, corrigido às pressas segundo o próprio diário dele. A torre nunca apresentou problema depois disso."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🗼", year: "Era das Grandes Construções", author: "Curador Alaric" },
  { id: "abertura-da-estrada-dos-picos", title: "Abertura da Estrada dos Picos", category: "grandes-conquistas", description: "A primeira rota segura estabelecida pelos Picos Congelados.", pages: ["Creditada a Elowen, a Exploradora. Uma versão diz que ela morreu na expedição. Outra diz que voltou e viveu em silêncio até o fim da vida, sem nunca mais falar sobre a viagem."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🏔️", year: "Desconhecido", author: "Curador Alaric" },
  { id: "fundacao-da-biblioteca-real", title: "Fundação da Biblioteca Real", category: "grandes-conquistas", description: "A reunião dos primeiros livros do Reino sob um único teto.", pages: ["Creditada a Bertrand. Parte do acervo original, segundo alguns registros, veio de outras regiões — sem que ficasse claro se foi doado ou simplesmente levado."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "📚", year: "Era da Reunificação", author: "Curador Alaric" },
  { id: "primeiro-moinho-de-vento", title: "Construção do Primeiro Moinho de Vento", category: "grandes-conquistas", description: "O primeiro moinho movido a vento erguido no Reino.", pages: ["Substituiu boa parte da moagem manual da época. Nenhum registro guarda o nome de quem o projetou — só a data aproximada em que passou a funcionar."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "💨", year: "Era das Grandes Construções", author: "Curador Alaric" },
  { id: "domesticacao-dos-cavalos-das-planicies", title: "Domesticação dos Cavalos das Planícies", category: "grandes-conquistas", description: "O início da criação formal de cavalos na Planície Dourada.", pages: ["Transformou o transporte no Reino inteiro, dos mensageiros às caravanas. Nenhuma fonte concorda sobre quem domesticou o primeiro cavalo, só que aconteceu ali."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🐎", year: "Desconhecido", author: "Curador Alaric" },
  { id: "sistema-de-pocos-publicos", title: "Criação do Sistema de Poços Públicos", category: "grandes-conquistas", description: "A padronização de poços de água nas vilas do Reino.", pages: ["Inspirada, segundo a lenda, no trabalho do Poceiro Real durante a Seca de Sete Anos. Nenhum outro poceiro depois conseguiu repetir a mesma taxa de sucesso dele."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🪣", year: "Desconhecido", author: "Curador Alaric" },
  { id: "pacificacao-das-fronteiras-do-sul", title: "Pacificação das Fronteiras do Sul", category: "grandes-conquistas", description: "O fim de décadas de disputas territoriais nas regiões ao sul do Reino.", pages: ["Um tratado assinado sem nenhuma batalha decisiva registrada — o que leva alguns historiadores a duvidar se havia, de fato, uma guerra pra terminar."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🕊️", year: "Era da Reunificação", author: "Curador Alaric" },

  // ---- Grandes Descobertas (8) ----
  { id: "grande-migracao", title: "Grande Migração", category: "grandes-descobertas", description: "O deslocamento de povos inteiros entre regiões do Reino.", pages: ["O motivo nunca foi totalmente esclarecido — fome, guerra, ou algo que nenhum registro da época quis detalhar. Vilas inteiras hoje descendem dessa migração."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🧭", year: "Era da Grande Migração", author: "Curador Alaric" },
  { id: "descoberta-das-minas-abandonadas", title: "Descoberta das Minas Abandonadas", category: "grandes-descobertas", description: "O primeiro registro de exploração das galerias hoje conhecidas como Minas Abandonadas.", pages: ["Encontradas já parcialmente escavadas por alguém — ou algo — que nenhum registro identifica. Os primeiros mineiros só continuaram um trabalho que já estava lá."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "⛏️", year: "Desconhecido", author: "Curador Alaric" },
  { id: "primeiro-registro-do-deserto-de-vidro", title: "Primeiro Registro do Deserto de Vidro", category: "grandes-descobertas", description: "A primeira menção escrita ao Deserto de Vidro.", pages: ["O relato original descreve areia que 'brilha como se fosse líquida'. Nenhuma expedição posterior conseguiu confirmar ou negar essa descrição por completo."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🔷", year: "Desconhecido", author: "Curador Alaric" },
  { id: "mapeamento-do-litoral-quebrado", title: "Mapeamento do Litoral Quebrado", category: "grandes-descobertas", description: "O primeiro mapa confiável da costa do Litoral Quebrado.", pages: ["Atribuído a Berna, a Cartógrafa. O mapa original nunca foi encontrado — só cópias, e nenhuma delas concorda exatamente sobre o formato de uma certa enseada."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🗺️", year: "Era das Grandes Construções", author: "Curador Alaric" },
  { id: "descoberta-da-passagem-dos-picos", title: "Descoberta da Passagem dos Picos Congelados", category: "grandes-descobertas", description: "A rota que hoje permite atravessar os Picos Congelados com segurança.", pages: ["Aberta por Elowen, a Exploradora. Nenhum relato posterior confirma se ela sobreviveu à própria expedição ou não."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🏔️", year: "Desconhecido", author: "Curador Alaric" },
  { id: "primeiro-contato-com-o-bosque-sussurrante", title: "Primeiro Contato com o Bosque Sussurrante", category: "grandes-descobertas", description: "O primeiro registro de exploração formal do Bosque Sussurrante.", pages: ["Descreve 'sons que pareciam sussurros, vindos de lugar nenhum'. Nenhuma expedição depois conseguiu explicar completamente essa observação."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🌲", year: "Desconhecido", author: "Curador Alaric" },
  { id: "achado-dos-primeiros-fragmentos-das-ruinas", title: "Achado dos Primeiros Fragmentos das Ruínas", category: "grandes-descobertas", description: "A primeira menção formal às Ruínas Antigas espalhadas pelo Reino.", pages: ["O relato original já as descrevia como 'antigas demais para pertencer a qualquer povo conhecido' — e nenhum estudo posterior mudou essa conclusão."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🏛️", year: "Desconhecido", author: "Curador Alaric" },
  { id: "expedicao-a-fortaleza-sombria", title: "Expedição à Fortaleza Sombria", category: "grandes-descobertas", description: "A primeira expedição documentada à Fortaleza Sombria.", pages: ["Dois escribas participaram e registraram versões diferentes do que encontraram lá dentro. Nenhuma das duas versões cita a outra."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🏰", year: "Desconhecido", author: "Curador Alaric" },

  // ---- Mistérios (8) ----
  { id: "desaparecimento-da-segunda-coroa", title: "O Desaparecimento da Segunda Coroa", category: "misterios", description: "O sumiço de uma segunda coroa cuja existência poucos confirmam.", pages: ["A última testemunha morreu antes de dar qualquer detalhe a mais. Muitos historiadores duvidam que essa segunda coroa tenha existido de fato."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "👑", year: "Desconhecido", author: "Registros contraditórios da Biblioteca" },
  { id: "silencio-de-um-ano-inteiro", title: "O Silêncio de um Ano Inteiro", category: "misterios", description: "Um período de um ano sem nenhum registro histórico datado.", pages: ["Nenhum documento da época menciona esse ano. Alguns acreditam que os registros foram perdidos. Outros acreditam que, de propósito, ninguém escreveu nada."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🔮", year: "Desconhecido", author: "Registros contraditórios da Biblioteca" },
  { id: "vila-que-sumiu-do-mapa", title: "A Vila que Sumiu do Mapa", category: "misterios", description: "Uma vila mencionada em registros antigos que não aparece em nenhum mapa atual.", pages: ["Alguns dizem que foi abandonada durante a Grande Migração. Outros dizem que nunca existiu, e o nome é um erro de cópia repetido por séculos."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🗺️", year: "Desconhecido", author: "Registros contraditórios da Biblioteca" },
  { id: "registro-perdido-do-primeiro-rei", title: "O Registro Perdido do Primeiro Rei", category: "misterios", description: "A ausência de qualquer registro confiável sobre o primeiro rei do Primeiro Reino.", pages: ["Sabemos que existiu uma coroação. Não sabemos o nome de quem foi coroado — cada fonte apresenta um nome diferente, sem nenhuma prova decisiva."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "👑", year: "Era do Primeiro Reino", author: "Registros contraditórios da Biblioteca" },
  { id: "fundacao-nunca-confirmada-da-fortaleza", title: "A Fundação Nunca Confirmada de Fortaleza Sombria", category: "misterios", description: "A ausência total de registros sobre quem construiu a Fortaleza Sombria.", pages: ["Nenhuma fonte assume autoria da construção. Dois escribas que a exploraram discordam até sobre há quanto tempo ela existe."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🏰", year: "Desconhecido", author: "Registros contraditórios da Biblioteca" },
  { id: "enigma-da-contagem-de-anos", title: "O Enigma da Contagem de Anos", category: "misterios", description: "Uma discrepância nunca resolvida na contagem oficial de anos do Reino.", pages: ["Comparando registros de diferentes regiões, a contagem de anos não bate — uma diferença de quase uma década que ninguém conseguiu explicar ou corrigir."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🔮", year: "Desconhecido", author: "Registros contraditórios da Biblioteca" },
  { id: "segunda-fundacao-disputada", title: "A Segunda Fundação (Disputada)", category: "misterios", description: "A hipótese de que a Capital foi fundada duas vezes, em locais diferentes.", pages: ["Alguns historiadores acreditam que a Capital atual não é a mesma da Era da Primeira Fundação, mas uma segunda construída sobre os restos da primeira. A maioria discorda."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🏰", year: "Desconhecido", author: "Registros contraditórios da Biblioteca" },
  { id: "livro-queimado-da-primeira-biblioteca", title: "O Livro Queimado da Primeira Biblioteca", category: "misterios", description: "Um único livro que sobreviveu parcialmente a um incêndio na Biblioteca original.", pages: ["As páginas que restaram não formam uma história completa. Miriam guarda o fragmento até hoje, mas se recusa a especular sobre o que faltava."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🔥", year: "Desconhecido", author: "Registros contraditórios da Biblioteca" },

  // ---- Monumentos (10) ----
  { id: "monumento-arco-da-primeira-fundacao", title: "Arco da Primeira Fundação", category: "monumentos", description: "Um arco de pedra erguido pra marcar, supostamente, o local da primeira fundação.", pages: ["Construído séculos depois do evento que celebra — o que faz alguns historiadores duvidarem se o local marcado é sequer o correto."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🗿", year: "Era da Reunificação", author: "Curador Alaric" },
  { id: "monumento-coluna-dos-nomes", title: "Coluna dos Nomes", category: "monumentos", description: "Uma coluna gravada com nomes de figuras históricas do Reino.", pages: ["Vários nomes gravados nela não aparecem em nenhum outro registro conhecido. Ninguém sabe dizer quem foram, ou por que mereceram lugar na coluna."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🗿", year: "Desconhecido", author: "Curador Alaric" },
  { id: "monumento-estatua-da-rainha-meira", title: "Estátua da Rainha Meira", category: "monumentos", description: "Uma estátua erguida em homenagem à Unificadora.", pages: ["O rosto esculpido não bate com nenhuma descrição escrita dela — o que levanta dúvida sobre se a estátua realmente a representa, ou representa outra pessoa esquecida."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🗿", year: "Era da Reunificação", author: "Curador Alaric" },
  { id: "monumento-marco-da-primeira-ponte", title: "Marco da Primeira Ponte", category: "monumentos", description: "Uma placa fixada na base da Primeira Ponte, em homenagem à construção.", pages: ["Credita a obra a Ilda, a Construtora — mas o texto foi adicionado décadas depois da ponte estar pronta, sem fonte primária que confirme a autoria."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🗿", year: "Era das Grandes Construções", author: "Curador Alaric" },
  { id: "monumento-obelisco-do-inverno-longo", title: "Obelisco do Inverno Longo", category: "monumentos", description: "Um obelisco erguido em memória aos que não sobreviveram ao Inverno Longo.", pages: ["Não tem nenhum nome gravado — uma escolha deliberada, segundo registros da época, pra representar a todos sem distinção."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🗿", year: "Era do Inverno Longo", author: "Curador Alaric" },
  { id: "monumento-portico-da-guilda", title: "Pórtico da Guilda", category: "monumentos", description: "A entrada monumental da sede original da Guilda dos Aventureiros.", pages: ["Tem duas datas de fundação gravadas, uma sobre a outra, como se uma tivesse sido corrigida sem apagar a anterior por completo."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🗿", year: "Era da Reunificação", author: "Curador Alaric" },
  { id: "monumento-pedra-da-quebra", title: "Pedra da Quebra", category: "monumentos", description: "Um bloco de pedra erguido no local onde, segundo a tradição, o Primeiro Reino se dissolveu oficialmente.", pages: ["Nenhum documento da época confirma que o evento aconteceu exatamente ali. A pedra marca uma tradição, não um fato comprovado."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🗿", year: "Era da Quebra", author: "Curador Alaric" },
  { id: "monumento-farol-da-viuva", title: "Farol da Viúva do Litoral", category: "monumentos", description: "Um farol erguido em homenagem à reconstrução após o Naufrágio da Frota.", pages: ["Batizado em honra a alguém cujo nome verdadeiro nunca foi registrado — só o título pelo qual ficou conhecida."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🗿", year: "Desconhecido", author: "Curador Alaric" },
  { id: "monumento-portal-dos-migrantes", title: "Portal dos Migrantes", category: "monumentos", description: "Um portal de pedra erguido em memória à Grande Migração.", pages: ["Fica numa encruzilhada que, segundo alguns relatos, era o ponto de partida da migração. Outros dizem que o verdadeiro ponto de partida ficava em outra região inteiramente."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🗿", year: "Era da Grande Migração", author: "Curador Alaric" },
  { id: "monumento-sino-da-primeira-torre", title: "Sino da Primeira Torre", category: "monumentos", description: "O sino original da primeira torre de vigia erguida no Reino, hoje exposto no Museu.", pages: ["Ainda funciona, segundo Alaric, mas ele se recusa a tocá-lo — diz que prefere não descobrir se ainda significa o mesmo aviso de séculos atrás."], status: "conhecido", locked: false, unlockCondition: "Disponível desde o início", icon: "🗿", year: "Era da Primeira Fundação", author: "Curador Alaric" },
];
