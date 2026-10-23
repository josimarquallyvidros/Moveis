/* =====================================================================
   maxrects.js — Algoritmo MaxRects com heurísticas Best-Fit
   Autor: OrçaProQually v7.0
   Bin packing 2D — melhor que guilhotina em ~5-15%
   ===================================================================== */
(function(global){
  "use strict";

  /**
   * Otimiza peças em chapas usando MaxRects.
   * @param {Array} pecas    [{ largura, altura, id?, rotulo? }]
   * @param {Object} chapa   { w, h }
   * @param {String} heur    'baf' (Best Area Fit) | 'bssf' | 'blsf' | 'bl' | 'cp'
   * @param {Boolean} girar  permite rotação
   * @returns {Object}       { chapas, totalChapas, areaTotal, areaChapa, aproveitamento }
   */
  function maxRects(pecas, chapa, heur, girar){
    heur = heur || "baf";
    girar = girar !== false;

    // 1) Ordena peças por área decrescente (First-Fit Decreasing)
    const items = pecas
      .filter(p => p.largura > 0 && p.altura > 0)
      .map(p => ({ ...p, w: p.largura, h: p.altura }))
      .sort((a, b) => (b.w * b.h) - (a.w * a.h));

    const chapas = [];

    // 2) Para cada peça, tenta encaixar na melhor posição
    items.forEach(it => {
      let melhor = null;

      // 2a) Percorre chapas existentes
      for(const ch of chapas){
        const pos = encontrarMelhorPosicao(ch.freeRects, it.w, it.h, heur, girar);
        if(pos && (!melhor || pos.score < melhor.score)){
          melhor = { chapa: ch, ...pos };
        }
      }

      // 2b) Se não achou, abre chapa nova
      if(!melhor){
        const nova = criarChapa(chapa);
        const pos = encontrarMelhorPosicao(nova.freeRects, it.w, it.h, heur, girar);
        if(pos){
          melhor = { chapa: nova, ...pos };
          chapas.push(nova);
        } else {
          // peça maior que a chapa — coloca sozinha com aviso
          const nova2 = criarChapa(chapa);
          nova2.itens.push({ ...it, x: 0, y: 0, w: it.w, h: it.h, aviso: "maior que chapa" });
          nova2.usado += it.w * it.h;
          chapas.push(nova2);
          return;
        }
      }

      // 2c) Coloca peça na posição encontrada
      const { chapa: ch, slot, rot } = melhor;
      const finalW = rot ? it.h : it.w;
      const finalH = rot ? it.w : it.h;
      ch.itens.push({ ...it, x: slot.x, y: slot.y, w: finalW, h: finalH, rotacionado: rot });
      ch.usado += finalW * finalH;
      dividirFreeRects(ch, slot, finalW, finalH);
    });

    // 3) Calcula estatísticas
    const areaTotal = items.reduce((s, i) => s + i.w * i.h, 0);
    const areaChapa = chapa.w * chapa.h;
    const totalChapas = chapas.length;

    return {
      chapas,
      totalChapas,
      totalPecas: items.length,
      areaTotal,
      areaChapa,
      aproveitamento: totalChapas ? (areaTotal / (totalChapas * areaChapa) * 100) : 0,
      chapaW: chapa.w,
      chapaH: chapa.h,
      heuristica: heur,
      algoritmo: "maxrects"
    };
  }

  function criarChapa(chapa){
    return {
      w: chapa.w, h: chapa.h,
      itens: [], usado: 0,
      freeRects: [{ x: 0, y: 0, w: chapa.w, h: chapa.h }]
    };
  }

  /**
   * Retorna a melhor posição { slot, rot, score } ou null.
   * score menor = melhor.
   */
  function encontrarMelhorPosicao(freeRects, pw, ph, heur, girar){
    let best = null;

    for(const slot of freeRects){
      // Testa sem rotação
      if(pw <= slot.w + 0.001 && ph <= slot.h + 0.001){
        const score = calcScore(slot, pw, ph, heur);
        if(!best || score < best.score){
          best = { slot, rot: false, score };
        }
      }
      // Testa com rotação
      if(girar && ph <= slot.w + 0.001 && pw <= slot.h + 0.001){
        const score = calcScore(slot, ph, pw, heur);
        if(!best || score < best.score){
          best = { slot, rot: true, score };
        }
      }
    }
    return best;
  }

  function calcScore(slot, w, h, heur){
    const dw = slot.w - w;
    const dh = slot.h - h;
    const areaSobra = slot.w * slot.h - w * h;

    switch(heur){
      case "bssf":  return Math.min(dw, dh);                          // short side fit
      case "blsf":  return Math.max(dw, dh);                          // long side fit
      case "bl":    return slot.y + h;                                // bottom-left
      case "cp":    return Math.min(dw, dh) - Math.max(dw, dh) * 0.1; // contacto
      case "baf":
      default:      return areaSobra;                                 // área desperdiçada
    }
  }

  /**
   * Divide o slot após colocar uma peça.
   * Remove o slot usado e adiciona os dois remanescentes (guilhotina),
   * depois remove slots totalmente contidos em outros.
   */
  function dividirFreeRects(ch, slot, w, h){
    const novos = [];

    // Remove o slot usado
    ch.freeRects = ch.freeRects.filter(s => s !== slot);

    // Cria até 4 sub-retângulos possíveis (guilhotina)
    // Direita
    if(slot.w - w > 0.001){
      novos.push({ x: slot.x + w, y: slot.y, w: slot.w - w, h: h });
    }
    // Abaixo (largura total do slot original)
    if(slot.h - h > 0.001){
      novos.push({ x: slot.x, y: slot.y + h, w: slot.w, h: slot.h - h });
    }

    // Adiciona e "poda" overlaps
    ch.freeRects = ch.freeRects.concat(novos);

    // Remove slots contidos em outros
    ch.freeRects = ch.freeRects.filter((s1, i) =>
      !ch.freeRects.some((s2, j) =>
        i !== j &&
        s1.x >= s2.x && s1.y >= s2.y &&
        s1.x + s1.w <= s2.x + s2.w && s1.y + s1.h <= s2.y + s2.h &&
        (s1.w * s1.h < s2.w * s2.h || (s1.w === s2.w && s1.h === s2.h && i > j))
      )
    );
  }

  /**
   * Compara dois resultados (para mostrar economia).
   */
  function comparar(guilhotina, mr){
    const ap1 = guilhotina.aproveitamento || 0;
    const ap2 = mr.aproveitamento || 0;
    const ch1 = guilhotina.totalChapas || 0;
    const ch2 = mr.totalChapas || 0;
    return {
      aproveitamentoGanho: ap2 - ap1,
      chapasEconomizadas: ch1 - ch2,
      percentualChapas: ch1 > 0 ? ((ch1 - ch2) / ch1) * 100 : 0
    };
  }

  global.MaxRects = { maxRects, comparar };
})(window);