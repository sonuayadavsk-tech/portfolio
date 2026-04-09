# Backend - API Server

## Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

## Environment Variables

Create `.env`:
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/portfolio
GROQ_API_KEY=your_groq_api_key
ADMIN_PASSWORD=secure_password
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

## API Endpoints

### Portfolio
- `GET /api/portfolio` - Fetch portfolio data
- `PUT /api/portfolio` - Update entire portfolio
- `PUT /api/portfolio/:section` - Update specific section
- `POST /api/portfolio/projects` - Add project
- `DELETE /api/portfolio/projects/:id` - Delete project

### Chat
- `POST /api/chat` - Send message to AI

## Build for Production

```bash
npm run build
```

## Deploy

```bash
npm install -g vercel
vercel deploy --prod
```
