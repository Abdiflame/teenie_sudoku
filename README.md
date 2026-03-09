# Teenie Sudoku (PWA)

A kid-friendly 4x4 Sudoku Progressive Web App with pastel teenieping vibes, large tap targets for 10" landscape tablets, offline play, and local progress saving. Built with Next.js (App Router), TypeScript, and Tailwind.

## Features
- 4x4 Sudoku with easy/medium/hard levels and randomized generation
- Offline-first with service worker caching and manifest.json
- Large rounded controls, pastel gradient theme, friendly mascot placeholder
- Sound effects on correct moves, celebration animation when solved
- Local save/restore via localStorage; hint and restart controls
- Parent page gated by simple PIN placeholder
- Vercel-ready (static client-side only)

## Getting Started
1. Install dependencies: `npm install`
2. Run dev server: `npm run dev`
3. Build for production: `npm run build`
4. Start production server: `npm start`

## PWA Notes
- Manifest at `/manifest.json` with landscape orientation
- Service worker at `/service-worker.js` precaches shell + offline page
- Offline page route at `/offline`

## Project Structure
- `src/app` – App Router routes, layout, offline + settings pages
- `src/components` – Game UI pieces (board, controls, celebration, parent gate)
- `src/lib/sudoku.ts` – Sudoku generator/solver for 4x4
- `src/hooks` – Service worker registration, sound, local storage persistence
- `public` – PWA manifest, icons, service worker

## Deployment
- Optimized for Vercel: no custom server required
- Ensure `NODE_VERSION` >= 18.17 on the platform

## Next Steps
- Add richer mascot artwork and audio assets
- Add accessibility polish (focus states, ARIA announcements)
- Expand parent settings (sound toggle, hint limits, reset progress)
