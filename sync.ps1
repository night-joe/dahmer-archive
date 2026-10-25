<#
.SYNOPSIS
    Commit local work, rebase onto origin, and push - in one command.

.DESCRIPTION
    Built for the same repository living on more than one machine.

        Desktop:  .\sync.ps1 "added victim timeline notes"
        Laptop:   .\sync.ps1 "started chapter 4"

    What it does, in order:
      1. Stages everything (git add -A) and commits it, if anything changed.
      2. Fetches origin.
      3. Rebases your local commits on top of origin, stashing any stray edits.
      4. Pushes.

    If step 3 hits a conflict it stops, tells you how to resolve or abort,
    and does NOT push. Nothing is ever thrown away.

.PARAMETER Message
    Commit message. Defaults to "sync <hostname> <timestamp>".
    Ignored when there is nothing to commit.

.PARAMETER NoPush
    Commit locally only; skip fetch, rebase and push.

.EXAMPLE
    .\sync.ps1 "fix broken image links in overview.html"

.EXAMPLE
    .\sync.ps1
    Commits with a generated message, then syncs.

.EXAMPLE
    .\sync.ps1 -NoPush "work in progress"
    Park the work in a local commit without touching GitHub.
#>
[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Message,

    [switch]$NoPush
)

function Fail {
    param([string]$Text)
    Write-Host ""
    Write-Host "  FAILED: $Text" -ForegroundColor Red
    Write-Host ""
    exit 1
}

function Step {
    param([string]$Text)
    Write-Host ""
    Write-Host "> $Text" -ForegroundColor Cyan
}

# --- Locate the repository -------------------------------------------------
$root = & git rev-parse --show-toplevel 2>$null
if ($LASTEXITCODE -ne 0 -or -not $root) {
    Fail "Not inside a git repository."
}
$root = $root.Trim()
Push-Location $root

try {
    $branch = (& git rev-parse --abbrev-ref HEAD).Trim()
    if ($LASTEXITCODE -ne 0 -or -not $branch) {
        Fail "Could not determine the current branch."
    }
    if ($branch -eq 'HEAD') {
        Fail "You are in a detached HEAD state. Check out a branch first: git switch main"
    }

    $upstream = & git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $upstream) {
        $upstream = ''
    }
    else {
        $upstream = $upstream.Trim()
    }

    Write-Host ""
    Write-Host "  repo:   $root" -ForegroundColor DarkGray
    Write-Host "  branch: $branch" -ForegroundColor DarkGray
    if ($upstream) {
        Write-Host "  remote: $upstream" -ForegroundColor DarkGray
    }

    # --- 1. Stage and commit ----------------------------------------------
    Step "Staging changes"
    & git add -A
    if ($LASTEXITCODE -ne 0) { Fail "git add failed." }

    $staged = & git diff --cached --name-only
    if ($staged) {
        if (-not $Message) {
            $Message = "sync $env:COMPUTERNAME $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        }

        $fileCount = @($staged).Count
        Step "Committing $fileCount file(s)"
        & git commit -m $Message
        if ($LASTEXITCODE -ne 0) { Fail "git commit failed." }
    }
    else {
        Write-Host "  nothing to commit - working tree is clean" -ForegroundColor DarkGray
    }

    if ($NoPush) {
        Step "Skipping push (-NoPush)"
    }
    else {
        # --- 2. Fetch ------------------------------------------------------
        Step "Fetching origin"
        & git fetch origin
        if ($LASTEXITCODE -ne 0) {
            Fail "git fetch failed. Check your network connection, or your GitHub credentials."
        }

        # --- 3. Rebase onto origin ----------------------------------------
        if ($upstream) {
            Step "Rebasing onto $upstream"
        }
        else {
            Step "No upstream yet - this branch will be published on push"
        }

        & git pull --rebase --autostash origin $branch
        if ($LASTEXITCODE -ne 0) {
            $rebaseDir = (& git rev-parse --git-path rebase-merge 2>$null)
            $inRebase = $false
            if ($rebaseDir) {
                $inRebase = Test-Path ($rebaseDir.Trim())
            }

            if ($inRebase) {
                Write-Host ""
                Write-Host "  Rebase stopped on a conflict." -ForegroundColor Yellow
                Write-Host "  Both machines changed the same lines. Nothing was pushed." -ForegroundColor Yellow
                Write-Host ""
                Write-Host "  Fix the marked files, then:" -ForegroundColor Yellow
                Write-Host "      git add -A" -ForegroundColor White
                Write-Host "      git rebase --continue" -ForegroundColor White
                Write-Host "      git push" -ForegroundColor White
                Write-Host ""
                Write-Host "  Or back out completely and keep your work as it was:" -ForegroundColor Yellow
                Write-Host "      git rebase --abort" -ForegroundColor White
                Write-Host ""
                exit 1
            }

            Fail "git pull --rebase failed. Nothing was pushed."
        }

        # --- 4. Push -------------------------------------------------------
        if ($upstream) {
            Step "Pushing to $upstream"
            & git push
        }
        else {
            Step "Publishing branch $branch"
            & git push -u origin $branch
        }
        if ($LASTEXITCODE -ne 0) { Fail "git push failed. Your commits are safe locally." }
    }

    # --- Summary -----------------------------------------------------------
    Step "Done"
    & git --no-pager log --oneline -1
    & git status -sb
    Write-Host ""
}
finally {
    Pop-Location
}
