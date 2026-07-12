import type { NpcDialogueCatalog } from "./types";

// Sprint Living NPCs (MVP) — Curador Alaric: culto, fala como
// historiador. Vê o Reino como uma sucessão de capítulos ainda sendo
// escritos.
export const ALARIC_DIALOGUE: NpcDialogueCatalog = {
  boas_vindas: [
    "Bem-vindo ao Museu do Reino. Cada peça aqui tem uma história a contar.",
    "Entra. A história desse Reino agradece testemunhas.",
    "Seja bem-vindo. Você está prestes a caminhar entre memórias.",
    "Bem-vindo. Poucos entendem o peso do que guardamos aqui.",
    "Entra com respeito. O que vê aqui, um dia, será apenas lembrança.",
  ],
  primeiro_encontro: [
    "Nunca te vi por aqui. Talvez você mesmo vire história um dia.",
    "Cara nova no Museu. Todo visitante novo é um capítulo em aberto.",
    "Primeira vez aqui? Prepare-se para ver o Reino de outro ângulo.",
    "Bem-vindo. Espero que aprecie o peso da história tanto quanto eu.",
    "Você é novo. O tempo dirá se merece uma linha nos registros.",
  ],
  novato: [
    "Novato. Todo grande nome do Reino também começou sem nenhuma linha escrita sobre si.",
    "Ainda não há história registrada sobre você. Isso é só o começo.",
    "Todo iniciante é uma página em branco. Interessante pensar no que vai escrever nela.",
    "Você ainda tem tudo por construir. Isso é raro e valioso.",
    "Um dia, talvez, eu catalogue algo sobre você aqui dentro.",
  ],
  veterano: [
    "Veterano. Já existe algo digno de nota sobre seu percurso.",
    "Você já não é mais uma página em branco.",
    "Sua trajetória começa a merecer registro formal.",
    "Já vi passar aventureiros como você. Poucos deixam marca de verdade.",
    "Você amadureceu de um jeito que a história costuma notar.",
  ],
  nivel_alto: [
    "Seu poder já seria digno de uma exposição própria.",
    "Nível alto. A história lembra de quem chega tão longe.",
    "Poucos alcançam esse nível de força. Menos ainda merecem ser lembrados por isso.",
    "Espero que use esse poder de um jeito que valha a pena registrar.",
    "Força sem propósito é apenas nota de rodapé. A sua, espero, será capítulo.",
  ],
  boss_derrotado: [
    "Um Boss derrotado. Isso, sem dúvida, será registrado.",
    "Ouvi dizer que você venceu um Boss. Grandes Conquistas merecem exposição própria.",
    "Vitórias como essa moldam a história de um Reino inteiro.",
    "Você fez história hoje. Literalmente.",
    "Isso será lembrado. Farei questão de que seja.",
  ],
  sem_gold: [
    "Sem Gold não diminui o valor histórico de ninguém.",
    "A história não se mede em moedas, mas em feitos.",
    "Sem dinheiro hoje. Isso não impede o Museu de recebê-lo bem.",
    "O passado não cobra entrada. Sinta-se à vontade.",
    "Riqueza é passageira. Memória, não.",
  ],
  muito_gold: [
    "Muito Gold. Espero que parte disso ajude a preservar nossa história.",
    "Riqueza é interessante, mas o tempo trata todos os Gold da mesma forma: com indiferença.",
    "Com essa fortuna, talvez financie a próxima expedição arqueológica que precisamos.",
    "Gold em excesso é só isso: gold. A verdadeira riqueza está nas histórias.",
    "Espero que use essa riqueza para algo que mereça ser lembrado.",
  ],
  chovendo: [
    "Chuva combina com Museu. O silêncio se aprofunda.",
    "Dias de chuva trazem visitantes mais contemplativos.",
    "Gosto do som da chuva contra essas paredes antigas.",
    "Chuva lá fora, história aqui dentro, protegida do tempo.",
    "Aproveite a chuva para caminhar devagar entre as exposições.",
  ],
  noite: [
    "O Museu à noite tem um silêncio que nenhum livro descreve bem.",
    "Trabalho até tarde catalogando o que o Reino ainda não teve coragem de esquecer.",
    "A noite favorece a reflexão sobre o passado.",
    "Se veio de noite, prepare-se para um Museu ainda mais solene.",
    "A escuridão realça o peso de cada peça exposta aqui.",
  ],
  primeira_visita: [
    "Primeira vez no Museu. Prepare-se para ver esse Reino com outros olhos.",
    "Bem-vindo pela primeira vez. Cada exposição aqui merece atenção.",
    "Você nunca esteve aqui? Vamos começar pelo princípio, então.",
    "Primeira visita é sempre a mais reveladora.",
    "Entra. Deixe-me te mostrar o que a história desse Reino guarda.",
  ],
  visitas_repetidas: [
    "Você voltou. A história recompensa quem retorna.",
    "Já é visitante frequente. Isso me deixa satisfeito.",
    "Cada retorno seu revela algo que talvez tenha passado despercebido antes.",
    "Sua constância aqui já merece nota nos meus próprios registros.",
    "Voltar sempre ao passado é sinal de sabedoria, não de saudosismo.",
  ],
  aleatorias: [
    "Um objeto sem história é só um objeto. Aqui, cada um tem as duas coisas.",
    "Passo os dias catalogando o que o Reino ainda não teve coragem de esquecer.",
    "A história nunca é neutra. Alguém sempre decide o que vale a pena guardar.",
    "Cada geração reescreve um pouco do que a anterior deixou.",
    "O tempo apaga detalhes, mas raramente apaga o essencial.",
    // Sprint Social Fabric (Phase I)
    "O Roth escoltou um artefato instável até o Museu, anos atrás, sem perguntar o motivo. Nunca esqueci esse favor.",
  ],
  humor: [
    "Uma vez catalogei um item errado por semanas. Um historiador também erra, apesar do que dizem.",
    "Já confundi uma réplica com o item original. Ninguém percebeu, felizmente.",
    "Um visitante uma vez tentou vender de volta um item que doou. Recusei, educadamente.",
    "Prefiro rir baixo, entre as exposições. Não convém perturbar os artefatos.",
    "Já perdi um documento importante dentro do próprio Museu. Levei um mês pra achar.",
    // Sprint Social Fabric (Phase I)
    "Vou à Taverna da Greta uma vez por semana, sempre sozinho, sempre calado. Ela nunca pergunta por quê. Isso, sozinho, já é uma forma de amizade.",
  ],
  conselhos: [
    "Aprenda com quem veio antes. Isso poupa muitos erros.",
    "Guarde suas próprias histórias. Um dia elas importarão.",
    "Nunca subestime um objeto simples. A história raramente é óbvia.",
    "Questione o que ouvir sobre o passado. Nem tudo é registrado com honestidade.",
    "Deixe algo digno de ser lembrado, mesmo que pequeno.",
  ],
  fofocas: [
    "Ouvi dizer que a Talia vendeu a mesma espada três vezes. Isso seria uma nota curiosa nos registros comerciais.",
    "Dizem que o Zoltar prevê o futuro. A história adoraria confirmar isso, um dia.",
    "A Greta sabe de tudo antes de todo mundo. Ela seria uma cronista e tanto.",
    "O Dorwin registra cada moeda com mais rigor que muitos historiadores registram fatos.",
    "Prefiro fato a fofoca, mas reconheço quando uma é boa o bastante para virar a outra, com o tempo.",
    // Sprint Ancient Ruins Ecosystem (Phase I)
    "Doze sítios de ruínas, e nenhum me deu um único registro que eu pudesse fechar de verdade. Isso me tira o sono, com prazer.",
    "Tentei mover o bloco caído do Portal de Pedra da Fronteira pra uma exposição. Não consegui nem arranhar.",
    "A Estátua Sem Rosto é o item mais frustrante da minha carreira. Também é o mais valioso. As duas coisas, ao mesmo tempo.",
    // Sprint Kingdom Folklore (Phase I)
    "Recuso-me a expor 'a Viúva de Pedra' como fato histórico. Mas admito: guardo um registro dela, só por precaução.",
    "Folclore não é história. Mas às vezes acerta detalhes que a história oficial nunca documentou. Isso me incomoda profissionalmente.",
    "Quinze festas populares no Reino, e nenhuma delas está catalogada no Museu. Talvez devesse. Talvez perca a graça se eu catalogar.",
    // Sprint First WOW Moment (Phase I)
    "Deveria expor um par de Luvas Rasgadas aqui no Museu. 'Primeiros Passos', seria o nome da peça.",
    // Sprint StreamRPG Identity (Phase I)
    "As Ruínas Esquecidas não são só um sítio arqueológico pra mim. São parte de quem somos, gostemos ou não da resposta que dão.",
    // Sprint StreamRPG Identity (Phase II)
    "Gritei o próprio nome dentro da Câmara das Vozes, uma vez. O eco que voltou não soou como eu. Nunca mais repeti o teste.",
    "Levei uma equipe inteira pra tentar mover o bloco caído do Portal de Pedra da Fronteira. Nem com corda, nem com alavanca. Ele decide quando quer ser movido, aparentemente.",
  ],
  comentarios_reino: [
    "Esse Reino já viveu mais eras do que a maioria imagina.",
    "Cada pedra dessa Capital guarda uma camada de história.",
    "O Reino de hoje é só mais um capítulo de uma história muito mais longa.",
    "Gosto de pensar que ainda estamos escrevendo os melhores capítulos.",
    "Esse lugar merece ser lembrado com precisão, não com exagero.",
    // Sprint History of the Kingdom (Phase I)
    "Dez Eras eu já catalogo com alguma confiança. Suspeito que existam mais, perdidas antes de qualquer registro.",
    "A Quebra do Primeiro Reino é o evento que mais me tira o sono. Três causas possíveis, e nenhuma prova decisiva.",
    "Tenho um monumento inteiro dedicado a nomes que não aparecem em nenhum outro registro do Reino. Isso deveria me incomodar mais do que me incomoda.",
  ],
  comentarios_npcs: [
    "O Borin forja objetos que um dia serão peças de museu, sem saber disso.",
    "A Miriam e eu discutimos sobre história com frequência. Discordamos com respeito mútuo.",
    "A Elenya lidera de um jeito que a história vai lembrar bem.",
    "O Yannick documenta criaturas como eu documento objetos. Somos parecidos, de certa forma.",
    "O Roth vigia o presente. Eu registro o passado. Precisamos um do outro.",
  ],
  raras: [
    "Uma vez encontrei um documento que contradizia tudo que eu sabia sobre uma Era inteira. Ainda estudo isso.",
    "Já recusei expor um item por achá-lo perigoso demais para os olhos do público.",
    "Tive um mentor que me ensinou que nem toda verdade precisa ser dita imediatamente.",
    "Guardo um item que nunca expus publicamente. Talvez um dia esteja pronto.",
    "Já duvidei da minha própria interpretação de um fato histórico. Reescrevi o registro depois.",
  ],
  extremamente_raras: [
    "Tenho medo de que, um dia, ninguém mais se importe em lembrar o que viemos antes deles.",
    "Se esse Museu queimar um dia, quero acreditar que a memória sobrevive em quem visitou.",
    "Já chorei catalogando a história de alguém que ninguém mais lembrava.",
    "Se eu não estiver mais aqui, espero que continuem perguntando 'por quê' antes de guardar qualquer coisa.",
    "Quero que, no fim, lembrem que tentei preservar esse Reino com honestidade, não só com nostalgia.",
  ],
};
