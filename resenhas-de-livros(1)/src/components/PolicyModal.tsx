import React from "react";
import { X, Shield, FileText, Check } from "lucide-react";

interface PolicyModalProps {
  isOpen: boolean;
  type: "privacy" | "terms" | null;
  onClose: () => void;
}

export default function PolicyModal({ isOpen, type, onClose }: PolicyModalProps) {
  if (!isOpen || !type) return null;

  const isPrivacy = type === "privacy";

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 dark:border-stone-850">
          <div className="flex items-center gap-2.5">
            {isPrivacy ? (
              <Shield className="h-5 w-5 text-amber-850 dark:text-amber-400" />
            ) : (
              <FileText className="h-5 w-5 text-amber-850 dark:text-amber-400" />
            )}
            <h2 className="text-lg font-display font-bold text-stone-900 dark:text-stone-100">
              {isPrivacy ? "Política de Privacidade" : "Termos de Uso"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-all cursor-pointer"
            aria-label="Fecar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Policy Content block */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 text-sm text-stone-650 dark:text-stone-300 leading-relaxed font-sans scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-stone-800">
          
          <div className="space-y-2">
            <p className="font-semibold text-stone-850 dark:text-stone-200">
              {isPrivacy 
                ? "Esta Política de Privacidade descreve como o Abrigo Literário coleta, utiliza e protege suas informações ao usar nosso site."
                : "Estes Termos de Uso regem a sua navegação e a utilização dos serviços oferecidos no Abrigo Literário."}
            </p>
            <p className="text-stone-400 dark:text-stone-500 text-xs">
              Última atualização: 13 de junho de 2026.
            </p>
          </div>

          {isPrivacy ? (
            <div className="space-y-6">
              <section className="space-y-2">
                <h3 className="font-display font-bold text-stone-900 dark:text-stone-150 text-base">
                  1. Informações que Coletamos
                </h3>
                <p>
                  O Abrigo Literário é um catálogo literário focado no respeito à privacidade do leitor. Coletamos informações de duas formas simples:
                </p>
                <ul className="list-none space-y-2 pl-2">
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-500 mt-1 flex-shrink-0" />
                    <span><strong>Newsletter:</strong> Quando você se cadastra espontaneamente fornecendo seu e-mail para receber nossas novidades e resenhas semanais.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-500 mt-1 flex-shrink-0" />
                    <span><strong>Persistência Local:</strong> Utilizamos armazenamento local no navegador (localStorage) para salvar suas preferências visuais (Modo Escuro / Claro) e a ordem personalizada das suas lojas favoritas.</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-display font-bold text-stone-900 dark:text-stone-150 text-base">
                  2. Uso de Cookies e Preferências
                </h3>
                <p>
                  Usamos cookies essenciais e mecanismos de armazenamento local apenas para otimizar sua experiência estética e de navegação. Não utilizamos estes arquivos para fins estatísticos prejudiciais ou publicidade invasiva direta.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-display font-bold text-stone-900 dark:text-stone-150 text-base">
                  3. Links Externos de Compra
                </h3>
                <p>
                  O Abrigo Literário apresenta links para plataformas externas de comércio parceiras (como Amazon, Shopee e Mercado Livre). Ao clicar nestes links ou realizar compras através deles, você estará sujeito às Políticas de Privacidade e Termos de Uso operados independentemente por cada uma destas plataformas específicas.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-display font-bold text-stone-900 dark:text-stone-150 text-base">
                  4. Segurança das Informações
                </h3>
                <p>
                  Garantimos que nenhum dado cadastrado (como seu e-mail de newsletter) será compartilhado, vendido ou transferido a terceiros. Todo o tratamento de dados é executado em total conformidade com as melhores práticas de segurança digital e transparência de privacidade.
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              <section className="space-y-2">
                <h3 className="font-display font-bold text-stone-900 dark:text-stone-150 text-base">
                  1. Aceitação do Usuário
                </h3>
                <p>
                  Ao acessar ou interagir com as resenhas, rascunhos de autoria de IA e curadorias do Abrigo Literário, você declara estar de acordo com estes termos de utilização geral do site. Caso não concorde com qualquer cláusula, solicitamos que interrompa a navegação.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-display font-bold text-stone-900 dark:text-stone-150 text-base">
                  2. Propriedade Intelectual e Curadoria
                </h3>
                <p>
                  Todo o layout desenvolvido, as resenhas originais escritas e organizadas no mural do Abrigo Literário, bem como as ideias estruturadas, são propriedades intelectuais protegidas. É permitida a reprodução de trechos curtos apenas se houver o devido crédito com link ativo para nosso acervo.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-display font-bold text-stone-900 dark:text-stone-150 text-base">
                  3. Indicação de Obras e Links de Afiliados
                </h3>
                <p>
                  Ressaltamos que a curadoria literária é opinativa. O Abrigo Literário não se responsabiliza pelo envio físico dos livros, por variações de preços em tempo real nos sites terceiros, ou por divergências de estoque de publicadoras parceiras. Todas as questões de pós-venda devem ser sanadas junto ao marketplace vendedor final selecionado.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-display font-bold text-stone-900 dark:text-stone-150 text-base">
                  4. Alterações nos Serviços
                </h3>
                <p>
                  Reservamo-nos o direito de modificar as funcionalidades do acervo, suspender atividades informativas ou alterar o presente regulamento de termos a qualquer momento, sem necessidade de aviso prévio, priorizando sempre manter a qualidade do Abrigo Literário.
                </p>
              </section>
            </div>
          )}

        </div>

        {/* Modal Footer actions */}
        <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-850 bg-stone-50 dark:bg-stone-900/40 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-800 text-white font-semibold text-xs tracking-wide uppercase hover:bg-amber-900 active:scale-98 transition-all rounded-xl cursor-pointer shadow-xs"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
