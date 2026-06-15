import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

const DB_FILE = path.join(process.cwd(), "books_db.json");

interface BookReview {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  coverUrl: string;
  reviewText: string;
  summaryAi: string;
  amazonLink: string;
  shopeeLink: string;
  mercadolivreLink: string;
  viewsWeekly: number;
  viewsMonthly: number;
  favoritesWeekly?: number;
  favoritesMonthly?: number;
  isDraft: boolean;
  publishDate: string;
  dailyFeatured?: boolean;
}

// Initial mockup data
const INITIAL_BOOKS: BookReview[] = [
  {
    id: "1",
    title: "Dom Casmurro",
    author: "Machado de Assis",
    genre: "Clássicos Brasileiros",
    rating: 4.9,
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
    reviewText: "Olhos de ressaca, ciúme devorador e uma dúvida eterna que atravessa gerações: Capitu traiu ou não Bentinho? O maior clássico brasileiro é uma obra-prima de ironia psicológica e escrita refinada.",
    summaryAi: "Dom Casmurro é narrado em primeira pessoa por Bento Santiago, apelidado de Bentinho, que já idoso repassa suas memórias de infância e juventude. O enredo foca no amor puro entre ele e Capitu, contrapondo-se à promessa de sua mãe de torná-lo padre. Após vencer esse obstáculo, Bentinho se casa com Capitu, mas é gradualmente consumido por ciúmes obsessivos, suspeitando de adultério entre sua esposa e seu melhor amigo, Escobar. A grande força do livro reside na narrativa não confiável, deixando os leitores na perpétua ambiguidade de um julgamento sem provas.",
    amazonLink: "https://www.amazon.com.br/s?k=Dom+Casmurro+Machado+de+Assis",
    shopeeLink: "https://shopee.com.br/search?keyword=Dom+Casmurro+Machado+de+Assis",
    mercadolivreLink: "https://lista.mercadolivre.com.br/Dom-Casmurro-Machado-de-Assis",
    viewsWeekly: 42,
    viewsMonthly: 180,
    favoritesWeekly: 14,
    favoritesMonthly: 45,
    isDraft: false,
    publishDate: "",
    dailyFeatured: true
  },
  {
    id: "2",
    title: "Hábitos Atômicos",
    author: "James Clear",
    genre: "Desenvolvimento Pessoal",
    rating: 4.8,
    coverUrl: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80",
    reviewText: "E se pequenas mudanças diárias pudessem revolucionar seu futuro? James Clear mostra, de forma extremamente prática, o poder das melhorias de 1% na construção de uma rotina vencedora.",
    summaryAi: "James Clear apresenta uma metodologia científica para reestruturar comportamentos a partir de pequenos ajustes diários (os hábitos atômicos). Ele explica que sistemas de rotina são infinitamente mais produtivos que metas fictícias. Baseado nas quatro leis da mudança de comportamento (Tornar Claro, Tornar Atraente, Tornar Fácil e Tornar Satisfatório), o livro fornece táticas cognitivas para desmantelar hábitos prejudiciais e sedimentar codutas de alto rendimento.",
    amazonLink: "https://www.amazon.com.br/s?k=Habitos+Atomicos+James+Clear",
    shopeeLink: "https://shopee.com.br/search?keyword=Habitos+Atomicos+James+Clear",
    mercadolivreLink: "https://lista.mercadolivre.com.br/Habitos-Atomicos-James-Clear",
    viewsWeekly: 35,
    viewsMonthly: 120,
    favoritesWeekly: 9,
    favoritesMonthly: 38,
    isDraft: false,
    publishDate: ""
  },
  {
    id: "3",
    title: "1984",
    author: "George Orwell",
    genre: "Ficção",
    rating: 5.0,
    coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80",
    reviewText: "O Grande Irmão está de olho em você. Orwell projetou a distopia máxima sobre censura, reescrita da verdade e a morte da individualidade. Assustadoramente atual e inesquecível.",
    summaryAi: "Num futuro totalitário governado pelo Partido e vigiado eternamente pelas telas e pelo olhar do Grande Irmão, Winston Smith trabalha reescrevendo jornais passados para se adequarem às diretrizes mutáveis do governo. Ele secretamente odeia o regime e inicia uma revolta interna ao cometer crimes de pensamento, registrar um diário proibido e iniciar um amor clandestino com Júlia. Uma análise cirúrgica sobre a manipulação política da linguagem (Novilíngua), o controle mental (Duplo-pensar) e o preço devastador da liberdade.",
    amazonLink: "https://www.amazon.com.br/s?k=1984+George+Orwell",
    shopeeLink: "https://shopee.com.br/search?keyword=1984+George+Orwell",
    mercadolivreLink: "https://lista.mercadolivre.com.br/1984-George-Orwell",
    viewsWeekly: 55,
    viewsMonthly: 210,
    favoritesWeekly: 17,
    favoritesMonthly: 52,
    isDraft: false,
    publishDate: ""
  },
  {
    id: "4",
    title: "Pai Rico, Pai Pobre",
    author: "Robert Kiyosaki",
    genre: "Finanças",
    rating: 4.7,
    coverUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=600&q=80",
    reviewText: "Aprenda regras de ouro sobre ativos e passivos financeiras e como fazer o capital trabalhar para você desde cedo, superando mitos tradicionais de salário.",
    summaryAi: "Pai Rico, Pai Pobre é um dos livros mais influentes sobre educação financeira no mundo. Robert Kiyosaki contrasta a mentalidade e os conselhos práticos de seu pai biológico (instruído, porém financeiramente instável) com os do pai de seu melhor amigo (um empreendedor autodidata de muito sucesso). Através dessa dinâmica, he ensina conceitos de investimento, aquisição de ativos, contabilidade básica e inteligência financeira.",
    amazonLink: "https://www.amazon.com.br/s?k=Pai+Rico+Pai+Pobre",
    shopeeLink: "https://shopee.com.br/search?keyword=Pai+Rico+Pai+Pobre",
    mercadolivreLink: "https://lista.mercadolivre.com.br/Pai-Rico-Pai-Pobre",
    viewsWeekly: 48,
    viewsMonthly: 155,
    favoritesWeekly: 15,
    favoritesMonthly: 41,
    isDraft: false,
    publishDate: ""
  },
  {
    id: "5",
    title: "Como Estudar para Concursos",
    author: "Alexandre Meirelles",
    genre: "Concursos Públicos",
    rating: 4.9,
    coverUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80",
    reviewText: "O manual prático com técnicas comprovadas de cronograma, ciclo de estudos e inteligência emocional para passar nos maiores concursos públicos municipais, estaduais e federais.",
    summaryAi: "Como Estudar para Concursos é uma obra indispensável para quem estuda para cargos públicos de nível médio e superior. Alexandre Meirelles traz uma abordagem altamente didática e exaustiva sobre metodologias comprovadas de aprendizagem, montagem de ciclos de estudos contínuos, memorização avançada de leis, técnicas de marcação de livros e como manter a produtividade nos estudos.",
    amazonLink: "https://www.amazon.com.br/s?k=Como+Estudar+para+Concursos+Alexandre+Meirelles",
    shopeeLink: "https://shopee.com.br/search?keyword=Como+Estudar+para+Concursos+Alexandre+Meirelles",
    mercadolivreLink: "https://lista.mercadolivre.com.br/Como-Estudar-para-Concursos-Alexandre-Meirelles",
    viewsWeekly: 62,
    viewsMonthly: 195,
    favoritesWeekly: 21,
    favoritesMonthly: 60,
    isDraft: false,
    publishDate: ""
  },
  {
    id: "6",
    title: "O Alquimista",
    author: "Paulo Coelho",
    genre: "Ficção",
    rating: 4.6,
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    reviewText: "Uma lírica jornada espiritual através de desertos inspiradores. Um clássico moderno sobre escutar o coração, ler os sinais divinos do cotidiano e insistir em nossa lenda pessoal.",
    summaryAi: "O Alquimista conta a história de Santiago, um jovem pastor andaluz que tem um sonho recorrente sobre um tesouro enterrado próximo às pirâmides do Egito. Ele vende suas ovelhas e cruza o Estreito de Gibraltar em direção ao norte africano, num trajeto cheio de provações morais, aprendizados profundos com místicas figuras do deserto, e a revelação do idioma cósmico da Alma do Mundo. Um guia metafórico sobre autoconfiança e a coragem de cruzar o desconhecido.",
    amazonLink: "https://www.amazon.com.br/s?k=O+Alquimista+Paulo+Coelho",
    shopeeLink: "https://shopee.com.br/search?keyword=O+Alquimista+Paulo+Coelho",
    mercadolivreLink: "https://lista.mercadolivre.com.br/O-Alquimista-Paulo-Coelho",
    viewsWeekly: 24,
    viewsMonthly: 98,
    favoritesWeekly: 6,
    favoritesMonthly: 24,
    isDraft: false,
    publishDate: ""
  },
  {
    id: "7",
    title: "Chef Profissional",
    author: "Instituto Americano de Culinária",
    genre: "Culinária",
    rating: 4.9,
    coverUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80",
    reviewText: "O guia abrangente do Culinary Institute of America ensina técnicas cruciais de cozimento, molhos clássicos, cortes finos e segredos essenciais que fundamentam e sofisticam a gastronomia.",
    summaryAi: "Chef Profissional é considerado o maior manual de culinária e gastronomia técnica já escrito. Com mais de 600 receitas icônicas e detalhamento passo a passo dos procedimentos culinários essenciais, o livro serve como alicerce indispensável tanto para cozinheiros domésticos exigentes quanto para chefs profissionais de prestígio.",
    amazonLink: "https://www.amazon.com.br/s?k=Chef+Profissional+Culinary+Institute",
    shopeeLink: "https://shopee.com.br/search?keyword=Chef+Profissional+Culinary+Institute",
    mercadolivreLink: "https://lista.mercadolivre.com.br/Chef-Profissional-Culinary-Institute",
    viewsWeekly: 31,
    viewsMonthly: 104,
    favoritesWeekly: 8,
    favoritesMonthly: 29,
    isDraft: false,
    publishDate: ""
  },
  {
    id: "8",
    title: "Memórias Póstumas de Brás Cubas",
    author: "Machado de Assis",
    genre: "Clássicos Brasileiros",
    rating: 5.0,
    coverUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80",
    reviewText: "O defunto autor que narra sua própria vida com fina ironia, riso amargo e desmistificação das vaidades aristocráticas do Rio de Janeiro oitocentista.",
    summaryAi: "O livro inicia de trás para a frente, com a célebre morte do Brás Cubas e a criação do 'Emplasto Cubas'. Daí, o defunto autor passa a narrar suas desventuras com desfaçatez, relatando seus amores frustrados, a mediocridade política e a fragilidade do viver humano em um estilo que fundou o Realismo brasileiro.",
    amazonLink: "https://www.amazon.com.br/s?k=Memorias+Postumas+de+Bras+Cubas",
    shopeeLink: "https://shopee.com.br/search?keyword=Memorias+Postumas+de+Bras+Cubas",
    mercadolivreLink: "https://lista.mercadolivre.com.br/Memorias-Postumas-de-Bras-Cubas",
    viewsWeekly: 52,
    viewsMonthly: 185,
    favoritesWeekly: 16,
    favoritesMonthly: 48,
    isDraft: false,
    publishDate: ""
  }
];

