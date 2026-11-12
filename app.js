/* =====================================================================
   OrçaProQually v8.3 — app.js (Corrigido e Funcional)
   Correções: tabs, funções ausentes, planos de corte, impressão,
   export/import, proteção viewer3D, proposta e compra reais.
   ===================================================================== */

"use strict";

const SHEETS_API = "https://script.google.com/macros/s/AKfycbx2AWxCNe8dPzerLJqHKLQ3HZx0ZLo5WPJnj8MedGwIey49AHgJnc5GZSqjQYp-8fyCBQ/exec";

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
      { matId: "p_montante", corte: "90/90", qtdFormula: "2", medidaFormula: "A", posicao: "Altura", condicao: "Sempre", obs: "Montante esquerdo/direito" },
      { matId: "p_tubo5050", corte: "90/90", qtdFormula: "2", medidaFormula: "L", posicao: "Largura", condicao: "Sempre", obs: "Travessa superior/inferior" }
    ],
    vidros: [{ matId: "v_temperado", qtdFormula: "1", alturaFormula: "A", larguraFormula: "L", condicao: "Sempre", obs: "Frente da gaveta" }],
    acm: [{ matId: "acm", qtdFormula: "1", alturaFormula: "A", larguraFormula: "L", condicao: "Sempre", obs: "Fundo" }],
    acess: [{ matId: "a_corredica", descricao: "Corrediça", qtdFormula: "N", condicao: "Sempre", obs: "1 por gaveta" }]
  },
  porta_simples: {
    perfis: [
      { matId: "p_montante", corte: "45/45", qtdFormula: "2", medidaFormula: "A", posicao: "Altura", condicao: "Sempre", obs: "Montante" },
      { matId: "p_tubo5050", corte: "45/45", qtdFormula: "2", medidaFormula: "L", posicao: "Largura", condicao: "Sempre", obs: "Travessa" }
    ],
    vidros: [{ matId: "v_temperado", qtdFormula: "1", alturaFormula: "A-10", larguraFormula: "L-10", condicao: "Sempre", obs: "Porta de vidro" }],
    acm: [],
    acess: [{ matId: "a_dobradica", descricao: "Dobradiça", qtdFormula: "SE(A > 500; 4; 2)", condicao: "Sempre", obs: "Baseado na altura" }]
  },
  cristaleira: {
    perfis: [{ matId: "p_montante", corte: "90/90", qtdFormula: "2", medidaFormula: "A", posicao: "Altura", condicao: "Sempre", obs: "Montante" }],
    vidros: [{ matId: "v_temperado", qtdFormula: "2", alturaFormula: "A", larguraFormula: "L/2", condicao: "Sempre", obs: "Portas" }],
    acm: [],
    acess: []
  }
};

const ESTRUTURA_DEFAULT = {
  perfis: [
    { matId: "p_tubo5050", corte: "90/90", qtdFormula: "2", medidaFormula: "L", posicao: "Largura", condicao: "Sempre", obs: "Base" },
    { matId: "p_montante", corte: "90/90", qtdFormula: "V+1", medidaFormula: "A", posicao: "Altura", condicao: "Sempre", obs: "Divisórias verticais" }
  ],
  vidros: [], acm: [], acess: []
};

const MAT_DEFAULT = {
  perfis: [
    { id: "p_montante", nome: "Perfil Montante", preco: 38 },
    { id: "p_tubo5050", nome: "Tubo 50x50", preco: 42 }
  ],
  vidros: [{ id: "v_temperado", nome: "Vidro Temperado", preco: 320 }],
  acm: [{ id: "acm", nome: "ACM Branco", preco: 145 }],
  acess: [
    { id: "a_dobradica", nome: "Dobradiça", preco: 6.5 },
    { id: "a_corredica", nome: "Corrediça", preco: 22 },
    { id: "a_puxador", nome: "Puxador", preco: 18 },
    { id: "a_suporte", nome: "Suporte", preco: 3.5 }
  ]
};

const PARAMS_DEFAULT = { chapaVidro: { w: 1600, h: 2200 }, chapaACM: { w: 1200, h: 5000 }, barraPerfil: 6000, kerf: 3, bdi: 30, frete: 0, instalacao: 0, imposto: 0 };

/* =====================================================================
   ESTADO E UTILITÁRIOS
   ===================================================================== */
let state = novoEstado();
let hist = [];
let templateNuvem = null;
let _ambCache = {};
let _globalCache = null;
let _statsCache = { hit: 0, miss: 0 };
let _histUndo = [], _histRedo = [];
let configOtimizador = { algoritmo: "auto", heuristica: "baf", girar: true };
let compTabAtual = "gaveta", compSubTab = "perfis", matCatAtual = "perfis";
let _viewerReady = false;

function gerarIdLocal() { return "LOCAL-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(); }
function uid() { return Math.random().toString(36).slice(2, 9); }
function fmt(v) { return (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function fmtData(d) { if (!d) return "—"; const s = String(d).trim(); const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) return `${m[3]}/${m[2]}/${m[1]}`; return s; }
function fmtN(v, d = 2) { return (v || 0).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }); }
function escapeHtml(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function toast(msg, err) { const t = document.getElementById("toast"); if (!t) return; t.textContent = msg; t.className = "toast show" + (err ? " err" : ""); setTimeout(() => { t.className = "toast"; }, 2400); }
function quickHash(obj) { const s = JSON.stringify(obj); let h = 5381; for (let i = 0; i < s.length; i++) { h = ((h << 5) + h) + s.charCodeAt(i); h = h | 0; } return h.toString(36) + "_" + s.length; }
function matById(id) { if (!state || !state.materiais) return null; for (const cat of Object.values(state.materiais)) { for (const m of cat) if (m.id === id) return m; } return null; }

function evalFormula(formula, vars) {
  if (formula === "" || formula == null) return 0;
  const novasVars = { ...vars, LM: (vars.L || 0) / 2, PM: (vars.P || 0) / 2, LM_D: ((vars.L || 0) / 2) - 25, PM_D: ((vars.P || 0) / 2) - 25, Math: Math };
  try {
    let expr = String(formula).replace(/\b(L|A|P|N|M|V|LM|PM|LM_D|PM_D)\b/g, ch => novasVars[ch] !== undefined ? novasVars[ch] : ch);
    let oldExpr;
    do { oldExpr = expr; expr = expr.replace(/(?:SE|se)\s*\(([^,;]+)[,;]([^,;]+)[,;]([^,;()]+(?:\([^)]*\))?[^,;()]*)\)/gi, '($1 ? $2 : $3)'); } while (expr !== oldExpr);
    expr = expr.replace(/(?:E|e)\s*\(([^;]+);\s*([^;)]+)\)/gi, '($1 && $2)');
    expr = expr.replace(/(?:OU|ou)\s*\(([^;]+);\s*([^;)]+)\)/gi, '($1 || $2)');
    expr = expr.replace(/;/g, ',');
    const v = Function("Math", `"use strict"; return (${expr});`)(Math);
    if (v === true) return 1;
    if (v === false) return 0;
    return isFinite(v) ? v : 0;
  } catch (e) { return 0; }
}

function corClass(cor) { return "pill " + (cor || "adefinir").toLowerCase().replace(/[^a-z]/g, ""); }
function corPill(cor, prefixo) { return `<span class="${corClass(cor)}">${escapeHtml((prefixo || "") + (cor || "A definir"))}</span>`; }

/* =====================================================================
   INICIALIZAÇÃO E PERSISTÊNCIA
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
  return { orcamento: orc, ambientes: Array.isArray(s.ambientes) ? s.ambientes : [], materiais: { ...base.materiais, ...(s.materiais || {}) }, composicoes: { ...base.composicoes, ...(s.composicoes || {}) }, estrutura: { ...base.estrutura, ...(s.estrutura || {}) }, params: { ...base.params, ...(s.params || {}) } };
}
function invalidarCaches() { _ambCache = {}; _globalCache = null; }
function invalidarCacheAmbiente(ambId) { delete _ambCache[ambId]; _globalCache = null; }
function saveLocalOnly() { try { state = normalizeState(state); localStorage.setItem("orcProQually_v19", JSON.stringify({ v: 19, savedAt: new Date().toISOString(), state })); const el = document.getElementById("sbAutosave"); if (el) el.textContent = "autosave: " + new Date().toLocaleTimeString("pt-BR"); } catch (e) {} }
function save() { saveLocalOnly(); }
function load() { try { const raw = localStorage.getItem("orcProQually_v19") || localStorage.getItem("orcProQually_v18"); if (raw) state = normalizeState(JSON.parse(raw).state || JSON.parse(raw)); else state = novoEstado(); const h = localStorage.getItem("orcProQually_hist"); hist = h ? (JSON.parse(h) || []) : []; } catch (e) { state = novoEstado(); hist = []; } }
function saveHist() { try { localStorage.setItem("orcProQually_hist", JSON.stringify(hist)); } catch (e) {} }
function salvarConfigOtimizador() { try { localStorage.setItem("orcProQually_otim", JSON.stringify(configOtimizador)); } catch (e) {} }

/* =====================================================================
   UNDO / REDO
   ===================================================================== */
