#!/bin/bash

# KV to SQL Migration Runner
# Usage: ./migrate-kv.sh YOUR_ADMIN_PASSWORD

if [ -z "$1" ]; then
  echo "❌ Error: Admin password required"
  echo "Usage: ./migrate-kv.sh YOUR_ADMIN_PASSWORD"
  exit 1
fi

ADMIN_PASSWORD="$1"
PROJECT_ID="zuycsuajiuqsvopiioer"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1eWNzdWFqaXVxc3ZvcGlpb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4Mzk1ODUsImV4cCI6MjA3NzQxNTU4NX0.y7C3gkxAXQvOLRdaebj_3MRww2QjaN9fA2sCUzsdhEM"

echo "🔐 Getting admin token..."
LOGIN_RESPONSE=$(curl -s -X POST "https://${PROJECT_ID}.supabase.co/functions/v1/make-server-74296234/api/admin/login" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d "{\"password\":\"${ADMIN_PASSWORD}\"}")

ADMIN_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Failed to get admin token"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Got admin token"
echo ""
echo "🚀 Starting migration..."
echo ""

MIGRATION_RESPONSE=$(curl -s -X POST "https://${PROJECT_ID}.supabase.co/functions/v1/make-server-74296234/api/admin/migrate-kv" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "X-Admin-Token: ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json")

echo "$MIGRATION_RESPONSE"

echo ""
echo "✅ Migration complete!"
