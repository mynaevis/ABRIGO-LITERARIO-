export interface ThemeOption {
  id: string;
  name: string;
  description: string;
  
  // Outer App Layout
  lightBg: string;         // Light outer background
  darkBg: string;          // Dark outer background
  lightText: string;       // Light mode text colour (dark)
  darkText: string;        // Dark mode text colour (light)
  
  // Card elements
  lightCard: string;       // Light card background
  darkCard: string;        // Dark card background
  lightBorder: string;     // Light border color
  darkBorder: string;      // Dark border color
  
  // Highlight backgrounds/Badges
  lightBadgeClass: string; // e.g. bg-amber-50 text-amber-900 border-amber-205 ...
  darkBadgeClass: string;  // e.g. bg-amber-950/40 text-amber-303 border-amber-900/40 ...

  // Buttons e.g. genre selectors
  lightBtnActive: string;
  lightBtnInactive: string;
  darkBtnActive: string;
  darkBtnInactive: string;

  // Accents & Brand text
  lightAccentText: string;
  darkAccentText: string;

  highlightHex: string;    // Color for small dot descriptors

  // Hex codes for real-time body variables styling
  lightBgHex: string;
  darkBgHex: string;
  lightTextHex: string;
  darkTextHex: string;
  lightCardHex: string;
  darkCardHex: string;
  lightBorderHex: string;
  darkBorderHex: string;
}

