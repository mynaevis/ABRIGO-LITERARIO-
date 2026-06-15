import React from "react";
import { Star, ShoppingCart, ExternalLink, Sparkles, BookOpen, Clock, Edit3, Trash2, Heart } from "lucide-react";
import { BookReview, isRealAffiliateLink } from "../types";
import { motion } from "motion/react";

interface BookCardProps {
  key?: string | number;
  book: BookReview;
  onSelect: (book: BookReview) => void;
  isAdmin: boolean;
  onEdit?: (book: BookReview) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
  buyOrder?: string;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export default function BookCard({ 
  book, 
  onSelect, 
  isAdmin, 
  onEdit, 
  onDelete, 
  buyOrder = "amazon,shopee,ml",
  isFavorited = false,
  onToggleFavorite
}: BookCardProps) {
  
  // Safe handler to make sure click on direct buy buttons doesn't trigger card modal select
  const handlePurchaseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Convert scale to visual stars
  const renderStars = (rating: number) => {
    const stars = [];
    const absolute = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= absolute) {
        stars.push(<Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />);
      } else if (i - 0.5 <= rating) {
        stars.push(
          <div key={i} className="relative inline-block text-amber-500">
            <Star className="h-3.5 w-3.5 text-stone-300 dark:text-stone-600" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="h-3.5 w-3.5 text-stone-300 dark:text-stone-600" />);
      }
    }
    return stars;
  };

  // Render marketplace links based on the chosen custom purchase order
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
            id={`buy-amazon-${book.id}`}
            href={book.amazonLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#232F3E] text-white hover:bg-black dark:hover:bg-[#111] transition-colors shadow-xs"
            title="Comprar na Amazon"
          >
            <span className="text-white">Amazon</span>
            <ExternalLink className="h-3 w-3 text-white" />
          </a>
        );
      }
      if (market === "shopee") {
        return (
          <a
            key="shopee"
            id={`buy-shopee-${book.id}`}
            href={book.shopeeLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#EE4D2D] text-white hover:bg-[#d63d1c] transition-colors shadow-xs"
          >
            <span>Shopee</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      }
      if (market === "ml") {
        return (
          <a
            key="ml"
            id={`buy-ml-${book.id}`}
            href={book.mercadolivreLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#FFE600] text-stone-900 border border-stone-300 hover:bg-[#ebd500] transition-colors shadow-xs"
          >
            <span>M. Livre</span>
            <ExternalLink className="h-3 w-3 text-stone-700" />
          </a>
        );
      }
      return null;
    });
  };

  return (
    <div
      id={`book-card-${book.id}`}
      onClick={() => onSelect(book)}
      className="group bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-amber-800 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-6 cursor-pointer relative overflow-hidden"
    >
      {/* Draft/Featured badging */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
        {book.isDraft && (
          <span className="inline-flex items-center gap-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] uppercase font-bold px-2 py-1 rounded-md border border-stone-200 dark:border-stone-750">
            <Clock className="h-3 w-3" />
            Rascunho
          </span>
        )}
        {book.dailyFeatured && !book.isDraft && (
          <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-[10px] uppercase font-bold px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-900 animate-pulse">
            <Sparkles className="h-3 w-3 text-rose-500" />
            Destaque do Dia
          </span>
        )}
      </div>

      {/* Book Cover Container - Dynamic aspect ratio matching carousel slides */}
      <div className="w-full sm:w-56 md:w-48 aspect-[3/4.2] rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-850 relative flex-shrink-0 shadow-md border-2 border-stone-200/80 dark:border-stone-800 group-hover:border-amber-500 dark:group-hover:border-amber-400 group-hover:shadow-lg transition-all duration-300 mx-auto md:mx-0 flex items-center justify-center">
        
        {/* Heart button for favoriting to cover image */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(book.id);
            }}
            className="absolute top-3 left-3 z-20 h-9 w-9 rounded-full bg-white/90 hover:bg-white dark:bg-stone-900/90 dark:hover:bg-stone-900 shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer border border-stone-200/50 dark:border-stone-800/50"
            title={isFavorited ? "Remover dos favoritos" : "Favoritar obra"}
          >
            <Heart className={`h-4.5 w-4.5 transition-colors ${isFavorited ? "fill-rose-500 text-rose-500" : "text-stone-500 dark:text-stone-400 hover:text-rose-500"}`} />
          </button>
        )}

        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={`Capa do livro ${book.title}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 font-medium"
            onError={(e) => {
              // Fail-safe default
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80";
            }}
          />
        ) : (
          <div className="w-full h-full bg-stone-200 dark:bg-stone-800 flex flex-col items-center justify-center p-3 text-stone-500 dark:text-stone-400 font-display">
            <BookOpen className="h-10 w-10 text-stone-400 dark:text-stone-600 mb-2" />
            <span className="text-[10px] uppercase tracking-wider font-bold">Sem Capa</span>
          </div>
        )}
        <div className="absolute inset-0 bg-stone-900/10 dark:bg-stone-900/20 group-hover:bg-transparent transition-colors duration-300" />
      </div>

      {/* Book Info & Catchy Review */}
      <div className="flex flex-col flex-grow justify-between min-w-0">
        <div>
          {/* Metadata */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 dark:bg-stone-950 text-stone-650 dark:text-amber-300 border border-stone-200 dark:border-stone-800 uppercase tracking-widest">
              {book.genre}
            </span>
            <div className="flex items-center gap-1">
              {renderStars(book.rating)}
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-100 ml-1">
                {book.rating.toFixed(1)} / 5.0
              </span>
            </div>
          </div>

          {/* Title & Author */}
          <h3 className="text-xl font-display font-bold text-stone-900 dark:text-stone-55 tracking-tight leading-snug group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors truncate">
            {book.title}
          </h3>
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-2 truncate">
            por <span className="text-stone-700 dark:text-stone-200 font-bold">{book.author}</span>
          </p>

          {/* Added Análise Crítica block requested by user */}
          <div className="mt-2.5 mb-3 p-3 bg-stone-50/70 dark:bg-stone-950/40 rounded-xl border border-stone-200 dark:border-stone-800/60 relative group/critica">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#880808] dark:text-[#ff9494]">
                Análise Crítica & Resenha:
              </span>
              <span className="text-[10px] font-black text-amber-705 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1 bg-amber-100/55 dark:bg-amber-400/10 px-2 py-0.5 rounded-md animate-pulse">
                clique e saiba mais ➔
              </span>
            </div>
            <p className="text-stone-750 dark:text-stone-250 text-xs leading-relaxed italic font-serif line-clamp-3">
              "{book.reviewText || "Esta memorável obra aguarda indagações ou foi cadastrada de forma simplificada."}"
            </p>
          </div>
        </div>

        {/* Buy and Edit Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 border-t border-stone-100 dark:border-stone-800/80 flex-wrap">
          {/* Sorted Buy buttons */}
          {!book.isDraft ? (
            isRealAffiliateLink(book.amazonLink) || isRealAffiliateLink(book.shopeeLink) || isRealAffiliateLink(book.mercadolivreLink) ? (
              <div className="flex items-center gap-2 flex-wrap" onClick={handlePurchaseClick}>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mr-1">Comprar:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {renderSortedBuyButtons()}
                </div>
              </div>
            ) : null
          ) : (
            <div className="text-stone-400 dark:text-stone-500 text-xs italic flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              Rascunho não publicado - visualize para revisar.
            </div>
          )}

          {/* Admin editing/deleting triggers */}
          {isAdmin && (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {onEdit && (
                <button
                  id={`edit-draft-btn-${book.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(book);
                  }}
                  className="p-1 px-2.5 flex items-center gap-1 text-[11px] font-semibold text-amber-900 dark:text-amber-305 bg-amber-50 dark:bg-amber-950/40 rounded-md border border-amber-200 dark:border-amber-900 hover:bg-amber-100/80 transition-colors cursor-pointer text-stone-900"
                  title="Editar rascunho/resenha"
                >
                  <Edit3 className="h-3 w-3" />
                  Editar
                </button>
              )}
              {onDelete && (
                <button
                  id={`delete-draft-btn-${book.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(book.id);
                  }}
                  className="p-1 px-2.5 flex items-center gap-1 text-[11px] font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-md border border-red-200 dark:border-red-900 hover:bg-red-100/80 transition-colors cursor-pointer"
                  title="Remover definitivamente"
                >
                  <Trash2 className="h-3 w-3" />
                  Deleta
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
