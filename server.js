const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let createClient;
try {
  createClient = require('@supabase/supabase-js').createClient;
} catch (e) {
  console.log('Supabase client module not installed or loaded, running in local fallback mode.');
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Determine if Supabase is properly configured
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const isSupabaseConfigured = Boolean(
  createClient &&
  supabaseUrl && 
  supabaseKey && 
  !supabaseUrl.includes('your-project') &&
  !supabaseKey.includes('your-service-role-key')
);

let supabase = null;
if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    console.log('Connected to live Supabase backend at:', supabaseUrl);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('Supabase credentials not set or placeholder detected. Operating with persistent local storage fallback.');
}

// Local JSON fallback store if Supabase credentials are not provided yet
const LOCAL_DB_FILE = path.join(__dirname, 'local_db.json');
function getLocalDb() {
  if (!fs.existsSync(LOCAL_DB_FILE)) {
    const initial = {
      students: [],
      user_logins: [],
      quiz_results: [],
      student_answers: [],
      student_progress: []
    };
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(LOCAL_DB_FILE, 'utf8'));
  } catch (e) {
    return { students: [], user_logins: [], quiz_results: [], student_answers: [], student_progress: [] };
  }
}

function saveLocalDb(data) {
  try {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error saving local db:', e);
  }
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password.trim()).digest('hex');
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 1. SIGNUP
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { student_name, password } = req.body;
    if (!student_name || !student_name.trim()) {
      return res.status(400).json({ error: 'Please enter your name.' });
    }
    if (!password || password.trim().length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters.' });
    }

    const cleanName = student_name.trim();
    const pwHash = hashPassword(password);
    const userId = crypto.randomUUID();

    if (supabase) {
      // Check duplicate
      const { data: existing, error: checkErr } = await supabase
        .from('students')
        .select('id, student_name')
        .ilike('student_name', cleanName)
        .maybeSingle();

      if (checkErr && checkErr.code !== 'PGRST116') {
        console.error('Check student error:', checkErr);
      }
      if (existing) {
        return res.status(400).json({ error: 'An account with this name already exists. Please sign in.' });
      }

      // Insert student
      const { data: student, error: insertErr } = await supabase
        .from('students')
        .insert([{ id: userId, student_name: cleanName, password_hash: pwHash }])
        .select()
        .single();

      if (insertErr) {
        console.error('Insert student error:', insertErr);
        return res.status(500).json({ error: 'Failed to create student account.' });
      }

      // Initialize progress
      await supabase.from('student_progress').insert([{
        student_id: userId,
        current_screen: 'screen-q1',
        current_question: 1,
        total_xp: 0,
        best_score: 0,
        best_percentage: 0,
        total_attempts: 0
      }]);

      // Log login
      await supabase.from('user_logins').insert([{
        student_id: userId,
        student_name: cleanName,
        user_agent: req.headers['user-agent'] || 'Web Client'
      }]);

      return res.json({
        student_id: userId,
        student_name: cleanName,
        progress: {
          current_screen: 'screen-q1',
          current_question: 1,
          total_xp: 0,
          best_score: 0,
          total_attempts: 0
        }
      });
    } else {
      // Local DB Fallback
      const db = getLocalDb();
      const existing = db.students.find(s => s.student_name.toLowerCase() === cleanName.toLowerCase());
      if (existing) {
        return res.status(400).json({ error: 'An account with this name already exists. Please sign in.' });
      }

      const newStudent = {
        id: userId,
        student_name: cleanName,
        password_hash: pwHash,
        created_at: new Date().toISOString()
      };
      db.students.push(newStudent);

      const progress = {
        id: crypto.randomUUID(),
        student_id: userId,
        current_screen: 'screen-q1',
        current_question: 1,
        total_xp: 0,
        best_score: 0,
        best_percentage: 0,
        total_attempts: 0,
        updated_at: new Date().toISOString()
      };
      db.student_progress.push(progress);

      db.user_logins.push({
        id: crypto.randomUUID(),
        student_id: userId,
        student_name: cleanName,
        logged_in_at: new Date().toISOString(),
        user_agent: req.headers['user-agent'] || 'Web Client'
      });

      saveLocalDb(db);

      return res.json({
        student_id: userId,
        student_name: cleanName,
        progress
      });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'An unexpected server error occurred during registration.' });
  }
});

