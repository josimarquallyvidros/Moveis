/* =====================================================================
   OrçaProQually v7.6 — app.js (Correções de Fórmula, Opaco e Layout)
   ===================================================================== */

"use strict";

/* =====================================================================
   ⚙️ CONFIGURAÇÃO DA NUVEM — URL FIXA
   ===================================================================== */
const SHEETS_API = "https://script.google.com/macros/s/AKfycbx2AWxCNe8dPzerLJqHKLQ3HZx0ZLo5WPJnj8MedGwIey49AHgJnc5GZSqjQYp-8fyCBQ/exec";

/* =====================================================================
   CONSTANTES
   ===================================================================== */
const CORES_PERFIL = ["Bronze", "Preto", "Branco", "Champanhe", "Fosco", "A definir"];
const CORES_VIDRO  = ["Incolor", "Preto", "Branco", "Champanhe", "Cinza", "Bege", "A definir"];

const TIPOS_VAO = {
  gaveta:        { nome: "Gaveta (vão)",   icone: "🗄️" },
  gaveta_dupla:  { nome: "Gaveta Dupla",   icone: "🗄️🗄️" },
  porta_tempero: { nome: "Porta Tempero",  icone: "🧂" },
  lixeira:       { nome: "Lixeira",        icone: "🗑️" },
  nicho:         { nome: "Nicho",          icone: "📦" },
  porta_simples: { nome: "Porta Simples",  icone: "🚪" },
  porta_dupla:   { nome: "Porta Dupla",    icone: "🚪🚪" },
  cristaleira:   { nome: "Cristaleira",    icone: "🍷" }
};

const COMP_DEFAULT = {
  gaveta: {
    perfis: [
      { matId: "p_montante", qtdFormula: "2", desc: 0, orientacao: "A" },
      { matId: "p_tubo5050", qtdFormula: "2", desc: 0, orientacao: "L" },
      { matId: "p_tubo2550", qtdFormula: "2", desc: 0, orientacao: "P" },
      { matId: "p_cant10",   qtdFormula: "2", desc: 0, orientacao: "L" }
    ],
    vidros: [{ matId: "v_temperado", qtdFormula: "1", descL: "3", descA: "6", orientacao: "porta" }],
    acm: [
      { matId: "acm", qtdFormula: "1", descL: "0", descA: "0", rotulo: "Fundo",   orientacao: "LA" },
      { matId: "acm", qtdFormula: "1", descL: "0", descA: "0", rotulo: "Lateral", orientacao: "PA" },
      { matId: "acm", qtdFormula: "1", descL: "0", descA: "0", rotulo: "Lateral", orientacao: "PA" },
      { matId: "acm", qtdFormula: "1", descL: "0", descA: "0", rotulo: "Base",    orientacao: "LP" },
      { matId: "acm", qtdFormula: "N", descL: "10", descA: "10", rotulo: "Frente Gaveta", orientacao: "LA" }
    ],
    acess: [{ matId: "a_corredica", qtdFormula: "N" }]
  },
  gaveta_dupla: {
    perfis: [
      { matId: "p_montante", qtdFormula: "2", desc: 0, orientacao: "A" },
      { matId: "p_tubo5050", qtdFormula: "2", desc: 0, orientacao: "L" },
      { matId: "p_tubo2550", qtdFormula: "2", desc: 0, orientacao: "P" },
      { matId: "p_cant10",   qtdFormula: "2", desc: 0, orientacao: "L" }
    ],
    vidros: [{ matId: "v_temperado", qtdFormula: "1", descL: "3", descA: "6", orientacao: "porta" }],
    acm: [
      { matId: "acm", qtdFormula: "1", descL: "0", descA: "0", rotulo: "Fundo",   orientacao: "LA" },
      { matId: "acm", qtdFormula: "1", descL: "0", descA: "0", rotulo: "Lateral", orientacao: "PA" },
      { matId: "acm", qtdFormula: "1", descL: "0", descA: "0", rotulo: "Lateral", orientacao: "PA" },
      { matId: "acm", qtdFormula: "1", descL: "0", descA: "0", rotulo: "Base",    orientacao: "LP" },
      { matId: "acm", qtdFormula: "2*N", descL: "10", descA: "10", rotulo: "Frente Gaveta Dupla", orientacao: "LA" }
    ],
    acess: [{ matId: "a_corredica", qtdFormula: "2*N" }]
  },
  porta_tempero: {
    perfis: [
      { matId: "p_montante", qtdFormula: "2", desc: 0, orientacao: "A" },
      { matId: "p_tubo5050", qtdFormula: "2", desc: 0, orientacao: "L" },
      { matId: "p_cant05",   qtdFormula: "2", desc: 0, orientacao: "A" }
    ],
    vidros: [{ matId: "v_temperado", qtdFormula: "1", descL: "3", descA: "6", orientacao: "porta" }],
    acm: [{ matId: "acm", qtdFormula: "1", descL: "0", descA: "0", rotulo: "Fundo", orientacao: "LA" }],
    acess: [
      { matId: "a_dobradica", qtdFormula: "2" },
      { matId: "a_puxador",   qtdFormula: "1" }
    ],
    prateleiras: { ativo: false, qtd: 2, vidro: { matId: "v_temperado", descL: 6, descA: 6 }, perfil: { matId: "p_montante", desc: 0, orientacao: "L" }, acess: { matId: "a_suporte", porPrateleira: 2 } }
  },
  lixeira: {
    perfis: [
      { matId: "p_montante", qtdFormula: "2", desc: 0, orientacao: "A" },
      { matId: "p_tubo5050", qtdFormula: "2", desc: 0, orientacao: "L" },
      { matId: "p_cant05",   qtdFormula: "2", desc: 0, orientacao: "A" }
    ],
    vidros: [],
    acm: [
      { matId: "acm", qtdFormula: "1", descL: "0", descA: "0", rotulo: "Fundo",   orientacao: "LA" },
      { matId: "acm", qtdFormula: "1", descL: "0", descA: "0", rotulo: "Lateral", orientacao: "PA" },
      { matId: "acm", qtdFormula: "1", descL: "0", descA: "0", rotulo: "Lateral", orientacao: "PA" }
    ],
    acess: [{ matId: "a_corredica", qtdFormula: "1" }]
  },
  nicho: {
    perfis: [
      { matId: "p_montante", qtdFormula: "2", desc: 0, orientacao: "A" },
      { matId: "p_tubo5050", qtdFormula: "2", desc: 0, orientacao: "L" }
    ],
    vidros: [],
    acm: [
      { matId: "acm", qtdFormula: "1", descL: "0", descA: "0", rotulo: "Lateral", orientacao: "PA" },
      { matId: "acm", qtdFormula: "1", descL: "0", descA: "0", rotulo: "Lateral", orientacao: "PA" },
      { matId: "acm", qtdFormula: "1", descL: "0", descA: "0", rotulo: "Base",    orientacao: "LP" },
      { matId: "acm", qtdFormula: "1", descL: "0", descA: "0", rotulo: "Fundo",   orientacao: "LA" }
    ],
    acess: [],
    prateleiras: { ativo: false, qtd: 2, vidro: { matId: "v_temperado", descL: 6, descA: 6 }, perfil: { matId: "p_montante", desc: 0, orientacao: "L" }, acess: { matId: "a_suporte", porPrateleira: 2 } }
  },
  porta_simples: {
    perfis: [
      { matId: "p_montante", qtdFormula: "2", desc: 0, orientacao: "A" },
      { matId: "p_tubo5050", qtdFormula: "2", desc: 0, orientacao: "L" },
      { matId: "p_puxador",  qtdFormula: "1", desc: 0, orientacao: "A" }
    ],
    vidros: [{ matId: "v_temperado", qtdFormula: "1", descL: "3", descA: "6", orientacao: "porta" }],
    acm: [{ matId: "acm", qtdFormula: "1", descL: "0", descA: "0", rotulo: "Fundo", orientacao: "LA" }],
    acess: [
      { matId: "a_dobradica", qtdFormula: "2" },
      { matId: "a_puxador",   qtdFormula: "1" }
    ],
    prateleiras: { ativo: false, qtd: 2, vidro: { matId: "v_temperado", descL: 6, descA: 6 }, perfil: { matId: "p_montante", desc: 0, orientacao: "L" }, acess: { matId: "a_suporte", porPrateleira: 2 } }
  },
  porta_dupla: {
    perfis: [
      { matId: "p_montante", qtdFormula: "2", desc: 0, orientacao: "A" },
      { matId: "p_tubo5050", qtdFormula: "2", desc: 0, orientacao: "L" },
      { matId: "p_puxador",  qtdFormula: "2", desc: 0, orientacao: "A" }
    ],
    vidros: [{ matId: "v_temperado", qtdFormula: "2", descL: "6", descA: "6", orientacao: "porta" }],
    acm: [{ matId: "acm", qtdFormula: "1", descL: "0", descA: "0", rotulo: "Fundo", orientacao: "LA" }],
    acess: [
      { matId: "a_dobradica", qtdFormula: "4" },
      { matId: "a_puxador",   qtdFormula: "2" }
    ],
    prateleiras: { ativo: false, qtd: 2, vidro: { matId: "v_temperado", descL: 6, descA: 6 }, perfil: { matId: "p_montante", desc: 0, orientacao: "L" }, acess: { matId: "a_suporte", porPrateleira: 2 } }
  },
  cristaleira: {
    perfis: [
      { matId: "p_montante", qtdFormula: "2", desc: 0, orientacao: "A" },
      { matId: "p_tubo5050", qtdFormula: "2", desc: 0, orientacao: "L" },
      { matId: "p_tubo2550", qtdFormula: "2", desc: 0, orientacao: "P" },
      { matId: "p_puxador",  qtdFormula: "2", desc: 0, orientacao: "A" }
    ],
    vidros: [{ matId: "v_temperado", qtdFormula: "2", descL: "6", descA: "6", orientacao: "porta" }],
    acm: [
      { matId: "acm", qtdFormula: "1", descL: "0", descA: "0", rotulo: "Fundo",   orientacao: "LA" },
      { matId: "acm", qtdFormula: "1", descL: "0", descA: "0", rotulo: "Lateral", orientacao: "PA" },
      { matId: "acm", qtdFormula: "1", descL: "0", descA: "0", rotulo: "Lateral", orientacao: "PA" },
      { matId: "acm", qtdFormula: "1", descL: "0", descA: "0", rotulo: "Base",    orientacao: "LP" }
    ],
    acess: [
      { matId: "a_dobradica", qtdFormula: "4" },
      { matId: "a_puxador",   qtdFormula: "2" }
    ],
    prateleiras: { ativo: true, qtd: 3, vidro: { matId: "v_temperado", descL: 6, descA: 6 }, perfil: { matId: "p_montante", desc: 0, orientacao: "L" }, acess: { matId: "a_suporte", porPrateleira: 2 } }
  }
};

const ESTRUTURA_DEFAULT = {
  perfis: [
    { matId: "p_tubo5050", qtdFormula: "2",     desc: 0, orientacao: "L" },
    { matId: "p_tubo2550", qtdFormula: "2",     desc: 0, orientacao: "P" },
    { matId: "p_montante", qtdFormula: "V+1",   desc: 0, orientacao: "A" }
  ],
  vidros: [
    { matId: "v_temperado", qtdFormula: "F",     descL: "3", descA: "6", orientacao: "F",     rotulo: "Fechamento Frontal" },
    { matId: "v_temperado", qtdFormula: "LAT",   descL: "3", descA: "6", orientacao: "LAT",   rotulo: "Fechamento Lateral" },
    { matId: "v_temperado", qtdFormula: "FUNDO", descL: "3", descA: "6", orientacao: "FUNDO", rotulo: "Fechamento Fundo" }
  ],
  acm: [],
  acess: [{ matId: "a_suporte", qtdFormula: "4" }]
};

const MAT_DEFAULT = {
  perfis: [
    { id: "p_montante", nome: "Perfil Montante 1036", preco: 38 },
    { id: "p_puxador",  nome: "Perfil Puxador Slim",  preco: 45 },
    { id: "p_tubo2550", nome: "Tubo 2,5×50",          preco: 28 },
    { id: "p_tubo5050", nome: "Tubo 50×50",           preco: 42 },
    { id: "p_cant05",   nome: "Cantoneira 1/2\"",     preco: 12 },
    { id: "p_cant10",   nome: "Cantoneira 1\"",       preco: 18 }
  ],
  vidros: [
    { id: "v_comum",     nome: "Vidro Comum",     preco: 180 },
    { id: "v_temperado", nome: "Vidro Temperado", preco: 320 },
    { id: "v_laminado",  nome: "Vidro Laminado",  preco: 420 }
  ],
  acm: [
    { id: "acm",       nome: "ACM Branco 3mm", preco: 145 },
    { id: "acm_cinza", nome: "ACM Cinza 3mm",  preco: 155 }
  ],
  acess: [
    { id: "a_dobradica", nome: "Dobradiça",             preco: 6.5 },
    { id: "a_corredica", nome: "Corrediça",             preco: 22 },
    { id: "a_puxador",   nome: "Puxador",               preco: 18 },
    { id: "a_fechadura", nome: "Fechadura",             preco: 35 },
    { id: "a_suporte",   nome: "Suporte/Pé Regulável",  preco: 3.5 }
  ]
};

const PARAMS_DEFAULT = {
  chapaVidro: { w: 1600, h: 2200 },
  chapaACM:   { w: 1200, h: 5000 },
  barraPerfil: 6000,
  kerf: 3,
  bdi: 30,
  frete: 0,
  instalacao: 0,
  imposto: 0
};

/* =====================================================================
   ESTADO GLOBAL
   ===================================================================== */
let state = novoEstado();
let hist = [];
let templateNuvem = null;

let _ambCache = {};
let _globalCache = null;
let _statsCache = { hit: 0, miss: 0 };

let _histUndo = [];
let _histRedo = [];

let _expandido = false;
let _cotasPlano = true;

let configOtimizador = {
  algoritmo: "auto",
  heuristica: "baf",
  girar: true
};

let compTabAtual = "gaveta";
let compSubTab = "perfis";
let matCatAtual = "perfis";

/* =====================================================================
   UTILITÁRIOS
   ===================================================================== */
function gerarIdLocal() { return "LOCAL-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(); }
function uid() { return Math.random().toString(36).slice(2, 9); }
function fmt(v) { return (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function fmtData(d) { if (!d) return "—"; const s = String(d).trim(); const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) return `${m[3]}/${m[2]}/${m[1]}`; return s; }
function fmtN(v, d = 2) { return (v || 0).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }); }
function escapeHtml(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function toast(msg, err) { const t = document.getElementById("toast"); if (!t) return; t.textContent = msg; t.className = "toast show" + (err ? " err" : ""); setTimeout(() => { t.className = "toast"; }, 2400); }
function quickHash(obj) { const s = JSON.stringify(obj); let h = 5381; for (let i = 0; i < s.length; i++) { h = ((h << 5) + h) + s.charCodeAt(i); h = h | 0; } return h.toString(36) + "_" + s.length; }
function matById(id) { if (!state || !state.materiais) return null; for (const cat of Object.values(state.materiais)) { for (const m of cat) if (m.id === id) return m; } return null; }

/* =====================================================================
   FÓRMULA MATEMÁTICA (AQUI ESTAVA O ERRO DE CHAVES)
   ===================================================================== */
function evalFormula(formula, vars) {
  if (formula === "" || formula == null) return 0;
  
  const novasVars = { 
    ...vars, 
    LM: (vars.L || 0) / 2, 
    PM: (vars.P || 0) / 2,
    LM_D: ((vars.L || 0) / 2) - 25,
    PM_D: ((vars.P || 0) / 2) - 25,
    Math: Math 
  };

  try {
    let expr = String(formula).replace(/\b(L|A|P|N|M|LM|PM|LM_D|PM_D)\b/g, ch => {
      return novasVars[ch] !== undefined ? novasVars[ch] : ch;
    });

    let oldExpr;
    do {
      oldExpr = expr;
      expr = expr.replace(/(?:SE|se)\s*\(([^,;]+)[,;]([^,;]+)[,;]([^,;()]+(?:\([^)]*\))?[^,;()]*)\)/gi, '($1 ? $2 : $3)');
    } while (expr !== oldExpr);

    expr = expr.replace(/(?:E|e)\s*\(([^;]+);\s*([^;)]+)\)/gi, '($1 && $2)');
    expr = expr.replace(/(?:OU|ou)\s*\(([^;]+);\s*([^;)]+)\)/gi, '($1 || $2)');
    expr = expr.replace(/;/g, ',');

    const v = Function("Math", `"use strict"; return (${expr});`)(Math);
    if (v === true) return 1;
    if (v === false) return 0;
    return isFinite(v) ? v : 0;
  } catch (e) { 
    console.warn("Erro na fórmula:", formula, e);
    return 0; 
  }
}

function corClass(cor) { return "pill " + (cor || "adefinir").toLowerCase().replace(/[^a-z]/g, ""); }
function corPill(cor, prefixo) { return `<span class="${corClass(cor)}">${escapeHtml((prefixo || "") + (cor || "A definir"))}</span>`; }
function corDoPerfil(cor) { const map = { "Bronze": "#a0522d", "Preto": "#1a1a1a", "Branco": "#e5e7eb", "Champanhe": "#d9cbb0", "Fosco": "#4b5563", "A definir": "#7c3aed" }; return map[cor] || "#64748b"; }

/* =====================================================================
   INICIALIZAÇÃO
   ===================================================================== */
