import React, { useState } from "react";
import { Sparkles, Save, Upload, RotateCcw, PenSquare, Eye, Edit3, Trash2, CheckCircle, FileText, ArrowRight, Star, X, ArrowUpDown, Table, Calendar } from "lucide-react";
import { BookReview } from "../types";
import BulkImportSheet from "./BulkImportSheet";
import { THEMES } from "../themeConfig";

interface AuthorWorkspaceProps {
  books: BookReview[];
  onAddOrUpdateBook: (bookData: Partial<BookReview>, isNew: boolean) => Promise<void>;
  onDeleteBook: (id: string) => Promise<void>;
  buyOrder: string;
  onBuyOrderChange: (order: string) => void;
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
  onRefreshCatalog: () => Promise<void>;
  initialBookToEdit?: BookReview | null;
  onClearEditBook?: () => void;
  dailyScale: number;
  onDailyScaleChange: (scale: number) => void;
  favoritesScale: number;
  onFavoritesScaleChange: (scale: number) => void;
  carouselBgDaily: string;
  onCarouselBgDailyChange: (preset: string) => void;
  carouselBgFavorites: string;
  onCarouselBgFavoritesChange: (preset: string) => void;
}

export default function AuthorWorkspace({
  books,
  onAddOrUpdateBook,
  onDeleteBook,
  buyOrder,
  onBuyOrderChange,
  currentTheme,
  onThemeChange,
  onRefreshCatalog,
  initialBookToEdit,
  onClearEditBook,
  dailyScale,
  onDailyScaleChange,
  favoritesScale,
  onFavoritesScaleChange,
  carouselBgDaily,
  onCarouselBgDailyChange,
  carouselBgFavorites,
  onCarouselBgFavoritesChange
}: AuthorWorkspaceProps) {
  // Navigation inside workspace: "write" (create/edit draft), "bulk" (spreadsheet importer), or "manage" (list and publish drafts)
  const [workspaceTab, setWorkspaceTab] = useState<"write" | "bulk" | "manage">("write");

  // Editorial state of draft form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState(4.5);
  const [coverUrl, setCoverUrl] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [summaryAi, setSummaryAi] = useState("");
  const [amazonLink, setAmazonLink] = useState("");
  const [shopeeLink, setShopeeLink] = useState("");
  const [mercadolivreLink, setMercadolivreLink] = useState("");
  const [publishDate, setPublishDate] = useState("");

  // UI state
  const [loadingAi, setLoadingAi] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const draftsOnly = books.filter((b) => b.isDraft);
  const publishedOnly = books.filter((b) => !b.isDraft);

  // Helper to parse "custom:#color1_#color2_#color3" structures for independent customization
  const parseCustomStr = (customStr: string) => {
    if (customStr && customStr.startsWith("custom:")) {
      const parts = customStr.substring(7).split("_");
      return {
        from: parts[0] || "#ef4444",
        to: parts[1] || "#3b82f6",
        border: parts[2] || "#10b981"
      };
    }
    return {
      from: "#ff7e5f",
      to: "#feb47b",
      border: "#ff7e5f"
    };
  };

  const dailyCustom = parseCustomStr(carouselBgDaily);
  const handleDailyCustomChange = (key: 'from' | 'to' | 'border', value: string) => {
    const updated = { ...dailyCustom, [key]: value };
    onCarouselBgDailyChange(`custom:${updated.from}_${updated.to}_${updated.border}`);
  };

  const favoritesCustom = parseCustomStr(carouselBgFavorites);
  const handleFavoritesCustomChange = (key: 'from' | 'to' | 'border', value: string) => {
    const updated = { ...favoritesCustom, [key]: value };
    onCarouselBgFavoritesChange(`custom:${updated.from}_${updated.to}_${updated.border}`);
  };

  // Auto-edit listener for loading published reviews edited from the reader's feed card
  React.useEffect(() => {
    if (initialBookToEdit) {
      handleSelectDraftToEdit(initialBookToEdit);
      if (onClearEditBook) {
        onClearEditBook();
      }
    }
  }, [initialBookToEdit]);

  // Pagination state for published works on "Mural do Autor" (6 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(publishedOnly.length / itemsPerPage);
  const safePage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const startIndex = (safePage - 1) * itemsPerPage;
  const paginatedPublished = publishedOnly.slice(startIndex, startIndex + itemsPerPage);

  // Trigger server-side Gemini API call to generate concise summary
  const handleGenerateAiSummary = async () => {
    if (!title || !author) {
      triggerMessage("error", "Por favor, preencha o Nome da Obra e o Autor para a IA fazer o resumo.");
      return;
    }

    setLoadingAi(true);
    triggerMessage("info", "Conectando ao Gemini... Gerando resumo e curadoria literária.");

    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author })
      });

      if (!response.ok) {
        throw new Error("Erro na comunicação com a API de geração.");
      }

      const data = await response.json();
      
      // Auto-populate form
      setSummaryAi(data.summary || "");
      if (data.catchyReview) setReviewText(data.catchyReview);
      if (data.suggestedGenre) setGenre(data.suggestedGenre);
      if (data.suggestedRating) setRating(Number(data.suggestedRating) || 4.5);

      triggerMessage("success", "Resumo gerado com sucesso por IA! Ajuste os detalhes abaixo se desejar.");
    } catch (err: any) {
      console.error(err);
      triggerMessage("error", "A API do Gemini está offline ou o limite de tokens expirou. Usando preenchimento dinâmico de segurança.");
      
      // Dynamic fallback fill
      const mockSummary = `Ao me debruçar sobre as páginas de uma obra tão singular como “${title}”, de ${author}, sou imediatamente confrontado com o peso das minhas escolhas e as contradições silenciosas que estruturam nosso cotidiano. Longe de se reduzir a um resumo de enredo, este livro também se estabelece como um espelho implacável de nossa própria alma, forçando-nos a questionar a qualidade das conexões afetivas que construímos na era digital. Fundamentando-se com robustez sobre a premissa de que a existência humana é tecida por fendas vulneráveis, o autor nos conduz a uma viagem íntima pelas correntes misteriosas do autoconhecimento.\n\nDigerir essa proposta literária funciona como contemplar o milagre silencioso de uma árvore buscando rachaduras no asfalto para crescer: uma resistência constante e de extrema beleza em meio a um mundo árido que consome nossa capacidade de sentir. Essa tocante e profunda analogia com a nossa jornada viva nos ensina com clareza que, assim como as frágeis sementes necessitam de tempo escuro, paciência e silêncio para se fixarem com segurança na terra fria, nós também carecemos urgentemente do acolhimento lúcido de nossos próprios momentos de dor e instabilidade emocional para que possamos construir um amadurecimento genuíno no decorrer da existência.\n\nOs ricos apontamentos reflexivos geram um eco instigante em nosso íntimo, acusando a pressa cega das nossas rotinas automatizadas que silenciosamente amortece nossa percepção da arte. Este livro atua, na verdade, como um manifesto pela desaceleração voluntária de nossas emoções cansadas, exortando-nos a resgatar a sacralidade do invisível, daquilo que jamais poderá ser quantificado pelas métricas da produtividade moderna ou exposto em redes virtuais.\n\nEm última análise, a vivência e reflexão profunda sobre “${title}” se consolidou na minha trajetória como uma provocação para reconquistar o leme e a autoria de nossa história pessoal recente. O autor não nos entrega apenas belas teorias abstratas; ele assina uma convocação ética e urgente para vivermos em consonância com nossa máxima integridade moral neste século complexo e veloz. É um sopro de vitalidade pura que nos retira definitivamente da cômoda passividade de meros espectadores apáticos, desafiando-nos a caminhar sobre o mundo com coragem, presença lúcida e intensa profundidade reflexiva.`;
      setSummaryAi(mockSummary);
      setReviewText(`Uma jornada literária brilhante e revolucionária sobre os temas capitais explorados por ${author}.`);
      setGenre("Ficção & Filosofia");
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSave = async (isNewDraft: boolean) => {
    if (!title || !author) {
      triggerMessage("error", "Nome do livro e Autor são campos obrigatórios.");
      return;
    }

    if (!isNewDraft) {
      const alreadyPublished = books.find(
        (b) =>
          !b.isDraft &&
          b.title.trim().toLowerCase() === title.trim().toLowerCase() &&
          (!editingId || b.id !== editingId)
      );
      if (alreadyPublished) {
        const proceed = window.confirm(
          `Atenção: Já existe um exemplar publicado com o título "${alreadyPublished.title}" (por ${alreadyPublished.author}).\n\nVocê tem certeza de que deseja publicar esta obra de forma repetida?`
        );
        if (!proceed) {
          triggerMessage("info", "Publicação cancelada pelo usuário.");
          return;
        }
      }
    }

    setSaving(true);
    triggerMessage("info", "Iniciando processo de salvamento...");

    const payload: Partial<BookReview> = {
      title,
      author,
      genre: genre || "Gênero Geral",
      rating: Number(rating) || 4.5,
      coverUrl: coverUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80",
      reviewText: reviewText || "",
      summaryAi: summaryAi || "",
      amazonLink: amazonLink || "",
      shopeeLink: shopeeLink || "",
      mercadolivreLink: mercadolivreLink || "",
      isDraft: isNewDraft, // true if saving as private draft, false if publishing directly
      publishDate: ""
    };

    if (editingId) {
      payload.id = editingId;
    }

    try {
      await onAddOrUpdateBook(payload, !editingId);
      triggerMessage("success", isNewDraft ? "Rascunho salvo privadamente com sucesso!" : "Obra publicada no feed público com sucesso!");
      
      // Clean up fields if it was a new book or published draft
      if (!isNewDraft || !editingId) {
        clearForm();
      }
      
      // Navigate appropriately
      if (isNewDraft) {
        setWorkspaceTab("manage");
      }
    } catch (err) {
      console.error(err);
      triggerMessage("error", "Erro ao gravar dados literários no servidor.");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectDraftToEdit = (draft: BookReview) => {
    setEditingId(draft.id);
    setTitle(draft.title);
    setAuthor(draft.author);
    setGenre(draft.genre);
    setRating(draft.rating);
    setCoverUrl(draft.coverUrl);
    setReviewText(draft.reviewText);
    setSummaryAi(draft.summaryAi);
    setAmazonLink(draft.amazonLink);
    setShopeeLink(draft.shopeeLink);
    setMercadolivreLink(draft.mercadolivreLink);
    setPublishDate("");

    setWorkspaceTab("write");
    triggerMessage("info", `Carregando rascunho de "${draft.title}" para edição.`);
  };

  const clearForm = () => {
    setEditingId(null);
    setTitle("");
    setAuthor("");
    setGenre("");
    setRating(4.5);
    setCoverUrl("");
    setReviewText("");
    setSummaryAi("");
    setAmazonLink("");
    setShopeeLink("");
    setMercadolivreLink("");
    setPublishDate("");
  };

  const handleResetAllViews = async () => {
    if (!window.confirm("Deseja mesmo zerar todos os marcadores de visualização de todas as obras do acervo? Isso limpará os ranqueamentos atuais de volta ao marco zero.")) {
      return;
    }
    triggerMessage("info", "Zerando marcadores de leitura no servidor...");
    try {
      const response = await fetch("/api/books/reset-views", {
        method: "POST"
      });
      if (response.ok) {
        triggerMessage("success", "Marcadores de visualização e favoritos zerados com sucesso em todas as obras!");
        await onRefreshCatalog();
      } else {
        throw new Error("Falha ao resetar.");
      }
    } catch (err) {
      console.error(err);
      triggerMessage("error", "Não foi possível resetar os contadores de leitura.");
    }
  };

  const triggerMessage = (type: string, text: string) => {
    setMsg({ type, text });
    setTimeout(() => {
      setMsg({ type: "", text: "" });
    }, 4500);
  };

  return (
    <div className={`bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm p-6 mx-auto my-8 animate-in fade-in slide-in-from-bottom-4 duration-300 transition-all ${
      workspaceTab === "bulk" ? "max-w-[95%] xl:max-w-[1550px]" : "max-w-4xl"
    }`}>
      
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-150">
        <div>
          <h2 className="text-xl font-display font-extrabold text-stone-900 dark:text-white tracking-tight flex items-center gap-2">
            <PenSquare className="h-5 w-5 text-amber-800 dark:text-amber-400" />
            Mural do Autor
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            Gerencie rascunhos particulares, elabore resenhas críticas e use a inteligência artificial para obter resumos.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-stone-100 p-1.5 rounded-xl self-start md:self-center flex-wrap gap-1">
          <button
            id="ws-tab-write"
            onClick={() => { setWorkspaceTab("write"); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              workspaceTab === "write"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            {editingId ? "Editar Rascunho" : "Estúdio Individual"}
          </button>

          <button
            id="ws-tab-bulk"
            onClick={() => { setWorkspaceTab("bulk"); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              workspaceTab === "bulk"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            <Table className="h-3.5 w-3.5 text-[#880808]" />
            Enviar Planilha
          </button>
          
          <button
            id="ws-tab-manage"
            onClick={() => { setWorkspaceTab("manage"); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 relative ${
              workspaceTab === "manage"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Rascunhos Salvos
            {draftsOnly.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 bg-amber-600 text-[10px] text-white font-bold rounded-full flex items-center justify-center border border-white">
                {draftsOnly.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Global Author Settings Block */}
      <div className="mt-4 p-4 bg-amber-50/50 dark:bg-stone-850/50 rounded-2xl border border-amber-200/50 dark:border-stone-800 flex flex-col gap-4 shadow-xs animate-in fade-in">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-100 dark:bg-amber-950/60 rounded-lg text-amber-900 dark:text-amber-400">
              <ArrowUpDown className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-stone-800 dark:text-stone-200 uppercase tracking-wide">
                Configurações Gerais de Distribuição & Métricas
              </h4>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">
                Ajuste a rota de compra preferida, zere os marcadores de cliques ou configure as dimensões dos carouséis de destaque.
              </p>
            </div>
          </div>
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Select prioritizer */}
            <select
              id="author-buy-order-select"
              value={buyOrder}
              onChange={(e) => onBuyOrderChange(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-stone-250 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-855 dark:text-stone-250 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer min-w-[200px]"
            >
              <option value="amazon,ml,shopee">Amazon ➔ M. Livre ➔ Shopee</option>
              <option value="amazon,shopee,ml">Amazon ➔ Shopee ➔ M. Livre</option>
              <option value="ml,amazon,shopee">M. Livre ➔ Amazon ➔ Shopee</option>
              <option value="ml,shopee,amazon">M. Livre ➔ Shopee ➔ Amazon</option>
              <option value="shopee,amazon,ml">Shopee ➔ Amazon ➔ M. Livre</option>
              <option value="shopee,ml,amazon">Shopee ➔ M. Livre ➔ Amazon</option>
            </select>

            {/* Reset views metrics action button */}
            <button
              id="btn-reset-view-stats"
              type="button"
              onClick={handleResetAllViews}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-red-200 hover:bg-red-55/10 text-red-700 dark:text-red-400 dark:border-red-950/50 hover:bg-stone-50 dark:hover:bg-red-950/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap"
              title="Resetar visualizações e cliques acumulados em todas as obras"
            >
              <RotateCcw className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
              Zerar Visualizações
            </button>
          </div>
        </div>

        {/* Dynamic Scale Adjusters for Carousels */}
        <div className="pt-3.5 border-t border-amber-200/50 dark:border-stone-800">
          <div className="flex flex-col gap-1.5 max-w-xl mx-auto">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Altura das Capas dos Carrosséis (Resenhas & Favoritos do Dia)
              </span>
              <span className="text-xs font-mono font-black text-amber-800 dark:text-amber-400">
                {dailyScale}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const newScale = Math.max(60, dailyScale - 10);
                  onDailyScaleChange(newScale);
                  onFavoritesScaleChange(newScale);
                }}
                className="w-8 h-8 flex items-center justify-center text-xs font-extrabold rounded-lg border border-stone-250 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-750 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer active:scale-95 transition-all"
                title="Reduzir tamanho"
              >
                -
              </button>
              <input
                type="range"
                min="60"
                max="160"
                step="5"
                value={dailyScale}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onDailyScaleChange(val);
                  onFavoritesScaleChange(val);
                }}
                className="flex-grow accent-amber-800 dark:accent-amber-450 h-1.5 cursor-pointer bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none"
              />
              <button
                type="button"
                onClick={() => {
                  const newScale = Math.min(160, dailyScale + 10);
                  onDailyScaleChange(newScale);
                  onFavoritesScaleChange(newScale);
                }}
                className="w-8 h-8 flex items-center justify-center text-xs font-extrabold rounded-lg border border-stone-250 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-750 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer active:scale-95 transition-all"
                title="Aumentar tamanho"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Background Color Preset Selector for Carousels */}
        <div className="pt-3.5 mt-3.5 border-t border-amber-200/50 dark:border-stone-800 flex flex-col gap-6 max-w-xl mx-auto text-left">
          {/* Daily Featured Background Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Paleta de Cores: Resenhas do Dia (Vibrante)
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: "amber", name: "Sol de Âmbar", lightBg: "bg-amber-400", darkBg: "dark:bg-amber-500", border: "border-amber-500" },
                { id: "slate", name: "Ciano Elétrico", lightBg: "bg-cyan-400", darkBg: "dark:bg-cyan-500", border: "border-cyan-550" },
                { id: "emerald", name: "Neon Esmeralda", lightBg: "bg-emerald-450", darkBg: "dark:bg-emerald-500", border: "border-emerald-550" },
                { id: "rose", name: "Rosa Cósmico", lightBg: "bg-rose-450", darkBg: "dark:bg-rose-550", border: "border-rose-500" },
                { id: "stone", name: "Roxo Vibrante", lightBg: "bg-violet-405", darkBg: "dark:bg-violet-550", border: "border-violet-500" },
                { id: "custom", name: "Escolher Cor Exata 🎨", lightBg: "bg-gradient-to-r from-violet-400 to-amber-400", darkBg: "dark:from-violet-950 dark:to-amber-955", border: "border-fuchsia-500" }
              ].map((p) => {
                const isActive = p.id === "custom" ? carouselBgDaily.startsWith("custom:") : carouselBgDaily === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      if (p.id === "custom") {
                        if (!carouselBgDaily.startsWith("custom:")) {
                          onCarouselBgDailyChange("custom:#ffd6a5_#fdffb6_#ffadad");
                        }
                      } else {
                        onCarouselBgDailyChange(p.id);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.03] active:scale-95 ${
                      isActive 
                        ? "border-amber-500 bg-amber-500/10 text-amber-950 dark:text-amber-350" 
                        : "border-stone-150 bg-stone-50 dark:bg-stone-900 border-stone-200/40 text-stone-600 dark:text-stone-400 dark:border-stone-800"
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${p.lightBg} ${p.darkBg} border ${p.border}`} />
                    {p.name}
                  </button>
                );
              })}
            </div>

            {/* If Custom Daily Color Mode is selected, render the fine-grained custom input/picker tool */}
            {carouselBgDaily.startsWith("custom:") && (
              <div className="mt-2.5 p-3.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-350">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase text-stone-500">Cor Inicial (Gradiante)</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <input 
                      type="color" 
                      value={dailyCustom.from} 
                      onChange={(e) => handleDailyCustomChange('from', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300 dark:border-stone-700 bg-transparent shrink-0"
                    />
                    <input 
                      type="text" 
                      value={dailyCustom.from}
                      onChange={(e) => handleDailyCustomChange('from', e.target.value)}
                      className="w-full text-[10px] p-1.5 font-mono rounded-lg bg-stone-50 dark:bg-stone-850 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800" 
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase text-stone-500">Cor Final (Gradiente)</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <input 
                      type="color" 
                      value={dailyCustom.to} 
                      onChange={(e) => handleDailyCustomChange('to', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300 dark:border-stone-700 bg-transparent shrink-0"
                    />
                    <input 
                      type="text" 
                      value={dailyCustom.to}
                      onChange={(e) => handleDailyCustomChange('to', e.target.value)}
                      className="w-full text-[10px] p-1.5 font-mono rounded-lg bg-stone-50 dark:bg-stone-850 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800" 
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase text-stone-500">Cor da Borda</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <input 
                      type="color" 
                      value={dailyCustom.border} 
                      onChange={(e) => handleDailyCustomChange('border', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300 dark:border-stone-700 bg-transparent shrink-0"
                    />
                    <input 
                      type="text" 
                      value={dailyCustom.border}
                      onChange={(e) => handleDailyCustomChange('border', e.target.value)}
                      className="w-full text-[10px] p-1.5 font-mono rounded-lg bg-stone-50 dark:bg-stone-850 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800" 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Favorites Featured Background Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Paleta de Cores: Favoritos do Dia (Vibrante)
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: "amber", name: "Sol de Âmbar", lightBg: "bg-amber-400", darkBg: "dark:bg-amber-500", border: "border-amber-500" },
                { id: "slate", name: "Ciano Elétrico", lightBg: "bg-cyan-400", darkBg: "dark:bg-cyan-500", border: "border-cyan-550" },
                { id: "emerald", name: "Neon Esmeralda", lightBg: "bg-emerald-450", darkBg: "dark:bg-emerald-500", border: "border-emerald-550" },
                { id: "rose", name: "Rosa Cósmico", lightBg: "bg-rose-450", darkBg: "dark:bg-rose-550", border: "border-rose-500" },
                { id: "stone", name: "Roxo Vibrante", lightBg: "bg-violet-405", darkBg: "dark:bg-violet-550", border: "border-violet-500" },
                { id: "custom", name: "Escolher Cor Exata 🎨", lightBg: "bg-gradient-to-r from-violet-400 to-amber-400", darkBg: "dark:from-violet-950 dark:to-amber-955", border: "border-fuchsia-500" }
              ].map((p) => {
                const isActive = p.id === "custom" ? carouselBgFavorites.startsWith("custom:") : carouselBgFavorites === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      if (p.id === "custom") {
                        if (!carouselBgFavorites.startsWith("custom:")) {
                          onCarouselBgFavoritesChange("custom:#ffd6a5_#fdffb6_#ffadad");
                        }
                      } else {
                        onCarouselBgFavoritesChange(p.id);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.03] active:scale-95 ${
                      isActive 
                        ? "border-amber-500 bg-amber-500/10 text-amber-950 dark:text-amber-300" 
                        : "border-stone-150 bg-stone-50 dark:bg-stone-900 border-stone-200/40 text-stone-600 dark:text-stone-400 dark:border-stone-800"
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${p.lightBg} ${p.darkBg} border ${p.border}`} />
                    {p.name}
                  </button>
                );
              })}
            </div>

            {/* If Custom Favorites Color Mode is selected, render the fine-grained custom input/picker tool */}
            {carouselBgFavorites.startsWith("custom:") && (
              <div className="mt-2.5 p-3.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-350">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase text-stone-500">Cor Inicial (Gradient)</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <input 
                      type="color" 
                      value={favoritesCustom.from} 
                      onChange={(e) => handleFavoritesCustomChange('from', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300 dark:border-stone-700 bg-transparent shrink-0"
                    />
                    <input 
                      type="text" 
                      value={favoritesCustom.from}
                      onChange={(e) => handleFavoritesCustomChange('from', e.target.value)}
                      className="w-full text-[10px] p-1.5 font-mono rounded-lg bg-stone-50 dark:bg-stone-850 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800" 
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase text-stone-500">Cor Final (Gradiente)</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <input 
                      type="color" 
                      value={favoritesCustom.to} 
                      onChange={(e) => handleFavoritesCustomChange('to', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300 dark:border-stone-700 bg-transparent shrink-0"
                    />
                    <input 
                      type="text" 
                      value={favoritesCustom.to}
                      onChange={(e) => handleFavoritesCustomChange('to', e.target.value)}
                      className="w-full text-[10px] p-1.5 font-mono rounded-lg bg-stone-50 dark:bg-stone-850 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800" 
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase text-stone-500">Cor da Borda</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <input 
                      type="color" 
                      value={favoritesCustom.border} 
                      onChange={(e) => handleFavoritesCustomChange('border', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300 dark:border-stone-700 bg-transparent shrink-0"
                    />
                    <input 
                      type="text" 
                      value={favoritesCustom.border}
                      onChange={(e) => handleFavoritesCustomChange('border', e.target.value)}
                      className="w-full text-[10px] p-1.5 font-mono rounded-lg bg-stone-50 dark:bg-stone-850 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800" 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Premium Theme & Contrast Selector */}
      <div className="mt-4 p-4 bg-stone-50 dark:bg-stone-850/40 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col gap-3.5 shadow-xs">
        <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200/50 dark:border-stone-800/50">
          <div className="p-1.5 bg-amber-100 dark:bg-amber-950/60 rounded-lg text-amber-900 dark:text-amber-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-stone-805 dark:text-stone-200 uppercase tracking-wide">
              Controle de Temas d'A Obras & Contraste Visual do Site
            </h4>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">
              Escolha esquemas cromáticos com forte contraste de cores entre claro e escuro. Se o texto for escuro o fundo é creme/areia; se o texto for claro o fundo é escuro.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1">
          {THEMES.map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                id={`theme-select-${theme.id}`}
                onClick={() => onThemeChange(theme.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 group relative hover:scale-[1.01] ${
                  isSelected
                    ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/50"
                    : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700 text-stone-700 dark:text-stone-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-extrabold text-stone-800 dark:text-white truncate">
                      {theme.name.split(" ")[0]}
                    </span>
                    {isSelected && (
                      <span className="text-[8px] bg-amber-700 text-white font-extrabold px-1.5 py-0.5 rounded leading-none uppercase">
                        Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-stone-400 dark:text-stone-500 leading-normal line-clamp-2">
                    {theme.description}
                  </p>
                </div>

                {/* Light & Dark representation circles */}
                <div className="flex gap-1.5 justify-end">
                  {/* Light circle indicator (dark text / light bg) */}
                  <div className="w-14 h-5 rounded text-[8px] font-extrabold flex items-center justify-center border border-stone-200" style={{ backgroundColor: theme.lightBgHex, color: theme.lightTextHex }}>
                    CLARO
                  </div>
                  {/* Dark circle indicator (light text / dark bg) */}
                  <div className="w-14 h-5 rounded text-[8px] font-extrabold flex items-center justify-center border border-stone-850" style={{ backgroundColor: theme.darkBgHex, color: theme.darkTextHex }}>
                    ESCURO
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Message Banner */}
      {msg.text && (
        <div
          id="ws-message-banner"
          className={`mt-4 p-4 rounded-xl text-xs font-semibold border flex items-center gap-2 animate-bounce ${
            msg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : msg.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-amber-50 border-amber-200 text-amber-900"
          }`}
        >
          {msg.type === "success" && <CheckCircle className="h-4 w-4 text-emerald-600" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Write Tab Form */}
      {workspaceTab === "write" && (
        <div className="mt-6 flex flex-col gap-6 animate-in fade-in duration-250">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Nome da Obra <span className="text-red-500">*</span>
              </label>
              <input
                id="input-book-title"
                type="text"
                placeholder="Ex: Cem Anos de Solidão"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="px-4 py-2.5 text-sm rounded-xl border border-stone-250 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
                required
              />
            </div>

            {/* Author */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Nome do Autor <span className="text-red-500">*</span>
              </label>
              <input
                id="input-book-author"
                type="text"
                placeholder="Ex: Gabriel García Márquez"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="px-4 py-2.5 text-sm rounded-xl border border-stone-250 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
                required
              />
            </div>

          </div>

          {/* AI Generator Integration Panel */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-amber-800">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-800 font-display">
                  Assistente Literário de IA
                </h4>
                <p className="text-[11px] text-stone-400">
                  Preencha o Nome e Autor acimas e o Gemini fará o resumo, resenha cativante, gênero e nota sugerida.
                </p>
              </div>
            </div>

            <button
              id="btn-generate-ai"
              type="button"
              disabled={loadingAi || !title || !author}
              onClick={handleGenerateAiSummary}
              className={`px-4 py-2 text-xs font-bold rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5 ${
                loadingAi
                  ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                  : (!title || !author)
                  ? "bg-stone-100 text-stone-400 border border-stone-200 shadow-none"
                  : "bg-amber-800 hover:bg-amber-900 text-white hover:scale-102"
              }`}
            >
              {loadingAi ? (
                <>
                  <div className="h-3 w-3 border-2 border-stone-400 border-t-stone-600 rounded-full animate-spin" />
                  Sintetizando...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Gerar Resumo por IA
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Genre */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Gênero / Categoria
              </label>
              <input
                id="input-book-genre"
                type="text"
                placeholder="Ex: Romance Fantástico"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="px-4 py-2.5 text-sm rounded-xl border border-stone-250 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
              />
            </div>

            {/* Rating */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Nota de Avaliação (1.0 a 5.0)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="input-book-rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={rating}
                  onChange={(e) => setRating(Math.max(1, Math.min(5, Number(e.target.value))))}
                  className="px-4 py-2.5 text-sm rounded-xl border border-stone-250 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-stone-50/50 w-full"
                />
                <span className="flex items-center text-amber-500 flex-shrink-0">
                  <Star className="h-4.5 w-4.5 fill-current" />
                  <span className="text-xs font-bold text-stone-600 ml-1">{rating.toFixed(1)}</span>
                </span>
              </div>
            </div>

            {/* Cover URL */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                URL da Capa (Opcional)
              </label>
              <input
                id="input-book-cover"
                type="url"
                placeholder="Ex: https://link.com/imagem.jpg"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="px-4 py-2.5 text-sm rounded-xl border border-stone-250 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-stone-50/50"
              />
            </div>
          </div>

          {/* Short catchment text resenha */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Indagações/Críticas e Pensamentos reflexivos <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-stone-400 font-medium">Recomendado: Máximo 3 linhas</span>
            </div>
            <textarea
              id="input-book-review"
              rows={2}
              maxLength={220}
              placeholder="Uma indagação marcante, dúvida polêmica ou pensamento reflexivo para destacar no mural."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="px-4 py-2.5 text-sm rounded-xl border border-stone-250 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-stone-50/50 resize-none font-serif italic"
            />
          </div>

          {/* AI generated summary text */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Análise Crítica e Pensamentos Reflexivos (Gerado/refinado pelo autor)
              </label>
              <span className="text-[10px] text-stone-400 font-medium flex items-center gap-0.5">
                <Sparkles className="h-3 w-3 text-amber-600" />
                Dê asas às suas modificações
              </span>
            </div>
            <textarea
              id="input-book-summary"
              rows={4}
              placeholder="Escreva ou gere através do botão de sugestão de IA acima..."
              value={summaryAi}
              onChange={(e) => setSummaryAi(e.target.value)}
              className="px-4 py-2.5 text-xs rounded-xl border border-stone-250 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-stone-50/50 resize-y font-serif leading-relaxed"
            />
          </div>

          {/* Marketplace Buy links */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-3 font-display">
              Links Diretos de Afiliados / Compra (Se vazio, a respectiva plataforma não será exibida de forma inteligente)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Amazon Link */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-stone-600 flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-stone-900" /> Amazon Brasil
                </span>
                <input
                  id="link-amazon"
                  type="url"
                  placeholder="https://amazon.com.br/..."
                  value={amazonLink}
                  onChange={(e) => setAmazonLink(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-stone-250 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                />
              </div>

              {/* Shopee Link */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-stone-600 flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#EE4D2D]" /> Shopee Brasil
                </span>
                <input
                  id="link-shopee"
                  type="url"
                  placeholder="https://shopee.com.br/..."
                  value={shopeeLink}
                  onChange={(e) => setShopeeLink(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-stone-250 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                />
              </div>

              {/* Mercado Livre Link */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-stone-600 flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#FFE600]" /> Mercado Livre
                </span>
                <input
                  id="link-ml"
                  type="url"
                  placeholder="https://mercadolivre.com.br/..."
                  value={mercadolivreLink}
                  onChange={(e) => setMercadolivreLink(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-stone-250 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                />
              </div>

            </div>
          </div>

          {/* Editing Indicators and Action Triggers */}
          <div className="flex items-center justify-between flex-wrap gap-4 border-t border-stone-200 pt-5">
            <div>
              {editingId ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-900 bg-amber-50 border border-amber-200 px-2 py-1 rounded font-semibold">
                    Editando Rascunho Existente
                  </span>
                  <button
                    id="ws-cancel-edit"
                    type="button"
                    onClick={clearForm}
                    className="text-stone-500 hover:text-stone-800 text-xs flex items-center gap-0.5 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" /> Cancelar
                  </button>
                </div>
              ) : (
                <button
                  id="btn-clear-fields"
                  type="button"
                  onClick={clearForm}
                  className="text-stone-500 hover:text-stone-800 text-xs flex items-center gap-0.5 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Limpar campos
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Save as draft button */}
              <button
                id="btn-workspace-save-draft"
                type="button"
                disabled={saving || loadingAi}
                onClick={() => handleSave(true)}
                className={`px-4.5 py-2.5 text-xs font-bold rounded-xl border border-stone-300 shadow-sm transition-all cursor-pointer flex items-center gap-1.5 ${
                  saving || loadingAi
                    ? "bg-stone-50 text-stone-400 cursor-not-allowed"
                    : "bg-white text-stone-700 hover:bg-stone-50"
                }`}
              >
                <Save className="h-4 w-4" />
                Salvar como Rascunho Privado
              </button>

              {/* Publish directly now button */}
              <button
                id="btn-workspace-publish"
                type="button"
                disabled={saving || loadingAi}
                onClick={() => handleSave(false)}
                className={`px-5 py-2.5 text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  saving || loadingAi
                    ? "bg-stone-400 text-stone-200 cursor-not-allowed"
                    : "bg-amber-800 hover:bg-amber-900 text-white hover:scale-101"
                }`}
              >
                <Upload className="h-4 w-4" />
                Publicar Resenha no Feed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage/Edit Active Drafts Tab */}
      {workspaceTab === "manage" && (
        <div className="mt-6 flex flex-col gap-4 animate-in fade-in duration-250">
          <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-stone-400" />
            Rascunhos Particulares de Resenhas ({draftsOnly.length})
          </h3>

          {draftsOnly.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-stone-200 rounded-3xl text-center flex flex-col items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-stone-50 flex items-center justify-center border border-stone-200 text-stone-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-700 font-display">Sem rascunhos salvos</p>
                <p className="text-[11px] text-stone-400 max-w-xs mt-1 leading-normal">
                  Não existem futuras críticas sendo rascunhadas no momento. Crie um novo rascunho usando a aba ao lado!
                </p>
              </div>
              <button
                id="btn-goto-draft-write"
                onClick={() => setWorkspaceTab("write")}
                className="mt-2 text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
              >
                Criar Rascunho agora
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {draftsOnly.map((draft) => (
                <div
                  key={draft.id}
                  id={`draft-workspace-item-${draft.id}`}
                  className="bg-stone-50/50 rounded-2xl border border-stone-200 p-4 transition-all hover:bg-stone-50 flex flex-col justify-between gap-3 shadow-inner"
                >
                  <div className="flex gap-3">
                    <div className="h-14 w-10 bg-stone-200 rounded border border-stone-300 flex-shrink-0 overflow-hidden">
                      {draft.coverUrl ? (
                        <img
                          src={draft.coverUrl}
                          alt={draft.title}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs">📖</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="inline-block bg-stone-100 border border-stone-200 text-stone-500 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded mb-1">
                        {draft.genre}
                      </span>
                      <h4 className="text-xs font-bold text-stone-900 truncate tracking-tight">
                        {draft.title}
                      </h4>
                      <p className="text-[10px] text-stone-400 font-medium">
                        por {draft.author}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-500 line-clamp-3 leading-relaxed font-serif italic">
                    “{draft.reviewText || "Sem resenha descrita."}”
                  </p>

                  <div className="flex items-center justify-between border-t border-stone-150 pt-2.5 mt-1">
                    <span className="text-[9px] font-mono font-medium text-stone-400">
                      Rascunho criado por IA
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        id={`btn-edit-inside-${draft.id}`}
                        onClick={() => handleSelectDraftToEdit(draft)}
                        className="py-1 px-2.5 flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="h-3 w-3" />
                        Editar Rascunho
                      </button>
                      <button
                        id={`btn-delete-inside-${draft.id}`}
                        onClick={() => onDeleteBook(draft.id)}
                        className="py-1 px-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Deletar rascunho permanentemente"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Seção de Obras Publicadas */}
          <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800">
            <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Obras e Resenhas Publicadas ({publishedOnly.length})
            </h3>

            {publishedOnly.length === 0 ? (
              <div className="py-12 border-2 border-dashed border-stone-205 dark:border-stone-800 rounded-3xl text-center flex flex-col items-center justify-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-stone-50 dark:bg-stone-900 flex items-center justify-center border border-stone-200 dark:border-stone-800 text-stone-400">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-705 dark:text-stone-300 font-display">Nenhuma obra publicada no ar</p>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500 max-w-xs mt-1 leading-normal">
                    Seus rascunhos aparecerão aqui depois que você clicar em "Publicar no Mural" na tela de edição.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginatedPublished.map((pub) => (
                    <div
                      key={pub.id}
                      id={`pub-workspace-item-${pub.id}`}
                      className="bg-white dark:bg-stone-900/40 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 transition-all hover:bg-stone-50/50 dark:hover:bg-stone-900/60 flex flex-col justify-between gap-3 shadow-xs"
                    >
                      <div className="flex gap-3">
                        <div className="h-14 w-10 bg-stone-200 dark:bg-stone-800 rounded border border-stone-300 dark:border-stone-700 flex-shrink-0 overflow-hidden shadow-xs">
                          {pub.coverUrl ? (
                            <img
                              src={pub.coverUrl}
                              alt={pub.title}
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs">📖</div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-305 text-[8px] uppercase font-bold px-1.5 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-900/50">
                              No Ar
                            </span>
                            <span className="bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-[8px] uppercase font-bold px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-700 truncate max-w-[120px]">
                              {pub.genre}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-stone-900 dark:text-white truncate tracking-tight">
                            {pub.title}
                          </h4>
                          <p className="text-[10px] text-stone-400 dark:text-stone-550 font-medium">
                            por {pub.author}
                          </p>
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-3 leading-relaxed font-serif italic">
                        “{pub.reviewText || "Sem resenha descrita."}”
                      </p>

                      <div className="flex items-center justify-between border-t border-stone-150 dark:border-stone-800 pt-2.5 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          <span className="text-[10px] font-bold text-stone-605 dark:text-stone-300">{pub.rating}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            id={`btn-edit-pub-${pub.id}`}
                            onClick={() => handleSelectDraftToEdit(pub)}
                            className="py-1 px-2.5 flex items-center gap-1 text-[10px] font-bold text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-755 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="h-3 w-3" />
                            Editar
                          </button>
                          <button
                            id={`btn-delete-pub-${pub.id}`}
                            onClick={() => onDeleteBook(pub.id)}
                            className="py-1 px-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                            title="Excluir post publicado definitivamente"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Beautiful Pagination Buttons */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      className="px-3.5 py-1.5 text-[11px] font-black rounded-xl border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-stone-50 dark:bg-stone-900 dark:hover:bg-stone-850 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                      ◀ Anterior
                    </button>
                    <span className="text-xs font-bold text-stone-500 dark:text-stone-400 bg-stone-105/50 dark:bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-200/50 dark:border-stone-800/50">
                      Página <strong className="text-amber-801 dark:text-amber-400 font-extrabold">{safePage}</strong> de {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      className="px-3.5 py-1.5 text-[11px] font-black rounded-xl border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-stone-50 dark:bg-stone-900 dark:hover:bg-stone-850 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                      Próxima ▶
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Import / Excel Sheet Tab */}
      {workspaceTab === "bulk" && (
        <BulkImportSheet
          onAddOrUpdateBook={onAddOrUpdateBook}
          onSuccessMessage={(text) => triggerMessage("success", text)}
          onErrorMessage={(text) => triggerMessage("error", text)}
        />
      )}

    </div>
  );
}
