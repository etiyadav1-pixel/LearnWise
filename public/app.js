/**
 * LearnWise × Kraftshala — Main Application Engine
 * Handles State Machine, Gamification (XP, Combos, Badges), 
 * Question Catalog, User Journey Puzzle, Sound FX & Supabase Auth/Progress Sync.
 */

// ============================================================
// 1. QUESTION CATALOG & CURRICULUM
// ============================================================
const QUESTIONS = [
  {
    id: 'Q1',
    topic: 'Impressions',
    question: 'What are Impressions?',
    options: {
      A: 'The number of times your ad was delivered (shown) on screen.',
      B: 'The number of unique people who saw your ad.',
      C: 'The number of audience you targeted in your Meta campaign.',
      D: 'The average number of times a unique user saw your ad.'
    },
    correct: 'A',
    screenId: 'screen-q1',
    expId: 'screen-exp1',
    nextScreenId: 'screen-q2'
  },
  {
    id: 'Q2',
    topic: 'Reach',
    question: 'What is Reach?',
    options: {
      A: 'The total number of times your ad was shown.',
      B: 'The total number of unique people who saw your ad.',
      C: 'The number of clicks your ad received.',
      D: 'The number of people who engaged with your ad.'
    },
    correct: 'B',
    screenId: 'screen-q2',
    expId: 'screen-exp2',
    nextScreenId: 'screen-q3'
  },
  {
    id: 'Q3',
    topic: 'Frequency',
    question: 'What is Frequency?',
    options: {
      A: 'The total number of impressions generated.',
      B: 'The average number of times each unique person saw your ad (Impressions ÷ Reach).',
      C: 'The speed at which your budget is consumed daily.',
      D: 'The number of days an ad set remains actively published.'
    },
    correct: 'B',
    screenId: 'screen-q3',
    expId: 'screen-exp3',
    nextScreenId: 'screen-q4'
  },
  {
    id: 'Q4',
    topic: 'Clicks (all)',
    question: 'What does Clicks (all) count?',
    options: {
      A: 'Only clicks on the call-to-action button.',
      B: 'Only link clicks that direct users off Meta to an external website.',
      C: 'Every single click on the ad, including post likes, comments, shares, profile visits, and link clicks.',
      D: 'Only clicks made by unique individuals.'
    },
    correct: 'C',
    screenId: 'screen-q4',
    expId: 'screen-exp4',
    nextScreenId: 'screen-q5'
  },
  {
    id: 'Q5',
    topic: 'Link Clicks',
    question: 'What does Link Clicks count?',
    options: {
      A: 'All reactions, comments, and shares on the ad.',
      B: 'Only clicks that result in an immediate purchase.',
      C: 'Clicks on links that direct users to select destinations (e.g. website, app store, messaging app).',
      D: 'The total number of unique people who clicked.'
    },
    correct: 'C',
    screenId: 'screen-q5',
    expId: 'screen-exp5',
    nextScreenId: 'screen-q6'
  },
  {
    id: 'Q6',
    topic: 'Unique Clicks (all)',
    question: 'What is the difference between Clicks (all) and Unique Clicks (all)?',
    options: {
      A: 'They are the same metric with different names in Ads Manager.',
      B: 'Clicks (all) counts only link clicks; Unique Clicks counts all clicks.',
      C: 'Clicks (all) counts every interaction; Unique Clicks (all) counts the number of unique individuals who clicked.',
      D: 'Unique Clicks counts clicks that occurred during desktop sessions only.'
    },
    correct: 'C',
    screenId: 'screen-q6',
    expId: 'screen-exp6',
    nextScreenId: 'screen-q7'
  },
  {
    id: 'Q7',
    topic: 'Landing Page Views',
    question: 'What does Landing Page Views count?',
    options: {
      A: 'The number of times someone clicked any link in your ad.',
      B: 'The number of people who saw your landing page in search results.',
      C: 'The number of times a person clicked an ad link and the landing page successfully loaded (Meta Pixel fired).',
      D: 'The total number of page refreshes made by your internal team.'
    },
    correct: 'C',
    screenId: 'screen-q7',
    expId: 'screen-exp7',
    nextScreenId: 'screen-q8'
  },
  {
    id: 'Q8',
    topic: 'Conversions',
    question: 'What is a Conversion in Meta Ads?',
    options: {
      A: 'Any generic click on your ad image.',
      B: 'When someone watches an ad video for more than 3 seconds.',
      C: 'The total number of impressions delivered on mobile feeds.',
      D: 'A specific valuable action a person takes on your website or app that aligns with your campaign goal.'
    },
    correct: 'D',
    screenId: 'screen-q8',
    expId: 'screen-exp8',
    nextScreenId: 'screen-journey' // Leads directly into User Journey puzzle!
  },
  {
    id: 'Q9',
    topic: 'Click-Through Rate (CTR)',
    question: 'How is Click-Through Rate (CTR) calculated?',
    options: {
      A: '(Impressions ÷ Clicks) × 100',
      B: '(Clicks ÷ Impressions) × 100',
      C: '(Conversions ÷ Impressions) × 100',
      D: 'Clicks × Impressions'
    },
    correct: 'B',
    screenId: 'screen-q9',
    expId: 'screen-exp9',
    nextScreenId: 'screen-q10'
  },
  {
    id: 'Q10',
    topic: 'Conversion Rate (CVR)',
    question: 'How is Conversion Rate (CVR) calculated?',
    options: {
      A: '(Conversions ÷ Impressions) × 100',
      B: '(Conversions ÷ Total Clicks) × 100',
      C: '(Total Clicks ÷ Conversions) × 100',
      D: 'Conversions × Total Spend'
    },
    correct: 'B',
    screenId: 'screen-q10',
    expId: 'screen-exp10',
    nextScreenId: 'screen-q11'
  },
  {
    id: 'Q11',
    topic: 'CPC & CPA',
    question: 'How do CPC and CPA evaluate campaign efficiency?',
    options: {
      A: 'CPC and CPA both measure the exact same cost per impression.',
      B: 'CPC measures cost per traffic click; CPA measures cost per acquired conversion goal.',
      C: 'CPC measures frequency efficiency; CPA measures reach efficiency.',
      D: 'They are only used in non-profit awareness campaigns.'
    },
    correct: 'B',
    screenId: 'screen-q11',
    expId: 'screen-exp11',
    nextScreenId: 'screen-report' // Leads to Final Report
  }
];