// Helper to load and save books from/to local JSON
function readDatabase(): BookReview[] {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_BOOKS, null, 2));
      return INITIAL_BOOKS;
    }
    const content = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(content);
    // Ensure all books (including legacy ones) have correct numbers mapping
    return parsed.map((b: any) => ({
      ...b,
      viewsWeekly: typeof b.viewsWeekly === "number" ? b.viewsWeekly : 0,
      viewsMonthly: typeof b.viewsMonthly === "number" ? b.viewsMonthly : 0,
      favoritesWeekly: typeof b.favoritesWeekly === "number" ? b.favoritesWeekly : 0,
      favoritesMonthly: typeof b.favoritesMonthly === "number" ? b.favoritesMonthly : 0
    }));
  } catch (error) {
    console.error("Erro ao ler banco de dados JSON:", error);
    return INITIAL_BOOKS;
  }
}

function writeDatabase(data: BookReview[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Erro ao escrever no banco de dados JSON:", error);
  }
}

// Ensure database file is initialized on boot
readDatabase();

// --- API ENDPOINTS ---

// GET: Fetch all reviews
app.get("/api/books", (req, res) => {
  const books = readDatabase();
  // We can return both, separating drafts if requested, but let's send everything.
  // The frontend can filter reviews vs. drafts based on user's login state.
  res.json(books);
});

