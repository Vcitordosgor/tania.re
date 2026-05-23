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

  // ─── Textes des blocs "Ce que cela signifie" ───
  const BLOCKS = {
    A: {
      icon: '📥',
      title: 'À partir de 2026 : recevoir',
      text: 'Votre entreprise devra probablement pouvoir recevoir des factures électroniques à partir du 1er septembre 2026. L’enjeu est d’anticiper le bon outil et le bon circuit avec votre comptable.'
    },
    B: {
      icon: '📤',
      title: 'À partir de 2027 : émettre',
      text: 'Si vous facturez des entreprises françaises, l’émission électronique deviendra probablement obligatoire à partir de 2027 pour les TPE, PME et micro-entreprises.'
    },
    C: {
      icon: '💼',
      title: 'Franchise de TVA : attention',
      text: 'La franchise de TVA ne signifie pas forcément que vous êtes hors réforme. Vous pouvez aussi être concerné par la réception, puis par l’émission selon vos clients.'
    },
    D: {
      icon: '🏪',
      title: 'Clients particuliers',
      text: 'Les ventes aux particuliers relèvent plutôt de l’e-reporting que de la facturation électronique B2B classique. Il faut donc bien distinguer vos clients professionnels et particuliers.'
    },
    E: {
      icon: '⚠️',
      title: 'Excel, Word ou PDF : à anticiper',
      text: 'Votre méthode actuelle risque de ne pas suffire pour produire des factures structurées. L’objectif est de préparer une transition sans tout changer au dernier moment.'
    },
    F: {
      icon: '🔍',
      title: 'Situation à clarifier',
      text: 'Votre statut ou votre régime mérite une vérification. Le plus simple est de confirmer votre cas avec votre comptable avant de choisir un outil.'
    }
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
    if (isParticuliers) candidates.push({ s: 90, t: 'Distinguer vos clients professionnels et particuliers.' });

    // Comptable : boosté en cas de clarify pour aller en tête
    candidates.push({ s: isClarify ? 88 : 70, t: 'Demander à votre comptable quelle Plateforme Agréée il recommande.' });

    // SIRET : utile surtout en cas de clarify
    if (isClarify) candidates.push({ s: 80, t: 'Vérifier votre SIRET et vos informations d’entreprise.' });

    // Méthode fragile : actions réduites en cas de clarify pour rester prudent
    if (methodFragile) {
      candidates.push({ s: isClarify ? 65 : 85, t: 'Choisir un outil capable de préparer des factures structurées.' });
      candidates.push({ s: isClarify ? 64 : 84, t: 'Éviter de rester uniquement sur Excel, Word ou des PDF simples.' });
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
    // TODO: remplacer par le numéro WhatsApp officiel Tania après validation Meta
    return `https://wa.me/33648345707?text=${encodeURIComponent(message)}`;
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

    const blocksHTML = blocks.map(k => `
      <div class="sim-meaning-item">
        <span class="sim-meaning-icon" aria-hidden="true">${BLOCKS[k].icon}</span>
        <div>
          <p class="sim-meaning-title">${BLOCKS[k].title}</p>
          <p class="sim-meaning-text">${BLOCKS[k].text}</p>
        </div>
      </div>
    `).join('');

    const actionsHTML = actions.map((act, i) => `
      <li class="sim-action-item">
        <span class="sim-action-num">${i + 1}</span>
        <span class="sim-action-text">${act}</span>
      </li>
    `).join('');

    el.result.innerHTML = `
      <header class="sim-plan-header">
        <h2>Votre plan d’action facturation électronique</h2>
        <p>D’après vos réponses, voici votre priorité pour préparer progressivement les échéances 2026-2027.</p>
      </header>

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
        <p class="sim-tania-text">Tania n’est pas une Plateforme Agréée et ne remplace pas votre comptable. Tania vous aide à garder une méthode simple depuis WhatsApp pour créer, suivre et retrouver vos devis, factures et relances, tout en préparant progressivement une organisation compatible avec la réforme.</p>
        <div class="sim-result-actions">
          <a href="${buildWhatsAppLink(a, level, actions)}" target="_blank" rel="noopener" class="sim-btn-whatsapp" id="sim-wa-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2.1-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
            Recevoir mon plan par WhatsApp
          </a>
          <button type="button" class="sim-btn-copy" id="sim-copy-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>Copier mon plan d’action</span>
          </button>
          <a href="/facturation-electronique-reunion" class="sim-btn-ghost">Lire le guide complet</a>
        </div>
      </article>

      <div class="sim-share">
        <p class="sim-share-title">Vous connaissez d’autres entrepreneurs concernés&#8239;?</p>
        <div class="sim-share-row">
          <a href="https://wa.me/?text=${encodeURIComponent('J’ai trouvé ce test utile pour savoir si une entreprise est concernée par la facturation électronique à La Réunion : https://tania.re/test-facturation-electronique-reunion')}" target="_blank" rel="noopener" class="sim-share-btn" id="sim-share-wa">📱 Partager sur WhatsApp</a>
          <button type="button" class="sim-share-btn" id="sim-share-link">🔗 Copier le lien</button>
        </div>
      </div>

      <div class="sim-restart-row">
        <button type="button" id="sim-restart" class="sim-btn-restart">↺ Recommencer le test</button>
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
        copyBtn.querySelector('span').textContent = 'Plan copié ✅';
        safeTrack('diagnostic_copied');
        setTimeout(() => { copyBtn.classList.remove('copied'); copyBtn.querySelector('span').textContent = 'Copier mon plan d’action'; }, 2400);
      } else {
        showToast('Copie indisponible — sélectionnez le texte manuellement.');
      }
    });

    document.getElementById('sim-wa-btn').addEventListener('click', () => safeTrack('whatsapp_diagnostic_clicked'));
    document.getElementById('sim-share-wa').addEventListener('click', () => safeTrack('whatsapp_share_clicked'));

    const shareLinkBtn = document.getElementById('sim-share-link');
    shareLinkBtn.addEventListener('click', async () => {
      const ok = await copyToClipboard('https://tania.re/test-facturation-electronique-reunion');
      if (ok) {
        shareLinkBtn.classList.add('copied');
        shareLinkBtn.textContent = '✅ Lien copié !';
        safeTrack('link_share_clicked');
        setTimeout(() => { shareLinkBtn.classList.remove('copied'); shareLinkBtn.textContent = '🔗 Copier le lien'; }, 2400);
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
