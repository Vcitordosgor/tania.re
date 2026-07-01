/* ─────────────────────────────────────────────────────────
   Tania — simulateur facturation électronique — V2
   Plan d'action en 6 questions. Vanilla JS, sans framework.
   ───────────────────────────────────────────────────────── */
(() => {
  'use strict';

  const safeTrack = (eventName, params = {}) => {
    try { if (typeof gtag === 'function') gtag('event', eventName, params); } catch (_) {}
  };

  // ─── Définition des questions ───
  const QUESTIONS = [
    {
      id: 'q1', text: 'Votre activité est-elle basée à La Réunion ?',
      options: [
        { value: 'oui', label: 'Oui' },
        { value: 'non', label: 'Non' },
        { value: 'clients_reunion', label: 'Pas encore, mais je travaille avec des clients à La Réunion' }
      ]
    },
    {
      id: 'q2', text: 'Vous êtes plutôt :',
      options: [
        { value: 'micro', label: 'Micro-entrepreneur / auto-entrepreneur' },
        { value: 'ei', label: 'Entrepreneur individuel' },
        { value: 'societe', label: 'Société : SAS, SASU, SARL, EURL' },
        { value: 'association', label: 'Association' },
        { value: 'inconnu', label: 'Je ne sais pas' }
      ]
    },
    {
      id: 'q3', text: 'Côté TVA :',
      options: [
        { value: 'franchise', label: 'Je suis en franchise de TVA' },
        { value: 'tva', label: 'Je facture la TVA' },
        { value: 'inconnu', label: 'Je ne sais pas' }
      ]
    },
    {
      id: 'q4', text: 'Vous facturez surtout :',
      options: [
        { value: 'particuliers', label: 'Des particuliers' },
        { value: 'entreprises', label: 'Des entreprises' },
        { value: 'mixte', label: 'Les deux' },
        { value: 'aucun', label: 'Je ne facture pas encore' }
      ]
    },
    {
      id: 'q5', text: 'Chaque mois, vous faites environ :',
      options: [
        { value: '0-5', label: '0 à 5 devis ou factures' },
        { value: '6-20', label: '6 à 20 devis ou factures' },
        { value: '21-50', label: '21 à 50 devis ou factures' },
        { value: '50+', label: 'Plus de 50 devis ou factures' }
      ]
    },
    {
      id: 'q6', text: 'Aujourd’hui, vous créez vos devis ou factures avec :',
      options: [
        { value: 'excel', label: 'Excel / Word' },
        { value: 'logiciel', label: 'Un logiciel de facturation' },
        { value: 'comptable', label: 'Mon comptable' },
        { value: 'main', label: 'À la main / PDF' },
        { value: 'aucune', label: 'Je n’ai pas encore de vraie méthode' }
      ]
    }
  ];

  // ─── Icônes SVG (Lucide style, stroke 2) ───
  const SVG = {
    A: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    B: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    C: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    D: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    E: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    F: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
  };

  // ─── Textes des blocs "Ce que cela signifie" ───
  // tone: 'default' = vert brand, 'warn' = orange, 'info' = indigo
  const BLOCKS = {
    A: { tone: 'default', title: 'À partir de 2026 : recevoir',
      text: 'Votre entreprise devra probablement pouvoir recevoir des factures électroniques à partir du 1er septembre 2026. L’enjeu est d’anticiper le bon outil et le bon circuit avec votre comptable.' },
    B: { tone: 'default', title: 'À partir de 2027 : émettre',
      text: 'Si vous facturez des entreprises françaises, l’émission électronique deviendra probablement obligatoire à partir de 2027 pour les TPE, PME et micro-entreprises.' },
    C: { tone: 'warn', title: 'Franchise de TVA : attention',
      text: 'La franchise de TVA ne signifie pas forcément que vous êtes hors réforme. Vous pouvez aussi être concerné par la réception, puis par l’émission selon vos clients.' },
    D: { tone: 'info', title: 'Clients particuliers',
      text: 'Les ventes aux particuliers relèvent plutôt de l’e-reporting que de la facturation électronique B2B classique. Il faut donc bien identifier vos clients professionnels et particuliers.' },
    E: { tone: 'warn', title: 'Excel, Word ou PDF : à anticiper',
      text: 'Votre méthode actuelle risque de ne pas suffire pour produire des factures structurées. L’objectif est de préparer une transition sans tout changer au dernier moment.' },
    F: { tone: 'info', title: 'Situation à clarifier',
      text: 'Votre statut ou votre régime mérite une vérification. Le plus simple est de confirmer votre cas avec votre comptable avant de choisir un outil.' }
  };

  // ─── Sélection des blocs (max 4) ───
  const computeBlocks = (a) => {
    const reunionRelated = a.q1 === 'oui' || a.q1 === 'clients_reunion';
    const validStatus = a.q2 === 'micro' || a.q2 === 'ei' || a.q2 === 'societe';
    const needsClarif = a.q2 === 'inconnu' || a.q3 === 'inconnu' || a.q2 === 'association' || a.q1 === 'non' || a.q4 === 'aucun';
    const isB2B = a.q4 === 'entreprises' || a.q4 === 'mixte';
    const isParticuliers = a.q4 === 'particuliers' || a.q4 === 'mixte';
    const methodFragile = a.q6 === 'excel' || a.q6 === 'main' || a.q6 === 'aucune';

    if (needsClarif) {
      const out = ['F'];
      // Cas très incertain : Q1=non + Q4=aucun → minimaliste
      if (a.q1 === 'non' && a.q4 === 'aucun') return out;
      if (isParticuliers) out.push('D');
      if (a.q3 === 'franchise') out.push('C');
      return out.slice(0, 4);
    }

    const out = [];
    if (reunionRelated && validStatus) out.push('A');
    if (reunionRelated && validStatus && isB2B) out.push('B');
    if (a.q3 === 'franchise') out.push('C');
    if (isParticuliers) out.push('D');
    if (methodFragile) out.push('E');
    return out.slice(0, 4);
  };

  // ─── Niveau de préparation (priorité : clarify > prepare > verify) ───
  const LEVELS = {
    prepare: {
      key: 'prepare',
      label: 'À préparer maintenant',
      cls: 'sim-level-prepare',
      desc: 'Votre méthode actuelle risque d’être insuffisante pour la réforme. L’objectif est de préparer progressivement une organisation compatible, sans tout changer d’un coup.'
    },
    verify: {
      key: 'verify',
      label: 'Compatibilité à vérifier',
      cls: 'sim-level-verify',
      desc: 'Vous avez déjà une méthode structurée. L’enjeu est de vérifier sa compatibilité avec le futur circuit de la facturation électronique.'
    },
    clarify: {
      key: 'clarify',
      label: 'À clarifier avec votre comptable',
      cls: 'sim-level-clarify',
      desc: 'Votre situation mérite d’être précisée. Le plus simple est d’en parler avec votre expert-comptable pour confirmer votre cas.'
    }
  };

  const computeLevel = (a) => {
    const needsClarif = a.q2 === 'inconnu' || a.q3 === 'inconnu' || a.q2 === 'association' || a.q1 === 'non' || a.q4 === 'aucun';
    const methodFragile = a.q6 === 'excel' || a.q6 === 'main' || a.q6 === 'aucune';
    const methodOK = a.q6 === 'logiciel' || a.q6 === 'comptable';

    if (needsClarif) return LEVELS.clarify;
    if (methodFragile) return LEVELS.prepare;
    if (methodOK) return LEVELS.verify;
    return LEVELS.clarify;
  };

  // ─── Actions recommandées (exactement 3, scorées par priorité) ───
  const computeActions = (a) => {
    const isClarify = a.q2 === 'inconnu' || a.q3 === 'inconnu' || a.q2 === 'association' || a.q1 === 'non' || a.q4 === 'aucun';
    const methodFragile = a.q6 === 'excel' || a.q6 === 'main' || a.q6 === 'aucune';
    const methodOK = a.q6 === 'logiciel' || a.q6 === 'comptable';
    const isParticuliers = a.q4 === 'particuliers' || a.q4 === 'mixte';

    const candidates = [];

    if (a.q3 === 'inconnu') candidates.push({ s: 100, t: 'Vérifier votre régime TVA.' });

    // Clients — formulation adaptée selon le profil
    if (a.q4 === 'mixte') {
      candidates.push({ s: 92, t: 'Distinguer vos clients professionnels et particuliers.' });
    } else if (a.q4 === 'particuliers') {
      candidates.push({ s: 90, t: 'Vérifier si certains de vos clients sont des professionnels.' });
    } else if (a.q4 === 'entreprises' && !isClarify) {
      candidates.push({ s: 92, t: 'Préparer l’émission électronique à partir de 2027.' });
    }

    // Comptable : boosté en cas de clarify pour aller en tête
    candidates.push({ s: isClarify ? 88 : 70, t: 'Demander à votre comptable quelle Plateforme Agréée il recommande.' });

    // SIRET : utile surtout en cas de clarify
    if (isClarify) candidates.push({ s: 80, t: 'Vérifier votre SIRET et vos informations d’entreprise.' });

    // Méthode fragile : actions réduites en cas de clarify pour rester prudent
    if (methodFragile) {
      candidates.push({ s: isClarify ? 65 : 86, t: 'Choisir un outil capable de préparer des factures structurées.' });
      candidates.push({ s: isClarify ? 64 : 85, t: 'Éviter de rester uniquement sur Excel, Word ou des PDF simples.' });
    }
    if (methodOK) {
      candidates.push({ s: 78, t: 'Tester la création d’une facture structurée avant l’échéance.' });
    }

    if ((a.q1 === 'oui' || a.q1 === 'clients_reunion') && !isClarify) {
      candidates.push({ s: 60, t: 'Préparer la réception électronique avant le 1er septembre 2026.' });
    }

    candidates.sort((x, y) => y.s - x.s);

    const seen = new Set();
    const final = [];
    for (const c of candidates) {
      if (!seen.has(c.t)) { seen.add(c.t); final.push(c.t); if (final.length === 3) break; }
    }
    // Pad fallbacks pour toujours produire 3 actions
    const fb = [
      'Demander à votre comptable quelle Plateforme Agréée il recommande.',
      'Vérifier votre SIRET et vos informations d’entreprise.',
      'Vérifier votre régime TVA.'
    ];
    for (const f of fb) {
      if (final.length >= 3) break;
      if (!seen.has(f)) { final.push(f); seen.add(f); }
    }
    return final;
  };

  const labelFor = (qid, val) => {
    const q = QUESTIONS.find(x => x.id === qid);
    if (!q) return val || '';
    const o = q.options.find(x => x.value === val);
    return o ? o.label : (val || '—');
  };

  // ─── Chips courts pour la carte profil ───
  const shortLabel = (qid, val) => {
    const map = {
      q2: { micro: 'Micro-entreprise', ei: 'Entreprise individuelle', societe: 'Société', association: 'Association', inconnu: 'Statut à clarifier' },
      q3: { franchise: 'Franchise TVA', tva: 'Assujetti TVA', inconnu: 'TVA à clarifier' },
      q4: { particuliers: 'Clients particuliers', entreprises: 'Clients entreprises', mixte: 'Clients mixtes', aucun: 'Pas encore de facturation' },
      q5: { '0-5': '0–5/mois', '6-20': '6–20/mois', '21-50': '21–50/mois', '50+': '50+/mois' },
      q6: { excel: 'Excel / Word', logiciel: 'Logiciel facturation', comptable: 'Via comptable', main: 'Manuel / PDF', aucune: 'Pas de méthode' }
    };
    return (map[qid] && map[qid][val]) || labelFor(qid, val);
  };

  // ─── Principale échéance selon profil ───
  const computeMainDeadline = (a) => {
    const isB2B = a.q4 === 'entreprises' || a.q4 === 'mixte';
    const isUnclear = a.q4 === 'aucun' || a.q1 === 'non' || a.q2 === 'inconnu';
    if (isUnclear) return { label: 'À clarifier', subtitle: 'Selon votre situation finale', highlight: null };
    if (isB2B) return { label: '1er septembre 2027', subtitle: 'Émission électronique obligatoire (B2B)', highlight: '2027' };
    // Default : particuliers → réception 2026 reste l'enjeu principal
    return { label: '1er septembre 2026', subtitle: 'Réception électronique obligatoire', highlight: '2026' };
  };

  // ─── State + storage ───
  const STORAGE_KEY = 'tania_sim_answers_v1';
  const state = { answers: {}, idx: 0 };

  const loadAnswers = () => {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) || {} : {}; }
    catch (_) { return {}; }
  };
  const saveAnswers = (a) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(a)); } catch (_) {} };
  const clearAnswers = () => { try { localStorage.removeItem(STORAGE_KEY); } catch (_) {} };

  // ─── DOM refs ───
  let el = {};
  const cacheDOM = () => {
    el.hero = document.getElementById('sim-hero');
    el.quiz = document.getElementById('sim-quiz');
    el.result = document.getElementById('sim-result');
    el.startBtn = document.getElementById('sim-start');
    el.qContainer = document.getElementById('sim-question-container');
    el.progressFill = document.getElementById('sim-progress-fill');
    el.progressLabel = document.getElementById('sim-progress-label');
    el.toast = document.getElementById('sim-toast');
  };

  // ─── Render question ───
  const renderQuestion = () => {
    const q = QUESTIONS[state.idx];
    const isLast = state.idx === QUESTIONS.length - 1;
    const current = state.answers[q.id] || '';

    el.progressFill.style.width = `${((state.idx + 1) / QUESTIONS.length) * 100}%`;
    el.progressLabel.textContent = `Question ${state.idx + 1} sur ${QUESTIONS.length}`;

    el.qContainer.innerHTML = `
      <div class="sim-question" role="group" aria-labelledby="q-title-${q.id}">
        <h2 id="q-title-${q.id}">${q.text}</h2>
        <ul class="sim-options" role="radiogroup">
          ${q.options.map(opt => `
            <li>
              <label>
                <input type="radio" name="${q.id}" value="${opt.value}" ${current === opt.value ? 'checked' : ''} />
                <span>${opt.label}</span>
              </label>
            </li>
          `).join('')}
        </ul>
        <div class="sim-nav">
          <button type="button" class="sim-nav-prev" ${state.idx === 0 ? 'disabled' : ''}>← Précédent</button>
          <button type="button" class="sim-nav-next" ${current ? '' : 'disabled'}>${isLast ? 'Voir mon plan d’action →' : 'Suivant →'}</button>
        </div>
      </div>
    `;

    const nextBtn = el.qContainer.querySelector('.sim-nav-next');
    const prevBtn = el.qContainer.querySelector('.sim-nav-prev');
    const radios = el.qContainer.querySelectorAll('input[type="radio"]');

    radios.forEach(r => {
      r.addEventListener('change', () => {
        state.answers[q.id] = r.value;
        saveAnswers(state.answers);
        nextBtn.disabled = false;
        safeTrack('simulator_question_answered', { question: q.id, answer: r.value });
      });
    });

    nextBtn.addEventListener('click', () => {
      if (!state.answers[q.id]) return;
      if (isLast) showResult();
      else { state.idx++; renderQuestion(); el.qContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
    prevBtn.addEventListener('click', () => {
      if (state.idx > 0) { state.idx--; renderQuestion(); el.qContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  };

  // ─── Toast ───
  let toastTimer;
  const showToast = (msg) => {
    if (!el.toast) return;
    el.toast.textContent = msg;
    el.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove('show'), 2200);
  };

  // ─── Clipboard ───
  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text); return true;
      }
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (_) { return false; }
  };

  // ─── Construction texte WhatsApp ───
  const buildWhatsAppLink = (a, level, actions) => {
    const message = `Bonjour, je viens de faire le test Tania sur la facturation électronique.

Voici mon profil :
- Statut : ${labelFor('q2', a.q2)}
- TVA : ${labelFor('q3', a.q3)}
- Clients : ${labelFor('q4', a.q4)}
- Volume : ${labelFor('q5', a.q5)}
- Méthode actuelle : ${labelFor('q6', a.q6)}

Mon niveau :
${level.label}

Mes priorités :
1. ${actions[0]}
2. ${actions[1]}
3. ${actions[2]}

Pouvez-vous me dire comment Tania peut m'aider à préparer simplement la réforme ?`;
    // Numéro WhatsApp officiel Tania
    return `https://wa.me/262693517153?text=${encodeURIComponent(message)}`;
  };

  // ─── Construction lien mailto (envoi du plan par email) ───
  const buildMailtoLink = (a, level, actions) => {
    const subject = 'Mon plan d’action facturation électronique — Tania';
    const body = buildPlanText(a, computeBlocks(a), level, actions);
    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // ─── Construction texte "Copier mon plan" ───
  const buildPlanText = (a, blocks, level, actions) => {
    const meaningPart = blocks.map(k => `- ${BLOCKS[k].title}\n  ${BLOCKS[k].text}`).join('\n\n');
    return `Mon plan d'action facturation électronique — Tania

Profil :
- Statut : ${labelFor('q2', a.q2)}
- TVA : ${labelFor('q3', a.q3)}
- Clients : ${labelFor('q4', a.q4)}
- Volume : ${labelFor('q5', a.q5)}
- Méthode actuelle : ${labelFor('q6', a.q6)}

Niveau :
${level.label} — ${level.desc}

Ce que cela signifie :
${meaningPart}

Mes 3 prochaines actions :
1. ${actions[0]}
2. ${actions[1]}
3. ${actions[2]}

Guide complet :
https://tania.re/facturation-electronique-reunion

⚠️ Ce test fournit une première indication pédagogique. Il ne remplace pas l'avis de votre expert-comptable ni les informations officielles de l'administration fiscale.`;
  };

  // ─── Render résultat = plan d'action ───
  const showResult = () => {
    const a = state.answers;
    const blocks = computeBlocks(a);
    const level = computeLevel(a);
    const actions = computeActions(a);

    el.quiz.classList.remove('active');
    el.result.classList.add('active');

    const blocksHTML = blocks.map(k => {
      const b = BLOCKS[k];
      const toneCls = b.tone === 'warn' ? 'sim-meaning-item--warn' : b.tone === 'info' ? 'sim-meaning-item--info' : '';
      return `
      <div class="sim-meaning-item ${toneCls}">
        <span class="sim-meaning-icon" aria-hidden="true">${SVG[k]}</span>
        <div>
          <p class="sim-meaning-title">${b.title}</p>
          <p class="sim-meaning-text">${b.text}</p>
        </div>
      </div>`;
    }).join('');

    const actionsHTML = actions.map((act, i) => `
      <li class="sim-action-item">
        <span class="sim-action-num">${i + 1}</span>
        <span class="sim-action-text">${act}</span>
      </li>
    `).join('');

    const deadline = computeMainDeadline(a);
    const chipsHTML = ['q2','q3','q4','q5','q6'].map(qid => `<span class="sim-chip">${shortLabel(qid, a[qid])}</span>`).join('');

    el.result.innerHTML = `
      <header class="sim-plan-header">
        <h2>Votre plan d’action facturation électronique</h2>
        <p>D’après vos réponses, voici votre priorité pour préparer progressivement les échéances 2026-2027.</p>
      </header>

      <article class="sim-card sim-profile">
        <div class="sim-profile__left">
          <p class="sim-card-title">Votre profil</p>
          <div class="sim-chips">${chipsHTML}</div>
        </div>
        <div class="sim-profile__right">
          <p class="sim-card-title">Principale échéance</p>
          <p class="sim-deadline">${deadline.label}</p>
          <p class="sim-deadline__sub">${deadline.subtitle}</p>
        </div>
      </article>

      <article class="sim-card sim-timeline-card">
        <p class="sim-card-title">Votre positionnement sur la réforme</p>
        <div class="sim-timeline" role="img" aria-label="Échéances 2026 et 2027">
          <div class="sim-timeline__line"></div>
          <div class="sim-timeline__milestone ${deadline.highlight === '2026' ? 'is-current' : ''}">
            <span class="sim-timeline__dot" aria-hidden="true"></span>
            <p class="sim-timeline__date">1er sept. 2026</p>
            <p class="sim-timeline__label">Réception<br/>obligatoire</p>
          </div>
          <div class="sim-timeline__milestone ${deadline.highlight === '2027' ? 'is-current' : ''}">
            <span class="sim-timeline__dot" aria-hidden="true"></span>
            <p class="sim-timeline__date">1er sept. 2027</p>
            <p class="sim-timeline__label">Émission TPE,<br/>PME, micro</p>
          </div>
        </div>
        ${deadline.highlight ? `<p class="sim-timeline__hint">Votre échéance prioritaire est en <strong>${deadline.highlight}</strong>.</p>` : '<p class="sim-timeline__hint">Votre échéance prioritaire dépend de votre situation à clarifier.</p>'}
      </article>

      <article class="sim-card sim-card-level">
        <span class="sim-level-badge ${level.cls}">${level.label}</span>
        <p class="sim-level-desc">${level.desc}</p>
      </article>

      <article class="sim-card">
        <h3 class="sim-card-title">Ce que cela signifie pour vous</h3>
        <div class="sim-meaning-list">${blocksHTML}</div>
      </article>

      <article class="sim-card sim-card-actions">
        <h3 class="sim-card-title">Vos 3 prochaines actions</h3>
        <ol class="sim-actions-list">${actionsHTML}</ol>
      </article>

      <article class="sim-card sim-card-tania">
        <h3 class="sim-card-title">Comment Tania peut vous aider</h3>
        <p class="sim-tania-text">Tania ne remplace pas votre comptable et n’est pas une Plateforme Agréée. L’objectif est plus simple&nbsp;: vous aider à garder une méthode claire depuis WhatsApp pour créer, suivre et retrouver vos devis, factures et relances, tout en préparant progressivement une organisation compatible avec la réforme.</p>
        <a href="${buildWhatsAppLink(a, level, actions)}" target="_blank" rel="noopener" class="sim-btn-whatsapp sim-btn-block" id="sim-wa-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2.1-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
          Recevoir mon plan par WhatsApp
        </a>
        <div class="sim-utils-row">
          <a href="${buildMailtoLink(a, level, actions)}" class="sim-btn-util" id="sim-email-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Envoyer par email
          </a>
          <button type="button" class="sim-btn-util" id="sim-pdf-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Télécharger en PDF
          </button>
          <button type="button" class="sim-btn-util" id="sim-copy-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>Copier</span>
          </button>
        </div>
        <a href="/facturation-electronique-reunion" class="sim-btn-ghost sim-btn-ghost-center">Lire le guide complet
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </article>

      <div class="sim-share">
        <p class="sim-share-title">Vous connaissez d’autres entrepreneurs concernés&#8239;?</p>
        <div class="sim-share-row">
          <a href="https://wa.me/?text=${encodeURIComponent('J’ai trouvé ce test utile pour savoir si une entreprise est concernée par la facturation électronique à La Réunion : https://tania.re/test-facturation-electronique-reunion')}" target="_blank" rel="noopener" class="sim-share-btn" id="sim-share-wa">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2.1-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
            Partager sur WhatsApp
          </a>
          <button type="button" class="sim-share-btn" id="sim-share-link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            Copier le lien
          </button>
        </div>
      </div>

      <div class="sim-restart-row">
        <button type="button" id="sim-restart" class="sim-btn-restart">Recommencer le test</button>
      </div>

      <div class="sim-disclaimer">
        <strong>Ce test fournit une première indication pédagogique.</strong> Il ne remplace pas l’avis de votre expert-comptable ni les informations officielles de l’administration fiscale. Pour aller plus loin, consultez le <a href="/facturation-electronique-reunion">guide complet de la facturation électronique à La Réunion</a>.
      </div>
    `;

    // Listeners post-rendu
    const planText = buildPlanText(a, blocks, level, actions);

    const copyBtn = document.getElementById('sim-copy-btn');
    copyBtn.addEventListener('click', async () => {
      const ok = await copyToClipboard(planText);
      if (ok) {
        copyBtn.classList.add('copied');
        copyBtn.querySelector('span').textContent = 'Plan copié';
        safeTrack('diagnostic_copied');
        setTimeout(() => { copyBtn.classList.remove('copied'); copyBtn.querySelector('span').textContent = 'Copier mon plan'; }, 2400);
      } else {
        showToast('Copie indisponible — sélectionnez le texte manuellement.');
      }
    });

    document.getElementById('sim-wa-btn').addEventListener('click', () => safeTrack('whatsapp_diagnostic_clicked'));
    document.getElementById('sim-share-wa').addEventListener('click', () => safeTrack('whatsapp_share_clicked'));

    const emailBtn = document.getElementById('sim-email-btn');
    if (emailBtn) emailBtn.addEventListener('click', () => safeTrack('email_diagnostic_clicked'));

    const pdfBtn = document.getElementById('sim-pdf-btn');
    if (pdfBtn) pdfBtn.addEventListener('click', () => {
      safeTrack('pdf_download_clicked');
      window.print();
    });

    const shareLinkBtn = document.getElementById('sim-share-link');
    shareLinkBtn.addEventListener('click', async () => {
      const ok = await copyToClipboard('https://tania.re/test-facturation-electronique-reunion');
      if (ok) {
        shareLinkBtn.classList.add('copied');
        shareLinkBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Lien copié';
        safeTrack('link_share_clicked');
        setTimeout(() => {
          shareLinkBtn.classList.remove('copied');
          shareLinkBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> Copier le lien';
        }, 2400);
      } else { showToast('Copie indisponible.'); }
    });

    document.getElementById('sim-restart').addEventListener('click', () => {
      clearAnswers();
      state.answers = {};
      state.idx = 0;
      el.result.classList.remove('active');
      el.result.innerHTML = '';
      el.hero.style.display = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      safeTrack('simulator_restarted');
    });

    safeTrack('simulator_completed', { result_blocks: blocks.join(','), niveau: level.key });

    el.result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ─── Start ───
  const startQuiz = () => {
    safeTrack('simulator_started');
    state.answers = loadAnswers();
    let firstUnanswered = 0;
    for (let i = 0; i < QUESTIONS.length; i++) {
      if (!state.answers[QUESTIONS[i].id]) { firstUnanswered = i; break; }
      if (i === QUESTIONS.length - 1) firstUnanswered = i;
    }
    state.idx = firstUnanswered;

    el.hero.style.display = 'none';
    el.quiz.classList.add('active');
    renderQuestion();
    el.quiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ─── Init ───
  document.addEventListener('DOMContentLoaded', () => {
    cacheDOM();
    if (!el.startBtn) return;
    el.startBtn.addEventListener('click', startQuiz);
  });
})();
