# SADAD_WEB

## Overview
Frontend for SADAD (Next.js App Router).

## Setup
1. Create `.env.local` (or `.env`) with:
   - `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api`

## Run
- `npm install`
- `npm run dev`
- Open `http://localhost:3000`

## Auth
- Session is stored in HttpOnly cookie set by the API.
- The app uses `credentials: include` to send cookies.

## UI Tests
- Install deps: `npm install`
- Run: `npm run test:ui`