function snapshotParaUndo() { try { const snap = JSON.stringify(state); if (_histUndo.length && _histUndo[_histUndo.length - 1] === snap) return; _histUndo.push(snap); if (_histUndo.length > 30) _histUndo.shift(); _histRedo = []; atualizarStatusUndo(); } catch (e) {} }
function undo() { if (_histUndo.length < 2) { toast("Nada para desfazer", true); return; } const atual = _histUndo.pop(); _histRedo.push(atual); state = normalizeState(JSON.parse(_histUndo[_histUndo.length - 1])); invalidarCaches(); saveLocalOnly(); render(); atualizarStatusUndo(); toast("↶ Desfeito"); }
function redo() { if (!_histRedo.length) { toast("Nada para refazer", true); return; } const prox = _histRedo.pop(); _histUndo.push(prox); state = normalizeState(JSON.parse(prox)); invalidarCaches(); saveLocalOnly(); render(); atualizarStatusUndo(); toast("↷ Refeito"); }
function atualizarStatusUndo() { const el = document.getElementById("sbUndo"); if (el) el.textContent = `undo: ${_histUndo.length} | redo: ${_histRedo.length}`; }
setInterval(() => { try { saveLocalOnly(); } catch (e) {} }, 30000);

/* =====================================================================
   MOTOR DE CÁLCULO
   ===================================================================== */
function calcularVao(vao, movel) {
  const comp = state.composicoes[vao.tipo] || { perfis: [], vidros: [], acm: [], acess: [] };
  const L = vao.largura ? +vao.largura : +movel.largura;
  const A = vao.altura_propria ? +vao.altura_propria : +movel.altura;
  const P = vao.profundidade_propria ? +vao.profundidade_propria : +movel.profundidade;
  const N = Math.max(1, +vao.gavetasPortas || 1);
  const vars = { L, A, P, N };
  const corPerfil = vao.corPerfil || "A definir", corVidro = vao.corVidro || "A definir";
  const resultado = { perfis: [], vidros: [], acm: [], acess: {}, custo: { perfis: 0, vidros: 0, acm: 0, acess: 0, total: 0 } };

  (comp.perfis || []).forEach(it => {
    const condVal = evalFormula(it.condicao, vars);
    if (it.condicao && it.condicao !== "Sempre" && condVal <= 0) return;
    const qtd = Math.round(evalFormula(it.qtdFormula, vars)); if (qtd <= 0) return;
    let baseVar = L; if (it.posicao === "Altura") baseVar = A; else if (it.posicao === "Profundidade") baseVar = P;
    const medidaFinal = evalFormula(it.medidaFormula, { ...vars, BASE: baseVar });
    for (let i = 0; i < qtd; i++) resultado.perfis.push({ matId: it.matId, comprimento: Math.max(0, Math.round(medidaFinal)), cor: corPerfil, corte: it.corte || "90/90", obs: it.obs });
  });

  (comp.vidros || []).forEach(it => {
    const condVal = evalFormula(it.condicao, vars);
    if (it.condicao && it.condicao !== "Sempre" && condVal <= 0) return;
    const qtd = Math.round(evalFormula(it.qtdFormula, vars)); if (qtd <= 0) return;
    const altFinal = evalFormula(it.alturaFormula, vars);
    const largFinal = evalFormula(it.larguraFormula, vars);
    for (let i = 0; i < qtd; i++) if (largFinal > 0 && altFinal > 0) resultado.vidros.push({ matId: it.matId, largura: Math.round(largFinal), altura: Math.round(altFinal), cor: corVidro, rotulo: it.obs || "" });
  });

  (comp.acm || []).forEach(it => {
    const condVal = evalFormula(it.condicao, vars);
    if (it.condicao && it.condicao !== "Sempre" && condVal <= 0) return;
    const qtd = Math.round(evalFormula(it.qtdFormula, vars)); if (qtd <= 0) return;
    const altFinal = evalFormula(it.alturaFormula, vars);
    const largFinal = evalFormula(it.larguraFormula, vars);
    for (let i = 0; i < qtd; i++) if (largFinal > 0 && altFinal > 0) resultado.acm.push({ matId: it.matId, largura: Math.round(largFinal), altura: Math.round(altFinal), cor: corVidro, rotulo: it.obs || "" });
  });

  (comp.acess || []).forEach(it => {
    const condVal = evalFormula(it.condicao, vars);
    if (it.condicao && it.condicao !== "Sempre" && condVal <= 0) return;
    const qtd = Math.round(evalFormula(it.qtdFormula, vars)); if (qtd <= 0) return;
    resultado.acess[it.matId] = (resultado.acess[it.matId] || 0) + qtd;
  });

  resultado.perfis.forEach(p => { const m = matById(p.matId); if (m) resultado.custo.perfis += (m.preco || 0) * (p.comprimento / 1000); });
  resultado.vidros.forEach(p => { const m = matById(p.matId); if (m) resultado.custo.vidros += (m.preco || 0) * (p.largura * p.altura / 1_000_000); });
  resultado.acm.forEach(p => { const m = matById(p.matId); if (m) resultado.custo.acm += (m.preco || 0) * (p.largura * p.altura / 1_000_000); });
  for (const [k, q] of Object.entries(resultado.acess)) { const m = matById(k); if (m) resultado.custo.acess += (m.preco || 0) * q; }
  resultado.custo.total = resultado.custo.perfis + resultado.custo.vidros + resultado.custo.acm + resultado.custo.acess;
  return resultado;
}

function calcularEstruturaAmbiente(amb) {
  const est = state.estrutura || ESTRUTURA_DEFAULT;
  const L = +amb.largura, A = +amb.altura, P = +amb.profundidade, V = (amb.vaos || []).length || 1;
  const vars = { L, A, P, V };
  const res = { perfis: [], vidros: [], acm: [], acess: {}, custo: { perfis: 0, vidros: 0, acm: 0, acess: 0, total: 0 } };
  const corPerfil = amb.corPerfil || "A definir";

  (est.perfis || []).forEach(it => {
    const condVal = evalFormula(it.condicao, vars);
    if (it.condicao && it.condicao !== "Sempre" && condVal <= 0) return;
    const qtd = Math.round(evalFormula(it.qtdFormula, vars)); if (qtd <= 0) return;
    let baseVar = L; if (it.posicao === "Altura") baseVar = A; else if (it.posicao === "Profundidade") baseVar = P;
    const medidaFinal = evalFormula(it.medidaFormula, { ...vars, BASE: baseVar });
    for (let i = 0; i < qtd; i++) res.perfis.push({ matId: it.matId, comprimento: Math.max(0, Math.round(medidaFinal)), cor: corPerfil, corte: it.corte });
  });

  res.perfis.forEach(p => { const m = matById(p.matId); if (m) res.custo.perfis += (m.preco || 0) * (p.comprimento / 1000); });
  res.custo.total = res.custo.perfis;
  return res;
}

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

function calcularTudo() {
  const keyGlobal = quickHash({ ambientes: state.ambientes, composicoes: state.composicoes, materiais: state.materiais, estrutura: state.estrutura, params: state.params, desconto: state.orcamento.desconto });
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

  g.custo = custo; g.custoDireto = custoDireto; g.bdiValor = bdiValor; g.impostoVal = impostoVal;
  g.subtotal = custoDireto + bdiValor + impostoVal + p.frete + p.instalacao;
  g.total = g.subtotal - (state.orcamento.desconto || 0);

  _globalCache = { key: keyGlobal, resultado: g };
  return g;
}

/* =====================================================================
   CORTES
   ===================================================================== */
function cortarPerfis(pecas) {
  const porChave = {};
  pecas.forEach(p => { if (!p || p.comprimento <= 0) return; const chave = p.matId + "|" + (p.cor || "A definir"); (porChave[chave] ||= []).push(p); });
  const resultado = {}, barra = state.params.barraPerfil, kerf = state.params.kerf || 0;

  for (const chave in porChave) {
    const [matId, cor] = chave.split("|");
    const comp = porChave[chave].slice().sort((a, b) => b.comprimento - a.comprimento);
    const barras = [];
    comp.forEach(p => {
      const c = p.comprimento;
      if (c > barra) { barras.push({ itens: [p], restante: 0, aviso: "maior que barra" }); return; }
      let colocada = false;
      for (const b of barras) { if (b.aviso) continue; const espacoNecessario = b.itens.length > 0 ? (c + kerf) : c; if (b.restante >= espacoNecessario) { b.itens.push(p); b.restante -= espacoNecessario; colocada = true; break; } }
      if (!colocada) barras.push({ itens: [p], restante: barra - c });
    });
    const total = comp.reduce((a, b) => a + b.comprimento, 0);
    resultado[chave] = { barras, totalPecas: comp.length, totalUsado: total, totalBarras: barras.length, metrosLineares: total / 1000, aproveitamento: barras.length ? (total / (barras.length * barra) * 100) : 0, nome: (matById(matId)?.nome || matId) + " — " + cor, cor, matId, comprimentoBarra: barra, kerf };
  }
  return resultado;
}

