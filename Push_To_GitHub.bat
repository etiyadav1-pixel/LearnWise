@echo off
setlocal
title Push LearnWise to GitHub

set "PATH=C:\Users\msi\AppData\Local\MinGit\cmd;%PATH%"
cd /d "c:\Users\msi\Desktop\learnWise\learnwise-kraftshala"

echo ========================================================
echo  LearnWise x Kraftshala - Pushing to GitHub
echo  Repository: https://github.com/etiyadav1-pixel/LearnWise.git
echo ========================================================
echo.

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo  SUCCESS! Code pushed to GitHub successfully!
    echo  Next Step: Open vercel.com and import this repository!
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo  If prompted for credentials:
    echo  Username: etiyadav1-pixel
    echo  Password: Use a GitHub Personal Access Token (PAT)
    echo  (Settings -> Developer Settings -> Personal access tokens)
    echo ========================================================
)

echo.
pause
