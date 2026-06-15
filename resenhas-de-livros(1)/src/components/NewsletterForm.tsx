import React, { useState } from "react";
import { Mail, ArrowRight, CheckCircle, Sparkles } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulate API registration with high response speed
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      setEmail("");
      // Store in client storage so they don't have to re-enter
      localStorage.setItem("bookshelter_subscriber_email", email);
    }, 800);
  };

  return (
    <div
      id="newsletter-container"
      className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-850 p-6 shadow-sm overflow-hidden relative group"
    >
      {/* Decorative gradient flare */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 dark:bg-amber-400/5 rounded-bl-full z-0" />
      
      {subscribed ? (
        <div className="text-center py-6 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-300">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900 text-emerald-650 dark:text-emerald-400">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-display font-extrabold text-stone-900 dark:text-stone-100">
              Inscrição Confirmada!
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs leading-relaxed">
              Bem-vindo ao abrigo. Você receberá notificações exclusivas sobre as nossas principais resenhas e indicações semanais de e-books.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-amber-850 dark:text-amber-400 border border-amber-150 dark:border-amber-900">
              <Mail className="h-4 w-4" />
            </div>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-extrabold uppercase tracking-widest flex items-center gap-1">
              Fique por dentro <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
            </span>
          </div>

          <div>
            <h3 className="text-lg font-display font-extrabold text-stone-900 dark:text-stone-100 tracking-tight leading-snug">
              Inicie seu Abrigo Literário
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
              Junte-se à nossa rede de leitores inteligentes. Receba em primeira mão indagações polêmicas, resumos sem spoiler e as melhores ofertas quinzenais.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-1">
            <div className="relative">
              <input
                id="newsletter-email-input"
                type="email"
                required
                placeholder="Seu melhor e-mail..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 text-xs rounded-xl border border-stone-250 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-850 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-stone-400 transition-all font-medium"
              />
              <button
                id="newsletter-submit-btn"
                type="submit"
                disabled={loading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg transition-all flex items-center justify-center cursor-pointer disabled:bg-stone-300"
                title="Inscrever e-mail"
              >
                {loading ? (
                  <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-stone-400 dark:text-stone-550 leading-tight">
              Livre de spam. Desinscreva-se a qualquer momento com um único clique.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