function cortarChapas(pecas, chapa, forcarAlgoritmo) {
  if (!pecas || !pecas.length) return { chapas: [], totalPecas: 0, areaTotal: 0, areaChapa: chapa.w * chapa.h, totalChapas: 0, aproveitamento: 0, chapaW: chapa.w, chapaH: chapa.h };
  const alg = forcarAlgoritmo || configOtimizador.algoritmo;
  const temMR = typeof MaxRects !== "undefined" && MaxRects && MaxRects.maxRects;
  if ((alg === "maxrects" || alg === "auto") && temMR) {
    try {
      const mr = MaxRects.maxRects(pecas, chapa, configOtimizador.heuristica, configOtimizador.girar);
      if (alg === "maxrects") return mr;
      const guil = cortarChapasGuilhotina(pecas, chapa);
      if (mr.totalChapas < guil.totalChapas) return mr;
      if (mr.totalChapas === guil.totalChapas && mr.aproveitamento > guil.aproveitamento + 0.01) return mr;
      return guil;
    } catch (e) { return cortarChapasGuilhotina(pecas, chapa); }
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
   SVG — PLANOS DE CORTE
   ===================================================================== */
function svgChapa(chapa, chapaW, chapaH, escala, titulo) {
  const w = chapaW * escala, h = chapaH * escala;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w + 20}" height="${h + 20}" viewBox="-10 -10 ${w + 20} ${h + 20}">`;
  svg += `<rect x="0" y="0" width="${w}" height="${h}" fill="#0a1526" stroke="#3b82f6" stroke-width="1.5"/>`;
  chapa.itens.forEach(it => {
    const x = it.x * escala, y = it.y * escala, iw = it.w * escala, ih = it.h * escala;
    const cor = it.aviso ? "#7f1d1d" : (it.rotacionado ? "#1e3a5f" : "#1e293b");
    svg += `<rect x="${x}" y="${y}" width="${iw}" height="${ih}" fill="${cor}" stroke="#64748b" stroke-width="0.5" rx="1"/>`;
    if (iw > 30 && ih > 12) {
      svg += `<text x="${x + iw / 2}" y="${y + ih / 2 + 3}" font-size="8" fill="#cbd5e1" text-anchor="middle" font-family="sans-serif">${Math.round(it.largura || it.w)}×${Math.round(it.altura || it.h)}</text>`;
    }
  });
  svg += `</svg>`;
  return `<div class="svg-wrap"><div class="plano-head"><span class="ph-title">${titulo}</span><span class="ph-meta">${chapaW}×${chapaH}mm</span></div>${svg}</div>`;
}

function renderPlanosCorte(g) {
  // Perfis
  const boxP = document.getElementById("cortePerfis");
  if (boxP) {
    const chaves = Object.keys(g.cortePerfis);
    if (!chaves.length) boxP.innerHTML = "<p class='small'>Sem peças de perfil.</p>";
    else boxP.innerHTML = chaves.map(chave => {
      const r = g.cortePerfis[chave];
      let html = `<div style="margin-bottom:14px"><b>${escapeHtml(r.nome)}</b> <span class="pill">${r.totalPecas} peças</span> <span class="pill ok">${r.totalBarras} barras</span> <span class="pill">${r.aproveitamento.toFixed(1)}%</span>`;
      r.barras.forEach((b, bi) => {
        html += `<div class="svg-wrap" style="display:block;width:100%;overflow-x:auto"><div class="plano-head"><span class="ph-title">Barra ${bi + 1} — ${r.comprimentoBarra}mm</span><span class="ph-meta">restante ${Math.round(b.restante)}mm</span></div>`;
        html += `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="40" viewBox="0 0 ${r.comprimentoBarra} 40" preserveAspectRatio="none">`;
        html += `<rect x="0" y="0" width="${r.comprimentoBarra}" height="40" fill="#0a1526" stroke="#3b82f6" stroke-width="2"/>`;
        let posX = 0;
        b.itens.forEach(it => {
          const c = it.comprimento;
          const cor = c > r.comprimentoBarra ? "#7f1d1d" : "#1e3a5f";
          html += `<rect x="${posX}" y="0" width="${c}" height="40" fill="${cor}" stroke="#64748b" stroke-width="1"/>`;
          if (c > 200) html += `<text x="${posX + c / 2}" y="24" font-size="14" fill="#e6edf7" text-anchor="middle" font-family="sans-serif">${c}</text>`;
          posX += c + (r.kerf || 0);
        });
        html += `</svg></div>`;
      });
      return html + "</div>";
    }).join("");
  }

  // Vidros e ACM (chapa)
  const renderChapaBox = (boxId, corteData, chapaW, chapaH) => {
    const box = document.getElementById(boxId);
    if (!box) return;
    if (!corteData || !corteData.chapas || !corteData.chapas.length) { box.innerHTML = "<p class='small'>Sem peças.</p>"; return; }
    const escala = Math.min(400 / chapaW, 300 / chapaH);
    box.innerHTML = `<p class="small" style="margin-bottom:6px"><b>${corteData.totalChapas}</b> chapas · Aproveitamento médio <b>${corteData.aproveitamento.toFixed(1)}%</b> · Algoritmo: ${corteData.algoritmo || "guilhotina"}</p>` +
      corteData.chapas.map((ch, i) => svgChapa(ch, corteData.chapaW, corteData.chapaH, escala, `Chapa ${i + 1}`)).join("");
  };
  renderChapaBox("corteVidros", g.corteVidros);
  renderChapaBox("corteACM", g.corteACM);

  // Acessórios
  const boxA = document.getElementById("listaAcess");
  if (boxA) {
    const entries = Object.entries(g.acess);
    if (!entries.length) boxA.innerHTML = "<p class='small'>Sem acessórios.</p>";
    else boxA.innerHTML = `<table><thead><tr><th>Acessório</th><th>Qtde</th><th>Preço Un.</th><th>Subtotal</th></tr></thead><tbody>${entries.map(([k, q]) => { const m = matById(k); return `<tr><td>${escapeHtml(m?.nome || k)}</td><td>${q}</td><td>${fmt(m?.preco || 0)}</td><td>${fmt((m?.preco || 0) * q)}</td></tr>`; }).join("")}</tbody></table>`;
  }

  // Comparação algoritmos (opcional)
  const boxCmp = document.getElementById("comparacaoAlgoritmos");
  if (boxCmp && g.corteVidros && g.corteVidros.chapas && g.corteVidros.chapas.length) {
    const guil = cortarChapasGuilhotina(g.vidros, state.params.chapaVidro);
    const temMR = typeof MaxRects !== "undefined" && MaxRects && MaxRects.maxRects;
    if (temMR) {
      const mr = MaxRects.maxRects(g.vidros, state.params.chapaVidro, configOtimizador.heuristica, configOtimizador.girar);
      boxCmp.innerHTML = `<div class="cmp-grid">
        <div class="cmp-col ${guil.totalChapas <= mr.totalChapas ? "winner" : ""}"><h4>Guilhotina</h4>
          <div class="cmp-kpi"><span>Chapas</span><b>${guil.totalChapas}</b></div>
          <div class="cmp-kpi"><span>Aproveitamento</span><b>${guil.aproveitamento.toFixed(1)}%</b></div></div>
        <div class="cmp-col ${mr.totalChapas <= guil.totalChapas ? "winner" : ""}"><h4>MaxRects (${configOtimizador.heuristica})</h4>
          <div class="cmp-kpi"><span>Chapas</span><b>${mr.totalChapas}</b></div>
          <div class="cmp-kpi"><span>Aproveitamento</span><b>${mr.aproveitamento.toFixed(1)}%</b></div></div>
      </div>`;
    } else boxCmp.innerHTML = "<p class='small'>MaxRects não disponível.</p>";
  }
}

/* =====================================================================
   RENDERIZAÇÃO DA INTERFACE
   ===================================================================== */
function renderVao(a, v) {
  const t = TIPOS_VAO[v.tipo] || { icone: "❓", nome: v.tipo };
  const isCristaleira = v.tipo === "cristaleira";
  const corP = v.corPerfil || "A definir";
  return `<div class="vao">
    <div class="flex-between">
      <div class="row">
        <span class="pill acc">${t.icone} ${t.nome}</span>
        <input value="${escapeHtml(v.descricao || '')}" onchange="upVao('${a.id}','${v.id}','descricao',this.value)" style="width:160px" placeholder="Descrição">
        <span class="pill">L ${v.largura}mm</span>
        <span class="pill ok">${fmt(v._custo?.total || 0)}</span>
      </div>
      <button class="btn err xs no-print" onclick="removeVao('${a.id}','${v.id}')">✕</button>
    </div>
    <div class="grid g4 no-print" style="margin-top:8px">
      <div><label>Tipo</label><select onchange="upVao('${a.id}','${v.id}','tipo',this.value)">
        ${Object.entries(TIPOS_VAO).map(([k, x]) => `<option value="${k}" ${v.tipo === k ? "selected" : ""}>${x.icone} ${x.nome}</option>`).join("")}
      </select></div>
      <div><label>Largura (mm)</label><input type="number" value="${v.largura}" onchange="upVao('${a.id}','${v.id}','largura',+this.value)"></div>
      ${isCristaleira ? `
        <div><label>Altura Própria (mm)</label><input type="number" value="${v.altura_propria || ''}" onchange="upVao('${a.id}','${v.id}','altura_propria',+this.value)" placeholder="Padrão"></div>
        <div><label>Prof. Própria (mm)</label><input type="number" value="${v.profundidade_propria || ''}" onchange="upVao('${a.id}','${v.id}','profundidade_propria',+this.value)" placeholder="Padrão"></div>
      ` : `
        <div><label>Nº Portas/Gavetas</label><input type="number" min="1" value="${v.gavetasPortas || 1}" onchange="upVao('${a.id}','${v.id}','gavetasPortas',+this.value)"></div>
        <div><label>Cor Perfil</label><select onchange="upVao('${a.id}','${v.id}','corPerfil',this.value)">${CORES_PERFIL.map(c => `<option value="${c}" ${corP === c ? "selected" : ""}>${c}</option>`).join("")}</select></div>
      `}
    </div>
    ${v._detalhe ? `<div class="mods"><span class="mod">🔩 ${v._detalhe.perfis.length} perfis</span><span class="mod">🪟 ${v._detalhe.vidros.length} vidros</span><span class="mod">🧱 ${v._detalhe.acm.length} ACM</span><span class="mod">🔧 ${Object.values(v._detalhe.acess).reduce((s, x) => s + x, 0)} acessórios</span></div>` : ""}
  </div>`;
}

function renderAmbientes() {
  const box = document.getElementById("listaAmb"); if (!box) return;
  if (!state.ambientes.length) { box.innerHTML = '<div class="card"><p class="small">Nenhum ambiente. Adicione um acima.</p></div>'; return; }
  const g = calcularTudo();
  box.innerHTML = state.ambientes.map(a => {
    const soma = (a.vaos || []).reduce((s, v) => s + (+v.largura || 0), 0), resta = a.largura - soma;
    const totEstrutura = g.porAmbiente[a.id]?.estrutura || 0;
    const totVaos = (g.porAmbiente[a.id]?.total - totEstrutura) || 0;
    const totGeral = g.porAmbiente[a.id]?.total || 0;
    const isL = a.tipo === "L";
    return `<div class="card">
      <div class="flex-between">
        <div class="row">
          <input value="${escapeHtml(a.nome)}" onchange="setAmb('nome',this.value,'${a.id}')" style="width:180px">
          <span class="pill">L ${a.largura}mm</span><span class="pill">A ${a.altura}mm</span><span class="pill">P ${a.profundidade}mm</span>
          <span class="pill ${resta < 0 ? 'err' : (resta === 0 ? 'ok' : 'warn')}">Livre: ${resta}mm</span>
          <span class="pill acc">${fmt(totGeral)}</span>
        </div>
        <div class="row no-print">
          <button class="btn sm" onclick="addVao('${a.id}')">+ Vão</button>
          <button class="btn err sm" onclick="removeAmbiente('${a.id}')">✕</button>
        </div>
      </div>
      <div class="grid g5 no-print" style="margin-top:8px;grid-template-columns:repeat(auto-fit,minmax(120px,1fr))">
        <div><label>Largura (mm)</label><input type="number" value="${a.largura}" onchange="setAmb('largura',+this.value,'${a.id}')"></div>
        <div><label>Altura (mm)</label><input type="number" value="${a.altura}" onchange="setAmb('altura',+this.value,'${a.id}')"></div>
        <div><label>Profundidade (mm)</label><input type="number" value="${a.profundidade}" onchange="setAmb('profundidade',+this.value,'${a.id}')"></div>
        <div><label>Tipo</label><select onchange="setAmb('tipo',this.value,'${a.id}')"><option value="reto" ${!isL ? 'selected' : ''}>Reto</option><option value="L" ${isL ? 'selected' : ''}>Em L</option></select></div>
        <div><label>Cor Perfil</label><select onchange="setAmb('corPerfil',this.value,'${a.id}')">${CORES_PERFIL.map(c => `<option value="${c}" ${a.corPerfil === c ? "selected" : ""}>${c}</option>`).join("")}</select></div>
      </div>
      ${isL ? `
        <div class="subcard" style="margin-top:10px; border-left-color:var(--warn)">
          <b>🔀 Ambiente em L (Perna 2)</b>
          <div class="grid g3" style="margin-top:8px">
            <div><label>Largura Perna 2 (mm)</label><input type="number" value="${a.largura_perna2 || 1000}" onchange="setAmb('largura_perna2',+this.value,'${a.id}')"></div>
            <div><label>Profundidade Perna 2 (mm)</label><input type="number" value="${a.profundidade_perna2 || a.profundidade}" onchange="setAmb('profundidade_perna2',+this.value,'${a.id}')"></div>
          </div>
        </div>
      ` : ""}
      <div class="subcard" style="margin-top:10px;border-left-color:var(--gold)">
        <div class="row flex-between"><div><b>🔩 Fechamentos / Estrutura</b></div><span class="pill warn">Custo: ${fmt(totEstrutura)}</span></div>
      </div>
      <div style="margin-top:10px">
        <p class="small" style="margin-bottom:5px">Vãos (Custo: ${fmt(totVaos)})</p>
        ${(a.vaos || []).map(v => renderVao(a, v)).join("") || '<p class="small">Sem vãos.</p>'}
      </div>
    </div>`;
  }).join("");
}

function renderEditorComposicoes() {
  const tabs = document.getElementById("tabsTipoVao"); if (!tabs) return;
  let htmlTabs = `<div class="tab ${compTabAtual === 'estrutura' ? "on" : ""}" onclick="compTabAtual='estrutura';compSubTab='perfis';renderEditorComposicoes()">🔩 ESTRUTURA</div>`;
  htmlTabs += Object.entries(TIPOS_VAO).map(([k, t]) => `<div class="tab ${compTabAtual === k ? "on" : ""}" onclick="compTabAtual='${k}';compSubTab='perfis';renderEditorComposicoes()">${t.icone} ${t.nome}</div>`).join("");
  tabs.innerHTML = htmlTabs;

  const editor = document.getElementById("editorTipoVao"); if (!editor) return;
  const isEst = compTabAtual === "estrutura";
  const comp = isEst ? state.estrutura : (state.composicoes[compTabAtual] || { perfis: [], vidros: [], acm: [], acess: [] });
  const itens = comp[compSubTab] || [];

  editor.innerHTML = `
    <div class="tabs-inner">
      <div class="tab ${compSubTab === 'perfis' ? 'on' : ''}" onclick="compSubTab='perfis';renderEditorComposicoes()">🔩 Perfis</div>
      <div class="tab ${compSubTab === 'vidros' ? 'on' : ''}" onclick="compSubTab='vidros';renderEditorComposicoes()">🪟 Vidros / ACM</div>
      <div class="tab ${compSubTab === 'acess' ? 'on' : ''}" onclick="compSubTab='acess';renderEditorComposicoes()">🔧 Acessórios</div>
    </div>
    ${renderCompTabela(compTabAtual, compSubTab, itens)}
    <p class="small" style="margin-top:10px">Variáveis: <b>L</b>(argura) · <b>A</b>(ltura) · <b>P</b>(rofundidade) · <b>N</b>(gavetas/portas) · <b>V</b>(nº vãos)</p>
    <button class="btn no-print" style="margin-top:10px" onclick="addItemComp()">+ Adicionar item</button>
  `;
}

function renderCompTabela(tipoVao, cat, itens) {
  if (!itens) itens = [];
  if (cat === "perfis") {
    return `<table><thead><tr><th>Perfil</th><th>Corte</th><th>Qtde/Fórmula</th><th>Medida/Fórmula</th><th>Posição</th><th>Condição</th><th>Obs</th><th></th></tr></thead><tbody>${itens.map((it, i) => `<tr>
      <td><select onchange="setCompItem('${tipoVao}','${cat}',${i},'matId',this.value)">${state.materiais.perfis.map(m => `<option value="${m.id}" ${it.matId === m.id ? "selected" : ""}>${escapeHtml(m.nome)}</option>`).join("")}</select></td>
      <td><select onchange="setCompItem('${tipoVao}','${cat}',${i},'corte',this.value)"><option value="90/90" ${it.corte === '90/90' ? 'selected' : ''}>90/90</option><option value="45/45" ${it.corte === '45/45' ? 'selected' : ''}>45/45</option><option value="90/45" ${it.corte === '90/45' ? 'selected' : ''}>90/45</option></select></td>
      <td><input value="${escapeHtml(it.qtdFormula || '')}" onchange="setCompItem('${tipoVao}','${cat}',${i},'qtdFormula',this.value)" placeholder="Ex: 2"></td>
      <td><input value="${escapeHtml(it.medidaFormula || '')}" onchange="setCompItem('${tipoVao}','${cat}',${i},'medidaFormula',this.value)" placeholder="Ex: A-20"></td>
      <td><select onchange="setCompItem('${tipoVao}','${cat}',${i},'posicao',this.value)"><option value="Largura" ${it.posicao === 'Largura' ? 'selected' : ''}>Largura</option><option value="Altura" ${it.posicao === 'Altura' ? 'selected' : ''}>Altura</option><option value="Profundidade" ${it.posicao === 'Profundidade' ? 'selected' : ''}>Profundidade</option></select></td>
      <td><input value="${escapeHtml(it.condicao || 'Sempre')}" onchange="setCompItem('${tipoVao}','${cat}',${i},'condicao',this.value)"></td>
      <td><input value="${escapeHtml(it.obs || '')}" onchange="setCompItem('${tipoVao}','${cat}',${i},'obs',this.value)"></td>
      <td><button class="btn err xs no-print" onclick="delCompItem('${tipoVao}','${cat}',${i})">✕</button></td>
    </tr>`).join("")}</tbody></table>`;
  }
  if (cat === "vidros" || cat === "acm") {
    return `<table><thead><tr><th>Material</th><th>Altura</th><th>Largura</th><th>Qtde</th><th>Condição</th><th>Obs</th><th></th></tr></thead><tbody>${itens.map((it, i) => `<tr>
      <td><select onchange="setCompItem('${tipoVao}','${cat}',${i},'matId',this.value)"><optgroup label="Vidros">${state.materiais.vidros.map(m => `<option value="${m.id}" ${it.matId === m.id ? "selected" : ""}>${escapeHtml(m.nome)}</option>`).join("")}</optgroup><optgroup label="ACM">${state.materiais.acm.map(m => `<option value="${m.id}" ${it.matId === m.id ? "selected" : ""}>${escapeHtml(m.nome)}</option>`).join("")}</optgroup></select></td>
      <td><input value="${escapeHtml(it.alturaFormula || '')}" onchange="setCompItem('${tipoVao}','${cat}',${i},'alturaFormula',this.value)" placeholder="Ex: A-10"></td>
      <td><input value="${escapeHtml(it.larguraFormula || '')}" onchange="setCompItem('${tipoVao}','${cat}',${i},'larguraFormula',this.value)" placeholder="Ex: L/2"></td>
      <td><input value="${escapeHtml(it.qtdFormula || '')}" onchange="setCompItem('${tipoVao}','${cat}',${i},'qtdFormula',this.value)"></td>
      <td><input value="${escapeHtml(it.condicao || 'Sempre')}" onchange="setCompItem('${tipoVao}','${cat}',${i},'condicao',this.value)"></td>
      <td><input value="${escapeHtml(it.obs || '')}" onchange="setCompItem('${tipoVao}','${cat}',${i},'obs',this.value)"></td>
      <td><button class="btn err xs no-print" onclick="delCompItem('${tipoVao}','${cat}',${i})">✕</button></td>
    </tr>`).join("")}</tbody></table>`;
  }
  if (cat === "acess") {
    return `<table><thead><tr><th>Acessório</th><th>Descrição</th><th>Qtde</th><th>Condição</th><th>Obs</th><th></th></tr></thead><tbody>${itens.map((it, i) => `<tr>
      <td><select onchange="setCompItem('${tipoVao}','${cat}',${i},'matId',this.value)">${state.materiais.acess.map(m => `<option value="${m.id}" ${it.matId === m.id ? "selected" : ""}>${escapeHtml(m.nome)}</option>`).join("")}</select></td>
      <td><input value="${escapeHtml(it.descricao || '')}" onchange="setCompItem('${tipoVao}','${cat}',${i},'descricao',this.value)"></td>
      <td><input value="${escapeHtml(it.qtdFormula || '')}" onchange="setCompItem('${tipoVao}','${cat}',${i},'qtdFormula',this.value)"></td>
      <td><input value="${escapeHtml(it.condicao || 'Sempre')}" onchange="setCompItem('${tipoVao}','${cat}',${i},'condicao',this.value)"></td>
      <td><input value="${escapeHtml(it.obs || '')}" onchange="setCompItem('${tipoVao}','${cat}',${i},'obs',this.value)"></td>
      <td><button class="btn err xs no-print" onclick="delCompItem('${tipoVao}','${cat}',${i})">✕</button></td>
    </tr>`).join("")}</tbody></table>`;
  }
  return "";
}

function setCompItem(t, c, i, k, v) { snapshotParaUndo(); if (t === "estrutura") state.estrutura[c][i][k] = v; else state.composicoes[t][c][i][k] = v; invalidarCaches(); save(); render(); }
function delCompItem(t, c, i) { snapshotParaUndo(); if (t === "estrutura") state.estrutura[c].splice(i, 1); else state.composicoes[t][c].splice(i, 1); invalidarCaches(); save(); render(); }
function addItemComp() {
  snapshotParaUndo(); const t = compTabAtual, cat = compSubTab;
  const def = { matId: (state.materiais[cat] && state.materiais[cat][0]?.id) || "" };
  if (cat === "perfis") { def.corte = "90/90"; def.qtdFormula = "1"; def.medidaFormula = "L"; def.posicao = "Largura"; def.condicao = "Sempre"; def.obs = ""; }
  if (cat === "vidros" || cat === "acm") { def.alturaFormula = "A"; def.larguraFormula = "L"; def.qtdFormula = "1"; def.condicao = "Sempre"; def.obs = ""; }
  if (cat === "acess") { def.descricao = "Novo"; def.qtdFormula = "1"; def.condicao = "Sempre"; def.obs = ""; }
  if (t === "estrutura") state.estrutura[cat].push(def); else state.composicoes[t][cat].push(def);
  invalidarCaches(); save(); render();
}

/* =====================================================================
   FUNÇÕES DE SUPORTE
   ===================================================================== */
function setOrc(k, v) { snapshotParaUndo(); state.orcamento[k] = v; if (k === "desconto") _globalCache = null; save(); render(); }
function setAmb(k, v, aid) { snapshotParaUndo(); const a = state.ambientes.find(x => x.id === aid); if (!a) return; a[k] = v; invalidarCacheAmbiente(aid); save(); render(); }
function addAmbiente() {
  snapshotParaUndo();
  const nomeEl = document.getElementById("nomeAmb"), LEl = document.getElementById("ambL"), AEl = document.getElementById("ambA"), PEl = document.getElementById("ambP");
  const nome = (nomeEl?.value || "").trim() || "Ambiente";
  const L = +(LEl?.value || 5000) || 5000;
  const A = +(AEl?.value || 800) || 800;
  const P = +(PEl?.value || 500) || 500;
  state.ambientes.push({ id: uid(), nome, largura: L, altura: A, profundidade: P, vaos: [], tipo: "reto", corPerfil: "Branco", corVidro: "Incolor" });
  invalidarCaches();
  if (nomeEl) nomeEl.value = "";
  save(); render();
}
function removeAmbiente(id) { if (!confirm("Remover este ambiente?")) return; snapshotParaUndo(); state.ambientes = state.ambientes.filter(a => a.id !== id); invalidarCacheAmbiente(id); save(); render(); }
function addVao(aid) {
  const amb = state.ambientes.find(a => a.id === aid); if (!amb) return;
  const usada = (amb.vaos || []).reduce((s, v) => s + (+v.largura || 0), 0);
  if (usada + 500 > amb.largura) { toast("Largura excede o ambiente", true); return; }
  snapshotParaUndo();
  amb.vaos = amb.vaos || [];
  amb.vaos.push({ id: uid(), tipo: "porta_simples", descricao: "Módulo", largura: 500, gavetasPortas: 1, corPerfil: amb.corPerfil || "A definir", corVidro: amb.corVidro || "A definir" });
  invalidarCacheAmbiente(aid); save(); render();
}
function removeVao(aid, vid) { snapshotParaUndo(); const amb = state.ambientes.find(a => a.id === aid); if (!amb) return; amb.vaos = (amb.vaos || []).filter(v => v.id !== vid); invalidarCacheAmbiente(aid); save(); render(); }
function upVao(aid, vid, key, val) { snapshotParaUndo(); const amb = state.ambientes.find(a => a.id === aid); if (!amb) return; const v = (amb.vaos || []).find(x => x.id === vid); if (!v) return; v[key] = val; invalidarCacheAmbiente(aid); save(); render(); }

function render() {
  // Campos do orçamento (protegidos)
  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v ?? ""; };
  setVal("orcNum", state.orcamento.numero);
  setVal("orcCli", state.orcamento.cliente);
  setVal("orcTel", state.orcamento.telefone);
  setVal("orcEnd", state.orcamento.endereco);
  setVal("orcData", state.orcamento.data);
  setVal("orcVend", state.orcamento.vendedor);
  setVal("orcVal", state.orcamento.validade ?? 15);
  setVal("orcObs", state.orcamento.obs);
  setVal("desc", state.orcamento.desconto || 0);

  const phN = document.getElementById("phNumero"), phD = document.getElementById("phData"), phC = document.getElementById("phCliente");
  if (phN) phN.textContent = state.orcamento.numero || "—";
  if (phD) phD.textContent = fmtData(state.orcamento.data);
  if (phC) phC.textContent = state.orcamento.cliente || "—";

  setVal("cv_w", state.params.chapaVidro.w);
  setVal("cv_h", state.params.chapaVidro.h);
  setVal("ca_w", state.params.chapaACM.w);
  setVal("ca_h", state.params.chapaACM.h);
  setVal("bp_l", state.params.barraPerfil);
  setVal("kerf", state.params.kerf);
  setVal("bdi", state.params.bdi);
  setVal("frete", state.params.frete);
  setVal("instal", state.params.instalacao);
  setVal("imp", state.params.imposto);

  renderAmbientes();
  renderEditorComposicoes();
  renderMateriais();
  const g = calcularTudo();
  renderResultado(g);
  renderProposta(g);
  renderCompra(g);
  renderHistorico();

  const sbInfo = document.getElementById("sbInfo");
  if (sbInfo) sbInfo.textContent = `Ambientes: ${state.ambientes.length} · Cache: ${_statsCache.hit} hit / ${_statsCache.miss} miss`;
  const sbCache = document.getElementById("sbCache");
  if (sbCache) sbCache.textContent = `cache: ${_statsCache.hit}/${_statsCache.hit + _statsCache.miss}`;

  // Viewer 3D — só atualiza se estiver inicializado
  if (_viewerReady && typeof viewer3D !== "undefined" && viewer3D._getState) {
    try {
      if (viewer3D._buildAmbTabs) viewer3D._buildAmbTabs();
      viewer3D.render();
    } catch (e) { console.warn("viewer3D update falhou:", e); }
  }
}

