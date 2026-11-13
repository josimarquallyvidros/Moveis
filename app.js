/* =====================================================================
   OrçaProQually v9.1 — app.js (parte 1/2)
   Correções: H→A nas fórmulas, acessórios+perfis completos da planilha,
   cor do vidro no vão, BA/RO/AC/V/DV no ambiente, 2 blocos em L.
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

const MAT_DEFAULT = {
  perfis: [
    { id: "p_montante", nome: "Montante MVA (1036)", preco: 38 },
    { id: "p_tubo5050", nome: "Tubo 50x50", preco: 42 },
    { id: "p_tubo5025", nome: "Tubo 50x25", preco: 28 },
    { id: "p_puxador_slim", nome: "Puxador Slim (64)", preco: 45 },
    { id: "p_puxador_gola", nome: "Puxador Gola (76)", preco: 40 },
    { id: "p_cantoneira_1_1_16", nome: "Cantoneira 1.1/16\"", preco: 22 },
    { id: "p_cantoneira_1_2", nome: "Cantoneira 1/2\"", preco: 12 }
  ],
  vidros: [
    { id: "v_temperado", nome: "Vidro Temperado", preco: 320 }
  ],
  acm: [
    { id: "acm", nome: "ACM Branco 4mm", preco: 145 }
  ],
  acess: [
    { id: "a_esquadreta", nome: "Esquadreta 41mm", preco: 0.9 },
    { id: "a_esq350_10", nome: "Conexão Allen 35x10", preco: 1.8 },
    { id: "a_rebite", nome: "Rebite 4x10", preco: 0.15 },
    { id: "a_acabamento_slim", nome: "Acabamento Slim", preco: 12 },
    { id: "a_acabamento_gola", nome: "Acabamento Gola", preco: 10 },
    { id: "a_parafuso_brocante", nome: "Parafuso Brocante 4,2x19", preco: 0.1 },
    { id: "a_corredica_300", nome: "Corrediça 300mm", preco: 22 },
    { id: "a_corredica_350", nome: "Corrediça 350mm", preco: 24 },
    { id: "a_corredica_400", nome: "Corrediça 400mm", preco: 26 },
    { id: "a_corredica_450", nome: "Corrediça 450mm", preco: 28 },
    { id: "a_corredica_500", nome: "Corrediça 500mm", preco: 30 },
    { id: "a_corredica_550", nome: "Corrediça 550mm", preco: 33 },
    { id: "a_dobradica", nome: "Dobradiça c/ amortecedor", preco: 8.5 },
    { id: "a_fita_dupla", nome: "Fita dupla face (m)", preco: 3.5 },
    { id: "a_silicone", nome: "Silicone Acético", preco: 12 },
    { id: "a_escorredor_570", nome: "Escorredor 570mm", preco: 120 },
    { id: "a_escorredor_670", nome: "Escorredor 670mm", preco: 140 },
    { id: "a_escorredor_770", nome: "Escorredor 770mm", preco: 165 },
    { id: "a_fixa_l_aereo", nome: "L Fixação aéreo", preco: 4.5 },
    { id: "a_rodizio_35", nome: "Rodízio 35mm", preco: 6 },
    { id: "a_rodizio_50", nome: "Rodízio 50mm", preco: 8 },
    { id: "a_rodizio_75", nome: "Rodízio 75mm", preco: 12 },
    { id: "a_parafuso_ciser", nome: "Parafuso Ciser 4,5x45", preco: 0.25 },
    { id: "a_bucha", nome: "Bucha nylon S-8", preco: 0.1 },
    { id: "a_lzinho", nome: "Lzinho prateleira", preco: 2.5 }
  ]
};

const PARAMS_DEFAULT = {
  chapaVidro: { w: 1600, h: 2200 },
  chapaACM: { w: 1200, h: 5000 },
  barraPerfil: 6000, kerf: 3, bdi: 30, frete: 0, instalacao: 0, imposto: 0
};

/* =====================================================================
   COMPOSIÇÕES PADRÃO (fórmulas da planilha — A = altura)
   ===================================================================== */
