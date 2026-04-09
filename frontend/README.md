# Frontend - Portfolio Website

## Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Environment Variables

Create `.env.local`:
```
VITE_API_URL=http://localhost:5000
```

## Build for Production

```bash
npm run build
```

## Deploy

```bash
npm install -g vercel
vercel deploy --prod
```