function renderMateriais() {
  const box = document.getElementById("editorMat"); if (!box) return;
  const arr = state.materiais[matCatAtual] || [];
  const u = { perfis: "R$/m", vidros: "R$/m²", acm: "R$/m²", acess: "R$/un" };
  box.innerHTML = `<table><thead><tr><th>Nome</th><th>Preço (${u[matCatAtual]})</th><th></th></tr></thead><tbody>${arr.map((m, i) => `<tr><td><input value="${escapeHtml(m.nome)}" onchange="setMat(${i},'nome',this.value)"></td><td><input type="number" step="0.01" value="${m.preco}" onchange="setMat(${i},'preco',+this.value)"></td><td><button class="btn err xs no-print" onclick="delMat(${i})">✕</button></td></tr>`).join("")}</tbody></table><button class="btn no-print" style="margin-top:10px" onclick="addMat()">+ Adicionar</button>`;
}
function setMat(i, k, v) { snapshotParaUndo(); state.materiais[matCatAtual][i][k] = v; invalidarCaches(); save(); render(); }
function delMat(i) { if (!confirm("Remover?")) return; snapshotParaUndo(); state.materiais[matCatAtual].splice(i, 1); invalidarCaches(); save(); render(); }
function addMat() { snapshotParaUndo(); const p = { perfis: "p_", vidros: "v_", acm: "acm_", acess: "a_" }[matCatAtual]; state.materiais[matCatAtual].push({ id: p + uid(), nome: "Novo", preco: 0 }); invalidarCaches(); save(); render(); }

