import React from "react";
import { Award, Eye, Calendar, Sparkles, BookOpen, Clock, Heart } from "lucide-react";
import { BookReview } from "../types";

interface RankingsListProps {
  books: BookReview[];
  onSelectBook: (book: BookReview) => void;
}

export default function RankingsList({ books, onSelectBook }: RankingsListProps) {
  // Filter out drafts
  const publishedBooks = books.filter((b) => !b.isDraft);

  // Compute Top 5 of the week (views)
  const topWeekly = [...publishedBooks]
    .sort((a, b) => (b.viewsWeekly || 0) - (a.viewsWeekly || 0))
    .slice(0, 5);

  // Compute Top 5 of the month (views)
  const topMonthly = [...publishedBooks]
    .sort((a, b) => (b.viewsMonthly || 0) - (a.viewsMonthly || 0))
    .slice(0, 5);

  // Compute Top 5 of favorites of the week
  const topWeeklyFavs = [...publishedBooks]
    .sort((a, b) => (b.favoritesWeekly || 0) - (a.favoritesWeekly || 0))
    .slice(0, 5);

  // Compute Top 5 of favorites of the month
  const topMonthlyFavs = [...publishedBooks]
    .sort((a, b) => (b.favoritesMonthly || 0) - (a.favoritesMonthly || 0))
    .slice(0, 5);

  const getRankBadgeAndStyles = (index: number) => {
    switch (index) {
      case 0:
        return {
          bg: "bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-850 dark:text-amber-300 shadow-sm",
          label: "1º",
          text: "font-bold text-amber-900 dark:text-amber-200"
        };
      case 1:
        return {
          bg: "bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 shadow-sm",
          label: "2º",
          text: "font-bold text-stone-800 dark:text-stone-200"
        };
      case 2:
        return {
          bg: "bg-orange-100 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800 text-orange-850 dark:text-orange-300 shadow-sm",
          label: "3º",
          text: "font-bold text-orange-900 dark:text-orange-200"
        };
      default:
        return {
          bg: "bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400",
          label: `${index + 1}º`,
          text: "font-medium text-stone-700 dark:text-stone-300"
        };
    }
  };

  const renderRankingSection = (title: string, list: BookReview[], isWeekly: boolean) => {
    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5 px-0.5 py-1 border-b border-stone-100 dark:border-stone-800/80">
          {isWeekly ? (
            <Clock className="h-4 w-4 text-amber-700 dark:text-amber-400" />
          ) : (
            <Calendar className="h-4 w-4 text-amber-700 dark:text-amber-400" />
          )}
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-650 dark:text-stone-300">
            {title}
          </span>
        </div>

        {list.length === 0 ? (
          <div className="py-6 text-center text-stone-400 dark:text-stone-500 text-xs">
            <BookOpen className="h-6 w-6 mx-auto text-stone-300 dark:text-stone-700 mb-1" />
            Sem registros ainda.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {list.map((book, idx) => {
              const styles = getRankBadgeAndStyles(idx);
              const viewCount = isWeekly ? book.viewsWeekly : book.viewsMonthly;

              return (
                <div
                  key={`${book.id}-${isWeekly ? "wk" : "mn"}`}
                  id={`rank-item-${isWeekly ? "week" : "month"}-${idx}`}
                  onClick={() => onSelectBook(book)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-850 border border-transparent hover:border-stone-100 dark:hover:border-stone-800 transition-all duration-200 cursor-pointer group"
                >
                  {/* Numbered Podium Bubble */}
                  <div className={`h-7 w-7 flex-shrink-0 flex items-center justify-center rounded-lg border text-xs font-display font-extrabold ${styles.bg}`}>
                    {styles.label}
                  </div>

                  {/* Cover (Minified thumbnail) */}
                  <div className="h-9 w-6.5 rounded bg-stone-100 dark:bg-stone-800 overflow-hidden flex-shrink-0 border border-stone-250 dark:border-stone-700 shadow-xs relative">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[7px] bg-stone-205 dark:bg-stone-700">
                        📖
                      </div>
                    )}
                  </div>

                  {/* Metadata details */}
                  <div className="min-w-0 flex-grow">
                    <h4 className={`text-xs truncate transition-colors group-hover:text-amber-850 dark:group-hover:text-amber-400 leading-snug ${styles.text}`}>
                      {book.title}
                    </h4>
                    <p className="text-[9px] text-stone-400 dark:text-stone-500 font-medium truncate">
                      by {book.author}
                    </p>
                  </div>

                  {/* View statistics pill */}
                  <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-705 text-stone-550 dark:text-stone-400 font-mono text-[9px] font-medium flex-shrink-0">
                    <Eye className="h-2.5 w-2.5 text-stone-400" />
                    <span>{viewCount || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderFavoritesRankingSection = (title: string, list: BookReview[], isWeekly: boolean) => {
    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5 px-0.5 py-1 border-b border-stone-100 dark:border-stone-800/80">
          <Heart className="h-4 w-4 text-rose-500 fill-rose-500/20" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-650 dark:text-rose-400">
            {title}
          </span>
        </div>

        {list.length === 0 ? (
          <div className="py-6 text-center text-stone-400 dark:text-stone-500 text-xs">
            <BookOpen className="h-6 w-6 mx-auto text-stone-300 dark:text-stone-700 mb-1" />
            Nenhuma obra favoritada ainda.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {list.map((book, idx) => {
              const styles = getRankBadgeAndStyles(idx);
              const favCount = isWeekly ? book.favoritesWeekly : book.favoritesMonthly;

              return (
                <div
                  key={`${book.id}-fav-${isWeekly ? "wk" : "mn"}`}
                  onClick={() => onSelectBook(book)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-850 border border-transparent hover:border-stone-100 dark:hover:border-stone-800 transition-all duration-200 cursor-pointer group"
                >
                  {/* Numbered Podium Bubble */}
                  <div className={`h-7 w-7 flex-shrink-0 flex items-center justify-center rounded-lg border text-xs font-display font-extrabold ${styles.bg}`}>
                    {styles.label}
                  </div>

                  {/* Cover (Minified thumbnail) */}
                  <div className="h-9 w-6.5 rounded bg-stone-100 dark:bg-stone-800 overflow-hidden flex-shrink-0 border border-stone-250 dark:border-stone-700 shadow-xs relative">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[7px] bg-stone-205 dark:bg-stone-700">
                        📖
                      </div>
                    )}
                  </div>

                  {/* Metadata details */}
                  <div className="min-w-0 flex-grow">
                    <h4 className={`text-xs truncate transition-colors group-hover:text-amber-850 dark:group-hover:text-amber-400 leading-snug ${styles.text}`}>
                      {book.title}
                    </h4>
                    <p className="text-[9px] text-stone-400 dark:text-stone-500 font-medium truncate">
                      by {book.author}
                    </p>
                  </div>

                  {/* Favorite statistics pill */}
                  <div className="flex items-center gap-1.2 px-1.5 py-0.5 rounded-full bg-rose-50/50 dark:bg-stone-800 border border-rose-200/50 dark:border-stone-705 text-rose-600 dark:text-rose-400 font-mono text-[9px] font-bold flex-shrink-0">
                    <Heart className="h-2.5 w-2.5 text-rose-500 fill-rose-500" />
                    <span>{favCount || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-sm flex flex-col gap-6 transition-colors duration-200">
      <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800/80">
        <h3 className="text-sm font-display font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
          <Award className="h-4.5 w-4.5 text-amber-700 dark:text-amber-400" />
          Rankings de Leitura
        </h3>
        <span className="flex items-center gap-0.5 text-amber-750 dark:text-amber-400 font-semibold text-[10px] uppercase tracking-wider">
          <Sparkles className="h-2.5 w-2.5" />
          Populares
        </span>
      </div>

      {/* Week Ranking Stacked */}
      {renderRankingSection("Mais Lidos da Semana", topWeekly, true)}

      {/* Month Ranking Stacked Segment */}
      {renderRankingSection("Destaques Mensais", topMonthly, false)}

      {/* Top 5 Weekly Favorites ranking segment */}
      {renderFavoritesRankingSection("Top 5 Favoritos da Semana", topWeeklyFavs, true)}

      {/* Top 5 Monthly Favorites ranking segment */}
      {renderFavoritesRankingSection("Top 5 Favoritos do Mês", topMonthlyFavs, false)}

      <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[9px] text-stone-400 dark:text-stone-500 font-medium">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Sincronizado em tempo real
        </span>
      </div>
    </div>
  );
}