// Feedback Message Variations
const CORRECT_MESSAGES = [
  'Correct! 🎉 Spot on!',
  'Well done! You nailed this one.',
  'Good job — you were paying attention in class! 😎',
  'Fantastic work! Moving right along 🚀'
];

const ENCOURAGING_MESSAGES = [
  "Let's refresh our memory 📖",
  "Almost there — let's revisit this.",
  "Let's take another look in the explanation.",
  "Great effort — check out the next slide to master this!"
];

// ============================================================
// 2. WEB AUDIO API SYNTHESIZER
// ============================================================
const SoundFX = {
  ctx: null,
  enabled: true,

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },

  play(fn) {
    if (!this.enabled) return;
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.ctx) {
      try { fn(this.ctx); } catch (e) { /* ignore */ }
    }
  },

  correct() {
    this.play(ctx => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, t); // C5
      osc.frequency.setValueAtTime(659.25, t + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, t + 0.2); // G5
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  },

  incorrect() {
    this.play(ctx => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, t); // A3
      osc.frequency.setValueAtTime(180, t + 0.15);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  },

  combo() {
    this.play(ctx => {
      const t = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t + i * 0.08);
        gain.gain.setValueAtTime(0.2, t + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.25);
        osc.start(t + i * 0.08);
        osc.stop(t + i * 0.08 + 0.25);
      });
    });
  },

  streakBreak() {
    this.play(ctx => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.linearRampToValueAtTime(140, t + 0.22);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.start(t);
      osc.stop(t + 0.22);
    });
  },

  celebrate() {
    this.play(ctx => {
      const t = ctx.currentTime;
      const chord = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      chord.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(f, t + i * 0.1);
        gain.gain.setValueAtTime(0.25, t + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.35);
        osc.start(t + i * 0.1);
        osc.stop(t + i * 0.1 + 0.35);
      });
    });
  }
};

// ============================================================
// 3. APPLICATION STATE
// ============================================================
const AppState = {
  currentScreen: 'screen-cover',
  historyStack: [],
  studentId: null,
  studentName: null,
  isAuthenticated: false,
  attemptId: null,
  answers: {},             // e.g. { Q1: { selected: 'A', isCorrect: true, xp: 10 } }
  selectedOption: null,    // temporary selection for active question
  xp: 0,
  combo: 0,
  bestCombo: 0,
  journeyPlacements: {},   // { 1: 'Impressions', 2: 'Reach', ... }
  journeyCompleted: false,
  selectedJourneyChip: null, // For mobile tap-to-place fallback

  init() {
    // Check saved session
    const savedId = localStorage.getItem('learnwise_student_id');
    const savedName = localStorage.getItem('learnwise_student_name');
    if (savedId && savedName) {
      this.studentId = savedId;
      this.studentName = savedName;
      this.isAuthenticated = true;
      this.updateUserProfileHUD();
    }

    // Audio pref
    const audioPref = localStorage.getItem('learnwise_audio');
    if (audioPref === 'disabled') {
      SoundFX.enabled = false;
      const icon = document.getElementById('audio-icon');
      if (icon) icon.textContent = '🔇';
    }

    this.attemptId = crypto.randomUUID ? crypto.randomUUID() : 'att_' + Date.now();
  },

  updateUserProfileHUD() {
    const avatar = document.getElementById('user-avatar-initial');
    const nameEl = document.getElementById('user-display-name');
    if (avatar) {
      avatar.textContent = this.studentName ? this.studentName.charAt(0).toUpperCase() : '?';
    }
    if (nameEl) {
      nameEl.textContent = this.studentName || 'Student';
    }
    updateCoverAuthUI();
  }
};

// Update Cover Screen Auth Status
function updateCoverAuthUI() {
  const guestSec = document.getElementById('cover-guest-section');
  const userSec = document.getElementById('cover-user-section');
  const studentNameEl = document.getElementById('cover-student-name');
  const takeQuizBtn = document.getElementById('btn-take-quiz');

  if (AppState.isAuthenticated && AppState.studentName) {
    if (guestSec) guestSec.classList.add('hidden');
    if (userSec) userSec.classList.remove('hidden');
    if (studentNameEl) studentNameEl.textContent = AppState.studentName;
    if (takeQuizBtn) takeQuizBtn.innerHTML = `<span>Start Quiz as ${AppState.studentName}</span> <span class="btn-arrow">→</span>`;
  } else {
    if (guestSec) guestSec.classList.remove('hidden');
    if (userSec) userSec.classList.add('hidden');
    if (takeQuizBtn) takeQuizBtn.innerHTML = `<span>Sign In & Start Quiz</span> <span class="btn-arrow">→</span>`;
  }
}

