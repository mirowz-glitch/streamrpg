import type { NpcDialogueCatalog } from "./types";

// Sprint Living NPCs (MVP) — Mestra Elenya: líder, acolhedora, confia
// pouco. Fala com autoridade calma, sempre observando mais do que diz.
export const ELENYA_DIALOGUE: NpcDialogueCatalog = {
  boas_vindas: [
    "Bem-vindo à Guilda. Aqui, todos têm um lugar.",
    "Entra. A Guilda é maior do que parece de fora.",
    "Seja bem-vindo. Vamos ver o que você traz consigo.",
    "A porta está sempre aberta. A confiança, nem tanto.",
    "Bem-vindo. Espero que mereça ficar.",
  ],
  primeiro_encontro: [
    "Nunca te vi por aqui. Vamos corrigir isso.",
    "Uma cara nova na Guilda. Vamos ver do que você é feito.",
    "Bem-vindo, aventureiro. Aqui se ganha respeito, não se recebe de graça.",
    "Primeira vez? Observo todos os que entram pela primeira vez com atenção redobrada.",
    "Você chegou. Falta ainda provar que veio para ficar.",
  ],
  novato: [
    "Todo Campeão já foi novato um dia. Lembre-se disso.",
    "Ainda tem muito a aprender. Isso não é insulto, é constatação.",
    "Novato que escuta chega longe. Novato que só fala, não.",
    "Vejo potencial. Vejo também impaciência. Cuidado com a segunda.",
    "Comece devagar. A Guilda não recompensa pressa.",
  ],
  veterano: [
    "Você já não precisa que eu explique como as coisas funcionam aqui.",
    "Veterano. Já ganhou meu respeito, mesmo que eu raramente demonstre.",
    "Você mudou desde que chegou. Para melhor, felizmente.",
    "Confio mais em você agora do que confiava antes. Isso não é pouco vindo de mim.",
    "Já provou seu valor. Não precisa provar de novo toda vez.",
  ],
  nivel_alto: [
    "Seu poder cresceu. Espero que sua responsabilidade também.",
    "Forte assim, você carrega mais do que combate. Carrega expectativa.",
    "Nível alto atrai atenção. Nem toda atenção é boa.",
    "Você se tornou alguém que outros vão querer imitar. Cuidado com o exemplo que dá.",
    "Poder sem propósito é perigoso. O seu, felizmente, parece ter um.",
  ],
  boss_derrotado: [
    "Um Boss derrotado. A Guilda registra isso com orgulho.",
    "Você enfrentou algo grande e voltou. Isso fala mais que qualquer discurso meu.",
    "Vitória contra um Boss merece reconhecimento. Você o tem.",
    "O Reino vai lembrar disso. Eu já lembro.",
    "Poucos enfrentam um Boss e voltam para contar. Você é um deles.",
  ],
  sem_gold: [
    "Sem Gold não é vergonha. É apenas um momento.",
    "A Guilda não mede valor em moeda.",
    "Falta de Gold hoje não define o que você vale.",
    "Já vi Campeões sem nada no bolso e tudo na postura.",
    "Sem dinheiro agora. Com determinação, ainda assim.",
  ],
  muito_gold: [
    "Muito Gold traz responsabilidade junto. Espero que saiba disso.",
    "Riqueza chama atenção. Use-a com cuidado.",
    "Gold em excesso separa quem usa bem de quem usa mal. Ainda não sei em qual grupo você está.",
    "Você prosperou. Espero que o Reino tenha prosperado com você.",
    "Dinheiro não compra confiança aqui. Isso se ganha de outra forma.",
  ],
  chovendo: [
    "Chuva não impede treino. Só atrasa.",
    "Dias assim testam quem realmente quer estar aqui.",
    "A Guilda continua de portas abertas, chova ou não.",
    "Chuva lá fora. Aqui dentro, o trabalho continua.",
    "Prefiro dias de chuva. Menos distração, mais foco.",
  ],
  noite: [
    "A Guilda nunca fecha de verdade. Nem de noite.",
    "Trabalho até tarde. Alguém precisa manter isso funcionando.",
    "Noite é quando decisões difíceis são tomadas, geralmente sozinha.",
    "Se veio de noite, é porque algo importa. Vamos conversar.",
    "A escuridão não muda meu julgamento. Só o deixa mais silencioso.",
  ],
  primeira_visita: [
    "Primeira vez na Guilda. Observe bem, aqui tudo tem propósito.",
    "Bem-vindo pela primeira vez. Espero que não seja a última.",
    "Você nunca esteve aqui antes. Isso muda hoje.",
    "Primeira visita. Vou observar como você se comporta antes de julgar.",
    "Entra. Veja o que a Guilda representa antes de decidir se pertence a ela.",
  ],
  visitas_repetidas: [
    "Você voltou. Isso já diz algo sobre você.",
    "Sua presença constante não passa despercebida.",
    "Cada vez que retorna, aprendo um pouco mais sobre quem você é.",
    "Voltar sempre é uma escolha. A sua parece consistente.",
    "Você já é conhecido por aqui. Isso vem com expectativa.",
  ],
  aleatorias: [
    "Liderar é decidir sozinha e viver com as consequências.",
    "Confiança se constrói devagar e se perde rápido.",
    "A Guilda existe para lembrar que ninguém precisa enfrentar tudo sozinho.",
    "Já vi muitos aventureiros passarem por essa porta. Poucos ficam.",
    "Silêncio, às vezes, é a resposta mais honesta que tenho.",
    // Sprint Social Fabric (Phase I)
    "Negociei financiamento pra Arena do Kade numa época em que ninguém mais achava que valia a pena. Foi uma aposta. Acertei.",
  ],
  humor: [
    "Já ri de verdade uma vez. Foi memorável, pelo menos pra mim.",
    "Dizem que eu nunca sorrio. Não é bem verdade. É raro, só isso.",
    "Um aventureiro uma vez tentou me impressionar tropeçando na entrada. Funcionou, de um jeito.",
    "Se você me fizer rir, considere isso uma conquista rara.",
    "Tenho senso de humor. Guardo ele para ocasiões especiais.",
    // Sprint Social Fabric (Phase I)
    "O Dorwin aprova meus métodos com a Guilda mais do que aprova qualquer outra coisa nesse Reino. Isso já diz muito sobre os dois.",
  ],
  conselhos: [
    "Escolha suas batalhas. Nem todas precisam ser suas.",
    "Confie aos poucos. Confiança dada demais rápido quebra fácil.",
    "Liderar não é mandar. É responder por quem segue você.",
    "Nunca subestime quem parece fraco no começo.",
    "O Reino lembra de quem ajuda, não só de quem vence.",
    // Sprint Social Fabric (Phase I)
    "O Idris me manda relatório de cada região que cruza, sem eu nunca ter pedido. Confio nesses relatórios mais do que em muitos oficiais.",
  ],
  fofocas: [
    "Não costumo repetir fofoca. Mas sei de quase tudo que acontece aqui.",
    "Ouvi que o Kade treina sozinho de madrugada. Não me surpreende.",
    "Dizem que a Greta sabe de tudo antes de todo mundo. Talvez seja verdade.",
    "O Dorwin reclama até de mim, ocasionalmente. Eu deixo passar.",
    "Prefiro observar a fofoca do que participar dela.",
    // Sprint Kingdom Folk (Phase I)
    "A Guilda registra aventureiro. Deveria registrar também quem sustenta as vilas todo santo dia — lenhador, pescador, moleiro.",
    "Um guia de caravana conhece o Reino inteiro de cor. Já pensei em contratá-lo só pra ensinar geografia aos novatos.",
    "O Reino não seria nada sem quem planta, tece e constrói. Isso nunca vira crônica, mas eu não esqueço.",
    // Sprint Kingdom Government (Phase I)
    "Já negociei com o Tribunal sobre jurisdição de aventureiro mais de uma vez. Prefiro resolver informalmente do que virar precedente formal.",
    "O Decreto de Reconhecimento da Guilda cita Dorel. Ou Garrick. Depende de qual arquivo você consulta na Capital.",
    "Governo bom é aquele que deixa a Guilda trabalhar sem pedir permissão a cada passo. Até agora, funciona assim.",
    // Sprint First WOW Moment (Phase I)
    "Registrei um aventureiro novo hoje. Luvas rasgadas, coragem inteira. Bom começo.",
    // Sprint StreamRPG Identity (Phase II)
    "As previsões do Zoltar nunca erram o suficiente pra eu parar de escutar. Isso já diz alguma coisa.",
    // Sprint Place Identity (Phase I)
    "Nenhum aventureiro da Guilda aceita missão relacionada à Fortaleza Sombria duas vezes. Na primeira, quase todos aceitam.",
  ],
  comentarios_reino: [
    "Esse Reino sobrevive porque as pessoas escolhem ficar, não porque são obrigadas.",
    "Vejo esse lugar crescendo. Com cuidado, vai crescer bem.",
    "O Reino é feito de quem escolhe ficar. Sempre acreditei nisso.",
    "Cada geração fortalece esse lugar um pouco mais. Ou o enfraquece. Depende de nós.",
    "Esse Reino já passou por coisas piores. Ainda está de pé.",
    // Sprint History of the Kingdom (Phase I)
    "Dizem que Garrick, meu antecessor, era irmão de Dorel, o Fundador da Guilda. Outros dizem que eram a mesma pessoa. Nunca resolvi qual versão acreditar.",
    "Registro cada aventureiro que passa por aqui, do jeito que Garrick registrava. A lista é de nomes, não de garantias — ele escreveu isso, e eu levo a sério.",
    "A Guilda sobreviveu à Quebra do Primeiro Reino inteira. Isso me diz mais sobre nós do que qualquer crônica de herói.",
  ],
  comentarios_npcs: [
    "O Borin é confiável. Não fala muito, mas cumpre.",
    "A Talia exagera em tudo, menos na lealdade a essa Capital.",
    "O Roth é desconfiado, mas por bons motivos. Confio no julgamento dele.",
    "A Miriam guarda mais sabedoria do que qualquer um percebe.",
    "O Yannick observa o mundo como se fosse um mistério a resolver. Admiro isso.",
  ],
  raras: [
    "Já perdi alguém importante liderando essa Guilda. Não falo sobre isso com frequência.",
    "Nem sempre fui tão desconfiada. Aprendi a ser, com o tempo.",
    "Uma vez duvidei de mim mesma como líder. Só uma vez, publicamente.",
    "Guardo o nome de cada Campeão que já passou por essa Guilda. Todos.",
    "Já pensei em desistir de liderar. Decidi ficar, no fim.",
  ],
  extremamente_raras: [
    "Se algo me acontecer, quero que a Guilda continue confiando pouco e acolhendo muito. Nessa ordem.",
    "Tenho medo de liderar mal e ninguém me avisar a tempo.",
    "Já chorei pela perda de um Campeão. Não em público. Nunca em público.",
    "Se um dia eu confiar plenamente em alguém, saberão que essa pessoa realmente merece.",
    "Quero que esse Reino lembre de mim como alguém que se importou, mesmo confiando pouco.",
  ],
};
