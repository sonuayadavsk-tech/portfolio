# Docker Deploy Guide (Free Tier)

This project has three apps:
- `backend` (Express API)
- `frontend` (public portfolio site)
- `admin` (admin portal)

Docker Desktop is used for local build/testing only. To host publicly, push images to a registry and run them on a cloud provider.

## 1) Local Test with Docker Desktop

Create a root `.env.docker` file:

```env
MONGO_URI=your_mongodb_atlas_uri
GROQ_API_KEY=your_groq_api_key
ADMIN_PASSWORD=your_admin_password
VITE_ADMIN_PASSWORD=your_admin_password

FRONTEND_URL=http://localhost:8080
ADMIN_URL=http://localhost:8081
VITE_API_URL_FRONTEND=http://localhost:5000
VITE_API_URL_ADMIN=http://localhost:5000
```

Run:

```bash
docker compose --env-file .env.docker up --build -d
```

Open:
- Frontend: `http://localhost:8080`
- Admin: `http://localhost:8081`
- Backend health: `http://localhost:5000/api/health`

Stop:

```bash
docker compose down
```

## 2) Build and Push Images to Docker Hub

Login:

```bash
docker login
```

Set your Docker Hub username (PowerShell):

```bash
$env:DOCKER_USER="your_dockerhub_username"
```

Build images:

```bash
docker build -t $env:DOCKER_USER/portfolio-backend:latest ./backend
docker build --build-arg VITE_API_URL=https://your-backend-url.onrender.com -t $env:DOCKER_USER/portfolio-frontend:latest ./frontend
docker build --build-arg VITE_API_URL=https://your-backend-url.onrender.com --build-arg VITE_ADMIN_PASSWORD=your_admin_password -t $env:DOCKER_USER/portfolio-admin:latest ./admin
```

Push images:

```bash
docker push $env:DOCKER_USER/portfolio-backend:latest
docker push $env:DOCKER_USER/portfolio-frontend:latest
docker push $env:DOCKER_USER/portfolio-admin:latest
```

## 3) Host on Internet (Render Free Tier)

Create three Web Services in Render (one per image):

1. Backend image: `%DOCKER_USER%/portfolio-backend:latest`
   - Port: `5000`
   - Env vars:
     - `PORT=5000`
     - `NODE_ENV=production`
     - `MONGO_URI=...`
     - `GROQ_API_KEY=...`
     - `ADMIN_PASSWORD=...`
     - `FRONTEND_URL=https://your-frontend-url.onrender.com`
     - `ADMIN_URL=https://your-admin-url.onrender.com`

2. Frontend image: `%DOCKER_USER%/portfolio-frontend:latest`
   - Port: `80`

3. Admin image: `%DOCKER_USER%/portfolio-admin:latest`
   - Port: `80`

After backend URL is final, rebuild/re-push frontend/admin images with correct `VITE_API_URL`.

## 4) Keep Laptop Resource Usage Low

After successful cloud deploy, remove local containers/images:

```bash
docker compose down
docker image prune -a -f
docker builder prune -a -f
```

This frees RAM/CPU/disk on your laptop.
