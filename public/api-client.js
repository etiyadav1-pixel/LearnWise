/**
 * LearnWise × Kraftshala — Frontend API Client
 * Strictly interacts with local /api endpoints (Backend acts as proxy to Supabase)
 * No database credentials or secret keys are exposed to the client.
 */

const API = {
  baseUrl: '',

  async signup(studentName, password) {
    const res = await fetch(`${this.baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_name: studentName, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async login(studentName, password) {
    const res = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_name: studentName, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Authentication failed');
    return data;
  },

  async saveAnswer(studentId, attemptId, questionId, questionTopic, selectedOption, isCorrect, xpAwarded) {
    try {
      const res = await fetch(`${this.baseUrl}/api/save-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          attempt_id: attemptId,
          question_id: questionId,
          question_topic: questionTopic,
          selected_option: selectedOption,
          is_correct: isCorrect,
          xp_awarded: xpAwarded
        })
      });
      return await res.json();
    } catch (err) {
      console.warn('Silent save-answer fail:', err.message);
      return { success: false };
    }
  },

  async saveQuizResults(studentId, studentName, score, total, percentage, xpEarned, bestCombo, strongAreas, weakAreas) {
    try {
      const res = await fetch(`${this.baseUrl}/api/quiz-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          student_name: studentName,
          score,
          total,
          percentage,
          xp_earned: xpEarned,
          best_combo: bestCombo,
          strong_areas: strongAreas,
          weak_areas: weakAreas
        })
      });
      return await res.json();
    } catch (err) {
      console.error('Save quiz results error:', err);
      return { success: false };
    }
  },

  async getQuizResults(studentId) {
    try {
      const res = await fetch(`${this.baseUrl}/api/quiz-results?student_id=${encodeURIComponent(studentId)}`);
      return await res.json();
    } catch (err) {
      console.error('Get quiz results error:', err);
      return { results: [] };
    }
  },

  async getProgress(studentId) {
    try {
      const res = await fetch(`${this.baseUrl}/api/student-progress?student_id=${encodeURIComponent(studentId)}`);
      return await res.json();
    } catch (err) {
      console.error('Get progress error:', err);
      return { progress: null };
    }
  },

  async getLeaderboard() {
    try {
      const res = await fetch(`${this.baseUrl}/api/leaderboard`);
      return await res.json();
    } catch (err) {
      console.error('Get leaderboard error:', err);
      return { leaderboard: [], highest_streak: { streak: 0, holder: 'None yet' } };
    }
  },

  async health() {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`);
      return await res.json();
    } catch (err) {
      return { status: 'error', message: err.message };
    }
  }
};