const COMP_DEFAULT = {
  gaveta: {
    perfis: [
      { matId: "p_montante", corte: "45/45", qtdFormula: "N", medidaFormula: "L-5", posicao: "Largura", condicao: "AC=1", obs: "Frente puxador slim" },
      { matId: "p_puxador_slim", corte: "90/90", qtdFormula: "N", medidaFormula: "L-FEV-115", posicao: "Largura", condicao: "AC=1", obs: "Puxador Slim" },
      { matId: "p_puxador_gola", corte: "45/45", qtdFormula: "N", medidaFormula: "L-5", posicao: "Largura", condicao: "AC=2", obs: "Puxador Gola" },
      { matId: "p_montante", corte: "45/45", qtdFormula: "N", medidaFormula: "L-5", posicao: "Largura", condicao: "Sempre", obs: "Gaveta frente" },
      { matId: "p_montante", corte: "45/45", qtdFormula: "N*2", medidaFormula: "(A-B-20-(5*(N-1)))/N", posicao: "Altura", condicao: "Sempre", obs: "Gaveta frente" },
      { matId: "p_montante", corte: "45/45", qtdFormula: "4", medidaFormula: "P-44", posicao: "Profundidade", condicao: "Sempre", obs: "Reforço" },
      { matId: "p_tubo5025", corte: "45/45", qtdFormula: "N-1", medidaFormula: "(A-B-20-(5*(N-1)))/N", posicao: "Altura", condicao: "N>1", obs: "Reforço" },
      { matId: "p_cantoneira_1_1_16", corte: "90/90", qtdFormula: "N*2", medidaFormula: "(((CC*50)+250)-15)", posicao: "Profundidade", condicao: "Sempre", obs: "Corrediça" },
      { matId: "p_cantoneira_1_2", corte: "90/90", qtdFormula: "N", medidaFormula: "L-55", posicao: "Largura", condicao: "Sempre", obs: "Frente" },
      { matId: "p_cantoneira_1_2", corte: "90/90", qtdFormula: "N*2", medidaFormula: "((A-B-20-(5*(N-1)))/N)-60", posicao: "Altura", condicao: "Sempre", obs: "Frente" }
    ],
    vidros: [
      { matId: "v_temperado", qtdFormula: "N", alturaFormula: "((A-B-20-(5*(N-1)))/N)-2", larguraFormula: "L-5-2", condicao: "Sempre", obs: "Gaveteiro frente" },
      { matId: "v_temperado", qtdFormula: "N", alturaFormula: "(((CC*50)+250)-15)", larguraFormula: "L-55", condicao: "Sempre", obs: "Base" },
      { matId: "v_temperado", qtdFormula: "N", alturaFormula: "((A-B-20-(5*(N-1)))/N)-60", larguraFormula: "L-55", condicao: "Sempre", obs: "Fundo" },
      { matId: "v_temperado", qtdFormula: "N*2", alturaFormula: "((A-B-20-(5*(N-1)))/N)-60", larguraFormula: "(((CC*50)+250)-15)", condicao: "Sempre", obs: "Lateral" }
    ],
    acm: [],
    acess: [
      { matId: "a_esquadreta", descricao: "Esquadreta", qtdFormula: "N*4", condicao: "Sempre", obs: "" },
      { matId: "a_esq350_10", descricao: "Conexão Allen", qtdFormula: "N*2", condicao: "Sempre", obs: "" },
      { matId: "a_rebite", descricao: "Rebite", qtdFormula: "N*8", condicao: "Sempre", obs: "" },
      { matId: "a_acabamento_slim", descricao: "Acab. Slim", qtdFormula: "N", condicao: "AC=1", obs: "" },
      { matId: "a_acabamento_gola", descricao: "Acab. Gola", qtdFormula: "N", condicao: "AC=2", obs: "" },
      { matId: "a_parafuso_brocante", descricao: "Parafuso Brocante", qtdFormula: "N*8", condicao: "Sempre", obs: "" },
      { matId: "a_corredica_300", descricao: "Corrediça 300", qtdFormula: "N", condicao: "CC=1", obs: "" },
      { matId: "a_corredica_350", descricao: "Corrediça 350", qtdFormula: "N", condicao: "CC=2", obs: "" },
      { matId: "a_corredica_400", descricao: "Corrediça 400", qtdFormula: "N", condicao: "CC=3", obs: "" },
      { matId: "a_corredica_450", descricao: "Corrediça 450", qtdFormula: "N", condicao: "CC=4", obs: "" },
      { matId: "a_corredica_500", descricao: "Corrediça 500", qtdFormula: "N", condicao: "CC=5", obs: "" },
      { matId: "a_corredica_550", descricao: "Corrediça 550", qtdFormula: "N", condicao: "CC=6", obs: "" },
      { matId: "a_fita_dupla", descricao: "Fita dupla face", qtdFormula: "(N*1100)/1000", condicao: "Sempre", obs: "" },
      { matId: "a_escorredor_570", descricao: "Escorredor 570", qtdFormula: "EC", condicao: "EC>0 AND P>=570 AND P<=869", obs: "" },
      { matId: "a_escorredor_770", descricao: "Escorredor 770", qtdFormula: "EC", condicao: "EC>0 AND P>=770", obs: "" }
    ]
  },
  gaveta_dupla: {
    perfis: [
      { matId: "p_montante", corte: "45/45", qtdFormula: "N", medidaFormula: "L-5", posicao: "Largura", condicao: "AC=1", obs: "Frente" },
      { matId: "p_puxador_slim", corte: "90/90", qtdFormula: "N", medidaFormula: "L-FEV-115", posicao: "Largura", condicao: "AC=1", obs: "" },
      { matId: "p_puxador_gola", corte: "45/45", qtdFormula: "N", medidaFormula: "L-5", posicao: "Largura", condicao: "AC=2", obs: "" },
      { matId: "p_montante", corte: "45/45", qtdFormula: "N", medidaFormula: "L-5", posicao: "Largura", condicao: "Sempre", obs: "Frente" },
      { matId: "p_montante", corte: "45/45", qtdFormula: "N*2", medidaFormula: "(A-B-20-(5*(N-1)))/N", posicao: "Altura", condicao: "Sempre", obs: "" },
      { matId: "p_montante", corte: "45/45", qtdFormula: "4", medidaFormula: "P-44", posicao: "Profundidade", condicao: "Sempre", obs: "Reforço" },
      { matId: "p_tubo5025", corte: "45/45", qtdFormula: "N-1", medidaFormula: "(A-B-20-(5*(N-1)))/N", posicao: "Altura", condicao: "N>1", obs: "" },
      { matId: "p_cantoneira_1_1_16", corte: "90/90", qtdFormula: "N*2", medidaFormula: "(((CC*50)+250)-15)", posicao: "Profundidade", condicao: "Sempre", obs: "" },
      { matId: "p_cantoneira_1_2", corte: "90/90", qtdFormula: "N", medidaFormula: "L-55", posicao: "Largura", condicao: "Sempre", obs: "" },
      { matId: "p_cantoneira_1_2", corte: "90/90", qtdFormula: "N*2", medidaFormula: "((A-B-20-(5*(N-1)))/N)-60", posicao: "Altura", condicao: "Sempre", obs: "" }
    ],
    vidros: [
      { matId: "v_temperado", qtdFormula: "N", alturaFormula: "((A-B-20-(5*(N-1)))/N)-2", larguraFormula: "L-5-2", condicao: "Sempre", obs: "Frente" },
      { matId: "v_temperado", qtdFormula: "N", alturaFormula: "(((CC*50)+250)-15)", larguraFormula: "L-55", condicao: "Sempre", obs: "Base" },
      { matId: "v_temperado", qtdFormula: "N", alturaFormula: "((A-B-20-(5*(N-1)))/N)-60", larguraFormula: "L-55", condicao: "Sempre", obs: "Fundo" },
      { matId: "v_temperado", qtdFormula: "N*2", alturaFormula: "((A-B-20-(5*(N-1)))/N)-60", larguraFormula: "(((CC*50)+250)-15)", condicao: "Sempre", obs: "Lateral" },
      { matId: "v_temperado", qtdFormula: "N", alturaFormula: "((((CC*50)+200)-15)/2)", larguraFormula: "L-55-30", condicao: "Sempre", obs: "Base dupla" },
      { matId: "v_temperado", qtdFormula: "N*2", alturaFormula: "(((A-B-20-(5*(N-1)))/N)-60)/2", larguraFormula: "L-55-30", condicao: "Sempre", obs: "Fundo/frente dupla" },
      { matId: "v_temperado", qtdFormula: "N*2", alturaFormula: "(((A-B-20-(5*(N-1)))/N)-60)/2", larguraFormula: "(((CC*50)+250)-15)", condicao: "Sempre", obs: "Lateral dupla" }
    ],
    acm: [],
    acess: [
      { matId: "a_esquadreta", descricao: "Esquadreta", qtdFormula: "N*4", condicao: "Sempre", obs: "" },
      { matId: "a_esq350_10", descricao: "Conexão Allen", qtdFormula: "N*2", condicao: "Sempre", obs: "" },
      { matId: "a_rebite", descricao: "Rebite", qtdFormula: "N*8", condicao: "Sempre", obs: "" },
      { matId: "a_acabamento_slim", descricao: "Acab. Slim", qtdFormula: "N", condicao: "AC=1", obs: "" },
      { matId: "a_acabamento_gola", descricao: "Acab. Gola", qtdFormula: "N", condicao: "AC=2", obs: "" },
      { matId: "a_parafuso_brocante", descricao: "Parafuso Brocante", qtdFormula: "N*8", condicao: "Sempre", obs: "" },
      { matId: "a_corredica_300", descricao: "Corrediça 300", qtdFormula: "N", condicao: "CC=1", obs: "" },
      { matId: "a_corredica_350", descricao: "Corrediça 350", qtdFormula: "N", condicao: "CC=2", obs: "" },
      { matId: "a_corredica_400", descricao: "Corrediça 400", qtdFormula: "N", condicao: "CC=3", obs: "" },
      { matId: "a_corredica_450", descricao: "Corrediça 450", qtdFormula: "N", condicao: "CC=4", obs: "" },
      { matId: "a_corredica_500", descricao: "Corrediça 500", qtdFormula: "N", condicao: "CC=5", obs: "" },
      { matId: "a_corredica_550", descricao: "Corrediça 550", qtdFormula: "N", condicao: "CC=6", obs: "" },
      { matId: "a_fita_dupla", descricao: "Fita dupla face", qtdFormula: "(N*1100)/1000", condicao: "Sempre", obs: "" }
    ]
  },
  lixeira: {
    perfis: [
      { matId: "p_puxador_slim", corte: "90/90", qtdFormula: "1", medidaFormula: "L-FEV-115", posicao: "Largura", condicao: "AC=1", obs: "" },
      { matId: "p_puxador_gola", corte: "45/45", qtdFormula: "1", medidaFormula: "L-5", posicao: "Largura", condicao: "AC=2", obs: "" },
      { matId: "p_montante", corte: "45/45", qtdFormula: "2", medidaFormula: "L-5", posicao: "Largura", condicao: "Sempre", obs: "" },
      { matId: "p_montante", corte: "45/45", qtdFormula: "1", medidaFormula: "A-B-20", posicao: "Altura", condicao: "Sempre", obs: "" },
      { matId: "p_montante", corte: "45/45", qtdFormula: "1", medidaFormula: "A-B-20", posicao: "Altura", condicao: "AC=1", obs: "" },
      { matId: "p_cantoneira_1_1_16", corte: "90/90", qtdFormula: "2", medidaFormula: "(((CC*50)+250)-15)", posicao: "Profundidade", condicao: "Sempre", obs: "" },
      { matId: "p_cantoneira_1_2", corte: "90/90", qtdFormula: "1", medidaFormula: "L-55", posicao: "Largura", condicao: "Sempre", obs: "" },
      { matId: "p_cantoneira_1_2", corte: "90/90", qtdFormula: "2", medidaFormula: "A-B-20-60", posicao: "Altura", condicao: "Sempre", obs: "" }
    ],
    vidros: [
      { matId: "v_temperado", qtdFormula: "1", alturaFormula: "A-B-20-2", larguraFormula: "L-5-2", condicao: "Sempre", obs: "Frente" },
      { matId: "v_temperado", qtdFormula: "1", alturaFormula: "(((CC*50)+250)-15)", larguraFormula: "L-55", condicao: "Sempre", obs: "Base" },
      { matId: "v_temperado", qtdFormula: "2", alturaFormula: "A-B-20-200", larguraFormula: "L-55", condicao: "Sempre", obs: "Fundo/frente" },
      { matId: "v_temperado", qtdFormula: "2", alturaFormula: "A-B-20-200", larguraFormula: "(((CC*50)+250)-15)", condicao: "Sempre", obs: "Lateral" }
    ],
    acm: [],
    acess: [
      { matId: "a_esquadreta", descricao: "Esquadreta", qtdFormula: "N*4", condicao: "Sempre", obs: "" },
      { matId: "a_rebite", descricao: "Rebite", qtdFormula: "N*8", condicao: "Sempre", obs: "" },
      { matId: "a_acabamento_slim", descricao: "Acab. Slim", qtdFormula: "N", condicao: "AC=1", obs: "" },
      { matId: "a_acabamento_gola", descricao: "Acab. Gola", qtdFormula: "N", condicao: "AC=2", obs: "" },
      { matId: "a_parafuso_brocante", descricao: "Parafuso Brocante", qtdFormula: "N*8", condicao: "Sempre", obs: "" },
      { matId: "a_corredica_300", descricao: "Corrediça 300", qtdFormula: "N", condicao: "CC=1", obs: "" },
      { matId: "a_corredica_350", descricao: "Corrediça 350", qtdFormula: "N", condicao: "CC=2", obs: "" },
      { matId: "a_corredica_400", descricao: "Corrediça 400", qtdFormula: "N", condicao: "CC=3", obs: "" },
      { matId: "a_corredica_450", descricao: "Corrediça 450", qtdFormula: "N", condicao: "CC=4", obs: "" },
      { matId: "a_corredica_500", descricao: "Corrediça 500", qtdFormula: "N", condicao: "CC=5", obs: "" },
      { matId: "a_corredica_550", descricao: "Corrediça 550", qtdFormula: "N", condicao: "CC=6", obs: "" },
      { matId: "a_fita_dupla", descricao: "Fita dupla face", qtdFormula: "(N*1100)/1000", condicao: "Sempre", obs: "" }
    ]
  },
  porta_tempero: {
    perfis: [
      { matId: "p_puxador_slim", corte: "90/90", qtdFormula: "1", medidaFormula: "L-FEV-115", posicao: "Largura", condicao: "AC=1", obs: "" },
      { matId: "p_puxador_gola", corte: "45/45", qtdFormula: "1", medidaFormula: "L-5", posicao: "Largura", condicao: "AC=2", obs: "" },
      { matId: "p_montante", corte: "45/45", qtdFormula: "2", medidaFormula: "L-5", posicao: "Largura", condicao: "Sempre", obs: "" },
      { matId: "p_montante", corte: "45/45", qtdFormula: "1", medidaFormula: "A-B-20", posicao: "Altura", condicao: "Sempre", obs: "" },
      { matId: "p_montante", corte: "45/45", qtdFormula: "1", medidaFormula: "A-B-20", posicao: "Altura", condicao: "AC=1", obs: "" },
      { matId: "p_cantoneira_1_1_16", corte: "90/90", qtdFormula: "2", medidaFormula: "(((CC*50)+250)-15)", posicao: "Profundidade", condicao: "Sempre", obs: "" },
      { matId: "p_cantoneira_1_2", corte: "90/90", qtdFormula: "2", medidaFormula: "L-55", posicao: "Largura", condicao: "Sempre", obs: "" },
      { matId: "p_cantoneira_1_2", corte: "90/90", qtdFormula: "4", medidaFormula: "A-B-20-60", posicao: "Altura", condicao: "Sempre", obs: "" }
    ],
    vidros: [
      { matId: "v_temperado", qtdFormula: "1", alturaFormula: "A-B-20-2", larguraFormula: "L-5", condicao: "Sempre", obs: "Frente" },
      { matId: "v_temperado", qtdFormula: "2", alturaFormula: "(((CC*50)+250)-15)", larguraFormula: "L-55", condicao: "Sempre", obs: "Base" },
      { matId: "v_temperado", qtdFormula: "4", alturaFormula: "(A-B-20-200)/4", larguraFormula: "L-55", condicao: "Sempre", obs: "Fundo/frente" },
      { matId: "v_temperado", qtdFormula: "4", alturaFormula: "(A-B-20-200)/4", larguraFormula: "(((CC*50)+250)-15)", condicao: "Sempre", obs: "Lateral" }
    ],
    acm: [],
    acess: [
      { matId: "a_esquadreta", descricao: "Esquadreta", qtdFormula: "N*4", condicao: "Sempre", obs: "" },
      { matId: "a_rebite", descricao: "Rebite", qtdFormula: "N*8", condicao: "Sempre", obs: "" },
      { matId: "a_acabamento_slim", descricao: "Acab. Slim", qtdFormula: "N", condicao: "AC=1", obs: "" },
      { matId: "a_acabamento_gola", descricao: "Acab. Gola", qtdFormula: "N", condicao: "AC=2", obs: "" },
      { matId: "a_parafuso_brocante", descricao: "Parafuso Brocante", qtdFormula: "N*8", condicao: "Sempre", obs: "" },
      { matId: "a_corredica_300", descricao: "Corrediça 300", qtdFormula: "N", condicao: "CC=1", obs: "" },
      { matId: "a_corredica_350", descricao: "Corrediça 350", qtdFormula: "N", condicao: "CC=2", obs: "" },
      { matId: "a_corredica_400", descricao: "Corrediça 400", qtdFormula: "N", condicao: "CC=3", obs: "" },
      { matId: "a_corredica_450", descricao: "Corrediça 450", qtdFormula: "N", condicao: "CC=4", obs: "" },
      { matId: "a_corredica_500", descricao: "Corrediça 500", qtdFormula: "N", condicao: "CC=5", obs: "" },
      { matId: "a_corredica_550", descricao: "Corrediça 550", qtdFormula: "N", condicao: "CC=6", obs: "" }
    ]
  },
  porta_simples: {
    perfis: [
      { matId: "p_puxador_slim", corte: "90/90", qtdFormula: "1", medidaFormula: "L-FEV-115", posicao: "Largura", condicao: "AC=1", obs: "" },
      { matId: "p_puxador_gola", corte: "45/45", qtdFormula: "1", medidaFormula: "L-5", posicao: "Largura", condicao: "AC=2", obs: "" },
      { matId: "p_montante", corte: "45/45", qtdFormula: "IIF(AC=1,2,1)", medidaFormula: "L-5", posicao: "Largura", condicao: "Sempre", obs: "Frente" },
      { matId: "p_montante", corte: "45/45", qtdFormula: "2", medidaFormula: "A-B-20", posicao: "Altura", condicao: "Sempre", obs: "Frente alt." },
      { matId: "p_montante", corte: "45/45", qtdFormula: "(QPR*2)", medidaFormula: "P-43", posicao: "Profundidade", condicao: "QPR>0", obs: "Prateleira" },
      { matId: "p_montante", corte: "45/45", qtdFormula: "(QPR*2)", medidaFormula: "L-19", posicao: "Largura", condicao: "QPR>0", obs: "Prateleira" }
    ],
    vidros: [
      { matId: "v_temperado", qtdFormula: "1", alturaFormula: "A-B-20-2", larguraFormula: "L-5-2", condicao: "Sempre", obs: "Porta individual frente" },
      { matId: "v_temperado", qtdFormula: "QPR", alturaFormula: "P-43-2", larguraFormula: "L-19-2", condicao: "QPR>0", obs: "Prateleira" }
    ],
    acm: [],
    acess: [
      { matId: "a_esquadreta", descricao: "Esquadreta", qtdFormula: "N*4", condicao: "Sempre", obs: "" },
      { matId: "a_rebite", descricao: "Rebite", qtdFormula: "N*8", condicao: "Sempre", obs: "" },
      { matId: "a_acabamento_slim", descricao: "Acab. Slim", qtdFormula: "N", condicao: "AC=1", obs: "" },
      { matId: "a_acabamento_gola", descricao: "Acab. Gola", qtdFormula: "N", condicao: "AC=2", obs: "" },
      { matId: "a_parafuso_brocante", descricao: "Parafuso Brocante", qtdFormula: "N*8", condicao: "Sempre", obs: "" },
      { matId: "a_dobradica", descricao: "Dobradiça", qtdFormula: "N*2", condicao: "Sempre", obs: "" },
      { matId: "a_dobradica", descricao: "Dobradiça extra", qtdFormula: "N", condicao: "A>900", obs: "" }
    ]
  },
  porta_dupla: {
    perfis: [
      { matId: "p_puxador_slim", corte: "90/90", qtdFormula: "2", medidaFormula: "(L-FEV/2)-115", posicao: "Largura", condicao: "AC=1", obs: "" },
      { matId: "p_puxador_gola", corte: "45/45", qtdFormula: "2", medidaFormula: "(L/2)-5", posicao: "Largura", condicao: "AC=2", obs: "" },
      { matId: "p_montante", corte: "45/45", qtdFormula: "IIF(AC=1,4,2)", medidaFormula: "(L/2)-5", posicao: "Largura", condicao: "Sempre", obs: "Frente" },
      { matId: "p_montante", corte: "45/45", qtdFormula: "4", medidaFormula: "A-B-20", posicao: "Altura", condicao: "Sempre", obs: "Frente alt." },
      { matId: "p_montante", corte: "45/45", qtdFormula: "(QPR*2)", medidaFormula: "P-43", posicao: "Profundidade", condicao: "QPR>0", obs: "Prateleira" },
      { matId: "p_montante", corte: "45/45", qtdFormula: "(QPR*2)", medidaFormula: "L-19", posicao: "Largura", condicao: "QPR>0", obs: "Prateleira" }
    ],
    vidros: [
      { matId: "v_temperado", qtdFormula: "1", alturaFormula: "A-B-20-2", larguraFormula: "(L/2)-5-2", condicao: "Sempre", obs: "Porta dupla frente" },
      { matId: "v_temperado", qtdFormula: "QPR", alturaFormula: "P-43-2", larguraFormula: "L-19-2", condicao: "QPR>0", obs: "Prateleira" }
    ],
    acm: [],
    acess: [
      { matId: "a_esquadreta", descricao: "Esquadreta", qtdFormula: "N*8", condicao: "Sempre", obs: "" },
      { matId: "a_rebite", descricao: "Rebite", qtdFormula: "N*8", condicao: "Sempre", obs: "" },
      { matId: "a_acabamento_slim", descricao: "Acab. Slim", qtdFormula: "N*2", condicao: "AC=1", obs: "" },
      { matId: "a_acabamento_gola", descricao: "Acab. Gola", qtdFormula: "N*2", condicao: "AC=2", obs: "" },
      { matId: "a_parafuso_brocante", descricao: "Parafuso Brocante", qtdFormula: "N*8", condicao: "Sempre", obs: "" },
      { matId: "a_dobradica", descricao: "Dobradiça", qtdFormula: "N*4", condicao: "Sempre", obs: "" },
      { matId: "a_dobradica", descricao: "Dobradiça extra", qtdFormula: "N", condicao: "A>900", obs: "" }
    ]
  },
  nicho: {
    perfis: [
      { matId: "p_montante", corte: "90/90", qtdFormula: "N*4", medidaFormula: "P-2", posicao: "Profundidade", condicao: "Sempre", obs: "" },
      { matId: "p_montante", corte: "90/90", qtdFormula: "4", medidaFormula: "L-19-2", posicao: "Largura", condicao: "Sempre", obs: "" }
    ],
    vidros: [
      { matId: "v_temperado", qtdFormula: "2", alturaFormula: "A-B-20-2", larguraFormula: "P-22-2", condicao: "Sempre", obs: "Lateral" },
      { matId: "v_temperado", qtdFormula: "1", alturaFormula: "P-22-2", larguraFormula: "L-10", condicao: "Sempre", obs: "Base" }
    ],
    acm: [],
    acess: [
      { matId: "a_esquadreta", descricao: "Esquadreta", qtdFormula: "N*8", condicao: "Sempre", obs: "" },
      { matId: "a_rebite", descricao: "Rebite", qtdFormula: "N*8", condicao: "Sempre", obs: "" },
      { matId: "a_lzinho", descricao: "Lzinho", qtdFormula: "N", condicao: "Sempre", obs: "" }
    ]
  },
  cristaleira: {
    perfis: [
      { matId: "p_montante", corte: "90/90", qtdFormula: "2", medidaFormula: "A", posicao: "Altura", condicao: "Sempre", obs: "Montante" }
    ],
    vidros: [
      { matId: "v_temperado", qtdFormula: "2", alturaFormula: "A", larguraFormula: "L/2", condicao: "Sempre", obs: "Portas" }
    ],
    acm: [],
    acess: [
      { matId: "a_acabamento_slim", descricao: "Acab. Slim", qtdFormula: "N", condicao: "AC=1", obs: "" },
      { matId: "a_acabamento_gola", descricao: "Acab. Gola", qtdFormula: "N", condicao: "AC=2", obs: "" }
    ]
  }
};

