# Clawdbot Cron Setup: Email Processor

**Created**: 26 January 2026
**Purpose**: Schedule Clawdbot email-processor skill to run every 3 hours

---

## Overview

The Clawdbot email-processor skill needs to run periodically to:
1. Check Email_Raw for unprocessed emails
2. Classify and draft responses
3. Write results to Emails table

Schedule: Every 3 hours (06:00, 09:00, 12:00, 15:00, 18:00, 21:00)

---

## Option A: Clawdbot Native Cron Tool

Clawdbot has a built-in `cron` tool. Configure via WhatsApp or the skill.

### Setup via WhatsApp

Message Clawdbot:

```
Set up a cron job to run /email-processor every 3 hours starting at 06:00
```

### Setup via Skill

Add to `~/ClawdbotFiles/skills/email-processor/SKILL.md`:

```markdown
## Schedule

This skill runs on a schedule:
- Frequency: Every 3 hours
- Start: 06:00
- cron: "0 6,9,12,15,18,21 * * *"
```

Then activate:
```
/email-processor schedule
```

### Verify Cron

```bash
clawdbot cron list
```

Expected output:
```
ID: email-processor-cron
Schedule: 0 6,9,12,15,18,21 * * *
Skill: email-processor
Status: active
```

---

## Option B: System Cron (launchd)

If Clawdbot's cron tool is unreliable, use macOS launchd.

### Create LaunchAgent

File: `~/Library/LaunchAgents/com.mi.clawdbot-email-processor.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.mi.clawdbot-email-processor</string>

    <key>ProgramArguments</key>
    <array>
        <string>/Users/jamesjeram/.npm-global/bin/clawdbot</string>
        <string>run</string>
        <string>email-processor</string>
    </array>

    <key>StartCalendarInterval</key>
    <array>
        <dict><key>Hour</key><integer>6</integer><key>Minute</key><integer>0</integer></dict>
        <dict><key>Hour</key><integer>9</integer><key>Minute</key><integer>0</integer></dict>
        <dict><key>Hour</key><integer>12</integer><key>Minute</key><integer>0</integer></dict>
        <dict><key>Hour</key><integer>15</integer><key>Minute</key><integer>0</integer></dict>
        <dict><key>Hour</key><integer>18</integer><key>Minute</key><integer>0</integer></dict>
        <dict><key>Hour</key><integer>21</key><key>Minute</key><integer>0</integer></dict>
    </array>

    <key>StandardOutPath</key>
    <string>/Users/jamesjeram/Library/Logs/clawdbot/email-processor.log</string>

    <key>StandardErrorPath</key>
    <string>/Users/jamesjeram/Library/Logs/clawdbot/email-processor-error.log</string>

    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:/Users/jamesjeram/.npm-global/bin</string>
    </dict>
</dict>
</plist>
```

### Load LaunchAgent

```bash
# Create log directory
mkdir -p ~/Library/Logs/clawdbot

# Load the job
launchctl load ~/Library/LaunchAgents/com.mi.clawdbot-email-processor.plist

# Verify it's loaded
launchctl list | grep email-processor
```

### Test Manual Run

```bash
# Test that the command works
clawdbot run email-processor
```

### Unload (if needed)

```bash
launchctl unload ~/Library/LaunchAgents/com.mi.clawdbot-email-processor.plist
```

---

## Option C: n8n Schedule Trigger

If Clawdbot cron is problematic, use n8n to trigger via webhook.

### Create n8n Workflow

1. Create workflow: "MI: Clawdbot Email Processor Trigger"
2. Add Schedule Trigger node (every 3h)
3. Add HTTP Request node calling Clawdbot webhook (if available)

Or use the Mac Mini's local webhook:
```
POST http://localhost:18789/run/email-processor
```

This requires Clawdbot to expose a webhook for skill execution.

---

## Verification

After setting up cron:

### Check Schedule Is Active

```bash
# Clawdbot cron
clawdbot cron list

# Or launchd
launchctl list | grep email-processor
```

### Check Logs

```bash
# Clawdbot logs
tail -f ~/Library/Logs/clawdbot/gateway.log

# Or launchd logs
tail -f ~/Library/Logs/clawdbot/email-processor.log
```

### Monitor Airtable

Check Emails table for new records with:
- `processed_by: clawdbot`
- Recent `processed_at` timestamps

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Cron not running | Check `launchctl list` for the job |
| Clawdbot not starting | Check gateway: `launchctl list \| grep clawdbot` |
| No emails processed | Check Email_Raw has unprocessed emails |
| API errors | Check `.env.airtable` and `.env.hubspot` tokens |

---

## Related Files

- Skill: `~/ClawdbotFiles/skills/email-processor/SKILL.md`
- Config: `~/.clawdbot/clawdbot.json`
- Credentials: `~/ClawdbotFiles/.env.airtable`, `~/ClawdbotFiles/.env.hubspot`
- SPEC: `specs/SPEC-014-clawdbot-email-processor.md`

---

*This setup must be done on the Mac Mini where Clawdbot is installed.*
