ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key -N ""
# Don't add passphrase
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub

# find the current directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "DIR: $DIR"

# put them in .env file
echo "PRIVATE_KEY='$(cat jwtRS256.key)'" > .env.local
echo "PUBLIC_KEY='$(cat jwtRS256.key.pub)'" >> .env.local

echo "Generated jwtRS256.key and jwtRS256.key.pub and put them in .env.local file."
# clean up
rm jwtRS256.key
rm jwtRS256.key.pub