const ESTRUTURA_DEFAULT = {
  perfis: [
    { matId: "p_montante", corte: "45/45", qtdFormula: "4", medidaFormula: "L", posicao: "Largura", condicao: "Sempre", obs: "Largura estrutura" },
    { matId: "p_montante", corte: "45/45", qtdFormula: "4", medidaFormula: "A", posicao: "Altura", condicao: "Sempre", obs: "Altura estrutura" },
    { matId: "p_montante", corte: "90/90", qtdFormula: "4", medidaFormula: "P-90", posicao: "Profundidade", condicao: "Sempre", obs: "Profundidade" },
    { matId: "p_montante", corte: "90/90", qtdFormula: "(N*2)", medidaFormula: "P-90", posicao: "Profundidade", condicao: "Sempre", obs: "Profundidade gaveteiro" },
    { matId: "p_tubo5025", corte: "90/90", qtdFormula: "(NV-1)*2", medidaFormula: "((A-38)-B)", posicao: "Altura", condicao: "Sempre", obs: "Divisórias" },
    { matId: "p_tubo5050", corte: "45/45", qtdFormula: "2", medidaFormula: "L", posicao: "Largura", condicao: "B<>3", obs: "Base tubo" },
    { matId: "p_tubo5050", corte: "45/45", qtdFormula: "2", medidaFormula: "P-22", posicao: "Largura", condicao: "B<>3", obs: "Base tubo" }
  ],
  vidros: [
    { matId: "v_temperado", qtdFormula: "1", alturaFormula: "A-B-2", larguraFormula: "P-19-2", condicao: "V=2 OR V=3", obs: "Estrutura" },
    { matId: "v_temperado", qtdFormula: "2", alturaFormula: "A-B-2", larguraFormula: "P-19-2", condicao: "V>=4", obs: "Estrutura" },
    { matId: "v_temperado", qtdFormula: "1", alturaFormula: "A-B-2", larguraFormula: "L-2", condicao: "V=5", obs: "Estrutura frente" },
    { matId: "v_temperado", qtdFormula: "1", alturaFormula: "P-2", larguraFormula: "L-2", condicao: "V=5", obs: "Estrutura topo" }
  ],
  acm: [
    { matId: "acm", qtdFormula: "1", alturaFormula: "P", larguraFormula: "L", condicao: "Sempre", obs: "Revestimento" }
  ],
  acess: [
    { matId: "a_esquadreta", descricao: "Esquadreta estrutura", qtdFormula: "16", condicao: "Sempre", obs: "" },
    { matId: "a_esquadreta", descricao: "Esquadreta divisórias", qtdFormula: "((DV-1)*4)-((PT+PTD)*2)", condicao: "Sempre", obs: "" },
    { matId: "a_esq350_10", descricao: "Conexão Allen", qtdFormula: "8", condicao: "Sempre", obs: "" },
    { matId: "a_parafuso_ciser", descricao: "Parafuso Ciser", qtdFormula: "(L/250)*2", condicao: "Sempre", obs: "" },
    { matId: "a_bucha", descricao: "Bucha S-8", qtdFormula: "(L/250)*2", condicao: "Sempre", obs: "" },
    { matId: "a_fixa_l_aereo", descricao: "L fixação aéreo", qtdFormula: "NV*2", condicao: "BA=3", obs: "" },
    { matId: "a_rodizio_35", descricao: "Rodízio 35mm", qtdFormula: "ARREDONDA(L/800)*2", condicao: "RO=3", obs: "" },
    { matId: "a_rodizio_50", descricao: "Rodízio 50mm", qtdFormula: "(L/800)*2", condicao: "RO=2", obs: "" },
    { matId: "a_rodizio_75", descricao: "Rodízio 75mm", qtdFormula: "(L/800)*2", condicao: "RO=1", obs: "" },
    { matId: "a_silicone", descricao: "Silicone", qtdFormula: "2", condicao: "Sempre", obs: "" }
  ]
};

/* =====================================================================
   ESTADO
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
function quickHash(obj) { try { const s = JSON.stringify(obj); let h = 5381; for (let i = 0; i < s.length; i++) { h = ((h << 5) + h) + s.charCodeAt(i); h = h | 0; } return h.toString(36) + "_" + s.length; } catch (e) { return "err_" + Date.now(); } }
function matById(id) { if (!state || !state.materiais) return null; for (const cat of Object.values(state.materiais)) { for (const m of cat) if (m.id === id) return m; } return null; }

/* =====================================================================
   AVALIADOR DE FÓRMULAS
   ===================================================================== */
const VARS_CONHECIDAS = [
  "L","A","H","P","N","V","NV","BA","RO","AC","DV","G","PL","QN","PPT","PT","PTD","EC","QPR",
  "B","CC","FEV","FLE","FLD","FH","HFOL","LFOL","QTPORTA","GV",
  "LM","PM","LM_D","PM_D","BASE"
];
const REGEX_VARS = new RegExp("\\b(" + VARS_CONHECIDAS.slice().sort((a,b)=>b.length-a.length).join("|") + ")\\b", "g");

function evalFormula(formula, vars) {
  if (formula === "" || formula == null) return 0;
  if (typeof formula === "number") return formula;

  const base = { ...(vars || {}) };

  // Vars customizadas
  if (typeof state !== "undefined" && state && Array.isArray(state.varsExtras)) {
    state.varsExtras.forEach(vx => {
      if (vx && vx.nome && /^[A-Za-z_][A-Za-z0-9_]*$/.test(vx.nome)) {
        base[vx.nome] = isFinite(vx.valor) ? +vx.valor : (vx.valor || 0);
      }
    });
  }

  // Derivadas automáticas
  if (base.L != null && base.LM == null) base.LM = base.L / 2;
  if (base.P != null && base.PM == null) base.PM = base.P / 2;
  if (base.L != null && base.LM_D == null) base.LM_D = base.L / 2 - 25;
  if (base.P != null && base.PM_D == null) base.PM_D = base.P / 2 - 25;
  if (base.B == null) base.B = (base.BA === 3) ? 0 : 50;
  if (base.FEV == null) base.FEV = 5;
  if (base.CC == null && base.P != null) {
    const p = base.P;
    base.CC = (p >= 560 ? 1 : 0) + (p >= 510 ? 1 : 0) + (p >= 460 ? 1 : 0) + (p >= 410 ? 1 : 0) + (p >= 360 ? 1 : 0) + (p >= 310 ? 1 : 0);
  }

  try {
    let expr = String(formula);

    // IIF / SE / IF
    for (let k = 0; k < 6; k++) {
      const antes = expr;
      expr = expr.replace(/\b(?:SE|IIF|IF)\s*\(([^,;()]+(?:\([^)]*\))?[^,;()]*)[,;]([^,;()]+(?:\([^)]*\))?[^,;()]*)[,;]([^,;()]+(?:\([^)]*\))?[^,;()]*)\)/gi,
        (m, c, a, b) => `(${c} ? ${a} : ${b})`);
      if (expr === antes) break;
    }
    // AND / E
    for (let k = 0; k < 3; k++) {
      const antes = expr;
      expr = expr.replace(/\b(?:E|AND)\s*\(([^;]+);\s*([^;)]+)\)/gi, "($1 && $2)");
      if (expr === antes) break;
    }
    // OR / OU
    for (let k = 0; k < 3; k++) {
      const antes = expr;
      expr = expr.replace(/\b(?:OU|OR)\s*\(([^;]+);\s*([^;)]+)\)/gi, "($1 || $2)");
      if (expr === antes) break;
    }
    // ARREDONDA
    expr = expr.replace(/\bARREDONDA\s*\(([^()]+(?:\([^)]*\))?[^()]*)\)/gi, "Math.ceil($1)");
    // = -> ==
    expr = expr.replace(/([^<>!=])=([^=])/g, "$1==$2");
    // <> -> !=
    expr = expr.replace(/<>/g, "!=");

    expr = expr.replace(REGEX_VARS, (m) => (base[m] !== undefined ? base[m] : 0));
    expr = expr.replace(/;/g, ",");

    const v = Function("Math", `"use strict"; return (${expr});`)(Math);
    if (v === true) return 1;
    if (v === false) return 0;
    return isFinite(v) ? v : 0;
  } catch (e) {
    return 0;
  }
}

/* =====================================================================
   VARS DERIVADAS DO AMBIENTE
   ===================================================================== */
function calcularVarsAmbiente(amb) {
  const L = +amb.largura || 0;
  const H = +amb.altura || 0;
  const P = +amb.profundidade || 0;
  const BA = +amb.BA || 1;
  const RO = +amb.RO || 0;
  const AC = +amb.AC || 1;
  const G  = +amb.G  || 0;
  const PL = +amb.PL || 0;
  const QN = +amb.QN || 0;
  const PPT= +amb.PPT|| 0;
  const EC = +amb.EC || 0;
  const V  = +amb.V  || 1;   // V = visibilidade (1-5)

  // Derivadas dos vãos
  const vaos1 = amb.vaos || [];
  const vaos2 = amb.vaos_perna2 || [];
  const todos = [...vaos1, ...vaos2];

  const NV = todos.length || 1;   // NV = nº total de vãos
  const DV = NV;                   // DV = mesmo que NV (divisórias = vãos)
  const PT = todos.filter(v => v.tipo === "porta_simples" || v.tipo === "cristaleira").length;
  const PTD = todos.filter(v => v.tipo === "porta_dupla").length;

  const vv = { L, A: H, H, P, V, NV, DV, BA, RO, AC, G, PL, QN, PPT, PT, PTD, EC, QPR: 0 };
  vv.B = (BA === 3) ? 0 : 50;
  vv.CC = (P >= 560 ? 1 : 0) + (P >= 510 ? 1 : 0) + (P >= 460 ? 1 : 0) + (P >= 410 ? 1 : 0) + (P >= 360 ? 1 : 0) + (P >= 310 ? 1 : 0);
  vv.FLE = 10;
  vv.FLD = 10;
  vv.FEV = 5;
  vv.FH  = 20;
  vv.GV = PT + PTD;
  vv.HFOL = vv.GV > 0 ? ((H - 19 - vv.GV * 2) / vv.GV) : 0;
  vv.LFOL = L - 20;
  vv.QTPORTA = PL + PPT + PT + PTD;
  return vv;
}
/* =====================================================================
   AMBIENTE TEMPLATE / NORMALIZE / PERSISTÊNCIA
   ===================================================================== */
function ambienteTemplate(nome, L, A, P) {
  return {
    id: uid(), nome: nome || "Ambiente",
    tipo: "reto", corPerfil: "Branco", corVidro: "Incolor",
    largura: L || 5000, altura: A || 800, profundidade: P || 500, vaos: [],
    largura_perna2: 3000, altura_perna2: A || 800, profundidade_perna2: P || 500, vaos_perna2: [],
    BA: 1, RO: 2, AC: 1, V: 1, DV: 1,
    G: 0, PL: 0, QN: 0, PPT: 0, PT: 0, PTD: 0, EC: 0
  };
}

