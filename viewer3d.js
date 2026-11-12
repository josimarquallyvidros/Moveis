/* =====================================================================
   viewer3d.js — v15.0
   Correções: L colado no canto, cotas corretas, porta dupla 2 folhas
   ===================================================================== */

(function (global) {
  "use strict";

  const CORES_PERFIL_HEX = { "Bronze": "#a0522d", "Preto": "#1a1a1a", "Branco": "#e8e8e8", "Champanhe": "#d9cbb0", "Fosco": "#5a5a5a", "A definir": "#7c3aed" };
  const CORES_VIDRO_HEX = { "Incolor": "#cfeaff", "Preto": "#2a2a2a", "Branco": "#f0f0f0", "Champanhe": "#e0d5bc", "Cinza": "#8a8a8a", "Bege": "#e7d9be", "A definir": "#9bb5cc" };
  const COR_PUXADOR = "#c0c8d4", COR_COTA = "#fbbf24", COR_COTA_TXT = "#0b1220";
  const COR_GAVETA_FRENTE = "#2d4a6b";

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
  function hexToRgb(hex) { return { r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) }; }
  function escapeHtmlLocal(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function nomeTipoVao(tipo) {
    const M = { gaveta: "Gaveta", gaveta_dupla: "Gaveta Dupla", porta_tempero: "Porta Tempero", lixeira: "Lixeira", nicho: "Nicho", porta_simples: "Porta", porta_dupla: "Porta Dupla", cristaleira: "Cristaleira" };
    return M[tipo] || tipo;
  }

  const PRESETS = {
    frontal: { rotX: 0.05, rotY: 0.05, zoom: 1.0 },
    iso: { rotX: -0.35, rotY: 0.55, zoom: 1.0 },
    superior: { rotX: -1.1, rotY: 0.05, zoom: 1.0 },
    lateral: { rotX: 0.05, rotY: 1.2, zoom: 1.0 }
  };

  function rotY(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]; }
  function rotX(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]; }

  function Viewer() {
    this.canvas = null; this.ctx = null;
    this.rotX = PRESETS.iso.rotX; this.rotY = PRESETS.iso.rotY; this.zoom = PRESETS.iso.zoom;
    this.panX = 0; this.panY = 0; this.modo = "solido"; this.cotas = true; this.autoRotate = false;
    this.drag = null; this.ambIdx = 0; this.animFrame = null; this._getState = null; this._onSnapshot = null;
    this.explosao = 0; this.explosaoAtiva = false; this.fundoBranco = false; this.vidroOpaco = false;
  }

  Viewer.prototype.init = function (opts) {
    this.canvas = document.getElementById("viewer3D"); if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this._getState = opts.getState;
    this._onSnapshot = opts.onSnapshot || null;
    this.resize(); this._bindEvents(); this._buildAmbTabs(); this.render();
  };

  Viewer.prototype._buildAmbTabs = function () {
    const tabs = document.getElementById("viewerAmbTabs"); if (!tabs) return;
    const state = this._getState(); if (!state || !state.ambientes) { tabs.innerHTML = ""; return; }
    if (!state.ambientes.length) { tabs.innerHTML = ""; return; }
    if (this.ambIdx >= state.ambientes.length) this.ambIdx = 0;
    tabs.innerHTML = state.ambientes.map((a, i) => `<div class="tab ${i === this.ambIdx ? "on" : ""}" data-idx="${i}">🏠 ${a.nome || "Amb " + i}</div>`).join("");
    tabs.querySelectorAll(".tab").forEach(t => { t.onclick = () => { this.ambIdx = +t.dataset.idx; this._buildAmbTabs(); this.render(); }; });
  };

  Viewer.prototype.resize = function () {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
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
  };

  Viewer.prototype.reset = function () { const p = PRESETS.iso; this.rotX = p.rotX; this.rotY = p.rotY; this.zoom = p.zoom; this.panX = 0; this.panY = 0; this.render(); };
  Viewer.prototype.toggleAuto = function () { this.autoRotate = !this.autoRotate; document.getElementById("btnAutoRotate").classList.toggle("on", this.autoRotate); if (this.autoRotate) this._tick(); else cancelAnimationFrame(this.animFrame); };
  Viewer.prototype._tick = function () { if (!this.autoRotate) return; this.rotY += 0.01; this.render(); this.animFrame = requestAnimationFrame(() => this._tick()); };
  Viewer.prototype.toggleCotas = function () { this.cotas = !this.cotas; document.getElementById("btnCotas").classList.toggle("on", this.cotas); this.render(); };
  Viewer.prototype.toggleFundo = function () { this.fundoBranco = !this.fundoBranco; const btn = document.getElementById("btnFundo"); if (btn) btn.classList.toggle("on", this.fundoBranco); this.canvas.style.background = this.fundoBranco ? "#ffffff" : "radial-gradient(circle at 30% 20%, #1a2743, #0a1526)"; this.render(); };
  Viewer.prototype.toggleOpaco = function () {
    this.vidroOpaco = !this.vidroOpaco;
    const btn = document.getElementById("btnOpaco");
    if (btn) { if (this.vidroOpaco) { btn.classList.add("on"); btn.innerHTML = "💎 Opaco"; } else { btn.classList.remove("on"); btn.innerHTML = "💧 Transparente"; } }
    this.render();
  };
  Viewer.prototype.toggleExplosao = function () {
    this.explosaoAtiva = !this.explosaoAtiva;
    this.explosao = this.explosaoAtiva ? 0.5 : 0;
    const btn = document.getElementById("btnExplosao"); if (btn) btn.classList.toggle("on", this.explosaoAtiva);
    const slider = document.getElementById("explosaoSlider"); if (slider) { slider.disabled = !this.explosaoAtiva; slider.value = this.explosao; }
    this.render();
  };
  Viewer.prototype.setExplosao = function (v) {
    this.explosao = Math.max(0, Math.min(1, v));
    this.explosaoAtiva = this.explosao > 0.001;
    const btn = document.getElementById("btnExplosao"); if (btn) btn.classList.toggle("on", this.explosaoAtiva);
    this.render();
  };

  Viewer.prototype.snapshot = function (paraPrint) {
    if (!this.canvas) return;
    const fundoAntes = this.fundoBranco;
    this.fundoBranco = true;
    this.render();
    const ctx = this.ctx;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.restore();
    const dataURL = this.canvas.toDataURL("image/png", 1.0);
    this.fundoBranco = fundoAntes;
    this.render();
    if (paraPrint) {
      const el = document.getElementById("viewerSnapshot");
      if (el) {
        el.innerHTML = `<img src="${dataURL}" style="width:100%;max-width:780px;border-radius:8px;border:1px solid #999;background:#fff">`;
        el.style.display = "block";
      }
    } else {
      const a = document.createElement("a");
      a.href = dataURL;
      a.download = `visualizacao-${Date.now()}.png`;
      a.click();
      if (this._onSnapshot) this._onSnapshot("📸 PNG baixado (fundo branco)");
    }
  };

  Viewer.prototype._proj = function (x, y, z) {
    let p = rotY([x, y, z], this.rotY);
    p = rotX(p, this.rotX);
    const zPersp = 1400 / (1400 + p[2] * 0.6);
    const cx = this.canvas.clientWidth / 2 + this.panX;
    const cy = this.canvas.clientHeight / 2 + this.panY;
    return { x: cx + p[0] * this.zoom * zPersp, y: cy + p[1] * this.zoom * zPersp, z: p[2] };
  };

  Viewer.prototype._autoFit = function (L, A, P) {
    const W = this.canvas.clientWidth, H = this.canvas.clientHeight;
    if (!W || !H) return;
    const half = { x: L / 2, y: A / 2, z: P / 2 };
    const cantos = [
      [-half.x, -half.y, -half.z], [half.x, -half.y, -half.z],
      [half.x, half.y, -half.z], [-half.x, half.y, -half.z],
      [-half.x, -half.y, half.z], [half.x, -half.y, half.z],
      [half.x, half.y, half.z], [-half.x, half.y, half.z]
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
    const fitZoom = Math.min(W / (maxX - minX || 1), H / (maxY - minY || 1)) * 0.75;
    this.zoom = Math.max(0.05, Math.min(2, fitZoom));
  };

  /* =====================================================================
     GERAÇÃO DE FACES — 1 ou 2 blocos colados no canto
     ===================================================================== */
 Viewer.prototype._gerarFaces = function (amb) {
  const faces = [];
  const isL = amb.tipo === "L";
  const EXPL = this.explosao;
  const OPACO = this.vidroOpaco;

  function normal(pts) {
    const a = [pts[1][0]-pts[0][0], pts[1][1]-pts[0][1], pts[1][2]-pts[0][2]];
    const b = [pts[2][0]-pts[0][0], pts[2][1]-pts[0][1], pts[2][2]-pts[0][2]];
    const n = [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
    const len = Math.hypot(n[0], n[1], n[2]) || 1;
    return [n[0]/len, n[1]/len, n[2]/len];
  }

  function addFace(pts, cor, alpha, tipo) {
    let ptsFinal = pts;
    if (EXPL > 0.001) {
      const cx = (pts[0][0]+pts[1][0]+pts[2][0]+pts[3][0])/4;
      const cy = (pts[0][1]+pts[1][1]+pts[2][1]+pts[3][1])/4;
      const cz = (pts[0][2]+pts[1][2]+pts[2][2]+pts[3][2])/4;
      const dx = cx, dy = cy, dz = cz;
      const len = Math.hypot(dx, dy, dz) || 1, fator = EXPL * 400;
      ptsFinal = pts.map(p => [p[0] + (dx/len)*fator, p[1] + (dy/len)*fator, p[2] + (dz/len)*fator]);
    }
    const n = normal(ptsFinal);
    const shade = 0.75 + 0.25 * Math.max(0, n[1]);
    const corFinal = clarear(escurecer(cor, shade), 0.05);
    let finalAlpha = alpha;
    if (OPACO && (tipo === "vidro" || tipo === "gaveta")) finalAlpha = 1.0;
    const cx = (ptsFinal[0][0]+ptsFinal[1][0]+ptsFinal[2][0]+ptsFinal[3][0])/4;
    const cy = (ptsFinal[0][1]+ptsFinal[1][1]+ptsFinal[2][1]+ptsFinal[3][1])/4;
    const cz = (ptsFinal[0][2]+ptsFinal[1][2]+ptsFinal[2][2]+ptsFinal[3][2])/4;
    faces.push({ pts: ptsFinal, cor, corFinal, alpha: finalAlpha, tipo, shade, cx, cy, cz });
  }

  /* ---- Desenha bloco com rotação em Y ----
     bloco.ladoVazio: "esq" | "dir" | null (onde fica o espaço sem vão)
     bloco.rotateY: 0 ou Math.PI (virado para o usuário)
     bloco.originX, originZ: origem do canto inferior esquerdo do bloco
  */
  function desenharBloco(bloco) {
    const { L, A, P, vaos, corPerfil, corVidro, originX, originZ, rotateY, larguraUtil, ladoVazio } = bloco;
    const corP = corDoPerfil(corPerfil || "A definir");
    const corVglobal = corDoVidro(corVidro || "Incolor");

    function toGlobal(lx, ly, lz) {
      const cosR = Math.cos(rotateY), sinR = Math.sin(rotateY);
      const gx = lx * cosR + lz * sinR + originX;
      const gz = -lx * sinR + lz * cosR + originZ;
      return [gx, ly, gz];
    }

    function addBoxLocal(x, y, z, dx, dy, dz, cor, alpha, tipo) {
      const c = [
        toGlobal(x, y, z), toGlobal(x+dx, y, z), toGlobal(x+dx, y, z+dz), toGlobal(x, y, z+dz),
        toGlobal(x, y+dy, z), toGlobal(x+dx, y+dy, z), toGlobal(x+dx, y+dy, z+dz), toGlobal(x, y+dy, z+dz)
      ];
      addFace([c[4], c[5], c[6], c[7]], cor, alpha, tipo);
      addFace([c[0], c[1], c[2], c[3]], cor, alpha, tipo);
      addFace([c[0], c[1], c[5], c[4]], cor, alpha, tipo);
      addFace([c[3], c[2], c[6], c[7]], cor, alpha, tipo);
      addFace([c[0], c[3], c[7], c[4]], cor, alpha, tipo);
      addFace([c[1], c[2], c[6], c[5]], cor, alpha, tipo);
    }

    function addFaceLocal(pts, cor, alpha, tipo) {
      addFace(pts.map(p => toGlobal(p[0], p[1], p[2])), cor, alpha, tipo);
    }

    // Coords LOCAIS:
    //   x: de 0 a L (largura)
    //   y: de -A/2 a A/2 (altura)
    //   z: de 0 a P (profundidade) — frente em z=0 (vista pelo usuário)
    const yBottom = -A/2, yTop = A/2;
    const altBase = 50, altTopo = 50;
    const mw = 20, mh = 45;

    // Base e topo
    addBoxLocal(0, yBottom, 0, L, altBase, P, corP, 1, "perfil");
    addBoxLocal(0, yTop - altTopo, 0, L, altTopo, P, corP, 1, "perfil");
    // Montantes dos cantos
    addBoxLocal(0, yBottom + altBase, 0, mw, A - altBase - altTopo, mh, corP, 1, "perfil");
    addBoxLocal(L - mw, yBottom + altBase, 0, mw, A - altBase - altTopo, mh, corP, 1, "perfil");
    addBoxLocal(0, yBottom + altBase, P - mh, mw, A - altBase - altTopo, mh, corP, 1, "perfil");
    addBoxLocal(L - mw, yBottom + altBase, P - mh, mw, A - altBase - altTopo, mh, corP, 1, "perfil");

    // Vãos: distribuídos a partir do lado oposto ao vazio
    const areaUtil = larguraUtil || (L - 2 * mw);
    if (vaos && vaos.length) {
      const somaV = vaos.reduce((s, v) => s + (+v.largura || 0), 0) || 1;

      // xInicio: se ladoVazio="dir", começa da esquerda (mw); se "esq", termina na direita (L - mw)
      let xInicio, xFim;
      if (ladoVazio === "dir") { xInicio = mw; xFim = mw + areaUtil; }
      else if (ladoVazio === "esq") { xInicio = L - mw - areaUtil; xFim = L - mw; }
      else { xInicio = mw; xFim = L - mw; }

      let xCursor = xInicio;

      vaos.forEach(v => {
        const largV = +v.largura || 0;
        const largVisual = (largV / somaV) * areaUtil;
        const vx = xCursor;
        const vxEnd = xCursor + largVisual;
        const corV = corDoVidro(v.corVidro || corVidro || "Incolor");
        const isGaveta = v.tipo === "gaveta" || v.tipo === "gaveta_dupla";
        const isPortaDupla = v.tipo === "porta_dupla";

        // Montantes do vão
        addBoxLocal(vx, yBottom + altBase, 0, mw, A - altBase - altTopo, mh, corP, 1, "perfil");
        if (vxEnd - mw > vx + mw) {
          addBoxLocal(vxEnd - mw, yBottom + altBase, 0, mw, A - altBase - altTopo, mh, corP, 1, "perfil");
        }

        if (isGaveta) {
          const nGav = Math.max(1, +v.gavetasPortas || 1);
          const altGav = (A - altBase - altTopo - (nGav - 1) * 5) / nGav;
          for (let g = 0; g < nGav; g++) {
            const gy = yBottom + altBase + g * (altGav + 5);
            addFaceLocal([
              [vx + mw, gy, 20],
              [vxEnd - mw, gy, 20],
              [vxEnd - mw, gy + altGav, 20],
              [vx + mw, gy + altGav, 20]
            ], COR_GAVETA_FRENTE, 1, "gaveta");
            addBoxLocal(vx + mw + 20, gy + altGav - 40, 15, largVisual - 2*mw - 40, 2, 34, COR_PUXADOR, 1, "acessorio");
          }
        } else if (isPortaDupla) {
          const meio = (vx + vxEnd) / 2;
          const gap = 5;
          addFaceLocal([
            [vx + mw, yBottom + altBase, 20],
            [meio - gap/2, yBottom + altBase, 20],
            [meio - gap/2, yTop - altTopo, 20],
            [vx + mw, yTop - altTopo, 20]
          ], corV, OPACO ? 1 : 0.5, "vidro");
          addFaceLocal([
            [meio + gap/2, yBottom + altBase, 20],
            [vxEnd - mw, yBottom + altBase, 20],
            [vxEnd - mw, yTop - altTopo, 20],
            [meio + gap/2, yTop - altTopo, 20]
          ], corV, OPACO ? 1 : 0.5, "vidro");
          addBoxLocal(meio - 60, yTop - altTopo - 50, 15, 40, 2, 34, COR_PUXADOR, 1, "acessorio");
          addBoxLocal(meio + 20, yTop - altTopo - 50, 15, 40, 2, 34, COR_PUXADOR, 1, "acessorio");
        } else {
          addFaceLocal([
            [vx + mw, yBottom + altBase, 20],
            [vxEnd - mw, yBottom + altBase, 20],
            [vxEnd - mw, yTop - altTopo, 20],
            [vx + mw, yTop - altTopo, 20]
          ], corV, OPACO ? 1 : 0.5, "vidro");
          if (v.tipo === "porta_simples" || v.tipo === "cristaleira") {
            addBoxLocal(vx + mw + 20, yTop - altTopo - 50, 15, largVisual - 2*mw - 40, 2, 34, COR_PUXADOR, 1, "acessorio");
          }
        }
        xCursor = vxEnd;
      });
    } else {
      // Sem vãos: face de vidro cobrindo tudo
      let xIni = mw, xF = L - mw;
      if (ladoVazio === "dir") xF = mw + areaUtil;
      if (ladoVazio === "esq") xIni = L - mw - areaUtil;
      addFaceLocal([
        [xIni, yBottom + altBase, 20],
        [xF, yBottom + altBase, 20],
        [xF, yTop - altTopo, 20],
        [xIni, yTop - altTopo, 20]
      ], corVglobal, OPACO ? 1 : 0.5, "vidro");
    }
  }

  // ================= LAYOUT =================
  const L1 = +amb.largura || 0;
  const A1 = +amb.altura || 0;
  const P1 = +amb.profundidade || 0;
  const vaos1 = amb.vaos || [];

  if (!isL) {
    desenharBloco({
      L: L1, A: A1, P: P1, vaos: vaos1,
      corPerfil: amb.corPerfil, corVidro: amb.corVidro,
      originX: -L1/2, originZ: -P1/2,
      rotateY: 0,
      larguraUtil: L1 - 2*20,
      ladoVazio: null
    });
    return { L: L1, A: A1, P: P1, faces, isL: false, L1, A1, P1, L2: 0, P2: 0 };
  }

  // AMBIENTE EM L
  const L2 = +amb.largura_perna2 || 0;
  const A2 = +amb.altura_perna2 || A1;
  const P2 = +amb.profundidade_perna2 || P1;
  const vaos2 = amb.vaos_perna2 || [];

  // Bloco 1: frente virada para o usuário, vazio no LADO DIREITO (junta com bloco 2)
  //   X de -L1 a 0, Z de -P1/2 a P1/2
  const larguraUtil1 = Math.max(100, L1 - P2);
  desenharBloco({
    L: L1, A: A1, P: P1, vaos: vaos1,
    corPerfil: amb.corPerfil, corVidro: amb.corVidro,
    originX: -L1, originZ: -P1/2,
    rotateY: 0,
    larguraUtil: larguraUtil1 - 2*20,
    ladoVazio: "dir"   // ← vazio do lado direito (junta com bloco 2)
  });

  // Bloco 2: rotacionado 180°, vazio no LADO ESQUERDO (junta com bloco 1)
  //   Ocupa X de 0 a P2, Z de P1/2 a P1/2 + L2
  //   Com rotateY = PI, a largura L2 vai em -X a partir de P2... vamos calcular:
  //   toGlobal(lx, ly, lz) com rotY=PI: gx = -lx + originX, gz = -lz + originZ
  //   Queremos que x=0 (local, esquerda) mapeie para gx=0 (o canto de junção)
  //   Se originX = P2, então lx=0 → gx=P2, lx=L2 → gx=P2-L2 (errado)
  //   Queremos: lx=0 → gx=0 ; lx=P2 (fundo do bloco) → gx=P2
  //   Rotação 180° inverte: gx = P2 - lx. Então originX=P2, mas lx=0 → gx=P2 (frente do bloco 2 fica na direita)
  // Vamos colocar o BLOCO 2 atrás do bloco 1, colado no canto
  const larguraUtil2 = Math.max(100, L2 - P1);
  desenharBloco({
    L: L2, A: A2, P: P2, vaos: vaos2,
    corPerfil: amb.corPerfil, corVidro: amb.corVidro,
    originX: P2, originZ: P1/2 + L2,  // origem no canto de trás
    rotateY: Math.PI,                  // rotacionado 180°
    larguraUtil: larguraUtil2 - 2*20,
    ladoVazio: "esq"   // ← vazio do lado esquerdo (junta com bloco 1)
  });

  // Bounding box
  const minX = -L1, maxX = P2;
  const minZ = -P1/2, maxZ = P1/2 + L2;
  const Ltot = maxX - minX;
  const Ptot = maxZ - minZ;

  return {
    L: Ltot, A: Math.max(A1, A2), P: Ptot,
    faces, isL: true,
    L1, A1, P1, L2, A2, P2,
    larguraUtil1, larguraUtil2,
    minX, maxX, minZ, maxZ
  };
};

  /* =====================================================================
     RENDER
     ===================================================================== */
  Viewer.prototype.render = function () {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx, W = this.canvas.clientWidth, H = this.canvas.clientHeight;
    if (!W || !H) return;

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
    if (!state || !state.ambientes) return;
    const amb = state.ambientes[this.ambIdx];
    const msgEl = document.getElementById("viewerMsg"), hudEl = document.getElementById("viewerHud");

    if (!amb) {
      if (msgEl) { msgEl.style.display = "block"; msgEl.textContent = state.ambientes.length ? "Selecione um ambiente." : "Adicione ambientes para visualizar."; }
      if (hudEl) hudEl.textContent = "—";
      return;
    }
    if (msgEl) msgEl.style.display = "none";

    const opacoStr = this.vidroOpaco ? "💎 OPACO" : "💧 TRANSPARENTE";
    const tipoStr = amb.tipo === "L" ? "L" : "Reto";
    if (hudEl) hudEl.textContent = `${amb.nome} · ${tipoStr} · VIDRO ${opacoStr}`;

    // Auto-fit
    const dims = this._dimsAmbiente(amb);
    this._autoFit(dims.L, dims.A, dims.P);

    const dados = this._gerarFaces(amb);
    if (this.modo !== "wireframe") this._desenharSombraChao(ctx, dados);

    const proj = dados.faces.map(f => {
      let c = [f.cx, f.cy, f.cz];
      c = rotY(c, this.rotY); c = rotX(c, this.rotX);
      return { face: f, screenPts: f.pts.map(p => this._proj(p[0], p[1], p[2])), zReal: c[2] };
    });
    proj.sort((a, b) => b.zReal - a.zReal);

    proj.forEach(({ face, screenPts }) => {
      ctx.beginPath();
      ctx.moveTo(screenPts[0].x, screenPts[0].y);
      for (let i = 1; i < screenPts.length; i++) ctx.lineTo(screenPts[i].x, screenPts[i].y);
      ctx.closePath();

      const isVidro = (face.tipo === "vidro" || face.tipo === "gaveta");
      let alphaFinal = face.alpha || 1;
      if (isVidro) alphaFinal = this.vidroOpaco ? 1.0 : 0.55;

      if (this.modo === "wireframe") {
        ctx.strokeStyle = isVidro ? escurecer(face.cor, 0.5) : face.cor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        if (alphaFinal >= 1.0) ctx.fillStyle = face.corFinal;
        else ctx.fillStyle = this._aplicarAlpha(face.corFinal, alphaFinal);
        ctx.fill();

        if (!this.vidroOpaco && isVidro && this.modo !== "transp") {
          const p0 = screenPts[0], p2 = screenPts[2];
          const gradRefl = ctx.createLinearGradient(p0.x, p0.y, p2.x, p2.y);
          gradRefl.addColorStop(0.3, "rgba(255,255,255,0)");
          gradRefl.addColorStop(0.5, "rgba(255,255,255,0.2)");
          gradRefl.addColorStop(0.7, "rgba(255,255,255,0)");
          ctx.fillStyle = gradRefl; ctx.fill();
        }

        let corBorda = escurecer(face.cor, 0.6);
        ctx.strokeStyle = corBorda;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    if (this.cotas) this._desenharCotas(ctx, amb, dados);
    this._renderLegenda(amb);
  };

  Viewer.prototype._dimsAmbiente = function (amb) {
    if (amb.tipo === "L") {
      const L1 = +amb.largura || 0, P1 = +amb.profundidade || 0;
      const L2 = +amb.largura_perna2 || 0, P2 = +amb.profundidade_perna2 || 0;
      const A = Math.max(+amb.altura || 0, +amb.altura_perna2 || 0);
      return { L: L1 + P2, A, P: P1 + L2 };
    }
    return { L: +amb.largura || 0, A: +amb.altura || 0, P: +amb.profundidade || 0 };
  };

  Viewer.prototype._aplicarAlpha = function (hex, alpha) {
    const { r, g, b } = hexToRgb(hex);
    return alpha >= 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${alpha})`;
  };

  Viewer.prototype._desenharSombraChao = function (ctx, dados) {
    const { L, A, P } = dados;
    const chaoY = -A/2 - 5;
    const p1 = this._proj(-L/2, chaoY, -P/2);
    const p3 = this._proj(L/2, chaoY, P/2);
    const cx = (p1.x + p3.x) / 2, cy = (p1.y + p3.y) / 2;
    const rx = Math.abs(p3.x - p1.x) * 0.5, ry = Math.abs(p3.y - p1.y) * 0.5;
    if (!rx || !ry) return;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
    grad.addColorStop(0, "rgba(0,0,0,0.35)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(rx / Math.max(rx, ry), ry / Math.max(rx, ry));
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(rx, ry), 0, Math.PI * 2);
    ctx.fillStyle = grad; ctx.fill();
    ctx.restore();
  };

  /* =====================================================================
     COTAS — medidas grandes ATRÁS, medidas de vãos NA FRENTE
     ===================================================================== */
Viewer.prototype._desenharCotas = function (ctx, amb, dados) {
  const { isL, L1, A1, P1, L2, A2, P2, larguraUtil1, larguraUtil2 } = dados;

  ctx.save();
  ctx.strokeStyle = COR_COTA;
  ctx.fillStyle = COR_COTA;
  ctx.lineWidth = 1.5;
  ctx.font = "bold 11px system-ui,Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const yBot = -A1 / 2;

  if (!isL) {
    // Reto: cotas grandes atrás, cotas de vãos na frente
    const pL1 = this._proj(-L1/2, yBot - 90, P1/2 + 60);
    const pL2 = this._proj(L1/2, yBot - 90, P1/2 + 60);
    this._cotaLinha(ctx, pL1, pL2, `${L1}mm`, "h");

    const pA1 = this._proj(-L1/2 - 90, yBot, 0);
    const pA2 = this._proj(-L1/2 - 90, -yBot, 0);
    this._cotaLinha(ctx, pA1, pA2, `${A1}mm`, "v");

    if (amb.vaos && amb.vaos.length) {
      const soma = amb.vaos.reduce((s, v) => s + (+v.largura || 0), 0) || 1;
      const areaUtil = L1 - 2*20;
      let xCursor = -L1/2 + 20;
      amb.vaos.forEach(v => {
        const largV = +v.largura || 0;
        const largVisual = (largV / soma) * areaUtil;
        const v1 = this._proj(xCursor, yBot - 35, -P1/2 - 30);
        const v2 = this._proj(xCursor + largVisual, yBot - 35, -P1/2 - 30);
        this._cotaLinha(ctx, v1, v2, `${largV}mm`, "h", true);
        xCursor += largVisual;
      });
    }
    ctx.restore();
    return;
  }

  // === AMBIENTE EM L ===

  // Cota largura bloco 1 — atrás do bloco 1 (Z = P1/2 + 60)
  const pB1a = this._proj(-L1, yBot - 140, P1/2 + 60);
  const pB1b = this._proj(0, yBot - 140, P1/2 + 60);
  this._cotaLinha(ctx, pB1a, pB1b, `B1: ${L1}mm`, "h");

  // Cota largura bloco 2 — atrás do bloco 2 (Z = P1/2 + L2 + 60)
  const pB2a = this._proj(P2/2, yBot - 140, P1/2 + L2 + 60);
  const pB2b = this._proj(P2/2, yBot - 140, P1/2 + 60);
  this._cotaLinha(ctx, pB2a, pB2b, `B2: ${L2}mm`, "v");

  // Cota altura bloco 1 — esquerda (X = -L1 - 90)
  const pA1a = this._proj(-L1 - 90, yBot, 0);
  const pA1b = this._proj(-L1 - 90, -yBot, 0);
  this._cotaLinha(ctx, pA1a, pA1b, `${A1}mm`, "v");

  // Cota altura bloco 2 — direita (X = P2 + 90) se A2 != A1
  if (A2 !== A1) {
    const pA2a = this._proj(P2 + 90, yBot, P1/2 + L2/2);
    const pA2b = this._proj(P2 + 90, -yBot, P1/2 + L2/2);
    this._cotaLinha(ctx, pA2a, pA2b, `${A2}mm`, "v");
  }

  // Cotas dos vãos bloco 1 — na frente (Z = -P1/2 - 30)
  if (amb.vaos && amb.vaos.length) {
    const soma1 = amb.vaos.reduce((s, v) => s + (+v.largura || 0), 0) || 1;
    const areaUtil = larguraUtil1 - 2*20;
    // ladoVazio do bloco 1 = "dir" → começa em -L1 + 20 (esquerda)
    let xCursor = -L1 + 20;
    amb.vaos.forEach(v => {
      const largV = +v.largura || 0;
      const largVisual = (largV / soma1) * areaUtil;
      const v1 = this._proj(xCursor, yBot - 35, -P1/2 - 30);
      const v2 = this._proj(xCursor + largVisual, yBot - 35, -P1/2 - 30);
      this._cotaLinha(ctx, v1, v2, `${largV}mm`, "h", true);
      xCursor += largVisual;
    });
  }

  // Cotas dos vãos bloco 2 — na frente do bloco 2
  if (amb.vaos_perna2 && amb.vaos_perna2.length) {
    const soma2 = amb.vaos_perna2.reduce((s, v) => s + (+v.largura || 0), 0) || 1;
    const areaUtil2 = larguraUtil2 - 2*20;
    // Bloco 2 rotacionado 180° → o espaço vazio fica do lado esquerdo (junto ao canto)
    // Os vãos ficam do lado direito
    let xCursor = 0;
    // No espaço local com rotateY=PI: lx=0 → gx=P2 (origem), lx=L2 → gx=P2-L2
    // Como o bloco fica em X de 0 a P2 e o vazio em 0..P2, os vãos começam em X=P2-20 descendo
    // Melhor: usar coordenadas globais diretas
    const xVaoInicio = P2 - 20;
    let xLocal = xVaoInicio;
    amb.vaos_perna2.forEach(v => {
      const largV = +v.largura || 0;
      const largVisual = (largV / soma2) * areaUtil2;
      const v1 = this._proj(xLocal, yBot - 35, P1/2 + L2 + 30);
      const v2 = this._proj(xLocal - largVisual, yBot - 35, P1/2 + L2 + 30);
      this._cotaLinha(ctx, v1, v2, `${largV}mm`, "h", true);
      xLocal -= largVisual;
    });
  }

  ctx.restore();
};

  Viewer.prototype._cotaLinha = function (ctx, p1, p2, label, orientacao, pequena) {
    const cor = COR_COTA, setaSize = pequena ? 4 : 6;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = cor;
    ctx.lineWidth = pequena ? 1 : 1.5;
    ctx.stroke();

    const ang = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    ctx.fillStyle = cor;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p1.x + setaSize * Math.cos(ang - 0.4), p1.y + setaSize * Math.sin(ang - 0.4));
    ctx.lineTo(p1.x + setaSize * Math.cos(ang + 0.4), p1.y + setaSize * Math.sin(ang + 0.4));
    ctx.closePath(); ctx.fill();

    ctx.beginPath();
    ctx.moveTo(p2.x, p2.y);
    ctx.lineTo(p2.x - setaSize * Math.cos(ang - 0.4), p2.y - setaSize * Math.sin(ang - 0.4));
    ctx.lineTo(p2.x - setaSize * Math.cos(ang + 0.4), p2.y - setaSize * Math.sin(ang + 0.4));
    ctx.closePath(); ctx.fill();

    const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
    const fontSize = pequena ? 9 : 11;
    ctx.font = `bold ${fontSize}px system-ui,Arial`;
    const txtW = ctx.measureText(label).width + 8;
    const txtH = fontSize + 4;
    ctx.save();
    ctx.translate(mx, my);
    if (orientacao === "v") ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = COR_COTA_TXT;
    ctx.fillRect(-txtW/2, -txtH/2, txtW, txtH);
    ctx.strokeStyle = cor;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-txtW/2, -txtH/2, txtW, txtH);
    ctx.fillStyle = cor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 0, 0);
    ctx.restore();
  };

  Viewer.prototype._renderLegenda = function (amb) {
    const el = document.getElementById("viewerLegend");
    if (!el) return;
    const corP = corDoPerfil(amb.corPerfil);
    let html = `<span class="vl-item"><span class="lg-cor" style="background:${corP};border:1px solid #666"></span>Perfil ${escapeHtmlLocal(amb.corPerfil || "-")}</span>`;

    const coresVidro = new Set();
    (amb.vaos || []).forEach(v => coresVidro.add(v.corVidro || amb.corVidro || "A definir"));
    (amb.vaos_perna2 || []).forEach(v => coresVidro.add(v.corVidro || amb.corVidro || "A definir"));
    if (!coresVidro.size) coresVidro.add(amb.corVidro || "A definir");
    coresVidro.forEach(c => {
      const corV = corDoVidro(c);
      html += `<span class="vl-item"><span class="lg-cor" style="background:${corV};border:1px solid #666"></span>Vidro ${escapeHtmlLocal(c)}</span>`;
    });

    html += `<span class="vl-item"><span class="lg-cor" style="background:${COR_GAVETA_FRENTE}"></span>Gaveta</span>`;
    html += `<span class="vl-item"><span class="lg-cor" style="background:${COR_PUXADOR}"></span>Puxador</span>`;

    el.innerHTML = html;
  };

  global.viewer3D = new Viewer();
})(window);