// POST: Access a book review and increment view counts (for the dynamic Top 5 weekly/monthly rankings)
app.post("/api/books/:id/view", (req, res) => {
  const { id } = req.params;
  const books = readDatabase();
  const bookIndex = books.findIndex(b => b.id === id);

  if (bookIndex !== -1) {
    books[bookIndex].viewsWeekly = (books[bookIndex].viewsWeekly || 0) + 1;
    books[bookIndex].viewsMonthly = (books[bookIndex].viewsMonthly || 0) + 1;
    writeDatabase(books);
    res.json({ success: true, viewsWeekly: books[bookIndex].viewsWeekly, viewsMonthly: books[bookIndex].viewsMonthly });
  } else {
    res.status(404).json({ error: "Livro não encontrado" });
  }
});

// POST: Toggles/sets favorite state of a book review (increments / decrements counts)
app.post("/api/books/:id/favorite", (req, res) => {
  const { id } = req.params;
  const { isFavorite } = req.body;
  const books = readDatabase();
  const bookIndex = books.findIndex(b => b.id === id);

  if (bookIndex !== -1) {
    const book = books[bookIndex];
    if (isFavorite) {
      book.favoritesWeekly = (book.favoritesWeekly || 0) + 1;
      book.favoritesMonthly = (book.favoritesMonthly || 0) + 1;
    } else {
      book.favoritesWeekly = Math.max(0, (book.favoritesWeekly || 0) - 1);
      book.favoritesMonthly = Math.max(0, (book.favoritesMonthly || 0) - 1);
    }
    writeDatabase(books);
    res.json({
      success: true,
      favoritesWeekly: book.favoritesWeekly,
      favoritesMonthly: book.favoritesMonthly
    });
  } else {
    res.status(404).json({ error: "Livro não encontrado" });
  }
});