function novoEstado() {
  return {
    orcamento: {
      id: gerarIdLocal(), salvoNaNuvem: false, numero: "", cliente: "", telefone: "", endereco: "",
      data: new Date().toISOString().slice(0, 10), vendedor: "", validade: 15, obs: "", status: "Rascunho", desconto: 0
    },
    ambientes: [],
    materiais: JSON.parse(JSON.stringify(MAT_DEFAULT)),
    composicoes: JSON.parse(JSON.stringify(COMP_DEFAULT)),
    estrutura: JSON.parse(JSON.stringify(ESTRUTURA_DEFAULT)),
    params: JSON.parse(JSON.stringify(PARAMS_DEFAULT)),
    varsExtras: []
  };
}

function normalizeState(s) {
  const base = novoEstado();
  if (!s || typeof s !== "object") return base;
  const orc = { ...base.orcamento, ...(s.orcamento || {}) };
  if (!orc.id) orc.id = gerarIdLocal();
  if (orc.data && typeof orc.data === "string") { const m = orc.data.match(/^(\d{4}-\d{2}-\d{2})/); if (m) orc.data = m[1]; }
  const ambientes = Array.isArray(s.ambientes) ? s.ambientes : [];
  ambientes.forEach(a => {
    if (!a.id) a.id = uid();
    if (!a.vaos) a.vaos = [];
    if (!a.vaos_perna2) a.vaos_perna2 = [];
    if (a.largura_perna2 == null) a.largura_perna2 = 3000;
    if (a.altura_perna2 == null) a.altura_perna2 = a.altura || 800;
    if (a.profundidade_perna2 == null) a.profundidade_perna2 = a.profundidade || 500;
    if (a.DV == null) a.DV = (a.vaos || []).length || 1;
    ["BA","RO","AC","V","G","PL","QN","PPT","PT","PTD","EC"].forEach(k => {
      if (a[k] == null) a[k] = (k === "BA" || k === "AC") ? 1 : (k === "RO") ? 2 : 0;
    });
  });
  return {
    orcamento: orc,
    ambientes,
    materiais: { ...base.materiais, ...(s.materiais || {}) },
    composicoes: { ...base.composicoes, ...(s.composicoes || {}) },
    estrutura: { ...base.estrutura, ...(s.estrutura || {}) },
    params: { ...base.params, ...(s.params || {}) },
    varsExtras: Array.isArray(s.varsExtras) ? s.varsExtras : []
  };
}

function invalidarCaches() { _ambCache = {}; _globalCache = null; }
function invalidarCacheAmbiente(ambId) { delete _ambCache[ambId]; _globalCache = null; }
function saveLocalOnly() {
  try {
    state = normalizeState(state);
    localStorage.setItem("orcProQually_v21", JSON.stringify({ v: 21, savedAt: new Date().toISOString(), state }));
    const el = document.getElementById("sbAutosave");
    if (el) el.textContent = "autosave: " + new Date().toLocaleTimeString("pt-BR");
  } catch (e) {}
}
function save() { saveLocalOnly(); }
function load() {
  try {
    const raw = localStorage.getItem("orcProQually_v21") || localStorage.getItem("orcProQually_v20") || localStorage.getItem("orcProQually_v19");
    if (raw) state = normalizeState(JSON.parse(raw).state || JSON.parse(raw));
    else state = novoEstado();
    const h = localStorage.getItem("orcProQually_hist");
    hist = h ? (JSON.parse(h) || []) : [];
  } catch (e) { state = novoEstado(); hist = []; }
}
function saveHist() { try { localStorage.setItem("orcProQually_hist", JSON.stringify(hist)); } catch (e) {} }

/* =====================================================================
   UNDO / REDO
   ===================================================================== */
function snapshotParaUndo() { try { const snap = JSON.stringify(state); if (_histUndo.length && _histUndo[_histUndo.length - 1] === snap) return; _histUndo.push(snap); if (_histUndo.length > 30) _histUndo.shift(); _histRedo = []; atualizarStatusUndo(); } catch (e) {} }
function undo() { if (_histUndo.length < 2) { toast("Nada para desfazer", true); return; } const atual = _histUndo.pop(); _histRedo.push(atual); state = normalizeState(JSON.parse(_histUndo[_histUndo.length - 1])); invalidarCaches(); saveLocalOnly(); render(); atualizarStatusUndo(); toast("↶ Desfeito"); }
function redo() { if (!_histRedo.length) { toast("Nada para refazer", true); return; } const prox = _histRedo.pop(); _histUndo.push(prox); state = normalizeState(JSON.parse(prox)); invalidarCaches(); saveLocalOnly(); render(); atualizarStatusUndo(); toast("↷ Refeito"); }
function atualizarStatusUndo() { const el = document.getElementById("sbUndo"); if (el) el.textContent = `undo: ${_histUndo.length} | redo: ${_histRedo.length}`; }
setInterval(() => { try { saveLocalOnly(); } catch (e) {} }, 30000);

/* =====================================================================
   MOTOR DE CÁLCULO — VÃO
   ===================================================================== */
function calcularVao(vao, movel, varsAmb) {
  const comp = state.composicoes[vao.tipo] || { perfis: [], vidros: [], acm: [], acess: [] };
  const L = vao.largura ? +vao.largura : +movel.largura;
  const A = vao.altura_propria ? +vao.altura_propria : +movel.altura;
  const H = A;
  const P = vao.profundidade_propria ? +vao.profundidade_propria : +movel.profundidade;
  const N = Math.max(1, +vao.gavetasPortas || 1);

    const varsVao = {
    L, A, H, P, N,
    EC: +vao.EC || 0,
    QPR: +vao.QPR || 0,
    V: +(varsAmb?.V) || 1,          // V = visibilidade
    NV: +(varsAmb?.NV) || 1,        // NV = nº total de vãos
    AC: +(varsAmb?.AC) || 1,
    BA: +(varsAmb?.BA) || 1,
    RO: +(varsAmb?.RO) || 0,
    DV: +(varsAmb?.DV) || 1,
    PT: +(varsAmb?.PT) || 0,
    PTD: +(varsAmb?.PTD) || 0
  };
  varsVao.B = (varsVao.BA === 3) ? 0 : 50;
  varsVao.FEV = 5;
  varsVao.CC = (P >= 560 ? 1 : 0) + (P >= 510 ? 1 : 0) + (P >= 460 ? 1 : 0) + (P >= 410 ? 1 : 0) + (P >= 360 ? 1 : 0) + (P >= 310 ? 1 : 0);

  const vars = { ...(varsAmb || {}), ...varsVao };
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

/* =====================================================================
   MOTOR DE CÁLCULO — ESTRUTURA (2 blocos em L)
   ===================================================================== */
function calcularEstruturaBloco(L, A, P, NV, corPerfil, varsAmb) {
  const est = state.estrutura || ESTRUTURA_DEFAULT;
  const H = A;
  const vars = { ...(varsAmb || {}), L, A, H, P, NV: Math.max(1, NV), DV: Math.max(1, NV) };
  const res = { perfis: [], vidros: [], acm: [], acess: {}, custo: { perfis: 0, vidros: 0, acm: 0, acess: 0, total: 0 } };

  (est.perfis || []).forEach(it => {
    const condVal = evalFormula(it.condicao, vars);
    if (it.condicao && it.condicao !== "Sempre" && condVal <= 0) return;
    const qtd = Math.round(evalFormula(it.qtdFormula, vars)); if (qtd <= 0) return;
    let baseVar = L; if (it.posicao === "Altura") baseVar = A; else if (it.posicao === "Profundidade") baseVar = P;
    const medidaFinal = evalFormula(it.medidaFormula, { ...vars, BASE: baseVar });
    for (let i = 0; i < qtd; i++) res.perfis.push({ matId: it.matId, comprimento: Math.max(0, Math.round(medidaFinal)), cor: corPerfil, corte: it.corte });
  });

  (est.vidros || []).forEach(it => {
    const condVal = evalFormula(it.condicao, vars);
    if (it.condicao && it.condicao !== "Sempre" && condVal <= 0) return;
    const qtd = Math.round(evalFormula(it.qtdFormula, vars)); if (qtd <= 0) return;
    const altFinal = evalFormula(it.alturaFormula, vars);
    const largFinal = evalFormula(it.larguraFormula, vars);
    for (let i = 0; i < qtd; i++) if (largFinal > 0 && altFinal > 0) res.vidros.push({ matId: it.matId, largura: Math.round(largFinal), altura: Math.round(altFinal), cor: corPerfil, rotulo: it.obs || "" });
  });

  (est.acm || []).forEach(it => {
    const condVal = evalFormula(it.condicao, vars);
    if (it.condicao && it.condicao !== "Sempre" && condVal <= 0) return;
    const qtd = Math.round(evalFormula(it.qtdFormula, vars)); if (qtd <= 0) return;
    const altFinal = evalFormula(it.alturaFormula, vars);
    const largFinal = evalFormula(it.larguraFormula, vars);
    for (let i = 0; i < qtd; i++) if (largFinal > 0 && altFinal > 0) res.acm.push({ matId: it.matId, largura: Math.round(largFinal), altura: Math.round(altFinal), cor: corPerfil, rotulo: it.obs || "" });
  });

  (est.acess || []).forEach(it => {
    const condVal = evalFormula(it.condicao, vars);
    if (it.condicao && it.condicao !== "Sempre" && condVal <= 0) return;
    const qtd = Math.round(evalFormula(it.qtdFormula, vars)); if (qtd <= 0) return;
    res.acess[it.matId] = (res.acess[it.matId] || 0) + qtd;
  });

  res.perfis.forEach(p => { const m = matById(p.matId); if (m) res.custo.perfis += (m.preco || 0) * (p.comprimento / 1000); });
  res.vidros.forEach(p => { const m = matById(p.matId); if (m) res.custo.vidros += (m.preco || 0) * (p.largura * p.altura / 1_000_000); });
  res.acm.forEach(p => { const m = matById(p.matId); if (m) res.custo.acm += (m.preco || 0) * (p.largura * p.altura / 1_000_000); });
  for (const [k, q] of Object.entries(res.acess)) { const m = matById(k); if (m) res.custo.acess += (m.preco || 0) * q; }
  res.custo.total = res.custo.perfis + res.custo.vidros + res.custo.acm + res.custo.acess;
  return res;
}

function calcularEstruturaAmbiente(amb, varsAmb) {
  const vBase = varsAmb || calcularVarsAmbiente(amb);
  const corPerfil = amb.corPerfil || "A definir";
  const isL = amb.tipo === "L";

  const L1 = +amb.largura || 0, A1 = +amb.altura || 0, P1 = +amb.profundidade || 0;
  const vaos1 = amb.vaos || [];
  const NV1 = vaos1.length || 1;
  const v1 = {
    ...vBase,
    NV: NV1,
    DV: NV1,
    PT: vaos1.filter(v => v.tipo === "porta_simples" || v.tipo === "cristaleira").length,
    PTD: vaos1.filter(v => v.tipo === "porta_dupla").length
  };
  const bloco1 = calcularEstruturaBloco(L1, A1, P1, NV1, corPerfil, v1);

  let bloco2 = { perfis: [], vidros: [], acm: [], acess: {}, custo: { perfis: 0, vidros: 0, acm: 0, acess: 0, total: 0 } };
  if (isL) {
    const L2 = +amb.largura_perna2 || 0, A2 = +amb.altura_perna2 || A1, P2 = +amb.profundidade_perna2 || P1;
    const vaos2 = amb.vaos_perna2 || [];
    const NV2 = vaos2.length || 1;
    const v2 = {
      ...vBase,
      NV: NV2,
      DV: NV2,
      PT: vaos2.filter(v => v.tipo === "porta_simples" || v.tipo === "cristaleira").length,
      PTD: vaos2.filter(v => v.tipo === "porta_dupla").length
    };
    bloco2 = calcularEstruturaBloco(L2, A2, P2, NV2, corPerfil, v2);
  }

  const res = {
    perfis: [...bloco1.perfis, ...bloco2.perfis],
    vidros: [...bloco1.vidros, ...bloco2.vidros],
    acm: [...bloco1.acm, ...bloco2.acm],
    acess: {},
    custo: {
      perfis: bloco1.custo.perfis + bloco2.custo.perfis,
      vidros: bloco1.custo.vidros + bloco2.custo.vidros,
      acm: bloco1.custo.acm + bloco2.custo.acm,
      acess: bloco1.custo.acess + bloco2.custo.acess,
      total: bloco1.custo.total + bloco2.custo.total
    },
    bloco1, bloco2, isL
  };
  for (const [k, q] of Object.entries(bloco1.acess)) res.acess[k] = (res.acess[k] || 0) + q;
  for (const [k, q] of Object.entries(bloco2.acess)) res.acess[k] = (res.acess[k] || 0) + q;
  return res;
}

function calcAmbienteComCache(amb) {
  const varsAmb = calcularVarsAmbiente(amb);
  const dep = { amb, composicoes: state.composicoes, materiais: state.materiais, estrutura: state.estrutura, varsAmb };
  const key = quickHash(dep);
  const cached = _ambCache[amb.id];
  if (cached && cached.key === key) { _statsCache.hit++; return cached.resultado; }
  _statsCache.miss++;

  const isL = amb.tipo === "L";
  const est = calcularEstruturaAmbiente(amb, varsAmb);

  const totAmb = {
    estrutura: est.custo.total,
    estruturaPerfis: est.custo.perfis,
    estruturaVidrosACM: est.custo.vidros + est.custo.acm,
    estruturaAcess: est.custo.acess,
    estrutura1: est.bloco1.custo.total,
    estrutura2: est.bloco2.custo.total,
    perfis: 0, vidros: 0, acm: 0, acess: 0,
    total: 0,
    vaos1: 0, vaos2: 0
  };

  const P2 = isL ? (+amb.profundidade_perna2 || 0) : 0;
  const larguraUtil1 = isL ? Math.max(0, (+amb.largura || 0) - P2) : (+amb.largura || 0);
  const movelAdaptado1 = { ...amb, largura: larguraUtil1 };
  (amb.vaos || []).forEach(v => {
    const r = calcularVao(v, movelAdaptado1, varsAmb);
    v._custo = r.custo; v._detalhe = r;
    totAmb.perfis += r.custo.perfis; totAmb.vidros += r.custo.vidros; totAmb.acm += r.custo.acm; totAmb.acess += r.custo.acess;
    totAmb.vaos1 += r.custo.total;
  });

  if (isL) {
    const P1 = +amb.profundidade || 0;
    const larguraUtil2 = Math.max(0, (+amb.largura_perna2 || 0) - P1);
    const movelAdaptado2 = {
      ...amb,
      largura: larguraUtil2,
      altura: +amb.altura_perna2 || +amb.altura,
      profundidade: +amb.profundidade_perna2 || +amb.profundidade
    };
    (amb.vaos_perna2 || []).forEach(v => {
      const r = calcularVao(v, movelAdaptado2, varsAmb);
      v._custo = r.custo; v._detalhe = r;
      totAmb.perfis += r.custo.perfis; totAmb.vidros += r.custo.vidros; totAmb.acm += r.custo.acm; totAmb.acess += r.custo.acess;
      totAmb.vaos2 += r.custo.total;
    });
  }

  totAmb.total = est.custo.total + totAmb.vaos1 + totAmb.vaos2;

  _ambCache[amb.id] = { key, resultado: { est, totAmb, varsAmb } };
  return { est, totAmb, varsAmb };
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
      for (const b of barras) {
        if (b.aviso) continue;
        const esp = b.itens.length > 0 ? (c + kerf) : c;
        if (b.restante >= esp) { b.itens.push(p); b.restante -= esp; colocada = true; break; }
      }
      if (!colocada) barras.push({ itens: [p], restante: barra - c });
    });
    const total = comp.reduce((a, b) => a + b.comprimento, 0);
    resultado[chave] = { barras, totalPecas: comp.length, totalUsado: total, totalBarras: barras.length, metrosLineares: total / 1000, aproveitamento: barras.length ? (total / (barras.length * barra) * 100) : 0, nome: (matById(matId)?.nome || matId) + " — " + cor, cor, matId, comprimentoBarra: barra, kerf };
  }
  return resultado;
}