function novoEstado() {
  return {
    orcamento: { id: gerarIdLocal(), salvoNaNuvem: false, numero: "", cliente: "", telefone: "", endereco: "", data: new Date().toISOString().slice(0, 10), vendedor: "", validade: 15, obs: "", status: "Rascunho", desconto: 0 },
    ambientes: [],
    materiais: JSON.parse(JSON.stringify(MAT_DEFAULT)),
    composicoes: JSON.parse(JSON.stringify(COMP_DEFAULT)),
    estrutura: JSON.parse(JSON.stringify(ESTRUTURA_DEFAULT)),
    params: JSON.parse(JSON.stringify(PARAMS_DEFAULT))
  };
}
function normalizeState(s) {
  const base = novoEstado();
  if (!s || typeof s !== "object") return base;
  const orc = { ...base.orcamento, ...(s.orcamento || {}) };
  if (!orc.id) orc.id = gerarIdLocal();
  if (orc.data && typeof orc.data === "string") { const m = orc.data.match(/^(\d{4}-\d{2}-\d{2})/); if (m) orc.data = m[1]; }
  return {
    orcamento: orc,
    ambientes: Array.isArray(s.ambientes) ? s.ambientes : [],
    materiais: { ...base.materiais, ...(s.materiais || {}) },
    composicoes: { ...base.composicoes, ...(s.composicoes || {}) },
    estrutura: { ...base.estrutura, ...(s.estrutura || {}) },
    params: { ...base.params, ...(s.params || {}) }
  };
}
function invalidarCaches() { _ambCache = {}; _globalCache = null; }
function invalidarCacheAmbiente(ambId) { delete _ambCache[ambId]; _globalCache = null; }

/* =====================================================================
   PERSISTÊNCIA
   ===================================================================== */
function saveLocalOnly() { try { state = normalizeState(state); localStorage.setItem("orcProQually_v19", JSON.stringify({ v: 19, savedAt: new Date().toISOString(), state })); const el = document.getElementById("sbAutosave"); if (el) el.textContent = "autosave: " + new Date().toLocaleTimeString("pt-BR"); } catch (e) {} }
function save() { saveLocalOnly(); if (typeof agendarSyncSheets === "function") agendarSyncSheets(); }
function load() {
  try {
    const raw = localStorage.getItem("orcProQually_v19") || localStorage.getItem("orcProQually_v18") || localStorage.getItem("orcProQually_v17");
    if (raw) state = normalizeState(JSON.parse(raw).state || JSON.parse(raw));
    else state = novoEstado();
    const h = localStorage.getItem("orcProQually_hist");
    hist = h ? (JSON.parse(h) || []) : [];
    const otim = localStorage.getItem("orcProQually_otim");
    if (otim) configOtimizador = { ...configOtimizador, ...JSON.parse(otim) };
  } catch (e) { state = novoEstado(); hist = []; }
}
function saveHist() { try { localStorage.setItem("orcProQually_hist", JSON.stringify(hist)); } catch (e) {} }
function salvarConfigOtimizador() { try { localStorage.setItem("orcProQually_otim", JSON.stringify(configOtimizador)); } catch (e) {} }

/* =====================================================================
   UNDO / REDO
   ===================================================================== */
function snapshotParaUndo() {
  try {
    const snap = JSON.stringify(state);
    if (_histUndo.length && _histUndo[_histUndo.length - 1] === snap) return;
    _histUndo.push(snap);
    if (_histUndo.length > 30) _histUndo.shift();
    _histRedo = []; atualizarStatusUndo();
  } catch (e) {}
}
function undo() { if (_histUndo.length < 2) { toast("Nada para desfazer", false); return; } const atual = _histUndo.pop(); _histRedo.push(atual); state = normalizeState(JSON.parse(_histUndo[_histUndo.length - 1])); invalidarCaches(); saveLocalOnly(); render(); atualizarStatusUndo(); toast("↶ Desfeito"); }
function redo() { if (!_histRedo.length) { toast("Nada para refazer", false); return; } const prox = _histRedo.pop(); _histUndo.push(prox); state = normalizeState(JSON.parse(prox)); invalidarCaches(); saveLocalOnly(); render(); atualizarStatusUndo(); toast("↷ Refeito"); }
function atualizarStatusUndo() { const el = document.getElementById("sbUndo"); if (el) el.textContent = `undo: ${_histUndo.length} | redo: ${_histRedo.length}`; }

setInterval(() => { try { saveLocalOnly(); } catch (e) {} }, 30000);

/* =====================================================================
   CÁLCULO — VÃOS
   ===================================================================== */
function calcularVao(vao, movel) {
  const comp = state.composicoes[vao.tipo];
  if (!comp) return { perfis: [], vidros: [], acm: [], acess: {}, custo: { perfis: 0, vidros: 0, acm: 0, acess: 0, total: 0 } };

  const L = +vao.largura, A = +movel.altura, P = +movel.profundidade, N = Math.max(1, +vao.gavetasPortas || 1), M = 2;
  const vars = { L, A, P, N, M };
  const corPerfil = vao.corPerfil || "A definir", corVidro = vao.corVidro || "A definir";
  const resultado = { perfis: [], vidros: [], acm: [], acess: {}, custo: { perfis: 0, vidros: 0, acm: 0, acess: 0, total: 0 } };

  (comp.perfis || []).forEach(it => {
    const qtd = Math.round(evalFormula(it.qtdFormula, vars)); if (qtd <= 0) return;
    for (let i = 0; i < qtd; i++) {
      const c = it.orientacao === "L" ? L : it.orientacao === "A" ? A : P;
      resultado.perfis.push({ matId: it.matId, comprimento: Math.max(0, Math.round(c - evalFormula(it.desc, vars))), cor: corPerfil, origem: "base" });
    }
  });

  (comp.vidros || []).forEach(it => {
    const qtd = Math.round(evalFormula(it.qtdFormula, vars)); 
    if (qtd <= 0) return;
    
    for (let i = 0; i < qtd; i++) {
      let larg = 0, alt = 0;
      const v = { L, A, P, N: qtd, LM: L/2, PM: P/2, LM_D: (L/2)-25, PM_D: (P/2)-25 };

      switch (it.orientacao) {
        case "porta": 
          larg = (L - evalFormula(it.descL, v) * (qtd + 1)) / qtd; 
          alt = A - evalFormula(it.descA, v); 
          break;
        case "LA": 
          larg = evalFormula(it.descL, v) || L; 
          alt = evalFormula(it.descA, v) || A; 
          break;
        case "LP": 
          larg = evalFormula(it.descL, v) || L; 
          alt = evalFormula(it.descA, v) || P; 
          break;
        case "AP": 
          larg = evalFormula(it.descL, v) || A; 
          alt = evalFormula(it.descA, v) || P; 
          break;
        case "custom_metade":
          larg = evalFormula(it.descL, v) || (L/2 - 25); 
          alt = evalFormula(it.descA, v) || P; 
          break;
        case "custom_condicional":
          larg = evalFormula(it.descL, v) || L; 
          alt = evalFormula(it.descA, v) || A; 
          break;
        default: 
          larg = L - evalFormula(it.descL, v); 
          alt = A - evalFormula(it.descA, v);
      }
      
      if (larg > 0 && alt > 0) {
        resultado.vidros.push({ matId: it.matId, largura: Math.round(larg), altura: Math.round(alt), cor: corVidro, rotulo: it.rotulo || "" });
      }
    }
  });

  if (comp.prateleiras && comp.prateleiras.ativo && vao.temPrateleiras) {
    const p = comp.prateleiras, qtdPrat = Math.max(0, +vao.qtdPrateleiras || p.qtd || 0);
    if (qtdPrat > 0) {
      const pv = p.vidro || {}, pp = p.perfil || {}, pa = p.acess || {}, largVidro = Math.max(0, L - (+pv.descL || 0)), altVidro = Math.max(0, P - (+pv.descA || 0));
      for (let i = 0; i < qtdPrat; i++) { if (largVidro > 0 && altVidro > 0) resultado.vidros.push({ matId: pv.matId || "v_temperado", largura: largVidro, altura: altVidro, cor: corVidro, rotulo: "Prateleira " + (i + 1) }); }
      if (pp.matId) { const compP = (pp.orientacao === "A" ? A : pp.orientacao === "P" ? P : L) - (+pp.desc || 0); for (let i = 0; i < qtdPrat; i++) resultado.perfis.push({ matId: pp.matId, comprimento: Math.max(0, Math.round(compP)), cor: corPerfil, origem: "prateleira" }); }
      if (pa.matId && pa.porPrateleira) resultado.acess[pa.matId] = (resultado.acess[pa.matId] || 0) + qtdPrat * (+pa.porPrateleira);
    }
  }

  (comp.acm || []).forEach(it => {
    const qtd = Math.round(evalFormula(it.qtdFormula, vars)); if (qtd <= 0) return;
    for (let i = 0; i < qtd; i++) {
      let larg = 0, alt = 0;
      switch (it.orientacao) {
        case "LA": larg = L - evalFormula(it.descL, vars); alt = A - evalFormula(it.descA, vars); break;
        case "LP": larg = L - evalFormula(it.descL, vars); alt = P - evalFormula(it.descA, vars); break;
        case "PA": larg = P - evalFormula(it.descL, vars); alt = A - evalFormula(it.descA, vars); break;
        case "AL": larg = A - evalFormula(it.descL, vars); alt = L - evalFormula(it.descA, vars); break;
        default: larg = L - evalFormula(it.descL, vars); alt = A - evalFormula(it.descA, vars);
      }
      if (larg > 0 && alt > 0) resultado.acm.push({ matId: it.matId, largura: Math.round(larg), altura: Math.round(alt), cor: corVidro, rotulo: it.rotulo || "" });
    }
  });

  (comp.acess || []).forEach(it => { const qtd = Math.round(evalFormula(it.qtdFormula, vars)); if (qtd <= 0) return; resultado.acess[it.matId] = (resultado.acess[it.matId] || 0) + qtd; });

  resultado.perfis.forEach(p => { const m = matById(p.matId); if (m) resultado.custo.perfis += (m.preco || 0) * (p.comprimento / 1000); });
  resultado.vidros.forEach(p => { const m = matById(p.matId); if (m) resultado.custo.vidros += (m.preco || 0) * (p.largura * p.altura / 1_000_000); });
  resultado.acm.forEach(p => { const m = matById(p.matId); if (m) resultado.custo.acm += (m.preco || 0) * (p.largura * p.altura / 1_000_000); });
  for (const [k, q] of Object.entries(resultado.acess)) { const m = matById(k); if (m) resultado.custo.acess += (m.preco || 0) * q; }
  resultado.custo.total = resultado.custo.perfis + resultado.custo.vidros + resultado.custo.acm + resultado.custo.acess;
  return resultado;
}

function calcularEstruturaAmbiente(amb) {
  const est = state.estrutura || ESTRUTURA_DEFAULT;
  const L = +amb.largura, A = +amb.altura, P = +amb.profundidade, V = (amb.vaos || []).length || 1, vis = amb.visibilidade || "frente";
  let vFrente = 0, vLat = 0, vFundo = 0;
  if (vis === "frente") { vFrente = 1; } else if (vis === "frente_1") { vFrente = 1; vLat = 1; } else if (vis === "frente_2") { vFrente = 1; vLat = 2; } else if (vis === "todos") { vFrente = 1; vLat = 2; vFundo = 1; }
  const vars = { L, A, P, V, F: vFrente, LAT: vLat, FUNDO: vFundo };
  const res = { perfis: [], vidros: [], acm: [], acess: {}, custo: { perfis: 0, vidros: 0, acm: 0, acess: 0, total: 0 } };
  const corPerfil = amb.corPerfil || "A definir", corVidro = amb.corVidro || "A definir";

  (est.perfis || []).forEach(it => { const qtd = Math.round(evalFormula(it.qtdFormula, vars)); if (qtd <= 0) return; for (let i = 0; i < qtd; i++) { const c = it.orientacao === "L" ? L : it.orientacao === "A" ? A : P; res.perfis.push({ matId: it.matId, comprimento: Math.max(0, Math.round(c - evalFormula(it.desc, vars))), cor: corPerfil }); } });
  (est.vidros || []).forEach(it => { const qtd = Math.round(evalFormula(it.qtdFormula, vars)); if (qtd <= 0) return; for (let i = 0; i < qtd; i++) { let larg = 0, alt = 0; switch (it.orientacao) { case "F": larg = L - evalFormula(it.descL, vars); alt = A - evalFormula(it.descA, vars); break; case "LAT": larg = P - evalFormula(it.descL, vars); alt = A - evalFormula(it.descA, vars); break; case "FUNDO": larg = L - evalFormula(it.descL, vars); alt = A - evalFormula(it.descA, vars); break; default: larg = L - evalFormula(it.descL, vars); alt = A - evalFormula(it.descA, vars); } if (larg > 0 && alt > 0) res.vidros.push({ matId: it.matId, largura: Math.round(larg), altura: Math.round(alt), cor: corVidro, rotulo: it.rotulo || "Fechamento" }); } });
  (est.acm || []).forEach(it => { const qtd = Math.round(evalFormula(it.qtdFormula, vars)); if (qtd <= 0) return; for (let i = 0; i < qtd; i++) { let larg = 0, alt = 0; switch (it.orientacao) { case "F": larg = L - evalFormula(it.descL, vars); alt = A - evalFormula(it.descA, vars); break; case "LAT": larg = P - evalFormula(it.descL, vars); alt = A - evalFormula(it.descA, vars); break; case "FUNDO": larg = L - evalFormula(it.descL, vars); alt = A - evalFormula(it.descA, vars); break; default: larg = L - evalFormula(it.descL, vars); alt = A - evalFormula(it.descA, vars); } if (larg > 0 && alt > 0) res.acm.push({ matId: it.matId, largura: Math.round(larg), altura: Math.round(alt), cor: corVidro, rotulo: it.rotulo || "Fechamento" }); } });
  (est.acess || []).forEach(it => { const qtd = Math.round(evalFormula(it.qtdFormula, vars)); if (qtd <= 0) return; res.acess[it.matId] = (res.acess[it.matId] || 0) + qtd; });

  res.perfis.forEach(p => { const m = matById(p.matId); if (m) res.custo.perfis += (m.preco || 0) * (p.comprimento / 1000); });
  res.vidros.forEach(p => { const m = matById(p.matId); if (m) res.custo.vidros += (m.preco || 0) * (p.largura * p.altura / 1_000_000); });
  res.acm.forEach(p => { const m = matById(p.matId); if (m) res.custo.acm += (m.preco || 0) * (p.largura * p.altura / 1_000_000); });
  for (const [k, q] of Object.entries(res.acess)) { const m = matById(k); if (m) res.custo.acess += (m.preco || 0) * q; }
  res.custo.total = res.custo.perfis + res.custo.vidros + res.custo.acm + res.custo.acess;
  return res;
}

/* =====================================================================
   CACHE POR AMBIENTE
   ===================================================================== */
function calcAmbienteComCache(amb) {
  const dep = { amb, composicoes: state.composicoes, materiais: state.materiais, estrutura: state.estrutura };
  const key = quickHash(dep);
  const cached = _ambCache[amb.id];
  if (cached && cached.key === key) { _statsCache.hit++; return cached.resultado; }
  _statsCache.miss++;

  const totAmb = { estrutura: 0, perfis: 0, vidros: 0, acm: 0, acess: 0, total: 0 };
  const est = calcularEstruturaAmbiente(amb);
  totAmb.estrutura = est.custo.total;
  totAmb.estruturaPerfis = est.custo.perfis;
  totAmb.estruturaVidrosACM = est.custo.vidros + est.custo.acm;
  totAmb.estruturaAcess = est.custo.acess;

  (amb.vaos || []).forEach(v => {
    const r = calcularVao(v, amb);
    v._custo = r.custo; v._detalhe = r;
    totAmb.perfis += r.custo.perfis; totAmb.vidros += r.custo.vidros; totAmb.acm += r.custo.acm; totAmb.acess += r.custo.acess;
    totAmb.total += r.custo.total;
  });
  totAmb.total += est.custo.total;

  _ambCache[amb.id] = { key, resultado: { est, totAmb } };
  return { est, totAmb };
}

/* =====================================================================
   CÁLCULO GLOBAL
   ===================================================================== */
