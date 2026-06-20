# Five Color Memory Game

A small static web app where players watch a five-color pattern and repeat it back. Each successful round adds one more color.

## Features

- Five color buttons: red, blue, green, yellow, and purple
- Increasing memory sequence after every correct round
- Score, level, progress, and best-level tracking
- Replay button during input rounds
- Mobile-friendly layout with large tap targets
- Browser-only app; best score is saved in `localStorage`

## Run locally

```bash
npm install
npm test
npm start
```

Then open <http://127.0.0.1:4173>.

## Build

```bash
npm run build
```

The static output is written to `dist/`.
