/* ─────────────────────────────────────────────────────────
   Tania — simulateur facturation électronique
   Vanilla JS, sans framework, sans backend.
   ───────────────────────────────────────────────────────── */
(() => {
  'use strict';

  // ─── Analytics safe ───
  const safeTrack = (eventName, params = {}) => {
    try { if (typeof gtag === 'function') gtag('event', eventName, params); } catch (_) {}
  };

  // ─── Définition des questions ───
  const QUESTIONS = [
    {
      id: 'q1',
      text: 'Votre entreprise est-elle basée à La Réunion ?',
      options: [
        { value: 'oui', label: 'Oui' },
        { value: 'non', label: 'Non' },
        { value: 'clients_reunion', label: 'Pas encore, mais je travaille avec des clients à La Réunion' }
      ]
    },
    {
      id: 'q2',
      text: 'Quel est votre statut ?',
      options: [
        { value: 'micro', label: 'Micro-entreprise / auto-entrepreneur' },
        { value: 'ei', label: 'Entreprise individuelle' },
        { value: 'societe', label: 'Société : SAS, SASU, SARL, EURL' },
        { value: 'association', label: 'Association' },
        { value: 'inconnu', label: 'Je ne sais pas' }
      ]
    },
    {
      id: 'q3',
      text: 'Votre situation TVA ?',
      options: [
        { value: 'franchise', label: 'Je suis en franchise de TVA' },
        { value: 'tva', label: 'Je facture la TVA' },
        { value: 'inconnu', label: 'Je ne sais pas' }
      ]
    },
    {
      id: 'q4',
      text: 'Vous facturez principalement :',
      options: [
        { value: 'particuliers', label: 'Des particuliers' },
        { value: 'entreprises', label: 'Des entreprises' },
        { value: 'mixte', label: 'Les deux' },
        { value: 'aucun', label: 'Je ne facture pas encore' }
      ]
    },
    {
      id: 'q5',
      text: 'Combien de devis ou factures créez-vous par mois ?',
      options: [
        { value: '0-5', label: '0 à 5' },
        { value: '6-20', label: '6 à 20' },
        { value: '21-50', label: '21 à 50' },
        { value: '50+', label: 'Plus de 50' }
      ]
    },
    {
      id: 'q6',
      text: 'Aujourd’hui, vous créez vos factures avec :',
      options: [
        { value: 'excel', label: 'Excel / Word' },
        { value: 'logiciel', label: 'Un logiciel de facturation' },
        { value: 'comptable', label: 'Mon comptable' },
        { value: 'main', label: 'À la main / PDF' },
        { value: 'aucune', label: 'Je n’ai pas encore de vraie méthode' }
      ]
    }
  ];

  // ─── Textes diagnostic ───
  const DIAG_TEXTS = {
    A: {
      title: 'Vous êtes probablement concerné dès 2026',
      icon: '📅',
      text: 'Votre entreprise devra probablement être capable de recevoir des factures électroniques à partir du 1er septembre 2026. Si vous facturez des entreprises françaises, l’émission électronique deviendra aussi obligatoire à partir du 1er septembre 2027 pour les TPE, PME et micro-entreprises.'
    },
    B: {
      title: 'Vous facturez surtout des particuliers',
      icon: '🏪',
      text: 'Vos ventes aux particuliers ne relèvent pas de la facturation électronique B2B classique, mais peuvent entrer dans le périmètre de l’e-reporting. Vous devez aussi anticiper la réception électronique de vos factures fournisseurs à partir de 2026.'
    },
    C: {
      title: 'Franchise de TVA : vous pouvez aussi être concerné',
      icon: '💼',
      text: 'La franchise de TVA ne dispense pas nécessairement de la réforme. Vous devrez probablement pouvoir recevoir des factures électroniques dès 2026, et en émettre dès 2027 si vous facturez des entreprises françaises.'
    },
    D: {
      title: 'Votre méthode actuelle risque d’être insuffisante',
      icon: '⚠️',
      text: 'Votre méthode actuelle risque de devenir insuffisante pour émettre des factures structurées. Il faudra passer par un outil capable de préparer des factures au format structuré, comme Factur-X, et de s’inscrire dans le circuit officiel via une Plateforme Agréée.'
    },
    E: {
      title: 'Situation à vérifier',
      icon: '🔍',
      text: 'Votre situation mérite une vérification plus précise. Selon votre statut, vos clients et votre régime TVA, vous pouvez être concerné par la réception électronique, l’émission électronique ou l’e-reporting.'
    }
  };

  // ─── Logique de diagnostic ───
  const computeDiagnostic = (a) => {
    const cats = new Set();
    const reunionRelated = a.q1 === 'oui' || a.q1 === 'clients_reunion';
    const validStatus = a.q2 === 'micro' || a.q2 === 'ei' || a.q2 === 'societe';
    const needsClarification = a.q2 === 'inconnu' || a.q3 === 'inconnu' || a.q2 === 'association' || a.q1 === 'non' || a.q4 === 'aucun';

    // A — concerné dès 2026 : Réunion (ou clients) + statut entreprise valide
    if (reunionRelated && validStatus) cats.add('A');

    // B — particuliers
    if (a.q4 === 'particuliers') cats.add('B');

    // C — franchise de TVA
    if (a.q3 === 'franchise') cats.add('C');

    // D — méthode insuffisante
    if (a.q6 === 'excel' || a.q6 === 'main' || a.q6 === 'aucune') cats.add('D');

    // E — situation à vérifier
    if (needsClarification) cats.add('E');

    if (cats.size === 0) cats.add('E');
    return Array.from(cats);
  };

  // ─── Niveau de préparation (3 niveaux) ───
  const computeLevel = (a) => {
    // 1. À préparer maintenant — méthode insuffisante
    if (a.q6 === 'excel' || a.q6 === 'main' || a.q6 === 'aucune') {
      return { key: 'prepare', label: 'À préparer maintenant', cls: 'sim-level-prepare' };
    }
    // 3. À clarifier — flou sur statut/TVA, association, hors Réunion
    if (a.q2 === 'inconnu' || a.q3 === 'inconnu' || a.q2 === 'association' || a.q1 === 'non') {
      return { key: 'clarify', label: 'À clarifier avec votre comptable', cls: 'sim-level-clarify' };
    }
    // 2. Compatibilité à vérifier — logiciel ou comptable + reste connu
    if (a.q6 === 'logiciel' || a.q6 === 'comptable') {
      return { key: 'verify', label: 'Compatibilité à vérifier', cls: 'sim-level-verify' };
    }
    return { key: 'clarify', label: 'À clarifier avec votre comptable', cls: 'sim-level-clarify' };
  };

  // ─── Actions recommandées ───
  const computeActions = (a) => {
    const out = ['Vérifier votre SIRET et vos informations d’entreprise.'];
    if (a.q6 === 'excel' || a.q6 === 'main' || a.q6 === 'aucune') {
      out.push('Éviter de rester uniquement sur Excel ou Word.');
      out.push('Choisir un outil capable de préparer des factures structurées.');
    }
    if (a.q3 === 'inconnu') out.push('Identifier votre régime TVA.');
    if (a.q1 === 'oui') out.push('Préparer la réception électronique avant le 1er septembre 2026.');
    if (a.q4 === 'mixte' || a.q4 === 'particuliers') out.push('Distinguer vos clients professionnels et particuliers.');
    out.push('Demander à votre comptable quelle Plateforme Agréée il recommande.');
    return out.slice(0, 5);
  };

  // ─── Helpers libellés ───
  const labelFor = (qid, val) => {
    const q = QUESTIONS.find(x => x.id === qid);
    if (!q) return val || '';
    const o = q.options.find(x => x.value === val);
    return o ? o.label : (val || '—');
  };

  // ─── State ───
  const STORAGE_KEY = 'tania_sim_answers_v1';
  const state = { answers: {}, idx: 0 };

  const loadAnswers = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const obj = JSON.parse(raw);
      return (obj && typeof obj === 'object') ? obj : {};
    } catch (_) { return {}; }
  };
  const saveAnswers = (a) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(a)); } catch (_) {}
  };
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
    const currentAnswer = state.answers[q.id] || '';

    el.progressFill.style.width = `${((state.idx + 1) / QUESTIONS.length) * 100}%`;
    el.progressLabel.textContent = `Question ${state.idx + 1}/${QUESTIONS.length}`;

    el.qContainer.innerHTML = `
      <div class="sim-question" role="group" aria-labelledby="q-title-${q.id}">
        <h2 id="q-title-${q.id}">${q.text}</h2>
        <ul class="sim-options" role="radiogroup">
          ${q.options.map((opt, i) => `
            <li>
              <label>
                <input type="radio" name="${q.id}" value="${opt.value}" ${currentAnswer === opt.value ? 'checked' : ''} />
                <span>${opt.label}</span>
              </label>
            </li>
          `).join('')}
        </ul>
        <div class="sim-nav">
          <button type="button" class="sim-nav-prev" ${state.idx === 0 ? 'disabled' : ''}>← Précédent</button>
          <button type="button" class="sim-nav-next" disabled>${isLast ? 'Voir mon diagnostic →' : 'Suivant →'}</button>
        </div>
      </div>
    `;

    const nextBtn = el.qContainer.querySelector('.sim-nav-next');
    const prevBtn = el.qContainer.querySelector('.sim-nav-prev');
    const radios = el.qContainer.querySelectorAll('input[type="radio"]');

    if (currentAnswer) nextBtn.disabled = false;

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
      if (isLast) {
        showResult();
      } else {
        state.idx++;
        renderQuestion();
        el.qContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    prevBtn.addEventListener('click', () => {
      if (state.idx > 0) {
        state.idx--;
        renderQuestion();
      }
    });

    // a11y : focus le titre
    const titleEl = document.getElementById(`q-title-${q.id}`);
    if (titleEl) titleEl.setAttribute('tabindex', '-1');
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

  // ─── Build texts ───
  const buildSummaryText = (cats) => {
    return cats.map(c => `• ${DIAG_TEXTS[c].title}`).join('\n');
  };

  const buildFullDiagnosticText = (a, cats, level, actions) => {
    return `Mon diagnostic facturation électronique — Tania (tania.re)

Profil :
- Statut : ${labelFor('q2', a.q2)}
- TVA : ${labelFor('q3', a.q3)}
- Clients : ${labelFor('q4', a.q4)}
- Volume : ${labelFor('q5', a.q5)}
- Méthode actuelle : ${labelFor('q6', a.q6)}

Niveau de préparation : ${level.label}

Diagnostic :
${cats.map(c => `- ${DIAG_TEXTS[c].title}\n  ${DIAG_TEXTS[c].text}`).join('\n\n')}

Actions recommandées :
${actions.map((act, i) => `${i + 1}. ${act}`).join('\n')}

Plus d'infos : https://tania.re/facturation-electronique-reunion

⚠️ Ce diagnostic est une indication pédagogique. Il ne remplace pas l'avis de votre expert-comptable.`;
  };

  const buildWhatsAppLink = (a, cats, level) => {
    const message = `Bonjour, je viens de faire le test facturation électronique sur tania.re.

Mon profil :
- Statut : ${labelFor('q2', a.q2)}
- TVA : ${labelFor('q3', a.q3)}
- Clients : ${labelFor('q4', a.q4)}
- Volume : ${labelFor('q5', a.q5)}
- Méthode actuelle : ${labelFor('q6', a.q6)}

Mon diagnostic :
${buildSummaryText(cats)}

Niveau : ${level.label}

Pouvez-vous m'envoyer mon diagnostic complet et m'expliquer comment Tania peut m'accompagner ?`;

    // TODO: remplacer par le numéro WhatsApp officiel Tania après validation Meta
    return `https://wa.me/33648345707?text=${encodeURIComponent(message)}`;
  };

  // ─── Render result ───
  const showResult = () => {
    const a = state.answers;
    const cats = computeDiagnostic(a);
    const level = computeLevel(a);
    const actions = computeActions(a);

    el.quiz.classList.remove('active');
    el.result.classList.add('active');

    const diagCardsHTML = cats.map(c => `
      <div class="sim-diag-card">
        <p class="sim-diag-title"><span aria-hidden="true">${DIAG_TEXTS[c].icon}</span> ${DIAG_TEXTS[c].title}</p>
        <p class="sim-diag-text">${DIAG_TEXTS[c].text}</p>
      </div>
    `).join('');

    const actionsHTML = actions.map(act => `<li>${act}</li>`).join('');

    el.result.innerHTML = `
      <div class="sim-result-header">
        <h2>Votre situation face à la facturation électronique</h2>
        <span class="sim-level-badge ${level.cls}">${level.label}</span>
      </div>

      ${diagCardsHTML}

      <div class="sim-actions-block">
        <h3>Actions recommandées</h3>
        <ul class="sim-actions-list">${actionsHTML}</ul>
      </div>

      <div class="sim-result-actions">
        <a href="${buildWhatsAppLink(a, cats, level)}" target="_blank" rel="noopener" class="sim-btn-whatsapp" id="sim-wa-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2.1-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.4.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z"/></svg>
          Recevoir par WhatsApp
        </a>
        <button type="button" class="sim-btn-copy" id="sim-copy-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <span>Copier mon diagnostic</span>
        </button>
      </div>

      <div class="sim-share">
        <p class="sim-share-title">Vous connaissez d’autres entrepreneurs concernés&#8239;?</p>
        <div class="sim-share-row">
          <a href="https://wa.me/?text=${encodeURIComponent('J’ai trouvé ce test utile pour savoir si une entreprise est concernée par la facturation électronique à La Réunion : https://tania.re/test-facturation-electronique-reunion')}" target="_blank" rel="noopener" class="sim-share-btn" id="sim-share-wa">📱 Partager sur WhatsApp</a>
          <button type="button" class="sim-share-btn" id="sim-share-link">🔗 Copier le lien</button>
        </div>
      </div>

      <section class="sim-final">
        <h2>Préparez la réforme sans changer vos habitudes</h2>
        <p>Tania est conçu pour aider les entrepreneurs à structurer progressivement leurs devis, factures, suivis et relances, avec l’objectif de préparer un fonctionnement compatible avec la réforme et les formats attendus comme Factur-X.</p>
        <a href="/#cta-final" class="sim-btn-primary">Réserver une démo gratuite</a>
        <br/>
        <a href="/facturation-electronique-reunion" class="sim-btn-outline">Lire le guide complet</a>
      </section>

      <div class="sim-disclaimer">
        <strong>Ce test fournit une première indication pédagogique.</strong> Il ne remplace pas l’avis de votre expert-comptable ni les informations officielles de l’administration fiscale. Pour le détail, consultez le <a href="/facturation-electronique-reunion">guide complet de la facturation électronique à La Réunion</a>.
      </div>
    `;

    // Listeners post-rendu
    const copyBtn = document.getElementById('sim-copy-btn');
    const fullText = buildFullDiagnosticText(a, cats, level, actions);
    copyBtn.addEventListener('click', async () => {
      const ok = await copyToClipboard(fullText);
      if (ok) {
        copyBtn.classList.add('copied');
        copyBtn.querySelector('span').textContent = '✅ Copié !';
        safeTrack('diagnostic_copied');
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.querySelector('span').textContent = 'Copier mon diagnostic';
        }, 2400);
      } else {
        showToast('Copie indisponible — sélectionnez le texte manuellement.');
      }
    });

    document.getElementById('sim-wa-btn').addEventListener('click', () => {
      safeTrack('whatsapp_diagnostic_clicked');
    });

    document.getElementById('sim-share-wa').addEventListener('click', () => {
      safeTrack('whatsapp_share_clicked');
    });

    const shareLinkBtn = document.getElementById('sim-share-link');
    shareLinkBtn.addEventListener('click', async () => {
      const ok = await copyToClipboard('https://tania.re/test-facturation-electronique-reunion');
      if (ok) {
        shareLinkBtn.classList.add('copied');
        shareLinkBtn.textContent = '✅ Lien copié !';
        safeTrack('link_share_clicked');
        setTimeout(() => {
          shareLinkBtn.classList.remove('copied');
          shareLinkBtn.textContent = '🔗 Copier le lien';
        }, 2400);
      } else {
        showToast('Copie indisponible.');
      }
    });

    safeTrack('simulator_completed', {
      result_categories: cats.join(','),
      niveau: level.key
    });

    el.result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ─── Clipboard ───
  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (_) { return false; }
  };

  // ─── Start ───
  const startQuiz = () => {
    safeTrack('simulator_started');
    state.answers = loadAnswers();
    // Reprendre à la 1ère question sans réponse (sinon Q1)
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
