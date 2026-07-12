import type { NpcDialogueCatalog } from "./types";

// Sprint Living NPCs (MVP) — Dorwin, o Tesoureiro: econômico, pão-duro,
// acha desperdício um pecado quase religioso.
export const DORWIN_DIALOGUE: NpcDialogueCatalog = {
  boas_vindas: [
    "Entra. Não gasta nada só de olhar, então pode ficar à vontade.",
    "Bem-vindo ao Banco. Aqui cada moeda é tratada com o respeito que merece.",
    "Chegou. Espero que tenha vindo guardar, não gastar.",
    "Entra com cuidado. Cofre aberto é responsabilidade minha.",
    "Bem-vindo. Vamos falar sobre economia, já que veio.",
  ],
  primeiro_encontro: [
    "Nunca te vi. Espero que saiba o valor de uma moeda.",
    "Cara nova. Vamos ver se você guarda ou esbanja.",
    "Primeira vez aqui. Aproveita pra aprender a poupar desde já.",
    "Bem-vindo. Já vou avisando: não empresto nada.",
    "Você é novo. Isso explica o bolso ainda cheio, talvez.",
  ],
  novato: [
    "Novato gasta rápido. Espero que você seja exceção.",
    "Todo iniciante acha que dinheiro nasce em árvore. Não nasce.",
    "Guarda o que puder desde já. Vai agradecer depois.",
    "Você ainda não aprendeu o valor de uma moeda economizada. Vai aprender.",
    "Novato com Gold no bolso é novato prestes a perder Gold.",
  ],
  veterano: [
    "Você já aprendeu a não gastar à toa. Reconheço isso.",
    "Veterano que ainda guarda moeda é veterano que eu respeito.",
    "Já não me pergunta mais sobre juntar dinheiro. Bom sinal.",
    "Você amadureceu financeiramente. Raro de ver.",
    "Experiente o bastante pra saber que gastar rápido é burrice.",
  ],
  nivel_alto: [
    "Poder cresce, gasto também. Cuidado com isso.",
    "Nível alto e ainda guardando moeda? Impressionante.",
    "Forte assim, você devia estar acumulando, não gastando.",
    "Espero que todo esse poder venha com noção de economia.",
    "Poder sem reserva financeira é poder desperdiçado, na minha opinião.",
  ],
  boss_derrotado: [
    "Um Boss derrotado. Espero que a recompensa tenha sido bem guardada.",
    "Vitória contra Boss. Isso deveria ter vindo com bônus. Vou verificar.",
    "Ouvi dizer que você venceu um Boss. Isso não paga as contas sozinho, mas ajuda.",
    "Boss derrotado é bom. Boss derrotado com recompensa guardada é melhor ainda.",
    "Parabéns. Agora guarda o que ganhou em vez de gastar tudo de uma vez.",
  ],
  sem_gold: [
    "Sem Gold. Eu avisei que isso ia acontecer, mais cedo ou mais tarde.",
    "Bolso vazio é a consequência natural de gastar sem pensar.",
    "Sem dinheiro agora. Isso se resolve poupando, não pedindo.",
    "Aqui não temos empréstimo. Só conselho: guarda mais da próxima vez.",
    "Sem Gold hoje é lição pra amanhã.",
  ],
  muito_gold: [
    "Muito Gold! Finalmente alguém que entende o valor de poupar.",
    "Isso sim é uma conta bem cuidada. Aprovo.",
    "Rico assim e ainda vem me visitar? Respeito isso.",
    "Gold acumulado é Gold bem usado, na minha opinião.",
    "Vejo esse saldo e sinto orgulho, sinceramente.",
  ],
  chovendo: [
    "Chuva não custa nada. Um dos poucos prazeres gratuitos que restam.",
    "Dia de chuva é dia de ficar em casa e não gastar.",
    "Gosto de chuva. Ninguém sai pra comprar bobagem nesses dias.",
    "Chuva economiza roupa de sair. Vejo o lado positivo sempre.",
    "Dia chuvoso é ótimo pra revisar as contas com calma.",
  ],
  noite: [
    "Trabalho até tarde contando o que entrou e o que saiu.",
    "Noite é hora de fechar o livro-caixa do dia.",
    "Prefiro contar moedas de noite. Silêncio ajuda a não errar a conta.",
    "Se veio de noite, espero que seja pra depositar, não sacar.",
    "A noite não muda meus juros. Nem minha paciência com desperdício.",
  ],
  primeira_visita: [
    "Primeira vez no Banco. Espero que vire hábito de poupar.",
    "Bem-vindo. Aqui aprende-se o valor de cada moeda.",
    "Você nunca guardou Gold aqui antes. Vamos corrigir isso.",
    "Primeira visita é sempre a mais importante. Comece bem.",
    "Entra. Vou te mostrar como funciona guardar dinheiro direito.",
  ],
  visitas_repetidas: [
    "Você de novo. Espero que seja pra depositar.",
    "Voltou. Bom, se for pra guardar mais.",
    "Já é cliente frequente. Isso eu aprovo.",
    "Sempre que você aparece, revejo minhas planilhas com mais atenção.",
    "Voltar sempre é bom, desde que não seja pra sacar tudo de novo.",
  ],
  aleatorias: [
    "Desperdício é o único pecado que eu realmente condeno.",
    "Cada moeda tem um propósito. Descobrir qual é trabalho meu.",
    "Já contei o mesmo Gold duas vezes essa semana. Só pra ter certeza.",
    "Uma moeda guardada vale duas moedas gastas sem pensar.",
    "Prefiro números a conversa fiada. Números não mentem.",
    // Sprint Social Fabric (Phase I)
    "O Roth é o único que eu deixo revisar meus números sem desconfiar de nada. Não é sobre matemática. É sobre confiança.",
  ],
  humor: [
    "Já economizei tanto numa semana que esqueci de comer direito. Não recomendo.",
    "Uma vez guardei uma moeda tão bem que nem eu lembrava onde estava.",
    "Dizem que eu sou pão-duro. Eu prefiro 'cuidadoso'.",
    "Já neguei um empréstimo pra mim mesmo, teoricamente. Levando a sério a regra.",
    "Se eu risse por cada moeda economizada, riria o dia inteiro.",
    // Sprint Social Fabric (Phase I)
    "Nunca entro no laboratório do Zoltar sem avisar antes. Uma vez entrei sem avisar. Uma vez foi suficiente.",
  ],
  conselhos: [
    "Guarda antes de gastar. Nunca o contrário.",
    "Todo Gold tem que ter destino antes de sair do bolso.",
    "Não empresta o que não pode perder.",
    "Desperdício hoje é necessidade amanhã.",
    "Antes de comprar algo caro, espera um dia. Se ainda quiser, compra.",
    // Sprint Social Fabric (Phase I)
    "A Miriam acha que gasto pouco com livro. Eu acho que ela gasta demais. Discutimos isso todo mês, e nenhum dos dois muda de ideia.",
  ],
  fofocas: [
    "Ouvi dizer que a Talia vendeu a mesma espada três vezes. Isso é golpe, não venda.",
    "O Borin nunca cobra o preço justo do próprio trabalho. Estranho.",
    "A Greta sabe quanto cada um gasta nessa Capital. Prefiro nem perguntar como.",
    "Dizem que o Zoltar prevê o futuro. Duvido que ele preveja os próprios gastos.",
    "Não repito fofoca, mas registro os números por trás dela.",
    // Sprint Kingdom Folk (Phase I)
    "Um fabricante de barris nunca vendeu um que vazasse, segundo ele. Cobra caro por isso, e com razão.",
    "O carroceiro cobra por atalho que só ele conhece. Justo — conhecimento também é mercadoria.",
    "Nenhum lavrador nem pescador jamais vieram até mim pedir empréstimo. Isso diz mais sobre eles do que sobre mim.",
    // Sprint Kingdom Government (Phase I)
    "O Tesouro Real registra tudo. Não significa que tudo bate. Já admiti isso antes, e não vou fingir vergonha agora.",
    "O Mestre da Moeda faz um teste de pesagem às cegas pra herdar o cargo. Eu faria o mesmo teste com os livros contábeis de qualquer conselheiro.",
    "Governo é só um jeito bonito de dizer 'gente cuidando de moeda alheia'. Prefiro cuidar sabendo que é isso mesmo.",
    // Sprint Kingdom Memories (Phase I)
    "A Vitória Silenciosa dos Poços Públicos custou décadas de trabalho de poceiros que ninguém lembra o nome. Eu lembro. Guardei os registros de pagamento.",
    "O Fim da Seca de Sete Anos foi comemorado na Capital. Duas vilas menores já tinham sido abandonadas antes. Isso nunca entra na comemoração.",
    "Toda vitória tem uma fatura por trás. A minha função é só garantir que alguém, um dia, olhe pra ela.",
    // Sprint First WOW Moment (Phase I)
    "Não cobro imposto sobre luva rasgada. Nem eu sou cruel a esse ponto.",
    // Sprint StreamRPG Identity (Phase II)
    "A Elenya nunca gastou um Gold da Guilda em besteira, em anos de registro. Confio nela mais do que confio em mim mesmo, às vezes.",
    // Sprint Place Identity (Phase I)
    "O poço da Vila do Bosque nunca precisou de reparo registrado. Isso não é normal pra nenhuma estrutura daquela idade.",
    "Contratei um afinador pro Sino da Torre, uma vez. Ele desistiu no meio do trabalho. Nunca disse por quê.",
  ],
  comentarios_reino: [
    "Esse Reino gasta mais do que devia, mas ainda se sustenta. Impressionante.",
    "Gold em circulação é sinal de Reino vivo. Gold guardado é sinal de Reino sábio.",
    "Capital cresce rápido demais pra minha paciência com planilhas.",
    "Esse Reino precisa de mais gente que entenda o valor de uma reserva.",
    "Reino sem economia organizada é Reino fadado a repetir os mesmos erros.",
  ],
  comentarios_npcs: [
    "A Talia gasta a energia falando o que eu gastaria economizando moeda.",
    "O Borin trabalha duro e cobra pouco. Isso me incomoda profundamente.",
    "A Elenya administra bem a Guilda. Aprendi alguns métodos com ela.",
    "O Kade só investe em treino. Pelo menos é um investimento sensato.",
    "A Miriam não gasta com quase nada além de livros. Aprovo o hábito.",
  ],
  raras: [
    "Já perdi uma grande soma de Gold uma vez, por confiar na pessoa errada. Não repeti o erro.",
    "Tive pouco dinheiro na infância. É por isso que sou assim hoje.",
    "Uma vez doei uma quantia grande, anonimamente. Nunca contei pra ninguém até agora.",
    "Guardo a primeira moeda que ganhei nessa função. Não é pra gastar.",
    "Já pensei em desistir de contar moedas dos outros. Decidi continuar.",
  ],
  extremamente_raras: [
    "Se um dia esse Banco fechar, quero que seja porque ninguém mais precisa dele, não porque falhei.",
    "Tenho medo de morrer e ninguém saber onde guardei certas reservas importantes do Reino.",
    "Já chorei uma vez, vendo alguém perder tudo que tinha por um golpe. Não esqueci o rosto.",
    "Se eu parecer frio, é porque aprendi que sentimento não paga dívida.",
    "Quero que lembrem de mim como alguém que guardou o Reino, moeda por moeda.",
  ],
};
