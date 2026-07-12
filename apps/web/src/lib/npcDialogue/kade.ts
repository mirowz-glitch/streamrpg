import type { NpcDialogueCatalog } from "./types";

// Sprint Living NPCs (MVP) — Kade, o Mestre da Arena: vive falando de
// treino, competição e disciplina. Tudo, pra ele, é uma questão de
// preparo.
export const KADE_DIALOGUE: NpcDialogueCatalog = {
  boas_vindas: [
    "Entra. Espero que tenha treinado hoje.",
    "Bem-vindo à Arena. Aqui só existe disciplina.",
    "Chegou. Bom. Sempre há espaço pra mais um que queira treinar.",
    "Bem-vindo. Cicatrizes contam mais histórias que troféus, lembre-se disso.",
    "Entra. Já treinei antes de você chegar. Sempre treino antes.",
  ],
  primeiro_encontro: [
    "Cara nova na Arena. Vamos ver do que você é feito.",
    "Nunca te vi treinar. Isso muda agora.",
    "Primeira vez aqui? Espero que não seja a última.",
    "Bem-vindo. Toda jornada começa com o primeiro treino.",
    "Você é novo. Isso não é desculpa pra não se esforçar.",
  ],
  novato: [
    "Novato. Treino compensa a falta de experiência, com o tempo.",
    "Todo campeão começou sem saber nada. Continue treinando.",
    "Disciplina supera talento no começo. Lembra disso.",
    "Você ainda tem muito a aprender. Isso é bom. Significa espaço pra crescer.",
    "Iniciante que treina toda semana chega mais longe que talento que não aparece.",
  ],
  veterano: [
    "Veterano. Já não precisa de motivação, só de manutenção.",
    "Você treinou bastante pra chegar até aqui. Continue.",
    "Experiência sem treino contínuo enferruja rápido.",
    "Você já provou seu valor. Não pare agora.",
    "Veterano de verdade é aquele que ainda aparece pra treinar.",
  ],
  nivel_alto: [
    "Poder sem disciplina é desperdício. O seu, felizmente, parece ter as duas coisas.",
    "Forte assim, você virou referência. Trate isso com seriedade.",
    "Nível alto exige treino ainda mais rigoroso, não menos.",
    "Você chegou longe. Isso não significa que pode parar de treinar.",
    "Poder desse tamanho merece um adversário à altura. Ainda estou esperando um.",
  ],
  boss_derrotado: [
    "Um Boss derrotado. Isso é treino valendo a pena.",
    "Vitória contra um Boss prova mais que qualquer treino na Arena.",
    "Você encarou algo grande e venceu. Isso é disciplina em ação.",
    "Cicatrizes de Boss valem mais que qualquer troféu daqui.",
    "Parabéns. Agora volta pra treinar antes que fique convencido demais.",
  ],
  sem_gold: [
    "Sem Gold não impede ninguém de treinar.",
    "Aqui não cobra pra suar. Só exige esforço.",
    "Dinheiro vai e vem. Disciplina fica.",
    "Sem moeda hoje, mas com disposição, espero.",
    "Bolso vazio não é desculpa pra pular treino.",
  ],
  muito_gold: [
    "Muito Gold não compra disciplina. Isso se conquista.",
    "Rico assim, espero que também seja forte.",
    "Dinheiro não substitui treino. Nunca substituiu.",
    "Gold em excesso é bom. Poder conquistado com esforço é melhor.",
    "Guarda esse dinheiro. Ou investe em treino, se quiser meu conselho.",
  ],
  chovendo: [
    "Chuva não cancela treino. Só molha o chão.",
    "Treinar na chuva separa quem é sério de quem não é.",
    "Dia de chuva é dia de testar sua determinação.",
    "A Arena continua aberta, chova o quanto for.",
    "Chuva é só mais um obstáculo. Treino é sobre superar obstáculos.",
  ],
  noite: [
    "Treino de madrugada. Ninguém questiona, ninguém atrapalha.",
    "A Arena vazia de noite é o melhor lugar pra pensar.",
    "Se veio treinar de noite, já tem minha admiração.",
    "Noite é quando eu treino sozinho. Sempre foi assim.",
    "Escuridão não desculpa preguiça.",
  ],
  primeira_visita: [
    "Primeira vez na Arena. Espero que não seja a última.",
    "Bem-vindo. Aqui você vai suar antes de aprender qualquer coisa.",
    "Você nunca treinou aqui. Isso muda hoje.",
    "Primeira visita é onde tudo começa. Aproveita.",
    "Entra. Vamos ver seu potencial de verdade.",
  ],
  visitas_repetidas: [
    "Você de novo. Isso é disciplina, ou eu não entendo mais nada.",
    "Voltou pra treinar. Exatamente como devia ser.",
    "Sua constância impressiona.",
    "Cada vez que aparece, fica um pouco mais forte. Continua assim.",
    "Voltar sempre pra treinar é o que separa quem cresce de quem estagna.",
  ],
  aleatorias: [
    "Cicatrizes contam mais histórias que troféus.",
    "Já vi incontáveis Bosses caírem. Lembro do nome de quem os derrotou.",
    "Treino todo dia. Até quando não quero.",
    "Disciplina é fazer o que precisa ser feito, mesmo sem vontade.",
    "Um bom adversário te ensina mais que dez vitórias fáceis.",
    // Sprint Social Fabric (Phase I)
    "A Elenya negociou financiamento pra Arena numa época em que ninguém mais achava que valia a pena. Não esqueço esse tipo de aposta.",
  ],
  humor: [
    "Já treinei tanto num dia que nem lembrava meu próprio nome depois.",
    "Uma vez desafiei minha própria sombra. Perdi. Não pergunta como.",
    "Treino também ajuda. Principalmente quando você acha que não precisa.",
    "Já caí de tanto treinar equilíbrio. A ironia não passou despercebida.",
    "Se disciplina fosse engraçada, eu seria o homem mais engraçado do Reino.",
    // Sprint Social Fabric (Phase I)
    "Nunca bebo nada que o Zoltar me oferece antes de uma luta. Uma vez bebi. Uma vez foi suficiente.",
  ],
  conselhos: [
    "Treina todo dia, mesmo que pouco.",
    "Nunca subestima um adversário calmo.",
    "Descanso faz parte do treino. Não é preguiça, é estratégia.",
    "Foco vale mais que força bruta.",
    "Antes de correr atrás de um Boss, aprenda a se defender de um lobo.",
    // Sprint Social Fabric (Phase I)
    "Já caçamos lado a lado, eu e o Roth, antes dele virar guarda do Portão Norte. Ele nunca admite quem mirava melhor naquela época.",
  ],
  fofocas: [
    "Ouvi dizer que alguém enfrentou um Boss usando Luvas Rasgadas. Respeito a ousadia.",
    "Dizem que o Borin nunca perde uma discussão sobre ferro. Nunca testei.",
    "A Greta sabe de tudo que acontece na Arena antes de mim, às vezes.",
    "Escutei que a Talia tentou me vender um equipamento de treino inútil. Não caí.",
    "Não repito fofoca fora da Arena. Aqui dentro, tudo bem.",
    // Sprint Kingdom Folk (Phase I)
    "Um palhaço de feira conseguiu, uma vez, me fazer rir. Não repito a piada. Mas aconteceu.",
    "Ferrador bom vale tanto quanto arqueiro bom. Ninguém vence disputa nenhuma com cavalo mal ferrado.",
    "Tosquiador mais rápido do Reino, dizem. Desafiei ele pra Arena. Recusou. Sábio da parte dele.",
    // Sprint Kingdom Government (Phase I)
    "Convocação urgente do Marechal, ninguém explica o motivo até hoje. Prefiro treinar do que especular sobre papelada.",
    "O Fiscal de Mercado se disfarça de comprador nas feiras. Eu reconheceria ele em segundos, só pela postura de quem nunca lutou de verdade.",
    "Não me importo com decreto nenhum, contanto que ninguém proíba treino na Arena. O resto é problema de conselheiro.",
    // Sprint Kingdom Memories (Phase I)
    "O Guia que Voltou Sozinho pros Picos Congelados não é lenda pra mim. É o tipo de coragem que eu tento ensinar aqui, sem nunca alcançar de verdade.",
    "Todos os mineiros foram resgatados do Colapso da Mina Funda. Vitória de verdade. Ainda assim, atrasou obra do Reino por anos. Vitória cara, sempre.",
    "Ninguém treina pra ser o último a sair de um incêndio. Mas Bram foi, e isso vale mais que qualquer torneio que eu já organizei.",
    // Sprint First WOW Moment (Phase I)
    "Treinar com luvas rasgadas separa quem quer treinar de quem só quer conversar.",
    // Sprint StreamRPG Identity (Phase II)
    "O Roth nunca larga o posto do Portão Norte. Nem quando ofereço treino gratuito na Arena. Respeito isso mais do que admito.",
    // Sprint Place Identity (Phase I)
    "Levo os alunos novos pra molhar o rosto na Fonte antes do primeiro treino. Ajuda a acordar de vez.",
    "Treino perto da Torre do Portão Norte de propósito. O eco de lá me ajuda a contar o ritmo dos golpes.",
  ],
  comentarios_reino: [
    "Esse Reino precisa de mais gente disposta a treinar de verdade.",
    "Capital forte é Capital que treina, não só que celebra vitórias.",
    "Vejo potencial nesse Reino. Falta só disciplina coletiva.",
    "Esse lugar produz bons aventureiros. Poderia produzir ainda melhores.",
    "O Reino respeita quem se esforça. Isso eu aprovo.",
  ],
  comentarios_npcs: [
    "O Borin entende de ferramenta como eu entendo de treino.",
    "A Elenya lidera com disciplina. Reconheço isso nela.",
    "O Roth tem a postura de quem treinou a vida toda. Desconfio que treinou mesmo.",
    "A Miriam nunca pisou aqui, que eu saiba. Cada um tem seu campo de batalha.",
    "O Yannick observa tudo como se fosse estudar meu treino. Talvez seja.",
  ],
  raras: [
    "Já perdi uma luta importante por excesso de confiança. Nunca mais repeti o erro.",
    "Tive um mestre que me ensinou tudo que sei. Ele nunca aceitou nenhum crédito por isso.",
    "Uma vez pensei em desistir da Arena. Foi um treino ruim que me fez ficar.",
    "Guardo a memória de cada Boss que vi cair. Todos eles.",
    "Já treinei até sangrar. Não recomendo, mas não me arrependo.",
  ],
  extremamente_raras: [
    "Tenho medo de um dia não ter mais ninguém disposto a treinar de verdade.",
    "Se eu cair um dia, quero que seja treinando, não descansando.",
    "Já chorei depois de uma vitória difícil. Ninguém viu. Prefiro assim.",
    "Se algo me acontecer, quero que a Arena continue de portas abertas pra qualquer um disposto a suar.",
    "Treino desde sempre porque tenho medo do dia em que não for mais forte o bastante pra proteger esse Reino.",
  ],
};