function handleLogout() {
  localStorage.removeItem('learnwise_student_id');
  localStorage.removeItem('learnwise_student_name');
  AppState.studentId = null;
  AppState.studentName = null;
  AppState.isAuthenticated = false;
  AppState.updateUserProfileHUD();
  showToast('You have signed out successfully.', 'toast-info');
  navigateTo('screen-cover');
}

// ============================================================
// 4. NAVIGATION & SCREEN MANAGER
// ============================================================
function navigateTo(screenId, isBackNav = false) {
  // STRICT AUTH GATING:
  // No one can access any quiz screens, journey puzzle, or report without logging in!
  if (screenId !== 'screen-cover' && screenId !== 'screen-intro' && !AppState.isAuthenticated) {
    const authModal = document.getElementById('auth-modal');
    if (authModal) authModal.classList.remove('hidden');
    showToast('Please sign in or create an account to attend the quiz.', 'toast-info');
    return;
  }

  if (AppState.currentScreen === screenId) return;

  const currentScreenEl = document.getElementById(AppState.currentScreen);
  const targetScreenEl = document.getElementById(screenId);

  if (!targetScreenEl) {
    console.error(`Screen #${screenId} not found!`);
    return;
  }

  if (!isBackNav) {
    AppState.historyStack.push(AppState.currentScreen);
  }

  if (currentScreenEl) {
    currentScreenEl.classList.remove('active');
  }

  targetScreenEl.classList.add('active');
  AppState.currentScreen = screenId;

  // Manage HUD visibility
  const hud = document.getElementById('gamification-hud');
  if (screenId === 'screen-cover' || screenId === 'screen-intro') {
    hud.classList.add('hidden');
  } else {
    hud.classList.remove('hidden');
    updateProgressBar();
  }

  // Scroll viewport to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack() {
  if (AppState.historyStack.length === 0) {
    navigateTo('screen-cover', true);
    return;
  }
  const prevScreen = AppState.historyStack.pop();
  navigateTo(prevScreen, true);
}

function updateProgressBar() {
  const fill = document.getElementById('progress-bar-fill');
  const text = document.getElementById('progress-text');
  if (!fill || !text) return;

  // 12 units of progress: 11 questions + 1 user journey
  let step = 0;
  if (AppState.currentScreen.startsWith('screen-q')) {
    const qNum = parseInt(AppState.currentScreen.replace('screen-q', ''), 10);
    step = qNum <= 8 ? qNum : qNum + 1; // offset for journey puzzle
  } else if (AppState.currentScreen.startsWith('screen-exp')) {
    const expNum = parseInt(AppState.currentScreen.replace('screen-exp', ''), 10);
    step = expNum <= 8 ? expNum : expNum + 1;
  } else if (AppState.currentScreen === 'screen-journey') {
    step = 9;
  } else if (AppState.currentScreen === 'screen-report') {
    step = 12;
  }

  const pct = Math.min(100, Math.round((step / 12) * 100));
  fill.style.width = `${pct}%`;
  text.textContent = `${Math.min(12, Math.max(1, step))} / 12`;
}

// ============================================================
// 5. GAMIFICATION SYSTEM (XP, COMBOS, TOASTS)
// ============================================================
function awardXP(amount, reason = '') {
  AppState.xp += amount;
  const xpVal = document.getElementById('hud-xp-val');
  if (xpVal) xpVal.textContent = AppState.xp;

  showToast(`⚡ +${amount} XP ${reason}`, 'toast-xp');
}

function updateCombo(isCorrect) {
  const comboPill = document.getElementById('hud-combo-pill');
  const comboVal = document.getElementById('hud-combo-val');

  if (isCorrect) {
    // Add 1 on every correct answer
    AppState.combo++;
    if (AppState.combo > AppState.bestCombo) {
      AppState.bestCombo = AppState.combo;
    }

    if (comboVal) comboVal.textContent = AppState.combo;

    if (comboPill) {
      comboPill.classList.remove('hidden', 'streak-broken');
      comboPill.classList.add('active-streak');

      // Re-trigger pop animation
      comboPill.classList.remove('pop');
      void comboPill.offsetWidth;
      comboPill.classList.add('pop');
    }

    if (AppState.combo === 1) {
      showToast('🔥 Streak Started: 1 in a row!', 'toast-combo');
    } else {
      SoundFX.combo();
      showToast(`🔥 ${AppState.combo}x Combo Streak!`, 'toast-combo');
    }
  } else {
    // Break streak: come back to zero on wrong answer
    const prevStreak = AppState.combo;
    AppState.combo = 0;

    if (comboVal) comboVal.textContent = '0';

    if (comboPill) {
      comboPill.classList.remove('active-streak', 'pop');
      if (prevStreak > 0) {
        comboPill.classList.add('streak-broken');
        SoundFX.streakBreak();
        showToast(`💔 Streak Broken! (${prevStreak} in a row reset to 0)`, 'toast-break');
        setTimeout(() => {
          comboPill.classList.remove('streak-broken');
        }, 600);
      }
    }
  }
}

function showToast(message, className = '') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${className}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 2600);
}

