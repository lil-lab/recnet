## Perform data migration

First run

`nx prisma:generate recnet-api`

to generate the prisma client.

Then make sure you have these env variables set:

```
export FIREBASE_PRIVATE_KEY=
export FIREBASE_CLIENT_EMAIL=
export FIREBASE_PROJECT_ID=
```

in our `.env` file under `recnet-api` folder.

Then run (in order)

```
node user.js
node followingRecords.js
node articleAndRec.js
node inviteCode.js
```

to migrate the data to the `$PRISMA_DATABASE_URL`.
