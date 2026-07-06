import {
  NpcPortrait,
  useCharacter,
  useIdentity,
  useKingdomRole
} from "./chunk-I4LKOFEV.js";
import {
  getStoredChannel
} from "./chunk-6RGLD4R5.js";
import {
  isFlagSet
} from "./chunk-QE563634.js";
import {
  __toESM,
  require_jsx_runtime,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/components/city/CityMap.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var BUILDINGS = [
  { key: "arena", name: "Arena", icon: "\u{1F3DF}\uFE0F", description: "Onde os feitos contra os Bosses s\xE3o lembrados." },
  { key: "ferreiro", name: "Ferreiro", icon: "\u{1F6E0}\uFE0F", description: "Seu equipamento, sempre \xE0 mostra." },
  { key: "mercador", name: "Mercador", icon: "\u{1F6D2}", description: "O com\xE9rcio do Reino \u2014 em constru\xE7\xE3o." },
  { key: "alquimista", name: "Alquimista", icon: "\u2697\uFE0F", description: "Po\xE7\xF5es e reagentes \u2014 em constru\xE7\xE3o." },
  { key: "guilda", name: "Guilda", icon: "\u{1F3DB}\uFE0F", description: "O Hall da Fama do Reino." },
  { key: "banco", name: "Banco", icon: "\u{1F3E6}", description: "Seu Gold, guardado com seguran\xE7a." },
  { key: "portao-norte", name: "Port\xE3o Norte", icon: "\u{1F6AA}", description: "A sa\xEDda para o mundo \u2014 regi\xF5es e expedi\xE7\xF5es." },
  { key: "biblioteca", name: "Biblioteca", icon: "\u{1F4DA}", description: "Um c\xF3dice para cada hist\xF3ria do Reino." },
  { key: "bestiario", name: "Besti\xE1rio", icon: "\u{1F52C}", description: "Um registro de cada criatura j\xE1 avistada." },
  { key: "museu", name: "Museu do Reino", icon: "\u{1F5BC}\uFE0F", description: "Onde a hist\xF3ria da comunidade fica registrada." },
  { key: "taverna", name: "Taverna", icon: "\u{1F37A}", description: "Onde o Reino descansa, conversa e inventa hist\xF3rias." },
  { key: "casa-dos-viajantes", name: "Casa dos Viajantes", icon: "\u{1F4DC}", description: "Hist\xF3rias contadas por gente comum. Ningu\xE9m sabe se s\xE3o verdade." }
];
var CityMap = (0, import_react.memo)(function CityMap2({ onSelect }) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "city-map-grid", children: BUILDINGS.map((building) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "button",
    {
      type: "button",
      className: "city-building-card",
      onClick: () => onSelect(building.key),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "city-building-icon", children: building.icon }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { className: "city-building-name", children: building.name }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "city-building-description", children: building.description })
      ]
    },
    building.key
  )) });
});

