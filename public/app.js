/**
 * LearnWise × Kraftshala — Main Application Engine
 * Handles State Machine, Gamification (XP, Combos, Badges), 
 * Question Catalog, User Journey Puzzle, Sound FX & Supabase Auth/Progress Sync.
 */

// ============================================================
// 1. CONFIGURATION & SEQUENTIAL LEVEL CURRICULUM
// ============================================================

/**
 * Single configurable rule to determine whether a level is cleared.
 * Options:
 *  - "complete_all": user must answer every question in that level.
 *  - A number (e.g. 70): user must achieve at least that percentage score.
 */
const UNLOCK_RULE = "complete_all";

const LEVELS = [
  {
    id: 1,
    title: "Basic Metrics & Concepts",
    subtitle: "Core advertising definitions and marketing funnel puzzle",
    questions: [
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
        nextScreenId: 'screen-journey' // Leads directly into User Journey puzzle
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
        nextScreenId: 'screen-level-1-complete'
      }
    ]
  },
  {
    id: 2,
    title: "Numericals",
    subtitle: "10 practical marketing math problems",
    questions: [
      {
        id: 'L2_Q1',
        topic: 'CTR Calculation',
        question: 'A Meta Ads campaign generated 500 clicks from 10,000 impressions. What is the CTR?',
        options: { A: '2%', B: '5%', C: '10%', D: '20%' },
        correct: 'B',
        screenId: 'screen-l2-q1',
        expId: 'screen-l2-exp1',
        nextScreenId: 'screen-l2-q2'
      },
      {
        id: 'L2_Q2',
        topic: 'CVR Calculation',
        question: 'A campaign received 2,000 clicks and generated 100 conversions. What is the Conversion Rate?',
        options: { A: '2%', B: '5%', C: '10%', D: '20%' },
        correct: 'B',
        screenId: 'screen-l2-q2',
        expId: 'screen-l2-exp2',
        nextScreenId: 'screen-l2-q3'
      },
      {
        id: 'L2_Q3',
        topic: 'CPM Calculation',
        question: 'A campaign spent ₹2,000 and generated 50,000 impressions. What is the CPM?',
        options: { A: '₹20', B: '₹40', C: '₹50', D: '₹100' },
        correct: 'B',
        screenId: 'screen-l2-q3',
        expId: 'screen-l2-exp3',
        nextScreenId: 'screen-l2-q4'
      },
      {
        id: 'L2_Q4',
        topic: 'CPC Calculation',
        question: 'A campaign spent ₹5,000 and generated 1,000 clicks. What is the CPC?',
        options: { A: '₹2', B: '₹5', C: '₹10', D: '₹50' },
        correct: 'B',
        screenId: 'screen-l2-q4',
        expId: 'screen-l2-exp4',
        nextScreenId: 'screen-l2-q5'
      },
      {
        id: 'L2_Q5',
        topic: 'CPA Calculation',
        question: 'A campaign spent ₹6,000 and generated 120 conversions. What is the CPA?',
        options: { A: '₹20', B: '₹40', C: '₹50', D: '₹60' },
        correct: 'C',
        screenId: 'screen-l2-q5',
        expId: 'screen-l2-exp5',
        nextScreenId: 'screen-l2-q6'
      },
      {
        id: 'L2_Q6',
        topic: 'Frequency Calculation',
        question: 'A Meta Ads campaign generated 30,000 impressions and reached 10,000 unique people. What is the average frequency?',
        options: { A: '2', B: '3', C: '4', D: '5' },
        correct: 'B',
        screenId: 'screen-l2-q6',
        expId: 'screen-l2-exp6',
        nextScreenId: 'screen-l2-q7'
      },
      {
        id: 'L2_Q7',
        topic: 'Reach Calculation',
        question: 'A Meta Ads campaign generated 40,000 impressions at an average frequency of 4. How many unique people did the campaign reach?',
        options: { A: '8,000', B: '10,000', C: '12,000', D: '16,000' },
        correct: 'B',
        screenId: 'screen-l2-q7',
        expId: 'screen-l2-exp7',
        nextScreenId: 'screen-l2-q8'
      },
      {
        id: 'L2_Q8',
        topic: 'Impressions from Reach & Frequency',
        question: 'A campaign reached 15,000 unique people with an average frequency of 3. What were the total impressions?',
        options: { A: '30,000', B: '35,000', C: '45,000', D: '50,000' },
        correct: 'C',
        screenId: 'screen-l2-q8',
        expId: 'screen-l2-exp8',
        nextScreenId: 'screen-l2-q9'
      },
      {
        id: 'L2_Q9',
        topic: 'Spend from CPM',
        question: 'A campaign generated 80,000 impressions at a CPM of ₹50. What was the total ad spend?',
        options: { A: '₹2,000', B: '₹3,000', C: '₹4,000', D: '₹5,000' },
        correct: 'C',
        screenId: 'screen-l2-q9',
        expId: 'screen-l2-exp9',
        nextScreenId: 'screen-l2-q10'
      },
      {
        id: 'L2_Q10',
        topic: 'Conversions from CVR',
        question: 'A campaign received 2,500 clicks and recorded a Conversion Rate (CVR) of 4%. How many conversions did the campaign generate?',
        options: { A: '50', B: '75', C: '100', D: '125' },
        correct: 'C',
        screenId: 'screen-l2-q10',
        expId: 'screen-l2-exp10',
        nextScreenId: 'screen-level-2-complete'
      }
    ]
  },
  {
    id: 3,
    title: "Advanced Numericals",
    subtitle: "Multi-step advertising math, budget allocation & reverse diagnostics",
    parts: [
      { id: 'part-a', title: 'Part A (Set 1)', questionCount: 7 },
      { id: 'part-b', title: 'Part B (Set 2)', questionCount: 7 }
    ],
    questions: [
      // ==========================================
      // PART A (SET 1) – 7 QUESTIONS
      // ==========================================
      {
        id: 'L3_A_Q1',
        part: 'A',
        topic: 'Impressions from Spend & CPM',
        question: 'You spent ₹15,000. Your CPM is ₹300. How many impressions did you get?',
        options: { A: '50', B: '5,000', C: '50,000', D: '4,500,000' },
        correct: 'C',
        screenId: 'screen-l3-a-q1',
        expId: 'screen-l3-a-exp1',
        nextScreenId: 'screen-l3-a-q2'
      },
      {
        id: 'L3_A_Q2',
        part: 'A',
        topic: 'CPA from CPC & Conversion Rate',
        question: 'CPC is ₹50, conversion rate is 8%. What is your CPA?',
        options: { A: '₹625', B: '₹4', C: '₹400', D: '₹6.25' },
        correct: 'A',
        screenId: 'screen-l3-a-q2',
        expId: 'screen-l3-a-exp2',
        nextScreenId: 'screen-l3-a-q3'
      },
      {
        id: 'L3_A_Q3',
        part: 'A',
        topic: 'CPA with Distractor Metric (CTR)',
        question: 'If CPC is ₹60, CTR is 0.5%, and conversion rate is 20%, what is your CPA?',
        options: { A: '₹12', B: '₹600', C: '₹60,000', D: '₹300' },
        correct: 'D',
        screenId: 'screen-l3-a-q3',
        expId: 'screen-l3-a-exp3',
        nextScreenId: 'screen-l3-a-q4'
      },
      {
        id: 'L3_A_Q4',
        part: 'A',
        topic: 'CPA with Distractor Metric (CTR)',
        question: 'Your CTR is 1.5%, CPC is ₹80, and conversion rate is 10%. What is your CPA?',
        options: { A: '₹8', B: '₹800', C: '₹120', D: '₹53,333' },
        correct: 'B',
        screenId: 'screen-l3-a-q4',
        expId: 'screen-l3-a-exp4',
        nextScreenId: 'screen-l3-a-q5'
      },
      {
        id: 'L3_A_Q5',
        part: 'A',
        topic: 'Conversions from Spend, CPC & CVR',
        question: 'You spend ₹20,000. Your CPC is ₹100, and conversion rate is 10%. How many conversions did you get?',
        options: { A: '200', B: '2', C: '20', D: '2,000' },
        correct: 'C',
        screenId: 'screen-l3-a-q5',
        expId: 'screen-l3-a-exp5',
        nextScreenId: 'screen-l3-a-q6'
      },
      {
        id: 'L3_A_Q6',
        part: 'A',
        topic: 'Conversions from Spend, CPC & CVR',
        question: 'You spent ₹12,000. CPC is ₹60. Conversion rate is 5%. How many conversions did you get?',
        options: { A: '10', B: '200', C: '100', D: '40' },
        correct: 'A',
        screenId: 'screen-l3-a-q6',
        expId: 'screen-l3-a-exp6',
        nextScreenId: 'screen-l3-a-q7'
      },
      {
        id: 'L3_A_Q7',
        part: 'A',
        topic: 'Max Bid CPC from Target CPA & CVR',
        question: 'The max money your company wants to spend on each conversion is Rs 3000. The past Click to conversion rate has been around 9%. What is the maximum money that you can spend on a click?',
        options: { A: '₹27', B: '₹33,333', C: '₹2,730', D: '₹270' },
        correct: 'D',
        screenId: 'screen-l3-a-q7',
        expId: 'screen-l3-a-exp7',
        nextScreenId: 'screen-level-3-part-a-complete'
      },

      // ==========================================
      // PART B (SET 2) – 7 QUESTIONS (UNLOCKS AFTER PART A)
      // ==========================================
      {
        id: 'L3_B_Q1',
        part: 'B',
        topic: 'Clicks from Conversions & CVR',
        question: 'You got 100 conversions at a CPA of ₹400. Your conversion rate was 10%. How many clicks did you get?',
        options: { A: '10', B: '1,000', C: '4,000', D: '40,000' },
        correct: 'B',
        screenId: 'screen-l3-b-q1',
        expId: 'screen-l3-b-exp1',
        nextScreenId: 'screen-l3-b-q2'
      },
      {
        id: 'L3_B_Q2',
        part: 'B',
        topic: 'Clicks from Spend, CPM & CTR',
        question: 'You spent ₹10,000. CPM is ₹250 and CTR is 2%. How many clicks did you get?',
        options: { A: '40', B: '40,000', C: '800', D: '8,000' },
        correct: 'C',
        screenId: 'screen-l3-b-q2',
        expId: 'screen-l3-b-exp2',
        nextScreenId: 'screen-l3-b-q3'
      },
      {
        id: 'L3_B_Q3',
        part: 'B',
        topic: 'CPA from CPM, CTR & CVR',
        question: 'If CPM is ₹200, CTR is 2%, and conversion rate is 5%, what is your CPA?',
        options: { A: '₹200', B: '₹10', C: '₹0.20', D: '₹2,000' },
        correct: 'A',
        screenId: 'screen-l3-b-q3',
        expId: 'screen-l3-b-exp3',
        nextScreenId: 'screen-l3-b-q4'
      },
      {
        id: 'L3_B_Q4',
        part: 'B',
        topic: 'CPA from CPM, CTR & CVR',
        question: 'CPM is ₹600, CTR is 1.5%, and conversion rate is 5%. What is the CPA?',
        options: { A: '₹40', B: '₹2', C: '₹8,000', D: '₹800' },
        correct: 'D',
        screenId: 'screen-l3-b-q4',
        expId: 'screen-l3-b-exp4',
        nextScreenId: 'screen-l3-b-q5'
      },
      {
        id: 'L3_B_Q5',
        part: 'B',
        topic: 'CPA from CPM, CTR & CVR',
        question: 'CPM is ₹500, CTR is 4%, and conversion rate is 2%. What is the CPA?',
        options: { A: '₹12.50', B: '₹625', C: '₹0.25', D: '₹6,250' },
        correct: 'B',
        screenId: 'screen-l3-b-q5',
        expId: 'screen-l3-b-exp5',
        nextScreenId: 'screen-l3-b-q6'
      },
      {
        id: 'L3_B_Q6',
        part: 'B',
        topic: 'Reverse CPM from CPA, CVR & CTR',
        question: 'CPA is ₹500, conversion rate is 4%, and CTR is 2%. What is the CPM?',
        options: { A: '₹20', B: '₹1,000', C: '₹400', D: '₹0.40' },
        correct: 'C',
        screenId: 'screen-l3-b-q6',
        expId: 'screen-l3-b-exp6',
        nextScreenId: 'screen-l3-b-q7'
      },
      {
        id: 'L3_B_Q7',
        part: 'B',
        topic: 'Reverse CPM from CPA, CVR & CTR',
        question: 'Your CPA is ₹500, and conversion rate is 5%. CTR is 2%. What is your CPM?',
        options: { A: '₹25', B: '₹1,250', C: '₹0.50', D: '₹500' },
        correct: 'D',
        screenId: 'screen-l3-b-q7',
        expId: 'screen-l3-b-exp7',
        nextScreenId: 'screen-level-3-complete'
      }
    ]
  },
  {
    id: 4,
    title: "Campaign Analysis & Comparison",
    subtitle: "Real-world campaign scenarios and diagnostic problem-solving",
    questions: [] // Locked until Level 3 is cleared
  }
];