function renderResultado(g) {
  const kpis = document.getElementById("kpis");
  if (kpis) kpis.innerHTML = `<div class="grid g4">
    <div class="kpi"><div class="l">Custo Direto</div><div class="v">${fmt(g.custoDireto)}</div></div>
    <div class="kpi"><div class="l">BDI (${state.params.bdi}%)</div><div class="v">${fmt(g.bdiValor)}</div></div>
    <div class="kpi"><div class="l">Impostos</div><div class="v">${fmt(g.impostoVal)}</div></div>
    <div class="kpi"><div class="l">Frete + Inst.</div><div class="v">${fmt(state.params.frete + state.params.instalacao)}</div></div>
    <div class="kpi"><div class="l">Desconto</div><div class="v">- ${fmt(state.orcamento.desconto)}</div></div>
    <div class="kpi" style="border-left-color:var(--ok)"><div class="l">TOTAL FINAL</div><div class="v tot">${fmt(g.total)}</div></div>
  </div>
  <table style="margin-top:12px"><tr><td>🔩 Perfis</td><td style="text-align:right">${fmt(g.custo.perfis)}</td></tr><tr><td>🪟 Vidros</td><td style="text-align:right">${fmt(g.custo.vidros)}</td></tr><tr><td>🧱 ACM</td><td style="text-align:right">${fmt(g.custo.acm)}</td></tr><tr><td>🔧 Acessórios</td><td style="text-align:right">${fmt(g.custo.acess)}</td></tr></table>`;

  const resumo = document.getElementById("resumoAmb");
  if (resumo) resumo.innerHTML = state.ambientes.map(a => {
    const t = g.porAmbiente[a.id] || { estrutura: 0, perfis: 0, vidros: 0, acm: 0, acess: 0, total: 0 };
    return `<div style="margin-bottom:16px"><p style="margin:0 0 6px 0"><b>🏠 ${escapeHtml(a.nome)}</b> — <span class="pill ok">${fmt(t.total)}</span></p><table><thead><tr><th>Módulo</th><th>Tipo</th><th>Cores</th><th style="text-align:right">Perfis</th><th style="text-align:right">Vidros/ACM</th><th style="text-align:right">Acess.</th><th style="text-align:right">Total</th></tr></thead><tbody><tr style="background:#1a2743"><td><b>ESTRUTURA BASE</b></td><td>Fechamento</td><td class="small">-</td><td style="text-align:right"><b>${fmt(t.estruturaPerfis)}</b></td><td style="text-align:right"><b>${fmt(t.estruturaVidrosACM)}</b></td><td style="text-align:right"><b>${fmt(t.estruturaAcess)}</b></td><td style="text-align:right"><b>${fmt(t.estrutura)}</b></td></tr>${(a.vaos || []).map(v => { const c = v._custo || { perfis: 0, vidros: 0, acm: 0, acess: 0, total: 0 }; return `<tr><td>${escapeHtml(v.descricao || "-")}</td><td>${(TIPOS_VAO[v.tipo] || {nome:v.tipo}).nome}</td><td class="small">${corPill(v.corPerfil || "A definir", "🔩 ")}</td><td style="text-align:right">${fmt(c.perfis)}</td><td style="text-align:right">${fmt(c.vidros + c.acm)}</td><td style="text-align:right">${fmt(c.acess)}</td><td style="text-align:right"><b>${fmt(c.total)}</b></td></tr>`; }).join("")}</tbody></table></div>`;
  }).join("") || '<p class="small">Sem dados.</p>';

  renderPlanosCorte(g);
}