// apps/web/src/components/city/NpcIntro.tsx
var import_react2 = __toESM(require_react(), 1);

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
    "Trabalho, durmo, repito. Vida simples."
  ],
  humor: [
    "C\xEA j\xE1 tentou consertar bota com martelo? Eu j\xE1. N\xE3o recomendo.",
    "Um dia vou aprender a cozinhar. Hoje n\xE3o \xE9 esse dia.",
    "Minhas m\xE3os s\xE3o ferramentas. Minha cara, nem tanto.",
    "J\xE1 bati o dedo com martelo mais vezes do que consigo admitir.",
    "Se eu risse de tudo que fa\xE7o de errado, riria o dia inteiro."
  ],
  conselhos: [
    "Cuida do que usa. O resto se cuida sozinho.",
    "Equipamento ruim mata mais que monstro.",
    "Nunca economiza em bota. Voc\xEA anda com os p\xE9s, n\xE3o com a carteira.",
    "Aprende a afiar sua pr\xF3pria l\xE2mina. Um dia eu n\xE3o vou estar aqui.",
    "Antes de sair por a\xED, checa o equipamento duas vezes."
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
    "Couro de Lobo Alfa \xE9 raro de achar sem rasgo. O bicho n\xE3o se entrega f\xE1cil, nem morto."
  ],
  comentarios_reino: [
    "Esse Reino se sustenta na teimosia de quem n\xE3o desiste.",
    "Capital continua de p\xE9. Isso j\xE1 \xE9 uma vit\xF3ria.",
    "Reino pequeno, problemas grandes. Sempre foi assim.",
    "As pessoas aqui trabalham demais e reclamam de menos do que deveriam.",
    "Esse Reino tem mais hist\xF3ria do que aparenta."
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
    "Nem tudo que sai daqui quebrado \xE9 falha minha. A maioria, sim, mas nem tudo."
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
    "Sil\xEAncio incomoda essa loja. Por isso eu falo tanto."
  ],
  humor: [
    "J\xE1 tentei vender a mesma coisa duas vezes pro mesmo cliente. Ele nem percebeu!",
    "Meu maior talento \xE9 fazer qualquer coisa parecer uma pechincha.",
    "Uma vez vendi um item quebrado como 'edi\xE7\xE3o especial'. Funcionou.",
    "Eu falo tanto que \xE0s vezes esque\xE7o o que ia dizer no meio da frase.",
    "J\xE1 perdi a conta de quantas vezes chamei o mesmo item de 'rar\xEDssimo'."
  ],
  conselhos: [
    "Nunca compra o primeiro pre\xE7o. Nem de mim.",
    "Guarda uma reserva de Gold sempre. Emerg\xEAncia \xE9 emerg\xEAncia.",
    "Escuta o vendedor, mas confia no seu bolso.",
    "Todo item bom vale a pena negociar. Todo mesmo.",
    "Compra o que voc\xEA precisa. Depois compra o que voc\xEA quer. Nessa ordem, se conseguir."
  ],
  fofocas: [
    "Ouvi dizer que o Dorwin nunca gasta nada. NUNCA. Nem um Gold.",
    "Dizem que a Greta sabe de tudo que acontece nesse Reino. Inveja profissional.",
    "O Borin reclama dos meus pre\xE7os mas nunca deixou de comprar ferro de mim.",
    "Escutei que algu\xE9m ofereceu flores pro Borin. Ningu\xE9m sabe quem.",
    "N\xE3o devia contar isso, mas... ah, quem estou enganando, eu conto tudo."
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
    "O tempo \xE9 s\xF3 uma sugest\xE3o, na minha experi\xEAncia."
  ],
  humor: [
    "J\xE1 tentei fazer po\xE7\xE3o de sono. Dormi tr\xEAs dias. Funcionou bem demais.",
    "Meu caldeir\xE3o explodiu uma vez s\xF3 porque eu espirrei.",
    "As pessoas acham que eu sei tudo. Eu s\xF3 finjo bem.",
    "J\xE1 confundi ingrediente de po\xE7\xE3o com o jantar. Foi uma noite interessante.",
    "Previ que ia chover. Estava certo. Tamb\xE9m previ que ia nevar no mesmo dia. Errei feio."
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
    "Escutei um rumor sobre mim mesmo outro dia. Nem tudo era mentira."
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
    "Sil\xEAncio, \xE0s vezes, \xE9 a resposta mais honesta que tenho."
  ],
  humor: [
    "J\xE1 ri de verdade uma vez. Foi memor\xE1vel, pelo menos pra mim.",
    "Dizem que eu nunca sorrio. N\xE3o \xE9 bem verdade. \xC9 raro, s\xF3 isso.",
    "Um aventureiro uma vez tentou me impressionar trope\xE7ando na entrada. Funcionou, de um jeito.",
    "Se voc\xEA me fizer rir, considere isso uma conquista rara.",
    "Tenho senso de humor. Guardo ele para ocasi\xF5es especiais."
  ],
  conselhos: [
    "Escolha suas batalhas. Nem todas precisam ser suas.",
    "Confie aos poucos. Confian\xE7a dada demais r\xE1pido quebra f\xE1cil.",
    "Liderar n\xE3o \xE9 mandar. \xC9 responder por quem segue voc\xEA.",
    "Nunca subestime quem parece fraco no come\xE7o.",
    "O Reino lembra de quem ajuda, n\xE3o s\xF3 de quem vence."
  ],
  fofocas: [
    "N\xE3o costumo repetir fofoca. Mas sei de quase tudo que acontece aqui.",
    "Ouvi que o Kade treina sozinho de madrugada. N\xE3o me surpreende.",
    "Dizem que a Greta sabe de tudo antes de todo mundo. Talvez seja verdade.",
    "O Dorwin reclama at\xE9 de mim, ocasionalmente. Eu deixo passar.",
    "Prefiro observar a fofoca do que participar dela."
  ],
  comentarios_reino: [
    "Esse Reino sobrevive porque as pessoas escolhem ficar, n\xE3o porque s\xE3o obrigadas.",
    "Vejo esse lugar crescendo. Com cuidado, vai crescer bem.",
    "O Reino \xE9 feito de quem escolhe ficar. Sempre acreditei nisso.",
    "Cada gera\xE7\xE3o fortalece esse lugar um pouco mais. Ou o enfraquece. Depende de n\xF3s.",
    "Esse Reino j\xE1 passou por coisas piores. Ainda est\xE1 de p\xE9."
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
    "Prefiro n\xFAmeros a conversa fiada. N\xFAmeros n\xE3o mentem."
  ],
  humor: [
    "J\xE1 economizei tanto numa semana que esqueci de comer direito. N\xE3o recomendo.",
    "Uma vez guardei uma moeda t\xE3o bem que nem eu lembrava onde estava.",
    "Dizem que eu sou p\xE3o-duro. Eu prefiro 'cuidadoso'.",
    "J\xE1 neguei um empr\xE9stimo pra mim mesmo, teoricamente. Levando a s\xE9rio a regra.",
    "Se eu risse por cada moeda economizada, riria o dia inteiro."
  ],
  conselhos: [
    "Guarda antes de gastar. Nunca o contr\xE1rio.",
    "Todo Gold tem que ter destino antes de sair do bolso.",
    "N\xE3o empresta o que n\xE3o pode perder.",
    "Desperd\xEDcio hoje \xE9 necessidade amanh\xE3.",
    "Antes de comprar algo caro, espera um dia. Se ainda quiser, compra."
  ],
  fofocas: [
    "Ouvi dizer que a Talia vendeu a mesma espada tr\xEAs vezes. Isso \xE9 golpe, n\xE3o venda.",
    "O Borin nunca cobra o pre\xE7o justo do pr\xF3prio trabalho. Estranho.",
    "A Greta sabe quanto cada um gasta nessa Capital. Prefiro nem perguntar como.",
    "Dizem que o Zoltar prev\xEA o futuro. Duvido que ele preveja os pr\xF3prios gastos.",
    "N\xE3o repito fofoca, mas registro os n\xFAmeros por tr\xE1s dela."
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
    "Um bom advers\xE1rio te ensina mais que dez vit\xF3rias f\xE1ceis."
  ],
  humor: [
    "J\xE1 treinei tanto num dia que nem lembrava meu pr\xF3prio nome depois.",
    "Uma vez desafiei minha pr\xF3pria sombra. Perdi. N\xE3o pergunta como.",
    "Treino tamb\xE9m ajuda. Principalmente quando voc\xEA acha que n\xE3o precisa.",
    "J\xE1 ca\xED de tanto treinar equil\xEDbrio. A ironia n\xE3o passou despercebida.",
    "Se disciplina fosse engra\xE7ada, eu seria o homem mais engra\xE7ado do Reino."
  ],
  conselhos: [
    "Treina todo dia, mesmo que pouco.",
    "Nunca subestima um advers\xE1rio calmo.",
    "Descanso faz parte do treino. N\xE3o \xE9 pregui\xE7a, \xE9 estrat\xE9gia.",
    "Foco vale mais que for\xE7a bruta.",
    "Antes de correr atr\xE1s de um Boss, aprenda a se defender de um lobo."
  ],
  fofocas: [
    "Ouvi dizer que algu\xE9m enfrentou um Boss usando Luvas Rasgadas. Respeito a ousadia.",
    "Dizem que o Borin nunca perde uma discuss\xE3o sobre ferro. Nunca testei.",
    "A Greta sabe de tudo que acontece na Arena antes de mim, \xE0s vezes.",
    "Escutei que a Talia tentou me vender um equipamento de treino in\xFAtil. N\xE3o ca\xED.",
    "N\xE3o repito fofoca fora da Arena. Aqui dentro, tudo bem."
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
    "O port\xE3o n\xE3o dorme. Eu tamb\xE9m n\xE3o, muito."
  ],
  humor: [
    "J\xE1 confundi uma cabra com um invasor. Foi uma noite longa.",
    "Uma vez saudei o vento por engano. Ningu\xE9m precisa saber disso. Menos ainda escrever.",
    "Desconfio at\xE9 de mim mesmo, \xE0s vezes.",
    "J\xE1 fiquei t\xE3o alerta que assustei um mercador s\xF3 de olhar.",
    "Se eu rir, \xE9 porque algo saiu muito errado ou muito certo."
  ],
  conselhos: [
    "Nunca sai sem checar o equipamento.",
    "Confia no seu instinto quando algo parecer errado.",
    "Grupo \xE9 sempre mais seguro que solit\xE1rio.",
    "Aprende o terreno antes de se aventurar longe.",
    "Volta antes do escuro, sempre que poss\xEDvel."
  ],
  fofocas: [
    "Ouvi dizer que a Talia vendeu a mesma espada tr\xEAs vezes. Isso deveria ser investigado.",
    "Dizem que o Zoltar prev\xEA o futuro. Prefiro n\xE3o testar essa teoria.",
    "A Greta sabe de tudo antes de todo mundo. Tenho teorias sobre isso.",
    "O Dorwin desconfia de todo mundo, menos de mim. N\xE3o sei se isso \xE9 elogio.",
    "N\xE3o repito fofoca em servi\xE7o. Fora dele, \xE0s vezes."
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
    "J\xE1 vi gente brigar por causa de uma hist\xF3ria que nem aconteceu."
  ],
  conselhos: [
    "Escuta mais do que fala. Voc\xEA aprende mais assim.",
    "Nem todo rumor \xE9 mentira. Nem todo rumor \xE9 verdade, tamb\xE9m.",
    "Cuidado com o que conta pra essa mesa. Vira hist\xF3ria r\xE1pido.",
    "Se quiser saber de algo, senta, pede uma bebida, e espera.",
    "Nunca confia cegamente num rumor. Nem no meu."
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
    "Um viajante jurou que os lobos do P\xE2ntano nadam melhor do que ca\xE7am. Bebeu antes de contar isso, mas mesmo assim."
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
    "Uma vez a hist\xF3ria era sobre mim mesma. Nem eu confirmo essa."
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
    "Nenhuma pergunta \xE9 boba o bastante pra n\xE3o merecer resposta."
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
    "Volte sempre que precisar entender algo melhor."
  ],
  fofocas: [
    "Ouvi dizer que a Talia vendeu a mesma espada tr\xEAs vezes. Prefiro n\xE3o confirmar.",
    "Dizem que o Zoltar prev\xEA o futuro atrav\xE9s dos frascos. Interessante hip\xF3tese.",
    "A Greta sabe de tudo antes de todo mundo. Ela deveria escrever um livro.",
    "O Dorwin conta o mesmo Gold duas vezes, segundo dizem. Isso parece exaustivo.",
    "Prefiro n\xE3o repetir fofocas. Prefiro hist\xF3rias com mais subst\xE2ncia."
  ],
  comentarios_reino: [
    "Esse Reino tem mais hist\xF3ria guardada do que qualquer um imagina.",
    "Catalogar esse Reino \xE9 catalogar gera\xE7\xF5es de gente teimosa e curiosa.",
    "Capital pequena, mem\xF3ria enorme.",
    "Cada gera\xE7\xE3o acrescenta algo novo \xE0 hist\xF3ria desse lugar.",
    "Gosto de pensar que essa Biblioteca guarda um pouco de cada um que j\xE1 passou por aqui."
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
    "J\xE1 pensei em escrever meu pr\xF3prio livro. Talvez um dia eu tenha coragem."
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
    "O Reino \xE9 maior do que qualquer cat\xE1logo pode registrar."
  ],
  humor: [
    "Uma vez me disfarcei de arbusto pra observar uma criatura. Funcionou bem demais.",
    "J\xE1 fui confundido com uma est\xE1tua de tanto ficar parado observando.",
    "Um lobo uma vez me observou observando ele. Empate t\xE9cnico.",
    "J\xE1 anotei o comportamento errado numa p\xE1gina certa. Foi uma bagun\xE7a acad\xEAmica e tanto.",
    "Rio pouco, mas quando uma criatura faz algo inesperado, eu rio sozinho, tarde da noite."
  ],
  conselhos: [
    "Observe antes de agir. Isso salva vidas.",
    "Nenhuma criatura ataca sem motivo. Entenda o motivo primeiro.",
    "Anote o que aprender. A mem\xF3ria falha, o papel n\xE3o.",
    "Nunca subestime uma criatura s\xF3 porque parece pequena.",
    "Curiosidade \xE9 uma ferramenta t\xE3o \xFAtil quanto qualquer espada."
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
    "Dedicaria anos s\xF3 pra entender por que uma noite inteira, h\xE1 muito tempo, nenhum lobo uivou no Bosque."
  ],
  comentarios_reino: [
    "Esse Reino tem uma biodiversidade fascinante ao redor.",
    "Cada regi\xE3o desse Reino guarda esp\xE9cies que ainda n\xE3o documentei completamente.",
    "O Reino cresce, e as criaturas ao redor se adaptam a isso.",
    "Vivemos cercados de mist\xE9rios que a maioria nunca para pra observar.",
    "Esse lugar merece d\xE9cadas de estudo, n\xE3o anos."
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
    "O tempo apaga detalhes, mas raramente apaga o essencial."
  ],
  humor: [
    "Uma vez catalogei um item errado por semanas. Um historiador tamb\xE9m erra, apesar do que dizem.",
    "J\xE1 confundi uma r\xE9plica com o item original. Ningu\xE9m percebeu, felizmente.",
    "Um visitante uma vez tentou vender de volta um item que doou. Recusei, educadamente.",
    "Prefiro rir baixo, entre as exposi\xE7\xF5es. N\xE3o conv\xE9m perturbar os artefatos.",
    "J\xE1 perdi um documento importante dentro do pr\xF3prio Museu. Levei um m\xEAs pra achar."
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
    "Prefiro fato a fofoca, mas reconhe\xE7o quando uma \xE9 boa o bastante para virar a outra, com o tempo."
  ],
  comentarios_reino: [
    "Esse Reino j\xE1 viveu mais eras do que a maioria imagina.",
    "Cada pedra dessa Capital guarda uma camada de hist\xF3ria.",
    "O Reino de hoje \xE9 s\xF3 mais um cap\xEDtulo de uma hist\xF3ria muito mais longa.",
    "Gosto de pensar que ainda estamos escrevendo os melhores cap\xEDtulos.",
    "Esse lugar merece ser lembrado com precis\xE3o, n\xE3o com exagero."
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
  boas_vindas: [],
  primeiro_encontro: [],
  novato: [],
  veterano: [],
  nivel_alto: [],
  boss_derrotado: [],
  sem_gold: [],
  muito_gold: [],
  chovendo: [],
  noite: [],
  primeira_visita: [],
  visitas_repetidas: [],
  aleatorias: [],
  humor: [],
  conselhos: [],
  fofocas: [
    "J\xE1 vi o mesmo lobo marcado em duas regi\xF5es diferentes, no mesmo dia. N\xE3o sei explicar.",
    "Cruzei com um lobo das Colinas \xC1ridas duas vezes na mesma travessia. Magro, mas r\xE1pido.",
    "Os lobos do P\xE2ntano Podre nadam melhor do que ca\xE7am. Vi com meus pr\xF3prios olhos."
  ],
  comentarios_reino: [],
  comentarios_npcs: [],
  raras: [],
  extremamente_raras: []
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
  // Roth — Guarda do Portão Norte, reage a regiões descobertas.
  guarda: [
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

// apps/web/src/components/city/NpcIntro.tsx
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
function NpcIntro({ npc }) {
  const { character } = useCharacter(true);
  const { identity } = useIdentity(true);
  const channel = getStoredChannel();
  const kingdomRoles = useKingdomRole(channel || void 0, true);
  const catalog = NPC_DIALOGUE[npc.key];
  const [fallbackLine] = (0, import_react2.useState)(() => catalog ? randomLine(catalog) : null);
  const recognitionLine = (0, import_react2.useMemo)(() => {
    if (!character || !identity) return null;
    const ctx = {
      level: character.level,
      gold: character.gold,
      totalMinutes: character.total_minutes,
      hasEquippedItem: character.equipped.length > 0,
      bossesDefeated: identity.bosses_defeated,
      regionsDiscovered: identity.regions_discovered,
      hasCompletedFirstExpedition: identity.first_expedition_at !== null,
      hasEquippedTitle: identity.equipped_title !== null,
      hasKingdomRole: kingdomRoles.length > 0,
      isFirstCityVisit: !isFlagSet("city_seen")
    };
    return getRecognitionLine(npc.key, ctx);
  }, [npc.key, character, identity, kingdomRoles]);
  const line = recognitionLine ?? fallbackLine;
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "npc-intro", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(NpcPortrait, { npc }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "npc-intro-text", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { className: "npc-name", children: npc.name }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "npc-profession", children: npc.profession }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "npc-quote", children: [
        '"',
        npc.quote,
        '"'
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "npc-description", children: npc.description }),
      line ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "npc-line", children: [
        '"',
        line,
        '"'
      ] }) : null
    ] })
  ] });
}

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

export {
  CityMap,
  NpcIntro,
  NPCS
};