// Helper: All questions flat array
function getAllQuestions() {
  return LEVELS.flatMap(l => l.questions);
}

// Helper: Find question by screenId across any level
function getQuestionByScreenId(screenId) {
  return getAllQuestions().find(q => q.screenId === screenId);
}

// Helper: Find level containing a specific screenId
function getLevelForScreen(screenId) {
  if (screenId === 'screen-level-1-complete') return 1;
  if (screenId === 'screen-level-2-complete') return 2;
  if (screenId === 'screen-level-3-part-a-complete' || screenId === 'screen-level-3-complete') return 3;
  if (screenId === 'screen-level-in-progress') return AppState.currentLevel || 4;
  if (screenId.startsWith('screen-l2-')) return 2;
  if (screenId.startsWith('screen-l3-')) return 3;
  if (screenId.startsWith('screen-l4-')) return 4;
  if (screenId.startsWith('screen-q') || screenId.startsWith('screen-exp') || screenId === 'screen-journey') return 1;
  return null;
}

// Helper: Get or dynamically calculate score for a given level or sub-part ('3_A', '3_B', 1, 2, 3)
function getLevelScore(levelId) {
  if (AppState.levelScores[levelId]) {
    return AppState.levelScores[levelId];
  }
  let questions = [];
  if (levelId === '3_A') {
    const l3 = LEVELS.find(l => l.id === 3);
    if (l3) questions = l3.questions.filter(q => q.part === 'A');
  } else if (levelId === '3_B') {
    const l3 = LEVELS.find(l => l.id === 3);
    if (l3) questions = l3.questions.filter(q => q.part === 'B');
  } else {
    const lvl = LEVELS.find(l => l.id === levelId);
    if (lvl) questions = lvl.questions;
  }

  if (!questions || questions.length === 0) return null;

  const answered = questions.filter(q => Boolean(AppState.answers[q.id]));
  if (answered.length === 0) return null;

  const correct = answered.filter(q => AppState.answers[q.id]?.isCorrect).length;
  const pct = Math.round((correct / questions.length) * 100);

  const res = { score: correct, total: questions.length, percentage: pct, isComplete: answered.length === questions.length };
  if (answered.length === questions.length) {
    AppState.levelScores[levelId] = res;
  }
  return res;
}