// POST: Add new review or draft
app.post("/api/books", (req, res) => {
  const {
    title,
    author,
    genre,
    rating,
    coverUrl,
    reviewText,
    summaryAi,
    amazonLink,
    shopeeLink,
    mercadolivreLink,
    isDraft,
    publishDate
  } = req.body;

  if (!title || !author) {
    return res.status(400).json({ error: "Título e ator são obrigatórios." });
  }

  const books = readDatabase();

  const newBook: BookReview = {
    id: String(Date.now()),
    title,
    author,
    genre: genre || "Não especificado",
    rating: Number(rating) || 4.0,
    coverUrl: coverUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80",
    reviewText: reviewText || "",
    summaryAi: summaryAi || "",
    amazonLink: amazonLink || "",
    shopeeLink: shopeeLink || "",
    mercadolivreLink: mercadolivreLink || "",
    viewsWeekly: 0,
    viewsMonthly: 0,
    isDraft: isDraft === undefined ? true : isDraft,
    publishDate: publishDate || new Date().toISOString()
  };

  books.push(newBook);
  writeDatabase(books);
  res.status(201).json(newBook);
});

// PUT: Edit review or publish draft
app.put("/api/books/:id", (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const books = readDatabase();

  const bookIndex = books.findIndex(b => b.id === id);
  if (bookIndex === -1) {
    return res.status(404).json({ error: "Livro não encontrado." });
  }

  const existing = books[bookIndex];
  
  // Update fields
  const updatedBook: BookReview = {
    ...existing,
    ...updateData,
    // Preserve core values if not supplied
    id: existing.id,
    viewsWeekly: existing.viewsWeekly,
    viewsMonthly: existing.viewsMonthly,
    publishDate: updateData.publishDate 
      ? updateData.publishDate 
      : (updateData.isDraft === false && existing.isDraft === true ? new Date().toISOString() : existing.publishDate)
  };

  books[bookIndex] = updatedBook;
  writeDatabase(books);
  res.json(updatedBook);
});