function renderProposta(g) {
  const box = document.getElementById("propostaComercial"); if (!box) return;
  const orc = state.orcamento;
  const hoje = new Date();
  const validade = orc.validade || 15;
  const dtVal = new Date(hoje.getTime() + validade * 86400000);
  box.innerHTML = `
  <div class="client-box" style="border:1px solid var(--line);border-radius:10px;padding:20px;background:#0d1728">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap">
      <div>
        <h2 style="margin:0 0 4px 0;color:var(--acc2)">Proposta Comercial</h2>
        <p style="margin:0;color:var(--muted);font-size:12px">Orçamento nº ${escapeHtml(orc.numero || "—")} · ${fmtData(orc.data)}</p>
      </div>
      <div style="text-align:right;font-size:12px">
        <div><b>Validade:</b> ${fmtData(dtVal.toISOString().slice(0,10))}</div>
        <div><b>Vendedor:</b> ${escapeHtml(orc.vendedor || "—")}</div>
      </div>
    </div>
    <hr style="border-color:var(--line);margin:16px 0">
    <table>
      <tr><td><b>Cliente:</b></td><td>${escapeHtml(orc.cliente || "—")}</td></tr>
      <tr><td><b>Telefone:</b></td><td>${escapeHtml(orc.telefone || "—")}</td></tr>
      <tr><td><b>Endereço:</b></td><td>${escapeHtml(orc.endereco || "—")}</td></tr>
    </table>
    <h3 style="margin-top:16px;color:var(--gold)">Itens</h3>
    <table><thead><tr><th>Ambiente</th><th>Módulo</th><th>Tipo</th><th style="text-align:right">Valor</th></tr></thead><tbody>
    ${state.ambientes.map(a => (a.vaos || []).map(v => {
      const c = v._custo?.total || 0;
      return `<tr><td>${escapeHtml(a.nome)}</td><td>${escapeHtml(v.descricao || "-")}</td><td>${(TIPOS_VAO[v.tipo] || {nome:v.tipo}).nome}</td><td style="text-align:right">${fmt(c)}</td></tr>`;
    }).join("")).join("") || '<tr><td colspan="4">Sem itens</td></tr>'}
    </tbody></table>
    <div style="margin-top:16px;text-align:right;font-size:15px">
      <div>Subtotal: <b>${fmt(g.subtotal)}</b></div>
      <div>Desconto: <b>- ${fmt(orc.desconto || 0)}</b></div>
      <div style="font-size:22px;color:var(--ok);margin-top:6px"><b>Total: ${fmt(g.total)}</b></div>
    </div>
    ${orc.obs ? `<p style="margin-top:16px"><b>Observações:</b> ${escapeHtml(orc.obs)}</p>` : ""}
  </div>
  <div class="internal-box" style="display:none;border:1px dashed var(--warn);border-radius:10px;padding:20px;margin-top:16px">
    <h3 style="color:var(--warn)">Análise Interna</h3>
    <table>
      <tr><td>Custo Direto</td><td style="text-align:right">${fmt(g.custoDireto)}</td></tr>
      <tr><td>BDI (${state.params.bdi}%)</td><td style="text-align:right">${fmt(g.bdiValor)}</td></tr>
      <tr><td>Impostos (${state.params.imposto}%)</td><td style="text-align:right">${fmt(g.impostoVal)}</td></tr>
      <tr><td>Frete</td><td style="text-align:right">${fmt(state.params.frete)}</td></tr>
      <tr><td>Instalação</td><td style="text-align:right">${fmt(state.params.instalacao)}</td></tr>
      <tr><td>Desconto</td><td style="text-align:right">- ${fmt(orc.desconto || 0)}</td></tr>
      <tr><td><b>Total</b></td><td style="text-align:right"><b>${fmt(g.total)}</b></td></tr>
      <tr><td>Margem</td><td style="text-align:right">${g.total ? (((g.total - g.custoDireto) / g.total) * 100).toFixed(1) : 0}%</td></tr>
    </table>
  </div>`;
}

