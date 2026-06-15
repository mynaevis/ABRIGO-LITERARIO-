import React, { useState, useEffect, useMemo, useRef } from "react";
import { Sparkles, Star, ArrowRight, ArrowLeft, BookOpen, ExternalLink, Heart } from "lucide-react";
import { BookReview, isRealAffiliateLink } from "../types";
import { motion } from "motion/react";

interface DailyFeaturedCarouselProps {
  books: BookReview[];
  onSelectBook: (book: BookReview) => void;
  buyOrder: string;
  favoritedIds?: string[];
  onToggleFavorite?: (id: string) => void;
  title?: string;
  subtitle?: string;
  isFavoritesMode?: boolean;
  cardScale?: number;
  enableAnimations?: boolean;
  bgPreset?: string;
}

export default function DailyFeaturedCarousel({ 
  books, 
  onSelectBook, 
  buyOrder,
  favoritedIds = [],
  onToggleFavorite,
  title = "Resenhas do Dia",
  subtitle = "Recomendações Diárias",
  isFavoritesMode = false,
  cardScale = 100,
  enableAnimations = true,
  bgPreset = "amber"
}: DailyFeaturedCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const [visibleCount, setVisibleCount] = useState(3);

  const bgPresetClasses: Record<string, string> = {
    amber: "bg-gradient-to-br from-amber-400/25 via-orange-300/15 to-yellow-300/20 dark:from-amber-950/50 dark:via-orange-950/30 dark:to-stone-900/50 border-amber-400/70 dark:border-amber-700/60",
    slate: "bg-gradient-to-br from-cyan-400/25 via-blue-400/15 to-indigo-400/20 dark:from-cyan-950/50 dark:via-blue-950/35 dark:to-indigo-950/50 border-cyan-400/70 dark:border-cyan-700/60",
    emerald: "bg-gradient-to-br from-emerald-400/25 via-teal-400/15 to-lime-300/20 dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-stone-900/50 border-emerald-400/70 dark:border-emerald-700/60",
    rose: "bg-gradient-to-br from-rose-400/25 via-pink-400/15 to-purple-400/20 dark:from-rose-950/55 dark:via-pink-950/35 dark:to-stone-900/50 border-rose-400/70 dark:border-rose-800/60",
    stone: "bg-gradient-to-br from-violet-400/25 via-fuchsia-400/15 to-pink-400/20 dark:from-violet-950/50 dark:via-fuchsia-950/35 dark:to-stone-900/50 border-violet-400/70 dark:border-violet-750/60"
  };

  const customColors = useMemo(() => {
    if (bgPreset && bgPreset.startsWith("custom:")) {
      try {
        const parts = bgPreset.substring(7).split("_");
        return {
          from: parts[0] || "#ffffff",
          to: parts[1] || "#ffffff",
          border: parts[2] || "#cbd5e1"
        };
      } catch (e) {
        return null;
      }
    }
    return null;
  }, [bgPreset]);

  const activeBgClass = customColors ? "" : (bgPresetClasses[bgPreset] || bgPresetClasses.amber);

  // Filter out any draft books
  const publicBooks = useMemo(() => {
    return books.filter((b) => !b.isDraft);
  }, [books]);

  // Deterministic daily selection/sorting of 10 books based on the current date seed or favorites ranking
  const daily10 = useMemo(() => {
    if (publicBooks.length === 0) return [];

    if (isFavoritesMode) {
      // Sort by favorites count to exhibit the most favorited books
      return [...publicBooks]
        .sort((a, b) => {
          const scoreA = (a.favoritesWeekly || 0) * 3 + (a.favoritesMonthly || 0) + (a.rating || 0);
          const scoreB = (b.favoritesWeekly || 0) * 3 + (b.favoritesMonthly || 0) + (b.rating || 0);
          return scoreB - scoreA;
        })
        .slice(0, 10);
    }

    // Formulate a stable numeric seed for the current date (e.g. 20260613)
    const today = new Date();
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    // Custom deterministic pseudo-random number generator (LCG-style)
    let seed = dateSeed;
    const lcgRandom = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    // Fisher-Yates deterministic shuffle
    const shuffled = [...publicBooks];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(lcgRandom() * (i + 1));
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }

    // Return exactly the first 10 books (or fewer if catalog is smaller)
    return shuffled.slice(0, 10);
  }, [publicBooks, isFavoritesMode]);

  // Dynamically update the number of visible cards based on the actual window width
  useEffect(() => {
    const updateCount = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };
    updateCount();
    window.addEventListener("resize", updateCount);
    return () => window.removeEventListener("resize", updateCount);
  }, []);

  // Limit the maximum scroll index to prevent empty white space at the end of the slide
  const maxIndex = useMemo(() => {
    return Math.max(0, daily10.length - visibleCount);
  }, [daily10, visibleCount]);

  // Auto-slide to the next set of books every 6 seconds inside an effect
  const startAutoplay = () => {
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      handleNext();
    }, 6000);
  };

  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  };

  useEffect(() => {
    if (daily10.length > visibleCount) {
      startAutoplay();
    }
    return () => stopAutoplay();
  }, [daily10, activeIndex, visibleCount, maxIndex]);

  // Next slide handler (loops index back to 0 on final edge)
  const handleNext = () => {
    if (daily10.length <= visibleCount) return;
    setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  // Previous slide handler
  const handlePrev = () => {
    if (daily10.length <= visibleCount) return;
    setActiveIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  if (daily10.length === 0) return null;

  // Helper to render rating review stars
  const renderStars = (rating: number) => {
    const stars = [];
    const absolute = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= absolute) {
        stars.push(<Star key={i} className="h-3 w-3 fill-amber-500 text-amber-500" />);
      } else if (i - 0.5 <= rating) {
        stars.push(
          <div key={i} className="relative inline-block text-amber-500">
            <Star className="h-3 w-3 text-stone-300 dark:text-stone-600" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="h-3 w-3 text-stone-300 dark:text-stone-600" />);
      }
    }
    return stars;
  };

  // Render marketplaces priority list corresponding to localized user options
  const renderSortedBuyButtons = (book: BookReview) => {
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
            href={book.amazonLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#232F3E] text-white hover:bg-black transition-colors rounded-lg text-[10px] font-bold"
            title="Comprar na Amazon"
          >
            <span className="text-white">Amazon</span>
            <ExternalLink className="h-2.5 w-2.5 text-white" />
          </a>
        );
      }
      if (market === "shopee") {
        return (
          <a
            key="shopee"
            href={book.shopeeLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#EE4D2D] text-white hover:bg-[#d63d1c] transition-colors rounded-lg text-[10px] font-bold"
            title="Comprar na Shopee"
          >
            <span>Shopee</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        );
      }
      if (market === "ml") {
        return (
          <a
            key="ml"
            href={book.mercadolivreLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFE600] text-stone-905 border border-stone-300 hover:bg-[#ebd500] transition-colors rounded-lg text-[10px] font-extrabold"
            title="Comprar no Mercado Livre"
          >
            <span>M. Livre</span>
            <ExternalLink className="h-2.5 w-2.5 text-stone-700" />
          </a>
        );
      }
      return null;
    });
  };

  return (
    <section id="daily-featured-carousel" className="w-full select-none" onMouseEnter={stopAutoplay} onMouseLeave={startAutoplay}>
      
      {/* Outer master container container with rich contrasting background */}
      <div 
        className={`${activeBgClass} rounded-3xl border-2 p-6 relative overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group`}
        style={customColors ? {
          background: `linear-gradient(135deg, ${customColors.from}, ${customColors.to})`,
          borderColor: customColors.border
        } : undefined}
      >
        
        {/* Ambient subtle light vector flare */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 dark:bg-amber-400/10 rounded-bl-full pointer-events-none z-0" />
        
        {/* Dynamic header with navigation options */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black dark:bg-amber-500/10 text-[10px] text-white dark:text-amber-400 font-extrabold uppercase tracking-widest rounded-full shadow-xs border border-stone-900 dark:border-amber-500/20">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-amber-350 dark:text-amber-400" />
              {title}
            </span>
            <span className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 hidden sm:inline-block">
              {subtitle}
            </span>
          </div>
          
          {/* Slider state dots / buttons counter */}
          <div className="text-[10px] font-bold text-stone-500 dark:text-stone-405 bg-stone-100/80 dark:bg-stone-900 px-2.5 py-1 rounded-md border border-stone-200 dark:border-stone-850">
            OBRAS <span className="text-amber-805 dark:text-amber-400 font-extrabold">{activeIndex + 1}</span> DE {Math.max(1, daily10.length - visibleCount + 1)}
          </div>
        </div>

        {/* Viewport content window */}
        <div className="overflow-hidden relative w-full z-10 px-1">
          
          {/* Scrolling horizontal Track */}
          <div
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{ transform: `translateX(-${activeIndex * (100 / visibleCount)}%)` }}
          >
            {daily10.map((book) => (
              <div
                key={book.id}
                onClick={() => onSelectBook(book)}
                className="flex-shrink-0 px-2 cursor-pointer transition-all duration-300"
                style={{ width: `${100 / visibleCount}%` }}
              >
                <div 
                  className="relative group/card overflow-hidden rounded-2xl border-2 border-stone-200/80 dark:border-stone-800 hover:border-amber-500 dark:hover:border-amber-400 bg-stone-250 dark:bg-stone-900 shadow-md hover:shadow-xl w-full flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015]"
                  style={{ height: `${280 * (cardScale / 100)}px` }}
                >
                  
                  {/* Heart button for favoriting on carousel card cover */}
                  {onToggleFavorite && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(book.id);
                      }}
                      className="absolute top-3 left-3 z-20 h-9 w-9 rounded-full bg-white/95 hover:bg-white dark:bg-stone-900/95 dark:hover:bg-stone-900 shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer border border-stone-200/50 dark:border-stone-800/50"
                      title={favoritedIds.includes(book.id) ? "Remover dos favoritos" : "Favoritar obra"}
                    >
                      <Heart className={`h-4 w-4 transition-colors ${favoritedIds.includes(book.id) ? "fill-rose-500 text-rose-500" : "text-stone-500 dark:text-stone-400 hover:text-rose-500"}`} />
                    </button>
                  )}

                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain p-2 group-hover/card:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 dark:text-stone-500 bg-stone-205 dark:bg-stone-950 p-4 text-center">
                      <BookOpen className="h-10 w-10 text-stone-350 dark:text-stone-700 mb-2" />
                      <span className="text-[11px] font-black uppercase tracking-widest leading-snug line-clamp-2 px-2 text-stone-700 dark:text-stone-300">{book.title}</span>
                      <span className="text-[9px] font-semibold text-stone-500 dark:text-stone-400 mt-1">por {book.author}</span>
                    </div>
                  )}

                  {/* Elegant minimal hover title strip to show info on hover */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent p-5 translate-y-full group-hover/card:translate-y-0 transition-transform duration-300 z-10 flex flex-col pointer-events-none">
                    <span className="text-white text-sm sm:text-base font-black line-clamp-2 leading-tight tracking-tight">{book.title}</span>
                    <span className="text-stone-350 text-xs font-bold mt-1">por {book.author}</span>
                    <span className="text-[#FFE600] text-xs font-extrabold uppercase tracking-widest mt-2 flex items-center gap-1">Ver detalhes completo ➔</span>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel indicator controls */}
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-stone-105 dark:border-stone-800 relative z-10">
          
          {/* Navigation Prev Button */}
          <button
            id="carousel-prev-btn"
            onClick={handlePrev}
            className="p-1.5 border border-stone-200 dark:border-stone-800 bg-stone-50 hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-850 text-stone-600 dark:text-stone-300 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-40"
            title="Obra Anterior"
            disabled={daily10.length <= visibleCount}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Indicators list dots pagination */}
          <div className="flex items-center gap-1.5 select-none text-center">
            {Array.from({ length: Math.max(1, daily10.length - visibleCount + 1) }).map((_, idx) => (
              <button
                key={idx}
                id={`carousel-indicator-dot-${idx}`}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  activeIndex === idx
                    ? "w-6 bg-amber-800 dark:bg-amber-500 shadow-xs"
                    : "w-2 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300"
                }`}
                title={`Ir para o slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation Next Button */}
          <button
            id="carousel-next-btn"
            onClick={handleNext}
            className="p-1.5 border border-stone-200 dark:border-stone-800 bg-stone-50 hover:bg-stone-100 dark:bg-stone-900 dark:hover:bg-stone-850 text-stone-600 dark:text-stone-300 rounded-xl transition-all cursor-pointer shadow-xs"
            title="Próxima Obra"
            disabled={daily10.length <= visibleCount}
          >
            <ArrowRight className="h-4 w-4" />
          </button>

        </div>

      </div>
    </section>
  );
}
