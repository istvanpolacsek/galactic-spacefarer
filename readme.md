# Galactic Spacefarer Adventure

A SAP CAP (Node.js + TypeScript) application with a Fiori Elements List Report and Object Page for managing galactic spacefarers.

## Features

- **Data model**: `Spacefarers` with stardust collection, wormhole navigation skill, origin planet and spacesuit color, associated to `Departments` and `Positions`
- **Protected service**: authentication required; role- and planet-based authorization via `@restrict`
- **Event handlers**: `before CREATE` validates and enhances new spacefarers, `after CREATE` sends a welcome email (nodemailer + Ethereal test SMTP, no real mail is delivered)
- **Fiori UI**: List Report with sorting, filtering and pagination; Object Page with draft-enabled create, edit and delete

## Getting started

```sh
npm install
npm run deploy     # create the local SQLite database (db.sqlite)
npm run datagen    # optional: generate demo data
npm run dev        # start the server with live reload
```

Open http://localhost:4004 and launch the Spacefarers app.

## Users

Mocked authentication is used in the `development` profile:

| User      | Password  | Access                                          |
| --------- | --------- | ----------------------------------------------- |
| `admin`   | `admin`   | `SpacefarerAdmin`: full CRUD on all spacefarers |
| `kepler`  | `kepler`  | Spacefarers from Kepler-22b only                |
| `martian` | `martian` | Spacefarers from Mars only                      |

## Scripts

| Script                      | Description                                    |
| --------------------------- | ---------------------------------------------- |
| `npm run dev`               | Start `cds watch` with the development profile |
| `npm test`                  | Run Jest tests (in-memory SQLite)              |
| `npm run typegen`           | Generate TypeScript types into `@cds-models`   |
| `npm run datagen`           | Generate demo data                             |
| `npm run deploy`            | Deploy the schema to the database              |
| `npm run watch-spacefarers` | Open the Fiori app directly                    |

Types are generated automatically before `dev`, `test` and `datagen`.

## Project structure

```
app/spacefarers/   Fiori Elements app
db/                CDS data model
srv/               Service definition and TypeScript handlers
test/              Jest tests (service handlers and authorization)
scripts/           Demo data generator
```

## Tooling

ESLint, Prettier, commitlint (Conventional Commits) and Husky with lint-staged run on every commit.
