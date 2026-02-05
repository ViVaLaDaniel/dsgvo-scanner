$ErrorActionPreference = "SilentlyContinue"

Write-Host "AI Team Sync Starting..." -ForegroundColor Cyan

# 1. Check Jules Sessions
Write-Host ""
Write-Host "Checking Jules (Background Agent)..." -ForegroundColor Yellow
$julesStatus = jules remote list --session | Select-Object -First 5
if ($julesStatus) {
    Write-Output $julesStatus
    Write-Host "Tip: Use 'jules remote pull --session <ID>' to apply changes." -ForegroundColor DarkGray
} else {
    Write-Host "No active Jules sessions." -ForegroundColor Gray
}

# 2. Check Local Changes with Gemini
Write-Host ""
Write-Host "Requesting Gemini Quick Review (Active Work)..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "Analyzing changed files..." -ForegroundColor Green
    # Simple logic: Pass the list of changed files to Gemini for a quick sanity check
    # We use a non-interactive prompt here for speed
    $prompt = "I am working on these files. Based on the file names, what should I double check before committing? (Be brief): $gitStatus"
    gemini $prompt
} else {
    Write-Host "No local changes to analyze. You are clean!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Sync Complete." -ForegroundColor Cyan
