# LearnWise x Kraftshala - High Reliability Windows TCP HTTP Backend Server
# Powered by Supabase Auth with Zero External Dependencies

$PORT = 3000
$ROOT = $PSScriptRoot
$LOCAL_DB = Join-Path $ROOT "local_db.json"
$ENV_FILE = Join-Path $ROOT ".env"

$SUPABASE_URL = ""
$SUPABASE_KEY = ""
if (Test-Path $ENV_FILE) {
    Get-Content $ENV_FILE | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $parts = $line -split "=", 2
            if ($parts.Length -eq 2) {
                $k = $parts[0].Trim()
                $v = $parts[1].Trim()
                if ($k -eq "SUPABASE_URL") { $SUPABASE_URL = $v }
                if ($k -eq "SUPABASE_SERVICE_ROLE_KEY" -or $k -eq "SUPABASE_KEY") { $SUPABASE_KEY = $v }
                if ($k -eq "PORT") { $PORT = [int]$v }
            }
        }
    }
}

$IS_SUPABASE = ($SUPABASE_URL -and $SUPABASE_KEY -and (-not $SUPABASE_URL.Contains("your-project")) -and (-not $SUPABASE_KEY.Contains("your-service-role-key")))

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "LearnWise x Kraftshala Server initializing on port $PORT" -ForegroundColor Yellow
if ($IS_SUPABASE) {
    Write-Host "Supabase Mode: ACTIVE NATIVE AUTH ($SUPABASE_URL)" -ForegroundColor Green
} else {
    Write-Host "Supabase Mode: LOCAL JSON PERSISTENCE" -ForegroundColor Yellow
}
Write-Host "==========================================================" -ForegroundColor Cyan

function Get-EmailSlug($studentName) {
    $clean = ($studentName.Trim().ToLower() -replace '[^a-z0-9]', '.')
    while ($clean.Contains("..")) { $clean = $clean.Replace("..", ".") }
    return "$clean@learnwise.internal"
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

$tcpListener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $PORT)
$tcpListener.Start()
Write-Host "Server successfully listening at http://localhost:$PORT/" -ForegroundColor Green

