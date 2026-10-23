/* =====================================================================
   viewer3d.js — v10.1
   Correções:
   - Botão Opaco funcionando independente do modo (Sólido/Transp)
   - HUD mostrando o estado correto
   - Fundo branco no PNG garantido
   ===================================================================== */

(function (global) {
  "use strict";

  /* ===== PALETA ===== */
  const CORES_PERFIL_HEX = {
    "Bronze": "#a0522d", "Preto": "#1a1a1a", "Branco": "#e8e8e8",
    "Champanhe": "#d9cbb0", "Fosco": "#5a5a5a", "A definir": "#7c3aed"
  };
  const CORES_VIDRO_HEX = {
    "Incolor": "#cfeaff", "Preto": "#2a2a2a", "Branco": "#f0f0f0",
    "Champanhe": "#e0d5bc", "Cinza": "#8a8a8a", "Bege": "#e7d9be", "A definir": "#9bb5cc"
  };

  const COR_PUXADOR  = "#c0c8d4";
  const COR_COTA     = "#fbbf24";
  const COR_COTA_TXT = "#0b1220";
  const COR_BASE_ACM = "#3d2818";
  const COR_PRAT     = "#a855f7";

  function corDoPerfil(cor) { return CORES_PERFIL_HEX[cor] || "#64748b"; }
  function corDoVidro(cor) { return CORES_VIDRO_HEX[cor] || "#cfeaff"; }

  function escurecer(hex, fator) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return "#" + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v * fator))).toString(16).padStart(2, "0")).join("");
  }
  function clarear(hex, fator) {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return "#" + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v + (255 - v) * fator))).toString(16).padStart(2, "0")).join("");
  }
  function hexToRgb(hex) {
    return { r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) };
  }
  function escapeHtmlLocal(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function nomeTipoVao(tipo) {
    const M = { gaveta: "Gaveta", gaveta_dupla: "Gaveta Dupla", porta_tempero: "Porta Tempero", lixeira: "Lixeira", nicho: "Nicho", porta_simples: "Porta", porta_dupla: "Porta Dupla", cristaleira: "Cristaleira" };
    return M[tipo] || tipo;
  }

  const PRESETS = {
    frontal:  { rotX: 0.05,  rotY: 0.05,  zoom: 1.0 },
    iso:      { rotX: -0.35, rotY: 0.55,  zoom: 1.0 },
    superior: { rotX: -1.1,  rotY: 0.05,  zoom: 1.0 },
    lateral:  { rotX: 0.05,  rotY: 1.2,   zoom: 1.0 }
  };

  function rotY(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]; }
  function rotX(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]; }

  function Viewer() {
    this.canvas = null; this.ctx = null;
    this.rotX = PRESETS.iso.rotX; this.rotY = PRESETS.iso.rotY;
    this.zoom = PRESETS.iso.zoom; this.panX = 0; this.panY = 0;
    this.modo = "solido"; this.cotas = true; this.autoRotate = false;
    this.drag = null; this.ambIdx = 0; this.animFrame = null;
    this._getState = null; this._onSnapshot = null;
    this.explosao = 0; this.explosaoAtiva = false;
    this.fundoBranco = false;
    this.vidroOpaco = false;
  }

  Viewer.prototype.init = function (opts) {
    this.canvas = document.getElementById("viewer3D");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this._getState = opts.getState;
    this._onSnapshot = opts.onSnapshot || null;
    this.resize();
    this._bindEvents();
    this._buildAmbTabs();
    this.render();
  };

  Viewer.prototype._buildAmbTabs = function () {
    const tabs = document.getElementById("viewerAmbTabs");
    if (!tabs) return;
    const state = this._getState();
    if (!state.ambientes.length) { tabs.innerHTML = ""; return; }
    if (this.ambIdx >= state.ambientes.length) this.ambIdx = 0;
    tabs.innerHTML = state.ambientes.map((a, i) => `<div class="tab ${i === this.ambIdx ? "on" : ""}" data-idx="${i}">🏠 ${a.nome || "Amb " + i}</div>`).join("");
    tabs.querySelectorAll(".tab").forEach(t => { t.onclick = () => { this.ambIdx = +t.dataset.idx; this._buildAmbTabs(); this.render(); }; });
  };

  Viewer.prototype.resize = function () {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

   Viewer.prototype._bindEvents = function () {
    const c = this.canvas;
    c.addEventListener("pointerdown", e => { this.drag = { x: e.clientX, y: e.clientY, rx: this.rotX, ry: this.rotY }; try { c.setPointerCapture(e.pointerId); } catch (_) {} });
    c.addEventListener("pointermove", e => {
      if (!this.drag) return;
      const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y;
      this.rotY = this.drag.ry + dx * 0.008;
      this.rotX = Math.max(-1.5, Math.min(1.5, this.drag.rx + dy * 0.008));
      this.render();
    });
    c.addEventListener("pointerup", e => { this.drag = null; try { c.releasePointerCapture(e.pointerId); } catch (_) {} });
    c.addEventListener("wheel", e => { e.preventDefault(); this.zoom = Math.max(0.1, Math.min(3, this.zoom * (e.deltaY < 0 ? 1.1 : 0.9))); this.render(); }, { passive: false });
    window.addEventListener("resize", () => { this.resize(); this.render(); });

    document.querySelectorAll("#cameraPresets button").forEach(b => {
      b.onclick = () => { const p = PRESETS[b.dataset.cam]; if (!p) return; this.rotX = p.rotX; this.rotY = p.rotY; this.zoom = p.zoom; this.panX = 0; this.panY = 0; document.querySelectorAll("#cameraPresets button").forEach(x => x.classList.remove("on")); b.classList.add("on"); this.render(); };
    });

    document.querySelectorAll("#modeGroup button").forEach(b => {
      // A MÁGICA AQUI: Ignora o botão Opaco para ele não quebrar o modo.
      if (b.id === "btnOpaco") return; 
      
      b.onclick = () => { 
        this.modo = b.dataset.mode; 
        document.querySelectorAll("#modeGroup button").forEach(x => {
          if (x.id !== "btnOpaco") x.classList.remove("on");
        }); 
        b.classList.add("on"); 
        this.render(); 
      };
    });
  };

  Viewer.prototype.reset = function () { const p = PRESETS.iso; this.rotX = p.rotX; this.rotY = p.rotY; this.zoom = p.zoom; this.panX = 0; this.panY = 0; this.render(); };
  Viewer.prototype.toggleAuto = function () { this.autoRotate = !this.autoRotate; document.getElementById("btnAutoRotate").classList.toggle("on", this.autoRotate); if (this.autoRotate) this._tick(); else cancelAnimationFrame(this.animFrame); };
  Viewer.prototype._tick = function () { if (!this.autoRotate) return; this.rotY += 0.01; this.render(); this.animFrame = requestAnimationFrame(() => this._tick()); };
  Viewer.prototype.toggleCotas = function () { this.cotas = !this.cotas; document.getElementById("btnCotas").classList.toggle("on", this.cotas); this.render(); };

  Viewer.prototype.toggleFundo = function () {
    this.fundoBranco = !this.fundoBranco;
    const btn = document.getElementById("btnFundo");
    if (btn) btn.classList.toggle("on", this.fundoBranco);
    this.canvas.style.background = this.fundoBranco ? "#ffffff" : "radial-gradient(circle at 30% 20%, #1a2743, #0a1526)";
    this.render();
  };

 Viewer.prototype.toggleOpaco = function () {
    this.vidroOpaco = !this.vidroOpaco;
    const btn = document.getElementById("btnOpaco");
    if (btn) {
      if (this.vidroOpaco) {
        btn.innerHTML = "💎 Opaco";
        btn.classList.add("on");
      } else {
        btn.innerHTML = "💧 Transparente";
        btn.classList.remove("on");
      }
    }
    this.render();
  };

  Viewer.prototype.toggleExplosao = function () { this.explosaoAtiva = !this.explosaoAtiva; this.explosao = this.explosaoAtiva ? 0.5 : 0; const btn = document.getElementById("btnExplosao"); if (btn) btn.classList.toggle("on", this.explosaoAtiva); const slider = document.getElementById("explosaoSlider"); if (slider) { slider.disabled = !this.explosaoAtiva; slider.value = this.explosao; } this.render(); };
  Viewer.prototype.setExplosao = function (v) { this.explosao = Math.max(0, Math.min(1, v)); this.explosaoAtiva = this.explosao > 0.001; const btn = document.getElementById("btnExplosao"); if (btn) btn.classList.toggle("on", this.explosaoAtiva); this.render(); };

  Viewer.prototype.snapshot = function (paraPrint) {
    if (!this.canvas) return;
    const fundoAntes = this.fundoBranco;
    this.fundoBranco = true;
    this.render();
    const ctx = this.ctx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();
    const dataURL = this.canvas.toDataURL("image/png", 1.0);
    this.fundoBranco = fundoAntes;
    this.render();

    if (paraPrint) {
      const el = document.getElementById("viewerSnapshot");
      if (el) { el.innerHTML = `<img src="${dataURL}" style="width:100%;max-width:780px;border-radius:8px;border:1px solid #999;background:#fff">`; el.style.display = "block"; }
    } else {
      const a = document.createElement("a"); a.href = dataURL; a.download = `visualizacao-${Date.now()}.png`; a.click();
      if (this._onSnapshot) this._onSnapshot("📸 PNG baixado (fundo branco)");
    }
  };

   Viewer.prototype._autoFit = function (L, A, P) {
    const W = this.canvas.clientWidth, H = this.canvas.clientHeight;
    // Adiciona margem de segurança para as cotas
    const margem = 0.6; 
    
    const cantos = [
      [-L/2, -A/2, -P/2], [L/2, -A/2, -P/2], [L/2, A/2, -P/2], [-L/2, A/2, -P/2],
      [-L/2, -A/2, P/2], [L/2, -A/2, P/2], [L/2, A/2, P/2], [-L/2, A/2, P/2]
    ];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    cantos.forEach(c => { 
      let p = rotY(c, this.rotY); 
      p = rotX(p, this.rotX); 
      const persp = 1400 / (1400 + p[2] * 0.6); 
      const px = p[0] * persp, py = p[1] * persp; 
      if (px < minX) minX = px; if (px > maxX) maxX = px; 
      if (py < minY) minY = py; if (py > maxY) maxY = py; 
    });
    
    const bboxW = maxX - minX || 1;
    const bboxH = maxY - minY || 1;
    const fitZoom = Math.min(W / bboxW, H / bboxH) * margem;
    
    // Força o zoom a ter um mínimo e máximo
    this.zoom = Math.max(0.02, Math.min(1.5, fitZoom));
    
    // Zera o pan para garantir que fique no centro exato do Canvas
    this.panX = 0;
    this.panY = 0;
  };

  Viewer.prototype._proj = function (x, y, z) {
    let p = rotY([x, y, z], this.rotY); p = rotX(p, this.rotX);
    const zPersp = 1400 / (1400 + p[2] * 0.6);
    const cx = this.canvas.clientWidth / 2 + this.panX;
    const cy = this.canvas.clientHeight / 2 + this.panY;
    return { x: cx + p[0] * this.zoom * zPersp, y: cy + p[1] * this.zoom * zPersp, z: p[2] };
  };

    Viewer.prototype._gerarFaces = function (amb) {
    const faces = [];
    const L = +amb.largura, A = +amb.altura, P = +amb.profundidade;
    const ox = -L / 2, oy = -A / 2, oz = -P / 2;
    const vis = amb.visibilidade || "frente";
    
    // Puxa as cores do orçamento
    const corPerfil = corDoPerfil(amb.corPerfil);
    const corVidro = corDoVidro(amb.corVidro);
    const corPerfilBorda = escurecer(corPerfil, 0.7);
    const corVidroBorda = escurecer(corVidro, 0.7);

    const EXPL = this.explosao;
    const centro = [0, 0, 0];
    const OPACO = this.vidroOpaco;

    function normal(pts) {
      const a = [pts[1][0]-pts[0][0], pts[1][1]-pts[0][1], pts[1][2]-pts[0][2]];
      const b = [pts[2][0]-pts[0][0], pts[2][1]-pts[0][1], pts[2][2]-pts[0][2]];
      const n = [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
      const len = Math.hypot(n[0], n[1], n[2]) || 1;
      return [n[0]/len, n[1]/len, n[2]/len];
    }

    function addFace(pts, corBase, alpha, tipo) {
      let ptsFinal = pts;
      if (EXPL > 0.001) {
        const cx = (pts[0][0]+pts[1][0]+pts[2][0]+pts[3][0])/4, cy = (pts[0][1]+pts[1][1]+pts[2][1]+pts[3][1])/4, cz = (pts[0][2]+pts[1][2]+pts[2][2]+pts[3][2])/4;
        const dx = cx - centro[0], dy = cy - centro[1], dz = cz - centro[2];
        const len = Math.hypot(dx, dy, dz) || 1, fator = EXPL * 600;
        ptsFinal = pts.map(p => [p[0] + (dx/len)*fator, p[1] + (dy/len)*fator, p[2] + (dz/len)*fator]);
      }
      
      // Iluminação suave para não alterar a cor real (Shade entre 0.85 e 1.0)
      const n = normal(ptsFinal); 
      const shade = 0.85 + 0.15 * Math.max(0, n[1]); 
      
      // Aplica a iluminação em cima da cor escolhida
      const corFinal = clarear(escurecer(corBase, shade), 0.02);

      let finalAlpha = alpha;
      if (OPACO && (tipo === "vidro" || tipo === "gaveta")) finalAlpha = 1.0;

      const cx = (ptsFinal[0][0]+ptsFinal[1][0]+ptsFinal[2][0]+ptsFinal[3][0])/4, cy = (ptsFinal[0][1]+ptsFinal[1][1]+ptsFinal[2][1]+ptsFinal[3][1])/4, cz = (ptsFinal[0][2]+ptsFinal[1][2]+ptsFinal[2][2]+ptsFinal[3][2])/4;
      faces.push({ pts: ptsFinal, cor: corBase, corFinal, alpha: finalAlpha, tipo, shade, cx, cy, cz });
    }

    function addBox(x, y, z, dx, dy, dz, cor, alpha, tipoBox) {
      tipoBox = tipoBox || "perfil";
      addFace([[x,y,z+dz],[x+dx,y,z+dz],[x+dx,y+dy,z+dz],[x,y+dy,z+dz]], cor, alpha, tipoBox);
      addFace([[x,y,z],[x+dx,y,z],[x+dx,y+dy,z],[x,y+dy,z]], cor, alpha, tipoBox);
      addFace([[x,y,z],[x,y,z+dz],[x,y+dy,z+dz],[x,y+dy,z]], cor, alpha, tipoBox);
      addFace([[x+dx,y,z],[x+dx,y,z+dz],[x+dx,y+dy,z+dz],[x+dx,y+dy,z]], cor, alpha, tipoBox);
      addFace([[x,y+dy,z],[x+dx,y+dy,z],[x+dx,y+dy,z+dz],[x,y+dy,z+dz]], cor, alpha, tipoBox);
      addFace([[x,y,z],[x+dx,y,z],[x+dx,y,z+dz],[x,y,z+dz]], cor, alpha, tipoBox);
    }

    // Painel frontal de fundo (puxa a cor do vidro exata)
    addFace([[ox,oy,oz+P],[ox+L,oy,oz+P],[ox+L,oy+A,oz+P],[ox,oy+A,oz+P]], corVidro, 0.12, "vidro");
    // Base
    addFace([[ox,oy,oz],[ox+L,oy,oz],[ox+L,oy,oz+P],[ox,oy,oz+P]], COR_BASE_ACM, 0.95, "acm");
    // Topo (puxa a cor do perfil)
    addFace([[ox,oy+A,oz],[ox+L,oy+A,oz],[ox+L,oy+A,oz+P],[ox,oy+A,oz+P]], corPerfil, 1, "perfil");

    if (vis === "todos") addFace([[ox,oy,oz],[ox+L,oy,oz],[ox+L,oy+A,oz],[ox,oy+A,oz]], corVidro, 0.12, "vidro");
    if (vis === "frente_1" || vis === "frente_2" || vis === "todos") addFace([[ox,oy,oz],[ox,oy,oz+P],[ox,oy+A,oz+P],[ox,oy+A,oz]], corVidro, 0.12, "vidro");
    if (vis === "frente_2" || vis === "todos") addFace([[ox+L,oy,oz],[ox+L,oy,oz+P],[ox+L,oy+A,oz+P],[ox+L,oy+A,oz]], corVidro, 0.12, "vidro");

    const esp = 20;
    let xCursor = 0;

    (amb.vaos || []).forEach(v => {
      const vw = +v.largura, vx = ox + xCursor, vxEnd = vx + vw;
      
      // Puxa a cor individual do vão (se existir) ou a global
      const cPerfilVao = v.corPerfil ? corDoPerfil(v.corPerfil) : corPerfil;
      const cVidroVao = v.corVidro ? corDoVidro(v.corVidro) : corVidro;

      // Desenha a moldura na cor do perfil
      addBox(vx, oy, oz, esp, A, P, cPerfilVao, 1, "perfil");
      addBox(vxEnd - esp, oy, oz, esp, A, P, cPerfilVao, 1, "perfil");
      addBox(vx + esp, oy + A - esp, oz, vw - 2 * esp, esp, P, cPerfilVao, 1, "perfil");
      addBox(vx + esp, oy, oz, vw - 2 * esp, esp, P, cPerfilVao, 1, "perfil");

      const nPortas = Math.max(1, v.gavetasPortas || 1);
      const isGaveta = (v.tipo === "gaveta" || v.tipo === "gaveta_dupla");
      const isPorta = ["porta_simples", "porta_dupla", "porta_tempero", "cristaleira", "nicho"].includes(v.tipo);

      if (isGaveta) {
        const n = v.tipo === "gaveta_dupla" ? nPortas * 2 : nPortas;
        const hG = (A - 2 * esp) / n;
        for (let gi = 0; gi < n; gi++) {
          const gy = oy + esp + gi * hG;
          // Frente da gaveta na cor do vidro
          addFace([[vx+esp, gy, oz+P-3],[vxEnd-esp, gy, oz+P-3],[vxEnd-esp, gy+hG, oz+P-3],[vx+esp, gy+hG, oz+P-3]], cVidroVao, OPACO ? 1 : 0.9, "gaveta");
          addBox(vx + esp, gy, oz + P - 4, vw - 2 * esp, 2, 2, escurecer(cPerfilVao, 0.7), 1, "perfil");
          if (gi < n - 1) addBox(vx + esp, gy + hG - 2, oz, vw - 2 * esp, 4, P, cPerfilVao, 1, "perfil");
        }
      } else if (isPorta) {
        const largPorta = (vw - 2 * esp - (nPortas - 1) * esp) / nPortas;
        for (let pi = 0; pi < nPortas; pi++) {
          const px = vx + esp + pi * (largPorta + esp);
          // Vidro da porta na cor do vidro
          addFace([[px, oy+esp, oz+P-3],[px+largPorta, oy+esp, oz+P-3],[px+largPorta, oy+A-esp, oz+P-3],[px, oy+A-esp, oz+P-3]], cVidroVao, OPACO ? 1 : 0.5, "vidro");
          if (pi < nPortas - 1) addBox(px + largPorta, oy + esp, oz, esp, A - 2 * esp, P, cPerfilVao, 1, "perfil");
          addBox(px + largPorta - esp - 40, oy + A - esp - 30, oz + P - 8, 30, 6, 6, COR_PUXADOR, 1, "acessorio");
        }
        if (v.temPrateleiras && v.qtdPrateleiras > 0) {
          const nP = +v.qtdPrateleiras;
          for (let pi = 0; pi < nP; pi++) {
            const py = oy + esp + (A - 2 * esp) * (pi + 1) / (nP + 1);
            addFace([[vx+esp, py-2, oz+esp],[vxEnd-esp, py-2, oz+esp],[vxEnd-esp, py-2, oz+P-esp],[vx+esp, py-2, oz+P-esp]], COR_PRAT, 0.95, "prateleira");
          }
        }
      } else if (v.tipo === "lixeira") {
        addFace([[vx+esp, oy+esp, oz+P-3],[vxEnd-esp, oy+esp, oz+P-3],[vxEnd-esp, oy+A-esp, oz+P-3],[vx+esp, oy+A-esp, oz+P-3]], "#22c55e", OPACO ? 1 : 0.7, "vidro");
      }
      xCursor += vw;
    });

    return { faces, L, A, P, ox, oy, oz, corPerfil, corVidro, corPerfilBorda, corVidroBorda, esp };
  };
        Viewer.prototype.render = function () {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const W = this.canvas.clientWidth, H = this.canvas.clientHeight;
    ctx.clearRect(0, 0, W, H);

    if (this.fundoBranco) {
      const grad = ctx.createRadialGradient(W/2, H*0.2, 50, W/2, H, Math.max(W, H));
      grad.addColorStop(0, "#ffffff"); grad.addColorStop(1, "#e8ecf1");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    } else {
      const grad = ctx.createRadialGradient(W*0.3, H*0.2, 50, W/2, H/2, Math.max(W, H));
      grad.addColorStop(0, "#1a2743"); grad.addColorStop(1, "#0a1526");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    }

    const state = this._getState();
    const amb = state.ambientes[this.ambIdx];
    const msgEl = document.getElementById("viewerMsg");
    const hudEl = document.getElementById("viewerHud");

    if (!amb) {
      if (msgEl) { msgEl.style.display = "block"; msgEl.textContent = state.ambientes.length ? "Selecione um ambiente." : "Adicione ambientes para visualizar."; }
      if (hudEl) hudEl.textContent = "—";
      return;
    }
    if (msgEl) msgEl.style.display = "none";
    
    const opacoStr = this.vidroOpaco ? "💎 OPACO" : "💧 TRANSPARENTE";
    if (hudEl) hudEl.textContent = `${amb.nome} · ${amb.largura}×${amb.altura}×${amb.profundidade}mm · ${(this.modo || 'solido').toUpperCase()} · VIDRO ${opacoStr}`;

    this._autoFit(+amb.largura, +amb.altura, +amb.profundidade);
    
    const dados = this._gerarFaces(amb);

    if (this.modo !== "wireframe") this._desenharSombraChao(ctx, dados);

    const proj = dados.faces.map(f => { 
      let c = [f.cx, f.cy, f.cz]; 
      c = rotY(c, this.rotY); c = rotX(c, this.rotX); 
      return { face: f, screenPts: f.pts.map(p => this._proj(p[0], p[1], p[2])), zReal: c[2] }; 
    });
    proj.sort((a, b) => b.zReal - a.zReal);

    proj.forEach(({ face, screenPts }) => {
      ctx.beginPath(); ctx.moveTo(screenPts[0].x, screenPts[0].y);
      for (let i = 1; i < screenPts.length; i++) ctx.lineTo(screenPts[i].x, screenPts[i].y);
      ctx.closePath();

      const isVidro = (face.tipo === "vidro" || face.tipo === "gaveta");
      
      let alphaFinal = face.alpha || 1; 
      if (isVidro) {
        if (this.vidroOpaco) {
          alphaFinal = 1.0; // Opaco 100%
        } else {
          alphaFinal = 0.55; // Transparente
        }
      }

      if (this.modo === "wireframe") {
        let corLinha = isVidro ? escurecer(face.cor, 0.5) : (face.tipo === "prateleira" ? COR_PRAT : face.cor);
        ctx.strokeStyle = corLinha; ctx.lineWidth = 1.5; ctx.stroke();
      } else {
        // Usa a cor final calculada lá em cima (corFinal)
        ctx.fillStyle = this._aplicarAlpha(face.corFinal, alphaFinal);
        ctx.fill();

        // Borda escura para separar os blocos
        let corBorda = isVidro ? escurecer(face.cor, 0.6) : (face.tipo === "prateleira" ? escurecer(COR_PRAT, 0.7) : escurecer(face.cor, 0.6));
        ctx.strokeStyle = corBorda; ctx.lineWidth = 1.5; ctx.stroke();
      }
    });

    if (this.cotas) this._desenharCotas(ctx, amb, dados);
    this._renderLegenda(amb);
  };
   
  Viewer.prototype._desenharSombraChao = function (ctx, dados) {
    const { L, P, ox, oy, oz } = dados;
    const chaoY = oy - 5;
    const p1 = this._proj(ox, chaoY, oz);
    const p3 = this._proj(ox + L, chaoY, oz + P);
    const cx = (p1.x + p3.x) / 2, cy = (p1.y + p3.y) / 2;
    const rx = Math.abs(p3.x - p1.x) * 0.5, ry = Math.abs(p3.y - p1.y) * 0.5;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
    grad.addColorStop(0, "rgba(0,0,0,0.35)"); grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.save(); ctx.translate(cx, cy); ctx.scale(rx/Math.max(rx,ry), ry/Math.max(rx,ry));
    ctx.beginPath(); ctx.arc(0, 0, Math.max(rx, ry), 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill(); ctx.restore();
  };

  Viewer.prototype._aplicarAlpha = function (hex, alpha) {
    const { r, g, b } = hexToRgb(hex);
    return alpha >= 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${alpha})`;
  };

    Viewer.prototype._desenharCotas = function (ctx, amb, dados) {
    const { L, A, P, ox, oy, oz, esp } = dados;
    ctx.save();
    ctx.strokeStyle = COR_COTA; ctx.fillStyle = COR_COTA; ctx.lineWidth = 1.5;
    ctx.font = "bold 11px system-ui,Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle";

    // Cotas gerais do móvel
    const pL1 = this._proj(ox, oy - 90, oz + P); const pL2 = this._proj(ox + L, oy - 90, oz + P); this._cotaLinha(ctx, pL1, pL2, `${L}mm`, "h");
    const pA1 = this._proj(ox - 90, oy, oz + P); const pA2 = this._proj(ox - 90, oy + A, oz + P); this._cotaLinha(ctx, pA1, pA2, `${A}mm`, "v");
    const pP1 = this._proj(ox + L + 90, oy - 20, oz); const pP2 = this._proj(ox + L + 90, oy - 20, oz + P); this._cotaLinha(ctx, pP1, pP2, `${P}mm`, "d");

    let xCursor = 0;
    (amb.vaos || []).forEach(v => {
      const vw = +v.largura, vx = ox + xCursor;
      const yBase = oy - 35, zBase = oz + P + 5; // Base para a cota de largura
      
      // Cota de largura do vão (embaixo)
      const v1 = this._proj(vx + esp, yBase, zBase); const v2 = this._proj(vx + vw - esp, yBase, zBase);
      this._cotaLinha(ctx, v1, v2, `${vw}mm`, "h", true);

      // ==========================================
      // AQUI ESTÁ A CORREÇÃO DO NOME DO VÃO
      // ==========================================
      // Calculamos o centro exato do vão: (Base + Altura/2)
      const yCentroVao = oy + (A / 2); 
      // Puxamos o texto para a frente (oz + P + 10) para não ficar escondido dentro do vidro
      const vMid = this._proj(vx + vw / 2, yCentroVao, oz + P + 10); 
      
      ctx.font = "bold 14px system-ui,Arial";
      ctx.fillStyle = COR_COTA;
      
      // Adiciona um fundo semi-transparente para o texto não se perder no vidro
      const txt = v.descricao || nomeTipoVao(v.tipo);
      const txtW = ctx.measureText(txt).width + 10;
      ctx.fillStyle = "rgba(11, 18, 32, 0.75)";
      ctx.fillRect(vMid.x - txtW/2, vMid.y - 10, txtW, 20);
      
      // Desenha o texto centralizado
      ctx.fillStyle = COR_COTA;
      ctx.fillText(txt, vMid.x, vMid.y);

      // Cotas de Gaveta / Porta
      const nPortas = Math.max(1, v.gavetasPortas || 1);
      const isGaveta = (v.tipo === "gaveta" || v.tipo === "gaveta_dupla");
      const isPorta = ["porta_simples", "porta_dupla", "porta_tempero", "cristaleira", "nicho"].includes(v.tipo);

      if (isGaveta) {
        const n = v.tipo === "gaveta_dupla" ? nPortas * 2 : nPortas;
        const hG = (A - 2 * esp) / n;
        for (let gi = 0; gi < n; gi++) {
          const gy = oy + esp + gi * hG; const gx = vx + vw + 12;
          const g1 = this._proj(gx, gy, oz + P); const g2 = this._proj(gx, gy + hG, oz + P);
          this._cotaLinha(ctx, g1, g2, `${Math.round(hG)}`, "v", true);
        }
      }

      if (isPorta) {
        const largPorta = (vw - 2 * esp - (nPortas - 1) * esp) / nPortas;
        const gx = vx + vw + 12;
        const g1 = this._proj(gx, oy + esp, oz + P); const g2 = this._proj(gx, oy + A - esp, oz + P);
        this._cotaLinha(ctx, g1, g2, `${Math.round(A - 2 * esp)}`, "v", true);
        if (nPortas > 1) {
          for (let pi = 0; pi < nPortas; pi++) {
            const px = vx + esp + pi * (largPorta + esp);
            const p1 = this._proj(px, oy + A - esp + 20, oz + P); const p2 = this._proj(px + largPorta, oy + A - esp + 20, oz + P);
            this._cotaLinha(ctx, p1, p2, `${Math.round(largPorta)}`, "h", true);
          }
        }
      }
      xCursor += vw;
    });
    ctx.restore();
  };

  Viewer.prototype._cotaLinha = function (ctx, p1, p2, label, orientacao, pequena) {
    const cor = COR_COTA, setaSize = pequena ? 4 : 6;
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.strokeStyle = cor; ctx.lineWidth = pequena ? 1 : 1.5; ctx.stroke();
    const ang = Math.atan2(p2.y - p1.y, p2.x - p1.x); ctx.fillStyle = cor;
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p1.x + setaSize*Math.cos(ang-0.4), p1.y + setaSize*Math.sin(ang-0.4)); ctx.lineTo(p1.x + setaSize*Math.cos(ang+0.4), p1.y + setaSize*Math.sin(ang+0.4)); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(p2.x, p2.y); ctx.lineTo(p2.x - setaSize*Math.cos(ang-0.4), p2.y - setaSize*Math.sin(ang-0.4)); ctx.lineTo(p2.x - setaSize*Math.cos(ang+0.4), p2.y - setaSize*Math.sin(ang+0.4)); ctx.closePath(); ctx.fill();
    const mx = (p1.x + p2.x)/2, my = (p1.y + p2.y)/2, fontSize = pequena ? 9 : 11;
    ctx.font = `bold ${fontSize}px system-ui,Arial`;
    const txtW = ctx.measureText(label).width + 8, txtH = fontSize + 4;
    ctx.save(); ctx.translate(mx, my); if (orientacao === "v") ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = COR_COTA_TXT; ctx.fillRect(-txtW/2, -txtH/2, txtW, txtH);
    ctx.strokeStyle = cor; ctx.lineWidth = 0.5; ctx.strokeRect(-txtW/2, -txtH/2, txtW, txtH);
    ctx.fillStyle = cor; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(label, 0, 0); ctx.restore();
  };

  Viewer.prototype._renderLegenda = function (amb) {
    const el = document.getElementById("viewerLegend");
    if (!el) return;
    const corP = corDoPerfil(amb.corPerfil), corV = corDoVidro(amb.corVidro);
    el.innerHTML = `<span class="vl-item"><span class="lg-cor" style="background:${corP};border:1px solid #666"></span>Perfil ${escapeHtmlLocal(amb.corPerfil || "-")}</span><span class="vl-item"><span class="lg-cor" style="background:${corV};border:1px solid #666"></span>Vidro ${escapeHtmlLocal(amb.corVidro || "-")}</span><span class="vl-item"><span class="lg-cor" style="background:${COR_PRAT}"></span>Prateleira</span><span class="vl-item"><span class="lg-cor" style="background:${COR_PUXADOR}"></span>Puxador</span><span class="vl-item"><span class="lg-cor" style="background:${COR_BASE_ACM}"></span>Base ACM</span><span class="vl-item"><span class="lg-cor" style="background:${COR_COTA}"></span>Cotas</span>`;
  };

  global.viewer3D = new Viewer();
  global.CORES_VIEWER = { CORES_PERFIL_HEX, CORES_VIDRO_HEX };

})(window);
