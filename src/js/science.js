// ==========================================
    // 4. MATH WIDGET (UNIVERSITY EQUATIONS, DERIVATIONS & NOTATION)
    // ==========================================
    const SCIENCE_ICONS_SVG = {
      math: '<svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M18 5H6l7 7-7 7h12"></path></svg>',
      physics: '<svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1.8" fill="currentColor"></circle><ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(30 12 12)"></ellipse><ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(-30 12 12)"></ellipse><ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(90 12 12)"></ellipse></svg>',
      chemistry: '<svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"></path><path d="M10 3v6.2L4.6 18.4A2 2 0 0 0 6.3 21h11.4a2 2 0 0 0 1.7-2.6L14 9.2V3"></path><path d="M7.5 15h9"></path></svg>'
    };

    const SCIENCE_DISCIPLINES = {
      math: {
        name: 'Matemática',
        iconSvg: SCIENCE_ICONS_SVG.math,
        placeholder: 'Escribí ecuaciones paso a paso (usá // para comentar un paso)...',
        defaultExpr: '\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1  // Límite notable\n\\int_{0}^{\\pi} \\sin(x)\\,dx = [-\\cos(x)]_{0}^{\\pi} = 2  // Integral definida\n\\forall x \\in \\mathbb{R},\\; x^2 \\geq 0',
        quickSyms: [
          { lbl: 'a/b', desc: 'Fracción',        val: '\\frac{a}{b}' },
          { lbl: '√x',  desc: 'Raíz cuadrada',   val: '\\sqrt{x}' },
          { lbl: 'ⁿ√x', desc: 'Raíz enésima',    val: '\\sqrt[3]{x}' },
          { lbl: 'xⁿ',  desc: 'Superíndice',     val: '^{n}' },
          { lbl: 'xᵢ',  desc: 'Subíndice',       val: '_{i}' },
          { lbl: '∑',   desc: 'Sumatoria',       val: '\\sum_{i=1}^{n}' },
          { lbl: '∏',   desc: 'Productoria',     val: '\\prod_{i=1}^{n}' },
          { lbl: '∫',   desc: 'Integral',        val: '\\int_{a}^{b}' },
          { lbl: 'lim', desc: 'Límite',          val: '\\lim_{x \\to 0}' },
          { lbl: '∂',   desc: 'Derivada parcial',val: '\\partial' },
          { lbl: '∀',   desc: 'Para todo',       val: '\\forall' },
          { lbl: '∃',   desc: 'Existe',          val: '\\exists' },
          { lbl: '∈',   desc: 'Pertenece',       val: '\\in' },
          { lbl: '⇒',   desc: 'Implica',         val: '\\Rightarrow' },
          { lbl: '⇔',   desc: 'Si y solo si',    val: '\\iff' },
          { lbl: 'ℝ',   desc: 'Reales',          val: '\\mathbb{R}' },
          { lbl: 'π',   desc: 'Pi',              val: '\\pi' },
          { lbl: '∞',   desc: 'Infinito',        val: '\\infty' },
          { lbl: '[M]', desc: 'Matriz 2×2',      val: '\\matrix{a, b; c, d}' }
        ]
      },
      physics: {
        name: 'Física',
        iconSvg: SCIENCE_ICONS_SVG.physics,
        placeholder: 'Escribí fórmulas de física, vectores (\\vec{F}) y pasos con // ...',
        defaultExpr: '\\sum \\vec{F} = m \\cdot \\vec{a}  // 2da Ley de Newton\n\\Delta K = \\frac{1}{2} m v_f^2 - \\frac{1}{2} m v_0^2 = \\int_{x_0}^{x_f} \\vec{F} \\cdot d\\vec{r}  // Trabajo y energía\n\\vec{v}(t) = v_0 \\cos(\\theta)\\,\\hat{i} + (v_0 \\sin(\\theta) - g t)\\,\\hat{j}',
        quickSyms: [
          { lbl: 'v⃗',   desc: 'Vector',           val: '\\vec{F}' },
          { lbl: 'î',   desc: 'Versor unitario',  val: '\\hat{i}' },
          { lbl: 'v̄',   desc: 'Valor medio',      val: '\\bar{v}' },
          { lbl: 'ẋ',   desc: 'Derivada temporal',val: '\\dot{x}' },
          { lbl: 'ẍ',   desc: '2da deriv. temp.', val: '\\ddot{x}' },
          { lbl: 'a/b', desc: 'Fracción',         val: '\\frac{a}{b}' },
          { lbl: '√x',  desc: 'Raíz cuadrada',    val: '\\sqrt{x}' },
          { lbl: 'Δ',   desc: 'Variación (Delta)',val: '\\Delta' },
          { lbl: '∑',   desc: 'Sumatoria',        val: '\\sum' },
          { lbl: '∫',   desc: 'Integral',         val: '\\int_{a}^{b}' },
          { lbl: '∇',   desc: 'Nabla / gradiente',val: '\\nabla' },
          { lbl: '°',   desc: 'Grados',           val: '\\deg' },
          { lbl: '°C',  desc: 'Grados Celsius',   val: '\\degC' },
          { lbl: 'Ω',   desc: 'Ohm (resistencia)',val: '\\Omega' },
          { lbl: 'μ',   desc: 'Mu (coef./micro)', val: '\\mu' },
          { lbl: 'ω',   desc: 'Vel. angular',     val: '\\omega' },
          { lbl: 'θ',   desc: 'Ángulo Theta',     val: '\\theta' },
          { lbl: 'ℏ',   desc: 'Planck reducida',  val: '\\hbar' },
          { lbl: '∝',   desc: 'Proporcional a',   val: '\\propto' }
        ]
      },
      chemistry: {
        name: 'Química',
        iconSvg: SCIENCE_ICONS_SVG.chemistry,
        placeholder: 'Escribí reacciones químicas con \\ce{H2O}, \\rightleftharpoons, \\xrightarrow{\\Delta}...',
        defaultExpr: '\\ce{2 H2(g) + O2(g)} \\xrightarrow{\\Delta} \\ce{2 H2O(l)}  // Combustión del hidrógeno\n\\ce{N2(g) + 3 H2(g)} \\rightleftharpoons \\ce{2 NH3(g)}  // Equilibrio Haber-Bosch\nK_c = \\frac{[\\ce{NH3}]^2}{[\\ce{N2}][\\ce{H2}]^3}  // Constante de equilibrio',
        quickSyms: [
          { lbl: 'H₂O', desc: 'Fórmula química',   val: '\\ce{H2O}' },
          { lbl: 'SO₄²⁻',desc: 'Ion / carga',      val: '\\ce{SO4^2-}' },
          { lbl: '→',   desc: 'Reacción',          val: '\\to' },
          { lbl: '⇌',   desc: 'Equilibrio',        val: '\\rightleftharpoons' },
          { lbl: '→Δ',  desc: 'Flecha con calor',  val: '\\xrightarrow{\\Delta}' },
          { lbl: '⇌k',  desc: 'Equilibrio k₁/k₂',  val: '\\xrightleftharpoons{k_1}{k_2}' },
          { lbl: '↑',   desc: 'Gas desprendido',   val: '\\uparrow' },
          { lbl: '↓',   desc: 'Precipitado',       val: '\\downarrow' },
          { lbl: 'X⁺',  desc: 'Catión',            val: '^{+}' },
          { lbl: 'X⁻',  desc: 'Anión',             val: '^{-}' },
          { lbl: 'ᵃZ',  desc: 'Isótopo / núclido', val: '\\iso{14}{6}{C}' },
          { lbl: '°C',  desc: 'Temperatura °C',    val: '\\degC' },
          { lbl: 'ΔH',  desc: 'Entalpía',          val: '\\Delta H' },
          { lbl: 'a/b', desc: 'Fracción',          val: '\\frac{a}{b}' },
          { lbl: '═',   desc: 'Enlace doble',      val: '\\bond{=}' },
          { lbl: '≡',   desc: 'Enlace triple',     val: '\\bond{#}' }
        ]
      }
    };

    const SCIENCE_COMMANDS_DOCS = {
      math: [
        { desc: 'Fracciones (soporta anidadas)', cmd: '\\frac{a}{b}' },
        { desc: 'Raíz cuadrada', cmd: '\\sqrt{x}' },
        { desc: 'Raíz enésima', cmd: '\\sqrt[3]{x}' },
        { desc: 'Potencia / superíndice', cmd: 'x^{n+1}' },
        { desc: 'Subíndice', cmd: 'x_{i}' },
        { desc: 'Límite', cmd: '\\lim_{x \\to 0}' },
        { desc: 'Integral definida', cmd: '\\int_{a}^{b}' },
        { desc: 'Sumatoria', cmd: '\\sum_{i=1}^{n}' },
        { desc: 'Productoria', cmd: '\\prod_{i=1}^{n}' },
        { desc: 'Matriz (coma = col, ; = fila)', cmd: '\\matrix{a, b; c, d}' },
        { desc: 'Derivada parcial', cmd: '\\partial' },
        { desc: 'Conjunto de reales (R, N, Z, Q, C)', cmd: '\\mathbb{R}' },
        { desc: 'Cuantificadores y pertenencia', cmd: '\\forall x \\in \\mathbb{R}' },
        { desc: 'Implicación', cmd: '\\Rightarrow' },
        { desc: 'Si y solo si', cmd: '\\iff' },
        { desc: 'Anotación de paso (al final de la línea)', cmd: '// paso' }
      ],
      physics: [
        { desc: 'Vector con flecha superior', cmd: '\\vec{F}' },
        { desc: 'Versor unitario (i, j, k)', cmd: '\\hat{i}' },
        { desc: 'Valor medio / barra superior', cmd: '\\bar{v}' },
        { desc: 'Primera derivada temporal', cmd: '\\dot{x}' },
        { desc: 'Segunda derivada temporal', cmd: '\\ddot{x}' },
        { desc: 'Operador nabla / gradiente', cmd: '\\nabla' },
        { desc: 'Variación (Delta)', cmd: '\\Delta' },
        { desc: 'Grados angulares', cmd: '\\deg' },
        { desc: 'Grados Celsius', cmd: '\\degC' },
        { desc: 'Resistencia eléctrica (Ohm)', cmd: '\\Omega' },
        { desc: 'Constante de Planck reducida', cmd: '\\hbar' },
        { desc: 'Ångström', cmd: '\\angstrom' },
        { desc: 'Proporcionalidad directa', cmd: '\\propto' },
        { desc: 'Perpendicular', cmd: '\\perp' },
        { desc: 'Ángulo', cmd: '\\angle' }
      ],
      chemistry: [
        { desc: 'Fórmula química (subíndices automáticos)', cmd: '\\ce{H2SO4}' },
        { desc: 'Ecuación con estados de agregación', cmd: '\\ce{2 H2O(l)}' },
        { desc: 'Anión / catión con carga', cmd: '\\ce{SO4^2-}' },
        { desc: 'Flecha de reacción', cmd: '\\to' },
        { desc: 'Equilibrio químico reversible', cmd: '\\rightleftharpoons' },
        { desc: 'Flecha con calor o catalizador', cmd: '\\xrightarrow{\\Delta}' },
        { desc: 'Equilibrio con constantes k₁ / k₂', cmd: '\\xrightleftharpoons{k_1}{k_2}' },
        { desc: 'Desprendimiento de gas', cmd: '\\uparrow' },
        { desc: 'Formación de precipitado', cmd: '\\downarrow' },
        { desc: 'Isótopo / núclido (masa y Z)', cmd: '\\iso{14}{6}{C}' },
        { desc: 'Enlace doble', cmd: '\\bond{=}' },
        { desc: 'Enlace triple', cmd: '\\bond{#}' }
      ]
    };

    function closeAllWidgetDropdowns(exceptEl) {
      document.querySelectorAll('.widget-dropdown-menu, .math-dropdown-menu').forEach(m => {
        if (m !== exceptEl) m.classList.add('hidden');
      });
    }
    const closeAllMathDropdowns = closeAllWidgetDropdowns;

    function toggleWidgetDropdown(menuId) {
      const menu = document.getElementById(menuId);
      if (!menu) return;
      const willOpen = menu.classList.contains('hidden');
      closeAllWidgetDropdowns(menu);
      if (willOpen) menu.classList.remove('hidden');
      else menu.classList.add('hidden');
    }
    const toggleMathDropdown = toggleWidgetDropdown;

    // ==========================================
    // SCIENCE FORMULA AUTOCOMPLETE (\command)
    // ==========================================
    const SCIENCE_AUTOCOMPLETE_CATALOG = [
      // Math
      { cmd: '\\frac{a}{b}', lbl: 'a/b', desc: 'Fracción', group: 'math' },
      { cmd: '\\sqrt{x}', lbl: '√x', desc: 'Raíz cuadrada', group: 'math' },
      { cmd: '\\sqrt[3]{x}', lbl: '³√x', desc: 'Raíz enésima', group: 'math' },
      { cmd: '\\lim_{x \\to 0}', lbl: 'lim', desc: 'Límite', group: 'math' },
      { cmd: '\\int_{a}^{b}', lbl: '∫', desc: 'Integral definida', group: 'math' },
      { cmd: '\\sum_{i=1}^{n}', lbl: '∑', desc: 'Sumatoria', group: 'math' },
      { cmd: '\\prod_{i=1}^{n}', lbl: '∏', desc: 'Productoria', group: 'math' },
      { cmd: '\\matrix{a, b; c, d}', lbl: '[M]', desc: 'Matriz 2×2', group: 'math' },
      { cmd: '\\partial', lbl: '∂', desc: 'Derivada parcial', group: 'math' },
      { cmd: '\\mathbb{R}', lbl: 'ℝ', desc: 'Reales', group: 'math' },
      { cmd: '\\mathbb{N}', lbl: 'ℕ', desc: 'Naturales', group: 'math' },
      { cmd: '\\mathbb{Z}', lbl: 'ℤ', desc: 'Enteros', group: 'math' },
      { cmd: '\\mathbb{Q}', lbl: 'ℚ', desc: 'Racionales', group: 'math' },
      { cmd: '\\mathbb{C}', lbl: 'ℂ', desc: 'Complejos', group: 'math' },
      { cmd: '\\forall', lbl: '∀', desc: 'Para todo', group: 'math' },
      { cmd: '\\exists', lbl: '∃', desc: 'Existe', group: 'math' },
      { cmd: '\\in', lbl: '∈', desc: 'Pertenece', group: 'math' },
      { cmd: '\\notin', lbl: '∉', desc: 'No pertenece', group: 'math' },
      { cmd: '\\Rightarrow', lbl: '⇒', desc: 'Implica', group: 'math' },
      { cmd: '\\iff', lbl: '⇔', desc: 'Si y solo si', group: 'math' },
      { cmd: '\\to', lbl: '→', desc: 'Flecha / tiende a', group: 'math' },
      { cmd: '\\infty', lbl: '∞', desc: 'Infinito', group: 'math' },
      { cmd: '\\leq', lbl: '≤', desc: 'Menor o igual', group: 'math' },
      { cmd: '\\geq', lbl: '≥', desc: 'Mayor o igual', group: 'math' },
      { cmd: '\\neq', lbl: '≠', desc: 'Distinto', group: 'math' },
      { cmd: '\\approx', lbl: '≈', desc: 'Aproximado', group: 'math' },
      { cmd: '\\pm', lbl: '±', desc: 'Más menos', group: 'math' },
      { cmd: '\\cdot', lbl: '·', desc: 'Producto punto', group: 'math' },
      { cmd: '\\times', lbl: '×', desc: 'Producto cruz', group: 'math' },
      // Physics
      { cmd: '\\vec{F}', lbl: 'F⃗', desc: 'Vector', group: 'physics' },
      { cmd: '\\hat{i}', lbl: 'î', desc: 'Versor unitario', group: 'physics' },
      { cmd: '\\bar{v}', lbl: 'v̄', desc: 'Valor medio', group: 'physics' },
      { cmd: '\\dot{x}', lbl: 'ẋ', desc: 'Derivada temporal', group: 'physics' },
      { cmd: '\\ddot{x}', lbl: 'ẍ', desc: '2da deriv. temporal', group: 'physics' },
      { cmd: '\\nabla', lbl: '∇', desc: 'Nabla / gradiente', group: 'physics' },
      { cmd: '\\Delta', lbl: 'Δ', desc: 'Variación (Delta)', group: 'physics' },
      { cmd: '\\deg', lbl: '°', desc: 'Grados', group: 'physics' },
      { cmd: '\\degC', lbl: '°C', desc: 'Grados Celsius', group: 'physics' },
      { cmd: '\\Omega', lbl: 'Ω', desc: 'Ohm', group: 'physics' },
      { cmd: '\\hbar', lbl: 'ℏ', desc: 'Planck reducida', group: 'physics' },
      { cmd: '\\angstrom', lbl: 'Å', desc: 'Ångström', group: 'physics' },
      { cmd: '\\propto', lbl: '∝', desc: 'Proporcional a', group: 'physics' },
      { cmd: '\\perp', lbl: '⊥', desc: 'Perpendicular', group: 'physics' },
      { cmd: '\\parallel', lbl: '∥', desc: 'Paralelo', group: 'physics' },
      { cmd: '\\angle', lbl: '∠', desc: 'Ángulo', group: 'physics' },
      // Chemistry
      { cmd: '\\ce{H2O}', lbl: 'H₂O', desc: 'Fórmula química', group: 'chemistry' },
      { cmd: '\\rightleftharpoons', lbl: '⇌', desc: 'Equilibrio reversible', group: 'chemistry' },
      { cmd: '\\xrightarrow{\\Delta}', lbl: '⟶Δ', desc: 'Flecha con calor/cat.', group: 'chemistry' },
      { cmd: '\\xrightleftharpoons{k_1}{k_2}', lbl: '⇌k', desc: 'Equilibrio k₁/k₂', group: 'chemistry' },
      { cmd: '\\uparrow', lbl: '↑', desc: 'Gas desprendido', group: 'chemistry' },
      { cmd: '\\downarrow', lbl: '↓', desc: 'Precipitado', group: 'chemistry' },
      { cmd: '\\iso{14}{6}{C}', lbl: '¹⁴₆C', desc: 'Isótopo / núclido', group: 'chemistry' },
      { cmd: '\\bond{=}', lbl: '═', desc: 'Enlace doble', group: 'chemistry' },
      { cmd: '\\bond{#}', lbl: '≡', desc: 'Enlace triple', group: 'chemistry' },
      // Greek
      { cmd: '\\alpha', lbl: 'α', desc: 'Alfa', group: 'math' },
      { cmd: '\\beta', lbl: 'β', desc: 'Beta', group: 'math' },
      { cmd: '\\gamma', lbl: 'γ', desc: 'Gamma', group: 'math' },
      { cmd: '\\theta', lbl: 'θ', desc: 'Theta', group: 'physics' },
      { cmd: '\\lambda', lbl: 'λ', desc: 'Lambda', group: 'physics' },
      { cmd: '\\mu', lbl: 'μ', desc: 'Mu', group: 'physics' },
      { cmd: '\\pi', lbl: 'π', desc: 'Pi', group: 'math' },
      { cmd: '\\omega', lbl: 'ω', desc: 'Omega minúscula', group: 'physics' },
      { cmd: '\\sigma', lbl: 'σ', desc: 'Sigma', group: 'math' },
      { cmd: '\\phi', lbl: 'φ', desc: 'Phi', group: 'physics' }
    ];

    let sciAcState = { open: false, mathId: null, textarea: null, startIdx: 0, items: [], selectedIdx: 0 };

    function closeScienceAutocomplete() {
      const pop = document.getElementById('scienceAutocompletePopup');
      if (pop) pop.classList.add('hidden');
      sciAcState.open = false;
      sciAcState.items = [];
    }

    function updateScienceAutocomplete(mathId, textareaEl) {
      if (!textareaEl) return closeScienceAutocomplete();
      const pos = textareaEl.selectionStart ?? 0;
      const before = textareaEl.value.slice(0, pos);
      const match = before.match(/\\([A-Za-z]*)$/);
      if (!match) return closeScienceAutocomplete();

      const query = match[1].toLowerCase();
      const widget = document.querySelector(`.math-widget[data-math-id="${mathId}"]`);
      const mode = widget ? parseMathWidgetState(widget).mode : 'math';

      const matches = SCIENCE_AUTOCOMPLETE_CATALOG.filter(item => {
        const cleanCmd = item.cmd.slice(1).toLowerCase();
        return cleanCmd.startsWith(query) || item.desc.toLowerCase().includes(query);
      }).sort((a, b) => {
        const aMode = a.group === mode ? 0 : 1;
        const bMode = b.group === mode ? 0 : 1;
        if (aMode !== bMode) return aMode - bMode;
        const aStarts = a.cmd.slice(1).toLowerCase().startsWith(query) ? 0 : 1;
        const bStarts = b.cmd.slice(1).toLowerCase().startsWith(query) ? 0 : 1;
        return aStarts - bStarts;
      }).slice(0, 8);

      if (matches.length === 0) return closeScienceAutocomplete();

      sciAcState = {
        open: true,
        mathId,
        textarea: textareaEl,
        startIdx: pos - match[0].length,
        items: matches,
        selectedIdx: 0
      };
      renderScienceAutocompletePopup();
    }

    function renderScienceAutocompletePopup() {
      const pop = document.getElementById('scienceAutocompletePopup');
      if (!pop || !sciAcState.open || !sciAcState.textarea) return;
      const rect = sciAcState.textarea.getBoundingClientRect();
      const left = Math.min(Math.max(8, rect.left + 14), window.innerWidth - 310);
      const top = Math.min(rect.bottom + 4, window.innerHeight - 230);
      pop.style.left = left + 'px';
      pop.style.top = top + 'px';

      pop.innerHTML = sciAcState.items.map((item, idx) => {
        const isSel = idx === sciAcState.selectedIdx;
        return `<button type="button" onmousedown="event.preventDefault(); event.stopPropagation(); acceptScienceAutocomplete(${idx});" class="sci-ac-item w-full px-2.5 py-1 text-left flex items-center justify-between gap-2 transition ${isSel ? 'is-selected bg-slate-200 dark:bg-zinc-700 text-slate-900 dark:text-white font-semibold' : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800'}">
          <span class="flex items-center gap-2 min-w-0">
            <span class="w-7 text-center font-serif text-xs shrink-0">${item.lbl}</span>
            <code class="text-[10.5px] font-mono truncate">${escapeHtml(item.cmd)}</code>
          </span>
          <span class="text-[10px] font-sans opacity-70 shrink-0">${escapeHtml(item.desc)}</span>
        </button>`;
      }).join('');
      pop.classList.remove('hidden');
    }

    function acceptScienceAutocomplete(idx) {
      if (!sciAcState.open || !sciAcState.textarea) return;
      const item = sciAcState.items[idx ?? sciAcState.selectedIdx];
      if (!item) return closeScienceAutocomplete();

      const ta = sciAcState.textarea;
      const endPos = ta.selectionStart ?? ta.value.length;
      const before = ta.value.slice(0, sciAcState.startIdx);
      const after = ta.value.slice(endPos);
      ta.value = before + item.cmd + after;

      // Smart cursor placement inside first {...} placeholder if present
      const braceOpen = item.cmd.indexOf('{');
      const braceClose = item.cmd.indexOf('}', braceOpen + 1);
      ta.focus();
      if (braceOpen !== -1 && braceClose > braceOpen + 1) {
        ta.setSelectionRange(sciAcState.startIdx + braceOpen + 1, sciAcState.startIdx + braceClose);
      } else {
        const caret = sciAcState.startIdx + item.cmd.length;
        ta.setSelectionRange(caret, caret);
      }

      const mathId = sciAcState.mathId;
      closeScienceAutocomplete();
      handleMathWidgetInput(mathId, ta);
    }

    function handleMathTextareaKeydown(ev, mathId, textareaEl) {
      ev.stopPropagation();
      if (sciAcState.open && sciAcState.textarea === textareaEl) {
        if (ev.key === 'ArrowDown') {
          ev.preventDefault();
          sciAcState.selectedIdx = (sciAcState.selectedIdx + 1) % sciAcState.items.length;
          renderScienceAutocompletePopup();
          return;
        }
        if (ev.key === 'ArrowUp') {
          ev.preventDefault();
          sciAcState.selectedIdx = (sciAcState.selectedIdx - 1 + sciAcState.items.length) % sciAcState.items.length;
          renderScienceAutocompletePopup();
          return;
        }
        if (ev.key === 'Tab' || ev.key === 'Enter') {
          ev.preventDefault();
          acceptScienceAutocomplete(sciAcState.selectedIdx);
          return;
        }
        if (ev.key === 'Escape') {
          ev.preventDefault();
          closeScienceAutocomplete();
          return;
        }
      }
    }

    function openScienceCommandsModal(filterMode = 'all') {
      closeAllMenus();
      closeAllMathDropdowns();
      const modal = document.getElementById('scienceCommandsModal');
      if (!modal) return;
      renderScienceCommandsModal(filterMode);
      modal.classList.remove('hidden');
    }

    function closeScienceCommandsModal() {
      const modal = document.getElementById('scienceCommandsModal');
      if (modal) modal.classList.add('hidden');
    }

    function copyScienceCommand(cmdStr, btnEl) {
      navigator.clipboard.writeText(cmdStr).then(() => {
        if (btnEl) {
          const orig = btnEl.innerHTML;
          btnEl.innerHTML = '<span class="text-[10px] font-bold">✓</span>';
          setTimeout(() => { btnEl.innerHTML = orig; }, 900);
        }
        showToast('Comando copiado: ' + cmdStr);
      });
    }

    function renderScienceCommandsModal(filterMode = 'all') {
      const body = document.getElementById('scienceCommandsBody');
      if (!body) return;
      document.querySelectorAll('#scienceCommandsModal .sci-tab-btn').forEach(btn => {
        const active = btn.getAttribute('data-sci-tab') === filterMode;
        btn.classList.toggle('bg-slate-200', active);
        btn.classList.toggle('dark:bg-zinc-700', active);
        btn.classList.toggle('font-semibold', active);
        btn.classList.toggle('is-active', active);
      });

      const sections = filterMode === 'all' ? ['math', 'physics', 'chemistry'] : [filterMode];
      body.innerHTML = sections.map(key => {
        const cfg = SCIENCE_DISCIPLINES[key];
        const rows = (SCIENCE_COMMANDS_DOCS[key] || []).map(item => {
          const safeCmd = item.cmd.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
          return `
            <div class="px-3 py-1.5 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800/40">
              <span class="text-slate-700 dark:text-zinc-200">${escapeHtml(item.desc)}</span>
              <div class="flex items-center gap-1.5 shrink-0">
                <code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-mono text-[10.5px] text-slate-700 dark:text-zinc-200">${escapeHtml(item.cmd)}</code>
                <button type="button" onclick="copyScienceCommand('${safeCmd}', this)" title="Copiar comando para pegar" aria-label="Copiar ${escapeHtml(item.cmd)}" class="sci-copy-btn w-6 h-6 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center transition">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
            </div>`;
        }).join('');
        return `
          <div>
            <div class="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
              ${cfg.iconSvg}
              <span>${cfg.name}</span>
            </div>
            <div class="divide-y divide-slate-100 dark:divide-zinc-800/70 border border-slate-200 dark:border-zinc-800 rounded-md">${rows}</div>
          </div>`;
      }).join('');
    }

    function parseMathWidgetState(widget) {
      try {
        const raw = widget.getAttribute('data-state');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed.expr === 'string') {
            const mode = SCIENCE_DISCIPLINES[parsed.mode] ? parsed.mode : 'math';
            return { expr: parsed.expr, mode, previewOnly: Boolean(parsed.previewOnly) };
          }
        }
      } catch (e) {}
      return { expr: '', mode: 'math', previewOnly: false };
    }

    function saveMathWidgetState(widget, stateObj) {
      widget.setAttribute('data-state', JSON.stringify(stateObj));
      const editor = document.getElementById('liveSheetEditor');
      const tab = getActiveTab();
      if (editor && tab) {
        tab.html = editor.innerHTML;
        saveTabsToStorage();
      }
    }

    function formatChemicalFormulaHtml(raw) {
      let c = raw;
      c = c.replace(/&lt;=&gt;/g, ' ⇌ ').replace(/-&gt;/g, ' → ');
      c = c.replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>');
      c = c.replace(/\^(\d*[+\-])/g, '<sup>$1</sup>');
      c = c.replace(/([A-Za-z\)\]])(\d+)/g, '$1<sub>$2</sub>');
      return `<span class="math-ce">${c}</span>`;
    }

    function formatMathExpressionHtml(rawLine, mode = 'math') {
      let s = escapeHtml((rawLine || '').trim());
      if (!s) return '<span class="text-slate-400 text-xs font-mono">Escribí una ecuación o desarrollo...</span>';

      let annotation = '';
      const commentIdx = s.indexOf('//');
      if (commentIdx !== -1) {
        annotation = s.slice(commentIdx + 2).trim();
        s = s.slice(0, commentIdx).trim();
      }

      // Chemical formulas: \ce{...}
      s = s.replace(/\\ce\{([^{}]+)\}/g, (_, body) => formatChemicalFormulaHtml(body));

      // Isotopes / nuclides: \iso{A}{Z}{X}
      s = s.replace(/\\iso\{([^{}]+)\}\{([^{}]+)\}\{([^{}]+)\}/g,
        '<span class="math-iso"><span class="math-iso-nums"><span>$1</span><span>$2</span></span><span>$3</span></span>'
      );

      // Stacked reaction arrows: \xrightarrow{top} and \xrightleftharpoons{top}{bot}
      s = s.replace(/\\xrightleftharpoons\{([^{}]+)\}\{([^{}]+)\}/g,
        '<span class="math-rxn-arrow"><span class="math-rxn-top">$1</span><span class="math-rxn-sym">⇌</span><span class="math-rxn-bot">$2</span></span>'
      );
      s = s.replace(/\\xrightarrow\{([^{}]+)\}/g,
        '<span class="math-rxn-arrow"><span class="math-rxn-top">$1</span><span class="math-rxn-sym">⟶</span></span>'
      );

      // Chemical bonds: \bond{-}, \bond{=}, \bond{#}
      s = s.replace(/\\bond\{([\-=#])\}/g, (_, b) => b === '=' ? '═' : (b === '#' ? '≡' : '—'));

      // Physics accents: \vec{F}, \hat{i}, \bar{v}, \overline{x}, \dot{x}, \ddot{x}
      s = s.replace(/\\vec\{([^{}]+)\}/g, '<span class="math-vec">$1</span>');
      s = s.replace(/\\hat\{([^{}]+)\}/g, '<span class="math-hat">$1</span>');
      s = s.replace(/\\(?:bar|overline)\{([^{}]+)\}/g, '<span class="math-bar">$1</span>');
      s = s.replace(/\\ddot\{([^{}]+)\}/g, '<span class="math-dot" data-dot="¨">$1</span>');
      s = s.replace(/\\dot\{([^{}]+)\}/g, '<span class="math-dot" data-dot="·">$1</span>');

      // Matrices: \matrix{a, b; c, d}
      s = s.replace(/\\matrix\{([^{}]+)\}/g, (_, body) => {
        const rows = body.split(';').map(r => r.split(',').map(c => c.trim()));
        const cols = Math.max(1, ...rows.map(r => r.length));
        const cells = rows.flatMap(r => {
          const padded = [...r];
          while (padded.length < cols) padded.push('');
          return padded.map(c => `<span>${c}</span>`);
        }).join('');
        return `<span class="math-matrix"><span class="math-matrix-grid" style="grid-template-columns: repeat(${cols}, auto);">${cells}</span></span>`;
      });

      // nth root \sqrt[n]{x} and square root \sqrt{x}
      s = s.replace(/\\sqrt\[([^\[\]]+)\]\{([^{}]+)\}/g,
        '<span class="math-sqrt"><sup style="font-size:0.65em;margin-right:-2px;">$1</sup>√<span class="math-sqrt-body">$2</span></span>'
      );
      s = s.replace(/\\sqrt\{([^{}]+)\}/g,
        '<span class="math-sqrt">√<span class="math-sqrt-body">$1</span></span>'
      );

      // Stacked big operators: \sum_{a}^{b}, \prod_{a}^{b}, \int_{a}^{b}, \lim_{a}
      s = s.replace(/\\(sum|prod|int)_\{([^{}]+)\}\^\{([^{}]+)\}/g, (_, op, sub, sup) => {
        const sym = op === 'sum' ? '∑' : (op === 'prod' ? '∏' : '∫');
        return `<span class="math-bigop"><span class="math-bigop-sup">${sup}</span><span class="math-bigop-sym">${sym}</span><span class="math-bigop-sub">${sub}</span></span>`;
      });
      s = s.replace(/\\lim_\{([^{}]+)\}/g, (_, sub) =>
        `<span class="math-bigop"><span class="math-lim-sym">lim</span><span class="math-bigop-sub">${sub}</span></span>`
      );

      // Fractions (iterative for nested fractions)
      for (let pass = 0; pass < 4 && /\\frac\{/.test(s); pass++) {
        s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g,
          '<span class="math-frac"><span class="math-frac-num">$1</span><span class="math-frac-den">$2</span></span>'
        );
      }

      // Blackboard bold sets: \mathbb{R}, \mathbb{N}, \mathbb{Z}, \mathbb{Q}, \mathbb{C}
      s = s.replace(/\\mathbb\{([RNZQC])\}/g, (_, ch) => ({ R: 'ℝ', N: 'ℕ', Z: 'ℤ', Q: 'ℚ', C: 'ℂ' }[ch] || ch));

      // Standard math, physics & chemistry symbols
      const symMap = [
        [/\\rightleftharpoons/g, '⇌'],
        [/&lt;=&gt;/g, mode === 'chemistry' ? '⇌' : '⇔'],
        [/\\iff/g, '⇔'],
        [/\\uparrow/g, '↑'], [/\\downarrow/g, '↓'],
        [/\\degC\b/g, '°C'], [/\\deg\b/g, '°'], [/\\angstrom\b/g, 'Å'], [/\\hbar\b/g, 'ℏ'],
        [/\\ohm\b/g, 'Ω'], [/\\propto\b/g, '∝'], [/\\perp\b/g, '⊥'], [/\\parallel\b/g, '∥'], [/\\angle\b/g, '∠'],
        [/\\sum/g, '∑'], [/\\prod/g, '∏'], [/\\int/g, '∫'], [/\\oint/g, '∮'],
        [/\\partial/g, '∂'], [/\\nabla/g, '∇'], [/\\infty/g, '∞'], [/\\pm/g, '±'], [/\\mp/g, '∓'],
        [/\\times/g, '×'], [/\\cdot/g, '·'], [/\\div/g, '÷'],
        [/\\leq|&lt;=/g, '≤'], [/\\geq|&gt;=/g, '≥'], [/\\neq|!=/g, '≠'], [/\\approx/g, '≈'], [/\\equiv/g, '≡'], [/\\sim/g, '∼'],
        [/\\Rightarrow|\\implies|=&gt;/g, '⇒'], [/\\Leftarrow/g, '⇐'], [/\\to|-&gt;/g, '→'],
        [/\\forall/g, '∀'], [/\\exists/g, '∃'], [/\\notin/g, '∉'], [/\\in\b/g, '∈'],
        [/\\subseteq/g, '⊆'], [/\\subset/g, '⊂'], [/\\cup/g, '∪'], [/\\cap/g, '∩'], [/\\emptyset/g, '∅'],
        [/\\land/g, '∧'], [/\\lor/g, '∨'], [/\\neg/g, '¬'], [/\\therefore/g, '∴'],
        [/\\alpha/g, 'α'], [/\\beta/g, 'β'], [/\\gamma/g, 'γ'], [/\\delta/g, 'δ'], [/\\epsilon/g, 'ε'],
        [/\\theta/g, 'θ'], [/\\lambda/g, 'λ'], [/\\mu/g, 'μ'], [/\\pi/g, 'π'], [/\\rho/g, 'ρ'],
        [/\\sigma/g, 'σ'], [/\\tau/g, 'τ'], [/\\phi/g, 'φ'], [/\\psi/g, 'ψ'], [/\\omega/g, 'ω'],
        [/\\Delta/g, 'Δ'], [/\\Sigma/g, 'Σ'], [/\\Omega/g, 'Ω'], [/\\Pi/g, 'Π'], [/\\Phi/g, 'Φ'], [/\\Psi/g, 'Ψ'],
        [/\\(sin|cos|tan|csc|sec|cot|ln|log|exp|det|lim)\b/g, '<span class="math-fn">$1</span>'],
        [/\\[,;]/g, ' ']
      ];
      symMap.forEach(([rx, rep]) => { s = s.replace(rx, rep); });

      // Superscripts & Subscripts
      s = s.replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>');
      s = s.replace(/\^([A-Za-z0-9+\-]+)/g, '<sup>$1</sup>');
      s = s.replace(/_\{([^{}]+)\}/g, '<sub>$1</sub>');
      s = s.replace(/_([A-Za-z0-9]+)/g, '<sub>$1</sub>');

      if (annotation) {
        return `<span>${s}</span><span class="text-[11px] font-mono text-slate-400 dark:text-zinc-500 italic ml-3">// ${annotation}</span>`;
      }
      return `<span>${s}</span>`;
    }

    function renderMathPreviewHtml(exprText, mode = 'math') {
      const lines = (exprText || '').split('\n');
      const nonEmpty = lines.filter(l => l.trim().length > 0);
      if (nonEmpty.length === 0) {
        return '<div class="math-preview-line"><span class="text-slate-400 text-xs font-mono">Escribí una ecuación o desarrollo arriba...</span></div>';
      }
      return nonEmpty.map(line => {
        const formatted = formatMathExpressionHtml(line, mode);
        return `<div class="math-preview-line">${formatted}</div>`;
      }).join('');
    }

    function toggleMathPreviewOnly(mathId) {
      const widget = document.querySelector(`.math-widget[data-math-id="${mathId}"]`);
      if (!widget) return;
      const st = parseMathWidgetState(widget);
      st.previewOnly = !st.previewOnly;
      saveMathWidgetState(widget, st);
      mountMathWidget(widget);
    }

    function changeMathWidgetMode(mathId, newMode) {
      const widget = document.querySelector(`.math-widget[data-math-id="${mathId}"]`);
      if (!widget || !SCIENCE_DISCIPLINES[newMode]) return;
      const st = parseMathWidgetState(widget);
      const oldDefault = SCIENCE_DISCIPLINES[st.mode]?.defaultExpr || '';
      if (!st.expr.trim() || st.expr.trim() === oldDefault.trim()) {
        st.expr = SCIENCE_DISCIPLINES[newMode].defaultExpr;
      }
      st.mode = newMode;
      saveMathWidgetState(widget, st);
      mountMathWidget(widget);
      scheduleHistorySnapshot(getActiveTab()?.id, true);
    }

    function mountMathWidget(widget) {
      let mathId = widget.getAttribute('data-math-id');
      if (!mathId) {
        mathId = 'math-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        widget.setAttribute('data-math-id', mathId);
      }
      widget.setAttribute('contenteditable', 'false');
      const st = parseMathWidgetState(widget);
      const cfg = SCIENCE_DISCIPLINES[st.mode] || SCIENCE_DISCIPLINES.math;

      const modeMenuId = `mathModeMenu-${mathId}`;
      const symMenuId = `mathSymMenu-${mathId}`;

      const modeOptionsHtml = ['math', 'physics', 'chemistry'].map(k => {
        const d = SCIENCE_DISCIPLINES[k];
        const isSelected = st.mode === k;
        return `<button type="button" onmousedown="event.preventDefault(); event.stopPropagation();" onclick="event.stopPropagation(); changeMathWidgetMode('${mathId}', '${k}'); closeAllWidgetDropdowns();" class="w-full px-2.5 py-1.5 text-left hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-between gap-2 text-slate-700 dark:text-zinc-200 text-[11px] ${isSelected ? 'font-semibold bg-slate-50 dark:bg-zinc-800/60' : ''}">
          <span class="flex items-center gap-1.5">${d.iconSvg}<span>${d.name}</span></span>
          <span class="text-[10px]">${isSelected ? '✓' : ''}</span>
        </button>`;
      }).join('');

      const symListHtml = cfg.quickSyms.map(item => {
        const safeVal = item.val.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        return `<button type="button" onmousedown="event.preventDefault(); event.stopPropagation();" onclick="event.stopPropagation(); insertMathSymbol('${mathId}', '${safeVal}'); closeAllWidgetDropdowns();" title="${escapeHtml(item.desc)} (${escapeHtml(item.val)})" class="w-full px-2.5 py-1 text-left hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-between gap-2 text-slate-700 dark:text-zinc-200 text-[11px] transition">
          <span class="flex items-center gap-2 min-w-0">
            <span class="w-7 text-center font-serif font-semibold text-xs shrink-0">${item.lbl}</span>
            <span class="truncate text-[10.5px] font-sans text-slate-600 dark:text-zinc-300">${escapeHtml(item.desc)}</span>
          </span>
          <code class="text-[10px] font-mono text-slate-400 dark:text-zinc-500 shrink-0">${escapeHtml(item.val)}</code>
        </button>`;
      }).join('');

      widget.innerHTML = `
        <div class="math-widget-header px-3 py-1 bg-slate-100 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
          <div class="flex items-center gap-1.5 flex-wrap">
            <!-- Monochrome Science Discipline Dropdown -->
            <div class="widget-dropdown-wrap relative">
              <button type="button" onmousedown="event.preventDefault(); event.stopPropagation();" onclick="event.stopPropagation(); toggleWidgetDropdown('${modeMenuId}')" aria-label="Cambiar ciencia" class="widget-dropdown-btn menu-trigger flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/80 dark:bg-zinc-800 border border-slate-300/80 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-[11px] hover:bg-white dark:hover:bg-zinc-700 transition">
                ${cfg.iconSvg}
                <span>${cfg.name}</span>
                <svg class="w-3 h-3 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"></path></svg>
              </button>
              <div id="${modeMenuId}" class="widget-dropdown-menu dropdown-panel hidden absolute left-0 mt-1 w-40 rounded-md bg-white dark:bg-zinc-900 shadow-xl border border-slate-200 dark:border-zinc-700 py-1 z-50">
                ${modeOptionsHtml}
              </div>
            </div>

            <!-- Grouped Symbols Dropdown List with Monochrome Omega Icon -->
            <div class="widget-dropdown-wrap relative ${st.previewOnly ? 'hidden' : ''}">
              <button type="button" onmousedown="event.preventDefault(); event.stopPropagation();" onclick="event.stopPropagation(); toggleWidgetDropdown('${symMenuId}')" title="Insertar símbolos de ${cfg.name}" class="widget-dropdown-btn menu-trigger flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/80 dark:bg-zinc-800 border border-slate-300/80 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-semibold text-[11px] hover:bg-white dark:hover:bg-zinc-700 transition">
                <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19h5v-2a6.5 6.5 0 1 1 4 0v2h5"></path></svg>
                <span>Símbolos</span>
                <svg class="w-3 h-3 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"></path></svg>
              </button>
              <div id="${symMenuId}" class="widget-dropdown-menu dropdown-panel hidden absolute left-0 mt-1 w-64 max-h-64 overflow-y-auto rounded-md bg-white dark:bg-zinc-900 shadow-xl border border-slate-200 dark:border-zinc-700 py-1 z-50 divide-y divide-slate-100/70 dark:divide-zinc-800/60">
                ${symListHtml}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-0.5">
            <button type="button" onmousedown="event.preventDefault(); event.stopPropagation(); openScienceCommandsModal('all')" title="Comandos de ciencias (copiar y pegar)" aria-label="Comandos de ciencias" class="w-5 h-5 rounded hover:bg-slate-200/80 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center justify-center text-[11px] font-bold transition">?</button>
            <button type="button" onmousedown="event.preventDefault(); event.stopPropagation(); toggleMathPreviewOnly('${mathId}')" title="${st.previewOnly ? 'Editar expresión' : 'Ver solo expresión renderizada'}" class="px-1.5 py-0.5 rounded hover:bg-slate-200/80 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-[10px] transition">${st.previewOnly ? 'Editar' : 'Solo vista'}</button>
            <button type="button" onmousedown="event.preventDefault(); event.stopPropagation(); copyMathWidgetContent('${mathId}')" title="Copiar expresión" aria-label="Copiar fórmula" class="w-6 h-6 rounded hover:bg-slate-200/80 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 flex items-center justify-center transition">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
            <button type="button" onmousedown="event.preventDefault(); event.stopPropagation(); removeMathWidget('${mathId}')" title="Eliminar bloque" aria-label="Eliminar bloque" class="w-6 h-6 rounded hover:bg-slate-200/80 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 flex items-center justify-center transition">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
        <textarea
          class="math-input-layer ${st.previewOnly ? 'hidden' : ''}"
          spellcheck="false"
          placeholder="${cfg.placeholder}"
          oninput="handleMathWidgetInput('${mathId}', this); updateScienceAutocomplete('${mathId}', this);"
          onkeydown="handleMathTextareaKeydown(event, '${mathId}', this)"
          onblur="setTimeout(closeScienceAutocomplete, 140)"
        >${escapeHtml(st.expr)}</textarea>
        <div class="math-preview-area ${st.previewOnly ? 'border-t-0' : ''}" ondblclick="if(${st.previewOnly}) toggleMathPreviewOnly('${mathId}')">${renderMathPreviewHtml(st.expr, st.mode)}</div>
      `;

      const ta = widget.querySelector('textarea.math-input-layer');
      if (ta && !st.previewOnly) {
        ta.style.height = 'auto';
        ta.style.height = Math.max(48, ta.scrollHeight) + 'px';
      }
    }

    function handleMathWidgetInput(mathId, textareaEl) {
      const widget = document.querySelector(`.math-widget[data-math-id="${mathId}"]`);
      if (!widget || !textareaEl) return;
      const val = textareaEl.value;
      textareaEl.style.height = 'auto';
      textareaEl.style.height = Math.max(48, textareaEl.scrollHeight) + 'px';
      const st = parseMathWidgetState(widget);
      st.expr = val;
      saveMathWidgetState(widget, st);
      const preview = widget.querySelector('.math-preview-area');
      if (preview) preview.innerHTML = renderMathPreviewHtml(val, st.mode);
      scheduleHistorySnapshot(getActiveTab()?.id, false);
    }

    function insertMathSymbol(mathId, symStr) {
      const widget = document.querySelector(`.math-widget[data-math-id="${mathId}"]`);
      if (!widget) return;
      const ta = widget.querySelector('textarea.math-input-layer');
      if (!ta) return;
      const start = ta.selectionStart ?? ta.value.length;
      const end = ta.selectionEnd ?? ta.value.length;
      ta.value = ta.value.slice(0, start) + symStr + ta.value.slice(end);
      ta.focus();
      const pos = start + symStr.length;
      ta.setSelectionRange(pos, pos);
      handleMathWidgetInput(mathId, ta);
    }

    function copyMathWidgetContent(mathId) {
      const widget = document.querySelector(`.math-widget[data-math-id="${mathId}"]`);
      if (!widget) return;
      const st = parseMathWidgetState(widget);
      navigator.clipboard.writeText(st.expr || '').then(() => showToast('Expresión copiada al portapapeles'));
    }

    function removeMathWidget(mathId) {
      const widget = document.querySelector(`.math-widget[data-math-id="${mathId}"]`);
      if (!widget) return;
      widget.remove();
      handleLiveSheetInput();
      scheduleHistorySnapshot(getActiveTab()?.id, true);
    }

    function mountAllMathWidgetsInEditor() {
      const editor = document.getElementById('liveSheetEditor');
      if (!editor) return;
      editor.querySelectorAll('.math-widget').forEach(w => mountMathWidget(w));
    }

    function insertMathWidgetInSheet(initialExpr, mode = 'math') {
      const editor = document.getElementById('liveSheetEditor');
      if (!editor) return;
      editor.focus();

      const safeMode = SCIENCE_DISCIPLINES[mode] ? mode : 'math';
      const mathId = 'math-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      const expr = typeof initialExpr === 'string'
        ? initialExpr
        : SCIENCE_DISCIPLINES[safeMode].defaultExpr;

      const widget = document.createElement('div');
      widget.className = 'math-widget';
      widget.setAttribute('contenteditable', 'false');
      widget.setAttribute('data-math-id', mathId);
      widget.setAttribute('data-state', JSON.stringify({ expr, mode: safeMode, previewOnly: false }));

      const trailingDiv = document.createElement('div');
      trailingDiv.innerHTML = '<br>';

      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
        const lineBlock = getOrWrapActiveLineBlock(editor, sel.anchorNode);
        if (lineBlock && lineBlock !== editor) {
          lineBlock.after(widget, trailingDiv);
        } else {
          editor.appendChild(widget);
          editor.appendChild(trailingDiv);
        }
      } else {
        editor.appendChild(widget);
        editor.appendChild(trailingDiv);
      }

      mountMathWidget(widget);
      const ta = widget.querySelector('textarea.math-input-layer');
      if (ta) ta.focus();
      handleLiveSheetInput();
      const t = getActiveTab();
      if (t) scheduleHistorySnapshot(t.id, true);
      showToast('Bloque de matemática insertado');
    }

    function insertCodeWidgetWithLang(lang) {
      const editor = document.getElementById('liveSheetEditor');
      if (!editor) return;
      restoreSavedSelection();

      const codeId = 'code-' + Date.now();
      const sel = window.getSelection();
      const selectedText = (sel && !sel.isCollapsed && editor.contains(sel.anchorNode)) ? sel.toString() : '';

      const widget = document.createElement('div');
      widget.className = 'code-widget';
      widget.setAttribute('contenteditable', 'false');
      widget.setAttribute('data-code-id', codeId);
      widget.setAttribute('data-state', JSON.stringify({
        lang: lang || 'javascript',
        code: selectedText
      }));

      const trailingDiv = document.createElement('div');
      trailingDiv.innerHTML = '<br>';

      if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
        const lineBlock = getOrWrapActiveLineBlock(editor, sel.anchorNode);
        if (lineBlock && lineBlock !== editor) {
          lineBlock.after(widget, trailingDiv);
        } else {
          editor.appendChild(widget);
          editor.appendChild(trailingDiv);
        }
      } else {
        editor.appendChild(widget);
        editor.appendChild(trailingDiv);
      }

      mountCodeWidget(widget);
      const ta = widget.querySelector('textarea.code-input-layer');
      if (ta) ta.focus();
      handleLiveSheetInput();
      showToast(`Bloque de código ${LANGUAGE_LABELS[lang] || lang} insertado`);
    }
