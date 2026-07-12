import type { NpcDialogueCatalog } from "./types";

// Sprint Living NPCs (MVP) — Talia, a Mercadora: fala muito, adora
// vender, sempre acha que fez um ótimo negócio (mesmo quando não fez).
export const TALIA_DIALOGUE: NpcDialogueCatalog = {
  boas_vindas: [
    "Entra, entra! Tenho coisas novas, tenho coisas velhas, tenho de tudo!",
    "Ah, um cliente! Ou um amigo. Aqui é a mesma coisa!",
    "Bem-vindo à melhor loja da Capital! Da única loja da Capital, mas ainda assim a melhor!",
    "Que bom te ver! Chegou bem a tempo de eu contar uma história longa!",
    "Entra sem pressa. Ou com pressa. Eu falo rápido do mesmo jeito.",
  ],
  primeiro_encontro: [
    "Uma cara nova! Adoro caras novas, são as que ainda não sabem meus preços!",
    "Primeira vez aqui? Deixa eu te contar TUDO sobre essa loja.",
    "Bem-vindo, bem-vindo! Já vou avisando: eu falo muito.",
    "Você é novo por aqui. Isso é ótimo, porque eu tenho uma história pra cada cliente novo.",
    "Nunca te vi. Isso vai mudar rápido, eu prometo.",
  ],
  novato: [
    "Novato! Deixa eu te vender algo que você definitivamente precisa. Ou não. Mas compra assim mesmo.",
    "Ai que fofo, ainda pergunta o preço antes de comprar.",
    "Novatos são meus favoritos. Ainda acham que estão fazendo um bom negócio.",
    "Vem cá, deixa eu te explicar como esse Reino funciona. Vai levar um tempinho.",
    "Você tem cara de quem vai comprar demais e se arrepender depois. Adoro esse tipo.",
  ],
  veterano: [
    "Já não cai mais nas minhas conversas, hein.",
    "Veterano desconfiado. Melhor cliente que existe: sabe o que quer.",
    "Você já viu meus truques todos. Mas volta mesmo assim!",
    "Cliente antigo é cliente de confiança. Confiança pra eu tentar vender mais caro, é claro.",
    "Você negocia bem agora. Aprendeu com quem, hein?",
  ],
  nivel_alto: [
    "Olha só quem ficou importante! Ainda compra aqui, que honra!",
    "Você tá forte. Forte o bastante pra carregar mais compras, aposto.",
    "Nível alto merece desconto. Ou não. Vamos ver como eu me sinto hoje.",
    "Gente poderosa sempre precisa de mais coisas. É assim que o comércio funciona!",
    "Você chegou longe. Chegou longe o bastante pra gastar mais aqui, também.",
  ],
  boss_derrotado: [
    "Você derrotou um BOSS?! Conta tudo, com detalhes, eu preciso vender essa história pros outros clientes!",
    "Herói de Boss na minha loja! Isso é ótimo pro movimento!",
    "Ouvi dizer que você venceu um Boss. Isso pede uma comemoração. Ou uma compra.",
    "Matador de Boss e ainda vem fazer compras. Que humildade.",
    "Se você sobreviveu a um Boss, sobrevive ao meu preço também.",
  ],
  sem_gold: [
    "Sem Gold? Ah, que pena, que pena mesmo. Volta quando tiver!",
    "Sem dinheiro hoje? Tudo bem, eu converso de graça pelo menos.",
    "Sem Gold é temporário. Minha paciência com quem não compra, também.",
    "Ah, você tá liso. Bom saber pra eu não perder tempo te oferecendo nada caro.",
    "Sem moeda hoje. Volta amanhã, quem sabe muda a sorte.",
  ],
  muito_gold: [
    "MUITO Gold?! Deixa eu te mostrar tudo que eu tenho. TUDO.",
    "Você tá rico! Isso pede uma prateleira inteira só pra você.",
    "Cliente rico é meu tipo favorito de cliente!",
    "Com esse dinheiro todo, vamos fazer um ótimo negócio hoje. Ótimo pra mim, pelo menos.",
    "Gold desse jeito não é pra guardar. É pra circular. Aqui, de preferência.",
  ],
  chovendo: [
    "Chuva é ótima pra vendas! As pessoas entram só pra se abrigar e acabam comprando!",
    "Dia chuvoso, loja cheia. É lei.",
    "Não deixa a chuva molhar as mercadorias, por favor, elas já são caras o bastante secas.",
    "Chuva lá fora, negócio aqui dentro!",
    "Aproveita que tá chovendo e fica mais um pouco. Olhando as prateleiras, claro.",
  ],
  noite: [
    "Trabalho até tarde. Sempre tem alguém precisando de algo de última hora.",
    "Noite é boa pra fechar negócio. As pessoas ficam menos exigentes com sono.",
    "Ainda aberta! Sempre aberta, na verdade.",
    "De noite os preços continuam os mesmos. Só peço perdão!",
    "Boa noite! Ou boa hora de comprar, tanto faz pra mim.",
  ],
  primeira_visita: [
    "Primeira visita! Deixa eu te mostrar a loja inteirinha, tenho tempo.",
    "Você nunca esteve aqui? Isso é uma injustiça que vamos corrigir agora.",
    "Bem-vindo pela primeira vez! A partir de agora, é sempre bem-vindo.",
    "Primeira vez é a melhor: tudo parece novo, até os preços de sempre.",
    "Entra! Depois me conta o que achou. Eu já sei que vai gostar.",
  ],
  visitas_repetidas: [
    "Você de novo! Já é cliente da casa!",
    "Voltou rápido. Bom sinal, ou falta de opção.",
    "Sempre que penso em fechar mais cedo, aparece você.",
    "Tá virando hábito isso. Gosto de hábitos que envolvem compras.",
    "Já perdi a conta de quantas vezes você veio aqui essa semana.",
  ],
  aleatorias: [
    "Sabia que já viajei por três Reinos antes desse aqui? Já contei essa história?",
    "Um dia vou ter a maior loja do continente. Hoje não, mas um dia.",
    "Todo item aqui tem uma história. Umas mais verdadeiras que outras.",
    "Vendi um item pra mim mesma outro dia. Boa compra, aliás.",
    "Silêncio incomoda essa loja. Por isso eu falo tanto.",
    // Sprint Social Fabric (Phase I)
    "O Idris me trouxe mercadoria rara numa colheita ruim, quando ninguém mais tinha o que vender. Ainda devo essa a ele, de um jeito ou de outro.",
  ],
  humor: [
    "Já tentei vender a mesma coisa duas vezes pro mesmo cliente. Ele nem percebeu!",
    "Meu maior talento é fazer qualquer coisa parecer uma pechincha.",
    "Uma vez vendi um item quebrado como 'edição especial'. Funcionou.",
    "Eu falo tanto que às vezes esqueço o que ia dizer no meio da frase.",
    "Já perdi a conta de quantas vezes chamei o mesmo item de 'raríssimo'.",
    // Sprint Social Fabric (Phase I)
    "O Dorwin nunca confia em nenhum preço que eu dou, nem quando é justo. Um dia ele vai perceber que eu tinha razão. Um dia.",
  ],
  conselhos: [
    "Nunca compra o primeiro preço. Nem de mim.",
    "Guarda uma reserva de Gold sempre. Emergência é emergência.",
    "Escuta o vendedor, mas confia no seu bolso.",
    "Todo item bom vale a pena negociar. Todo mesmo.",
    "Compra o que você precisa. Depois compra o que você quer. Nessa ordem, se conseguir.",
    // Sprint Social Fabric (Phase I)
    "O Zoltar cobra caro demais pelos frascos dele. Eu cobro caro demais pelos meus itens. Nenhum dos dois admite isso pro outro.",
  ],
  fofocas: [
    "Ouvi dizer que o Dorwin nunca gasta nada. NUNCA. Nem um Gold.",
    "Dizem que a Greta sabe de tudo que acontece nesse Reino. Inveja profissional.",
    "O Borin reclama dos meus preços mas nunca deixou de comprar ferro de mim.",
    "Escutei que alguém ofereceu flores pro Borin. Ninguém sabe quem.",
    "Não devia contar isso, mas... ah, quem estou enganando, eu conto tudo.",
    // Sprint Kingdom Folk (Phase I)
    "Compro queijo da mesma queijeira há anos. Ela diz que reconhece o rebanho só de provar. Eu só quero saber se rende troco.",
    "O apicultor da Planície Dourada me vende o melhor mel do Reino. Nunca perguntei o segredo, só o preço.",
    "Tem um vinicultor que guarda um barril há doze anos esperando o ano perfeito. Já ofereci comprar. Ele nunca vende.",
    // Sprint Kingdom Government (Phase I)
    "Já reconheci três Fiscais de Mercado disfarçados, só pela forma de regatear. Eles acham que enganam. Eu só finjo não perceber.",
    "Edital de preço de feira muda toda estação, e nunca a meu favor. Um dia descubro quem escreve esses editais.",
    "Governo bom, pra mim, é aquele que cobra taxa justa e não aparece toda semana pra 'fiscalizar' o que já paguei pra fiscalizar ano passado.",
    // Sprint Kingdom Memories (Phase I)
    "Meu avô vendeu ferramenta fiada durante anos pra quem reconstruía depois do Grande Incêndio. Ainda tenho os cadernos de dívida dele, nunca cobrados.",
    "Um carroceiro levou famílias inteiras pra fora da Vila Queimada de graça. Já tentei pagar ele, anos depois. Recusou.",
    "Vitória cara é a que ninguém quer comemorar de novo. Ouvi isso de um cliente velho. Nunca esqueci.",
    // Sprint First WOW Moment (Phase I)
    "Tentei vender uma luva nova pra um aventureiro de luvas rasgadas. Ele preferiu ficar com as velhas. Respeito.",
    // Sprint StreamRPG Identity (Phase I)
    "Toda negociação importante desse Reino, cedo ou tarde, acaba discutida na mesa da Greta. Ela nem cobra pelo espaço. Devia.",
    // Sprint StreamRPG Identity (Phase II)
    "Dizem que a Rainha Meira negociou a reunificação numa mesa parecida com essa. Prefiro acreditar que sim — dá mais sentido ao meu trabalho.",
    // Sprint Place Identity (Phase I)
    "Vendo perto da Fonte da praça sempre que posso. O povo passa por ali pra beber água e acaba comprando alguma coisa no caminho.",
  ],
  comentarios_reino: [
    "Esse Reino cresce mais rápido do que minha prateleira consegue acompanhar!",
    "Tanta gente nova chegando ultimamente. Ótimo pro comércio!",
    "Capital pequena, oportunidades grandes. É assim que eu vejo.",
    "Todo mundo aqui trabalha duro. Menos os que só vêm olhar e não compram.",
    "Reino sem comércio não é Reino, é acampamento.",
  ],
  comentarios_npcs: [
    "O Borin é grosso, mas honesto. Prefiro assim.",
    "A Elenya lidera bem. Queria vender pra ela mais vezes.",
    "O Kade só fala de treino. Nunca compra nada além do essencial.",
    "A Miriam é ótima cliente. Compra livro sem nem negociar.",
    "O Yannick sempre pergunta 'de onde vem isso' antes de comprar qualquer coisa.",
  ],
  raras: [
    "Já fui embora de um Reino sem vender quase nada. Foi o pior mês da minha vida.",
    "Tive uma sócia, há muito tempo. Não deu certo. Prefiro trabalhar sozinha agora.",
    "Uma vez recusei vender um item porque achei ele perigoso demais. Só uma vez.",
    "Guardo o primeiro item que vendi nessa loja. Não é pra venda.",
    "Às vezes fico com medo de que ninguém mais precise comprar nada de ninguém.",
  ],
  extremamente_raras: [
    "Se essa loja fechar um dia, quero que seja porque todo mundo já tem o que precisa. Não porque ninguém confiou em mim.",
    "Falo tanto porque tenho medo do silêncio. Nunca contei isso pra ninguém.",
    "Já pensei em desistir de vender e só viajar de novo. Mas esse Reino me prendeu.",
    "Se eu parar de falar um dia, é porque algo está muito errado.",
    "Quero que, quando eu não estiver mais aqui, alguém lembre que eu sempre tentei fazer um bom negócio pros dois lados.",
  ],
};
