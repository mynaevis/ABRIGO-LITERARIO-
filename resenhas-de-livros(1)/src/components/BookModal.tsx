import React, { useEffect } from "react";
import { X, Star, ExternalLink, Sparkles, BookOpen, ShoppingBag, Eye, Heart } from "lucide-react";
import { BookReview, isRealAffiliateLink } from "../types";

interface BookModalProps {
  book: BookReview;
  onClose: () => void;
  buyOrder?: string;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export default function BookModal({ 
  book, 
  onClose, 
  buyOrder = "amazon,shopee,ml",
  isFavorited = false,
  onToggleFavorite
}: BookModalProps) {
  // Increment view count securely via backend in the background when the review modal is loaded
  useEffect(() => {
    // If it's a draft, don't increment public view counts!
    if (book.isDraft) return;

    fetch(`/api/books/${book.id}/view`, {
      method: "POST"
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Visualização contabilizada com sucesso:", data);
      })
      .catch((err) => {
        console.error("Falha ao registrar visualização:", err);
      });
  }, [book.id, book.isDraft]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const renderStars = (rating: number) => {
    const stars = [];
    const absolute = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= absolute) {
        stars.push(<Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />);
      } else if (i - 0.5 <= rating) {
        stars.push(
          <div key={i} className="relative inline-block text-amber-500">
            <Star className="h-4 w-4 text-stone-350 dark:text-stone-605" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-stone-300 dark:text-stone-650" />);
      }
    }
    return stars;
  };

  const renderSortedBuyButtons = () => {
    const orderArray = buyOrder.split(",");
    const validMarkets = orderArray.filter((market) => {
      if (market === "amazon") return isRealAffiliateLink(book.amazonLink);
      if (market === "shopee") return isRealAffiliateLink(book.shopeeLink);
      if (market === "ml") return isRealAffiliateLink(book.mercadolivreLink);
      return false;
    });

    if (validMarkets.length === 0) return null;

    return validMarkets.map((market) => {
      if (market === "amazon") {
        return (
          <a
            key="amazon"
            id="modal-buy-amazon"
            href={book.amazonLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-[#232F3E] text-stone-100 hover:bg-black dark:hover:bg-[#111] transition-colors flex items-center justify-center gap-2 shadow"
          >
            <ShoppingBag className="h-4 w-4" />
            Amazon
          </a>
        );
      }
      if (market === "shopee") {
        return (
          <a
            key="shopee"
            id="modal-buy-shopee"
            href={book.shopeeLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-[#EE4D2D] text-white hover:bg-[#d63d1c] transition-colors flex items-center justify-center gap-2 shadow"
          >
            <ShoppingBag className="h-4 w-4" />
            Shopee
          </a>
        );
      }
      if (market === "ml") {
        return (
          <a
            key="ml"
            id="modal-buy-ml"
            href={book.mercadolivreLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-[#FFE600] text-stone-900 border border-stone-300 dark:border-stone-750 hover:bg-[#ebd500] transition-colors flex items-center justify-center gap-2 shadow"
          >
            <ShoppingBag className="h-4 w-4" />
            M. Livre
          </a>
        );
      }
      return null;
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Container card - INCREASED SIZE (width from max-w-2xl changed to max-w-4xl) */}
      <div
        id="book-modal-card"
        className="relative bg-white dark:bg-stone-900 rounded-3xl max-w-4xl w-full p-6 md:p-10 shadow-2xl border border-stone-205 dark:border-stone-800 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-250 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-full border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Cover column - INCREASED SPACE (w-44 to md:w-56, h-64 to h-[360px]) */}
          <div className="w-full md:w-56 flex-shrink-0 mx-auto md:mx-0">
            <div className="w-full h-80 md:h-[350px] rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-850 shadow-md border border-stone-200 dark:border-stone-750 relative">
              
              {/* Heart button for favoriting on container cover */}
              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(book.id)}
                  className="absolute top-3 left-3 z-20 h-10 w-10 rounded-full bg-white/95 hover:bg-white dark:bg-stone-900/95 dark:hover:bg-stone-900 shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer border border-stone-200/50 dark:border-stone-800/50"
                  title={isFavorited ? "Remover dos favoritos" : "Favoritar obra"}
                >
                  <Heart className={`h-5 w-5 transition-colors ${isFavorited ? "fill-rose-500 text-rose-500" : "text-stone-500 dark:text-stone-400 hover:text-rose-500"}`} />
                </button>
              )}

              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={`Capa do livro ${book.title}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-stone-100 dark:bg-stone-800 flex flex-col items-center justify-center p-4 text-stone-500 text-center font-display">
                  <BookOpen className="h-12 w-12 text-stone-400 dark:text-stone-600 mb-2" />
                  <span className="text-xs uppercase font-extrabold tracking-wider">Sem Capa</span>
                </div>
              )}
            </div>

            {/* Quick buy links column widget with CUSTOM ORDERING */}
            {!book.isDraft && (isRealAffiliateLink(book.amazonLink) || isRealAffiliateLink(book.shopeeLink) || isRealAffiliateLink(book.mercadolivreLink)) && (
              <div className="mt-6 flex flex-col gap-2.5">
                <span className="text-[10px] text-stone-400 dark:text-stone-500 font-extrabold uppercase tracking-widest text-center block mb-1">
                  Onde Comprar:
                </span>
                {renderSortedBuyButtons()}
              </div>
            )}
          </div>

          {/* Book core content column - INCREASED TYPOGRAPHY (Fonte maior) */}
          <div className="flex-grow flex flex-col gap-5 min-w-0">
            <div>
              <div className="flex items-center gap-2 mb-2 px-1 flex-wrap">
                <span className="px-3 py-0.5 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-850 dark:text-amber-300 border border-amber-200 dark:border-amber-900 uppercase tracking-widest">
                  {book.genre}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400">
                  {renderStars(book.rating)}
                  <span className="ml-1 text-stone-800 dark:text-stone-200 font-bold">{book.rating.toFixed(1)} / 5.0</span>
                </span>
              </div>

              {/* Increased Font Size */}
              <h2 className="text-3xl md:text-4xl font-display font-extrabold text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
                {book.title}
              </h2>
              <p className="text-base font-semibold text-stone-500 dark:text-stone-400 mt-1.5">
                Escrito por: <span className="text-stone-800 dark:text-stone-200 font-bold">{book.author}</span>
              </p>
            </div>

            {/* Title renamed: "Indagações/Críticas e Pensamentos reflexivos" & INCREASED FONT */}
            <div className="p-5 md:p-6 bg-amber-50/40 dark:bg-stone-950/80 rounded-2xl border border-stone-200 dark:border-stone-800 italic text-base text-stone-900 dark:text-stone-100 font-serif leading-relaxed relative mt-2">
              <span className="absolute -top-3 left-4 px-2.5 py-0.5 bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-805 text-[10px] uppercase font-extrabold text-amber-850 dark:text-amber-400 tracking-widest rounded-md">
                Indagações/Críticas e Pensamentos reflexivos
              </span>
              “{book.reviewText || "Nenhuma indagação/crítica descrita para este volume."}”
            </div>

            {/* Title renamed: "Análise Crítica e Pensamentos Reflexivos" & limit to 2 paragraphs */}
            {book.summaryAi ? (
              <div className="p-6 bg-stone-50/50 dark:bg-stone-950/60 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm relative flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                  <Sparkles className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                  <span className="uppercase tracking-wider">Análise Crítica e Pensamentos Reflexivos</span>
                </div>
                <div className="text-sm md:text-base text-stone-900 dark:text-stone-100 leading-relaxed space-y-3 font-serif">
                  {book.summaryAi.split("\n\n").slice(0, 2).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 bg-stone-50/50 dark:bg-stone-850/20 rounded-2xl border border-stone-200 dark:border-stone-800 text-center text-sm text-stone-450 italic">
                Análise crítica e pensamentos reflexivos não disponíveis para esta obra.
              </div>
            )}

            {/* Stats row */}
            {!book.isDraft && (
              <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 font-mono border-t border-stone-105 dark:border-stone-800 pt-4 mt-2">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    Visualizações Semanal: <strong>{book.viewsWeekly || 0}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    Mensal: <strong>{book.viewsMonthly || 0}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 border-t border-stone-100 dark:border-stone-800 pt-5 mt-3">
          <button
            id="book-modal-close-bottom"
            onClick={onClose}
            className="px-6 py-3 bg-stone-950 hover:bg-black dark:bg-stone-950 dark:hover:bg-stone-800 text-white hover:text-white dark:text-stone-100 text-xs font-black uppercase tracking-widest rounded-xl cursor-pointer shadow-md transition-colors border border-stone-900"
          >
            Fechar Detalhes
          </button>
        </div>

      </div>
    </div>
  );
}
