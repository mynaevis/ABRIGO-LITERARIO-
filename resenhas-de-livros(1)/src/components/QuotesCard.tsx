import React, { useState } from "react";
import { MessageSquareQuote, ChevronRight, X, Sparkles, AlertCircle, Quote } from "lucide-react";

export interface BookQuote {
  id: string;
  quote: string;
  author: string;
  character?: string;
  bookTitle: string;
  genre: string;
}

const APP_QUOTES: BookQuote[] = [
  {
    id: "1",
    quote: "Quem tem pressa de chegar ao fim não saboreia a viagem. O segredo de viver está em se fascinar com o mistério do caminho.",
    author: "Paulo Coelho",
    character: "Alquimista (Melquisedeque)",
    bookTitle: "O Alquimista",
    genre: "Ficção / Filosofia"
  },
  {
    id: "2",
    quote: "Não há barreira, fechadura ou ferrolho que possas impor à liberdade da minha mente. As palavras têm asas e voam alto.",
    author: "Virginia Woolf",
    character: "Narrador",
    bookTitle: "Um Teto Todo Seu",
    genre: "Ensaios / Feminismo"
  },
  {
    id: "3",
    quote: "Até que as pessoas se tornem conscientes de sua própria dignidade, elas nunca vão se rebelar contra a mediocridade.",
    author: "George Orwell",
    character: "Winston Smith",
    bookTitle: "1984",
    genre: "Distopia"
  },
  {
    id: "4",
    quote: "A imaginação é a nossa capacidade mais sublime de inventar deuses, leis, moedas e verdades que moldam a nossa história coletiva.",
    author: "Yuval Noah Harari",
    bookTitle: "Sapiens",
    genre: "História / Antropologia"
  },
  {
    id: "5",
    quote: "Capitu, apesar daqueles olhos de ressaca que pareciam tragar o mundo, possuía um coração capaz das maiores audácias amorosas.",
    author: "Machado de Assis",
    character: "Bentinho",
    bookTitle: "Dom Casmurro",
    genre: "Clássico Nacional"
  },
  {
    id: "6",
    quote: "A vida é a soma de todas as suas escolhas. O que você repete diariamente dita quem você se torna, para o bem ou para o mal.",
    author: "James Clear",
    bookTitle: "Hábitos Atômicos",
    genre: "Desenvolvimento Pessoal"
  },
  {
    id: "7",
    quote: "As feridas da alma nos tornam mulheres selvagens, prontas para correr livremente com os lobos no amanhecer da intuição.",
    author: "Clarissa Pinkola Estés",
    bookTitle: "Mulheres que Correm com os Lobos",
    genre: "Psicologia / Mitologia"
  },
  {
    id: "8",
    quote: "O essencial é invisível aos olhos. Só se vê bem com o coração, pois a pressa nos cega para as miudezas belas da vida.",
    author: "Antoine de Saint-Exupéry",
    character: "A Raposa",
    bookTitle: "O Pequeno Príncipe",
    genre: "Infantojuvenil / Filosofia"
  },
  {
    id: "9",
    quote: "Não sou nem otimista nem pessimista. O mundo continua sendo governado pelos tolos e pelos audazes, mas os poetas guardam a memória.",
    author: "Clarice Lispector",
    bookTitle: "A Hora da Estrela",
    genre: "Clássico Nacional"
  },
  {
    id: "10",
    quote: "Nós aceitamos o amor que achamos que merecemos. Por isso, nunca tenha medo de pedir mais da vida e dos livros.",
    author: "Stephen Chbosky",
    character: "Charlie",
    bookTitle: "As Vantagens de Ser Invisível",
    genre: "Drama / Jovem Adulto"
  }
];