// ============================================================
// 6. QUESTION & OPTION EVENT HANDLERS
// ============================================================
function setupQuestionScreens() {
  QUESTIONS.forEach(q => {
    const qScreen = document.getElementById(q.screenId);
    if (!qScreen) return;

    const optContainer = qScreen.querySelector('.options-container');
    const submitBtn = qScreen.querySelector('.btn-submit');
    const feedbackBox = qScreen.querySelector('.feedback-box');

    if (!optContainer || !submitBtn) return;

    // Handle Option Selection
    const optButtons = optContainer.querySelectorAll('.option-btn');
    optButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('locked')) return;

        optButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        AppState.selectedOption = btn.getAttribute('data-opt');

        submitBtn.disabled = false;
        SoundFX.play(ctx => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
        });
      });
    });

    // Handle Submit Answer
    submitBtn.addEventListener('click', async () => {
      if (submitBtn.disabled) return;

      const chosenOpt = AppState.selectedOption;
      if (!chosenOpt) return;

      // Lock buttons
      optButtons.forEach(b => b.classList.add('locked'));
      submitBtn.disabled = true;

      const isCorrect = chosenOpt === q.correct;
      const chosenBtn = optContainer.querySelector(`[data-opt="${chosenOpt}"]`);
      const correctBtn = optContainer.querySelector(`[data-opt="${q.correct}"]`);

      // Feedback Text
      const feedbackText = feedbackBox.querySelector('.feedback-text');
      const feedbackIcon = feedbackBox.querySelector('.feedback-icon');

      if (isCorrect) {
        if (chosenBtn) chosenBtn.classList.add('correct');
        feedbackBox.classList.remove('hidden', 'is-incorrect');
        feedbackBox.classList.add('is-correct');
        const randMsg = CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)];
        feedbackText.textContent = randMsg;
        feedbackIcon.textContent = '🎉';

        awardXP(10, 'Correct Answer');
        updateCombo(true);
        SoundFX.correct();
      } else {
        if (chosenBtn) chosenBtn.classList.add('incorrect');
        if (correctBtn) correctBtn.classList.add('correct');
        feedbackBox.classList.remove('hidden', 'is-correct');
        feedbackBox.classList.add('is-incorrect');
        const randEnc = ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];
        feedbackText.textContent = randEnc;
        feedbackIcon.textContent = '📖';

        updateCombo(false);
        SoundFX.incorrect();
      }

      // Record answer state
      AppState.answers[q.id] = {
        selected: chosenOpt,
        isCorrect,
        xpAwarded: isCorrect ? 10 : 0,
        topic: q.topic,
        question: q.question
      };

      // Persist to Supabase / Backend in background
      if (AppState.studentId) {
        API.saveAnswer(
          AppState.studentId,
          AppState.attemptId,
          q.id,
          q.topic,
          chosenOpt,
          isCorrect,
          isCorrect ? 10 : 0
        );
      }

      // Convert Submit Button into "Continue to Explanation →"
      submitBtn.textContent = 'Continue to Explanation →';
      submitBtn.disabled = false;
      submitBtn.onclick = () => {
        navigateTo(q.expId);
      };

      // Auto-advance after 1.8 seconds if user doesn't click
      setTimeout(() => {
        if (AppState.currentScreen === q.screenId) {
          navigateTo(q.expId);
        }
      }, 2000);
    });
  });

  // Wire up Explanation "Next" buttons
  const nextMappings = {
    'btn-next-exp1': 'screen-q2',
    'btn-next-exp2': 'screen-q3',
    'btn-next-exp3': 'screen-q4',
    'btn-next-exp4': 'screen-q5',
    'btn-next-exp5': 'screen-q6',
    'btn-next-exp6': 'screen-q7',
    'btn-next-exp7': 'screen-q8',
    'btn-next-exp8': 'screen-journey', // Goes to puzzle
    'btn-next-journey': 'screen-q9',
    'btn-next-exp9': 'screen-q10',
    'btn-next-exp10': 'screen-q11',
    'btn-finish-quiz': 'screen-report'
  };

  Object.entries(nextMappings).forEach(([btnId, targetScreen]) => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.addEventListener('click', () => {
        if (btnId === 'btn-finish-quiz') {
          finalizeAndShowReport();
        } else {
          navigateTo(targetScreen);
        }
      });
    }
  });
}

// ============================================================
// 6B. INTERACTIVE EXPLANATION PRACTICE CHECK
// ============================================================
function setupExplanationPractice() {
  const practiceBoxes = document.querySelectorAll('.practice-box');
  practiceBoxes.forEach((box) => {
    const chips = box.querySelectorAll('.practice-chip');
    const feedback = box.querySelector('.practice-feedback');

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        if (box.dataset.answered === 'true') return; // already answered
        box.dataset.answered = 'true';

        // Lock all options in this box
        chips.forEach((c) => c.classList.add('locked'));

        const isCorrect = chip.getAttribute('data-correct') === 'true';

        if (isCorrect) {
          chip.classList.add('correct-chip');
          const checkIcon = document.createElement('span');
          checkIcon.className = 'practice-result-icon';
          checkIcon.textContent = ' ✓';
          chip.appendChild(checkIcon);

          if (feedback) {
            feedback.className = 'practice-feedback feedback-correct';
            feedback.innerHTML = '<span>🎉</span> <span><strong>Correct!</strong> Great calculation.</span>';
            feedback.classList.remove('hidden');
          }

          SoundFX.correct();
          awardXP(10, 'Practice Check Bonus');
        } else {
          chip.classList.add('wrong-chip');
          const crossIcon = document.createElement('span');
          crossIcon.className = 'practice-result-icon';
          crossIcon.textContent = ' ✗';
          chip.appendChild(crossIcon);

          // Reveal the correct option in green
          chips.forEach((c) => {
            if (c.getAttribute('data-correct') === 'true') {
              c.classList.add('correct-chip');
              const rightIcon = document.createElement('span');
              rightIcon.className = 'practice-result-icon';
              rightIcon.textContent = ' (Correct)';
              c.appendChild(rightIcon);
            }
          });

          if (feedback) {
            feedback.className = 'practice-feedback feedback-wrong';
            feedback.innerHTML = '<span>💡</span> <span><strong>Not quite!</strong> The correct answer is highlighted in green.</span>';
            feedback.classList.remove('hidden');
          }

          SoundFX.incorrect();
        }
      });
    });
  });
}

