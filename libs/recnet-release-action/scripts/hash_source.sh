# Change to the src directory
cd "$(dirname "$0")/../src" || exit 1

# Calculate hash of all files in the src directory
hash=$(find . -type f -print0 | sort -z | xargs -0 sha256sum | sha256sum | cut -d' ' -f1)

# Output the hash
echo "$hash"
