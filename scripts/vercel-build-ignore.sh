#!/bin/bash

# Check if an argument is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <string-to-search>"
    exit 1
fi

# Store the string to search into a variable
search_string="$1"

# Install dependencies using pnpm
echo "ℹ️ Installing dependencies..."
pnpm install

# Check affected projects, looking for the absence of the provided string
echo "ℹ️ Checking affected projects..."
echo "Affected projects: "
pnpm nx show projects --affected --base=$VERCEL_GIT_PREVIOUS_SHA --head=$VERCEL_GIT_COMMIT_SHA | (grep -x "$search_string")

# Capture the exit status of the grep command
exit_status=$?

echo ""
# print the exit status
if [ $exit_status -eq 0 ]; then
    echo "✅ The provided string is present in the affected projects."
    echo "ℹ️ New Build is required"
    exit 1
else
    echo "❌ The provided string is not present in the affected projects."
    echo "ℹ️ No new build is required"
    exit 0
fi