function calcularTudo() {
  const keyGlobal = quickHash({ ambientes: state.ambientes, composicoes: state.composicoes, materiais: state.materiais, estrutura: state.estrutura, params: state.params, desconto: state.orcamento.desconto, otim: configOtimizador });
  if (_globalCache && _globalCache.key === keyGlobal) return _globalCache.resultado;

  _statsCache = { hit: 0, miss: 0 };
  const g = { perfis: [], vidros: [], acm: [], acess: {}, porAmbiente: {} };

  state.ambientes.forEach(a => {
    const { est, totAmb } = calcAmbienteComCache(a);
    g.perfis.push(...est.perfis); g.vidros.push(...est.vidros); g.acm.push(...est.acm);
    for (const [k, q] of Object.entries(est.acess)) g.acess[k] = (g.acess[k] || 0) + q;
    (a.vaos || []).forEach(v => { if (v._detalhe) { g.perfis.push(...v._detalhe.perfis); g.vidros.push(...v._detalhe.vidros); g.acm.push(...v._detalhe.acm); for (const [k, q] of Object.entries(v._detalhe.acess)) g.acess[k] = (g.acess[k] || 0) + q; } });
    g.porAmbiente[a.id] = totAmb;
  });

  g.cortePerfis = cortarPerfis(g.perfis);
  g.corteVidros = cortarChapas(g.vidros, state.params.chapaVidro);
  g.corteACM    = cortarChapas(g.acm, state.params.chapaACM);

  const custo = { perfis: 0, vidros: 0, acm: 0, acess: 0 };
  for (const chave in g.cortePerfis) { const r = g.cortePerfis[chave]; const m = matById(r.matId); custo.perfis += r.totalBarras * (m?.preco || 0) * (state.params.barraPerfil / 1000); }

  g.custoVidrosPorTipo = {};
  const vidrosPorChave = {};
  g.vidros.forEach(v => { const chave = v.matId + "|" + (v.cor || "A definir"); (vidrosPorChave[chave] ||= []).push(v); });
  for (const chave in vidrosPorChave) { const [matId, cor] = chave.split("|"); const r = cortarChapas(vidrosPorChave[chave], state.params.chapaVidro); const m = matById(matId); g.custoVidrosPorTipo[chave] = { chapas: r.totalChapas, aproveitamento: r.aproveitamento, custo: r.totalChapas * (m?.preco || 0), nome: m?.nome || matId, cor, matId }; custo.vidros += g.custoVidrosPorTipo[chave].custo; }

  g.custoACMPorTipo = {};
  const acmPorChave = {};
  g.acm.forEach(v => { const chave = v.matId + "|" + (v.cor || "A definir"); (acmPorChave[chave] ||= []).push(v); });
  for (const chave in acmPorChave) { const [matId, cor] = chave.split("|"); const r = cortarChapas(acmPorChave[chave], state.params.chapaACM); const m = matById(matId); g.custoACMPorTipo[chave] = { chapas: r.totalChapas, aproveitamento: r.aproveitamento, custo: r.totalChapas * (m?.preco || 0), nome: m?.nome || matId, cor, matId }; custo.acm += g.custoACMPorTipo[chave].custo; }

  for (const k in g.acess) { const m = matById(k); custo.acess += (m?.preco || 0) * g.acess[k]; }

  const custoDireto = custo.perfis + custo.vidros + custo.acm + custo.acess;
  const p = state.params;
  const bdiValor = custoDireto * (p.bdi / 100);
  const impostoVal = (custoDireto + bdiValor) * (p.imposto / 100);
  const subtotal = custoDireto + bdiValor + impostoVal + p.frete + p.instalacao;

  g.custo = custo; g.custoDireto = custoDireto; g.bdiValor = bdiValor; g.impostoVal = impostoVal;
  g.subtotal = subtotal; g.total = subtotal - (state.orcamento.desconto || 0);

  _globalCache = { key: keyGlobal, resultado: g };
  return g;
}

/* =====================================================================
   CORTES
   ===================================================================== */
function cortarPerfis(pecas) {
  const porChave = {};
  pecas.forEach(p => { if (!p || p.comprimento <= 0) return; const chave = p.matId + "|" + (p.cor || "A definir"); (porChave[chave] ||= []).push(p.comprimento); });
  const resultado = {}, barra = state.params.barraPerfil, kerf = state.params.kerf || 0;

  for (const chave in porChave) {
    const [matId, cor] = chave.split("|");
    const comp = porChave[chave].slice().sort((a, b) => b - a);
    const barras = [];
    comp.forEach(c => {
      if (c > barra) { barras.push({ itens: [c], restante: 0, aviso: "maior que barra" }); return; }
      let colocada = false;
      for (const b of barras) { if (b.aviso) continue; const espacoNecessario = b.itens.length > 0 ? (c + kerf) : c; if (b.restante >= espacoNecessario) { b.itens.push(c); b.restante -= espacoNecessario; colocada = true; break; } }
      if (!colocada) barras.push({ itens: [c], restante: barra - c });
    });
    const total = comp.reduce((a, b) => a + b, 0);
    resultado[chave] = { barras, totalPecas: comp.length, totalUsado: total, totalBarras: barras.length, metrosLineares: total / 1000, aproveitamento: barras.length ? (total / (barras.length * barra) * 100) : 0, nome: (matById(matId)?.nome || matId) + " — " + cor, cor, matId, comprimentoBarra: barra, kerf };
  }
  return resultado;
}

function cortarChapas(pecas, chapa, forcarAlgoritmo) {
  if (!pecas || !pecas.length) return { chapas: [], totalPecas: 0, areaTotal: 0, areaChapa: chapa.w * chapa.h, totalChapas: 0, aproveitamento: 0, chapaW: chapa.w, chapaH: chapa.h };
  const alg = forcarAlgoritmo || configOtimizador.algoritmo;
  const temMR = typeof MaxRects !== "undefined" && MaxRects && MaxRects.maxRects;
  if ((alg === "maxrects" || alg === "auto") && temMR) {
    const mr = MaxRects.maxRects(pecas, chapa, configOtimizador.heuristica, configOtimizador.girar);
    if (alg === "maxrects") return mr;
    const guil = cortarChapasGuilhotina(pecas, chapa);
    if (mr.totalChapas < guil.totalChapas) return mr;
    if (mr.totalChapas === guil.totalChapas && mr.aproveitamento > guil.aproveitamento + 0.01) return mr;
    return guil;
  }
  return cortarChapasGuilhotina(pecas, chapa);
}

function cortarChapasGuilhotina(pecas, chapa) {
  if (!pecas || !pecas.length) return { chapas: [], totalPecas: 0, areaTotal: 0, areaChapa: chapa.w * chapa.h, totalChapas: 0, aproveitamento: 0, chapaW: chapa.w, chapaH: chapa.h, algoritmo: "guilhotina" };
  const items = pecas.map(p => ({ ...p, w: p.largura, h: p.altura })).filter(p => p.w > 0 && p.h > 0).sort((a, b) => b.w * b.h - a.w * a.h);
  const chapas = [];
  function criarChapa() { return { w: chapa.w, h: chapa.h, itens: [], free: [{ x: 0, y: 0, w: chapa.w, h: chapa.h }] }; }
  function tentarEncaixar(ch, pW, pH) { let best = null, bestArea = Infinity, bestRot = false; for (const s of ch.free) { if (pW <= s.w + 0.001 && pH <= s.h + 0.001) { const sobra = s.w * s.h - pW * pH; if (sobra < bestArea) { bestArea = sobra; best = s; bestRot = false; } } if (pH <= s.w + 0.001 && pW <= s.h + 0.001) { const sobra = s.w * s.h - pW * pH; if (sobra < bestArea) { bestArea = sobra; best = s; bestRot = true; } } } return best ? { slot: best, rot: bestRot } : null; }
  function dividirSlot(ch, slot, pW, pH, rot) { const w = rot ? pH : pW; const h = rot ? pW : pH; ch.free = ch.free.filter(s => s !== slot); if (slot.w - w > 0.001) ch.free.push({ x: slot.x + w, y: slot.y, w: slot.w - w, h }); if (slot.h - h > 0.001) ch.free.push({ x: slot.x, y: slot.y + h, w: slot.w, h: slot.h - h }); ch.free = ch.free.filter((s1, i) => !ch.free.some((s2, j) => i !== j && s1.x >= s2.x && s1.y >= s2.y && s1.x + s1.w <= s2.x + s2.w && s1.y + s1.h <= s2.y + s2.h && s1.w * s1.h < s2.w * s2.h)); }

  items.forEach(it => {
    for (const ch of chapas) { const enc = tentarEncaixar(ch, it.w, it.h); if (enc) { const rw = enc.rot ? it.h : it.w; const rh = enc.rot ? it.w : it.h; ch.itens.push({ ...it, x: enc.slot.x, y: enc.slot.y, w: rw, h: rh }); dividirSlot(ch, enc.slot, it.w, it.h, enc.rot); return; } }
    const ch = criarChapa();
    const enc = tentarEncaixar(ch, it.w, it.h);
    if (enc) { const rw = enc.rot ? it.h : it.w; const rh = enc.rot ? it.w : it.h; ch.itens.push({ ...it, x: enc.slot.x, y: enc.slot.y, w: rw, h: rh }); dividirSlot(ch, enc.slot, it.w, it.h, enc.rot); } else { ch.itens.push({ ...it, x: 0, y: 0, w: it.w, h: it.h, aviso: "maior que chapa" }); }
    chapas.push(ch);
  });
  const areaTotal = items.reduce((s, i) => s + i.w * i.h, 0), areaChapa = chapa.w * chapa.h;
  return { chapas, totalPecas: items.length, areaTotal, areaChapa, totalChapas: chapas.length, aproveitamento: chapas.length ? (areaTotal / (chapas.length * areaChapa) * 100) : 0, chapaW: chapa.w, chapaH: chapa.h, algoritmo: "guilhotina" };
}

/* =====================================================================
   SVG
   ===================================================================== */
const CORES_PECA = { 'Batente': '#3b82f6', 'Travessa': '#22c55e', 'Porta': '#f59e0b', 'Prateleira': '#a855f7', 'Divisória': '#06b6d4', 'Rodapé': '#f97316', 'Montante': '#3b82f6', 'Tubo 50×50': '#22c55e', 'Tubo 2,5×50': '#f59e0b', 'Puxador': '#a855f7', 'Cantoneira 1/2"': '#06b6d4', 'Cantoneira 1"': '#f97316', 'Vidro': '#0ea5e9', 'ACM': '#64748b', 'default': '#94a3b8' };
function corPorRotulo(rotulo, idx) { const fallback = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#06b6d4', '#f97316', '#eab308', '#ec4899', '#14b8a6']; if (!rotulo) return fallback[idx % 10]; if (CORES_PECA[rotulo]) return CORES_PECA[rotulo]; for (const k in CORES_PECA) { if (rotulo.startsWith(k)) return CORES_PECA[k]; } return fallback[idx % 10]; }
function svgBarra(barra, cfg) {
  const W = cfg.largura || 1000, cotas = !!cfg.cotas, H = cotas ? (cfg.alturaVisual || 70) + 40 : (cfg.alturaVisual || 70);
  const pad = 30, barraW = W - pad * 2, barraH = (cfg.alturaVisual || 70) - 24, escala = barraW / cfg.comprimento, fontSize = cfg.expanded ? 10 : 8;
  let xAcum = 0, pecasSvg = '', cotasSvg = '';
  barra.itens.forEach((p, idx) => {
    const comp = p.comprimento || p, w = comp * escala, x = pad + xAcum, cor = corPorRotulo(p.tipo, idx);
    pecasSvg += `<rect x="${x.toFixed(2)}" y="16" width="${Math.max(0, w - 0.3).toFixed(2)}" height="${barraH}" fill="${cor}" stroke="#fff" stroke-width="0.5" opacity="0.9"/>`;
    const txt = String(comp), cabeTexto = w > txt.length * fontSize * 0.6 + 4;
    if (cabeTexto) pecasSvg += `<text x="${(x + w / 2).toFixed(2)}" y="${(16 + barraH / 2 + fontSize / 3).toFixed(2)}" fill="#fff" font-family="system-ui,Arial" font-size="${fontSize}" font-weight="600" text-anchor="middle">${txt}</text>`;
    if (cotas) {
      const cy = 16 + barraH + 14, cx = x, cx2 = x + w, setaSize = 3;
      cotasSvg += `<line x1="${cx.toFixed(1)}" y1="${(cy - 4).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${(cy + 4).toFixed(1)}" stroke="#e6edf7" stroke-width="0.6"/>`;
      cotasSvg += `<line x1="${cx2.toFixed(1)}" y1="${(cy - 4).toFixed(1)}" x2="${cx2.toFixed(1)}" y2="${(cy + 4).toFixed(1)}" stroke="#e6edf7" stroke-width="0.6"/>`;
      cotasSvg += `<line x1="${cx.toFixed(1)}" y1="${cy.toFixed(1)}" x2="${cx2.toFixed(1)}" y2="${cy.toFixed(1)}" stroke="#e6edf7" stroke-width="0.5"/>`;
      cotasSvg += `<polygon points="${cx},${cy} ${cx + setaSize},${cy - setaSize} ${cx + setaSize},${cy + setaSize}" fill="#e6edf7"/>`;
      cotasSvg += `<polygon points="${cx2},${cy} ${cx2 - setaSize},${cy - setaSize} ${cx2 - setaSize},${cy + setaSize}" fill="#e6edf7"/>`;
      const lblW = txt.length * 5 + 4;
      if (w > lblW + 4) { cotasSvg += `<rect x="${((cx + cx2) / 2 - lblW / 2).toFixed(1)}" y="${(cy - 8).toFixed(1)}" width="${lblW}" height="8" fill="${cfg.print ? "#fff" : "#0b1220"}" stroke="none"/>`; cotasSvg += `<text x="${((cx + cx2) / 2).toFixed(2)}" y="${(cy - 1).toFixed(1)}" fill="${cfg.print ? "#000" : "#e6edf7"}" font-family="system-ui,Arial" font-size="7" font-weight="600" text-anchor="middle">${txt}</text>`; }
    }
    xAcum += comp * escala + (cfg.kerf * escala);
  });
  const sobraW = Math.max(0, ((cfg.comprimento - (barra.itens.reduce((s, p) => s + (p.comprimento || p), 0) + (barra.itens.length - 1) * cfg.kerf))) * escala);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="max-width:100%;height:auto;font-family:system-ui,Arial"><rect x="${pad}" y="16" width="${barraW}" height="${barraH}" fill="none" stroke="#94a3b8" stroke-width="1"/><text x="${pad}" y="10" fill="#94a3b8" font-size="8">0</text><text x="${pad + barraW}" y="10" fill="#94a3b8" font-size="8" text-anchor="end">${cfg.comprimento}mm</text>${pecasSvg}${sobraW > 1 ? `<rect x="${(pad + barraW - sobraW).toFixed(2)}" y="16" width="${sobraW.toFixed(2)}" height="${barraH}" fill="none" stroke="#475569" stroke-width="0.5" stroke-dasharray="3,2" opacity="0.5"/>` : ''}${cotasSvg}</svg>`;
}

function svgChapa(ch, cfg) {
  const cotas = !!cfg.cotas, maxW = cfg.larguraVisual || 420, escala = Math.min(maxW / ch.w, 1);
  const padL = cotas ? 28 : 10, padT = cotas ? 22 : 10, W = ch.w * escala + padL + 20, H = ch.h * escala + padT + (cotas ? 30 : 10), fontSize = cfg.expanded ? 9 : 7;
  let pecasSvg = '', cotasSvg = '';
  ch.itens.forEach((p, idx) => {
    const cor = corPorRotulo(p.rotulo, idx), x = padL + p.x * escala, y = padT + p.y * escala, w = p.w * escala, h = p.h * escala;
    pecasSvg += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${Math.max(0, w - 0.3).toFixed(2)}" height="${Math.max(0, h - 0.3).toFixed(2)}" fill="${cor}" stroke="#fff" stroke-width="0.6" opacity="0.9"/>`;
    const txt = `${p.w}×${p.h}`, cabeW = w > txt.length * fontSize * 0.55 + 4, cabeH = h > fontSize * 2.2;
    if (cabeW && cabeH) {
      if (w > h * 1.6) pecasSvg += `<text x="${(x + w / 2).toFixed(2)}" y="${(y + h / 2 + fontSize / 3).toFixed(2)}" fill="#fff" font-family="system-ui,Arial" font-size="${fontSize}" font-weight="600" text-anchor="middle">${txt}</text>`;
      else { pecasSvg += `<text x="${(x + w / 2).toFixed(2)}" y="${(y + h / 2 - 1).toFixed(2)}" fill="#fff" font-family="system-ui,Arial" font-size="${fontSize}" font-weight="600" text-anchor="middle">${p.w}</text>`; pecasSvg += `<text x="${(x + w / 2).toFixed(2)}" y="${(y + h / 2 + fontSize).toFixed(2)}" fill="#fff" font-family="system-ui,Arial" font-size="${fontSize}" font-weight="600" text-anchor="middle">× ${p.h}</text>`; }
    }
  });
  if (cotas) {
    const chapaX = padL, chapaY = padT, chapaW = ch.w * escala, chapaH = ch.h * escala;
    cotasSvg += `<line x1="${chapaX}" y1="${(chapaY - 8).toFixed(1)}" x2="${(chapaX + chapaW).toFixed(1)}" y2="${(chapaY - 8).toFixed(1)}" stroke="#e6edf7" stroke-width="0.6"/>`;
    cotasSvg += `<polygon points="${chapaX},${chapaY - 8} ${chapaX + 4},${chapaY - 11} ${chapaX + 4},${chapaY - 5}" fill="#e6edf7"/>`;
    cotasSvg += `<polygon points="${chapaX + chapaW},${chapaY - 8} ${chapaX + chapaW - 4},${chapaY - 11} ${chapaX + chapaW - 4},${chapaY - 5}" fill="#e6edf7"/>`;
    cotasSvg += `<rect x="${(chapaX + chapaW / 2 - 22).toFixed(1)}" y="${(chapaY - 14).toFixed(1)}" width="44" height="10" fill="${cfg.print ? "#fff" : "#0b1220"}"/>`;
    cotasSvg += `<text x="${(chapaX + chapaW / 2).toFixed(2)}" y="${(chapaY - 6).toFixed(1)}" fill="${cfg.print ? "#000" : "#e6edf7"}" font-family="system-ui,Arial" font-size="8" font-weight="600" text-anchor="middle">${ch.w} mm</text>`;
    cotasSvg += `<line x1="${(chapaX - 8).toFixed(1)}" y1="${chapaY}" x2="${(chapaX - 8).toFixed(1)}" y2="${(chapaY + chapaH).toFixed(1)}" stroke="#e6edf7" stroke-width="0.6"/>`;
    cotasSvg += `<polygon points="${chapaX - 8},${chapaY} ${chapaX - 11},${chapaY + 4} ${chapaX - 5},${chapaY + 4}" fill="#e6edf7"/>`;
    cotasSvg += `<polygon points="${chapaX - 8},${chapaY + chapaH} ${chapaX - 11},${chapaY + chapaH - 4} ${chapaX - 5},${chapaY + chapaH - 4}" fill="#e6edf7"/>`;
    cotasSvg += `<text x="${(chapaX - 14).toFixed(1)}" y="${(chapaY + chapaH / 2 + 3).toFixed(1)}" fill="${cfg.print ? "#000" : "#e6edf7"}" font-family="system-ui,Arial" font-size="8" font-weight="600" text-anchor="middle" transform="rotate(-90 ${(chapaX - 14).toFixed(1)} ${(chapaY + chapaH / 2 + 3).toFixed(1)})">${ch.h} mm</text>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="max-width:100%;height:auto;font-family:system-ui,Arial"><rect x="${padL}" y="${padT}" width="${ch.w * escala}" height="${ch.h * escala}" fill="none" stroke="#94a3b8" stroke-width="1"/>${pecasSvg}${cotasSvg}</svg>`;
}

