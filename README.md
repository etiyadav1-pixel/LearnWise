# LearnWise × Kraftshala — Meta Ads Key Metrics MVP

A gamified, interactive learning application teaching foundational **Meta Ads Key Metrics** through active problem-solving, immediate feedback, sequence puzzles, streak tracking, student leaderboards, and diagnostic reporting.

---

## ⚡ Deployment to Vercel (via GitHub)

This repository is optimized for one-click deployment on **Vercel**:

1. **Push to GitHub**:
   - Repository: `https://github.com/etiyadav1-pixel/LearnWise.git`
2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **"Add New..."** → **"Project"**.
   - Select your GitHub repository **`LearnWise`**.
3. **Configure Environment Variables**:
   Under **Environment Variables**, add:
   - `SUPABASE_URL` = `https://crudeeqziwlsdhejyqwz.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = *(your Supabase service role key)*
4. **Deploy**:
   - Click **Deploy**. Vercel will automatically serve the static frontend and route all `/api/*` endpoints via the serverless function in `/api/index.js`!

---

## 🚀 Local Quick Start

### Option 1: Native Windows One-Click Launcher
Double-click [`Start_LearnWise.bat`](Start_LearnWise.bat) or run:
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```
Then open your browser to **http://localhost:3000**!

### Option 2: Node.js Server
```bash
npm start
```
Then open **http://localhost:3000**.

---

## 🎮 Gamification & Features

- **⚡ Experience Points (XP)**: Earn +10 XP for correct answers and +15 XP for mastering the User Journey sequence puzzle.
- **🔥 Consecutive Answer Streak**: Real-time HUD streak counter that increments on every correct answer, and resets with audio/visual feedback when an answer is incorrect.
- **🏆 Live Student Leaderboard**: Ranks students in descending order of XP points scored, highlighting the all-time highest streak across all students and podium badges (🥇 🥈 🥉).
- **🔒 Mandatory Authentication**: Powered by Supabase Auth with unique student name enforcement.
- **🧩 8-Step User Journey Puzzle**: Drag-and-drop or tap-to-match funnel metrics from initial impression to final conversion.
- **📚 Non-Destructive Review**: Revisit weak areas in an isolated modal overlay without altering attempt scores or history.

---

## 📁 Project Structure

```
learnwise-kraftshala/
├── index.html          # SPA Layout (Cover, Intro, Q1-Q11, Explanations, Journey, Report)
├── styles.css          # Design system, animations, Leaderboard & Streak styles
├── app.js              # State machine, question catalog, scoring, Web Audio API
├── api-client.js       # Client wrapper communicating strictly with /api/*
├── api/
│   └── index.js        # Vercel Serverless Function (zero-dependency REST API)
├── vercel.json         # Vercel routing & serverless configuration
├── server.js           # Node.js backend
├── server.ps1          # Native Windows PowerShell server (zero dependencies)
├── schema.sql          # Supabase PostgreSQL schema with RLS and policies
├── test-suite.html     # Automated verification test suite
├── assets/images/      # 27 visual reference mockups
├── .gitignore          # Keeps secrets and node_modules safe
└── .env.example        # Environment variables template
```