function cortarChapas(pecas, chapa, forcarAlgoritmo) {
  if (!pecas || !pecas.length) return { chapas: [], totalPecas: 0, areaTotal: 0, areaChapa: chapa.w * chapa.h, totalChapas: 0, aproveitamento: 0, chapaW: chapa.w, chapaH: chapa.h, algoritmo: "guilhotina" };
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
    if (enc) { const rw = enc.rot ? it.h : it.w; const rh = enc.rot ? it.w : it.h; ch.itens.push({ ...it, x: enc.slot.x, y: enc.slot.y, w: rw, h: rh }); dividirSlot(ch, enc.slot, it.w, it.h, enc.rot); }
    else { ch.itens.push({ ...it, x: 0, y: 0, w: it.w, h: it.h, aviso: "maior que chapa" }); }
    chapas.push(ch);
  });
  const areaTotal = items.reduce((s, i) => s + i.w * i.h, 0), areaChapa = chapa.w * chapa.h;
  return { chapas, totalPecas: items.length, areaTotal, areaChapa, totalChapas: chapas.length, aproveitamento: chapas.length ? (areaTotal / (chapas.length * areaChapa) * 100) : 0, chapaW: chapa.w, chapaH: chapa.h, algoritmo: "guilhotina" };
}

function calcularTudo() {
  try {
    const keyGlobal = quickHash({ ambientes: state.ambientes, composicoes: state.composicoes, materiais: state.materiais, estrutura: state.estrutura, params: state.params, desconto: state.orcamento.desconto, varsExtras: state.varsExtras });
    if (_globalCache && _globalCache.key === keyGlobal) return _globalCache.resultado;
    _statsCache = { hit: 0, miss: 0 };
    const g = { perfis: [], vidros: [], acm: [], acess: {}, porAmbiente: {} };
    state.ambientes.forEach(a => {
      const { est, totAmb } = calcAmbienteComCache(a);
      g.perfis.push(...est.perfis); g.vidros.push(...est.vidros); g.acm.push(...est.acm);
      for (const [k, q] of Object.entries(est.acess || {})) g.acess[k] = (g.acess[k] || 0) + q;
      (a.vaos || []).forEach(v => { if (v._detalhe) { g.perfis.push(...v._detalhe.perfis); g.vidros.push(...v._detalhe.vidros); g.acm.push(...v._detalhe.acm); for (const [k, q] of Object.entries(v._detalhe.acess || {})) g.acess[k] = (g.acess[k] || 0) + q; } });
      (a.vaos_perna2 || []).forEach(v => { if (v._detalhe) { g.perfis.push(...v._detalhe.perfis); g.vidros.push(...v._detalhe.vidros); g.acm.push(...v._detalhe.acm); for (const [k, q] of Object.entries(v._detalhe.acess || {})) g.acess[k] = (g.acess[k] || 0) + q; } });
      g.porAmbiente[a.id] = totAmb;
    });
    g.cortePerfis = cortarPerfis(g.perfis);
    g.corteVidros = cortarChapas(g.vidros, state.params.chapaVidro);
    g.corteACM    = cortarChapas(g.acm, state.params.chapaACM);
    const custo = { perfis: 0, vidros: 0, acm: 0, acess: 0 };
    for (const chave in g.cortePerfis) { const r = g.cortePerfis[chave]; const m = matById(r.matId); custo.perfis += r.totalBarras * (m?.preco || 0) * (state.params.barraPerfil / 1000); }
    g.custoVidrosPorTipo = {};
    const vpc = {};
    g.vidros.forEach(v => { const chave = v.matId + "|" + (v.cor || "A definir"); (vpc[chave] ||= []).push(v); });
    for (const chave in vpc) { const [matId, cor] = chave.split("|"); const r = cortarChapas(vpc[chave], state.params.chapaVidro); const m = matById(matId); g.custoVidrosPorTipo[chave] = { chapas: r.totalChapas, aproveitamento: r.aproveitamento, custo: r.totalChapas * (m?.preco || 0), nome: m?.nome || matId, cor, matId }; custo.vidros += g.custoVidrosPorTipo[chave].custo; }
    g.custoACMPorTipo = {};
    const apc = {};
    g.acm.forEach(v => { const chave = v.matId + "|" + (v.cor || "A definir"); (apc[chave] ||= []).push(v); });
    for (const chave in apc) { const [matId, cor] = chave.split("|"); const r = cortarChapas(apc[chave], state.params.chapaACM); const m = matById(matId); g.custoACMPorTipo[chave] = { chapas: r.totalChapas, aproveitamento: r.aproveitamento, custo: r.totalChapas * (m?.preco || 0), nome: m?.nome || matId, cor, matId }; custo.acm += g.custoACMPorTipo[chave].custo; }
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
  } catch (e) {
    console.error("calcularTudo falhou:", e);
    return { perfis: [], vidros: [], acm: [], acess: {}, porAmbiente: {}, cortePerfis: {}, corteVidros: { chapas: [], totalChapas: 0, aproveitamento: 0, chapaW: 0, chapaH: 0 }, corteACM: { chapas: [], totalChapas: 0, aproveitamento: 0, chapaW: 0, chapaH: 0 }, custoVidrosPorTipo: {}, custoACMPorTipo: {}, custo: { perfis: 0, vidros: 0, acm: 0, acess: 0 }, custoDireto: 0, bdiValor: 0, impostoVal: 0, subtotal: 0, total: 0 };
  }
}

/* === FIM DA PARTE 1 — CONTINUA NA PARTE 2 === */
/* =====================================================================
   SVG — PLANOS DE CORTE
   ===================================================================== */
function svgChapa(chapa, chapaW, chapaH, escala, titulo) {
  const w = chapaW * escala, h = chapaH * escala;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w + 20}" height="${h + 20}" viewBox="-10 -10 ${w + 20} ${h + 20}">`;
  svg += `<rect x="0" y="0" width="${w}" height="${h}" fill="#0a1526" stroke="#3b82f6" stroke-width="1.5"/>`;
  (chapa.itens || []).forEach(it => {
    const x = it.x * escala, y = it.y * escala, iw = it.w * escala, ih = it.h * escala;
    const cor = it.aviso ? "#7f1d1d" : "#1e293b";
    svg += `<rect x="${x}" y="${y}" width="${iw}" height="${ih}" fill="${cor}" stroke="#64748b" stroke-width="0.5" rx="1"/>`;
    if (iw > 30 && ih > 12) svg += `<text x="${x + iw / 2}" y="${y + ih / 2 + 3}" font-size="8" fill="#cbd5e1" text-anchor="middle" font-family="sans-serif">${Math.round(it.largura || it.w)}×${Math.round(it.altura || it.h)}</text>`;
  });
  svg += `</svg>`;
  return `<div class="svg-wrap"><div class="plano-head"><span class="ph-title">${titulo}</span><span class="ph-meta">${chapaW}×${chapaH}mm</span></div>${svg}</div>`;
}

function renderPlanosCorte(g) {
  if (!g) return;

  // Perfis
  const boxP = document.getElementById("cortePerfis");
  if (boxP) {
    const chaves = Object.keys(g.cortePerfis || {});
    if (!chaves.length) {
      boxP.innerHTML = "<p class='small'>Sem peças de perfil para cortar.</p>";
    } else {
      boxP.innerHTML = chaves.map(chave => {
        const r = g.cortePerfis[chave];
        if (!r || !r.barras) return "";
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
            if (c > 200) {
              html += `<text x="${posX + c / 2}" y="24" font-size="14" fill="#e6edf7" text-anchor="middle" font-family="sans-serif">${c}</text>`;
            }
            posX += c + (r.kerf || 0);
          });
          html += `</svg></div>`;
        });
        return html + "</div>";
      }).join("");
    }
  }

  // Chapas (Vidros e ACM)
  const renderChapaBox = (boxId, corteData) => {
    const box = document.getElementById(boxId);
    if (!box) return;
    if (!corteData || !corteData.chapas || !corteData.chapas.length) { 
      box.innerHTML = "<p class='small'>Sem peças para cortar.</p>"; 
      return; 
    }
    const cw = corteData.chapaW || 1, ch = corteData.chapaH || 1;
    const escala = Math.min(400 / cw, 300 / ch);
    
    box.innerHTML = `<p class="small" style="margin-bottom:6px"><b>${corteData.totalChapas}</b> chapas · Aproveitamento médio <b>${(corteData.aproveitamento || 0).toFixed(1)}%</b> · Algoritmo: ${corteData.algoritmo || "guilhotina"}</p>` +
      corteData.chapas.map((chapa, i) => svgChapa(chapa, cw, ch, escala, `Chapa ${i + 1}`)).join("");
  };
  
  try { renderChapaBox("corteVidros", g.corteVidros); } catch (e) { console.error(e); }
  try { renderChapaBox("corteACM", g.corteACM); } catch (e) { console.error(e); }

  // Acessórios
  const boxA = document.getElementById("listaAcess");
  if (boxA) {
    const entries = Object.entries(g.acess || {});
    if (!entries.length) {
      boxA.innerHTML = "<p class='small'>Sem acessórios.</p>";
    } else {
      boxA.innerHTML = `<table><thead><tr><th>Acessório</th><th>Qtde</th><th>Preço Un.</th><th>Subtotal</th></tr></thead><tbody>${entries.map(([k, q]) => { 
        const m = matById(k); 
        return `<tr><td>${escapeHtml(m?.nome || k)}</td><td>${q}</td><td>${fmt(m?.preco || 0)}</td><td>${fmt((m?.preco || 0) * q)}</td></tr>`; 
      }).join("")}</tbody></table>`;
    }
  }

  // Comparativo
  const boxCmp = document.getElementById("comparacaoAlgoritmos");
  if (boxCmp) {
    try {
      if (!g.vidros || !g.vidros.length) {
        boxCmp.innerHTML = "<p class='small'>Sem vidros.</p>";
      } else {
        const guil = cortarChapasGuilhotina(g.vidros, state.params.chapaVidro);
        const temMR = typeof MaxRects !== "undefined" && MaxRects && MaxRects.maxRects;
        if (temMR) {
          const mr = MaxRects.maxRects(g.vidros, state.params.chapaVidro, configOtimizador.heuristica, configOtimizador.girar);
          boxCmp.innerHTML = `<div class="cmp-grid">
            <div class="cmp-col ${guil.totalChapas <= mr.totalChapas ? "winner" : ""}"><h4>Guilhotina</h4>
              <div class="cmp-kpi"><span>Chapas</span><b>${guil.totalChapas}</b></div>
              <div class="cmp-kpi"><span>Aproveitamento</span><b>${guil.aproveitamento.toFixed(1)}%</b></div></div>
            <div class="cmp-col ${mr.totalChapas <= guil.totalChapas ? "winner" : ""}"><h4>MaxRects</h4>
              <div class="cmp-kpi"><span>Chapas</span><b>${mr.totalChapas}</b></div>
              <div class="cmp-kpi"><span>Aproveitamento</span><b>${mr.aproveitamento.toFixed(1)}%</b></div></div>
          </div>`;
        } else {
          boxCmp.innerHTML = "<p class='small'>MaxRects indisponível.</p>";
        }
      }
    } catch (e) { 
      boxCmp.innerHTML = "<p class='small'>Erro ao comparar.</p>"; 
    }
  }
}