// ============================================================
// 7. USER JOURNEY 8-METRIC PUZZLE (SCREEN 25)
// ============================================================
function setupUserJourneyPuzzle() {
  const slotsGrid = document.getElementById('journey-slots-grid');
  const cardsPool = document.getElementById('journey-cards-pool');
  const nextJourneyBtn = document.getElementById('btn-next-journey');
  if (!slotsGrid || !cardsPool) return;

  const chips = cardsPool.querySelectorAll('.journey-chip');
  const slots = slotsGrid.querySelectorAll('.journey-slot');

  // DRAG & DROP SUPPORT
  chips.forEach(chip => {
    chip.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', chip.getAttribute('data-metric'));
      chip.classList.add('dragging');
    });

    chip.addEventListener('dragend', () => {
      chip.classList.remove('dragging');
    });

    // MOBILE / TAP-TO-PLACE SUPPORT
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('is-selected-tap'));
      if (AppState.selectedJourneyChip === chip) {
        AppState.selectedJourneyChip = null;
      } else {
        chip.classList.add('is-selected-tap');
        AppState.selectedJourneyChip = chip;
      }
    });
  });

  slots.forEach(slot => {
    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
      slot.classList.add('drag-over');
    });

    slot.addEventListener('dragleave', () => {
      slot.classList.remove('drag-over');
    });

    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('drag-over');
      const metric = e.dataTransfer.getData('text/plain');
      evaluatePlacement(slot, metric);
    });

    // Tap slot when a card is selected
    slot.addEventListener('click', () => {
      if (AppState.selectedJourneyChip) {
        const metric = AppState.selectedJourneyChip.getAttribute('data-metric');
        evaluatePlacement(slot, metric);
        AppState.selectedJourneyChip = null;
        chips.forEach(c => c.classList.remove('is-selected-tap'));
      }
    });
  });

  function evaluatePlacement(slot, metric) {
    const expected = slot.getAttribute('data-expected');
    const slotPos = slot.getAttribute('data-slot-num');
    const dropzone = slot.querySelector('.slot-dropzone');

    if (metric === expected) {
      // Correct Match!
      slot.classList.add('is-correct');
      dropzone.innerHTML = `<strong>✓ ${metric}</strong>`;
      AppState.journeyPlacements[slotPos] = metric;

      // Hide chip from pool
      const matchedChip = cardsPool.querySelector(`[data-metric="${metric}"]`);
      if (matchedChip) matchedChip.classList.add('placed');

      SoundFX.correct();

      // Check if all 8 placed
      if (Object.keys(AppState.journeyPlacements).length === 8) {
        AppState.journeyCompleted = true;
        nextJourneyBtn.disabled = false;
        awardXP(15, 'Journey Mastery Bonus');
        SoundFX.combo();
        showToast('🏆 Perfect Funnel Journey! +15 XP', 'toast-xp');
      }
    } else {
      // Incorrect Match
      SoundFX.incorrect();
      slot.classList.add('shake');
      setTimeout(() => slot.classList.remove('shake'), 500);
      showToast(`Not quite! Remember where ${metric} fits in the funnel.`, 'toast-combo');
    }
  }
}