// Helper: Check if Level 3 Part A is completed (all 7 questions answered)
function isLevel3PartACleared() {
  const l3 = LEVELS.find(l => l.id === 3);
  if (!l3) return false;
  const partA = l3.questions.filter(q => q.part === 'A');
  return partA.every(q => Boolean(AppState.answers[q.id]));
}

// Check if Level 3 Part B is unlocked:
// Unlocked if Level 3 is unlocked AND (Part A score >= 75% OR Part A cleared)
function isLevel3PartBUnlocked() {
  if (!isLevelUnlocked(3)) return false;
  const partAScore = getLevelScore('3_A');
  if (partAScore && partAScore.percentage >= 75) return true;
  return isLevel3PartACleared();
}

// Check if a level is cleared based on the configurable UNLOCK_RULE
function isLevelCleared(levelId) {
  if (AppState.clearedLevels.includes(levelId)) return true;
  const lvl = LEVELS.find(l => l.id === levelId);
  if (!lvl || lvl.questions.length === 0) return false;

  const answered = lvl.questions.filter(q => Boolean(AppState.answers[q.id])).length;
  if (UNLOCK_RULE === "complete_all") {
    return answered === lvl.questions.length;
  } else if (typeof UNLOCK_RULE === 'number') {
    const correct = lvl.questions.filter(q => AppState.answers[q.id]?.isCorrect).length;
    const pct = Math.round((correct / lvl.questions.length) * 100);
    return answered === lvl.questions.length && pct >= UNLOCK_RULE;
  }
  return answered === lvl.questions.length;
}

// Check if a level is unlocked:
// A person who has attempted any level once whenever and scored more than 75%
// should have the option to directly open next level via the dashboard without having to attempt the previous level.
function isLevelUnlocked(levelId) {
  if (levelId === 1) return true;

  const prevLevelId = levelId - 1;
  const prevScoreObj = getLevelScore(prevLevelId);
  if (prevScoreObj && prevScoreObj.percentage >= 75) {
    return true;
  }
  if (AppState.clearedLevels.includes(prevLevelId)) {
    return true;
  }

  // Check if all previous levels were cleared or passed >=75%
  for (let prev = 1; prev < levelId; prev++) {
    const scoreObj = getLevelScore(prev);
    const passed = (scoreObj && scoreObj.percentage >= 75) || AppState.clearedLevels.includes(prev);
    if (!passed) {
      return false;
    }
  }
  return true;
}

// Alias for backwards-compatibility
const QUESTIONS = LEVELS[0].questions;

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
  clearedLevels: [],       // Array of cleared level numbers e.g. [1, 2]
  currentLevel: 1,         // Active level: 1, 2, 3, or 4
  levelScores: {},         // { 1: { score: 11, total: 11, percentage: 100 }, 2: { ... } }
  savedResumeScreen: null, // Last active question screen to resume on
  answers: {},             // { Q1: { selected: 'A', isCorrect: true, xp: 10 }, ... }
  selectedOption: null,    // Temporary selection for active question
  xp: 0,
  combo: 0,
  bestCombo: 0,
  journeyPlacements: {},   // { 1: 'Impressions', 2: 'Reach', ... }
  journeyCompleted: false,
  selectedJourneyChip: null, // Mobile tap-to-place fallback

  init() {
    // 1. Restore auth session
    const savedId = localStorage.getItem('learnwise_student_id');
    const savedName = localStorage.getItem('learnwise_student_name');
    if (savedId && savedName) {
      this.studentId = savedId;
      this.studentName = savedName;
      this.isAuthenticated = true;
      this.updateUserProfileHUD();
    }

    // 2. Restore cached level progress
    try {
      const savedCleared = localStorage.getItem('learnwise_cleared_levels');
      if (savedCleared) this.clearedLevels = JSON.parse(savedCleared);
      const savedLvl = localStorage.getItem('learnwise_current_level');
      if (savedLvl) this.currentLevel = parseInt(savedLvl, 10) || 1;
      const savedScreen = localStorage.getItem('learnwise_current_screen');
      if (savedScreen && savedScreen !== 'screen-cover' && savedScreen !== 'screen-intro') {
        this.savedResumeScreen = savedScreen;
      }
      const savedScores = localStorage.getItem('learnwise_level_scores');
      if (savedScores) this.levelScores = JSON.parse(savedScores);
      const savedAnswers = localStorage.getItem('learnwise_answers');
      if (savedAnswers) this.answers = JSON.parse(savedAnswers);
      const savedXp = localStorage.getItem('learnwise_xp');
      if (savedXp) this.xp = parseInt(savedXp, 10) || 0;
      const savedCombo = localStorage.getItem('learnwise_best_combo');
      if (savedCombo) this.bestCombo = parseInt(savedCombo, 10) || 0;
    } catch (e) {
      console.warn('Error reading cached progress from localStorage:', e);
    }

    // 3. Audio pref
    const audioPref = localStorage.getItem('learnwise_audio');
    if (audioPref === 'disabled') {
      SoundFX.enabled = false;
      const icon = document.getElementById('audio-icon');
      if (icon) icon.textContent = '🔇';
    }

    this.attemptId = crypto.randomUUID ? crypto.randomUUID() : 'att_' + Date.now();

    // 4. Background fetch latest progress from Supabase
    if (this.studentId) {
      this.syncProgressWithServer();
    }
  },

  async syncProgressWithServer() {
    if (!this.studentId || typeof API.getProgress !== 'function') return;
    try {
      const res = await API.getProgress(this.studentId);
      if (res && res.progress) {
        const p = res.progress;
        if (Array.isArray(p.cleared_levels) && p.cleared_levels.length > 0) {
          p.cleared_levels.forEach(lvl => {
            if (!this.clearedLevels.includes(lvl)) this.clearedLevels.push(lvl);
          });
        }
        if (p.current_level) this.currentLevel = p.current_level;
        if (p.current_screen && p.current_screen !== 'screen-cover' && p.current_screen !== 'screen-intro') {
          this.savedResumeScreen = p.current_screen;
        }
        if (p.level_scores) {
          this.levelScores = { ...this.levelScores, ...p.level_scores };
        }
        if (typeof p.total_xp === 'number' && p.total_xp > this.xp) {
          this.xp = p.total_xp;
          const xpVal = document.getElementById('hud-xp-val');
          if (xpVal) xpVal.textContent = this.xp;
        }
        if (typeof p.best_streak === 'number' && p.best_streak > this.bestCombo) {
          this.bestCombo = p.best_streak;
        }
        updateLevelIndicator();
        renderDashboardLevels();
      }
    } catch (err) {
      console.warn('Silent sync with server failed:', err);
    }
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

    // Update HUD auth chip on top right
    const hudChipName = document.getElementById('hud-student-chip-name');
    if (hudChipName) {
      hudChipName.textContent = this.studentName || 'Student';
    }

    const hudProfile = document.getElementById('hud-user-profile');
    if (hudProfile) {
      if (this.isAuthenticated) {
        hudProfile.classList.remove('hidden');
      } else {
        hudProfile.classList.add('hidden');
      }
    }
    updateCoverAuthUI();
  }
};

