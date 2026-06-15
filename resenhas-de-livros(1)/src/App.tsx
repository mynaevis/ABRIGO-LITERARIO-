import React, { useState, useEffect, useMemo } from "react";
import { Search, Sparkles, BookOpen, Filter, ArrowRight, Star, BookMarked, Layers } from "lucide-react";
import Header from "./components/Header";
import BookCard from "./components/BookCard";
import BookModal from "./components/BookModal";
import RankingsList from "./components/RankingsList";
import AuthorWorkspace from "./components/AuthorWorkspace";
import QuotesCard from "./components/QuotesCard";
import NewsletterForm from "./components/NewsletterForm";
import DailyFeaturedCarousel from "./components/DailyFeaturedCarousel";
import PolicyModal from "./components/PolicyModal";
import BestsellersByCategory from "./components/BestsellersByCategory";
import { BookReview, isRealAffiliateLink } from "./types";
import { THEMES } from "./themeConfig";

export default function App() {
  const [books, setBooks] = useState<BookReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Theme option state ("classic", "sepia", "ocean", "forest", "royal")
  const [currentThemeId, setCurrentThemeId] = useState(() => {
    return localStorage.getItem("virgo_active_theme") || "classic";
  });

  const activeTheme = useMemo(() => {
    return THEMES.find((t) => t.id === currentThemeId) || THEMES[0];
  }, [currentThemeId]);

  const handleThemeChange = (themeId: string) => {
    setCurrentThemeId(themeId);
    localStorage.setItem("virgo_active_theme", themeId);
  };

  // Search & Filtering State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [currentViewTab, setCurrentViewTab] = useState<"feed" | "studio">("feed");
  const [bookToEdit, setBookToEdit] = useState<BookReview | null>(null);
  
  // Pagination State for Mural do Leitor (feed)
  const [feedPage, setFeedPage] = useState(1);

  // Dynamic Sizing State for Carousels (Resenhas do Dia and Favoritos do Dia)
  const [dailyScale, setDailyScale] = useState<number>(() => {
    const saved = localStorage.getItem("bookshelter_universal_scale");
    return saved ? parseInt(saved, 10) : 100;
  });

  const [favoritesScale, setFavoritesScale] = useState<number>(() => {
    const saved = localStorage.getItem("bookshelter_universal_scale");
    return saved ? parseInt(saved, 10) : 100;
  });

  const handleDailyScaleChange = (scale: number) => {
    setDailyScale(scale);
    setFavoritesScale(scale);
    localStorage.setItem("bookshelter_universal_scale", String(scale));
  };

  const handleFavoritesScaleChange = (scale: number) => {
    setFavoritesScale(scale);
    setDailyScale(scale);
    localStorage.setItem("bookshelter_universal_scale", String(scale));
  };

  const [carouselBgDaily, setCarouselBgDaily] = useState<string>(() => {
    return localStorage.getItem("bookshelter_carousel_bg_daily") || "amber";
  });

  const [carouselBgFavorites, setCarouselBgFavorites] = useState<string>(() => {
    return localStorage.getItem("bookshelter_carousel_bg_favorites") || "amber";
  });

  const handleCarouselBgDailyChange = (preset: string) => {
    setCarouselBgDaily(preset);
    localStorage.setItem("bookshelter_carousel_bg_daily", preset);
  };

  const handleCarouselBgFavoritesChange = (preset: string) => {
    setCarouselBgFavorites(preset);
    localStorage.setItem("bookshelter_carousel_bg_favorites", preset);
  };

  // Reset feed page on filter / search changes
  useEffect(() => {
    setFeedPage(1);
  }, [searchTerm, selectedGenre]);

  // Selected Book for detailed modal overlay
  const [selectedBook, setSelectedBook] = useState<BookReview | null>(null);

  // Policy Modal state ('privacy' | 'terms' | null)
  const [policyType, setPolicyType] = useState<"privacy" | "terms" | null>(null);

  // Theme support: Dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("virgo_dark_mode") || localStorage.getItem("bookshelter_dark_mode");
    return saved === "true";
  });

  // Purchase Order Preference state
  const [buyOrder, setBuyOrder] = useState(() => {
    const saved = localStorage.getItem("bookshelter_buy_order") || localStorage.getItem("virgo_buy_order");
    return saved || "amazon,ml,shopee";
  });

  // Authentication/Admin mode for private drafts management
  const [isAdmin, setIsAdmin] = useState(() => {
    const saved = localStorage.getItem("resenhambook_author_active");
    return saved === "true";
  });

  // Local user favorite statuses
  const [favoritedIds, setFavoritedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("bookshelter_user_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToggleFavorite = async (id: string) => {
    const isFav = favoritedIds.includes(id);
    const updated = isFav ? favoritedIds.filter((favId) => favId !== id) : [...favoritedIds, id];
    setFavoritedIds(updated);
    localStorage.setItem("bookshelter_user_favorites", JSON.stringify(updated));

    // Optimistically update selected book if state is open
    if (selectedBook && selectedBook.id === id) {
      setSelectedBook((prev) => {
        if (!prev) return null;
        const offset = isFav ? -1 : 1;
        return {
          ...prev,
          favoritesWeekly: Math.max(0, (prev.favoritesWeekly || 0) + offset),
          favoritesMonthly: Math.max(0, (prev.favoritesMonthly || 0) + offset)
        };
      });
    }

    try {
      await fetch(`/api/books/${id}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !isFav })
      });
      // Retrieve updated values from database to keep lists in sync
      const res = await fetch("/api/books");
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
      }
    } catch (err) {
      console.error("Erro ao sincronizar favoritos com o banco:", err);
    }
  };

  // Apply dark mode side effects
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("virgo_dark_mode", String(isDarkMode));
  }, [isDarkMode]);

  // Persist purchase links sorting preferences
  useEffect(() => {
    localStorage.setItem("virgo_buy_order", buyOrder);
  }, [buyOrder]);

  // Handle locking/unlocking trigger
  const handleAdminToggle = (unlocked: boolean) => {
    setIsAdmin(unlocked);
    localStorage.setItem("resenhambook_author_active", String(unlocked));
    if (unlocked) {
      setCurrentViewTab("studio"); // Automatically switch to writing desk!
    } else {
      setCurrentViewTab("feed");
    }
  };

  // Fetch reviews from Express backend on mount
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/books");
      if (!res.ok) {
        throw new Error("Não foi possível carregar o banco de dados.");
      }
      const data = await res.json();
      setBooks(data);
      setErrorMsg("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Erro ao conectar com a API de resenhas. Por favor, reinicie o servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Filter books list for client public catalog vs private drafts
  const publicBooks = useMemo(() => {
    // Public catalog CANNOT see books with isDraft: true. Only published reviews!
    // It also dynamically filters out future scheduled publication dates.
    return books.filter((b) => {
      if (b.isDraft) return false;
      if (b.publishDate) {
        return new Date(b.publishDate) <= new Date();
      }
      return true;
    });
  }, [books]);

  // Daily featured book ("post diário de obras")
  const dailyFeaturedBook = useMemo(() => {
    const published = publicBooks;
    if (published.length === 0) return null;
    const featured = published.find((b) => b.dailyFeatured);
    return featured || published[0];
  }, [publicBooks]);

  // Unique list of genres currently available in published reviews (to support category filtering sidebar)
  const availableGenres = useMemo(() => {
    const list = new Set<string>();
    publicBooks.forEach((b) => {
      if (b.genre) list.add(b.genre);
    });
    return ["Todos", ...Array.from(list)];
  }, [publicBooks]);

  // Live filtering based on genre tags and search queries on title or author
  const filteredBooks = useMemo(() => {
    return publicBooks.filter((book) => {
      const matchGenre = selectedGenre === "Todos" || book.genre === selectedGenre;
      
      const matchSearch =
        searchTerm.trim() === "" ||
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.genre && book.genre.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchGenre && matchSearch;
    });
  }, [publicBooks, selectedGenre, searchTerm]);

  // Slicing for reader feed pagination (Mural do Leitor)
  const feedItemsPerPage = 10;
  const totalFeedPages = Math.ceil(filteredBooks.length / feedItemsPerPage);
  const safeFeedPage = Math.max(1, Math.min(feedPage, totalFeedPages || 1));
  const paginatedFeedBooks = useMemo(() => {
    const startIndex = (safeFeedPage - 1) * feedItemsPerPage;
    return filteredBooks.slice(startIndex, startIndex + feedItemsPerPage);
  }, [filteredBooks, safeFeedPage]);

  // Scroll to first post (top of feed) when page changes
  useEffect(() => {
    // Only scroll if we are not at the very first load or if state changes
    const anchor = document.getElementById("mural-do-leitor-anchor");
    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [safeFeedPage]);

  // API Call: Save or update books (drafts or published)
  const handleAddOrUpdateBook = async (bookData: Partial<BookReview>, isNew: boolean) => {
    try {
      const url = isNew ? "/api/books" : `/api/books/${bookData.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData)
      });

      if (!res.ok) {
        throw new Error("Erro de processamento no servidor.");
      }

      // Re-fetch database to refresh stats and feed
      await fetchBooks();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // API Call: Delete book review or draft
  const handleDeleteBook = async (id: string) => {
    try {
      const res = await fetch(`/api/books/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        throw new Error("Erro ao descartar item.");
      }
      await fetchBooks();
    } catch (err) {
      console.error("Erro ao deletar registro:", err);
    }
  };

  // Helper routine to render Hero buy buttons according to user purchase priority order
  const renderHeroBuyButtons = (book: BookReview) => {
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
            id="hero-buy-amazon"
            href={book.amazonLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#232F3E] text-stone-100 hover:bg-black transition-colors"
          >
            Amazon
          </a>
        );
      }
      if (market === "shopee") {
        return (
          <a
            key="shopee"
            id="hero-buy-shopee"
            href={book.shopeeLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#EE4D2D] text-white hover:bg-[#d63d1c] transition-colors"
          >
            Shopee
          </a>
        );
      }
      if (market === "ml") {
        return (
          <a
            key="ml"
            id="hero-buy-ml"
            href={book.mercadolivreLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#FFE600] text-stone-900 border border-stone-300 hover:bg-[#ebd500] transition-colors"
          >
            M. Livre
          </a>
        );
      }
      return null;
    });
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? activeTheme.darkBg + " " + activeTheme.darkText : activeTheme.lightBg + " " + activeTheme.lightText} selection:bg-amber-100 dark:selection:bg-amber-950/40 selection:text-amber-900 transition-colors duration-255`}>
      
      {/* Inject theme variables dynamically */}
      <style>{`
        :root {
          --app-bg: ${isDarkMode ? activeTheme.darkBgHex : activeTheme.lightBgHex};
          --app-text: ${isDarkMode ? activeTheme.darkTextHex : activeTheme.lightTextHex};
          --app-card: ${isDarkMode ? activeTheme.darkCardHex : activeTheme.lightCardHex};
          --app-border: ${isDarkMode ? activeTheme.darkBorderHex : activeTheme.lightBorderHex};
        }
        body {
          background-color: var(--app-bg) !important;
          color: var(--app-text) !important;
        }
        /* Override standard panel utility background mappings for absolute theme consistency */
        .bg-white, .dark\\:bg-stone-900 {
          background-color: var(--app-card) !important;
          color: var(--app-text) !important;
        }
        .border-stone-200, .dark\\:border-stone-800 {
          border-color: var(--app-border) !important;
        }
        #search-input-field {
          background-color: ${isDarkMode ? activeTheme.darkBgHex : '#ffffff'} !important;
          color: var(--app-text) !important;
          border-color: var(--app-border) !important;
        }
        /* Theme highlighted accent overrides */
        .text-amber-800, .dark\\:text-amber-400 {
          color: ${isDarkMode ? activeTheme.darkAccentText : activeTheme.lightAccentText} !important;
        }
        .bg-amber-800, .dark\\:bg-amber-400 {
          background-color: ${isDarkMode ? activeTheme.darkAccentText.replace('text-', 'bg-') : activeTheme.lightAccentText.replace('text-', 'bg-')} !important;
        }
      `}</style>

      {/* Top Header Module */}
      <Header 
        isAdmin={isAdmin} 
        onAdminToggle={handleAdminToggle}
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Context Stage */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        
        {/* Author Private Mode Subnavigation Banner */}
        {isAdmin && (
          <div className="mb-6 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl flex max-w-md border border-stone-200 dark:border-stone-700">
            <button
              id="subtab-readers-mural"
              onClick={() => setCurrentViewTab("feed")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                currentViewTab === "feed"
                  ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm"
                  : "text-stone-500 dark:text-white hover:text-stone-700 dark:hover:text-white"
              }`}
            >
              <BookMarked className="h-4 w-4" />
              Mural do Leitor
            </button>
            <button
              id="subtab-author-desk"
              onClick={() => setCurrentViewTab("studio")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                currentViewTab === "studio"
                  ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm"
                  : "text-stone-500 dark:text-white hover:text-stone-700 dark:hover:text-white"
              }`}
            >
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-450" />
              Mural do Autor
            </button>
          </div>
        )}

        {/* --- VIEW 1: CREATION STUDIO WITH DRAFT MANAGER --- */}
        {isAdmin && currentViewTab === "studio" ? (
          <div>
            <AuthorWorkspace
              books={books}
              onAddOrUpdateBook={handleAddOrUpdateBook}
              onDeleteBook={handleDeleteBook}
              buyOrder={buyOrder}
              onBuyOrderChange={(order) => {
                setBuyOrder(order);
                localStorage.setItem("bookshelter_buy_order", order);
              }}
              currentTheme={currentThemeId}
              onThemeChange={handleThemeChange}
              onRefreshCatalog={fetchBooks}
              initialBookToEdit={bookToEdit}
              onClearEditBook={() => setBookToEdit(null)}
              dailyScale={dailyScale}
              onDailyScaleChange={handleDailyScaleChange}
              favoritesScale={favoritesScale}
              onFavoritesScaleChange={handleFavoritesScaleChange}
              carouselBgDaily={carouselBgDaily}
              onCarouselBgDailyChange={handleCarouselBgDailyChange}
              carouselBgFavorites={carouselBgFavorites}
              onCarouselBgFavoritesChange={handleCarouselBgFavoritesChange}
            />
          </div>
        ) : (
          /* --- VIEW 2: PUBLIC LEADERS MURAL LITERÁRIO --- */
          <div className="flex flex-col gap-8 md:gap-10 animate-in fade-in duration-300">
            
            {/* Daily featured post highlights carousel ("posts diários sobre obras") */}
            <DailyFeaturedCarousel
              books={books}
              onSelectBook={setSelectedBook}
              buyOrder={buyOrder}
              favoritedIds={favoritedIds}
              onToggleFavorite={handleToggleFavorite}
              title="Resenhas do Dia"
              subtitle="Recomendações Diárias"
              isFavoritesMode={false}
              cardScale={dailyScale}
              bgPreset={carouselBgDaily}
            />
 
            {/* Core catalog section - Bento Grid Sidebar / Main Feed layouts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Stage Column (Grid System + Search controls) */}
              <div className="lg:col-span-8 flex flex-col gap-6" id="mural-do-leitor-anchor">
                
                {/* Section title "Mural do Leitor" which must be white in dark mode */}
                <div className="pb-1">
                  <h2 className="text-xl font-display font-black text-stone-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <BookMarked className="h-5.5 w-5.5 text-amber-800 dark:text-amber-450" />
                    Mural do Leitor
                  </h2>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                    Resenhas publicadas em tempo-real com indicações e links diretos para aquisição física.
                  </p>
                </div>

                {/* Search Bar & Stats Header */}
                <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500 pointer-events-none" />
                    <input
                      id="search-input-field"
                      type="text"
                      placeholder="Buscar por gênero, autor ou título de livro..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2.5 w-full text-xs rounded-xl border border-stone-250 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-850 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-stone-400 font-medium transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-stone-500 dark:text-stone-400">
                    <Layers className="h-4 w-4 text-stone-400" />
                    <span>Exibindo: <strong className="text-stone-800 dark:text-stone-200">{filteredBooks.length}</strong> brilhantes resenhas</span>
                  </div>
                </div>

                {/* Quick Genre tag selectors */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none flex-wrap">
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 font-extrabold uppercase tracking-wider mr-1.5 flex items-center gap-1">
                    <Filter className="h-3 w-3" /> Filtrar:
                  </span>
                  {availableGenres.map((genre) => (
                    <button
                      key={genre}
                      id={`genre-tag-${genre.replace(/\s+/g, "-")}`}
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        selectedGenre === genre
                          ? "bg-amber-800 text-white border-amber-800 shadow"
                          : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-amber-250 hover:bg-stone-50 dark:hover:bg-stone-850"
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>

                {/* Reviews card list grid of works */}
                {loading ? (
                  <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                    <div className="h-8 w-8 border-4 border-stone-200 border-t-amber-800 rounded-full animate-spin" />
                    <p className="text-xs text-stone-500 font-medium">Carregando acervo literário do Book Shelter...</p>
                  </div>
                ) : errorMsg ? (
                  <div className="py-12 text-center bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900 rounded-2xl text-red-800 dark:text-red-400 text-xs font-semibold animate-pulse">
                    {errorMsg}
                  </div>
                ) : filteredBooks.length === 0 ? (
                  <div className="py-16 text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 transition-colors">
                    <BookOpen className="h-12 w-12 text-stone-300 dark:text-stone-700" />
                    <div>
                      <p className="text-sm font-bold text-stone-750 dark:text-stone-250">Nenhum livro publicado corresponde a esta busca.</p>
                      <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 max-w-sm leading-normal">
                        Nossos curadores preparam novas resenhas diariamente. Tente trocar os filtros ou buscar por outros títulos correspondentes.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                      {paginatedFeedBooks.map((book) => (
                        <BookCard
                          key={book.id}
                          book={book}
                          onSelect={setSelectedBook}
                          isAdmin={isAdmin}
                          buyOrder={buyOrder}
                          isFavorited={favoritedIds.includes(book.id)}
                          onToggleFavorite={handleToggleFavorite}
                          onEdit={(b) => {
                            handleSelectDraftToEditInField(b);
                          }}
                          onDelete={handleDeleteBook}
                        />
                      ))}
                    </div>

                    {/* Reader Feed Pagination */}
                    {totalFeedPages > 1 && (
                      <div className="flex justify-center items-center w-full mt-6 pt-4 border-t border-stone-200 dark:border-stone-850">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => setFeedPage((p) => Math.max(1, p - 1))}
                            disabled={safeFeedPage === 1}
                            className="px-4 py-2 text-xs font-black rounded-xl border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-stone-50 dark:bg-stone-900 dark:hover:bg-stone-850 active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer"
                          >
                            ◀ Anterior
                          </button>
                          <span className="text-xs font-bold text-stone-500 dark:text-stone-400 bg-stone-100/40 dark:bg-stone-900/60 px-3.5 py-2 rounded-xl border border-stone-200/50 dark:border-stone-800/55">
                            Página <strong className="text-amber-801 dark:text-amber-400 font-extrabold">{safeFeedPage}</strong> de {totalFeedPages}
                          </span>
                          <button
                            type="button"
                            onClick={() => setFeedPage((p) => Math.min(totalFeedPages, p + 1))}
                            disabled={safeFeedPage === totalFeedPages}
                            className="px-4 py-2 text-xs font-black rounded-xl border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-stone-50 dark:bg-stone-900 dark:hover:bg-stone-850 active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer"
                          >
                            Próxima ▶
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>

              {/* Right Sidebar Column (Rankings + Interactive Quotes panel widget) */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* DYNAMIC SEPARATED RANKING LIST (Calculates instantly from DB views stats) */}
                <RankingsList
                  books={books}
                  onSelectBook={(bk) => {
                    setSelectedBook(bk);
                  }}
                />

                {/* DYNAMIC BESTSELLERS BY CATEGORY MODULE */}
                <BestsellersByCategory
                  books={books}
                  selectedCategory={selectedGenre}
                  onSelectBook={(bk) => {
                    setSelectedBook(bk);
                  }}
                  buyOrder={buyOrder}
                />

              </div>

            </div>

            {/* "Favoritos do Dia" Carousel below the main bento-grid in full width */}
            <div className="mt-6 animate-in fade-in duration-500">
              <DailyFeaturedCarousel
                books={books}
                onSelectBook={setSelectedBook}
                buyOrder={buyOrder}
                favoritedIds={favoritedIds}
                onToggleFavorite={handleToggleFavorite}
                title="Favoritos do Dia"
                subtitle="Os Mais Queridos Pelos Leitores"
                isFavoritesMode={true}
                cardScale={dailyScale}
                 bgPreset={carouselBgFavorites}
               />
             </div>

             {/* Citações de Obras & Newsletter in a 2-column full-width layout beneath Favoritos do Dia */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-stone-200 dark:border-stone-800 animate-in fade-in duration-500">
               <QuotesCard />
               <NewsletterForm />
             </div>

           </div>
         )}

      </main>

      {/* --- MODAL OVERLAY: FULL SPECIAL POP-UP LITERARY DETAIL --- */}
      {selectedBook && (
        <BookModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          buyOrder={buyOrder}
          isFavorited={favoritedIds.includes(selectedBook.id)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* --- MODAL OVERLAYS: PRIVACY POLICY / TERMS OF USE --- */}
      <PolicyModal
        isOpen={policyType !== null}
        type={policyType}
        onClose={() => setPolicyType(null)}
      />

      {/* Aesthetic Site Footer */}
      <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 py-12 mt-16 text-stone-500 text-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-800 dark:text-amber-400" />
            <span className="font-semibold font-display text-stone-850 dark:text-stone-200">Abrigo Literário © 2026</span>
            <span className="text-stone-300 dark:text-stone-700">|</span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500">Curadoria literária elegante</span>
          </div>

          {/* Links para as Páginas Obrigatórias */}
          <div className="flex items-center gap-4 text-xs font-semibold text-stone-500 dark:text-stone-400">
            <button
              onClick={() => setPolicyType("privacy")}
              className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors cursor-pointer hover:underline"
            >
              Política de Privacidade
            </button>
            <span className="text-stone-300 dark:text-stone-700">|</span>
            <button
              onClick={() => setPolicyType("terms")}
              className="hover:text-amber-800 dark:hover:text-amber-400 transition-colors cursor-pointer hover:underline"
            >
              Termos de Uso
            </button>
          </div>

          <div className="flex items-center gap-4 text-stone-400 dark:text-stone-500 font-medium font-mono text-[10px]">
            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-800 dark:text-amber-400 animate-pulse font-sans">
              Gemini Pro Ativo
            </span>
            <span>TypeScript SPA</span>
          </div>
        </div>
      </footer>

    </div>
  );

  // Helper routine to trigger edit tab on a published book from public cards if editor mode is on
  function handleSelectDraftToEditInField(book: BookReview) {
    setBookToEdit(book);
    setCurrentViewTab("studio");
  }
}