function renderCompra(g) {
  const box = document.getElementById("listaCompra"); if (!box) return;
  const linhas = [];
  // Perfis
  Object.entries(g.cortePerfis).forEach(([chave, r]) => {
    const m = matById(r.matId);
    linhas.push({ cat: "Perfil", nome: m?.nome || r.matId, cor: r.cor, qtde: `${r.totalBarras} barras`, preco: (m?.preco || 0) * r.totalBarras * (state.params.barraPerfil / 1000) });
  });
  Object.entries(g.custoVidrosPorTipo).forEach(([chave, r]) => {
    linhas.push({ cat: "Vidro", nome: r.nome, cor: r.cor, qtde: `${r.chapas} chapas`, preco: r.custo });
  });
  Object.entries(g.custoACMPorTipo).forEach(([chave, r]) => {
    linhas.push({ cat: "ACM", nome: r.nome, cor: r.cor, qtde: `${r.chapas} chapas`, preco: r.custo });
  });
  Object.entries(g.acess).forEach(([k, q]) => {
    const m = matById(k);
    linhas.push({ cat: "Acessório", nome: m?.nome || k, cor: "-", qtde: q, preco: (m?.preco || 0) * q });
  });
  const total = linhas.reduce((s, l) => s + l.preco, 0);
  box.innerHTML = `<table><thead><tr><th>Categoria</th><th>Material</th><th>Cor</th><th>Qtde</th><th style="text-align:right">Custo</th></tr></thead><tbody>${linhas.map(l => `<tr><td>${l.cat}</td><td>${escapeHtml(l.nome)}</td><td>${escapeHtml(l.cor)}</td><td>${l.qtde}</td><td style="text-align:right">${fmt(l.preco)}</td></tr>`).join("") || '<tr><td colspan="5">Sem itens</td></tr>'}</tbody><tfoot><tr><td colspan="4" style="text-align:right"><b>TOTAL</b></td><td style="text-align:right"><b>${fmt(total)}</b></td></tr></tfoot></table>`;
}

function renderHistorico() {
  const box = document.getElementById("listaHist"); if (!box) return;
  if (!hist.length) { box.innerHTML = "<p class='small'>Nenhum snapshot salvo.</p>"; return; }
  box.innerHTML = `<table><thead><tr><th>Data</th><th>Cliente</th><th>Nº</th><th>Total</th><th></th></tr></thead><tbody>${hist.slice().reverse().map((h, idx) => {
    const i = hist.length - 1 - idx;
    return `<tr><td>${new Date(h.data).toLocaleString("pt-BR")}</td><td>${escapeHtml(h.cliente || "-")}</td><td>${escapeHtml(h.numero || "-")}</td><td>${fmt(h.total || 0)}</td><td><button class="btn sec xs" onclick="carregarSnapshotHist(${i})">Carregar</button> <button class="btn err xs" onclick="delSnapshotHist(${i})">✕</button></td></tr>`;
  }).join("")}</tbody></table>`;
}

/* =====================================================================
   FUNÇÕES FALTANTES QUE O HTML CHAMA
   ===================================================================== */