// ============================================================
// 8. FINAL GAMIFIED PERFORMANCE REPORT
// ============================================================
async function finalizeAndShowReport() {
  navigateTo('screen-report');
  SoundFX.celebrate();

  const totalQuestions = QUESTIONS.length; // 11
  let score = 0;
  const strongAreas = [];
  const weakAreas = [];

  QUESTIONS.forEach(q => {
    const ans = AppState.answers[q.id];
    if (ans && ans.isCorrect) {
      score++;
      strongAreas.push(q.topic);
    } else {
      weakAreas.push(q.topic);
    }
  });

  const percentage = Math.round((score / totalQuestions) * 100);

  // Animate Circular Progress Ring
  const ringBar = document.getElementById('score-ring-bar');
  const scoreNumDisplay = document.getElementById('score-num-display');
  const scorePctDisplay = document.getElementById('score-percentage-text');
  const scoreVerdict = document.getElementById('score-verdict');
  const greeting = document.getElementById('report-personalized-greeting');

  if (greeting && AppState.studentName) {
    greeting.textContent = `Great effort, ${AppState.studentName}! Here is your diagnostic performance report:`;
  }

  if (scoreNumDisplay) scoreNumDisplay.textContent = score;
  if (scorePctDisplay) scorePctDisplay.textContent = `${percentage}%`;

  if (ringBar) {
    const circumference = 2 * Math.PI * 58; // ~364.4
    const offset = circumference - (circumference * percentage) / 100;
    setTimeout(() => {
      ringBar.style.strokeDashoffset = offset;
    }, 200);
  }

  // Verdict text
  if (scoreVerdict) {
    if (percentage >= 90) {
      scoreVerdict.textContent = '🌟 Outstanding Mastery!';
      scoreVerdict.style.color = '#065F46';
    } else if (percentage >= 70) {
      scoreVerdict.textContent = '👍 Solid Proficiency!';
      scoreVerdict.style.color = '#1E40AF';
    } else {
      scoreVerdict.textContent = '📚 Good Foundation — Revisit Weak Spots';
      scoreVerdict.style.color = '#B45309';
    }
  }

  // 3 Duolingo Style Stat Cards
  const finalXp = document.getElementById('final-xp-stat');
  const finalCombo = document.getElementById('final-combo-stat');
  const finalAccuracy = document.getElementById('final-accuracy-stat');

  if (finalXp) finalXp.textContent = AppState.xp;
  if (finalCombo) finalCombo.textContent = `${AppState.bestCombo} In a Row`;
  if (finalAccuracy) finalAccuracy.textContent = `${percentage}%`;

  // Achievement Badges
  const badgesRack = document.getElementById('badges-rack');
  if (badgesRack) {
    badgesRack.innerHTML = '';
    const earnedBadges = [];

    if (percentage >= 90) earnedBadges.push({ icon: '🏆', title: 'Meta Metrics Master' });
    if (percentage >= 70) earnedBadges.push({ icon: '⭐', title: 'Ad Strategist' });
    if (AppState.bestCombo >= 4) earnedBadges.push({ icon: '🔥', title: 'Streak Champ' });
    if (AppState.journeyCompleted) earnedBadges.push({ icon: '🧩', title: 'Funnel Architect' });
    earnedBadges.push({ icon: '🎓', title: 'Active Learner' });

    earnedBadges.forEach(b => {
      const el = document.createElement('div');
      el.className = 'badge-item';
      el.innerHTML = `<span>${b.icon}</span> <span>${b.title}</span>`;
      badgesRack.appendChild(el);
    });
  }

  // Populate Strong and Weak lists
  const strongList = document.getElementById('strong-topics-list');
  const weakList = document.getElementById('weak-topics-list');

  if (strongList) {
    strongList.innerHTML = strongAreas.length
      ? strongAreas.map(t => `<li>${t}</li>`).join('')
      : '<li>No concepts mastered yet — retake to improve!</li>';
  }

  if (weakList) {
    weakList.innerHTML = weakAreas.length
      ? weakAreas.map(t => `<li>${t}</li>`).join('')
      : '<li>🎉 Flawless! No weak areas detected.</li>';
  }

  // Persist Final Result to Supabase
  if (AppState.studentId) {
    try {
      await API.saveQuizResults(
        AppState.studentId,
        AppState.studentName || 'Student',
        score,
        totalQuestions,
        percentage,
        AppState.xp,
        AppState.bestCombo,
        strongAreas,
        weakAreas
      );
    } catch (e) {
      console.warn('Silent saveQuizResults fail', e);
    }
  }

  // Load and render Student Leaderboard
  await renderLeaderboard();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, function(m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
  });
}

