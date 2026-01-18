# Transcription Agent Deployment Guide (Fly.io)

This guide will help you deploy the LiveKit transcription agent to Fly.io.

## Prerequisites

- A Fly.io account (sign up at https://fly.io/app/sign-up)
- LiveKit credentials (from cloud.livekit.io)
- Deepgram API key (from deepgram.com)
- Convex deployment URL

## Step 1: Install Fly CLI

**macOS/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Windows (PowerShell):**
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

**Verify installation:**
```bash
fly version
```

## Step 2: Login to Fly.io

```bash
fly auth login
```

This will open your browser for authentication.

## Step 3: Deploy the Agent

Navigate to the agent directory:
```bash
cd agent
```

Launch the app (this creates the app and deploys it):
```bash
fly launch --now
```

**When prompted:**
- App name: Press Enter (uses default from fly.toml) or choose your own
- Region: Press Enter (uses default `iad`) or choose closest to you
- Postgres database: **No** (we don't need it)
- Redis database: **No** (we don't need it)

## Step 4: Set Environment Variables

Set all required secrets:
```bash
fly secrets set \
  LIVEKIT_API_KEY="your-livekit-api-key" \
  LIVEKIT_API_SECRET="your-livekit-api-secret" \
  LIVEKIT_URL="wss://your-project.livekit.cloud" \
  DEEPGRAM_API_KEY="your-deepgram-api-key" \
  CONVEX_SITE_URL="https://your-deployment.convex.site" \
  TRANSCRIPTION_SECRET="your-random-secret"
```

**Note:** Use the same `TRANSCRIPTION_SECRET` you set in Convex dashboard.

## Step 5: Verify Deployment

Check if the app is running:
```bash
fly status
```

View logs:
```bash
fly logs
```

You should see logs indicating the agent is ready to connect to rooms.

## Updating the Agent

When you make changes to the agent code:

```bash
cd agent
fly deploy
```

## Monitoring

**View logs in real-time:**
```bash
fly logs -f
```

**Check app status:**
```bash
fly status
```

**SSH into the running machine (for debugging):**
```bash
fly ssh console
```

## Scaling

**The agent auto-scales based on activity:**
- `auto_stop_machines = true` → Stops when no sessions active
- `auto_start_machines = true` → Starts when teacher begins transcription
- `min_machines_running = 0` → Costs $0 when not in use

**To increase resources (if needed):**
```bash
fly scale memory 512  # Increase to 512MB
```

## Costs

**Free tier:** 3 shared-cpu-1x VMs with 256MB RAM
**Paid:** ~$0.0000008/second when running (~$2.50/month if running 24/7)

With auto-scaling, you only pay when teachers are actively transcribing.

## Troubleshooting

**Agent won't start:**
```bash
fly logs
# Look for errors related to missing env vars or connection issues
```

**Check secrets are set:**
```bash
fly secrets list
```

**Redeploy:**
```bash
fly deploy --force
```

**Destroy and recreate:**
```bash
fly apps destroy waitwhat-transcription-agent
fly launch --now
```

## Security Notes

- Never commit `.env` files to git
- Secrets are encrypted at rest in Fly.io
- Use strong random strings for `TRANSCRIPTION_SECRET`
- Rotate secrets periodically:
  ```bash
  fly secrets set TRANSCRIPTION_SECRET="new-secret"
  ```
