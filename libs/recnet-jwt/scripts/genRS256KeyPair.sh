ssh-keygen -t rsa -b 4096 -m PEM -f jwtRS256.key
# Don't add passphrase
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
# cat jwtRS256.key
# cat jwtRS256.key.pub

# put them in .env file
echo "PRIVATE_KEY='$(cat jwtRS256.key)'" > ../.env.local
echo "PUBLIC_KEY='$(cat jwtRS256.key.pub)'" >> ../.env.local

echo "Generated jwtRS256.key and jwtRS256.key.pub and put them in .env.local file."
# clean up
rm jwtRS256.key
rm jwtRS256.key.pub