// Persist progress to localStorage & Supabase
function saveCurrentProgress() {
  const payload = {
    cleared_levels: AppState.clearedLevels,
    current_level: AppState.currentLevel,
    current_screen: AppState.currentScreen,
    level_scores: AppState.levelScores,
    total_xp: AppState.xp,
    best_streak: AppState.bestCombo
  };

  try {
    localStorage.setItem('learnwise_cleared_levels', JSON.stringify(AppState.clearedLevels));
    localStorage.setItem('learnwise_current_level', String(AppState.currentLevel));
    localStorage.setItem('learnwise_current_screen', AppState.currentScreen);
    localStorage.setItem('learnwise_level_scores', JSON.stringify(AppState.levelScores));
    localStorage.setItem('learnwise_answers', JSON.stringify(AppState.answers));
    localStorage.setItem('learnwise_xp', String(AppState.xp));
    localStorage.setItem('learnwise_best_combo', String(AppState.bestCombo));
  } catch (e) {}

  if (AppState.studentId && typeof API.saveProgress === 'function') {
    API.saveProgress(AppState.studentId, payload);
  }
}

// Update Cover & Intro Screen Auth Status
function updateCoverAuthUI() {
  const guestSec = document.getElementById('cover-guest-section');
  const userSec = document.getElementById('cover-user-section');
  const studentNameEl = document.getElementById('cover-student-name');
  const introGuestSec = document.getElementById('intro-guest-section');
  const introUserSec = document.getElementById('intro-user-section');
  const introStudentNameEl = document.getElementById('intro-student-name');
  const takeQuizBtn = document.getElementById('btn-take-quiz');

  if (AppState.isAuthenticated && AppState.studentName) {
    if (guestSec) guestSec.classList.add('hidden');
    if (userSec) userSec.classList.remove('hidden');
    if (studentNameEl) studentNameEl.textContent = AppState.studentName;

    if (introGuestSec) introGuestSec.classList.add('hidden');
    if (introUserSec) introUserSec.classList.remove('hidden');
    if (introStudentNameEl) introStudentNameEl.textContent = AppState.studentName;

    if (takeQuizBtn) {
      // Resume logic: if student has existing progress, say Resume or Start
      takeQuizBtn.innerHTML = `<span>Start Quiz as ${AppState.studentName}</span> <span class="btn-arrow">→</span>`;
    }
  } else {
    if (guestSec) guestSec.classList.remove('hidden');
    if (userSec) userSec.classList.add('hidden');

    if (introGuestSec) introGuestSec.classList.remove('hidden');
    if (introUserSec) introUserSec.classList.add('hidden');

    if (takeQuizBtn) takeQuizBtn.innerHTML = `<span>Sign In & Start Quiz</span> <span class="btn-arrow">→</span>`;
  }

  // Render the level select pathway cards on intro dashboard
  renderDashboardLevels();
}

