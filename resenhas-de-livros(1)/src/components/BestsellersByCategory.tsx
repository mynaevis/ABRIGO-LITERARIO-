import React from "react";
import { Award, ShoppingCart, Star, Flame, ArrowUpRight, BookOpen } from "lucide-react";
import { BookReview } from "../types";

interface BestsellersByCategoryProps {
  books: BookReview[];
  selectedCategory: string;
  onSelectBook: (book: BookReview) => void;
  buyOrder: string;
}

export default function BestsellersByCategory({
  books,
  selectedCategory,
  onSelectBook,
  buyOrder,
}: BestsellersByCategoryProps) {
  // Filter out drafts and get published reviews
  const publishedBooks = books.filter((b) => !b.isDraft);

  // Group or filter by category
  const categoryBooks = React.useMemo(() => {
    if (selectedCategory === "Todos") {
      // Sort overall by combinations of rating and views
      return [...publishedBooks]
        .sort((a, b) => b.rating - a.rating || (b.viewsMonthly || 0) - (a.viewsMonthly || 0))
        .slice(0, 3);
    }
    return [...publishedBooks]
      .filter((b) => b.genre?.toLowerCase() === selectedCategory.toLowerCase())
      .sort((a, b) => b.rating - a.rating || (b.viewsMonthly || 0) - (a.viewsMonthly || 0))
      .slice(0, 3);
  }, [publishedBooks, selectedCategory]);

  const getCheapestLink = (book: BookReview) => {
    const order = buyOrder.split(",");
    for (const platform of order) {
      if (platform === "amazon" && book.amazonLink) return { name: "Amazon", url: book.amazonLink, color: "bg-[#232F3E] text-white hover:bg-black" };
      if (platform === "ml" && book.mercadolivreLink) return { name: "Mercado Livre", url: book.mercadolivreLink, color: "bg-[#FFE600] text-stone-900 hover:bg-[#ebd500]" };
      if (platform === "shopee" && book.shopeeLink) return { name: "Shopee", url: book.shopeeLink, color: "bg-[#EE4D2D] text-white hover:bg-[#d63d1c]" };
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm flex flex-col gap-5 transition-colors duration-200">
      <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800/80">
        <div className="flex flex-col">
          <h3 className="text-sm font-display font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 uppercase tracking-wide">
            <Flame className="h-4.5 w-4.5 text-orange-600 animate-pulse" />
            Mais Vendidos
          </h3>
          <p className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">
            Categoria: <span className="font-extrabold text-amber-800 dark:text-amber-400">{selectedCategory}</span>
          </p>
        </div>
        <span className="bg-amber-100/60 dark:bg-amber-950/40 text-amber-850 dark:text-amber-300 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest">
          Rank #1
        </span>
      </div>

      {categoryBooks.length === 0 ? (
        <div className="py-6 text-center text-stone-400 dark:text-stone-500 text-xs">
          <BookOpen className="h-6 w-6 mx-auto text-stone-300 dark:text-stone-700 mb-1" />
          Nenhum best-seller registrado nesta categoria ainda.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {categoryBooks.map((book, index) => {
            const platformLink = getCheapestLink(book);
            return (
              <div
                key={book.id}
                id={`bestseller-item-${index}`}
                className="group relative flex gap-3 p-2.5 rounded-xl border border-stone-100 dark:border-stone-800 hover:border-amber-200/60 dark:hover:border-amber-900/40 hover:bg-stone-50/50 dark:hover:bg-stone-850/30 transition-all duration-300"
              >
                {/* Ranking Badge */}
                <div className="absolute -top-1.5 -left-1.5 h-5 w-5 rounded-full bg-amber-800 dark:bg-amber-500 text-white dark:text-stone-900 flex items-center justify-center text-[10px] font-black shadow-xs z-10 font-mono">
                  {index + 1}
                </div>

                {/* Book Cover */}
                <div
                  onClick={() => onSelectBook(book)}
                  className="w-12 h-18 rounded overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-750 shadow-xs flex-shrink-0 cursor-pointer relative"
                >
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300Shared"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px]">
                      📖
                    </div>
                  )}
                </div>

                {/* Info and links */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div onClick={() => onSelectBook(book)} className="cursor-pointer">
                    <h4 className="text-xs font-bold text-stone-850 dark:text-stone-100 leading-snug truncate group-hover:text-amber-850 dark:group-hover:text-amber-400 transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500 truncate mt-0.5">
                      de {book.author}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 mt-1">
                    {/* Rating display */}
                    <div className="flex items-center gap-0.5 text-amber-700 dark:text-amber-400 font-bold text-[10px]">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span>{book.rating.toFixed(1)}</span>
                    </div>

                    {/* Quick store connection */}
                    {platformLink ? (
                      <a
                        href={platformLink.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-1 py-1 px-2.5 rounded-lg text-[9px] font-extrabold transition-all duration-200 uppercase tracking-wider ${platformLink.color}`}
                      >
                        <ShoppingCart className="h-2.5 w-2.5" />
                        <span>Comprar</span>
                        <ArrowUpRight className="h-2.5 w-2.5 opacity-70" />
                      </a>
                    ) : (
                      <span className="text-[9px] text-stone-400 font-medium">Link indisponível</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