/* =====================================================================
   RENDERIZAÇÃO — VÃO
   ===================================================================== */
function renderVao(a, v) {
  const t = TIPOS_VAO[v.tipo] || { icone: "❓", nome: v.tipo };
  const isCristaleira = v.tipo === "cristaleira";
  const corP = v.corPerfil || "A definir";
  const corV = v.corVidro || "A definir";
  const isGaveta = (v.tipo === "gaveta" || v.tipo === "gaveta_dupla");
  const isPorta  = (v.tipo === "porta_simples" || v.tipo === "porta_dupla" || v.tipo === "cristaleira");

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
      ${(() => {
  // Calcula min/max para este vão
  const ehBloco2 = (a.vaos_perna2 || []).some(x => x.id === v.id);
  const sufixo = ehBloco2 ? "_perna2" : "";
  const arrKey = "vaos" + sufixo;
  const L = +a["largura" + sufixo] || 0;
  const P_outro = +a[ehBloco2 ? "profundidade" : "profundidade_perna2"] || 0;
  const L_util = (a.tipo === "L") ? Math.max(0, L - P_outro) : L;
  const usadaOutros = (a[arrKey] || []).filter(x => x.id !== v.id).reduce((s, x) => s + (+x.largura || 0), 0);
  const maxVao = Math.round(L_util - usadaOutros);
  return `<div><label>Largura (mm)</label><input type="number" min="150" max="${maxVao}" value="${v.largura}" onchange="upVao('${a.id}','${v.id}','largura',+this.value)" title="Mín 150, Máx ${maxVao}"></div>`;
})()}
      ${isCristaleira ? `
        <div><label>Altura Própria (mm)</label><input type="number" value="${v.altura_propria || ''}" onchange="upVao('${a.id}','${v.id}','altura_propria',+this.value)" placeholder="Padrão"></div>
        <div><label>Prof. Própria (mm)</label><input type="number" value="${v.profundidade_propria || ''}" onchange="upVao('${a.id}','${v.id}','profundidade_propria',+this.value)" placeholder="Padrão"></div>
      ` : `
        <div><label>Nº Portas/Gavetas</label><input type="number" min="1" value="${v.gavetasPortas || 1}" onchange="upVao('${a.id}','${v.id}','gavetasPortas',+this.value)"></div>
      `}
      <div><label>Cor Perfil</label><select onchange="upVao('${a.id}','${v.id}','corPerfil',this.value)">${CORES_PERFIL.map(c => `<option value="${c}" ${corP === c ? "selected" : ""}>${c}</option>`).join("")}</select></div>
      <div><label>Cor Vidro/ACM</label><select onchange="upVao('${a.id}','${v.id}','corVidro',this.value)">${CORES_VIDRO.map(c => `<option value="${c}" ${corV === c ? "selected" : ""}>${c}</option>`).join("")}</select></div>
      ${isGaveta ? `
        <div><label>Escorredor Louças?</label>
          <select onchange="upVao('${a.id}','${v.id}','EC',+this.value)">
            <option value="0" ${(+v.EC||0)===0?"selected":""}>Não</option>
            <option value="1" ${(+v.EC||0)===1?"selected":""}>Sim</option>
          </select>
        </div>
      ` : ""}
      ${isPorta ? `
        <div><label>Nº Prateleiras (QPR)</label>
          <input type="number" min="0" value="${v.QPR || 0}" onchange="upVao('${a.id}','${v.id}','QPR',+this.value)">
        </div>
      ` : ""}
    </div>
    ${v._detalhe ? `<div class="mods"><span class="mod">🔩 ${v._detalhe.perfis.length} perfis</span><span class="mod">🪟 ${v._detalhe.vidros.length} vidros</span><span class="mod">🧱 ${v._detalhe.acm.length} ACM</span><span class="mod">🔧 ${Object.values(v._detalhe.acess || {}).reduce((s, x) => s + x, 0)} acessórios</span></div>` : ""}
  </div>`;
}
function todosVaosCalc(a) {
  const v1 = a.vaos || [];
  const v2 = a.vaos_perna2 || [];
  const todos = [...v1, ...v2];
  return {
    dv: todos.length || 1,
    pt: todos.filter(v => v.tipo === "porta_simples" || v.tipo === "cristaleira").length,
    ptd: todos.filter(v => v.tipo === "porta_dupla").length
  };
}

/* =====================================================================
   RENDERIZAÇÃO — AMBIENTE COM 1 OU 2 BLOCOS
   ===================================================================== */
function renderBlocoAmbiente(a, bloco, isL, t) {
  const sufixo = bloco === 1 ? "" : "_perna2";
  const L = +a["largura" + sufixo] || 0;
  const A = +a["altura" + sufixo] || 0;
  const P = +a["profundidade" + sufixo] || 0;
  const vaos = a["vaos" + sufixo] || [];
  const soma = vaos.reduce((s, v) => s + (+v.largura || 0), 0);

  const perda = isL ? (+a[bloco === 1 ? "profundidade_perna2" : "profundidade"] || 0) : 0;
  const larguraUtil = Math.max(0, L - perda);
  const resta = larguraUtil - soma;

  const corDoBloco = bloco === 1 ? "var(--acc2)" : "var(--warn)";
  const totEst = bloco === 1 ? (t.estrutura1 || 0) : (t.estrutura2 || 0);
  const totV = bloco === 1 ? (t.vaos1 || 0) : (t.vaos2 || 0);

  return `<div class="subcard" style="margin-top:10px;border-left-color:${corDoBloco}">
    <div class="flex-between" style="margin-bottom:8px">
      <b>${bloco === 1 ? "🧱 Bloco 1 (perna principal)" : "🧱 Bloco 2 (perna perpendicular)"}</b>
      <span class="pill acc">Bloco: ${fmt(totEst + totV)}</span>
    </div>

    ${isL ? `<p class="small" style="margin:0 0 8px 0">
      ⚠️ Em L: largura útil para vãos = <b>${larguraUtil}mm</b>
      (largura ${L} − profundidade do outro bloco ${perda})
    </p>` : ""}

    <div class="grid g4 no-print" style="margin-top:8px">
      <div><label>Largura (mm)</label><input type="number" value="${L}" onchange="setAmbBloco('largura${sufixo}',+this.value,'${a.id}')"></div>
      <div><label>Altura (mm)</label><input type="number" value="${A}" onchange="setAmbBloco('altura${sufixo}',+this.value,'${a.id}')"></div>
      <div><label>Profundidade (mm)</label><input type="number" value="${P}" onchange="setAmbBloco('profundidade${sufixo}',+this.value,'${a.id}')"></div>
      <div><label>Cor Perfil</label><select onchange="setAmbBloco('corPerfil',this.value,'${a.id}')">${CORES_PERFIL.map(c => `<option value="${c}" ${a.corPerfil === c ? "selected" : ""}>${c}</option>`).join("")}</select></div>
      <div><label>Cor Vidro/ACM</label><select onchange="setAmbBloco('corVidro',this.value,'${a.id}')">${CORES_VIDRO.map(c => `<option value="${c}" ${a.corVidro === c ? "selected" : ""}>${c}</option>`).join("")}</select></div>
    </div>

    ${bloco === 1 ? `
    <div class="grid g4 no-print" style="margin-top:8px">
      <div><label>Tipo Base (BA)</label>
        <select onchange="setAmbBloco('BA',+this.value,'${a.id}')">
          <option value="1" ${(+a.BA||1)===1?"selected":""}>1 - Tubo</option>
          <option value="2" ${(+a.BA||1)===2?"selected":""}>2 - Rodízio</option>
          <option value="3" ${(+a.BA||1)===3?"selected":""}>3 - Aéreo</option>
        </select>
      </div>
      <div><label>Rodízio (RO)</label>
        <select onchange="setAmbBloco('RO',+this.value,'${a.id}')">
          <option value="0" ${(+a.RO||0)===0?"selected":""}>Sem rodízio</option>
          <option value="3" ${(+a.RO||0)===3?"selected":""}>35mm</option>
          <option value="2" ${(+a.RO||0)===2?"selected":""}>50mm</option>
          <option value="1" ${(+a.RO||0)===1?"selected":""}>75mm</option>
        </select>
      </div>
      <div><label>Puxador (AC)</label>
        <select onchange="setAmbBloco('AC',+this.value,'${a.id}')">
          <option value="1" ${(+a.AC||1)===1?"selected":""}>1 - Slim</option>
          <option value="2" ${(+a.AC||1)===2?"selected":""}>2 - Gola</option>
        </select>
      </div>
     <div><label>Visibilidade (V)</label>
  <select onchange="setAmbBloco('V',+this.value,'${a.id}')">
    <option value="1" ${(+a.V||1)===1?"selected":""}>1 - Somente frente</option>
    <option value="2" ${(+a.V||1)===2?"selected":""}>2 - Frente + lateral direita</option>
    <option value="3" ${(+a.V||1)===3?"selected":""}>3 - Frente + lateral esquerda</option>
    <option value="4" ${(+a.V||1)===4?"selected":""}>4 - Frente + 2 laterais</option>
    <option value="5" ${(+a.V||1)===5?"selected":""}>5 - Todas as laterais</option>
 </select>
</div>
    </div>
    <p class="small" style="margin:6px 0 0 0;color:var(--muted)">
      📊 Derivados: <b>DV</b>=${todosVaosCalc(a).dv} vãos · <b>PT</b>=${todosVaosCalc(a).pt} · <b>PTD</b>=${todosVaosCalc(a).ptd}
    </p>
    ` : ""}

    <div class="flex-between" style="margin-top:10px">
      <div class="row">
        <span class="pill ${resta < 0 ? 'err' : (resta === 0 ? 'ok' : 'warn')}">Livre: ${resta}mm</span>
        <span class="pill warn">Estrutura: ${fmt(totEst)}</span>
        <span class="pill acc">Vãos: ${fmt(totV)}</span>
      </div>
     ${(() => {
  const sobra = larguraUtil - soma;
  const podeAdicionar = sobra >= 150;
  return podeAdicionar
    ? `<button class="btn sm" onclick="addVaoBloco('${a.id}',${bloco})">+ Vão</button>`
    : `<button class="btn sm" disabled title="Sobra ${Math.round(sobra)}mm (mín 150mm)" style="opacity:0.4;cursor:not-allowed">+ Vão</button>`;
})()}
    </div>

    <div style="margin-top:10px">
      ${vaos.length ? vaos.map(v => renderVao(a, v)).join("") : '<p class="small">Sem vãos neste bloco.</p>'}
    </div>
  </div>`;
}

function renderAmbientes() {
  const box = document.getElementById("listaAmb"); if (!box) return;
  if (!state.ambientes.length) { box.innerHTML = '<div class="card"><p class="small">Nenhum ambiente. Adicione um acima.</p></div>'; return; }
  const g = calcularTudo();

  box.innerHTML = state.ambientes.map(a => {
    const isL = a.tipo === "L";
    const t = g.porAmbiente[a.id] || {};
    const totGeral = t.total || 0;

    let html = `<div class="card">
      <div class="flex-between">
        <div class="row">
          <input value="${escapeHtml(a.nome)}" onchange="setAmb('nome',this.value,'${a.id}')" style="width:180px">
          <select onchange="setAmb('tipo',this.value,'${a.id}')">
            <option value="reto" ${!isL ? "selected" : ""}>Reto</option>
            <option value="L" ${isL ? "selected" : ""}>Em L</option>
          </select>
          <span class="pill acc">Total: ${fmt(totGeral)}</span>
        </div>
        <button class="btn err sm" onclick="removeAmbiente('${a.id}')">✕</button>
      </div>`;

    html += renderBlocoAmbiente(a, 1, isL, t);
    if (isL) html += renderBlocoAmbiente(a, 2, isL, t);

    html += `</div>`;
    return html;
  }).join("");
}

/* =====================================================================
   EDITOR DE COMPOSIÇÕES
   ===================================================================== */
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
    <details style="margin-top:12px">
      <summary class="small" style="cursor:pointer;color:var(--acc2)">📖 Variáveis disponíveis nas fórmulas (clique para expandir)</summary>
      <div class="small" style="margin-top:8px;line-height:1.7">
        <p><b>Do vão:</b> <code>L</code> largura, <code>A</code> altura (ou <code>H</code>), <code>P</code> profundidade, <code>N</code> nº portas/gavetas, <code>EC</code> escorredor (0/1), <code>QPR</code> nº prateleiras</p>
        <p><b>Do ambiente:</b> <code>V</code> nº vãos, <code>DV</code> divisões, <code>BA</code> base (1=tubo,2=rodízio,3=aéreo), <code>RO</code> rodízio (1=75,2=50,3=35), <code>AC</code> puxador (1=Slim,2=Gola)</p>
        <p><b>Derivadas:</b> <code>B</code> base (0 ou 50), <code>CC</code> corrediça (1-6), <code>FEV</code> folga entre vãos (5), <code>FLE</code>/<code>FLD</code> folgas laterais (10)</p>
        <p><b>Funções:</b> <code>IIF(cond, a, b)</code> ou <code>SE(cond, a, b)</code> · <code>AND(a,b)</code>/<code>E(a,b)</code> · <code>OR(a,b)</code>/<code>OU(a,b)</code> · <code>ARREDONDA(x)</code> arredonda pra cima · comparadores: <code>=</code>, <code>&lt;&gt;</code>, <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code></p>
        <p><b>Customizadas:</b> qualquer variável criada abaixo fica disponível nas fórmulas</p>
      </div>
    </details>
    <button class="btn no-print" style="margin-top:10px" onclick="addItemComp()">+ Adicionar item</button>

    <hr style="border-color:var(--line);margin:18px 0">
    <div>
      <div class="flex-between" style="margin-bottom:8px">
        <b>⚙️ Variáveis customizadas</b>
        <button class="btn sm no-print" onclick="addVarExtra()">+ Adicionar variável</button>
      </div>
      <p class="small">Ficam disponíveis em qualquer fórmula. Ex: <code>MINHAVAR = 12</code></p>
      ${(state.varsExtras || []).length ? `<table>
        <thead><tr><th>Nome</th><th>Valor</th><th></th></tr></thead>
        <tbody>
          ${state.varsExtras.map((vx, i) => `
            <tr>
              <td><input value="${escapeHtml(vx.nome)}" onchange="setVarExtra(${i},'nome',this.value)"></td>
              <td><input type="number" step="any" value="${vx.valor}" onchange="setVarExtra(${i},'valor',+this.value)"></td>
              <td><button class="btn err xs no-print" onclick="delVarExtra(${i})">✕</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>` : `<p class="small">Nenhuma variável customizada.</p>`}
    </div>
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
  snapshotParaUndo();
  const t = compTabAtual, cat = compSubTab;
  const def = { matId: (state.materiais[cat] && state.materiais[cat][0]?.id) || "" };
  if (cat === "perfis") { def.corte = "90/90"; def.qtdFormula = "1"; def.medidaFormula = "L"; def.posicao = "Largura"; def.condicao = "Sempre"; def.obs = ""; }
  if (cat === "vidros" || cat === "acm") { def.alturaFormula = "A"; def.larguraFormula = "L"; def.qtdFormula = "1"; def.condicao = "Sempre"; def.obs = ""; }
  if (cat === "acess") { def.descricao = "Novo"; def.qtdFormula = "1"; def.condicao = "Sempre"; def.obs = ""; }
  if (t === "estrutura") state.estrutura[cat].push(def); else state.composicoes[t][cat].push(def);
  invalidarCaches(); save(); render();
}

function addVarExtra() {
  snapshotParaUndo();
  if (!state.varsExtras) state.varsExtras = [];
  state.varsExtras.push({ nome: "NOVA", valor: 0 });
  invalidarCaches(); save(); render();
}
function setVarExtra(i, k, v) {
  snapshotParaUndo();
  if (!state.varsExtras || !state.varsExtras[i]) return;
  state.varsExtras[i][k] = v;
  invalidarCaches(); save(); render();
}
function delVarExtra(i) {
  if (!confirm("Remover variável?")) return;
  snapshotParaUndo();
  state.varsExtras.splice(i, 1);
  invalidarCaches(); save(); render();
}

/* =====================================================================
   AÇÕES — AMBIENTE E VÃO
   ===================================================================== */
function setOrc(k, v) { snapshotParaUndo(); state.orcamento[k] = v; if (k === "desconto") _globalCache = null; save(); render(); }
function setAmb(k, v, aid) {
  snapshotParaUndo();
  const a = state.ambientes.find(x => x.id === aid); if (!a) return;
  a[k] = v;
  if (k === "tipo" && v === "L") {
    if (a.largura_perna2 == null) a.largura_perna2 = 3000;
    if (a.altura_perna2 == null) a.altura_perna2 = a.altura;
    if (a.profundidade_perna2 == null) a.profundidade_perna2 = a.profundidade;
    if (!a.vaos_perna2) a.vaos_perna2 = [];
  }
  invalidarCacheAmbiente(aid);
  save(); render();
}
function setAmbBloco(key, value, aid) {
  snapshotParaUndo();
  const a = state.ambientes.find(x => x.id === aid); if (!a) return;
  a[key] = value;
  invalidarCacheAmbiente(aid);
  save(); render();
}
function addAmbiente() {
  snapshotParaUndo();
  const nomeEl = document.getElementById("nomeAmb"), LEl = document.getElementById("ambL"), AEl = document.getElementById("ambA"), PEl = document.getElementById("ambP");
  const nome = (nomeEl?.value || "").trim() || "Ambiente";
  const L = +(LEl?.value || 5000) || 5000;
  const A = +(AEl?.value || 800) || 800;
  const P = +(PEl?.value || 500) || 500;
  state.ambientes.push(ambienteTemplate(nome, L, A, P));
  invalidarCaches();
  if (nomeEl) nomeEl.value = "";
  save(); render();
}
function removeAmbiente(id) { if (!confirm("Remover este ambiente?")) return; snapshotParaUndo(); state.ambientes = state.ambientes.filter(a => a.id !== id); invalidarCacheAmbiente(id); save(); render(); }

function addVaoBloco(aid, bloco) {
  const a = state.ambientes.find(x => x.id === aid); if (!a) return;
  const sufixo = bloco === 1 ? "" : "_perna2";
  const arrKey = "vaos" + sufixo;
  const L = +a["largura" + sufixo] || 0;
  const P_outro = +a[bloco === 1 ? "profundidade_perna2" : "profundidade"] || 0;
  const L_util = (a.tipo === "L") ? Math.max(0, L - P_outro) : L;
  const usada = (a[arrKey] || []).reduce((s, v) => s + (+v.largura || 0), 0);
  const sobra = L_util - usada;

  if (sobra < 150) {
    toast(`Não há espaço suficiente. Sobra apenas ${Math.round(sobra)}mm (mínimo 150mm)`, true);
    return;
  }

  // Largura do novo vão: 500 padrão, mas não maior que o que sobra
  const larguraNovo = Math.min(500, sobra);

  snapshotParaUndo();
  a[arrKey] = a[arrKey] || [];
  a[arrKey].push({
    id: uid(),
    tipo: "porta_simples",
    descricao: "Módulo",
    largura: Math.round(larguraNovo),
    gavetasPortas: 1,
    EC: 0, QPR: 0,
    corPerfil: a.corPerfil || "A definir",
    corVidro: a.corVidro || "A definir"
  });
  invalidarCacheAmbiente(aid);
  save(); render();
}

function removeVao(aid, vid) {
  snapshotParaUndo();
  const a = state.ambientes.find(x => x.id === aid); if (!a) return;
  a.vaos = (a.vaos || []).filter(v => v.id !== vid);
  a.vaos_perna2 = (a.vaos_perna2 || []).filter(v => v.id !== vid);
  invalidarCacheAmbiente(aid); save(); render();
}

function upVao(aid, vid, key, val) {
  const a = state.ambientes.find(x => x.id === aid); if (!a) return;

  // Descobre em qual bloco está o vão
  let bloco = 0;
  let v = null;
  if ((a.vaos || []).some(x => x.id === vid)) { bloco = 1; v = a.vaos.find(x => x.id === vid); }
  else if ((a.vaos_perna2 || []).some(x => x.id === vid)) { bloco = 2; v = a.vaos_perna2.find(x => x.id === vid); }
  if (!v) return;

  // Validação só para largura
  if (key === "largura") {
    const nova = +val || 0;
    if (nova < 150) {
      toast("Largura mínima do vão é 150mm", true);
      render(); // re-renderiza para reverter o input
      return;
    }

    const sufixo = bloco === 1 ? "" : "_perna2";
    const arrKey = "vaos" + sufixo;
    const L = +a["largura" + sufixo] || 0;
    const P_outro = +a[bloco === 1 ? "profundidade_perna2" : "profundidade"] || 0;
    const L_util = (a.tipo === "L") ? Math.max(0, L - P_outro) : L;
    // Soma das larguras dos OUTROS vãos (excluindo este)
    const usadaOutros = (a[arrKey] || []).filter(x => x.id !== vid).reduce((s, x) => s + (+x.largura || 0), 0);
    const limiteEsteVao = L_util - usadaOutros;

    if (nova > limiteEsteVao) {
      toast(`Largura máxima deste vão é ${Math.round(limiteEsteVao)}mm (excede o bloco)`, true);
      render(); // re-renderiza para reverter o input
      return;
    }
  }

  snapshotParaUndo();
  v[key] = val;
  invalidarCacheAmbiente(aid);
  save(); render();
}

/* =====================================================================
   RENDER PRINCIPAL
   ===================================================================== */
function render() {
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

  try { renderAmbientes(); } catch (e) { console.error(e); }
  try { renderEditorComposicoes(); } catch (e) { console.error(e); }
  try { renderMateriais(); } catch (e) { console.error(e); }

  let g; try { g = calcularTudo(); } catch (e) { console.error(e); return; }
  try { renderResultado(g); } catch (e) { console.error(e); }
  try { renderProposta(g); } catch (e) { console.error(e); }
  try { renderCompra(g); } catch (e) { console.error(e); }
  try { renderHistorico(); } catch (e) { console.error(e); }

  const sbInfo = document.getElementById("sbInfo");
  if (sbInfo) sbInfo.textContent = `Ambientes: ${state.ambientes.length} · Cache: ${_statsCache.hit}/${_statsCache.hit + _statsCache.miss}`;
  const sbCache = document.getElementById("sbCache");
  if (sbCache) sbCache.textContent = `cache: ${_statsCache.hit}/${_statsCache.hit + _statsCache.miss}`;

  if (_viewerReady && typeof viewer3D !== "undefined" && viewer3D._getState) {
    try {
      const tabView = document.getElementById("tab-view");
      if (tabView && !tabView.classList.contains("hidden")) {
        if (viewer3D.resize) viewer3D.resize();
        if (viewer3D._buildAmbTabs) viewer3D._buildAmbTabs();
        viewer3D.render();
      }
    } catch (e) { console.warn("viewer3D:", e); }
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
  if (!g) return;
  
  // 1. KPIs e Resumo de Custos
  const kpis = document.getElementById("kpis");
  if (kpis) {
    kpis.innerHTML = `<div class="grid g4">
      <div class="kpi"><div class="l">Custo Direto</div><div class="v">${fmt(g.custoDireto)}</div></div>
      <div class="kpi"><div class="l">BDI (${state.params.bdi}%)</div><div class="v">${fmt(g.bdiValor)}</div></div>
      <div class="kpi"><div class="l">Impostos</div><div class="v">${fmt(g.impostoVal)}</div></div>
      <div class="kpi"><div class="l">Frete + Inst.</div><div class="v">${fmt(state.params.frete + state.params.instalacao)}</div></div>
      <div class="kpi"><div class="l">Desconto</div><div class="v">- ${fmt(state.orcamento.desconto)}</div></div>
      <div class="kpi" style="border-left-color:var(--ok)"><div class="l">TOTAL FINAL</div><div class="v tot">${fmt(g.total)}</div></div>
    </div>
    <table style="margin-top:12px"><tr><td>🔩 Perfis</td><td style="text-align:right">${fmt(g.custo.perfis)}</td></tr><tr><td>🪟 Vidros</td><td style="text-align:right">${fmt(g.custo.vidros)}</td></tr><tr><td>🧱 ACM</td><td style="text-align:right">${fmt(g.custo.acm)}</td></tr><tr><td>🔧 Acessórios</td><td style="text-align:right">${fmt(g.custo.acess)}</td></tr></table>`;
  }

  // 2. Custo por Ambiente
  const resumo = document.getElementById("resumoAmb");
  if (resumo) {
    resumo.innerHTML = state.ambientes.map(a => {
      const t = g.porAmbiente[a.id] || {};
      const isL = a.tipo === "L";
      let linhasVaos = "";
      (a.vaos || []).forEach(v => {
        const c = v._custo || { perfis: 0, vidros: 0, acm: 0, acess: 0, total: 0 };
        linhasVaos += `<tr><td>B1: ${escapeHtml(v.descricao || "-")}</td><td>${(TIPOS_VAO[v.tipo] || { nome: v.tipo }).nome}</td><td class="small">${corPill(v.corPerfil || "A definir", "🔩 ")}</td><td style="text-align:right">${fmt(c.perfis)}</td><td style="text-align:right">${fmt(c.vidros + c.acm)}</td><td style="text-align:right">${fmt(c.acess)}</td><td style="text-align:right"><b>${fmt(c.total)}</b></td></tr>`;
      });
      (a.vaos_perna2 || []).forEach(v => {
        const c = v._custo || { perfis: 0, vidros: 0, acm: 0, acess: 0, total: 0 };
        linhasVaos += `<tr><td>B2: ${escapeHtml(v.descricao || "-")}</td><td>${(TIPOS_VAO[v.tipo] || { nome: v.tipo }).nome}</td><td class="small">${corPill(v.corPerfil || "A definir", "🔩 ")}</td><td style="text-align:right">${fmt(c.perfis)}</td><td style="text-align:right">${fmt(c.vidros + c.acm)}</td><td style="text-align:right">${fmt(c.acess)}</td><td style="text-align:right"><b>${fmt(c.total)}</b></td></tr>`;
      });
      
      return `<div style="margin-bottom:16px"><p style="margin:0 0 6px 0"><b>🏠 ${escapeHtml(a.nome)}</b> ${isL ? '<span class="pill warn">Em L</span>' : ''} — <span class="pill ok">${fmt(t.total || 0)}</span></p>
        <table><thead><tr><th>Módulo</th><th>Tipo</th><th>Cores</th><th style="text-align:right">Perfis</th><th style="text-align:right">Vidros/ACM</th><th style="text-align:right">Acess.</th><th style="text-align:right">Total</th></tr></thead><tbody>
          <tr style="background:#1a2743"><td><b>ESTRUTURA B1</b></td><td>${isL ? "Bloco 1" : "Fechamento"}</td><td>-</td><td colspan="3"></td><td style="text-align:right"><b>${fmt(t.estrutura1 || 0)}</b></td></tr>
          ${isL ? `<tr style="background:#1a2743"><td><b>ESTRUTURA B2</b></td><td>Bloco 2</td><td>-</td><td colspan="3"></td><td style="text-align:right"><b>${fmt(t.estrutura2 || 0)}</b></td></tr>` : ""}
          ${linhasVaos || '<tr><td colspan="7" class="small">Sem vãos inseridos.</td></tr>'}
        </tbody></table></div>`;
    }).join("") || '<p class="small">Sem dados.</p>';
  }

  // 3. Planos de Corte
  try { 
    renderPlanosCorte(g); 
  } catch (e) { 
    console.error("Erro ao renderizar planos de corte:", e);
    if (document.getElementById("cortePerfis")) document.getElementById("cortePerfis").innerHTML = "<p class='small' style='color:var(--err)'>Erro ao calcular planos. Verifique os dados inseridos.</p>";
  }
}

function renderProposta(g) {
  const box = document.getElementById("propostaComercial"); if (!box || !g) return;
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
    ${state.ambientes.map(a => {
      let rows = "";
      (a.vaos || []).forEach(v => { rows += `<tr><td>${escapeHtml(a.nome)} (B1)</td><td>${escapeHtml(v.descricao || "-")}</td><td>${(TIPOS_VAO[v.tipo] || { nome: v.tipo }).nome}</td><td style="text-align:right">${fmt(v._custo?.total || 0)}</td></tr>`; });
      (a.vaos_perna2 || []).forEach(v => { rows += `<tr><td>${escapeHtml(a.nome)} (B2)</td><td>${escapeHtml(v.descricao || "-")}</td><td>${(TIPOS_VAO[v.tipo] || { nome: v.tipo }).nome}</td><td style="text-align:right">${fmt(v._custo?.total || 0)}</td></tr>`; });
      return rows;
    }).join("") || '<tr><td colspan="4">Sem itens</td></tr>'}
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
  const box = document.getElementById("listaCompra"); if (!box || !g) return;
  const linhas = [];
  Object.entries(g.cortePerfis || {}).forEach(([_, r]) => { const m = matById(r.matId); linhas.push({ cat: "Perfil", nome: m?.nome || r.matId, cor: r.cor, qtde: `${r.totalBarras} barras`, preco: (m?.preco || 0) * r.totalBarras * (state.params.barraPerfil / 1000) }); });
  Object.entries(g.custoVidrosPorTipo || {}).forEach(([_, r]) => linhas.push({ cat: "Vidro", nome: r.nome, cor: r.cor, qtde: `${r.chapas} chapas`, preco: r.custo }));
  Object.entries(g.custoACMPorTipo || {}).forEach(([_, r]) => linhas.push({ cat: "ACM", nome: r.nome, cor: r.cor, qtde: `${r.chapas} chapas`, preco: r.custo }));
  Object.entries(g.acess || {}).forEach(([k, q]) => { const m = matById(k); linhas.push({ cat: "Acessório", nome: m?.nome || k, cor: "-", qtde: q, preco: (m?.preco || 0) * q }); });
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
   MENU / IMPRESSÃO / IMPORT-EXPORT
   ===================================================================== */
function salvarTudo() { saveLocalOnly(); toast("💾 Salvo localmente"); }
function abrirListaNuvem() { toast("☁️ Nuvem não configurada"); }
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
    } catch (e) { toast("Erro: " + e.message, true); }
  };
  reader.readAsText(f);
  ev.target.value = "";
}
function imprimirAuto() { window.print(); }
function resetAll() {
  if (!confirm("Zerar tudo?")) return;
  state = novoEstado(); hist = []; invalidarCaches(); save(); render(); toast("🗑️ Zerado");
}
function novoOrcamento() {
  if (!confirm("Criar novo orçamento?")) return;
  state = novoEstado();
  state.orcamento.numero = "ORC-" + String(Date.now()).slice(-6);
  invalidarCaches(); save(); render(); toast("➕ Novo");
}
function atualizarListaOrcamentos() {
  const box = document.getElementById("listaOrcamentos"); if (!box) return;
  const g = calcularTudo();
  box.innerHTML = `<p class="small">Orçamento atual: <b>${escapeHtml(state.orcamento.numero || "—")}</b> · ${escapeHtml(state.orcamento.cliente || "—")} · ${fmt(g.total)}</p>`;
  const info = document.getElementById("infoOrcamentoAtual");
  if (info) info.innerHTML = `<p>ID: ${state.orcamento.id}<br>Nº: ${escapeHtml(state.orcamento.numero || "—")}<br>Cliente: ${escapeHtml(state.orcamento.cliente || "—")}<br>Ambientes: ${state.ambientes.length}<br>Status: ${escapeHtml(state.orcamento.status)}</p>`;
}
function salvarComoTemplate() { localStorage.setItem("orcProQually_template", JSON.stringify({ composicoes: state.composicoes, estrutura: state.estrutura, materiais: state.materiais, params: state.params })); toast("💾 Template salvo"); }
function carregarTemplateDaNuvem() {
  const raw = localStorage.getItem("orcProQually_template");
  if (!raw) { toast("Sem template local", true); return; }
  try { const t = JSON.parse(raw); state.composicoes = t.composicoes || state.composicoes; state.estrutura = t.estrutura || state.estrutura; state.materiais = t.materiais || state.materiais; state.params = t.params || state.params; invalidarCaches(); save(); render(); toast("☁️ Carregado"); } catch (e) { toast("Erro", true); }
}
function restaurarFabrica() {
  if (!confirm("Restaurar padrão?")) return;
  state.composicoes = JSON.parse(JSON.stringify(COMP_DEFAULT));
  state.estrutura = JSON.parse(JSON.stringify(ESTRUTURA_DEFAULT));
  state.materiais = JSON.parse(JSON.stringify(MAT_DEFAULT));
  state.params = JSON.parse(JSON.stringify(PARAMS_DEFAULT));
  state.varsExtras = [];
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
  // Garante que a aba de resultado esteja visível na tela antes de imprimir
  document.querySelectorAll(".tabs > .tab").forEach(t => t.classList.remove("on"));
  const tabRes = document.querySelector(".tabs > .tab[data-tab='res']");
  if (tabRes) tabRes.classList.add("on");
  
  document.querySelectorAll("main > section[id^='tab-']").forEach(s => s.classList.add("hidden"));
  const sec = document.getElementById("tab-res");
  if (sec) sec.classList.remove("hidden");

  // Chama a impressão
  document.body.classList.add("printing-res");
  setTimeout(() => { 
    window.print(); 
    document.body.classList.remove("printing-res"); 
  }, 300);
}
function imprimirSecao(id) {
  document.body.classList.add("printing-sec");
  const cards = document.querySelectorAll(".card.print-target");
  cards.forEach(c => { if (c.id !== id) c.style.display = "none"; });
  setTimeout(() => { window.print(); cards.forEach(c => { c.style.display = ""; }); document.body.classList.remove("printing-sec"); }, 200);
}
function exportarPlanosSVG() { toast("⬇️ Use Ctrl+P → Salvar como PDF"); }
function imprimirPropostaCliente() { document.body.classList.add("printing-proposta-cliente"); setTimeout(() => { window.print(); document.body.classList.remove("printing-proposta-cliente"); }, 200); }
function imprimirPropostaInterna() { document.body.classList.add("printing-proposta-interna"); setTimeout(() => { window.print(); document.body.classList.remove("printing-proposta-interna"); }, 200); }
function exportCSV() {
  const g = calcularTudo();
  const linhas = [["Categoria","Material","Cor","Qtde","Custo"]];
  Object.entries(g.cortePerfis || {}).forEach(([_, r]) => { const m = matById(r.matId); linhas.push(["Perfil", m?.nome || r.matId, r.cor, r.totalBarras + " barras", ((m?.preco||0) * r.totalBarras * (state.params.barraPerfil/1000)).toFixed(2)]); });
  Object.entries(g.custoVidrosPorTipo || {}).forEach(([_, r]) => linhas.push(["Vidro", r.nome, r.cor, r.chapas + " chapas", r.custo.toFixed(2)]));
  Object.entries(g.custoACMPorTipo || {}).forEach(([_, r]) => linhas.push(["ACM", r.nome, r.cor, r.chapas + " chapas", r.custo.toFixed(2)]));
  Object.entries(g.acess || {}).forEach(([k,q]) => { const m = matById(k); linhas.push(["Acessório", m?.nome || k, "-", q, ((m?.preco||0)*q).toFixed(2)]); });
  const csv = linhas.map(l => l.map(x => `"${String(x).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "lista-compra.csv"; a.click();
  toast("⬇️ CSV baixado");
}
function imprimirListaCompra() { document.body.classList.add("printing-compra"); setTimeout(() => { window.print(); document.body.classList.remove("printing-compra"); }, 200); }
function salvarOrcamento() {
  snapshotParaUndo();
  const g = calcularTudo();
  hist.push({ data: new Date().toISOString(), numero: state.orcamento.numero, cliente: state.orcamento.cliente, total: g.total, state: JSON.parse(JSON.stringify(state)) });
  saveHist(); renderHistorico(); toast("💾 Snapshot salvo");
}
function carregarSnapshotHist(i) {
  if (!hist[i]) return;
  if (!confirm("Carregar este snapshot?")) return;
  state = normalizeState(hist[i].state);
  invalidarCaches(); save(); render(); toast("Carregado");
}
function delSnapshotHist(i) { if (!confirm("Excluir?")) return; hist.splice(i, 1); saveHist(); renderHistorico(); }
function agendarSyncSheets() { /* off */ }

/* =====================================================================
   TABS
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
      if (nome === "lista") atualizarListaOrcamentos();
      if (nome === "res") { const g = calcularTudo(); renderResultado(g); }
      if (nome === "compra") { const g = calcularTudo(); renderCompra(g); }
      if (nome === "proposta") { const g = calcularTudo(); renderProposta(g); }
      if (nome === "hist") renderHistorico();
      if (nome === "view") {
        setTimeout(() => {
          if (typeof viewer3D !== "undefined" && viewer3D.canvas) {
            try {
              viewer3D.resize();
              if (viewer3D._buildAmbTabs) viewer3D._buildAmbTabs();
              viewer3D.render();
            } catch (e) { console.warn(e); }
          }
        }, 50);
      }
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
  document.querySelectorAll("#cameraPresets button").forEach(b => {
    b.onclick = () => {
      if (typeof viewer3D === "undefined") return;
      const map = { frontal: [0.05, 0.05, 1], iso: [-0.35, 0.55, 1], superior: [-1.1, 0.05, 1], lateral: [0.05, 1.2, 1] };
      const p = map[b.dataset.cam]; if (!p) return;
      viewer3D.rotX = p[0]; viewer3D.rotY = p[1]; viewer3D.zoom = p[2]; viewer3D.panX = 0; viewer3D.panY = 0;
      document.querySelectorAll("#cameraPresets button").forEach(x => x.classList.remove("on"));
      b.classList.add("on");
      viewer3D.render();
    };
  });
  document.querySelectorAll("#modeGroup button[data-mode]").forEach(b => {
    b.onclick = () => {
      if (typeof viewer3D === "undefined") return;
      viewer3D.modo = b.dataset.mode;
      document.querySelectorAll("#modeGroup button[data-mode]").forEach(x => x.classList.remove("on"));
      b.classList.add("on");
      viewer3D.render();
    };
  });
}

/* =====================================================================
   INIT
   ===================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  load();
  if (!state.orcamento.id) state.orcamento.id = gerarIdLocal();
  if (!state.ambientes.length && !state.orcamento.numero) {
    const a = ambienteTemplate("Cozinha Exemplo", 2000, 800, 600);
    a.tipo = "L";
    a.largura = 2000; a.altura = 800; a.profundidade = 600;
    a.largura_perna2 = 3000; a.altura_perna2 = 800; a.profundidade_perna2 = 500;
    a.vaos = [{ id: uid(), tipo: "gaveta", descricao: "Gaveteiro", largura: 700, gavetasPortas: 3, EC: 0, QPR: 0, corPerfil: "Branco", corVidro: "Incolor" }];
    a.vaos_perna2 = [{ id: uid(), tipo: "porta_simples", descricao: "Porta", largura: 600, gavetasPortas: 1, EC: 0, QPR: 2, corPerfil: "Branco", corVidro: "Incolor" }];
    state.ambientes.push(a);
    state.orcamento.numero = "ORC-001";
    state.orcamento.cliente = "Cliente Exemplo";
  }
  save();
  initTabs();
  render();

  setTimeout(() => {
    if (typeof viewer3D !== "undefined" && viewer3D.init) {
      try {
        viewer3D.init({ getState: () => state });
        _viewerReady = true;
        viewer3D.render();
      } catch (e) { console.warn("viewer3D init:", e); }
    }
  }, 150);

  document.addEventListener("keydown", e => {
    if (e.ctrlKey && e.key === "z") { e.preventDefault(); undo(); }
    if (e.ctrlKey && e.key === "y") { e.preventDefault(); redo(); }
    if (e.ctrlKey && e.key === "s") { e.preventDefault(); salvarTudo(); }
  });

  atualizarStatusUndo();
});
