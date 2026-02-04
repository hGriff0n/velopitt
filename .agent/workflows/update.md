---
description: Update GSD to the latest version from GitHub
---

# /update Workflow

<objective>
Update GSD for Antigravity to the latest version from GitHub.
</objective>

<process>

## 1. Check Current Version

**PowerShell:**
```powershell
if (Test-Path "CHANGELOG.md") {
    $version = Select-String -Path "CHANGELOG.md" -Pattern "## \[(\d+\.\d+\.\d+)\]" | 
        Select-Object -First 1
    Write-Output "Current version: $($version.Matches.Groups[1].Value)"
}
```

**Bash:**
```bash
if [ -f "CHANGELOG.md" ]; then
    version=$(grep -oP '## \[\K[0-9]+\.[0-9]+\.[0-9]+' CHANGELOG.md | head -1)
    echo "Current version: $version"
fi
```

---

## 2. Fetch Latest from GitHub

```bash
# Clone latest to temp directory
git clone --depth 1 https://github.com/toonight/get-shit-done-for-antigravity.git .agent/state-update-temp
```

---

## 3. Compare Versions

**PowerShell:**
```powershell
$remoteVersion = Select-String -Path ".gsd-update-temp/CHANGELOG.md" -Pattern "## \[(\d+\.\d+\.\d+)\]" | 
    Select-Object -First 1

Write-Output "Remote version: $($remoteVersion.Matches.Groups[1].Value)"
```

**Bash:**
```bash
remote_version=$(grep -oP '## \[\K[0-9]+\.[0-9]+\.[0-9]+' .agent/state-update-temp/CHANGELOG.md | head -1)
echo "Remote version: $remote_version"
```

**If same version:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► ALREADY UP TO DATE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Version: {version}

No updates available.

───────────────────────────────────────────────────────
```
Exit after cleanup.

---

## 4. Show Changes

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► UPDATE AVAILABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current: {current-version}
Latest:  {remote-version}

Changes:
{Extract from CHANGELOG.md}

───────────────────────────────────────────────────────

Update now?
A) Yes — Apply updates
B) No — Cancel

───────────────────────────────────────────────────────
```

---

## 5. Apply Updates

**If user confirms:**

**PowerShell:**
```powershell
# Backup current
Copy-Item -Recurse ".agent" ".agent.backup"
Copy-Item -Recurse ".agent/state/templates" ".agent/state/templates.backup"

# Update workflows and skills (preserve user's .agent/state docs)
Copy-Item -Recurse -Force ".gsd-update-temp/.agent/*" ".agent/"

# Update templates only
Copy-Item -Recurse -Force ".gsd-update-temp/.agent/state/templates/*" ".agent/state/templates/"

# Update root files
Copy-Item -Force ".gsd-update-temp/GSD-STYLE.md" "./"
Copy-Item -Force ".gsd-update-temp/CHANGELOG.md" "./"
```

**Bash:**
```bash
# Backup current
cp -r .agent .agent.backup
cp -r .agent/state/templates .agent/state/templates.backup

# Update workflows and skills (preserve user's .agent/state docs)
cp -r .agent/state-update-temp/.agent/* .agent/

# Update templates only
cp -r .agent/state-update-temp/.agent/state/templates/* .agent/state/templates/

# Update root files
cp .agent/state-update-temp/GSD-STYLE.md ./
cp .agent/state-update-temp/CHANGELOG.md ./
```

---

## 6. Cleanup

**PowerShell:**
```powershell
Remove-Item -Recurse -Force ".gsd-update-temp"
Remove-Item -Recurse -Force ".agent.backup"
Remove-Item -Recurse -Force ".agent/state/templates.backup"
```

**Bash:**
```bash
rm -rf .agent/state-update-temp
rm -rf .agent.backup
rm -rf .agent/state/templates.backup
```

---

## 7. Confirm

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► UPDATED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Updated to version {remote-version}

───────────────────────────────────────────────────────

/whats-new — See what changed

───────────────────────────────────────────────────────
```

</process>

<preserved_files>
These user files are NEVER overwritten:
- .agent/state/SPEC.md
- .agent/state/ROADMAP.md
- .agent/state/STATE.md
- .agent/state/ARCHITECTURE.md
- .agent/state/STACK.md
- .agent/state/DECISIONS.md
- .agent/state/JOURNAL.md
- .agent/state/TODO.md
- .agent/state/phases/*
- .gemini/GEMINI.md
</preserved_files>