export default function QuotesCard() {
  const [selectedQuote, setSelectedQuote] = useState<BookQuote | null>(null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const handleOpenRandomPopup = () => {
    // Pick a random index or use current
    const randIdx = Math.floor(Math.random() * APP_QUOTES.length);
    setCurrentQuoteIndex(randIdx);
    setSelectedQuote(APP_QUOTES[randIdx]);
  };

  const handleNextQuote = () => {
    const nextIdx = (currentQuoteIndex + 1) % APP_QUOTES.length;
    setCurrentQuoteIndex(nextIdx);
    setSelectedQuote(APP_QUOTES[nextIdx]);
  };

  const featuredStaticQuote = APP_QUOTES[4]; // Dom Casmurro as default preview

  return (
    <>
      {/* Sidebar Widget Trigger */}
      <div 
        onClick={handleOpenRandomPopup}
        className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-gradient-to-br from-amber-500/5 to-amber-700/5 p-5 shadow-sm text-center cursor-pointer hover:shadow-md transition-all duration-300 group relative overflow-hidden"
      >
        <div className="absolute top-2 right-2 opacity-10 group-hover:scale-125 transition-transform">
          <Quote className="h-10 w-10 text-amber-750" />
        </div>

        <span className="text-[24px] leading-3 text-amber-805 font-serif">“</span>
        <p className="text-sm md:text-base font-serif italic text-stone-650 dark:text-stone-300 leading-relaxed group-hover:text-amber-950 dark:group-hover:text-amber-300 transition-all font-medium">
          “{featuredStaticQuote.quote}”
        </p>
        
        <p className="text-xs uppercase font-extrabold tracking-widest text-[#880808] dark:text-amber-450 mt-4 flex items-center justify-center gap-1.5">
          <MessageSquareQuote className="h-4 w-4" />
          Citações de Obras ➔
        </p>
        <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-2">
          Clique para abrir o painel de frases exclusivas com autores e personagens
        </p>
      </div>

      {/* Pop Up Modal of quotes */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 md:p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              id="close-quote-popup"
              onClick={() => setSelectedQuote(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Glowing Tag */}
            <div className="flex items-center gap-1.5 mb-5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-50 dark:bg-amber-950/40 text-amber-850 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                <Sparkles className="h-3 w-3 text-amber-600" />
                Citação Memorável
              </span>
              <span className="text-xs text-stone-400 font-bold uppercase tracking-widest">
                {selectedQuote.genre}
              </span>
            </div>

            {/* Main Quote Card display */}
            <div className="bg-stone-50 dark:bg-stone-850/60 rounded-2xl p-6 md:p-8 mb-6 border border-stone-150 dark:border-stone-800 relative shadow-sm">
              <span className="absolute -top-3 left-4 text-5xl text-amber-700 dark:text-amber-500 font-serif leading-none">“</span>
              <p className="text-lg md:text-xl font-serif italic text-stone-800 dark:text-stone-100 leading-relaxed text-center z-10 relative px-2 font-medium">
                {selectedQuote.quote}
              </p>
            </div>

            {/* Author and character reference credits */}
            <div className="text-center mb-6">
              {selectedQuote.character ? (
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">
                  Personagem: <span className="font-bold text-stone-800 dark:text-stone-200">{selectedQuote.character}</span>
                </p>
              ) : null}
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                Autor: <span className="font-bold text-stone-750 dark:text-stone-300">{selectedQuote.author}</span>
              </p>
              <p className="text-xs font-display font-extrabold text-stone-900 dark:text-stone-100 mt-2 italic">
                Obra: « {selectedQuote.bookTitle} »
              </p>
            </div>

            {/* Command actions list */}
            <div className="flex items-center justify-between gap-3 border-t border-stone-100 dark:border-stone-800 pt-5">
              <button
                id="quote-popup-next"
                onClick={handleNextQuote}
                className="flex-1 py-2.5 px-4 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Próxima Frase
                <ChevronRight className="h-4 w-4" />
              </button>
              
              <button
                id="quote-popup-dismiss"
                onClick={() => setSelectedQuote(null)}
                className="py-2.5 px-4 bg-stone-100 dark:bg-stone-800 text-stone-605 dark:text-stone-300 rounded-xl text-xs font-bold transition-all hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
