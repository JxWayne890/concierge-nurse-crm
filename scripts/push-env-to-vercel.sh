#!/bin/bash
# Push all environment variables from .env.local to Vercel
# Usage: ./scripts/push-env-to-vercel.sh
#
# Make sure you're logged into the right Vercel account first:
#   vercel switch
#
# And that this project is linked:
#   vercel link

ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found. Fill in your keys there first."
  exit 1
fi

echo "Pushing environment variables to Vercel..."
echo "Reading from $ENV_FILE"
echo ""

count=0
skipped=0

while IFS= read -r line || [ -n "$line" ]; do
  # Skip comments and empty lines
  [[ "$line" =~ ^#.*$ ]] && continue
  [[ -z "$line" ]] && continue

  # Split into key=value
  key="${line%%=*}"
  value="${line#*=}"

  # Skip if no value set
  if [ -z "$value" ]; then
    echo "  SKIP  $key (no value set)"
    skipped=$((skipped + 1))
    continue
  fi

  # Push to Vercel for production, preview, and development
  echo "$value" | vercel env add "$key" production preview development --force 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "  ADDED $key"
    count=$((count + 1))
  else
    echo "  ERROR $key — could not add"
  fi

done < "$ENV_FILE"

echo ""
echo "Done! Added $count variables, skipped $skipped (empty)."
echo "Run 'vercel env ls' to verify."