export const THEMES: ThemeOption[] = [
  {
    id: "classic",
    name: "Abrigo Clássico (Stone & Amber)",
    description: "Visual original luxuoso em tons de pedra-sabão e âmbar quente.",
    lightBg: "bg-[#fcfbf9]",
    darkBg: "bg-[#0f0e0d]",
    lightText: "text-stone-900",
    darkText: "text-stone-100",
    lightCard: "bg-white",
    darkCard: "bg-[#181615]",
    lightBorder: "border-stone-200",
    darkBorder: "border-stone-800",
    lightBadgeClass: "bg-amber-100 text-amber-900 border-amber-200/50",
    darkBadgeClass: "bg-amber-950/40 text-amber-300 border-amber-900/30",
    lightBtnActive: "bg-amber-800 text-white border-amber-800",
    lightBtnInactive: "bg-white text-stone-600 border-stone-200 hover:bg-stone-50",
    darkBtnActive: "bg-amber-400 text-black border-amber-400 font-extrabold",
    darkBtnInactive: "bg-[#181615] text-stone-300 border-stone-800 hover:bg-stone-900",
    lightAccentText: "text-amber-800",
    darkAccentText: "text-amber-400",
    highlightHex: "#d97706",
    lightBgHex: "#fcfbf9",
    darkBgHex: "#0f0e0d",
    lightTextHex: "#1c1917", // stone-905
    darkTextHex: "#f5f5f4",  // stone-105
    lightCardHex: "#ffffff",
    darkCardHex: "#181615",
    lightBorderHex: "#e7e5e4",
    darkBorderHex: "#292524"
  },
  {
    id: "sepia",
    name: "Café & Pergaminho (Warm Sepia)",
    description: "Visual de cafeteria clássica com fundo quente e texto café escuro.",
    lightBg: "bg-[#fcf8f0]",
    darkBg: "bg-[#1e1610]",
    lightText: "text-[#3e2e20]",
    darkText: "text-[#f5e6d3]",
    lightCard: "bg-[#f5eedf]",
    darkCard: "bg-[#2d2118]",
    lightBorder: "border-[#e6d0b3]",
    darkBorder: "border-[#403022]",
    lightBadgeClass: "bg-[#dfccb0] text-[#3e2e20] border-[#d2bfa1]",
    darkBadgeClass: "bg-[#3e2c1c] text-[#f7e0c4] border-[#553c26]",
    lightBtnActive: "bg-[#5c4033] text-white border-[#5c4033]",
    lightBtnInactive: "bg-[#f5eedf] text-[#3e2e20] border-[#e6d0b3] hover:bg-[#ebdca9]",
    darkBtnActive: "bg-[#f5e6d3] text-[#1e1610] border-[#f5e6d3] font-extrabold",
    darkBtnInactive: "bg-[#2d2118] text-[#e0cfba] border-[#403022] hover:bg-[#34261c]",
    lightAccentText: "text-[#8b5a2b]",
    darkAccentText: "text-[#cc9966]",
    highlightHex: "#8b5a2b",
    lightBgHex: "#fcf8f0",
    darkBgHex: "#1e1610",
    lightTextHex: "#3e2e20",
    darkTextHex: "#f5e6d3",
    lightCardHex: "#f5eedf",
    darkCardHex: "#2d2118",
    lightBorderHex: "#e6d0b3",
    darkBorderHex: "#403022"
  },
  {
    id: "ocean",
    name: "Abismo Marinho (Teal Ocean)",
    description: "Contraste fresco de mar profundo. Tons azuis e gelo sintonizados.",
    lightBg: "bg-[#f0f6f8]",
    darkBg: "bg-[#071318]",
    lightText: "text-[#081e25]",
    darkText: "text-[#e3f4f8]",
    lightCard: "bg-white",
    darkCard: "bg-[#0d212a]",
    lightBorder: "border-[#cce1e7]",
    darkBorder: "border-[#14323f]",
    lightBadgeClass: "bg-[#daf0f5] text-[#081e25] border-[#b8dae4]",
    darkBadgeClass: "bg-[#143743] text-[#a0e4f2] border-[#1f4a5a]",
    lightBtnActive: "bg-[#146b7a] text-white border-[#146b7a]",
    lightBtnInactive: "bg-white text-[#103a45] border-[#cce1e7] hover:bg-[#f6fafb]",
    darkBtnActive: "bg-[#38bdf8] text-black border-[#38bdf8] font-extrabold",
    darkBtnInactive: "bg-[#0d212a] text-[#c0e0e8] border-[#14323f] hover:bg-[#122c38]",
    lightAccentText: "text-[#146b7a]",
    darkAccentText: "text-[#38bdf8]",
    highlightHex: "#0284c7",
    lightBgHex: "#f0f6f8",
    darkBgHex: "#071318",
    lightTextHex: "#081e25",
    darkTextHex: "#e3f4f8",
    lightCardHex: "#ffffff",
    darkCardHex: "#0d212a",
    lightBorderHex: "#cce1e7",
    darkBorderHex: "#14323f"
  },
  {
    id: "forest",
    name: "Sombra da Selva (Emerald Forest)",
    description: "Visual de bosque profundo com cores de musgo, sálvia e menta refinada.",
    lightBg: "bg-[#f2f7f4]",
    darkBg: "bg-[#050f09]",
    lightText: "text-[#081c10]",
    darkText: "text-[#e6f4ea]",
    lightCard: "bg-white",
    darkCard: "bg-[#0c2215]",
    lightBorder: "border-[#cde3d5]",
    darkBorder: "border-[#133620]",
    lightBadgeClass: "bg-[#daf2e3] text-[#081c10] border-[#bddfca]",
    darkBadgeClass: "bg-[#143d23] text-[#a6ebb9] border-[#1b502d]",
    lightBtnActive: "bg-[#156133] text-white border-[#156133]",
    lightBtnInactive: "bg-white text-[#0f2e1b] border-[#cde3d5] hover:bg-[#f6fbf8]",
    darkBtnActive: "bg-[#4ade80] text-black border-[#4ade80] font-extrabold",
    darkBtnInactive: "bg-[#0c2215] text-[#cfead6] border-[#133620] hover:bg-[#112d1c]",
    lightAccentText: "text-[#156133]",
    darkAccentText: "text-[#4ade80]",
    highlightHex: "#16a34a",
    lightBgHex: "#f2f7f4",
    darkBgHex: "#050f09",
    lightTextHex: "#081c10",
    darkTextHex: "#e6f4ea",
    lightCardHex: "#ffffff",
    darkCardHex: "#0c2215",
    lightBorderHex: "#cde3d5",
    darkBorderHex: "#133620"
  },
  {
    id: "royal",
    name: "Soberania Púrpura (Royal Plum)",
    description: "Gótico e suntuoso. Tons de uva profunda e lavanda requintada.",
    lightBg: "bg-[#faf7fc]",
    darkBg: "bg-[#0e0513]",
    lightText: "text-[#1a0824]",
    darkText: "text-[#f3ebf8]",
    lightCard: "bg-white",
    darkCard: "bg-[#1c0e25]",
    lightBorder: "border-[#ecdcf5]",
    darkBorder: "border-[#321942]",
    lightBadgeClass: "bg-[#f4e6fa] text-[#1a0824] border-[#e2caf3]",
    darkBadgeClass: "bg-[#331448] text-[#e0baff] border-[#441a5f]",
    lightBtnActive: "bg-[#6b21a8] text-white border-[#6b21a8]",
    lightBtnInactive: "bg-white text-[#301046] border-[#ecdcf5] hover:bg-[#fbfafd]",
    darkBtnActive: "bg-[#c084fc] text-black border-[#c084fc] font-extrabold",
    darkBtnInactive: "bg-[#1c0e25] text-[#e5d4f2] border-[#321942] hover:bg-[#271533]",
    lightAccentText: "text-[#6b21a8]",
    darkAccentText: "text-[#c084fc]",
    highlightHex: "#9333ea",
    lightBgHex: "#faf7fc",
    darkBgHex: "#0e0513",
    lightTextHex: "#1a0824",
    darkTextHex: "#f3ebf8",
    lightCardHex: "#ffffff",
    darkCardHex: "#1c0e25",
    lightBorderHex: "#ecdcf5",
    darkBorderHex: "#321942"
  },
  {
    id: "crimson",
    name: "Carmesim Imperial (Crimson & Cherry)",
    description: "Visual nobre e marcante baseado na paleta carmesim de #5f0606 e #880808.",
    lightBg: "bg-[#fef9f9]",
    darkBg: "bg-[#5f0606]",
    lightText: "text-[#4a0505]",
    darkText: "text-[#fff1f1]",
    lightCard: "bg-white",
    darkCard: "bg-[#880808]",
    lightBorder: "border-[#fbcaca]",
    darkBorder: "border-[#961212]",
    lightBadgeClass: "bg-[#fce4e4] text-[#7a0606] border-[#f9c2c2]",
    darkBadgeClass: "bg-[#420101] text-[#ffd6d6] border-[#800505]",
    lightBtnActive: "bg-[#880808] text-white border-[#880808]",
    lightBtnInactive: "bg-white text-[#5f0606] border-[#fbcaca] hover:bg-[#fff1f1]",
    darkBtnActive: "bg-[#ff9494] text-black border-[#ff9494] font-extrabold",
    darkBtnInactive: "bg-[#880808] text-[#fbcaca] border-[#961212] hover:bg-[#aa1111]",
    lightAccentText: "text-[#880808]",
    darkAccentText: "text-[#ff9494]",
    highlightHex: "#880808",
    lightBgHex: "#fef9f9",
    darkBgHex: "#5f0606",
    lightTextHex: "#4a0505",
    darkTextHex: "#fff1f1",
    lightCardHex: "#ffffff",
    darkCardHex: "#880808",
    lightBorderHex: "#fbcaca",
    darkBorderHex: "#961212"
  }
];