// Render dynamic learning pathway level cards on the Intro dashboard
function renderDashboardLevels() {
  const container = document.getElementById('dashboard-levels-grid');
  if (!container) return;

  const cardsHtml = LEVELS.map(lvl => {
    const isUnlocked = isLevelUnlocked(lvl.id);
    const isCleared = AppState.clearedLevels.includes(lvl.id);
    const scoreObj = getLevelScore(lvl.id);
    const hasAttempted = Boolean(scoreObj);
    const pct = scoreObj ? scoreObj.percentage : 0;
    const isPassed = pct >= 75;

    let cardClass = 'dashboard-level-card';
    if (isCleared || isPassed) cardClass += ' is-cleared';
    else if (isUnlocked) cardClass += ' is-unlocked';
    else cardClass += ' is-locked';

    let statusPill = '';
    if (isCleared || isPassed) {
      statusPill = `<span class="card-status-pill status-passed">Score: ${pct}% · Passed ✓</span>`;
    } else if (hasAttempted) {
      statusPill = `<span class="card-status-pill status-unlocked">Score: ${pct}% · Retake for &gt;75%</span>`;
    } else if (isUnlocked) {
      statusPill = `<span class="card-status-pill status-unlocked">Unlocked 🔓</span>`;
    } else {
      statusPill = `<span class="card-status-pill status-locked">Locked 🔒</span>`;
    }

    let actionsHtml = '';
    if (lvl.id === 1) {
      actionsHtml = `
        <button class="btn-dash-open ${hasAttempted ? 'secondary' : 'primary'}" onclick="startLevelFromDashboard(1)">
          <span>${hasAttempted ? 'Replay Level 1 🔄' : 'Start Level 1 →'}</span>
        </button>
      `;
    } else if (lvl.id === 2) {
      if (isUnlocked) {
        actionsHtml = `
          <button class="btn-dash-open primary" onclick="startLevelFromDashboard(2)">
            <span>Open Level 2 →</span>
          </button>
        `;
      } else {
        actionsHtml = `
          <button class="btn-dash-open" disabled>
            <span>🔒 Locked (Score &gt;75% in Level 1)</span>
          </button>
        `;
      }
    } else if (lvl.id === 3) {
      if (isUnlocked) {
        const isPartBUnlocked = isLevel3PartBUnlocked();
        const partAScore = getLevelScore('3_A');
        actionsHtml = `
          <button class="btn-dash-open ${isPartBUnlocked ? 'secondary' : 'primary'}" onclick="startLevelFromDashboard(3, 'A')">
            <span>Open Part A (Set 1) ${partAScore ? `(${partAScore.percentage}%)` : '→'}</span>
          </button>
          ${isPartBUnlocked
            ? `<button class="btn-dash-open primary" onclick="startLevelFromDashboard(3, 'B')">
                 <span>Open Part B (Set 2) →</span>
               </button>`
            : `<button class="btn-dash-open" disabled>
                 <span>🔒 Part B (Score &gt;75% in Part A)</span>
               </button>`
          }
        `;
      } else {
        actionsHtml = `
          <button class="btn-dash-open" disabled>
            <span>🔒 Locked (Score &gt;75% in Level 2)</span>
          </button>
        `;
      }
    } else if (lvl.id === 4) {
      if (isUnlocked) {
        actionsHtml = `
          <button class="btn-dash-open primary" onclick="handleStartLevel(4)">
            <span>Open Level 4 →</span>
          </button>
        `;
      } else {
        actionsHtml = `
          <button class="btn-dash-open" disabled>
            <span>🔒 Locked (Score &gt;75% in Level 3)</span>
          </button>
        `;
      }
    }

    return `
      <div class="${cardClass}">
        <div class="card-top-row">
          <span class="card-level-badge">Level ${lvl.id}</span>
          ${statusPill}
        </div>
        <div class="card-body">
          <h4>${lvl.title}</h4>
          <p>${lvl.subtitle}</p>
        </div>
        <div class="card-actions">
          ${actionsHtml}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = cardsHtml;
}

// Directly jump into any unlocked level from the dashboard
function startLevelFromDashboard(levelId, part = 'A') {
  if (!AppState.isAuthenticated) {
    const authModal = document.getElementById('auth-modal');
    if (authModal) authModal.classList.remove('hidden');
    showToast('Please sign in or create an account to start.', 'toast-info');
    return;
  }

  if (levelId === 1) {
    navigateTo('screen-q1');
  } else if (levelId === 2) {
    if (!isLevelUnlocked(2)) {
      showToast('🔒 Level 2 is locked! Score >75% in Level 1 first.', 'toast-break');
      return;
    }
    navigateTo('screen-l2-q1');
  } else if (levelId === 3) {
    if (!isLevelUnlocked(3)) {
      showToast('🔒 Level 3 is locked! Score >75% in Level 2 first.', 'toast-break');
      return;
    }
    if (part === 'B') {
      if (!isLevel3PartBUnlocked()) {
        showToast('🔒 Part B (Set 2) unlocks when Part A is completed with >75% score!', 'toast-break');
        return;
      }
      navigateTo('screen-l3-b-q1');
    } else {
      navigateTo('screen-l3-a-q1');
    }
  } else if (levelId === 4) {
    handleStartLevel(4);
  }
}

function handleLogout() {
  QuestionTimer.stop();
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
// 4. NAVIGATION & SCREEN MANAGER (WITH STRICT LEVEL GATING)
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

  // STRICT LEVEL GATING:
  // Check if target screen belongs to a sequential level and if that level is unlocked
  const screenLevel = getLevelForScreen(screenId);
  if (screenLevel !== null) {
    if (!isLevelUnlocked(screenLevel)) {
      showToast(`🔒 Level ${screenLevel} is locked! Clear Level ${screenLevel - 1} first.`, 'toast-break');
      return;
    }

    // STRICT PART B GATING FOR LEVEL 3:
    // Part B (Set 2) unlocks when Part A is completed or scored >= 75%
    if (screenId.startsWith('screen-l3-b-') || screenId === 'screen-level-3-complete') {
      if (!isLevel3PartBUnlocked()) {
        showToast('🔒 Part B (Set 2) unlocks when Part A is completed with >75% score!', 'toast-break');
        return;
      }
    }

    AppState.currentLevel = screenLevel;
  }

  if (AppState.currentScreen === screenId) {
    if (screenId === 'screen-intro') renderDashboardLevels();
    return;
  }

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
    if (screenId === 'screen-intro') {
      renderDashboardLevels();
    }
  } else {
    hud.classList.remove('hidden');
    updateLevelIndicator();
    updateProgressBar();
  }

  // Handle 23-second Question Timer across all questions in any level
  const questionObj = getQuestionByScreenId(screenId);
  if (questionObj && !AppState.answers[questionObj.id]) {
    QuestionTimer.start(questionObj);
  } else {
    QuestionTimer.stop();
  }

  // Persist progress across page refreshes
  if (screenId !== 'screen-cover' && screenId !== 'screen-intro') {
    saveCurrentProgress();
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

// Render sequential Level progress indicator at top of quiz:
// e.g. "Level 1 ✓ · Level 2 · Level 3 🔒 · Level 4 🔒" (Display Only)
function updateLevelIndicator() {
  const container = document.getElementById('hud-level-indicator');
  if (!container) return;

  container.innerHTML = LEVELS.map((lvl, index) => {
    const isCleared = AppState.clearedLevels.includes(lvl.id);
    const isUnlocked = isLevelUnlocked(lvl.id);
    const isCurrent = AppState.currentLevel === lvl.id;

    let badgeClass = 'level-step';
    let icon = '';

    if (isCleared) {
      badgeClass += ' is-cleared';
      icon = '<span class="level-step-icon">✓</span>';
    } else if (isCurrent) {
      badgeClass += ' is-current';
      icon = '<span class="level-step-dot"></span>';
    } else if (isUnlocked) {
      badgeClass += ' is-unlocked';
      icon = '<span class="level-step-icon">🔓</span>';
    } else {
      badgeClass += ' is-locked';
      icon = '<span class="level-step-icon">🔒</span>';
    }

    const itemHtml = `<div class="${badgeClass}" title="Level ${lvl.id}: ${lvl.title}">${icon} <span class="level-step-label">Level ${lvl.id}</span></div>`;
    const sep = index < LEVELS.length - 1 ? '<span class="level-sep">·</span>' : '';
    return itemHtml + sep;
  }).join('');
}

function updateProgressBar() {
  const fill = document.getElementById('progress-bar-fill');
  const text = document.getElementById('progress-text');
  if (!fill || !text) return;

  const currentLevel = AppState.currentLevel || 1;

  if (currentLevel === 1) {
    // Level 1: 12 units of progress (11 questions + 1 user journey)
    let step = 1;
    if (AppState.currentScreen.startsWith('screen-q')) {
      const qNum = parseInt(AppState.currentScreen.replace('screen-q', ''), 10);
      step = qNum <= 8 ? qNum : qNum + 1; // offset for journey puzzle
    } else if (AppState.currentScreen.startsWith('screen-exp')) {
      const expNum = parseInt(AppState.currentScreen.replace('screen-exp', ''), 10);
      step = expNum <= 8 ? expNum : expNum + 1;
    } else if (AppState.currentScreen === 'screen-journey') {
      step = 9;
    } else if (AppState.currentScreen === 'screen-level-1-complete') {
      step = 12;
    }

    const pct = Math.min(100, Math.round((step / 12) * 100));
    fill.style.width = `${pct}%`;
    text.textContent = `${Math.min(12, Math.max(1, step))} / 12`;
  } else if (currentLevel === 2) {
    // Level 2: 10 numerical questions
    let step = 1;
    if (AppState.currentScreen.startsWith('screen-l2-q')) {
      step = parseInt(AppState.currentScreen.replace('screen-l2-q', ''), 10) || 1;
    } else if (AppState.currentScreen.startsWith('screen-l2-exp')) {
      step = parseInt(AppState.currentScreen.replace('screen-l2-exp', ''), 10) || 1;
    } else if (AppState.currentScreen === 'screen-level-2-complete') {
      step = 10;
    }

    const pct = Math.min(100, Math.round((step / 10) * 100));
    fill.style.width = `${pct}%`;
    text.textContent = `${Math.min(10, Math.max(1, step))} / 10`;
  } else if (currentLevel === 3) {
    // Level 3: 14 questions split into Part A (7) and Part B (7)
    let step = 1;
    let label = 'Part A: 1 / 7';

    if (AppState.currentScreen.startsWith('screen-l3-a-')) {
      step = parseInt(AppState.currentScreen.replace(/screen-l3-a-(q|exp)/, ''), 10) || 1;
      label = `Part A: ${step} / 7`;
    } else if (AppState.currentScreen === 'screen-level-3-part-a-complete') {
      step = 7;
      label = `Part A Cleared`;
    } else if (AppState.currentScreen.startsWith('screen-l3-b-')) {
      const bStep = parseInt(AppState.currentScreen.replace(/screen-l3-b-(q|exp)/, ''), 10) || 1;
      step = 7 + bStep;
      label = `Part B: ${bStep} / 7`;
    } else if (AppState.currentScreen === 'screen-level-3-complete') {
      step = 14;
      label = `Level 3 Cleared`;
    }

    const pct = Math.min(100, Math.round((step / 14) * 100));
    fill.style.width = `${pct}%`;
    text.textContent = label;
  } else {
    fill.style.width = '100%';
    text.textContent = `Level ${currentLevel}`;
  }
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
// 5B. 23-SECOND QUESTION TIMER ENGINE
// ============================================================
const QuestionTimer = {
  totalSeconds: 23,
  secondsRemaining: 23,
  intervalId: null,
  activeQuestion: null,

  start(q) {
    this.stop();
    this.activeQuestion = q;
    this.secondsRemaining = this.totalSeconds;
    this.updateDisplay(this.secondsRemaining, false);

    const hudTimer = document.getElementById('hud-timer-pill');
    if (hudTimer) hudTimer.classList.remove('hidden');

    this.intervalId = setInterval(() => {
      this.secondsRemaining--;
      const isUrgent = this.secondsRemaining <= 5;
      this.updateDisplay(this.secondsRemaining, isUrgent);

      if (isUrgent && this.secondsRemaining > 0) {
        SoundFX.play(ctx => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(550, ctx.currentTime);
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.08);
        });
      }

      if (this.secondsRemaining <= 0) {
        this.stop();
        handleQuestionTimeout(this.activeQuestion);
      }
    }, 1000);
  },

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    const hudTimer = document.getElementById('hud-timer-pill');
    if (hudTimer) {
      hudTimer.classList.add('hidden');
      hudTimer.classList.remove('timer-urgent');
    }
  },

  updateDisplay(secs, isUrgent) {
    const val = Math.max(0, secs);
    if (this.activeQuestion) {
      const qScreen = document.getElementById(this.activeQuestion.screenId);
      if (qScreen) {
        const badge = qScreen.querySelector('.quiz-timer-badge');
        const count = qScreen.querySelector('.timer-countdown');
        if (count) count.textContent = val;
        if (badge) {
          if (isUrgent) badge.classList.add('timer-urgent');
          else badge.classList.remove('timer-urgent');
        }
      }
    }
    const hudVal = document.getElementById('hud-timer-val');
    const hudPill = document.getElementById('hud-timer-pill');
    if (hudVal) hudVal.textContent = val;
    if (hudPill) {
      if (isUrgent) hudPill.classList.add('timer-urgent');
      else hudPill.classList.remove('timer-urgent');
    }
  }
};

function handleQuestionTimeout(q) {
  if (!q) return;
  const qScreen = document.getElementById(q.screenId);
  if (!qScreen) return;

  const optContainer = qScreen.querySelector('.options-container');
  const submitBtn = qScreen.querySelector('.btn-submit');
  const feedbackBox = qScreen.querySelector('.feedback-box');
  if (!optContainer || !submitBtn || !feedbackBox) return;

  if (AppState.answers[q.id]) return;

  const optButtons = optContainer.querySelectorAll('.option-btn');
  optButtons.forEach(b => b.classList.add('locked'));
  submitBtn.disabled = true;

  const chosenOpt = AppState.selectedOption;
  const isCorrect = chosenOpt === q.correct;
  const chosenBtn = chosenOpt ? optContainer.querySelector(`[data-opt="${chosenOpt}"]`) : null;
  const correctBtn = optContainer.querySelector(`[data-opt="${q.correct}"]`);

  const feedbackText = feedbackBox.querySelector('.feedback-text');
  const feedbackIcon = feedbackBox.querySelector('.feedback-icon');

  if (isCorrect) {
    if (chosenBtn) chosenBtn.classList.add('correct');
    feedbackBox.classList.remove('hidden', 'is-incorrect');
    feedbackBox.classList.add('is-correct');
    feedbackText.textContent = "Time's up! Your selected option was correct! 🎉";
    feedbackIcon.textContent = '🎉';
    awardXP(10, 'Correct Answer');
    updateCombo(true);
    SoundFX.correct();
  } else {
    if (chosenBtn) chosenBtn.classList.add('incorrect');
    if (correctBtn) correctBtn.classList.add('correct');
    feedbackBox.classList.remove('hidden', 'is-correct');
    feedbackBox.classList.add('is-incorrect');
    if (chosenOpt) {
      feedbackText.textContent = `⏰ Time's up! Option ${chosenOpt} is incorrect. Correct answer: ${q.correct}.`;
    } else {
      feedbackText.textContent = `⏰ Time's up! You did not select an option. Correct answer: ${q.correct}.`;
    }
    feedbackIcon.textContent = '⏰';
    updateCombo(false);
    SoundFX.streakBreak();
  }

  AppState.answers[q.id] = {
    selected: chosenOpt || 'TIMEOUT',
    isCorrect,
    xpAwarded: isCorrect ? 10 : 0,
    topic: q.topic,
    question: q.question
  };

  if (AppState.studentId) {
    API.saveAnswer(
      AppState.studentId,
      AppState.attemptId,
      q.id,
      q.topic,
      chosenOpt || 'TIMEOUT',
      isCorrect,
      isCorrect ? 10 : 0
    );
  }

  submitBtn.textContent = 'Continue to Explanation →';
  submitBtn.disabled = false;
  submitBtn.classList.add('pulse-active');
  submitBtn.onclick = () => {
    navigateTo(q.expId);
  };
}

