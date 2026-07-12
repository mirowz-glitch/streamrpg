import type { NpcDialogueCatalog } from "./types";

// Sprint Living NPCs (MVP) — Greta, a Taverneira: ouve tudo, sabe tudo,
// mas nunca afirma nada. Sempre "foi o que ouvi...".
export const GRETA_DIALOGUE: NpcDialogueCatalog = {
  boas_vindas: [
    "Entra, entra. Aqui, toda história vale uma bebida.",
    "Bem-vindo à Taverna. Senta que a noite é longa.",
    "Chegou bem a tempo de ouvir algo interessante. Ou de virar assunto.",
    "Bem-vindo. Aqui ninguém bebe sozinho, nem escuta sozinho.",
    "Entra. Foi o que ouvi, que você chegaria hoje.",
  ],
  primeiro_encontro: [
    "Cara nova. Já ouvi rumores sobre você, mas não confirmo nada.",
    "Nunca te vi por aqui. Foi o que me disseram, pelo menos.",
    "Primeira vez na Taverna? Foi o que ouvi de você mesmo, agora há pouco.",
    "Bem-vindo. Toda história começa numa mesa como essa.",
    "Você é novo. Ainda não tenho rumor nenhum sobre você. Isso muda rápido.",
  ],
  novato: [
    "Novato. Foi o que ouviram dizer sobre você, pelo menos.",
    "Ainda não corre rumor nenhum sobre você. Aproveita enquanto dura.",
    "Iniciante que aparece aqui já é meio caminho andado pra virar história.",
    "Você ainda não sabe o quanto essa mesa sabe sobre todo mundo.",
    "Foi o que me contaram: você é novo. Vamos ver quanto tempo isso dura.",
  ],
  veterano: [
    "Já ouvi seu nome em mais de uma mesa. Isso é raro.",
    "Veterano. Foi o que disseram, e por uma vez, acredito.",
    "Você virou assunto por aqui, sabia?",
    "Já não é mais rumor. Virou reputação.",
    "Foi o que ouvi: que você já não se assusta com nada. Confere?",
  ],
  nivel_alto: [
    "Foi o que ouvi: que seu poder anda impressionando gente por aí.",
    "Nível alto chama atenção. E atenção vira conversa nessa mesa.",
    "Dizem que você ficou forte. Eu só repito o que ouço.",
    "Sua fama chegou antes de você hoje.",
    "Foi o que me contaram: que ninguém mais duvida do seu poder.",
  ],
  boss_derrotado: [
    "Foi o que ouvi: que você derrotou um Boss. A Taverna toda comenta.",
    "Um Boss derrotado vira história rápido por aqui.",
    "Dizem que você venceu algo grande. Isso pede um brinde.",
    "Foi o que me contaram, com detalhes exagerados, provavelmente.",
    "Essa história do Boss já rendeu três versões diferentes essa noite.",
  ],
  sem_gold: [
    "Sem Gold hoje? Foi o que ouvi. Sem problema por aqui.",
    "Bolso vazio não impede ninguém de escutar uma boa história.",
    "Sem dinheiro, mas com boas orelhas. Isso já é o suficiente aqui.",
    "Foi o que me disseram: que você tá liso. Senta assim mesmo.",
    "Sem moeda hoje. A conversa continua de graça.",
  ],
  muito_gold: [
    "Muito Gold, foi o que ouvi. Isso rende conversa boa.",
    "Rico assim, vira assunto rápido nessa mesa.",
    "Dizem que você anda bem de vida. Espero que compartilhe uma rodada.",
    "Foi o que me contaram: que seu bolso anda cheio. Confirma?",
    "Gold assim atrai gente querendo conversar com você. Cuidado.",
  ],
  chovendo: [
    "Chuva lá fora, história aqui dentro. Combinação perfeita.",
    "Dia de chuva enche a Taverna de gente com histórias novas.",
    "Foi o que ouvi: que a chuva traz mais rumor que sol.",
    "Chuva boa pra ouvir história e não sair de perto do fogo.",
    "Dias assim, ninguém quer ir embora cedo.",
  ],
  noite: [
    "A noite é quando as melhores histórias saem da boca das pessoas.",
    "Foi o que ouvi: que segredo de dia vira rumor de noite.",
    "Noite na Taverna nunca é silenciosa.",
    "Se veio de noite, já sei que quer ouvir alguma coisa.",
    "A Taverna nunca dorme. Nem eu, aparentemente.",
  ],
  primeira_visita: [
    "Primeira vez aqui. Foi o que me disseram, pelo menos.",
    "Bem-vindo pela primeira vez. Senta, ouve, e depois me conta o que achou.",
    "Você nunca esteve na Taverna. Isso vai virar rumor rapidinho.",
    "Primeira visita sempre rende boa história depois.",
    "Entra. Foi o que ouvi, que hoje seria sua primeira vez.",
  ],
  visitas_repetidas: [
    "Você de novo. Foi o que eu imaginei que aconteceria.",
    "Voltou. A Taverna já sente sua falta quando você não vem.",
    "Já é rosto conhecido nessa mesa.",
    "Foi o que ouvi de você mesmo: que ia voltar sempre. Cumpriu.",
    "Sempre que penso em fechar cedo, aparece você.",
  ],
  aleatorias: [
    "Foi o que ouvi... mas não confirmo nada.",
    "Cada mesa aqui guarda uma história diferente.",
    "Ninguém sai da Taverna sem deixar um rumor pra trás.",
    "Escuto mais do que falo. É assim que se sabe de tudo.",
    "Toda história aqui começa igual: 'você não vai acreditar no que ouvi'.",
  ],
  humor: [
    "Uma vez um cliente jurou ter visto um dragão. Era uma nuvem grande. Foi o que ouvi, pelo menos.",
    "Já ouvi três versões diferentes da mesma briga de mesa. Nenhuma batia.",
    "Alguém jurou que a cerveja daqui cura ressaca. Não cura, mas não conto.",
    "Foi o que ouvi: que ninguém sai da Taverna sabendo menos do que entrou.",
    "Já vi gente brigar por causa de uma história que nem aconteceu.",
    // Sprint Social Fabric (Phase I)
    "Teve uma festa em que o Kade não bebeu nem uma gota, só pra provar que aguentava ficar sóbrio até o fim. Ele não aguentou.",
  ],
  conselhos: [
    "Escuta mais do que fala. Você aprende mais assim.",
    "Nem todo rumor é mentira. Nem todo rumor é verdade, também.",
    "Cuidado com o que conta pra essa mesa. Vira história rápido.",
    "Se quiser saber de algo, senta, pede uma bebida, e espera.",
    "Nunca confia cegamente num rumor. Nem no meu.",
    // Sprint Social Fabric (Phase I)
    "A Talia já tentou fechar uma negociação bem aqui, nessa mesa. Não deu certo. Cobrei a rodada mesmo assim.",
  ],
  fofocas: [
    "Foi o que ouvi: que o Borin fala sozinho na forja.",
    "Dizem que a Talia vendeu a mesma espada três vezes. Isso é conversa boa.",
    "Ouvi que o Zoltar prevê o futuro. Nunca confirmei, nunca neguei.",
    "O Dorwin conta o mesmo Gold duas vezes. Foi o que me disseram, pelo menos.",
    "Não afirmo nada. Só repito o que chega até essa mesa.",
    // Sprint Wolves Ecosystem (Phase I)
    "Guardo uma presa de lobo debaixo do balcão. Não pergunta desde quando.",
    "Dizem que a matilha do Bosque cresceu. Aqui ninguém sabe contar quantos são de verdade.",
    "Um viajante jurou que os lobos do Pântano nadam melhor do que caçam. Bebeu antes de contar isso, mas mesmo assim.",
    // Sprint Ravens Ecosystem (Phase I)
    "Tem um corvo que entra aqui toda noite de chuva e só vai embora de madrugada. Ninguém mexe com ele.",
    "Um corvo pousou no parapeito e ficou olhando pra dentro a noite inteira. Nem os bêbados quiseram espantar.",
    "Não sei se corvo entende gente. Mas esse aí parece entender o cardápio.",
    // Sprint Ancient Ruins Ecosystem (Phase I)
    "Não entro em ruína nenhuma. Não porque tenha medo — porque não tenho tempo pra ficar sem resposta o dia inteiro.",
    "Todo viajante que passa por aqui tem uma teoria diferente sobre as Ruínas. Eu só sirvo a bebida e escuto todas.",
    "Um explorador jurou que via a mesma porta em dois lugares diferentes. Cobrei a conta e mandei ele dormir.",
    // Sprint Kingdom Government (Phase I)
    "Todo conselheiro que já sentou nessa mesa jura que não fala de política aqui. Todos falam, depois da segunda rodada.",
    "Ouvi de um cliente que o Marechal sumiu por uma geração e ninguém percebeu oficialmente. Aqui na Taverna, todo mundo percebeu.",
    "Não repito fofoca de governo pra fora dessa mesa. Fofoca de governo, aliás, é a que mais rende rodada extra.",
    // Sprint Kingdom Folklore (Phase I)
    "Toda noite alguém canta a cantiga do Sino da Torre errado. Já desisti de corrigir.",
    "A Festa da Chegada é a melhor noite do ano pra essa Taverna. Mais gente, mais rumor, mais rodada.",
    "Nunca recuso um brinde de estranho. Aprendi essa há anos, e aprendi bem antes de virar superstição de todo mundo.",
    // Sprint First WOW Moment (Phase I)
    "Um aventureiro entrou aqui com as luvas mais rasgadas que eu já vi. Ri baixinho. Ele nem percebeu.",
    // Sprint StreamRPG Identity (Phase I)
    "Aquela árvore da praça já era velha quando eu cheguei aqui. Acho que sempre vai estar lá, faça o que fizerem ao redor dela.",
    // Sprint Place Identity (Phase I)
    "Um cliente jurou que o barril da praça já foi cheio de moeda, uma vez. Ninguém confirma.",
  ],
  comentarios_reino: [
    "Esse Reino vive de histórias, mesmo quando finge que não.",
    "Foi o que ouvi: que esse lugar guarda mais segredo do que aparenta.",
    "Toda cidade pequena tem uma Taverna que sabe demais. Essa é a nossa.",
    "O Reino muda, mas a Taverna continua ouvindo tudo.",
    "Foi o que me disseram: que esse Reino nunca dorme de verdade.",
  ],
  comentarios_npcs: [
    "Borin fala demais. Foi o que ouvi de mais de uma pessoa.",
    "A Talia teria uma história pra cada moeda, se deixassem ela falar.",
    "Dizem que o Roth desconfia até da própria sombra. Não duvido.",
    "A Elenya sabe mais do que aparenta. Ela só não fala.",
    "O Yannick pergunta demais pra quem só quer beber tranquilo.",
  ],
  raras: [
    "Uma vez guardei um segredo por anos. Ainda guardo, na verdade.",
    "Já ouvi uma história tão triste que parei de servir a noite toda.",
    "Nem tudo que ouço eu repito. Alguns rumores morrem comigo.",
    "Já perdi a conta de quantas histórias já passaram por essa mesa.",
    "Uma vez a história era sobre mim mesma. Nem eu confirmo essa.",
    // Sprint Social Fabric (Phase I)
    "O Alaric vem aqui uma vez por semana, sempre sozinho, sempre calado. Nunca pergunto por quê. Só guardo a mesa dele.",
  ],
  extremamente_raras: [
    "Se um dia essa Taverna fechar, quero que seja porque o Reino não precisa mais de um lugar pra ouvir.",
    "Tenho medo de esquecer alguma história importante entre tantas outras.",
    "Já chorei escutando alguém contar sobre quem perdeu. Ninguém viu.",
    "Guardo um rumor que nunca vou repetir. Nem se perguntarem direito.",
    "Foi o que ouvi, uma vez, sobre mim mesma: que essa Taverna não seria a mesma sem alguém pra escutar.",
  ],
};
