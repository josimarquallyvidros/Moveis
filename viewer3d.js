/* =====================================================================
   viewer3d.js — v18.1 (Visão Frontal Correta + Bloco 2 Esquerda-Direita)
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
    iso: { rotX: -0.35, rotY: -0.55, zoom: 1.0 },
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
    this.zoomManual = false;
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
    c.addEventListener("pointerdown", e => { 
      this.drag = { x: e.clientX, y: e.clientY, rx: this.rotX, ry: this.rotY }; 
      try { c.setPointerCapture(e.pointerId); } catch (_) {} 
    });
    c.addEventListener("pointermove", e => {
      if (!this.drag) return;
      const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y;
      this.rotY = this.drag.ry + dx * 0.008;
      this.rotX = Math.max(-1.5, Math.min(1.5, this.drag.rx + dy * 0.008));
      this.render();
    });
    c.addEventListener("pointerup", e => { 
      this.drag = null; 
      try { c.releasePointerCapture(e.pointerId); } catch (_) {} 
    });
    c.addEventListener("wheel", e => { 
      e.preventDefault(); 
      this.zoomManual = true;
      this.zoom = Math.max(0.01, Math.min(5, this.zoom * (e.deltaY < 0 ? 1.1 : 0.9))); 
      this.render(); 
    }, { passive: false });
    window.addEventListener("resize", () => { 
      this.resize(); 
      this.zoomManual = false;
      this.render(); 
    });
  };

  Viewer.prototype.reset = function () { 
    const p = PRESETS.iso; 
    this.rotX = p.rotX; 
    this.rotY = p.rotY; 
    this.zoom = p.zoom; 
    this.panX = 0; 
    this.panY = 0; 
    this.zoomManual = false;
    this.render(); 
  };
  
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

    // Faz a rotação acontecer em torno do centro da peça
    let p = rotY([
        x - (this._centerX || 0),
        y,
        z - (this._centerZ || 0)
    ], this.rotY);

    p = rotX(p, this.rotX);

    // Perspectiva mais suave e natural
    const zPersp = 5000 / (5000 + p[2] * 0.25);

    const cx = this.canvas.clientWidth / 2 + this.panX;
    const cy = this.canvas.clientHeight / 2 + this.panY;

    return {
        x: cx + p[0] * this.zoom * zPersp,
        y: cy + p[1] * this.zoom * zPersp,
        z: p[2]
    };
};

  Viewer.prototype._autoFit = function (dados) {
    const W = this.canvas.clientWidth, H = this.canvas.clientHeight;
    if (!W || !H || !dados || !dados.faces || !dados.faces.length) return;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    dados.faces.forEach(f => {
      f.pts.forEach(p => {
                 let proj = rotY([
             p[0] - (this._centerX || 0),
             p[1],
             p[2] - (this._centerZ || 0)
         ], this.rotY);
         proj = rotX(proj, this.rotX);
         const zPersp = 5000 / (5000 + proj[2] * 0.25);
        const px = proj[0] * zPersp;
        const py = proj[1] * zPersp;
        
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      });
    });

    if (!isFinite(minX) || !isFinite(maxX) || !isFinite(minY) || !isFinite(maxY)) return;

    const larguraProjetada = Math.max(1, maxX - minX);
    const alturaProjetada = Math.max(1, maxY - minY);

    const fitZoom = Math.min(W / larguraProjetada, H / alturaProjetada) * 0.85;
    
    if (!isFinite(fitZoom) || fitZoom <= 0.01) {
      this.zoom = 1;
    } else {
      this.zoom = Math.min(3, fitZoom);
    }

    this.panX = 0;
    this.panY = 0;
  };

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

    function addBox(x, y, z, dx, dy, dz, cor, alpha, tipo) {
      const c = [
        [x, y, z], [x+dx, y, z], [x+dx, y, z+dz], [x, y, z+dz],
        [x, y+dy, z], [x+dx, y+dy, z], [x+dx, y+dy, z+dz], [x, y+dy, z+dz]
      ];
      addFace([c[4], c[5], c[6], c[7]], cor, alpha, tipo);
      addFace([c[0], c[1], c[2], c[3]], cor, alpha, tipo);
      addFace([c[0], c[1], c[5], c[4]], cor, alpha, tipo);
      addFace([c[3], c[2], c[6], c[7]], cor, alpha, tipo);
      addFace([c[0], c[3], c[7], c[4]], cor, alpha, tipo);
      addFace([c[1], c[2], c[6], c[5]], cor, alpha, tipo);
    }

            function desenharVao(x0, x1, z0, z1, yBot, yTop, vao, corPerfil, corVidroAmb, orientacao, inverter) {
      const corP = corDoPerfil(corPerfil || "A definir");
      const corV = corDoVidro(vao.corVidro || corVidroAmb || "Incolor");
      
      // MEDIDAS DO SISTEMA
      const visivel = 25; 
      const lateral = 45; 
      
      // MEDIDAS DO PERFIL DO VIDRO (BATENTE)
      const batenteLargura = 45; 
      const batenteProfundidade = 19; 
      
      // FOLGAS
      const folgaBorda = 0; // Era 10. Zerando, o batente vai até a borda do vidro
      const folgaVao = 2;   // Era 5. Diminuindo, o batente de um vão quase encosta no outro
      const halfVisivel = visivel / 2; 
      
      const isGaveta = vao.tipo === "gaveta" || vao.tipo === "gaveta_dupla";
      const isPD = vao.tipo === "porta_dupla";
      const isNicho = vao.tipo === "nicho";

      const xStart = x0 + (folgaVao / 2);
      const xEnd = x1 - (folgaVao / 2);
      const zStart = z0 + (folgaVao / 2);
      const zEnd = z1 - (folgaVao / 2);

      if (orientacao === "Z") {
        // --- ESTRUTURA PRINCIPAL ---
        addBox(x0, yBot, z0, lateral, yTop - yBot, halfVisivel, corP, 1, "perfil");
        addBox(x0, yBot, z1 - halfVisivel, lateral, yTop - yBot, halfVisivel, corP, 1, "perfil");
        addBox(x1 - lateral, yBot, z0, lateral, yTop - yBot, halfVisivel, corP, 1, "perfil");
        addBox(x1 - lateral, yBot, z1 - halfVisivel, lateral, yTop - yBot, halfVisivel, corP, 1, "perfil");

        // O batente base
        // const faceBatente = inverter ? (x1 - lateral + 2) : (x0 + lateral - 2);
         const faceBatente = inverter ? (x1 - lateral + 2 + 20) : (x0 + lateral + 2 + 20);
     

         
        // O VIDRO AGORA FICA TOTALMENTE NA FRENTE DO BATENTE (Faceando a moldura)
        // Se for inverter, a frente é no X menor (subtrai). Se não, é no X maior (soma).
        // const faceVidro = inverter ? (faceBatente - batenteProfundidade) : (faceBatente + batenteProfundidade);
        const faceVidro = inverter ? (faceBatente + batenteProfundidade + 5) : (faceBatente - batenteProfundidade + 5);
         
       //  const vxBot = yBot + folgaBorda;
        // const vxTop = yTop - folgaBorda;
        // const vzStart = zStart + halfVisivel + folgaBorda;
        // const vzEnd = zEnd - halfVisivel - folgaBorda;

               // Medidas do vidro: Vão total menos 8mm de largura (4mm cada lado) e 20mm de altura (10mm cima/baixo)
        const vxBot = yBot + 10;
        const vxTop = yTop - 10;
        const vzStart = z0 + 4;
        const vzEnd = z1 - 4;
        
        if (isGaveta) {
          const nG = Math.max(1, +vao.gavetasPortas || 1);
          const altTotalUtil = (yTop - yBot) - 20; // 20mm de desconto (10 em cima, 10 embaixo)
          const altG = (altTotalUtil - (nG-1)*folgaVao) / nG;
          
          for (let g = 0; g < nG; g++) {
            const gy = yBot + 10 + g*(altG + folgaVao);
            
            // Moldura da gaveta (Batente)
            addBox(faceBatente, gy, z0, batenteProfundidade, altG, batenteLargura, corP, 1, "perfil");
            addBox(faceBatente, gy, z1 - batenteLargura, batenteProfundidade, altG, batenteLargura, corP, 1, "perfil");
            addBox(faceBatente, gy, z0 + batenteLargura, batenteProfundidade, batenteLargura, (z1 - z0) - 2*batenteLargura, corP, 1, "perfil");
            addBox(faceBatente, gy + altG - batenteLargura, z0 + batenteLargura, batenteProfundidade, batenteLargura, (z1 - z0) - 2*batenteLargura, corP, 1, "perfil");
            
            // Frente da gaveta no mesmo plano do vidro
            addFace([[faceVidro, gy, vzStart],[faceVidro, gy, vzEnd],[faceVidro, gy+altG, vzEnd],[faceVidro, gy+altG, vzStart]], COR_GAVETA_FRENTE, 1, "gaveta");
            
            // Perfil horizontal da gaveta (Frente) - Posicionado na face do vidro
            const divX = inverter ? (faceVidro + 2) : (faceVidro - 2);
            // addBox(divX, gy - (folgaVao/2), z0, 10, folgaVao, z1 - z0, corP, 1, "perfil");
            // Perfil de divisão horizontal (alinhado com a estrutura base)
            // x0 é a face frontal da estrutura. O perfil avança 45mm para dentro.
            addBox(x1 - 45, gy - 12.5, z0, 45, 25, z1 - z0, corP, 1, "perfil");
             
            const boxX = inverter ? (faceVidro + 2) : (faceVidro - 2);
            addBox(boxX, gy+altG-40, vzStart+20, 4, 2, (vzEnd-vzStart)-40, COR_PUXADOR, 1, "acessorio");
          }
        } else if (isPD) {
          const meio = (z0+z1)/2;
          
          // Batente na posição normal
          addBox(faceBatente, vxBot, vzStart, batenteProfundidade, vxTop - vxBot, batenteLargura, corP, 1, "perfil");
          addBox(faceBatente, vxBot, vzEnd - batenteLargura, batenteProfundidade, vxTop - vxBot, batenteLargura, corP, 1, "perfil");
          addBox(faceBatente, vxBot, vzStart + batenteLargura, batenteProfundidade, batenteLargura, (vzEnd-vzStart) - 2*batenteLargura, corP, 1, "perfil");
          addBox(faceBatente, vxTop - batenteLargura, vzStart + batenteLargura, batenteProfundidade, batenteLargura, (vzEnd-vzStart) - 2*batenteLargura, corP, 1, "perfil");
          
          // Vidros na frente
          addFace([[faceVidro, vxBot, vzStart],[faceVidro, vxBot, meio-2],[faceVidro, vxTop, meio-2],[faceVidro, vxTop, vzStart]], corV, OPACO?1:0.5, "vidro");
          addFace([[faceVidro, vxBot, meio+2],[faceVidro, vxBot, vzEnd],[faceVidro, vxTop, vzEnd],[faceVidro, vxTop, meio+2]], corV, OPACO?1:0.5, "vidro");
          
          addBox(meio - halfVisivel, yBot, z0, visivel, yTop - yBot, lateral, corP, 1, "perfil");
          
          const boxX = inverter ? (faceVidro + 2) : (faceVidro - 2);
          addBox(boxX, yTop-60, meio-60, 4, 40, 3, COR_PUXADOR, 1, "acessorio");
          addBox(boxX, yTop-60, meio+20, 4, 40, 3, COR_PUXADOR, 1, "acessorio");
        } else if (isNicho) {
          // Nicho
        } else {
          // Batente Simples
          addBox(faceBatente, vxBot, vzStart, batenteProfundidade, vxTop - vxBot, batenteLargura, corP, 1, "perfil");
          addBox(faceBatente, vxBot, vzEnd - batenteLargura, batenteProfundidade, vxTop - vxBot, batenteLargura, corP, 1, "perfil");
          addBox(faceBatente, vxBot, vzStart + batenteLargura, batenteProfundidade, batenteLargura, (vzEnd-vzStart) - 2*batenteLargura, corP, 1, "perfil");
          addBox(faceBatente, vxTop - batenteLargura, vzStart + batenteLargura, batenteProfundidade, batenteLargura, (vzEnd-vzStart) - 2*batenteLargura, corP, 1, "perfil");
          
          // Vidro na frente
          addFace([[faceVidro, vxBot, vzStart],[faceVidro, vxBot, vzEnd],[faceVidro, vxTop, vzEnd],[faceVidro, vxTop, vzStart]], corV, OPACO?1:0.5, "vidro");
          
          if (vao.tipo === "porta_simples" || vao.tipo === "cristaleira") {
            const boxX = inverter ? (faceVidro + 2) : (faceVidro - 2);
            addBox(boxX, yTop-60, vzStart+20, 4, 40, 3, COR_PUXADOR, 1, "acessorio");
          }
        }
      } else {
        // === ORIENTAÇÃO X (BLOCO 2) ===
        addBox(x0, yBot, z0, halfVisivel, yTop - yBot, lateral, corP, 1, "perfil");
        addBox(x1 - halfVisivel, yBot, z0, halfVisivel, yTop - yBot, lateral, corP, 1, "perfil");
        addBox(x0, yBot, z1 - lateral, halfVisivel, yTop - yBot, lateral, corP, 1, "perfil");
        addBox(x1 - halfVisivel, yBot, z1 - lateral, halfVisivel, yTop - yBot, lateral, corP, 1, "perfil");

       // const faceBatente = inverter ? (z1 - lateral + 2) : (z0 + lateral - 2);
         const faceBatente = inverter ? (z1 - lateral + 2 + 20) : (z0 + lateral - 2 + 20);
  

         
       // const faceVidro = inverter ? (faceBatente - batenteProfundidade) : (faceBatente + batenteProfundidade);
        const faceVidro = inverter ? (faceBatente + batenteProfundidade + 5) : (faceBatente - batenteProfundidade + 5);
         
        //  const vxBot = yBot + folgaBorda;
         // const vxTop = yTop - folgaBorda;
         // const vxStart = xStart + halfVisivel + folgaBorda;
         // const vxEnd = xEnd - halfVisivel - folgaBorda;
                 // Medidas do vidro: Vão total menos 8mm de largura (4mm cada lado) e 20mm de altura (10mm cima/baixo)
        const vxBot = yBot + 10;
        const vxTop = yTop - 10;
        const vxStart = x0 + 4;
        const vxEnd = x1 - 4;
        
        if (isGaveta) {
          const nG = Math.max(1, +vao.gavetasPortas || 1);
          const altTotalUtil = (yTop - yBot) - 20; 
          const altG = (altTotalUtil - (nG-1)*folgaVao) / nG;
          
          for (let g = 0; g < nG; g++) {
            const gy = yBot + 10 + g*(altG + folgaVao);
            
            // Moldura da gaveta (Batente)
            addBox(x0, gy, faceBatente, batenteLargura, altG, batenteProfundidade, corP, 1, "perfil");
            addBox(x1 - batenteLargura, gy, faceBatente, batenteLargura, altG, batenteProfundidade, corP, 1, "perfil");
            addBox(x0 + batenteLargura, gy, faceBatente, (x1 - x0) - 2*batenteLargura, batenteLargura, batenteProfundidade, corP, 1, "perfil");
            addBox(x0 + batenteLargura, gy + altG - batenteLargura, faceBatente, (x1 - x0) - 2*batenteLargura, batenteLargura, batenteProfundidade, corP, 1, "perfil");

            addFace([[vxStart, gy, faceVidro],[vxEnd, gy, faceVidro],[vxEnd, gy+altG, faceVidro],[vxStart, gy+altG, faceVidro]], COR_GAVETA_FRENTE, 1, "gaveta");
            
            // Perfil horizontal da gaveta (Frente)
            const divZ = inverter ? (faceVidro + 2) : (faceVidro - 2);
            //addBox(x0, gy - (folgaVao/2), divZ, x1 - x0, folgaVao, 10, corP, 1, "perfil");
            // Perfil de divisão horizontal (alinhado com a estrutura base)
               // z0 é a face frontal da estrutura. O perfil avança 45mm para dentro.
              addBox(x0, gy - 12.5, z1 - 45, x1 - x0, 25, 45, corP, 1, "perfil");

            
            const boxZ = inverter ? (faceVidro + 2) : (faceVidro - 2);
            addBox(vxStart+20, gy+altG-40, boxZ, (vxEnd-vxStart)-40, 2, 4, COR_PUXADOR, 1, "acessorio");
          }
        } else if (isPD) {
          const meio = (x0+x1)/2;
          addBox(vxStart, vxBot, faceBatente, batenteLargura, vxTop - vxBot, batenteProfundidade, corP, 1, "perfil");
          addBox(vxEnd - batenteLargura, vxBot, faceBatente, batenteLargura, vxTop - vxBot, batenteProfundidade, corP, 1, "perfil");
          addBox(vxStart + batenteLargura, vxBot, faceBatente, (vxEnd-vxStart) - 2*batenteLargura, batenteLargura, batenteProfundidade, corP, 1, "perfil");
          addBox(vxStart + batenteLargura, vxTop - batenteLargura, faceBatente, (vxEnd-vxStart) - 2*batenteLargura, batenteLargura, batenteProfundidade, corP, 1, "perfil");
          
          addFace([[vxStart, vxBot, faceVidro],[meio-2, vxBot, faceVidro],[meio-2, vxTop, faceVidro],[vxStart, vxTop, faceVidro]], corV, OPACO?1:0.5, "vidro");
          addFace([[meio+2, vxBot, faceVidro],[vxEnd, vxBot, faceVidro],[vxEnd, vxTop, faceVidro],[meio+2, vxTop, faceVidro]], corV, OPACO?1:0.5, "vidro");
          
          addBox(meio - halfVisivel, yBot, z0, visivel, yTop - yBot, lateral, corP, 1, "perfil");
          
          const boxZ = inverter ? (faceVidro + 2) : (faceVidro - 2);
          addBox(meio-60, yTop-60, boxZ, 3, 40, 4, COR_PUXADOR, 1, "acessorio");
          addBox(meio+20, yTop-60, boxZ, 3, 40, 4, COR_PUXADOR, 1, "acessorio");
        } else if (isNicho) {
          // Nicho
        } else {
          addBox(vxStart, vxBot, faceBatente, batenteLargura, vxTop - vxBot, batenteProfundidade, corP, 1, "perfil");
          addBox(vxEnd - batenteLargura, vxBot, faceBatente, batenteLargura, vxTop - vxBot, batenteProfundidade, corP, 1, "perfil");
          addBox(vxStart + batenteLargura, vxBot, faceBatente, (vxEnd-vxStart) - 2*batenteLargura, batenteLargura, batenteProfundidade, corP, 1, "perfil");
          addBox(vxStart + batenteLargura, vxTop - batenteLargura, faceBatente, (vxEnd-vxStart) - 2*batenteLargura, batenteLargura, batenteProfundidade, corP, 1, "perfil");
          
          addFace([[vxStart, vxBot, faceVidro],[vxEnd, vxBot, faceVidro],[vxEnd, vxTop, faceVidro],[vxStart, vxTop, faceVidro]], corV, OPACO?1:0.5, "vidro");
          
          if (vao.tipo === "porta_simples" || vao.tipo === "cristaleira") {
            const boxZ = inverter ? (faceVidro + 2) : (faceVidro - 2);
            addBox(vxStart+20, yTop-60, boxZ, 3, 40, 4, COR_PUXADOR, 1, "acessorio");
          }
        }
      }
    }
     
    const L1 = +amb.largura || 0;
    const A1 = +amb.altura || 0;
    const P1 = +amb.profundidade || 0;
    const vaos1 = amb.vaos || [];

    const isL_ = (amb.tipo === "L");
    const L2 = isL_ ? (+amb.largura_perna2 || 0) : 0;
    const A2 = isL_ ? (+amb.altura_perna2 || A1) : A1;
    const P2 = isL_ ? (+amb.profundidade_perna2 || P1) : 0;
    const vaos2 = isL_ ? (amb.vaos_perna2 || []) : [];

    const corP = corDoPerfil(amb.corPerfil);
    const altBase = 50, altTopo = 50;
    const mh = 45;

    // === BLOCO 1 (Esquerda) ===
    const zIniB1 = isL_ ? P2 : 0;
    const yBot1 = -A1/2, yTop1 = A1/2;

    addBox(0, yBot1, 0, P1, altBase, L1, corP, 1, "perfil");
    addBox(0, yTop1 - altTopo, 0, P1, altTopo, L1, corP, 1, "perfil");
    
    addBox(0, yBot1 + altBase, 0, mh, A1 - altBase - altTopo, 20, corP, 1, "perfil");
    addBox(0, yBot1 + altBase, L1 - 20, mh, A1 - altBase - altTopo, 20, corP, 1, "perfil");
    addBox(P1 - mh, yBot1 + altBase, 0, mh, A1 - altBase - altTopo, 20, corP, 1, "perfil");
    addBox(P1 - mh, yBot1 + altBase, L1 - 20, mh, A1 - altBase - altTopo, 20, corP, 1, "perfil");

    const areaUtil1 = Math.max(0, L1 - 40 - zIniB1);
    if (vaos1.length && areaUtil1 > 0) {
      const soma = vaos1.reduce((s, v) => s + (+v.largura || 0), 0) || 1;
          let zC = zIniB1 + 20;
      vaos1.forEach(v => {
        const largV = +v.largura || 0;
        const largVis = (largV / soma) * areaUtil1;
        
        // Ajuste para Cristaleira (Altura e Profundidade próprias)
        let yBotC = yBot1 + altBase;
        let yTopC = yTop1 - altTopo;
        let z0C = zC;
        let z1C = zC + largVis;
        let p1C = P1;
        
        if (v.tipo === "cristaleira") {
          if (v.altura_propria) {
            yBotC = yBot1 + altBase; // Mantém a base alinhada com o chão
            yTopC = yBotC + (+v.altura_propria);
          }
          if (v.profundidade_propria) {
            p1C = +v.profundidade_propria;
          }
        }

        desenharVao(0, p1C, z0C, z1C, yBotC, yTopC, v, amb.corPerfil, amb.corVidro, "Z", true);
        zC += largVis;
      });
    }

    // === BLOCO 2 (Direita) ===
    // Começa da esquerda (junto ao bloco 1) e vai para a direita
    if (isL_ && L2 > 0) {
      const xIniB2 = P1;
      const yBot2 = -A2/2, yTop2 = A2/2;

      if (L2 > xIniB2) {
        addBox(xIniB2, yBot2, 0, L2 - xIniB2, altBase, P2, corP, 1, "perfil");
        addBox(xIniB2, yTop2 - altTopo, 0, L2 - xIniB2, altTopo, P2, corP, 1, "perfil");
        
        addBox(xIniB2, yBot2 + altBase, 0, 20, A2 - altBase - altTopo, mh, corP, 1, "perfil");
        addBox(xIniB2, yBot2 + altBase, P2 - mh, 20, A2 - altBase - altTopo, mh, corP, 1, "perfil");
        addBox(L2 - 20, yBot2 + altBase, 0, 20, A2 - altBase - altTopo, mh, corP, 1, "perfil");
        addBox(L2 - 20, yBot2 + altBase, P2 - mh, 20, A2 - altBase - altTopo, mh, corP, 1, "perfil");

        const areaUtil2 = Math.max(0, L2 - 40 - xIniB2);
        if (vaos2.length && areaUtil2 > 0) {
          const soma2 = vaos2.reduce((s, v) => s + (+v.largura || 0), 0) || 1;
           let xC = xIniB2 + 20; // Começa da esquerda (junto ao bloco 1)
          vaos2.forEach(v => {
            const largV = +v.largura || 0;
            const largVis = (largV / soma2) * areaUtil2;
            
            // Ajuste para Cristaleira (Altura e Profundidade próprias)
            let yBotC = yBot2 + altBase;
            let yTopC = yTop2 - altTopo;
            let x0C = xC;
            let x1C = xC + largVis;
            let p2C = P2;
            
            if (v.tipo === "cristaleira") {
              if (v.altura_propria) {
                yBotC = yBot2 + altBase;
                yTopC = yBotC + (+v.altura_propria);
              }
              if (v.profundidade_propria) {
                p2C = +v.profundidade_propria;
              }
            }

            desenharVao(x0C, x1C, 0, p2C, yBotC, yTopC, v, amb.corPerfil, amb.corVidro, "X", true);
            xC += largVis;
          });
        }
      }
    }

    const boundsL = isL_ ? Math.max(L1, L2) : L1;
    const boundsP = isL_ ? Math.max(P1, P2) : P1;
    return {
      L: boundsL, A: Math.max(A1, A2), P: boundsP,
      faces, isL: isL_, L1, A1, P1, L2, A2, P2
    };
  };

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
    if (hudEl) hudEl.textContent = `${amb.nome} · ${amb.tipo === "L" ? "L" : "Reto"} · VIDRO ${opacoStr}`;

    const dados = this._gerarFaces(amb);

// Centraliza a rotação no centro real da cozinha
this._centerX = dados.isL ? dados.L2 / 2 : 0;
this._centerZ = dados.isL ? dados.L1 / 2 : 0;

if (!this.zoomManual) {
    this._autoFit(dados);
}

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

        ctx.strokeStyle = escurecer(face.cor, 0.6);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    });

    if (this.cotas) this._desenharCotas(ctx, amb, dados);
    this._renderLegenda(amb);
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

  Viewer.prototype._desenharCotas = function (ctx, amb, dados) {
    const { isL, L1, A1, P1, L2, A2, P2 } = dados;
    ctx.save();
    ctx.strokeStyle = COR_COTA;
    ctx.fillStyle = COR_COTA;
    ctx.lineWidth = 1.5;
    ctx.font = "bold 11px system-ui,Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (!isL) {
      const pL1 = this._proj(-P1/2, A1/2 + 60, -L1/2);
      const pL2 = this._proj(-P1/2, A1/2 + 60, L1/2);
      this._cotaLinha(ctx, pL1, pL2, `${L1}mm`, "h");
      
      const pA1 = this._proj(-P1/2 - 90, -A1/2, 0);
      const pA2 = this._proj(-P1/2 - 90, A1/2, 0);
      this._cotaLinha(ctx, pA1, pA2, `${A1}mm`, "v");
      
      if (amb.vaos && amb.vaos.length) {
        const soma = amb.vaos.reduce((s, v) => s + (+v.largura || 0), 0) || 1;
        const areaUtil = L1 - 40;
        let zC = -L1/2 + 20;
        amb.vaos.forEach(v => {
          const largV = +v.largura || 0;
          const largVis = (largV / soma) * areaUtil;
          const v1 = this._proj(-P1/2, A1/2 + 20, zC);
          const v2 = this._proj(-P1/2, A1/2 + 20, zC + largVis);
          this._cotaLinha(ctx, v1, v2, `${largV}mm`, "h", true);
          this._labelVao(ctx, -P1/2 - 15, 0, zC + largVis/2, nomeTipoVao(v.tipo), v.descricao);
          zC += largVis;
        });
      }
      ctx.restore();
      return;
    }

    // === AMBIENTE EM L ===
    
       // 1. Cota B1 (Largura Total do Bloco 1) - No topo do bloco
    // Y = A1/2 (altura máxima do teto), Z = L1/2 (centralizado na profundidade)
  //  const pB1a = this._proj(0, A1/2, L1/2); 
  //  const pB1b = this._proj(0, A1/2, -L1/2);   
  //  this._cotaLinha(ctx, pB1a, pB1b, `B1: ${L1}mm`, "h");
    const pB1a = this._proj(0, -A1 + 60, 0);
   const pB1b = this._proj(0, -A1 + 60, L1);
   this._cotaLinha(ctx, pB1a, pB1b, `B1: ${L1}mm`, "h");

    // 2. Cota B2 (Largura Total do Bloco 2) - Mantida
     //  const pB2a = this._proj(P1, -A2/2 + 40, P2);
     //  const pB2b = this._proj(L2, -A2/2 + 40, P2);
    //   this._cotaLinha(ctx, pB2a, pB2b, `B2: ${L2}mm`, "h");
     const pB2a = this._proj(0, -A2 + 60, 0);
     const pB2b = this._proj(L2, -A2 + 60, 0);
    this._cotaLinha(ctx, pB2a, pB2b, `B2: ${L2}mm`, "h");

        // 3. Cota Altura - Extremidade Esquerda do Bloco 1
    // Mudamos o Z para L1 (final do bloco) e o X para -15 (para ficar visível na parte de fora)
    const pA1a = this._proj(-15, -A1/2, L1);
    const pA1b = this._proj(-15, A1/2, L1);
    this._cotaLinha(ctx, pA1a, pA1b, `${A1}mm`, "v");
     
      // 3.1 Cota Altura - Bloco 2 (Extremidade Direita)
    const pA2a = this._proj(L2 + 15, -A2/2, P2); // L2 + 15 joga para fora na direita
    const pA2b = this._proj(L2 + 15, A2/2, P2);
    this._cotaLinha(ctx, pA2a, pA2b, `${A2}mm`, "v");

          // 4. Vãos Bloco 1 (Frente e abaixo)
    if (amb.vaos && amb.vaos.length) {
      const zIniB1 = P2;
      const areaUtil = Math.max(0, L1 - 40 - zIniB1);
      const soma = amb.vaos.reduce((s, v) => s + (+v.largura || 0), 0) || 1;
      
      // 1. Inverte a ordem do array para que o primeiro vão da lista 
      // seja desenhado por último (colado no Bloco 2)
      const vaosInvertidos = [...amb.vaos].reverse();
      
      // 2. Começa do fundo (L1) e vai em direção à frente (zIniB1)
      let zC = L1 - 20; 
      
      vaosInvertidos.forEach(v => {
        const largV = +v.largura || 0;
        const largVis = (largV / soma) * areaUtil;
        
        const v1 = this._proj(P1, A1/2 + 20, zC);
        const v2 = this._proj(P1, A1/2 + 20, zC - largVis);
        this._cotaLinha(ctx, v1, v2, `${largV}mm`, "h", true);
        
        this._labelVao(ctx, P1 + 15, 0, zC - largVis/2, nomeTipoVao(v.tipo), v.descricao);
        
        zC -= largVis; // Anda para a esquerda/frente
      });
    }
     
    // 5. Vãos Bloco 2 (Frente e abaixo) - Mantido
    if (amb.vaos_perna2 && amb.vaos_perna2.length) {
      const xIniB2 = P1;
      const areaUtil = Math.max(0, L2 - 40 - xIniB2);
      const soma = amb.vaos_perna2.reduce((s, v) => s + (+v.largura || 0), 0) || 1;
      let xC = xIniB2 + 20;
      amb.vaos_perna2.forEach(v => {
        const largV = +v.largura || 0;
        const largVis = (largV / soma) * areaUtil;
        
        const v1 = this._proj(xC, A2/2 + 20, P2);
        const v2 = this._proj(xC + largVis, A2/2 + 20, P2);
        this._cotaLinha(ctx, v1, v2, `${largV}mm`, "h", true);
        
        this._labelVao(ctx, xC + largVis/2, 0, P2 + 15, nomeTipoVao(v.tipo), v.descricao);
        xC += largVis;
      });
    }

    ctx.restore();
  };
   
  Viewer.prototype._labelVao = function (ctx, x, y, z, nome, desc) {
    const p = this._proj(x, y, z);
    
    const txt = desc ? `${nome} ${desc}` : nome;
    ctx.font = "bold 10px system-ui,Arial";
    const w = ctx.measureText(txt).width + 12;
    
    ctx.fillStyle = "rgba(11, 18, 32, 0.85)";
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(p.x - w/2, p.y - 10, w, 20, 4);
    } else {
      ctx.rect(p.x - w/2, p.y - 10, w, 20); 
    }
    ctx.fill();
    
    ctx.strokeStyle = COR_COTA;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(txt, p.x, p.y);
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
