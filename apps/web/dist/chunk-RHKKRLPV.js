import {
  allRegionIds,
  getRegionName
} from "./chunk-S4O55MUY.js";
import {
  hasRemembered
} from "./chunk-MU4C5JPO.js";

// apps/web/src/lib/personalTimeline.ts
var STORAGE_KEY = "streamrpg_personal_timeline";
var MAX_EVENTS = 20;
function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function recordEvent(kind, meta) {
  const events = readAll();
  events.unshift({ kind, at: Date.now(), meta });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(0, MAX_EVENTS)));
}
function getRecentEvents(limit = MAX_EVENTS) {
  return readAll().slice(0, limit);
}
var ECHO_RULES = [
  {
    key: "echo_bestiary",
    requiresKey: "first_bestiary_entry",
    icon: "\u{1F50D}",
    text: "Dizem que uma nova esp\xE9cie foi registrada recentemente no Besti\xE1rio do Reino."
  },
  {
    key: "echo_library",
    requiresKey: "first_book_read",
    icon: "\u{1F4DA}",
    text: "Alguns registros novos ainda esperam cataloga\xE7\xE3o na Biblioteca."
  },
  {
    key: "echo_museum",
    requiresKey: "museum_return_recorded",
    icon: "\u{1F5BC}\uFE0F",
    text: "O Museu recebeu novas pe\xE7as para avalia\xE7\xE3o recentemente."
  },
  {
    key: "echo_tavern",
    requiresKey: "tavern_regular_recorded",
    icon: "\u{1F37A}",
    text: "Dizem que um rosto conhecido virou presen\xE7a constante na Taverna."
  },
  {
    key: "echo_traveller",
    requiresKey: "traveller_listener_recorded",
    icon: "\u{1F4DC}",
    text: "Um viajante comentou ter encontrado sempre algu\xE9m disposto a ouvir uma boa hist\xF3ria."
  },
  {
    key: "echo_equipment",
    requiresKey: "habit_equipment_shown",
    icon: "\u{1F6E0}\uFE0F",
    text: "Comentam que um aventureiro apareceu com equipamento renovado na Capital."
  },
  {
    key: "echo_regions",
    when: (ctx) => ctx.regionsDiscovered >= 4,
    icon: "\u{1F5FA}\uFE0F",
    text: "Exploradores andam trazendo relatos de regi\xF5es pouco visitadas."
  }
];
function getKingdomEchoes(ctx) {
  const result = [];
  for (const rule of ECHO_RULES) {
    if (hasRemembered(rule.key)) continue;
    const eligible = rule.requiresKey ? hasRemembered(rule.requiresKey) : rule.when ? rule.when(ctx) : false;
    if (eligible) {
      result.push({ id: rule.key, icon: rule.icon, text: rule.text });
    }
  }
  return result;
}

// apps/web/src/lib/travellerStories.ts
var STORY_CATEGORIES = [
  { slug: "misterio", label: "Mist\xE9rio", icon: "\u2754" },
  { slug: "criaturas", label: "Criaturas", icon: "\u{1F43E}" },
  { slug: "ruinas", label: "Ru\xEDnas", icon: "\u{1F3DB}\uFE0F" },
  { slug: "reis_antigos", label: "Reis Antigos", icon: "\u{1F451}" },
  { slug: "objetos_estranhos", label: "Objetos Estranhos", icon: "\u{1F52E}" },
  { slug: "viagens", label: "Viagens", icon: "\u{1F9F3}" },
  { slug: "mar", label: "Mar", icon: "\u{1F30A}" },
  { slug: "floresta", label: "Floresta", icon: "\u{1F332}" },
  { slug: "montanhas", label: "Montanhas", icon: "\u26F0\uFE0F" },
  { slug: "magia", label: "Magia", icon: "\u2728" }
];
var REGION_ICON = {
  "porto-do-amanhecer": "\u{1F305}",
  "bosque-sussurrante": "\u{1F332}",
  "pantano-podre": "\u{1F438}",
  "colinas-aridas": "\u{1F3DC}\uFE0F",
  "planicie-dourada": "\u{1F33E}",
  "minas-abandonadas": "\u26CF\uFE0F",
  "litoral-quebrado": "\u{1F30A}",
  "picos-congelados": "\u{1F3D4}\uFE0F",
  "deserto-de-vidro": "\u{1F537}",
  "ruinas-esquecidas": "\u{1F3DB}\uFE0F",
  "fortaleza-sombria": "\u{1F3F0}"
};
function regionFilterOptions() {
  return allRegionIds().map((id) => ({ slug: id, label: getRegionName(id), icon: REGION_ICON[id] ?? "\u{1F4CD}" }));
}
var TRAVELLER_STORIES = [
  // ---- Mistério ----
  { id: "luzes-sobre-o-lago", title: "Luzes Sobre o Lago", text: "Um pescador jurou ter visto luzes caminhando sobre o lago, uma noite sem lua.", regionId: "porto-do-amanhecer", category: "misterio" },
  { id: "relogio-que-nunca-bate-certo", title: "O Rel\xF3gio que Nunca Bate Certo", text: "Dizem que o rel\xF3gio da torre sempre atrasa um minuto, todos os dias, desde sempre.", regionId: "porto-do-amanhecer", category: "misterio" },
  { id: "sombra-que-segue-de-longe", title: "A Sombra que Segue de Longe", text: "Um viajante contou ter sido seguido por uma sombra que nunca se aproximava nem se afastava.", regionId: "colinas-aridas", category: "misterio" },
  { id: "segundo-reflexo", title: "O Segundo Reflexo", text: "Uma mulher jura que, por um instante, seu reflexo na \xE1gua piscou fora de tempo.", regionId: "planicie-dourada", category: "misterio" },
  { id: "pegadas-que-voltam", title: "As Pegadas que Voltam", text: "Encontraram pegadas na neve que iam e voltavam, mas nunca cruzavam com outras.", regionId: "picos-congelados", category: "misterio" },
  { id: "sino-sem-motivo", title: "O Sino Sem Motivo", text: "Moradores contam que, certas noites, um sino toca em algum lugar que ningu\xE9m consegue localizar.", regionId: "porto-do-amanhecer", category: "misterio" },
  { id: "porta-que-muda-de-lugar", title: "A Porta que Muda de Lugar", text: "Dizem que uma porta antiga aparece em paredes diferentes, dependendo de quem procura.", regionId: "ruinas-esquecidas", category: "misterio" },
  { id: "homem-que-perguntou-as-horas", title: "O Homem que Perguntou as Horas", text: "Um estranho perguntou as horas a tr\xEAs pessoas diferentes, no mesmo instante, em lugares distantes.", regionId: "planicie-dourada", category: "misterio" },
  { id: "vela-que-nao-apaga", title: "A Vela que N\xE3o Apaga", text: "H\xE1 uma vela na capela velha que, dizem, nunca foi vista apagada, nem acesa.", regionId: "porto-do-amanhecer", category: "misterio" },
  { id: "eco-atrasado", title: "O Eco Atrasado", text: "Alguns juram que, nas Colinas \xC1ridas, o eco de um grito demora exatamente um dia para responder.", regionId: "colinas-aridas", category: "misterio" },
  // ---- Criaturas ----
  { id: "lobo-de-olhos-claros", title: "O Lobo de Olhos Claros", text: "Ca\xE7adores contam sobre um lobo com olhos claros demais que nunca ataca, s\xF3 observa.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "serpente-que-fala-baixo", title: "A Serpente que Fala Baixo", text: "Dizem que uma serpente do Deserto de Vidro sussurra antes de atacar, como um aviso.", regionId: "deserto-de-vidro", category: "criaturas" },
  { id: "cervo-de-chifres-torcidos", title: "O Cervo de Chifres Torcidos", text: "Um cervo com chifres estranhamente torcidos foi visto tr\xEAs vezes, sempre no mesmo lugar.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "peixe-que-sabe-nomes", title: "O Peixe que Sabe Nomes", text: "Pescadores do Litoral Quebrado juram que um peixe grande j\xE1 chamou algu\xE9m pelo nome.", regionId: "litoral-quebrado", category: "criaturas" },
  { id: "aranha-do-tamanho-de-um-prato", title: "A Aranha do Tamanho de um Prato", text: "Mineiros contam sobre uma aranha enorme que s\xF3 aparece quando ningu\xE9m est\xE1 sozinho.", regionId: "minas-abandonadas", category: "criaturas" },
  { id: "urso-que-chora-a-noite", title: "O Urso que Chora \xE0 Noite", text: "Moradores das colinas dizem ouvir um som parecido com choro, vindo de um urso que ningu\xE9m encontra de dia.", regionId: "colinas-aridas", category: "criaturas" },
  { id: "corvo-que-conta-ate-tres", title: "O Corvo que Conta At\xE9 Tr\xEAs", text: "Um corvo espec\xEDfico \xE9 visto sempre em grupos de tr\xEAs, nunca mais, nunca menos.", regionId: "porto-do-amanhecer", category: "criaturas" },
  { id: "criatura-do-pantano-sem-nome", title: "A Criatura do P\xE2ntano Sem Nome", text: "Ningu\xE9m colocou nome na coisa que se move no P\xE2ntano Podre. Achar um nome parece perigoso.", regionId: "pantano-podre", category: "criaturas" },
  { id: "gigante-gentil", title: "O Gigante Gentil", text: "Uma crian\xE7a voltou da floresta dizendo que conversou com um gigante gentil, que s\xF3 queria companhia.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "cao-sem-dono-que-sempre-aparece", title: "O C\xE3o Sem Dono que Sempre Aparece", text: "Um c\xE3o sem dono aparente \xE9 visto ajudando viajantes perdidos, e depois desaparece.", regionId: "planicie-dourada", category: "criaturas" },
  // ---- Ruínas ----
  { id: "cavaleiro-da-ponte-velha", title: "O Cavaleiro da Ponte Velha", text: "H\xE1 quem diga que um cavaleiro continua protegendo uma ponte, mesmo depois de morto.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "sala-que-ninguem-encontra-duas-vezes", title: "A Sala que Ningu\xE9m Encontra Duas Vezes", text: "Exploradores contam sobre uma sala nas Ru\xEDnas que nunca conseguem achar de novo.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "passos-debaixo-da-pedra", title: "Os Passos Debaixo da Pedra", text: "Alguns viajantes evitam atravessar as Ru\xEDnas Esquecidas durante a madrugada, por causa dos passos.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "estatua-que-muda-de-postura", title: "A Est\xE1tua que Muda de Postura", text: "Dizem que uma das est\xE1tuas das ru\xEDnas est\xE1 sempre numa posi\xE7\xE3o diferente da \xFAltima vez.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "portal-que-nao-leva-a-lugar-nenhum", title: "O Portal que N\xE3o Leva a Lugar Nenhum", text: "Um portal de pedra isolado continua de p\xE9, sem levar a lugar algum \u2014 ou levando a algum lugar que ningu\xE9m contou.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "voz-na-fortaleza-sombria", title: "A Voz na Fortaleza Sombria", text: "Guardas juram ouvir uma voz calma vindo do interior da Fortaleza Sombria, mesmo sabendo que est\xE1 vazia.", regionId: "fortaleza-sombria", category: "ruinas" },
  { id: "trono-vazio-que-range", title: "O Trono Vazio que Range", text: "Contam que o trono abandonado da Fortaleza range como se algu\xE9m ainda sentasse nele.", regionId: "fortaleza-sombria", category: "ruinas" },
  { id: "inscricoes-que-mudam", title: "As Inscri\xE7\xF5es que Mudam", text: "Estudiosos discordam se as inscri\xE7\xF5es das Ru\xEDnas realmente mudam, ou se \xE9 s\xF3 a mem\xF3ria que falha.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "templo-dentro-do-templo", title: "O Templo Dentro do Templo", text: "Uma c\xE2mara mais antiga que o resto das Ru\xEDnas foi encontrada, e ningu\xE9m sabe explicar a diferen\xE7a de idade.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "guardiao-que-nao-ataca", title: "O Guardi\xE3o que N\xE3o Ataca", text: "Um vigia de pedra na Fortaleza Sombria nunca se moveu, mas ningu\xE9m garante que ele n\xE3o possa.", regionId: "fortaleza-sombria", category: "ruinas" },
  // ---- Reis antigos ----
  { id: "rei-que-nunca-foi-coroado", title: "O Rei que Nunca Foi Coroado", text: "Contam que um rei governou por anos sem nunca aceitar a coroa oficialmente.", regionId: "planicie-dourada", category: "reis_antigos" },
  { id: "rainha-que-sumiu-na-neblina", title: "A Rainha que Sumiu na Neblina", text: "Uma rainha antiga teria desaparecido numa neblina espessa, e nunca mais foi vista.", regionId: "porto-do-amanhecer", category: "reis_antigos" },
  { id: "ultimo-decreto-nao-lido", title: "O \xDAltimo Decreto N\xE3o Lido", text: "Dizem que existe um decreto de um rei antigo que nunca foi lido em voz alta at\xE9 hoje.", regionId: "porto-do-amanhecer", category: "reis_antigos" },
  { id: "rei-que-conversava-com-pedras", title: "O Rei que Conversava com Pedras", text: "Um governante antigo era famoso por falar sozinho com pedras, como se elas respondessem.", regionId: "colinas-aridas", category: "reis_antigos" },
  { id: "coroa-perdida-nas-minas", title: "A Coroa Perdida nas Minas", text: "H\xE1 quem acredite que uma coroa antiga ainda est\xE1 enterrada nas Minas Abandonadas.", regionId: "minas-abandonadas", category: "reis_antigos" },
  { id: "rei-sem-nome-nos-registros", title: "O Rei Sem Nome nos Registros", text: "Um reinado inteiro existe nos relatos populares, mas nenhum registro oficial confirma o nome do rei.", regionId: "porto-do-amanhecer", category: "reis_antigos" },
  { id: "promessa-feita-ao-deserto", title: "A Promessa Feita ao Deserto", text: "Contam que um rei antigo fez uma promessa ao Deserto de Vidro, e que o deserto ainda espera.", regionId: "deserto-de-vidro", category: "reis_antigos" },
  { id: "trono-afundado", title: "O Trono Afundado", text: "Dizem que um trono inteiro afundou lentamente no P\xE2ntano Podre, com o tempo.", regionId: "pantano-podre", category: "reis_antigos" },
  { id: "rei-que-nunca-envelheceu", title: "O Rei que Nunca Envelheceu", text: "Um relato antigo insiste que um certo rei nunca pareceu envelhecer, at\xE9 desaparecer de vez.", regionId: "planicie-dourada", category: "reis_antigos" },
  { id: "ultima-ceia-do-rei-esquecido", title: "A \xDAltima Ceia do Rei Esquecido", text: "Contam que a \xFAltima refei\xE7\xE3o de um rei esquecido ainda est\xE1 representada em um mural desbotado.", regionId: "ruinas-esquecidas", category: "reis_antigos" },
  // ---- Objetos estranhos ----
  { id: "moinho-sem-vento", title: "O Moinho Sem Vento", text: "O velho moinho continua funcionando mesmo sem vento.", regionId: "planicie-dourada", category: "objetos_estranhos" },
  { id: "chave-que-nao-serve-em-nada", title: "A Chave que N\xE3o Serve em Nada", text: "Uma chave antiga passa de m\xE3o em m\xE3o, mas ningu\xE9m encontrou a porta que ela abre.", regionId: "porto-do-amanhecer", category: "objetos_estranhos" },
  { id: "espelho-que-chega-atrasado", title: "O Espelho que Chega Atrasado", text: "Um espelho antigo mostra o reflexo um instante depois do esperado, segundo quem j\xE1 usou.", regionId: "porto-do-amanhecer", category: "objetos_estranhos" },
  { id: "relogio-que-conta-ao-contrario", title: "O Rel\xF3gio que Conta ao Contr\xE1rio", text: "Um rel\xF3gio de bolso encontrado nas Ru\xEDnas conta as horas de tr\xE1s para frente.", regionId: "ruinas-esquecidas", category: "objetos_estranhos" },
  { id: "lampada-que-nunca-apaga-sozinha", title: "A L\xE2mpada que Nunca Apaga Sozinha", text: "Uma l\xE2mpada de \xF3leo \xE9 famosa por nunca se apagar, mesmo sem ningu\xE9m reabastec\xEA-la.", regionId: "minas-abandonadas", category: "objetos_estranhos" },
  { id: "bau-que-ninguem-consegue-abrir", title: "O Ba\xFA que Ningu\xE9m Consegue Abrir", text: "Um ba\xFA de ferro segue fechado h\xE1 gera\xE7\xF5es, e ningu\xE9m encontrou a fechadura certa.", regionId: "fortaleza-sombria", category: "objetos_estranhos" },
  { id: "bussola-que-aponta-para-dentro", title: "A B\xFAssola que Aponta para Dentro", text: "Uma b\xFAssola estranha aponta sempre para o centro do Deserto de Vidro, n\xE3o para o norte.", regionId: "deserto-de-vidro", category: "objetos_estranhos" },
  { id: "sino-que-ninguem-ouve-igual", title: "O Sino que Ningu\xE9m Ouve Igual", text: "Cada pessoa que ouve o sino da torre descreve um som diferente do anterior.", regionId: "porto-do-amanhecer", category: "objetos_estranhos" },
  { id: "luva-que-aparece-sozinha", title: "A Luva que Aparece Sozinha", text: "Dizem que, de vez em quando, uma luva surge sozinha em lugares onde ningu\xE9m a deixou.", regionId: "porto-do-amanhecer", category: "objetos_estranhos" },
  { id: "cajado-deixado-na-neve", title: "O Cajado Deixado na Neve", text: "Um cajado antigo permanece cravado na neve dos Picos Congelados, imune ao tempo.", regionId: "picos-congelados", category: "objetos_estranhos" },
  // ---- Viagens ----
  { id: "viajante-que-nunca-chegou", title: "O Viajante que Nunca Chegou", text: "Um mercador partiu para outro Reino e nunca chegou, nem voltou, nem foi encontrado.", regionId: "planicie-dourada", category: "viagens" },
  { id: "estrada-que-ninguem-reconhece-duas-vezes", title: "A Estrada que Ningu\xE9m Reconhece Duas Vezes", text: "Alguns viajantes contam ter seguido uma estrada que, na volta, parecia completamente diferente.", regionId: "colinas-aridas", category: "viagens" },
  { id: "grupo-que-voltou-em-menos-tempo", title: "O Grupo que Voltou em Menos Tempo", text: "Um grupo de viajantes voltou de uma jornada longa em menos tempo do que deveria ser fisicamente poss\xEDvel.", regionId: "planicie-dourada", category: "viagens" },
  { id: "carroca-sem-cavalo", title: "A Carro\xE7a Sem Cavalo", text: "Contam que uma carro\xE7a foi vista se movendo sozinha por uma estrada vazia.", regionId: "planicie-dourada", category: "viagens" },
  { id: "mapa-que-nao-bate-com-o-caminho", title: "O Mapa que N\xE3o Bate com o Caminho", text: "Um mapa antigo mostra uma estrada que n\xE3o existe mais, ou talvez nunca tenha existido.", regionId: "colinas-aridas", category: "viagens" },
  { id: "viajante-que-trocou-de-nome-no-caminho", title: "O Viajante que Trocou de Nome no Caminho", text: "Um homem chegou a um vilarejo com um nome diferente do que usava ao partir de outro.", regionId: "porto-do-amanhecer", category: "viagens" },
  { id: "ponte-que-so-aparece-a-noite", title: "A Ponte que S\xF3 Aparece \xE0 Noite", text: "Viajantes juram ter atravessado uma ponte que, de dia, simplesmente n\xE3o est\xE1 l\xE1.", regionId: "pantano-podre", category: "viagens" },
  { id: "atalho-que-ninguem-recomenda-duas-vezes", title: "O Atalho que Ningu\xE9m Recomenda Duas Vezes", text: "Um atalho famoso encurta a viagem, mas quem o usa nunca quer contar o que viu no caminho.", regionId: "bosque-sussurrante", category: "viagens" },
  { id: "peso-extra-na-bagagem", title: "O Peso Extra na Bagagem", text: "Um viajante jurou que sua bagagem pesava mais na volta do que na ida, sem nada ter sido acrescentado.", regionId: "deserto-de-vidro", category: "viagens" },
  { id: "caravana-que-ninguem-viu-partir", title: "A Caravana que Ningu\xE9m Viu Partir", text: "Moradores contam sobre uma caravana que ningu\xE9m viu chegar, mas que todos garantem ter visto partir.", regionId: "planicie-dourada", category: "viagens" },
  // ---- Mar ----
  { id: "navio-que-encalhou-longe-da-agua", title: "O Navio que Encalhou Longe da \xC1gua", text: "Um casco partido foi encontrado longe demais da \xE1gua para ter encalhado numa tempestade normal.", regionId: "litoral-quebrado", category: "mar" },
  { id: "voz-debaixo-das-ondas", title: "A Voz Debaixo das Ondas", text: "Pescadores contam ter ouvido uma voz cantando debaixo da \xE1gua, em noites calmas.", regionId: "litoral-quebrado", category: "mar" },
  { id: "farol-que-acende-sozinho", title: "O Farol que Acende Sozinho", text: "Um farol abandonado \xE0s vezes acende sozinho, segundo quem mora por perto.", regionId: "litoral-quebrado", category: "mar" },
  { id: "rede-que-sempre-volta-vazia", title: "A Rede que Sempre Volta Vazia num Certo Dia", text: "Uma vez por ano, dizem os pescadores, nenhuma rede traz nada, n\xE3o importa onde seja lan\xE7ada.", regionId: "litoral-quebrado", category: "mar" },
  { id: "marinheiro-que-nunca-envelheceu-no-mar", title: "O Marinheiro que Nunca Envelheceu no Mar", text: "Um velho marujo jura ter conhecido, na juventude, um marinheiro que parecia sempre da mesma idade.", regionId: "litoral-quebrado", category: "mar" },
  { id: "mercadora-do-navio-fantasma", title: "A Mercadora do Navio Fantasma", text: "Contam sobre uma mercadora que aparece vendendo objetos estranhos, sempre vinda de um navio que ningu\xE9m mais v\xEA.", regionId: "litoral-quebrado", category: "mar" },
  { id: "conchas-que-sussurram", title: "As Conchas que Sussurram", text: "Algumas conchas do litoral, dizem, sussurram quando encostadas no ouvido, mas ningu\xE9m concorda no que dizem.", regionId: "litoral-quebrado", category: "mar" },
  { id: "naufragio-que-se-move", title: "O Naufr\xE1gio que Se Move", text: "Um naufr\xE1gio antigo parece estar mais perto da vila a cada ano, sem que ningu\xE9m o tenha movido.", regionId: "litoral-quebrado", category: "mar" },
  { id: "mare-que-chegou-sem-aviso", title: "A Mar\xE9 que Chegou Sem Aviso", text: "Uma mar\xE9 alta incomum chegou sem qualquer sinal de tempestade, e ningu\xE9m soube explicar por qu\xEA.", regionId: "litoral-quebrado", category: "mar" },
  { id: "pescador-que-trouxe-algo-que-nao-devia", title: "O Pescador que Trouxe Algo que N\xE3o Devia", text: "Um pescador puxou algo em sua rede que ele nunca descreveu para ningu\xE9m, e nunca mais pescou.", regionId: "litoral-quebrado", category: "mar" },
  // ---- Floresta ----
  { id: "arvore-que-respondeu", title: "A \xC1rvore que Respondeu", text: "Disseram que uma \xE1rvore respondeu quando um aventureiro pediu ajuda, no Bosque Sussurrante.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "caminho-que-sussurra-nomes", title: "O Caminho que Sussurra Nomes", text: "Viajantes contam ouvir seus pr\xF3prios nomes sussurrados entre as \xE1rvores, sem ningu\xE9m por perto.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "clareira-que-nao-aparece-no-mapa", title: "A Clareira que N\xE3o Aparece no Mapa", text: "Uma clareira perfeita foi encontrada no meio do bosque, mas nenhum mapa a registra.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "musgo-que-cresce-em-forma-de-letras", title: "O Musgo que Cresce em Forma de Letras", text: "Alguns juram ter visto musgo crescendo em padr\xF5es parecidos com letras antigas.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "aves-que-silenciam-juntas", title: "As Aves que Silenciam Juntas", text: "H\xE1 momentos em que todos os p\xE1ssaros do bosque param de cantar ao mesmo tempo, sem motivo aparente.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "cabana-vazia-sempre-arrumada", title: "A Cabana Vazia Sempre Arrumada", text: "Uma cabana abandonada no bosque est\xE1 sempre limpa, embora ningu\xE9m confesse cuidar dela.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "riacho-que-muda-de-direcao", title: "O Riacho que Muda de Dire\xE7\xE3o", text: "Moradores locais dizem que um riacho pequeno j\xE1 mudou de dire\xE7\xE3o mais de uma vez, sem chuva ou motivo.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "nevoa-que-so-cobre-uma-arvore", title: "A N\xE9voa que S\xF3 Cobre uma \xC1rvore", text: "Uma n\xE9voa estranha \xE0s vezes cobre s\xF3 uma \xE1rvore espec\xEDfica, mesmo em dias claros.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "eco-que-devolve-outra-voz", title: "O Eco que Devolve Outra Voz", text: "Algu\xE9m gritou no bosque e jura ter ouvido de volta uma voz que n\xE3o era a sua.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "raizes-que-formam-um-rosto", title: "As Ra\xEDzes que Formam um Rosto", text: "Um conjunto de ra\xEDzes expostas parece, para alguns, formar um rosto \u2014 mas nunca o mesmo rosto duas vezes.", regionId: "bosque-sussurrante", category: "floresta" },
  // ---- Montanhas ----
  { id: "grito-que-vem-do-topo", title: "O Grito que Vem do Topo", text: "Moradores das redondezas contam ouvir um grito vindo do topo dos Picos Congelados, sem nunca ver quem grita.", regionId: "picos-congelados", category: "montanhas" },
  { id: "trilha-que-termina-no-nada", title: "A Trilha que Termina no Nada", text: "Uma trilha talhada na rocha termina abruptamente num penhasco, sem explica\xE7\xE3o de para onde levava.", regionId: "picos-congelados", category: "montanhas" },
  { id: "viajante-congelado-que-ainda-sorri", title: "O Viajante Congelado que Ainda Sorri", text: "Contam sobre um viajante encontrado congelado nas montanhas, com uma express\xE3o calma demais para o frio.", regionId: "picos-congelados", category: "montanhas" },
  { id: "neve-que-nao-derrete-num-ponto-so", title: "A Neve que N\xE3o Derrete num Ponto S\xF3", text: "H\xE1 um ponto espec\xEDfico nos Picos onde a neve nunca derrete, nem no ver\xE3o mais quente.", regionId: "picos-congelados", category: "montanhas" },
  { id: "sino-da-montanha", title: "O Sino da Montanha", text: "Alguns dizem ouvir um sino distante nas Colinas \xC1ridas, embora n\xE3o haja nenhum sino conhecido por l\xE1.", regionId: "colinas-aridas", category: "montanhas" },
  { id: "caverna-que-ninguem-mediu-ate-o-fim", title: "A Caverna que Ningu\xE9m Mediu At\xE9 o Fim", text: "Uma caverna nas colinas nunca foi completamente explorada \u2014 quem tenta, sempre volta antes do fim.", regionId: "colinas-aridas", category: "montanhas" },
  { id: "vento-que-fala-baixo", title: "O Vento que Fala Baixo", text: "Pastores das colinas juram que o vento, em certas noites, parece formar palavras.", regionId: "colinas-aridas", category: "montanhas" },
  { id: "pedra-que-aquece-sozinha", title: "A Pedra que Aquece Sozinha", text: "Uma pedra espec\xEDfica nas colinas est\xE1 sempre morna, mesmo nas noites mais frias.", regionId: "colinas-aridas", category: "montanhas" },
  { id: "rebanho-que-segue-sozinho", title: "O Rebanho que Segue Sozinho", text: "Um rebanho foi visto se movendo em forma\xE7\xE3o organizada, sem nenhum pastor por perto.", regionId: "colinas-aridas", category: "montanhas" },
  { id: "passagem-que-so-alguns-encontram", title: "A Passagem que S\xF3 Alguns Encontram", text: "Dizem que existe uma passagem nos Picos Congelados que s\xF3 aparece para quem realmente precisa dela.", regionId: "picos-congelados", category: "montanhas" },
  // ---- Magia ----
  { id: "feitico-que-ninguem-lancou", title: "O Feiti\xE7o que Ningu\xE9m Lan\xE7ou", text: "Zoltar jura ter sentido um feiti\xE7o se formar no ar, sem ningu\xE9m por perto para lan\xE7\xE1-lo.", regionId: "porto-do-amanhecer", category: "magia" },
  { id: "luz-que-cura-sem-ser-pedida", title: "A Luz que Cura Sem Ser Pedida", text: "Contam sobre uma luz vista no P\xE2ntano Podre que parece aliviar feridas, sem que ningu\xE9m a tenha invocado.", regionId: "pantano-podre", category: "magia" },
  { id: "livro-que-se-escreve-sozinho", title: "O Livro que Se Escreve Sozinho", text: "Miriam guarda um livro que, segundo boatos antigos, ganha novas p\xE1ginas sem ningu\xE9m escrever.", regionId: "porto-do-amanhecer", category: "magia" },
  { id: "fumaca-que-forma-simbolos", title: "A Fuma\xE7a que Forma S\xEDmbolos", text: "Alquimistas relatam que certa fuma\xE7a, ao se dissipar, forma s\xEDmbolos que ningu\xE9m consegue copiar a tempo.", regionId: "porto-do-amanhecer", category: "magia" },
  { id: "anel-que-esquenta-perto-de-perigo", title: "O Anel que Esquenta Perto de Perigo", text: "Um anel antigo \xE9 famoso por esquentar sempre que o perigo se aproxima do dono.", regionId: "deserto-de-vidro", category: "magia" },
  { id: "chama-que-nao-queima", title: "A Chama que N\xE3o Queima", text: "Uma fogueira nas Ru\xEDnas Esquecidas queima sem consumir a lenha, segundo quem j\xE1 viu de perto.", regionId: "ruinas-esquecidas", category: "magia" },
  { id: "sussurro-que-ensina-feiticos", title: "O Sussurro que Ensina Feiti\xE7os", text: "Um aprendiz jurou ter aprendido um feiti\xE7o simplesmente ouvindo um sussurro vindo do nada.", regionId: "porto-do-amanhecer", category: "magia" },
  { id: "agua-que-reflete-outro-lugar", title: "A \xC1gua que Reflete Outro Lugar", text: "Um po\xE7o no Bosque Sussurrante \xE0s vezes reflete uma paisagem que n\xE3o \xE9 a do bosque ao redor.", regionId: "bosque-sussurrante", category: "magia" },
  { id: "circulo-que-aparece-na-terra-queimada", title: "O C\xEDrculo que Aparece na Terra Queimada", text: "Um c\xEDrculo perfeito de terra queimada surge, some, e reaparece em outro lugar da Plan\xEDcie Dourada.", regionId: "planicie-dourada", category: "magia" },
  { id: "magia-que-zoltar-nao-explica", title: "A Magia que Zoltar N\xE3o Explica", text: "Zoltar se recusa a comentar certos boatos sobre magia antiga. Isso, por si s\xF3, j\xE1 \xE9 um boato.", regionId: "porto-do-amanhecer", category: "magia" },
  // ---- Sprint Wolves Ecosystem (Phase I) — 10 histórias sobre os Lobos
  // do Bosque Sussurrante e variantes regionais, mesma categoria já usada
  // por "lobo-de-olhos-claros" (Traveller Stories original).
  { id: "uivo-que-lidera", title: "O Uivo que Lidera", text: "Ca\xE7adores dizem reconhecer o uivo do Lobo Alfa entre todos os outros \u2014 mais grave, mais longo, e ouvido s\xF3 uma vez por ca\xE7ada.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "loba-que-anda-sozinha", title: "A Loba que Anda Sozinha", text: "Contam que uma loba de pelagem clara ca\xE7a longe da matilha, sempre voltando antes do amanhecer.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "filhote-que-seguiu-um-viajante", title: "O Filhote que Seguiu um Viajante", text: "Um mercador jura que um filhote de lobo o seguiu por dois dias inteiros, sem nunca se aproximar o bastante para ser tocado.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "lobos-que-nao-cacam-em-bando", title: "Os Lobos que N\xE3o Ca\xE7am em Bando", text: "Nas Colinas \xC1ridas, dizem que os lobos ca\xE7am sozinhos \u2014 a terra ali n\xE3o sustenta uma matilha inteira.", regionId: "colinas-aridas", category: "criaturas" },
  { id: "lobo-que-nada-no-pantano", title: "O Lobo que Nada no P\xE2ntano", text: "Um ca\xE7ador afirma ter visto um lobo atravessar um trecho de \xE1gua parada como se fosse ch\xE3o firme.", regionId: "pantano-podre", category: "criaturas" },
  { id: "presas-que-brilham-na-neve", title: "As Presas que Brilham na Neve", text: "Exploradores dos Picos Congelados contam sobre um lobo cujas presas pareciam refletir a luz da lua.", regionId: "picos-congelados", category: "criaturas" },
  { id: "matilha-que-cerca-em-silencio", title: "A Matilha que Cerca em Sil\xEAncio", text: "Dizem que uma matilha inteira consegue cercar um viajante sem que ele perceba, at\xE9 ser tarde demais.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "lobo-com-cicatriz-no-focinho", title: "O Lobo com uma Cicatriz no Focinho", text: "Alguns ca\xE7adores juram reconhecer sempre o mesmo lobo \u2014 marcado, magro, e imposs\xEDvel de encurralar.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "noite-em-que-os-lobos-nao-uivaram", title: "A Noite em que os Lobos N\xE3o Uivaram", text: "Moradores do Bosque Sussurrante contam sobre uma \xFAnica noite, h\xE1 anos, em que nenhum lobo uivou \u2014 e ningu\xE9m soube dizer por qu\xEA.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "rastro-que-termina-no-nada", title: "O Rastro que Termina no Nada", text: "Um batedor contou ter seguido pegadas de lobo por horas, at\xE9 elas simplesmente pararem de existir, no meio do caminho.", regionId: "bosque-sussurrante", category: "criaturas" },
  // ---- Sprint Ravens Ecosystem (Phase I) — 10 histórias sobre os
  // Corvos do Reino, sempre deixando dúvida (categoria "misterio").
  { id: "corvo-que-sabe-o-nome", title: "O Corvo que Sabe o Nome", text: "Um viajante jura que um corvo grasnou o nome dele, claro como qualquer palavra. Ningu\xE9m mais ouviu.", regionId: "porto-do-amanhecer", category: "misterio" },
  { id: "bando-que-apareceu-do-nada", title: "O Bando que Apareceu do Nada", text: "Centenas de corvos surgiram de uma vez sobre as Ru\xEDnas Esquecidas, e sumiram antes que algu\xE9m contasse todos.", regionId: "ruinas-esquecidas", category: "misterio" },
  { id: "corvo-que-seguiu-por-anos", title: "O Corvo que Seguiu por Anos", text: "Um ca\xE7ador afirma reconhecer o mesmo corvo observando-o h\xE1 anos, em regi\xF5es diferentes do Reino.", regionId: "bosque-sussurrante", category: "misterio" },
  { id: "pena-que-nunca-envelhece", title: "A Pena que Nunca Envelhece", text: "Uma pena negra encontrada nos Picos Congelados nunca murchou, nem depois de anos guardada.", regionId: "picos-congelados", category: "misterio" },
  { id: "silencio-antes-do-voo", title: "O Sil\xEAncio Antes do Voo", text: "Moradores do Bosque Sussurrante contam que, pouco antes de a matilha de lobos ca\xE7ar, os corvos somem por completo.", regionId: "bosque-sussurrante", category: "misterio" },
  { id: "corvo-que-entrega-mensagens", title: "O Corvo que Entrega Mensagens", text: "Um mercador jura que um corvo entregou um bilhete perdido exatamente \xE0 pessoa certa, sem nenhuma explica\xE7\xE3o.", regionId: "porto-do-amanhecer", category: "misterio" },
  { id: "ninho-que-ninguem-alcanca", title: "O Ninho que Ningu\xE9m Alcan\xE7a", text: "Um ninho foi avistado alto demais nas montanhas para qualquer escalada. Ningu\xE9m sabe quem construiu.", regionId: "picos-congelados", category: "misterio" },
  { id: "corvo-que-observou-a-expedicao", title: "O Corvo que Observou a Expedi\xE7\xE3o Inteira", text: "Um grupo de exploradores jura ter sido observado por um \xFAnico corvo do in\xEDcio ao fim de uma travessia inteira.", regionId: "colinas-aridas", category: "misterio" },
  { id: "corvo-parado-na-lapide", title: "O Corvo Parado na L\xE1pide", text: "Um corvo ficou dias inteiros sobre uma l\xE1pide vazia nas Ru\xEDnas Esquecidas, sem se mover.", regionId: "ruinas-esquecidas", category: "misterio" },
  { id: "pergunta-que-o-corvo-respondeu", title: "A Pergunta que o Corvo Respondeu", text: "Um estudioso jura ter feito uma pergunta em voz alta, sozinho, e ouvido um grasnido como se fosse resposta.", regionId: "porto-do-amanhecer", category: "misterio" },
  // ---- Sprint Ancient Ruins Ecosystem (Phase I) — 15 histórias, cada
  // uma ocorrida numa Ruína Antiga diferente (categoria "ruinas").
  { id: "coluna-que-nao-faz-sombra-certa", title: "A Coluna que N\xE3o Faz Sombra Certa", text: "Um viajante jura que a sombra da Coluna Partida do Horizonte nunca aponta pra onde o sol est\xE1.", regionId: "planicie-dourada", category: "ruinas" },
  { id: "porta-que-nao-leva-a-lugar-nenhum", title: "A Porta que N\xE3o Leva a Lugar Nenhum", text: "Um explorador contou ter atravessado o Port\xE3o Sem Muro dez vezes seguidas, sempre chegando exatamente onde come\xE7ou.", regionId: "colinas-aridas", category: "ruinas" },
  { id: "passos-do-outro-lado-da-escada", title: "Os Passos do Outro Lado da Escada", text: "Um mineiro jura ter ouvido passos vindos de tr\xE1s da parede que corta a Escadaria, nas Minas Abandonadas.", regionId: "minas-abandonadas", category: "ruinas" },
  { id: "rosto-que-a-estatua-nunca-teve", title: "O Rosto que a Est\xE1tua Nunca Teve", text: "Um estudioso contou ter tentado esculpir um rosto na Est\xE1tua Sem Rosto, s\xF3 pra descobrir que a pedra n\xE3o aceita talha nenhuma ali.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "pedra-que-nunca-toca-o-fundo", title: "A Pedra que Nunca Toca o Fundo", text: "Um viajante jogou uma pedra no Po\xE7o Completamente Seco e jura nunca ter ouvido ela bater no fundo.", regionId: "deserto-de-vidro", category: "ruinas" },
  { id: "simbolos-que-mudam-de-lugar", title: "Os S\xEDmbolos que Mudam de Lugar", text: "Um explorador dos Picos Congelados afirma que os s\xEDmbolos do penhasco estavam em posi\xE7\xF5es diferentes na segunda visita.", regionId: "picos-congelados", category: "ruinas" },
  { id: "fogueiras-apagadas-ao-mesmo-tempo", title: "As Fogueiras Apagadas ao Mesmo Tempo", text: "Um batedor do Bosque Sussurrante jura que todas as fogueiras do acampamento antigo pareciam ter sido apagadas no mesmo instante.", regionId: "bosque-sussurrante", category: "ruinas" },
  { id: "mascara-que-nao-afunda-mais", title: "A M\xE1scara que N\xE3o Afunda Mais", text: "Um ca\xE7ador do P\xE2ntano Podre conta que a m\xE1scara enterrada est\xE1 exatamente na mesma altura desde que ele era crian\xE7a.", regionId: "pantano-podre", category: "ruinas" },
  { id: "torre-sem-uma-unica-porta", title: "A Torre Sem Uma \xDAnica Porta", text: "Um pescador do Litoral Quebrado jura ter dado tr\xEAs voltas completas na Torre Sem Entrada, sem achar sequer uma rachadura.", regionId: "litoral-quebrado", category: "ruinas" },
  { id: "bloco-que-ninguem-consegue-mover", title: "O Bloco que Ningu\xE9m Consegue Mover", text: "Um grupo inteiro tentou empurrar o bloco ca\xEDdo do Portal de Pedra da Fronteira. Nenhum deles conseguiu mover um cent\xEDmetro.", regionId: "fortaleza-sombria", category: "ruinas" },
  { id: "eco-que-nunca-se-repete", title: "O Eco que Nunca se Repete", text: "Um viajante jura que gritou o mesmo nome duas vezes na C\xE2mara das Vozes e ouviu ecos completamente diferentes.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "arena-mais-funda-do-que-deveria", title: "A Arena Mais Funda do que Deveria", text: "Um explorador das Colinas \xC1ridas jura que o centro da Arena Afundada \xE9 fundo demais pra ter sido escavado \xE0 m\xE3o.", regionId: "colinas-aridas", category: "ruinas" },
  { id: "segunda-voz-na-camara", title: "A Segunda Voz na C\xE2mara", text: "Um estudioso jura ter ouvido uma segunda voz responder junto com o pr\xF3prio eco, dentro da C\xE2mara das Vozes.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "sombra-que-atravessou-a-torre", title: "A Sombra que Atravessou a Torre", text: "Um marinheiro afirma ter visto uma sombra atravessar a Torre Sem Entrada de um lado ao outro, por dentro de uma parede s\xF3lida.", regionId: "litoral-quebrado", category: "ruinas" },
  { id: "nome-que-ninguem-lembra-de-ter-dito", title: "O Nome que Ningu\xE9m Lembra de Ter Dito", text: "Um viajante jura que a Est\xE1tua Sem Rosto sussurrou um nome \u2014 o dele mesmo \u2014 mas ele nunca tinha dito esse nome em voz alta ali.", regionId: "ruinas-esquecidas", category: "ruinas" },
  // Sprint First WOW Moment (Phase I)
  { id: "aventureiro-que-nunca-trocou-as-luvas", title: "O Aventureiro que Nunca Trocou as Luvas", text: "Contam que um aventureiro guardou as pr\xF3prias luvas rasgadas at\xE9 o fim da carreira, mesmo depois de rico o bastante pra comprar cem pares novos. Ningu\xE9m soube explicar por qu\xEA. Ele tamb\xE9m nunca contou.", regionId: "porto-do-amanhecer", category: "viagens" },
  // Sprint StreamRPG Identity (Phase I)
  { id: "forja-que-nunca-apaga-de-verdade", title: "A Forja que Nunca Apaga de Verdade", text: "Viajantes que passam pela Capital de madrugada juram ver luz saindo da forja do Borin, mesmo nas noites em que ele garante ter ido dormir cedo.", regionId: "porto-do-amanhecer", category: "viagens" },
  { id: "sala-que-o-curador-nunca-mostra", title: "A Sala que o Curador Nunca Mostra", text: "Dizem que existe uma sala no Museu que Alaric nunca abre pra visitantes. Ele nega. Quem insiste, nota que ele muda de assunto r\xE1pido demais.", regionId: "porto-do-amanhecer", category: "misterio" },
  { id: "lobo-que-todos-conhecem-de-ouvir-falar", title: "O Lobo que Todos Conhecem de Ouvir Falar", text: "Ningu\xE9m no Bosque Sussurrante afirma ter visto O Lobo Que N\xE3o Envelhece de perto. Ainda assim, todo morador da regi\xE3o conhece o nome, e conta a hist\xF3ria como se fosse dele.", regionId: "bosque-sussurrante", category: "criaturas" },
  // Sprint StreamRPG Identity (Phase II)
  { id: "mesa-onde-a-rainha-meira-negociou", title: "A Mesa Onde a Rainha Meira Negociou", text: "Moradores da Capital apontam pra uma mesa de taverna espec\xEDfica como o lugar onde a Rainha Meira teria negociado a reunifica\xE7\xE3o dos territ\xF3rios. Nenhum registro confirma. Ningu\xE9m tira a mesa do lugar, por via das d\xFAvidas.", regionId: "porto-do-amanhecer", category: "reis_antigos" },
  { id: "quem-entra-diferente-de-quem-sai", title: "Quem Entra Diferente de Quem Sai", text: "Um grupo inteiro que voltou da Fortaleza Sombria jura que nenhum deles saiu exatamente igual a quem entrou. N\xE3o souberam explicar o que, exatamente, tinha mudado.", regionId: "fortaleza-sombria", category: "misterio" },
  // Sprint Place Identity (Phase I)
  { id: "agua-da-fonte-que-brilhou", title: "A \xC1gua da Fonte que Brilhou", text: "Um viajante jura ter visto a \xE1gua da Fonte da pra\xE7a brilhar, por um instante, numa noite sem lua. Ningu\xE9m mais viu. Ele voltou l\xE1 tr\xEAs noites seguidas, sem sorte.", regionId: "porto-do-amanhecer", category: "misterio" },
  { id: "som-dentro-do-barril-vazio", title: "O Som Dentro do Barril Vazio", text: "Um mercador conta que ouviu um som de l\xEDquido balan\xE7ando dentro do barril vazio da pra\xE7a, mesmo sabendo que est\xE1 seco h\xE1 anos. Bateu de novo. O som n\xE3o voltou.", regionId: "porto-do-amanhecer", category: "objetos_estranhos" },
  { id: "noite-mais-silenciosa-perto-da-ponte", title: "A Noite Mais Silenciosa Perto da Ponte", text: "Um viajante conta que passou uma noite inteira perto da Primeira Ponte e nunca ouviu o rio t\xE3o silencioso, antes ou depois daquela vez.", regionId: "porto-do-amanhecer", category: "viagens" },
  { id: "torre-que-chama-de-longe", title: "A Torre que Chama de Longe", text: "Um guia de caravana jura reconhecer a Torre do Port\xE3o Norte de longe, mesmo na neblina mais fechada. Diz que ela 'chama' quem j\xE1 passou perto dela uma vez.", regionId: "porto-do-amanhecer", category: "viagens" }
];

// apps/web/src/lib/dailyRotation.ts
var DAY_MS = 24 * 60 * 60 * 1e3;
function pickByTime(items, bucketMs = DAY_MS, salt = 0, now = Date.now()) {
  const bucketIndex = Math.floor(now / bucketMs) + salt;
  return items[bucketIndex % items.length];
}
function pickOfTheDay(items, salt = 0, now) {
  return pickByTime(items, DAY_MS, salt, now);
}
function keySalt(key) {
  let sum = 0;
  for (let i = 0; i < key.length; i++) sum += key.charCodeAt(i);
  return sum;
}
function resolveRotatingLine(variants, ctx, salt) {
  if (!variants || variants.length === 0) return null;
  const conditional = variants.find((v) => v.when && v.when(ctx));
  if (conditional) return conditional.line;
  const fixed = variants.filter((v) => !v.when);
  if (fixed.length === 0) return null;
  return pickOfTheDay(fixed, salt).line;
}

// apps/web/src/lib/npcDialogue/borin.ts
var BORIN_DIALOGUE = {
  boas_vindas: [
    "Entra. N\xE3o vou morder.",
    "Chegou na hora certa. Ou errada. Tanto faz.",
    "Bem-vindo \xE0 forja. Cuidado com as brasas.",
    "Mais um vivo. Bom sinal.",
    "Senta a\xED. Ou fica de p\xE9. N\xE3o ligo."
  ],
  primeiro_encontro: [
    "Nunca te vi por aqui. Bom trabalho continuar vivo at\xE9 agora.",
    "Cara nova. Vamos ver quanto tempo dura.",
    "Primeira vez na forja? N\xE3o toca em nada quente.",
    "Voc\xEA \xE9 novo. Isso explica a cara de perdido.",
    "Bem-vindo. Espero que dure mais que minhas \xFAltimas luvas."
  ],
  novato: [
    "Ainda cheira a Capital em voc\xEA.",
    "Relaxa. Todo mundo come\xE7a sem saber segurar uma espada direito.",
    "Vai por partes. Ningu\xE9m nasceu sabendo forjar nada.",
    "Suas m\xE3os ainda tremem. Vai passar.",
    "Novato, hein. J\xE1 vi piores. N\xE3o muitos, mas j\xE1 vi."
  ],
  veterano: [
    "Voc\xEA j\xE1 n\xE3o fica mais impressionado com nada, n\xE9.",
    "Olha essas m\xE3os. J\xE1 pegaram em espada de verdade.",
    "Voc\xEA voltou inteiro de novo. Impressionante ou sorte.",
    "J\xE1 n\xE3o precisa de conselho meu. S\xF3 de equipamento.",
    "Veterano \xE9 aquele que ainda aparece depois de tudo que j\xE1 viu."
  ],
  nivel_alto: [
    "C\xEA t\xE1 forte. N\xE3o vou fingir que n\xE3o notei.",
    "Tem gente que sobe de n\xEDvel. Voc\xEA sobe de m\xE1 vontade em prestar aten\xE7\xE3o nisso.",
    "N\xE3o precisa mais de mim pra nada, n\xE9.",
    "Continua voltando aqui mesmo forte assim. Respeito isso.",
    "Poder n\xE3o enferruja. Bom saber."
  ],
  boss_derrotado: [
    "Ouvi dizer que voc\xEA encarou um Boss. Ainda t\xE1 de uma pe\xE7a, vejo.",
    "Boss derrotado. N\xE3o vou fazer festa, mas... bom trabalho.",
    "Voltou de um Boss e n\xE3o trouxe nada quebrado pra eu consertar? Decepcionante.",
    "Isso a\xED conta hist\xF3ria. N\xE3o vou contar, mas conta.",
    "Sobreviveu a um Boss. As luvas ainda est\xE3o inteiras?"
  ],
  sem_gold: [
    "Sem Gold de novo. Familiar.",
    "N\xE3o vim aqui pra financiar ningu\xE9m.",
    "Fiado, n\xE3o. Aqui n\xE3o \xE9 caridade.",
    "Volta quando tiver moeda. Ou um bom motivo.",
    "T\xE1 liso. Todo mundo t\xE1, em algum momento."
  ],
  muito_gold: [
    "C\xEA t\xE1 rico de repente. Suspeito.",
    "Muito Gold pra algu\xE9m que ainda usa esse equipamento.",
    "N\xE3o vou perguntar de onde veio esse dinheiro todo.",
    "Rico assim e ainda aparece na forja de um ferreiro velho.",
    "Guarda esse dinheiro direito. Ou gasta comigo. Prefiro a segunda."
  ],
  chovendo: [
    "Chuva enferruja tudo. Detesto.",
    "Dia de chuva \xE9 dia de martelo parado.",
    "Chovendo assim, nem os lobos saem da toca.",
    "Guarda o equipamento seco. N\xE3o repito isso duas vezes.",
    "Chuva boa \xE9 a que n\xE3o entra na forja."
  ],
  noite: [
    "Trabalho melhor de noite. Menos gente enchendo o saco.",
    "A forja n\xE3o dorme. Eu tamb\xE9m n\xE3o, aparentemente.",
    "Noite \xE9 hora de martelo e sil\xEAncio.",
    "Se veio de noite, \xE9 s\xE9rio ou \xE9 besteira. Geralmente besteira.",
    "Noite na Capital \xE9 mais honesta que o dia."
  ],
  primeira_visita: [
    "Primeira vez aqui. N\xE3o quebra nada.",
    "Bem-vindo \xE0 forja. Regra \xFAnica: n\xE3o toca no que t\xE1 vermelho.",
    "Essa \xE9 sua primeira vez. Vou fingir que isso me importa.",
    "Olha em volta. Depois volta quando precisar de verdade.",
    "Primeira visita sempre \xE9 s\xF3 curiosidade. Volta quando for necessidade."
  ],
  visitas_repetidas: [
    "Voc\xEA de novo.",
    "Voltou. Achei que tinha desistido de mim.",
    "Essa j\xE1 \xE9 a quantas vezes essa semana?",
    "J\xE1 devia ter sua pr\xF3pria bigorna, do tanto que aparece.",
    "Sempre que penso que n\xE3o vou te ver de novo, c\xE1 est\xE1 voc\xEA."
  ],
  aleatorias: [
    "Martelo bom dura mais que amizade.",
    "Fogo n\xE3o perdoa distra\xE7\xE3o.",
    "A\xE7o bom n\xE3o precisa se explicar.",
    "J\xE1 quebrei mais ferramentas do que promessas. E olha que quebrei bastante promessa.",
    "Trabalho, durmo, repito. Vida simples.",
    // Sprint Social Fabric (Phase I)
    "O Alaric j\xE1 pediu minha bigorna emprestada pro Museu. Falei n\xE3o. Ele ainda pergunta, de vez em quando."
  ],
  humor: [
    "C\xEA j\xE1 tentou consertar bota com martelo? Eu j\xE1. N\xE3o recomendo.",
    "Um dia vou aprender a cozinhar. Hoje n\xE3o \xE9 esse dia.",
    "Minhas m\xE3os s\xE3o ferramentas. Minha cara, nem tanto.",
    "J\xE1 bati o dedo com martelo mais vezes do que consigo admitir.",
    "Se eu risse de tudo que fa\xE7o de errado, riria o dia inteiro.",
    // Sprint Social Fabric (Phase I)
    "O Idris j\xE1 tentou me vender uma 'espada lend\xE1ria' que era s\xF3 ferro comum com ferrugem bonita. Ainda rio disso."
  ],
  conselhos: [
    "Cuida do que usa. O resto se cuida sozinho.",
    "Equipamento ruim mata mais que monstro.",
    "Nunca economiza em bota. Voc\xEA anda com os p\xE9s, n\xE3o com a carteira.",
    "Aprende a afiar sua pr\xF3pria l\xE2mina. Um dia eu n\xE3o vou estar aqui.",
    "Antes de sair por a\xED, checa o equipamento duas vezes.",
    // Sprint Social Fabric (Phase I)
    "Se a cozinha da Taverna pegar fogo de novo, a Greta grita primeiro e eu apare\xE7o com balde direto da forja. J\xE1 aconteceu uma vez. Vai acontecer de novo."
  ],
  fofocas: [
    "Greta sabe de tudo. N\xE3o pergunta como.",
    "Ouvi dizer que a Talia vendeu a mesma espada tr\xEAs vezes. Acredito.",
    "Dorwin reclama de tudo. At\xE9 do pr\xF3prio Gold.",
    "Algu\xE9m falou que o Kade treina sozinho de madrugada. N\xE3o duvido.",
    "N\xE3o repito fofoca. Mas essa era boa.",
    // Sprint Wolves Ecosystem (Phase I)
    "Um lobo j\xE1 roeu o cabo de um martelo esquecido do lado de fora da forja. N\xE3o pergunta como sei.",
    "N\xE3o forjo armadilha pra lobo. Nunca fui esse tipo de ferreiro.",
    "Couro de Lobo Alfa \xE9 raro de achar sem rasgo. O bicho n\xE3o se entrega f\xE1cil, nem morto.",
    // Sprint Ravens Ecosystem (Phase I)
    "Um corvo j\xE1 roubou um prego da bigorna, na minha frente, sem pressa nenhuma.",
    "Corvo n\xE3o atrapalha o trabalho. S\xF3 fica olhando. Isso incomoda mais que atrapalhar.",
    "N\xE3o sei se corvo entende gente. Mas esse a\xED parece saber quando eu t\xF4 de mau humor.",
    // Sprint Kingdom Folklore (Phase I)
    "Conto a hist\xF3ria do Ferreiro que Forja Pesadelos pras crian\xE7as da vizinhan\xE7a. Nunca admito que aprendi ela sendo crian\xE7a tamb\xE9m.",
    "Nunca conserto ferradura depois do p\xF4r do sol. N\xE3o \xE9 supersti\xE7\xE3o \u2014 \xE9 que meu bra\xE7o j\xE1 n\xE3o aguenta depois do jantar.",
    "Toda crian\xE7a que passa pela forja pergunta se eu j\xE1 vi o Ferreiro Fantasma. Digo que n\xE3o. Isso nunca convence ningu\xE9m.",
    // Sprint First WOW Moment (Phase I)
    "Ainda vejo gente sair daqui com luvas rasgadas nas m\xE3os. Um dia, quem sabe, mudo isso.",
    // Sprint StreamRPG Identity (Phase II)
    "J\xE1 forjei r\xE9plica da Presa do Alfa pra uma exposi\xE7\xE3o. A de verdade continua mais afiada, dizem quem j\xE1 viu as duas.",
    // Sprint Place Identity (Phase I)
    "As crian\xE7as brincam em volta daquela \xE1rvore da pra\xE7a desde que eu era aprendiz. Ainda brincam do mesmo jeito.",
    "J\xE1 forjei ferragem nova pra Primeira Ponte, duas vezes na vida. Nunca me disseram por que precisava trocar de novo t\xE3o cedo."
  ],
  comentarios_reino: [
    "Esse Reino se sustenta na teimosia de quem n\xE3o desiste.",
    "Capital continua de p\xE9. Isso j\xE1 \xE9 uma vit\xF3ria.",
    "Reino pequeno, problemas grandes. Sempre foi assim.",
    "As pessoas aqui trabalham demais e reclamam de menos do que deveriam.",
    "Esse Reino tem mais hist\xF3ria do que aparenta.",
    // Sprint History of the Kingdom (Phase I)
    "Dizem que uma tal de Ferra foi 'a primeira ferreira' do Reino. Duvido. Algu\xE9m sempre forjou alguma coisa antes de qualquer registro come\xE7ar.",
    "O Museu tem um monumento pra Primeira Muralha. Eu digo: qualquer parede que ainda protege algu\xE9m j\xE1 merece respeito, com ou sem monumento.",
    "N\xE3o sei quem forjou a primeira ferramenta desse Reino. Sei que algu\xE9m forjou, com as m\xE3os tremendo, sem saber que vinha hist\xF3ria atr\xE1s disso."
  ],
  comentarios_npcs: [
    "Dorwin conta moeda duas vezes. Eu s\xF3 bato o martelo uma.",
    "A Miriam l\xEA demais. Eu leio o suficiente pra saber o pre\xE7o do ferro.",
    "O Roth desconfia at\xE9 da pr\xF3pria sombra.",
    "A Elenya lidera bem. Melhor que eu lideraria, com certeza.",
    "O Yannick fica olhando bicho o dia inteiro. Cada um com sua forja."
  ],
  raras: [
    "Uma vez forjei uma espada que quebrou na primeira batalha. Nunca mais falei sobre isso. At\xE9 agora.",
    "Tive um mestre antes de mim. Ele era pior ferreiro do que eu sou hoje.",
    "J\xE1 pensei em desistir disso tudo. Uma vez. S\xF3 uma.",
    "Guardo a primeira ferramenta que usei. N\xE3o pergunta onde.",
    "Nem tudo que sai daqui quebrado \xE9 falha minha. A maioria, sim, mas nem tudo.",
    // Sprint Social Fabric (Phase I)
    "Ajudei a segurar a linha de suprimento durante a Defesa do Port\xE3o Norte, h\xE1 anos, ao lado do Roth. Nunca fomos pr\xF3ximos depois disso. Tamb\xE9m nunca precisamos ser."
  ],
  extremamente_raras: [
    "Se um dia essa forja apagar de vez, quero que algu\xE9m continue acendendo ela.",
    "Tenho medo de uma coisa s\xF3: que ningu\xE9m mais precise de ferreiro um dia.",
    "J\xE1 fiquei em sil\xEAncio aqui dentro por horas. O fogo estava fraco demais pra algu\xE9m notar.",
    "Se eu sumir um dia, procura minhas ferramentas. O resto n\xE3o importa.",
    "\xC0s vezes penso que o barulho do martelo \xE9 a \xFAnica coisa que me impede de pensar demais."
  ]
};

// apps/web/src/lib/npcDialogue/talia.ts
var TALIA_DIALOGUE = {
  boas_vindas: [
    "Entra, entra! Tenho coisas novas, tenho coisas velhas, tenho de tudo!",
    "Ah, um cliente! Ou um amigo. Aqui \xE9 a mesma coisa!",
    "Bem-vindo \xE0 melhor loja da Capital! Da \xFAnica loja da Capital, mas ainda assim a melhor!",
    "Que bom te ver! Chegou bem a tempo de eu contar uma hist\xF3ria longa!",
    "Entra sem pressa. Ou com pressa. Eu falo r\xE1pido do mesmo jeito."
  ],
  primeiro_encontro: [
    "Uma cara nova! Adoro caras novas, s\xE3o as que ainda n\xE3o sabem meus pre\xE7os!",
    "Primeira vez aqui? Deixa eu te contar TUDO sobre essa loja.",
    "Bem-vindo, bem-vindo! J\xE1 vou avisando: eu falo muito.",
    "Voc\xEA \xE9 novo por aqui. Isso \xE9 \xF3timo, porque eu tenho uma hist\xF3ria pra cada cliente novo.",
    "Nunca te vi. Isso vai mudar r\xE1pido, eu prometo."
  ],
  novato: [
    "Novato! Deixa eu te vender algo que voc\xEA definitivamente precisa. Ou n\xE3o. Mas compra assim mesmo.",
    "Ai que fofo, ainda pergunta o pre\xE7o antes de comprar.",
    "Novatos s\xE3o meus favoritos. Ainda acham que est\xE3o fazendo um bom neg\xF3cio.",
    "Vem c\xE1, deixa eu te explicar como esse Reino funciona. Vai levar um tempinho.",
    "Voc\xEA tem cara de quem vai comprar demais e se arrepender depois. Adoro esse tipo."
  ],
  veterano: [
    "J\xE1 n\xE3o cai mais nas minhas conversas, hein.",
    "Veterano desconfiado. Melhor cliente que existe: sabe o que quer.",
    "Voc\xEA j\xE1 viu meus truques todos. Mas volta mesmo assim!",
    "Cliente antigo \xE9 cliente de confian\xE7a. Confian\xE7a pra eu tentar vender mais caro, \xE9 claro.",
    "Voc\xEA negocia bem agora. Aprendeu com quem, hein?"
  ],
  nivel_alto: [
    "Olha s\xF3 quem ficou importante! Ainda compra aqui, que honra!",
    "Voc\xEA t\xE1 forte. Forte o bastante pra carregar mais compras, aposto.",
    "N\xEDvel alto merece desconto. Ou n\xE3o. Vamos ver como eu me sinto hoje.",
    "Gente poderosa sempre precisa de mais coisas. \xC9 assim que o com\xE9rcio funciona!",
    "Voc\xEA chegou longe. Chegou longe o bastante pra gastar mais aqui, tamb\xE9m."
  ],
  boss_derrotado: [
    "Voc\xEA derrotou um BOSS?! Conta tudo, com detalhes, eu preciso vender essa hist\xF3ria pros outros clientes!",
    "Her\xF3i de Boss na minha loja! Isso \xE9 \xF3timo pro movimento!",
    "Ouvi dizer que voc\xEA venceu um Boss. Isso pede uma comemora\xE7\xE3o. Ou uma compra.",
    "Matador de Boss e ainda vem fazer compras. Que humildade.",
    "Se voc\xEA sobreviveu a um Boss, sobrevive ao meu pre\xE7o tamb\xE9m."
  ],
  sem_gold: [
    "Sem Gold? Ah, que pena, que pena mesmo. Volta quando tiver!",
    "Sem dinheiro hoje? Tudo bem, eu converso de gra\xE7a pelo menos.",
    "Sem Gold \xE9 tempor\xE1rio. Minha paci\xEAncia com quem n\xE3o compra, tamb\xE9m.",
    "Ah, voc\xEA t\xE1 liso. Bom saber pra eu n\xE3o perder tempo te oferecendo nada caro.",
    "Sem moeda hoje. Volta amanh\xE3, quem sabe muda a sorte."
  ],
  muito_gold: [
    "MUITO Gold?! Deixa eu te mostrar tudo que eu tenho. TUDO.",
    "Voc\xEA t\xE1 rico! Isso pede uma prateleira inteira s\xF3 pra voc\xEA.",
    "Cliente rico \xE9 meu tipo favorito de cliente!",
    "Com esse dinheiro todo, vamos fazer um \xF3timo neg\xF3cio hoje. \xD3timo pra mim, pelo menos.",
    "Gold desse jeito n\xE3o \xE9 pra guardar. \xC9 pra circular. Aqui, de prefer\xEAncia."
  ],
  chovendo: [
    "Chuva \xE9 \xF3tima pra vendas! As pessoas entram s\xF3 pra se abrigar e acabam comprando!",
    "Dia chuvoso, loja cheia. \xC9 lei.",
    "N\xE3o deixa a chuva molhar as mercadorias, por favor, elas j\xE1 s\xE3o caras o bastante secas.",
    "Chuva l\xE1 fora, neg\xF3cio aqui dentro!",
    "Aproveita que t\xE1 chovendo e fica mais um pouco. Olhando as prateleiras, claro."
  ],
  noite: [
    "Trabalho at\xE9 tarde. Sempre tem algu\xE9m precisando de algo de \xFAltima hora.",
    "Noite \xE9 boa pra fechar neg\xF3cio. As pessoas ficam menos exigentes com sono.",
    "Ainda aberta! Sempre aberta, na verdade.",
    "De noite os pre\xE7os continuam os mesmos. S\xF3 pe\xE7o perd\xE3o!",
    "Boa noite! Ou boa hora de comprar, tanto faz pra mim."
  ],
  primeira_visita: [
    "Primeira visita! Deixa eu te mostrar a loja inteirinha, tenho tempo.",
    "Voc\xEA nunca esteve aqui? Isso \xE9 uma injusti\xE7a que vamos corrigir agora.",
    "Bem-vindo pela primeira vez! A partir de agora, \xE9 sempre bem-vindo.",
    "Primeira vez \xE9 a melhor: tudo parece novo, at\xE9 os pre\xE7os de sempre.",
    "Entra! Depois me conta o que achou. Eu j\xE1 sei que vai gostar."
  ],
  visitas_repetidas: [
    "Voc\xEA de novo! J\xE1 \xE9 cliente da casa!",
    "Voltou r\xE1pido. Bom sinal, ou falta de op\xE7\xE3o.",
    "Sempre que penso em fechar mais cedo, aparece voc\xEA.",
    "T\xE1 virando h\xE1bito isso. Gosto de h\xE1bitos que envolvem compras.",
    "J\xE1 perdi a conta de quantas vezes voc\xEA veio aqui essa semana."
  ],
  aleatorias: [
    "Sabia que j\xE1 viajei por tr\xEAs Reinos antes desse aqui? J\xE1 contei essa hist\xF3ria?",
    "Um dia vou ter a maior loja do continente. Hoje n\xE3o, mas um dia.",
    "Todo item aqui tem uma hist\xF3ria. Umas mais verdadeiras que outras.",
    "Vendi um item pra mim mesma outro dia. Boa compra, ali\xE1s.",
    "Sil\xEAncio incomoda essa loja. Por isso eu falo tanto.",
    // Sprint Social Fabric (Phase I)
    "O Idris me trouxe mercadoria rara numa colheita ruim, quando ningu\xE9m mais tinha o que vender. Ainda devo essa a ele, de um jeito ou de outro."
  ],
  humor: [
    "J\xE1 tentei vender a mesma coisa duas vezes pro mesmo cliente. Ele nem percebeu!",
    "Meu maior talento \xE9 fazer qualquer coisa parecer uma pechincha.",
    "Uma vez vendi um item quebrado como 'edi\xE7\xE3o especial'. Funcionou.",
    "Eu falo tanto que \xE0s vezes esque\xE7o o que ia dizer no meio da frase.",
    "J\xE1 perdi a conta de quantas vezes chamei o mesmo item de 'rar\xEDssimo'.",
    // Sprint Social Fabric (Phase I)
    "O Dorwin nunca confia em nenhum pre\xE7o que eu dou, nem quando \xE9 justo. Um dia ele vai perceber que eu tinha raz\xE3o. Um dia."
  ],
  conselhos: [
    "Nunca compra o primeiro pre\xE7o. Nem de mim.",
    "Guarda uma reserva de Gold sempre. Emerg\xEAncia \xE9 emerg\xEAncia.",
    "Escuta o vendedor, mas confia no seu bolso.",
    "Todo item bom vale a pena negociar. Todo mesmo.",
    "Compra o que voc\xEA precisa. Depois compra o que voc\xEA quer. Nessa ordem, se conseguir.",
    // Sprint Social Fabric (Phase I)
    "O Zoltar cobra caro demais pelos frascos dele. Eu cobro caro demais pelos meus itens. Nenhum dos dois admite isso pro outro."
  ],
  fofocas: [
    "Ouvi dizer que o Dorwin nunca gasta nada. NUNCA. Nem um Gold.",
    "Dizem que a Greta sabe de tudo que acontece nesse Reino. Inveja profissional.",
    "O Borin reclama dos meus pre\xE7os mas nunca deixou de comprar ferro de mim.",
    "Escutei que algu\xE9m ofereceu flores pro Borin. Ningu\xE9m sabe quem.",
    "N\xE3o devia contar isso, mas... ah, quem estou enganando, eu conto tudo.",
    // Sprint Kingdom Folk (Phase I)
    "Compro queijo da mesma queijeira h\xE1 anos. Ela diz que reconhece o rebanho s\xF3 de provar. Eu s\xF3 quero saber se rende troco.",
    "O apicultor da Plan\xEDcie Dourada me vende o melhor mel do Reino. Nunca perguntei o segredo, s\xF3 o pre\xE7o.",
    "Tem um vinicultor que guarda um barril h\xE1 doze anos esperando o ano perfeito. J\xE1 ofereci comprar. Ele nunca vende.",
    // Sprint Kingdom Government (Phase I)
    "J\xE1 reconheci tr\xEAs Fiscais de Mercado disfar\xE7ados, s\xF3 pela forma de regatear. Eles acham que enganam. Eu s\xF3 finjo n\xE3o perceber.",
    "Edital de pre\xE7o de feira muda toda esta\xE7\xE3o, e nunca a meu favor. Um dia descubro quem escreve esses editais.",
    "Governo bom, pra mim, \xE9 aquele que cobra taxa justa e n\xE3o aparece toda semana pra 'fiscalizar' o que j\xE1 paguei pra fiscalizar ano passado.",
    // Sprint Kingdom Memories (Phase I)
    "Meu av\xF4 vendeu ferramenta fiada durante anos pra quem reconstru\xEDa depois do Grande Inc\xEAndio. Ainda tenho os cadernos de d\xEDvida dele, nunca cobrados.",
    "Um carroceiro levou fam\xEDlias inteiras pra fora da Vila Queimada de gra\xE7a. J\xE1 tentei pagar ele, anos depois. Recusou.",
    "Vit\xF3ria cara \xE9 a que ningu\xE9m quer comemorar de novo. Ouvi isso de um cliente velho. Nunca esqueci.",
    // Sprint First WOW Moment (Phase I)
    "Tentei vender uma luva nova pra um aventureiro de luvas rasgadas. Ele preferiu ficar com as velhas. Respeito.",
    // Sprint StreamRPG Identity (Phase I)
    "Toda negocia\xE7\xE3o importante desse Reino, cedo ou tarde, acaba discutida na mesa da Greta. Ela nem cobra pelo espa\xE7o. Devia.",
    // Sprint StreamRPG Identity (Phase II)
    "Dizem que a Rainha Meira negociou a reunifica\xE7\xE3o numa mesa parecida com essa. Prefiro acreditar que sim \u2014 d\xE1 mais sentido ao meu trabalho.",
    // Sprint Place Identity (Phase I)
    "Vendo perto da Fonte da pra\xE7a sempre que posso. O povo passa por ali pra beber \xE1gua e acaba comprando alguma coisa no caminho."
  ],
  comentarios_reino: [
    "Esse Reino cresce mais r\xE1pido do que minha prateleira consegue acompanhar!",
    "Tanta gente nova chegando ultimamente. \xD3timo pro com\xE9rcio!",
    "Capital pequena, oportunidades grandes. \xC9 assim que eu vejo.",
    "Todo mundo aqui trabalha duro. Menos os que s\xF3 v\xEAm olhar e n\xE3o compram.",
    "Reino sem com\xE9rcio n\xE3o \xE9 Reino, \xE9 acampamento."
  ],
  comentarios_npcs: [
    "O Borin \xE9 grosso, mas honesto. Prefiro assim.",
    "A Elenya lidera bem. Queria vender pra ela mais vezes.",
    "O Kade s\xF3 fala de treino. Nunca compra nada al\xE9m do essencial.",
    "A Miriam \xE9 \xF3tima cliente. Compra livro sem nem negociar.",
    "O Yannick sempre pergunta 'de onde vem isso' antes de comprar qualquer coisa."
  ],
  raras: [
    "J\xE1 fui embora de um Reino sem vender quase nada. Foi o pior m\xEAs da minha vida.",
    "Tive uma s\xF3cia, h\xE1 muito tempo. N\xE3o deu certo. Prefiro trabalhar sozinha agora.",
    "Uma vez recusei vender um item porque achei ele perigoso demais. S\xF3 uma vez.",
    "Guardo o primeiro item que vendi nessa loja. N\xE3o \xE9 pra venda.",
    "\xC0s vezes fico com medo de que ningu\xE9m mais precise comprar nada de ningu\xE9m."
  ],
  extremamente_raras: [
    "Se essa loja fechar um dia, quero que seja porque todo mundo j\xE1 tem o que precisa. N\xE3o porque ningu\xE9m confiou em mim.",
    "Falo tanto porque tenho medo do sil\xEAncio. Nunca contei isso pra ningu\xE9m.",
    "J\xE1 pensei em desistir de vender e s\xF3 viajar de novo. Mas esse Reino me prendeu.",
    "Se eu parar de falar um dia, \xE9 porque algo est\xE1 muito errado.",
    "Quero que, quando eu n\xE3o estiver mais aqui, algu\xE9m lembre que eu sempre tentei fazer um bom neg\xF3cio pros dois lados."
  ]
};

// apps/web/src/lib/npcDialogue/zoltar.ts
var ZOLTAR_DIALOGUE = {
  boas_vindas: [
    "Ah... eu sabia que voc\xEA viria. Bem, eu suspeitava.",
    "Entra, entra. Os frascos gostam de visita.",
    "Bem-vindo. Ou j\xE1 esteve aqui antes? O tempo \xE9 estranho comigo.",
    "Senti sua chegada tr\xEAs borbulhas atr\xE1s.",
    "Entra devagar. Alguma coisa aqui reage a passos apressados."
  ],
  primeiro_encontro: [
    "Voc\xEA \xE9 novo. Ou eu esqueci de voc\xEA. As duas coisas acontecem.",
    "Nunca te vi. Mas os frascos pareciam esperar algu\xE9m.",
    "Primeira vez? Interessante. Eu quase nunca erro sobre isso. Quase.",
    "Cara nova. O caldeir\xE3o borbulhou diferente quando voc\xEA entrou.",
    "Bem-vindo. N\xE3o vou perguntar seu nome. Prefiro adivinhar."
  ],
  novato: [
    "Novato. Os iniciantes sempre cheiram a coragem e pouco mais.",
    "Voc\xEA ainda n\xE3o sabe o que n\xE3o sabe. Isso \xE9 raro de admitir.",
    "Vejo pouca experi\xEAncia em voc\xEA. E um pouco de sorte. Vamos ver qual dura mais.",
    "Novo por aqui. As coisas v\xE3o ficar mais estranhas, prometo.",
    "Iniciante. Toma cuidado com o que cheira doce demais."
  ],
  veterano: [
    "Voc\xEA j\xE1 n\xE3o se assusta mais com meus frascos. Isso me preocupa um pouco.",
    "Veterano. Vejo cicatrizes que os frascos n\xE3o explicam.",
    "Voc\xEA mudou desde a \xFAltima vez. Ou eu que mudei de percep\xE7\xE3o.",
    "J\xE1 n\xE3o \xE9 mais surpresa pra mim. Isso \xE9 raro de acontecer.",
    "Experiente o bastante pra desconfiar de tudo aqui. Bom instinto."
  ],
  nivel_alto: [
    "Seu poder mudou de cor. Sim, eu vejo cor onde n\xE3o deveria haver.",
    "Forte. Os frascos tremeram um pouco quando voc\xEA entrou.",
    "Voc\xEA cresceu al\xE9m do que os n\xFAmeros mostram, eu acho.",
    "N\xEDvel alto. Ou eu sou eu que estou ficando mais velho e tudo parece mais forte.",
    "Poder desse tamanho merece um frasco \xE0 parte. N\xE3o tenho um pronto ainda."
  ],
  boss_derrotado: [
    "Eu sabia. Ou pelo menos suspeitava fortemente.",
    "Um Boss caiu. Senti o ar mudar antes de ouvir a not\xEDcia.",
    "Derrotou um Boss. Isso explica o cheiro de oz\xF4nio em voc\xEA.",
    "Vit\xF3ria contra um Boss. Os frascos comemoraram borbulhando mais forte.",
    "Voc\xEA sobreviveu a algo grande. Os pequenos frascos sentiram primeiro."
  ],
  sem_gold: [
    "Sem Gold. Previs\xEDvel. Eu j\xE1 sabia, ali\xE1s.",
    "Bolso vazio. Os frascos tamb\xE9m est\xE3o vazios hoje. Coincid\xEAncia? Duvido.",
    "Sem moeda agora. Vai passar. Ou n\xE3o. Dif\xEDcil dizer com certeza absoluta.",
    "Ah, sem Gold. Isso eu vi chegando de longe.",
    "Sem dinheiro. Os ingredientes tamb\xE9m n\xE3o crescem em \xE1rvore. Bem, alguns crescem."
  ],
  muito_gold: [
    "Muito Gold em voc\xEA agora. Interessante, eu n\xE3o previ isso.",
    "Rico de repente. Os frascos ficaram curiosos.",
    "Gold em excesso atrai coisas estranhas. Cuidado.",
    "Voc\xEA tem moedas demais pra algu\xE9m t\xE3o desconfiado quanto eu esperava.",
    "Dinheiro assim muda o cheiro de uma pessoa. Achei que era inven\xE7\xE3o minha at\xE9 agora."
  ],
  chovendo: [
    "A chuva conversa com meus frascos. Eu s\xF3 traduzo.",
    "Dia de chuva, dia de rea\xE7\xF5es estranhas. Sempre foi assim.",
    "Chovendo. Os ingredientes ficam mais falantes nesses dias.",
    "Gosto de chuva. Os frascos concordam comigo, aparentemente.",
    "Chuva l\xE1 fora, mist\xE9rio aqui dentro. Combina\xE7\xE3o perfeita."
  ],
  noite: [
    "A noite \xE9 quando os frascos falam a verdade.",
    "De noite eu vejo coisas que de dia finjo n\xE3o ver.",
    "Noite boa pra experimentos. Ningu\xE9m pergunta demais.",
    "O sil\xEAncio da noite deixa os borbulhos mais claros.",
    "Prefiro trabalhar de noite. O dia distrai demais."
  ],
  primeira_visita: [
    "Primeira vez aqui. Eu j\xE1 sabia que isso ia acontecer hoje.",
    "Bem-vindo pela primeira vez. Os frascos estavam ansiosos, juro.",
    "Voc\xEA nunca esteve aqui. Interessante, eu sentia sua falta sem te conhecer.",
    "Primeira visita. Cuidado onde pisa, alguns frutos rolaram ontem.",
    "Entra devagar. \xC9 sua primeira vez, e a \xFAltima impress\xE3o importa mais que a primeira, acho eu."
  ],
  visitas_repetidas: [
    "Voc\xEA de novo. Eu sabia que voltaria nesse exato momento.",
    "Voltou. Os frascos j\xE1 estavam preparados, de alguma forma.",
    "Voc\xEA aparece sempre que algo estranho est\xE1 prestes a acontecer. Coincid\xEAncia, garanto.",
    "J\xE1 \xE9 rotina sua vinda aqui. Rotina \xE9 uma palavra estranha pra mim.",
    "De novo por aqui. Bom. Ou ruim. O tempo dir\xE1. Ele sempre diz, eventualmente."
  ],
  aleatorias: [
    "J\xE1 vi o futuro num reflexo de po\xE7\xE3o uma vez. Ou era s\xF3 vapor.",
    "Ningu\xE9m sabe de onde eu vim. Eu tamb\xE9m n\xE3o tenho certeza.",
    "Os frascos nunca param de borbulhar. Nem eu sei por qu\xEA.",
    "Uma vez misturei duas coisas que n\xE3o deveriam se misturar. Ainda estou aqui, ent\xE3o deu certo. Ou quase.",
    "O tempo \xE9 s\xF3 uma sugest\xE3o, na minha experi\xEAncia.",
    // Sprint Social Fabric (Phase I)
    "A Elenya conseguiu recursos pra minha pesquisa numa hora em que eu mais precisava, sem eu nem ter pedido direito. N\xE3o esque\xE7o esse tipo de coisa."
  ],
  humor: [
    "J\xE1 tentei fazer po\xE7\xE3o de sono. Dormi tr\xEAs dias. Funcionou bem demais.",
    "Meu caldeir\xE3o explodiu uma vez s\xF3 porque eu espirrei.",
    "As pessoas acham que eu sei tudo. Eu s\xF3 finjo bem.",
    "J\xE1 confundi ingrediente de po\xE7\xE3o com o jantar. Foi uma noite interessante.",
    "Previ que ia chover. Estava certo. Tamb\xE9m previ que ia nevar no mesmo dia. Errei feio.",
    // Sprint Social Fabric (Phase I)
    "O Kade nunca aceita nada que eu ofere\xE7o antes de uma luta. Uma vez aceitou. S\xF3 uma vez."
  ],
  conselhos: [
    "Nunca cheira algo que borbulha sozinho.",
    "Confia no seu instinto, mesmo quando ele parece maluco. Principalmente quando parece maluco.",
    "Guarda um pouco de tudo. Nunca sabe quando vai precisar.",
    "N\xE3o ignora os sinais pequenos. Eles avisam antes dos grandes.",
    "Se algo parece bom demais pra ser verdade, prova um pouquinho s\xF3. Nunca tudo de uma vez."
  ],
  fofocas: [
    "Ouvi dizer que a Talia vendeu a mesma espada tr\xEAs vezes. Eu j\xE1 sabia disso antes de ouvir, ali\xE1s.",
    "Dizem que o Borin fala sozinho na forja. Eu falo sozinho aqui tamb\xE9m. N\xE3o julgo.",
    "A Greta sabe de tudo. Eu sei de quase tudo. A diferen\xE7a \xE9 pequena.",
    "O Dorwin n\xE3o gasta nem em ingredientes b\xE1sicos. Isso eu n\xE3o previ, mas n\xE3o me surpreende.",
    "Escutei um rumor sobre mim mesmo outro dia. Nem tudo era mentira.",
    // Sprint Kingdom Folk (Phase I)
    "Compro ervas de uma coletora que anda no escuro antes do sol nascer. Previ que ela chegaria cedo hoje. \xD3bvio.",
    "Disputo cliente com a curandeira da vila \xE0s vezes. Ela cura mais r\xE1pido. Eu explico melhor por que funcionou.",
    "Um catador de cogumelos me vende as esp\xE9cies raras. Nunca perguntei onde encontra. Prefiro n\xE3o saber.",
    // Sprint Kingdom Folklore (Phase I)
    "Nunca conto moedas durante tempestade. N\xE3o \xE9 supersti\xE7\xE3o, \xE9 m\xE9todo cient\xEDfico n\xE3o testado o suficiente pra descartar.",
    "Todo mundo ri da supersti\xE7\xE3o do sal emprestado. Eu j\xE1 vi o que acontece com quem n\xE3o devolve. Coincid\xEAncia, com certeza. Mas sempre devolvo.",
    "Colecionar supersti\xE7\xE3o \xE9 meu segundo of\xEDcio. A primeira que anotei foi sobre espelho dentro de mina. Ainda n\xE3o descartei nenhuma.",
    // Sprint Kingdom Memories (Phase I)
    "Estudo os registros da Epidemia da \xC1gua Parada at\xE9 hoje. A enfermeira que cuidou de tudo aquilo nunca adoeceu. Isso n\xE3o \xE9 sorte, \xE9 dado sem explica\xE7\xE3o.",
    "Old Senna cuidou de quem ningu\xE9m mais queria cuidar durante a Peste dos Animais. Nunca tive coragem de perguntar como ela n\xE3o desistiu.",
    "Toda grande vit\xF3ria tem um custo que os livros preferem n\xE3o detalhar. Prefiro estudar justamente essa parte.",
    // Sprint First WOW Moment (Phase I)
    "Previ que voc\xEA chegaria com equipamento ruim. N\xE3o foi uma previs\xE3o dif\xEDcil.",
    // Sprint StreamRPG Identity (Phase I)
    "As hist\xF3rias do Idris nunca s\xE3o exatamente verdade. Mas nunca s\xE3o exatamente mentira, tamb\xE9m. Isso \xE9 mais raro do que parece.",
    // Sprint StreamRPG Identity (Phase II)
    "Tentei catalogar a Dama da Neblina como fen\xF4meno natural. Desisti. Algumas coisas resistem at\xE9 \xE0 minha melhor tentativa de explica\xE7\xE3o.",
    // Sprint Place Identity (Phase I)
    "J\xE1 joguei um frasco de tintura no po\xE7o da Vila do Bosque, s\xF3 pra ver se a \xE1gua mudava de cor. N\xE3o mudou. Ainda assim, n\xE3o bebo de l\xE1.",
    "Recuso qualquer encomenda que pe\xE7a ingrediente vindo da Fortaleza Sombria. N\xE3o \xE9 medo. \xC9 prud\xEAncia com pre\xE7o embutido."
  ],
  comentarios_reino: [
    "Esse Reino tem uma energia estranha. Boa estranha, acho eu.",
    "Sinto que esse lugar guarda mais segredos do que mostra.",
    "O Reino cresce. Os frascos sentem isso antes de qualquer relat\xF3rio.",
    "Tem algo se formando nesse Reino. N\xE3o sei o qu\xEA. Ainda.",
    "Gosto daqui. Os ingredientes locais s\xE3o generosos."
  ],
  comentarios_npcs: [
    "O Borin \xE9 s\xF3lido como o pr\xF3prio ferro que forja.",
    "A Talia fala tanto que \xE0s vezes eu paro de tentar prever o que ela vai dizer.",
    "A Elenya tem uma presen\xE7a que os frascos respeitam.",
    "O Yannick entenderia meus experimentos melhor que ningu\xE9m. Um dia eu chamo ele aqui.",
    "A Greta escuta mais do que fala. Admiro isso."
  ],
  raras: [
    "Uma vez previ minha pr\xF3pria queda. Literalmente. Escorreguei tr\xEAs dias depois.",
    "Tive um mestre. Ele desapareceu numa explos\xE3o de cor. Espero que tenha sido de prop\xF3sito.",
    "Guardo uma po\xE7\xE3o que nunca tomei coragem de testar.",
    "J\xE1 vi algo no fundo de um caldeir\xE3o que prefiro n\xE3o descrever.",
    "\xC0s vezes acerto o futuro s\xF3 porque acho que ele me escuta."
  ],
  extremamente_raras: [
    "Tenho medo de um dia prever algo que eu n\xE3o queira ver acontecer.",
    "N\xE3o sei se estou ficando mais s\xE1bio ou s\xF3 mais estranho. As duas coisas parecem a mesma, ultimamente.",
    "Se um dia eu sumir no meio de uma explos\xE3o, saibam que era um experimento, n\xE3o um acidente. Provavelmente.",
    "\xC0s vezes tenho medo de que ningu\xE9m acredite em mim quando eu realmente acertar algo importante.",
    "Se esse caldeir\xE3o parar de borbulhar um dia, \xE9 porque algo mudou de verdade nesse mundo."
  ]
};

// apps/web/src/lib/npcDialogue/elenya.ts
var ELENYA_DIALOGUE = {
  boas_vindas: [
    "Bem-vindo \xE0 Guilda. Aqui, todos t\xEAm um lugar.",
    "Entra. A Guilda \xE9 maior do que parece de fora.",
    "Seja bem-vindo. Vamos ver o que voc\xEA traz consigo.",
    "A porta est\xE1 sempre aberta. A confian\xE7a, nem tanto.",
    "Bem-vindo. Espero que mere\xE7a ficar."
  ],
  primeiro_encontro: [
    "Nunca te vi por aqui. Vamos corrigir isso.",
    "Uma cara nova na Guilda. Vamos ver do que voc\xEA \xE9 feito.",
    "Bem-vindo, aventureiro. Aqui se ganha respeito, n\xE3o se recebe de gra\xE7a.",
    "Primeira vez? Observo todos os que entram pela primeira vez com aten\xE7\xE3o redobrada.",
    "Voc\xEA chegou. Falta ainda provar que veio para ficar."
  ],
  novato: [
    "Todo Campe\xE3o j\xE1 foi novato um dia. Lembre-se disso.",
    "Ainda tem muito a aprender. Isso n\xE3o \xE9 insulto, \xE9 constata\xE7\xE3o.",
    "Novato que escuta chega longe. Novato que s\xF3 fala, n\xE3o.",
    "Vejo potencial. Vejo tamb\xE9m impaci\xEAncia. Cuidado com a segunda.",
    "Comece devagar. A Guilda n\xE3o recompensa pressa."
  ],
  veterano: [
    "Voc\xEA j\xE1 n\xE3o precisa que eu explique como as coisas funcionam aqui.",
    "Veterano. J\xE1 ganhou meu respeito, mesmo que eu raramente demonstre.",
    "Voc\xEA mudou desde que chegou. Para melhor, felizmente.",
    "Confio mais em voc\xEA agora do que confiava antes. Isso n\xE3o \xE9 pouco vindo de mim.",
    "J\xE1 provou seu valor. N\xE3o precisa provar de novo toda vez."
  ],
  nivel_alto: [
    "Seu poder cresceu. Espero que sua responsabilidade tamb\xE9m.",
    "Forte assim, voc\xEA carrega mais do que combate. Carrega expectativa.",
    "N\xEDvel alto atrai aten\xE7\xE3o. Nem toda aten\xE7\xE3o \xE9 boa.",
    "Voc\xEA se tornou algu\xE9m que outros v\xE3o querer imitar. Cuidado com o exemplo que d\xE1.",
    "Poder sem prop\xF3sito \xE9 perigoso. O seu, felizmente, parece ter um."
  ],
  boss_derrotado: [
    "Um Boss derrotado. A Guilda registra isso com orgulho.",
    "Voc\xEA enfrentou algo grande e voltou. Isso fala mais que qualquer discurso meu.",
    "Vit\xF3ria contra um Boss merece reconhecimento. Voc\xEA o tem.",
    "O Reino vai lembrar disso. Eu j\xE1 lembro.",
    "Poucos enfrentam um Boss e voltam para contar. Voc\xEA \xE9 um deles."
  ],
  sem_gold: [
    "Sem Gold n\xE3o \xE9 vergonha. \xC9 apenas um momento.",
    "A Guilda n\xE3o mede valor em moeda.",
    "Falta de Gold hoje n\xE3o define o que voc\xEA vale.",
    "J\xE1 vi Campe\xF5es sem nada no bolso e tudo na postura.",
    "Sem dinheiro agora. Com determina\xE7\xE3o, ainda assim."
  ],
  muito_gold: [
    "Muito Gold traz responsabilidade junto. Espero que saiba disso.",
    "Riqueza chama aten\xE7\xE3o. Use-a com cuidado.",
    "Gold em excesso separa quem usa bem de quem usa mal. Ainda n\xE3o sei em qual grupo voc\xEA est\xE1.",
    "Voc\xEA prosperou. Espero que o Reino tenha prosperado com voc\xEA.",
    "Dinheiro n\xE3o compra confian\xE7a aqui. Isso se ganha de outra forma."
  ],
  chovendo: [
    "Chuva n\xE3o impede treino. S\xF3 atrasa.",
    "Dias assim testam quem realmente quer estar aqui.",
    "A Guilda continua de portas abertas, chova ou n\xE3o.",
    "Chuva l\xE1 fora. Aqui dentro, o trabalho continua.",
    "Prefiro dias de chuva. Menos distra\xE7\xE3o, mais foco."
  ],
  noite: [
    "A Guilda nunca fecha de verdade. Nem de noite.",
    "Trabalho at\xE9 tarde. Algu\xE9m precisa manter isso funcionando.",
    "Noite \xE9 quando decis\xF5es dif\xEDceis s\xE3o tomadas, geralmente sozinha.",
    "Se veio de noite, \xE9 porque algo importa. Vamos conversar.",
    "A escurid\xE3o n\xE3o muda meu julgamento. S\xF3 o deixa mais silencioso."
  ],
  primeira_visita: [
    "Primeira vez na Guilda. Observe bem, aqui tudo tem prop\xF3sito.",
    "Bem-vindo pela primeira vez. Espero que n\xE3o seja a \xFAltima.",
    "Voc\xEA nunca esteve aqui antes. Isso muda hoje.",
    "Primeira visita. Vou observar como voc\xEA se comporta antes de julgar.",
    "Entra. Veja o que a Guilda representa antes de decidir se pertence a ela."
  ],
  visitas_repetidas: [
    "Voc\xEA voltou. Isso j\xE1 diz algo sobre voc\xEA.",
    "Sua presen\xE7a constante n\xE3o passa despercebida.",
    "Cada vez que retorna, aprendo um pouco mais sobre quem voc\xEA \xE9.",
    "Voltar sempre \xE9 uma escolha. A sua parece consistente.",
    "Voc\xEA j\xE1 \xE9 conhecido por aqui. Isso vem com expectativa."
  ],
  aleatorias: [
    "Liderar \xE9 decidir sozinha e viver com as consequ\xEAncias.",
    "Confian\xE7a se constr\xF3i devagar e se perde r\xE1pido.",
    "A Guilda existe para lembrar que ningu\xE9m precisa enfrentar tudo sozinho.",
    "J\xE1 vi muitos aventureiros passarem por essa porta. Poucos ficam.",
    "Sil\xEAncio, \xE0s vezes, \xE9 a resposta mais honesta que tenho.",
    // Sprint Social Fabric (Phase I)
    "Negociei financiamento pra Arena do Kade numa \xE9poca em que ningu\xE9m mais achava que valia a pena. Foi uma aposta. Acertei."
  ],
  humor: [
    "J\xE1 ri de verdade uma vez. Foi memor\xE1vel, pelo menos pra mim.",
    "Dizem que eu nunca sorrio. N\xE3o \xE9 bem verdade. \xC9 raro, s\xF3 isso.",
    "Um aventureiro uma vez tentou me impressionar trope\xE7ando na entrada. Funcionou, de um jeito.",
    "Se voc\xEA me fizer rir, considere isso uma conquista rara.",
    "Tenho senso de humor. Guardo ele para ocasi\xF5es especiais.",
    // Sprint Social Fabric (Phase I)
    "O Dorwin aprova meus m\xE9todos com a Guilda mais do que aprova qualquer outra coisa nesse Reino. Isso j\xE1 diz muito sobre os dois."
  ],
  conselhos: [
    "Escolha suas batalhas. Nem todas precisam ser suas.",
    "Confie aos poucos. Confian\xE7a dada demais r\xE1pido quebra f\xE1cil.",
    "Liderar n\xE3o \xE9 mandar. \xC9 responder por quem segue voc\xEA.",
    "Nunca subestime quem parece fraco no come\xE7o.",
    "O Reino lembra de quem ajuda, n\xE3o s\xF3 de quem vence.",
    // Sprint Social Fabric (Phase I)
    "O Idris me manda relat\xF3rio de cada regi\xE3o que cruza, sem eu nunca ter pedido. Confio nesses relat\xF3rios mais do que em muitos oficiais."
  ],
  fofocas: [
    "N\xE3o costumo repetir fofoca. Mas sei de quase tudo que acontece aqui.",
    "Ouvi que o Kade treina sozinho de madrugada. N\xE3o me surpreende.",
    "Dizem que a Greta sabe de tudo antes de todo mundo. Talvez seja verdade.",
    "O Dorwin reclama at\xE9 de mim, ocasionalmente. Eu deixo passar.",
    "Prefiro observar a fofoca do que participar dela.",
    // Sprint Kingdom Folk (Phase I)
    "A Guilda registra aventureiro. Deveria registrar tamb\xE9m quem sustenta as vilas todo santo dia \u2014 lenhador, pescador, moleiro.",
    "Um guia de caravana conhece o Reino inteiro de cor. J\xE1 pensei em contrat\xE1-lo s\xF3 pra ensinar geografia aos novatos.",
    "O Reino n\xE3o seria nada sem quem planta, tece e constr\xF3i. Isso nunca vira cr\xF4nica, mas eu n\xE3o esque\xE7o.",
    // Sprint Kingdom Government (Phase I)
    "J\xE1 negociei com o Tribunal sobre jurisdi\xE7\xE3o de aventureiro mais de uma vez. Prefiro resolver informalmente do que virar precedente formal.",
    "O Decreto de Reconhecimento da Guilda cita Dorel. Ou Garrick. Depende de qual arquivo voc\xEA consulta na Capital.",
    "Governo bom \xE9 aquele que deixa a Guilda trabalhar sem pedir permiss\xE3o a cada passo. At\xE9 agora, funciona assim.",
    // Sprint First WOW Moment (Phase I)
    "Registrei um aventureiro novo hoje. Luvas rasgadas, coragem inteira. Bom come\xE7o.",
    // Sprint StreamRPG Identity (Phase II)
    "As previs\xF5es do Zoltar nunca erram o suficiente pra eu parar de escutar. Isso j\xE1 diz alguma coisa.",
    // Sprint Place Identity (Phase I)
    "Nenhum aventureiro da Guilda aceita miss\xE3o relacionada \xE0 Fortaleza Sombria duas vezes. Na primeira, quase todos aceitam."
  ],
  comentarios_reino: [
    "Esse Reino sobrevive porque as pessoas escolhem ficar, n\xE3o porque s\xE3o obrigadas.",
    "Vejo esse lugar crescendo. Com cuidado, vai crescer bem.",
    "O Reino \xE9 feito de quem escolhe ficar. Sempre acreditei nisso.",
    "Cada gera\xE7\xE3o fortalece esse lugar um pouco mais. Ou o enfraquece. Depende de n\xF3s.",
    "Esse Reino j\xE1 passou por coisas piores. Ainda est\xE1 de p\xE9.",
    // Sprint History of the Kingdom (Phase I)
    "Dizem que Garrick, meu antecessor, era irm\xE3o de Dorel, o Fundador da Guilda. Outros dizem que eram a mesma pessoa. Nunca resolvi qual vers\xE3o acreditar.",
    "Registro cada aventureiro que passa por aqui, do jeito que Garrick registrava. A lista \xE9 de nomes, n\xE3o de garantias \u2014 ele escreveu isso, e eu levo a s\xE9rio.",
    "A Guilda sobreviveu \xE0 Quebra do Primeiro Reino inteira. Isso me diz mais sobre n\xF3s do que qualquer cr\xF4nica de her\xF3i."
  ],
  comentarios_npcs: [
    "O Borin \xE9 confi\xE1vel. N\xE3o fala muito, mas cumpre.",
    "A Talia exagera em tudo, menos na lealdade a essa Capital.",
    "O Roth \xE9 desconfiado, mas por bons motivos. Confio no julgamento dele.",
    "A Miriam guarda mais sabedoria do que qualquer um percebe.",
    "O Yannick observa o mundo como se fosse um mist\xE9rio a resolver. Admiro isso."
  ],
  raras: [
    "J\xE1 perdi algu\xE9m importante liderando essa Guilda. N\xE3o falo sobre isso com frequ\xEAncia.",
    "Nem sempre fui t\xE3o desconfiada. Aprendi a ser, com o tempo.",
    "Uma vez duvidei de mim mesma como l\xEDder. S\xF3 uma vez, publicamente.",
    "Guardo o nome de cada Campe\xE3o que j\xE1 passou por essa Guilda. Todos.",
    "J\xE1 pensei em desistir de liderar. Decidi ficar, no fim."
  ],
  extremamente_raras: [
    "Se algo me acontecer, quero que a Guilda continue confiando pouco e acolhendo muito. Nessa ordem.",
    "Tenho medo de liderar mal e ningu\xE9m me avisar a tempo.",
    "J\xE1 chorei pela perda de um Campe\xE3o. N\xE3o em p\xFAblico. Nunca em p\xFAblico.",
    "Se um dia eu confiar plenamente em algu\xE9m, saber\xE3o que essa pessoa realmente merece.",
    "Quero que esse Reino lembre de mim como algu\xE9m que se importou, mesmo confiando pouco."
  ]
};

// apps/web/src/lib/npcDialogue/dorwin.ts
var DORWIN_DIALOGUE = {
  boas_vindas: [
    "Entra. N\xE3o gasta nada s\xF3 de olhar, ent\xE3o pode ficar \xE0 vontade.",
    "Bem-vindo ao Banco. Aqui cada moeda \xE9 tratada com o respeito que merece.",
    "Chegou. Espero que tenha vindo guardar, n\xE3o gastar.",
    "Entra com cuidado. Cofre aberto \xE9 responsabilidade minha.",
    "Bem-vindo. Vamos falar sobre economia, j\xE1 que veio."
  ],
  primeiro_encontro: [
    "Nunca te vi. Espero que saiba o valor de uma moeda.",
    "Cara nova. Vamos ver se voc\xEA guarda ou esbanja.",
    "Primeira vez aqui. Aproveita pra aprender a poupar desde j\xE1.",
    "Bem-vindo. J\xE1 vou avisando: n\xE3o empresto nada.",
    "Voc\xEA \xE9 novo. Isso explica o bolso ainda cheio, talvez."
  ],
  novato: [
    "Novato gasta r\xE1pido. Espero que voc\xEA seja exce\xE7\xE3o.",
    "Todo iniciante acha que dinheiro nasce em \xE1rvore. N\xE3o nasce.",
    "Guarda o que puder desde j\xE1. Vai agradecer depois.",
    "Voc\xEA ainda n\xE3o aprendeu o valor de uma moeda economizada. Vai aprender.",
    "Novato com Gold no bolso \xE9 novato prestes a perder Gold."
  ],
  veterano: [
    "Voc\xEA j\xE1 aprendeu a n\xE3o gastar \xE0 toa. Reconhe\xE7o isso.",
    "Veterano que ainda guarda moeda \xE9 veterano que eu respeito.",
    "J\xE1 n\xE3o me pergunta mais sobre juntar dinheiro. Bom sinal.",
    "Voc\xEA amadureceu financeiramente. Raro de ver.",
    "Experiente o bastante pra saber que gastar r\xE1pido \xE9 burrice."
  ],
  nivel_alto: [
    "Poder cresce, gasto tamb\xE9m. Cuidado com isso.",
    "N\xEDvel alto e ainda guardando moeda? Impressionante.",
    "Forte assim, voc\xEA devia estar acumulando, n\xE3o gastando.",
    "Espero que todo esse poder venha com no\xE7\xE3o de economia.",
    "Poder sem reserva financeira \xE9 poder desperdi\xE7ado, na minha opini\xE3o."
  ],
  boss_derrotado: [
    "Um Boss derrotado. Espero que a recompensa tenha sido bem guardada.",
    "Vit\xF3ria contra Boss. Isso deveria ter vindo com b\xF4nus. Vou verificar.",
    "Ouvi dizer que voc\xEA venceu um Boss. Isso n\xE3o paga as contas sozinho, mas ajuda.",
    "Boss derrotado \xE9 bom. Boss derrotado com recompensa guardada \xE9 melhor ainda.",
    "Parab\xE9ns. Agora guarda o que ganhou em vez de gastar tudo de uma vez."
  ],
  sem_gold: [
    "Sem Gold. Eu avisei que isso ia acontecer, mais cedo ou mais tarde.",
    "Bolso vazio \xE9 a consequ\xEAncia natural de gastar sem pensar.",
    "Sem dinheiro agora. Isso se resolve poupando, n\xE3o pedindo.",
    "Aqui n\xE3o temos empr\xE9stimo. S\xF3 conselho: guarda mais da pr\xF3xima vez.",
    "Sem Gold hoje \xE9 li\xE7\xE3o pra amanh\xE3."
  ],
  muito_gold: [
    "Muito Gold! Finalmente algu\xE9m que entende o valor de poupar.",
    "Isso sim \xE9 uma conta bem cuidada. Aprovo.",
    "Rico assim e ainda vem me visitar? Respeito isso.",
    "Gold acumulado \xE9 Gold bem usado, na minha opini\xE3o.",
    "Vejo esse saldo e sinto orgulho, sinceramente."
  ],
  chovendo: [
    "Chuva n\xE3o custa nada. Um dos poucos prazeres gratuitos que restam.",
    "Dia de chuva \xE9 dia de ficar em casa e n\xE3o gastar.",
    "Gosto de chuva. Ningu\xE9m sai pra comprar bobagem nesses dias.",
    "Chuva economiza roupa de sair. Vejo o lado positivo sempre.",
    "Dia chuvoso \xE9 \xF3timo pra revisar as contas com calma."
  ],
  noite: [
    "Trabalho at\xE9 tarde contando o que entrou e o que saiu.",
    "Noite \xE9 hora de fechar o livro-caixa do dia.",
    "Prefiro contar moedas de noite. Sil\xEAncio ajuda a n\xE3o errar a conta.",
    "Se veio de noite, espero que seja pra depositar, n\xE3o sacar.",
    "A noite n\xE3o muda meus juros. Nem minha paci\xEAncia com desperd\xEDcio."
  ],
  primeira_visita: [
    "Primeira vez no Banco. Espero que vire h\xE1bito de poupar.",
    "Bem-vindo. Aqui aprende-se o valor de cada moeda.",
    "Voc\xEA nunca guardou Gold aqui antes. Vamos corrigir isso.",
    "Primeira visita \xE9 sempre a mais importante. Comece bem.",
    "Entra. Vou te mostrar como funciona guardar dinheiro direito."
  ],
  visitas_repetidas: [
    "Voc\xEA de novo. Espero que seja pra depositar.",
    "Voltou. Bom, se for pra guardar mais.",
    "J\xE1 \xE9 cliente frequente. Isso eu aprovo.",
    "Sempre que voc\xEA aparece, revejo minhas planilhas com mais aten\xE7\xE3o.",
    "Voltar sempre \xE9 bom, desde que n\xE3o seja pra sacar tudo de novo."
  ],
  aleatorias: [
    "Desperd\xEDcio \xE9 o \xFAnico pecado que eu realmente condeno.",
    "Cada moeda tem um prop\xF3sito. Descobrir qual \xE9 trabalho meu.",
    "J\xE1 contei o mesmo Gold duas vezes essa semana. S\xF3 pra ter certeza.",
    "Uma moeda guardada vale duas moedas gastas sem pensar.",
    "Prefiro n\xFAmeros a conversa fiada. N\xFAmeros n\xE3o mentem.",
    // Sprint Social Fabric (Phase I)
    "O Roth \xE9 o \xFAnico que eu deixo revisar meus n\xFAmeros sem desconfiar de nada. N\xE3o \xE9 sobre matem\xE1tica. \xC9 sobre confian\xE7a."
  ],
  humor: [
    "J\xE1 economizei tanto numa semana que esqueci de comer direito. N\xE3o recomendo.",
    "Uma vez guardei uma moeda t\xE3o bem que nem eu lembrava onde estava.",
    "Dizem que eu sou p\xE3o-duro. Eu prefiro 'cuidadoso'.",
    "J\xE1 neguei um empr\xE9stimo pra mim mesmo, teoricamente. Levando a s\xE9rio a regra.",
    "Se eu risse por cada moeda economizada, riria o dia inteiro.",
    // Sprint Social Fabric (Phase I)
    "Nunca entro no laborat\xF3rio do Zoltar sem avisar antes. Uma vez entrei sem avisar. Uma vez foi suficiente."
  ],
  conselhos: [
    "Guarda antes de gastar. Nunca o contr\xE1rio.",
    "Todo Gold tem que ter destino antes de sair do bolso.",
    "N\xE3o empresta o que n\xE3o pode perder.",
    "Desperd\xEDcio hoje \xE9 necessidade amanh\xE3.",
    "Antes de comprar algo caro, espera um dia. Se ainda quiser, compra.",
    // Sprint Social Fabric (Phase I)
    "A Miriam acha que gasto pouco com livro. Eu acho que ela gasta demais. Discutimos isso todo m\xEAs, e nenhum dos dois muda de ideia."
  ],
  fofocas: [
    "Ouvi dizer que a Talia vendeu a mesma espada tr\xEAs vezes. Isso \xE9 golpe, n\xE3o venda.",
    "O Borin nunca cobra o pre\xE7o justo do pr\xF3prio trabalho. Estranho.",
    "A Greta sabe quanto cada um gasta nessa Capital. Prefiro nem perguntar como.",
    "Dizem que o Zoltar prev\xEA o futuro. Duvido que ele preveja os pr\xF3prios gastos.",
    "N\xE3o repito fofoca, mas registro os n\xFAmeros por tr\xE1s dela.",
    // Sprint Kingdom Folk (Phase I)
    "Um fabricante de barris nunca vendeu um que vazasse, segundo ele. Cobra caro por isso, e com raz\xE3o.",
    "O carroceiro cobra por atalho que s\xF3 ele conhece. Justo \u2014 conhecimento tamb\xE9m \xE9 mercadoria.",
    "Nenhum lavrador nem pescador jamais vieram at\xE9 mim pedir empr\xE9stimo. Isso diz mais sobre eles do que sobre mim.",
    // Sprint Kingdom Government (Phase I)
    "O Tesouro Real registra tudo. N\xE3o significa que tudo bate. J\xE1 admiti isso antes, e n\xE3o vou fingir vergonha agora.",
    "O Mestre da Moeda faz um teste de pesagem \xE0s cegas pra herdar o cargo. Eu faria o mesmo teste com os livros cont\xE1beis de qualquer conselheiro.",
    "Governo \xE9 s\xF3 um jeito bonito de dizer 'gente cuidando de moeda alheia'. Prefiro cuidar sabendo que \xE9 isso mesmo.",
    // Sprint Kingdom Memories (Phase I)
    "A Vit\xF3ria Silenciosa dos Po\xE7os P\xFAblicos custou d\xE9cadas de trabalho de poceiros que ningu\xE9m lembra o nome. Eu lembro. Guardei os registros de pagamento.",
    "O Fim da Seca de Sete Anos foi comemorado na Capital. Duas vilas menores j\xE1 tinham sido abandonadas antes. Isso nunca entra na comemora\xE7\xE3o.",
    "Toda vit\xF3ria tem uma fatura por tr\xE1s. A minha fun\xE7\xE3o \xE9 s\xF3 garantir que algu\xE9m, um dia, olhe pra ela.",
    // Sprint First WOW Moment (Phase I)
    "N\xE3o cobro imposto sobre luva rasgada. Nem eu sou cruel a esse ponto.",
    // Sprint StreamRPG Identity (Phase II)
    "A Elenya nunca gastou um Gold da Guilda em besteira, em anos de registro. Confio nela mais do que confio em mim mesmo, \xE0s vezes.",
    // Sprint Place Identity (Phase I)
    "O po\xE7o da Vila do Bosque nunca precisou de reparo registrado. Isso n\xE3o \xE9 normal pra nenhuma estrutura daquela idade.",
    "Contratei um afinador pro Sino da Torre, uma vez. Ele desistiu no meio do trabalho. Nunca disse por qu\xEA."
  ],
  comentarios_reino: [
    "Esse Reino gasta mais do que devia, mas ainda se sustenta. Impressionante.",
    "Gold em circula\xE7\xE3o \xE9 sinal de Reino vivo. Gold guardado \xE9 sinal de Reino s\xE1bio.",
    "Capital cresce r\xE1pido demais pra minha paci\xEAncia com planilhas.",
    "Esse Reino precisa de mais gente que entenda o valor de uma reserva.",
    "Reino sem economia organizada \xE9 Reino fadado a repetir os mesmos erros."
  ],
  comentarios_npcs: [
    "A Talia gasta a energia falando o que eu gastaria economizando moeda.",
    "O Borin trabalha duro e cobra pouco. Isso me incomoda profundamente.",
    "A Elenya administra bem a Guilda. Aprendi alguns m\xE9todos com ela.",
    "O Kade s\xF3 investe em treino. Pelo menos \xE9 um investimento sensato.",
    "A Miriam n\xE3o gasta com quase nada al\xE9m de livros. Aprovo o h\xE1bito."
  ],
  raras: [
    "J\xE1 perdi uma grande soma de Gold uma vez, por confiar na pessoa errada. N\xE3o repeti o erro.",
    "Tive pouco dinheiro na inf\xE2ncia. \xC9 por isso que sou assim hoje.",
    "Uma vez doei uma quantia grande, anonimamente. Nunca contei pra ningu\xE9m at\xE9 agora.",
    "Guardo a primeira moeda que ganhei nessa fun\xE7\xE3o. N\xE3o \xE9 pra gastar.",
    "J\xE1 pensei em desistir de contar moedas dos outros. Decidi continuar."
  ],
  extremamente_raras: [
    "Se um dia esse Banco fechar, quero que seja porque ningu\xE9m mais precisa dele, n\xE3o porque falhei.",
    "Tenho medo de morrer e ningu\xE9m saber onde guardei certas reservas importantes do Reino.",
    "J\xE1 chorei uma vez, vendo algu\xE9m perder tudo que tinha por um golpe. N\xE3o esqueci o rosto.",
    "Se eu parecer frio, \xE9 porque aprendi que sentimento n\xE3o paga d\xEDvida.",
    "Quero que lembrem de mim como algu\xE9m que guardou o Reino, moeda por moeda."
  ]
};

// apps/web/src/lib/npcDialogue/kade.ts
var KADE_DIALOGUE = {
  boas_vindas: [
    "Entra. Espero que tenha treinado hoje.",
    "Bem-vindo \xE0 Arena. Aqui s\xF3 existe disciplina.",
    "Chegou. Bom. Sempre h\xE1 espa\xE7o pra mais um que queira treinar.",
    "Bem-vindo. Cicatrizes contam mais hist\xF3rias que trof\xE9us, lembre-se disso.",
    "Entra. J\xE1 treinei antes de voc\xEA chegar. Sempre treino antes."
  ],
  primeiro_encontro: [
    "Cara nova na Arena. Vamos ver do que voc\xEA \xE9 feito.",
    "Nunca te vi treinar. Isso muda agora.",
    "Primeira vez aqui? Espero que n\xE3o seja a \xFAltima.",
    "Bem-vindo. Toda jornada come\xE7a com o primeiro treino.",
    "Voc\xEA \xE9 novo. Isso n\xE3o \xE9 desculpa pra n\xE3o se esfor\xE7ar."
  ],
  novato: [
    "Novato. Treino compensa a falta de experi\xEAncia, com o tempo.",
    "Todo campe\xE3o come\xE7ou sem saber nada. Continue treinando.",
    "Disciplina supera talento no come\xE7o. Lembra disso.",
    "Voc\xEA ainda tem muito a aprender. Isso \xE9 bom. Significa espa\xE7o pra crescer.",
    "Iniciante que treina toda semana chega mais longe que talento que n\xE3o aparece."
  ],
  veterano: [
    "Veterano. J\xE1 n\xE3o precisa de motiva\xE7\xE3o, s\xF3 de manuten\xE7\xE3o.",
    "Voc\xEA treinou bastante pra chegar at\xE9 aqui. Continue.",
    "Experi\xEAncia sem treino cont\xEDnuo enferruja r\xE1pido.",
    "Voc\xEA j\xE1 provou seu valor. N\xE3o pare agora.",
    "Veterano de verdade \xE9 aquele que ainda aparece pra treinar."
  ],
  nivel_alto: [
    "Poder sem disciplina \xE9 desperd\xEDcio. O seu, felizmente, parece ter as duas coisas.",
    "Forte assim, voc\xEA virou refer\xEAncia. Trate isso com seriedade.",
    "N\xEDvel alto exige treino ainda mais rigoroso, n\xE3o menos.",
    "Voc\xEA chegou longe. Isso n\xE3o significa que pode parar de treinar.",
    "Poder desse tamanho merece um advers\xE1rio \xE0 altura. Ainda estou esperando um."
  ],
  boss_derrotado: [
    "Um Boss derrotado. Isso \xE9 treino valendo a pena.",
    "Vit\xF3ria contra um Boss prova mais que qualquer treino na Arena.",
    "Voc\xEA encarou algo grande e venceu. Isso \xE9 disciplina em a\xE7\xE3o.",
    "Cicatrizes de Boss valem mais que qualquer trof\xE9u daqui.",
    "Parab\xE9ns. Agora volta pra treinar antes que fique convencido demais."
  ],
  sem_gold: [
    "Sem Gold n\xE3o impede ningu\xE9m de treinar.",
    "Aqui n\xE3o cobra pra suar. S\xF3 exige esfor\xE7o.",
    "Dinheiro vai e vem. Disciplina fica.",
    "Sem moeda hoje, mas com disposi\xE7\xE3o, espero.",
    "Bolso vazio n\xE3o \xE9 desculpa pra pular treino."
  ],
  muito_gold: [
    "Muito Gold n\xE3o compra disciplina. Isso se conquista.",
    "Rico assim, espero que tamb\xE9m seja forte.",
    "Dinheiro n\xE3o substitui treino. Nunca substituiu.",
    "Gold em excesso \xE9 bom. Poder conquistado com esfor\xE7o \xE9 melhor.",
    "Guarda esse dinheiro. Ou investe em treino, se quiser meu conselho."
  ],
  chovendo: [
    "Chuva n\xE3o cancela treino. S\xF3 molha o ch\xE3o.",
    "Treinar na chuva separa quem \xE9 s\xE9rio de quem n\xE3o \xE9.",
    "Dia de chuva \xE9 dia de testar sua determina\xE7\xE3o.",
    "A Arena continua aberta, chova o quanto for.",
    "Chuva \xE9 s\xF3 mais um obst\xE1culo. Treino \xE9 sobre superar obst\xE1culos."
  ],
  noite: [
    "Treino de madrugada. Ningu\xE9m questiona, ningu\xE9m atrapalha.",
    "A Arena vazia de noite \xE9 o melhor lugar pra pensar.",
    "Se veio treinar de noite, j\xE1 tem minha admira\xE7\xE3o.",
    "Noite \xE9 quando eu treino sozinho. Sempre foi assim.",
    "Escurid\xE3o n\xE3o desculpa pregui\xE7a."
  ],
  primeira_visita: [
    "Primeira vez na Arena. Espero que n\xE3o seja a \xFAltima.",
    "Bem-vindo. Aqui voc\xEA vai suar antes de aprender qualquer coisa.",
    "Voc\xEA nunca treinou aqui. Isso muda hoje.",
    "Primeira visita \xE9 onde tudo come\xE7a. Aproveita.",
    "Entra. Vamos ver seu potencial de verdade."
  ],
  visitas_repetidas: [
    "Voc\xEA de novo. Isso \xE9 disciplina, ou eu n\xE3o entendo mais nada.",
    "Voltou pra treinar. Exatamente como devia ser.",
    "Sua const\xE2ncia impressiona.",
    "Cada vez que aparece, fica um pouco mais forte. Continua assim.",
    "Voltar sempre pra treinar \xE9 o que separa quem cresce de quem estagna."
  ],
  aleatorias: [
    "Cicatrizes contam mais hist\xF3rias que trof\xE9us.",
    "J\xE1 vi incont\xE1veis Bosses ca\xEDrem. Lembro do nome de quem os derrotou.",
    "Treino todo dia. At\xE9 quando n\xE3o quero.",
    "Disciplina \xE9 fazer o que precisa ser feito, mesmo sem vontade.",
    "Um bom advers\xE1rio te ensina mais que dez vit\xF3rias f\xE1ceis.",
    // Sprint Social Fabric (Phase I)
    "A Elenya negociou financiamento pra Arena numa \xE9poca em que ningu\xE9m mais achava que valia a pena. N\xE3o esque\xE7o esse tipo de aposta."
  ],
  humor: [
    "J\xE1 treinei tanto num dia que nem lembrava meu pr\xF3prio nome depois.",
    "Uma vez desafiei minha pr\xF3pria sombra. Perdi. N\xE3o pergunta como.",
    "Treino tamb\xE9m ajuda. Principalmente quando voc\xEA acha que n\xE3o precisa.",
    "J\xE1 ca\xED de tanto treinar equil\xEDbrio. A ironia n\xE3o passou despercebida.",
    "Se disciplina fosse engra\xE7ada, eu seria o homem mais engra\xE7ado do Reino.",
    // Sprint Social Fabric (Phase I)
    "Nunca bebo nada que o Zoltar me oferece antes de uma luta. Uma vez bebi. Uma vez foi suficiente."
  ],
  conselhos: [
    "Treina todo dia, mesmo que pouco.",
    "Nunca subestima um advers\xE1rio calmo.",
    "Descanso faz parte do treino. N\xE3o \xE9 pregui\xE7a, \xE9 estrat\xE9gia.",
    "Foco vale mais que for\xE7a bruta.",
    "Antes de correr atr\xE1s de um Boss, aprenda a se defender de um lobo.",
    // Sprint Social Fabric (Phase I)
    "J\xE1 ca\xE7amos lado a lado, eu e o Roth, antes dele virar guarda do Port\xE3o Norte. Ele nunca admite quem mirava melhor naquela \xE9poca."
  ],
  fofocas: [
    "Ouvi dizer que algu\xE9m enfrentou um Boss usando Luvas Rasgadas. Respeito a ousadia.",
    "Dizem que o Borin nunca perde uma discuss\xE3o sobre ferro. Nunca testei.",
    "A Greta sabe de tudo que acontece na Arena antes de mim, \xE0s vezes.",
    "Escutei que a Talia tentou me vender um equipamento de treino in\xFAtil. N\xE3o ca\xED.",
    "N\xE3o repito fofoca fora da Arena. Aqui dentro, tudo bem.",
    // Sprint Kingdom Folk (Phase I)
    "Um palha\xE7o de feira conseguiu, uma vez, me fazer rir. N\xE3o repito a piada. Mas aconteceu.",
    "Ferrador bom vale tanto quanto arqueiro bom. Ningu\xE9m vence disputa nenhuma com cavalo mal ferrado.",
    "Tosquiador mais r\xE1pido do Reino, dizem. Desafiei ele pra Arena. Recusou. S\xE1bio da parte dele.",
    // Sprint Kingdom Government (Phase I)
    "Convoca\xE7\xE3o urgente do Marechal, ningu\xE9m explica o motivo at\xE9 hoje. Prefiro treinar do que especular sobre papelada.",
    "O Fiscal de Mercado se disfar\xE7a de comprador nas feiras. Eu reconheceria ele em segundos, s\xF3 pela postura de quem nunca lutou de verdade.",
    "N\xE3o me importo com decreto nenhum, contanto que ningu\xE9m pro\xEDba treino na Arena. O resto \xE9 problema de conselheiro.",
    // Sprint Kingdom Memories (Phase I)
    "O Guia que Voltou Sozinho pros Picos Congelados n\xE3o \xE9 lenda pra mim. \xC9 o tipo de coragem que eu tento ensinar aqui, sem nunca alcan\xE7ar de verdade.",
    "Todos os mineiros foram resgatados do Colapso da Mina Funda. Vit\xF3ria de verdade. Ainda assim, atrasou obra do Reino por anos. Vit\xF3ria cara, sempre.",
    "Ningu\xE9m treina pra ser o \xFAltimo a sair de um inc\xEAndio. Mas Bram foi, e isso vale mais que qualquer torneio que eu j\xE1 organizei.",
    // Sprint First WOW Moment (Phase I)
    "Treinar com luvas rasgadas separa quem quer treinar de quem s\xF3 quer conversar.",
    // Sprint StreamRPG Identity (Phase II)
    "O Roth nunca larga o posto do Port\xE3o Norte. Nem quando ofere\xE7o treino gratuito na Arena. Respeito isso mais do que admito.",
    // Sprint Place Identity (Phase I)
    "Levo os alunos novos pra molhar o rosto na Fonte antes do primeiro treino. Ajuda a acordar de vez.",
    "Treino perto da Torre do Port\xE3o Norte de prop\xF3sito. O eco de l\xE1 me ajuda a contar o ritmo dos golpes."
  ],
  comentarios_reino: [
    "Esse Reino precisa de mais gente disposta a treinar de verdade.",
    "Capital forte \xE9 Capital que treina, n\xE3o s\xF3 que celebra vit\xF3rias.",
    "Vejo potencial nesse Reino. Falta s\xF3 disciplina coletiva.",
    "Esse lugar produz bons aventureiros. Poderia produzir ainda melhores.",
    "O Reino respeita quem se esfor\xE7a. Isso eu aprovo."
  ],
  comentarios_npcs: [
    "O Borin entende de ferramenta como eu entendo de treino.",
    "A Elenya lidera com disciplina. Reconhe\xE7o isso nela.",
    "O Roth tem a postura de quem treinou a vida toda. Desconfio que treinou mesmo.",
    "A Miriam nunca pisou aqui, que eu saiba. Cada um tem seu campo de batalha.",
    "O Yannick observa tudo como se fosse estudar meu treino. Talvez seja."
  ],
  raras: [
    "J\xE1 perdi uma luta importante por excesso de confian\xE7a. Nunca mais repeti o erro.",
    "Tive um mestre que me ensinou tudo que sei. Ele nunca aceitou nenhum cr\xE9dito por isso.",
    "Uma vez pensei em desistir da Arena. Foi um treino ruim que me fez ficar.",
    "Guardo a mem\xF3ria de cada Boss que vi cair. Todos eles.",
    "J\xE1 treinei at\xE9 sangrar. N\xE3o recomendo, mas n\xE3o me arrependo."
  ],
  extremamente_raras: [
    "Tenho medo de um dia n\xE3o ter mais ningu\xE9m disposto a treinar de verdade.",
    "Se eu cair um dia, quero que seja treinando, n\xE3o descansando.",
    "J\xE1 chorei depois de uma vit\xF3ria dif\xEDcil. Ningu\xE9m viu. Prefiro assim.",
    "Se algo me acontecer, quero que a Arena continue de portas abertas pra qualquer um disposto a suar.",
    "Treino desde sempre porque tenho medo do dia em que n\xE3o for mais forte o bastante pra proteger esse Reino."
  ]
};

// apps/web/src/lib/npcDialogue/roth.ts
var ROTH_DIALOGUE = {
  boas_vindas: [
    "Identifique-se. Brincadeira. S\xF3 entra.",
    "Port\xE3o liberado. Siga em frente.",
    "Bem-vindo. Mantenha a calma e a dist\xE2ncia dos lobos.",
    "Passagem autorizada. Boa sorte na estrada.",
    "Entra. Vou ficar de olho, como sempre."
  ],
  primeiro_encontro: [
    "Nunca te vi por aqui. Isso me deixa alerta.",
    "Cara nova no port\xE3o. Vou lembrar desse rosto.",
    "Primeira vez? Fica atento. O Reino n\xE3o perdoa distra\xE7\xE3o.",
    "N\xE3o te conhe\xE7o. Isso n\xE3o \xE9 bom nem ruim. Ainda.",
    "Bem-vindo. A partir de agora, voc\xEA est\xE1 no meu radar."
  ],
  novato: [
    "Novato. Cuidado l\xE1 fora, o mundo n\xE3o avisa antes de atacar.",
    "Iniciante. Fica perto de grupos at\xE9 aprender o terreno.",
    "Voc\xEA ainda n\xE3o sabe reconhecer perigo de longe. Vai aprender r\xE1pido, ou n\xE3o vai aprender.",
    "Todo novato acha que vai voltar f\xE1cil. Poucos voltam f\xE1cil.",
    "Recomendo cautela. Recomendo isso a todo novato."
  ],
  veterano: [
    "Voc\xEA j\xE1 sabe reconhecer perigo antes de mim, \xE0s vezes.",
    "Veterano. Passa por esse port\xE3o com mais confian\xE7a que a maioria.",
    "J\xE1 perdi a conta de quantas vezes voc\xEA saiu e voltou por aqui.",
    "Experiente. Isso facilita meu trabalho de vigiar.",
    "Voc\xEA aprendeu a ler o terreno. Poucos aprendem isso de verdade."
  ],
  nivel_alto: [
    "Forte assim, voc\xEA \xE9 menos risco pro Reino e mais risco pros outros.",
    "N\xEDvel alto. Ainda assim, fico de olho. Sempre fico.",
    "Poder desse tamanho exige responsabilidade. Espero que voc\xEA entenda isso.",
    "Voc\xEA ficou perigoso. Bom, se for pros inimigos certos.",
    "Continuo vigiando quem sai e quem volta, independente do n\xEDvel."
  ],
  boss_derrotado: [
    "Um Boss derrotado. Isso n\xE3o \xE9 pouca coisa.",
    "Ouvi dizer que voc\xEA encarou um Boss e venceu. Bom trabalho, aventureiro.",
    "Poucos voltam de um combate contra Boss inteiros. Voc\xEA voltou.",
    "Registro isso: mais um Boss fora do caminho.",
    "Vit\xF3ria contra Boss merece respeito. Tem o meu."
  ],
  sem_gold: [
    "Sem Gold n\xE3o \xE9 crime. Ainda.",
    "Bolso vazio n\xE3o impede ningu\xE9m de passar por aqui.",
    "Sem dinheiro hoje. O port\xE3o continua livre mesmo assim.",
    "Isso n\xE3o \xE9 da minha al\xE7ada. Segue em frente.",
    "Falta de moeda n\xE3o \xE9 problema de seguran\xE7a. Segue."
  ],
  muito_gold: [
    "Muito Gold chama aten\xE7\xE3o errada. Cuidado ao sair por a\xED.",
    "Rico assim, vira alvo f\xE1cil l\xE1 fora. Fica esperto.",
    "Dinheiro em excesso \xE9 motivo pra roubo. Guarda bem.",
    "Vou fingir que n\xE3o notei quanto Gold voc\xEA carrega.",
    "Riqueza desse tamanho exige cautela redobrada na estrada."
  ],
  chovendo: [
    "Chuva atrapalha vis\xE3o. Redobro a vigil\xE2ncia.",
    "Dia de chuva, dia de mais aten\xE7\xE3o no port\xE3o.",
    "Chuva esconde passos. N\xE3o gosto disso.",
    "Mantenha dist\xE2ncia da muralha molhada. Escorrega.",
    "Chuva n\xE3o me tira do posto. Nada tira."
  ],
  noite: [
    "Fico de olho em quem parte e em quem volta, principalmente de noite.",
    "Noite \xE9 quando o perigo de verdade aparece.",
    "Poucos escapam do meu aceno, de dia ou de noite.",
    "A noite exige o dobro de aten\xE7\xE3o. Sempre exigiu.",
    "Se est\xE1 saindo de noite, tenha um bom motivo."
  ],
  primeira_visita: [
    "Primeira vez nesse port\xE3o. Vou lembrar do seu rosto.",
    "Bem-vindo. A partir de agora, voc\xEA est\xE1 registrado, mentalmente.",
    "Nunca passou por aqui antes. Isso muda hoje.",
    "Primeira passagem. Cuidado l\xE1 fora, o mundo n\xE3o avisa.",
    "Entra com aten\xE7\xE3o. Sai com mais aten\xE7\xE3o ainda."
  ],
  visitas_repetidas: [
    "Voc\xEA de novo. J\xE1 reconhe\xE7o seus passos.",
    "Voltou. Bom sinal, significa que sabe se cuidar.",
    "Sua frequ\xEAncia por aqui n\xE3o passa despercebida.",
    "J\xE1 perdi a conta de quantas vezes te vi passar por esse port\xE3o.",
    "Sempre que penso que n\xE3o vou te ver de novo, aparece."
  ],
  aleatorias: [
    "Boa sorte na estrada.",
    "Fico de olho em quem parte e em quem volta.",
    "Poucos escapam do meu aceno.",
    "Vigil\xE2ncia nunca \xE9 excesso, mesmo quando parece.",
    "O port\xE3o n\xE3o dorme. Eu tamb\xE9m n\xE3o, muito.",
    // Sprint Social Fabric (Phase I)
    "J\xE1 ca\xE7amos lado a lado, eu e o Kade, antes dele virar mestre de arena. Ele era pior atirador do que hoje admite."
  ],
  humor: [
    "J\xE1 confundi uma cabra com um invasor. Foi uma noite longa.",
    "Uma vez saudei o vento por engano. Ningu\xE9m precisa saber disso. Menos ainda escrever.",
    "Desconfio at\xE9 de mim mesmo, \xE0s vezes.",
    "J\xE1 fiquei t\xE3o alerta que assustei um mercador s\xF3 de olhar.",
    "Se eu rir, \xE9 porque algo saiu muito errado ou muito certo.",
    // Sprint Social Fabric (Phase I)
    "J\xE1 duvidei de uma hist\xF3ria do Idris. Ele provou que eu estava errado. N\xE3o gostei, mas anotei."
  ],
  conselhos: [
    "Nunca sai sem checar o equipamento.",
    "Confia no seu instinto quando algo parecer errado.",
    "Grupo \xE9 sempre mais seguro que solit\xE1rio.",
    "Aprende o terreno antes de se aventurar longe.",
    "Volta antes do escuro, sempre que poss\xEDvel.",
    // Sprint Social Fabric (Phase I)
    "Se um dia essa Torre cair de verdade, quero o Borin do meu lado reconstruindo. Ningu\xE9m mais eu confiaria pra isso."
  ],
  fofocas: [
    "Ouvi dizer que a Talia vendeu a mesma espada tr\xEAs vezes. Isso deveria ser investigado.",
    "Dizem que o Zoltar prev\xEA o futuro. Prefiro n\xE3o testar essa teoria.",
    "A Greta sabe de tudo antes de todo mundo. Tenho teorias sobre isso.",
    "O Dorwin desconfia de todo mundo, menos de mim. N\xE3o sei se isso \xE9 elogio.",
    "N\xE3o repito fofoca em servi\xE7o. Fora dele, \xE0s vezes.",
    // Sprint Kingdom Folk (Phase I)
    "Conhe\xE7o o guarda-noturno de cada vila que j\xE1 passei. Nenhum deles dorme direito. Reconhe\xE7o o cansa\xE7o na cara.",
    "Um vigia de torre notou um perigo antes de qualquer patrulha minha. N\xE3o gosto de admitir, mas ele viu primeiro.",
    "Todo mensageiro que passa pelo Port\xE3o Norte, eu reviso o cavalo antes de deixar seguir. Ferrador ruim mata mais que bandido.",
    // Sprint Kingdom Government (Phase I)
    "J\xE1 recusei a promo\xE7\xE3o a Capit\xE3o da Guarda duas vezes. Prefiro proteger o Port\xE3o do que assinar papel na Capital.",
    "O Marechal do Reino ficou sem ocupante por uma gera\xE7\xE3o inteira. Ningu\xE9m me avisou disso quando entrei pra Guarda. Aprendi sozinho.",
    "Hierarquia existe por motivo. N\xE3o questiono ordem que vem de cima \u2014 questiono \xE9 quem nunca aparece pra dar a ordem em pessoa.",
    // Sprint Kingdom Memories (Phase I)
    "A Defesa do Port\xE3o Norte custou metade da guarni\xE7\xE3o daquela noite. Todo guarda novo aprende esse nome antes de aprender a segurar escudo direito.",
    "Ningu\xE9m que serviu aqui antes de mim fala muito da noite da defesa. Os que falam, discordam nos detalhes. Prefiro acreditar em todos eles um pouco.",
    "Vit\xF3ria cara \xE9 a que a gente comemora calado. A do Port\xE3o Norte \xE9 assim at\xE9 hoje.",
    // Sprint First WOW Moment (Phase I)
    "Voc\xEA ainda parece inteiro. Isso j\xE1 \xE9 um \xF3timo come\xE7o, luvas rasgadas e tudo.",
    // Sprint StreamRPG Identity (Phase I)
    "A Torre do Port\xE3o Norte \xE9 mais velha que qualquer guarda vivo hoje. Eu s\xF3 cuido dela. N\xE3o vou fingir que ela precisa de mim.",
    // Sprint StreamRPG Identity (Phase II)
    "A Arena do Kade nunca fica vazia. Nem nos dias de chuva mais forte. Isso diz mais sobre o Reino do que qualquer decreto.",
    // Sprint Place Identity (Phase I)
    "J\xE1 revistei aquele barril da pra\xE7a umas tr\xEAs vezes. Sempre vazio. Continuo revistando, por garantia.",
    "Evito atravessar a Primeira Ponte depois do p\xF4r do sol. N\xE3o por medo. Por h\xE1bito antigo, dos guardas antes de mim.",
    "J\xE1 mandei patrulha regular perto do Portal de Pedra da Fronteira. Nunca acharam nada. Nunca pararam de patrulhar, mesmo assim."
  ],
  comentarios_reino: [
    "Esse Reino \xE9 mais seguro do que parece, mas n\xE3o por acaso.",
    "Vigio esse port\xE3o porque acredito nesse lugar.",
    "O Reino cresce. A seguran\xE7a precisa crescer junto.",
    "J\xE1 vi esse lugar passar por momentos dif\xEDceis. Continua de p\xE9.",
    "Capital pequena, responsabilidade grande."
  ],
  comentarios_npcs: [
    "O Borin \xE9 confi\xE1vel. Testei isso mais de uma vez.",
    "A Elenya lidera com firmeza. Respeito militar por natureza.",
    "O Kade treina mais que qualquer soldado que j\xE1 vi.",
    "A Miriam sabe mais sobre esse Reino do que qualquer relat\xF3rio meu.",
    "O Yannick observa demais pra quem diz s\xF3 estudar bichos."
  ],
  raras: [
    "J\xE1 falhei em proteger algu\xE9m uma vez. Carrego isso at\xE9 hoje.",
    "Fui soldado antes de guarda. A diferen\xE7a \xE9 menor do que parece.",
    "Uma vez duvidei de uma ordem. Estava certo em duvidar.",
    "Guardo o nome de cada aventureiro que n\xE3o voltou pelo port\xE3o.",
    "J\xE1 pensei em abandonar o posto. Decidi ficar, por respeito a quem depende disso."
  ],
  extremamente_raras: [
    "Se algo me acontecer nesse port\xE3o, quero que algu\xE9m continue vigiando com o mesmo cuidado.",
    "Tenho medo de falhar em proteger esse Reino quando mais importar.",
    "J\xE1 chorei atr\xE1s desse posto, uma vez. Ningu\xE9m viu.",
    "Se um dia eu n\xE3o estiver mais aqui, digam a quem passar: boa sorte na estrada.",
    "Vigio esse port\xE3o porque acredito que algu\xE9m precisa se importar com quem parte e quem volta."
  ]
};

// apps/web/src/lib/npcDialogue/greta.ts
var GRETA_DIALOGUE = {
  boas_vindas: [
    "Entra, entra. Aqui, toda hist\xF3ria vale uma bebida.",
    "Bem-vindo \xE0 Taverna. Senta que a noite \xE9 longa.",
    "Chegou bem a tempo de ouvir algo interessante. Ou de virar assunto.",
    "Bem-vindo. Aqui ningu\xE9m bebe sozinho, nem escuta sozinho.",
    "Entra. Foi o que ouvi, que voc\xEA chegaria hoje."
  ],
  primeiro_encontro: [
    "Cara nova. J\xE1 ouvi rumores sobre voc\xEA, mas n\xE3o confirmo nada.",
    "Nunca te vi por aqui. Foi o que me disseram, pelo menos.",
    "Primeira vez na Taverna? Foi o que ouvi de voc\xEA mesmo, agora h\xE1 pouco.",
    "Bem-vindo. Toda hist\xF3ria come\xE7a numa mesa como essa.",
    "Voc\xEA \xE9 novo. Ainda n\xE3o tenho rumor nenhum sobre voc\xEA. Isso muda r\xE1pido."
  ],
  novato: [
    "Novato. Foi o que ouviram dizer sobre voc\xEA, pelo menos.",
    "Ainda n\xE3o corre rumor nenhum sobre voc\xEA. Aproveita enquanto dura.",
    "Iniciante que aparece aqui j\xE1 \xE9 meio caminho andado pra virar hist\xF3ria.",
    "Voc\xEA ainda n\xE3o sabe o quanto essa mesa sabe sobre todo mundo.",
    "Foi o que me contaram: voc\xEA \xE9 novo. Vamos ver quanto tempo isso dura."
  ],
  veterano: [
    "J\xE1 ouvi seu nome em mais de uma mesa. Isso \xE9 raro.",
    "Veterano. Foi o que disseram, e por uma vez, acredito.",
    "Voc\xEA virou assunto por aqui, sabia?",
    "J\xE1 n\xE3o \xE9 mais rumor. Virou reputa\xE7\xE3o.",
    "Foi o que ouvi: que voc\xEA j\xE1 n\xE3o se assusta com nada. Confere?"
  ],
  nivel_alto: [
    "Foi o que ouvi: que seu poder anda impressionando gente por a\xED.",
    "N\xEDvel alto chama aten\xE7\xE3o. E aten\xE7\xE3o vira conversa nessa mesa.",
    "Dizem que voc\xEA ficou forte. Eu s\xF3 repito o que ou\xE7o.",
    "Sua fama chegou antes de voc\xEA hoje.",
    "Foi o que me contaram: que ningu\xE9m mais duvida do seu poder."
  ],
  boss_derrotado: [
    "Foi o que ouvi: que voc\xEA derrotou um Boss. A Taverna toda comenta.",
    "Um Boss derrotado vira hist\xF3ria r\xE1pido por aqui.",
    "Dizem que voc\xEA venceu algo grande. Isso pede um brinde.",
    "Foi o que me contaram, com detalhes exagerados, provavelmente.",
    "Essa hist\xF3ria do Boss j\xE1 rendeu tr\xEAs vers\xF5es diferentes essa noite."
  ],
  sem_gold: [
    "Sem Gold hoje? Foi o que ouvi. Sem problema por aqui.",
    "Bolso vazio n\xE3o impede ningu\xE9m de escutar uma boa hist\xF3ria.",
    "Sem dinheiro, mas com boas orelhas. Isso j\xE1 \xE9 o suficiente aqui.",
    "Foi o que me disseram: que voc\xEA t\xE1 liso. Senta assim mesmo.",
    "Sem moeda hoje. A conversa continua de gra\xE7a."
  ],
  muito_gold: [
    "Muito Gold, foi o que ouvi. Isso rende conversa boa.",
    "Rico assim, vira assunto r\xE1pido nessa mesa.",
    "Dizem que voc\xEA anda bem de vida. Espero que compartilhe uma rodada.",
    "Foi o que me contaram: que seu bolso anda cheio. Confirma?",
    "Gold assim atrai gente querendo conversar com voc\xEA. Cuidado."
  ],
  chovendo: [
    "Chuva l\xE1 fora, hist\xF3ria aqui dentro. Combina\xE7\xE3o perfeita.",
    "Dia de chuva enche a Taverna de gente com hist\xF3rias novas.",
    "Foi o que ouvi: que a chuva traz mais rumor que sol.",
    "Chuva boa pra ouvir hist\xF3ria e n\xE3o sair de perto do fogo.",
    "Dias assim, ningu\xE9m quer ir embora cedo."
  ],
  noite: [
    "A noite \xE9 quando as melhores hist\xF3rias saem da boca das pessoas.",
    "Foi o que ouvi: que segredo de dia vira rumor de noite.",
    "Noite na Taverna nunca \xE9 silenciosa.",
    "Se veio de noite, j\xE1 sei que quer ouvir alguma coisa.",
    "A Taverna nunca dorme. Nem eu, aparentemente."
  ],
  primeira_visita: [
    "Primeira vez aqui. Foi o que me disseram, pelo menos.",
    "Bem-vindo pela primeira vez. Senta, ouve, e depois me conta o que achou.",
    "Voc\xEA nunca esteve na Taverna. Isso vai virar rumor rapidinho.",
    "Primeira visita sempre rende boa hist\xF3ria depois.",
    "Entra. Foi o que ouvi, que hoje seria sua primeira vez."
  ],
  visitas_repetidas: [
    "Voc\xEA de novo. Foi o que eu imaginei que aconteceria.",
    "Voltou. A Taverna j\xE1 sente sua falta quando voc\xEA n\xE3o vem.",
    "J\xE1 \xE9 rosto conhecido nessa mesa.",
    "Foi o que ouvi de voc\xEA mesmo: que ia voltar sempre. Cumpriu.",
    "Sempre que penso em fechar cedo, aparece voc\xEA."
  ],
  aleatorias: [
    "Foi o que ouvi... mas n\xE3o confirmo nada.",
    "Cada mesa aqui guarda uma hist\xF3ria diferente.",
    "Ningu\xE9m sai da Taverna sem deixar um rumor pra tr\xE1s.",
    "Escuto mais do que falo. \xC9 assim que se sabe de tudo.",
    "Toda hist\xF3ria aqui come\xE7a igual: 'voc\xEA n\xE3o vai acreditar no que ouvi'."
  ],
  humor: [
    "Uma vez um cliente jurou ter visto um drag\xE3o. Era uma nuvem grande. Foi o que ouvi, pelo menos.",
    "J\xE1 ouvi tr\xEAs vers\xF5es diferentes da mesma briga de mesa. Nenhuma batia.",
    "Algu\xE9m jurou que a cerveja daqui cura ressaca. N\xE3o cura, mas n\xE3o conto.",
    "Foi o que ouvi: que ningu\xE9m sai da Taverna sabendo menos do que entrou.",
    "J\xE1 vi gente brigar por causa de uma hist\xF3ria que nem aconteceu.",
    // Sprint Social Fabric (Phase I)
    "Teve uma festa em que o Kade n\xE3o bebeu nem uma gota, s\xF3 pra provar que aguentava ficar s\xF3brio at\xE9 o fim. Ele n\xE3o aguentou."
  ],
  conselhos: [
    "Escuta mais do que fala. Voc\xEA aprende mais assim.",
    "Nem todo rumor \xE9 mentira. Nem todo rumor \xE9 verdade, tamb\xE9m.",
    "Cuidado com o que conta pra essa mesa. Vira hist\xF3ria r\xE1pido.",
    "Se quiser saber de algo, senta, pede uma bebida, e espera.",
    "Nunca confia cegamente num rumor. Nem no meu.",
    // Sprint Social Fabric (Phase I)
    "A Talia j\xE1 tentou fechar uma negocia\xE7\xE3o bem aqui, nessa mesa. N\xE3o deu certo. Cobrei a rodada mesmo assim."
  ],
  fofocas: [
    "Foi o que ouvi: que o Borin fala sozinho na forja.",
    "Dizem que a Talia vendeu a mesma espada tr\xEAs vezes. Isso \xE9 conversa boa.",
    "Ouvi que o Zoltar prev\xEA o futuro. Nunca confirmei, nunca neguei.",
    "O Dorwin conta o mesmo Gold duas vezes. Foi o que me disseram, pelo menos.",
    "N\xE3o afirmo nada. S\xF3 repito o que chega at\xE9 essa mesa.",
    // Sprint Wolves Ecosystem (Phase I)
    "Guardo uma presa de lobo debaixo do balc\xE3o. N\xE3o pergunta desde quando.",
    "Dizem que a matilha do Bosque cresceu. Aqui ningu\xE9m sabe contar quantos s\xE3o de verdade.",
    "Um viajante jurou que os lobos do P\xE2ntano nadam melhor do que ca\xE7am. Bebeu antes de contar isso, mas mesmo assim.",
    // Sprint Ravens Ecosystem (Phase I)
    "Tem um corvo que entra aqui toda noite de chuva e s\xF3 vai embora de madrugada. Ningu\xE9m mexe com ele.",
    "Um corvo pousou no parapeito e ficou olhando pra dentro a noite inteira. Nem os b\xEAbados quiseram espantar.",
    "N\xE3o sei se corvo entende gente. Mas esse a\xED parece entender o card\xE1pio.",
    // Sprint Ancient Ruins Ecosystem (Phase I)
    "N\xE3o entro em ru\xEDna nenhuma. N\xE3o porque tenha medo \u2014 porque n\xE3o tenho tempo pra ficar sem resposta o dia inteiro.",
    "Todo viajante que passa por aqui tem uma teoria diferente sobre as Ru\xEDnas. Eu s\xF3 sirvo a bebida e escuto todas.",
    "Um explorador jurou que via a mesma porta em dois lugares diferentes. Cobrei a conta e mandei ele dormir.",
    // Sprint Kingdom Government (Phase I)
    "Todo conselheiro que j\xE1 sentou nessa mesa jura que n\xE3o fala de pol\xEDtica aqui. Todos falam, depois da segunda rodada.",
    "Ouvi de um cliente que o Marechal sumiu por uma gera\xE7\xE3o e ningu\xE9m percebeu oficialmente. Aqui na Taverna, todo mundo percebeu.",
    "N\xE3o repito fofoca de governo pra fora dessa mesa. Fofoca de governo, ali\xE1s, \xE9 a que mais rende rodada extra.",
    // Sprint Kingdom Folklore (Phase I)
    "Toda noite algu\xE9m canta a cantiga do Sino da Torre errado. J\xE1 desisti de corrigir.",
    "A Festa da Chegada \xE9 a melhor noite do ano pra essa Taverna. Mais gente, mais rumor, mais rodada.",
    "Nunca recuso um brinde de estranho. Aprendi essa h\xE1 anos, e aprendi bem antes de virar supersti\xE7\xE3o de todo mundo.",
    // Sprint First WOW Moment (Phase I)
    "Um aventureiro entrou aqui com as luvas mais rasgadas que eu j\xE1 vi. Ri baixinho. Ele nem percebeu.",
    // Sprint StreamRPG Identity (Phase I)
    "Aquela \xE1rvore da pra\xE7a j\xE1 era velha quando eu cheguei aqui. Acho que sempre vai estar l\xE1, fa\xE7a o que fizerem ao redor dela.",
    // Sprint Place Identity (Phase I)
    "Um cliente jurou que o barril da pra\xE7a j\xE1 foi cheio de moeda, uma vez. Ningu\xE9m confirma."
  ],
  comentarios_reino: [
    "Esse Reino vive de hist\xF3rias, mesmo quando finge que n\xE3o.",
    "Foi o que ouvi: que esse lugar guarda mais segredo do que aparenta.",
    "Toda cidade pequena tem uma Taverna que sabe demais. Essa \xE9 a nossa.",
    "O Reino muda, mas a Taverna continua ouvindo tudo.",
    "Foi o que me disseram: que esse Reino nunca dorme de verdade."
  ],
  comentarios_npcs: [
    "Borin fala demais. Foi o que ouvi de mais de uma pessoa.",
    "A Talia teria uma hist\xF3ria pra cada moeda, se deixassem ela falar.",
    "Dizem que o Roth desconfia at\xE9 da pr\xF3pria sombra. N\xE3o duvido.",
    "A Elenya sabe mais do que aparenta. Ela s\xF3 n\xE3o fala.",
    "O Yannick pergunta demais pra quem s\xF3 quer beber tranquilo."
  ],
  raras: [
    "Uma vez guardei um segredo por anos. Ainda guardo, na verdade.",
    "J\xE1 ouvi uma hist\xF3ria t\xE3o triste que parei de servir a noite toda.",
    "Nem tudo que ou\xE7o eu repito. Alguns rumores morrem comigo.",
    "J\xE1 perdi a conta de quantas hist\xF3rias j\xE1 passaram por essa mesa.",
    "Uma vez a hist\xF3ria era sobre mim mesma. Nem eu confirmo essa.",
    // Sprint Social Fabric (Phase I)
    "O Alaric vem aqui uma vez por semana, sempre sozinho, sempre calado. Nunca pergunto por qu\xEA. S\xF3 guardo a mesa dele."
  ],
  extremamente_raras: [
    "Se um dia essa Taverna fechar, quero que seja porque o Reino n\xE3o precisa mais de um lugar pra ouvir.",
    "Tenho medo de esquecer alguma hist\xF3ria importante entre tantas outras.",
    "J\xE1 chorei escutando algu\xE9m contar sobre quem perdeu. Ningu\xE9m viu.",
    "Guardo um rumor que nunca vou repetir. Nem se perguntarem direito.",
    "Foi o que ouvi, uma vez, sobre mim mesma: que essa Taverna n\xE3o seria a mesma sem algu\xE9m pra escutar."
  ]
};

// apps/web/src/lib/npcDialogue/miriam.ts
var MIRIAM_DIALOGUE = {
  boas_vindas: [
    "Bem-vindo \xE0 Biblioteca. Fale baixo, por favor.",
    "Entra com calma. Os livros agradecem o sil\xEAncio.",
    "Seja bem-vindo. Aqui, cada p\xE1gina espera por quem souber l\xEA-la.",
    "Bem-vindo. Sinta-se em casa entre essas estantes.",
    "Entra. Sempre h\xE1 algo novo pra descobrir aqui dentro."
  ],
  primeiro_encontro: [
    "Nunca te vi por aqui. Que bom que decidiu visitar.",
    "Uma cara nova entre os livros. Seja bem-vindo.",
    "Primeira vez na Biblioteca? Vou te mostrar por onde come\xE7ar.",
    "Bem-vindo. Espero que goste tanto de ler quanto eu gosto de catalogar.",
    "Voc\xEA \xE9 novo. Isso \xE9 s\xF3 o come\xE7o de uma boa rela\xE7\xE3o com o conhecimento."
  ],
  novato: [
    "Novato. Todo grande leitor um dia come\xE7ou sem saber por onde come\xE7ar.",
    "V\xE1 com calma. O conhecimento n\xE3o tem pressa.",
    "Ainda tem muito a aprender. Isso \xE9 bonito, n\xE3o \xE9 falha.",
    "Comece pelas se\xE7\xF5es mais simples. O resto vem com o tempo.",
    "Todo iniciante merece paci\xEAncia. Voc\xEA tem a minha."
  ],
  veterano: [
    "Voc\xEA j\xE1 n\xE3o precisa mais de tanta orienta\xE7\xE3o minha.",
    "Veterano de leitura e de aventura, pelo visto.",
    "J\xE1 n\xE3o se surpreende f\xE1cil com o que encontra aqui.",
    "Sua curiosidade amadureceu bastante desde a primeira visita.",
    "Voc\xEA l\xEA diferente agora. Com mais aten\xE7\xE3o, percebi."
  ],
  nivel_alto: [
    "Seu poder cresceu. Espero que sua sede por conhecimento tamb\xE9m.",
    "N\xEDvel alto e ainda visitando a Biblioteca. Isso me deixa feliz.",
    "For\xE7a sem sabedoria \xE9 incompleta. A sua parece equilibrada.",
    "Voc\xEA chegou longe. Continue lendo, mesmo assim.",
    "Poder e curiosidade juntos formam algu\xE9m raro."
  ],
  boss_derrotado: [
    "Um Boss derrotado. Isso merece um registro nos livros, um dia.",
    "Ouvi dizer que voc\xEA venceu um Boss. Que hist\xF3ria extraordin\xE1ria.",
    "Vit\xF3rias assim deveriam ser escritas, para que ningu\xE9m esque\xE7a.",
    "Voc\xEA fez algo digno de p\xE1gina. Talvez eu escreva sobre isso.",
    "Parab\xE9ns. Poucas hist\xF3rias merecem ser guardadas como essa."
  ],
  sem_gold: [
    "Sem Gold n\xE3o impede ningu\xE9m de ler aqui. Os livros s\xE3o gratuitos.",
    "Conhecimento n\xE3o se compra. Fico feliz em lembrar disso.",
    "Sem dinheiro hoje, mas com tempo de sobra pra ler, espero.",
    "A Biblioteca nunca cobrou por uma p\xE1gina sequer.",
    "Bolso vazio n\xE3o \xE9 problema aqui dentro."
  ],
  muito_gold: [
    "Muito Gold. Espero que parte disso vire livros um dia.",
    "Riqueza \xE9 boa. Riqueza de conhecimento \xE9 melhor ainda.",
    "Com esse dinheiro, talvez financie a pr\xF3xima expedi\xE7\xE3o de registros que eu preciso.",
    "Gold \xE9 \xFAtil. Mas nenhuma moeda compra uma boa hist\xF3ria.",
    "Espero que use bem essa fortuna. Um livro raro, talvez?"
  ],
  chovendo: [
    "Chuva \xE9 o clima perfeito pra ler.",
    "Dias de chuva enchem a Biblioteca de visitantes.",
    "Gosto do som da chuva enquanto cataloga p\xE1ginas novas.",
    "Chuva l\xE1 fora, hist\xF3ria aqui dentro.",
    "Aproveite a chuva pra terminar aquele livro que come\xE7ou."
  ],
  noite: [
    "Trabalho at\xE9 tarde catalogando o que chega \xE0 Capital.",
    "A Biblioteca de noite \xE9 o lugar mais silencioso do Reino.",
    "Prefiro ler \xE0 luz de vela. Tem algo especial nisso.",
    "Se veio de noite, sente-se, fique \xE0 vontade.",
    "A noite \xE9 generosa com quem gosta de estudar em paz."
  ],
  primeira_visita: [
    "Primeira vez na Biblioteca. Seja muito bem-vindo.",
    "Voc\xEA nunca esteve aqui? Vamos corrigir isso com calma.",
    "Primeira visita merece uma boa recomenda\xE7\xE3o de leitura.",
    "Entra. Deixe-me te mostrar por onde nossos livros come\xE7am.",
    "Bem-vindo pela primeira vez. Espero que n\xE3o seja a \xFAltima."
  ],
  visitas_repetidas: [
    "Voc\xEA voltou. Isso me deixa muito feliz.",
    "J\xE1 \xE9 presen\xE7a constante entre essas estantes.",
    "Sua curiosidade n\xE3o parece ter fim. Isso \xE9 admir\xE1vel.",
    "Sempre que penso nos livros que catalogo, penso em quem vai l\xEA-los. Voc\xEA, por exemplo.",
    "Voltar sempre \xE9 sinal de que algo aqui importa pra voc\xEA."
  ],
  aleatorias: [
    "Cada livro aqui espera por quem souber l\xEA-lo.",
    "Catalogo cada p\xE1gina que chega \xE0 Capital, mesmo as que ainda ningu\xE9m pode abrir.",
    "O conhecimento cresce devagar, mas nunca para.",
    "Prefiro o sil\xEAncio de um bom livro a qualquer barulho da Capital.",
    "Nenhuma pergunta \xE9 boba o bastante pra n\xE3o merecer resposta.",
    // Sprint Social Fabric (Phase I)
    "O Zoltar cita meus arquivos com mais frequ\xEAncia do que admite. Eu finjo n\xE3o perceber, ele finge n\xE3o saber que eu percebo."
  ],
  humor: [
    "Uma vez catalogei o mesmo livro duas vezes. Ningu\xE9m percebeu, exceto eu, tr\xEAs dias depois.",
    "J\xE1 dormi aqui dentro sem perceber. Os livros s\xE3o bons companheiros.",
    "Um visitante uma vez tentou ler um livro de cabe\xE7a para baixo. N\xE3o corrigi na hora.",
    "Prefiro rir baixinho. Livros n\xE3o gostam de barulho.",
    "J\xE1 perdi um livro na pr\xF3pria Biblioteca. Levei uma semana pra achar."
  ],
  conselhos: [
    "Leia devagar. Pressa n\xE3o combina com conhecimento de verdade.",
    "Nunca ignore um livro s\xF3 porque parece antigo demais.",
    "Pergunte sempre que tiver d\xFAvida. Ningu\xE9m nasce sabendo tudo.",
    "Guarde o que aprender. Um dia isso faz diferen\xE7a.",
    "Volte sempre que precisar entender algo melhor.",
    // Sprint Social Fabric (Phase I)
    "O Idris conta a mesma hist\xF3ria de dois jeitos diferentes, dependendo do dia. Prefiro n\xE3o corrigir nenhum dos dois."
  ],
  fofocas: [
    "Ouvi dizer que a Talia vendeu a mesma espada tr\xEAs vezes. Prefiro n\xE3o confirmar.",
    "Dizem que o Zoltar prev\xEA o futuro atrav\xE9s dos frascos. Interessante hip\xF3tese.",
    "A Greta sabe de tudo antes de todo mundo. Ela deveria escrever um livro.",
    "O Dorwin conta o mesmo Gold duas vezes, segundo dizem. Isso parece exaustivo.",
    "Prefiro n\xE3o repetir fofocas. Prefiro hist\xF3rias com mais subst\xE2ncia.",
    // Sprint Ravens Ecosystem (Phase I)
    "Um corvo pousou na janela outro dia e ficou a tarde inteira. N\xE3o sa\xED do lugar pra n\xE3o espantar.",
    "H\xE1 um livro inteiro sobre os corvos do Reino nesta Biblioteca. Nunca conclui nada, e talvez seja assim mesmo que deva ser.",
    "Prefiro n\xE3o afirmar se os corvos entendem o que lemos em voz alta aqui dentro. Mas um deles sempre parece prestar aten\xE7\xE3o.",
    // Sprint Ancient Ruins Ecosystem (Phase I)
    "Temos um di\xE1rio inteiro sobre as Ru\xEDnas Esquecidas nesta Biblioteca. Treze p\xE1ginas, e nenhuma conclus\xE3o. Isso me incomoda mais do que deveria.",
    "Gostaria de catalogar as Ru\xEDnas do jeito que catalogo tudo aqui. Mas n\xE3o existe se\xE7\xE3o pra coisas que ningu\xE9m consegue explicar direito.",
    "Um leitor me perguntou outro dia quantas Ru\xEDnas existem de verdade. S\xF3 pude responder: 'pelo menos doze, que a gente saiba'.",
    // Sprint Kingdom Folklore (Phase I)
    "Catalogo ditado popular do jeito que catalogo livro. 'Ru\xEDna velha ensina mais que livro novo' \xE9 o \xFAnico que me ofende profissionalmente.",
    "Tenho uma se\xE7\xE3o inteira s\xF3 de supersti\xE7\xE3o registrada. Nenhuma delas tem explica\xE7\xE3o. Todas t\xEAm gente que jura ser verdade.",
    "Diferen\xE7a entre lenda e hist\xF3ria, pra mim, \xE9 simples: uma tem data, a outra tem gente que ainda acredita mesmo sem data nenhuma.",
    // Sprint First WOW Moment (Phase I)
    "Tem um livro aqui sobre os primeiros passos de um aventureiro. A capa est\xE1 t\xE3o gasta quanto as primeiras luvas de qualquer um. Combina.",
    // Sprint StreamRPG Identity (Phase I)
    "O primeiro cap\xEDtulo do Besti\xE1rio sempre foi sobre os Lobos Cinzentos. Nunca mudou, nem quando todo o resto mudou.",
    "Recomendo o Tratado da Matilha pra quem quiser entender os Lobos de verdade. N\xE3o \xE9 o mais longo. \xC9 o mais honesto.",
    // Sprint Place Identity (Phase I)
    "Tem gente que deixa bilhete escondido no oco daquela \xE1rvore da pra\xE7a. J\xE1 vi um, uma vez. N\xE3o li.",
    "Tenho registro de tr\xEAs reformas na Torre do Port\xE3o Norte. As datas nunca batem direito com o que os guardas contam."
  ],
  comentarios_reino: [
    "Esse Reino tem mais hist\xF3ria guardada do que qualquer um imagina.",
    "Catalogar esse Reino \xE9 catalogar gera\xE7\xF5es de gente teimosa e curiosa.",
    "Capital pequena, mem\xF3ria enorme.",
    "Cada gera\xE7\xE3o acrescenta algo novo \xE0 hist\xF3ria desse lugar.",
    "Gosto de pensar que essa Biblioteca guarda um pouco de cada um que j\xE1 passou por aqui.",
    // Sprint History of the Kingdom (Phase I)
    "Guardo vinte cartas antigas nesta Biblioteca. Nenhuma delas conta a hist\xF3ria inteira \u2014 juntas, ainda deixam mais buracos do que respostas.",
    "Tenho um fragmento de livro que sobreviveu a um inc\xEAndio na primeira Biblioteca. Me recuso a especular sobre o que faltava. Prefiro admitir que n\xE3o sei.",
    "Um leitor me perguntou outro dia qual era a data certa da funda\xE7\xE3o da Capital. S\xF3 pude mostrar tr\xEAs registros que discordam entre si."
  ],
  comentarios_npcs: [
    "O Borin nunca l\xEA, mas conta boas hist\xF3rias mesmo assim.",
    "A Talia fala tanto que eu deveria transcrever as conversas dela.",
    "A Elenya guarda mais sabedoria do que qualquer livro que j\xE1 catalogei.",
    "O Yannick seria um \xF3timo pesquisador, se decidisse escrever mais e observar menos.",
    "O Alaric e eu discutimos sobre hist\xF3ria com frequ\xEAncia. Discordamos com respeito."
  ],
  raras: [
    "Uma vez encontrei um livro sem autor. Ainda n\xE3o sei quem escreveu.",
    "J\xE1 chorei lendo um livro sozinha aqui dentro. N\xE3o foi a primeira vez.",
    "Tive uma mestra antes de mim. Ela me ensinou a amar o sil\xEAncio dos livros.",
    "Guardo um livro que nunca mostrei a ningu\xE9m. Talvez um dia mostre.",
    "J\xE1 pensei em escrever meu pr\xF3prio livro. Talvez um dia eu tenha coragem.",
    // Sprint Social Fabric (Phase I)
    "O Dorwin acha que gasto Gold demais com livro. Eu acho que ele guarda Gold demais pra nada. Discutimos isso todo m\xEAs, e nenhum dos dois muda de ideia."
  ],
  extremamente_raras: [
    "Se um dia essa Biblioteca queimar, quero acreditar que o conhecimento sobrevive nas pessoas, n\xE3o s\xF3 nas p\xE1ginas.",
    "Tenho medo de esquecer alguma hist\xF3ria importante entre tantas que j\xE1 catalogei.",
    "J\xE1 fiquei aqui a noite inteira, sozinha, s\xF3 para terminar de catalogar algo importante.",
    "Se eu n\xE3o estiver mais aqui um dia, espero que algu\xE9m continue cuidando dessas p\xE1ginas com o mesmo carinho.",
    "Quero que, no fim, lembrem de mim como algu\xE9m que ajudou o Reino a nunca esquecer quem foi."
  ]
};

// apps/web/src/lib/npcDialogue/yannick.ts
var YANNICK_DIALOGUE = {
  boas_vindas: [
    "Bem-vindo ao Besti\xE1rio. Cuidado onde pisa, tenho amostras espalhadas.",
    "Entra. Estava justamente observando um comportamento interessante.",
    "Seja bem-vindo. Tudo aqui \xE9 motivo de estudo, inclusive voc\xEA.",
    "Bem-vindo. Espero que n\xE3o se importe com o cheiro de ervas secas.",
    "Entra com calma. Alguns registros ainda est\xE3o sendo catalogados."
  ],
  primeiro_encontro: [
    "Cara nova. Interessante, vou anotar suas rea\xE7\xF5es.",
    "Nunca te vi por aqui. Isso j\xE1 \xE9 um dado relevante.",
    "Primeira vez no Besti\xE1rio? Vamos ver o que desperta sua curiosidade.",
    "Bem-vindo. Todo visitante novo \xE9 uma oportunidade de observa\xE7\xE3o.",
    "Voc\xEA \xE9 novo. Vou registrar isso, se n\xE3o se importa."
  ],
  novato: [
    "Novato. Curioso ver como voc\xEA reage ao desconhecido.",
    "Ainda n\xE3o sabe reconhecer os sinais que uma criatura d\xE1 antes de atacar. Vai aprender.",
    "Todo iniciante observa pouco e reage r\xE1pido demais. Tente o contr\xE1rio.",
    "Voc\xEA tem muito a descobrir. Isso \xE9 empolgante, do ponto de vista cient\xEDfico.",
    "Iniciante que observa antes de agir sobrevive mais. Anota isso."
  ],
  veterano: [
    "Voc\xEA j\xE1 reconhece padr\xF5es que a maioria n\xE3o v\xEA.",
    "Veterano. Sua forma de observar o mundo mudou bastante.",
    "J\xE1 n\xE3o reage por impulso como antes. Isso \xE9 crescimento real.",
    "Experiente o bastante pra fazer boas perguntas, n\xE3o s\xF3 respostas.",
    "Voc\xEA virou um bom objeto de estudo, no melhor sentido poss\xEDvel."
  ],
  nivel_alto: [
    "Seu poder cresceu de um jeito que vale a pena documentar.",
    "N\xEDvel alto. Curioso como isso muda o comportamento de uma pessoa.",
    "Forte assim, voc\xEA se tornou uma vari\xE1vel interessante nesse Reino.",
    "Gostaria de estudar como voc\xEA chegou a esse n\xEDvel de poder.",
    "Poder desse tamanho desperta minha curiosidade cient\xEDfica."
  ],
  boss_derrotado: [
    "Um Boss derrotado. Isso precisa ser documentado com detalhes.",
    "Ouvi dizer que voc\xEA venceu um Boss. Poderia descrever o comportamento dele antes da queda?",
    "Vit\xF3rias assim geram dados valiosos sobre criaturas raras.",
    "Voc\xEA presenciou algo que poucos estudiosos ver\xE3o de perto.",
    "Parab\xE9ns. E, se poss\xEDvel, me conte tudo que observou durante o combate."
  ],
  sem_gold: [
    "Sem Gold n\xE3o impede observa\xE7\xE3o nenhuma.",
    "Bolso vazio, mente cheia de perguntas, espero.",
    "Sem dinheiro hoje. A curiosidade continua de gra\xE7a.",
    "Isso n\xE3o afeta meus estudos. Fica \xE0 vontade.",
    "Falta de moeda \xE9 dado irrelevante pra minha pesquisa."
  ],
  muito_gold: [
    "Muito Gold. Interessante como isso muda o comportamento das pessoas.",
    "Rico assim, voc\xEA poderia financiar uma expedi\xE7\xE3o de pesquisa.",
    "Dinheiro n\xE3o \xE9 meu campo de estudo, mas admito que ajuda.",
    "Gold em excesso \xE9 um fen\xF4meno social curioso, por si s\xF3.",
    "Espero que use parte disso pra apoiar pesquisas importantes. As minhas, por exemplo."
  ],
  chovendo: [
    "Chuva muda o comportamento de v\xE1rias criaturas. Adoro observar isso.",
    "Dia de chuva \xE9 dia perfeito pra estudar padr\xF5es de migra\xE7\xE3o.",
    "Chovendo assim, algumas esp\xE9cies saem mais, outras se escondem.",
    "A chuva revela comportamentos que o sol esconde.",
    "Aproveito dias assim pra revisar minhas anota\xE7\xF5es de campo."
  ],
  noite: [
    "A noite revela criaturas que o dia esconde. Fascinante.",
    "Trabalho melhor \xE0 noite, quando o Reino tamb\xE9m muda de comportamento.",
    "Passei mais noites observando covis do que dormindo em uma cama de verdade.",
    "Se veio de noite, talvez tenha visto algo que vale a pena registrar.",
    "A escurid\xE3o n\xE3o me assusta. S\xF3 me d\xE1 mais para observar."
  ],
  primeira_visita: [
    "Primeira vez no Besti\xE1rio. Sinta-se \xE0 vontade pra explorar.",
    "Bem-vindo pela primeira vez. Cada visitante novo traz uma pergunta diferente.",
    "Voc\xEA nunca esteve aqui. O que despertou sua curiosidade hoje?",
    "Primeira visita \xE9 sempre a mais cheia de perguntas.",
    "Entra. Deixe-me te mostrar o que j\xE1 documentamos at\xE9 agora."
  ],
  visitas_repetidas: [
    "Voc\xEA de novo. Sua curiosidade parece constante.",
    "Voltou. Isso j\xE1 \xE9 um padr\xE3o de comportamento interessante.",
    "J\xE1 \xE9 visitante frequente. Vou incluir isso nas minhas notas.",
    "Cada retorno seu traz uma pergunta nova. Aprecio isso.",
    "Sempre que penso ter visto tudo que voc\xEA tinha pra perguntar, aparece algo novo."
  ],
  aleatorias: [
    "Toda criatura tem um comportamento. A maioria de n\xF3s s\xF3 nunca ficou tempo suficiente pra ver.",
    "Um peixe el\xE9trico n\xE3o sabe o que \xE9 eletricidade. Um drag\xE3o n\xE3o sabe que solta magia. Ele apenas vive.",
    "Cada nova esp\xE9cie que descubro me faz perceber o quanto ainda n\xE3o sei.",
    "Prefiro perguntas sem resposta a respostas sem pergunta.",
    "O Reino \xE9 maior do que qualquer cat\xE1logo pode registrar.",
    // Sprint Social Fabric (Phase I)
    "J\xE1 viajamos juntos, eu e o Idris, atr\xE1s de uma expedi\xE7\xE3o que ningu\xE9m mais quis fazer. Ele queria voltar inteiro. Eu queria anotar tudo. Os dois conseguimos, por pouco."
  ],
  humor: [
    "Uma vez me disfarcei de arbusto pra observar uma criatura. Funcionou bem demais.",
    "J\xE1 fui confundido com uma est\xE1tua de tanto ficar parado observando.",
    "Um lobo uma vez me observou observando ele. Empate t\xE9cnico.",
    "J\xE1 anotei o comportamento errado numa p\xE1gina certa. Foi uma bagun\xE7a acad\xEAmica e tanto.",
    "Rio pouco, mas quando uma criatura faz algo inesperado, eu rio sozinho, tarde da noite.",
    // Sprint Social Fabric (Phase I)
    "O Zoltar acha que previs\xE3o \xE9 ci\xEAncia. Eu acho que \xE9 sorte com roupa nova. Discutimos isso toda semana, e nenhum dos dois cede."
  ],
  conselhos: [
    "Observe antes de agir. Isso salva vidas.",
    "Nenhuma criatura ataca sem motivo. Entenda o motivo primeiro.",
    "Anote o que aprender. A mem\xF3ria falha, o papel n\xE3o.",
    "Nunca subestime uma criatura s\xF3 porque parece pequena.",
    "Curiosidade \xE9 uma ferramenta t\xE3o \xFAtil quanto qualquer espada.",
    // Sprint Social Fabric (Phase I)
    "O Roth me deixa passar pelo Port\xE3o Norte sem revistar minhas amostras, mesmo desconfiando um pouco do que carrego. Isso \xE9 respeito, do jeito dele."
  ],
  fofocas: [
    "Ouvi dizer que a Talia vendeu a mesma espada tr\xEAs vezes. Comportamento comercial curioso.",
    "Dizem que o Zoltar prev\xEA o futuro atrav\xE9s dos frascos. Adoraria estudar essa metodologia.",
    "A Greta sabe de tudo antes de todo mundo. Isso merece investiga\xE7\xE3o s\xE9ria.",
    "O Borin fala sozinho na forja, segundo consta. Comportamento comum sob estresse repetitivo.",
    "Prefiro dados a fofoca, mas admito que esta \xE9 interessante.",
    // Sprint Wolves Ecosystem (Phase I)
    "Tenho um caderno s\xF3 de rastros de lobo, catalogados por tamanho da pegada. Ainda incompleto.",
    "Nunca confirmei se as presas do lobo dos Picos realmente brilham, ou se \xE9 s\xF3 a neve. Sigo tentando.",
    "Dedicaria anos s\xF3 pra entender por que uma noite inteira, h\xE1 muito tempo, nenhum lobo uivou no Bosque.",
    // Sprint Ravens Ecosystem (Phase I)
    "Tenho um caderno inteiro s\xF3 sobre o comportamento dos corvos. Ainda incompleto.",
    "Nunca resolvi se os corvos entendem o que dizemos. Prefiro deixar a pergunta em aberto do que inventar uma resposta.",
    "Um corvo parece saber, antes de qualquer ca\xE7ador, onde a matilha de lobos vai atacar. Ainda n\xE3o sei explicar como.",
    // Sprint Ancient Ruins Ecosystem (Phase I)
    "Medi a profundidade do po\xE7o seco do Deserto de Vidro tr\xEAs vezes. Tr\xEAs resultados diferentes. Vou medir de novo.",
    "Os s\xEDmbolos do penhasco nos Picos Congelados n\xE3o batem com meu esbo\xE7o da primeira visita. Prefiro achar que errei eu, n\xE3o que mudaram.",
    "Adoraria catalogar as doze Ru\xEDnas Antigas com o mesmo rigor que catalogo criaturas. Ainda n\xE3o encontrei um m\xE9todo que funcione com pedra que n\xE3o se explica.",
    // Sprint First WOW Moment (Phase I)
    "Estudei o desgaste de umas luvas rasgadas outro dia. Cientificamente, deveriam ter se desfeito h\xE1 semanas.",
    // Sprint StreamRPG Identity (Phase I)
    "O Bosque Sussurrante continua sendo o lugar que mais estudo, depois de todos esses anos. Sempre acho algo que n\xE3o tinha visto antes.",
    // Sprint StreamRPG Identity (Phase II)
    "O Corvo Anci\xE3o nunca me deixou perto o bastante pra estudar de verdade. Isso, sozinho, j\xE1 vira uma nota de campo interessante.",
    "Entre a Loba Prateada e o Lobo Marcado, aposto que um dia v\xE3o provar ser a mesma linhagem. Ainda n\xE3o tenho como provar. Ainda.",
    // Sprint Place Identity (Phase I)
    "Levei um instrumento de medi\xE7\xE3o pra C\xE2mara das Vozes, uma vez. Ele registrou um som que eu n\xE3o consegui ouvir."
  ],
  comentarios_reino: [
    "Esse Reino tem uma biodiversidade fascinante ao redor.",
    "Cada regi\xE3o desse Reino guarda esp\xE9cies que ainda n\xE3o documentei completamente.",
    "O Reino cresce, e as criaturas ao redor se adaptam a isso.",
    "Vivemos cercados de mist\xE9rios que a maioria nunca para pra observar.",
    "Esse lugar merece d\xE9cadas de estudo, n\xE3o anos.",
    // Sprint History of the Kingdom (Phase I)
    "A Grande Migra\xE7\xE3o me interessa tanto quanto qualquer criatura que j\xE1 estudei. Motivo nunca esclarecido, efeito vis\xEDvel at\xE9 hoje.",
    "Tenho quinze di\xE1rios antigos catalogados. Nenhum conta a hist\xF3ria completa de nada \u2014 juntos, formam s\xF3 um mosaico incompleto.",
    "Adoraria aplicar o mesmo rigor \xE0s Eras do Reino que aplico ao Besti\xE1rio. O problema \xE9 que pedra e papel velho n\xE3o respondem perguntas como criatura viva."
  ],
  comentarios_npcs: [
    "O Borin entende de metal como eu entendo de comportamento animal.",
    "A Miriam catalogaria minhas descobertas melhor do que eu mesmo.",
    "A Elenya observa pessoas como eu observo criaturas. Somos parecidos, de um jeito.",
    "O Kade treina o corpo. Eu treino a observa\xE7\xE3o. M\xE9todos diferentes, disciplina parecida.",
    "O Alaric estuda o passado. Eu estudo o que ainda se move. Combinamos bem, \xE0s vezes."
  ],
  raras: [
    "Uma vez segui uma criatura por tr\xEAs dias sem dormir. Valeu a pena.",
    "J\xE1 fui atacado documentando um comportamento perigoso demais. Aprendi a manter dist\xE2ncia depois.",
    "Tive um mentor que me ensinou a nunca parar de perguntar por qu\xEA.",
    "Guardo um registro que nunca publiquei, por medo de n\xE3o ser acreditado.",
    "J\xE1 pensei em desistir de estudar criaturas perigosas. A curiosidade venceu."
  ],
  extremamente_raras: [
    "Tenho medo de morrer antes de documentar tudo que esse Reino ainda esconde.",
    "Se um dia eu desaparecer, procurem meus registros. Estar\xE1 tudo l\xE1, cuidadosamente anotado.",
    "J\xE1 chorei vendo uma criatura rara morrer sem que eu pudesse fazer nada.",
    "Quero que, no fim, o Reino lembre que cada criatura, por menor que seja, merece ser entendida antes de temida.",
    "Se esse Besti\xE1rio sobreviver a mim, quero que continue crescendo com a mesma curiosidade que eu tive."
  ]
};

// apps/web/src/lib/npcDialogue/alaric.ts
var ALARIC_DIALOGUE = {
  boas_vindas: [
    "Bem-vindo ao Museu do Reino. Cada pe\xE7a aqui tem uma hist\xF3ria a contar.",
    "Entra. A hist\xF3ria desse Reino agradece testemunhas.",
    "Seja bem-vindo. Voc\xEA est\xE1 prestes a caminhar entre mem\xF3rias.",
    "Bem-vindo. Poucos entendem o peso do que guardamos aqui.",
    "Entra com respeito. O que v\xEA aqui, um dia, ser\xE1 apenas lembran\xE7a."
  ],
  primeiro_encontro: [
    "Nunca te vi por aqui. Talvez voc\xEA mesmo vire hist\xF3ria um dia.",
    "Cara nova no Museu. Todo visitante novo \xE9 um cap\xEDtulo em aberto.",
    "Primeira vez aqui? Prepare-se para ver o Reino de outro \xE2ngulo.",
    "Bem-vindo. Espero que aprecie o peso da hist\xF3ria tanto quanto eu.",
    "Voc\xEA \xE9 novo. O tempo dir\xE1 se merece uma linha nos registros."
  ],
  novato: [
    "Novato. Todo grande nome do Reino tamb\xE9m come\xE7ou sem nenhuma linha escrita sobre si.",
    "Ainda n\xE3o h\xE1 hist\xF3ria registrada sobre voc\xEA. Isso \xE9 s\xF3 o come\xE7o.",
    "Todo iniciante \xE9 uma p\xE1gina em branco. Interessante pensar no que vai escrever nela.",
    "Voc\xEA ainda tem tudo por construir. Isso \xE9 raro e valioso.",
    "Um dia, talvez, eu catalogue algo sobre voc\xEA aqui dentro."
  ],
  veterano: [
    "Veterano. J\xE1 existe algo digno de nota sobre seu percurso.",
    "Voc\xEA j\xE1 n\xE3o \xE9 mais uma p\xE1gina em branco.",
    "Sua trajet\xF3ria come\xE7a a merecer registro formal.",
    "J\xE1 vi passar aventureiros como voc\xEA. Poucos deixam marca de verdade.",
    "Voc\xEA amadureceu de um jeito que a hist\xF3ria costuma notar."
  ],
  nivel_alto: [
    "Seu poder j\xE1 seria digno de uma exposi\xE7\xE3o pr\xF3pria.",
    "N\xEDvel alto. A hist\xF3ria lembra de quem chega t\xE3o longe.",
    "Poucos alcan\xE7am esse n\xEDvel de for\xE7a. Menos ainda merecem ser lembrados por isso.",
    "Espero que use esse poder de um jeito que valha a pena registrar.",
    "For\xE7a sem prop\xF3sito \xE9 apenas nota de rodap\xE9. A sua, espero, ser\xE1 cap\xEDtulo."
  ],
  boss_derrotado: [
    "Um Boss derrotado. Isso, sem d\xFAvida, ser\xE1 registrado.",
    "Ouvi dizer que voc\xEA venceu um Boss. Grandes Conquistas merecem exposi\xE7\xE3o pr\xF3pria.",
    "Vit\xF3rias como essa moldam a hist\xF3ria de um Reino inteiro.",
    "Voc\xEA fez hist\xF3ria hoje. Literalmente.",
    "Isso ser\xE1 lembrado. Farei quest\xE3o de que seja."
  ],
  sem_gold: [
    "Sem Gold n\xE3o diminui o valor hist\xF3rico de ningu\xE9m.",
    "A hist\xF3ria n\xE3o se mede em moedas, mas em feitos.",
    "Sem dinheiro hoje. Isso n\xE3o impede o Museu de receb\xEA-lo bem.",
    "O passado n\xE3o cobra entrada. Sinta-se \xE0 vontade.",
    "Riqueza \xE9 passageira. Mem\xF3ria, n\xE3o."
  ],
  muito_gold: [
    "Muito Gold. Espero que parte disso ajude a preservar nossa hist\xF3ria.",
    "Riqueza \xE9 interessante, mas o tempo trata todos os Gold da mesma forma: com indiferen\xE7a.",
    "Com essa fortuna, talvez financie a pr\xF3xima expedi\xE7\xE3o arqueol\xF3gica que precisamos.",
    "Gold em excesso \xE9 s\xF3 isso: gold. A verdadeira riqueza est\xE1 nas hist\xF3rias.",
    "Espero que use essa riqueza para algo que mere\xE7a ser lembrado."
  ],
  chovendo: [
    "Chuva combina com Museu. O sil\xEAncio se aprofunda.",
    "Dias de chuva trazem visitantes mais contemplativos.",
    "Gosto do som da chuva contra essas paredes antigas.",
    "Chuva l\xE1 fora, hist\xF3ria aqui dentro, protegida do tempo.",
    "Aproveite a chuva para caminhar devagar entre as exposi\xE7\xF5es."
  ],
  noite: [
    "O Museu \xE0 noite tem um sil\xEAncio que nenhum livro descreve bem.",
    "Trabalho at\xE9 tarde catalogando o que o Reino ainda n\xE3o teve coragem de esquecer.",
    "A noite favorece a reflex\xE3o sobre o passado.",
    "Se veio de noite, prepare-se para um Museu ainda mais solene.",
    "A escurid\xE3o real\xE7a o peso de cada pe\xE7a exposta aqui."
  ],
  primeira_visita: [
    "Primeira vez no Museu. Prepare-se para ver esse Reino com outros olhos.",
    "Bem-vindo pela primeira vez. Cada exposi\xE7\xE3o aqui merece aten\xE7\xE3o.",
    "Voc\xEA nunca esteve aqui? Vamos come\xE7ar pelo princ\xEDpio, ent\xE3o.",
    "Primeira visita \xE9 sempre a mais reveladora.",
    "Entra. Deixe-me te mostrar o que a hist\xF3ria desse Reino guarda."
  ],
  visitas_repetidas: [
    "Voc\xEA voltou. A hist\xF3ria recompensa quem retorna.",
    "J\xE1 \xE9 visitante frequente. Isso me deixa satisfeito.",
    "Cada retorno seu revela algo que talvez tenha passado despercebido antes.",
    "Sua const\xE2ncia aqui j\xE1 merece nota nos meus pr\xF3prios registros.",
    "Voltar sempre ao passado \xE9 sinal de sabedoria, n\xE3o de saudosismo."
  ],
  aleatorias: [
    "Um objeto sem hist\xF3ria \xE9 s\xF3 um objeto. Aqui, cada um tem as duas coisas.",
    "Passo os dias catalogando o que o Reino ainda n\xE3o teve coragem de esquecer.",
    "A hist\xF3ria nunca \xE9 neutra. Algu\xE9m sempre decide o que vale a pena guardar.",
    "Cada gera\xE7\xE3o reescreve um pouco do que a anterior deixou.",
    "O tempo apaga detalhes, mas raramente apaga o essencial.",
    // Sprint Social Fabric (Phase I)
    "O Roth escoltou um artefato inst\xE1vel at\xE9 o Museu, anos atr\xE1s, sem perguntar o motivo. Nunca esqueci esse favor."
  ],
  humor: [
    "Uma vez catalogei um item errado por semanas. Um historiador tamb\xE9m erra, apesar do que dizem.",
    "J\xE1 confundi uma r\xE9plica com o item original. Ningu\xE9m percebeu, felizmente.",
    "Um visitante uma vez tentou vender de volta um item que doou. Recusei, educadamente.",
    "Prefiro rir baixo, entre as exposi\xE7\xF5es. N\xE3o conv\xE9m perturbar os artefatos.",
    "J\xE1 perdi um documento importante dentro do pr\xF3prio Museu. Levei um m\xEAs pra achar.",
    // Sprint Social Fabric (Phase I)
    "Vou \xE0 Taverna da Greta uma vez por semana, sempre sozinho, sempre calado. Ela nunca pergunta por qu\xEA. Isso, sozinho, j\xE1 \xE9 uma forma de amizade."
  ],
  conselhos: [
    "Aprenda com quem veio antes. Isso poupa muitos erros.",
    "Guarde suas pr\xF3prias hist\xF3rias. Um dia elas importar\xE3o.",
    "Nunca subestime um objeto simples. A hist\xF3ria raramente \xE9 \xF3bvia.",
    "Questione o que ouvir sobre o passado. Nem tudo \xE9 registrado com honestidade.",
    "Deixe algo digno de ser lembrado, mesmo que pequeno."
  ],
  fofocas: [
    "Ouvi dizer que a Talia vendeu a mesma espada tr\xEAs vezes. Isso seria uma nota curiosa nos registros comerciais.",
    "Dizem que o Zoltar prev\xEA o futuro. A hist\xF3ria adoraria confirmar isso, um dia.",
    "A Greta sabe de tudo antes de todo mundo. Ela seria uma cronista e tanto.",
    "O Dorwin registra cada moeda com mais rigor que muitos historiadores registram fatos.",
    "Prefiro fato a fofoca, mas reconhe\xE7o quando uma \xE9 boa o bastante para virar a outra, com o tempo.",
    // Sprint Ancient Ruins Ecosystem (Phase I)
    "Doze s\xEDtios de ru\xEDnas, e nenhum me deu um \xFAnico registro que eu pudesse fechar de verdade. Isso me tira o sono, com prazer.",
    "Tentei mover o bloco ca\xEDdo do Portal de Pedra da Fronteira pra uma exposi\xE7\xE3o. N\xE3o consegui nem arranhar.",
    "A Est\xE1tua Sem Rosto \xE9 o item mais frustrante da minha carreira. Tamb\xE9m \xE9 o mais valioso. As duas coisas, ao mesmo tempo.",
    // Sprint Kingdom Folklore (Phase I)
    "Recuso-me a expor 'a Vi\xFAva de Pedra' como fato hist\xF3rico. Mas admito: guardo um registro dela, s\xF3 por precau\xE7\xE3o.",
    "Folclore n\xE3o \xE9 hist\xF3ria. Mas \xE0s vezes acerta detalhes que a hist\xF3ria oficial nunca documentou. Isso me incomoda profissionalmente.",
    "Quinze festas populares no Reino, e nenhuma delas est\xE1 catalogada no Museu. Talvez devesse. Talvez perca a gra\xE7a se eu catalogar.",
    // Sprint First WOW Moment (Phase I)
    "Deveria expor um par de Luvas Rasgadas aqui no Museu. 'Primeiros Passos', seria o nome da pe\xE7a.",
    // Sprint StreamRPG Identity (Phase I)
    "As Ru\xEDnas Esquecidas n\xE3o s\xE3o s\xF3 um s\xEDtio arqueol\xF3gico pra mim. S\xE3o parte de quem somos, gostemos ou n\xE3o da resposta que d\xE3o.",
    // Sprint StreamRPG Identity (Phase II)
    "Gritei o pr\xF3prio nome dentro da C\xE2mara das Vozes, uma vez. O eco que voltou n\xE3o soou como eu. Nunca mais repeti o teste.",
    "Levei uma equipe inteira pra tentar mover o bloco ca\xEDdo do Portal de Pedra da Fronteira. Nem com corda, nem com alavanca. Ele decide quando quer ser movido, aparentemente."
  ],
  comentarios_reino: [
    "Esse Reino j\xE1 viveu mais eras do que a maioria imagina.",
    "Cada pedra dessa Capital guarda uma camada de hist\xF3ria.",
    "O Reino de hoje \xE9 s\xF3 mais um cap\xEDtulo de uma hist\xF3ria muito mais longa.",
    "Gosto de pensar que ainda estamos escrevendo os melhores cap\xEDtulos.",
    "Esse lugar merece ser lembrado com precis\xE3o, n\xE3o com exagero.",
    // Sprint History of the Kingdom (Phase I)
    "Dez Eras eu j\xE1 catalogo com alguma confian\xE7a. Suspeito que existam mais, perdidas antes de qualquer registro.",
    "A Quebra do Primeiro Reino \xE9 o evento que mais me tira o sono. Tr\xEAs causas poss\xEDveis, e nenhuma prova decisiva.",
    "Tenho um monumento inteiro dedicado a nomes que n\xE3o aparecem em nenhum outro registro do Reino. Isso deveria me incomodar mais do que me incomoda."
  ],
  comentarios_npcs: [
    "O Borin forja objetos que um dia ser\xE3o pe\xE7as de museu, sem saber disso.",
    "A Miriam e eu discutimos sobre hist\xF3ria com frequ\xEAncia. Discordamos com respeito m\xFAtuo.",
    "A Elenya lidera de um jeito que a hist\xF3ria vai lembrar bem.",
    "O Yannick documenta criaturas como eu documento objetos. Somos parecidos, de certa forma.",
    "O Roth vigia o presente. Eu registro o passado. Precisamos um do outro."
  ],
  raras: [
    "Uma vez encontrei um documento que contradizia tudo que eu sabia sobre uma Era inteira. Ainda estudo isso.",
    "J\xE1 recusei expor um item por ach\xE1-lo perigoso demais para os olhos do p\xFAblico.",
    "Tive um mentor que me ensinou que nem toda verdade precisa ser dita imediatamente.",
    "Guardo um item que nunca expus publicamente. Talvez um dia esteja pronto.",
    "J\xE1 duvidei da minha pr\xF3pria interpreta\xE7\xE3o de um fato hist\xF3rico. Reescrevi o registro depois."
  ],
  extremamente_raras: [
    "Tenho medo de que, um dia, ningu\xE9m mais se importe em lembrar o que viemos antes deles.",
    "Se esse Museu queimar um dia, quero acreditar que a mem\xF3ria sobrevive em quem visitou.",
    "J\xE1 chorei catalogando a hist\xF3ria de algu\xE9m que ningu\xE9m mais lembrava.",
    "Se eu n\xE3o estiver mais aqui, espero que continuem perguntando 'por qu\xEA' antes de guardar qualquer coisa.",
    "Quero que, no fim, lembrem que tentei preservar esse Reino com honestidade, n\xE3o s\xF3 com nostalgia."
  ]
};

// apps/web/src/lib/npcDialogue/idris.ts
var IDRIS_DIALOGUE = {
  boas_vindas: [
    "Entra. Essa casa j\xE1 abrigou gente de todas as regi\xF5es que cruzei \u2014 e olha que cruzei bastante.",
    "Bem-vindo \xE0 Casa dos Viajantes. Aqui ningu\xE9m pergunta de onde voc\xEA veio, s\xF3 pra onde vai.",
    "Senta. Toda estrada cansa igual, n\xE3o importa qual voc\xEA escolheu.",
    "Entra sem pressa. Aprendi isso viajando: pressa \xE9 o que mais atrasa uma jornada.",
    "Bem-vindo. J\xE1 vi gente chegar aqui parecida com voc\xEA. Nunca soube se eram a mesma pessoa."
  ],
  primeiro_encontro: [
    "Nunca te vi. Ou vi, numa estrada qualquer, e esqueci o rosto. Acontece mais do que devia.",
    "Cara nova. J\xE1 perdi a conta de quantas caras novas cruzei estrada afora.",
    "Primeira vez aqui? Ou primeira vez que eu reparo. As duas coisas s\xE3o poss\xEDveis.",
    "Bem-vindo. N\xE3o prometo lembrar seu nome amanh\xE3. Prometo tentar.",
    "Voc\xEA chega parecido com um viajante que conheci nas Colinas \xC1ridas, h\xE1 anos. Ou n\xE3o. Mem\xF3ria de estrada \xE9 trai\xE7oeira."
  ],
  novato: [
    "Novato tem o mesmo brilho no olho que eu tinha, antes da primeira estrada ruim.",
    "Ainda n\xE3o sabe que toda regi\xE3o promete mais do que entrega. Vai aprender andando.",
    "Iniciante que escuta viajante velho chega mais longe. Ou n\xE3o. Cada estrada ensina diferente.",
    "J\xE1 vi gente sair novata e voltar irreconhec\xEDvel. Vamos ver o seu caso.",
    "N\xE3o vou te dar conselho de primeira viagem. S\xF3 vou dizer: leva sempre mais \xE1gua do que acha que precisa."
  ],
  veterano: [
    "Veterano tem o passo de quem j\xE1 errou caminho antes e aprendeu a n\xE3o se importar tanto.",
    "Voc\xEA anda diferente agora. Comparo com outros viajantes que conheci \u2014 o passo mudou parecido.",
    "J\xE1 n\xE3o pergunta mais dire\xE7\xE3o. Isso, pra mim, \xE9 o verdadeiro sinal de veterano.",
    "Cruzei caminho com muita gente parecida com quem voc\xEA virou. Poucas continuaram na estrada.",
    "Voc\xEA tem cara de quem j\xE1 n\xE3o confia em mapa. Bom instinto, ou j\xE1 apanhou o suficiente pra desconfiar de um."
  ],
  nivel_alto: [
    "Seu poder lembra o de um viajante que conheci nos Picos Congelados. Nunca soube se a compara\xE7\xE3o era justa.",
    "Forte assim, voc\xEA chama aten\xE7\xE3o em qualquer estrada. Nem sempre \xE9 bom sinal.",
    "J\xE1 ouvi de gente com esse tipo de for\xE7a que ficou perigosa at\xE9 pra si mesma. N\xE3o afirmo que \xE9 seu caso.",
    "Poder desse tamanho muda como as vilas novas recebem algu\xE9m. Reparei isso em outros, mais de uma vez.",
    "Comparo voc\xEA a poucos que j\xE1 vi. Nenhuma compara\xE7\xE3o \xE9 exata, mas essa chega perto."
  ],
  boss_derrotado: [
    "Ouvi dizer que voc\xEA encarou um Boss. J\xE1 ouvi hist\xF3rias parecidas de outras regi\xF5es. Nunca sei quanto acreditar.",
    "Um Boss derrotado. Cruzei gente que jurava ter feito o mesmo. Metade parecia mentir bem.",
    "Isso rende boa hist\xF3ria de estrada. S\xF3 cuidado pra n\xE3o exagerar at\xE9 nem voc\xEA mesmo lembrar a vers\xE3o certa.",
    "Vit\xF3ria contra Boss se parece, de longe, com toda vit\xF3ria grande que j\xE1 ouvi contar. De perto, imagino que seja diferente.",
    "N\xE3o sei o que \xE9 enfrentar um Boss. S\xF3 sei o que ou\xE7o depois, de quem sobrou pra contar."
  ],
  sem_gold: [
    "Sem Gold. J\xE1 viajei assim mais vezes do que gostaria de admitir.",
    "Bolso vazio na estrada ensina r\xE1pido o que realmente precisa. Aqui, n\xE3o cobro nada por isso.",
    "Sem moeda hoje. J\xE1 dormi em lugar pior por motivo menor que esse.",
    "Falta de Gold nunca impediu ningu\xE9m de continuar viajando. S\xF3 muda o jeito.",
    "Isso passa. Quase tudo na estrada passa, de um jeito ou de outro."
  ],
  muito_gold: [
    "Muito Gold. J\xE1 vi gente rica assim virar alvo antes de virar hist\xF3ria.",
    "Riqueza desse tamanho pesa na estrada. J\xE1 vi viajante largar metade pra andar mais r\xE1pido.",
    "Dinheiro assim chama aten\xE7\xE3o errada em regi\xE3o que eu n\xE3o recomendaria visitar sozinho.",
    "Ouvi de mais de um viajante que Gold em excesso muda o jeito como as pessoas olham pra voc\xEA. Reparei isso de longe tamb\xE9m.",
    "Guarda bem. Estrada tem gente que soma dois e dois r\xE1pido demais."
  ],
  chovendo: [
    "Chuva em estrada \xE9 igual em qualquer regi\xE3o que j\xE1 cruzei. S\xF3 muda o barro.",
    "Dia de chuva \xE9 dia de ficar parado e ouvir hist\xF3ria de quem tamb\xE9m ficou parado.",
    "J\xE1 vi chuva mudar o humor de vila inteira, em mais de uma regi\xE3o. Nunca me acostumei.",
    "Chuva atrasa toda travessia que j\xE1 fiz. Nenhuma exce\xE7\xE3o at\xE9 hoje.",
    "Prefiro chuva a neve. Isso eu aprendi comparando as duas, na pele."
  ],
  noite: [
    "Noite na estrada \xE9 diferente de noite na Capital. J\xE1 dormi nas duas e prefiro n\xE3o dizer qual prefiro.",
    "De noite, toda regi\xE3o parece a mesma regi\xE3o. S\xF3 de dia elas se diferenciam de verdade.",
    "J\xE1 ouvi mais hist\xF3ria de viajante de noite do que de dia. N\xE3o sei explicar por qu\xEA.",
    "Se veio de noite, deve ter motivo. Estrada ensina a n\xE3o perguntar demais.",
    "Prefiro viajar de dia. Mas boa parte das hist\xF3rias que conto aconteceram de noite, por algum motivo."
  ],
  primeira_visita: [
    "Primeira vez aqui na Casa dos Viajantes. J\xE1 vi muita gente de primeira viagem em muita regi\xE3o diferente.",
    "Bem-vindo pela primeira vez. Comparo sempre a primeira visita de algu\xE9m com a minha pr\xF3pria, h\xE1 anos. Nunca bate exatamente.",
    "Voc\xEA nunca esteve aqui. Isso eu reconhe\xE7o f\xE1cil \u2014 \xE9 o mesmo olhar de quem chega a uma regi\xE3o nova.",
    "Primeira visita costuma render mais pergunta que resposta. Aproveita enquanto dura essa fase.",
    "Entra. Toda primeira vez parece com outra primeira vez que j\xE1 vi, em algum lugar que n\xE3o lembro bem."
  ],
  visitas_repetidas: [
    "Voc\xEA de novo. Cruzei estrada com gente que voltava assim, sempre pro mesmo lugar.",
    "Voltou. Isso me lembra um viajante que conheci \u2014 ele tamb\xE9m n\xE3o sabia explicar por que voltava tanto.",
    "J\xE1 \xE9 rosto conhecido nessa casa. Poucos ficam tempo suficiente pra eu reconhecer.",
    "Sua frequ\xEAncia aqui parece com a de quem j\xE1 n\xE3o sabe mais se \xE9 viajante ou morador.",
    "Volta sempre. Isso \xE9 mais raro do que parece, comparado com quem eu j\xE1 vi passar por essa casa."
  ],
  aleatorias: [
    "Cada regi\xE3o que j\xE1 cruzei tinha uma vers\xE3o diferente da mesma lenda. Nunca soube qual acreditar.",
    "N\xE3o confirmo nada que ou\xE7o na estrada. S\xF3 repito, com a ressalva de sempre.",
    "Comparado a outras regi\xF5es que j\xE1 vi, esse Reino guarda segredo de um jeito bem particular.",
    "Prefiro hip\xF3tese a certeza. Certeza, na estrada, costuma durar pouco.",
    "J\xE1 ouvi a mesma hist\xF3ria contada de tr\xEAs jeitos diferentes, em tr\xEAs regi\xF5es diferentes. Talvez as tr\xEAs estejam certas."
  ],
  humor: [
    "J\xE1 duvidei do Roth uma vez, quando ele jurou ter visto uma sombra na muralha. Anos depois, descobri que ele tinha raz\xE3o. Nunca mais duvidei."
  ],
  conselhos: [
    "Nunca confia em mapa velho. Estrada muda mais r\xE1pido que papel.",
    "Leva sempre mais \xE1gua do que acha que precisa. Aprendi isso do jeito dif\xEDcil.",
    "Escuta toda vers\xE3o de uma hist\xF3ria antes de decidir em qual acreditar. Eu nunca decido, na verdade.",
    "Compara o que ouve em cada regi\xE3o. Raramente bate, mas a diferen\xE7a j\xE1 ensina algo.",
    "N\xE3o confirma mist\xE9rio de ningu\xE9m. Nem o meu, quando perguntam."
  ],
  fofocas: [
    "J\xE1 vi o mesmo lobo marcado em duas regi\xF5es diferentes, no mesmo dia. N\xE3o sei explicar.",
    "Cruzei com um lobo das Colinas \xC1ridas duas vezes na mesma travessia. Magro, mas r\xE1pido.",
    "Os lobos do P\xE2ntano Podre nadam melhor do que ca\xE7am. Vi com meus pr\xF3prios olhos.",
    "J\xE1 confiei uma mensagem de verdade a um corvo, uma vez s\xF3. Nunca tentei de novo.",
    "Um corvo me seguiu por dias inteiros numa travessia. N\xE3o sei dizer se era o mesmo o tempo todo.",
    "N\xE3o sei se os corvos entendem o que a gente fala. Prefiro n\xE3o descobrir do jeito errado.",
    // Sprint Ancient Ruins Ecosystem (Phase I)
    "J\xE1 visitei doze ru\xEDnas diferentes. Cada uma me deixou com mais perguntas do que a anterior.",
    "Tem uma torre no Litoral Quebrado sem porta nenhuma. Dei tr\xEAs voltas nela. Ainda n\xE3o sei como entra.",
    "N\xE3o conto hist\xF3ria de ru\xEDna pra impressionar ningu\xE9m. Conto porque nem eu sei o final delas.",
    // Sprint Kingdom Folklore (Phase I)
    "J\xE1 ouvi a lenda do Homem de Cinza das Estradas em quatro regi\xF5es diferentes. Cada uma jura que ele apareceu ali, e s\xF3 ali.",
    "Nunca respondo chamado vindo do rio \xE0 noite. N\xE3o \xE9 medo. \xC9 respeito por uma regra que ningu\xE9m nunca me explicou de verdade.",
    "Coleciono lenda do jeito que outros colecionam moeda. A diferen\xE7a \xE9 que a minha cole\xE7\xE3o nunca se prova falsa nem verdadeira.",
    // Sprint First WOW Moment (Phase I)
    "Cruzei com um viajante de luvas t\xE3o rasgadas quanto as minhas primeiras. N\xE3o \xE9 insulto. \xC9 reconhecimento."
  ],
  comentarios_reino: [
    "J\xE1 vi Reinos maiores, Reinos menores. Esse aqui guarda algo que os outros n\xE3o guardavam do mesmo jeito.",
    "Comparo esse Reino com outros que cruzei. A compara\xE7\xE3o nunca \xE9 justa, mas sempre \xE9 interessante.",
    "Toda regi\xE3o daqui parece esconder uma vers\xE3o diferente da mesma hist\xF3ria. N\xE3o sei se isso \xE9 raro ou comum, comparado a outros lugares.",
    "J\xE1 ouvi dizer que esse Reino \xE9 mais antigo do que aparenta. Tamb\xE9m ouvi o contr\xE1rio. Sigo sem decidir.",
    "Esse lugar tem menos estrada que outros Reinos que j\xE1 cruzei. Mais hist\xF3ria por quil\xF4metro, talvez."
  ],
  comentarios_npcs: [
    "O Yannick e eu j\xE1 viajamos juntos, uma vez, atr\xE1s de uma expedi\xE7\xE3o que ningu\xE9m mais quis fazer. Ele anotava tudo. Eu s\xF3 queria voltar inteiro."
  ],
  raras: [
    "A Miriam guarda cada hist\xF3ria que eu conto, mesmo as que eu mesmo j\xE1 esqueci os detalhes. Prefiro que seja ela a lembrar, n\xE3o eu."
  ],
  extremamente_raras: [
    "Tenho medo de esquecer alguma estrada importante entre tantas que j\xE1 andei.",
    "Uma vez pensei em parar de viajar de vez. Essa casa quase me convenceu. Quase.",
    "Se um dia eu n\xE3o voltar de uma travessia, n\xE3o procurem explica\xE7\xE3o. Procurem s\xF3 a estrada que eu segui por \xFAltimo.",
    "J\xE1 vi coisas que n\xE3o conto nem depois de duas rodadas de bebida. Vou continuar assim.",
    "Quero que, no fim, lembrem de mim como algu\xE9m que nunca confirmou mist\xE9rio nenhum \u2014 nem o meu."
  ]
};

// apps/web/src/lib/npcDialogue/recognition.ts
var RECOGNITION_RULES = {
  // Borin — reage a Bosses derrotados (exemplo do próprio brief).
  ferreiro: [
    {
      when: (ctx) => ctx.bossesDefeated === 0,
      lines: ["Ainda n\xE3o encarou um Boss? Vai chegar sua hora.", "Nunca enfrentou um Boss ainda. Isso muda, cedo ou tarde."]
    },
    {
      when: (ctx) => ctx.bossesDefeated === 1,
      lines: ["Ent\xE3o era verdade. Voc\xEA voltou.", "Ouvi que enfrentou um Boss. Ainda inteiro, pelo visto."]
    },
    {
      when: (ctx) => ctx.bossesDefeated >= 2,
      lines: ["J\xE1 estou cansado de consertar sua armadura.", "Mais um Boss? Minha bigorna j\xE1 reconhece seus equipamentos."]
    }
  ],
  // Talia — adora vender, reage a Gold.
  mercador: [
    { when: (ctx) => ctx.gold < 20, lines: ["Sem moeda, sem neg\xF3cio. Mas eu espero.", "Volta quando tiver mais pra gastar."] },
    { when: (ctx) => ctx.gold >= 200, lines: ["Agora sim, um cliente de verdade.", "Com esse tanto de Gold, temos muito o que conversar."] }
  ],
  // Zoltar — "prevê o futuro", reage a nível.
  alquimista: [
    {
      when: (ctx) => ctx.level < 5,
      lines: ["Sinto que voc\xEA ainda vai longe. Ou n\xE3o. Dif\xEDcil dizer.", "Voc\xEA ainda tem muito caminho pela frente. Ou n\xE3o. Quem sabe."]
    },
    {
      when: (ctx) => ctx.level >= 15,
      lines: ["Eu j\xE1 sabia que voc\xEA chegaria at\xE9 aqui. Ou finjo que sabia.", "Previs\xEDvel, voc\xEA chegar t\xE3o longe. Pelo menos \xE9 o que digo agora."]
    }
  ],
  // Elenya — líder da Guilda, reage a cargo no Reino.
  guildmaster: [
    {
      when: (ctx) => !ctx.hasKingdomRole,
      lines: ["Ainda n\xE3o ocupa nenhum cargo no Reino. Tudo bem, tem tempo.", "Seu nome ainda n\xE3o est\xE1 em nenhum cargo. Isso pode mudar."]
    },
    {
      when: (ctx) => ctx.hasKingdomRole,
      lines: ["O Reino j\xE1 reconhece seu nome em algum cargo. Isso n\xE3o \xE9 pouco.", "J\xE1 vi seu nome associado a um cargo por aqui. Bom trabalho."]
    }
  ],
  // Dorwin — exemplo exato do brief, reage a Gold.
  tesoureiro: [
    { when: (ctx) => ctx.gold < 20, lines: ["Economizar nunca fez mal."] },
    { when: (ctx) => ctx.gold >= 200, lines: ["Agora sim estamos falando de dinheiro."] }
  ],
  // Kade — Mestre da Arena, reage a Bosses derrotados.
  mestreArena: [
    { when: (ctx) => ctx.bossesDefeated === 0, lines: ["Nunca enfrentou um Boss? Treina mais, ent\xE3o.", "Sem Boss nenhum ainda. A Arena espera por voc\xEA."] },
    {
      when: (ctx) => ctx.bossesDefeated >= 1 && ctx.bossesDefeated <= 2,
      lines: ["J\xE1 provou o gosto de uma vit\xF3ria de verdade.", "Um Boss derrotado j\xE1 conta hist\xF3ria. Poucos chegam l\xE1."]
    },
    { when: (ctx) => ctx.bossesDefeated >= 3, lines: ["Voc\xEA j\xE1 \xE9 um nome conhecido na Arena.", "V\xE1rios Bosses j\xE1. Comece a pensar em treinar os novatos."] }
  ],
  // Roth — Guarda do Portão Norte, reage a regiões descobertas. Sprint
  // Gameplay Presence Phase I — título de fundador (dado real, raro)
  // vem primeiro na lista: quando bate, tem prioridade sobre a
  // observação de regiões, sem removê-la pra quem não tem título.
  guarda: [
    {
      when: (ctx) => ctx.hasFounderTitle,
      lines: ["Poucos guardas confundiriam esse t\xEDtulo com qualquer outro. Reconhe\xE7o o peso dele.", "Vejo o t\xEDtulo que carrega. N\xE3o \xE9 qualquer um que chega a ele."]
    },
    { when: (ctx) => ctx.regionsDiscovered <= 1, lines: ["Ainda n\xE3o saiu muito da Capital, hein.", "Pouca regi\xE3o explorada ainda. Cuidado l\xE1 fora."] },
    { when: (ctx) => ctx.regionsDiscovered >= 5, lines: ["J\xE1 vi voc\xEA voltar de tantas regi\xF5es que perdi a conta.", "Voc\xEA conhece mais estrada que muito guarda veterano."] }
  ],
  // Greta — exemplo exato do brief, reage a primeira visita à Cidade
  // (reaproveita a flag "city_seen" já existente, nenhum contador novo).
  taverneira: [
    { when: (ctx) => ctx.isFirstCityVisit, lines: ["Nunca vi voc\xEA por aqui."] },
    { when: (ctx) => !ctx.isFirstCityVisit, lines: ["De sempre? A mesa de costume continua livre."] }
  ],
  // Miriam — o brief pede "livros lidos", mas essa contagem não existe
  // em nenhum lugar do jogo (Biblioteca não rastreia leitura por
  // personagem). Substituído por título equipado — mesmo espírito
  // (reconhecer dedicação), só que com um dado que realmente existe.
  bibliotecaria: [
    { when: (ctx) => !ctx.hasEquippedTitle, lines: ["Quando tiver tempo... leia alguma coisa."] },
    {
      when: (ctx) => ctx.hasEquippedTitle,
      lines: ["Voc\xEA \xE9 um dos poucos aventureiros que carregam um t\xEDtulo com a mesma seriedade que um bom livro."]
    }
  ],
  // Yannick — biólogo/observador, reage a regiões descobertas.
  erudito: [
    { when: (ctx) => ctx.regionsDiscovered <= 2, lines: ["Ainda h\xE1 tanto Reino que voc\xEA n\xE3o viu.", "Poucas regi\xF5es estudadas ainda. H\xE1 muito para observar."] },
    { when: (ctx) => ctx.regionsDiscovered >= 5, lines: ["Voc\xEA j\xE1 viu mais regi\xF5es do que a maioria dos estudiosos daqui.", "Suas viagens j\xE1 renderiam um bom estudo."] }
  ],
  // Alaric — curador do Museu, reage a ter completado a primeira
  // expedição (o começo de uma "história própria").
  curador: [
    {
      when: (ctx) => !ctx.hasCompletedFirstExpedition,
      lines: ["Ainda n\xE3o tem uma hist\xF3ria pr\xF3pria pra contar. Ainda.", "Sem nenhuma expedi\xE7\xE3o ainda. O Museu espera suas hist\xF3rias."]
    },
    {
      when: (ctx) => ctx.hasCompletedFirstExpedition,
      lines: ["Sua primeira expedi\xE7\xE3o j\xE1 \xE9, de certa forma, hist\xF3ria.", "Toda jornada come\xE7a a virar hist\xF3ria a partir da primeira expedi\xE7\xE3o."]
    }
  ]
};
function getRecognitionLine(npcKey, ctx) {
  const rules = RECOGNITION_RULES[npcKey];
  if (!rules) return null;
  const matched = rules.find((rule) => rule.when(ctx));
  if (!matched) return null;
  return matched.lines[Math.floor(Math.random() * matched.lines.length)];
}
var HABIT_RULES = {
  bibliotecaria: [
    {
      memoryKey: "habit_library_shown",
      when: (ctx) => ctx.booksRead >= 3,
      line: "Vejo que continua estudando.",
      timelineKind: "npc_library_comment"
    }
  ],
  erudito: [
    {
      memoryKey: "habit_bestiary_shown",
      when: (ctx) => ctx.creaturesViewed >= 3,
      line: "Ouvi dizer que anda registrando criaturas.",
      timelineKind: "npc_bestiary_comment"
    },
    {
      memoryKey: "habit_expedition_shown",
      when: (ctx) => ctx.regionsDiscovered >= 4,
      line: "Tem viajado bastante."
    }
  ],
  curador: [
    {
      memoryKey: "habit_museum_shown",
      when: () => hasRemembered("museum_return_recorded"),
      line: "Pouca gente volta ao museu tantas vezes."
    },
    // Sprint Gameplay Presence Phase I — reage a uma criatura de
    // periculosidade "letal" já vista (Personal Timeline, cruzado com
    // lib/bestiary.ts — nenhum dado inventado, só cruzamento de dois
    // catálogos que já existiam).
    {
      memoryKey: "habit_rare_creature_shown",
      when: (ctx) => ctx.hasViewedRareCreature,
      line: "Uma criatura daquele n\xEDvel de perigo j\xE1 registrada? Isso merece destaque no Museu."
    }
  ],
  taverneira: [
    {
      memoryKey: "habit_tavern_shown",
      when: () => hasRemembered("tavern_regular_recorded"),
      line: "J\xE1 conhece metade dos frequentadores."
    },
    // Sprint Gameplay Presence Phase I — reage à categoria do evento
    // atual do Reino (worldState.current_event.category, já existente,
    // só passado até aqui via TavernBuilding — nenhum fetch novo).
    {
      memoryKey: "habit_greta_event_shown",
      when: (ctx) => ctx.worldEventCategory === "taverna",
      line: "Foi o que ouvi: esse evento do Reino j\xE1 virou assunto aqui dentro."
    }
  ],
  viajante: [
    {
      memoryKey: "habit_traveller_shown",
      when: () => hasRemembered("traveller_listener_recorded"),
      line: "Voc\xEA realmente gosta de ouvir hist\xF3rias.",
      timelineKind: "npc_traveller_comment"
    }
  ],
  ferreiro: [
    // Sprint Gameplay Presence Phase I — substitui a observação genérica
    // de "tem algo equipado" por 3 momentos distintos, ligados à
    // raridade real do equipamento (playerFacts.equipmentTier). Cada
    // tier tem sua própria memoryKey — evoluir de tier em tier sempre
    // rende um comentário novo, nunca preso ao primeiro que já apareceu.
    {
      memoryKey: "habit_equipment_weak_shown",
      when: (ctx) => ctx.equipmentTier === "weak",
      line: "Isso a\xED mal seria uma faca de cozinha decente. Cuidado l\xE1 fora."
    },
    {
      memoryKey: "habit_equipment_notable_shown",
      when: (ctx) => ctx.equipmentTier === "notable",
      line: "J\xE1 n\xE3o \xE9 mais vergonha o que voc\xEA carrega."
    },
    {
      memoryKey: "habit_equipment_strong_shown",
      when: (ctx) => ctx.equipmentTier === "strong",
      line: "Isso sim \xE9 equipamento decente. Trata bem, ouviu?"
    }
  ]
};
var SOCIAL_RULES = {
  taverneira: [
    {
      memoryKey: "social_greta_borin_shown",
      requiresKey: "habit_equipment_shown",
      line: "Borin comentou que voc\xEA passou por aqui."
    }
  ],
  guarda: [
    {
      memoryKey: "social_roth_idris_shown",
      requiresKey: "traveller_listener_recorded",
      line: "Idris disse que voc\xEA anda explorando bastante."
    }
  ]
};
function getHabitLine(npcKey, ctx) {
  const habitRules = HABIT_RULES[npcKey] ?? [];
  for (const rule of habitRules) {
    if (!hasRemembered(rule.memoryKey) && rule.when(ctx)) {
      return { line: rule.line, memoryKey: rule.memoryKey, timelineKind: rule.timelineKind };
    }
  }
  const socialRules = SOCIAL_RULES[npcKey] ?? [];
  for (const rule of socialRules) {
    if (!hasRemembered(rule.memoryKey) && hasRemembered(rule.requiresKey)) {
      return { line: rule.line, memoryKey: rule.memoryKey };
    }
  }
  return null;
}

// apps/web/src/lib/npcDialogue/foreshadowing.ts
var FORESHADOW_RULES = {
  ferreiro: [
    {
      memoryKey: "foreshadow_ferreiro_presa_do_alfa",
      when: () => !hasRemembered("first_bestiary_entry"),
      line: "J\xE1 ouvi falar de uma presa de lobo que ningu\xE9m trouxe at\xE9 mim ainda. Bicho deve ser grande."
    }
  ],
  erudito: [
    {
      memoryKey: "foreshadow_erudito_lobo_marcado",
      when: () => !hasRemembered("first_bestiary_entry"),
      line: "Tem um lobo por a\xED que ningu\xE9m consegue encurralar. Ainda n\xE3o documentei."
    },
    {
      memoryKey: "foreshadow_erudito_dragoa_picos",
      when: (ctx) => ctx.regionsDiscovered <= 2,
      line: "Dizem que existe uma criatura enorme nos Picos. Ningu\xE9m provou ainda."
    }
  ],
  bibliotecaria: [
    {
      memoryKey: "foreshadow_biblioteca_tratado_matilha",
      when: (ctx) => ctx.booksRead === 0,
      line: "Existe um livro antigo sobre lobos, se algum j\xE1 cruzou seu caminho."
    }
  ],
  curador: [
    {
      memoryKey: "foreshadow_museu_coluna_dos_nomes",
      when: () => !hasRemembered("museum_first_visit"),
      line: "Tem um monumento aqui que intriga mais gente do que devia."
    }
  ],
  viajante: [
    {
      memoryKey: "foreshadow_idris_terras_desconhecidas",
      when: (ctx) => ctx.regionsDiscovered <= 2,
      line: "Tem terra por a\xED que eu ainda n\xE3o entendi direito, mesmo depois de tantas viagens."
    }
  ],
  guarda: [
    {
      memoryKey: "foreshadow_guarda_ruinas",
      when: (ctx) => ctx.regionsDiscovered <= 2,
      line: "Tem gente que entra nas Ru\xEDnas... nem todo mundo volta."
    }
  ],
  taverneira: [
    {
      memoryKey: "foreshadow_taverna_primeiro_boss",
      when: (ctx) => ctx.bossesDefeated === 0,
      line: "Dizem que ningu\xE9m esquece o primeiro Boss que v\xEA. Voc\xEA ainda vai descobrir."
    }
  ],
  mestreArena: [
    {
      memoryKey: "foreshadow_arena_boss",
      when: (ctx) => ctx.bossesDefeated === 0,
      line: "Ainda n\xE3o sabe o que \xE9 encarar um Boss de verdade. Vai saber, uma hora dessas."
    }
  ]
};
function getForeshadowLine(npcKey, ctx) {
  const rules = FORESHADOW_RULES[npcKey] ?? [];
  for (const rule of rules) {
    if (!hasRemembered(rule.memoryKey) && rule.when(ctx)) {
      return { line: rule.line, memoryKey: rule.memoryKey };
    }
  }
  return null;
}

// apps/web/src/lib/npcDialogue/livingConsequences.ts
var CONSEQUENCE_RULES = {
  taverneira: [
    {
      memoryKey: "consequence_greta_primeiro_boss",
      when: (ctx) => ctx.bossesDefeated >= 1,
      line: "Ouvi dizer que algu\xE9m finalmente derrubou aquele monstro."
    }
  ],
  viajante: [
    {
      memoryKey: "consequence_idris_muitas_regioes",
      when: (ctx) => ctx.regionsDiscovered >= 6,
      line: "Est\xE1 ficando dif\xEDcil encontrar lugares que voc\xEA ainda n\xE3o conhe\xE7a."
    }
  ],
  guarda: [
    {
      memoryKey: "consequence_roth_cargo_assumido",
      when: (ctx) => ctx.hasKingdomRole,
      line: "As pessoas come\xE7am a observar quem ocupa posi\xE7\xF5es importantes."
    }
  ]
};
function getConsequenceLine(npcKey, ctx) {
  const rules = CONSEQUENCE_RULES[npcKey] ?? [];
  for (const rule of rules) {
    if (!hasRemembered(rule.memoryKey) && rule.when(ctx)) {
      return { line: rule.line, memoryKey: rule.memoryKey };
    }
  }
  return null;
}

// apps/web/src/lib/npcDialogue/heroJourney.ts
var LONG_PLAYTIME_MINUTES = 120;
var HERO_JOURNEY_RULES = {
  // Borin — exemplo exato do brief: muito tempo + equipamento atual
  // muito melhor que o inicial (equipmentTier "strong", o tier mais alto
  // já existente em playerFacts.ts).
  ferreiro: [
    {
      memoryKey: "hero_journey_ferreiro_luvas_rasgadas",
      when: (ctx) => ctx.equipmentTier === "strong" && ctx.totalMinutes >= LONG_PLAYTIME_MINUTES,
      line: "Ainda lembro quando voc\xEA apareceu usando aquelas Luvas Rasgadas."
    }
  ],
  // Greta — exemplo exato do brief: estágio de evolução avançado
  // (lib/characterPresence.ts, já combina 6 sinais reais sozinho) +
  // muito tempo — nunca conflita com a Consequence dela (bossesDefeated
  // >=1), sinal completamente diferente.
  taverneira: [
    {
      memoryKey: "hero_journey_greta_nao_e_mais_o_mesmo",
      when: (ctx) => (ctx.characterStage === "heroi" || ctx.characterStage === "lenda") && ctx.totalMinutes >= LONG_PLAYTIME_MINUTES,
      line: "Voc\xEA j\xE1 n\xE3o parece o mesmo aventureiro."
    }
  ],
  // Idris — exemplo exato do brief: bem mais regiões que a Consequence
  // dele (>=8 aqui, >=6 lá) + muito tempo — só acende depois que a
  // Consequence já foi consumida.
  viajante: [
    {
      memoryKey: "hero_journey_idris_historias_de_viagem",
      when: (ctx) => ctx.regionsDiscovered >= 8 && ctx.totalMinutes >= LONG_PLAYTIME_MINUTES,
      line: "J\xE1 ouvi hist\xF3rias das suas viagens."
    }
  ],
  // Miriam — exemplo exato do brief: bem mais leitura que o Habit dela
  // (>=6 aqui, >=3 lá) + muito tempo.
  bibliotecaria: [
    {
      memoryKey: "hero_journey_miriam_muito_tempo_entre_livros",
      when: (ctx) => ctx.booksRead >= 6 && ctx.totalMinutes >= LONG_PLAYTIME_MINUTES,
      line: "Voc\xEA passou muito tempo entre estes livros."
    }
  ],
  // Alaric — exemplo exato do brief: já é um visitante recorrente
  // (mesma flag que o Habit dele usa) + volume real de registros
  // abertos (Collection Insights) + muito tempo — mais raro que o
  // Habit, que só olha a flag isolada.
  curador: [
    {
      memoryKey: "hero_journey_alaric_poucos_voltam_tanto",
      when: (ctx) => hasRemembered("museum_return_recorded") && ctx.museumEntriesViewed >= 5 && ctx.totalMinutes >= LONG_PLAYTIME_MINUTES,
      line: "Poucos visitantes voltam tantas vezes quanto voc\xEA."
    }
  ],
  // Roth — exemplo exato do brief: primeira expedição concluída (dado
  // real e permanente, hasCompletedFirstExpedition) + muito tempo —
  // sinal diferente da Consequence dele (hasKingdomRole).
  guarda: [
    {
      memoryKey: "hero_journey_roth_rostos_conhecidos",
      when: (ctx) => ctx.hasCompletedFirstExpedition && ctx.totalMinutes >= LONG_PLAYTIME_MINUTES,
      line: "\xC9 bom ver rostos conhecidos voltando aos port\xF5es."
    }
  ]
};
function getHeroJourneyLine(npcKey, ctx) {
  const rules = HERO_JOURNEY_RULES[npcKey] ?? [];
  for (const rule of rules) {
    if (!hasRemembered(rule.memoryKey) && rule.when(ctx)) {
      return { line: rule.line, memoryKey: rule.memoryKey };
    }
  }
  return null;
}
var HERO_JOURNEY_PLACE_RULES = {
  biblioteca: [
    {
      memoryKey: "hero_journey_place_biblioteca_descoberta_tardia",
      when: (ctx) => !!ctx.isFirstVisitToPlace && ctx.totalMinutes >= LONG_PLAYTIME_MINUTES,
      line: "Voc\xEA demorou para descobrir este lugar."
    }
  ],
  museu: [
    {
      memoryKey: "hero_journey_place_museu_conhece_tudo",
      when: (ctx) => (ctx.museumEntriesViewed ?? 0) >= 3,
      line: "Hoje voc\xEA anda por aqui como quem j\xE1 conhece tudo."
    }
  ]
};
function getHeroJourneyPlaceLine(place, ctx) {
  const rules = HERO_JOURNEY_PLACE_RULES[place] ?? [];
  for (const rule of rules) {
    if (!hasRemembered(rule.memoryKey) && rule.when(ctx)) {
      return { line: rule.line, memoryKey: rule.memoryKey };
    }
  }
  return null;
}

// apps/web/src/lib/npcDialogue/livingConversations.ts
var CONVERSATION_PAIRS = [
  // Exemplo exato do brief.
  {
    id: "greta_borin_espada",
    lines: [
      { npcKey: "taverneira", aboutNpcKey: "ferreiro", line: "Borin ainda insiste que aquela espada pode ser salva." },
      { npcKey: "ferreiro", aboutNpcKey: "taverneira", line: "Greta exagera metade das hist\xF3rias." }
    ]
  },
  // Exemplo exato do brief.
  {
    id: "miriam_idris_diario",
    lines: [
      { npcKey: "bibliotecaria", aboutNpcKey: "viajante", line: "Idris prometeu trazer outro di\xE1rio." },
      { npcKey: "viajante", aboutNpcKey: "bibliotecaria", line: "Se eu encontrar mais alguma coisa, a Miriam nunca mais me deixa em paz." }
    ]
  },
  // Exemplo exato do brief.
  {
    id: "roth_kade_treino",
    lines: [
      { npcKey: "guarda", aboutNpcKey: "mestreArena", line: "Kade chama qualquer discuss\xE3o de treinamento." },
      { npcKey: "mestreArena", aboutNpcKey: "guarda", line: "Roth leva tudo s\xE9rio demais." }
    ]
  },
  // Novo — grounded em alaric.ts/miriam.ts ("discutimos sobre história
  // com frequência/respeito").
  {
    id: "miriam_alaric_datas",
    lines: [
      { npcKey: "bibliotecaria", aboutNpcKey: "curador", line: "Alaric ainda insiste que aquela data est\xE1 errada nos registros." },
      { npcKey: "curador", aboutNpcKey: "bibliotecaria", line: "Miriam corrige minhas datas toda vez que passo pela Biblioteca." }
    ]
  },
  // Novo — grounded em alaric.ts/greta.ts (visita semanal, sempre
  // sozinho, mesa guardada sem perguntas).
  {
    id: "greta_alaric_mesa",
    lines: [
      { npcKey: "taverneira", aboutNpcKey: "curador", line: "Alaric j\xE1 reservou a mesa de sempre pra esta semana." },
      { npcKey: "curador", aboutNpcKey: "taverneira", line: "Greta nunca me pergunta por que venho sempre sozinho. Agrade\xE7o por isso." }
    ]
  },
  // Novo — grounded em borin.ts/roth.ts (lado a lado na Defesa do
  // Portão Norte, "nunca precisamos ser" próximos depois).
  {
    id: "borin_roth_portao",
    lines: [
      { npcKey: "ferreiro", aboutNpcKey: "guarda", line: "Roth ainda lembra da Defesa do Port\xE3o Norte como se fosse ontem." },
      { npcKey: "guarda", aboutNpcKey: "ferreiro", line: "Borin nunca fala da Defesa do Port\xE3o Norte. Prefiro assim." }
    ]
  },
  // Novo — grounded em greta.ts/elenya.ts ("sabe mais do que aparenta",
  // dos dois lados).
  {
    id: "greta_elenya_sabe_tudo",
    lines: [
      { npcKey: "taverneira", aboutNpcKey: "guildmaster", line: "Elenya sabe mais do que deixa transparecer. Sempre soube." },
      { npcKey: "guildmaster", aboutNpcKey: "taverneira", line: "Greta ouve tudo antes de qualquer relat\xF3rio chegar at\xE9 mim." }
    ]
  },
  // Novo — grounded em borin.ts/elenya.ts (confiança/liderança, dos
  // dois lados).
  {
    id: "borin_elenya_confianca",
    lines: [
      { npcKey: "ferreiro", aboutNpcKey: "guildmaster", line: "Elenya lidera essa Guilda melhor do que eu lideraria uma forja com dois aprendizes." },
      { npcKey: "guildmaster", aboutNpcKey: "ferreiro", line: "Borin nunca promete o que n\xE3o pode entregar. Isso vale mais que qualquer discurso." }
    ]
  }
];
var LINES_BY_SPEAKER = {};
for (const pair of CONVERSATION_PAIRS) {
  for (const line of pair.lines) {
    (LINES_BY_SPEAKER[line.npcKey] ??= []).push(line);
  }
}
function getLivingConversationLine(npcKey) {
  const candidates = LINES_BY_SPEAKER[npcKey];
  if (!candidates || candidates.length === 0) return null;
  return pickOfTheDay(candidates, keySalt(npcKey));
}

// apps/web/src/lib/npcDialogue/index.ts
var NPC_DIALOGUE = {
  ferreiro: BORIN_DIALOGUE,
  mercador: TALIA_DIALOGUE,
  alquimista: ZOLTAR_DIALOGUE,
  guildmaster: ELENYA_DIALOGUE,
  tesoureiro: DORWIN_DIALOGUE,
  mestreArena: KADE_DIALOGUE,
  guarda: ROTH_DIALOGUE,
  taverneira: GRETA_DIALOGUE,
  bibliotecaria: MIRIAM_DIALOGUE,
  erudito: YANNICK_DIALOGUE,
  curador: ALARIC_DIALOGUE,
  // Sprint Wolves Ecosystem (Phase I) — catálogo parcial (só "fofocas").
  viajante: IDRIS_DIALOGUE
};
function flattenDialogue(catalog) {
  return Object.values(catalog).flat();
}
function randomLine(catalog) {
  const all = flattenDialogue(catalog);
  return all[Math.floor(Math.random() * all.length)];
}

// apps/web/src/lib/regions.ts
var REGIONS = [
  {
    id: "porto-do-amanhecer",
    name: "Porto do Amanhecer",
    description: "Eu estou seguro, mas o mundo l\xE1 fora est\xE1 esperando.",
    difficulty: "Nenhuma (hub inicial)",
    theme: "Segura, acolhedora, sem tens\xE3o"
  },
  {
    id: "bosque-sussurrante",
    name: "Bosque Sussurrante",
    description: "Isto \xE9 seguro o bastante pra eu explorar sem medo, mas ainda me surpreende.",
    difficulty: "Baixa",
    theme: "Curiosidade tranquila"
  },
  {
    id: "pantano-podre",
    name: "P\xE2ntano Podre",
    description: "Preciso ir com cautela, isto n\xE3o perdoa pressa.",
    difficulty: "Baixa-m\xE9dia",
    theme: "Pavor contido"
  },
  {
    id: "colinas-aridas",
    name: "Colinas \xC1ridas",
    description: "Estou exposto, e eles sabem disso.",
    difficulty: "Baixa-m\xE9dia",
    theme: "Exposi\xE7\xE3o"
  },
  {
    id: "planicie-dourada",
    name: "Plan\xEDcie Dourada",
    description: "Aqui eu relaxo \u2014 mas nem tudo aqui \xE9 inofensivo.",
    difficulty: "Muito baixa",
    theme: "Falsa tranquilidade"
  },
  {
    id: "minas-abandonadas",
    name: "Minas Abandonadas",
    description: "O ar est\xE1 pesado, e eu n\xE3o sei o que vem depois da pr\xF3xima curva.",
    difficulty: "M\xE9dia",
    theme: "Claustrofobia crescente"
  },
  {
    id: "litoral-quebrado",
    name: "Litoral Quebrado",
    description: "Algo aqui j\xE1 afundou antes de mim \u2014 espero n\xE3o ser o pr\xF3ximo.",
    difficulty: "M\xE9dia",
    theme: "Melancolia"
  },
  {
    id: "picos-congelados",
    name: "Picos Congelados",
    description: "Estou pequeno diante disto, e isso \xE9 intencional.",
    difficulty: "M\xE9dia-alta",
    theme: "Isolamento e rever\xEAncia"
  },
  {
    id: "deserto-de-vidro",
    name: "Deserto de Vidro",
    description: "Algo terr\xEDvel aconteceu aqui, e ainda n\xE3o terminou.",
    difficulty: "Alta",
    theme: "Errado, artificial"
  },
  {
    id: "ruinas-esquecidas",
    name: "Ru\xEDnas Esquecidas",
    description: "Isto j\xE1 foi grandioso \u2014 e talvez ainda seja perigoso por causa disso.",
    difficulty: "Alta",
    theme: "Rever\xEAncia e inquieta\xE7\xE3o"
  },
  {
    id: "fortaleza-sombria",
    name: "Fortaleza Sombria",
    description: "Tudo que aprendi at\xE9 aqui est\xE1 sendo testado agora.",
    difficulty: "Muito alta (endgame)",
    theme: "Cl\xEDmax"
  }
];

// apps/web/src/lib/bestiary.ts
var CREATURE_TYPES = [
  { slug: "besta", label: "Besta", icon: "\u{1F43A}" },
  { slug: "morto-vivo", label: "Morto-vivo", icon: "\u{1F480}" },
  { slug: "elemental", label: "Elemental", icon: "\u{1F525}" },
  { slug: "humanoide", label: "Humanoide", icon: "\u{1F5E1}\uFE0F" },
  { slug: "dragao", label: "Drag\xE3o", icon: "\u{1F409}" },
  { slug: "espirito", label: "Esp\xEDrito", icon: "\u{1F47B}" },
  { slug: "aberracao", label: "Aberra\xE7\xE3o", icon: "\u{1F441}\uFE0F" },
  { slug: "construto", label: "Constructo", icon: "\u2699\uFE0F" },
  { slug: "mamifero", label: "Mam\xEDfero", icon: "\u{1F98A}" },
  { slug: "inseto", label: "Inseto", icon: "\u{1F41D}" }
];
var DANGER_LABEL = {
  baixa: "Baixa",
  media: "M\xE9dia",
  alta: "Alta",
  letal: "Letal"
};
function getRegionName2(regionId) {
  return REGIONS.find((region) => region.id === regionId)?.name ?? regionId;
}
var PLACEHOLDER_PAGES = [
  "**Esta criatura ainda est\xE1 sendo estudada.**\n\nOs eruditos da Capital continuam reunindo relatos de quem a encontrou.",
  "*Registro em desenvolvimento...*\n\nVolte ao Besti\xE1rio em outra ocasi\xE3o.",
  "**Fim do registro conhecido.**\n\nO restante do comportamento desta criatura ainda n\xE3o foi documentado."
];
var CREATURES = [
  {
    id: "lobos-cinzentos",
    name: "Lobos Cinzentos",
    type: "besta",
    habitat: "Florestas densas e sombrias",
    regionId: "bosque-sussurrante",
    dangerLevel: "baixa",
    icon: "\u{1F43A}",
    description: "Criatura em estudo...",
    pages: PLACEHOLDER_PAGES,
    locked: false,
    unlockCondition: "Dispon\xEDvel desde o in\xEDcio",
    status: "estudado",
    connections: {
      itemSlug: "colar-dentes-lobo",
      npcKey: "ferreiro",
      npcNote: "Borin comenta que couro de lobo forte \xE9 raro de achar sem rasgos.",
      travellerStoryId: "lobo-de-olhos-claros",
      bookId: "bestiario-das-terras-selvagens"
    }
  },
  {
    id: "espectros-da-neblina",
    name: "Espectros da Neblina",
    type: "espirito",
    habitat: "P\xE2ntanos e ru\xEDnas alagadas",
    regionId: "pantano-podre",
    dangerLevel: "media",
    icon: "\u{1F47B}",
    description: "Criatura em estudo...",
    pages: PLACEHOLDER_PAGES,
    locked: false,
    unlockCondition: "Dispon\xEDvel desde o in\xEDcio",
    status: "visto",
    connections: {
      npcKey: "alquimista",
      npcNote: "Zoltar acredita que a neblina do p\xE2ntano carrega mais do que s\xF3 \xE1gua.",
      rumor: "Um viajante jura ter visto luzes no P\xE2ntano Podre \xE0 noite.",
      travellerStoryId: "criatura-do-pantano-sem-nome"
    }
  },
  {
    id: "golens-de-pedra-antiga",
    name: "Golens de Pedra Antiga",
    type: "construto",
    habitat: "Galerias e minas abandonadas",
    regionId: "minas-abandonadas",
    dangerLevel: "alta",
    icon: "\u2699\uFE0F",
    description: "Criatura em estudo...",
    pages: PLACEHOLDER_PAGES,
    locked: false,
    unlockCondition: "Dispon\xEDvel desde o in\xEDcio",
    status: "visto",
    connections: {
      itemSlug: "lamina-forjada-minas-abandonadas",
      npcKey: "ferreiro",
      npcNote: "Borin estuda o mecanismo interno sempre que encontra um fragmento."
    }
  },
  {
    id: "serpente-das-areias-de-vidro",
    name: "Serpente das Areias de Vidro",
    type: "aberracao",
    habitat: "Dunas v\xEDtreas e cegantes",
    regionId: "deserto-de-vidro",
    dangerLevel: "alta",
    icon: "\u{1F441}\uFE0F",
    description: "Criatura em estudo...",
    pages: PLACEHOLDER_PAGES,
    locked: true,
    unlockCondition: "Desconhecida",
    status: "bloqueado",
    connections: {
      itemSlug: "foice-deserto-vidro",
      npcKey: "alquimista",
      npcNote: "Zoltar tem uma teoria inteira sobre o veneno dela, nunca publicada.",
      rumor: "Dizem que o Deserto de Vidro engoliu mais uma bota essa semana.",
      travellerStoryId: "serpente-que-fala-baixo"
    }
  },
  {
    id: "o-sussurro-sem-nome",
    name: "O Sussurro Sem Nome",
    type: "aberracao",
    habitat: "Sal\xF5es esquecidos da fortaleza",
    regionId: "fortaleza-sombria",
    dangerLevel: "letal",
    icon: "\u{1F52E}",
    description: "Criatura em estudo...",
    pages: PLACEHOLDER_PAGES,
    locked: true,
    unlockCondition: "Desconhecida",
    status: "bloqueado",
    connections: {
      itemSlug: "lanca-fortaleza-sombria",
      npcKey: "alquimista",
      npcNote: "Zoltar se recusa terminantemente a comentar sobre esse.",
      rumor: "Ouviram cantoria vindo da Fortaleza Sombria. Ningu\xE9m foi conferir.",
      bookId: "misterios-da-fortaleza-sombria"
    }
  },
  // ============================================================
  // Sprint Creature Expansion — Phase I — 120 criaturas novas,
  // expandindo o catálogo já existente acima (nenhuma das 5 originais
  // foi tocada). Cada `pages` tem 3 entradas: pequena história,
  // curiosidade, e "drops futuros" (só texto de lore — nenhum drop real
  // implementado, nenhuma tabela, nenhuma regra de Combat/Encounter lê
  // isso). `rarity`/`suggestedLevel` são novos, opcionais, só leitura.
  // ============================================================
  // ---- Mamíferos (12): 4 comum · 3 incomum · 3 raro · 1 muito-raro · 1 lendária ----
  { id: "raposa-do-trigo", name: "Raposa-do-Trigo", type: "mamifero", rarity: "comum", suggestedLevel: 2, habitat: "Campos abertos e bordas de planta\xE7\xE3o", regionId: "planicie-dourada", dangerLevel: "baixa", icon: "\u{1F98A}", description: "Rouba ovos de galinheiro sempre que pode.", pages: ["Aprendeu a abrir cercas simples observando fazendeiros descuidados.", "Alguns fazendeiros deixam um ovo de prop\xF3sito, s\xF3 pra ela ir embora satisfeita.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pele Alaranjada, Cauda Fofa, Dente Pequeno."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "javali-das-colinas", name: "Javali das Colinas", type: "mamifero", rarity: "comum", suggestedLevel: 3, habitat: "Encostas secas e trilhas estreitas", regionId: "colinas-aridas", dangerLevel: "media", icon: "\u{1F417}", description: "Destr\xF3i planta\xE7\xF5es inteiras numa \xFAnica noite.", pages: ["Vive em bandos pequenos e defende o territ\xF3rio com viol\xEAncia surpreendente.", "O Ferreiro Borin jura que um j\xE1 derrubou uma cerca de ferro.", "Poss\xEDveis drops (lore, n\xE3o implementado): Presa Curva, Couro Grosso, Casco Rachado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { npcKey: "ferreiro", npcNote: "Borin jura que um javali j\xE1 derrubou uma cerca de ferro inteira." } },
  { id: "esquilo-do-bosque", name: "Esquilo do Bosque", type: "mamifero", rarity: "comum", suggestedLevel: 1, habitat: "Copas altas e troncos ocos", regionId: "bosque-sussurrante", dangerLevel: "baixa", icon: "\u{1F43F}\uFE0F", description: "Rouba comida de qualquer mochila aberta.", pages: ["Enterra sementes e esquece a maioria, plantando metade da floresta sem querer.", "Idris jura que um j\xE1 roubou uma moeda de dentro da bota dele.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Macia, Cauda Peluda, Semente Roubada."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "cabra-das-rochas", name: "Cabra das Rochas", type: "mamifero", rarity: "comum", suggestedLevel: 2, habitat: "Encostas \xEDngremes e plat\xF4s altos", regionId: "colinas-aridas", dangerLevel: "baixa", icon: "\u{1F410}", description: "Escala paredes que nenhum humano tentaria.", pages: ["Vive em fam\xEDlias pequenas, sempre no ponto mais alto dispon\xEDvel.", "Roth garante que uma j\xE1 observou a Guarda do alto da muralha, por dias.", "Poss\xEDveis drops (lore, n\xE3o implementado): Chifre Curvo, Pelo \xC1spero, Casco Firme."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "doninha-do-celeiro", name: "Doninha do Celeiro", type: "mamifero", rarity: "incomum", suggestedLevel: 4, habitat: "Celeiros e dep\xF3sitos de gr\xE3o", regionId: "planicie-dourada", dangerLevel: "media", icon: "\u{1F43E}", description: "Rouba ovos e foge antes de qualquer rea\xE7\xE3o.", pages: ["Vive perto de celeiros, sempre um passo \xE0 frente de quem tenta peg\xE1-la.", "Um fazendeiro jura que perdeu uma d\xFAzia de ovos pra mesma doninha, num \xFAnico m\xEAs.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Fina, Garra Curta, Cauda Listrada."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "texugo-teimoso", name: "Texugo Teimoso", type: "mamifero", rarity: "incomum", suggestedLevel: 5, habitat: "Tocas profundas perto de \xE1gua parada", regionId: "pantano-podre", dangerLevel: "media", icon: "\u{1F9A1}", description: "N\xE3o recua de ningu\xE9m, nem de coisas maiores que ele.", pages: ["Cava tocas profundas e defende cada cent\xEDmetro delas.", "H\xE1 uma aposta antiga na Taverna sobre quem consegue passar por um sem ser mordido.", "Poss\xEDveis drops (lore, n\xE3o implementado): Garra Curta, Pelagem Escura, Presa Pequena."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { npcKey: "taverneira", npcNote: "Greta \xE9 quem toma conta da aposta antiga sobre o texugo." } },
  { id: "urso-das-minas", name: "Urso das Minas", type: "mamifero", rarity: "incomum", suggestedLevel: 6, habitat: "Galerias abandonadas e entradas escuras", regionId: "minas-abandonadas", dangerLevel: "alta", icon: "\u{1F43B}", description: "Vive perto de galerias abandonadas, longe de qualquer trilha.", pages: ["Adaptou-se ao escuro das minas melhor que qualquer outro animal da regi\xE3o.", "Mineiros deixam comida na entrada s\xF3 pra ele n\xE3o entrar mais fundo.", "Poss\xEDveis drops (lore, n\xE3o implementado): Garra Grossa, Pelagem Densa, Presa Longa."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { itemSlug: "botas-forjadas-minas-abandonadas", npcKey: "ferreiro", npcNote: "Borin diz que o metal das Minas Abandonadas nunca esquenta de verdade \u2014 nem perto de um urso irritado." } },
  { id: "lince-do-deserto-de-vidro", name: "Lince do Deserto de Vidro", type: "mamifero", rarity: "raro", suggestedLevel: 9, habitat: "Dunas v\xEDtreas ao entardecer", regionId: "deserto-de-vidro", dangerLevel: "alta", icon: "\u{1F406}", description: "Ca\xE7a sozinho e nunca deixa rastro na areia vitrificada.", pages: ["Poucos o veem duas vezes \u2014 a maioria s\xF3 v\xEA o brilho dos olhos \xE0 noite.", "Alguns ca\xE7adores duvidam que ele exista de verdade.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Reluzente, Garra de Vidro, Olho Claro."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { itemSlug: "botas-cacador-feras", npcKey: "erudito", npcNote: "Yannick duvida que o lince exista de verdade \u2014 mas guarda as marcas de garra como prova." } },
  { id: "alce-dos-picos", name: "Alce dos Picos", type: "mamifero", rarity: "raro", suggestedLevel: 10, habitat: "Vales altos entre a neve", regionId: "picos-congelados", dangerLevel: "media", icon: "\u{1F98C}", description: "Migra em rotas que ningu\xE9m conseguiu mapear por completo.", pages: ["Aparece s\xF3 em certas \xE9pocas do ano, e some por meses.", "Roth garante que um j\xE1 parou o tr\xE1fego inteiro do Port\xE3o Norte por uma tarde.", "Poss\xEDveis drops (lore, n\xE3o implementado): Chifre Congelado, Pelagem Grossa, Casco Duro."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { itemSlug: "elmo-picos-congelados", npcKey: "guarda", npcNote: "Roth garante que um alce j\xE1 parou o tr\xE1fego inteiro do Port\xE3o Norte por uma tarde." } },
  { id: "morcego-das-ruinas", name: "Morcego das Ru\xEDnas", type: "mamifero", rarity: "raro", suggestedLevel: 11, habitat: "C\xE2maras profundas sem luz", regionId: "ruinas-esquecidas", dangerLevel: "media", icon: "\u{1F987}", description: "Vive nas c\xE2maras mais profundas, longe de qualquer luz.", pages: ["Guia-se por ecos entre paredes que ningu\xE9m mais consegue interpretar.", "Alaric acredita que eles vivem ali h\xE1 mais tempo que as pr\xF3prias Ru\xEDnas.", "Poss\xEDveis drops (lore, n\xE3o implementado): Asa Fina, Presa Curva, Pelagem Escura."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "urso-fantasma-da-fortaleza", name: "Urso-Fantasma da Fortaleza", type: "mamifero", rarity: "muito-raro", suggestedLevel: 15, habitat: "Corredores internos da fortaleza", regionId: "fortaleza-sombria", dangerLevel: "letal", icon: "\u{1F43B}\u200D\u2744\uFE0F", description: "Raramente ataca \u2014 na maioria das vezes, s\xF3 observa de longe.", pages: ["Ningu\xE9m sabe explicar como um urso comum sobreviveria tanto tempo ali dentro.", "Alguns juram que ele \xE9 branco s\xF3 \xE0 noite.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem P\xE1lida, Garra Imensa, Presa Gasta."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "cervo-de-chifres-torcidos-bestiario", name: "O Cervo de Chifres Torcidos", type: "mamifero", rarity: "lendaria", suggestedLevel: 20, habitat: "Trecho \xFAnico de floresta densa", regionId: "bosque-sussurrante", dangerLevel: "alta", icon: "\u{1F98C}", description: "Foi visto tr\xEAs vezes em uma d\xE9cada, sempre no mesmo trecho de floresta.", pages: ["Alguns ca\xE7adores dedicam a vida inteira s\xF3 pra v\xEA-lo de novo.", "Yannick tem um caderno inteiro dedicado s\xF3 a relatos sobre ele.", "Poss\xEDveis drops (lore, n\xE3o implementado): Galhada Torcida, Pelagem Prateada, Casco Antigo."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado", connections: { npcKey: "erudito", npcNote: "Yannick tem um caderno inteiro dedicado s\xF3 a relatos sobre este cervo.", travellerStoryId: "cervo-de-chifres-torcidos", bookId: "bestiario-das-terras-selvagens" } },
  // ---- Insetos (12): 4 comum · 3 incomum · 3 raro · 1 muito-raro · 1 lendária ----
  { id: "vespa-da-colheita", name: "Vespa da Colheita", type: "inseto", rarity: "comum", suggestedLevel: 1, habitat: "Favos entre os trigais", regionId: "planicie-dourada", dangerLevel: "baixa", icon: "\u{1F41D}", description: "Ataca quem se aproxima demais dos favos.", pages: ["Constr\xF3i ninhos enormes entre os trigais, todo ver\xE3o.", "Talia vende mel dela na feira, mas nunca conta de onde tira.", "Poss\xEDveis drops (lore, n\xE3o implementado): Ferr\xE3o Fino, Asa Transparente, Favo Pequeno."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "besouro-de-casco-duro", name: "Besouro de Casco Duro", type: "inseto", rarity: "comum", suggestedLevel: 1, habitat: "Terreno pedregoso e seco", regionId: "colinas-aridas", dangerLevel: "baixa", icon: "\u{1FAB2}", description: "Rola pedrinhas maiores que o pr\xF3prio corpo.", pages: ["Ningu\xE9m sabe exatamente por qu\xEA ele faz isso.", "Crian\xE7as da Capital colecionam os cascos vazios que ele deixa para tr\xE1s.", "Poss\xEDveis drops (lore, n\xE3o implementado): Casco Reluzente, Perna Fina, Antena Curta."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "formiga-de-fogo-da-planicie", name: "Formiga-de-Fogo da Plan\xEDcie", type: "inseto", rarity: "comum", suggestedLevel: 2, habitat: "Formigueiros na terra batida", regionId: "planicie-dourada", dangerLevel: "media", icon: "\u{1F41C}", description: "Defende o formigueiro com uma agressividade fora do comum.", pages: ["Vive em col\xF4nias enormes, organizadas com precis\xE3o incomum.", "Um fazendeiro jura que elas reconstroem o formigueiro do mesmo jeito toda vez que \xE9 destru\xEDdo.", "Poss\xEDveis drops (lore, n\xE3o implementado): Mand\xEDbula Pequena, Casco Avermelhado, Ferr\xE3o Ardido."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "grilo-da-taverna", name: "Grilo da Taverna", type: "inseto", rarity: "comum", suggestedLevel: 1, habitat: "Frestas perto de luz acesa", regionId: "porto-do-amanhecer", dangerLevel: "baixa", icon: "\u{1F997}", description: "Canta a noite toda perto de qualquer luz acesa.", pages: ["Greta j\xE1 tentou expulsar os da Taverna dezenas de vezes. Eles sempre voltam.", "Alguns b\xEAbados juram que o canto deles muda de tom conforme a noite avan\xE7a.", "Poss\xEDveis drops (lore, n\xE3o implementado): Perna Saltitante, Asa Fina, Antena Longa."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "aranha-do-bosque-sussurrante", name: "Aranha do Bosque Sussurrante", type: "inseto", rarity: "incomum", suggestedLevel: 5, habitat: "Teias entre copas altas", regionId: "bosque-sussurrante", dangerLevel: "media", icon: "\u{1F577}\uFE0F", description: "Tece teias entre \xE1rvores altas demais para qualquer humano alcan\xE7ar.", pages: ["Raramente desce ao ch\xE3o, exceto para ca\xE7ar.", "Idris garante que uma teia dela j\xE1 segurou o peso de um homem adulto.", "Poss\xEDveis drops (lore, n\xE3o implementado): Teia Resistente, Perna Longa, Presa Fina."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { npcKey: "viajante", npcNote: "Idris garante que uma teia dela j\xE1 segurou o peso de um homem adulto." } },
  { id: "libelula-do-pantano", name: "Lib\xE9lula do P\xE2ntano", type: "inseto", rarity: "incomum", suggestedLevel: 4, habitat: "\xC1gua parada e vegeta\xE7\xE3o densa", regionId: "pantano-podre", dangerLevel: "baixa", icon: "\u{1FAB0}", description: "Voa em padr\xF5es que parecem, de longe, desenhados de prop\xF3sito.", pages: ["Aparece s\xF3 perto de \xE1gua parada, nunca de \xE1gua corrente.", "Yannick j\xE1 passou uma tarde inteira tentando desenhar o padr\xE3o de voo dela. Desistiu.", "Poss\xEDveis drops (lore, n\xE3o implementado): Asa Iridescente, Corpo Fino, Olho Composto."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "escaravelho-das-minas", name: "Escaravelho das Minas", type: "inseto", rarity: "incomum", suggestedLevel: 6, habitat: "T\xFAneis pr\xF3prios dentro das minas", regionId: "minas-abandonadas", dangerLevel: "media", icon: "\u{1FAB2}", description: "Cava t\xFAneis pr\xF3prios, ignorando completamente os j\xE1 existentes.", pages: ["Mineiros o consideram sinal de boa sorte, apesar de nunca explicarem por qu\xEA.", "Alguns juram que ele consegue sentir veios de min\xE9rio antes de qualquer humano.", "Poss\xEDveis drops (lore, n\xE3o implementado): Casco Met\xE1lico, Mand\xEDbula Forte, Antena Curta."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { itemSlug: "luvas-forjadas-minas-abandonadas", npcKey: "ferreiro", npcNote: "Borin acha que o escaravelho sente veio de min\xE9rio antes de qualquer mineiro." } },
  { id: "vespa-de-vidro-do-deserto", name: "Vespa de Vidro do Deserto", type: "inseto", rarity: "raro", suggestedLevel: 9, habitat: "Ninhos dentro da areia vitrificada", regionId: "deserto-de-vidro", dangerLevel: "alta", icon: "\u{1F41D}", description: "As asas cortam como l\xE2mina fina quando ela voa r\xE1pido demais.", pages: ["Constr\xF3i ninhos dentro da pr\xF3pria areia vitrificada, um mist\xE9rio em si.", "Ningu\xE9m que j\xE1 foi cortado por uma esqueceu a experi\xEAncia.", "Poss\xEDveis drops (lore, n\xE3o implementado): Asa Cortante, Ferr\xE3o de Vidro, Casco Transl\xFAcido."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "centopeia-das-ruinas", name: "Centopeia das Ru\xEDnas", type: "inseto", rarity: "raro", suggestedLevel: 10, habitat: "Frestas estreitas entre pedras antigas", regionId: "ruinas-esquecidas", dangerLevel: "alta", icon: "\u{1F41B}", description: "Vive nas frestas mais estreitas entre as pedras antigas.", pages: ["Cresce mais do que qualquer centopeia deveria, segundo os estudiosos.", "Alaric se recusa a guardar uma no Museu, viva ou morta.", "Poss\xEDveis drops (lore, n\xE3o implementado): Casco Segmentado, Perna Fina, Presa Curva."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "mariposa-da-fortaleza", name: "Mariposa da Fortaleza", type: "inseto", rarity: "raro", suggestedLevel: 11, habitat: "Escurid\xE3o completa dos corredores internos", regionId: "fortaleza-sombria", dangerLevel: "media", icon: "\u{1F98B}", description: "S\xF3 voa em completa escurid\xE3o, nunca perto de luz.", pages: ["Ningu\xE9m sabe do que ela se alimenta l\xE1 dentro.", "Guardas juram que o p\xF3 das asas dela apaga tochas.", "Poss\xEDveis drops (lore, n\xE3o implementado): P\xF3 de Asa, Antena Longa, Casco Escuro."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "rainha-formiga-do-formigueiro-profundo", name: "Rainha-Formiga do Formigueiro Profundo", type: "inseto", rarity: "muito-raro", suggestedLevel: 16, habitat: "Centro de formigueiros antigos", regionId: "planicie-dourada", dangerLevel: "alta", icon: "\u{1F41C}", description: "Nunca sai do centro do formigueiro, protegida por gera\xE7\xF5es de oper\xE1rias.", pages: ["Alguns formigueiros da Plan\xEDcie Dourada existem h\xE1 mais tempo que a pr\xF3pria Capital.", "Um estudioso passou anos tentando encontrar uma. Nunca encontrou.", "Poss\xEDveis drops (lore, n\xE3o implementado): Casco Real, Mand\xEDbula Imensa, Ferr\xE3o Grosso."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "o-enxame-sem-fim", name: "O Enxame Sem Fim", type: "inseto", rarity: "lendaria", suggestedLevel: 19, habitat: "Clareira espec\xEDfica, uma vez por gera\xE7\xE3o", regionId: "bosque-sussurrante", dangerLevel: "letal", icon: "\u{1F41D}", description: "Aparece uma vez a cada gera\xE7\xE3o, cobrindo uma clareira inteira.", pages: ["As \xFAltimas tr\xEAs apari\xE7\xF5es coincidem com mudan\xE7as grandes no Reino, segundo Alaric.", "Ningu\xE9m sabe se \xE9 um enxame s\xF3 ou v\xE1rios agindo juntos.", "Poss\xEDveis drops (lore, n\xE3o implementado): Enxame Capturado, Asa Coletiva, Mel Escuro."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  // ---- Mortos-vivos (12): 4 comum · 3 incomum · 2 raro · 2 muito-raro · 1 lendária ----
  { id: "esqueleto-de-sentinela", name: "Esqueleto de Sentinela", type: "morto-vivo", rarity: "comum", suggestedLevel: 3, habitat: "Postos de guarda abandonados", regionId: "ruinas-esquecidas", dangerLevel: "media", icon: "\u{1F480}", description: "Continua de posto, mesmo sem ningu\xE9m mais pra vigiar.", pages: ["Ningu\xE9m sabe h\xE1 quantas gera\xE7\xF5es ele est\xE1 ali parado.", "Alaric j\xE1 tentou catalogar a armadura dele. O esqueleto n\xE3o deixou.", "Poss\xEDveis drops (lore, n\xE3o implementado): Osso Quebrado, Fragmento de Armadura, Elmo Enferrujado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "zumbi-de-vila-abandonada", name: "Zumbi de Vila Abandonada", type: "morto-vivo", rarity: "comum", suggestedLevel: 3, habitat: "Casas vazias e ruas desertas", regionId: "pantano-podre", dangerLevel: "media", icon: "\u{1F9DF}", description: "Repete os mesmos passos, todos os dias, como se ainda tivesse rotina.", pages: ["Alguns moradores juram reconhecer o rosto de gente que j\xE1 morreu h\xE1 anos.", "Ningu\xE9m tem coragem de perguntar de perto.", "Poss\xEDveis drops (lore, n\xE3o implementado): Roupa Rasgada, Osso Solto, Sapato Velho."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "mao-rastejante", name: "M\xE3o Rastejante", type: "morto-vivo", rarity: "comum", suggestedLevel: 2, habitat: "Terrenos alagados e lamacentos", regionId: "pantano-podre", dangerLevel: "baixa", icon: "\u{1F590}\uFE0F", description: "Se move sozinha, sem dono nem explica\xE7\xE3o.", pages: ["Encontrada, mais de uma vez, longe de qualquer corpo.", "Ningu\xE9m quis levar uma pra casa como trof\xE9u, apesar da oferta.", "Poss\xEDveis drops (lore, n\xE3o implementado): Dedo \xD3sseo, Unha Quebrada, Pele Ressecada."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "mumia-menor-das-areias", name: "M\xFAmia Menor das Areias", type: "morto-vivo", rarity: "comum", suggestedLevel: 4, habitat: "Sepulturas rasas sob a areia", regionId: "deserto-de-vidro", dangerLevel: "media", icon: "\u{1F9FB}", description: "Enterrada superficialmente, sempre volta \xE0 superf\xEDcie.", pages: ["Ningu\xE9m sabe se ela sai sozinha ou se algo a desenterra.", "Os panos dela nunca se desfazem, n\xE3o importa o tempo.", "Poss\xEDveis drops (lore, n\xE3o implementado): Faixa Antiga, Amuleto Partido, P\xF3 Fino."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "cavaleiro-sem-cabeca-da-estrada-velha", name: "Cavaleiro Sem Cabe\xE7a da Estrada Velha", type: "morto-vivo", rarity: "incomum", suggestedLevel: 6, habitat: "Trecho fixo de estrada antiga", regionId: "colinas-aridas", dangerLevel: "alta", icon: "\u{1F5E1}\uFE0F", description: "Percorre sempre o mesmo trecho de estrada, todas as noites.", pages: ["Ningu\xE9m sabe seu nome, mas todo mundo conhece a estrada que ele guarda.", "Guardas evitam essa estrada \xE0 noite, mesmo sendo o caminho mais curto.", "Poss\xEDveis drops (lore, n\xE3o implementado): Elmo Vazio, Espada Cega, Armadura Fria."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "espectro-de-marinheiro", name: "Espectro de Marinheiro", type: "morto-vivo", rarity: "incomum", suggestedLevel: 7, habitat: "Perto de naufr\xE1gios na costa", regionId: "litoral-quebrado", dangerLevel: "media", icon: "\u{1F47B}", description: "Aparece s\xF3 perto de naufr\xE1gios, nunca em \xE1gua aberta.", pages: ["Alguns pescadores juram j\xE1 ter conversado com um, brevemente.", "Ningu\xE9m que conversou concorda no que ele disse.", "Poss\xEDveis drops (lore, n\xE3o implementado): Corda Molhada, Chap\xE9u Encharcado, Moeda Antiga."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "enforcado-da-forca-velha", name: "Enforcado da Forca Velha", type: "morto-vivo", rarity: "incomum", suggestedLevel: 6, habitat: "Estruturas de madeira abandonadas", regionId: "ruinas-esquecidas", dangerLevel: "alta", icon: "\u{1FAA2}", description: "Balan\xE7a mesmo sem vento nenhum.", pages: ["Ningu\xE9m sabe o crime, nem se houve um de verdade.", "A corda nunca se rompe, n\xE3o importa quanto tempo passe.", "Poss\xEDveis drops (lore, n\xE3o implementado): Corda Velha, Roupa Rasgada, Anel Simples."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "guardiao-osseo-da-ultima-coroa", name: "Guardi\xE3o \xD3sseo da \xDAltima Coroa", type: "morto-vivo", rarity: "raro", suggestedLevel: 10, habitat: "Corredores centrais das ru\xEDnas", regionId: "ruinas-esquecidas", dangerLevel: "alta", icon: "\u2694\uFE0F", description: "Protege um trecho espec\xEDfico das Ru\xEDnas, sem descanso.", pages: ["Dizem que j\xE1 foi um soldado da guarda real, h\xE1 muito tempo.", "Nenhum registro confirma seu nome, apesar de v\xE1rios j\xE1 terem tentado descobrir.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escudo Antigo, Elmo Real, Osso Refor\xE7ado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { itemSlug: "elmo-guardiao-ruinas", npcKey: "curador", npcNote: "Alaric acredita que ele j\xE1 foi um soldado da guarda real, h\xE1 muito tempo." } },
  { id: "bruxa-cinza-da-fortaleza", name: "Bruxa Cinza da Fortaleza", type: "morto-vivo", rarity: "raro", suggestedLevel: 12, habitat: "Sal\xF5es silenciosos da fortaleza", regionId: "fortaleza-sombria", dangerLevel: "letal", icon: "\u{1F9D9}\u200D\u2640\uFE0F", description: "S\xF3 fala quando algu\xE9m realmente escuta.", pages: ["Ningu\xE9m sabe se ela j\xE1 foi viva de verdade ou se sempre foi assim.", "Zoltar se recusa a falar sobre ela em detalhes.", "Poss\xEDveis drops (lore, n\xE3o implementado): Manto Cinzento, Cajado Quebrado, Frasco Vazio."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "o-rei-sem-sepultura", name: "O Rei Sem Sepultura", type: "morto-vivo", rarity: "muito-raro", suggestedLevel: 16, habitat: "Corredores mais antigos da fortaleza", regionId: "fortaleza-sombria", dangerLevel: "letal", icon: "\u{1F451}", description: "Anda pelos corredores mais antigos, sozinho, sem pressa.", pages: ["Nenhum historiador confirma qual rei foi, apesar das teorias.", "Alaric acredita que \xE9 o mesmo rei mencionado em relatos antigos, mas nunca provou.", "Poss\xEDveis drops (lore, n\xE3o implementado): Coroa Partida, Manto Real, Cetro Quebrado."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "a-viuva-da-ponte", name: "A Vi\xFAva da Ponte", type: "morto-vivo", rarity: "muito-raro", suggestedLevel: 17, habitat: "Ponte antiga sobre um rio seco", regionId: "colinas-aridas", dangerLevel: "alta", icon: "\u{1F47B}", description: "Espera, todas as noites, no mesmo ponto da ponte antiga.", pages: ["Ningu\xE9m sabe quem ela esperava, nem se um dia ele chegou.", "Alguns viajantes deixam flores na ponte, s\xF3 por precau\xE7\xE3o.", "Poss\xEDveis drops (lore, n\xE3o implementado): V\xE9u Rasgado, Anel de Casamento, Flor Seca."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "o-exercito-esquecido", name: "O Ex\xE9rcito Esquecido", type: "morto-vivo", rarity: "lendaria", suggestedLevel: 22, habitat: "P\xE1tio principal da fortaleza, s\xF3 \xE0 noite", regionId: "fortaleza-sombria", dangerLevel: "letal", icon: "\u2694\uFE0F", description: "Aparece completo, em forma\xE7\xE3o, e desaparece antes do amanhecer.", pages: ["Nenhum relato concorda em quantos soldados realmente s\xE3o.", "Alaric dedicou um cap\xEDtulo inteiro do Museu s\xF3 a teorias sobre eles.", "Poss\xEDveis drops (lore, n\xE3o implementado): Estandarte Rasgado, Armadura Completa, Espada de Comando."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  // ---- Espíritos (12): 4 comum · 3 incomum · 2 raro · 2 muito-raro · 1 lendária ----
  { id: "sussurro-do-vento", name: "Sussurro do Vento", type: "espirito", rarity: "comum", suggestedLevel: 1, habitat: "Encostas abertas ao vento", regionId: "colinas-aridas", dangerLevel: "baixa", icon: "\u{1F4A8}", description: "S\xF3 \xE9 notado quando o vento para de repente.", pages: ["Pastores dizem que \xE9 normal, e seguem trabalhando sem se abalar.", "Ningu\xE9m j\xE1 viu, s\xF3 ouviu.", "Poss\xEDveis drops (lore, n\xE3o implementado): Eco Capturado, Pena Solta, Poeira Fina."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "luz-errante-do-pantano", name: "Luz Errante do P\xE2ntano", type: "espirito", rarity: "comum", suggestedLevel: 2, habitat: "Trilhas enlameadas ao anoitecer", regionId: "pantano-podre", dangerLevel: "baixa", icon: "\u{1F32B}\uFE0F", description: "Guia viajantes pro caminho errado, na maioria das vezes sem querer.", pages: ["Ningu\xE9m sabe se ela tem inten\xE7\xE3o ou s\xF3 existe assim.", "Alguns juram que ela muda de cor dependendo de quem a segue.", "Poss\xEDveis drops (lore, n\xE3o implementado): Fragmento de Luz, N\xE9voa Capturada, Vidro Emba\xE7ado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { npcKey: "taverneira", npcNote: "Greta diz que \xE9 essa luz que os viajantes juram ver no P\xE2ntano \xE0 noite.", rumor: "Um viajante jura ter visto luzes no P\xE2ntano Podre \xE0 noite." } },
  { id: "eco-da-capital-velha", name: "Eco da Capital Velha", type: "espirito", rarity: "comum", suggestedLevel: 2, habitat: "Becos vazios \xE0 noite", regionId: "porto-do-amanhecer", dangerLevel: "baixa", icon: "\u{1F514}", description: "Repete sons antigos em becos vazios, sem motivo aparente.", pages: ["Moradores mais velhos dizem que j\xE1 era assim antes deles nascerem.", "O sino da torre, dizem, \xE9 onde ele mais aparece.", "Poss\xEDveis drops (lore, n\xE3o implementado): Som Preso, Sino Rachado, Poeira Antiga."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "sombra-da-vela-apagada", name: "Sombra da Vela Apagada", type: "espirito", rarity: "comum", suggestedLevel: 3, habitat: "C\xF4modos fechados sem janelas", regionId: "porto-do-amanhecer", dangerLevel: "baixa", icon: "\u{1F56F}\uFE0F", description: "Aparece s\xF3 quando uma vela apaga sozinha.", pages: ["Ningu\xE9m sabe se ela apaga a vela ou s\xF3 aparece depois.", "Miriam mant\xE9m uma vela sempre acesa na Biblioteca, s\xF3 por garantia.", "Poss\xEDveis drops (lore, n\xE3o implementado): Cera Fria, Sombra Capturada, Pavio Queimado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "pranto-da-ponte-velha", name: "Pranto da Ponte Velha", type: "espirito", rarity: "incomum", suggestedLevel: 6, habitat: "Perto de \xE1gua corrente, \xE0 noite", regionId: "colinas-aridas", dangerLevel: "media", icon: "\u{1F622}", description: "Chora baixinho perto da \xE1gua, sem nunca se mostrar.", pages: ["Ningu\xE9m sabe se \xE9 o mesmo esp\xEDrito da Vi\xFAva da Ponte ou algo diferente.", "Alguns viajantes evitam a ponte \xE0 noite s\xF3 por causa do choro.", "Poss\xEDveis drops (lore, n\xE3o implementado): L\xE1grima Congelada, V\xE9u Molhado, Eco de Choro."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "guardiao-silencioso-das-ruinas", name: "Guardi\xE3o Silencioso das Ru\xEDnas", type: "espirito", rarity: "incomum", suggestedLevel: 7, habitat: "C\xE2maras centrais das ru\xEDnas", regionId: "ruinas-esquecidas", dangerLevel: "media", icon: "\u{1F32B}\uFE0F", description: "Observa exploradores sem nunca interferir.", pages: ["Alguns juram que ele afasta perigos maiores, sem ningu\xE9m perceber.", "Alaric acredita que ele protege as Ru\xEDnas h\xE1 mais tempo que qualquer registro.", "Poss\xEDveis drops (lore, n\xE3o implementado): N\xE9voa Antiga, Pedra Fria, Eco de Passos."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { itemSlug: "amuleto-guardiao-ruinas", npcKey: "curador", npcNote: "Alaric acredita que ele protege as Ru\xEDnas h\xE1 mais tempo que qualquer registro." } },
  { id: "espirito-da-fogueira-apagada", name: "Esp\xEDrito da Fogueira Apagada", type: "espirito", rarity: "incomum", suggestedLevel: 6, habitat: "Acampamentos abandonados", regionId: "bosque-sussurrante", dangerLevel: "media", icon: "\u{1F525}", description: "Aparece s\xF3 onde uma fogueira foi abandonada acesa.", pages: ["Alguns ca\xE7adores juram que ele reacende o fogo sozinho, \xE0 noite.", "Kade jura que uma vez ele reacendeu uma fogueira na Arena, sem explica\xE7\xE3o.", "Poss\xEDveis drops (lore, n\xE3o implementado): Brasa Fria, Fuma\xE7a Presa, Cinza Quente."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "vulto-do-deserto-de-vidro", name: "Vulto do Deserto de Vidro", type: "espirito", rarity: "raro", suggestedLevel: 11, habitat: "Dunas durante tempestades de areia", regionId: "deserto-de-vidro", dangerLevel: "alta", icon: "\u{1F464}", description: "Aparece s\xF3 durante tempestades de areia, nunca antes ou depois.", pages: ["Alguns viajantes juram que ele os guiou pra fora da tempestade.", "Ningu\xE9m sabe se ele \xE9 benevolente ou s\xF3 indiferente.", "Poss\xEDveis drops (lore, n\xE3o implementado): Areia Vitrificada, Vulto Capturado, Vidro Quente."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "voz-da-fortaleza-sombria", name: "Voz da Fortaleza Sombria", type: "espirito", rarity: "raro", suggestedLevel: 12, habitat: "Corredores profundos da fortaleza", regionId: "fortaleza-sombria", dangerLevel: "alta", icon: "\u{1F5E3}\uFE0F", description: "Sussurra frases incompletas, nunca a mesma duas vezes.", pages: ["Ningu\xE9m que j\xE1 ouviu concorda no que ela disse de verdade.", "Zoltar tentou registrar as frases. Desistiu depois da terceira tentativa.", "Poss\xEDveis drops (lore, n\xE3o implementado): Sussurro Capturado, Eco Sombrio, Fragmento de Voz."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { npcKey: "alquimista", npcNote: "Zoltar tentou registrar as frases dela. Desistiu depois da terceira tentativa.", rumor: "Ouviram cantoria vindo da Fortaleza Sombria. Ningu\xE9m foi conferir.", bookId: "misterios-da-fortaleza-sombria" } },
  { id: "o-guardiao-sem-rosto", name: "O Guardi\xE3o Sem Rosto", type: "espirito", rarity: "muito-raro", suggestedLevel: 17, habitat: "Perto da est\xE1tua sem rosto da capital antiga", regionId: "ruinas-esquecidas", dangerLevel: "letal", icon: "\u{1F32B}\uFE0F", description: "Vigia a est\xE1tua sem rosto da \xDAltima Coroa, ou \xE9 ele mesmo a est\xE1tua.", pages: ["Ningu\xE9m sabe se \xE9 um esp\xEDrito ou apenas uma lenda que ganhou vida pr\xF3pria.", "Alaric se recusa a comentar essa teoria espec\xEDfica.", "Poss\xEDveis drops (lore, n\xE3o implementado): M\xE1scara Vazia, Pedra Polida, Eco Antigo."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado", connections: { npcKey: "curador", npcNote: "Alaric se recusa terminantemente a comentar essa teoria espec\xEDfica." } },
  { id: "a-dama-do-amanhecer", name: "A Dama do Amanhecer", type: "espirito", rarity: "muito-raro", suggestedLevel: 18, habitat: "Praia leste, no exato nascer do sol", regionId: "porto-do-amanhecer", dangerLevel: "media", icon: "\u{1F305}", description: "Aparece s\xF3 no exato instante do nascer do sol, uma vez por esta\xE7\xE3o.", pages: ["Alguns acreditam que ela \xE9 mais antiga que a pr\xF3pria Capital.", "O nome do Porto do Amanhecer vem, segundo alguns, dela mesma.", "Poss\xEDveis drops (lore, n\xE3o implementado): Luz Capturada, V\xE9u Dourado, Orvalho Eterno."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "o-silencio-antes-da-tempestade", name: "O Sil\xEAncio Antes da Tempestade", type: "espirito", rarity: "lendaria", suggestedLevel: 21, habitat: "Picos mais altos, minutos antes de tempestades", regionId: "picos-congelados", dangerLevel: "letal", icon: "\u{1F32A}\uFE0F", description: "Aparece s\xF3 nos minutos antes das piores tempestades dos Picos.", pages: ["Alguns exploradores usam a apari\xE7\xE3o dele como aviso pra recuar a tempo.", "Ningu\xE9m sabe se ele causa a tempestade ou s\xF3 a antecipa.", "Poss\xEDveis drops (lore, n\xE3o implementado): Sil\xEAncio Capturado, Gelo Eterno, Vento Preso."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  // ---- Constructos (12): 4 comum · 3 incomum · 3 raro · 1 muito-raro · 1 lendária ----
  { id: "boneco-de-palha-animado", name: "Boneco de Palha Animado", type: "construto", rarity: "comum", suggestedLevel: 2, habitat: "Meio de planta\xE7\xF5es", regionId: "planicie-dourada", dangerLevel: "baixa", icon: "\u{1F3AD}", description: "Fica parado no meio da planta\xE7\xE3o at\xE9 algu\xE9m chegar perto.", pages: ["Ningu\xE9m lembra quem o encantou pela primeira vez.", "Alguns fazendeiros trocam a roupa dele todo ano, por tradi\xE7\xE3o.", "Poss\xEDveis drops (lore, n\xE3o implementado): Palha Tran\xE7ada, Bot\xE3o Velho, Pano Remendado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "golem-de-barro-pequeno", name: "Golem de Barro Pequeno", type: "construto", rarity: "comum", suggestedLevel: 3, habitat: "Po\xE7as de lama seca", regionId: "pantano-podre", dangerLevel: "media", icon: "\u{1F5FF}", description: "Se forma sozinho quando a lama seca de um jeito espec\xEDfico.", pages: ["Desmancha em poucos dias, e outro se forma em outro lugar.", "Ningu\xE9m nunca viu dois ao mesmo tempo.", "Poss\xEDveis drops (lore, n\xE3o implementado): Barro Endurecido, Argila Rachada, Pedra Molhada."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "espantalho-de-ferro", name: "Espantalho de Ferro", type: "construto", rarity: "comum", suggestedLevel: 3, habitat: "Bordas de planta\xE7\xF5es antigas", regionId: "colinas-aridas", dangerLevel: "media", icon: "\u{1F6E1}\uFE0F", description: "Protege planta\xE7\xF5es que j\xE1 nem existem mais.", pages: ["Alguns fazendeiros o mant\xEAm por h\xE1bito, n\xE3o por necessidade.", "Borin garante que j\xE1 consertou um sem lembrar quem pediu.", "Poss\xEDveis drops (lore, n\xE3o implementado): Placa de Ferro, Parafuso Solto, Pano Velho."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "marionete-sem-dono", name: "Marionete Sem Dono", type: "construto", rarity: "comum", suggestedLevel: 2, habitat: "Lojas fechadas e dep\xF3sitos", regionId: "porto-do-amanhecer", dangerLevel: "baixa", icon: "\u{1F38E}", description: "Se move sozinha quando ningu\xE9m est\xE1 olhando direito.", pages: ["Encontrada numa loja fechada h\xE1 anos, sem explica\xE7\xE3o de como chegou l\xE1.", "Ningu\xE9m quis comprar, mesmo de gra\xE7a.", "Poss\xEDveis drops (lore, n\xE3o implementado): Fio Cortado, Madeira Entalhada, Roupa em Miniatura."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "golem-de-pedra-antiga-menor", name: "Golem de Pedra Menor", type: "construto", rarity: "incomum", suggestedLevel: 6, habitat: "Galerias profundas e escuras", regionId: "minas-abandonadas", dangerLevel: "alta", icon: "\u2699\uFE0F", description: "Guarda galerias que ningu\xE9m mais consegue identificar o prop\xF3sito.", pages: ["Move-se devagar, mas nunca para completamente.", "Mineiros aprenderam a simplesmente andar ao redor dele, sem provocar.", "Poss\xEDveis drops (lore, n\xE3o implementado): Fragmento de Pedra, N\xFAcleo Rachado, Placa Gravada."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "sentinela-de-bronze-enferrujado", name: "Sentinela de Bronze Enferrujado", type: "construto", rarity: "incomum", suggestedLevel: 7, habitat: "Postos avan\xE7ados das ru\xEDnas", regionId: "ruinas-esquecidas", dangerLevel: "alta", icon: "\u{1F6E1}\uFE0F", description: "Continua de posto, ferrugem e tudo, h\xE1 gera\xE7\xF5es.", pages: ["Alaric acredita que ele j\xE1 protegia algo importante, esquecido h\xE1 muito tempo.", "Ningu\xE9m j\xE1 conseguiu identificar o que ele est\xE1 protegendo, exatamente.", "Poss\xEDveis drops (lore, n\xE3o implementado): Placa de Bronze, Engrenagem Presa, Parafuso Antigo."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "boneco-de-cera-da-feira", name: "Boneco de Cera da Feira", type: "construto", rarity: "incomum", suggestedLevel: 5, habitat: "Barracas de feira antigas", regionId: "porto-do-amanhecer", dangerLevel: "media", icon: "\u{1F56F}\uFE0F", description: "Derrete um pouco a cada ver\xE3o, e volta a se formar no inverno.", pages: ["Ningu\xE9m lembra quem o esculpiu originalmente.", "Crian\xE7as da Capital juram que o rosto dele muda, ano ap\xF3s ano.", "Poss\xEDveis drops (lore, n\xE3o implementado): Cera Derretida, Pavio Antigo, Molde Rachado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "guardiao-de-ferro-da-ultima-coroa", name: "Guardi\xE3o de Ferro da \xDAltima Coroa", type: "construto", rarity: "raro", suggestedLevel: 11, habitat: "Sal\xF5es centrais das ru\xEDnas", regionId: "ruinas-esquecidas", dangerLevel: "alta", icon: "\u2699\uFE0F", description: "Protegia algo importante. Ningu\xE9m mais sabe o qu\xEA.", pages: ["Encontrado ainda de p\xE9, d\xE9cadas depois de tudo ao redor ter ca\xEDdo.", "Alaric tentou mover um pra exposi\xE7\xE3o. N\xE3o conseguiu nem arranhar.", "Poss\xEDveis drops (lore, n\xE3o implementado): Placa Refor\xE7ada, N\xFAcleo de Ferro, Engrenagem Grande."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { itemSlug: "luvas-guardiao-ruinas", npcKey: "curador", npcNote: "Alaric tentou mover um pra exposi\xE7\xE3o do Museu. N\xE3o conseguiu nem arranhar." } },
  { id: "automato-do-deserto-de-vidro", name: "Aut\xF4mato do Deserto de Vidro", type: "construto", rarity: "raro", suggestedLevel: 12, habitat: "Linha reta pelo meio do deserto", regionId: "deserto-de-vidro", dangerLevel: "alta", icon: "\u{1F916}", description: "Anda em linha reta pelo deserto, sem nunca desviar.", pages: ["Ningu\xE9m sabe seu destino, nem se ele sabe.", "Zoltar tentou conversar com um. N\xE3o obteve resposta.", "Poss\xEDveis drops (lore, n\xE3o implementado): Vidro Fundido, Engrenagem de Vidro, N\xFAcleo Transl\xFAcido."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "sentinela-congelada-dos-picos", name: "Sentinela Congelada dos Picos", type: "construto", rarity: "raro", suggestedLevel: 13, habitat: "Trilhas altas cobertas de gelo", regionId: "picos-congelados", dangerLevel: "letal", icon: "\u2744\uFE0F", description: "Fica im\xF3vel por meses, at\xE9 algo se aproximar demais.", pages: ["Alguns exploradores confundem com uma est\xE1tua, at\xE9 ser tarde demais.", "Roth garante que um j\xE1 ficou parado tempo suficiente pra virar ponto de refer\xEAncia num mapa.", "Poss\xEDveis drops (lore, n\xE3o implementado): Gelo Compacto, N\xFAcleo Congelado, Placa Gelada."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { itemSlug: "botas-picos-congelados", npcKey: "guarda", npcNote: "Roth garante que uma sentinela j\xE1 ficou parada tempo suficiente pra virar ponto de refer\xEAncia num mapa." } },
  { id: "o-guardiao-sem-instrucoes", name: "O Guardi\xE3o Sem Instru\xE7\xF5es", type: "construto", rarity: "muito-raro", suggestedLevel: 17, habitat: "Sal\xE3o mais profundo da fortaleza", regionId: "fortaleza-sombria", dangerLevel: "alta", icon: "\u{1F5FF}", description: "Continua executando uma tarefa que ningu\xE9m mais lembra qual era.", pages: ["Alguns acreditam que ele protege algo que j\xE1 nem existe mais.", "Alaric passou meses tentando decifrar as inscri\xE7\xF5es na base dele. Ainda tenta.", "Poss\xEDveis drops (lore, n\xE3o implementado): N\xFAcleo Antigo, Placa Inscrita, Engrenagem Complexa."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "o-primeiro-automato", name: "O Primeiro Aut\xF4mato", type: "construto", rarity: "lendaria", suggestedLevel: 24, habitat: "C\xE2mara mais antiga das ru\xEDnas", regionId: "ruinas-esquecidas", dangerLevel: "alta", icon: "\u2699\uFE0F", description: "Dizem que foi o primeiro construto j\xE1 feito no Reino.", pages: ["Nenhum ferreiro atual sabe reproduzir a t\xE9cnica usada nele.", "Borin diz que estudaria a vida inteira s\xF3 pra entender uma junta dele.", "Poss\xEDveis drops (lore, n\xE3o implementado): N\xFAcleo Primordial, Placa Original, Engrenagem Perfeita."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  // ---- Elementais (12): 4 comum · 3 incomum · 2 raro · 2 muito-raro · 1 lendária ----
  { id: "faisca-errante", name: "Fa\xEDsca Errante", type: "elemental", rarity: "comum", suggestedLevel: 2, habitat: "Perto de forjas acesas por tempo demais", regionId: "porto-do-amanhecer", dangerLevel: "baixa", icon: "\u2728", description: "Aparece perto de qualquer forja acesa por tempo demais.", pages: ["Borin diz que toda forja atrai uma, mais cedo ou mais tarde.", "Algumas somem sozinhas. Outras precisam ser 'convencidas'.", "Poss\xEDveis drops (lore, n\xE3o implementado): Fagulha Presa, Cinza Quente, Carv\xE3o Aceso."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "poca-viva", name: "Po\xE7a Viva", type: "elemental", rarity: "comum", suggestedLevel: 2, habitat: "\xC1reas alagadas rasas", regionId: "pantano-podre", dangerLevel: "baixa", icon: "\u{1F4A7}", description: "Se move devagar, sempre em dire\xE7\xE3o \xE0 \xE1gua mais pr\xF3xima.", pages: ["Ningu\xE9m sabe se ela busca algo ou s\xF3 segue um instinto simples.", "Crian\xE7as gostam de seguir uma at\xE9 ela desaparecer numa po\xE7a maior.", "Poss\xEDveis drops (lore, n\xE3o implementado): \xC1gua Densa, Lodo Vivo, Gota Espessa."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "brisa-teimosa", name: "Brisa Teimosa", type: "elemental", rarity: "comum", suggestedLevel: 1, habitat: "Campos abertos e ventosos", regionId: "planicie-dourada", dangerLevel: "baixa", icon: "\u{1F343}", description: "Sopra sempre contra o vento principal, sem explica\xE7\xE3o.", pages: ["Fazendeiros usam a dire\xE7\xE3o dela pra prever mudan\xE7as de tempo.", "Alguns dizem que ela nunca sopra igual duas vezes.", "Poss\xEDveis drops (lore, n\xE3o implementado): Ar Comprimido, Pena Levitando, Poeira Suspensa."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "barro-fervente", name: "Barro Fervente", type: "elemental", rarity: "comum", suggestedLevel: 3, habitat: "Po\xE7as pequenas dentro das minas", regionId: "minas-abandonadas", dangerLevel: "media", icon: "\u{1F30B}", description: "Borbulha sozinho em po\xE7as pequenas dentro das minas.", pages: ["Mineiros aprenderam a identificar o barulho antes de chegar perto.", "J\xE1 apagou mais de uma tocha esquecida no ch\xE3o.", "Poss\xEDveis drops (lore, n\xE3o implementado): Barro Quente, Pedra Amolecida, Vapor Denso."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "chama-baixa-do-acampamento", name: "Chama Baixa do Acampamento", type: "elemental", rarity: "incomum", suggestedLevel: 5, habitat: "Fogueiras mal apagadas", regionId: "bosque-sussurrante", dangerLevel: "media", icon: "\u{1F525}", description: "Aparece em fogueiras mal apagadas, \xE0 noite.", pages: ["Viajantes aprenderam a apagar bem o fogo, s\xF3 por precau\xE7\xE3o.", "Alguns juram que ela ajuda a manter o calor at\xE9 de manh\xE3.", "Poss\xEDveis drops (lore, n\xE3o implementado): Brasa Viva, Fuma\xE7a Densa, Cinza Ardente."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "redemoinho-das-colinas", name: "Redemoinho das Colinas", type: "elemental", rarity: "incomum", suggestedLevel: 6, habitat: "Encostas secas sem vento aparente", regionId: "colinas-aridas", dangerLevel: "media", icon: "\u{1F300}", description: "Levanta poeira em espiral, sem vento nenhum ao redor.", pages: ["Pastores acreditam que segue certos animais por longas dist\xE2ncias.", "Alguns dizem que ele carrega vozes distantes dentro da poeira.", "Poss\xEDveis drops (lore, n\xE3o implementado): Poeira Girante, Ar Denso, Pedra Polida pelo Vento."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "nevoa-gelada-dos-picos", name: "N\xE9voa Gelada dos Picos", type: "elemental", rarity: "incomum", suggestedLevel: 7, habitat: "Trilhas altas sem aviso pr\xE9vio", regionId: "picos-congelados", dangerLevel: "media", icon: "\u2744\uFE0F", description: "Cobre trilhas inteiras em minutos, sem aviso.", pages: ["Guias experientes sabem esperar, nunca atravessar.", "Alguns exploradores relatam vozes dentro da n\xE9voa. Ningu\xE9m confirma.", "Poss\xEDveis drops (lore, n\xE3o implementado): Gelo Fino, N\xE9voa Presa, Cristal de Frost."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "coracao-de-vidro-do-deserto", name: "Cora\xE7\xE3o de Vidro do Deserto", type: "elemental", rarity: "raro", suggestedLevel: 11, habitat: "Interior de dunas espec\xEDficas", regionId: "deserto-de-vidro", dangerLevel: "alta", icon: "\u{1F536}", description: "Pulsa devagar dentro de dunas espec\xEDficas, como um cora\xE7\xE3o de verdade.", pages: ["Ningu\xE9m sabe se est\xE1 vivo, ou se s\xF3 imita algo vivo.", "Zoltar dedicou anos tentando entender o padr\xE3o do pulso.", "Poss\xEDveis drops (lore, n\xE3o implementado): Vidro Pulsante, N\xFAcleo Transl\xFAcido, Areia Quente."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "chama-profunda-da-fortaleza", name: "Chama Profunda da Fortaleza", type: "elemental", rarity: "raro", suggestedLevel: 12, habitat: "C\xE2maras internas da fortaleza", regionId: "fortaleza-sombria", dangerLevel: "letal", icon: "\u{1F525}", description: "Arde sem consumir nada ao redor, h\xE1 gera\xE7\xF5es.", pages: ["Alguns acreditam que ela guarda algo importante dentro do fogo.", "Ningu\xE9m j\xE1 conseguiu apag\xE1-la, apesar de v\xE1rias tentativas registradas.", "Poss\xEDveis drops (lore, n\xE3o implementado): Chama Eterna, Cinza Fria, Carv\xE3o Intacto."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "o-rio-que-sobe", name: "O Rio Que Sobe", type: "elemental", rarity: "muito-raro", suggestedLevel: 16, habitat: "Curso d'\xE1gua pr\xF3ximo ao litoral", regionId: "litoral-quebrado", dangerLevel: "alta", icon: "\u{1F30A}", description: "Corre morro acima, contra toda l\xF3gica, uma vez por esta\xE7\xE3o.", pages: ["Pescadores organizam a rotina inteira em torno dessa uma vez.", "Ningu\xE9m sabe pra onde a \xE1gua vai depois.", "Poss\xEDveis drops (lore, n\xE3o implementado): \xC1gua Ascendente, Espuma Densa, Pedra Molhada Sempre."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "o-vento-que-lembra", name: "O Vento Que Lembra", type: "elemental", rarity: "muito-raro", suggestedLevel: 17, habitat: "Encostas altas e isoladas", regionId: "colinas-aridas", dangerLevel: "media", icon: "\u{1F32C}\uFE0F", description: "Carrega sons de conversas antigas, \xE0s vezes reconhec\xEDveis.", pages: ["Alguns moradores juram j\xE1 ter ouvido a pr\xF3pria voz, mais jovem, no vento.", "Ningu\xE9m recomenda escutar por tempo demais.", "Poss\xEDveis drops (lore, n\xE3o implementado): Eco Antigo, Ar Denso de Mem\xF3ria, Poeira de Tempo."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "o-coracao-da-tempestade", name: "O Cora\xE7\xE3o da Tempestade", type: "elemental", rarity: "lendaria", suggestedLevel: 23, habitat: "Centro das piores tempestades j\xE1 registradas", regionId: "picos-congelados", dangerLevel: "letal", icon: "\u26C8\uFE0F", description: "Aparece s\xF3 no centro das piores tempestades j\xE1 registradas.", pages: ["Cada gera\xE7\xE3o tem no m\xE1ximo um relato confirmado dele.", "Alguns acreditam que ele \xC9 a tempestade, n\xE3o s\xF3 parte dela.", "Poss\xEDveis drops (lore, n\xE3o implementado): N\xFAcleo da Tempestade, Raio Capturado, Gelo Eterno."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  // ---- Dragões (12): 4 comum · 3 incomum · 2 raro · 2 muito-raro · 1 lendária ----
  { id: "lagarto-alado-da-planicie", name: "Lagarto-Alado da Plan\xEDcie", type: "dragao", rarity: "comum", suggestedLevel: 3, habitat: "C\xE9u baixo sobre os trigais", regionId: "planicie-dourada", dangerLevel: "media", icon: "\u{1F98E}", description: "Voa baixo, raramente mais alto que uma \xE1rvore.", pages: ["Considerado por muitos um drag\xE3o jovem demais pra ser perigoso.", "Fazendeiros os espantam com barulho, n\xE3o com for\xE7a.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama Pequena, Asa Fina, Garra Curta."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { npcKey: "mestreArena", npcNote: "Kade acha que \xE9 isso que a crian\xE7a da Taverna viu \u2014 n\xE3o uma nuvem grande.", rumor: "Uma crian\xE7a jura ter visto um drag\xE3o. Era uma nuvem grande." } },
  { id: "filhote-de-dragao-das-colinas", name: "Filhote de Drag\xE3o das Colinas", type: "dragao", rarity: "comum", suggestedLevel: 4, habitat: "Fendas rochosas nas encostas", regionId: "colinas-aridas", dangerLevel: "media", icon: "\u{1F409}", description: "Ainda aprende a voar, caindo mais do que decolando.", pages: ["A m\xE3e nunca \xE9 vista por perto, o que preocupa mais que tranquiliza.", "Kade jura que j\xE1 viu um trope\xE7ar nas pr\xF3prias asas.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama Macia, Garra Pequena, Dente de Leite."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "dragao-lagarto-do-pantano", name: "Drag\xE3o-Lagarto do P\xE2ntano", type: "dragao", rarity: "comum", suggestedLevel: 4, habitat: "\xC1guas rasas e lamacentas", regionId: "pantano-podre", dangerLevel: "media", icon: "\u{1F40A}", description: "Nada mais do que voa, na maior parte do tempo.", pages: ["Parece mais r\xE9ptil comum que drag\xE3o, at\xE9 abrir as asas.", "Alguns pescadores nem percebem a diferen\xE7a at\xE9 ser tarde.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama Encharcada, Cauda Grossa, Dente Afiado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "draconido-das-rochas", name: "Drac\xF4nido das Rochas", type: "dragao", rarity: "comum", suggestedLevel: 3, habitat: "Fendas e afloramentos rochosos", regionId: "colinas-aridas", dangerLevel: "baixa", icon: "\u{1F98E}", description: "Se camufla t\xE3o bem entre pedras que a maioria passa direto.", pages: ["Prefere fugir a lutar, na esmagadora maioria das vezes.", "Roth garante que um j\xE1 ficou parado perto do Port\xE3o Norte por dias sem ser notado.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama Cinzenta, Garra Curta, Cauda Pequena."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "dragao-das-minas", name: "Drag\xE3o das Minas", type: "dragao", rarity: "incomum", suggestedLevel: 7, habitat: "Galerias mais profundas e desconhecidas", regionId: "minas-abandonadas", dangerLevel: "alta", icon: "\u{1F432}", description: "Vive nas galerias mais profundas, longe de qualquer entrada conhecida.", pages: ["Mineiros evitam certos t\xFAneis s\xF3 por precau\xE7\xE3o, mesmo sem prova de que ele more ali.", "Ningu\xE9m sabe o tamanho real dele \u2014 s\xF3 rastros.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama Escura, Garra Robusta, Dente Quebrado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "serpente-alada-do-litoral", name: "Serpente Alada do Litoral", type: "dragao", rarity: "incomum", suggestedLevel: 8, habitat: "\xC1guas costeiras profundas", regionId: "litoral-quebrado", dangerLevel: "alta", icon: "\u{1F40D}", description: "Ca\xE7a peixes grandes, mergulhando de altura consider\xE1vel.", pages: ["Pescadores aprenderam a reconhecer a sombra dela na \xE1gua antes de qualquer outra coisa.", "Alguns acreditam que \xE9 parente distante das serpentes marinhas de hist\xF3rias antigas.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama Molhada, Asa Membranosa, Dente Curvo."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { itemSlug: "colar-conchas", npcKey: "viajante", npcNote: "Idris acredita que ela \xE9 parente distante das serpentes marinhas de hist\xF3rias antigas." } },
  { id: "dragao-de-gelo-jovem", name: "Drag\xE3o de Gelo Jovem", type: "dragao", rarity: "incomum", suggestedLevel: 8, habitat: "Fendas nevadas nas montanhas", regionId: "picos-congelados", dangerLevel: "alta", icon: "\u{1F409}", description: "Ainda n\xE3o sopra gelo de verdade, s\xF3 n\xE9voa fria.", pages: ["Exploradores relatam encontros breves, sempre \xE0 dist\xE2ncia.", "Yannick tem um desenho detalhado, feito de mem\xF3ria, depois de um encontro r\xE1pido.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama Congelada, Garra Fria, Dente de Gelo."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { itemSlug: "espada-curva-picos-congelados", npcKey: "erudito", npcNote: "Yannick tem um desenho detalhado dele, feito de mem\xF3ria, depois de um encontro r\xE1pido." } },
  { id: "dragao-das-ruinas-esquecidas", name: "Drag\xE3o das Ru\xEDnas Esquecidas", type: "dragao", rarity: "raro", suggestedLevel: 12, habitat: "Entre as pedras mais antigas das ru\xEDnas", regionId: "ruinas-esquecidas", dangerLevel: "alta", icon: "\u{1F432}", description: "Dorme na maior parte do tempo, entre as pedras mais antigas.", pages: ["Alguns exploradores juram j\xE1 ter dormido a poucos metros dele, sem perceber.", "Alaric acredita que ele nasceu depois das Ru\xEDnas ca\xEDrem, n\xE3o antes.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama Antiga, Garra Grande, Dente Amarelado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "serpente-dragao-do-deserto-de-vidro", name: "Serpente-Drag\xE3o do Deserto de Vidro", type: "dragao", rarity: "raro", suggestedLevel: 13, habitat: "Sob a areia vitrificada", regionId: "deserto-de-vidro", dangerLevel: "alta", icon: "\u{1F40D}", description: "Nada pela areia como se fosse \xE1gua.", pages: ["Ningu\xE9m sabe como ela respira l\xE1 dentro, mas respira.", "Zoltar acredita que ela \xE9 mais velha que o pr\xF3prio deserto vitrificado.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama V\xEDtrea, Presa de Vidro, Cauda Reluzente."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "o-dragao-da-fortaleza-sombria", name: "O Drag\xE3o da Fortaleza Sombria", type: "dragao", rarity: "muito-raro", suggestedLevel: 18, habitat: "Sal\xE3o principal da fortaleza", regionId: "fortaleza-sombria", dangerLevel: "letal", icon: "\u{1F409}", description: "Raramente sai do sal\xE3o principal, protegendo algo que ningu\xE9m identificou.", pages: ["Alguns acreditam que ele guarda a Fortaleza h\xE1 mais tempo que qualquer rei j\xE1 registrado.", "Ningu\xE9m que o viu de perto concorda na cor exata das escamas.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama Sombria, Garra Imensa, Dente Negro."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "a-dragoa-dos-picos-eternos", name: "A Dragoa dos Picos Eternos", type: "dragao", rarity: "muito-raro", suggestedLevel: 19, habitat: "Ninho oculto no alto das montanhas", regionId: "picos-congelados", dangerLevel: "letal", icon: "\u{1F409}", description: "Protege um ninho que ningu\xE9m jamais encontrou.", pages: ["Exploradores que se aproximam demais relatam apenas o som de asas, nunca a vis\xE3o completa.", "Roth acredita que ela \xE9 a m\xE3e de todo drag\xE3o de gelo j\xE1 avistado na regi\xE3o.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama Glacial, Garra Afiada, Ovo Intacto."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "o-velho-das-terras-altas", name: "O Velho das Terras Altas", type: "dragao", rarity: "lendaria", suggestedLevel: 27, habitat: "Picos mais remotos das colinas", regionId: "colinas-aridas", dangerLevel: "letal", icon: "\u{1F432}", description: "Ningu\xE9m sabe a idade real, s\xF3 que \xE9 mais velho que qualquer relato escrito.", pages: ["Alguns acreditam que ele viu a funda\xE7\xE3o do Reino com os pr\xF3prios olhos.", "Alaric guardaria um cap\xEDtulo inteiro do Museu s\xF3 pra ele, se algum dia tivesse a chance.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama Ancestral, Garra Lend\xE1ria, Dente do Tempo."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  // ---- Bestas (12): 4 comum · 3 incomum · 3 raro · 1 muito-raro · 1 lendária ----
  { id: "cao-selvagem-da-estrada", name: "C\xE3o Selvagem da Estrada", type: "besta", rarity: "comum", suggestedLevel: 2, habitat: "Estradas abertas entre regi\xF5es", regionId: "planicie-dourada", dangerLevel: "baixa", icon: "\u{1F415}\u200D\u{1F9BA}", description: "Segue viajantes por quil\xF4metros, sem nunca se aproximar demais.", pages: ["Alguns acreditam que j\xE1 foram c\xE3es dom\xE9sticos, h\xE1 gera\xE7\xF5es.", "Idris garante que um j\xE1 o seguiu pelo Reino inteiro.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Suja, Presa Pequena, Coleira Velha."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { npcKey: "viajante", npcNote: "Idris garante que um j\xE1 o seguiu pelo Reino inteiro.", travellerStoryId: "cao-sem-dono-que-sempre-aparece" } },
  { id: "coelho-das-colinas", name: "Coelho das Colinas", type: "besta", rarity: "comum", suggestedLevel: 1, habitat: "Tocas rasas nas encostas", regionId: "colinas-aridas", dangerLevel: "baixa", icon: "\u{1F407}", description: "Multiplica-se r\xE1pido demais pra qualquer fazendeiro controlar.", pages: ["Alguns consideram praga. Outros, sorte.", "Talia vende p\xE9-de-coelho na feira, sempre com a mesma hist\xF3ria duvidosa de origem.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Macia, Pata Traseira, Orelha Comprida."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "porco-espinho-do-bosque", name: "Porco-Espinho do Bosque", type: "besta", rarity: "comum", suggestedLevel: 1, habitat: "Sob folhas ca\xEDdas na floresta", regionId: "bosque-sussurrante", dangerLevel: "baixa", icon: "\u{1F994}", description: "Se enrola ao menor sinal de perigo, e espera.", pages: ["Raramente ataca \u2014 a defesa dele j\xE1 \xE9 suficiente.", "Crian\xE7as aprendem cedo a n\xE3o cutucar um, geralmente da pior forma poss\xEDvel.", "Poss\xEDveis drops (lore, n\xE3o implementado): Espinho Solto, Pelagem Curta, Casco Pequeno."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "gato-selvagem-da-vila", name: "Gato Selvagem da Vila", type: "besta", rarity: "comum", suggestedLevel: 2, habitat: "Telhados e becos da capital", regionId: "porto-do-amanhecer", dangerLevel: "baixa", icon: "\u{1F408}\u200D\u2B1B", description: "Ignora praticamente todo mundo, com raras exce\xE7\xF5es.", pages: ["Alguns moradores juram que ele escolhe quem alimentar, n\xE3o o contr\xE1rio.", "Greta garante que ele prefere a Taverna a qualquer outro lugar da Capital.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Malhada, Garra Curta, Bigode Solto."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "lince-das-colinas", name: "Lince das Colinas", type: "besta", rarity: "incomum", suggestedLevel: 5, habitat: "Encostas ao entardecer", regionId: "colinas-aridas", dangerLevel: "media", icon: "\u{1F406}", description: "Ca\xE7a sozinho, ao entardecer, quase sem ser visto.", pages: ["Pastores reconhecem o rastro antes de reconhecer o animal.", "Kade jura que treinaria com um, se conseguisse chegar perto o suficiente.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Malhada, Garra Afiada, Presa Curva."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "javali-cinza-da-fronteira", name: "Javali Cinza da Fronteira", type: "besta", rarity: "incomum", suggestedLevel: 6, habitat: "Bordas entre regi\xF5es", regionId: "colinas-aridas", dangerLevel: "media", icon: "\u{1F417}", description: "Mais agressivo que o javali comum, e bem maior.", pages: ["Vive nas bordas entre regi\xF5es, nunca se estabelecendo de vez em nenhuma.", "Borin forjou uma lan\xE7a especial s\xF3 pra ca\xE7adores desse aqui.", "Poss\xEDveis drops (lore, n\xE3o implementado): Presa Longa, Couro Duro, Casco Rachado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "corvo-de-ferro", name: "Corvo-de-Ferro", type: "besta", rarity: "incomum", suggestedLevel: 5, habitat: "Telhados e torres da capital", regionId: "porto-do-amanhecer", dangerLevel: "baixa", icon: "\u{1F426}\u200D\u2B1B", description: "Rouba qualquer coisa que brilhe, sem exce\xE7\xE3o.", pages: ["Talia j\xE1 perdeu moedas pra um mais de uma vez, e nunca recuperou.", "Alguns moradores deixam objetos brilhantes de prop\xF3sito, s\xF3 pra distra\xED-lo de outra coisa.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pena Escura, Bico Afiado, Garra Pequena."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { itemSlug: "capacete-penas-corvo", npcKey: "mercador", npcNote: "Talia j\xE1 perdeu moedas pra um corvo-de-ferro mais de uma vez, e nunca recuperou.", travellerStoryId: "corvo-que-conta-ate-tres" } },
  { id: "urso-pardo-da-fronteira-norte", name: "Urso-Pardo da Fronteira Norte", type: "besta", rarity: "raro", suggestedLevel: 9, habitat: "Territ\xF3rio extenso e isolado", regionId: "colinas-aridas", dangerLevel: "alta", icon: "\u{1F43B}", description: "Territ\xF3rio enorme, quase nunca cruzado por humanos.", pages: ["Guardas do Port\xE3o Norte o consideram o verdadeiro dono daquela fronteira.", "Roth garante que j\xE1 negociou passagem com um, \xE0 sua maneira.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Densa, Garra Grossa, Presa Longa."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { itemSlug: "luvas-cacador-feras", npcKey: "guarda", npcNote: "Roth garante que j\xE1 negociou passagem com um, \xE0 sua maneira.", travellerStoryId: "urso-que-chora-a-noite" } },
  { id: "pantera-das-ruinas", name: "Pantera das Ru\xEDnas", type: "besta", rarity: "raro", suggestedLevel: 10, habitat: "Sombras entre as pedras antigas", regionId: "ruinas-esquecidas", dangerLevel: "alta", icon: "\u{1F406}", description: "Ca\xE7a entre as pedras antigas, quase invis\xEDvel \xE0 noite.", pages: ["Exploradores aprenderam a checar as sombras duas vezes, sempre.", "Alaric acredita que ela vive ali h\xE1 gera\xE7\xF5es, adaptada ao ambiente.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Escura, Garra Silenciosa, Presa Fina."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { itemSlug: "botas-cacador-feras", npcKey: "curador", npcNote: "Alaric acredita que ela vive ali h\xE1 gera\xE7\xF5es, adaptada ao ambiente." } },
  { id: "lobo-solitario-da-fortaleza", name: "Lobo Solit\xE1rio da Fortaleza", type: "besta", rarity: "raro", suggestedLevel: 11, habitat: "Arredores isolados da fortaleza", regionId: "fortaleza-sombria", dangerLevel: "alta", icon: "\u{1F43A}", description: "Vive sozinho, longe de qualquer matilha conhecida.", pages: ["Ningu\xE9m sabe por que ele escolheu viver t\xE3o perto de um lugar como aquele.", "Alguns acreditam que ele protege algo, \xE0 sua pr\xF3pria maneira.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Grisalha, Presa Longa, Olho Atento."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "o-urso-de-duas-cabecas", name: "O Urso de Duas Cabe\xE7as", type: "besta", rarity: "muito-raro", suggestedLevel: 16, habitat: "\xC1reas remotas das montanhas", regionId: "picos-congelados", dangerLevel: "letal", icon: "\u{1F43B}", description: "Avistado poucas vezes, sempre \xE0 dist\xE2ncia segura.", pages: ["Alguns acreditam ser dois ursos muito pr\xF3ximos. Outros, algo diferente.", "Yannick tem um relato detalhado, mas nunca confirmado por mais ningu\xE9m.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Dupla, Garra Imensa, Presa Rara."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "o-lobo-que-nao-envelhece", name: "O Lobo Que N\xE3o Envelhece", type: "besta", rarity: "lendaria", suggestedLevel: 22, habitat: "Trechos profundos da floresta", regionId: "bosque-sussurrante", dangerLevel: "alta", icon: "\u{1F43A}", description: "Visto em relatos que remontam a gera\xE7\xF5es passadas, sempre com a mesma descri\xE7\xE3o.", pages: ["Alguns acreditam que \xE9 sempre o mesmo lobo. Outros, uma linhagem inteira.", "Yannick dedicaria a vida inteira s\xF3 pra confirmar qual das teorias \xE9 verdadeira.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Eterna, Presa Ancestral, Olho Dourado."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  // ---- Humanoides (12): 4 comum · 3 incomum · 3 raro · 1 muito-raro · 1 lendária ----
  { id: "bandido-de-estrada", name: "Bandido de Estrada", type: "humanoide", rarity: "comum", suggestedLevel: 2, habitat: "Emboscadas em estradas abertas", regionId: "planicie-dourada", dangerLevel: "media", icon: "\u{1F5E1}\uFE0F", description: "Assalta viajantes desprevenidos, quase sempre em grupo.", pages: ["Alguns j\xE1 foram fazendeiros, antes de uma colheita ruim demais.", "Roth prende os mesmos rostos com frequ\xEAncia incomoda.", "Poss\xEDveis drops (lore, n\xE3o implementado): Faca Enferrujada, Bolsa Vazia, Capuz Surrado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "batedor-das-colinas", name: "Batedor das Colinas", type: "humanoide", rarity: "comum", suggestedLevel: 3, habitat: "Pontos altos com boa vis\xE3o", regionId: "colinas-aridas", dangerLevel: "media", icon: "\u{1F3F9}", description: "Observa viajantes de longe antes de decidir se aproxima ou n\xE3o.", pages: ["Vive isolado, evitando a Capital sempre que poss\xEDvel.", "Idris j\xE1 trocou informa\xE7\xF5es com um, em vez de lutar.", "Poss\xEDveis drops (lore, n\xE3o implementado): Arco Simples, Flecha Gasta, Capa Surrada."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "pescador-renegado", name: "Pescador Renegado", type: "humanoide", rarity: "comum", suggestedLevel: 2, habitat: "Trechos afastados da costa", regionId: "litoral-quebrado", dangerLevel: "baixa", icon: "\u{1F3A3}", description: "Rouba peixe de redes alheias, quando ningu\xE9m est\xE1 olhando.", pages: ["Foi expulso da vila por um motivo que ningu\xE9m quer repetir.", "Alguns pescadores locais j\xE1 deixam peixe de prop\xF3sito, s\xF3 pra ele ir embora.", "Poss\xEDveis drops (lore, n\xE3o implementado): Rede Rasgada, Faca de Pesca, Chap\xE9u Surrado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "vagabundo-das-ruinas", name: "Vagabundo das Ru\xEDnas", type: "humanoide", rarity: "comum", suggestedLevel: 3, habitat: "Entre as pedras das ru\xEDnas", regionId: "ruinas-esquecidas", dangerLevel: "media", icon: "\u{1F97E}", description: "Vive entre as pedras, evitando contato com qualquer grupo.", pages: ["Alguns acreditam que ele sabe mais sobre as Ru\xEDnas do que qualquer estudioso.", "Alaric j\xE1 tentou conversar com um. A conversa n\xE3o durou muito.", "Poss\xEDveis drops (lore, n\xE3o implementado): Farrapo, Faca Cega, Saco Vazio."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "mercenario-sem-bandeira", name: "Mercen\xE1rio Sem Bandeira", type: "humanoide", rarity: "incomum", suggestedLevel: 6, habitat: "Onde houver pagamento", regionId: "colinas-aridas", dangerLevel: "alta", icon: "\u2694\uFE0F", description: "Luta por quem pagar mais, sem lealdade fixa a ningu\xE9m.", pages: ["Alguns j\xE1 trabalharam pra mais de um Reino ao mesmo tempo, sem contar pra nenhum dos dois.", "Kade recusa duelo com eles, por princ\xEDpio.", "Poss\xEDveis drops (lore, n\xE3o implementado): Espada Gasta, Armadura Remendada, Bolsa de Moedas."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { npcKey: "mestreArena", npcNote: "Kade recusa duelo com eles, por princ\xEDpio." } },
  { id: "cacador-de-recompensas", name: "Ca\xE7ador de Recompensas", type: "humanoide", rarity: "incomum", suggestedLevel: 7, habitat: "Rotas comerciais e cidades pequenas", regionId: "planicie-dourada", dangerLevel: "alta", icon: "\u{1F3AF}", description: "Persegue alvos por regi\xF5es inteiras, sem desistir f\xE1cil.", pages: ["Alguns confundem com Guarda, at\xE9 perceberem que n\xE3o seguem regra nenhuma.", "Roth j\xE1 teve que negociar limites com mais de um.", "Poss\xEDveis drops (lore, n\xE3o implementado): Corda Resistente, Marca de Procurado, Adaga Curva."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "eremita-das-montanhas", name: "Eremita das Montanhas", type: "humanoide", rarity: "incomum", suggestedLevel: 6, habitat: "Cabanas isoladas nas alturas", regionId: "picos-congelados", dangerLevel: "media", icon: "\u{1F9D9}", description: "Vive sozinho, h\xE1 tanto tempo que esqueceu como conversar direito.", pages: ["Alguns exploradores relatam conselhos estranhos, mas surpreendentemente \xFAteis.", "Zoltar acredita que ele sabe mais de alquimia do que qualquer alquimista da Capital.", "Poss\xEDveis drops (lore, n\xE3o implementado): Cajado Torto, Manto Pu\xEDdo, Frasco Vazio."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "guerreiro-esquecido-das-ruinas", name: "Guerreiro Esquecido das Ru\xEDnas", type: "humanoide", rarity: "raro", suggestedLevel: 11, habitat: "Postos avan\xE7ados de um ex\xE9rcito extinto", regionId: "ruinas-esquecidas", dangerLevel: "alta", icon: "\u2694\uFE0F", description: "Ainda usa uma armadura de um ex\xE9rcito que n\xE3o existe mais.", pages: ["Ningu\xE9m sabe se ele sabe que a guerra dele j\xE1 acabou.", "Alaric j\xE1 tentou explicar. N\xE3o teve certeza se foi entendido.", "Poss\xEDveis drops (lore, n\xE3o implementado): Armadura Antiga, Espada Cega, Emblema Desconhecido."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "xama-da-tribo-perdida", name: "Xam\xE3 da Tribo Perdida", type: "humanoide", rarity: "raro", suggestedLevel: 12, habitat: "Clareiras profundas da floresta", regionId: "bosque-sussurrante", dangerLevel: "alta", icon: "\u{1FAB6}", description: "Fala com animais que ningu\xE9m mais consegue se aproximar.", pages: ["Alguns acreditam que a tribo dele desapareceu h\xE1 gera\xE7\xF5es, deixando s\xF3 ele.", "Yannick tentaria estud\xE1-lo a vida inteira, se ele permitisse.", "Poss\xEDveis drops (lore, n\xE3o implementado): Colar de Ossos, Cajado Emplumado, Pele Pintada."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { npcKey: "erudito", npcNote: "Yannick tentaria estud\xE1-lo a vida inteira, se ele permitisse." } },
  { id: "cavaleiro-sem-reino", name: "Cavaleiro Sem Reino", type: "humanoide", rarity: "raro", suggestedLevel: 13, habitat: "Passagens esquecidas da fortaleza", regionId: "fortaleza-sombria", dangerLevel: "alta", icon: "\u{1F6E1}\uFE0F", description: "Ainda usa um bras\xE3o que ningu\xE9m reconhece mais.", pages: ["Alguns acreditam que o Reino dele caiu h\xE1 muito tempo, e ele nunca soube.", "Alaric adoraria identificar o bras\xE3o, sem sucesso at\xE9 agora.", "Poss\xEDveis drops (lore, n\xE3o implementado): Bras\xE3o Desconhecido, Espada Nobre, Elmo Riscado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "o-mensageiro-que-nunca-chega", name: "O Mensageiro Que Nunca Chega", type: "humanoide", rarity: "muito-raro", suggestedLevel: 17, habitat: "Estradas abertas, sempre em tr\xE2nsito", regionId: "planicie-dourada", dangerLevel: "media", icon: "\u{1F4DC}", description: "Sempre a caminho de algum lugar, nunca visto duas vezes no mesmo ponto.", pages: ["Alguns acreditam que ele carrega uma mensagem h\xE1 d\xE9cadas, sem nunca entregar.", "Ningu\xE9m sabe pra quem \xE9 a mensagem, nem o que ela diz.", "Poss\xEDveis drops (lore, n\xE3o implementado): Selo Lacrado, Carta N\xE3o Entregue, Bota Gasta."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "o-ultimo-soldado", name: "O \xDAltimo Soldado", type: "humanoide", rarity: "lendaria", suggestedLevel: 24, habitat: "Posto avan\xE7ado esquecido da fortaleza", regionId: "fortaleza-sombria", dangerLevel: "letal", icon: "\u2694\uFE0F", description: "Ainda defende um posto de uma guerra que terminou h\xE1 gera\xE7\xF5es.", pages: ["Nenhum registro confirma de que lado ele lutava, originalmente.", "Alaric acredita que identific\xE1-lo resolveria um mist\xE9rio inteiro do Museu.", "Poss\xEDveis drops (lore, n\xE3o implementado): Armadura de Comando, Espada Hist\xF3rica, Estandarte Perdido."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  // ---- Aberrações (12): 4 comum · 3 incomum · 2 raro · 2 muito-raro · 1 lendária ----
  { id: "rato-de-duas-caudas", name: "Rato de Duas Caudas", type: "aberracao", rarity: "comum", suggestedLevel: 2, habitat: "T\xFAneis e galerias escuras", regionId: "minas-abandonadas", dangerLevel: "baixa", icon: "\u{1F400}", description: "Nasce assim, sem explica\xE7\xE3o conhecida.", pages: ["Alguns mineiros acreditam que d\xE1 sorte encontrar um. Outros, o oposto.", "Yannick j\xE1 catalogou mais de uma dezena de casos parecidos.", "Poss\xEDveis drops (lore, n\xE3o implementado): Cauda Extra, Pelagem Rala, Dente Torto."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "sapo-de-olhos-multiplos", name: "Sapo de Olhos M\xFAltiplos", type: "aberracao", rarity: "comum", suggestedLevel: 3, habitat: "\xC1gua parada e lodosa", regionId: "pantano-podre", dangerLevel: "media", icon: "\u{1F438}", description: "Enxerga em praticamente todas as dire\xE7\xF5es ao mesmo tempo.", pages: ["Alguns acreditam que \xE9 resultado de algo na \xE1gua do p\xE2ntano.", "Ningu\xE9m consegue se aproximar de surpresa.", "Poss\xEDveis drops (lore, n\xE3o implementado): Olho Extra, Pele Viscosa, L\xEDngua El\xE1stica."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "verme-de-pedra", name: "Verme de Pedra", type: "aberracao", rarity: "comum", suggestedLevel: 3, habitat: "Dentro de rochas s\xF3lidas", regionId: "colinas-aridas", dangerLevel: "media", icon: "\u{1FAB1}", description: "Se move dentro de rochas s\xF3lidas, deixando t\xFAneis perfeitos.", pages: ["Ningu\xE9m entende como ele consegue perfurar pedra t\xE3o facilmente.", "Alguns pastores usam os t\xFAneis dele como atalho, quando d\xE1 certo.", "Poss\xEDveis drops (lore, n\xE3o implementado): Segmento P\xE9treo, P\xF3 de Pedra, Baba Mineral."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "planta-carnivora-ana", name: "Planta Carn\xEDvora An\xE3", type: "aberracao", rarity: "comum", suggestedLevel: 2, habitat: "Solo \xFAmido sob a copa das \xE1rvores", regionId: "bosque-sussurrante", dangerLevel: "baixa", icon: "\u{1F331}", description: "Pequena demais pra ser perigosa, mas insiste em tentar.", pages: ["Alguns viajantes j\xE1 perderam um dedo de luva pra uma, por descuido.", "Idris jura que uma tentou comer sua bota inteira.", "Poss\xEDveis drops (lore, n\xE3o implementado): P\xE9tala Afiada, Seiva Grudenta, Raiz Retorcida."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "sombra-com-dentes", name: "Sombra com Dentes", type: "aberracao", rarity: "incomum", suggestedLevel: 7, habitat: "Corredores sem qualquer luz", regionId: "fortaleza-sombria", dangerLevel: "alta", icon: "\u{1F464}", description: "Some completamente na escurid\xE3o, s\xF3 os dentes ficam vis\xEDveis.", pages: ["Guardas evitam corredores sem luz por causa dela, especificamente.", "Ningu\xE9m sabe se ela realmente morde, ou s\xF3 assusta.", "Poss\xEDveis drops (lore, n\xE3o implementado): Dente Flutuante, Sombra Densa, Escurid\xE3o Presa."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "fungo-pensante", name: "Fungo Pensante", type: "aberracao", rarity: "incomum", suggestedLevel: 6, habitat: "Troncos podres no p\xE2ntano", regionId: "pantano-podre", dangerLevel: "media", icon: "\u{1F344}", description: "Reage a quem se aproxima, de um jeito que parece decis\xE3o, n\xE3o instinto.", pages: ["Yannick acredita que ele se comunica de alguma forma com outros fungos pr\xF3ximos.", "Alguns juram que ele muda de cor quando algu\xE9m mente perto dele.", "Poss\xEDveis drops (lore, n\xE3o implementado): Esporo Denso, Cogumelo Pulsante, Raiz F\xFAngica."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado" },
  { id: "criatura-de-areia-movedica", name: "Criatura de Areia Movedi\xE7a", type: "aberracao", rarity: "incomum", suggestedLevel: 7, habitat: "Dunas inst\xE1veis", regionId: "deserto-de-vidro", dangerLevel: "alta", icon: "\u{1F3DC}\uFE0F", description: "Se forma e desmancha na areia, sem forma fixa.", pages: ["Viajantes aprenderam a nunca confiar em dunas 'estranhamente perfeitas'.", "Zoltar acredita que ela \xE9 feita de vidro derretido misturado com areia comum.", "Poss\xEDveis drops (lore, n\xE3o implementado): Areia Compacta, N\xFAcleo Inst\xE1vel, Vidro Fundido."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "serpente-de-vidro-menor", name: "Serpente de Vidro Menor", type: "aberracao", rarity: "raro", suggestedLevel: 10, habitat: "Sob a areia vitrificada", regionId: "deserto-de-vidro", dangerLevel: "alta", icon: "\u{1F40D}", description: "Move-se sem deixar rastro, cortando a areia como \xE1gua.", pages: ["Ningu\xE9m sabe explicar como ela respira, ou se precisa.", "Zoltar tem uma teoria inteira, mas admite que \xE9 s\xF3 teoria.", "Poss\xEDveis drops (lore, n\xE3o implementado): Escama de Vidro, Presa Afiada, Veneno Cristalizado."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { itemSlug: "luvas-deserto-vidro", npcKey: "alquimista", npcNote: "Zoltar tem uma teoria inteira sobre como ela respira, mas admite que \xE9 s\xF3 teoria." } },
  { id: "olho-flutuante-das-ruinas", name: "Olho Flutuante das Ru\xEDnas", type: "aberracao", rarity: "raro", suggestedLevel: 11, habitat: "Corredores altos das ru\xEDnas", regionId: "ruinas-esquecidas", dangerLevel: "alta", icon: "\u{1F441}\uFE0F", description: "Flutua sozinho, observando tudo, sem corpo vis\xEDvel.", pages: ["Alguns exploradores relatam ter sido observados por dias, sem entender por qu\xEA.", "Alaric se recusa a manter um catalogado por muito tempo perto de si.", "Poss\xEDveis drops (lore, n\xE3o implementado): \xCDris Flutuante, Membrana Fina, Fluido Viscoso."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto" },
  { id: "a-voz-sem-rosto", name: "A Voz Sem Rosto", type: "aberracao", rarity: "muito-raro", suggestedLevel: 17, habitat: "Profundezas sem luz da fortaleza", regionId: "fortaleza-sombria", dangerLevel: "letal", icon: "\u{1F52E}", description: "Ningu\xE9m sabe descrever exatamente o que \xE9, s\xF3 o que sente perto dele.", pages: ["Todo relato sobre ela \xE9 vago, como se a pr\xF3pria mem\xF3ria se recusasse a guardar detalhes.", "Zoltar se recusa terminantemente a falar sobre essa.", "Poss\xEDveis drops (lore, n\xE3o implementado): Fragmento Inomin\xE1vel, Eco Distorcido, Sombra Densa."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "a-coisa-entre-as-pedras", name: "A Coisa Entre as Pedras", type: "aberracao", rarity: "muito-raro", suggestedLevel: 18, habitat: "Dentro da rocha s\xF3lida", regionId: "colinas-aridas", dangerLevel: "letal", icon: "\u{1FAA8}", description: "Vive literalmente dentro da rocha s\xF3lida, aparecendo s\xF3 por rachaduras.", pages: ["Alguns acreditam que ela esteve ali antes das pr\xF3prias colinas se formarem.", "Yannick tem pesadelos recorrentes desde que estudou o caso de perto.", "Poss\xEDveis drops (lore, n\xE3o implementado): Fragmento Vivo, Pedra Pulsante, P\xF3 Estranho."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  { id: "o-que-nao-deveria-existir", name: "O Que N\xE3o Deveria Existir", type: "aberracao", rarity: "lendaria", suggestedLevel: 26, habitat: "Profundezas do deserto vitrificado", regionId: "deserto-de-vidro", dangerLevel: "letal", icon: "\u{1F441}\uFE0F", description: "Nenhuma descri\xE7\xE3o confi\xE1vel concorda em nada, exceto que ele existe.", pages: ["Cada estudioso que j\xE1 se aproximou o suficiente descreve algo completamente diferente.", "Alaric se recusa terminantemente a abrir uma exposi\xE7\xE3o sobre ele.", "Poss\xEDveis drops (lore, n\xE3o implementado): Fragmento Imposs\xEDvel, Amostra Inst\xE1vel, Vest\xEDgio Inexplic\xE1vel."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado" },
  // ============================================================
  // Sprint Wolves Ecosystem (Phase I) — 8 variantes de lobos, aprofundando
  // o ecossistema já existente (Lobos Cinzentos, Lobo Solitário da
  // Fortaleza, O Lobo Que Não Envelhece). Cada uma conectada a um item,
  // NPC, rumor, história de viajante e/ou livro reais, criados nesta
  // mesma Sprint.
  // ============================================================
  { id: "lobo-alfa", name: "Lobo Alfa", type: "besta", rarity: "raro", suggestedLevel: 14, habitat: "Cora\xE7\xE3o da matilha, no centro do bosque", regionId: "bosque-sussurrante", dangerLevel: "alta", icon: "\u{1F43A}", description: "Lidera a matilha sem precisar provar isso duas vezes.", pages: ["Raramente entra em combate direto \u2014 a matilha inteira se move para proteg\xEA-lo primeiro.", "Borin jura que o couro de um Alfa \xE9 quase imposs\xEDvel de conseguir sem rasgos.", "Poss\xEDveis drops (lore, n\xE3o implementado): Presa do Alfa, Pelagem de L\xEDder, Garra Dominante."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { itemSlug: "presa-do-alfa", npcKey: "ferreiro", npcNote: "Borin jura que o couro de um Alfa \xE9 quase imposs\xEDvel de conseguir sem rasgos.", rumor: "Contam que o Lobo Alfa s\xF3 aparece pra quem j\xE1 enfrentou a matilha inteira e sobreviveu.", travellerStoryId: "uivo-que-lidera", bookId: "tratado-da-matilha" } },
  { id: "loba-prateada", name: "Loba Prateada", type: "besta", rarity: "raro", suggestedLevel: 13, habitat: "Trilhas afastadas da matilha principal", regionId: "bosque-sussurrante", dangerLevel: "alta", icon: "\u{1F43A}", description: "Ca\xE7a sozinha, longe da matilha, sempre retornando antes do amanhecer.", pages: ["N\xE3o \xE9 subordinada ao Alfa \u2014 opera por conta pr\xF3pria, por escolha.", "Yannick descreve a pelagem dela como quase brilhante sob luar, mesmo depois de curtida.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Prateada, Presa Curva, Olho Claro."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "estudado", connections: { itemSlug: "manto-da-loba-prateada", npcKey: "erudito", npcNote: "Yannick descreve a pelagem dela como quase brilhante sob luar, mesmo depois de curtida.", travellerStoryId: "loba-que-anda-sozinha", bookId: "tratado-da-matilha" } },
  { id: "filhote-de-lobo-perdido", name: "Filhote de Lobo Perdido", type: "besta", rarity: "comum", suggestedLevel: 2, habitat: "Bordas do bosque, longe da matilha", regionId: "bosque-sussurrante", dangerLevel: "baixa", icon: "\u{1F43A}", description: "Separado da matilha, ainda aprendendo a sobreviver sozinho.", pages: ["Um dos poucos lobos que se aproxima de humanos sem hostilidade.", "Greta jura guardar uma presa de lobo h\xE1 anos \u2014 talvez a dele mesmo.", "Poss\xEDveis drops (lore, n\xE3o implementado): Presa de Leite, Pelagem Macia, Coleira Improvisada."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { itemSlug: "coleira-do-filhote-perdido", npcKey: "taverneira", npcNote: "Greta jura guardar uma presa de lobo h\xE1 anos \u2014 talvez a dele mesmo.", rumor: "Dizem que um filhote de lobo foi visto sozinho perto da Capital. Ningu\xE9m teve coragem de se aproximar.", travellerStoryId: "filhote-que-seguiu-um-viajante" } },
  { id: "lobo-das-colinas-aridas", name: "Lobo das Colinas \xC1ridas", type: "besta", rarity: "comum", suggestedLevel: 4, habitat: "Encostas secas, longe de qualquer matilha grande", regionId: "colinas-aridas", dangerLevel: "media", icon: "\u{1F43A}", description: "Ca\xE7a sozinho \u2014 a terra ali n\xE3o sustenta uma matilha inteira.", pages: ["Mais magro que o lobo do Bosque, adaptado \xE0 escassez de presas.", "Idris j\xE1 cruzou com um duas vezes na mesma travessia.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Seca, Garra Fina, Presa Curta."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { itemSlug: "botas-de-pelagem-seca", npcKey: "viajante", npcNote: "Idris j\xE1 cruzou com um lobo das Colinas \xC1ridas duas vezes na mesma travessia.", travellerStoryId: "lobos-que-nao-cacam-em-bando" } },
  { id: "lobo-do-pantano", name: "Lobo do P\xE2ntano", type: "besta", rarity: "incomum", suggestedLevel: 7, habitat: "Trilhas alagadas do p\xE2ntano", regionId: "pantano-podre", dangerLevel: "media", icon: "\u{1F43A}", description: "Atravessa \xE1gua parada como se fosse ch\xE3o firme.", pages: ["Adaptou-se \xE0 \xE1gua melhor que qualquer outro lobo do Reino.", "Idris afirma que os lobos daqui nadam melhor do que ca\xE7am.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Encharcada, Garra Molhada, Presa Escorregadia."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { itemSlug: "manto-de-pelagem-encharcada", npcKey: "viajante", npcNote: "Idris afirma que os lobos do P\xE2ntano Podre nadam melhor do que ca\xE7am.", rumor: "Um viajante afirma que os lobos do P\xE2ntano Podre nadam melhor do que ca\xE7am.", travellerStoryId: "lobo-que-nada-no-pantano" } },
  { id: "lobo-de-presas-de-gelo", name: "Lobo de Presas de Gelo", type: "besta", rarity: "raro", suggestedLevel: 12, habitat: "Fendas nevadas nos picos", regionId: "picos-congelados", dangerLevel: "alta", icon: "\u{1F43A}", description: "Suas presas parecem refletir a luz da lua, como gelo puro.", pages: ["Exploradores relatam avistamentos breves, sempre \xE0 dist\xE2ncia segura.", "Yannick nunca conseguiu confirmar se as presas realmente brilham, ou se \xE9 s\xF3 a neve.", "Poss\xEDveis drops (lore, n\xE3o implementado): Presa Gelada, Pelagem Congelada, Garra Cristalina."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { itemSlug: "elmo-de-presas-de-gelo", npcKey: "erudito", npcNote: "Yannick nunca conseguiu confirmar se as presas realmente brilham, ou se \xE9 s\xF3 a neve.", rumor: "Contam que existe um lobo nos Picos Congelados com presas que brilham como gelo puro.", travellerStoryId: "presas-que-brilham-na-neve" } },
  { id: "matilha-faminta", name: "Matilha Faminta", type: "besta", rarity: "incomum", suggestedLevel: 9, habitat: "Trechos densos do bosque, longe de presa f\xE1cil", regionId: "bosque-sussurrante", dangerLevel: "alta", icon: "\u{1F43A}", description: "Cerca em sil\xEAncio absoluto, sem o uivo de aviso de costume.", pages: ["O encontro mais perigoso de todos, precisamente porque n\xE3o avisa.", "Borin recusa forjar armadilhas pra lobo. Diz que n\xE3o \xE9 esse tipo de ferreiro.", "Poss\xEDveis drops (lore, n\xE3o implementado): Garras de Matilha, Pelagem \xC1spera, Presa Rachada."], locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", status: "visto", connections: { itemSlug: "garras-de-matilha", npcKey: "ferreiro", npcNote: "Borin recusa forjar armadilhas pra lobo. Diz que n\xE3o \xE9 esse tipo de ferreiro.", travellerStoryId: "matilha-que-cerca-em-silencio" } },
  { id: "o-lobo-marcado", name: "O Lobo Marcado", type: "besta", rarity: "muito-raro", suggestedLevel: 19, habitat: "Trechos mais profundos do bosque", regionId: "bosque-sussurrante", dangerLevel: "alta", icon: "\u{1F43A}", description: "Magro, cicatrizado, imposs\xEDvel de encurralar.", pages: ["Alguns ca\xE7adores juram reconhecer sempre o mesmo lobo, marcado no focinho.", "Idris jura ter visto o mesmo lobo marcado em duas regi\xF5es diferentes, no mesmo dia.", "Poss\xEDveis drops (lore, n\xE3o implementado): Pelagem Marcada, Presa Rachada, Garra Antiga."], locked: true, unlockCondition: "Desconhecida", status: "bloqueado", connections: { npcKey: "viajante", npcNote: "Idris jura ter visto o mesmo lobo marcado em duas regi\xF5es diferentes, no mesmo dia.", rumor: "Dizem que existe um lobo t\xE3o velho que j\xE1 foi visto pela av\xF3 de quem conta a hist\xF3ria agora.", travellerStoryId: "lobo-com-cicatriz-no-focinho" } }
];

// apps/web/src/lib/library.ts
var BOOK_CATEGORIES = [
  { slug: "historia", label: "Hist\xF3ria", icon: "\u{1F4DC}" },
  { slug: "lendas", label: "Lendas", icon: "\u{1F409}" },
  { slug: "regioes", label: "Regi\xF5es", icon: "\u{1F5FA}\uFE0F" },
  { slug: "criaturas", label: "Criaturas", icon: "\u{1F43E}" },
  { slug: "personagens", label: "Personagens", icon: "\u{1F9D1}" },
  { slug: "religioes", label: "Religi\xF5es", icon: "\u26E9\uFE0F" },
  { slug: "cartas", label: "Cartas", icon: "\u2709\uFE0F" },
  { slug: "diarios", label: "Di\xE1rios", icon: "\u{1F4D3}" },
  { slug: "reinos", label: "Reinos", icon: "\u{1F3F0}" },
  { slug: "misterios", label: "Mist\xE9rios", icon: "\u{1F52E}" }
];
var PLACEHOLDER_PAGES2 = [
  "**Este livro ainda est\xE1 sendo escrito.**\n\nEm breve, a hist\xF3ria completa estar\xE1 dispon\xEDvel para todos os aventureiros do Reino.",
  "*Livro em desenvolvimento...*\n\nVolte para a Biblioteca em outra ocasi\xE3o.",
  "**Fim da amostra.**\n\nAs pr\xF3ximas p\xE1ginas ainda n\xE3o foram reveladas."
];
var BOOKS = [
  {
    id: "cronicas-do-primeiro-amanhecer",
    title: "Cr\xF4nicas do Primeiro Amanhecer",
    author: "Autor desconhecido",
    category: "historia",
    description: "Livro em desenvolvimento...",
    pages: PLACEHOLDER_PAGES2,
    locked: false,
    unlockCondition: "Dispon\xEDvel desde o in\xEDcio",
    status: "lido"
  },
  {
    id: "lendas-do-bosque-sussurrante",
    title: "Lendas do Bosque Sussurrante",
    author: "Autor desconhecido",
    category: "lendas",
    description: "Livro em desenvolvimento...",
    pages: PLACEHOLDER_PAGES2,
    locked: false,
    unlockCondition: "Dispon\xEDvel desde o in\xEDcio",
    status: "conhecido"
  },
  {
    id: "bestiario-das-terras-selvagens",
    title: "Besti\xE1rio das Terras Selvagens",
    author: "Autor desconhecido",
    category: "criaturas",
    description: "Livro em desenvolvimento...",
    pages: PLACEHOLDER_PAGES2,
    locked: false,
    unlockCondition: "Dispon\xEDvel desde o in\xEDcio",
    status: "conhecido"
  },
  {
    id: "cartas-perdidas-de-um-aventureiro",
    title: "Cartas Perdidas de um Aventureiro",
    author: "Autor desconhecido",
    category: "cartas",
    description: "Livro em desenvolvimento...",
    pages: PLACEHOLDER_PAGES2,
    locked: true,
    unlockCondition: "Desconhecida",
    status: "bloqueado"
  },
  {
    id: "misterios-da-fortaleza-sombria",
    title: "Mist\xE9rios da Fortaleza Sombria",
    author: "Autor desconhecido",
    category: "misterios",
    description: "Livro em desenvolvimento...",
    pages: PLACEHOLDER_PAGES2,
    locked: true,
    unlockCondition: "Desconhecida",
    status: "bloqueado"
  },
  // Sprint Wolves Ecosystem (Phase I) — primeiro livro do catálogo com
  // páginas reais (não PLACEHOLDER_PAGES), escrito por Yannick como
  // registro de campo sobre os Lobos do Bosque Sussurrante.
  {
    id: "tratado-da-matilha",
    title: "Tratado da Matilha",
    author: "Yannick, o Erudito",
    category: "criaturas",
    description: "Um registro de campo sobre os Lobos do Bosque Sussurrante \u2014 e o que os torna diferentes de qualquer outra besta do Reino.",
    pages: [
      "**Tratado da Matilha**\n\nDedico este registro a todo ca\xE7ador que j\xE1 confundiu um lobo comum com um Lobo Alfa \u2014 e viveu para admitir o erro.\n\nOs Lobos Cinzentos do Bosque Sussurrante n\xE3o s\xE3o uma criatura s\xF3. S\xE3o uma estrutura inteira, com hierarquia, territ\xF3rio e mem\xF3ria pr\xF3pria. Passei anos catalogando rastros antes de entender isso.",
      "**I. O Alfa**\n\nO Lobo Alfa lidera n\xE3o pela for\xE7a bruta, mas pela aus\xEAncia dela \u2014 raramente precisa lutar, porque raramente algu\xE9m o desafia duas vezes. Seu uivo, dizem os ca\xE7adores, \xE9 mais grave e mais longo que o de qualquer outro membro da matilha, e \xE9 ouvido, na maioria das ca\xE7adas, uma \xFAnica vez.\n\nBorin j\xE1 comentou comigo que o couro de um Alfa \xE9 quase imposs\xEDvel de conseguir sem rasgos \u2014 o animal n\xE3o se entrega f\xE1cil, nem depois de morto. A Presa do Alfa, quando encontrada, \xE9 tratada por ca\xE7adores experientes quase como uma rel\xEDquia \u2014 n\xE3o pelo valor de venda, mas pelo que representa.",
      "**II. A Loba Prateada**\n\nAo lado do Alfa, uma segunda figura: uma loba de pelagem clara que ca\xE7a sozinha, longe da matilha, sempre retornando antes do amanhecer. N\xE3o \xE9 subordinada \u2014 \xE9, pelo que observei, uma parceira que escolheu operar de forma independente. Sua pelagem, mesmo curtida, mant\xE9m um brilho estranho sob luar.",
      "**III. Os Filhotes**\n\nUm filhote separado da matilha \xE9 um dos poucos lobos que se aproxima de humanos sem hostilidade. Um mercador me contou que um o seguiu por dois dias inteiros, sem nunca se aproximar o suficiente para ser tocado. Greta jura guardar uma presa de lobo h\xE1 anos \u2014 provavelmente de um filhote, pelo tamanho que ela descreve.",
      "**IV. As Variantes Regionais**\n\nNem todo lobo do Reino \xE9 do Bosque. Nas Colinas \xC1ridas, a escassez de presas for\xE7a os lobos a ca\xE7ar sozinhos \u2014 a terra ali n\xE3o sustenta uma matilha inteira. No P\xE2ntano Podre, encontrei relatos de um lobo que atravessa \xE1gua parada como se fosse ch\xE3o firme. E nos Picos Congelados, ca\xE7adores juram que existe um lobo cujas presas parecem refletir a luz da lua, como gelo puro.",
      "**V. A Matilha Faminta**\n\nQuando a ca\xE7a escasseia, a matilha muda de comportamento \u2014 cerca em sil\xEAncio absoluto, sem o uivo de aviso que normalmente precede um ataque. \xC9 o encontro mais perigoso de todos, precisamente porque n\xE3o avisa.\n\nIdris jura j\xE1 ter visto o mesmo lobo marcado em duas regi\xF5es diferentes, no mesmo dia. N\xE3o tenho como confirmar. Mas tamb\xE9m n\xE3o tenho como negar.",
      "**Nota final**\n\nH\xE1 uma noite, h\xE1 anos, em que nenhum lobo uivou no Bosque Sussurrante inteiro. Ningu\xE9m soube dizer por qu\xEA. Continuo catalogando rastros, na esperan\xE7a de que, um dia, essa p\xE1gina tamb\xE9m tenha uma resposta."
    ],
    locked: false,
    unlockCondition: "Dispon\xEDvel desde o in\xEDcio",
    status: "lido"
  },
  // Sprint Ravens Ecosystem (Phase I) — segundo livro do catálogo com
  // páginas reais, sobre os Corvos do Reino. Autor deliberadamente
  // desconhecido — o livro nunca confirma se os corvos entendem os
  // humanos, e não seria coerente atribuí-lo a um estudioso que afirma
  // ter certeza de algo.
  {
    id: "os-corvos-do-reino",
    title: "Os Corvos do Reino",
    author: "Autor desconhecido",
    category: "misterios",
    description: "Um registro incompleto sobre os corvos que observam o Reino de longe \u2014 sem nunca dizer se realmente entendem o que veem.",
    pages: [
      "**Os Corvos do Reino**\n\nN\xE3o sei quem come\xE7ou este registro antes de mim. As primeiras p\xE1ginas j\xE1 estavam escritas quando cheguei a ele. Vou continuar do jeito que encontrei: sem conclus\xF5es, s\xF3 observa\xE7\xF5es.",
      "**I. Em Toda Parte**\n\nH\xE1 corvos em quase todas as regi\xF5es do Reino \u2014 perto de estradas, sobre expedi\xE7\xF5es, entre ru\xEDnas, acima da neve. Ningu\xE9m os ca\xE7a. Ningu\xE9m os alimenta. Eles simplesmente est\xE3o l\xE1, como parte da paisagem, n\xE3o como parte da ca\xE7a.",
      "**II. O Corvo das Ru\xEDnas**\n\nNas Ru\xEDnas Esquecidas, um corvo foi visto dias inteiros sobre a mesma l\xE1pide vazia, sem se mover. Perguntei ao Curador do Museu o que ele achava disso. Ele preferiu n\xE3o responder.",
      "**III. O Corvo das Montanhas**\n\nExploradores dos Picos Congelados contam sobre bandos que os seguem at\xE9 o topo de uma escalada inteira, sem nunca pousar. Uma pena recolhida l\xE1 em cima nunca murchou, mesmo anos depois.",
      "**IV. O Corvo do Bosque**\n\nH\xE1 quem diga que os corvos sabem, antes de qualquer ca\xE7ador, onde uma matilha de lobos vai atacar \u2014 e que somem por completo pouco antes do ataque acontecer. Um ca\xE7ador jura que os corvos somem primeiro justamente quando \xE9 o Lobo Alfa quem lidera a ca\xE7ada. N\xE3o encontrei uma \xFAnica testemunha disposta a jurar isso com certeza total.",
      "**V. O Corvo Mensageiro**\n\nUm viajante experiente me contou que confiou uma mensagem de verdade a um corvo, uma \xFAnica vez, e que ela chegou. N\xE3o tentou de novo. Quando perguntei por qu\xEA, s\xF3 disse: 'N\xE3o quis testar a sorte duas vezes.'",
      "**VI. O Corvo Anci\xE3o**\n\nH\xE1 relatos, espalhados por anos e regi\xF5es diferentes, do mesmo corvo \u2014 sempre sozinho, sempre observando o mesmo aventureiro \xE0 dist\xE2ncia. N\xE3o h\xE1 como confirmar se \xE9 o mesmo animal. Tamb\xE9m n\xE3o h\xE1 como negar.",
      "**VII. A Pergunta que Ningu\xE9m Responde**\n\nOs corvos entendem o que dizemos? Alguns juram que sim. Outros riem da pergunta. N\xE3o encontrei nada, em anos reunindo estes relatos, que resolvesse isso de um jeito ou de outro \u2014 e talvez seja assim mesmo que deva ficar.",
      "**Nota final**\n\nSe algu\xE9m continuar este registro depois de mim, pe\xE7o s\xF3 uma coisa: n\xE3o force uma resposta que os corvos nunca quiseram dar."
    ],
    locked: false,
    unlockCondition: "Dispon\xEDvel desde o in\xEDcio",
    status: "conhecido"
  },
  // Sprint Ancient Ruins Ecosystem (Phase I) — terceiro livro do
  // catálogo com páginas reais. Diário de um explorador anônimo:
  // observa, registra, nunca conclui.
  {
    id: "as-ruinas-esquecidas-do-reino",
    title: "As Ru\xEDnas Esquecidas do Reino",
    author: "Um Explorador An\xF4nimo",
    category: "diarios",
    description: "O di\xE1rio de um explorador que percorreu doze s\xEDtios de ru\xEDnas espalhados pelo Reino \u2014 sem nunca concluir o que encontrou.",
    pages: [
      "**As Ru\xEDnas Esquecidas do Reino**\n\nComecei este di\xE1rio sem saber quantas ru\xEDnas encontraria. Termino sem saber quantas ainda existem. Isso, sozinho, j\xE1 deveria bastar como aviso a quem ler o que vem a seguir.",
      "**I. A Coluna Partida do Horizonte**\n\nNa Plan\xEDcie Dourada, encontrei uma \xFAnica coluna de p\xE9 \u2014 o resto, nada. Nenhuma funda\xE7\xE3o, nenhum entulho, nenhuma outra pedra que indicasse ter havido algo maior ali. A sombra dela, registrei tr\xEAs vezes, nunca apontou pro sol. N\xE3o sei o que fazer com essa informa\xE7\xE3o. S\xF3 sei que \xE9 verdade.",
      "**II. O Port\xE3o Sem Muro**\n\nAtravessei o Port\xE3o Sem Muro, nas Colinas \xC1ridas, mais vezes do que consigo contar. Do outro lado, sempre o mesmo lugar de onde sa\xED. N\xE3o registrei diferen\xE7a nenhuma, em nenhuma tentativa.",
      "**III. A Escadaria que Termina na Pedra**\n\nNas Minas Abandonadas, encontrei degraus que sobem e terminam numa parede s\xF3lida. Um mineiro me garantiu ter ouvido passos do outro lado. N\xE3o ouvi nada, nas tr\xEAs noites que passei ali. Isso n\xE3o significa que ele estava errado.",
      "**IV. A Est\xE1tua Sem Rosto**\n\nNas Ru\xEDnas Esquecidas propriamente ditas, uma est\xE1tua ajoelhada, com todo detalhe poss\xEDvel \u2014 exceto o rosto, completamente liso. Tentei imaginar uma explica\xE7\xE3o. Desisti antes de terminar de imaginar.",
      "**V. O Po\xE7o Completamente Seco**\n\nNo Deserto de Vidro, um po\xE7o fundo demais. Joguei uma pedra. O som do impacto chegou tarde demais para o que a f\xEDsica deveria permitir. Joguei outra pedra, s\xF3 para verificar. O resultado foi o mesmo.",
      "**VI. Os S\xEDmbolos do Penhasco**\n\nNos Picos Congelados, uma parede inteira de s\xEDmbolos que nenhum estudioso reconheceu. Fiz um esbo\xE7o na primeira visita. Na segunda, o esbo\xE7o n\xE3o batia mais com a parede. N\xE3o sei dizer se os s\xEDmbolos mudaram ou se fui eu quem desenhou errado da primeira vez.",
      "**VII. O Acampamento Antigo**\n\nNo Bosque Sussurrante, c\xEDrculos de fogueira apagados todos ao mesmo tempo, a julgar pelas marcas. Um grupo inteiro parece ter desaparecido numa \xFAnica noite. N\xE3o h\xE1 corpos. N\xE3o h\xE1 rastro de sa\xEDda. S\xF3 o acampamento, intacto, esperando por gente que n\xE3o voltou.",
      "**VIII. A M\xE1scara Enterrada**\n\nNo P\xE2ntano Podre, uma m\xE1scara de pedra, meio submersa na lama. Voltei tr\xEAs anos depois de registr\xE1-la pela primeira vez. Estava exatamente na mesma posi\xE7\xE3o, nem um cent\xEDmetro mais afundada.",
      "**IX. A Torre Sem Entrada**\n\nNo Litoral Quebrado, uma torre alta demais para ter sido erguida sem andaimes \u2014 e nenhuma porta, nenhuma janela, em lugar nenhum. Dei tr\xEAs voltas completas ao redor dela. N\xE3o encontrei sequer uma rachadura.",
      "**X. A Arena Afundada e o Portal da Fronteira**\n\nNas Colinas \xC1ridas, uma arena de arquibancadas de pedra, funda demais para o solo ao redor. Na Fortaleza Sombria, dois blocos erguidos e um terceiro ca\xEDdo \u2014 que nenhum grupo, por mais forte, conseguiu mover um cent\xEDmetro. Registro os dois juntos porque, de algum jeito que n\xE3o sei explicar, parecem pertencer \xE0 mesma hist\xF3ria.",
      "**XI. A C\xE2mara das Vozes**\n\nDe volta \xE0s Ru\xEDnas Esquecidas: uma c\xE2mara circular, ac\xFAstica impossivelmente perfeita. Gritei o mesmo nome duas vezes. Os ecos que voltaram n\xE3o foram iguais.",
      "**Nota final**\n\nDoze s\xEDtios. Doze mist\xE9rios sem resposta. N\xE3o escrevo este di\xE1rio para explicar as Ru\xEDnas do Reino \u2014 n\xE3o tenho essa capacidade, e duvido que algu\xE9m tenha. Escrevo s\xF3 para registrar que estive l\xE1, vi o que vi, e sa\xED com mais perguntas do que entrei."
    ],
    locked: false,
    unlockCondition: "Dispon\xEDvel desde o in\xEDcio",
    status: "conhecido"
  },
  // Sprint Kingdom Folk (Phase I) — quarto livro do catálogo com
  // páginas reais. Narrado por um velho viajante, sobre a gente comum
  // que sustenta o Reino sem nunca aparecer numa crônica de herói.
  {
    id: "a-vida-no-reino",
    title: "A Vida no Reino",
    author: "Um Velho Viajante",
    category: "personagens",
    description: "Um relato sobre o povo comum do Reino \u2014 lenhadores, pescadores, oleiros, pastores \u2014 contado por quem passou a vida inteira de passagem por suas vilas.",
    pages: [
      "**A Vida no Reino**\n\nAndei estrada afora tempo demais pra contar as cr\xF4nicas dos grandes feitos. Prefiro contar o que vi de verdade: gente comum, vivendo vidas comuns, sustentando um Reino que raramente repara nelas.",
      "**I. Quem Corta e Quem Queima**\n\nNo Bosque Sussurrante, conheci um lenhador que conta os an\xE9is de cada \xE1rvore antes de derrubar, como se pedisse licen\xE7a. Perto dali, um carvoeiro vigia o forno por noites inteiras, sem dormir, com o mesmo cuidado de quem cuida de um filho doente.",
      "**II. Quem Tira do Rio e da Terra**\n\nUma pescadora do Litoral Quebrado me contou sobre um peixe grande que j\xE1 devolveu tr\xEAs vezes. Um lavrador da Plan\xEDcie Dourada reza pra chuva na mesma data, todo ano, desde que herdou a terra do pai. Nenhum dos dois pediria uma can\xE7\xE3o sobre isso. Escrevo mesmo assim.",
      "**III. Quem Constr\xF3i**\n\nUm pedreiro guarda a primeira pedra que assentou sozinho numa prateleira em casa. Uma carpinteira construiu a pr\xF3pria casa do alicerce ao telhado, sozinha, sem esperar ajuda de ningu\xE9m. O Reino tem mais funda\xE7\xE3o nas m\xE3os dessas pessoas do que em qualquer trono.",
      "**IV. Quem Cura e Quem Acompanha**\n\nUma curandeira nunca cobrou rem\xE9dio de crian\xE7a. Uma parteira nunca errou a data de um parto, em toda a carreira. N\xE3o sei se s\xE3o exagero ou verdade. Sei que contam essas hist\xF3rias com o mesmo orgulho de qualquer her\xF3i que j\xE1 ouvi cr\xF4nica sobre.",
      "**V. Quem Viaja Sem Nunca Ser Lembrado**\n\nUma mensageira jura nunca ter se perdido em vinte anos de estrada. Um guia de caravana conhece o Reino inteiro de cor, sem precisar de mapa. Andei ao lado de gente assim mais vezes do que ao lado de qualquer nome que vira lenda.",
      "**VI. Quem Sustenta a Noite**\n\nUm guarda-noturno n\xE3o dorme direito nem nas folgas. Um sineiro criou, sozinho, um jeito diferente de tocar o sino pra cada aviso, e a vila inteira j\xE1 reconhece sem precisar perguntar. Ningu\xE9m escreve m\xFAsica sobre eles. Deveria.",
      "**VII. Quem Faz Rir e Quem Faz Lembrar**\n\nUm palha\xE7o de feira guarda como conquista a \xFAnica vez que fez o Guarda Roth soltar uma risada. Um contador de hist\xF3rias ambulante nunca repete a mesma hist\xF3ria do mesmo jeito duas vezes \u2014 talvez porque, pra ele, cada plateia mere\xE7a uma vers\xE3o s\xF3 sua.",
      "**VIII. Quem Come\xE7a com Quase Nada**\n\nQuase todo aventureiro que j\xE1 cruzei estrada come\xE7ou do mesmo jeito: um par de luvas rasgadas, encontradas ou herdadas, e nenhuma certeza do que vinha depois. Ouvi um ferreiro dizer que j\xE1 viu gente lutar pior equipada \u2014 e gente morrer melhor equipada. Nunca soube se isso era conforto ou aviso. Talvez as duas coisas, ao mesmo tempo.",
      "**IX. Os Pequenos Marcos que Todo Mundo Conhece**\n\nNingu\xE9m escreve cr\xF4nica sobre a Fonte da pra\xE7a, mas todo morador sabe onde fica, e a maioria j\xE1 bebeu dela pelo menos uma vez. O mesmo vale pro barril vazio encostado num canto, pra \xE1rvore velha que ningu\xE9m lembra de ter plantado, pro po\xE7o da Vila do Bosque que ningu\xE9m mede o fundo, e pro Sino da Torre, cujo toque todo mundo reconhece sem nunca ter aprendido formalmente o que cada badalada significa. Esses lugares n\xE3o t\xEAm cr\xF4nica. T\xEAm rotina \u2014 e talvez seja isso que os torne permanentes.",
      "**X. O que Sustenta o Peso Todo Dia**\n\nA Primeira Ponte e a Torre do Port\xE3o Norte s\xE3o as duas obras mais antigas que ainda sustentam o peso de gente atravessando, todos os dias, sem parar pra pensar em quem construiu ou por qu\xEA. Um carroceiro me disse que confia mais na Ponte do que em qualquer decreto real. Um guarda me disse, sobre a Torre, que ela 'n\xE3o precisa de ningu\xE9m, s\xF3 continua de p\xE9'. Talvez seja esse o segredo das duas: continuar de p\xE9, dia ap\xF3s dia, sem exigir reconhecimento por isso.",
      "**Nota final**\n\nN\xE3o escrevi este livro por nenhum deles ter feito algo extraordin\xE1rio, no sentido que as cr\xF4nicas costumam exigir. Escrevi porque, juntos, sustentam tudo que faz o Reino parecer um lugar de verdade \u2014 e isso, pra mim, sempre foi extraordin\xE1rio o bastante."
    ],
    locked: false,
    unlockCondition: "Dispon\xEDvel desde o in\xEDcio",
    status: "conhecido"
  }
];

// apps/web/src/lib/npcs.ts
var NPCS = {
  ferreiro: {
    key: "ferreiro",
    name: "Borin, o Ferreiro",
    profession: "Ferreiro",
    quote: "Uma boa espada dura mais que um guerreiro.",
    description: "Forjou a primeira l\xE2mina da Capital com as pr\xF3prias m\xE3os \u2014 e n\xE3o deixa ningu\xE9m esquecer disso.",
    icon: "\u{1F6E0}\uFE0F",
    color: "#b08d57",
    shape: "square"
  },
  mercador: {
    key: "mercador",
    name: "Talia, a Mercadora",
    profession: "Mercadora",
    quote: "Toda moeda tem uma hist\xF3ria \u2014 a minha loja vai guardar muitas.",
    description: "Viajou por tr\xEAs Reinos antes de decidir que este merecia sua loja.",
    icon: "\u{1F6D2}",
    color: "#34a853",
    shape: "arch"
  },
  alquimista: {
    key: "alquimista",
    name: "Zoltar, o Alquimista",
    profession: "Alquimista",
    quote: "Toda mistura precisa de paci\xEAncia \u2014 e de um pouco de perigo.",
    description: "Ningu\xE9m sabe de onde ele veio. S\xF3 que os frascos nunca param de borbulhar.",
    icon: "\u2697\uFE0F",
    color: "#9146ff",
    shape: "hex"
  },
  guildmaster: {
    key: "guildmaster",
    name: "Mestra Elenya",
    profession: "Guildmaster",
    quote: "O Reino \xE9 feito de quem escolhe ficar.",
    description: "Guarda a mem\xF3ria de cada Campe\xE3o e Fundador que j\xE1 passou por aqui.",
    icon: "\u{1F3DB}\uFE0F",
    color: "#fbbc04",
    shape: "shield"
  },
  tesoureiro: {
    key: "tesoureiro",
    name: "Dorwin, o Tesoureiro",
    profession: "Tesoureiro",
    quote: "Seu ouro estar\xE1 seguro comigo.",
    description: "Conta cada moeda duas vezes \u2014 e nunca erra.",
    icon: "\u{1F3E6}",
    color: "#4285f4",
    shape: "square"
  },
  mestreArena: {
    key: "mestreArena",
    name: "Kade, o Mestre da Arena",
    profession: "Mestre da Arena",
    quote: "Cicatrizes contam mais hist\xF3rias que trof\xE9us.",
    description: "J\xE1 viu incont\xE1veis Bosses ca\xEDrem \u2014 e lembra do nome de quem os derrotou.",
    icon: "\u{1F3DF}\uFE0F",
    color: "#ea4335",
    shape: "hex"
  },
  guarda: {
    key: "guarda",
    name: "Sargento Roth",
    profession: "Guarda do Port\xE3o Norte",
    quote: "Boa sorte na estrada.",
    description: "Fica de olho em quem parte e em quem volta \u2014 poucos escapam do seu aceno.",
    icon: "\u{1F6AA}",
    color: "#9aa0a6",
    shape: "arch"
  },
  bibliotecaria: {
    key: "bibliotecaria",
    name: "Bibliotec\xE1ria Miriam",
    profession: "Bibliotec\xE1ria",
    quote: "Cada livro aqui espera por quem souber l\xEA-lo.",
    description: "Cataloga cada p\xE1gina que chega \xE0 Capital \u2014 mesmo as que ainda ningu\xE9m pode abrir.",
    icon: "\u{1F4DA}",
    color: "#6a3bd6",
    shape: "circle"
  },
  erudito: {
    key: "erudito",
    name: "Erudito Yannick",
    profession: "Bi\xF3logo do Reino",
    quote: "Toda criatura tem um comportamento \u2014 a maioria de n\xF3s s\xF3 nunca ficou tempo suficiente para ver.",
    description: "Passou mais noites observando covis do que dormindo em uma cama de verdade.",
    icon: "\u{1F52C}",
    color: "#34a853",
    shape: "hex"
  },
  curador: {
    key: "curador",
    name: "Curador Alaric",
    profession: "Curador do Museu",
    quote: "Um objeto sem hist\xF3ria \xE9 s\xF3 um objeto. Aqui, cada um tem as duas coisas.",
    description: "Passa os dias catalogando o que o Reino ainda n\xE3o teve coragem de esquecer.",
    icon: "\u{1F5BC}\uFE0F",
    color: "#fbbc04",
    shape: "square"
  },
  taverneira: {
    key: "taverneira",
    name: "Greta, a Taverneira",
    profession: "Taverneira",
    quote: "Aqui, toda hist\xF3ria vale uma bebida.",
    description: "Serve cerveja e mem\xF3ria em partes iguais \u2014 poucos segredos do Reino escapam do balc\xE3o dela.",
    icon: "\u{1F37A}",
    color: "#c9822a",
    shape: "arch"
  },
  viajante: {
    key: "viajante",
    name: "Idris, o Viajante",
    profession: "Guardi\xE3o da Casa dos Viajantes",
    quote: "N\xE3o sei se \xE9 verdade. Mas ouvi de algu\xE9m que jura que sim.",
    description: "J\xE1 andou por quase todas as regi\xF5es do Reino \u2014 e voltou com mais perguntas do que respostas.",
    icon: "\u{1F9F3}",
    color: "#e07a5f",
    shape: "shield"
  }
};

// apps/web/src/lib/ruins.ts
var ANCIENT_RUIN_SITES = [
  {
    id: "coluna-partida-do-horizonte",
    name: "Coluna Partida do Horizonte",
    regionId: "planicie-dourada",
    conservation: "Muito deteriorada \u2014 s\xF3 a base de uma coluna resta em p\xE9.",
    appearance: "Pedra clara, s\xEDmbolos apagados pelo vento e pelo tempo.",
    curiosity: "A sombra dela nunca aponta exatamente pra onde o sol est\xE1.",
    legend: "Dizem que era o centro de uma cidade inteira, hoje completamente desaparecida.",
    unsolvedMystery: "Nenhuma outra estrutura foi encontrada ao redor, nunca \u2014 nem funda\xE7\xE3o, nem entulho."
  },
  {
    id: "portao-sem-muro",
    name: "Port\xE3o Sem Muro",
    regionId: "colinas-aridas",
    conservation: "Intacto, isolado \u2014 nenhuma outra estrutura por perto.",
    appearance: "Um arco de pedra perfeito, sem nenhuma parede ligada a ele.",
    curiosity: "Atravess\xE1-lo n\xE3o leva a lugar nenhum diferente do outro lado.",
    legend: "Alguns dizem que antes havia um muro inteiro em volta dele.",
    unsolvedMystery: "Nenhuma funda\xE7\xE3o foi encontrada ao redor, como se o arco tivesse sido colocado ali sozinho."
  },
  {
    id: "escadaria-que-termina-na-pedra",
    name: "Escadaria que Termina na Pedra",
    regionId: "minas-abandonadas",
    conservation: "Parcialmente soterrada.",
    appearance: "Degraus de pedra que sobem e terminam abruptamente numa parede s\xF3lida.",
    curiosity: "Os mesmos degraus parecem continuar do outro lado, vistos de uma escava\xE7\xE3o vizinha.",
    legend: "Dizem que a escada levava a algum lugar que foi selado de prop\xF3sito.",
    unsolvedMystery: "Ningu\xE9m conseguiu confirmar o que est\xE1 atr\xE1s da parede."
  },
  {
    id: "estatua-sem-rosto",
    name: "Est\xE1tua Sem Rosto",
    regionId: "ruinas-esquecidas",
    conservation: "Bem preservada, exceto o rosto.",
    appearance: "Figura humanoide ajoelhada, o rosto completamente liso.",
    curiosity: "O resto do corpo tem detalhes extremamente finos \u2014 s\xF3 o rosto foi apagado, ou nunca esculpido.",
    legend: "Dizem que representa algu\xE9m que o pr\xF3prio Reino escolheu esquecer.",
    unsolvedMystery: "Ningu\xE9m sabe se o rosto foi destru\xEDdo ou se nunca existiu."
  },
  {
    id: "poco-completamente-seco",
    name: "Po\xE7o Completamente Seco",
    regionId: "deserto-de-vidro",
    conservation: "Intacto.",
    appearance: "Um po\xE7o de pedra profundo, sem nenhum sinal de j\xE1 ter tido \xE1gua.",
    curiosity: "Jogar uma pedra dentro dele, o som do impacto demora tempo demais pra voltar.",
    legend: "Contam que era usado pra algum tipo de ritual, n\xE3o pra beber.",
    unsolvedMystery: "Ningu\xE9m mediu a profundidade real dele."
  },
  {
    id: "simbolos-esculpidos-do-penhasco",
    name: "S\xEDmbolos Esculpidos do Penhasco",
    regionId: "picos-congelados",
    conservation: "Eros\xE3o parcial pelo gelo.",
    appearance: "Uma parede inteira coberta de s\xEDmbolos entalhados, nenhum decifrado.",
    curiosity: "Os s\xEDmbolos parecem mudar de posi\xE7\xE3o entre uma visita e outra \u2014 ou \xE9 s\xF3 a luz enganando.",
    legend: "Alguns acreditam que \xE9 um aviso. Outros, um registro.",
    unsolvedMystery: "Nenhum estudioso do Reino conseguiu traduzir uma \xFAnica palavra."
  },
  {
    id: "vestigios-do-acampamento-antigo",
    name: "Vest\xEDgios do Acampamento Antigo",
    regionId: "bosque-sussurrante",
    conservation: "Quase apagado pela vegeta\xE7\xE3o.",
    appearance: "C\xEDrculos de pedra queimada e restos de ferramentas enferrujadas.",
    curiosity: "As fogueiras parecem ter sido apagadas todas ao mesmo tempo, n\xE3o uma a uma.",
    legend: "Dizem que um grupo inteiro desapareceu numa \xFAnica noite.",
    unsolvedMystery: "Nenhum corpo, nenhum rastro de sa\xEDda foi encontrado."
  },
  {
    id: "mascara-enterrada-do-pantano",
    name: "M\xE1scara Enterrada do P\xE2ntano",
    regionId: "pantano-podre",
    conservation: "Parcialmente submersa.",
    appearance: "Uma m\xE1scara de pedra cinza, meio afundada na lama.",
    curiosity: "Nunca afunda mais do que j\xE1 est\xE1, nem sobe.",
    legend: "Contam que foi enterrada de prop\xF3sito, n\xE3o perdida.",
    unsolvedMystery: "Ningu\xE9m sabe o que ela representa, nem quem a fez."
  },
  {
    id: "torre-sem-entrada",
    name: "Torre Sem Entrada",
    regionId: "litoral-quebrado",
    conservation: "Intacta por fora.",
    appearance: "Uma torre de pedra alta demais para ter sido constru\xEDda sem andaimes.",
    curiosity: "Nenhuma porta, nenhuma janela, nenhuma escada vis\xEDvel em lugar nenhum.",
    legend: "Dizem que foi constru\xEDda de dentro pra fora.",
    unsolvedMystery: "Ningu\xE9m encontrou uma \xFAnica entrada, em nenhum lado."
  },
  {
    id: "arena-afundada",
    name: "Arena Afundada",
    regionId: "colinas-aridas",
    conservation: "Parcialmente soterrada.",
    appearance: "Um c\xEDrculo de arquibancadas de pedra, meio enterrado.",
    curiosity: "O centro da arena \xE9 mais fundo do que deveria ser fisicamente poss\xEDvel escavar naquele solo.",
    legend: "Dizem que ali aconteciam disputas que ningu\xE9m mais lembra o motivo.",
    unsolvedMystery: "Nenhum registro do Reino menciona essa arena antes de ela ser encontrada."
  },
  {
    id: "portal-de-pedra-da-fronteira",
    name: "Portal de Pedra da Fronteira",
    regionId: "fortaleza-sombria",
    conservation: "Intacto, isolado.",
    appearance: "Dois blocos de pedra erguidos, um terceiro ca\xEDdo no ch\xE3o entre eles.",
    curiosity: "Ningu\xE9m consegue mover o bloco ca\xEDdo, nem com for\xE7a, nem com ferramenta.",
    legend: "Contam que era usado pra marcar um limite que j\xE1 n\xE3o existe.",
    unsolvedMystery: "Nenhum mapa antigo mostra uma fronteira ali."
  },
  {
    id: "camara-das-vozes",
    name: "C\xE2mara das Vozes",
    regionId: "ruinas-esquecidas",
    conservation: "Bem preservada.",
    appearance: "Uma c\xE2mara circular de pedra lisa, com ac\xFAstica estranhamente perfeita.",
    curiosity: "Um sussurro nela ecoa como se v\xE1rias vozes respondessem junto.",
    legend: "Dizem que ali se falava com os mortos. Ou apenas com o eco.",
    unsolvedMystery: "Ningu\xE9m sabe explicar por que o eco nunca se repete do mesmo jeito duas vezes."
  }
];

// apps/web/src/lib/tavern.ts
var TAVERN_RUMORS = [
  "Disseram que um aventureiro voltou vivo das Ru\xEDnas Esquecidas.",
  "O Ferreiro jurou que algu\xE9m tentou afiar uma colher.",
  "Ningu\xE9m sabe quem continua roubando as ma\xE7\xE3s da pra\xE7a.",
  "O Guarda diz que ouviu passos na muralha durante a madrugada.",
  "Dizem que a Bibliotec\xE1ria dorme l\xE1 dentro h\xE1 tr\xEAs dias.",
  "Um viajante jura ter visto luzes no P\xE2ntano Podre \xE0 noite.",
  "Algu\xE9m trocou o sino da torre por um mais desafinado. Ningu\xE9m confessa.",
  "O po\xE7o da Vila do Bosque continua sem fundo, dizem os mais teimosos.",
  "Um cavalo apareceu na pra\xE7a sem dono. Ningu\xE9m reclamou o cavalo.",
  "Contam que um explorador voltou de Picos Congelados falando s\xF3 em rimas.",
  "O Tesoureiro jura que contou o mesmo Gold duas vezes essa semana.",
  "Uma crian\xE7a jura ter visto um drag\xE3o. Era uma nuvem grande.",
  "Algu\xE9m deixou uma carta sem assinatura na Guilda. Ningu\xE9m a leu at\xE9 o fim.",
  "Dizem que o Deserto de Vidro engoliu mais uma bota essa semana.",
  "Um mercador afirma ter vendido a mesma espada tr\xEAs vezes para o mesmo homem.",
  "Ouviram cantoria vindo da Fortaleza Sombria. Ningu\xE9m foi conferir.",
  "Um aventureiro trocou seu escudo por um chap\xE9u. Ningu\xE9m entendeu por qu\xEA.",
  "Dizem que o Ferreiro fala sozinho enquanto forja. Ele nega.",
  // Sprint Wolves Ecosystem (Phase I) — 15 rumores sobre os Lobos do
  // Bosque Sussurrante e variantes regionais.
  "Borin jura que um lobo j\xE1 roeu o cabo de um martelo esquecido do lado de fora da forja.",
  "Dizem que a matilha do Bosque Sussurrante cresceu \u2014 ningu\xE9m sabe contar quantos s\xE3o de verdade.",
  "Um ca\xE7ador voltou sem uma bota e sem explica\xE7\xE3o. S\xF3 disse 'foi um lobo' e n\xE3o quis falar mais.",
  "Greta guarda uma presa de lobo debaixo do balc\xE3o. Ningu\xE9m sabe desde quando, nem por qu\xEA.",
  "Idris jura ter visto o mesmo lobo em duas regi\xF5es diferentes, no mesmo dia.",
  "Contam que o Lobo Alfa s\xF3 aparece pra quem j\xE1 enfrentou a matilha inteira e sobreviveu.",
  "Um fazendeiro das Colinas \xC1ridas culpa os lobos por todo galinheiro vazio, mesmo quando a raposa \xE9 mais prov\xE1vel.",
  "Yannick tem um caderno s\xF3 de rastros de lobo, catalogados por tamanho da pegada.",
  "Dizem que um filhote de lobo foi visto sozinho perto da Capital. Ningu\xE9m teve coragem de se aproximar.",
  "Um viajante afirma que os lobos do P\xE2ntano Podre nadam melhor do que ca\xE7am.",
  "Contam que existe um lobo nos Picos Congelados com presas que brilham como gelo puro.",
  "Borin recusa forjar armadilhas pra lobo. Diz que n\xE3o \xE9 esse tipo de ferreiro.",
  "Uma crian\xE7a jura ter dado comida pra um lobo e ele simplesmente foi embora, sem atacar.",
  "Dizem que existe um lobo t\xE3o velho que j\xE1 foi visto pela av\xF3 de quem conta a hist\xF3ria agora.",
  "Algu\xE9m ouviu uivos vindos de tr\xEAs dire\xE7\xF5es diferentes na mesma noite, no Bosque Sussurrante.",
  // Sprint Ravens Ecosystem (Phase I) — 15 rumores sobre os Corvos do
  // Reino.
  "Dizem que os corvos sabem quando algu\xE9m vai morrer antes de acontecer. Ningu\xE9m confirma.",
  "Um viajante jura que um corvo o seguiu por tr\xEAs dias inteiros, sem motivo aparente.",
  "Contam que centenas de corvos levantaram voo ao mesmo tempo nas Ru\xEDnas Esquecidas, sem ningu\xE9m saber por qu\xEA.",
  "Miriam garante que um corvo pousou na janela da Biblioteca e ficou ali a tarde inteira.",
  "Dizem que existe um corvo t\xE3o velho que j\xE1 foi visto observando o mesmo aventureiro por anos.",
  "Idris afirma que j\xE1 confiou uma mensagem a um corvo. S\xF3 uma vez. Nunca mais repetiu.",
  "Um ca\xE7ador jura que os corvos sempre sabem onde a matilha de lobos ca\xE7ou, antes de qualquer humano perceber.",
  "Greta diz que um corvo entra na Taverna toda noite de chuva e s\xF3 vai embora de madrugada.",
  "Borin jura que um corvo j\xE1 roubou um prego da bigorna, na frente dele, sem pressa nenhuma.",
  "Dizem que ver um corvo sozinho \xE9 sinal de boa sorte. Ver muitos juntos, ningu\xE9m sabe dizer.",
  "Um explorador dos Picos Congelados jura que um bando de corvos o seguiu at\xE9 o topo, sem nunca pousar.",
  "Yannick tem um caderno inteiro s\xF3 sobre o comportamento dos corvos. Ainda incompleto.",
  "Contam que um corvo pousou sobre uma l\xE1pide vazia nas Ru\xEDnas Esquecidas e ficou ali dias.",
  "Algu\xE9m jura ter visto um corvo observar uma expedi\xE7\xE3o inteira, do in\xEDcio ao fim, sem nunca se aproximar.",
  "Dizem que os corvos entendem tudo que os humanos falam. Ningu\xE9m consegue provar.",
  // Sprint Ancient Ruins Ecosystem (Phase I) — 20 rumores sobre as
  // Ruínas Antigas, sempre contraditórios entre si.
  "Dizem que as Ru\xEDnas Esquecidas s\xE3o mais antigas que o pr\xF3prio Reino. Meu av\xF4 jurava o contr\xE1rio.",
  "Alguns dizem que ningu\xE9m nunca voltou de dentro da C\xE2mara das Vozes. Outros dizem que voltam sempre, s\xF3 n\xE3o lembram.",
  "Ningu\xE9m entra na Torre Sem Entrada. N\xE3o porque seja proibido \u2014 porque ningu\xE9m encontra a porta.",
  "Dizem que a Est\xE1tua Sem Rosto j\xE1 teve rosto, sim. Algu\xE9m jura o contr\xE1rio.",
  "Meu av\xF4 jurava que via luzes na Arena Afundada, \xE0 noite. Meu pai nunca viu nada.",
  "Alguns dizem que os s\xEDmbolos do penhasco mudam sozinhos. Outros dizem que \xE9 s\xF3 a luz enganando.",
  "Dizem que o Po\xE7o Seco nunca teve \xE1gua. Um velho pescador jura o contr\xE1rio, sem explicar como sabia.",
  "Ningu\xE9m sabe quem fez o Portal de Pedra da Fronteira. Todo mundo tem uma teoria diferente, e nenhuma prova.",
  "Dizem que a M\xE1scara Enterrada do P\xE2ntano est\xE1 afundando, devagar, h\xE1 anos. Outros dizem que est\xE1 exatamente na mesma posi\xE7\xE3o desde sempre.",
  "Alguns dizem que o Vest\xEDgio do Acampamento Antigo foi abandonado \xE0s pressas. Outros dizem que foi abandonado com calma, tudo arrumado.",
  "Meu av\xF4 jurava que essas Ru\xEDnas foram feitas por gente como a gente. Um estudioso da Capital discorda, sem dizer por qu\xEA.",
  "Dizem que essas Ru\xEDnas n\xE3o pertencem a nenhum povo conhecido. Ningu\xE9m confirma, ningu\xE9m nega.",
  "Ningu\xE9m entra na Escadaria que Termina na Pedra achando que \xE9 s\xF3 uma parede. Alguns dizem que j\xE1 ouviram passos do outro lado.",
  "Alguns dizem que as Ru\xEDnas t\xEAm mais de mil anos. Outros dizem que ningu\xE9m tem como saber isso.",
  "Dizem que existe uma d\xE9cima terceira ru\xEDna, ainda n\xE3o encontrada. Ningu\xE9m confirma a contagem oficial.",
  "Meu av\xF4 jurava ter visto algu\xE9m saindo de dentro da Est\xE1tua Sem Rosto. Ningu\xE9m mais na fam\xEDlia acredita nele.",
  "Alguns dizem que as Ru\xEDnas foram feitas por magia. Outros dizem que magia n\xE3o tinha nada a ver com aquilo.",
  "Dizem que quem entra na C\xE2mara das Vozes ouve a pr\xF3pria voz responder primeiro. Ningu\xE9m confirma isso de perto.",
  "Ningu\xE9m sabe se as Ru\xEDnas foram abandonadas ou se ainda t\xEAm algu\xE9m morando l\xE1 dentro.",
  "Alguns dizem que os corvos evitam pousar perto de certas Ru\xEDnas. Outros dizem que \xE9 exatamente o contr\xE1rio.",
  // Sprint Kingdom Folk (Phase I) — 40 rumores sobre moradores comuns
  // do Reino, nunca sobre heróis.
  "Dizem que o lenhador novo derruba \xE1rvore mais r\xE1pido que qualquer um da vila. Outros dizem que ele s\xF3 chegou primeiro nas mais f\xE1ceis.",
  "Um carvoeiro jura que n\xE3o dorme h\xE1 tr\xEAs dias vigiando o forno. A esposa dele jura que ele dormiu, sim, e roncou a noite inteira.",
  "Contam que a pescadora do Litoral Quebrado devolve todo peixe grande demais. Algu\xE9m jura que ela s\xF3 n\xE3o consegue puxar os maiores.",
  "Dizem que o oleiro novo j\xE1 quebrou cem potes aprendendo o of\xEDcio. Ele mesmo diz que foram s\xF3 uns vinte.",
  "Meu av\xF4 jurava que a pastora das Colinas reconhece cada ovelha pelo nome. Minha av\xF3 dizia que ela s\xF3 finge.",
  "Alguns dizem que o pedreiro velho constr\xF3i parede mais forte que qualquer um. Outros dizem que ele s\xF3 usa mais pedra que o necess\xE1rio.",
  "Dizem que a mensageira nunca se perdeu em vinte anos de estrada. Ningu\xE9m confirma, porque ningu\xE9m andou com ela o tempo todo.",
  "Um ferreiro itinerante consertou a vila inteira de gra\xE7a, dizem. Outros dizem que ele s\xF3 queria a companhia, n\xE3o a bondade.",
  "Meu av\xF4 jurava que a curandeira nunca errou um diagn\xF3stico. Meu pai lembra de pelo menos duas vezes que ela errou feio.",
  "Dizem que o ca\xE7ador novo poupa filhote de qualquer animal. Alguns acham isso nobre. Outros acham que ele s\xF3 tem pontaria ruim.",
  "Ningu\xE9m sabe explicar como a mineira sente o veio acabar antes de qualquer instrumento. Alguns dizem que \xE9 sorte, n\xE3o talento.",
  "Dizem que o apicultor nunca leva picada. Um vizinho jura que j\xE1 viu ele inchado feito um sapo, m\xEAs passado.",
  "Alguns dizem que o fabricante de cordas tran\xE7a mais r\xE1pido de noite. Outros dizem que ele s\xF3 erra menos quando est\xE1 sozinho.",
  "Dizem que o fabricante de barris nunca vendeu um que vazasse. A cervejeira da vila discorda, e tem prova guardada em casa.",
  "Meu av\xF4 jurava que o lavrador reza pra chuva na mesma data todo ano. Meu pai diz que \xE9 s\xF3 coincid\xEAncia de esta\xE7\xE3o.",
  "Dizem que o barqueiro atravessa o rio de olhos fechados. Ningu\xE9m nunca teve coragem de pedir pra ele provar.",
  "Alguns dizem que o moleiro parou o pr\xF3prio moinho por um p\xE1ssaro preso na engrenagem. Outros dizem que foi s\xF3 um defeito comum.",
  "Dizem que a tecel\xE3 reproduz qualquer padr\xE3o de mem\xF3ria. Uma cliente jura que ela errou o dela, semana passada.",
  "Meu av\xF4 jurava que o tintureiro nunca repete a mesma cor duas vezes de prop\xF3sito. Outros dizem que ele simplesmente n\xE3o consegue.",
  "Dizem que o curtidor n\xE3o sente mais o pr\xF3prio cheiro. A esposa dele garante que sente, sim, e reclama todo santo dia.",
  "Alguns dizem que a sapateira reconhece o dono de um sapato s\xF3 pelo desgaste. Outros dizem que ela s\xF3 decora os clientes de tanto v\xEA-los.",
  "Dizem que o alfaiate n\xE3o usa fita m\xE9trica h\xE1 anos. Um cliente jura que a roupa dele ficou torta m\xEAs passado, sim.",
  "Meu av\xF4 jurava que a padeira acorda a vila inteira com o cheiro do p\xE3o. Minha av\xF3 dizia que era o galo, n\xE3o o p\xE3o.",
  "Dizem que o cervejeiro guarda o barril que estragou s\xF3 de lembran\xE7a. Outros dizem que ele s\xF3 n\xE3o teve coragem de jogar fora.",
  "Alguns dizem que a vinicultora guarda um barril h\xE1 doze anos esperando o ano perfeito. Outros acham que ela s\xF3 esqueceu dele l\xE1.",
  "Dizem que o queijeiro reconhece o rebanho s\xF3 pelo sabor do queijo. Um cliente garante que ele errou da \xFAltima vez.",
  "Meu av\xF4 jurava que a a\xE7ougueira n\xE3o desperdi\xE7a nada do animal. Outros dizem que ela s\xF3 \xE9 econ\xF4mica demais, e chamam de outro nome.",
  "Dizem que o carpinteiro s\xF3 errou a medida uma vez na vida. A vizinhan\xE7a discorda, e lembra de outras casas tortas.",
  "Alguns dizem que a marceneira guarda o primeiro m\xF3vel torto que fez. Outros dizem que ela s\xF3 n\xE3o teve coragem de queimar.",
  "Dizem que o vidreiro soprou, uma vez, a garrafa perfeita. Ningu\xE9m mais viu essa garrafa depois daquele dia.",
  "Meu av\xF4 jurava que a cesteira tran\xE7a de olhos fechados. Minha av\xF3 dizia que ela s\xF3 decorou o movimento de tanto repetir.",
  "Dizem que o ceramista perdeu uma fornada inteira por causa do vento. Outros dizem que ele s\xF3 errou a temperatura mesmo.",
  "Alguns dizem que o cordoalheiro testa a corda com o pr\xF3prio peso. Outros dizem que ele s\xF3 gosta de se pendurar nela sem motivo.",
  "Dizem que o estivador carregou um piano inteiro sozinho. Um colega jura que eram quatro pessoas ajudando, n\xE3o uma.",
  "Meu av\xF4 jurava que a salineira perdeu tr\xEAs tanques numa \xFAnica tempestade. Outros dizem que foi s\xF3 um tanque, exagerado com o tempo.",
  "Dizem que o carroceiro conhece atalho que nem mapa nenhum mostra. Ningu\xE9m nunca conseguiu seguir ele at\xE9 esses lugares.",
  "Alguns dizem que a ferradora nunca encontrou cavalo nervoso demais. Outros dizem que ela s\xF3 evita os mais dif\xEDceis.",
  "Dizem que a criadora de cavalos d\xE1 nome a cada potro, mesmo os vendidos r\xE1pido. Um comprador jura que ela chorou na despedida de um deles.",
  "Meu av\xF4 jurava que o tosquiador \xE9 o mais r\xE1pido do Reino. Outros dizem que ele s\xF3 tosquia mal, e por isso \xE9 r\xE1pido.",
  "Dizem que a coletora de ervas anda no escuro reconhecendo tudo pelo cheiro. Ningu\xE9m nunca a acompanhou pra confirmar.",
  // Sprint First WOW Moment (Phase I) — 2 rumores sobre as Luvas
  // Rasgadas, o equipamento inicial de todo aventureiro novo.
  "Dizem que um aventureiro novo apareceu com luvas t\xE3o rasgadas que nem os fios seguravam mais nada. Ainda assim, seguiu em frente.",
  "Contam que algu\xE9m tentou consertar as pr\xF3prias luvas rasgadas com um fio de pescar. N\xE3o funcionou. Virou piada da Taverna at\xE9 hoje.",
  // Sprint StreamRPG Identity (Phase I) — pequenas menções aos
  // símbolos do Reino, espalhadas pelo mesmo rumor do dia de sempre.
  "Dizem que o primeiro corvo estudado no Reino era um Corvo-de-Ferro que roubava moeda da Talia. Ainda rouba, segundo ela.",
  "Ningu\xE9m sabe o que tem dentro do barril da pra\xE7a. Algu\xE9m j\xE1 chutou, j\xE1 bateu, j\xE1 perguntou. O barril continua vazio, ou continua guardando segredo.",
  "Dizem que quem lava as m\xE3os na fonte da pra\xE7a sai com sorte. As Luvas Rasgadas de algu\xE9m continuaram sujas mesmo assim.",
  "Contam que a Primeira Ponte nunca precisou de reparo de verdade. Alguns acham isso um milagre. Outros acham que ningu\xE9m teve coragem de checar direito.",
  // Sprint StreamRPG Identity (Phase II) — segunda leva de símbolos.
  "Dizem que o po\xE7o da Vila do Bosque n\xE3o tem fundo mesmo. Algu\xE9m j\xE1 jogou uma pedra h\xE1 anos. Ningu\xE9m ouviu ela bater em lugar nenhum ainda.",
  "Contam que o Sino da Torre j\xE1 tocou sozinho, sem vento e sem m\xE3o nenhuma por perto. Duas vezes, dizem os mais velhos. Ningu\xE9m concorda no resto dos detalhes.",
  "Dizem que ningu\xE9m que entra na Fortaleza Sombria sai exatamente do mesmo jeito que entrou. Ningu\xE9m explica o que muda.",
  "Contam que a Quebra do Primeiro Reino come\xE7ou com uma discuss\xE3o pequena, numa mesa de taverna parecida com essa. Ningu\xE9m sabe dizer sobre o qu\xEA.",
  // Sprint Place Identity (Phase I)
  "Dizem que a \xE1rvore da pra\xE7a j\xE1 foi maior ainda, antes de um raio atingir um galho, d\xE9cadas atr\xE1s. Ainda cresce, devagar, como se n\xE3o tivesse pressa nenhuma.",
  "Contam que a Torre do Port\xE3o Norte range \xE0 noite, mesmo sem vento nenhum. Os guardas mais antigos dizem que sempre foi assim, desde que se lembram.",
  // Sprint Cross References & Narrative Cohesion (Phase I)
  "Um pastor da Plan\xEDcie Dourada jura que a Coluna Partida j\xE1 foi cercada de pedras, faz muito tempo. Ningu\xE9m mais viu essas pedras, nem os filhos dele.",
  "Um velho das Colinas \xC1ridas jura ter visto o muro inteiro em volta do Port\xE3o, d\xE9cadas atr\xE1s. Ningu\xE9m da idade dele lembra do mesmo jeito."
];
var TAVERN_CONVERSATIONS = [
  ["Aquele lobo parecia menor quando eu contei a hist\xF3ria.", "Foi o lobo que ficou maior."],
  [
    "Quem foi o maluco que enfrentou um Boss usando Luvas Rasgadas?",
    "Ele venceu.",
    "Mentira.",
    "As luvas perderam."
  ],
  ["Voc\xEA viu o tamanho daquela aranha nas Minas Abandonadas?", "Vi o tamanho da sua cara quando ela pulou."],
  ["Eu n\xE3o corri.", "Voc\xEA derrubou a mesa correndo.", "Foi estrat\xE9gia.", "Estrat\xE9gia de correr."],
  ["Troquei minha espada por uma faca de cozinha.", "E funcionou?", "Melhor que a espada, sinceramente."],
  ["Algu\xE9m viu meu escudo?", "Vi ele virar prato ontem \xE0 noite.", "Isso explica o cheiro de sopa."],
  ["Dormi na Plan\xEDcie Dourada e sonhei que era rei.", "De qu\xEA?", "Da plan\xEDcie.", "Isso j\xE1 \xE9 seu mesmo."],
  ["O Guarda me deixou passar sem perguntar nada.", "Ele te reconheceu.", "Ou desistiu de perguntar."],
  ["Encontrei uma moeda estranha no Litoral Quebrado.", "Gasta ela?", "N\xE3o sei de onde \xE9.", "Gasta assim mesmo."],
  ["Tr\xEAs dias no Bosque Sussurrante e s\xF3 ouvi passarinho.", "Passarinho grande?", "N\xE3o sei, eu corri."],
  ["Meu personagem subiu de n\xEDvel ontem.", "Sentiu diferen\xE7a?", "Sim.", "Qual?", "Fome."],
  ["Vi um sujeito treinando sozinho na Arena de madrugada.", "Kade?", "De novo."],
  [
    "Perdi uma aposta e agora devo uma rodada pro grupo inteiro.",
    "Aposta de qu\xEA?",
    "Se o lobo era grande ou gigante.",
    "E era?",
    "Gigante. Eu sabia."
  ],
  [
    "Achei um chap\xE9u chique na trilha.",
    "Onde?",
    "Numa trilha que n\xE3o leva a lugar nenhum.",
    "E voc\xEA seguiu ela mesmo assim?",
    "O chap\xE9u era bonito."
  ],
  ["Ouvi dizer que tem gente estudando os lobos.", "Pra qu\xEA?", "Pra entender por que fogem de mim.", "Talvez seja o cheiro."],
  ["Voltei da Fortaleza Sombria inteiro.", "S\xF3 inteiro?", "E com menos coragem que antes."],
  ["Aposto que aquele Boss nem viu a gente chegando.", "Viu, sim.", "Como voc\xEA sabe?", "Porque ele riu."],
  ["Minha armadura range toda vez que eu ando.", "Isso \xE9 normal?", "N\xE3o sei, mas assusta os lobos."],
  ["Achei estranho o po\xE7o n\xE3o ter fundo.", "Voc\xEA jogou uma pedra?", "Joguei tr\xEAs.", "E?", "Ainda n\xE3o ouvi nenhuma."],
  ["Aquele Boss quase me pegou.", "Quase n\xE3o conta.", "Conta pra mim."],
  ["Vou tentar de novo amanh\xE3.", "Tentar o qu\xEA?", "N\xE3o sei, mas vou tentar."],
  ["Algu\xE9m trocou meu elmo por um chap\xE9u de festa.", "Foi voc\xEA mesmo, ontem, b\xEAbado.", "Isso explica muita coisa."],
  ["O ferreiro cobrou caro dessa vez.", "Ele sempre cobra caro.", "Dessa vez foi mais caro que caro."],
  ["Voc\xEA acredita em Grandes Feras?", "Acredito em conta grande de taverna.", "Isso \xE9 mais assustador."],
  ["Vi uma sombra enorme no Deserto de Vidro.", "Era o qu\xEA?", "Minha pr\xF3pria sombra.", "Ah."],
  ["Fiquei sabendo que algu\xE9m desafiou o Mestre da Arena.", "E?", "Ainda estamos esperando not\xEDcias."],
  ["Troquei de regi\xE3o tr\xEAs vezes hoje.", "Por qu\xEA?", "Procurando algu\xE9m que n\xE3o fugisse de mim."],
  ["Aquele item que eu achei era m\xE1gico?", "Era uma pedra.", "Uma pedra especial?", "Uma pedra."],
  [
    "Ouvi um barulho estranho vindo do P\xE2ntano Podre.",
    "Foi voc\xEA que fez.",
    "Como voc\xEA sabe?",
    "Porque s\xF3 voc\xEA reclama de barulho estranho toda noite."
  ],
  ["Achei que ia ser f\xE1cil.", "Nada nesse Reino \xE9 f\xE1cil.", "Devia ter uma placa avisando isso na entrada."]
];
var TAVERN_WALL_NOTES = [
  "Perdi uma panela.",
  "Se encontrar um chap\xE9u, ele provavelmente \xE9 meu.",
  "Procura-se algu\xE9m que saiba cozinhar.",
  "N\xC3O alimentar os patos.",
  "Vendo botas quase novas. Uma delas fura um pouco.",
  "Compro hist\xF3rias de viagem. Pago em p\xE3o.",
  "Se voc\xEA pegou minha corda emprestada, devolva. Se n\xE3o pegou, ainda assim procure uma corda.",
  "Aula de escrita aos domingos. Tragam a pr\xF3pria pena.",
  "Achado: um anel. Achado: outro anel. Achado: sim, os dois eram meus.",
  "Algu\xE9m sabe consertar um rel\xF3gio? Um espec\xEDfico, na torre.",
  "Ofere\xE7o abrigo por uma noite em troca de uma boa hist\xF3ria.",
  "N\xE3o deixem a porta dos fundos aberta. Os gansos entram.",
  "Vendo espada. Nunca usada. Comprada por engano.",
  "Se voc\xEA \xE9 o dono da cabra, ela est\xE1 na minha horta de novo.",
  "Preciso de algu\xE9m forte para carregar barris. Sem perguntas.",
  "Perdido: senso de dire\xE7\xE3o. \xDAltima vez visto nas Colinas \xC1ridas.",
  "Troco remendos de roupa por informa\xE7\xF5es sobre o Litoral Quebrado.",
  "Aviso: o po\xE7o n\xE3o \xE9 um desejo. \xC9 s\xF3 um po\xE7o.",
  "Algu\xE9m emprestou meu machado h\xE1 dois anos. Ainda espero.",
  "Vendo mapa antigo. Provavelmente errado.",
  "Recompensa para quem encontrar meu gato. Ele n\xE3o quer ser encontrado, mas tente.",
  "Aula de dan\xE7a improvisada essa noite, quem quiser aparecer.",
  "Aviso da Guarda: n\xE3o escalar a muralha. De novo.",
  "Algu\xE9m est\xE1 deixando flores na porta da ferraria. O Ferreiro quer saber quem.",
  "Compro qualquer coisa que brilhe. N\xE3o pergunto de onde veio.",
  "Se essa carta \xE9 sua, sinto muito. Se n\xE3o \xE9, ignore.",
  "Aviso: a fonte da pra\xE7a n\xE3o serve pra lavar roupa.",
  "Algu\xE9m viu um cachorro com uma bota na boca? A bota \xE9 minha. O cachorro n\xE3o.",
  "Vendo rem\xE9dio para ressaca. Funciona \xE0s vezes.",
  "Precisa-se de testemunha. N\xE3o vou dizer para qu\xEA.",
  "Achei uma chave. N\xE3o abre nenhuma porta que eu conhe\xE7o.",
  "Aula de costura cancelada essa semana. A professora sumiu.",
  "Aviso: n\xE3o cutucar o po\xE7o com um graveto. Algu\xE9m sempre cutuca.",
  "Vendo tr\xEAs galinhas. Uma delas \xE9 especial. N\xE3o direi qual.",
  "Se algu\xE9m souber cantar bem, a Taverna est\xE1 contratando. Ou s\xF3 ouvindo.",
  "Perdido: um par de luvas rasgadas. N\xE3o que valham muito, mas eram minhas.",
  "Aviso: o sino da torre est\xE1 desafinado. Ningu\xE9m sabe desde quando.",
  "Procuro companhia para viagem. Prefiro algu\xE9m que n\xE3o fale demais.",
  "Vendo lanterna que \xE0s vezes acende sozinha. Talvez seja um defeito.",
  "Aula de esgrima b\xE1sica aos s\xE1bados. Tragam um peda\xE7o de madeira.",
  "Se voc\xEA \xE9 dono do porco que est\xE1 solto na pra\xE7a, venha busc\xE1-lo antes que ele vire jantar.",
  "Recompensa para quem contar uma hist\xF3ria que eu ainda n\xE3o ouvi.",
  "Aviso: as ma\xE7\xE3s da pra\xE7a n\xE3o s\xE3o de gra\xE7a. Algu\xE9m continua achando que s\xE3o.",
  "Vendo uma armadura. S\xF3 um pouco amassada. Tem hist\xF3ria.",
  "Preciso de algu\xE9m que saiba ler mapas velhos. Muito velhos.",
  "Achado: uma carta de amor. N\xE3o \xE9 minha, mas \xE9 bonita.",
  "Aviso: n\xE3o durma perto da lareira. Algu\xE9m sempre dorme perto da lareira.",
  "Vendo semente rara. Talvez cres\xE7a. Talvez n\xE3o. Aceito o risco quem comprar.",
  "Aula de contar hist\xF3rias aos domingos. Requisito: ter pelo menos uma.",
  "Se algu\xE9m encontrar minha coragem, devolva na Taverna."
];
var TAVERN_NIGHT_SONGS = [
  "O \xDAltimo Barril",
  "Can\xE7\xE3o da Ponte Velha",
  "O Ferreiro Apaixonado",
  "Dan\xE7a do Lobo",
  "Cerveja Antes da Gl\xF3ria",
  "A Balada do Aventureiro Cansado",
  "Tr\xEAs Moedas e um Adeus",
  "O Sino que N\xE3o Toca Certo",
  "Lamento das Colinas \xC1ridas",
  "A Garota do Litoral Quebrado",
  "Onde Foi Meu Cavalo",
  "Noite Sem Estrelas",
  "O Brinde dos Que Ficaram",
  "Can\xE7\xE3o do Po\xE7o Sem Fundo",
  "Valsa da \xDAltima Rodada",
  "O Explorador Que Nunca Voltou",
  "Cinco Copos de Coragem",
  "A Dan\xE7a da Fogueira",
  "L\xE1 Vem o Vento do Deserto de Vidro",
  "Balada do Escudo Perdido",
  "O Homem Que Cantava Sozinho",
  "Can\xE7\xE3o Para Ningu\xE9m Ouvir",
  "A \xDAltima Vela da Taverna",
  "O Grito da Fortaleza",
  "Serenata Para uma Cabra",
  "O Peso da Armadura Velha",
  "Refr\xE3o do Aventureiro B\xEAbado",
  "A Ponte Que Ningu\xE9m Atravessa",
  "Can\xE7\xE3o do Primeiro Amanhecer",
  "O Fim de Uma Longa Estrada",
  "Balada das Luvas Rasgadas",
  "A Taverna Nunca Dorme",
  "Canto Baixo Para Noites Longas",
  "O \xDAltimo Suspiro do Her\xF3i",
  "Dan\xE7a Torta do Ferreiro",
  "Melodia da Pra\xE7a Vazia",
  "A Can\xE7\xE3o Que Ningu\xE9m Termina",
  "Barril Vazio, Copo Cheio",
  "O Segredo do Bosque Sussurrante",
  "\xDAltima Can\xE7\xE3o Antes do Sil\xEAncio"
];

// apps/web/src/lib/folk.ts
var KINGDOM_PROFESSIONS = [
  { id: "lenhador", name: "Lenhador", description: "Corta e transporta madeira das bordas do Bosque Sussurrante.", routine: "Sai ao amanhecer, corta at\xE9 o meio-dia, arrasta os troncos at\xE9 o carro antes do escurecer.", difficulties: "\xC1rvores cada vez mais longe da estrada principal.", curiosity: "Reconhece a idade de uma \xE1rvore s\xF3 pelo som do machado batendo nela.", relations: "Vende o excedente ao Carvoeiro e ao Carpinteiro." },
  { id: "carvoeiro", name: "Carvoeiro", description: "Transforma madeira em carv\xE3o em fornos de terra, longe das vilas.", routine: "Vigia o forno por dias seguidos, quase sem dormir, controlando o fogo lento.", difficulties: "Fuma\xE7a constante, e o forno errado destr\xF3i semanas de trabalho.", curiosity: "Consegue dizer o tipo de madeira s\xF3 pelo cheiro da fuma\xE7a.", relations: "Depende do Lenhador e vende quase tudo ao Ferreiro." },
  { id: "pescador", name: "Pescador", description: "Pesca nos rios e no litoral, sempre antes do sol nascer.", routine: "Sai com a mar\xE9 baixa, remenda as redes \xE0 tarde, vende o excedente \xE0 noite.", difficulties: "Dias inteiros sem nada, e redes que rasgam sempre na pior hora.", curiosity: "Jura reconhecer o mesmo peixe grande h\xE1 anos, sempre escapando por pouco.", relations: "Vende ao Mercador da Capital e troca redes com o Fabricante de Cordas." },
  { id: "oleiro", name: "Oleiro", description: "Molda potes, jarros e telhas com o barro das margens dos rios.", routine: "Cava o barro pela manh\xE3, molda \xE0 tarde, queima no forno \xE0 noite.", difficulties: "Pe\xE7as que racham no forno sem aviso nenhum.", curiosity: "Consegue adivinhar o clima da semana s\xF3 pela textura do barro.", relations: "Fornece potes ao Padeiro e telhas ao Pedreiro." },
  { id: "pastor", name: "Pastor", description: "Cuida de rebanhos de ovelhas e cabras nas Colinas \xC1ridas.", routine: "Segue o rebanho o dia inteiro, buscando \xE1gua e sombra escassas.", difficulties: "Predadores nas bordas do territ\xF3rio, principalmente \xE0 noite.", curiosity: "Reconhece cada animal do rebanho pelo jeito de andar, n\xE3o pela cor.", relations: "Vende l\xE3 ao Tosquiador e couro ao Curtidor." },
  { id: "pedreiro", name: "Pedreiro", description: "Constr\xF3i e repara paredes, po\xE7os e funda\xE7\xF5es de pedra.", routine: "Corta pedra pela manh\xE3, assenta \xE0 tarde, sempre com pressa antes da chuva.", difficulties: "Pedra de m\xE1 qualidade que racha meses depois de assentada.", curiosity: "Consegue apontar, s\xF3 de olhar, qual parede da Capital \xE9 mais antiga.", relations: "Trabalha lado a lado com o Carpinteiro em toda constru\xE7\xE3o grande." },
  { id: "mensageiro", name: "Mensageiro", description: "Carrega cartas e recados entre regi\xF5es distantes do Reino.", routine: "Troca de cavalo em cada parada, dorme pouco, decora atalhos que ningu\xE9m mais usa.", difficulties: "Estradas ruins e bandidos nas regi\xF5es mais isoladas.", curiosity: "Nunca l\xEA as cartas que carrega, mas sempre adivinha se s\xE3o boas ou ruins pelo peso do lacre.", relations: "Depende do Ferrador para manter os cavalos sempre prontos." },
  { id: "ferreiro-itinerante", name: "Ferreiro Itinerante", description: "Viaja entre vilas pequenas demais para sustentar uma forja fixa.", routine: "Monta a forja port\xE1til na pra\xE7a, trabalha at\xE9 o sol se p\xF4r, desmonta tudo de novo.", difficulties: "Carregar ferramentas pesadas por estradas ruins.", curiosity: "Sabe consertar qualquer coisa de metal, menos as pr\xF3prias ferramentas.", relations: "Encaminha trabalhos maiores pro Ferreiro Borin, na Capital." },
  { id: "curandeira", name: "Curandeira", description: "Trata doen\xE7as comuns e feridas leves com ervas e rem\xE9dios caseiros.", routine: "Colhe ervas de manh\xE3 cedo, atende gente a tarde inteira, prepara rem\xE9dios \xE0 noite.", difficulties: "Ervas raras cada vez mais dif\xEDceis de encontrar perto das vilas.", curiosity: "Guarda uma receita de fam\xEDlia que se recusa a ensinar, nem sob insist\xEAncia.", relations: "Compra ingredientes da Coletora de Ervas e \xE0s vezes rivaliza com o Alquimista da Capital." },
  { id: "cacador", name: "Ca\xE7ador", description: "Ca\xE7a animais de pequeno e m\xE9dio porte pra carne, pele e osso.", routine: "Sai antes do amanhecer, segue rastros por horas, volta s\xF3 ao anoitecer.", difficulties: "Presas cada vez mais raras perto das estradas principais.", curiosity: "Consegue identificar uma criatura s\xF3 pelo tipo de rastro deixado na lama.", relations: "Vende peles ao Curtidor e depende do Fabricante de Flechas." },
  { id: "mineiro", name: "Mineiro", description: "Extrai min\xE9rio nas Minas Abandonadas e em veios menores pelo Reino.", routine: "Desce antes do sol nascer, trabalha no escuro, sobe exausto ao entardecer.", difficulties: "T\xFAneis inst\xE1veis e criaturas que se adaptaram \xE0 escurid\xE3o.", curiosity: "Sabe dizer, s\xF3 pelo som da picareta, se um veio est\xE1 prestes a acabar.", relations: "Fornece min\xE9rio ao Ferreiro e ao Serralheiro." },
  { id: "apicultor", name: "Apicultor", description: "Cria colmeias e colhe mel nas bordas da Plan\xEDcie Dourada.", routine: "Verifica as colmeias ao amanhecer, colhe mel devagar, evita mexer nelas ao meio-dia.", difficulties: "Enxames que somem sem explica\xE7\xE3o, de um ano pro outro.", curiosity: "Consegue chegar perto de qualquer colmeia sem levar uma \xFAnica ferroada.", relations: "Vende mel ao Padeiro e \xE0 Cervejeiro." },
  { id: "fabricante-de-cordas", name: "Fabricante de Cordas", description: "Tran\xE7a fibras vegetais em cordas de diversos usos.", routine: "Tran\xE7a horas seguidas, sentado, quase sem parar at\xE9 completar um rolo inteiro.", difficulties: "Fibra de qualidade cada vez mais cara de conseguir.", curiosity: "Reconhece a origem de qualquer corda s\xF3 pelo jeito da tran\xE7a.", relations: "Fornece ao Barqueiro, ao Pescador e ao Cordoalheiro Naval." },
  { id: "fabricante-de-barris", name: "Fabricante de Barris", description: "Monta barris de madeira pra transporte e armazenamento.", routine: "Corta as aduelas de manh\xE3, monta e ajusta os aros \xE0 tarde inteira.", difficulties: "Madeira mal curada que empena e estraga o barril inteiro.", curiosity: "Consegue saber, s\xF3 de bater na madeira, se ela vai vazar.", relations: "Vende ao Vinicultor, ao Cervejeiro e ao Moleiro." },
  { id: "lavrador", name: "Lavrador", description: "Planta e colhe gr\xE3os nos campos da Plan\xEDcie Dourada.", routine: "Ara a terra ao amanhecer, planta ou colhe conforme a esta\xE7\xE3o, cuida da irriga\xE7\xE3o \xE0 tarde.", difficulties: "Anos de seca que arru\xEDnam a colheita inteira.", curiosity: "Sabe prever a colheita do ano s\xF3 pelo cheiro da terra depois da primeira chuva.", relations: "Vende gr\xE3os ao Moleiro e depende do Poceiro pra irriga\xE7\xE3o." },
  { id: "barqueiro", name: "Barqueiro", description: "Transporta pessoas e cargas pelos rios e pelo litoral.", routine: "Rema desde cedo, espera passageiros nos pontos de embarque, ajusta a rota pela mar\xE9.", difficulties: "Correntezas imprevis\xEDveis e barcos que envelhecem r\xE1pido demais.", curiosity: "Consegue atravessar qualquer trecho de olhos fechados, de tanto que j\xE1 fez o percurso.", relations: "Compra cordas do Fabricante de Cordas e troca not\xEDcias com o Pescador." },
  { id: "moleiro", name: "Moleiro", description: "M\xF3i gr\xE3os em moinhos de \xE1gua ou vento pra fazer farinha.", routine: "Ajusta as pedras do moinho de manh\xE3, m\xF3i o dia inteiro, ensaca a farinha ao fim da tarde.", difficulties: "Moinho parado em dias sem vento ou sem \xE1gua suficiente.", curiosity: "Consegue dizer a qualidade da farinha s\xF3 pelo som que ela faz caindo no saco.", relations: "Compra gr\xE3os do Lavrador e vende farinha ao Padeiro." },
  { id: "tecela", name: "Tecel\xE3", description: "Tece l\xE3 e linho em panos pra roupas e mantas.", routine: "Fia pela manh\xE3, tece no tear a tarde inteira, ajusta os padr\xF5es conforme a encomenda.", difficulties: "Fios que arrebentam no meio de um padr\xE3o complicado.", curiosity: "Reconhece a origem da l\xE3 s\xF3 pelo peso do fio na m\xE3o.", relations: "Compra l\xE3 do Pastor e do Tosquiador, vende ao Alfaiate." },
  { id: "tintureiro", name: "Tintureiro", description: "Tinge panos e fios usando plantas, ra\xEDzes e minerais.", routine: "Prepara os banhos de tinta de madrugada, tinge durante o dia, seca os panos ao sol.", difficulties: "Cores que nunca saem exatamente iguais de um lote pro outro.", curiosity: "Consegue reconhecer qualquer tingimento malfeito s\xF3 pela textura do pano.", relations: "Trabalha direto com a Tecel\xE3 e o Curtidor." },
  { id: "curtidor", name: "Curtidor", description: "Transforma peles em couro atrav\xE9s de curtimento longo e malcheiroso.", routine: "Trabalha longe do centro da vila, por causa do cheiro, revirando as peles em tanques.", difficulties: "O cheiro forte afasta at\xE9 quem mais precisa do trabalho dele.", curiosity: "J\xE1 se acostumou tanto ao cheiro que nem percebe mais.", relations: "Compra peles do Ca\xE7ador e do Pastor, vende ao Sapateiro." },
  { id: "sapateiro", name: "Sapateiro", description: "Fabrica e conserta botas, sapatos e sand\xE1lias.", routine: "Corta o couro de manh\xE3, costura a tarde inteira, conserta encomendas urgentes \xE0 noite.", difficulties: "Clientes que s\xF3 aparecem quando o sapato j\xE1 est\xE1 destru\xEDdo demais.", curiosity: "Consegue adivinhar a profiss\xE3o de algu\xE9m s\xF3 de olhar o desgaste da sola.", relations: "Compra couro do Curtidor e atende quase todo o Reino." },
  { id: "alfaiate", name: "Alfaiate", description: "Costura roupas sob medida pra quem pode pagar um pouco mais.", routine: "Tira medidas de manh\xE3, corta e costura a tarde inteira, prova as roupas ao fim do dia.", difficulties: "Pano de qualidade cada vez mais raro e caro.", curiosity: "Consegue adivinhar o humor de um cliente s\xF3 pela postura na hora da prova.", relations: "Compra pano da Tecel\xE3 e do Tintureiro." },
  { id: "padeiro", name: "Padeiro", description: "Assa p\xE3es, bolos e tortas pra vender na pra\xE7a da vila.", routine: "Acende o forno de madrugada, assa at\xE9 o meio-dia, vende o resto at\xE9 esfriar.", difficulties: "Forno que aquece de menos em dias de vento forte.", curiosity: "Sabe o ponto exato da massa s\xF3 pelo som que ela faz ao bater na mesa.", relations: "Compra farinha do Moleiro e mel do Apicultor." },
  { id: "cervejeiro", name: "Cervejeiro", description: "Produz cerveja em pequenos lotes pra tabernas da regi\xE3o.", routine: "Prepara o malte de manh\xE3, ferve e fermenta por dias, engarrafa quando d\xE1 o ponto.", difficulties: "Lotes que azedam sem explica\xE7\xE3o, do nada.", curiosity: "Consegue reconhecer a receita de outro cervejeiro s\xF3 pelo cheiro do barril.", relations: "Vende direto pra Greta, na Taverna da Capital." },
  { id: "vinicultor", name: "Vinicultor", description: "Cultiva parreiras e produz vinho nas encostas mais amenas do Reino.", routine: "Poda as parreiras na esta\xE7\xE3o certa, colhe as uvas, prensa e deixa fermentar por meses.", difficulties: "Geadas fora de \xE9poca que destroem a colheita inteira.", curiosity: "Guarda um barril de um ano ruim s\xF3 pra lembrar como n\xE3o repetir o erro.", relations: "Vende barris cheios pro Mercador e compra barris vazios do Fabricante de Barris." },
  { id: "queijeiro", name: "Queijeiro", description: "Produz queijos com o leite do rebanho local.", routine: "Ordenha de madrugada, coalha o leite pela manh\xE3, cura os queijos por semanas.", difficulties: "Queijos que estragam se a cura n\xE3o for vigiada de perto.", curiosity: "Consegue identificar de qual rebanho veio o leite s\xF3 pelo sabor.", relations: "Compra leite do Pastor e vende pro Mercador da Capital." },
  { id: "acougueiro", name: "A\xE7ougueiro", description: "Abate e prepara carne pra venda na vila.", routine: "Trabalha de madrugada, antes do calor do dia estragar a carne.", difficulties: "Conservar a carne em dias quentes, sem gelo nem sal suficiente.", curiosity: "Consegue aproveitar cada parte do animal, sem desperdi\xE7ar quase nada.", relations: "Compra do Pastor e do Lavrador, vende pro Mercador." },
  { id: "carpinteiro", name: "Carpinteiro", description: "Constr\xF3i e repara estruturas de madeira, de casas a carro\xE7as.", routine: "Mede e corta de manh\xE3, monta a tarde inteira, revisa o trabalho antes de ir embora.", difficulties: "Madeira empenada que s\xF3 aparece depois de j\xE1 estar montada.", curiosity: "Reconhece o trabalho de outro carpinteiro s\xF3 pela forma do corte.", relations: "Compra madeira do Lenhador e trabalha lado a lado com o Pedreiro." },
  { id: "marceneiro", name: "Marceneiro", description: "Fabrica m\xF3veis e objetos de madeira mais refinados.", routine: "Escolhe a madeira com cuidado, entalha devagar, aplica acabamento por \xFAltimo.", difficulties: "Encomendas que exigem madeiras raras demais pra regi\xE3o.", curiosity: "Consegue reconhecer a idade de um m\xF3vel s\xF3 pelo cheiro da madeira envelhecida.", relations: "Compra madeira selecionada do Lenhador e disputa clientes com o Carpinteiro." },
  { id: "vidreiro", name: "Vidreiro", description: "Sopra e molda vidro pra garrafas, janelas e ornamentos.", routine: "Aquece o forno de madrugada, sopra o vidro ainda quente, resfria as pe\xE7as devagar.", difficulties: "Pe\xE7as que racham no resfriamento, sem aviso.", curiosity: "Consegue soprar uma garrafa perfeita de olhos fechados, s\xF3 pelo peso do vidro na vara.", relations: "Vende garrafas ao Vinicultor e ao Cervejeiro." },
  { id: "cesteiro", name: "Cesteiro", description: "Tran\xE7a vime e palha em cestos de todos os tamanhos.", routine: "Colhe o vime fresco de manh\xE3, tran\xE7a a tarde inteira, deixa secar ao sol.", difficulties: "Vime que quebra se colhido na esta\xE7\xE3o errada.", curiosity: "Consegue tran\xE7ar um cesto inteiro sem olhar, s\xF3 pelo h\xE1bito das m\xE3os.", relations: "Vende ao Lavrador e ao Pescador, pra carregar a colheita e o peixe." },
  { id: "ceramista-de-telhas", name: "Ceramista de Telhas", description: "Fabrica telhas de barro cozido pra cobertura de casas.", routine: "Molda as telhas em f\xF4rmas de madeira, seca ao sol, queima em fornos grandes.", difficulties: "Fornadas inteiras perdidas se a temperatura n\xE3o for constante.", curiosity: "Consegue saber quantas telhas uma casa vai precisar s\xF3 de olhar o telhado de longe.", relations: "Trabalha perto do Oleiro e vende direto ao Pedreiro." },
  { id: "cordoalheiro-naval", name: "Cordoalheiro Naval", description: "Fabrica cordame grosso e resistente pra embarca\xE7\xF5es maiores.", routine: "Tran\xE7a fibras mais grossas que o comum, testa a resist\xEAncia puxando com o corpo inteiro.", difficulties: "Cordame que precisa aguentar peso e \xE1gua salgada ao mesmo tempo.", curiosity: "Consegue calcular a resist\xEAncia de uma corda s\xF3 pela grossura da tran\xE7a.", relations: "Fornece ao Barqueiro e aos pescadores do Litoral Quebrado." },
  { id: "estivador", name: "Estivador", description: "Carrega e descarrega mercadorias nos pontos de embarque do Reino.", routine: "Trabalha em turnos pesados, sempre que um barco ou carro\xE7a chega.", difficulties: "Cargas pesadas demais e jornadas que n\xE3o t\xEAm hora certa pra acabar.", curiosity: "Consegue estimar o peso de uma carga s\xF3 de erguer uma ponta dela.", relations: "Trabalha direto com o Barqueiro e o Carroceiro." },
  { id: "salineiro", name: "Salineiro", description: "Extrai e processa sal nas \xE1reas rasas do Litoral Quebrado.", routine: "Alaga os tanques com \xE1gua do mar, espera evaporar, colhe o sal cristalizado.", difficulties: "Chuva fora de \xE9poca que arru\xEDna tanques inteiros de evapora\xE7\xE3o.", curiosity: "Consegue diferenciar a qualidade do sal s\xF3 pelo brilho dos cristais.", relations: "Vende ao A\xE7ougueiro e ao Queijeiro, pra conserva\xE7\xE3o." },
  { id: "carroceiro", name: "Carroceiro", description: "Transporta mercadorias por terra entre vilas e a Capital.", routine: "Carrega a carro\xE7a de madrugada, viaja o dia inteiro, descarrega ao chegar.", difficulties: "Estradas ruins que quebram rodas e eixos com frequ\xEAncia.", curiosity: "Conhece todos os atalhos entre regi\xF5es, mesmo os que n\xE3o aparecem em mapa nenhum.", relations: "Depende do Ferrador pros cavalos e do Estivador pras cargas grandes." },
  { id: "ferrador", name: "Ferrador", description: "Coloca e troca ferraduras em cavalos de toda a regi\xE3o.", routine: "Examina os cascos, molda a ferradura ainda quente, encaixa com precis\xE3o.", difficulties: "Cavalos nervosos que tornam o trabalho perigoso.", curiosity: "Consegue saber a idade de um cavalo s\xF3 pelo desgaste do casco.", relations: "Atende o Mensageiro, o Carroceiro e o Guia de Caravana." },
  { id: "criador-de-cavalos", name: "Criador de Cavalos", description: "Cria e adestra cavalos pra transporte e viagem.", routine: "Treina os potros desde cedo, cuida da alimenta\xE7\xE3o e do exerc\xEDcio di\xE1rio.", difficulties: "Doen\xE7as que se espalham r\xE1pido entre os animais confinados.", curiosity: "Consegue reconhecer o temperamento de um cavalo s\xF3 de olhar pra ele parado.", relations: "Vende ao Mensageiro, ao Carroceiro e ao Guia de Caravana." },
  { id: "tosquiador", name: "Tosquiador", description: "Tosquia ovelhas pra produ\xE7\xE3o de l\xE3.", routine: "Tosquia dezenas de animais por dia, na \xE9poca certa do ano.", difficulties: "Machucar o animal por descuido, o que ningu\xE9m quer fazer.", curiosity: "Consegue tosquiar uma ovelha inteira em menos tempo do que leva pra contar a hist\xF3ria.", relations: "Trabalha direto com o Pastor e vende a l\xE3 \xE0 Tecel\xE3." },
  { id: "coletora-de-ervas", name: "Coletora de Ervas", description: "Colhe ervas medicinais e comest\xEDveis nas bordas das florestas.", routine: "Sai de madrugada, quando o orvalho ainda preserva as ervas mais delicadas.", difficulties: "Plantas raras cada vez mais escondidas, longe das trilhas conhecidas.", curiosity: "Consegue reconhecer uma erva s\xF3 pelo cheiro, mesmo no escuro.", relations: "Vende pra Curandeira e, \xE0s vezes, pro Alquimista da Capital." },
  { id: "parteira", name: "Parteira", description: "Acompanha partos e cuidados com rec\xE9m-nascidos pelas vilas.", routine: "Fica de prontid\xE3o o tempo todo, sem hor\xE1rio fixo nenhum.", difficulties: "Partos dif\xEDceis, longe de qualquer ajuda adicional.", curiosity: "Consegue prever, quase sempre certo, o dia exato de um parto.", relations: "Trabalha ao lado da Curandeira em qualquer emerg\xEAncia." },
  { id: "coveiro", name: "Coveiro", description: "Cava e cuida das sepulturas do cemit\xE9rio da vila.", routine: "Cava de manh\xE3 cedo, cuida da manuten\xE7\xE3o do terreno o resto do dia.", difficulties: "Terreno rochoso que torna cada cova um trabalho exaustivo.", curiosity: "Conhece o nome de quase todo mundo enterrado ali, mesmo os mais antigos.", relations: "Trabalha perto do Sineiro, que toca o sino em cada funeral." },
  { id: "sineiro", name: "Sineiro", description: "Cuida e toca o sino da torre da vila em hor\xE1rios e ocasi\xF5es marcadas.", routine: "Sobe a torre antes do amanhecer e em cada ocasi\xE3o importante do dia.", difficulties: "O sino desafinado que ningu\xE9m nunca conserta de vez.", curiosity: "Consegue tocar um ritmo diferente pra cada tipo de aviso, sem ningu\xE9m ensinar.", relations: "Avisa o Coveiro, o Guarda-Noturno e toda a vila ao mesmo tempo." },
  { id: "guarda-noturno-da-vila", name: "Guarda-Noturno da Vila", description: "Vigia as ruas da vila durante a noite.", routine: "Faz a ronda em intervalos, atento a qualquer luz ou som fora do comum.", difficulties: "Noites longas e o cansa\xE7o que se acumula, dia ap\xF3s dia.", curiosity: "Conhece o som de cada porta da vila rangendo, e percebe na hora quando um som \xE9 novo.", relations: "Troca informa\xE7\xF5es com o Vigia de Torre e com o Guarda Roth, na Capital." },
  { id: "vigia-de-torre", name: "Vigia de Torre", description: "Observa o horizonte em busca de perigos, de uma torre ou ponto alto.", routine: "Passa o turno inteiro olhando pro mesmo horizonte, atento a qualquer mudan\xE7a.", difficulties: "Longos per\xEDodos sem nada acontecer, que testam a aten\xE7\xE3o de qualquer um.", curiosity: "Consegue notar uma mudan\xE7a m\xEDnima na paisagem antes de qualquer outra pessoa.", relations: "Avisa o Guarda-Noturno e o Sineiro ao primeiro sinal de perigo." },
  { id: "catador-de-cogumelos", name: "Catador de Cogumelos", description: "Colhe cogumelos comest\xEDveis nas florestas e p\xE2ntanos do Reino.", routine: "Percorre as mesmas trilhas todo dia, sempre no mesmo hor\xE1rio, quando os cogumelos aparecem.", difficulties: "Diferenciar cogumelos comest\xEDveis de venenosos, um erro que n\xE3o perdoa.", curiosity: "Consegue identificar uma esp\xE9cie rara s\xF3 pela cor por baixo do chap\xE9u.", relations: "Vende pro Padeiro e, \xE0s vezes, pra Curandeira." },
  { id: "fabricante-de-velas", name: "Fabricante de Velas", description: "Produz velas de sebo e cera pra ilumina\xE7\xE3o das casas.", routine: "Derrete o sebo ou a cera, mergulha os pavios v\xE1rias vezes at\xE9 engrossar.", difficulties: "Velas que derretem r\xE1pido demais em dias quentes.", curiosity: "Consegue calcular quanto tempo uma vela vai durar s\xF3 pelo peso na m\xE3o.", relations: "Compra cera do Apicultor e sebo do A\xE7ougueiro." },
  { id: "fundidor-de-sebo", name: "Fundidor de Sebo", description: "Prepara sebo animal pra sab\xE3o, velas e outros usos dom\xE9sticos.", routine: "Ferve o sebo em grandes panelas, coa e deixa endurecer em blocos.", difficulties: "O cheiro forte do processo, parecido com o do Curtidor.", curiosity: "Consegue dizer, s\xF3 pelo cheiro, se o sebo vai render um bom sab\xE3o.", relations: "Compra do A\xE7ougueiro e vende ao Fabricante de Velas." },
  { id: "serralheiro", name: "Serralheiro", description: "Fabrica fechaduras, dobradi\xE7as e ferragens pra portas e janelas.", routine: "Trabalha com pe\xE7as pequenas, exigindo precis\xE3o maior que a de um ferreiro comum.", difficulties: "Encomendas urgentes de fechaduras quebradas, sempre na pior hora.", curiosity: "Consegue abrir quase qualquer fechadura simples s\xF3 ouvindo o mecanismo.", relations: "Compra metal do Mineiro e trabalha ao lado do Ferreiro." },
  { id: "latoeiro", name: "Latoeiro", description: "Trabalha com folhas de metal fino pra fazer potes, canos e utens\xEDlios.", routine: "Corta e dobra as folhas de metal, solda as bordas com cuidado.", difficulties: "Vazamentos que s\xF3 aparecem depois que a pe\xE7a j\xE1 foi entregue.", curiosity: "Consegue consertar um vazamento s\xF3 de bater de leve na pe\xE7a e ouvir o som.", relations: "Vende pros moradores em geral e compra metal do Mineiro." },
  { id: "fabricante-de-flechas", name: "Fabricante de Flechas", description: "Produz flechas com hastes de madeira, penas e pontas de metal.", routine: "Corta e alisa as hastes, encaixa as penas, afia as pontas por \xFAltimo.", difficulties: "Hastes que empenam se a madeira n\xE3o for perfeitamente seca.", curiosity: "Consegue saber se uma flecha vai voar reto s\xF3 de gir\xE1-la entre os dedos.", relations: "Vende ao Ca\xE7ador e, \xE0s vezes, \xE0 Arqueira de Feira." },
  { id: "arqueira-de-feira", name: "Arqueira de Feira", description: "Faz demonstra\xE7\xF5es de tiro ao alvo nas feiras e festivais do Reino.", routine: "Monta a banca de manh\xE3, atrai p\xFAblico a tarde inteira com truques de mira.", difficulties: "Concorr\xEAncia de outros artistas de feira, disputando a mesma aten\xE7\xE3o.", curiosity: "Consegue acertar um alvo de olhos vendados, s\xF3 de ouvir onde ele est\xE1.", relations: "Compra flechas do Fabricante de Flechas e divide pra\xE7a com o Palha\xE7o de Feira." },
  { id: "palhaco-de-feira", name: "Palha\xE7o de Feira", description: "Faz apresenta\xE7\xF5es c\xF4micas nas feiras e festivais das vilas.", routine: "Viaja de feira em feira, ensaiando novos n\xFAmeros entre uma apresenta\xE7\xE3o e outra.", difficulties: "Plateias dif\xEDceis de agradar, principalmente em dias ruins.", curiosity: "Consegue fazer rir at\xE9 quem chegou de mau humor, sem falhar quase nunca.", relations: "Divide pra\xE7a com a Arqueira de Feira e o Contador de Hist\xF3rias Ambulante." },
  { id: "contador-de-historias-ambulante", name: "Contador de Hist\xF3rias Ambulante", description: "Viaja contando hist\xF3rias e boatos recolhidos pelo caminho.", routine: "Chega numa vila, recolhe rumores novos, conta os antigos em troca de pousada.", difficulties: "Hist\xF3rias que j\xE1 foram contadas demais e perderam a gra\xE7a.", curiosity: "Nunca conta a mesma hist\xF3ria do mesmo jeito duas vezes seguidas.", relations: "Troca rumores com o Mensageiro e divide pra\xE7a com o Palha\xE7o de Feira." },
  { id: "afinador-de-instrumentos", name: "Afinador de Instrumentos", description: "Conserta e afina instrumentos musicais pelas vilas do Reino.", routine: "Viaja com um pequeno kit de ferramentas, afinando o que aparecer pela frente.", difficulties: "Instrumentos t\xE3o velhos que quase n\xE3o vale mais a pena consertar.", curiosity: "Consegue afinar um instrumento s\xF3 de ouvido, sem nenhuma ferramenta.", relations: "Trabalha perto da Taverna de Greta, onde a m\xFAsica nunca falta." },
  { id: "jardineiro-da-capital", name: "Jardineiro da Capital", description: "Cuida das poucas \xE1reas verdes p\xFAblicas dentro da Capital.", routine: "Rega e poda pela manh\xE3, antes do movimento da cidade come\xE7ar.", difficulties: "Solo pobre demais dentro dos muros da Capital.", curiosity: "Consegue fazer florescer plantas que ningu\xE9m mais consegue manter vivas ali.", relations: "Troca mudas com o Lavrador e conversa com o Varredor de Ruas todo dia." },
  { id: "varredor-de-ruas", name: "Varredor de Ruas", description: "Limpa as ruas e pra\xE7as da Capital todos os dias.", routine: "Varre ao amanhecer, antes do movimento come\xE7ar de verdade.", difficulties: "Sujeira que volta assim que ele termina de limpar um trecho.", curiosity: "Sabe, s\xF3 pelo tipo de sujeira, o que aconteceu na pra\xE7a no dia anterior.", relations: "Conversa com o Jardineiro da Capital todos os dias, cedo." },
  { id: "poceiro", name: "Poceiro", description: "Cava e mant\xE9m po\xE7os de \xE1gua pelas vilas do Reino.", routine: "Cava fundo, revestindo as paredes do po\xE7o com pedra pra n\xE3o desabar.", difficulties: "Encontrar \xE1gua em solo seco, principalmente nas Colinas \xC1ridas.", curiosity: "Consegue prever onde vai encontrar \xE1gua s\xF3 de observar o tipo de vegeta\xE7\xE3o ao redor.", relations: "Trabalha perto do Pedreiro e fornece \xE1gua ao Lavrador." },
  { id: "carteiro-de-aldeia", name: "Carteiro de Aldeia", description: "Entrega cartas e recados dentro de uma \xFAnica vila ou regi\xE3o pequena.", routine: "Percorre a mesma rota todo dia, conhecendo cada morador pelo nome.", difficulties: "Cartas endere\xE7adas de forma confusa, ou moradores que mudaram de casa sem avisar.", curiosity: "Consegue entregar uma carta certa mesmo com o endere\xE7o quase ileg\xEDvel.", relations: "Recebe cartas de longa dist\xE2ncia do Mensageiro e as distribui na regi\xE3o." },
  { id: "guia-de-caravana", name: "Guia de Caravana", description: "Conduz grupos e mercadorias em viagens mais longas entre regi\xF5es.", routine: "Planeja a rota antes de sair, ajusta o ritmo conforme o grupo e o clima.", difficulties: "Grupos desorganizados e rotas que mudam por causa do tempo ou de perigos novos.", curiosity: "Conhece o Reino inteiro de cor, sem nunca precisar de um mapa.", relations: "Depende do Ferrador e do Criador de Cavalos pra manter a caravana em movimento." }
];

// apps/web/src/lib/museum.ts
var MUSEUM_CATEGORIES = [
  { slug: "grandes-herois", label: "Grandes Her\xF3is", icon: "\u{1F9B8}" },
  { slug: "grandes-bosses", label: "Grandes Bosses", icon: "\u{1F432}" },
  { slug: "grandes-descobertas", label: "Grandes Descobertas", icon: "\u{1F50E}" },
  { slug: "reliquias-historicas", label: "Rel\xEDquias Hist\xF3ricas", icon: "\u{1F3FA}" },
  { slug: "primeiros-aventureiros", label: "Primeiros Aventureiros", icon: "\u{1F947}" },
  { slug: "fundacao-do-reino", label: "Funda\xE7\xE3o do Reino", icon: "\u{1F3F0}" },
  { slug: "grandes-tragedias", label: "Grandes Trag\xE9dias", icon: "\u{1F56F}\uFE0F" },
  { slug: "grandes-conquistas", label: "Grandes Conquistas", icon: "\u{1F3C6}" },
  { slug: "monumentos", label: "Monumentos", icon: "\u{1F5FF}" },
  { slug: "misterios", label: "Mist\xE9rios", icon: "\u{1F52E}" }
];
var MUSEUM_STATUS_LABEL = {
  bloqueado: "\u{1F512} Bloqueado",
  conhecido: "\u{1F4D8} Conhecido",
  registrado: "\u2705 Registrado"
};
var PLACEHOLDER_PAGES3 = [
  "**Este registro ainda est\xE1 sendo compilado.**\n\nO Curador continua reunindo relatos e evid\xEAncias antes de fechar a exposi\xE7\xE3o.",
  "*Registro em desenvolvimento...*\n\nVolte ao Museu em outra ocasi\xE3o.",
  "**Fim do registro conhecido.**\n\nO restante desta hist\xF3ria ainda n\xE3o foi documentado."
];
var MUSEUM_ENTRIES = [
  {
    id: "a-fundacao-do-reino",
    title: "A Funda\xE7\xE3o do Reino",
    category: "fundacao-do-reino",
    description: "Registro em desenvolvimento.",
    pages: PLACEHOLDER_PAGES3,
    status: "registrado",
    locked: false,
    unlockCondition: "Dispon\xEDvel desde o in\xEDcio",
    icon: "\u{1F3F0}",
    year: "Ano 1 do Reino",
    author: "Curador Alaric"
  },
  {
    id: "o-primeiro-boss",
    title: "O Primeiro Boss",
    category: "grandes-bosses",
    description: "Registro em desenvolvimento.",
    pages: PLACEHOLDER_PAGES3,
    status: "conhecido",
    locked: false,
    unlockCondition: "Dispon\xEDvel desde o in\xEDcio",
    icon: "\u{1F432}",
    year: "Ano 3 do Reino",
    author: "Curador Alaric"
  },
  {
    id: "a-ponte-antiga",
    title: "A Ponte Antiga",
    category: "monumentos",
    description: "Registro em desenvolvimento.",
    pages: PLACEHOLDER_PAGES3,
    status: "conhecido",
    locked: false,
    unlockCondition: "Dispon\xEDvel desde o in\xEDcio",
    icon: "\u{1F5FF}",
    year: "Desconhecido",
    author: "Curador Alaric"
  },
  {
    id: "o-grande-incendio",
    title: "O Grande Inc\xEAndio",
    category: "grandes-tragedias",
    description: "Registro em desenvolvimento.",
    pages: PLACEHOLDER_PAGES3,
    status: "bloqueado",
    locked: true,
    unlockCondition: "Desconhecida",
    icon: "\u{1F56F}\uFE0F",
    year: "Desconhecido",
    author: "Curador Alaric"
  },
  {
    id: "o-explorador-desconhecido",
    title: "O Explorador Desconhecido",
    category: "primeiros-aventureiros",
    description: "Registro em desenvolvimento.",
    pages: PLACEHOLDER_PAGES3,
    status: "bloqueado",
    locked: true,
    unlockCondition: "Desconhecida",
    icon: "\u{1F947}",
    year: "Desconhecido",
    author: "Curador Alaric"
  },
  // ============================================================
  // Sprint History of the Kingdom (Phase I) — 40 acontecimentos
  // históricos + 10 monumentos, todos com páginas reais (não
  // PLACEHOLDER_PAGES). Nenhuma resposta definitiva: fontes discordam
  // de propósito, mesma regra usada em history.ts.
  // ============================================================
  // ---- Fundação do Reino (8) ----
  { id: "fundacao-da-capital", title: "Funda\xE7\xE3o da Capital", category: "fundacao-do-reino", description: "O marco mais citado \u2014 e mais discutido \u2014 da hist\xF3ria do Reino.", pages: ["Toda crian\xE7a da Capital aprende uma data de funda\xE7\xE3o. O problema \xE9 que nenhum historiador concorda em qual data \xE9 essa. Os registros mais antigos encontrados j\xE1 tratam a Capital como algo estabelecido, nunca como algo rec\xE9m-criado."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F3F0}", year: "Disputado", author: "Curador Alaric" },
  { id: "primeira-coroacao", title: "Primeira Coroa\xE7\xE3o", category: "fundacao-do-reino", description: "O primeiro registro de uma coroa\xE7\xE3o formal no Reino.", pages: ["Sabemos que aconteceu. N\xE3o sabemos, com certeza, quem foi coroado primeiro \u2014 dois nomes aparecem em fontes diferentes, e nenhuma das duas fontes menciona a outra pessoa."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F451}", year: "Era do Primeiro Reino", author: "Curador Alaric" },
  { id: "primeiro-codigo-de-leis", title: "Assinatura do Primeiro C\xF3digo de Leis", category: "fundacao-do-reino", description: "O documento que formalizou as primeiras leis escritas do Reino.", pages: ["Atribu\xEDdo ao 'Juiz Sem Nome'. Fragmentos do c\xF3digo original ainda existem, mas boa parte foi reescrita tantas vezes que j\xE1 n\xE3o sabemos quanto resta do texto original."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F4DC}", year: "Era do Primeiro Reino", author: "Curador Alaric" },
  { id: "fundacao-da-guilda", title: "Funda\xE7\xE3o da Guilda dos Aventureiros", category: "fundacao-do-reino", description: "O in\xEDcio formal da organiza\xE7\xE3o que hoje Elenya lidera.", pages: ["Creditada a Dorel. Alguns registros sugerem que Garrick \u2014 apontado depois como o primeiro Guildmaster \u2014 era, na verdade, a mesma pessoa que Dorel, s\xF3 com outro nome adotado depois."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F5E1}\uFE0F", year: "Era da Reunifica\xE7\xE3o", author: "Curador Alaric" },
  { id: "construcao-da-primeira-muralha", title: "Constru\xE7\xE3o da Primeira Muralha", category: "fundacao-do-reino", description: "A primeira estrutura defensiva erguida ao redor do que viria a ser a Capital.", pages: ["Simples, de pedra empilhada, sem argamassa. Durou o suficiente pra proteger a vila que cresceu atr\xE1s dela \u2014 mas nenhum registro explica por que foi derrubada e reconstru\xEDda s\xF3 uma gera\xE7\xE3o depois."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F9F1}", year: "Era da Primeira Funda\xE7\xE3o", author: "Curador Alaric" },
  { id: "reunificacao-dos-territorios", title: "Reunifica\xE7\xE3o dos Territ\xF3rios", category: "fundacao-do-reino", description: "O momento em que os territ\xF3rios divididos voltaram a ter uma coroa comum.", pages: ["Creditada \xE0 Rainha Meira. Historiadores discordam se ela negociou a reunifica\xE7\xE3o pessoalmente ou apenas assinou um acordo que outros j\xE1 tinham costurado nos bastidores."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F91D}", year: "Era da Reunifica\xE7\xE3o", author: "Curador Alaric" },
  { id: "primeira-moeda-do-reino", title: "Cria\xE7\xE3o da Primeira Moeda do Reino", category: "fundacao-do-reino", description: "A cunhagem oficial da primeira moeda reconhecida pelo Primeiro Reino.", pages: ["O nome do respons\xE1vel muda de registro pra registro \u2014 'Contador da Primeira Moeda' \xE9 o \xFAnico t\xEDtulo que se repete em todos eles, sem exce\xE7\xE3o."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1FA99}", year: "Era do Primeiro Reino", author: "Curador Alaric" },
  { id: "estabelecimento-das-fronteiras-atuais", title: "Estabelecimento das Fronteiras Atuais", category: "fundacao-do-reino", description: "A defini\xE7\xE3o das divisas entre as regi\xF5es que conhecemos hoje.", pages: ["Nenhum tratado \xFAnico define essas fronteiras \u2014 elas se consolidaram devagar, ao longo de gera\xE7\xF5es, e ningu\xE9m consegue apontar o momento exato em que pararam de mudar."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F5FA}\uFE0F", year: "Era da Reunifica\xE7\xE3o", author: "Curador Alaric" },
  // ---- Grandes Tragédias (8) ----
  { id: "grande-incendio", title: "Grande Inc\xEAndio", category: "grandes-tragedias", description: "Um dos maiores inc\xEAndios j\xE1 registrados dentro da Capital.", pages: ["Destruiu um bairro inteiro numa \xFAnica noite. A causa nunca foi determinada \u2014 um relato culpa uma forja, outro culpa um raio, e um terceiro n\xE3o culpa nada, s\xF3 descreve o fogo."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F525}", year: "Disputado", author: "Curador Alaric" },
  { id: "quebra-do-primeiro-reino", title: "Quebra do Primeiro Reino", category: "grandes-tragedias", description: "O colapso que encerrou o Primeiro Reino e deu in\xEDcio \xE0 Era da Quebra.", pages: ["O evento mais discutido por historiadores da Capital. Guerra, sucess\xE3o contestada, fome \u2014 cada fonte aponta uma causa diferente, e nenhuma delas cita as outras duas possibilidades."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F494}", year: "Era da Quebra", author: "Curador Alaric" },
  { id: "inverno-longo", title: "Inverno Longo", category: "grandes-tragedias", description: "Um \xFAnico inverno que, segundo relatos, durou mais de um ano inteiro.", pages: ["Colheitas perdidas, fome generalizada, decis\xF5es impopulares da Rainha do Inverno. At\xE9 hoje, lavradores e moleiros guardam excedente por causa do que aconteceu nessa \xE9poca."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u2744\uFE0F", year: "Era do Inverno Longo", author: "Curador Alaric" },
  { id: "peste-das-colinas", title: "A Peste das Colinas", category: "grandes-tragedias", description: "Uma doen\xE7a que se espalhou rapidamente pelas Colinas \xC1ridas.", pages: ["Contida, segundo a lenda, por uma \xFAnica curandeira. Outros historiadores sugerem que a peste simplesmente perdeu for\xE7a sozinha, sem nenhuma interven\xE7\xE3o decisiva."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F56F}\uFE0F", year: "Disputado", author: "Curador Alaric" },
  { id: "desabamento-das-minas-antigas", title: "O Desabamento das Minas Antigas", category: "grandes-tragedias", description: "Um colapso que fechou parte das galerias hoje conhecidas como Minas Abandonadas.", pages: ["Di\xE1rios de mineiros da \xE9poca mencionam um som estranho nos dias anteriores. Ningu\xE9m confirmou se o som e o desabamento est\xE3o de fato relacionados."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u26CF\uFE0F", year: "Desconhecido", author: "Curador Alaric" },
  { id: "seca-de-sete-anos", title: "A Seca de Sete Anos", category: "grandes-tragedias", description: "Um longo per\xEDodo de estiagem que afetou a Plan\xEDcie Dourada.", pages: ["Encerrada, segundo a lenda, quando o Poceiro Real encontrou uma fonte que salvou a Capital. Nenhum outro poceiro depois conseguiu repetir o m\xE9todo dele."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F3DC}\uFE0F", year: "Desconhecido", author: "Curador Alaric" },
  { id: "naufragio-da-frota-do-litoral", title: "O Naufr\xE1gio da Frota do Litoral", category: "grandes-tragedias", description: "A perda de boa parte da frota pesqueira do Litoral Quebrado numa \xFAnica tempestade.", pages: ["A reconstru\xE7\xE3o das comunidades afetadas foi liderada por algu\xE9m lembrado s\xF3 como 'a Vi\xFAva do Litoral' \u2014 seu nome verdadeiro nunca foi registrado."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F30A}", year: "Desconhecido", author: "Curador Alaric" },
  { id: "noite-da-muralha-caida", title: "A Noite da Muralha Ca\xEDda", category: "grandes-tragedias", description: "O colapso repentino de uma muralha que se acreditava s\xF3lida.", pages: ["O nome do arquiteto respons\xE1vel pela muralha foi apagado dos registros logo depois \u2014 alguns dizem que de prop\xF3sito, outros dizem que foi s\xF3 o tempo que apagou."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F9F1}", year: "Desconhecido", author: "Curador Alaric" },
  // ---- Grandes Conquistas (8) ----
  { id: "primeira-ponte", title: "Primeira Ponte", category: "grandes-conquistas", description: "A primeira grande ponte de pedra constru\xEDda no territ\xF3rio do Reino.", pages: ["Projetada por Ilda, a Construtora \u2014 ou por v\xE1rios engenheiros lembrados sob um \xFAnico nome, segundo alguns historiadores. A ponte segue de p\xE9 at\xE9 hoje."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F309}", year: "Era das Grandes Constru\xE7\xF5es", author: "Curador Alaric" },
  { id: "torre-do-portao-norte", title: "Constru\xE7\xE3o da Torre do Port\xE3o Norte", category: "grandes-conquistas", description: "A torre que hoje o Guarda Roth vigia, erguida na Era das Grandes Constru\xE7\xF5es.", pages: ["O arquiteto respons\xE1vel cometeu um erro de c\xE1lculo na funda\xE7\xE3o, corrigido \xE0s pressas segundo o pr\xF3prio di\xE1rio dele. A torre nunca apresentou problema depois disso."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F5FC}", year: "Era das Grandes Constru\xE7\xF5es", author: "Curador Alaric" },
  { id: "abertura-da-estrada-dos-picos", title: "Abertura da Estrada dos Picos", category: "grandes-conquistas", description: "A primeira rota segura estabelecida pelos Picos Congelados.", pages: ["Creditada a Elowen, a Exploradora. Uma vers\xE3o diz que ela morreu na expedi\xE7\xE3o. Outra diz que voltou e viveu em sil\xEAncio at\xE9 o fim da vida, sem nunca mais falar sobre a viagem."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F3D4}\uFE0F", year: "Desconhecido", author: "Curador Alaric" },
  { id: "fundacao-da-biblioteca-real", title: "Funda\xE7\xE3o da Biblioteca Real", category: "grandes-conquistas", description: "A reuni\xE3o dos primeiros livros do Reino sob um \xFAnico teto.", pages: ["Creditada a Bertrand. Parte do acervo original, segundo alguns registros, veio de outras regi\xF5es \u2014 sem que ficasse claro se foi doado ou simplesmente levado."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F4DA}", year: "Era da Reunifica\xE7\xE3o", author: "Curador Alaric" },
  { id: "primeiro-moinho-de-vento", title: "Constru\xE7\xE3o do Primeiro Moinho de Vento", category: "grandes-conquistas", description: "O primeiro moinho movido a vento erguido no Reino.", pages: ["Substituiu boa parte da moagem manual da \xE9poca. Nenhum registro guarda o nome de quem o projetou \u2014 s\xF3 a data aproximada em que passou a funcionar."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F4A8}", year: "Era das Grandes Constru\xE7\xF5es", author: "Curador Alaric" },
  { id: "domesticacao-dos-cavalos-das-planicies", title: "Domestica\xE7\xE3o dos Cavalos das Plan\xEDcies", category: "grandes-conquistas", description: "O in\xEDcio da cria\xE7\xE3o formal de cavalos na Plan\xEDcie Dourada.", pages: ["Transformou o transporte no Reino inteiro, dos mensageiros \xE0s caravanas. Nenhuma fonte concorda sobre quem domesticou o primeiro cavalo, s\xF3 que aconteceu ali."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F40E}", year: "Desconhecido", author: "Curador Alaric" },
  { id: "sistema-de-pocos-publicos", title: "Cria\xE7\xE3o do Sistema de Po\xE7os P\xFAblicos", category: "grandes-conquistas", description: "A padroniza\xE7\xE3o de po\xE7os de \xE1gua nas vilas do Reino.", pages: ["Inspirada, segundo a lenda, no trabalho do Poceiro Real durante a Seca de Sete Anos. Nenhum outro poceiro depois conseguiu repetir a mesma taxa de sucesso dele."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1FAA3}", year: "Desconhecido", author: "Curador Alaric" },
  { id: "pacificacao-das-fronteiras-do-sul", title: "Pacifica\xE7\xE3o das Fronteiras do Sul", category: "grandes-conquistas", description: "O fim de d\xE9cadas de disputas territoriais nas regi\xF5es ao sul do Reino.", pages: ["Um tratado assinado sem nenhuma batalha decisiva registrada \u2014 o que leva alguns historiadores a duvidar se havia, de fato, uma guerra pra terminar."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F54A}\uFE0F", year: "Era da Reunifica\xE7\xE3o", author: "Curador Alaric" },
  // ---- Grandes Descobertas (8) ----
  { id: "grande-migracao", title: "Grande Migra\xE7\xE3o", category: "grandes-descobertas", description: "O deslocamento de povos inteiros entre regi\xF5es do Reino.", pages: ["O motivo nunca foi totalmente esclarecido \u2014 fome, guerra, ou algo que nenhum registro da \xE9poca quis detalhar. Vilas inteiras hoje descendem dessa migra\xE7\xE3o."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F9ED}", year: "Era da Grande Migra\xE7\xE3o", author: "Curador Alaric" },
  { id: "descoberta-das-minas-abandonadas", title: "Descoberta das Minas Abandonadas", category: "grandes-descobertas", description: "O primeiro registro de explora\xE7\xE3o das galerias hoje conhecidas como Minas Abandonadas.", pages: ["Encontradas j\xE1 parcialmente escavadas por algu\xE9m \u2014 ou algo \u2014 que nenhum registro identifica. Os primeiros mineiros s\xF3 continuaram um trabalho que j\xE1 estava l\xE1."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u26CF\uFE0F", year: "Desconhecido", author: "Curador Alaric" },
  { id: "primeiro-registro-do-deserto-de-vidro", title: "Primeiro Registro do Deserto de Vidro", category: "grandes-descobertas", description: "A primeira men\xE7\xE3o escrita ao Deserto de Vidro.", pages: ["O relato original descreve areia que 'brilha como se fosse l\xEDquida'. Nenhuma expedi\xE7\xE3o posterior conseguiu confirmar ou negar essa descri\xE7\xE3o por completo."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F537}", year: "Desconhecido", author: "Curador Alaric" },
  { id: "mapeamento-do-litoral-quebrado", title: "Mapeamento do Litoral Quebrado", category: "grandes-descobertas", description: "O primeiro mapa confi\xE1vel da costa do Litoral Quebrado.", pages: ["Atribu\xEDdo a Berna, a Cart\xF3grafa. O mapa original nunca foi encontrado \u2014 s\xF3 c\xF3pias, e nenhuma delas concorda exatamente sobre o formato de uma certa enseada."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F5FA}\uFE0F", year: "Era das Grandes Constru\xE7\xF5es", author: "Curador Alaric" },
  { id: "descoberta-da-passagem-dos-picos", title: "Descoberta da Passagem dos Picos Congelados", category: "grandes-descobertas", description: "A rota que hoje permite atravessar os Picos Congelados com seguran\xE7a.", pages: ["Aberta por Elowen, a Exploradora. Nenhum relato posterior confirma se ela sobreviveu \xE0 pr\xF3pria expedi\xE7\xE3o ou n\xE3o."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F3D4}\uFE0F", year: "Desconhecido", author: "Curador Alaric" },
  { id: "primeiro-contato-com-o-bosque-sussurrante", title: "Primeiro Contato com o Bosque Sussurrante", category: "grandes-descobertas", description: "O primeiro registro de explora\xE7\xE3o formal do Bosque Sussurrante.", pages: ["Descreve 'sons que pareciam sussurros, vindos de lugar nenhum'. Nenhuma expedi\xE7\xE3o depois conseguiu explicar completamente essa observa\xE7\xE3o."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F332}", year: "Desconhecido", author: "Curador Alaric" },
  { id: "achado-dos-primeiros-fragmentos-das-ruinas", title: "Achado dos Primeiros Fragmentos das Ru\xEDnas", category: "grandes-descobertas", description: "A primeira men\xE7\xE3o formal \xE0s Ru\xEDnas Antigas espalhadas pelo Reino.", pages: ["O relato original j\xE1 as descrevia como 'antigas demais para pertencer a qualquer povo conhecido' \u2014 e nenhum estudo posterior mudou essa conclus\xE3o."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F3DB}\uFE0F", year: "Desconhecido", author: "Curador Alaric" },
  { id: "expedicao-a-fortaleza-sombria", title: "Expedi\xE7\xE3o \xE0 Fortaleza Sombria", category: "grandes-descobertas", description: "A primeira expedi\xE7\xE3o documentada \xE0 Fortaleza Sombria.", pages: ["Dois escribas participaram e registraram vers\xF5es diferentes do que encontraram l\xE1 dentro. Nenhuma das duas vers\xF5es cita a outra."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F3F0}", year: "Desconhecido", author: "Curador Alaric" },
  // ---- Mistérios (8) ----
  { id: "desaparecimento-da-segunda-coroa", title: "O Desaparecimento da Segunda Coroa", category: "misterios", description: "O sumi\xE7o de uma segunda coroa cuja exist\xEAncia poucos confirmam.", pages: ["A \xFAltima testemunha morreu antes de dar qualquer detalhe a mais. Muitos historiadores duvidam que essa segunda coroa tenha existido de fato."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F451}", year: "Desconhecido", author: "Registros contradit\xF3rios da Biblioteca" },
  { id: "silencio-de-um-ano-inteiro", title: "O Sil\xEAncio de um Ano Inteiro", category: "misterios", description: "Um per\xEDodo de um ano sem nenhum registro hist\xF3rico datado.", pages: ["Nenhum documento da \xE9poca menciona esse ano. Alguns acreditam que os registros foram perdidos. Outros acreditam que, de prop\xF3sito, ningu\xE9m escreveu nada."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F52E}", year: "Desconhecido", author: "Registros contradit\xF3rios da Biblioteca" },
  { id: "vila-que-sumiu-do-mapa", title: "A Vila que Sumiu do Mapa", category: "misterios", description: "Uma vila mencionada em registros antigos que n\xE3o aparece em nenhum mapa atual.", pages: ["Alguns dizem que foi abandonada durante a Grande Migra\xE7\xE3o. Outros dizem que nunca existiu, e o nome \xE9 um erro de c\xF3pia repetido por s\xE9culos."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F5FA}\uFE0F", year: "Desconhecido", author: "Registros contradit\xF3rios da Biblioteca" },
  { id: "registro-perdido-do-primeiro-rei", title: "O Registro Perdido do Primeiro Rei", category: "misterios", description: "A aus\xEAncia de qualquer registro confi\xE1vel sobre o primeiro rei do Primeiro Reino.", pages: ["Sabemos que existiu uma coroa\xE7\xE3o. N\xE3o sabemos o nome de quem foi coroado \u2014 cada fonte apresenta um nome diferente, sem nenhuma prova decisiva."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F451}", year: "Era do Primeiro Reino", author: "Registros contradit\xF3rios da Biblioteca" },
  { id: "fundacao-nunca-confirmada-da-fortaleza", title: "A Funda\xE7\xE3o Nunca Confirmada de Fortaleza Sombria", category: "misterios", description: "A aus\xEAncia total de registros sobre quem construiu a Fortaleza Sombria.", pages: ["Nenhuma fonte assume autoria da constru\xE7\xE3o. Dois escribas que a exploraram discordam at\xE9 sobre h\xE1 quanto tempo ela existe."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F3F0}", year: "Desconhecido", author: "Registros contradit\xF3rios da Biblioteca" },
  { id: "enigma-da-contagem-de-anos", title: "O Enigma da Contagem de Anos", category: "misterios", description: "Uma discrep\xE2ncia nunca resolvida na contagem oficial de anos do Reino.", pages: ["Comparando registros de diferentes regi\xF5es, a contagem de anos n\xE3o bate \u2014 uma diferen\xE7a de quase uma d\xE9cada que ningu\xE9m conseguiu explicar ou corrigir."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F52E}", year: "Desconhecido", author: "Registros contradit\xF3rios da Biblioteca" },
  { id: "segunda-fundacao-disputada", title: "A Segunda Funda\xE7\xE3o (Disputada)", category: "misterios", description: "A hip\xF3tese de que a Capital foi fundada duas vezes, em locais diferentes.", pages: ["Alguns historiadores acreditam que a Capital atual n\xE3o \xE9 a mesma da Era da Primeira Funda\xE7\xE3o, mas uma segunda constru\xEDda sobre os restos da primeira. A maioria discorda."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F3F0}", year: "Desconhecido", author: "Registros contradit\xF3rios da Biblioteca" },
  { id: "livro-queimado-da-primeira-biblioteca", title: "O Livro Queimado da Primeira Biblioteca", category: "misterios", description: "Um \xFAnico livro que sobreviveu parcialmente a um inc\xEAndio na Biblioteca original.", pages: ["As p\xE1ginas que restaram n\xE3o formam uma hist\xF3ria completa. Miriam guarda o fragmento at\xE9 hoje, mas se recusa a especular sobre o que faltava."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F525}", year: "Desconhecido", author: "Registros contradit\xF3rios da Biblioteca" },
  // ---- Monumentos (10) ----
  { id: "monumento-arco-da-primeira-fundacao", title: "Arco da Primeira Funda\xE7\xE3o", category: "monumentos", description: "Um arco de pedra erguido pra marcar, supostamente, o local da primeira funda\xE7\xE3o.", pages: ["Constru\xEDdo s\xE9culos depois do evento que celebra \u2014 o que faz alguns historiadores duvidarem se o local marcado \xE9 sequer o correto."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F5FF}", year: "Era da Reunifica\xE7\xE3o", author: "Curador Alaric" },
  { id: "monumento-coluna-dos-nomes", title: "Coluna dos Nomes", category: "monumentos", description: "Uma coluna gravada com nomes de figuras hist\xF3ricas do Reino.", pages: ["V\xE1rios nomes gravados nela n\xE3o aparecem em nenhum outro registro conhecido. Ningu\xE9m sabe dizer quem foram, ou por que mereceram lugar na coluna."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F5FF}", year: "Desconhecido", author: "Curador Alaric" },
  { id: "monumento-estatua-da-rainha-meira", title: "Est\xE1tua da Rainha Meira", category: "monumentos", description: "Uma est\xE1tua erguida em homenagem \xE0 Unificadora.", pages: ["O rosto esculpido n\xE3o bate com nenhuma descri\xE7\xE3o escrita dela \u2014 o que levanta d\xFAvida sobre se a est\xE1tua realmente a representa, ou representa outra pessoa esquecida."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F5FF}", year: "Era da Reunifica\xE7\xE3o", author: "Curador Alaric" },
  { id: "monumento-marco-da-primeira-ponte", title: "Marco da Primeira Ponte", category: "monumentos", description: "Uma placa fixada na base da Primeira Ponte, em homenagem \xE0 constru\xE7\xE3o.", pages: ["Credita a obra a Ilda, a Construtora \u2014 mas o texto foi adicionado d\xE9cadas depois da ponte estar pronta, sem fonte prim\xE1ria que confirme a autoria."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F5FF}", year: "Era das Grandes Constru\xE7\xF5es", author: "Curador Alaric" },
  { id: "monumento-obelisco-do-inverno-longo", title: "Obelisco do Inverno Longo", category: "monumentos", description: "Um obelisco erguido em mem\xF3ria aos que n\xE3o sobreviveram ao Inverno Longo.", pages: ["N\xE3o tem nenhum nome gravado \u2014 uma escolha deliberada, segundo registros da \xE9poca, pra representar a todos sem distin\xE7\xE3o."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F5FF}", year: "Era do Inverno Longo", author: "Curador Alaric" },
  { id: "monumento-portico-da-guilda", title: "P\xF3rtico da Guilda", category: "monumentos", description: "A entrada monumental da sede original da Guilda dos Aventureiros.", pages: ["Tem duas datas de funda\xE7\xE3o gravadas, uma sobre a outra, como se uma tivesse sido corrigida sem apagar a anterior por completo."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F5FF}", year: "Era da Reunifica\xE7\xE3o", author: "Curador Alaric" },
  { id: "monumento-pedra-da-quebra", title: "Pedra da Quebra", category: "monumentos", description: "Um bloco de pedra erguido no local onde, segundo a tradi\xE7\xE3o, o Primeiro Reino se dissolveu oficialmente.", pages: ["Nenhum documento da \xE9poca confirma que o evento aconteceu exatamente ali. A pedra marca uma tradi\xE7\xE3o, n\xE3o um fato comprovado."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F5FF}", year: "Era da Quebra", author: "Curador Alaric" },
  { id: "monumento-farol-da-viuva", title: "Farol da Vi\xFAva do Litoral", category: "monumentos", description: "Um farol erguido em homenagem \xE0 reconstru\xE7\xE3o ap\xF3s o Naufr\xE1gio da Frota.", pages: ["Batizado em honra a algu\xE9m cujo nome verdadeiro nunca foi registrado \u2014 s\xF3 o t\xEDtulo pelo qual ficou conhecida."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F5FF}", year: "Desconhecido", author: "Curador Alaric" },
  { id: "monumento-portal-dos-migrantes", title: "Portal dos Migrantes", category: "monumentos", description: "Um portal de pedra erguido em mem\xF3ria \xE0 Grande Migra\xE7\xE3o.", pages: ["Fica numa encruzilhada que, segundo alguns relatos, era o ponto de partida da migra\xE7\xE3o. Outros dizem que o verdadeiro ponto de partida ficava em outra regi\xE3o inteiramente."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F5FF}", year: "Era da Grande Migra\xE7\xE3o", author: "Curador Alaric" },
  { id: "monumento-sino-da-primeira-torre", title: "Sino da Primeira Torre", category: "monumentos", description: "O sino original da primeira torre de vigia erguida no Reino, hoje exposto no Museu.", pages: ["Ainda funciona, segundo Alaric, mas ele se recusa a toc\xE1-lo \u2014 diz que prefere n\xE3o descobrir se ainda significa o mesmo aviso de s\xE9culos atr\xE1s."], status: "conhecido", locked: false, unlockCondition: "Dispon\xEDvel desde o in\xEDcio", icon: "\u{1F5FF}", year: "Era da Primeira Funda\xE7\xE3o", author: "Curador Alaric" }
];

// apps/web/src/lib/memories.ts
var GREAT_TRAGEDIES = [
  { id: "cidade-perdida-do-vale-cinza", name: "A Cidade Perdida do Vale Cinza", description: "Um povoado inteiro desapareceu numa \xFAnica esta\xE7\xE3o, sem motivo confirmado. Hoje, ru\xEDnas dispersas marcam onde ficava." },
  { id: "queda-da-ponte-dos-emigrantes", name: "A Queda da Ponte dos Emigrantes", description: "Uma ponte desabou durante uma travessia em massa, na Era da Grande Migra\xE7\xE3o, levando dezenas de fam\xEDlias." },
  { id: "seca-das-tres-colheitas", name: "A Seca das Tr\xEAs Colheitas", description: "Tr\xEAs anos seguidos de colheita perdida na Plan\xEDcie Dourada, d\xE9cadas depois do Inverno Longo." },
  { id: "inverno-das-portas-fechadas", name: "O Inverno das Portas Fechadas", description: "Vilas inteiras se isolaram umas das outras por meses, com medo de uma doen\xE7a que nunca foi totalmente identificada." },
  { id: "incendio-da-feira-de-outono", name: "O Inc\xEAndio da Feira de Outono", description: "Destruiu uma feira inteira e a colheita armazenada de dezenas de fam\xEDlias, na mesma noite." },
  { id: "naufragio-do-barco-das-criancas", name: "O Naufr\xE1gio do Barco das Crian\xE7as", description: "Um barco de pescadores levando crian\xE7as a um festival se perdeu numa tempestade repentina no Litoral Quebrado." },
  { id: "praga-dos-graos-negros", name: "A Praga dos Gr\xE3os Negros", description: "Uma doen\xE7a nos gr\xE3os arruinou planta\xE7\xF5es por duas esta\xE7\xF5es seguidas, espalhando-se antes que algu\xE9m entendesse a causa." },
  { id: "desmoronamento-vila-das-colinas", name: "O Desmoronamento da Vila das Colinas", description: "Um deslizamento soterrou parte de uma vila inteira nas Colinas \xC1ridas, numa \xFAnica madrugada." },
  { id: "fome-do-cerco-silencioso", name: "A Fome do Cerco Silencioso", description: "Estradas ficaram intransit\xE1veis por semanas, isolando a Capital do resto do Reino sem nenhum inimigo envolvido." },
  { id: "afogamento-travessia-de-inverno", name: "O Afogamento da Travessia de Inverno", description: "Um grupo de viajantes tentou atravessar um rio congelado e n\xE3o resistiu ao gelo que cedeu no meio do caminho." },
  { id: "epidemia-da-agua-parada", name: "A Epidemia da \xC1gua Parada", description: "Doen\xE7a espalhada por \xE1gua contaminada num ver\xE3o excepcionalmente quente, atingindo v\xE1rias vilas ao mesmo tempo." },
  { id: "colapso-da-mina-funda", name: "O Colapso da Mina Funda", description: "Um desabamento isolou dezenas de mineiros por dias antes que o resgate conseguisse alcan\xE7\xE1-los." },
  { id: "tempestade-que-levou-o-cais", name: "A Tempestade que Levou o Cais", description: "Destruiu o principal cais de pesca do Litoral Quebrado, nunca reconstru\xEDdo exatamente do mesmo jeito." },
  { id: "ano-sem-primavera", name: "O Ano Sem Primavera", description: "Uma esta\xE7\xE3o inteira em que a primavera simplesmente n\xE3o chegou no tempo esperado, atrasando plantios por meses." },
  { id: "massacre-silencioso-das-colmeias", name: "O Massacre Silencioso das Colmeias", description: "Todas as colmeias de uma regi\xE3o morreram na mesma semana, sem explica\xE7\xE3o encontrada at\xE9 hoje." },
  { id: "fuga-da-vila-queimada", name: "A Fuga da Vila Queimada", description: "Moradores tiveram que abandonar a pr\xF3pria vila depois de um inc\xEAndio que consumiu quase tudo em poucas horas." },
  { id: "naufragio-da-ultima-travessia", name: "O Naufr\xE1gio da \xDAltima Travessia", description: "A \xFAltima expedi\xE7\xE3o a tentar atravessar o Litoral Quebrado antes do mapeamento oficial nunca foi encontrada." },
  { id: "peste-dos-animais", name: "A Peste dos Animais", description: "Doen\xE7a que dizimou rebanhos inteiros, afetando pastores e curtidores da regi\xE3o por anos seguidos." },
  { id: "desabamento-teto-biblioteca-antiga", name: "O Desabamento do Teto da Biblioteca Antiga", description: "Destruiu parte do acervo original antes mesmo da funda\xE7\xE3o da Biblioteca Real que conhecemos hoje." },
  { id: "noite-rio-mudou-de-curso", name: "A Noite em que o Rio Mudou de Curso", description: "Um evento que redesenhou parte da geografia pr\xF3xima ao Porto do Amanhecer, deixando fam\xEDlias inteiras sem suas terras." }
];
var GREAT_VICTORIES = [
  { id: "defesa-do-portao-norte", name: "A Defesa do Port\xE3o Norte", description: "Repeliu um ataque que amea\xE7ava alcan\xE7ar a Capital.", cost: "Custou a vida de metade da guarni\xE7\xE3o que defendia o posto naquela noite." },
  { id: "reconstrucao-apos-grande-incendio", name: "A Reconstru\xE7\xE3o Ap\xF3s o Grande Inc\xEAndio", description: "Reergueu o bairro destru\xEDdo em tempo recorde.", cost: "\xC0 custa de anos de d\xEDvida coletiva que s\xF3 terminou de ser paga h\xE1 pouco tempo." },
  { id: "travessia-dos-picos-congelados", name: "A Travessia dos Picos Congelados", description: "Abriu a rota que hoje conecta o Reino aos Picos.", cost: "S\xF3 um ter\xE7o da expedi\xE7\xE3o original sobreviveu para ver a rota conclu\xEDda." },
  { id: "fim-da-seca-de-sete-anos", name: "O Fim da Seca de Sete Anos", description: "Encontrar \xE1gua salvou a Capital de uma crise ainda maior.", cost: "Duas vilas menores j\xE1 tinham sido abandonadas antes que a solu\xE7\xE3o chegasse." },
  { id: "reunificacao-dos-territorios-vitoria", name: "A Reunifica\xE7\xE3o dos Territ\xF3rios", description: "Uniu o Reino sob uma coroa comum novamente.", cost: "Exigiu concess\xF5es territoriais que ainda geram disputa entre regi\xF5es hoje." },
  { id: "contencao-peste-das-colinas-vitoria", name: "A Conten\xE7\xE3o da Peste das Colinas", description: "Parou a doen\xE7a antes que se espalhasse pelo resto do Reino.", cost: "N\xE3o antes de dizimar boa parte de uma \xFAnica gera\xE7\xE3o naquela regi\xE3o." },
  { id: "vitoria-ponte-reconstruida", name: "A Vit\xF3ria da Ponte Reconstru\xEDda", description: "Reergueu a Primeira Ponte ap\xF3s anos de travessia perigosa.", cost: "Um trabalhador foi perdido durante a pr\xF3pria obra de reconstru\xE7\xE3o." },
  { id: "resgate-dos-mineiros-soterrados", name: "O Resgate dos Mineiros Soterrados", description: "Todos os mineiros presos no Colapso da Mina Funda foram salvos.", cost: "O resgate consumiu recursos que atrasaram outras obras do Reino por anos." },
  { id: "pacificacao-fronteiras-do-sul-vitoria", name: "A Pacifica\xE7\xE3o das Fronteiras do Sul", description: "Encerrou d\xE9cadas de disputa territorial sem mais um confronto.", cost: "Nenhum dos lados saiu do tratado plenamente satisfeito." },
  { id: "expedicao-que-voltou-fortaleza-sombria", name: "A Expedi\xE7\xE3o que Voltou da Fortaleza Sombria", description: "Trouxe os primeiros registros confi\xE1veis sobre o local.", cost: "Metade do grupo nunca mais quis falar sobre o que viu l\xE1 dentro." },
  { id: "reconstrucao-muralha-caida-vitoria", name: "A Reconstru\xE7\xE3o da Muralha Ca\xEDda", description: "Ergueu uma muralha mais forte que a anterior.", cost: "O arquiteto respons\xE1vel pela original nunca teve o nome restaurado nos registros." },
  { id: "salvamento-da-frota-do-litoral", name: "O Salvamento da Frota do Litoral", description: "Parte da frota foi salva ap\xF3s o Naufr\xE1gio da Frota do Litoral.", cost: "Gra\xE7as a pescadores que arriscaram a pr\xF3pria vida nas piores condi\xE7\xF5es." },
  { id: "vitoria-primeira-colheita-pos-praga", name: "A Vit\xF3ria da Primeira Colheita Depois da Praga", description: "Celebrada com festa por toda a Plan\xEDcie Dourada.", cost: "Ainda assim, menor que qualquer colheita registrada antes da doen\xE7a." },
  { id: "abertura-estrada-dos-picos-vitoria", name: "A Abertura da Estrada dos Picos", description: "Conectou o Reino aos Picos Congelados de forma permanente.", cost: "Ao custo de vidas que, at\xE9 hoje, ningu\xE9m contabilizou por completo." },
  { id: "contencao-incendio-feira-outono", name: "A Conten\xE7\xE3o do Inc\xEAndio da Feira de Outono", description: "Impediu que o fogo alcan\xE7asse a Capital inteira.", cost: "A feira, por\xE9m, nunca se recuperou completamente depois daquele ano." },
  { id: "reconciliacao-disputa-fronteiras-cartorio", name: "A Reconcilia\xE7\xE3o Ap\xF3s a Disputa das Fronteiras do Cart\xF3rio", description: "Duas vilas assinaram um acordo formal sobre a terra disputada.", cost: "O ressentimento entre as fam\xEDlias envolvidas nunca desapareceu de verdade." },
  { id: "fim-inverno-das-portas-fechadas", name: "O Fim do Inverno das Portas Fechadas", description: "As vilas voltaram a se comunicar normalmente.", cost: "Algumas amizades e alian\xE7as de antes nunca foram totalmente restauradas." },
  { id: "vitoria-silenciosa-pocos-publicos", name: "A Vit\xF3ria Silenciosa dos Po\xE7os P\xFAblicos", description: "Resolveu o abastecimento de \xE1gua de boa parte do Reino.", cost: "Exigiu d\xE9cadas de trabalho de poceiros cujos nomes poucos lembram hoje." },
  { id: "retomada-da-vila-queimada", name: "A Retomada da Vila Queimada", description: "Moradores reconstru\xEDram suas pr\xF3prias casas, tijolo por tijolo.", cost: "Nem todos os que fugiram durante o inc\xEAndio voltaram depois." },
  { id: "descoberta-passagem-segura-picos", name: "A Descoberta da Passagem Segura pelos Picos", description: "Creditada a Elowen, a Exploradora, abriu caminho seguro pelos Picos Congelados.", cost: "Ningu\xE9m sabe ao certo se ela sobreviveu para ver o resultado do pr\xF3prio esfor\xE7o." }
];

// apps/web/src/lib/knowledgeLinks.ts
function findMentions(text, candidates, excludeId) {
  const haystack = text.toLowerCase();
  return candidates.filter((c) => c.id !== excludeId && c.name.length > 3 && haystack.includes(c.name.toLowerCase()));
}
function findNpc(npcKey) {
  return Object.values(NPCS).find((npc) => npc.key === npcKey);
}
var ITEM_NAMES = {
  "amuleto-guardiao-ruinas": "Amuleto do Guardi\xE3o das Ru\xEDnas",
  "botas-cacador-feras": "Botas de Ca\xE7ador de Feras",
  "botas-de-pelagem-seca": "Botas de Pelagem Seca",
  "botas-forjadas-minas-abandonadas": "Botas Forjadas nas Minas Abandonadas",
  "botas-picos-congelados": "Botas dos Picos Congelados",
  "capacete-penas-corvo": "Capacete com Penas de Corvo",
  "colar-conchas": "Colar de Conchas",
  "colar-dentes-lobo": "Colar de Dentes de Lobo",
  "coleira-do-filhote-perdido": "Coleira do Filhote Perdido",
  "elmo-de-presas-de-gelo": "Elmo de Presas de Gelo",
  "elmo-guardiao-ruinas": "Elmo do Guardi\xE3o das Ru\xEDnas",
  "elmo-picos-congelados": "Elmo dos Picos Congelados",
  "espada-curva-picos-congelados": "Espada Curva dos Picos Congelados",
  "foice-deserto-vidro": "Foice do Deserto de Vidro",
  "garras-de-matilha": "Garras de Matilha",
  "lamina-forjada-minas-abandonadas": "L\xE2mina Forjada nas Minas Abandonadas",
  "lanca-fortaleza-sombria": "Lan\xE7a da Fortaleza Sombria",
  "luvas-cacador-feras": "Luvas de Ca\xE7ador de Feras",
  "luvas-deserto-vidro": "Luvas do Deserto de Vidro",
  "luvas-forjadas-minas-abandonadas": "Luvas Forjadas nas Minas Abandonadas",
  "luvas-guardiao-ruinas": "Luvas do Guardi\xE3o das Ru\xEDnas",
  "manto-da-loba-prateada": "Manto da Loba Prateada",
  "manto-de-pelagem-encharcada": "Manto de Pelagem Encharcada",
  "presa-do-alfa": "Presa do Alfa"
};
function dedupe(mentions) {
  const seen = /* @__PURE__ */ new Set();
  return mentions.filter((m) => {
    const key = `${m.label}::${m.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function getCreatureMentions(creature) {
  const c = creature.connections;
  if (!c) return [];
  const mentions = [];
  if (c.itemSlug && ITEM_NAMES[c.itemSlug]) mentions.push({ label: "Item", value: ITEM_NAMES[c.itemSlug] });
  if (c.bookId) {
    const book = BOOKS.find((b) => b.id === c.bookId);
    if (book) mentions.push({ label: "Livro", value: book.title });
  }
  if (c.travellerStoryId) {
    const story = TRAVELLER_STORIES.find((s) => s.id === c.travellerStoryId);
    if (story) mentions.push({ label: "Hist\xF3ria dos Viajantes", value: story.title });
  }
  if (c.rumor) mentions.push({ label: "Rumor da Taverna", value: c.rumor });
  if (c.npcKey) {
    const npc = findNpc(c.npcKey);
    if (npc) mentions.push({ label: "NPC", value: c.npcNote ? `${npc.name} \u2014 "${c.npcNote}"` : npc.name });
  }
  return mentions;
}
function getBookRelated(bookId) {
  const related = [];
  const creatures = CREATURES.filter((c) => c.connections?.bookId === bookId);
  for (const creature of creatures) {
    related.push({ label: "Criatura", value: creature.name });
    related.push({ label: "Regi\xE3o", value: getRegionName2(creature.regionId) });
    if (creature.connections?.npcKey) {
      const npc = findNpc(creature.connections.npcKey);
      if (npc) related.push({ label: "NPC", value: npc.name });
    }
  }
  return dedupe(related);
}
function getItemRelated(itemSlug) {
  const creature = CREATURES.find((c) => c.connections?.itemSlug === itemSlug);
  if (!creature) return [];
  const mentions = [
    { label: "Origem", value: creature.name },
    { label: "Encontrado em", value: getRegionName2(creature.regionId) }
  ];
  if (creature.connections?.npcKey) {
    const npc = findNpc(creature.connections.npcKey);
    if (npc) mentions.push({ label: "Citado por", value: npc.name });
  }
  const itemName = ITEM_NAMES[itemSlug];
  if (itemName) {
    const professionHits = KINGDOM_PROFESSIONS.filter(
      (p) => `${p.description} ${p.routine} ${p.curiosity} ${p.relations}`.toLowerCase().includes(itemName.toLowerCase())
    );
    for (const p of professionHits) mentions.push({ label: "Profiss\xE3o", value: p.name });
  }
  return mentions;
}
function getNpcSubjects(npcKey) {
  return CREATURES.filter((c) => c.connections?.npcKey === npcKey).map((c) => c.name);
}
function getRegionKnowledge(regionId) {
  return {
    stories: TRAVELLER_STORIES.filter((s) => s.regionId === regionId).map((s) => s.title),
    ruins: ANCIENT_RUIN_SITES.filter((r) => r.regionId === regionId).map((r) => r.name)
  };
}
function getBookRecommendations(bookId, limit = 3) {
  const book = BOOKS.find((b) => b.id === bookId);
  if (!book) return [];
  return BOOKS.filter((b) => b.id !== bookId && b.category === book.category).slice(0, limit);
}
var KNOWN_NAMES = [
  ...Object.values(NPCS).map((n) => ({ id: `npc:${n.key}`, name: n.name.split(",")[0].trim() })),
  ...CREATURES.map((c) => ({ id: `creature:${c.id}`, name: c.name }))
];
function getSimilarRumors(rumor, limit = 3) {
  const mentionedHere = findMentions(rumor, KNOWN_NAMES);
  if (mentionedHere.length === 0) return [];
  const mentionedIds = new Set(mentionedHere.map((m) => m.id));
  return TAVERN_RUMORS.filter((other) => {
    if (other === rumor) return false;
    return findMentions(other, KNOWN_NAMES).some((m) => mentionedIds.has(m.id));
  }).slice(0, limit);
}
function getRelatedStoriesAcrossRegions(story, limit = 3) {
  return TRAVELLER_STORIES.filter(
    (s) => s.id !== story.id && s.category === story.category && s.regionId !== story.regionId
  ).slice(0, limit);
}
var NPC_CANDIDATES = Object.values(NPCS).map((n) => ({ id: n.key, name: n.name.split(",")[0].trim() }));
function getNpcCitedPeople(npcKey) {
  const catalog = NPC_DIALOGUE[npcKey];
  if (!catalog) return [];
  const allLines = flattenDialogue(catalog).join(" ");
  return findMentions(allLines, NPC_CANDIDATES, npcKey).map((n) => n.name);
}
var PROFESSION_CANDIDATES = KINGDOM_PROFESSIONS.map((p) => ({ id: p.id, name: p.name }));
function getMonumentRelatedEvents(monumentId, limit = 3) {
  const monument = MUSEUM_ENTRIES.find((m) => m.id === monumentId);
  if (!monument) return [];
  const text = monument.pages.join(" ").toLowerCase();
  const eventNames = [...GREAT_TRAGEDIES.map((t) => t.name), ...GREAT_VICTORIES.map((v) => v.name)];
  return eventNames.filter((name) => text.includes(name.toLowerCase())).slice(0, limit);
}

// apps/web/src/lib/discoveryChains.ts
var CREATURE_MENTION_PRIORITY = ["Item", "Livro", "Hist\xF3ria dos Viajantes", "Rumor da Taverna"];
function getCreatureDiscoveryCandidates(creature) {
  const mentions = getCreatureMentions(creature);
  const candidates = [];
  for (const label of CREATURE_MENTION_PRIORITY) {
    const found = mentions.find((m) => m.label === label);
    if (!found) continue;
    switch (label) {
      case "Item":
        candidates.push(`Alguns aventureiros procuram ${found.value} depois dessa descoberta.`);
        break;
      case "Livro":
        candidates.push("Talvez valha a pena procurar mais sobre isso na Biblioteca.");
        break;
      case "Hist\xF3ria dos Viajantes":
        candidates.push("H\xE1 viajantes que contam hist\xF3rias sobre isso.");
        break;
      case "Rumor da Taverna":
        candidates.push("Rumores parecidos ainda circulam pela Taverna.");
        break;
    }
  }
  return candidates;
}
function getBookDiscoveryCandidates(bookId) {
  const related = getBookRelated(bookId);
  const candidates = [];
  for (const mention of related) {
    switch (mention.label) {
      case "Criatura":
        candidates.push(`Talvez agora fa\xE7a sentido observar ${mention.value} com mais aten\xE7\xE3o.`);
        break;
      case "Regi\xE3o":
        candidates.push(`Essa hist\xF3ria tem ra\xEDzes em ${mention.value}.`);
        break;
      case "NPC":
        candidates.push(`${mention.value} pode ter mais a dizer sobre isso.`);
        break;
    }
  }
  return candidates;
}
function getItemDiscoveryCandidates(itemSlug) {
  const related = getItemRelated(itemSlug);
  const candidates = [];
  const origin = related.find((m) => m.label === "Origem");
  if (origin) candidates.push(`Muitos associam este item a encontros com ${origin.value}.`);
  for (const mention of related.filter((m) => m.label === "Profiss\xE3o")) {
    candidates.push(`Quem exerce o of\xEDcio de ${mention.value} reconheceria uma pe\xE7a assim.`);
  }
  return candidates;
}
function getRegionDiscoveryCandidates(regionId) {
  const knowledge = getRegionKnowledge(regionId);
  const candidates = [];
  if (knowledge.stories.length > 0) candidates.push("H\xE1 quem conte hist\xF3rias sobre esta regi\xE3o na Casa dos Viajantes.");
  if (knowledge.ruins.length > 0) candidates.push("Ru\xEDnas antigas ainda esperam por quem quiser explor\xE1-las por aqui.");
  return candidates;
}
function getMuseumDiscoveryCandidates(entryId) {
  const events = getMonumentRelatedEvents(entryId);
  return events.map((event) => `"${event}" tamb\xE9m \xE9 lembrado em outros registros do Reino.`);
}

// apps/web/src/lib/knowledgeThreads.ts
function getCreatureThreadCandidates(creature) {
  return CREATURES.filter((c) => c.id !== creature.id && c.regionId === creature.regionId).map(
    (sibling) => `${sibling.name} tamb\xE9m vive nesta regi\xE3o.`
  );
}
function getRegionCreatureThreadCandidates(regionId) {
  return CREATURES.filter((c) => c.regionId === regionId).map((creature) => `${creature.name} vive apenas nesta regi\xE3o.`);
}
function getRegionSiblingRuinsThreadCandidates(regionId) {
  const hasOwnRuins = ANCIENT_RUIN_SITES.some((r) => r.regionId === regionId);
  if (!hasOwnRuins) return [];
  const otherRegionIds = [...new Set(ANCIENT_RUIN_SITES.filter((r) => r.regionId !== regionId).map((r) => r.regionId))];
  return otherRegionIds.map((id) => `${getRegionName2(id)} tamb\xE9m guarda vest\xEDgios antigos.`);
}
function getMuseumBookThreadCandidates(entry) {
  if (entry.category !== "misterios") return [];
  return BOOKS.filter((b) => b.category === "misterios").map((book) => `${book.title} tamb\xE9m trata desse tema.`);
}
function getItemNpcThreadCandidates(itemSlug) {
  return getItemRelated(itemSlug).filter((m) => m.label === "Citado por").map((m) => `${m.value} talvez saiba mais sobre isso.`);
}

// apps/web/src/lib/knowledgeRewards.ts
var CONTINUE_CAP = 1;
var INVESTIGATE_CAP = 3;
function pickKnowledge(candidates, approach) {
  const cap = approach === "investigate" ? INVESTIGATE_CAP : CONTINUE_CAP;
  return candidates.slice(0, cap);
}

// apps/web/src/lib/knowledgeNetwork.ts
function getNextSteps(candidateGroups, approach) {
  const merged = [];
  const seen = /* @__PURE__ */ new Set();
  for (const group of candidateGroups) {
    for (const candidate of group) {
      if (seen.has(candidate)) continue;
      seen.add(candidate);
      merged.push(candidate);
    }
  }
  return pickKnowledge(merged, approach);
}

// apps/web/src/lib/expeditionEchoes.ts
var EMPTY_ECHO_CONTEXT = { regionName: null, approach: null };
function buildExpeditionEchoContext(expedition) {
  if (!expedition) return EMPTY_ECHO_CONTEXT;
  return { regionName: expedition.destination_region_name, approach: expedition.approach };
}
function matchesEchoRegion(regionName, ctx) {
  return ctx.regionName !== null && ctx.regionName === regionName;
}
function getRegionGalleryEchoLine(regionName, ctx) {
  return matchesEchoRegion(regionName, ctx) ? "Expedi\xE7\xF5es recentes passaram por aqui." : null;
}
function getCreatureEchoLine(creatureRegionName, ctx) {
  return matchesEchoRegion(creatureRegionName, ctx) ? "Exploradores recentes voltaram a relatar essa criatura." : null;
}
function getBookEchoLine(bookRegionName, ctx) {
  if (!bookRegionName) return null;
  return matchesEchoRegion(bookRegionName, ctx) ? "Este livro voltou a despertar interesse." : null;
}
function getLibraryEchoLine(hasRegionRelatedBook, ctx) {
  if (!hasRegionRelatedBook || ctx.regionName === null) return null;
  return "Alguns relatos recentes vieram dessa regi\xE3o.";
}
function getNpcEchoLine(npcDialogueMentionsRegion, ctx) {
  if (!npcDialogueMentionsRegion || ctx.regionName === null) return null;
  return "H\xE1 viajantes comentando essa regi\xE3o por aqui.";
}

export {
  recordEvent,
  getRecentEvents,
  getKingdomEchoes,
  REGIONS,
  CREATURE_TYPES,
  DANGER_LABEL,
  getRegionName2 as getRegionName,
  CREATURES,
  BOOK_CATEGORIES,
  BOOKS,
  STORY_CATEGORIES,
  regionFilterOptions,
  TRAVELLER_STORIES,
  NPCS,
  TAVERN_RUMORS,
  TAVERN_CONVERSATIONS,
  TAVERN_WALL_NOTES,
  TAVERN_NIGHT_SONGS,
  getRecognitionLine,
  getHabitLine,
  getForeshadowLine,
  getConsequenceLine,
  getHeroJourneyLine,
  getHeroJourneyPlaceLine,
  pickByTime,
  pickOfTheDay,
  keySalt,
  resolveRotatingLine,
  getLivingConversationLine,
  NPC_DIALOGUE,
  flattenDialogue,
  randomLine,
  KINGDOM_PROFESSIONS,
  MUSEUM_CATEGORIES,
  MUSEUM_STATUS_LABEL,
  MUSEUM_ENTRIES,
  getCreatureMentions,
  getBookRelated,
  getItemRelated,
  getNpcSubjects,
  getRegionKnowledge,
  getBookRecommendations,
  getSimilarRumors,
  getRelatedStoriesAcrossRegions,
  getNpcCitedPeople,
  getCreatureDiscoveryCandidates,
  getBookDiscoveryCandidates,
  getItemDiscoveryCandidates,
  getRegionDiscoveryCandidates,
  getMuseumDiscoveryCandidates,
  getCreatureThreadCandidates,
  getRegionCreatureThreadCandidates,
  getRegionSiblingRuinsThreadCandidates,
  getMuseumBookThreadCandidates,
  getItemNpcThreadCandidates,
  pickKnowledge,
  getNextSteps,
  EMPTY_ECHO_CONTEXT,
  buildExpeditionEchoContext,
  getRegionGalleryEchoLine,
  getCreatureEchoLine,
  getBookEchoLine,
  getLibraryEchoLine,
  getNpcEchoLine
};