function renderPlanosSVG(container, opts) {
  const compacto = !opts.expandido, cotas = !!opts.cotas, print = !!opts.print, html = [];
  if (opts.tipo === 'perfis') {
    Object.values(opts.dados).forEach(r => {
      html.push(`<div style="margin-bottom:14px"><div class="plano-head"><div class="ph-title">${escapeHtml(r.nome)}</div><div class="ph-meta">${r.totalBarras} barra(s) · ${r.totalPecas} peças · ${fmtN(r.metrosLineares)}m · aprov. ${fmtN(r.aproveitamento, 1)}%</div></div>`);
      r.barras.forEach((b, i) => {
        const cfg = { comprimento: r.comprimentoBarra, kerf: r.kerf, largura: compacto ? 580 : 960, alturaVisual: compacto ? 65 : 80, expanded: opts.expandido, cotas, print };
        html.push(`<div style="margin:6px 0 10px"><div class="small" style="margin-bottom:2px">Barra #${i + 1} — sobra ${b.restante}mm${b.aviso ? ` <span class="pill err">${b.aviso}</span>` : ''}</div><div class="svg-wrap">${svgBarra(b, cfg)}</div><table style="font-size:11px;margin-top:6px"><thead><tr><th>#</th><th>Comprimento</th></tr></thead><tbody>`);
        b.itens.forEach((p, pi) => html.push(`<tr><td>${pi + 1}</td><td>${p.comprimento || p} mm</td></tr>`));
        html.push(`</tbody></table></div>`);
      });
      html.push(`</div>`);
    });
  } else if (opts.tipo === 'chapas') {
    const wChapa = opts.wChapa, hChapa = opts.hChapa, tipoLabel = opts.titulo || 'Chapa';
    html.push(`<div class="plano-head"><div class="ph-title">${tipoLabel} ${wChapa}×${hChapa}mm</div><div class="ph-meta">${opts.dados.totalChapas} chapa(s) · ${opts.dados.totalPecas} peças · aprov. ${fmtN(opts.dados.aproveitamento, 1)}%</div></div>`);
    opts.dados.chapas.forEach((ch, i) => {
      const cfg = { larguraVisual: compacto ? 340 : 520, expanded: opts.expandido, cotas, print };
      const svg = svgChapa(ch, cfg);
      html.push(`<div style="display:inline-block;vertical-align:top;margin:6px 8px 12px 0;background:#0a1526;border:1px solid var(--line);border-radius:8px;padding:8px;vertical-align:top"><div class="small" style="margin-bottom:4px;font-weight:700;color:var(--acc2)">Chapa #${i + 1} · ${ch.itens.length} peça(s)</div>${svg}<table style="font-size:10.5px;margin-top:6px"><thead><tr><th>Peça</th><th>X,Y</th><th>Rótulo</th></tr></thead><tbody>${ch.itens.map(it => `<tr><td>${it.w}×${it.h}</td><td>(${it.x},${it.y})</td><td>${escapeHtml(it.rotulo || '-')}</td></tr>`).join("")}</tbody></table></div>`);
    });
  }
  container.innerHTML = html.join('');
}

