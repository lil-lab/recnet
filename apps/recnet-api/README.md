# Recnet-api

Recnet-api is a backend API service for [Recnet](https://www.recnet.io/). Powered by Node.js and [NestJS](https://nestjs.com/), it offers scalable solutions for paper recommendation, news feed system and academic social media network.

## Requirements

- node >= 18
- PostgreSQL 16

## Documentation
- [Notion](https://www.notion.so/RecNet-f8440e23b4e54af4a9636e84ed101815)
- Swagger API Doc
  - [dev](https://dev-api.recnet.io/api)
  - prod

## Local Development

### Installation
```bash
pnpm install
```

### Set up a local DB
1. Use docker to create a PostgreSQL container.
```bash
# create and start
docker create --name recnet-postgres -p 5432:5432 -e POSTGRES_PASSWORD=admin postgres:16.2
docker start recnet-postgres

# stop and remove
docker stop recnet-postgres
docker rm recnet-postgres
```

2. Run migration
```bash
nx prisma deploy recnet-api
```

### Prepare environment variable
1. Copy from sample file
```bash
cp apps/recnet-api/.env.sample apps/recnet-api/.env
```
2. Modify environment variable
3. Source the .env file
```bash
source apps/recnet-api/.env
```

### Generate prisma client
```bash
nx prisma:generate recnet-api
```

### Run the server
```bash
nx serve recnet-api
```

## DB Migration
### How to generate migration files?
1. Prepare a local database. Same as [here](#set-up-a-local-db).
2. Modify `apps/recnet-api/prisma/prisma.schema`
3. Run migration script. The migration script will create a directory under `apps/recnet-api/prisma/migrations` with `migration.sql` and `down.sql`.
```bash
nx prisma:migrate recnet-api {migration_name}
```

### How does the migration script been deployed to dev or production environment?
If the environment variable `DB_MIGRATION=true`, the migration will be deployed when the server is up. It is executed by `prisma.connection.provider.ts`.

## Environment and Deployment
We currently maintain two environment - dev and prod. All of the services are deployed to AWS Elastic Beanstalk.

### API host
- dev: https://dev-api.recnet.io/
- prod: https://api.recnet.io/

### Deployment
We utilize AWS CodePipeline to build up the CI/CD for the services. Whenever the designated branch updates, the pipeline will deploy the code on that branch to the corresponding environment.

- dev branch: recnet-api-dev
- prod branch: master