// ============================================================
// 6. QUESTION & OPTION EVENT HANDLERS (ALL LEVELS)
// ============================================================
function setupQuestionScreens() {
  // Wire up every question across all sequential levels
  getAllQuestions().forEach(q => {
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
      QuestionTimer.stop();

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

      // Persist answer in background
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
      submitBtn.classList.add('pulse-active');
      submitBtn.onclick = () => {
        navigateTo(q.expId);
      };
    });
  });

  // Wire up Explanation "Next" buttons across Level 1 & Level 2
  const nextMappings = {
    // Level 1 mappings
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

    // Level 2 mappings
    'btn-next-l2-exp1': 'screen-l2-q2',
    'btn-next-l2-exp2': 'screen-l2-q3',
    'btn-next-l2-exp3': 'screen-l2-q4',
    'btn-next-l2-exp4': 'screen-l2-q5',
    'btn-next-l2-exp5': 'screen-l2-q6',
    'btn-next-l2-exp6': 'screen-l2-q7',
    'btn-next-l2-exp7': 'screen-l2-q8',
    'btn-next-l2-exp8': 'screen-l2-q9',
    'btn-next-l2-exp9': 'screen-l2-q10',

    // Level 3 · Part A mappings
    'btn-next-l3-a-exp1': 'screen-l3-a-q2',
    'btn-next-l3-a-exp2': 'screen-l3-a-q3',
    'btn-next-l3-a-exp3': 'screen-l3-a-q4',
    'btn-next-l3-a-exp4': 'screen-l3-a-q5',
    'btn-next-l3-a-exp5': 'screen-l3-a-q6',
    'btn-next-l3-a-exp6': 'screen-l3-a-q7',

    // Level 3 · Part B mappings
    'btn-next-l3-b-exp1': 'screen-l3-b-q2',
    'btn-next-l3-b-exp2': 'screen-l3-b-q3',
    'btn-next-l3-b-exp3': 'screen-l3-b-q4',
    'btn-next-l3-b-exp4': 'screen-l3-b-q5',
    'btn-next-l3-b-exp5': 'screen-l3-b-q6',
    'btn-next-l3-b-exp6': 'screen-l3-b-q7'
  };

  Object.entries(nextMappings).forEach(([btnId, targetScreen]) => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.addEventListener('click', () => {
        navigateTo(targetScreen);
      });
    }
  });

  // Level 1 Completion Trigger
  const btnFinishL1 = document.getElementById('btn-finish-level-1');
  if (btnFinishL1) {
    btnFinishL1.addEventListener('click', handleLevel1Complete);
  }
  const btnFinishQuizLegacy = document.getElementById('btn-finish-quiz');
  if (btnFinishQuizLegacy) {
    btnFinishQuizLegacy.addEventListener('click', handleLevel1Complete);
  }

  // Start Level 2 Trigger from Level 1 Complete Screen
  const btnStartL2 = document.getElementById('btn-start-level-2');
  if (btnStartL2) {
    btnStartL2.addEventListener('click', () => {
      navigateTo('screen-l2-q1');
    });
  }

  // Level 2 Completion Trigger on last explanation screen (L2-EXP10)
  const btnFinishL2 = document.getElementById('btn-next-l2-exp10');
  if (btnFinishL2) {
    btnFinishL2.addEventListener('click', handleLevel2Complete);
  }

  // Start Level 3 Trigger from Level 2 Complete Screen
  const btnStartL3 = document.getElementById('btn-start-level-3');
  if (btnStartL3) {
    btnStartL3.addEventListener('click', () => {
      handleStartLevel(3);
    });
  }

  // Level 3 Part A Completion Trigger on L3-A-EXP7
  const btnFinishL3PartA = document.getElementById('btn-finish-l3-part-a');
  if (btnFinishL3PartA) {
    btnFinishL3PartA.addEventListener('click', handleLevel3PartAComplete);
  }

  // Start Level 3 Part B Trigger from Part A Complete Screen
  const btnStartL3PartB = document.getElementById('btn-start-l3-part-b');
  if (btnStartL3PartB) {
    btnStartL3PartB.addEventListener('click', () => {
      navigateTo('screen-l3-b-q1');
    });
  }

  // Level 3 Full Completion Trigger on L3-B-EXP7
  const btnFinishL3 = document.getElementById('btn-finish-level-3');
  if (btnFinishL3) {
    btnFinishL3.addEventListener('click', handleLevel3Complete);
  }

  // Start Level 4 Trigger from Level 3 Complete Screen
  const btnStartL4 = document.getElementById('btn-start-level-4');
  if (btnStartL4) {
    btnStartL4.addEventListener('click', () => {
      handleStartLevel(4);
    });
  }

  // HUD Home Button (return to home dashboard from anywhere)
  const btnHudHome = document.getElementById('btn-hud-home');
  if (btnHudHome) {
    btnHudHome.addEventListener('click', () => {
      QuestionTimer.stop();
      navigateTo('screen-intro');
      renderDashboardLevels();
    });
  }

  // All Return-to-Home Buttons (on level completion screens, in-progress, and final report)
  document.querySelectorAll('.btn-return-home').forEach(btn => {
    btn.addEventListener('click', () => {
      QuestionTimer.stop();
      navigateTo('screen-intro');
      renderDashboardLevels();
    });
  });

  // Intro Dashboard: Combined Leaderboard Button
  const btnIntroLeaderboard = document.getElementById('btn-intro-view-leaderboard');
  if (btnIntroLeaderboard) {
    btnIntroLeaderboard.addEventListener('click', () => {
      finalizeAndShowReport();
    });
  }

  // Level 3 Complete: Combined Leaderboard Button
  const btnL3Leaderboard = document.getElementById('btn-l3-view-leaderboard');
  if (btnL3Leaderboard) {
    btnL3Leaderboard.addEventListener('click', () => {
      finalizeAndShowReport();
    });
  }

  // In-Progress Screen buttons
  const btnInProgReport = document.getElementById('btn-in-progress-view-report');
  if (btnInProgReport) {
    btnInProgReport.addEventListener('click', () => {
      finalizeAndShowReport();
    });
  }
  const btnInProgBack = document.getElementById('btn-in-progress-back');
  if (btnInProgBack) {
    btnInProgBack.addEventListener('click', () => {
      QuestionTimer.stop();
      navigateTo('screen-intro');
      renderDashboardLevels();
    });
  }
}

