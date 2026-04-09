# 🚀 Full Stack Portfolio Setup Guide

## 📁 Project Structure

```
/
├── frontend/          (Your portfolio website)
├── backend/           (API server)
├── admin/             (Admin dashboard for updates)
└── README.md
```

---

## 🔧 Setup Instructions

### **Step 1: Create MongoDB Database (FREE)**

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up (free)
3. Create a free cluster
4. Get your connection string: `mongodb+srv://user:password@cluster.mongodb.net/portfolio`

---

### **Step 2: Get API Keys (FREE)**

#### **Groq API (for AI model inference)**
- Sign up: [console.groq.com](https://console.groq.com)
- Get free API key for unlimited free inference (30 calls/min)

#### **Optional: JWT Secret**
- Generate a random secret for admin authentication

---

### **Step 3: Backend Setup**

```bash
cd backend
npm install
```

Create `.env` file:
```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/portfolio
GROQ_API_KEY=your_groq_api_key
ADMIN_PASSWORD=your_secure_password
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

Run backend:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

---

### **Step 4: Admin Dashboard Setup**

```bash
cd admin
npm install
```

Create `.env.local`:
```
VITE_API_URL=http://localhost:5000
VITE_ADMIN_PASSWORD=your_secure_password
```

Run admin:
```bash
npm run dev
```

Admin will run on `http://localhost:5174`

---

### **Step 5: Frontend Setup (Already exists)**

```bash
# In the main directory
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 🎯 How It Works

```
┌─────────────────────────────┐
│   Admin Dashboard           │ ← Manage portfolio data
│   (http://localhost:5174)   │
└──────────────┬──────────────┘
               │ (updates)
               ↓
┌──────────────────────────────┐
│   Backend API                │ ← Stores in MongoDB
│   (http://localhost:5000)    │
└──────────────┬───────────────┘
               │
               ↓
┌──────────────────────────────┐
│   MongoDB Database           │
└──────────────────────────────┘
               │
               ↓
┌──────────────────────────────┐
│   Portfolio Website          │ ← Displays data
│   (http://localhost:5173)    │   + AI chatbot
└──────────────────────────────┘
```

---

## 📝 API Endpoints

### **Portfolio Endpoints**

- `GET /api/portfolio` - Fetch portfolio data
- `PUT /api/portfolio` - Update entire portfolio
- `PUT /api/portfolio/:section` - Update specific section (projects, experience, skills)
- `POST /api/portfolio/projects` - Add project
- `DELETE /api/portfolio/projects/:id` - Delete project

### **Chat Endpoints**

- `POST /api/chat` - Send message to AI assistant

---

## 🔐 Authentication

All update endpoints require password parameter:
```
?password=your_admin_password
```

Example:
```bash
curl -X PUT http://localhost:5000/api/portfolio \
  -d '{"projects": [...]}' \
  -H "Content-Type: application/json" \
  -H "?password=your_admin_password"
```

---

## 🌐 Deployment

### **Backend - Deploy to Vercel**

```bash
cd backend
npm install -g vercel
vercel login
vercel deploy --prod
```

Add environment variables in Vercel dashboard.

### **Admin - Deploy to Vercel**

```bash
cd admin
npm install -g vercel
vercel login
vercel deploy --prod
```

Update `VITE_API_URL` to your backend URL.

### **Frontend - Deploy to Vercel**

```bash
npm install -g vercel
vercel login
vercel deploy --prod
```

---

## 💾 Database Operations

### **Initialize Portfolio Data**

First call to `GET /api/portfolio` will create default data. Then use Admin Dashboard to update.

---

## 🐛 Troubleshooting

**Backend won't connect to MongoDB:**
- Check MongoDB URI in `.env`
- Ensure IP whitelist is set to `0.0.0.0/0` in MongoDB Atlas

**Admin can't reach Backend:**
- Check `VITE_API_URL` in admin `.env.local`
- Ensure backend is running on correct port

**Chat not working:**
- Check Groq API key in backend `.env`
- Ensure MongoDB has portfolio data

---

## 🎨 Features Included

✅ Full stack portfolio website
✅ Admin dashboard for easy updates
✅ AI chatbot with Groq (Ollama equivalent)
✅ Real-time database sync
✅ Beautiful UI with animations
✅ Mobile responsive
✅ Free forever (all services have free tiers)

---

## 📚 Next Steps

1. **Add your data** to Admin Dashboard
2. **Deploy backend** to Vercel
3. **Deploy admin** to Vercel  
4. **Deploy portfolio** to Vercel
5. **Share your portfolio!** 🚀

---

**Questions?** Check individual README.md files in each folder!