// DELETE: Remove book or draft
app.delete("/api/books/:id", (req, res) => {
  const { id } = req.params;
  const books = readDatabase();
  const filtered = books.filter(b => b.id !== id);

  if (books.length === filtered.length) {
    return res.status(404).json({ error: "Livro não encontrado." });
  }

  writeDatabase(filtered);
  res.json({ success: true, message: "Livro removido com sucesso." });
});

// POST: Reset all view counters to 0
app.post("/api/books/reset-views", (req, res) => {
  const books = readDatabase();
  const resetBooks = books.map(b => ({
    ...b,
    viewsWeekly: 0,
    viewsMonthly: 0,
    favoritesWeekly: 0,
    favoritesMonthly: 0
  }));
  writeDatabase(resetBooks);
  res.json({ success: true, message: "Estatísticas de visualização/leitura e favoritos zeradas com sucesso.", books: resetBooks });
});

// POST: AI generator using Gemini SDK
app.post("/api/generate-summary", async (req, res) => {
  const { title, author } = req.body;

  if (!title || !author) {
    return res.status(400).json({ error: "Nome da obra e do autor são necessários." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    // If key is empty or standard, provide a highly responsive and detailed fallback
    // simulated AI responses for great mock experience if key is not active yet!
    console.warn("Chave do Gemini ausente na configuração ou padrão detectada. Usando simulador dinâmico.");
    
    // Dynamic simulated summary generator selecting different synonym vectors for distinct look and feel
    const openings = [
      `Ao nos debruçarmos sobre as páginas fundamentais de “${title}”, de autoria de ${author}, somos imediatamente convidados a desacelerar e ponderar a respeito da substancial complexidade intrínseca de nossas vidas diárias. Em vez de uma mera descrição linear de fatos, este livro se destaca como uma radiografia aguçada de nossas aspirações comuns, incitando-nos a redescobrir as reais motivações intelectuais e humanas que dão sentido aos desafios que enfrentamos dia após dia.`,
      `A leitura e imersão crítica em “${title}” (obra magistral de ${author}) representa uma verdadeira jornada de redescoberta sobre como as conexões humanas e ideológicas nos moldam sutilmente ao longo do tempo. Com uma prosa incisiva, repleta de nuances e vocabulário assertivo, a obra afasta formulações dogmáticas para colocar o leitor direto com as indagações que frequentemente evitamos, produzindo reflexões profundas.`,
      `O legado literário inaugurado por ${author} com a obra “${title}” opera em nós um efeito quase restaurador, clareando horizontes e ativando noções latentes de propósito e consciência social. O livro desenha com maestria um território conceitual rico de simbolismos, incentivando a edificação de comportamentos íntegros em meio à rapidez líquida e as constantes distrações que tomam conta da sociedade contemporânea.`
    ];

    const bodies = [
      `Digerir este volume produz na vida cotidiana um benefício indelével: a capacidade de reconquistar o timão de nossa autonomia individual com coragem espiritual e ética inabalável. O autor desafia nossa complacência usual, convocando cada indivíduo a abraçar as próprias vulnerabilidades para transformá-las em trampolins dinâmicos voltados ao contínuo progresso pessoal e à sintonização consciente com o mundo exterior.`,
      `Contemplar este extraordinário painel escrito nos lembra de que pequenas atitudes e escolhas moldam de forma invisível as marés maiores do destino coletivo de nossa época. Trata-se, essencialmente, de um manifesto suntuoso e necessário em prol do resgate da integridade individual diante do ruído incessante do consumo e dos ritmos desenfreados que caracterizam a vida pós-moderna.`,
      `Em última instância, este livro serve como um guia precioso que nos mune de perguntas transformadoras em substituição a premissas padronizadas ou meras fórmulas de efeito fácil. A leitura atua como um refúgio acolhedor onde silêncio e refinamento andam juntos, exortando-nos a caminhar pelo mundo com lucidez integral, empatia ativa e uma marcante clareza existencial.`
    ];

    // Select based on text metrics
    const hash = (title.length + author.length) % 3;
    const simulatedSummary = `${openings[hash]}\n\n${bodies[(hash + 1) % 3]}`;
    
    return res.json({
      summary: simulatedSummary,
      catchyReview: `Uma análise brilhante e indispensável que destaca a sensibilidade crítica da escrita de ${author}. Absolutamente imperdível!`,
      suggestedGenre: "Ficção Psicológica & Filosofia",
      suggestedRating: 4.8
    });
  }

  try {
    // Correct Server-Side Gemini Setup & Telemetry header as instructed in skill
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

    const prompt = `Você é um curador e assistente literário de elite para a plataforma Resenhas de Livros.
O usuário deseja criar um rascunho de resenha da obra literária intitulada "${title}", de autoria de "${author}".

Pesquise ou faça uso de seus conhecimentos reais literários aprofundados para produzir no idioma português brasileiro padrão (PT-BR) um arquivo de formato JSON contendo EXATAMENTE os seguintes campos estruturados:
1. "summary": Uma análise em português que atenda RIGOROSAMENTE aos seguintes parâmetros:
   - Deve conter EXATAMENTE dois parágrafos literários completos (separados unicamente pelo caractere padrão de quebra dupla de linha "\\n\\n"). Nem mais, nem menos.
   - Deve ser altamente focada e detalhadamente personalizada para a obra específica "${title}" de "${author}".
   - ATENÇÃO ORTOGRÁFICA E GRAMATICAL EXTREMA: Todo o texto deve possuir ortografia impecável em português do Brasil, utilizando corretamente acentuações (acentos agudo, circunflexo, grave, til e cedilha). EVITE veementemente todo e qualquer erro de digitação, pontuações desconexas no início ou fim de sentenças (tais como iniciar orações de forma órfã como ".\\n\\nAo" ou semelhantes), espaçamentos duplos entre palavras ou quebras de texto artificiais.
   - ATENÇÃO CRÍTICA DE ESTILO: Cada obra possui sua alma estritamente singular! Use abordagens conceituais ricas, vocabulário refinado e evite metáforas automatizadas idênticas de semente ou as mesmas frases feitas de outras análises.
   - Escreva de forma fluida, combinando o impacto emocional que a obra causa com seus propósitos conceituais reais.
2. "catchyReview": Uma frase de resenha curta, com máximo apelo intelectual e impacto imediato (de uma a duas sentenças) sobre o livro.
3. "suggestedGenre": O gênero literário representativo do livro (exemplos: "Desenvolvimento Pessoal", "Ficção Científica", "Clássico", "Ficção Filosófica", "Mistério", "História").
4. "suggestedRating": Um número flutuante de avaliação de 1.0 a 5.0 (ex: 4.8) representando o consenso crítico da comunidade literária para esta respectiva obra.

Retorne APENAS um JSON válido de acordo com o esquema solicitado, sem qualquer adendo textual externo ou tags adicionais.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            catchyReview: { type: Type.STRING },
            suggestedGenre: { type: Type.STRING },
            suggestedRating: { type: Type.NUMBER }
          },
          required: ["summary", "catchyReview", "suggestedGenre", "suggestedRating"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Resposta de texto vazia obtida do Gemini");
    }

    const data = JSON.parse(responseText.trim());
    return res.json(data);

  } catch (error: any) {
    console.error("Erro ao chamar o Gemini API:", error);
    return res.status(500).json({ 
      error: "Houve um erro ao processar o resumo literário via Inteligência Artificial.",
      details: error.message
    });
  }
});


// Start server & integrate Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Middlewares do Vite acoplados com sucesso no modo desenvolvimento.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando ativamente na porta: http://localhost:${PORT}`);
  });
}

startServer();