// Level 1 Completion logic
function handleLevel1Complete() {
  const l1Questions = LEVELS[0].questions;
  const correctCount = l1Questions.filter(q => AppState.answers[q.id]?.isCorrect).length;
  const total = l1Questions.length;
  const pct = Math.round((correctCount / total) * 100);

  if (!AppState.clearedLevels.includes(1)) {
    AppState.clearedLevels.push(1);
  }
  AppState.currentLevel = 2;
  AppState.levelScores[1] = { score: correctCount, total, percentage: pct };

  const scoreDisp = document.getElementById('l1-score-display');
  const pctDisp = document.getElementById('l1-pct-display');
  const xpDisp = document.getElementById('l1-xp-display');
  if (scoreDisp) scoreDisp.textContent = `${correctCount} / ${total}`;
  if (pctDisp) pctDisp.textContent = `${pct}% Accuracy`;
  if (xpDisp) xpDisp.textContent = `⚡ ${AppState.xp} XP`;

  SoundFX.celebrate();
  saveCurrentProgress();
  navigateTo('screen-level-1-complete');
}

// Level 2 Completion logic
function handleLevel2Complete() {
  const l2Questions = LEVELS[1].questions;
  const correctCount = l2Questions.filter(q => AppState.answers[q.id]?.isCorrect).length;
  const total = l2Questions.length;
  const pct = Math.round((correctCount / total) * 100);

  if (!AppState.clearedLevels.includes(2)) {
    AppState.clearedLevels.push(2);
  }
  AppState.currentLevel = 3;
  AppState.levelScores[2] = { score: correctCount, total, percentage: pct };

  const scoreDisp = document.getElementById('l2-score-display');
  const pctDisp = document.getElementById('l2-pct-display');
  const xpDisp = document.getElementById('l2-xp-display');
  if (scoreDisp) scoreDisp.textContent = `${correctCount} / ${total}`;
  if (pctDisp) pctDisp.textContent = `${pct}% Accuracy`;
  if (xpDisp) xpDisp.textContent = `⚡ ${AppState.xp} XP`;

  SoundFX.celebrate();
  saveCurrentProgress();
  navigateTo('screen-level-2-complete');
}

