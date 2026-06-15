import React, { useState } from "react";
import { BookOpen, Lock, Unlock, Sparkles, Sun, Moon } from "lucide-react";

interface HeaderProps {
  isAdmin: boolean;
  onAdminToggle: (unlocked: boolean) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function Header({
  isAdmin,
  onAdminToggle,
  isDarkMode,
  onThemeToggle
}: HeaderProps) {
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: 1234
    if (pin === "1234") {
      onAdminToggle(true);
      setShowPinInput(false);
      setPin("");
      setError("");
    } else {
      setError("Senha incorreta. Tente '1234'.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleLock = () => {
    onAdminToggle(false);
  };

  return (
    <header className="border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Vibe */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900">
              <BookOpen className="h-6 w-6 text-amber-800 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-stone-900 dark:text-stone-100 tracking-tight flex items-center gap-1.5 animate-in fade-in">
                Abrigo Literário <span className="text-amber-600 font-serif">.</span>
              </h1>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium font-serif italic">
                Sua curadoria de resenhas breves, rankings dinâmicos & fomento à leitura
              </p>
            </div>
          </div>

          {/* User controls (Theme, Admin tools) */}
          <div className="flex items-center gap-4 ml-auto md:ml-0 flex-wrap">
            
            {/* Dark & Light Theme Switcher */}
            <button
               id="theme-toggle"
               onClick={onThemeToggle}
               className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 transition-all cursor-pointer flex items-center justify-center"
               title={isDarkMode ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
            >
              {isDarkMode ? (
                <Sun className="h-4.5 w-4.5 text-amber-500" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-stone-900" />
              )}
            </button>

            {/* Actions & PIN authentication */}
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-white border border-emerald-200 dark:border-emerald-900">
                    <Sparkles className="h-3.5 w-3.5 animate-pulse text-emerald-600 dark:text-white" />
                    Mural do Autor
                  </span>
                  <button
                    id="btn-lock"
                    onClick={handleLock}
                    className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300 hover:text-red-650 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 border border-stone-200 dark:border-stone-700 hover:border-red-200 transition-all cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Sair
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 relative">
                  {showPinInput ? (
                    <form onSubmit={handleUnlock} className="flex items-center gap-2 animate-in fade-in slide-in-from-right-3 duration-200">
                      <input
                        id="pin-password"
                        type="password"
                        placeholder="PIN (Ex: 1234)"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="px-3 py-1.5 text-xs border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 bg-stone-50 dark:bg-stone-850 text-stone-800 dark:text-stone-100 w-28"
                        autoFocus
                      />
                      <button
                        id="btn-submit-pin"
                        type="submit"
                        className="px-2.5 py-1.5 text-xs text-white bg-amber-800 hover:bg-amber-900 font-semibold rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Entrar
                      </button>
                      <button
                        id="btn-cancel-pin"
                        type="button"
                        onClick={() => { setShowPinInput(false); setPin(""); }}
                        className="px-1.5 py-1.5 text-xs text-stone-500 hover:text-stone-700 dark:text-stone-400"
                      >
                        Cancelar
                      </button>
                    </form>
                  ) : (
                    <button
                      id="btn-enter-admin"
                      onClick={() => setShowPinInput(true)}
                      className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 transition-all cursor-pointer"
                      title="Acesso privado para gerenciar rascunhos, criar resenhas e gerar ou editar resumos IA"
                    >
                      <Lock className="h-3.5 w-3.5 text-stone-400" />
                      Painel Autor
                    </button>
                  )}
                  {error && (
                    <span className="text-[10px] text-red-650 font-medium animate-bounce absolute md:relative top-11 md:top-0 right-4 leading-3">
                      {error}
                    </span>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
