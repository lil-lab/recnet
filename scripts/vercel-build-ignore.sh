#!/bin/bash

# Check if an argument is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <string-to-search>"
    exit 1
fi

# Store the string to search into a variable
search_string="$1"

# Install dependencies using pnpm
pnpm install

# Check affected projects, looking for the absence of the provided string
pnpm nx show projects --affected --base=master | grep -q "$search_string"

# Capture the exit status of the grep command (negated)
exit_status=$?

# Exit the script with the negated grep command's exit status
exit $exit_status
