#!/bin/sh

# Generate RSA key pair
ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key -N ""
# Don't add passphrase
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub

# Find the current directory of this script
DIR="$( cd "$( dirname "$0" )" >/dev/null 2>&1 && pwd )"
echo "DIR: $DIR"
echo "PWD: $PWD"

# Put them in .env file under the current directory
echo "PRIVATE_KEY='$(cat jwtRS256.key)'" > "$PWD/.env.local"
echo "PUBLIC_KEY='$(cat jwtRS256.key.pub)'" >> "$PWD/.env.local"

echo "Generated jwtRS256.key and jwtRS256.key.pub and put them in .env.local file."
# Clean up
rm "jwtRS256.key"
rm "jwtRS256.key.pub"