function salvarTudo() { saveLocalOnly(); toast("💾 Salvo localmente"); }
function abrirListaNuvem() { toast("☁️ Nuvem não configurada nesta versão local"); }
function exportJSON() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `orcamento-${state.orcamento.numero || "sem-numero"}-${Date.now()}.json`;
  a.click(); toast("⬇️ Exportado");
}
function importJSON(ev) {
  const f = ev.target.files[0]; if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(reader.result);
      state = normalizeState(obj.state || obj);
      invalidarCaches(); save(); render(); toast("📂 Importado");
    } catch (e) { toast("Erro ao importar: " + e.message, true); }
  };
  reader.readAsText(f);
  ev.target.value = "";
}
function imprimirAuto() { window.print(); }
function resetAll() {
  if (!confirm("Zerar tudo? Irreversível.")) return;
  state = novoEstado(); hist = []; invalidarCaches(); save(); render(); toast("🗑️ Zerado");
}
function novoOrcamento() {
  if (!confirm("Criar novo orçamento?")) return;
  state = novoEstado();
  state.orcamento.numero = "ORC-" + String(Date.now()).slice(-6);
  invalidarCaches(); save(); render(); toast("➕ Novo orçamento");
}
function atualizarListaOrcamentos() {
  const box = document.getElementById("listaOrcamentos"); if (!box) return;
  box.innerHTML = `<p class="small">Orçamento atual: <b>${escapeHtml(state.orcamento.numero || "—")}</b> · ${escapeHtml(state.orcamento.cliente || "—")} · ${fmt(calcularTudo().total)}</p>`;
  const info = document.getElementById("infoOrcamentoAtual");
  if (info) info.innerHTML = `<p>ID: ${state.orcamento.id}<br>Nº: ${escapeHtml(state.orcamento.numero || "—")}<br>Cliente: ${escapeHtml(state.orcamento.cliente || "—")}<br>Ambientes: ${state.ambientes.length}<br>Status: ${escapeHtml(state.orcamento.status)}</p>`;
}
function salvarComoTemplate() { localStorage.setItem("orcProQually_template", JSON.stringify({ composicoes: state.composicoes, estrutura: state.estrutura, materiais: state.materiais, params: state.params })); toast("💾 Template salvo"); }
function carregarTemplateDaNuvem() {
  const raw = localStorage.getItem("orcProQually_template");
  if (!raw) { toast("Sem template local", true); return; }
  try { const t = JSON.parse(raw); state.composicoes = t.composicoes || state.composicoes; state.estrutura = t.estrutura || state.estrutura; state.materiais = t.materiais || state.materiais; state.params = t.params || state.params; invalidarCaches(); save(); render(); toast("☁️ Template carregado"); } catch (e) { toast("Erro ao carregar", true); }
}
function restaurarFabrica() {
  if (!confirm("Restaurar composições/materiais para o padrão?")) return;
  state.composicoes = JSON.parse(JSON.stringify(COMP_DEFAULT));
  state.estrutura = JSON.parse(JSON.stringify(ESTRUTURA_DEFAULT));
  state.materiais = JSON.parse(JSON.stringify(MAT_DEFAULT));
  state.params = JSON.parse(JSON.stringify(PARAMS_DEFAULT));
  invalidarCaches(); save(); render(); toast("↩️ Restaurado");
}
function salvarParams() {
  const get = id => document.getElementById(id);
  state.params.chapaVidro = { w: +get("cv_w")?.value || 1600, h: +get("cv_h")?.value || 2200 };
  state.params.chapaACM = { w: +get("ca_w")?.value || 1200, h: +get("ca_h")?.value || 5000 };
  state.params.barraPerfil = +get("bp_l")?.value || 6000;
  state.params.kerf = +get("kerf")?.value || 3;
  state.params.bdi = +get("bdi")?.value || 30;
  state.params.frete = +get("frete")?.value || 0;
  state.params.instalacao = +get("instal")?.value || 0;
  state.params.imposto = +get("imp")?.value || 0;
  invalidarCaches(); save(); render(); toast("💾 Parâmetros salvos");
}
function imprimirVisualizacao() {
  if (typeof viewer3D !== "undefined" && viewer3D.snapshot) viewer3D.snapshot(true);
  document.body.classList.add("printing-view");
  setTimeout(() => { window.print(); document.body.classList.remove("printing-view"); }, 200);
}
function imprimirResultado() {
  document.body.classList.add("printing-res");
  setTimeout(() => { window.print(); document.body.classList.remove("printing-res"); }, 200);
}
function imprimirSecao(id) {
  document.body.classList.add("printing-sec");
  const cards = document.querySelectorAll(".card.print-target");
  cards.forEach(c => { if (c.id !== id) c.style.display = "none"; });
  setTimeout(() => { window.print(); cards.forEach(c => { c.style.display = ""; }); document.body.classList.remove("printing-sec"); }, 200);
}
function exportarPlanosSVG() {
  toast("⬇️ SVG: use Ctrl+P → salvar como PDF");
  // Alternativa simples: não implementado
}
function imprimirPropostaCliente() {
  document.body.classList.add("printing-proposta-cliente");
  setTimeout(() => { window.print(); document.body.classList.remove("printing-proposta-cliente"); }, 200);
}
function imprimirPropostaInterna() {
  document.body.classList.add("printing-proposta-interna");
  setTimeout(() => { window.print(); document.body.classList.remove("printing-proposta-interna"); }, 200);
}
function exportCSV() {
  const g = calcularTudo();
  const linhas = [["Categoria","Material","Cor","Qtde","Custo"]];
  Object.entries(g.cortePerfis).forEach(([_, r]) => { const m = matById(r.matId); linhas.push(["Perfil", m?.nome || r.matId, r.cor, r.totalBarras + " barras", ((m?.preco||0) * r.totalBarras * (state.params.barraPerfil/1000)).toFixed(2)]); });
  Object.entries(g.custoVidrosPorTipo).forEach(([_, r]) => linhas.push(["Vidro", r.nome, r.cor, r.chapas + " chapas", r.custo.toFixed(2)]));
  Object.entries(g.custoACMPorTipo).forEach(([_, r]) => linhas.push(["ACM", r.nome, r.cor, r.chapas + " chapas", r.custo.toFixed(2)]));
  Object.entries(g.acess).forEach(([k,q]) => { const m = matById(k); linhas.push(["Acessório", m?.nome || k, "-", q, ((m?.preco||0)*q).toFixed(2)]); });
  const csv = linhas.map(l => l.map(x => `"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "lista-compra.csv"; a.click();
  toast("⬇️ CSV baixado");
}
function imprimirListaCompra() {
  document.body.classList.add("printing-compra");
  setTimeout(() => { window.print(); document.body.classList.remove("printing-compra"); }, 200);
}
function salvarOrcamento() {
  snapshotParaUndo();
  const g = calcularTudo();
  hist.push({ data: new Date().toISOString(), numero: state.orcamento.numero, cliente: state.orcamento.cliente, total: g.total, state: JSON.parse(JSON.stringify(state)) });
  saveHist(); renderHistorico(); toast("💾 Snapshot salvo");
}
function carregarSnapshotHist(i) {
  if (!hist[i]) return;
  if (!confirm("Carregar este snapshot? O estado atual será perdido.")) return;
  state = normalizeState(hist[i].state);
  invalidarCaches(); save(); render(); toast("Carregado");
}
function delSnapshotHist(i) {
  if (!confirm("Excluir snapshot?")) return;
  hist.splice(i, 1); saveHist(); renderHistorico();
}
function agendarSyncSheets() { /* vazio — nuvem desativada */ }

/* =====================================================================
   TABS — REGISTRO DE EVENTOS
   ===================================================================== */
function initTabs() {
  document.querySelectorAll(".tabs > .tab").forEach(tab => {
    tab.onclick = () => {
      const nome = tab.dataset.tab;
      if (!nome) return;
      document.querySelectorAll(".tabs > .tab").forEach(t => t.classList.remove("on"));
      tab.classList.add("on");
      document.querySelectorAll("main > section[id^='tab-']").forEach(s => s.classList.add("hidden"));
      const sec = document.getElementById("tab-" + nome);
      if (sec) sec.classList.remove("hidden");
      // Força renderização da seção específica
      if (nome === "lista") atualizarListaOrcamentos();
      if (nome === "res") { const g = calcularTudo(); renderResultado(g); }
      if (nome === "view" && _viewerReady && typeof viewer3D !== "undefined") { try { viewer3D._buildAmbTabs(); viewer3D.render(); } catch(e){} }
      if (nome === "compra") { const g = calcularTudo(); renderCompra(g); }
      if (nome === "proposta") { const g = calcularTudo(); renderProposta(g); }
      if (nome === "hist") renderHistorico();
    };
  });

  const tabsCatMat = document.getElementById("tabsCatMat");
  if (tabsCatMat) {
    tabsCatMat.querySelectorAll(".tab").forEach(t => {
      t.onclick = () => {
        tabsCatMat.querySelectorAll(".tab").forEach(x => x.classList.remove("on"));
        t.classList.add("on");
        matCatAtual = t.dataset.cat || "perfis";
        renderMateriais();
      };
    });
  }

  // Botões do viewer3D — registrados diretamente no viewer3D.init também
  // mas garantimos aqui caso o init ainda não tenha rodado
  document.querySelectorAll("#cameraPresets button").forEach(b => {
    b.onclick = () => { if (typeof viewer3D !== "undefined" && viewer3D.rotX !== undefined) {
      const map = { frontal:[0.05,0.05,1], iso:[-0.35,0.55,1], superior:[-1.1,0.05,1], lateral:[0.05,1.2,1] };
      const p = map[b.dataset.cam]; if (p) { viewer3D.rotX=p[0]; viewer3D.rotY=p[1]; viewer3D.zoom=p[2]; viewer3D.panX=0; viewer3D.panY=0; document.querySelectorAll("#cameraPresets button").forEach(x=>x.classList.remove("on")); b.classList.add("on"); viewer3D.render(); }
    }};
  });
  document.querySelectorAll("#modeGroup button[data-mode]").forEach(b => {
    b.onclick = () => { if (typeof viewer3D !== "undefined") { viewer3D.modo = b.dataset.mode; document.querySelectorAll("#modeGroup button[data-mode]").forEach(x=>x.classList.remove("on")); b.classList.add("on"); viewer3D.render(); } };
  });

  // Botões estáticos do viewer (já chamam funções do viewer3D inline)
  // btnOpaco, btnAutoRotate, btnCotas, btnFundo, btnExplosao — chamam viewer3D.*
}

/* =====================================================================
   INICIALIZAÇÃO FINAL
   ===================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  load();
  if (!state.orcamento.id) state.orcamento.id = gerarIdLocal();
  if (!state.ambientes.length && !state.orcamento.numero) {
    state.ambientes.push({
      id: uid(), nome: "Cozinha Exemplo", largura: 5000, altura: 800, profundidade: 500,
      vaos: [
        { id: uid(), tipo: "gaveta", descricao: "Gaveteiro", largura: 500, gavetasPortas: 3, corPerfil: "Branco", corVidro: "Incolor" },
        { id: uid(), tipo: "cristaleira", descricao: "Cristaleira", largura: 800, gavetasPortas: 2, corPerfil: "Branco", corVidro: "Incolor" }
      ],
      tipo: "reto", corPerfil: "Branco", corVidro: "Incolor"
    });
    state.orcamento.numero = "ORC-001";
    state.orcamento.cliente = "Cliente Exemplo";
  }
  save();
  initTabs();
  render();

  // Inicializa viewer3D depois do render inicial
  setTimeout(() => {
    if (typeof viewer3D !== "undefined" && viewer3D.init) {
      try {
        viewer3D.init({ getState: () => state });
        _viewerReady = true;
        viewer3D.render();
      } catch (e) { console.warn("viewer3D init falhou:", e); }
    }
  }, 150);

  // Atalhos
  document.addEventListener("keydown", e => {
    if (e.ctrlKey && e.key === "z") { e.preventDefault(); undo(); }
    if (e.ctrlKey && e.key === "y") { e.preventDefault(); redo(); }
    if (e.ctrlKey && e.key === "s") { e.preventDefault(); salvarTudo(); }
  });

  atualizarStatusUndo();
});
