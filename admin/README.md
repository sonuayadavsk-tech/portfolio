# Admin Dashboard - Portfolio Management

## Setup

```bash
cd admin
npm install
npm run dev
```

Admin runs on `http://localhost:5174`

## Environment Variables

Create `.env.local`:
```
VITE_API_URL=http://localhost:5000
VITE_ADMIN_PASSWORD=secure_password
```

## Features

- ✅ Manage Projects
- ✅ Manage Experience
- ✅ Manage Skills
- ✅ Real-time sync with backend

## Build for Production

```bash
npm run build
```

## Deploy

```bash
npm install -g vercel
vercel deploy --prod
```
