<#
.SYNOPSIS
    Pulls and synchronizes the latest changes directly from GitHub without requiring Git CLI.

.DESCRIPTION
    Designed for machines where Git CLI is not installed.
    Queries the GitHub API for the latest commit on branch 'main', compares it with the
    local state, downloads the latest archive from GitHub if new commits exist, and updates
    the local files.

.PARAMETER Force
    Forces re-download and synchronization even if the latest commit SHA matches local state.

.PARAMETER Branch
    Branch to pull from. Defaults to 'main'.

.EXAMPLE
    .\pull.ps1

.EXAMPLE
    .\pull.ps1 -Force
#>
[CmdletBinding()]
param(
    [switch]$Force,
    [string]$Branch = "main",
    [string]$Owner = "night-joe",
    [string]$Repo = "dahmer-archive"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Step {
    param([string]$Text)
    Write-Host ""
    Write-Host "> $Text" -ForegroundColor Cyan
}

function Success {
    param([string]$Text)
    Write-Host ""
    Write-Host "  SUCCESS: $Text" -ForegroundColor Green
    Write-Host ""
}

function Fail {
    param([string]$Text)
    Write-Host ""
    Write-Host "  FAILED: $Text" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Workspace root is the directory containing this script
$targetDir = $PSScriptRoot
if (-not $targetDir) {
    $targetDir = (Get-Location).Path
}

$shaFile = Join-Path $targetDir ".last_synced_sha"
$localSha = ""
if (Test-Path $shaFile) {
    $localSha = (Get-Content $shaFile -Raw).Trim()
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor DarkGray
Write-Host " GitHub Direct Pull (Git-free Fallback Sync) " -ForegroundColor Yellow
Write-Host " Repository : $Owner/$Repo (branch: $Branch)" -ForegroundColor DarkGray
Write-Host " Target Dir : $targetDir" -ForegroundColor DarkGray
if ($localSha) {
    Write-Host " Local SHA  : $($localSha.Substring(0, [Math]::Min(7, $localSha.Length)))" -ForegroundColor DarkGray
}
Write-Host "==========================================================" -ForegroundColor DarkGray

# 1. Fetch latest commit metadata from GitHub API
Step "Checking latest commit on GitHub ($Owner/$Repo on $Branch)..."
$commitApiUrl = "https://api.github.com/repos/$Owner/$Repo/commits/$Branch"
try {
    $commitResponse = Invoke-RestMethod -Uri $commitApiUrl -Method Get -Headers @{ "User-Agent" = "PowerShell-GitHub-Pull" }
    $remoteSha = $commitResponse.sha
    $commitMsg = $commitResponse.commit.message.Split("`n")[0]
    $commitAuthor = $commitResponse.commit.author.name
    $commitDate = $commitResponse.commit.author.date

    $shortSha = $remoteSha.Substring(0, 7)
    Write-Host "  Remote commit : $shortSha - '$commitMsg'" -ForegroundColor White
    Write-Host "  Author / Date : $commitAuthor ($commitDate)" -ForegroundColor DarkGray
}
catch {
    Fail "Could not reach GitHub API: $_"
}

# 2. Check if already up to date
if (-not $Force -and $localSha -and ($localSha -eq $remoteSha)) {
    Success "Workspace is already up to date at commit $shortSha."
    Write-Host "  Use '.\pull.ps1 -Force' if you wish to force re-download all files." -ForegroundColor DarkGray
    Write-Host ""
    exit 0
}

# 3. Download the repository zip archive
$zipUrl = "https://github.com/$Owner/$Repo/archive/refs/heads/$Branch.zip"
$tempZip = Join-Path $env:TEMP "dahmer_archive_pull_$([Guid]::NewGuid().ToString('N')).zip"
$extractDir = Join-Path $env:TEMP "dahmer_archive_pull_$([Guid]::NewGuid().ToString('N'))"

try {
    Step "Downloading latest archive from GitHub..."
    Invoke-WebRequest -Uri $zipUrl -OutFile $tempZip -UseBasicParsing
    
    Step "Extracting archive..."
    Expand-Archive -Path $tempZip -DestinationPath $extractDir -Force
    
    # Locate extracted repo folder (e.g., dahmer-archive-main)
    $extractedFolder = Get-ChildItem -Path $extractDir -Directory | Select-Object -First 1
    if (-not $extractedFolder) {
        Fail "Archive extraction failed or was empty."
    }

    Step "Updating local workspace files..."
    $sourceFiles = Get-ChildItem -Path $extractedFolder.FullName -Recurse -File
    $updatedCount = 0

    foreach ($file in $sourceFiles) {
        $relativePath = $file.FullName.Substring($extractedFolder.FullName.Length).TrimStart('\', '/')
        $destination = Join-Path $targetDir $relativePath
        $destDir = Split-Path -Parent $destination

        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }

        # Check if file has changed by comparing length and content hash
        $needsCopy = $true
        if (Test-Path $destination) {
            if ($file.Length -eq (Get-Item $destination).Length) {
                $srcHash = (Get-FileHash -Path $file.FullName -Algorithm MD5).Hash
                $dstHash = (Get-FileHash -Path $destination -Algorithm MD5).Hash
                if ($srcHash -eq $dstHash) {
                    $needsCopy = $false
                }
            }
        }

        if ($needsCopy) {
            Copy-Item -Path $file.FullName -Destination $destination -Force
            $updatedCount++
            Write-Host "  + Updated: $relativePath" -ForegroundColor Gray
        }
    }

    # Record synced commit SHA locally
    Set-Content -Path $shaFile -Value $remoteSha -Force

    Success "Sync complete! $updatedCount file(s) updated to commit $shortSha ($commitMsg)."
}
finally {
    # Clean up temporary zip and extraction folders
    if (Test-Path $tempZip) { Remove-Item $tempZip -Force -ErrorAction SilentlyContinue }
    if (Test-Path $extractDir) { Remove-Item $extractDir -Recurse -Force -ErrorAction SilentlyContinue }
}