// 2. LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { student_name, password } = req.body;
    if (!student_name || !student_name.trim()) {
      return res.status(400).json({ error: 'Please enter your student name.' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Please enter your password.' });
    }

    const cleanName = student_name.trim();
    const pwHash = hashPassword(password);

    if (supabase) {
      const { data: student, error: fetchErr } = await supabase
        .from('students')
        .select('*')
        .ilike('student_name', cleanName)
        .maybeSingle();

      if (fetchErr) {
        console.error('Fetch student error:', fetchErr);
      }
      if (!student) {
        return res.status(401).json({ error: "No account found. Please click 'Create Account' to register." });
      }

      if (student.password_hash !== pwHash) {
        return res.status(401).json({ error: 'Incorrect password. Please try again.' });
      }

      // Log login event
      await supabase.from('user_logins').insert([{
        student_id: student.id,
        student_name: student.student_name,
        user_agent: req.headers['user-agent'] || 'Web Client'
      }]);

      // Fetch student progress
      const { data: progress } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', student.id)
        .maybeSingle();

      return res.json({
        student_id: student.id,
        student_name: student.student_name,
        progress: progress || {
          current_screen: 'screen-q1',
          current_question: 1,
          total_xp: 0,
          best_score: 0,
          total_attempts: 0
        }
      });
    } else {
      // Local DB
      const db = getLocalDb();
      const student = db.students.find(s => s.student_name.toLowerCase() === cleanName.toLowerCase());
      if (!student) {
        return res.status(401).json({ error: "No account found. Please click 'Create Account' to register." });
      }

      if (student.password_hash !== pwHash) {
        return res.status(401).json({ error: 'Incorrect password. Please try again.' });
      }

      db.user_logins.push({
        id: crypto.randomUUID(),
        student_id: student.id,
        student_name: student.student_name,
        logged_in_at: new Date().toISOString(),
        user_agent: req.headers['user-agent'] || 'Web Client'
      });

      let progress = db.student_progress.find(p => p.student_id === student.id);
      if (!progress) {
        progress = {
          student_id: student.id,
          current_screen: 'screen-q1',
          current_question: 1,
          total_xp: 0,
          best_score: 0,
          best_percentage: 0,
          total_attempts: 0,
          updated_at: new Date().toISOString()
        };
        db.student_progress.push(progress);
      }
      saveLocalDb(db);

      return res.json({
        student_id: student.id,
        student_name: student.student_name,
        progress
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An unexpected server error occurred during login.' });
  }
});

// 3. SAVE QUESTION ANSWER (Progress per question)
app.post('/api/save-answer', async (req, res) => {
  try {
    const {
      student_id,
      attempt_id,
      question_id,
      question_topic,
      selected_option,
      is_correct,
      xp_awarded
    } = req.body;

    if (!student_id || !question_id) {
      return res.status(400).json({ error: 'Missing student_id or question_id.' });
    }

    if (supabase) {
      await supabase.from('student_answers').insert([{
        student_id,
        attempt_id: attempt_id || null,
        question_id,
        question_topic: question_topic || '',
        selected_option: selected_option || '',
        is_correct: Boolean(is_correct),
        xp_awarded: xp_awarded || 0
      }]);

      // Update student_progress total XP
      if (xp_awarded > 0) {
        const { data: currProg } = await supabase
          .from('student_progress')
          .select('total_xp')
          .eq('student_id', student_id)
          .maybeSingle();

        const newXp = (currProg ? currProg.total_xp : 0) + xp_awarded;
        await supabase
          .from('student_progress')
          .update({ total_xp: newXp, updated_at: new Date().toISOString() })
          .eq('student_id', student_id);
      }

      return res.json({ success: true });
    } else {
      const db = getLocalDb();
      db.student_answers.push({
        id: crypto.randomUUID(),
        student_id,
        attempt_id: attempt_id || null,
        question_id,
        question_topic: question_topic || '',
        selected_option: selected_option || '',
        is_correct: Boolean(is_correct),
        xp_awarded: xp_awarded || 0,
        answered_at: new Date().toISOString()
      });

      const prog = db.student_progress.find(p => p.student_id === student_id);
      if (prog) {
        prog.total_xp = (prog.total_xp || 0) + (xp_awarded || 0);
        prog.updated_at = new Date().toISOString();
      }
      saveLocalDb(db);
      return res.json({ success: true });
    }
  } catch (error) {
    console.error('Save answer error:', error);
    res.status(500).json({ error: 'Failed to record answer progress.' });
  }
});

// 4. SAVE FINAL QUIZ RESULTS
app.post('/api/quiz-results', async (req, res) => {
  try {
    const {
      student_id,
      student_name,
      score,
      total,
      percentage,
      xp_earned,
      best_combo,
      strong_areas,
      weak_areas
    } = req.body;

    if (!student_id) {
      return res.status(400).json({ error: 'student_id is required.' });
    }

    const resultId = crypto.randomUUID();

    if (supabase) {
      const { error: insertErr } = await supabase.from('quiz_results').insert([{
        id: resultId,
        student_id,
        student_name: student_name || 'Anonymous',
        score: Number(score) || 0,
        total: Number(total) || 11,
        percentage: Number(percentage) || 0,
        xp_earned: Number(xp_earned) || 0,
        best_combo: Number(best_combo) || 0,
        strong_areas: strong_areas || [],
        weak_areas: weak_areas || []
      }]);

      if (insertErr) {
        console.error('Quiz results insert error:', insertErr);
      }

      // Update student_progress statistics
      const { data: currProg } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', student_id)
        .maybeSingle();

      const bestScore = Math.max(currProg ? currProg.best_score || 0 : 0, Number(score) || 0);
      const bestPct = Math.max(currProg ? currProg.best_percentage || 0 : 0, Number(percentage) || 0);
      const attempts = (currProg ? currProg.total_attempts || 0 : 0) + 1;

      await supabase
        .from('student_progress')
        .update({
          best_score: bestScore,
          best_percentage: bestPct,
          total_attempts: attempts,
          current_screen: 'screen-report',
          updated_at: new Date().toISOString()
        })
        .eq('student_id', student_id);

      return res.json({ success: true, result_id: resultId });
    } else {
      const db = getLocalDb();
      const record = {
        id: resultId,
        student_id,
        student_name: student_name || 'Anonymous',
        score: Number(score) || 0,
        total: Number(total) || 11,
        percentage: Number(percentage) || 0,
        xp_earned: Number(xp_earned) || 0,
        best_combo: Number(best_combo) || 0,
        strong_areas: strong_areas || [],
        weak_areas: weak_areas || [],
        completed_at: new Date().toISOString()
      };
      db.quiz_results.push(record);

      let prog = db.student_progress.find(p => p.student_id === student_id);
      if (prog) {
        prog.best_score = Math.max(prog.best_score || 0, Number(score) || 0);
        prog.best_percentage = Math.max(prog.best_percentage || 0, Number(percentage) || 0);
        prog.total_attempts = (prog.total_attempts || 0) + 1;
        prog.current_screen = 'screen-report';
        prog.updated_at = new Date().toISOString();
      }
      saveLocalDb(db);

      return res.json({ success: true, result_id: resultId });
    }
  } catch (error) {
    console.error('Save quiz results error:', error);
    res.status(500).json({ error: 'Failed to record quiz results.' });
  }
});

// 5. GET QUIZ RESULTS FOR STUDENT
app.get('/api/quiz-results', async (req, res) => {
  try {
    const { student_id } = req.query;
    if (!student_id) {
      return res.status(400).json({ error: 'Missing student_id parameter.' });
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('student_id', student_id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return res.json({ results: data || [] });
    } else {
      const db = getLocalDb();
      const results = db.quiz_results
        .filter(r => r.student_id === student_id)
        .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
      return res.json({ results });
    }
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ error: 'Failed to fetch student quiz history.' });
  }
});

// 6. GET STUDENT PROGRESS
app.get('/api/student-progress', async (req, res) => {
  try {
    const { student_id } = req.query;
    if (!student_id) {
      return res.status(400).json({ error: 'Missing student_id parameter.' });
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', student_id)
        .maybeSingle();

      if (error) throw error;
      return res.json({ progress: data });
    } else {
      const db = getLocalDb();
      const progress = db.student_progress.find(p => p.student_id === student_id);
      return res.json({ progress: progress || null });
    }
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to fetch student progress.' });
  }
});

// 7. LEADERBOARD (Ranked by XP descending with highest streak)
app.get('/api/leaderboard', async (req, res) => {
  try {
    if (supabase) {
      const { data: users, error } = await supabase.auth.admin.listUsers({ perPage: 100 });
      if (error) throw error;

      let highestStreak = 0;
      let highestHolder = 'No records yet';

      const leaderboard = (users.users || []).map(u => {
        const meta = u.user_metadata || {};
        let streak = meta.best_streak || meta.best_combo || 0;
        if (Array.isArray(meta.attempts)) {
          meta.attempts.forEach(att => {
            if (att.best_combo && att.best_combo > streak) streak = att.best_combo;
          });
        }

        const studentName = meta.student_name || (u.email ? u.email.split('@')[0] : 'Student');
        if (streak > highestStreak) {
          highestStreak = streak;
          highestHolder = studentName;
        }

        return {
          student_id: u.id,
          student_name: studentName,
          total_xp: meta.total_xp || 0,
          best_streak: streak,
          percentage: meta.best_percentage || 0,
          total_attempts: meta.total_attempts || 0
        };
      });

      leaderboard.sort((a, b) => b.total_xp - a.total_xp || b.best_streak - a.best_streak);

      return res.json({
        leaderboard,
        highest_streak: {
          streak: highestStreak,
          holder: highestHolder
        }
      });
    } else {
      const db = getLocalDb();
      const results = db.quiz_results || [];
      return res.json({
        leaderboard: results,
        highest_streak: { streak: 0, holder: 'None yet' }
      });
    }
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.json({ leaderboard: [], highest_streak: { streak: 0, holder: 'No records yet' } });
  }
});

// 8. HEALTH CHECK
app.get('/api/health', async (req, res) => {
  let dbActive = false;
  if (supabase) {
    try {
      const { count, error } = await supabase.from('students').select('*', { count: 'exact', head: true });
      dbActive = !error;
    } catch (e) {
      dbActive = false;
    }
  }

  res.json({
    status: 'ok',
    mode: supabase ? (dbActive ? 'supabase-connected' : 'supabase-error') : 'local-json-storage',
    supabase_configured: Boolean(supabase),
    database_ready: supabase ? dbActive : true,
    timestamp: new Date().toISOString()
  });
});

// 9. SERVE FRONTEND (Explicit root handler and SPA fallback)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`LearnWise × Kraftshala Server running on port ${PORT}`);
    console.log(`Access the application at: http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;