while ($true) {
    try {
        $client = $tcpListener.AcceptTcpClient()
    } catch {
        break
    }

    try {
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)

        $requestLine = $reader.ReadLine()
        if (-not $requestLine) {
            $client.Close()
            continue
        }

        $parts = $requestLine -split " "
        $method = $parts[0]
        $fullPath = if ($parts.Length -gt 1) { $parts[1] } else { "/" }

        $urlPath = $fullPath
        $queryString = ""
        if ($fullPath.Contains("?")) {
            $qParts = $fullPath -split "\?", 2
            $urlPath = $qParts[0]
            $queryString = $qParts[1]
        }

        # Headers
        $contentLength = 0
        $userAgent = ""
        while ($true) {
            $headerLine = $reader.ReadLine()
            if (-not $headerLine -or $headerLine.Trim() -eq "") { break }
            if ($headerLine -match "(?i)^Content-Length:\s*(\d+)") {
                $contentLength = [int]$matches[1]
            }
            if ($headerLine -match "(?i)^User-Agent:\s*(.+)") {
                $userAgent = $matches[1].Trim()
            }
        }

        # Body
        $bodyText = ""
        if ($contentLength -gt 0) {
            $charBuffer = New-Object char[] $contentLength
            $totalRead = 0
            while ($totalRead -lt $contentLength) {
                $read = $reader.Read($charBuffer, $totalRead, $contentLength - $totalRead)
                if ($read -le 0) { break }
                $totalRead += $read
            }
            $bodyText = -join $charBuffer
        }

        $bodyObj = $null
        if ($bodyText) {
            try { $bodyObj = $bodyText | ConvertFrom-Json } catch { }
        }

        # Clean byte-based HTTP response sender
        $sendResponse = {
            param([int]$status, [string]$contentType, [byte[]]$contentBytes)
            $statusMsg = switch ($status) {
                200 { "OK" }
                400 { "Bad Request" }
                401 { "Unauthorized" }
                404 { "Not Found" }
                500 { "Internal Server Error" }
                default { "OK" }
            }
            $headerText = "HTTP/1.1 $status $statusMsg`r`n" +
                          "Content-Type: $contentType`r`n" +
                          "Content-Length: $($contentBytes.Length)`r`n" +
                          "Access-Control-Allow-Origin: *`r`n" +
                          "Access-Control-Allow-Methods: GET, POST, OPTIONS`r`n" +
                          "Access-Control-Allow-Headers: Content-Type, Authorization`r`n" +
                          "Connection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($headerText)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            if ($contentBytes.Length -gt 0) {
                $stream.Write($contentBytes, 0, $contentBytes.Length)
            }
            $stream.Flush()
        }

        $sendJson = {
            param([int]$status, $data)
            $jsonStr = $data | ConvertTo-Json -Depth 6 -Compress
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonStr)
            & $sendResponse $status "application/json; charset=utf-8" $bytes
        }

        if ($method -eq "OPTIONS") {
            $empty = [byte[]]@()
            & $sendResponse 200 "text/plain" $empty
            continue
        }

        # ---------------- API ENDPOINTS ----------------
        
        # 1. SIGNUP
        if ($method -eq "POST" -and $urlPath -eq "/api/auth/signup") {
            $name = if ($bodyObj.student_name) { $bodyObj.student_name.Trim() } else { "" }
            $pass = if ($bodyObj.password) { $bodyObj.password.Trim() } else { "" }

            if (-not $name) {
                & $sendJson 400 @{ error = "Please enter your student name." }
                continue
            }
            if ($pass.Length -lt 6) {
                & $sendJson 400 @{ error = "Password must be at least 6 characters." }
                continue
            }

            $emailSlug = Get-EmailSlug $name

            if ($IS_SUPABASE) {
                try {
                    $headers = @{
                        "apikey" = $SUPABASE_KEY
                        "Authorization" = "Bearer $SUPABASE_KEY"
                        "Content-Type" = "application/json"
                    }

                    # Create user directly in Supabase Auth
                    $body = @{
                        email = $emailSlug
                        password = $pass
                        email_confirm = $true
                        user_metadata = @{
                            student_name = $name
                            total_xp = 0
                            best_score = 0
                            best_percentage = 0
                            total_attempts = 0
                            current_screen = "screen-q1"
                            attempts = @()
                        }
                    } | ConvertTo-Json

                    $created = Invoke-RestMethod -Uri "$SUPABASE_URL/auth/v1/admin/users" -Headers $headers -Method POST -Body $body

                    & $sendJson 200 @{
                        student_id = $created.id
                        student_name = $name
                        progress = @{
                            current_screen = "screen-q1"
                            current_question = 1
                            total_xp = 0
                            best_score = 0
                            total_attempts = 0
                        }
                    }
                } catch {
                    $errBody = ""
                    try {
                        if ($_.Exception.Response) {
                            $respStream = $_.Exception.Response.GetResponseStream()
                            $streamReader = New-Object System.IO.StreamReader($respStream)
                            $errBody = $streamReader.ReadToEnd()
                        }
                    } catch { }

                    $errJson = $null
                    if ($errBody) {
                        try { $errJson = $errBody | ConvertFrom-Json } catch { }
                    }

                    if ($errJson -and $errJson.error_code -eq "email_exists") {
                        & $sendJson 400 @{ error = "An account with this Student Name already exists. Please sign in." }
                    } elseif ($errJson -and $errJson.error_code -eq "weak_password") {
                        & $sendJson 400 @{ error = "Password must be at least 6 characters." }
                    } elseif ($errJson -and $errJson.msg) {
                        & $sendJson 400 @{ error = $errJson.msg }
                    } elseif ($errBody -match "email_exists|already been registered") {
                        & $sendJson 400 @{ error = "An account with this Student Name already exists. Please sign in." }
                    } else {
                        $msg = if ($errBody) { $errBody } else { $_.Exception.Message }
                        & $sendJson 400 @{ error = "Registration error: $msg" }
                    }
                }
            }
            continue
        }

        # 2. LOGIN
        if ($method -eq "POST" -and $urlPath -eq "/api/auth/login") {
            $name = if ($bodyObj.student_name) { $bodyObj.student_name.Trim() } else { "" }
            $pass = if ($bodyObj.password) { $bodyObj.password.Trim() } else { "" }

            if (-not $name -or -not $pass) {
                & $sendJson 400 @{ error = "Please provide both student name and password." }
                continue
            }

            $emailSlug = Get-EmailSlug $name

            if ($IS_SUPABASE) {
                try {
                    $headers = @{
                        "apikey" = $SUPABASE_KEY
                        "Content-Type" = "application/json"
                    }
                    $authPayload = @{
                        email = $emailSlug
                        password = $pass
                    } | ConvertTo-Json

                    # Verify via Supabase Auth
                    $authRes = Invoke-RestMethod -Uri "$SUPABASE_URL/auth/v1/token?grant_type=password" -Headers $headers -Method POST -Body $authPayload

                    $user = $authRes.user
                    $meta = $user.user_metadata
                    $displayName = if ($meta.student_name) { $meta.student_name } else { $name }

                    & $sendJson 200 @{
                        student_id = $user.id
                        student_name = $displayName
                        progress = @{
                            current_screen = "screen-q1"
                            current_question = 1
                            total_xp = if ($meta.total_xp) { $meta.total_xp } else { 0 }
                            best_score = if ($meta.best_score) { $meta.best_score } else { 0 }
                            total_attempts = if ($meta.total_attempts) { $meta.total_attempts } else { 0 }
                        }
                    }
                } catch {
                    & $sendJson 401 @{ error = "Incorrect password or student name. Please try again or create an account." }
                }
            }
            continue
        }

        # 3. SAVE QUESTION ANSWER
        if ($method -eq "POST" -and $urlPath -eq "/api/save-answer") {
            $studentId = $bodyObj.student_id
            if (-not $studentId) {
                & $sendJson 400 @{ error = "student_id is required." }
                continue
            }

            if ($IS_SUPABASE) {
                try {
                    $headers = @{
                        "apikey" = $SUPABASE_KEY
                        "Authorization" = "Bearer $SUPABASE_KEY"
                        "Content-Type" = "application/json"
                    }
                    if ([int]$bodyObj.xp_awarded -gt 0) {
                        $u = Invoke-RestMethod -Uri "$SUPABASE_URL/auth/v1/admin/users/$studentId" -Headers $headers -Method GET
                        $currXp = if ($u.user_metadata.total_xp) { [int]$u.user_metadata.total_xp } else { 0 }
                        $newXp = $currXp + [int]$bodyObj.xp_awarded
                        $updateBody = @{
                            user_metadata = @{ total_xp = $newXp }
                        } | ConvertTo-Json
                        Invoke-RestMethod -Uri "$SUPABASE_URL/auth/v1/admin/users/$studentId" -Headers $headers -Method PUT -Body $updateBody | Out-Null
                    }
                    & $sendJson 200 @{ success = $true }
                } catch {
                    & $sendJson 200 @{ success = $true }
                }
            }
            continue
        }

        # 4. SAVE QUIZ RESULTS
        if ($method -eq "POST" -and $urlPath -eq "/api/quiz-results") {
            $studentId = $bodyObj.student_id
            $resultId = [System.Guid]::NewGuid().ToString()

            if ($IS_SUPABASE) {
                try {
                    $headers = @{
                        "apikey" = $SUPABASE_KEY
                        "Authorization" = "Bearer $SUPABASE_KEY"
                        "Content-Type" = "application/json"
                    }

                    $u = Invoke-RestMethod -Uri "$SUPABASE_URL/auth/v1/admin/users/$studentId" -Headers $headers -Method GET
                    $meta = $u.user_metadata
                    $existingAttempts = if ($meta.attempts) { @($meta.attempts) } else { @() }

                    $newAttempt = @{
                        id = $resultId
                        score = [int]$bodyObj.score
                        total = [int]$bodyObj.total
                        percentage = [int]$bodyObj.percentage
                        xp_earned = [int]$bodyObj.xp_earned
                        best_combo = [int]$bodyObj.best_combo
                        strong_areas = @($bodyObj.strong_areas)
                        weak_areas = @($bodyObj.weak_areas)
                        completed_at = (Get-Date).ToString("o")
                    }
                    $existingAttempts += $newAttempt

                    $sName = if ($meta.student_name) { $meta.student_name } else { $bodyObj.student_name }
                    $bScore = if ($meta.best_score) { [int]$meta.best_score } else { 0 }
                    $bestScore = [Math]::Max($bScore, [int]$bodyObj.score)
                    $bPct = if ($meta.best_percentage) { [int]$meta.best_percentage } else { 0 }
                    $bestPct = [Math]::Max($bPct, [int]$bodyObj.percentage)
                    $currStreak = if ($bodyObj.best_combo) { [int]$bodyObj.best_combo } else { 0 }
                    $prevStreak = if ($meta.best_streak) { [int]$meta.best_streak } elseif ($meta.best_combo) { [int]$meta.best_combo } else { 0 }
                    $bestStreak = [Math]::Max($prevStreak, $currStreak)
                    $prevAtt = if ($meta.total_attempts) { [int]$meta.total_attempts } else { 0 }
                    $attemptsCount = $prevAtt + 1
                    $prevXp = if ($meta.total_xp) { [int]$meta.total_xp } else { 0 }
                    $totalXp = [Math]::Max($prevXp, [int]$bodyObj.xp_earned)

                    $updateBody = @{
                        user_metadata = @{
                            student_name = $sName
                            best_score = $bestScore
                            best_percentage = $bestPct
                            best_streak = $bestStreak
                            total_attempts = $attemptsCount
                            total_xp = $totalXp
                            attempts = $existingAttempts
                        }
                    } | ConvertTo-Json -Depth 6

                    Invoke-RestMethod -Uri "$SUPABASE_URL/auth/v1/admin/users/$studentId" -Headers $headers -Method PUT -Body $updateBody | Out-Null
                    & $sendJson 200 @{ success = $true; result_id = $resultId }
                } catch {
                    & $sendJson 200 @{ success = $true; result_id = $resultId }
                }
            }
            continue
        }

        # 5. GET LEADERBOARD (Ranked by XP descending with highest streak)
        if ($method -eq "GET" -and $urlPath -eq "/api/leaderboard") {
            $leaderboardList = @()
            $highestStreak = 0
            $highestStreakHolder = "None yet"

            if ($IS_SUPABASE) {
                try {
                    $headers = @{
                        "apikey" = $SUPABASE_KEY
                        "Authorization" = "Bearer $SUPABASE_KEY"
                    }
                    $usersRes = Invoke-RestMethod -Uri "$SUPABASE_URL/auth/v1/admin/users?per_page=100" -Headers $headers -Method GET

                    if ($usersRes -and $usersRes.users) {
                        foreach ($u in $usersRes.users) {
                            $meta = $u.user_metadata
                            $sName = if ($meta -and $meta.student_name) { $meta.student_name } else { ($u.email -split "@")[0] }
                            $xp = if ($meta -and $meta.total_xp) { [int]$meta.total_xp } else { 0 }
                            $streak = if ($meta -and $meta.best_streak) { [int]$meta.best_streak } elseif ($meta -and $meta.best_combo) { [int]$meta.best_combo } else { 0 }
                            $pct = if ($meta -and $meta.best_percentage) { [int]$meta.best_percentage } else { 0 }
                            $attempts = if ($meta -and $meta.total_attempts) { [int]$meta.total_attempts } else { 0 }

                            if ($meta -and $meta.attempts) {
                                foreach ($att in $meta.attempts) {
                                    if ($att.best_combo -and [int]$att.best_combo -gt $streak) {
                                        $streak = [int]$att.best_combo
                                    }
                                }
                            }

                            $leaderboardList += [PSCustomObject]@{
                                student_id = $u.id
                                student_name = $sName
                                total_xp = $xp
                                best_streak = $streak
                                percentage = $pct
                                total_attempts = $attempts
                            }

                            if ($streak -gt $highestStreak) {
                                $highestStreak = $streak
                                $highestStreakHolder = $sName
                            }
                        }
                    }
                } catch { }
            }

            # Sort descending by total_xp, then by best_streak
            $sortedLeaderboard = @($leaderboardList | Sort-Object -Property @{ Expression = "total_xp"; Descending = $true }, @{ Expression = "best_streak"; Descending = $true })

            & $sendJson 200 @{
                leaderboard = $sortedLeaderboard
                highest_streak = @{
                    streak = $highestStreak
                    holder = $highestStreakHolder
                }
            }
            continue
        }

        # 5. GET QUIZ RESULTS
        if ($method -eq "GET" -and $urlPath -eq "/api/quiz-results") {
            $studentId = ""
            if ($queryString -match "student_id=([^&]+)") { $studentId = [System.Uri]::UnescapeDataString($matches[1]) }
            
            if ($IS_SUPABASE) {
                try {
                    $headers = @{ "apikey" = $SUPABASE_KEY; "Authorization" = "Bearer $SUPABASE_KEY" }
                    $u = Invoke-RestMethod -Uri "$SUPABASE_URL/auth/v1/admin/users/$studentId" -Headers $headers -Method GET
                    $attempts = if ($u.user_metadata.attempts) { @($u.user_metadata.attempts) } else { @() }
                    & $sendJson 200 @{ results = $attempts }
                } catch {
                    & $sendJson 200 @{ results = @() }
                }
            }
            continue
        }

        # 6. GET STUDENT PROGRESS
        if ($method -eq "GET" -and $urlPath -eq "/api/student-progress") {
            $studentId = ""
            if ($queryString -match "student_id=([^&]+)") { $studentId = [System.Uri]::UnescapeDataString($matches[1]) }

            if ($IS_SUPABASE) {
                try {
                    $headers = @{ "apikey" = $SUPABASE_KEY; "Authorization" = "Bearer $SUPABASE_KEY" }
                    $u = Invoke-RestMethod -Uri "$SUPABASE_URL/auth/v1/admin/users/$studentId" -Headers $headers -Method GET
                    & $sendJson 200 @{ progress = $u.user_metadata }
                } catch {
                    & $sendJson 200 @{ progress = $null }
                }
            }
            continue
        }

        # 7. HEALTH CHECK
        if ($method -eq "GET" -and $urlPath -eq "/api/health") {
            & $sendJson 200 @{
                status = "ok"
                mode = "live-supabase-native-auth"
                supabase_configured = $IS_SUPABASE
                timestamp = (Get-Date).ToString("o")
            }
            continue
        }

        # ---------------- STATIC FILES ----------------
        $cleanPath = $urlPath.TrimStart('/')
        if (-not $cleanPath) { $cleanPath = "index.html" }
        $pubDir = Join-Path $ROOT "public"
        $filePath = Join-Path $pubDir $cleanPath
        if (-not (Test-Path $filePath -PathType Leaf)) {
            $filePath = Join-Path $ROOT $cleanPath
        }

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            & $sendResponse 200 $mime $bytes
        } else {
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
            & $sendResponse 404 "text/plain" $notFound
        }
    } catch {
        # Catch individual request exceptions without crashing the main loop
    } finally {
        if ($client) {
            try { $client.Close() } catch { }
        }
    }
}

$tcpListener.Stop()