// Render dynamic Leaderboard with descending XP and highest global streak
async function renderLeaderboard() {
  const container = document.getElementById('leaderboard-table-body');
  const globalStreakVal = document.getElementById('global-highest-streak');
  const globalStreakHolder = document.getElementById('global-streak-holder');
  if (!container) return;

  container.innerHTML = `
    <div class="leaderboard-loading-state">
      <span class="loading-spinner"></span>
      <span>Loading latest student rankings...</span>
    </div>
  `;

  try {
    const data = await API.getLeaderboard();
    const list = data.leaderboard || [];
    const highest = data.highest_streak || { streak: 0, holder: 'None yet' };

    // Update Global Highest Streak Banner
    if (globalStreakVal) {
      globalStreakVal.textContent = highest.streak > 0 ? `${highest.streak} in a row` : '0 in a row';
    }
    if (globalStreakHolder) {
      globalStreakHolder.textContent = highest.streak > 0 ? `held by ${escapeHtml(highest.holder)}` : 'No streak recorded yet';
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div class="leaderboard-empty-state">
          <span>🏆</span>
          <p>You are the first to complete the quiz! Complete another attempt to set records.</p>
        </div>
      `;
      return;
    }

    let rowsHtml = '';
    list.forEach((entry, index) => {
      const rank = index + 1;
      let rankBadge = `<span class="rank-number">#${rank}</span>`;
      let rankClass = '';
      if (rank === 1) {
        rankBadge = `<span class="medal medal-gold" title="Rank 1 - Gold">🥇</span>`;
        rankClass = 'rank-gold';
      } else if (rank === 2) {
        rankBadge = `<span class="medal medal-silver" title="Rank 2 - Silver">🥈</span>`;
        rankClass = 'rank-silver';
      } else if (rank === 3) {
        rankBadge = `<span class="medal medal-bronze" title="Rank 3 - Bronze">🥉</span>`;
        rankClass = 'rank-bronze';
      }

      const isCurrentStudent = AppState.studentId && entry.student_id === AppState.studentId;
      const initial = (entry.student_name || 'S').charAt(0).toUpperCase();

      rowsHtml += `
        <div class="leaderboard-row ${rankClass} ${isCurrentStudent ? 'is-current-user' : ''}">
          <div class="td-cell td-rank">${rankBadge}</div>
          <div class="td-cell td-student">
            <div class="student-avatar-micro">${initial}</div>
            <div class="student-name-box">
              <span class="student-name-text">${escapeHtml(entry.student_name)}</span>
              ${isCurrentStudent ? '<span class="you-pill">YOU</span>' : ''}
            </div>
          </div>
          <div class="td-cell td-xp">
            <span class="xp-val-text">⚡ ${entry.total_xp}</span>
            <span class="xp-unit-text">XP</span>
          </div>
          <div class="td-cell td-streak">
            <span class="streak-val-text">🔥 ${entry.best_streak}</span>
            <span class="streak-sub-text">in a row</span>
          </div>
          <div class="td-cell td-accuracy">
            <span class="accuracy-badge">${entry.percentage || 0}%</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = rowsHtml;
  } catch (err) {
    console.error('Leaderboard render error:', err);
    container.innerHTML = `
      <div class="leaderboard-empty-state">
        <p>Could not load leaderboard. Please check your connection.</p>
      </div>
    `;
  }
}

// ============================================================
// 9. NON-DESTRUCTIVE REVIEW WEAK AREAS MODAL
// ============================================================
function setupReviewModal() {
  const reviewModal = document.getElementById('review-modal');
  const openBtn = document.getElementById('btn-review-weak-areas');
  const closeBtn = document.getElementById('btn-close-review');
  const finishBtn = document.getElementById('btn-finish-review');
  const container = document.getElementById('review-cards-container');

  if (!reviewModal || !openBtn || !container) return;

  openBtn.addEventListener('click', () => {
    container.innerHTML = '';
    const weakQuestions = QUESTIONS.filter(q => {
      const a = AppState.answers[q.id];
      return !a || !a.isCorrect;
    });

    if (weakQuestions.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <h3>🎉 Perfect Score!</h3>
          <p style="color: var(--text-muted); margin-top: 0.5rem;">
            You got every single question right! You have no weak areas to review.
          </p>
        </div>
      `;
    } else {
      weakQuestions.forEach(q => {
        const studentAns = AppState.answers[q.id];
        const card = document.createElement('div');
        card.className = 'review-item-card';
        card.innerHTML = `
          <span class="review-topic-tag">${q.topic}</span>
          <p class="review-q-text">${q.question}</p>
          <div class="review-answers-grid">
            <div class="review-opt was-wrong">
              <strong>Your Answer:</strong> ${studentAns ? q.options[studentAns.selected] : 'Skipped / Unanswered'}
            </div>
            <div class="review-opt is-correct-ans">
              <strong>Correct Concept:</strong> ${q.options[q.correct]}
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    }

    reviewModal.classList.remove('hidden');
  });

  const closeModal = () => reviewModal.classList.add('hidden');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (finishBtn) finishBtn.addEventListener('click', closeModal);
}

// ============================================================
// 10. AUTHENTICATION & LOGIN GATE
// ============================================================
function setupAuthSystem() {
  const authModal = document.getElementById('auth-modal');
  const authForm = document.getElementById('auth-form');
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const authHeading = document.getElementById('auth-heading');
  const btnAuthSubmit = document.getElementById('btn-auth-submit');
  const errorBanner = document.getElementById('auth-error-banner');
  const cancelBtn = document.getElementById('btn-cancel-auth');

  // Cover & HUD Buttons
  const btnCoverLogin = document.getElementById('btn-cover-login');
  const btnCoverLogout = document.getElementById('btn-cover-logout');
  const btnHudLogout = document.getElementById('btn-hud-logout');

  let mode = 'login'; // 'login' or 'signup'

  function setMode(newMode) {
    mode = newMode;
    errorBanner.classList.add('hidden');
    if (mode === 'login') {
      tabLogin.classList.add('active');
      tabSignup.classList.remove('active');
      authHeading.textContent = 'Sign In to Continue';
      btnAuthSubmit.innerHTML = '<span>Sign In</span> →';
    } else {
      tabSignup.classList.add('active');
      tabLogin.classList.remove('active');
      authHeading.textContent = 'Create Student Account';
      btnAuthSubmit.innerHTML = '<span>Register & Start</span> →';
    }
  }

  if (tabLogin) tabLogin.addEventListener('click', () => setMode('login'));
  if (tabSignup) tabSignup.addEventListener('click', () => setMode('signup'));
  if (cancelBtn) cancelBtn.addEventListener('click', () => authModal.classList.add('hidden'));

  // Open modal from Cover Screen
  if (btnCoverLogin) {
    btnCoverLogin.addEventListener('click', () => {
      setMode('login');
      authModal.classList.remove('hidden');
    });
  }

  // Logout Handlers
  if (btnCoverLogout) btnCoverLogout.addEventListener('click', handleLogout);
  if (btnHudLogout) btnHudLogout.addEventListener('click', handleLogout);

  // Intercept Take Quiz
  const takeQuizBtn = document.getElementById('btn-take-quiz');
  if (takeQuizBtn) {
    takeQuizBtn.addEventListener('click', () => {
      if (!AppState.isAuthenticated) {
        setMode('signup');
        authModal.classList.remove('hidden');
      } else {
        navigateTo('screen-q1');
      }
    });
  }

  // Handle Form Submit
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorBanner.classList.add('hidden');
      const nameInput = document.getElementById('input-student-name');
      const passInput = document.getElementById('input-password');

      const name = nameInput.value.trim();
      const pass = passInput.value.trim();

      if (!name) {
        errorBanner.textContent = 'Please enter your Student Name.';
        errorBanner.classList.remove('hidden');
        return;
      }

      if (pass.length < 6) {
        errorBanner.textContent = 'Password must be at least 6 characters.';
        errorBanner.classList.remove('hidden');
        return;
      }

      btnAuthSubmit.disabled = true;
      btnAuthSubmit.textContent = 'Authenticating...';

      try {
        let result;
        if (mode === 'signup') {
          result = await API.signup(name, pass);
        } else {
          result = await API.login(name, pass);
        }

        AppState.studentId = result.student_id;
        AppState.studentName = result.student_name;
        AppState.isAuthenticated = true;

        localStorage.setItem('learnwise_student_id', result.student_id);
        localStorage.setItem('learnwise_student_name', result.student_name);

        AppState.updateUserProfileHUD();
        authModal.classList.add('hidden');
        showToast(`Welcome, ${result.student_name}! 👋`, 'toast-xp');

        // Proceed to first question
        navigateTo('screen-q1');
      } catch (err) {
        errorBanner.textContent = err.message || 'Authentication error.';
        errorBanner.classList.remove('hidden');
        if (err.message && err.message.toLowerCase().includes('already registered')) {
          // Offer quick switch to Sign In
          setTimeout(() => setMode('login'), 2000);
        }
      } finally {
        btnAuthSubmit.disabled = false;
        btnAuthSubmit.innerHTML = mode === 'login' ? '<span>Sign In</span> →' : '<span>Register & Start</span> →';
      }
    });
  }

  // Initial UI sync
  updateCoverAuthUI();
}

// ============================================================
// 11. RETAKE QUIZ & RESET STATE
// ============================================================
function setupRetakeButton() {
  const retakeBtn = document.getElementById('btn-retake-quiz');
  if (!retakeBtn) return;

  retakeBtn.addEventListener('click', () => {
    // Reset state for new attempt
    AppState.answers = {};
    AppState.selectedOption = null;
    AppState.combo = 0;
    AppState.bestCombo = 0;
    AppState.journeyPlacements = {};
    AppState.journeyCompleted = false;
    AppState.attemptId = crypto.randomUUID ? crypto.randomUUID() : 'att_' + Date.now();

    // Reset all UI question states
    QUESTIONS.forEach(q => {
      const qScreen = document.getElementById(q.screenId);
      if (!qScreen) return;
      const optButtons = qScreen.querySelectorAll('.option-btn');
      optButtons.forEach(b => {
        b.className = 'option-btn';
      });
      const submitBtn = qScreen.querySelector('.btn-submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submit Answer →';
      }
      const feedbackBox = qScreen.querySelector('.feedback-box');
      if (feedbackBox) {
        feedbackBox.className = 'feedback-box hidden';
      }
    });

    // Reset User Journey Puzzle
    const slots = document.querySelectorAll('.journey-slot');
    slots.forEach(s => {
      s.className = 'journey-slot';
      const dropzone = s.querySelector('.slot-dropzone');
      const pos = s.getAttribute('data-slot-num');
      if (dropzone) dropzone.innerHTML = `<span class="dropzone-placeholder">Drop #${pos} Metric</span>`;
    });

    const chips = document.querySelectorAll('.journey-chip');
    chips.forEach(c => {
      c.className = 'journey-chip';
    });

    const nextJourneyBtn = document.getElementById('btn-next-journey');
    if (nextJourneyBtn) nextJourneyBtn.disabled = true;

    // Reset ring bar
    const ringBar = document.getElementById('score-ring-bar');
    if (ringBar) ringBar.style.strokeDashoffset = 364.4;

    // Reset HUD streak pill
    const comboPill = document.getElementById('hud-combo-pill');
    const comboVal = document.getElementById('hud-combo-val');
    if (comboVal) comboVal.textContent = '0';
    if (comboPill) comboPill.classList.remove('active-streak', 'streak-broken', 'pop');

    navigateTo('screen-q1');
  });
}

// ============================================================
// 12. INITIALIZATION ON DOM LOAD
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  AppState.init();

  // Audio Toggle Button
  const audioBtn = document.getElementById('btn-audio-toggle');
  const audioIcon = document.getElementById('audio-icon');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      SoundFX.enabled = !SoundFX.enabled;
      audioIcon.textContent = SoundFX.enabled ? '🔊' : '🔇';
      localStorage.setItem('learnwise_audio', SoundFX.enabled ? 'enabled' : 'disabled');
      if (SoundFX.enabled) SoundFX.correct();
    });
  }

  // Universal Back Button
  const backBtn = document.getElementById('btn-back');
  if (backBtn) {
    backBtn.addEventListener('click', goBack);
  }

  // Cover Screen Learn Mode CTA
  const learnModeBtn = document.getElementById('btn-learn-mode');
  if (learnModeBtn) {
    learnModeBtn.addEventListener('click', () => {
      navigateTo('screen-intro');
    });
  }

  // Setup Systems
  setupAuthSystem();
  setupQuestionScreens();
  setupExplanationPractice();
  setupUserJourneyPuzzle();
  setupReviewModal();
  setupRetakeButton();

  console.log('LearnWise × Kraftshala application initialized successfully.');
});

