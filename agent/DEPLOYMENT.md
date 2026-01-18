# Transcription Agent Deployment Guide (Fly.io)

This guide will help you deploy the LiveKit transcription agent to Fly.io with **automatic GitHub deployments**.

## Deployment Methods

**🚀 Recommended: Automatic GitHub Deployments** (see below)
- Deploys automatically when you push changes to `agent/` directory
- No manual deployment needed after initial setup

**🔧 Manual Deployment** (see "Manual Deployment" section)
- Deploy manually from your local machine
- Useful for testing before pushing to GitHub

---

## Prerequisites

- A Fly.io account (sign up at https://fly.io/app/sign-up)
- GitHub repository with this code
- LiveKit credentials (from cloud.livekit.io)
- Deepgram API key (from deepgram.com)
- Convex deployment URL

---

## 🚀 Automatic GitHub Deployment Setup

This is the recommended setup for production. Once configured, the agent automatically deploys when you push changes to the `agent/` directory on the `main` branch.

### Step 1: Install Fly CLI Locally

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

### Step 2: Login to Fly.io

```bash
fly auth login
```

This will open your browser for authentication.

### Step 3: Create the Fly.io App (One-Time)

Navigate to the agent directory:
```bash
cd agent
```

Launch the app (this creates the app, but we'll deploy via GitHub later):
```bash
fly launch --no-deploy
```

**When prompted:**
- App name: Press Enter (uses default from fly.toml) or choose your own
- Region: Press Enter (uses default `iad`) or choose closest to you
- Postgres database: **No** (we don't need it)
- Redis database: **No** (we don't need it)

**Important:** Note the app name that was created (shown in output).

### Step 4: Set Environment Variables in Fly.io

Set all required secrets (these persist across deployments):
```bash
fly secrets set \
  LIVEKIT_API_KEY="your-livekit-api-key" \
  LIVEKIT_API_SECRET="your-livekit-api-secret" \
  LIVEKIT_URL="wss://your-project.livekit.cloud" \
  DEEPGRAM_API_KEY="your-deepgram-api-key" \
  CONVEX_SITE_URL="https://your-deployment.convex.site" \
  TRANSCRIPTION_SECRET="your-random-secret"
```

**Where to get these values:**
- **LIVEKIT_API_KEY/SECRET/URL:** https://cloud.livekit.io → Your Project → Settings → Keys
- **DEEPGRAM_API_KEY:** https://console.deepgram.com/ → API Keys
- **CONVEX_SITE_URL:** Your **production** Convex deployment URL
  - Run `npx convex deploy` first if you haven't already
  - Then run `npx convex dashboard` and copy the "Deployment URL" (looks like `https://happy-animal-123.convex.site`)
  - **Important:** Use production URL, not dev URL (which ends in `.convex.cloud`)
- **TRANSCRIPTION_SECRET:** Use the same random string you set in Convex dashboard

**To generate a random secret:**
```bash
openssl rand -hex 32
```

**Note:** Use the same `TRANSCRIPTION_SECRET` you set in Convex dashboard.

### Step 5: Get Fly.io Deploy Token

Generate a deploy token for GitHub Actions:
```bash
fly tokens create deploy -x 999999h
```

This creates a token that never expires. **Copy the token** - you'll need it in the next step.

### Step 6: Add Deploy Token to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `FLY_API_TOKEN`
5. Value: Paste the token from Step 5
6. Click **Add secret**

### Step 7: Trigger First Deployment

**Option A: Push to main (recommended)**
```bash
git add .
git commit -m "Set up automatic Fly.io deployments"
git push origin main
```

**Option B: Manual trigger**
1. Go to GitHub → Actions tab
2. Select "Deploy Transcription Agent to Fly.io"
3. Click "Run workflow" → "Run workflow"

### Step 8: Verify Deployment

**Check GitHub Actions:**
1. Go to GitHub → Actions tab
2. You should see "Deploy Transcription Agent to Fly.io" running
3. Click on it to see deployment progress

**Check Fly.io:**
```bash
fly status
```

**View logs:**
```bash
fly logs
```

You should see logs indicating the agent is ready to connect to rooms.

---

## 🎉 You're Done!

From now on, whenever you push changes to the `agent/` directory on the `main` branch, GitHub Actions will automatically deploy to Fly.io.

**What triggers automatic deployment:**
- Changes to files in `agent/` directory
- Changes to `.github/workflows/deploy-agent.yml`
- Manual trigger via GitHub Actions UI

**What doesn't trigger deployment:**
- Changes outside `agent/` directory
- Pushes to non-main branches (create a PR and merge to main)

---

## Monitoring

**View logs in real-time:**
```bash
fly logs -f
```

**Check app status:**
```bash
fly status
```

**View deployment history on GitHub:**
- Go to GitHub → Actions tab
- See all past deployments and their status

**SSH into the running machine (for debugging):**
```bash
fly ssh console
```

---

## Scaling

**The agent auto-scales based on activity:**
- `auto_stop_machines = true` → Stops when no sessions active
- `auto_start_machines = true` → Starts when teacher begins transcription
- `min_machines_running = 0` → Costs $0 when not in use

**To increase resources (if needed):**
```bash
fly scale memory 512  # Increase to 512MB
fly scale vm shared-cpu-2x  # Upgrade to more CPU
```

---

## Costs

**Free tier:** 3 shared-cpu-1x VMs with 256MB RAM
**Paid:** ~$0.0000008/second when running (~$2.50/month if running 24/7)

With auto-scaling, you only pay when teachers are actively transcribing.

**Check current usage:**
```bash
fly dashboard
```

---

## Troubleshooting

### GitHub Actions deployment fails

**Check the Actions log:**
1. GitHub → Actions → Click on failed run
2. Expand the "Deploy to Fly.io" step
3. Look for error messages

**Common issues:**
- `FLY_API_TOKEN` secret not set or expired → Regenerate token and update secret
- App doesn't exist → Run `fly launch --no-deploy` first
- Build errors → Check Dockerfile syntax

### Agent won't start after deployment

```bash
fly logs
# Look for errors related to missing env vars or connection issues
```

**Check secrets are set:**
```bash
fly secrets list
```

### Need to redeploy manually

```bash
cd agent
fly deploy
```

### Update a secret

```bash
fly secrets set DEEPGRAM_API_KEY="new-key"
```

This automatically restarts the agent.

### Destroy and recreate

```bash
fly apps destroy waitwhat-transcription-agent
fly launch --no-deploy
# Set secrets again
fly secrets set ...
# Push to GitHub to trigger deployment
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

---

## 🔧 Manual Deployment (Alternative)

If you prefer to deploy manually from your local machine instead of using GitHub Actions:

### One-time setup:
```bash
cd agent
fly launch --now
fly secrets set LIVEKIT_API_KEY="..." LIVEKIT_API_SECRET="..." ...
```

### Deploy updates:
```bash
cd agent
fly deploy
```

**When to use manual deployment:**
- Testing changes before pushing to GitHub
- Hotfix deployments
- Troubleshooting

---

## Security Notes

- ✅ Deploy tokens are scoped to deployment only (can't delete apps or view secrets)
- ✅ Secrets are encrypted at rest in Fly.io and GitHub
- ✅ Never commit `.env` files to git (they're in `.gitignore`)
- ✅ Use strong random strings for `TRANSCRIPTION_SECRET`
- ✅ Rotate secrets periodically:
  ```bash
  fly secrets set TRANSCRIPTION_SECRET="new-secret"
  # Update Convex dashboard to match
  ```
- ✅ Deploy token expires: Regenerate and update GitHub secret if needed
  ```bash
  fly tokens create deploy -x 999999h
  # Update GitHub secret: FLY_API_TOKEN
  ```

---

## Development Workflow

**Typical workflow after setup:**

1. Make changes to agent code locally
2. Test locally:
   ```bash
   cd agent
   bun run dev
   ```
   **Note:** For local testing, create `agent/.env` with your **dev** Convex URL (from `npx convex dev`). The production Fly.io deployment uses the production Convex URL you set in Fly secrets.
3. Commit and push:
   ```bash
   git add agent/
   git commit -m "Improve transcription accuracy"
   git push origin main
   ```
4. GitHub Actions automatically deploys
5. Monitor deployment: GitHub → Actions tab
6. Check logs: `fly logs`

**No manual `fly deploy` needed!** 🎉
