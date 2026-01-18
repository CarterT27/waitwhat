#!/bin/bash

# Script to help set up Fly.io secrets for the transcription agent
# Usage: ./setup-secrets.sh

echo "🔐 Fly.io Secrets Setup for Transcription Agent"
echo "================================================"
echo ""
echo "This script will help you set environment variables in Fly.io."
echo "Please have the following ready:"
echo "  - LiveKit API Key & Secret (from cloud.livekit.io)"
echo "  - Deepgram API Key (from deepgram.com)"
echo "  - Convex Site URL (from convex dashboard)"
echo ""

read -p "Press Enter to continue..."

# Check if fly is installed
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI not found. Please install it first:"
    echo "   curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if logged in
if ! fly auth whoami &> /dev/null; then
    echo "❌ Not logged into Fly.io. Please run: fly auth login"
    exit 1
fi

echo ""
echo "📝 Enter your credentials (they won't be displayed):"
echo ""

# Collect secrets
read -p "LIVEKIT_API_KEY: " LIVEKIT_API_KEY
read -sp "LIVEKIT_API_SECRET: " LIVEKIT_API_SECRET
echo ""
read -p "LIVEKIT_URL (e.g., wss://your-project.livekit.cloud): " LIVEKIT_URL
read -sp "DEEPGRAM_API_KEY: " DEEPGRAM_API_KEY
echo ""
read -p "CONVEX_SITE_URL (e.g., https://happy-animal-123.convex.site): " CONVEX_SITE_URL
read -sp "TRANSCRIPTION_SECRET (random string, must match Convex): " TRANSCRIPTION_SECRET
echo ""

# Confirm
echo ""
echo "📋 Summary:"
echo "  LIVEKIT_API_KEY: ${LIVEKIT_API_KEY:0:10}..."
echo "  LIVEKIT_API_SECRET: ****"
echo "  LIVEKIT_URL: $LIVEKIT_URL"
echo "  DEEPGRAM_API_KEY: ****"
echo "  CONVEX_SITE_URL: $CONVEX_SITE_URL"
echo "  TRANSCRIPTION_SECRET: ****"
echo ""

read -p "Set these secrets in Fly.io? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

# Set secrets
echo ""
echo "🚀 Setting secrets in Fly.io..."

fly secrets set \
  LIVEKIT_API_KEY="$LIVEKIT_API_KEY" \
  LIVEKIT_API_SECRET="$LIVEKIT_API_SECRET" \
  LIVEKIT_URL="$LIVEKIT_URL" \
  DEEPGRAM_API_KEY="$DEEPGRAM_API_KEY" \
  CONVEX_SITE_URL="$CONVEX_SITE_URL" \
  TRANSCRIPTION_SECRET="$TRANSCRIPTION_SECRET"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Secrets set successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Verify deployment: fly status"
    echo "  2. View logs: fly logs"
    echo "  3. Test transcription in your app"
else
    echo ""
    echo "❌ Failed to set secrets. Check error above."
    exit 1
fi
