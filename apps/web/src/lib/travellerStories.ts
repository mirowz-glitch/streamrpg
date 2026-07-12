// Sprint Traveller Stories (MVP) — "Histórias dos Viajantes": boatos e
// relatos contados por gente comum, nunca confirmados, nunca explicados.
// Mesmo padrão de Biblioteca/Bestiário/Museu/Taverna: catálogo estático,
// nenhuma mecânica, nenhum backend.
import { allRegionIds, getRegionName } from "@streamrpg/shared";
import type { CodexCategoryOption } from "./codex";

export type StoryCategory =
  | "misterio"
  | "criaturas"
  | "ruinas"
  | "reis_antigos"
  | "objetos_estranhos"
  | "viagens"
  | "mar"
  | "floresta"
  | "montanhas"
  | "magia";

export const STORY_CATEGORIES: Array<{ slug: StoryCategory; label: string; icon: string }> = [
  { slug: "misterio", label: "Mistério", icon: "❔" },
  { slug: "criaturas", label: "Criaturas", icon: "🐾" },
  { slug: "ruinas", label: "Ruínas", icon: "🏛️" },
  { slug: "reis_antigos", label: "Reis Antigos", icon: "👑" },
  { slug: "objetos_estranhos", label: "Objetos Estranhos", icon: "🔮" },
  { slug: "viagens", label: "Viagens", icon: "🧳" },
  { slug: "mar", label: "Mar", icon: "🌊" },
  { slug: "floresta", label: "Floresta", icon: "🌲" },
  { slug: "montanhas", label: "Montanhas", icon: "⛰️" },
  { slug: "magia", label: "Magia", icon: "✨" },
];

// Sem ícone próprio por região em nenhum lugar do projeto ainda — só
// para o filtro desta tela, mesmo espírito das listas de categoria de
// Biblioteca/Bestiário/Museu (ícone + label, nada além disso).
const REGION_ICON: Record<string, string> = {
  "porto-do-amanhecer": "🌅",
  "bosque-sussurrante": "🌲",
  "pantano-podre": "🐸",
  "colinas-aridas": "🏜️",
  "planicie-dourada": "🌾",
  "minas-abandonadas": "⛏️",
  "litoral-quebrado": "🌊",
  "picos-congelados": "🏔️",
  "deserto-de-vidro": "🔷",
  "ruinas-esquecidas": "🏛️",
  "fortaleza-sombria": "🏰",
};

export function regionFilterOptions(): CodexCategoryOption<string>[] {
  return allRegionIds().map((id) => ({ slug: id, label: getRegionName(id), icon: REGION_ICON[id] ?? "📍" }));
}

export interface TravellerStory {
  id: string;
  title: string;
  text: string;
  regionId: string;
  category: StoryCategory;
}

