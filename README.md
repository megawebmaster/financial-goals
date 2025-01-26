# Finance Goals

This app is intended for tracking your financial goals - what you want to achieve 
with the money you have and how you want to make it work for you.

## Stack

* Remix
* TypeScript
* ShadCN + Radix UI
* Playwright

## Running

1. Install dependencies: `npm i`
2. Run dependencies with Docker: `docker compose up -d db mailer`
3. Run migrations: `prisma migrate dev`
4. Run dev server: `npm run dev`

## Mail catcher

The project uses Mailpit to handle sending and catching emails for local development.
The web UI is available at [http://localhost:8025](http://localhost:8025)
