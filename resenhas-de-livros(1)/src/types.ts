export interface BookReview {
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

export function isRealAffiliateLink(link: string | undefined): boolean {
  if (!link || typeof link !== "string") return false;
  const cleaned = link.trim();
  if (cleaned === "" || cleaned === "#" || cleaned === "undefined" || cleaned === "null") return false;
  
  // Detect standard non-affiliate search query fallbacks
  if (cleaned.startsWith("https://www.amazon.com.br/s?k=")) return false;
  if (cleaned.startsWith("https://amazon.com.br/s?k=")) return false;
  if (cleaned.startsWith("https://shopee.com.br/search?keyword=")) return false;
  if (cleaned.startsWith("https://lista.mercadolivre.com.br/")) return false;
  
  return true;
}
