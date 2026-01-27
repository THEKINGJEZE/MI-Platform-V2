# Codex Remediation Plan - 26 January 2026

## Scope
Critical + High findings from the initial audit:
- **Critical**: `clawdbot/config/identity/device.json` contains a private key and is tracked in git.
- **High**: `clawdbot/config/exec-approvals.json` is tracked and contains a socket token + full command history.

---

## 1) Remove device.json private key from git history
**Priority**: P0 (same day)  
**Owner**: Repo maintainer  
**Impact if delayed**: Private key remains exposed in history; compromise persists even if file is deleted.

### Option A - git filter-repo (recommended)
1. Announce a **history rewrite** to collaborators; pause merges.
2. Backup the repo (offsite or separate clone).
3. Run:
   ```bash
   git filter-repo --path clawdbot/config/identity/device.json --invert-paths
   ```
4. Force-push rewritten history:
   ```bash
   git push --force --all
   git push --force --tags
   ```
5. Require collaborators to **re-clone** or hard-reset to new history.

### Option B - BFG Repo-Cleaner
1. Create a mirror clone:
   ```bash
   git clone --mirror <repo-url>
   ```
2. Run BFG:
   ```bash
   java -jar bfg.jar --delete-files device.json
   ```
3. Clean/repack:
   ```bash
   git reflog expire --expire=now --all && git gc --prune=now --aggressive
   ```
4. Force-push mirror:
   ```bash
   git push --force --all
   git push --force --tags
   ```

**Verification**
- `git log -p --all -S "privateKeyPem"` returns no matches.
- `git ls-files clawdbot/config/identity/device.json` returns nothing.

---

## 2) Rotate the device keypair
**Priority**: P0 (same day, immediately after history rewrite)  
**Owner**: Clawdbot operator  
**Impact if delayed**: Exposed key remains valid and usable.

### Steps
1. Revoke or invalidate the existing device identity (per Clawdbot identity process).
2. Generate a **new** device keypair using Clawdbot's official bootstrap tooling.
3. Confirm the new `device.json` is **only** present in runtime storage and is git-ignored.
4. Re-authenticate dependent services if device identity is required for signing or auth.

**Verification**
- New keypair is active; old keypair is invalidated.
- Clawdbot auth flows still function.

---

## 3) Update .gitignore to prevent future tracking
**Priority**: P0 (same day, before new keypair is generated)  
**Owner**: Repo maintainer  
**Impact if delayed**: Newly generated key may be accidentally committed.

### Required entry (root and Clawdbot ignore)
Add to `.gitignore` and `clawdbot/.gitignore`:
```
clawdbot/config/identity/device.json
```

**Verification**
- `git status -s` shows no staged changes for `device.json` after regeneration.

---

## 4) Exec approvals: split tracked allowlist from runtime state
**Priority**: P1 (this week)  
**Owner**: Clawdbot operator + repo maintainer  
**Impact if delayed**: Tokens and command histories remain exposed in repo.

### Recommended model
- **Tracked**: `exec-allowlist.json`
  - Contains only command patterns and descriptions.
  - **No** tokens, timestamps, resolved paths, or `lastUsedCommand`.
- **Runtime**: `exec-approvals.runtime.json`
  - Contains tokens, lastUsedAt, lastUsedCommand, resolved paths.
  - Stored outside repo or in ignored path.

### Steps
1. Create `exec-allowlist.json` from current `allowlist` entries (remove runtime fields).
2. Move socket token + `lastUsed*` fields into runtime file.
3. Update Clawdbot to read:
   - allowlist from tracked file
   - runtime state from ignored file
4. Ignore runtime file in git:
   ```
   clawdbot/config/exec-approvals.runtime.json
   ```
5. Consider ignoring `clawdbot/config/exec-approvals.json` entirely if it remains runtime-only.

**Verification**
- No tokens or webhook URLs appear in tracked files.
- Allowlist enforcement still works.

---

## 5) Timeline & Priority Summary
- **P0 (same day)**
  - Rewrite git history to remove device.json.
  - Rotate device keypair immediately after rewrite.
  - Add gitignore entry to prevent re-tracking.
- **P1 (this week)**
  - Split exec approvals into tracked allowlist + runtime state.
  - Remove tokens and command history from repo.
- **P2 (next 2 weeks)**
  - Tighten exec allowlist to domain-restricted wrappers only; require approvals for raw `curl`.
  - Re-run secret scans and confirm git history is clean.

---

## Post-Remediation Verification Checklist
- [ ] `git log -p --all -S "privateKeyPem"` returns no results
- [ ] `git ls-files clawdbot/config/identity/device.json` returns nothing
- [ ] Tracked files contain no exec approval tokens or webhook URLs
- [ ] New device identity works and is not tracked
- [ ] Clawdbot allowlist still enforces restricted execution