// Level 3 Part A Completion logic
function handleLevel3PartAComplete() {
  const l3Questions = LEVELS[2].questions.filter(q => q.part === 'A');
  const correctCount = l3Questions.filter(q => AppState.answers[q.id]?.isCorrect).length;
  const total = l3Questions.length;
  const pct = Math.round((correctCount / total) * 100);

  AppState.levelScores['3_A'] = { score: correctCount, total, percentage: pct };

  const scoreDisp = document.getElementById('l3-a-score-display');
  const pctDisp = document.getElementById('l3-a-pct-display');
  const xpDisp = document.getElementById('l3-a-xp-display');
  if (scoreDisp) scoreDisp.textContent = `${correctCount} / ${total}`;
  if (pctDisp) pctDisp.textContent = `${pct}% Accuracy`;
  if (xpDisp) xpDisp.textContent = `⚡ ${AppState.xp} XP`;

  SoundFX.celebrate();
  saveCurrentProgress();
  navigateTo('screen-level-3-part-a-complete');
}

// Level 3 Full Completion logic (Part A + Part B)
function handleLevel3Complete() {
  const l3Questions = LEVELS[2].questions;
  const correctCount = l3Questions.filter(q => AppState.answers[q.id]?.isCorrect).length;
  const total = l3Questions.length;
  const pct = Math.round((correctCount / total) * 100);

  if (!AppState.clearedLevels.includes(3)) {
    AppState.clearedLevels.push(3);
  }
  AppState.currentLevel = 4;
  AppState.levelScores[3] = { score: correctCount, total, percentage: pct };

  const scoreDisp = document.getElementById('l3-score-display');
  const pctDisp = document.getElementById('l3-pct-display');
  const xpDisp = document.getElementById('l3-xp-display');
  if (scoreDisp) scoreDisp.textContent = `${correctCount} / ${total}`;
  if (pctDisp) pctDisp.textContent = `${pct}% Accuracy`;
  if (xpDisp) xpDisp.textContent = `⚡ ${AppState.xp} XP`;

  SoundFX.celebrate();
  saveCurrentProgress();
  navigateTo('screen-level-3-complete');
}

// Start Level Handler (Modular: if level has 0 questions, shows In-Progress screen automatically)
function handleStartLevel(levelNum) {
  const targetLvl = LEVELS.find(l => l.id === levelNum);
  if (!targetLvl) return;

  if (!isLevelUnlocked(levelNum)) {
    showToast(`🔒 Level ${levelNum} is locked! Clear previous levels first.`, 'toast-break');
    return;
  }

  AppState.currentLevel = levelNum;

  if (targetLvl.questions.length === 0) {
    const badge = document.getElementById('in-progress-badge');
    const title = document.getElementById('in-progress-title');
    const desc = document.getElementById('in-progress-message');
    if (badge) badge.textContent = `Level ${levelNum} Unlocked 🔓`;
    if (title) title.textContent = `Level ${levelNum} – ${targetLvl.title}`;
    if (desc) desc.textContent = `Level ${levelNum} – ${targetLvl.title} is being built. Check back soon!`;
    navigateTo('screen-level-in-progress');
  } else {
    // Level 3 starts at Part A Q1 (or Part B Q1 if Part A already cleared)
    if (levelNum === 3 && !isLevel3PartACleared()) {
      navigateTo('screen-l3-a-q1');
    } else if (levelNum === 3 && isLevel3PartACleared()) {
      navigateTo('screen-l3-b-q1');
    } else {
      navigateTo(targetLvl.questions[0].screenId);
    }
  }
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

  const allAttemptedQuestions = getAllQuestions().filter(q => Boolean(AppState.answers[q.id]));
  const questionsToEvaluate = allAttemptedQuestions.length > 0 ? allAttemptedQuestions : LEVELS[0].questions;
  const totalQuestions = questionsToEvaluate.length;
  let score = 0;
  const strongAreas = [];
  const weakAreas = [];

  questionsToEvaluate.forEach(q => {
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

  // Cover, Intro & HUD Buttons
  const btnCoverLogin = document.getElementById('btn-cover-login');
  const btnCoverLogout = document.getElementById('btn-cover-logout');
  const btnIntroLogin = document.getElementById('btn-intro-login');
  const btnIntroLogout = document.getElementById('btn-intro-logout');
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

  // Open modal from Cover & Intro Screens
  if (btnCoverLogin) {
    btnCoverLogin.addEventListener('click', () => {
      setMode('login');
      authModal.classList.remove('hidden');
    });
  }
  if (btnIntroLogin) {
    btnIntroLogin.addEventListener('click', () => {
      setMode('login');
      authModal.classList.remove('hidden');
    });
  }

  // Logout Handlers (Cover, Intro & HUD)
  if (btnCoverLogout) btnCoverLogout.addEventListener('click', handleLogout);
  if (btnIntroLogout) btnIntroLogout.addEventListener('click', handleLogout);
  if (btnHudLogout) btnHudLogout.addEventListener('click', handleLogout);

  // Function to seamlessly start Level 1 or resume student at their active level
  function resumeOrStartQuiz() {
    if (AppState.savedResumeScreen) {
      const scrLvl = getLevelForScreen(AppState.savedResumeScreen);
      if (scrLvl === null || isLevelUnlocked(scrLvl)) {
        navigateTo(AppState.savedResumeScreen);
        return;
      }
    }
    // Check sequential progression with >75% direct unlock
    const l1Score = getLevelScore(1);
    const l2Score = getLevelScore(2);
    const l3Score = getLevelScore(3);
    const l3AScore = getLevelScore('3_A');

    const l1Passed = AppState.clearedLevels.includes(1) || (l1Score && l1Score.percentage >= 75);
    const l2Passed = AppState.clearedLevels.includes(2) || (l2Score && l2Score.percentage >= 75);
    const l3Passed = AppState.clearedLevels.includes(3) || (l3Score && l3Score.percentage >= 75);
    const l3APassed = isLevel3PartACleared() || (l3AScore && l3AScore.percentage >= 75);

    if (!l1Passed) {
      navigateTo('screen-q1');
    } else if (!l2Passed) {
      navigateTo('screen-l2-q1');
    } else if (!l3Passed) {
      if (!l3APassed) {
        navigateTo('screen-l3-a-q1');
      } else {
        navigateTo('screen-l3-b-q1');
      }
    } else {
      handleStartLevel(4);
    }
  }

  // Intercept Take Quiz
  const takeQuizBtn = document.getElementById('btn-take-quiz');
  if (takeQuizBtn) {
    takeQuizBtn.addEventListener('click', () => {
      if (!AppState.isAuthenticated) {
        setMode('signup');
        authModal.classList.remove('hidden');
      } else {
        resumeOrStartQuiz();
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

        // Fetch user progress across sessions & devices from Supabase
        await AppState.syncProgressWithServer();

        // Proceed to saved screen or start Level 1
        resumeOrStartQuiz();
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

    // Reset all UI question states across all levels
    QuestionTimer.stop();
    document.querySelectorAll('.timer-countdown').forEach(el => el.textContent = '23');
    document.querySelectorAll('.quiz-timer-badge').forEach(b => b.classList.remove('timer-urgent'));

    getAllQuestions().forEach(q => {
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
        submitBtn.classList.remove('pulse-active');
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

  // Initial dashboard levels render
  renderDashboardLevels();

  // Expose global helpers for inline handlers and navigation
  window.startLevelFromDashboard = startLevelFromDashboard;
  window.handleStartLevel = handleStartLevel;
  window.finalizeAndShowReport = finalizeAndShowReport;
  window.navigateTo = navigateTo;
  window.renderDashboardLevels = renderDashboardLevels;

  console.log('LearnWise × Kraftshala application initialized successfully.');
});

