/**
 * LearnWise × Kraftshala — Vercel Serverless API Handler
 * Zero external dependencies. Uses native fetch and crypto built into Node 18+.
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://crudeeqziwlsdhejyqwz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNydWRlZXF6aXdsc2RoZWp5cXd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mjk5NDY3MywiZXhwIjoyMTA4NTcwNjczfQ.AOpuvY8n4M-cgxxU7xedtl99py27QE2vsgvF7sTJ_ho';

function getEmailSlug(name) {
  let clean = (name || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '.');
  while (clean.includes('..')) {
    clean = clean.replace('..', '.');
  }
  clean = clean.replace(/^\.+|\.+$/g, '');
  if (!clean) clean = 'student';
  return `${clean}@learnwise.internal`;
}

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse path
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // Safe body parsing for Vercel
  let parsedBody = req.body || {};
  if (typeof parsedBody === 'string') {
    try { parsedBody = JSON.parse(parsedBody); } catch (e) { parsedBody = {}; }
  } else if (!req.body && req.method === 'POST') {
    try {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const raw = Buffer.concat(buffers).toString();
      if (raw) parsedBody = JSON.parse(raw);
    } catch (e) { parsedBody = {}; }
  }
  req.body = parsedBody;

  const authHeaders = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. SIGNUP
    if (req.method === 'POST' && pathname === '/api/auth/signup') {
      const { student_name, password } = req.body || {};
      const name = (student_name || '').trim();
      const pass = (password || '').trim();

      if (!name) {
        return res.status(400).json({ error: 'Please enter your student name.' });
      }
      if (pass.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }

      const email = getEmailSlug(name);
      const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          email,
          password: pass,
          email_confirm: true,
          user_metadata: {
            student_name: name,
            total_xp: 0,
            best_score: 0,
            best_percentage: 0,
            best_streak: 0,
            total_attempts: 0,
            current_screen: 'screen-q1',
            attempts: []
          }
        })
      });

      const data = await signupRes.json();
      if (!signupRes.ok) {
        if (data.error_code === 'email_exists' || (data.msg && data.msg.includes('already been registered'))) {
          return res.status(400).json({ error: 'An account with this Student Name already exists. Please sign in.' });
        }
        if (data.error_code === 'weak_password' || (data.msg && data.msg.includes('at least 6 characters'))) {
          return res.status(400).json({ error: 'Password must be at least 6 characters.' });
        }
        return res.status(400).json({ error: data.msg || 'Registration failed.' });
      }

      return res.status(200).json({
        student_id: data.id,
        student_name: name,
        progress: {
          current_screen: 'screen-q1',
          current_question: 1,
          total_xp: 0,
          best_score: 0,
          best_streak: 0,
          total_attempts: 0
        }
      });
    }

    // 2. LOGIN
    if (req.method === 'POST' && pathname === '/api/auth/login') {
      const { student_name, password } = req.body || {};
      const name = (student_name || '').trim();
      const pass = (password || '').trim();

      if (!name || !pass) {
        return res.status(400).json({ error: 'Please enter student name and password.' });
      }

      const email = getEmailSlug(name);
      const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await loginRes.json();
      if (!loginRes.ok) {
        return res.status(401).json({ error: 'Incorrect password or student name. Please try again or create an account.' });
      }

      const user = data.user;
      const meta = user.user_metadata || {};
      return res.status(200).json({
        student_id: user.id,
        student_name: meta.student_name || name,
        progress: {
          current_screen: 'screen-q1',
          current_question: 1,
          total_xp: meta.total_xp || 0,
          best_score: meta.best_score || 0,
          best_streak: meta.best_streak || 0,
          total_attempts: meta.total_attempts || 0
        }
      });
    }

    // 3. SAVE QUESTION ANSWER (Increment XP)
    if (req.method === 'POST' && pathname === '/api/save-answer') {
      const { student_id, xp_awarded } = req.body || {};
      if (!student_id) return res.status(400).json({ error: 'student_id required' });

      if (Number(xp_awarded) > 0) {
        try {
          const userRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${student_id}`, { headers: authHeaders });
          const userObj = await userRes.json();
          const currXp = (userObj.user_metadata && userObj.user_metadata.total_xp) || 0;
          await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${student_id}`, {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify({
              user_metadata: { total_xp: currXp + Number(xp_awarded) }
            })
          });
        } catch (e) { }
      }
      return res.status(200).json({ success: true });
    }

    // 4. SAVE QUIZ RESULTS
    if (req.method === 'POST' && pathname === '/api/quiz-results') {
      const { student_id, student_name, score, total, percentage, xp_earned, best_combo, strong_areas, weak_areas } = req.body || {};
      if (!student_id) return res.status(400).json({ error: 'student_id required' });

      const resultId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      try {
        const userRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${student_id}`, { headers: authHeaders });
        const userObj = await userRes.json();
        const meta = userObj.user_metadata || {};
        const existingAttempts = Array.isArray(meta.attempts) ? meta.attempts : [];

        const newAttempt = {
          id: resultId,
          score: Number(score) || 0,
          total: Number(total) || 11,
          percentage: Number(percentage) || 0,
          xp_earned: Number(xp_earned) || 0,
          best_combo: Number(best_combo) || 0,
          strong_areas: strong_areas || [],
          weak_areas: weak_areas || [],
          completed_at: new Date().toISOString()
        };
        existingAttempts.push(newAttempt);

        const bestScore = Math.max(meta.best_score || 0, Number(score) || 0);
        const bestPct = Math.max(meta.best_percentage || 0, Number(percentage) || 0);
        const bestStreak = Math.max(meta.best_streak || meta.best_combo || 0, Number(best_combo) || 0);
        const totalAttempts = (meta.total_attempts || 0) + 1;
        const totalXp = Math.max(meta.total_xp || 0, Number(xp_earned) || 0);

        await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${student_id}`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({
            user_metadata: {
              student_name: meta.student_name || student_name || 'Student',
              best_score: bestScore,
              best_percentage: bestPct,
              best_streak: bestStreak,
              total_attempts: totalAttempts,
              total_xp: totalXp,
              attempts: existingAttempts
            }
          })
        });
        return res.status(200).json({ success: true, result_id: resultId });
      } catch (err) {
        return res.status(200).json({ success: true, result_id: resultId });
      }
    }

    // 4b. SAVE USER PROGRESS ACROSS SESSIONS & DEVICES
    if (req.method === 'POST' && pathname === '/api/save-progress') {
      const { student_id, progress } = req.body || {};
      if (!student_id || !progress) {
        return res.status(400).json({ error: 'student_id and progress payload required' });
      }

      try {
        const userRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${student_id}`, { headers: authHeaders });
        if (!userRes.ok) return res.status(404).json({ error: 'Student account not found' });
        const userObj = await userRes.json();
        const meta = userObj.user_metadata || {};

        const mergedCleared = Array.from(new Set([
          ...(Array.isArray(meta.cleared_levels) ? meta.cleared_levels : []),
          ...(Array.isArray(progress.cleared_levels) ? progress.cleared_levels : [])
        ]));

        const updatedMeta = {
          ...meta,
          cleared_levels: mergedCleared,
          current_level: progress.current_level || meta.current_level || 1,
          current_screen: progress.current_screen || meta.current_screen || 'screen-q1',
          level_scores: { ...(meta.level_scores || {}), ...(progress.level_scores || {}) },
          total_xp: typeof progress.total_xp === 'number' ? progress.total_xp : (meta.total_xp || 0),
          best_streak: Math.min(Math.max(meta.best_streak || 0, progress.best_streak || 0), 11),
          last_active: new Date().toISOString()
        };

        await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${student_id}`, {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({ user_metadata: updatedMeta })
        });

        return res.status(200).json({ success: true, progress: updatedMeta });
      } catch (err) {
        console.error('Save progress error:', err);
        return res.status(500).json({ error: 'Failed to save progress' });
      }
    }

    // 4c. GET USER PROGRESS
    if (req.method === 'GET' && pathname === '/api/student-progress') {
      const studentId = url.searchParams.get('student_id');
      if (!studentId) return res.status(400).json({ error: 'student_id query param required' });

      try {
        const userRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${studentId}`, { headers: authHeaders });
        if (!userRes.ok) return res.status(404).json({ error: 'Student not found' });
        const userObj = await userRes.json();
        const meta = userObj.user_metadata || {};

        return res.status(200).json({
          success: true,
          progress: {
            cleared_levels: meta.cleared_levels || [],
            current_level: meta.current_level || 1,
            current_screen: meta.current_screen || 'screen-q1',
            level_scores: meta.level_scores || {},
            total_xp: meta.total_xp || 0,
            best_streak: meta.best_streak || 0,
            student_name: meta.student_name || 'Student'
          }
        });
      } catch (err) {
        return res.status(500).json({ error: 'Failed to fetch student progress' });
      }
    }

    // 5. GET LEADERBOARD
    if (req.method === 'GET' && pathname === '/api/leaderboard') {
      try {
        const usersRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=100`, { headers: authHeaders });
        const data = await usersRes.json();
        const users = data.users || [];

        let highestStreak = 0;
        let highestHolder = 'No records yet';

        const leaderboard = users.map(u => {
          const meta = u.user_metadata || {};
          const MAX_STREAK = 11;
          let streak = Math.min(meta.best_streak || meta.best_combo || 0, MAX_STREAK);
          if (Array.isArray(meta.attempts)) {
            meta.attempts.forEach(att => {
              if (att.best_combo) {
                const capped = Math.min(att.best_combo, MAX_STREAK);
                if (capped > streak) streak = capped;
              }
            });
          }
          streak = Math.min(streak, MAX_STREAK);

          const studentName = meta.student_name || (u.email ? u.email.split('@')[0] : 'Student');
          if (streak > highestStreak) {
            highestStreak = streak;
            highestHolder = studentName;
          }

          let pct = meta.best_percentage || 0;
          if (!pct && meta.level_scores) {
            let totalScore = 0;
            let totalQs = 0;
            Object.values(meta.level_scores).forEach(ls => {
              if (ls && ls.total) {
                totalScore += ls.score || 0;
                totalQs += ls.total;
              }
            });
            if (totalQs > 0) {
              pct = Math.round((totalScore / totalQs) * 100);
            }
          }

          return {
            student_id: u.id,
            student_name: studentName,
            total_xp: meta.total_xp || 0,
            best_streak: streak,
            percentage: pct,
            total_attempts: meta.total_attempts || 0
          };
        });

        // Sort descending by XP, then best streak
        leaderboard.sort((a, b) => b.total_xp - a.total_xp || b.best_streak - a.best_streak);

        return res.status(200).json({
          leaderboard,
          highest_streak: {
            streak: highestStreak,
            holder: highestHolder
          }
        });
      } catch (err) {
        return res.status(200).json({
          leaderboard: [],
          highest_streak: { streak: 0, holder: 'No records yet' }
        });
      }
    }

    // 6. HEALTH
    if (req.method === 'GET' && pathname === '/api/health') {
      return res.status(200).json({
        status: 'ok',
        platform: 'vercel-serverless',
        supabase_configured: Boolean(SUPABASE_URL && SUPABASE_KEY),
        timestamp: new Date().toISOString()
      });
    }

    return res.status(404).json({ error: `Not found: ${pathname}` });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

