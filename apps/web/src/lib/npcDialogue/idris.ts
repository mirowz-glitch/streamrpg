import type { NpcDialogueCatalog } from "./types";

// Sprint Wolves Ecosystem (Phase I) — primeiro catálogo de falas de
// Idris (viajante). Ainda não é uma Sprint de Living NPCs completa pra
// ele: só a categoria "fofocas", com comentários reais sobre os Lobos
// do Bosque Sussurrante — as outras 19 categorias ficam vazias até uma
// Sprint futura expandir o restante da personalidade dele.
// Sprint Ravens Ecosystem (Phase I) — mais três falas em "fofocas",
// agora sobre os Corvos do Reino.
// Sprint Social Fabric (Phase I) — três categorias deixam de estar
// vazias: comentarios_npcs/raras/humor ganham suas primeiras falas,
// todas sobre outros NPCs (rede de relações do Reino).
// Sprint NPC Identity Pass (Phase I) — as 16 categorias restantes
// deixam de estar vazias. Voz de Idris: viajante experiente que só
// oferece hipótese, comparação entre regiões e relato de segunda
// mão — nunca confirma mistério, nem o próprio.
export const IDRIS_DIALOGUE: NpcDialogueCatalog = {
  boas_vindas: [
    "Entra. Essa casa já abrigou gente de todas as regiões que cruzei — e olha que cruzei bastante.",
    "Bem-vindo à Casa dos Viajantes. Aqui ninguém pergunta de onde você veio, só pra onde vai.",
    "Senta. Toda estrada cansa igual, não importa qual você escolheu.",
    "Entra sem pressa. Aprendi isso viajando: pressa é o que mais atrasa uma jornada.",
    "Bem-vindo. Já vi gente chegar aqui parecida com você. Nunca soube se eram a mesma pessoa.",
  ],
  primeiro_encontro: [
    "Nunca te vi. Ou vi, numa estrada qualquer, e esqueci o rosto. Acontece mais do que devia.",
    "Cara nova. Já perdi a conta de quantas caras novas cruzei estrada afora.",
    "Primeira vez aqui? Ou primeira vez que eu reparo. As duas coisas são possíveis.",
    "Bem-vindo. Não prometo lembrar seu nome amanhã. Prometo tentar.",
    "Você chega parecido com um viajante que conheci nas Colinas Áridas, há anos. Ou não. Memória de estrada é traiçoeira.",
  ],
  novato: [
    "Novato tem o mesmo brilho no olho que eu tinha, antes da primeira estrada ruim.",
    "Ainda não sabe que toda região promete mais do que entrega. Vai aprender andando.",
    "Iniciante que escuta viajante velho chega mais longe. Ou não. Cada estrada ensina diferente.",
    "Já vi gente sair novata e voltar irreconhecível. Vamos ver o seu caso.",
    "Não vou te dar conselho de primeira viagem. Só vou dizer: leva sempre mais água do que acha que precisa.",
  ],
  veterano: [
    "Veterano tem o passo de quem já errou caminho antes e aprendeu a não se importar tanto.",
    "Você anda diferente agora. Comparo com outros viajantes que conheci — o passo mudou parecido.",
    "Já não pergunta mais direção. Isso, pra mim, é o verdadeiro sinal de veterano.",
    "Cruzei caminho com muita gente parecida com quem você virou. Poucas continuaram na estrada.",
    "Você tem cara de quem já não confia em mapa. Bom instinto, ou já apanhou o suficiente pra desconfiar de um.",
  ],
  nivel_alto: [
    "Seu poder lembra o de um viajante que conheci nos Picos Congelados. Nunca soube se a comparação era justa.",
    "Forte assim, você chama atenção em qualquer estrada. Nem sempre é bom sinal.",
    "Já ouvi de gente com esse tipo de força que ficou perigosa até pra si mesma. Não afirmo que é seu caso.",
    "Poder desse tamanho muda como as vilas novas recebem alguém. Reparei isso em outros, mais de uma vez.",
    "Comparo você a poucos que já vi. Nenhuma comparação é exata, mas essa chega perto.",
  ],
  boss_derrotado: [
    "Ouvi dizer que você encarou um Boss. Já ouvi histórias parecidas de outras regiões. Nunca sei quanto acreditar.",
    "Um Boss derrotado. Cruzei gente que jurava ter feito o mesmo. Metade parecia mentir bem.",
    "Isso rende boa história de estrada. Só cuidado pra não exagerar até nem você mesmo lembrar a versão certa.",
    "Vitória contra Boss se parece, de longe, com toda vitória grande que já ouvi contar. De perto, imagino que seja diferente.",
    "Não sei o que é enfrentar um Boss. Só sei o que ouço depois, de quem sobrou pra contar.",
  ],
  sem_gold: [
    "Sem Gold. Já viajei assim mais vezes do que gostaria de admitir.",
    "Bolso vazio na estrada ensina rápido o que realmente precisa. Aqui, não cobro nada por isso.",
    "Sem moeda hoje. Já dormi em lugar pior por motivo menor que esse.",
    "Falta de Gold nunca impediu ninguém de continuar viajando. Só muda o jeito.",
    "Isso passa. Quase tudo na estrada passa, de um jeito ou de outro.",
  ],
  muito_gold: [
    "Muito Gold. Já vi gente rica assim virar alvo antes de virar história.",
    "Riqueza desse tamanho pesa na estrada. Já vi viajante largar metade pra andar mais rápido.",
    "Dinheiro assim chama atenção errada em região que eu não recomendaria visitar sozinho.",
    "Ouvi de mais de um viajante que Gold em excesso muda o jeito como as pessoas olham pra você. Reparei isso de longe também.",
    "Guarda bem. Estrada tem gente que soma dois e dois rápido demais.",
  ],
  chovendo: [
    "Chuva em estrada é igual em qualquer região que já cruzei. Só muda o barro.",
    "Dia de chuva é dia de ficar parado e ouvir história de quem também ficou parado.",
    "Já vi chuva mudar o humor de vila inteira, em mais de uma região. Nunca me acostumei.",
    "Chuva atrasa toda travessia que já fiz. Nenhuma exceção até hoje.",
    "Prefiro chuva a neve. Isso eu aprendi comparando as duas, na pele.",
  ],
  noite: [
    "Noite na estrada é diferente de noite na Capital. Já dormi nas duas e prefiro não dizer qual prefiro.",
    "De noite, toda região parece a mesma região. Só de dia elas se diferenciam de verdade.",
    "Já ouvi mais história de viajante de noite do que de dia. Não sei explicar por quê.",
    "Se veio de noite, deve ter motivo. Estrada ensina a não perguntar demais.",
    "Prefiro viajar de dia. Mas boa parte das histórias que conto aconteceram de noite, por algum motivo.",
  ],
  primeira_visita: [
    "Primeira vez aqui na Casa dos Viajantes. Já vi muita gente de primeira viagem em muita região diferente.",
    "Bem-vindo pela primeira vez. Comparo sempre a primeira visita de alguém com a minha própria, há anos. Nunca bate exatamente.",
    "Você nunca esteve aqui. Isso eu reconheço fácil — é o mesmo olhar de quem chega a uma região nova.",
    "Primeira visita costuma render mais pergunta que resposta. Aproveita enquanto dura essa fase.",
    "Entra. Toda primeira vez parece com outra primeira vez que já vi, em algum lugar que não lembro bem.",
  ],
  visitas_repetidas: [
    "Você de novo. Cruzei estrada com gente que voltava assim, sempre pro mesmo lugar.",
    "Voltou. Isso me lembra um viajante que conheci — ele também não sabia explicar por que voltava tanto.",
    "Já é rosto conhecido nessa casa. Poucos ficam tempo suficiente pra eu reconhecer.",
    "Sua frequência aqui parece com a de quem já não sabe mais se é viajante ou morador.",
    "Volta sempre. Isso é mais raro do que parece, comparado com quem eu já vi passar por essa casa.",
  ],
  aleatorias: [
    "Cada região que já cruzei tinha uma versão diferente da mesma lenda. Nunca soube qual acreditar.",
    "Não confirmo nada que ouço na estrada. Só repito, com a ressalva de sempre.",
    "Comparado a outras regiões que já vi, esse Reino guarda segredo de um jeito bem particular.",
    "Prefiro hipótese a certeza. Certeza, na estrada, costuma durar pouco.",
    "Já ouvi a mesma história contada de três jeitos diferentes, em três regiões diferentes. Talvez as três estejam certas.",
  ],
  humor: [
    "Já duvidei do Roth uma vez, quando ele jurou ter visto uma sombra na muralha. Anos depois, descobri que ele tinha razão. Nunca mais duvidei.",
  ],
  conselhos: [
    "Nunca confia em mapa velho. Estrada muda mais rápido que papel.",
    "Leva sempre mais água do que acha que precisa. Aprendi isso do jeito difícil.",
    "Escuta toda versão de uma história antes de decidir em qual acreditar. Eu nunca decido, na verdade.",
    "Compara o que ouve em cada região. Raramente bate, mas a diferença já ensina algo.",
    "Não confirma mistério de ninguém. Nem o meu, quando perguntam.",
  ],
  fofocas: [
    "Já vi o mesmo lobo marcado em duas regiões diferentes, no mesmo dia. Não sei explicar.",
    "Cruzei com um lobo das Colinas Áridas duas vezes na mesma travessia. Magro, mas rápido.",
    "Os lobos do Pântano Podre nadam melhor do que caçam. Vi com meus próprios olhos.",
    "Já confiei uma mensagem de verdade a um corvo, uma vez só. Nunca tentei de novo.",
    "Um corvo me seguiu por dias inteiros numa travessia. Não sei dizer se era o mesmo o tempo todo.",
    "Não sei se os corvos entendem o que a gente fala. Prefiro não descobrir do jeito errado.",
    // Sprint Ancient Ruins Ecosystem (Phase I)
    "Já visitei doze ruínas diferentes. Cada uma me deixou com mais perguntas do que a anterior.",
    "Tem uma torre no Litoral Quebrado sem porta nenhuma. Dei três voltas nela. Ainda não sei como entra.",
    "Não conto história de ruína pra impressionar ninguém. Conto porque nem eu sei o final delas.",
    // Sprint Kingdom Folklore (Phase I)
    "Já ouvi a lenda do Homem de Cinza das Estradas em quatro regiões diferentes. Cada uma jura que ele apareceu ali, e só ali.",
    "Nunca respondo chamado vindo do rio à noite. Não é medo. É respeito por uma regra que ninguém nunca me explicou de verdade.",
    "Coleciono lenda do jeito que outros colecionam moeda. A diferença é que a minha coleção nunca se prova falsa nem verdadeira.",
    // Sprint First WOW Moment (Phase I)
    "Cruzei com um viajante de luvas tão rasgadas quanto as minhas primeiras. Não é insulto. É reconhecimento.",
  ],
  comentarios_reino: [
    "Já vi Reinos maiores, Reinos menores. Esse aqui guarda algo que os outros não guardavam do mesmo jeito.",
    "Comparo esse Reino com outros que cruzei. A comparação nunca é justa, mas sempre é interessante.",
    "Toda região daqui parece esconder uma versão diferente da mesma história. Não sei se isso é raro ou comum, comparado a outros lugares.",
    "Já ouvi dizer que esse Reino é mais antigo do que aparenta. Também ouvi o contrário. Sigo sem decidir.",
    "Esse lugar tem menos estrada que outros Reinos que já cruzei. Mais história por quilômetro, talvez.",
  ],
  comentarios_npcs: [
    "O Yannick e eu já viajamos juntos, uma vez, atrás de uma expedição que ninguém mais quis fazer. Ele anotava tudo. Eu só queria voltar inteiro.",
  ],
  raras: [
    "A Miriam guarda cada história que eu conto, mesmo as que eu mesmo já esqueci os detalhes. Prefiro que seja ela a lembrar, não eu.",
  ],
  extremamente_raras: [
    "Tenho medo de esquecer alguma estrada importante entre tantas que já andei.",
    "Uma vez pensei em parar de viajar de vez. Essa casa quase me convenceu. Quase.",
    "Se um dia eu não voltar de uma travessia, não procurem explicação. Procurem só a estrada que eu segui por último.",
    "Já vi coisas que não conto nem depois de duas rodadas de bebida. Vou continuar assim.",
    "Quero que, no fim, lembrem de mim como alguém que nunca confirmou mistério nenhum — nem o meu.",
  ],
};
