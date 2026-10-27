@echo off
title LearnWise x Kraftshala Server
cd /d "%~dp0\learnwise-kraftshala"
echo ========================================================
echo Starting LearnWise x Kraftshala Platform...
echo Access at: http://localhost:3000
echo ========================================================
start "" "http://localhost:3000"
powershell -ExecutionPolicy Bypass -File .\server.ps1
pause

