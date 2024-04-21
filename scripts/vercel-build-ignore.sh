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

# Define base and head commits for nx command
base_commit=$VERCEL_GIT_PREVIOUS_SHA
head_commit=$VERCEL_GIT_COMMIT_SHA

# Use HEAD^ if previous SHA is not set
if [ -z "$base_commit" ]; then
    base_commit="HEAD^"
fi

# Display the commits being compared
echo "ℹ️ Checking affected projects. Comparing between $base_commit and $head_commit..."
echo "Affected projects:"

# Run nx to show affected projects and check for the specified string
pnpm nx show projects --affected --base=$base_commit --head=$head_commit | grep -x "$search_string"

# Capture the exit status of the grep command
exit_status=$?

echo ""
# Print the exit status and decide build necessity
if [ $exit_status -eq 0 ]; then
    echo "✅ The provided string is present in the affected projects."
    echo "ℹ️ New Build is required"
    exit 1
else
    echo "❌ The provided string is not present in the affected projects."
    echo "ℹ️ No new build is required"
    exit 0
fi