export const TRAVELLER_STORIES: TravellerStory[] = [
  // ---- Mistério ----
  { id: "luzes-sobre-o-lago", title: "Luzes Sobre o Lago", text: "Um pescador jurou ter visto luzes caminhando sobre o lago, uma noite sem lua.", regionId: "porto-do-amanhecer", category: "misterio" },
  { id: "relogio-que-nunca-bate-certo", title: "O Relógio que Nunca Bate Certo", text: "Dizem que o relógio da torre sempre atrasa um minuto, todos os dias, desde sempre.", regionId: "porto-do-amanhecer", category: "misterio" },
  { id: "sombra-que-segue-de-longe", title: "A Sombra que Segue de Longe", text: "Um viajante contou ter sido seguido por uma sombra que nunca se aproximava nem se afastava.", regionId: "colinas-aridas", category: "misterio" },
  { id: "segundo-reflexo", title: "O Segundo Reflexo", text: "Uma mulher jura que, por um instante, seu reflexo na água piscou fora de tempo.", regionId: "planicie-dourada", category: "misterio" },
  { id: "pegadas-que-voltam", title: "As Pegadas que Voltam", text: "Encontraram pegadas na neve que iam e voltavam, mas nunca cruzavam com outras.", regionId: "picos-congelados", category: "misterio" },
  { id: "sino-sem-motivo", title: "O Sino Sem Motivo", text: "Moradores contam que, certas noites, um sino toca em algum lugar que ninguém consegue localizar.", regionId: "porto-do-amanhecer", category: "misterio" },
  { id: "porta-que-muda-de-lugar", title: "A Porta que Muda de Lugar", text: "Dizem que uma porta antiga aparece em paredes diferentes, dependendo de quem procura.", regionId: "ruinas-esquecidas", category: "misterio" },
  { id: "homem-que-perguntou-as-horas", title: "O Homem que Perguntou as Horas", text: "Um estranho perguntou as horas a três pessoas diferentes, no mesmo instante, em lugares distantes.", regionId: "planicie-dourada", category: "misterio" },
  { id: "vela-que-nao-apaga", title: "A Vela que Não Apaga", text: "Há uma vela na capela velha que, dizem, nunca foi vista apagada, nem acesa.", regionId: "porto-do-amanhecer", category: "misterio" },
  { id: "eco-atrasado", title: "O Eco Atrasado", text: "Alguns juram que, nas Colinas Áridas, o eco de um grito demora exatamente um dia para responder.", regionId: "colinas-aridas", category: "misterio" },

  // ---- Criaturas ----
  { id: "lobo-de-olhos-claros", title: "O Lobo de Olhos Claros", text: "Caçadores contam sobre um lobo com olhos claros demais que nunca ataca, só observa.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "serpente-que-fala-baixo", title: "A Serpente que Fala Baixo", text: "Dizem que uma serpente do Deserto de Vidro sussurra antes de atacar, como um aviso.", regionId: "deserto-de-vidro", category: "criaturas" },
  { id: "cervo-de-chifres-torcidos", title: "O Cervo de Chifres Torcidos", text: "Um cervo com chifres estranhamente torcidos foi visto três vezes, sempre no mesmo lugar.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "peixe-que-sabe-nomes", title: "O Peixe que Sabe Nomes", text: "Pescadores do Litoral Quebrado juram que um peixe grande já chamou alguém pelo nome.", regionId: "litoral-quebrado", category: "criaturas" },
  { id: "aranha-do-tamanho-de-um-prato", title: "A Aranha do Tamanho de um Prato", text: "Mineiros contam sobre uma aranha enorme que só aparece quando ninguém está sozinho.", regionId: "minas-abandonadas", category: "criaturas" },
  { id: "urso-que-chora-a-noite", title: "O Urso que Chora à Noite", text: "Moradores das colinas dizem ouvir um som parecido com choro, vindo de um urso que ninguém encontra de dia.", regionId: "colinas-aridas", category: "criaturas" },
  { id: "corvo-que-conta-ate-tres", title: "O Corvo que Conta Até Três", text: "Um corvo específico é visto sempre em grupos de três, nunca mais, nunca menos.", regionId: "porto-do-amanhecer", category: "criaturas" },
  { id: "criatura-do-pantano-sem-nome", title: "A Criatura do Pântano Sem Nome", text: "Ninguém colocou nome na coisa que se move no Pântano Podre. Achar um nome parece perigoso.", regionId: "pantano-podre", category: "criaturas" },
  { id: "gigante-gentil", title: "O Gigante Gentil", text: "Uma criança voltou da floresta dizendo que conversou com um gigante gentil, que só queria companhia.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "cao-sem-dono-que-sempre-aparece", title: "O Cão Sem Dono que Sempre Aparece", text: "Um cão sem dono aparente é visto ajudando viajantes perdidos, e depois desaparece.", regionId: "planicie-dourada", category: "criaturas" },

  // ---- Ruínas ----
  { id: "cavaleiro-da-ponte-velha", title: "O Cavaleiro da Ponte Velha", text: "Há quem diga que um cavaleiro continua protegendo uma ponte, mesmo depois de morto.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "sala-que-ninguem-encontra-duas-vezes", title: "A Sala que Ninguém Encontra Duas Vezes", text: "Exploradores contam sobre uma sala nas Ruínas que nunca conseguem achar de novo.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "passos-debaixo-da-pedra", title: "Os Passos Debaixo da Pedra", text: "Alguns viajantes evitam atravessar as Ruínas Esquecidas durante a madrugada, por causa dos passos.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "estatua-que-muda-de-postura", title: "A Estátua que Muda de Postura", text: "Dizem que uma das estátuas das ruínas está sempre numa posição diferente da última vez.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "portal-que-nao-leva-a-lugar-nenhum", title: "O Portal que Não Leva a Lugar Nenhum", text: "Um portal de pedra isolado continua de pé, sem levar a lugar algum — ou levando a algum lugar que ninguém contou.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "voz-na-fortaleza-sombria", title: "A Voz na Fortaleza Sombria", text: "Guardas juram ouvir uma voz calma vindo do interior da Fortaleza Sombria, mesmo sabendo que está vazia.", regionId: "fortaleza-sombria", category: "ruinas" },
  { id: "trono-vazio-que-range", title: "O Trono Vazio que Range", text: "Contam que o trono abandonado da Fortaleza range como se alguém ainda sentasse nele.", regionId: "fortaleza-sombria", category: "ruinas" },
  { id: "inscricoes-que-mudam", title: "As Inscrições que Mudam", text: "Estudiosos discordam se as inscrições das Ruínas realmente mudam, ou se é só a memória que falha.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "templo-dentro-do-templo", title: "O Templo Dentro do Templo", text: "Uma câmara mais antiga que o resto das Ruínas foi encontrada, e ninguém sabe explicar a diferença de idade.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "guardiao-que-nao-ataca", title: "O Guardião que Não Ataca", text: "Um vigia de pedra na Fortaleza Sombria nunca se moveu, mas ninguém garante que ele não possa.", regionId: "fortaleza-sombria", category: "ruinas" },

  // ---- Reis antigos ----
  { id: "rei-que-nunca-foi-coroado", title: "O Rei que Nunca Foi Coroado", text: "Contam que um rei governou por anos sem nunca aceitar a coroa oficialmente.", regionId: "planicie-dourada", category: "reis_antigos" },
  { id: "rainha-que-sumiu-na-neblina", title: "A Rainha que Sumiu na Neblina", text: "Uma rainha antiga teria desaparecido numa neblina espessa, e nunca mais foi vista.", regionId: "porto-do-amanhecer", category: "reis_antigos" },
  { id: "ultimo-decreto-nao-lido", title: "O Último Decreto Não Lido", text: "Dizem que existe um decreto de um rei antigo que nunca foi lido em voz alta até hoje.", regionId: "porto-do-amanhecer", category: "reis_antigos" },
  { id: "rei-que-conversava-com-pedras", title: "O Rei que Conversava com Pedras", text: "Um governante antigo era famoso por falar sozinho com pedras, como se elas respondessem.", regionId: "colinas-aridas", category: "reis_antigos" },
  { id: "coroa-perdida-nas-minas", title: "A Coroa Perdida nas Minas", text: "Há quem acredite que uma coroa antiga ainda está enterrada nas Minas Abandonadas.", regionId: "minas-abandonadas", category: "reis_antigos" },
  { id: "rei-sem-nome-nos-registros", title: "O Rei Sem Nome nos Registros", text: "Um reinado inteiro existe nos relatos populares, mas nenhum registro oficial confirma o nome do rei.", regionId: "porto-do-amanhecer", category: "reis_antigos" },
  { id: "promessa-feita-ao-deserto", title: "A Promessa Feita ao Deserto", text: "Contam que um rei antigo fez uma promessa ao Deserto de Vidro, e que o deserto ainda espera.", regionId: "deserto-de-vidro", category: "reis_antigos" },
  { id: "trono-afundado", title: "O Trono Afundado", text: "Dizem que um trono inteiro afundou lentamente no Pântano Podre, com o tempo.", regionId: "pantano-podre", category: "reis_antigos" },
  { id: "rei-que-nunca-envelheceu", title: "O Rei que Nunca Envelheceu", text: "Um relato antigo insiste que um certo rei nunca pareceu envelhecer, até desaparecer de vez.", regionId: "planicie-dourada", category: "reis_antigos" },
  { id: "ultima-ceia-do-rei-esquecido", title: "A Última Ceia do Rei Esquecido", text: "Contam que a última refeição de um rei esquecido ainda está representada em um mural desbotado.", regionId: "ruinas-esquecidas", category: "reis_antigos" },

  // ---- Objetos estranhos ----
  { id: "moinho-sem-vento", title: "O Moinho Sem Vento", text: "O velho moinho continua funcionando mesmo sem vento.", regionId: "planicie-dourada", category: "objetos_estranhos" },
  { id: "chave-que-nao-serve-em-nada", title: "A Chave que Não Serve em Nada", text: "Uma chave antiga passa de mão em mão, mas ninguém encontrou a porta que ela abre.", regionId: "porto-do-amanhecer", category: "objetos_estranhos" },
  { id: "espelho-que-chega-atrasado", title: "O Espelho que Chega Atrasado", text: "Um espelho antigo mostra o reflexo um instante depois do esperado, segundo quem já usou.", regionId: "porto-do-amanhecer", category: "objetos_estranhos" },
  { id: "relogio-que-conta-ao-contrario", title: "O Relógio que Conta ao Contrário", text: "Um relógio de bolso encontrado nas Ruínas conta as horas de trás para frente.", regionId: "ruinas-esquecidas", category: "objetos_estranhos" },
  { id: "lampada-que-nunca-apaga-sozinha", title: "A Lâmpada que Nunca Apaga Sozinha", text: "Uma lâmpada de óleo é famosa por nunca se apagar, mesmo sem ninguém reabastecê-la.", regionId: "minas-abandonadas", category: "objetos_estranhos" },
  { id: "bau-que-ninguem-consegue-abrir", title: "O Baú que Ninguém Consegue Abrir", text: "Um baú de ferro segue fechado há gerações, e ninguém encontrou a fechadura certa.", regionId: "fortaleza-sombria", category: "objetos_estranhos" },
  { id: "bussola-que-aponta-para-dentro", title: "A Bússola que Aponta para Dentro", text: "Uma bússola estranha aponta sempre para o centro do Deserto de Vidro, não para o norte.", regionId: "deserto-de-vidro", category: "objetos_estranhos" },
  { id: "sino-que-ninguem-ouve-igual", title: "O Sino que Ninguém Ouve Igual", text: "Cada pessoa que ouve o sino da torre descreve um som diferente do anterior.", regionId: "porto-do-amanhecer", category: "objetos_estranhos" },
  { id: "luva-que-aparece-sozinha", title: "A Luva que Aparece Sozinha", text: "Dizem que, de vez em quando, uma luva surge sozinha em lugares onde ninguém a deixou.", regionId: "porto-do-amanhecer", category: "objetos_estranhos" },
  { id: "cajado-deixado-na-neve", title: "O Cajado Deixado na Neve", text: "Um cajado antigo permanece cravado na neve dos Picos Congelados, imune ao tempo.", regionId: "picos-congelados", category: "objetos_estranhos" },

  // ---- Viagens ----
  { id: "viajante-que-nunca-chegou", title: "O Viajante que Nunca Chegou", text: "Um mercador partiu para outro Reino e nunca chegou, nem voltou, nem foi encontrado.", regionId: "planicie-dourada", category: "viagens" },
  { id: "estrada-que-ninguem-reconhece-duas-vezes", title: "A Estrada que Ninguém Reconhece Duas Vezes", text: "Alguns viajantes contam ter seguido uma estrada que, na volta, parecia completamente diferente.", regionId: "colinas-aridas", category: "viagens" },
  { id: "grupo-que-voltou-em-menos-tempo", title: "O Grupo que Voltou em Menos Tempo", text: "Um grupo de viajantes voltou de uma jornada longa em menos tempo do que deveria ser fisicamente possível.", regionId: "planicie-dourada", category: "viagens" },
  { id: "carroca-sem-cavalo", title: "A Carroça Sem Cavalo", text: "Contam que uma carroça foi vista se movendo sozinha por uma estrada vazia.", regionId: "planicie-dourada", category: "viagens" },
  { id: "mapa-que-nao-bate-com-o-caminho", title: "O Mapa que Não Bate com o Caminho", text: "Um mapa antigo mostra uma estrada que não existe mais, ou talvez nunca tenha existido.", regionId: "colinas-aridas", category: "viagens" },
  { id: "viajante-que-trocou-de-nome-no-caminho", title: "O Viajante que Trocou de Nome no Caminho", text: "Um homem chegou a um vilarejo com um nome diferente do que usava ao partir de outro.", regionId: "porto-do-amanhecer", category: "viagens" },
  { id: "ponte-que-so-aparece-a-noite", title: "A Ponte que Só Aparece à Noite", text: "Viajantes juram ter atravessado uma ponte que, de dia, simplesmente não está lá.", regionId: "pantano-podre", category: "viagens" },
  { id: "atalho-que-ninguem-recomenda-duas-vezes", title: "O Atalho que Ninguém Recomenda Duas Vezes", text: "Um atalho famoso encurta a viagem, mas quem o usa nunca quer contar o que viu no caminho.", regionId: "bosque-sussurrante", category: "viagens" },
  { id: "peso-extra-na-bagagem", title: "O Peso Extra na Bagagem", text: "Um viajante jurou que sua bagagem pesava mais na volta do que na ida, sem nada ter sido acrescentado.", regionId: "deserto-de-vidro", category: "viagens" },
  { id: "caravana-que-ninguem-viu-partir", title: "A Caravana que Ninguém Viu Partir", text: "Moradores contam sobre uma caravana que ninguém viu chegar, mas que todos garantem ter visto partir.", regionId: "planicie-dourada", category: "viagens" },

  // ---- Mar ----
  { id: "navio-que-encalhou-longe-da-agua", title: "O Navio que Encalhou Longe da Água", text: "Um casco partido foi encontrado longe demais da água para ter encalhado numa tempestade normal.", regionId: "litoral-quebrado", category: "mar" },
  { id: "voz-debaixo-das-ondas", title: "A Voz Debaixo das Ondas", text: "Pescadores contam ter ouvido uma voz cantando debaixo da água, em noites calmas.", regionId: "litoral-quebrado", category: "mar" },
  { id: "farol-que-acende-sozinho", title: "O Farol que Acende Sozinho", text: "Um farol abandonado às vezes acende sozinho, segundo quem mora por perto.", regionId: "litoral-quebrado", category: "mar" },
  { id: "rede-que-sempre-volta-vazia", title: "A Rede que Sempre Volta Vazia num Certo Dia", text: "Uma vez por ano, dizem os pescadores, nenhuma rede traz nada, não importa onde seja lançada.", regionId: "litoral-quebrado", category: "mar" },
  { id: "marinheiro-que-nunca-envelheceu-no-mar", title: "O Marinheiro que Nunca Envelheceu no Mar", text: "Um velho marujo jura ter conhecido, na juventude, um marinheiro que parecia sempre da mesma idade.", regionId: "litoral-quebrado", category: "mar" },
  { id: "mercadora-do-navio-fantasma", title: "A Mercadora do Navio Fantasma", text: "Contam sobre uma mercadora que aparece vendendo objetos estranhos, sempre vinda de um navio que ninguém mais vê.", regionId: "litoral-quebrado", category: "mar" },
  { id: "conchas-que-sussurram", title: "As Conchas que Sussurram", text: "Algumas conchas do litoral, dizem, sussurram quando encostadas no ouvido, mas ninguém concorda no que dizem.", regionId: "litoral-quebrado", category: "mar" },
  { id: "naufragio-que-se-move", title: "O Naufrágio que Se Move", text: "Um naufrágio antigo parece estar mais perto da vila a cada ano, sem que ninguém o tenha movido.", regionId: "litoral-quebrado", category: "mar" },
  { id: "mare-que-chegou-sem-aviso", title: "A Maré que Chegou Sem Aviso", text: "Uma maré alta incomum chegou sem qualquer sinal de tempestade, e ninguém soube explicar por quê.", regionId: "litoral-quebrado", category: "mar" },
  { id: "pescador-que-trouxe-algo-que-nao-devia", title: "O Pescador que Trouxe Algo que Não Devia", text: "Um pescador puxou algo em sua rede que ele nunca descreveu para ninguém, e nunca mais pescou.", regionId: "litoral-quebrado", category: "mar" },

  // ---- Floresta ----
  { id: "arvore-que-respondeu", title: "A Árvore que Respondeu", text: "Disseram que uma árvore respondeu quando um aventureiro pediu ajuda, no Bosque Sussurrante.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "caminho-que-sussurra-nomes", title: "O Caminho que Sussurra Nomes", text: "Viajantes contam ouvir seus próprios nomes sussurrados entre as árvores, sem ninguém por perto.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "clareira-que-nao-aparece-no-mapa", title: "A Clareira que Não Aparece no Mapa", text: "Uma clareira perfeita foi encontrada no meio do bosque, mas nenhum mapa a registra.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "musgo-que-cresce-em-forma-de-letras", title: "O Musgo que Cresce em Forma de Letras", text: "Alguns juram ter visto musgo crescendo em padrões parecidos com letras antigas.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "aves-que-silenciam-juntas", title: "As Aves que Silenciam Juntas", text: "Há momentos em que todos os pássaros do bosque param de cantar ao mesmo tempo, sem motivo aparente.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "cabana-vazia-sempre-arrumada", title: "A Cabana Vazia Sempre Arrumada", text: "Uma cabana abandonada no bosque está sempre limpa, embora ninguém confesse cuidar dela.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "riacho-que-muda-de-direcao", title: "O Riacho que Muda de Direção", text: "Moradores locais dizem que um riacho pequeno já mudou de direção mais de uma vez, sem chuva ou motivo.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "nevoa-que-so-cobre-uma-arvore", title: "A Névoa que Só Cobre uma Árvore", text: "Uma névoa estranha às vezes cobre só uma árvore específica, mesmo em dias claros.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "eco-que-devolve-outra-voz", title: "O Eco que Devolve Outra Voz", text: "Alguém gritou no bosque e jura ter ouvido de volta uma voz que não era a sua.", regionId: "bosque-sussurrante", category: "floresta" },
  { id: "raizes-que-formam-um-rosto", title: "As Raízes que Formam um Rosto", text: "Um conjunto de raízes expostas parece, para alguns, formar um rosto — mas nunca o mesmo rosto duas vezes.", regionId: "bosque-sussurrante", category: "floresta" },

  // ---- Montanhas ----
  { id: "grito-que-vem-do-topo", title: "O Grito que Vem do Topo", text: "Moradores das redondezas contam ouvir um grito vindo do topo dos Picos Congelados, sem nunca ver quem grita.", regionId: "picos-congelados", category: "montanhas" },
  { id: "trilha-que-termina-no-nada", title: "A Trilha que Termina no Nada", text: "Uma trilha talhada na rocha termina abruptamente num penhasco, sem explicação de para onde levava.", regionId: "picos-congelados", category: "montanhas" },
  { id: "viajante-congelado-que-ainda-sorri", title: "O Viajante Congelado que Ainda Sorri", text: "Contam sobre um viajante encontrado congelado nas montanhas, com uma expressão calma demais para o frio.", regionId: "picos-congelados", category: "montanhas" },
  { id: "neve-que-nao-derrete-num-ponto-so", title: "A Neve que Não Derrete num Ponto Só", text: "Há um ponto específico nos Picos onde a neve nunca derrete, nem no verão mais quente.", regionId: "picos-congelados", category: "montanhas" },
  { id: "sino-da-montanha", title: "O Sino da Montanha", text: "Alguns dizem ouvir um sino distante nas Colinas Áridas, embora não haja nenhum sino conhecido por lá.", regionId: "colinas-aridas", category: "montanhas" },
  { id: "caverna-que-ninguem-mediu-ate-o-fim", title: "A Caverna que Ninguém Mediu Até o Fim", text: "Uma caverna nas colinas nunca foi completamente explorada — quem tenta, sempre volta antes do fim.", regionId: "colinas-aridas", category: "montanhas" },
  { id: "vento-que-fala-baixo", title: "O Vento que Fala Baixo", text: "Pastores das colinas juram que o vento, em certas noites, parece formar palavras.", regionId: "colinas-aridas", category: "montanhas" },
  { id: "pedra-que-aquece-sozinha", title: "A Pedra que Aquece Sozinha", text: "Uma pedra específica nas colinas está sempre morna, mesmo nas noites mais frias.", regionId: "colinas-aridas", category: "montanhas" },
  { id: "rebanho-que-segue-sozinho", title: "O Rebanho que Segue Sozinho", text: "Um rebanho foi visto se movendo em formação organizada, sem nenhum pastor por perto.", regionId: "colinas-aridas", category: "montanhas" },
  { id: "passagem-que-so-alguns-encontram", title: "A Passagem que Só Alguns Encontram", text: "Dizem que existe uma passagem nos Picos Congelados que só aparece para quem realmente precisa dela.", regionId: "picos-congelados", category: "montanhas" },

  // ---- Magia ----
  { id: "feitico-que-ninguem-lancou", title: "O Feitiço que Ninguém Lançou", text: "Zoltar jura ter sentido um feitiço se formar no ar, sem ninguém por perto para lançá-lo.", regionId: "porto-do-amanhecer", category: "magia" },
  { id: "luz-que-cura-sem-ser-pedida", title: "A Luz que Cura Sem Ser Pedida", text: "Contam sobre uma luz vista no Pântano Podre que parece aliviar feridas, sem que ninguém a tenha invocado.", regionId: "pantano-podre", category: "magia" },
  { id: "livro-que-se-escreve-sozinho", title: "O Livro que Se Escreve Sozinho", text: "Miriam guarda um livro que, segundo boatos antigos, ganha novas páginas sem ninguém escrever.", regionId: "porto-do-amanhecer", category: "magia" },
  { id: "fumaca-que-forma-simbolos", title: "A Fumaça que Forma Símbolos", text: "Alquimistas relatam que certa fumaça, ao se dissipar, forma símbolos que ninguém consegue copiar a tempo.", regionId: "porto-do-amanhecer", category: "magia" },
  { id: "anel-que-esquenta-perto-de-perigo", title: "O Anel que Esquenta Perto de Perigo", text: "Um anel antigo é famoso por esquentar sempre que o perigo se aproxima do dono.", regionId: "deserto-de-vidro", category: "magia" },
  { id: "chama-que-nao-queima", title: "A Chama que Não Queima", text: "Uma fogueira nas Ruínas Esquecidas queima sem consumir a lenha, segundo quem já viu de perto.", regionId: "ruinas-esquecidas", category: "magia" },
  { id: "sussurro-que-ensina-feiticos", title: "O Sussurro que Ensina Feitiços", text: "Um aprendiz jurou ter aprendido um feitiço simplesmente ouvindo um sussurro vindo do nada.", regionId: "porto-do-amanhecer", category: "magia" },
  { id: "agua-que-reflete-outro-lugar", title: "A Água que Reflete Outro Lugar", text: "Um poço no Bosque Sussurrante às vezes reflete uma paisagem que não é a do bosque ao redor.", regionId: "bosque-sussurrante", category: "magia" },
  { id: "circulo-que-aparece-na-terra-queimada", title: "O Círculo que Aparece na Terra Queimada", text: "Um círculo perfeito de terra queimada surge, some, e reaparece em outro lugar da Planície Dourada.", regionId: "planicie-dourada", category: "magia" },
  { id: "magia-que-zoltar-nao-explica", title: "A Magia que Zoltar Não Explica", text: "Zoltar se recusa a comentar certos boatos sobre magia antiga. Isso, por si só, já é um boato.", regionId: "porto-do-amanhecer", category: "magia" },

  // ---- Sprint Wolves Ecosystem (Phase I) — 10 histórias sobre os Lobos
  // do Bosque Sussurrante e variantes regionais, mesma categoria já usada
  // por "lobo-de-olhos-claros" (Traveller Stories original).
  { id: "uivo-que-lidera", title: "O Uivo que Lidera", text: "Caçadores dizem reconhecer o uivo do Lobo Alfa entre todos os outros — mais grave, mais longo, e ouvido só uma vez por caçada.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "loba-que-anda-sozinha", title: "A Loba que Anda Sozinha", text: "Contam que uma loba de pelagem clara caça longe da matilha, sempre voltando antes do amanhecer.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "filhote-que-seguiu-um-viajante", title: "O Filhote que Seguiu um Viajante", text: "Um mercador jura que um filhote de lobo o seguiu por dois dias inteiros, sem nunca se aproximar o bastante para ser tocado.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "lobos-que-nao-cacam-em-bando", title: "Os Lobos que Não Caçam em Bando", text: "Nas Colinas Áridas, dizem que os lobos caçam sozinhos — a terra ali não sustenta uma matilha inteira.", regionId: "colinas-aridas", category: "criaturas" },
  { id: "lobo-que-nada-no-pantano", title: "O Lobo que Nada no Pântano", text: "Um caçador afirma ter visto um lobo atravessar um trecho de água parada como se fosse chão firme.", regionId: "pantano-podre", category: "criaturas" },
  { id: "presas-que-brilham-na-neve", title: "As Presas que Brilham na Neve", text: "Exploradores dos Picos Congelados contam sobre um lobo cujas presas pareciam refletir a luz da lua.", regionId: "picos-congelados", category: "criaturas" },
  { id: "matilha-que-cerca-em-silencio", title: "A Matilha que Cerca em Silêncio", text: "Dizem que uma matilha inteira consegue cercar um viajante sem que ele perceba, até ser tarde demais.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "lobo-com-cicatriz-no-focinho", title: "O Lobo com uma Cicatriz no Focinho", text: "Alguns caçadores juram reconhecer sempre o mesmo lobo — marcado, magro, e impossível de encurralar.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "noite-em-que-os-lobos-nao-uivaram", title: "A Noite em que os Lobos Não Uivaram", text: "Moradores do Bosque Sussurrante contam sobre uma única noite, há anos, em que nenhum lobo uivou — e ninguém soube dizer por quê.", regionId: "bosque-sussurrante", category: "criaturas" },
  { id: "rastro-que-termina-no-nada", title: "O Rastro que Termina no Nada", text: "Um batedor contou ter seguido pegadas de lobo por horas, até elas simplesmente pararem de existir, no meio do caminho.", regionId: "bosque-sussurrante", category: "criaturas" },

  // ---- Sprint Ravens Ecosystem (Phase I) — 10 histórias sobre os
  // Corvos do Reino, sempre deixando dúvida (categoria "misterio").
  { id: "corvo-que-sabe-o-nome", title: "O Corvo que Sabe o Nome", text: "Um viajante jura que um corvo grasnou o nome dele, claro como qualquer palavra. Ninguém mais ouviu.", regionId: "porto-do-amanhecer", category: "misterio" },
  { id: "bando-que-apareceu-do-nada", title: "O Bando que Apareceu do Nada", text: "Centenas de corvos surgiram de uma vez sobre as Ruínas Esquecidas, e sumiram antes que alguém contasse todos.", regionId: "ruinas-esquecidas", category: "misterio" },
  { id: "corvo-que-seguiu-por-anos", title: "O Corvo que Seguiu por Anos", text: "Um caçador afirma reconhecer o mesmo corvo observando-o há anos, em regiões diferentes do Reino.", regionId: "bosque-sussurrante", category: "misterio" },
  { id: "pena-que-nunca-envelhece", title: "A Pena que Nunca Envelhece", text: "Uma pena negra encontrada nos Picos Congelados nunca murchou, nem depois de anos guardada.", regionId: "picos-congelados", category: "misterio" },
  { id: "silencio-antes-do-voo", title: "O Silêncio Antes do Voo", text: "Moradores do Bosque Sussurrante contam que, pouco antes de a matilha de lobos caçar, os corvos somem por completo.", regionId: "bosque-sussurrante", category: "misterio" },
  { id: "corvo-que-entrega-mensagens", title: "O Corvo que Entrega Mensagens", text: "Um mercador jura que um corvo entregou um bilhete perdido exatamente à pessoa certa, sem nenhuma explicação.", regionId: "porto-do-amanhecer", category: "misterio" },
  { id: "ninho-que-ninguem-alcanca", title: "O Ninho que Ninguém Alcança", text: "Um ninho foi avistado alto demais nas montanhas para qualquer escalada. Ninguém sabe quem construiu.", regionId: "picos-congelados", category: "misterio" },
  { id: "corvo-que-observou-a-expedicao", title: "O Corvo que Observou a Expedição Inteira", text: "Um grupo de exploradores jura ter sido observado por um único corvo do início ao fim de uma travessia inteira.", regionId: "colinas-aridas", category: "misterio" },
  { id: "corvo-parado-na-lapide", title: "O Corvo Parado na Lápide", text: "Um corvo ficou dias inteiros sobre uma lápide vazia nas Ruínas Esquecidas, sem se mover.", regionId: "ruinas-esquecidas", category: "misterio" },
  { id: "pergunta-que-o-corvo-respondeu", title: "A Pergunta que o Corvo Respondeu", text: "Um estudioso jura ter feito uma pergunta em voz alta, sozinho, e ouvido um grasnido como se fosse resposta.", regionId: "porto-do-amanhecer", category: "misterio" },

  // ---- Sprint Ancient Ruins Ecosystem (Phase I) — 15 histórias, cada
  // uma ocorrida numa Ruína Antiga diferente (categoria "ruinas").
  { id: "coluna-que-nao-faz-sombra-certa", title: "A Coluna que Não Faz Sombra Certa", text: "Um viajante jura que a sombra da Coluna Partida do Horizonte nunca aponta pra onde o sol está.", regionId: "planicie-dourada", category: "ruinas" },
  { id: "porta-que-nao-leva-a-lugar-nenhum", title: "A Porta que Não Leva a Lugar Nenhum", text: "Um explorador contou ter atravessado o Portão Sem Muro dez vezes seguidas, sempre chegando exatamente onde começou.", regionId: "colinas-aridas", category: "ruinas" },
  { id: "passos-do-outro-lado-da-escada", title: "Os Passos do Outro Lado da Escada", text: "Um mineiro jura ter ouvido passos vindos de trás da parede que corta a Escadaria, nas Minas Abandonadas.", regionId: "minas-abandonadas", category: "ruinas" },
  { id: "rosto-que-a-estatua-nunca-teve", title: "O Rosto que a Estátua Nunca Teve", text: "Um estudioso contou ter tentado esculpir um rosto na Estátua Sem Rosto, só pra descobrir que a pedra não aceita talha nenhuma ali.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "pedra-que-nunca-toca-o-fundo", title: "A Pedra que Nunca Toca o Fundo", text: "Um viajante jogou uma pedra no Poço Completamente Seco e jura nunca ter ouvido ela bater no fundo.", regionId: "deserto-de-vidro", category: "ruinas" },
  { id: "simbolos-que-mudam-de-lugar", title: "Os Símbolos que Mudam de Lugar", text: "Um explorador dos Picos Congelados afirma que os símbolos do penhasco estavam em posições diferentes na segunda visita.", regionId: "picos-congelados", category: "ruinas" },
  { id: "fogueiras-apagadas-ao-mesmo-tempo", title: "As Fogueiras Apagadas ao Mesmo Tempo", text: "Um batedor do Bosque Sussurrante jura que todas as fogueiras do acampamento antigo pareciam ter sido apagadas no mesmo instante.", regionId: "bosque-sussurrante", category: "ruinas" },
  { id: "mascara-que-nao-afunda-mais", title: "A Máscara que Não Afunda Mais", text: "Um caçador do Pântano Podre conta que a máscara enterrada está exatamente na mesma altura desde que ele era criança.", regionId: "pantano-podre", category: "ruinas" },
  { id: "torre-sem-uma-unica-porta", title: "A Torre Sem Uma Única Porta", text: "Um pescador do Litoral Quebrado jura ter dado três voltas completas na Torre Sem Entrada, sem achar sequer uma rachadura.", regionId: "litoral-quebrado", category: "ruinas" },
  { id: "bloco-que-ninguem-consegue-mover", title: "O Bloco que Ninguém Consegue Mover", text: "Um grupo inteiro tentou empurrar o bloco caído do Portal de Pedra da Fronteira. Nenhum deles conseguiu mover um centímetro.", regionId: "fortaleza-sombria", category: "ruinas" },
  { id: "eco-que-nunca-se-repete", title: "O Eco que Nunca se Repete", text: "Um viajante jura que gritou o mesmo nome duas vezes na Câmara das Vozes e ouviu ecos completamente diferentes.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "arena-mais-funda-do-que-deveria", title: "A Arena Mais Funda do que Deveria", text: "Um explorador das Colinas Áridas jura que o centro da Arena Afundada é fundo demais pra ter sido escavado à mão.", regionId: "colinas-aridas", category: "ruinas" },
  { id: "segunda-voz-na-camara", title: "A Segunda Voz na Câmara", text: "Um estudioso jura ter ouvido uma segunda voz responder junto com o próprio eco, dentro da Câmara das Vozes.", regionId: "ruinas-esquecidas", category: "ruinas" },
  { id: "sombra-que-atravessou-a-torre", title: "A Sombra que Atravessou a Torre", text: "Um marinheiro afirma ter visto uma sombra atravessar a Torre Sem Entrada de um lado ao outro, por dentro de uma parede sólida.", regionId: "litoral-quebrado", category: "ruinas" },
  { id: "nome-que-ninguem-lembra-de-ter-dito", title: "O Nome que Ninguém Lembra de Ter Dito", text: "Um viajante jura que a Estátua Sem Rosto sussurrou um nome — o dele mesmo — mas ele nunca tinha dito esse nome em voz alta ali.", regionId: "ruinas-esquecidas", category: "ruinas" },

  // Sprint First WOW Moment (Phase I)
  { id: "aventureiro-que-nunca-trocou-as-luvas", title: "O Aventureiro que Nunca Trocou as Luvas", text: "Contam que um aventureiro guardou as próprias luvas rasgadas até o fim da carreira, mesmo depois de rico o bastante pra comprar cem pares novos. Ninguém soube explicar por quê. Ele também nunca contou.", regionId: "porto-do-amanhecer", category: "viagens" },

  // Sprint StreamRPG Identity (Phase I)
  { id: "forja-que-nunca-apaga-de-verdade", title: "A Forja que Nunca Apaga de Verdade", text: "Viajantes que passam pela Capital de madrugada juram ver luz saindo da forja do Borin, mesmo nas noites em que ele garante ter ido dormir cedo.", regionId: "porto-do-amanhecer", category: "viagens" },
  { id: "sala-que-o-curador-nunca-mostra", title: "A Sala que o Curador Nunca Mostra", text: "Dizem que existe uma sala no Museu que Alaric nunca abre pra visitantes. Ele nega. Quem insiste, nota que ele muda de assunto rápido demais.", regionId: "porto-do-amanhecer", category: "misterio" },
  { id: "lobo-que-todos-conhecem-de-ouvir-falar", title: "O Lobo que Todos Conhecem de Ouvir Falar", text: "Ninguém no Bosque Sussurrante afirma ter visto O Lobo Que Não Envelhece de perto. Ainda assim, todo morador da região conhece o nome, e conta a história como se fosse dele.", regionId: "bosque-sussurrante", category: "criaturas" },

  // Sprint StreamRPG Identity (Phase II)
  { id: "mesa-onde-a-rainha-meira-negociou", title: "A Mesa Onde a Rainha Meira Negociou", text: "Moradores da Capital apontam pra uma mesa de taverna específica como o lugar onde a Rainha Meira teria negociado a reunificação dos territórios. Nenhum registro confirma. Ninguém tira a mesa do lugar, por via das dúvidas.", regionId: "porto-do-amanhecer", category: "reis_antigos" },
  { id: "quem-entra-diferente-de-quem-sai", title: "Quem Entra Diferente de Quem Sai", text: "Um grupo inteiro que voltou da Fortaleza Sombria jura que nenhum deles saiu exatamente igual a quem entrou. Não souberam explicar o que, exatamente, tinha mudado.", regionId: "fortaleza-sombria", category: "misterio" },

  // Sprint Place Identity (Phase I)
  { id: "agua-da-fonte-que-brilhou", title: "A Água da Fonte que Brilhou", text: "Um viajante jura ter visto a água da Fonte da praça brilhar, por um instante, numa noite sem lua. Ninguém mais viu. Ele voltou lá três noites seguidas, sem sorte.", regionId: "porto-do-amanhecer", category: "misterio" },
  { id: "som-dentro-do-barril-vazio", title: "O Som Dentro do Barril Vazio", text: "Um mercador conta que ouviu um som de líquido balançando dentro do barril vazio da praça, mesmo sabendo que está seco há anos. Bateu de novo. O som não voltou.", regionId: "porto-do-amanhecer", category: "objetos_estranhos" },
  { id: "noite-mais-silenciosa-perto-da-ponte", title: "A Noite Mais Silenciosa Perto da Ponte", text: "Um viajante conta que passou uma noite inteira perto da Primeira Ponte e nunca ouviu o rio tão silencioso, antes ou depois daquela vez.", regionId: "porto-do-amanhecer", category: "viagens" },
  { id: "torre-que-chama-de-longe", title: "A Torre que Chama de Longe", text: "Um guia de caravana jura reconhecer a Torre do Portão Norte de longe, mesmo na neblina mais fechada. Diz que ela 'chama' quem já passou perto dela uma vez.", regionId: "porto-do-amanhecer", category: "viagens" },
];