function exportarPlanosSVG() {
  try {
    const g = calcularTudo(), blocos = [];
    blocos.push(`<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="1200" height="2000" viewBox="0 0 1200 2000" font-family="system-ui,Arial"><rect width="1200" height="2000" fill="#ffffff"/>`);
    let y = 40;
    blocos.push(`<text x="40" y="${y}" font-size="20" font-weight="700" fill="#0b1220">OrçaProQually — Planos de Corte</text>`); y += 24;
    blocos.push(`<text x="40" y="${y}" font-size="12" fill="#475569">Orçamento ${escapeHtml(state.orcamento.numero || '-')} · ${fmtData(state.orcamento.data)} · Cliente: ${escapeHtml(state.orcamento.cliente || '-')}</text>`); y += 40;
    blocos.push(`<text x="40" y="${y}" font-size="14" font-weight="700" fill="#0b1220">PERFIS</text>`); y += 12;
    Object.values(g.cortePerfis).forEach(r => {
      blocos.push(`<text x="40" y="${y}" font-size="11" font-weight="700" fill="#0b1220">${escapeHtml(r.nome)} — ${r.totalBarras} barra(s) · aprov. ${fmtN(r.aproveitamento, 1)}%</text>`); y += 14;
      r.barras.forEach(b => {
        const inner = svgBarra(b, { comprimento: r.comprimentoBarra, kerf: r.kerf, largura: 1000, alturaVisual: 60, expanded: true, cotas: true, print: true });
        const match = inner.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
        blocos.push(`<g transform="translate(40,${y})">${match ? match[1] : ''}</g>`); y += 100;
        if (y > 1850) { blocos.push(`</svg>`); y = 40; blocos.push(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="2000" viewBox="0 0 1200 2000" font-family="system-ui,Arial"><rect width="1200" height="2000" fill="#ffffff"/>`); }
      });
      y += 8;
    });
    blocos.push(`</svg>`);
    const blob = new Blob([blocos.join('\n')], { type: "image/svg+xml;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `planos-corte-${state.orcamento.numero || "orc"}.svg`; a.click(); toast("✅ SVG exportado");
  } catch (e) { toast("Erro ao exportar SVG: " + e.message, true); }
}

/* =====================================================================
   COMPARATIVO
   ===================================================================== */
function compararAlgoritmos() {
  if (!state.ambientes.length) { const el = document.getElementById("comparacaoAlgoritmos"); if (el) el.innerHTML = '<p class="small">Sem dados para comparar.</p>'; return; }
  const todasPecas = { vidros: [], acm: [] };
  state.ambientes.forEach(a => {
    const est = calcularEstruturaAmbiente(a); todasPecas.vidros.push(...est.vidros); todasPecas.acm.push(...est.acm);
    (a.vaos || []).forEach(v => { const r = calcularVao(v, a); todasPecas.vidros.push(...r.vidros); todasPecas.acm.push(...r.acm); });
  });
  if (!todasPecas.vidros.length && !todasPecas.acm.length) { const el = document.getElementById("comparacaoAlgoritmos"); if (el) el.innerHTML = '<p class="small">Sem peças para comparar.</p>'; return; }
  const resultado = { vidros: compararUmMaterial(todasPecas.vidros, state.params.chapaVidro), acm: compararUmMaterial(todasPecas.acm, state.params.chapaACM) };
  renderizarComparacao(resultado);
}
function compararUmMaterial(pecas, chapa) {
  if (!pecas.length) return null;
  const guil = cortarChapasGuilhotina(pecas, chapa);
  const mr = (typeof MaxRects !== "undefined" && MaxRects.maxRects) ? MaxRects.maxRects(pecas, chapa, configOtimizador.heuristica, configOtimizador.girar) : guil;
  return { guil, mr, pecas, chapa };
}
function renderizarComparacao(res) {
  const box = document.getElementById("comparacaoAlgoritmos"); if (!box) return;
  const blocos = [];
  ["vidros", "acm"].forEach(tipo => {
    const r = res[tipo]; if (!r) return;
    const nome = tipo === "vidros" ? "🪟 Vidros" : "🧱 ACM", chapaDim = `${r.chapa.w}×${r.chapa.h}mm`;
    const vencedor = (r.mr.totalChapas < r.guil.totalChapas) ? "mr" : (r.guil.totalChapas < r.mr.totalChapas) ? "guil" : (r.mr.aproveitamento > r.guil.aproveitamento) ? "mr" : "guil";
    const diffChapas = r.guil.totalChapas - r.mr.totalChapas;
    const idsTipo = {}; r.pecas.forEach(p => { idsTipo[p.matId] = true; });
    const materiais = Object.keys(idsTipo).map(id => matById(id)).filter(Boolean);
    const precoMedio = materiais.length ? materiais.reduce((s, m) => s + (m.preco || 0), 0) / materiais.length : (tipo === "vidros" ? 320 : 145);
    const economia = diffChapas * precoMedio;
    blocos.push(`<div style="margin-bottom:18px"><h3 style="margin:8px 0">${nome} <span class="small">— ${r.pecas.length} peças · chapa ${chapaDim}</span></h3><div class="cmp-grid"><div class="cmp-col ${vencedor === 'guil' ? 'winner' : ''}"><h4>Guilhotina ${vencedor === 'guil' ? '<span class="cmp-badge">MELHOR</span>' : ''}</h4><div class="cmp-kpi"><span>Chapas necessárias</span><b>${r.guil.totalChapas}</b></div><div class="cmp-kpi"><span>Aproveitamento</span><b>${fmtN(r.guil.aproveitamento, 1)}%</b></div><div class="cmp-kpi"><span>Área usada</span><b>${fmtN(r.guil.areaTotal / 1e6, 2)} m²</b></div></div><div class="cmp-col ${vencedor === 'mr' ? 'winner' : ''}"><h4>MaxRects ${vencedor === 'mr' ? '<span class="cmp-badge">MELHOR</span>' : ''}</h4><div class="cmp-kpi"><span>Chapas necessárias</span><b>${r.mr.totalChapas}</b></div><div class="cmp-kpi"><span>Aproveitamento</span><b>${fmtN(r.mr.aproveitamento, 1)}%</b></div><div class="cmp-kpi"><span>Área usada</span><b>${fmtN(r.mr.areaTotal / 1e6, 2)} m²</b></div></div></div>${diffChapas > 0 ? `<div class="cmp-economia">💰 Economia MaxRects: <span class="big">${diffChapas} chapa(s)</span><div class="small">aproximadamente ${fmt(economia)} em ${nome.toLowerCase()}</div></div>` : diffChapas < 0 ? `<div class="cmp-economia" style="border-color:var(--warn)">⚠️ Guilhotina foi melhor: <span class="big">${-diffChapas} chapa(s)</span></div>` : `<div class="cmp-economia" style="border-color:var(--muted);background:#0e1729">🤝 Empate: ambos usam ${r.guil.totalChapas} chapa(s)</div>`}</div>`);
  });
  if (configOtimizador.algoritmo !== 'maxrects' && blocos.length) blocos.push(`<div style="text-align:right;margin-top:8px"><button class="btn ok sm" onclick="aplicarMaxRects()">✔️ Aplicar MaxRects globalmente</button></div>`);
  box.innerHTML = blocos.join("") || '<p class="small">Sem dados.</p>';
}
function aplicarMaxRects() { configOtimizador.algoritmo = "maxrects"; salvarConfigOtimizador(); invalidarCaches(); render(); toast("✅ MaxRects aplicado globalmente"); }

/* =====================================================================
   RENDER PRINCIPAL
   ===================================================================== */
function render() {
  document.getElementById("orcNum").value = state.orcamento.numero || "";
  document.getElementById("orcCli").value = state.orcamento.cliente || "";
  document.getElementById("orcTel").value = state.orcamento.telefone || "";
  document.getElementById("orcEnd").value = state.orcamento.endereco || "";
  document.getElementById("orcData").value = state.orcamento.data || "";
  document.getElementById("orcVend").value = state.orcamento.vendedor || "";
  document.getElementById("orcVal").value = state.orcamento.validade ?? 15;
  document.getElementById("orcObs").value = state.orcamento.obs || "";
  document.getElementById("desc").value = state.orcamento.desconto || 0;

  const phN = document.getElementById("phNumero"), phD = document.getElementById("phData"), phC = document.getElementById("phCliente");
  if (phN) phN.textContent = state.orcamento.numero || "—";
  if (phD) phD.textContent = fmtData(state.orcamento.data);
  if (phC) phC.textContent = state.orcamento.cliente || "—";

  document.getElementById("cv_w").value = state.params.chapaVidro.w;
  document.getElementById("cv_h").value = state.params.chapaVidro.h;
  document.getElementById("ca_w").value = state.params.chapaACM.w;
  document.getElementById("ca_h").value = state.params.chapaACM.h;
  document.getElementById("bp_l").value = state.params.barraPerfil;
  document.getElementById("kerf").value = state.params.kerf;
  document.getElementById("bdi").value = state.params.bdi;
  document.getElementById("frete").value = state.params.frete;
  document.getElementById("instal").value = state.params.instalacao;
  document.getElementById("imp").value = state.params.imposto;

  const selA = document.getElementById("otimAlgoritmo"); if (selA) selA.value = configOtimizador.algoritmo;
  const selH = document.getElementById("otimHeur"); if (selH) selH.value = configOtimizador.heuristica;
  const selG = document.getElementById("otimGirar"); if (selG) selG.value = configOtimizador.girar ? "1" : "0";

  renderAmbientes(); renderEditorComposicoes(); renderMateriais();

  const g = calcularTudo();
  renderResultado(g); renderProposta(g); renderCompra(g); renderHistorico(); atualizarStatusTemplate();

  document.querySelectorAll('input[type="file"]').forEach(el => { el.value = ""; });

  const ci = document.getElementById("cacheInfo"); if (ci) ci.textContent = `cache: ${_statsCache.hit} hit / ${_statsCache.miss} miss`;
  const sbC = document.getElementById("sbCache"); if (sbC) sbC.textContent = `cache: ${_statsCache.hit} hit / ${_statsCache.miss} miss`;
  const sbI = document.getElementById("sbInfo"); if (sbI) sbI.textContent = `Orçamento ${state.orcamento.numero || '—'} · ${state.ambientes.length} ambiente(s)`;

  atualizarStatusUndo();
  try { compararAlgoritmos(); } catch (e) { console.warn("Comparação falhou:", e); }

  const tabView = document.getElementById("tab-view");
  if (tabView && !tabView.classList.contains("hidden") && typeof viewer3D !== "undefined" && viewer3D._buildAmbTabs) {
    viewer3D._buildAmbTabs(); viewer3D.render();
  }
}

/* =====================================================================
   RENDER — AMBIENTES & VÃOS
   ===================================================================== */
function renderAmbientes() {
  const box = document.getElementById("listaAmb"); if (!box) return;
  if (!state.ambientes.length) { box.innerHTML = '<div class="card"><p class="small">Nenhum ambiente. Adicione um acima.</p></div>'; return; }
  const g = calcularTudo();
  box.innerHTML = state.ambientes.map(a => {
    const soma = (a.vaos || []).reduce((s, v) => s + (+v.largura || 0), 0), resta = a.largura - soma;
    const totEstrutura = g.porAmbiente[a.id]?.estrutura || 0, totVaos = (g.porAmbiente[a.id]?.total - totEstrutura) || 0, totGeral = g.porAmbiente[a.id]?.total || 0, vis = a.visibilidade || "frente";
    return `<div class="card"><div class="flex-between"><div class="row"><input value="${escapeHtml(a.nome)}" onchange="setAmb('nome',this.value,'${a.id}')" style="width:180px"><span class="pill">L ${a.largura}mm</span><span class="pill">A ${a.altura}mm</span><span class="pill">P ${a.profundidade}mm</span><span class="pill ${resta < 0 ? 'err' : (resta === 0 ? 'ok' : 'warn')}">Livre: ${resta}mm</span><span class="pill acc">${fmt(totGeral)}</span></div><div class="row no-print"><button class="btn sm" onclick="addVao('${a.id}')">+ Vão</button><button class="btn sm" onclick="abrirDivisor('${a.id}')">÷ Dividir</button><button class="btn err sm" onclick="removeAmbiente('${a.id}')">✕</button></div></div><div class="grid g5 no-print" style="margin-top:8px;grid-template-columns:repeat(auto-fit,minmax(120px,1fr))"><div><label>Largura (mm)</label><input type="number" value="${a.largura}" onchange="setAmb('largura',+this.value,'${a.id}')"></div><div><label>Altura (mm)</label><input type="number" value="${a.altura}" onchange="setAmb('altura',+this.value,'${a.id}')"></div><div><label>Profundidade (mm)</label><input type="number" value="${a.profundidade}" onchange="setAmb('profundidade',+this.value,'${a.id}')"></div><div><label>Cor Perfil</label><select onchange="setAmb('corPerfil',this.value,'${a.id}')">${CORES_PERFIL.map(c => `<option value="${c}" ${a.corPerfil === c ? "selected" : ""}>${c}</option>`).join("")}</select></div><div><label>Cor Vidro/ACM</label><select onchange="setAmb('corVidro',this.value,'${a.id}')">${CORES_VIDRO.map(c => `<option value="${c}" ${a.corVidro === c ? "selected" : ""}>${c}</option>`).join("")}</select></div><div style="grid-column:span 2"><label>Visibilidade</label><select onchange="setAmb('visibilidade',this.value,'${a.id}')"><option value="frente" ${vis === 'frente' ? 'selected' : ''}>Frente</option><option value="frente_1" ${vis === 'frente_1' ? 'selected' : ''}>Frente + 1 Lateral</option><option value="frente_2" ${vis === 'frente_2' ? 'selected' : ''}>Frente + 2 Laterais</option><option value="todos" ${vis === 'todos' ? 'selected' : ''}>Todos (Fundo incluso)</option></select></div></div><div class="subcard" style="margin-top:10px;border-left-color:var(--gold)"><div class="row flex-between"><div><b>🔩 Fechamentos / Estrutura</b></div><span class="pill warn">Custo: ${fmt(totEstrutura)}</span></div></div><div style="margin-top:10px"><p class="small" style="margin-bottom:5px">Vãos (Custo: ${fmt(totVaos)})</p>${(a.vaos || []).map(v => renderVao(a, v)).join("") || '<p class="small">Sem vãos.</p>'}</div></div>`;
  }).join("");
}

function renderVao(a, v) {
  const t = TIPOS_VAO[v.tipo];
  const gav = (v.tipo === "gaveta" || v.tipo === "gaveta_dupla");
  const portas = ["porta_simples", "porta_dupla", "porta_tempero", "cristaleira", "nicho"].includes(v.tipo);
  const comp = state.composicoes[v.tipo];
  const aceitaPrat = ["porta_simples", "porta_dupla", "porta_tempero", "cristaleira", "nicho"].includes(v.tipo);
  const temPrat = aceitaPrat || !!(comp && comp.prateleiras && comp.prateleiras.ativo);
  const corP = v.corPerfil || "A definir", corV = v.corVidro || "A definir";

  return `<div class="vao">
    <div class="flex-between">
      <div class="row">
        <span class="pill acc">${t.icone} ${t.nome}</span>
        <input value="${escapeHtml(v.descricao || '')}" onchange="upVao('${a.id}','${v.id}','descricao',this.value)" style="width:160px" placeholder="Descrição">
        <span class="pill">L ${v.largura}mm</span>
        ${gav ? `<span class="pill">${v.gavetasPortas} gaveta(s)</span>` : ""}
        ${portas && !gav ? `<span class="pill">${v.gavetasPortas} porta(s)</span>` : ""}
        ${temPrat && v.temPrateleiras ? `<span class="pill ok">📚 ${v.qtdPrateleiras || 0} prat.</span>` : ""}
        ${corPill(corP, "🔩 ")} ${corPill(corV, "🪟 ")}
        <span class="pill ok">${fmt(v._custo?.total || 0)}</span>
      </div>
      <button class="btn err xs no-print" onclick="removeVao('${a.id}','${v.id}')">✕</button>
    </div>
    <div class="grid g4 no-print" style="margin-top:8px">
      <div><label>Tipo</label><select onchange="upVao('${a.id}','${v.id}','tipo',this.value)">
        ${Object.entries(TIPOS_VAO).map(([k, x]) => `<option value="${k}" ${v.tipo === k ? "selected" : ""}>${x.icone} ${x.nome}</option>`).join("")}
      </select></div>
      <div><label>Largura vão (mm)</label><input type="number" value="${v.largura}" onchange="upVao('${a.id}','${v.id}','largura',+this.value)"></div>
      <div><label>${gav ? "Nº gavetas" : portas ? "Nº portas" : "Nº itens"}</label><input type="number" min="1" value="${v.gavetasPortas || 1}" onchange="upVao('${a.id}','${v.id}','gavetasPortas',+this.value)"></div>
      <div><label>Cor Perfil</label><select onchange="upVao('${a.id}','${v.id}','corPerfil',this.value)">
        ${CORES_PERFIL.map(c => `<option value="${c}" ${corP === c ? "selected" : ""}>${c}</option>`).join("")}
      </select></div>
      <div><label>Cor Vidro/ACM</label><select onchange="upVao('${a.id}','${v.id}','corVidro',this.value)">
        ${CORES_VIDRO.map(c => `<option value="${c}" ${corV === c ? "selected" : ""}>${c}</option>`).join("")}
      </select></div>
    </div>
    ${temPrat ? `<div class="subcard no-print" style="margin-top:8px">
      <div class="row">
        <label style="margin:0"><input type="checkbox" ${v.temPrateleiras ? "checked" : ""} onchange="upVao('${a.id}','${v.id}','temPrateleiras',this.checked)" style="margin-right:6px"> 📚 Incluir prateleiras</label>
        ${v.temPrateleiras ? `<div><label>Qtd</label><input type="number" min="1" value="${v.qtdPrateleiras || (comp.prateleiras ? comp.prateleiras.qtd : 2) || 2}" onchange="upVao('${a.id}','${v.id}','qtdPrateleiras',+this.value)" style="width:90px"></div>` : ""}
      </div>
    </div>` : ""}
    ${v._detalhe ? `<div class="mods"><span class="mod">🔩 ${v._detalhe.perfis.length} perfis</span><span class="mod">🪟 ${v._detalhe.vidros.length} vidros</span><span class="mod">🧱 ${v._detalhe.acm.length} ACM</span><span class="mod">🔧 ${Object.values(v._detalhe.acess).reduce((s, x) => s + x, 0)} acessórios</span></div>` : ""}
  </div>`;
}

/* =====================================================================
   RENDER — COMPOSIÇÕES
   ===================================================================== */
function renderEditorComposicoes() {
  const tabs = document.getElementById("tabsTipoVao"); if (!tabs) return;
  let htmlTabs = `<div class="tab ${compTabAtual === 'estrutura' ? "on" : ""}" onclick="compTabAtual='estrutura';compSubTab='perfis';renderEditorComposicoes()">🔩 ESTRUTURA</div>`;
  htmlTabs += Object.entries(TIPOS_VAO).map(([k, t]) => `<div class="tab ${compTabAtual === k ? "on" : ""}" onclick="compTabAtual='${k}';compSubTab='perfis';renderEditorComposicoes()">${t.icone} ${t.nome}</div>`).join("");
  tabs.innerHTML = htmlTabs;
  const isEst = compTabAtual === "estrutura", comp = isEst ? state.estrutura : state.composicoes[compTabAtual], temPrat = !isEst && comp && comp.prateleiras;
  document.getElementById("editorTipoVao").innerHTML = `<div class="tabs-inner"><div class="tab ${compSubTab === 'perfis' ? 'on' : ''}" onclick="compSubTab='perfis';renderEditorComposicoes()">🔩 Perfis</div><div class="tab ${compSubTab === 'vidros' ? 'on' : ''}" onclick="compSubTab='vidros';renderEditorComposicoes()">🪟 Vidros / ACM</div><div class="tab ${compSubTab === 'acess' ? 'on' : ''}" onclick="compSubTab='acess';renderEditorComposicoes()">🔧 Acessórios</div>${temPrat ? `<div class="tab ${compSubTab === 'prat' ? 'on' : ''}" onclick="compSubTab='prat';renderEditorComposicoes()">📚 Prateleiras</div>` : ""}</div>${renderCompTabela(compTabAtual, compSubTab, isEst ? state.estrutura[compSubTab] : state.composicoes[compTabAtual][compSubTab])}<p class="small">Variáveis: <b>L</b> · <b>A</b> · <b>P</b> · <b>V</b> (vãos) · <b>N</b> (gavetas/portas).<br>${isEst ? `<b>F</b> (frente), <b>LAT</b> (laterais), <b>FUNDO</b> (fundo).` : `Vidro: <b>porta</b> (divide pelo N).`}</p><button class="btn no-print" onclick="addItemComp()">+ Adicionar item</button>`;
}

function renderCompTabela(tipoVao, cat, itens) {
  if (!itens) itens = [];
  const isEst = tipoVao === "estrutura";
  if (cat === "prat") { const p = state.composicoes[tipoVao].prateleiras; return `<div class="subcard"><div class="row" style="margin-bottom:10px"><label style="margin:0"><input type="checkbox" ${p.ativo ? "checked" : ""} onchange="setPrat('${tipoVao}','ativo',this.checked)" style="margin-right:6px"> Ativar prateleiras</label></div><div class="grid g4"><div><label>Qtd padrão</label><input type="number" min="1" value="${p.qtd || 2}" onchange="setPrat('${tipoVao}','qtd',+this.value)"></div><div><label>Vidro</label><select onchange="setPrat('${tipoVao}','vidro.matId',this.value)">${state.materiais.vidros.map(m => `<option value="${m.id}" ${p.vidro?.matId === m.id ? "selected" : ""}>${escapeHtml(m.nome)}</option>`).join("")}</select></div><div><label>Desc. L</label><input type="text" value="${p.vidro?.descL || 0}" onchange="setPrat('${tipoVao}','vidro.descL',this.value)"></div><div><label>Desc. A</label><input type="text" value="${p.vidro?.descA || 0}" onchange="setPrat('${tipoVao}','vidro.descA',this.value)"></div><div><label>Perfil</label><select onchange="setPrat('${tipoVao}','perfil.matId',this.value)">${state.materiais.perfis.map(m => `<option value="${m.id}" ${p.perfil?.matId === m.id ? "selected" : ""}>${escapeHtml(m.nome)}</option>`).join("")}</select></div><div><label>Orient.</label><select onchange="setPrat('${tipoVao}','perfil.orientacao',this.value)"><option value="L" ${p.perfil?.orientacao === 'L' ? 'selected' : ''}>L</option><option value="A" ${p.perfil?.orientacao === 'A' ? 'selected' : ''}>A</option><option value="P" ${p.perfil?.orientacao === 'P' ? 'selected' : ''}>P</option></select></div><div><label>Suporte</label><select onchange="setPrat('${tipoVao}','acess.matId',this.value)">${state.materiais.acess.map(m => `<option value="${m.id}" ${p.acess?.matId === m.id ? "selected" : ""}>${escapeHtml(m.nome)}</option>`).join("")}</select></div><div><label>Sup./prat.</label><input type="number" min="0" value="${p.acess?.porPrateleira || 2}" onchange="setPrat('${tipoVao}','acess.porPrateleira',+this.value)"></div></div></div>`; }
  if (cat === "acess") { return `<table><thead><tr><th>Material</th><th>Qtd</th><th></th></tr></thead><tbody>${itens.map((it, i) => `<tr><td><select onchange="setCompItem('${tipoVao}','${cat}',${i},'matId',this.value)">${state.materiais.acess.map(m => `<option value="${m.id}" ${it.matId === m.id ? "selected" : ""}>${escapeHtml(m.nome)}</option>`).join("")}</select></td><td><input value="${escapeHtml(it.qtdFormula || '')}" onchange="setCompItem('${tipoVao}','${cat}',${i},'qtdFormula',this.value)"></td><td><button class="btn err xs no-print" onclick="delCompItem('${tipoVao}','${cat}',${i})">✕</button></td></tr>`).join("")}</tbody></table>`; }
  if (cat === "perfis") { return `<table><thead><tr><th>Perfil</th><th>Qtd</th><th>Orient.</th><th>Desc.</th><th></th></tr></thead><tbody>${itens.map((it, i) => `<tr><td><select onchange="setCompItem('${tipoVao}','${cat}',${i},'matId',this.value)">${state.materiais.perfis.map(m => `<option value="${m.id}" ${it.matId === m.id ? "selected" : ""}>${escapeHtml(m.nome)}</option>`).join("")}</select></td><td><input value="${escapeHtml(it.qtdFormula || '')}" onchange="setCompItem('${tipoVao}','${cat}',${i},'qtdFormula',this.value)"></td><td><select onchange="setCompItem('${tipoVao}','${cat}',${i},'orientacao',this.value)"><option value="L" ${it.orientacao === 'L' ? 'selected' : ''}>L</option><option value="A" ${it.orientacao === 'A' ? 'selected' : ''}>A</option><option value="P" ${it.orientacao === 'P' ? 'selected' : ''}>P</option></select></td><td><input type="text" value="${it.desc || 0}" onchange="setCompItem('${tipoVao}','${cat}',${i},'desc',this.value)"></td><td><button class="btn err xs no-print" onclick="delCompItem('${tipoVao}','${cat}',${i})">✕</button></td></tr>`).join("")}</tbody></table>`; }
  if (cat === "vidros") { return `<table><thead><tr><th>Material</th><th>Qtd</th><th>Orient.</th><th>Desc.L</th><th>Desc.A</th><th>Rótulo</th><th></th></tr></thead><tbody>${itens.map((it, i) => `<tr><td><select onchange="setCompItem('${tipoVao}','${cat}',${i},'matId',this.value)"><optgroup label="Vidros">${state.materiais.vidros.map(m => `<option value="${m.id}" ${it.matId === m.id ? "selected" : ""}>${escapeHtml(m.nome)}</option>`).join("")}</optgroup><optgroup label="ACM">${state.materiais.acm.map(m => `<option value="${m.id}" ${it.matId === m.id ? "selected" : ""}>${escapeHtml(m.nome)}</option>`).join("")}</optgroup></select></td><td><input value="${escapeHtml(it.qtdFormula || '')}" onchange="setCompItem('${tipoVao}','${cat}',${i},'qtdFormula',this.value)"></td><td><select onchange="setCompItem('${tipoVao}','${cat}',${i},'orientacao',this.value)">${isEst ? `<option value="F" ${it.orientacao === 'F' ? 'selected' : ''}>F</option><option value="LAT" ${it.orientacao === 'LAT' ? 'selected' : ''}>LAT</option><option value="FUNDO" ${it.orientacao === 'FUNDO' ? 'selected' : ''}>FUNDO</option>` : `<option value="porta" ${it.orientacao === 'porta' ? 'selected' : ''}>porta</option>`}<option value="LA" ${it.orientacao === 'LA' ? 'selected' : ''}>LA</option><option value="LP" ${it.orientacao === 'LP' ? 'selected' : ''}>LP</option><option value="AP" ${it.orientacao === 'AP' ? 'selected' : ''}>AP</option><option value="custom_metade" ${it.orientacao === 'custom_metade' ? 'selected' : ''}>Metade/Prof</option><option value="custom_condicional" ${it.orientacao === 'custom_condicional' ? 'selected' : ''}>Condicional</option></select></td><td><input type="text" value="${it.descL || 0}" onchange="setCompItem('${tipoVao}','${cat}',${i},'descL',this.value)" placeholder="Ex: LM_D"></td><td><input type="text" value="${it.descA || 0}" onchange="setCompItem('${tipoVao}','${cat}',${i},'descA',this.value)" placeholder="Ex: PM_D"></td><td><input value="${escapeHtml(it.rotulo || '')}" onchange="setCompItem('${tipoVao}','${cat}',${i},'rotulo',this.value)"></td><td><button class="btn err xs no-print" onclick="delCompItem('${tipoVao}','${cat}',${i})">✕</button></td></tr>`).join("")}</tbody></table>`; }
  return "";
}

function setCompItem(t, c, i, k, v) { snapshotParaUndo(); if (t === "estrutura") state.estrutura[c][i][k] = v; else state.composicoes[t][c][i][k] = v; invalidarCaches(); save(); render(); }
function delCompItem(t, c, i) { snapshotParaUndo(); if (t === "estrutura") state.estrutura[c].splice(i, 1); else state.composicoes[t][c].splice(i, 1); invalidarCaches(); save(); render(); }
function addItemComp() { snapshotParaUndo(); const t = compTabAtual, cat = compSubTab; if (cat === "prat") { toast("Já configurado", false); return; } const def = { matId: (state.materiais[cat] && state.materiais[cat][0]?.id) || "", qtdFormula: "1" }; if (cat === "perfis") { def.orientacao = "L"; def.desc = 0; } if (cat === "vidros") { def.orientacao = t === "estrutura" ? "F" : "porta"; def.descL = 3; def.descA = 6; def.rotulo = "Fechamento"; } if (t === "estrutura") { if (cat === "vidros") def.matId = "v_temperado"; if (cat === "perfis") def.matId = "p_tubo5050"; state.estrutura[cat].push(def); } else { state.composicoes[t][cat].push(def); } invalidarCaches(); save(); render(); }
function setPrat(t, p, v) { snapshotParaUndo(); const pr = state.composicoes[t].prateleiras; const ps = p.split("."); if (ps.length === 1) pr[ps[0]] = v; else { if (!pr[ps[0]]) pr[ps[0]] = {}; pr[ps[0]][ps[1]] = v; } invalidarCaches(); save(); render(); }

function renderMateriais() {
  const box = document.getElementById("editorMat"); if (!box) return;
  const arr = state.materiais[matCatAtual] || [], u = { perfis: "R$/m", vidros: "R$/m²", acm: "R$/m²", acess: "R$/un" };
  box.innerHTML = `<table><thead><tr><th>Nome</th><th>Preço (${u[matCatAtual]})</th><th></th></tr></thead><tbody>${arr.map((m, i) => `<tr><td><input value="${escapeHtml(m.nome)}" onchange="setMat(${i},'nome',this.value)"></td><td><input type="number" step="0.01" value="${m.preco}" onchange="setMat(${i},'preco',+this.value)"></td><td><button class="btn err xs no-print" onclick="delMat(${i})">✕</button></td></tr>`).join("")}</tbody></table><button class="btn no-print" style="margin-top:10px" onclick="addMat()">+ Adicionar</button>`;
}
function setMat(i, k, v) { snapshotParaUndo(); state.materiais[matCatAtual][i][k] = v; invalidarCaches(); save(); render(); }
function delMat(i) { if (!confirm("Remover?")) return; snapshotParaUndo(); state.materiais[matCatAtual].splice(i, 1); invalidarCaches(); save(); render(); }
function addMat() { snapshotParaUndo(); const p = { perfis: "p_", vidros: "v_", acm: "acm_", acess: "a_" }[matCatAtual]; state.materiais[matCatAtual].push({ id: p + uid(), nome: "Novo", preco: 0 }); invalidarCaches(); save(); render(); }
function salvarParams() { snapshotParaUndo(); state.params = { chapaVidro: { w: +document.getElementById("cv_w").value, h: +document.getElementById("cv_h").value }, chapaACM: { w: +document.getElementById("ca_w").value, h: +document.getElementById("ca_h").value }, barraPerfil: +document.getElementById("bp_l").value, kerf: +document.getElementById("kerf").value, bdi: +document.getElementById("bdi").value, frete: +document.getElementById("frete").value, instalacao: +document.getElementById("instal").value, imposto: +document.getElementById("imp").value }; invalidarCaches(); save(); render(); toast("Parâmetros salvos"); }

function renderResultado(g) {
  document.getElementById("kpis").innerHTML = `<div class="grid g4"><div class="kpi"><div class="l">Custo Direto</div><div class="v">${fmt(g.custoDireto)}</div></div><div class="kpi"><div class="l">BDI (${state.params.bdi}%)</div><div class="v">${fmt(g.bdiValor)}</div></div><div class="kpi"><div class="l">Impostos</div><div class="v">${fmt(g.impostoVal)}</div></div><div class="kpi"><div class="l">Frete + Inst.</div><div class="v">${fmt(state.params.frete + state.params.instalacao)}</div></div><div class="kpi"><div class="l">Desconto</div><div class="v">- ${fmt(state.orcamento.desconto)}</div></div><div class="kpi" style="border-left-color:var(--ok)"><div class="l">TOTAL FINAL</div><div class="v tot">${fmt(g.total)}</div></div></div><table style="margin-top:12px"><tr><td>🔩 Perfis</td><td style="text-align:right">${fmt(g.custo.perfis)}</td></tr><tr><td>🪟 Vidros</td><td style="text-align:right">${fmt(g.custo.vidros)}</td></tr><tr><td>🧱 ACM</td><td style="text-align:right">${fmt(g.custo.acm)}</td></tr><tr><td>🔧 Acessórios</td><td style="text-align:right">${fmt(g.custo.acess)}</td></tr></table>`;
  document.getElementById("resumoAmb").innerHTML = state.ambientes.map(a => {
    const t = g.porAmbiente[a.id] || { estrutura: 0, perfis: 0, vidros: 0, acm: 0, acess: 0, total: 0 };
    return `<div style="margin-bottom:16px"><p style="margin:0 0 6px 0"><b>🏠 ${escapeHtml(a.nome)}</b> — <span class="pill ok">${fmt(t.total)}</span></p><table><thead><tr><th>Módulo</th><th>Tipo</th><th>Cores</th><th style="text-align:right">Perfis</th><th style="text-align:right">Vidros/ACM</th><th style="text-align:right">Acess.</th><th style="text-align:right">Total</th></tr></thead><tbody><tr style="background:#1a2743"><td><b>ESTRUTURA BASE</b></td><td>Fechamento</td><td class="small">-</td><td style="text-align:right"><b>${fmt(t.estruturaPerfis)}</b></td><td style="text-align:right"><b>${fmt(t.estruturaVidrosACM)}</b></td><td style="text-align:right"><b>${fmt(t.estruturaAcess)}</b></td><td style="text-align:right"><b>${fmt(t.estrutura)}</b></td></tr>${(a.vaos || []).map(v => { const c = v._custo || { perfis: 0, vidros: 0, acm: 0, acess: 0, total: 0 }; const prat = v.temPrateleiras ? ` <span class="pill ok">📚${v.qtdPrateleiras || 0}</span>` : ""; return `<tr><td>${escapeHtml(v.descricao || "-")} <span class="small">(${v.largura}mm)</span>${prat}</td><td>${TIPOS_VAO[v.tipo].nome}</td><td class="small">${corPill(v.corPerfil || "A definir", "🔩 ")} ${corPill(v.corVidro || "A definir", "🪟 ")}</td><td style="text-align:right">${fmt(c.perfis)}</td><td style="text-align:right">${fmt(c.vidros + c.acm)}</td><td style="text-align:right">${fmt(c.acess)}</td><td style="text-align:right"><b>${fmt(c.total)}</b></td></tr>`; }).join("")}</tbody></table></div>`;
  }).join("") || '<p class="small">Sem dados.</p>';
  const wrapPerfis = document.getElementById("cortePerfis"), wrapVidros = document.getElementById("corteVidros"), wrapACM = document.getElementById("corteACM");
  const headPerfis = wrapPerfis.parentElement.querySelector(".flex-between");
  if (headPerfis) {
    let toggle = headPerfis.querySelector(".svg-toggle");
    if (!toggle) { toggle = document.createElement("div"); toggle.className = "svg-toggle no-print"; headPerfis.appendChild(toggle); }
    toggle.innerHTML = `<button class="${_expandido ? '' : 'on'}" onclick="if(_expandido)toggleExpandido()">Compacto</button><button class="${_expandido ? 'on' : ''}" onclick="if(!_expandido)toggleExpandido()">Expandido</button><button class="${_cotasPlano ? 'on' : ''}" onclick="toggleCotasPlano()">📏 ${_cotasPlano ? 'Cotas ON' : 'Cotas OFF'}</button>`;
  }
  if (Object.keys(g.cortePerfis).length) { renderPlanosSVG(wrapPerfis, { tipo: 'perfis', dados: g.cortePerfis, expandido: _expandido, cotas: _cotasPlano }); } else { wrapPerfis.innerHTML = '<p class="small">Nenhum perfil.</p>'; }
  if (g.corteVidros.totalPecas) { const extra = Object.values(g.custoVidrosPorTipo).map(v => `<p class="small">▸ ${escapeHtml(v.nome)} ${corPill(v.cor, "Cor: ")}: ${v.chapas} chapa(s) — ${fmt(v.custo)}</p>`).join(""); renderPlanosSVG(wrapVidros, { tipo: 'chapas', dados: g.corteVidros, wChapa: state.params.chapaVidro.w, hChapa: state.params.chapaVidro.h, titulo: "Vidro", expandido: _expandido, cotas: _cotasPlano }); wrapVidros.insertAdjacentHTML('beforeend', extra); } else { wrapVidros.innerHTML = '<p class="small">Nenhum vidro.</p>'; }
  if (g.corteACM.totalPecas) { const extra = Object.values(g.custoACMPorTipo).map(v => `<p class="small">▸ ${escapeHtml(v.nome)} ${corPill(v.cor, "Cor: ")}: ${v.chapas} chapa(s) — ${fmt(v.custo)}</p>`).join(""); renderPlanosSVG(wrapACM, { tipo: 'chapas', dados: g.corteACM, wChapa: state.params.chapaACM.w, hChapa: state.params.chapaACM.h, titulo: "ACM", expandido: _expandido, cotas: _cotasPlano }); wrapACM.insertAdjacentHTML('beforeend', extra); } else { wrapACM.innerHTML = '<p class="small">Nenhum ACM.</p>'; }
  const acess = Object.entries(g.acess);
  document.getElementById("listaAcess").innerHTML = acess.length ? `<table><thead><tr><th>Acessório</th><th style="text-align:right">Qtd</th><th style="text-align:right">Unit.</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>${acess.map(([k, q]) => { const m = matById(k); return `<tr><td>${escapeHtml(m?.nome || k)}</td><td style="text-align:right">${q}</td><td style="text-align:right">${fmt(m?.preco || 0)}</td><td style="text-align:right">${fmt((m?.preco || 0) * q)}</td></tr>`; }).join("")}</tbody></table>` : '<p class="small">Nenhum acessório.</p>';
}
function toggleExpandido() { _expandido = !_expandido; const g = calcularTudo(); renderResultado(g); }
function toggleCotasPlano() { _cotasPlano = !_cotasPlano; const g = calcularTudo(); renderResultado(g); }

function gerarHTMLProposta(g, isCliente) {
  const o = state.orcamento;
  const dataVenc = new Date(new Date(o.data || Date.now()).getTime() + (o.validade || 15) * 86400000);
  const valorAdicional = (g.bdiValor || 0) + (g.impostoVal || 0) + (state.params.frete || 0) + (state.params.instalacao || 0);
  const fatorRateio = (g.custoDireto > 0) ? (valorAdicional / g.custoDireto) : 0;
  const valorItem = (cd) => { const v = Number(cd) || 0; if (!isCliente) return v; return Math.round((v + v * fatorRateio) * 100) / 100; };
  return `<div style="border:1px solid var(--line);border-radius:10px;padding:20px;background:#0d1728"><div class="flex-between" style="margin-bottom:14px"><div><h2 style="margin:0;color:var(--acc2)">PROPOSTA COMERCIAL</h2><p class="small">Nº ${escapeHtml(o.numero || "-")} · ${fmtData(o.data)}</p></div><div style="text-align:right"><p class="small">Validade: ${o.validade || 15} dias (até ${dataVenc.toLocaleDateString("pt-BR")})</p></div></div><table style="margin-bottom:16px;font-size:12px;"><tr><td><b>Cliente:</b> ${escapeHtml(o.cliente || "-")}</td><td><b>Telefone:</b> ${escapeHtml(o.telefone || "-")}</td></tr><tr><td colspan="2"><b>Endereço:</b> ${escapeHtml(o.endereco || "-")}</td></tr><tr><td><b>Vendedor:</b> ${escapeHtml(o.vendedor || "-")}</td><td><b>Obs.:</b> ${escapeHtml(o.obs || "-")}</td></tr></table><h3 style="color:var(--acc2)">Itens do Projeto</h3><table><thead><tr><th>Ambiente</th><th>Módulo</th><th style="text-align:right">Larg.</th><th>Tipo</th><th>Cores</th><th style="text-align:right">Valor</th></tr></thead><tbody>${state.ambientes.map(a => { let rows = ''; const totEst = g.porAmbiente[a.id]?.estrutura || 0; if (totEst > 0) { rows += `<tr style="background:rgba(255,255,255,0.03)"><td>${escapeHtml(a.nome)}</td><td><b>Estrutura Base</b></td><td style="text-align:right">${a.largura}mm</td><td>Sustentação</td><td class="small">${corPill(a.corPerfil, "🔩 ")} ${corPill(a.corVidro, "🪟 ")}</td><td style="text-align:right">${fmt(valorItem(totEst))}</td></tr>`; } (a.vaos || []).forEach(v => { const totVao = v._custo?.total || 0; rows += `<tr><td>${escapeHtml(a.nome)}</td><td>${escapeHtml(v.descricao || "-")}${v.temPrateleiras ? ` 📚${v.qtdPrateleiras || 0}` : ""}</td><td style="text-align:right">${v.largura}mm</td><td>${TIPOS_VAO[v.tipo]?.nome || v.tipo}</td><td class="small">${corPill(v.corPerfil, "🔩 ")} ${corPill(v.corVidro, "🪟 ")}</td><td style="text-align:right">${fmt(valorItem(totVao))}</td></tr>`; }); return rows; }).join("")}</tbody></table><h3 style="color:var(--acc2)">Resumo Financeiro</h3><table>${isCliente ? `<tr><td>Valor dos Produtos</td><td style="text-align:right">${fmt(g.subtotal)}</td></tr><tr><td>Desconto</td><td style="text-align:right;color:var(--err)">- ${fmt(o.desconto || 0)}</td></tr><tr style="border-top:2px solid var(--acc2)"><td><b>VALOR TOTAL</b></td><td style="text-align:right" class="tot">${fmt(g.total)}</td></tr>` : `<tr><td>Custo Direto</td><td style="text-align:right">${fmt(g.custoDireto)}</td></tr><tr><td>BDI (${state.params.bdi}%)</td><td style="text-align:right">${fmt(g.bdiValor)}</td></tr><tr><td>Impostos</td><td style="text-align:right">${fmt(g.impostoVal)}</td></tr><tr><td>Frete</td><td style="text-align:right">${fmt(state.params.frete)}</td></tr><tr><td>Instalação</td><td style="text-align:right">${fmt(state.params.instalacao)}</td></tr><tr><td>Desconto</td><td style="text-align:right">- ${fmt(o.desconto || 0)}</td></tr><tr style="border-top:2px solid var(--acc2)"><td><b>TOTAL</b></td><td style="text-align:right" class="tot">${fmt(g.total)}</td></tr>`}</table>${isCliente ? `<div style="margin-top:50px"><div style="border-top:1px solid #999;width:300px;margin:0 auto;"></div><p style="text-align:center;margin:8px 0 0 0;font-size:12px;color:#333;"><b>${escapeHtml(o.cliente || "Assinatura do Cliente")}</b><br>Assinatura do Cliente</p></div>` : ""}<p class="small" style="margin-top:20px">${isCliente ? `Proposta válida por ${o.validade || 15} dias.` : 'Documento interno — contém custos.'}</p></div>`;
}
function renderProposta(g) { document.getElementById("propostaComercial").innerHTML = `<div class="internal-box" style="display:none">${gerarHTMLProposta(g, false)}</div><div class="client-box">${gerarHTMLProposta(g, true)}</div>`; }

function renderCompra(g) {
  const linhas = [];
  for (const c in g.cortePerfis) { const r = g.cortePerfis[c]; linhas.push({ cat: "Perfil", desc: `${matById(r.matId)?.nome || r.matId} — ${state.params.barraPerfil}mm`, cor: r.cor, qtd: r.totalBarras, un: "barra", obs: `${fmtN(r.metrosLineares)}m` }); }
  for (const c in g.custoVidrosPorTipo) { const v = g.custoVidrosPorTipo[c]; linhas.push({ cat: "Vidro", desc: `${v.nome} — ${state.params.chapaVidro.w}×${state.params.chapaVidro.h}`, cor: v.cor, qtd: v.chapas, un: "chapa", obs: `Aprov. ${fmtN(v.aproveitamento, 1)}%` }); }
  for (const c in g.custoACMPorTipo) { const v = g.custoACMPorTipo[c]; linhas.push({ cat: "ACM", desc: `${v.nome} — ${state.params.chapaACM.w}×${state.params.chapaACM.h}`, cor: v.cor, qtd: v.chapas, un: "chapa", obs: `Aprov. ${fmtN(v.aproveitamento, 1)}%` }); }
  for (const k in g.acess) { const m = matById(k); linhas.push({ cat: "Acessório", desc: m?.nome || k, cor: "-", qtd: g.acess[k], un: "un", obs: "" }); }
  document.getElementById("listaCompra").innerHTML = linhas.length ? `<table><thead><tr><th>Cat.</th><th>Descrição</th><th>Cor</th><th style="text-align:right">Qtd</th><th>Un.</th><th>Obs.</th></tr></thead><tbody>${linhas.map(l => `<tr><td><span class="pill">${l.cat}</span></td><td>${escapeHtml(l.desc)}</td><td>${l.cor && l.cor !== "-" ? corPill(l.cor, "") : "-"}</td><td style="text-align:right"><b>${l.qtd}</b></td><td>${l.un}</td><td class="small">${escapeHtml(l.obs)}</td></tr>`).join("")}</tbody></table>` : '<p class="small">Sem itens.</p>';
  window._compraLinhas = linhas;
}
function exportCSV() { const linhas = window._compraLinhas || []; if (!linhas.length) { toast("Nada", true); return; } const csv = ["Categoria;Descrição;Cor;Qtd;Un;Obs", ...linhas.map(l => `${l.cat};${l.desc.replace(/;/g, ",")};${l.cor || "-"};${l.qtd};${l.un};${l.obs}`)].join("\n"); const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `lista-${state.orcamento.numero || "orc"}.csv`; a.click(); }

function renderHistorico() { const box = document.getElementById("listaHist"); if (!box) return; box.innerHTML = hist.length ? `<table><thead><tr><th>Nome</th><th>Data</th><th></th></tr></thead><tbody>${hist.map((h, i) => `<tr><td>${escapeHtml(h.nome)}</td><td>${new Date(h.data).toLocaleString("pt-BR")}</td><td><button class="btn sm no-print" onclick="carregarHist(${i})">Carregar</button><button class="btn err sm no-print" onclick="delHist(${i})">✕</button></td></tr>`).join("")}</tbody></table>` : '<p class="small">Nenhum snapshot.</p>'; }
function carregarHist(i) { if (!confirm("Carregar este snapshot?")) return; snapshotParaUndo(); const c = JSON.parse(JSON.stringify(state.composicoes)), m = JSON.parse(JSON.stringify(state.materiais)), p = JSON.parse(JSON.stringify(state.params)), e = JSON.parse(JSON.stringify(state.estrutura)); state = normalizeState(JSON.parse(JSON.stringify(hist[i].estado))); if (!state.composicoes || !Object.keys(state.composicoes).length) state.composicoes = c; if (!state.materiais || !Object.keys(state.materiais).length) state.materiais = m; if (!state.params) state.params = p; if (!state.estrutura) state.estrutura = e; state.orcamento.salvoNaNuvem = true; invalidarCaches(); save(); render(); toast("Carregado"); }
function delHist(i) { hist.splice(i, 1); saveHist(); renderHistorico(); }

/* =====================================================================
   IMPRESSÃO
   ===================================================================== */
function imprimirPropostaCliente() { document.body.classList.remove("printing-compra", "printing-res", "printing-proposta-interna", "printing-sec", "printing-view"); document.body.classList.add("printing-proposta-cliente"); window.print(); setTimeout(() => document.body.classList.remove("printing-proposta-cliente"), 500); }
function imprimirPropostaInterna() { document.body.classList.remove("printing-compra", "printing-res", "printing-proposta-cliente", "printing-sec", "printing-view"); document.body.classList.add("printing-proposta-interna"); window.print(); setTimeout(() => document.body.classList.remove("printing-proposta-interna"), 500); }
function imprimirListaCompra() { document.body.classList.remove("printing-proposta-cliente", "printing-proposta-interna", "printing-res", "printing-sec", "printing-view"); document.body.classList.add("printing-compra"); window.print(); setTimeout(() => document.body.classList.remove("printing-compra"), 500); }
function imprimirResultado() { document.body.classList.remove("printing-proposta-cliente", "printing-proposta-interna", "printing-compra", "printing-sec", "printing-view"); document.body.classList.add("printing-res"); window.print(); setTimeout(() => document.body.classList.remove("printing-res"), 500); }
function imprimirSecao(id) { document.querySelectorAll(".card").forEach(c => c.classList.remove("print-target")); const el = document.getElementById(id); if (el) el.classList.add("print-target"); document.body.classList.remove("printing-proposta-cliente", "printing-proposta-interna", "printing-compra", "printing-res", "printing-view"); document.body.classList.add("printing-sec"); window.print(); setTimeout(() => document.body.classList.remove("printing-sec"), 500); }
function imprimirVisualizacao() { if (typeof viewer3D !== "undefined" && viewer3D.snapshot) viewer3D.snapshot(true); document.body.classList.remove("printing-proposta-cliente", "printing-proposta-interna", "printing-compra", "printing-res", "printing-sec"); document.body.classList.add("printing-view"); window.print(); setTimeout(() => document.body.classList.remove("printing-view"), 500); }
function imprimirAuto() { const ativo = document.querySelector('.tabs .tab.on'); const aba = ativo ? ativo.dataset.tab : "proposta"; if (aba === "compra") return imprimirListaCompra(); if (aba === "res") return imprimirResultado(); if (aba === "view") return imprimirVisualizacao(); return imprimirPropostaInterna(); }

/* =====================================================================
   MUTAÇÕES
   ===================================================================== */
function setOrc(k, v) { snapshotParaUndo(); state.orcamento[k] = v; if (k === "desconto") _globalCache = null; save(); render(); }
function setAmb(k, v, aid) { snapshotParaUndo(); const a = state.ambientes.find(x => x.id === aid); if (!a) return; a[k] = v; invalidarCacheAmbiente(aid); save(); render(); }
function addAmbiente() { snapshotParaUndo(); const nome = document.getElementById("nomeAmb").value.trim() || "Ambiente"; const L = +document.getElementById("ambL").value || 5000; const A = +document.getElementById("ambA").value || 800; const P = +document.getElementById("ambP").value || 500; state.ambientes.push({ id: uid(), nome, largura: L, altura: A, profundidade: P, vaos: [], visibilidade: "frente", corPerfil: "Branco", corVidro: "Incolor" }); invalidarCaches(); document.getElementById("nomeAmb").value = ""; save(); render(); }
function removeAmbiente(id) { if (!confirm("Remover este ambiente?")) return; snapshotParaUndo(); state.ambientes = state.ambientes.filter(a => a.id !== id); invalidarCacheAmbiente(id); save(); render(); }
function addVao(aid) { const amb = state.ambientes.find(a => a.id === aid); if (!amb) return; const usada = (amb.vaos || []).reduce((s, v) => s + (+v.largura || 0), 0); if (usada + 500 > amb.largura) { toast("Largura excede o ambiente", true); return; } snapshotParaUndo(); amb.vaos.push({ id: uid(), tipo: "porta_simples", descricao: "Módulo", largura: 500, gavetasPortas: 1, temPrateleiras: false, qtdPrateleiras: 0, corPerfil: amb.corPerfil || "A definir", corVidro: amb.corVidro || "A definir" }); invalidarCacheAmbiente(aid); save(); render(); }
function removeVao(aid, vid) { snapshotParaUndo(); const amb = state.ambientes.find(a => a.id === aid); if (!amb) return; amb.vaos = amb.vaos.filter(v => v.id !== vid); invalidarCacheAmbiente(aid); save(); render(); }
function upVao(aid, vid, key, val) { snapshotParaUndo(); const amb = state.ambientes.find(a => a.id === aid); if (!amb) return; const v = amb.vaos.find(x => x.id === vid); if (!v) return; v[key] = val; invalidarCacheAmbiente(aid); save(); render(); const soma = amb.vaos.reduce((s, x) => s + (+x.largura || 0), 0); if (soma > amb.largura) toast(`⚠️ Soma (${soma}mm) excede (${amb.largura}mm)`, true); }

/* =====================================================================
   DIVISOR DE VÃOS
   ===================================================================== */
function abrirDivisor(aid) {
  const amb = state.ambientes.find(a => a.id === aid); if (!amb) { toast("Ambiente não encontrado", true); return; }
  const usada = (amb.vaos || []).reduce((s, v) => s + (+v.largura || 0), 0), livre = amb.largura - usada;
  document.getElementById("modalRoot").innerHTML = `<div class="modal-bg" onclick="if(event.target===this)fecharModal()"><div class="modal"><h2 style="color:var(--acc2)">÷ Dividir Largura</h2><p class="small"><b>${escapeHtml(amb.nome)}</b> — total <b>${amb.largura} mm</b> · usado <b>${usada} mm</b> · livre <b>${livre} mm</b></p><div class="grid g3" style="margin-top:12px"><div><label>Modo</label><select id="divModo" onchange="atualizarDivisor('${aid}')"><option value="qtd">Por quantidade</option><option value="larg">Por largura</option></select></div><div><label>Qtd</label><input type="number" id="divQtd" min="1" max="50" value="5" onchange="atualizarDivisor('${aid}')"></div><div><label>Largura (mm)</label><input type="number" id="divLarg" min="1" value="1000" onchange="atualizarDivisor('${aid}')"></div></div><div class="grid g3" style="margin-top:12px"><div><label>Tipo</label><select id="divTipo" onchange="atualizarDivisor('${aid}')">${Object.entries(TIPOS_VAO).map(([k, v]) => `<option value="${k}">${v.icone} ${v.nome}</option>`).join("")}</select></div><div><label>Nº padrão</label><input type="number" id="divN" min="1" value="1" onchange="atualizarDivisor('${aid}')"></div><div><label>Descrição</label><input id="divDesc" value="Módulo" onchange="atualizarDivisor('${aid}')"></div></div><div class="grid g3" style="margin-top:12px"><div><label>Cor perfil</label><select id="divCorPerfil">${CORES_PERFIL.map(c => `<option value="${c}" ${c === "A definir" ? "selected" : ""}>${c}</option>`).join("")}</select></div><div><label>Cor vidro/ACM</label><select id="divCorVidro">${CORES_VIDRO.map(c => `<option value="${c}" ${c === "A definir" ? "selected" : ""}>${c}</option>`).join("")}</select></div></div><h3>Prévia</h3><div id="divPrevia"></div><div class="row" style="margin-top:14px;justify-content:flex-end"><button class="btn sec" onclick="fecharModal()">Cancelar</button><button class="btn err" onclick="limparVaos('${aid}')">🗑️ Limpar</button><button class="btn ok" onclick="aplicarDivisor('${aid}')">✔️ Aplicar</button></div></div></div>`;
  atualizarDivisor(aid);
}
function atualizarDivisor(aid) {
  const amb = state.ambientes.find(a => a.id === aid); if (!amb) return;
  const usada = (amb.vaos || []).reduce((s, v) => s + (+v.largura || 0), 0), livre = amb.largura - usada;
  const modo = document.getElementById("divModo").value, qtd = Math.max(1, +document.getElementById("divQtd").value || 1), larg = Math.max(1, +document.getElementById("divLarg").value || 100);
  let nV, lV, sobra; if (modo === "qtd") { nV = qtd; lV = Math.floor(livre / nV); sobra = livre - lV * nV; } else { nV = Math.max(1, Math.floor(livre / larg)); lV = larg; sobra = livre - nV * larg; }
  const tipo = document.getElementById("divTipo").value, nPad = Math.max(1, +document.getElementById("divN").value || 1), desc = document.getElementById("divDesc").value || "Módulo", cp = document.getElementById("divCorPerfil").value, cv = document.getElementById("divCorVidro").value;
  let html = `<table><thead><tr><th>#</th><th>Descrição</th><th>Tipo</th><th style="text-align:right">Larg.</th><th style="text-align:right">Nº</th><th>Cores</th></tr></thead><tbody>`;
  for (let i = 0; i < nV; i++) { const w = (i === nV - 1) ? (lV + sobra) : lV; html += `<tr><td>${i + 1}</td><td>${escapeHtml(desc)} ${i + 1}</td><td>${TIPOS_VAO[tipo].icone} ${TIPOS_VAO[tipo].nome}</td><td style="text-align:right"><b>${w}</b></td><td style="text-align:right">${nPad}</td><td>${corPill(cp, "")} ${corPill(cv, "")}</td></tr>`; }
  html += `</tbody></table><p class="small" style="margin-top:8px"><b>${nV} vãos</b> de <b>${lV} mm</b>${sobra > 0 ? ` · último: <b>${lV + sobra} mm</b>` : ""}</p>`;
  document.getElementById("divPrevia").innerHTML = html;
}
function aplicarDivisor(aid) {
  const amb = state.ambientes.find(a => a.id === aid); if (!amb) return;
  const usada = (amb.vaos || []).reduce((s, v) => s + (+v.largura || 0), 0), livre = amb.largura - usada;
  const modo = document.getElementById("divModo").value, qtd = Math.max(1, +document.getElementById("divQtd").value || 1), larg = Math.max(1, +document.getElementById("divLarg").value || 100);
  const tipo = document.getElementById("divTipo").value, nPad = Math.max(1, +document.getElementById("divN").value || 1), desc = document.getElementById("divDesc").value || "Módulo", cp = document.getElementById("divCorPerfil").value, cv = document.getElementById("divCorVidro").value;
  snapshotParaUndo();
  let nV, lV, sobra; if (modo === "qtd") { nV = qtd; lV = Math.floor(livre / nV); sobra = livre - lV * nV; } else { nV = Math.max(1, Math.floor(livre / larg)); lV = larg; sobra = livre - nV * larg; }
  for (let i = 0; i < nV; i++) { amb.vaos.push({ id: uid(), tipo, descricao: `${desc} ${i + 1}`, largura: (i === nV - 1) ? (lV + sobra) : lV, gavetasPortas: nPad, temPrateleiras: false, qtdPrateleiras: 0, corPerfil: cp, corVidro: cv }); }
  invalidarCacheAmbiente(aid); save(); render(); fecharModal(); toast(`✔️ ${nV} vãos criados`);
}
function limparVaos(aid) { if (!confirm("Remover TODOS os vãos?")) return; snapshotParaUndo(); const amb = state.ambientes.find(a => a.id === aid); if (!amb) return; amb.vaos = []; invalidarCacheAmbiente(aid); save(); render(); fecharModal(); toast("Vãos removidos"); }

/* =====================================================================
   MÚLTIPLOS ORÇAMENTOS
   ===================================================================== */
function consolidarDuplicados(registros) {
  const mapa = {};
  registros.forEach(r => {
    const chave = (String(r.numero || "").trim().toLowerCase()) + "|" + (String(r.cliente || "").trim().toLowerCase());
    if (!chave || chave === "||") return;
    if (!mapa[chave]) { mapa[chave] = r; mapa[chave]._duplicados = []; }
    else { if (r.fonte === "nuvem" && mapa[chave].fonte !== "nuvem") { r._duplicados = (mapa[chave]._duplicados || []).concat([mapa[chave]]); mapa[chave] = r; } else mapa[chave]._duplicados.push(r); }
  });
  return Object.values(mapa);
}
function novoOrcamento() {
  if ((state.ambientes || []).length || state.orcamento.numero) { if (!confirm("Iniciar um NOVO orçamento?")) return; }
  snapshotParaUndo(); salvarOrcamentoLocal();
  const c = JSON.parse(JSON.stringify(state.composicoes)), m = JSON.parse(JSON.stringify(state.materiais)), p = JSON.parse(JSON.stringify(state.params)), e = JSON.parse(JSON.stringify(state.estrutura));
  state = novoEstado(); state.composicoes = c; state.materiais = m; state.params = p; state.estrutura = e;
  invalidarCaches(); save(); render(); toast("➕ Novo orçamento criado");
  document.querySelectorAll(".tabs .tab").forEach(x => x.classList.remove("on"));
  document.querySelector('.tab[data-tab="orc"]').classList.add("on");
  ["orc","lista","comp","mat","view","res","proposta","compra","hist"].forEach(id => document.getElementById("tab-" + id).classList.toggle("hidden", id !== "orc"));
}
async function abrirOrcamento(id, fonte) {
  if (state.orcamento.id === id) { toast("Este orçamento já está aberto", false); return; }
  if ((state.ambientes || []).length) { if (!confirm("Abrir outro orçamento? O atual será salvo antes.")) return; salvarOrcamentoLocal(); }
  snapshotParaUndo();
  if (fonte === "nuvem") { await carregarDoSheets(id); await atualizarListaOrcamentos(); return; }
  const item = hist.find(h => h.id === id || h.estado?.orcamento?.id === id);
  if (!item) { toast("Orçamento não encontrado", true); return; }
  const c = JSON.parse(JSON.stringify(state.composicoes)), m = JSON.parse(JSON.stringify(state.materiais)), p = JSON.parse(JSON.stringify(state.params)), e = JSON.parse(JSON.stringify(state.estrutura));
  state = normalizeState(JSON.parse(JSON.stringify(item.estado)));
  if (!state.composicoes || !Object.keys(state.composicoes).length) state.composicoes = c;
  if (!state.materiais || !Object.keys(state.materiais).length) state.materiais = m;
  if (!state.params) state.params = p;
  if (!state.estrutura) state.estrutura = e;
  state.orcamento.salvoNaNuvem = true; invalidarCaches(); save(); render(); toast("📂 Carregado: " + (state.orcamento.numero || id));
}
function duplicarOrcamento() {
  if (!state.orcamento.numero) { toast("Defina um número primeiro", true); return; }
  if (!confirm("Criar uma CÓPIA deste orçamento?")) return;
  snapshotParaUndo(); salvarOrcamentoLocal();
  const numeroAtual = state.orcamento.numero || "ORC";
  const novoNum = prompt("Número do novo orçamento:", numeroAtual + "-CÓPIA") || (numeroAtual + "-CÓPIA");
  state.orcamento.id = gerarIdLocal(); state.orcamento.numero = novoNum; state.orcamento.data = new Date().toISOString().slice(0, 10); state.orcamento.salvoNaNuvem = false;
  save(); render(); salvarOrcamentoLocal(); toast("📋 Cópia criada: " + novoNum); atualizarListaOrcamentos();
}
async function excluirOrcamento(id, fonte) {
  if (!confirm("Excluir este orçamento?")) return;
  hist = hist.filter(h => h.id !== id && h.estado?.orcamento?.id !== id); saveHist();
  if (fonte === "nuvem") { try { await sheetsRequest("excluir", { id }); } catch (e) {} }
  if (state.orcamento.id === id) { const c = JSON.parse(JSON.stringify(state.composicoes)), m = JSON.parse(JSON.stringify(state.materiais)), p = JSON.parse(JSON.stringify(state.params)), e = JSON.parse(JSON.stringify(state.estrutura)); state = novoEstado(); state.composicoes = c; state.materiais = m; state.params = p; state.estrutura = e; }
  invalidarCaches(); save(); render(); await atualizarListaOrcamentos(); toast("🗑️ Excluído");
}
function salvarOrcamentoLocal() {
  const id = state.orcamento.id || gerarIdLocal(); state.orcamento.id = id;
  const numero = state.orcamento.numero || ("SEM-NUM-" + Date.now()); if (!state.orcamento.numero) state.orcamento.numero = numero;
  const snap = { id, nome: numero + (state.orcamento.cliente ? " · " + state.orcamento.cliente : ""), data: new Date().toISOString(), estado: JSON.parse(JSON.stringify(state)) };
  const idx = hist.findIndex(h => h.id === id); if (idx >= 0) hist[idx] = snap; else hist.unshift(snap);
  if (hist.length > 100) hist.length = 100;
  saveHist(); save(); return id;
}
async function atualizarListaOrcamentos() {
  const box = document.getElementById("listaOrcamentos"); if (!box) return; box.innerHTML = '<p class="small">Carregando…</p>';
  const locais = hist.map(h => ({ fonte: "local", id: h.id, nome: h.nome || "Sem nome", numero: h.estado?.orcamento?.numero || "—", cliente: h.estado?.orcamento?.cliente || "—", data: h.estado?.orcamento?.data || "", updated_at: h.data, ativo: h.id === state.orcamento.id }));
  let nuvem = [];
  try { const r = await sheetsRequest("listar"); nuvem = (r.lista || []).map(p => ({ fonte: "nuvem", id: p.id, numero: p.numero || "—", cliente: p.cliente || "—", data: p.data || "", updated_at: p.updated_at, ativo: p.id === state.orcamento.id })); } catch (e) {}
  const idsNuvem = new Set(nuvem.map(n => n.id)), todos = consolidarDuplicados([...nuvem, ...locais.filter(l => !idsNuvem.has(l.id))]);
  if (!todos.length) { box.innerHTML = `<div class="subcard" style="text-align:center;padding:20px"><p style="margin:0 0 10px 0">📭 Nenhum orçamento salvo.</p><button class="btn ok" onclick="novoOrcamento()">➕ Criar primeiro</button></div>`; return; }
  todos.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));
  box.innerHTML = `<table><thead><tr><th>Nº</th><th>Cliente</th><th>Data</th><th>Atualizado</th><th>Fonte</th><th style="text-align:right">Ações</th></tr></thead><tbody>${todos.map(o => `<tr style="${o.ativo ? 'background:#0e2240' : ''}"><td><b>${escapeHtml(o.numero)}</b>${o.ativo ? ' <span class="pill ok">ABERTO</span>' : ''}${(o._duplicados || []).length ? ` <span class="pill warn">🧹</span>` : ""}</td><td>${escapeHtml(o.cliente)}</td><td>${fmtData(o.data)}</td><td class="small">${o.updated_at ? new Date(o.updated_at).toLocaleString("pt-BR") : "-"}</td><td><span class="pill ${o.fonte === "nuvem" ? "acc" : "warn"}">${o.fonte === "nuvem" ? "☁️ Nuvem" : "💾 Local"}</span></td><td style="text-align:right"><button class="btn sm" onclick="abrirOrcamento('${o.id}','${o.fonte}')">📂 Abrir</button><button class="btn err sm" onclick="excluirOrcamento('${o.id}','${o.fonte}')">🗑️</button></td></tr>`).join("")}</tbody></table>`;
  const info = document.getElementById("infoOrcamentoAtual");
  if (info) {
    const o = state.orcamento;
    info.innerHTML = `<div class="grid g4"><div class="kpi"><div class="l">Nº</div><div class="v">${escapeHtml(o.numero || "—")}</div></div><div class="kpi"><div class="l">Cliente</div><div class="v">${escapeHtml(o.cliente || "—")}</div></div><div class="kpi"><div class="l">Data</div><div class="v">${fmtData(o.data)}</div></div><div class="kpi"><div class="l">Ambientes</div><div class="v">${(state.ambientes || []).length}</div></div></div><div class="row" style="margin-top:12px"><button class="btn ok" onclick="salvarTudo()">💾 Salvar Atual</button><button class="btn sec" onclick="duplicarOrcamento()">📋 Duplicar</button><button class="btn warn" onclick="novoOrcamento()">➕ Novo</button><button class="btn err" onclick="excluirOrcamento('${o.id || ""}','${o.id && o.id.startsWith("ORC-") ? "nuvem" : "local"}')">🗑️ Excluir</button></div>`;
  }
}
function salvarOrcamento() { salvarOrcamentoLocal(); toast("💾 Snapshot criado"); renderHistorico(); }

/* =====================================================================
   GOOGLE SHEETS
   ===================================================================== */
let _sheetsTimer = null;
function agendarSyncSheets() { if (!SHEETS_API || SHEETS_API.includes("COLE SUA URL") || SHEETS_API.includes("👇")) return; if (!state.orcamento.salvoNaNuvem) return; if (!state.orcamento.numero && !state.orcamento.cliente && !(state.ambientes || []).length) return; clearTimeout(_sheetsTimer); _sheetsTimer = setTimeout(() => salvarNoSheets(true), 3000); }
async function sheetsRequest(action, payload = {}) {
  if (!SHEETS_API || SHEETS_API.includes("COLE SUA URL") || SHEETS_API.includes("👇")) throw new Error("URL do Web App não configurada em SHEETS_API");
  const url = SHEETS_API + "?action=" + encodeURIComponent(action), body = JSON.stringify({ action, ...payload });
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 25000);
  let r;
  try { r = await fetch(url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body, redirect: "follow", signal: controller.signal }); }
  catch (e) { clearTimeout(timeout); if (e.name === "AbortError") throw new Error("Timeout (25s)"); throw new Error("Falha de rede: " + e.message); }
  clearTimeout(timeout);
  if (!r.ok) throw new Error("HTTP " + r.status);
  const txt = await r.text();
  let data; try { data = JSON.parse(txt); } catch (e) { throw new Error("Resposta não-JSON (URL errada?): " + txt.slice(0, 120)); }
  if (!data.ok) throw new Error(data.error || "Erro desconhecido"); return data;
}
async function salvarNoSheets(silencioso = false, forcado = false) {
  try {
    if (!forcado && !state.orcamento.salvoNaNuvem) return null;
    if (!state.orcamento.numero && !state.orcamento.cliente) { if (!silencioso) toast("⚠️ Preencha Nº e/ou Cliente", false); return null; }
    atualizarStatusNuvem("sync"); if (!silencioso) toast("☁️ Salvando…");
    const r = await sheetsRequest("salvar", { id: state.orcamento.id || null, cliente: state.orcamento.cliente || "", numero: state.orcamento.numero || "", data: state.orcamento.data || "", vendedor: state.orcamento.vendedor || "", ambientes: state.ambientes || [], materiais: state.materiais || {}, composicoes: state.composicoes || {}, estrutura: state.estrutura || {}, params: state.params || {}, orcamento: state.orcamento || {} });
    if (r.id) state.orcamento.id = r.id; state.orcamento.salvoNaNuvem = true;
    try { state = normalizeState(state); localStorage.setItem("orcProQually_v19", JSON.stringify({ v: 19, savedAt: new Date().toISOString(), state })); } catch (e) {}
    atualizarStatusNuvem("ok"); if (!silencioso) toast("☁️ Salvo na nuvem (" + (r.acao || "ok") + ")"); return r;
  } catch (e) { atualizarStatusNuvem("err"); if (!silencioso) toast("Erro: " + e.message, true); return null; }
}
async function salvarTudo() { snapshotParaUndo(); salvarOrcamentoLocal(); await salvarNoSheets(false, true); await atualizarListaOrcamentos(); }
async function carregarDoSheets(id) {
  try {
    const r = await sheetsRequest("carregar", { id }); if (!r.projeto) throw new Error("Projeto vazio"); const p = r.projeto;
    const c = JSON.parse(JSON.stringify(state.composicoes)), m = JSON.parse(JSON.stringify(state.materiais)), par = JSON.parse(JSON.stringify(state.params)), e = JSON.parse(JSON.stringify(state.estrutura));
    state = normalizeState({ orcamento: { id: p.id, salvoNaNuvem: true, numero: p.numero || "", cliente: p.cliente || "", endereco: p.endereco || (p.orcamento && p.orcamento.endereco) || "", data: p.data || "", vendedor: p.vendedor || "", telefone: p.telefone || (p.orcamento && p.orcamento.telefone) || "", validade: 15, obs: "", status: "Aberto", desconto: p.desconto || (p.orcamento && p.orcamento.desconto) || 0 }, ambientes: p.ambientes || [], materiais: p.materiais || m, composicoes: p.composicoes || c, estrutura: p.estrutura || e, params: p.params || par });
    state.orcamento.id = p.id; invalidarCaches(); salvarOrcamentoLocal(); render(); toast("☁️ Carregado: " + (p.numero || p.id));
  } catch (e) { toast("Erro ao carregar: " + e.message, true); }
}
async function listarDoSheets() { const r = await sheetsRequest("listar"); return r.lista || []; }
async function excluirDoSheets(id) {
  if (!confirm("Excluir este projeto da nuvem?")) return;
  try { const r = await sheetsRequest("excluir", { id }); hist = hist.filter(h => h.id !== id && h.estado?.orcamento?.id !== id); saveHist(); toast(`🗑️ Excluído (${r.removidas || 0} linha(s))`); fecharModal(); abrirListaNuvem(); } catch (e) { toast("Erro: " + e.message, true); }
}
async function diagnosticoNuvem() {
  document.getElementById("modalRoot").innerHTML = `<div class="modal-bg" onclick="if(event.target===this)fecharModal()"><div class="modal"><h2 style="color:var(--acc2)">🩺 Diagnóstico da Nuvem</h2><p class="small"><b>URL configurada:</b><br><code style="font-size:10px;word-break:break-all">${escapeHtml(SHEETS_API)}</code></p><div id="diagBox"><p class="small">Testando…</p></div><button class="btn sec" style="margin-top:10px" onclick="fecharModal()">Fechar</button></div></div>`;
  const box = document.getElementById("diagBox"); let html = "";
  try { const t0 = Date.now(); await sheetsRequest("ping"); html += `<p class="pill ok">✔️ ping OK (${Date.now() - t0}ms)</p>`; } catch (e) { box.innerHTML = `<p class="pill err">❌ ping falhou: ${escapeHtml(e.message)}</p>`; atualizarStatusNuvem("err"); return; }
  try { const r = await sheetsRequest("listar"); html += `<p class="pill ${r.lista.length ? 'ok' : 'warn'}">${r.lista.length ? '✔️' : '⚠️'} listar: ${r.lista.length} projeto(s)</p>`; } catch (e) { html += `<p class="pill err">❌ listar: ${escapeHtml(e.message)}</p>`; }
  try { const r = await sheetsRequest("carregarTemplate"); if (r.template && r.template.savedAt) { html += `<p class="pill ok">✔️ template: salvo em ${new Date(r.template.savedAt).toLocaleString("pt-BR")}</p>`; } else { html += `<p class="pill warn">⚠️ template: não configurado</p>`; } } catch (e) { html += `<p class="pill err">❌ template: ${escapeHtml(e.message)}</p>`; }
  box.innerHTML = html; atualizarStatusNuvem("ok");
}
async function abrirListaNuvem() {
  toast("Carregando…"); let lista = [];
  try { lista = await listarDoSheets(); } catch (e) { document.getElementById("modalRoot").innerHTML = `<div class="modal-bg" onclick="if(event.target===this)fecharModal()"><div class="modal"><h2 style="color:var(--err)">❌ Erro ao conectar</h2><p><b>Mensagem:</b> ${escapeHtml(e.message)}</p><p class="small">Verifique:<br>• A URL termina com <code>/exec</code>?<br>• O Web App está publicado como <b>Qualquer pessoa</b>?<br>• Você autorizou o script na primeira execução?</p><button class="btn sec" onclick="fecharModal()">Fechar</button></div></div>`; atualizarStatusNuvem("err"); return; }
  if (!lista.length) { toast("Nenhum projeto na nuvem", false); return; }
  document.getElementById("modalRoot").innerHTML = `<div class="modal-bg" onclick="if(event.target===this)fecharModal()"><div class="modal"><div class="flex-between" style="margin-bottom:10px"><h2 style="color:var(--acc2);margin:0">📂 Projetos na Nuvem (${lista.length})</h2><button class="btn err sm" onclick="fecharModal()">✕</button></div><table><thead><tr><th>Nº</th><th>Cliente</th><th>Data</th><th>Atualizado</th><th></th></tr></thead><tbody>${lista.map(p => `<tr><td>${escapeHtml(p.numero || "-")}</td><td>${escapeHtml(p.cliente || "-")}</td><td>${fmtData(p.data)}</td><td class="small">${p.updated_at ? new Date(p.updated_at).toLocaleString("pt-BR") : "-"}</td><td><button class="btn sm" onclick="fecharModal();abrirOrcamento('${p.id}','nuvem')">📂 Abrir</button><button class="btn err sm" onclick="excluirDoSheets('${p.id}')">🗑️</button></td></tr>`).join("")}</tbody></table></div></div>`;
}
function atualizarStatusNuvem(status) {
  const el = document.getElementById("nuvemStatus"); if (!el) return;
  if (!SHEETS_API || SHEETS_API.includes("COLE SUA URL") || SHEETS_API.includes("👇")) { el.textContent = "☁️ URL não configurada"; el.style.color = "var(--warn)"; return; }
  if (status === "ok") { el.textContent = "☁️ Online"; el.style.color = "var(--ok)"; } else if (status === "err") { el.textContent = "☁️ Erro"; el.style.color = "var(--err)"; } else if (status === "sync") { el.textContent = "☁️ Sincronizando…"; el.style.color = "var(--warn)"; } else { el.textContent = "☁️ Offline"; el.style.color = "var(--muted)"; }
}
function fecharModal() { document.getElementById("modalRoot").innerHTML = ""; }

/* TEMPLATE */
async function salvarComoTemplate() { try { toast("☁️ Salvando template…"); const tpl = { savedAt: new Date().toISOString(), composicoes: state.composicoes, materiais: state.materiais, params: state.params, estrutura: state.estrutura }; await sheetsRequest("salvarTemplate", tpl); templateNuvem = tpl; atualizarStatusTemplate(); toast("✔️ Padrão salvo!"); } catch (e) { toast("Erro: " + e.message, true); } }
async function carregarTemplateDaNuvem() { try { toast("☁️ Baixando padrão…"); const r = await sheetsRequest("carregarTemplate"); if (!r.template) { toast("Nenhum padrão na nuvem", false); return; } templateNuvem = r.template; if (r.template.composicoes) state.composicoes = r.template.composicoes; if (r.template.materiais) state.materiais = r.template.materiais; if (r.template.params) state.params = r.template.params; if (r.template.estrutura) state.estrutura = r.template.estrutura; invalidarCaches(); save(); render(); atualizarStatusTemplate(); toast("✔️ Padrão carregado!"); } catch (e) { toast("Erro: " + e.message, true); } }
function restaurarFabrica() { if (!confirm("Restaurar de fábrica?")) return; snapshotParaUndo(); state.composicoes = JSON.parse(JSON.stringify(COMP_DEFAULT)); state.estrutura = JSON.parse(JSON.stringify(ESTRUTURA_DEFAULT)); state.materiais = JSON.parse(JSON.stringify(MAT_DEFAULT)); state.params = JSON.parse(JSON.stringify(PARAMS_DEFAULT)); invalidarCaches(); save(); render(); toast("↩️ Restaurado"); }
function atualizarStatusTemplate() { const el = document.getElementById("templateStatus"); if (!el) return; if (templateNuvem && templateNuvem.savedAt) { el.textContent = "⚙️ Padrão: " + new Date(templateNuvem.savedAt).toLocaleDateString("pt-BR"); el.className = "pill ok"; } else { el.textContent = "⚙️ Padrão: —"; el.className = "pill warn"; } }
async function carregarTemplateInicial() { try { const r = await sheetsRequest("carregarTemplate"); if (r.template) { templateNuvem = r.template; atualizarStatusTemplate(); } } catch (e) {} }

/* IMPORT / EXPORT */
function exportJSON() { const blob = new Blob([JSON.stringify({ state, hist }, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `orcamento-${state.orcamento.numero || "orc"}.json`; a.click(); }
function importJSON(e) { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { snapshotParaUndo(); const d = JSON.parse(r.result); if (d.state) { state = normalizeState(d.state); if (d.hist) { hist = d.hist; saveHist(); } } else { state = normalizeState(d); } state.orcamento.salvoNaNuvem = true; invalidarCaches(); save(); render(); toast("Importado!"); } catch (err) { toast("Inválido", true); } }; r.readAsText(f); }
function resetAll() { if (!confirm("Zerar TUDO?")) return; ["orcProQually_v19", "orcProQually_v18", "orcProQually_hist", "orcProQually_otim"].forEach(k => localStorage.removeItem(k)); state = novoEstado(); hist = []; _histUndo = []; _histRedo = []; invalidarCaches(); render(); toast("Zerado"); }

/* TABS */
document.querySelectorAll(".tabs .tab").forEach(t => {
  t.onclick = () => {
    document.querySelectorAll(".tabs .tab").forEach(x => x.classList.remove("on")); t.classList.add("on");
    ["orc","lista","comp","mat","view","res","proposta","compra","hist"].forEach(id => document.getElementById("tab-" + id).classList.toggle("hidden", id !== t.dataset.tab));
    if (t.dataset.tab === "lista") atualizarListaOrcamentos();
    if (t.dataset.tab === "view" && typeof viewer3D !== "undefined" && viewer3D.resize) { setTimeout(() => { viewer3D.resize(); viewer3D._buildAmbTabs && viewer3D._buildAmbTabs(); viewer3D.render(); }, 50); }
  };
});
document.addEventListener("click", e => { const t = e.target.closest("[data-cat]"); if (t) { matCatAtual = t.dataset.cat; document.querySelectorAll("[data-cat]").forEach(x => x.classList.toggle("on", x === t)); renderMateriais(); } });
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); salvarTudo(); }
  else if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
  else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
  else if ((e.ctrlKey || e.metaKey) && e.key === "p") { e.preventDefault(); imprimirAuto(); }
});

/* INIT */
load();
if (!state.orcamento.id) state.orcamento.id = gerarIdLocal();
if (!state.ambientes.length && !state.orcamento.numero) {
  state.ambientes.push({ id: uid(), nome: "Cozinha Exemplo", largura: 5000, altura: 800, profundidade: 500, visibilidade: "frente", corPerfil: "Branco", corVidro: "Incolor", vaos: [ { id: uid(), tipo: "gaveta", descricao: "Gaveteiro 3G", largura: 500, gavetasPortas: 3, temPrateleiras: false, qtdPrateleiras: 0, corPerfil: "Branco", corVidro: "Incolor" }, { id: uid(), tipo: "cristaleira", descricao: "Cristaleira", largura: 800, gavetasPortas: 2, temPrateleiras: true, qtdPrateleiras: 3, corPerfil: "Branco", corVidro: "Incolor" } ] });
  state.orcamento.numero = "ORC-001"; state.orcamento.cliente = "Cliente Exemplo";
}
save();
if (!hist.find(h => h.id === state.orcamento.id)) salvarOrcamentoLocal();
render();
setTimeout(() => { try { if (typeof viewer3D !== "undefined" && viewer3D.init) { viewer3D.init({ getState: () => state, onSnapshot: (msg) => toast(msg) }); viewer3D._buildAmbTabs && viewer3D._buildAmbTabs(); viewer3D.render(); } } catch (e) { console.warn("3D init falhou", e); } }, 150);
(async function bootNuvem() {
  atualizarStatusNuvem("off");
  if (!SHEETS_API || SHEETS_API.includes("COLE SUA URL") || SHEETS_API.includes("👇")) { console.warn("[OrçaProQually] SHEETS_API não configurada."); atualizarStatusNuvem("err"); return; }
  try { await sheetsRequest("ping"); atualizarStatusNuvem("ok"); await carregarTemplateInicial(); console.log("[OrçaProQually] Conectado à nuvem."); } catch (e) { atualizarStatusNuvem("err"); console.warn("[OrçaProQually] Nuvem indisponível:", e.message); }
})();
