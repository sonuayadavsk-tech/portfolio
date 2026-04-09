# 🎬 Quick Start Guide

## ⚡ 3 Separate Projects (Deploy Anywhere!)

Your portfolio now has **3 independently deployable projects**:

```
Your Machine / Cloud
├── 🌐 Frontend (Portfolio Website) → localhost:5173
├── ⚙️  Backend (API Server) → localhost:5000
└── 🔧 Admin (Dashboard) → localhost:5174

Each can be deployed to DIFFERENT hosts:
├── frontend → Vercel / Netlify / AWS / GCP
├── backend → Vercel / Heroku / AWS / Railway
└── admin → Vercel / Netlify / AWS / GCP
```

---

## 🚀 Quick Setup (5 minutes)

### **1️⃣ MongoDB Setup (2 min)**

```bash
# Go to https://www.mongodb.com/cloud/atlas
# 1. Sign up (free)
# 2. Create cluster → Get connection string
# Copy: mongodb+srv://user:pass@cluster.mongodb.net/portfolio
```

### **2️⃣ Groq API Key (1 min)**

```bash
# Go to https://console.groq.com
# 1. Sign up (free)
# 2. Create API key
# Copy your API key
```

### **3️⃣ Backend Setup (1 min)**

```bash
cd backend
npm install

# Create .env file with:
# MONGO_URI=your_mongodb_connection_string
# GROQ_API_KEY=your_groq_api_key
# ADMIN_PASSWORD=secure_password

npm run dev
# ✅ Backend runs on http://localhost:5000
```

### **4️⃣ Admin Dashboard Setup (1 min)**

```bash
cd admin
npm install

# Create .env.local with:
# VITE_API_URL=http://localhost:5000
# VITE_ADMIN_PASSWORD=secure_password

npm run dev
# ✅ Admin runs on http://localhost:5174
```

### **5️⃣ Frontend Setup (1 min)**

```bash
cd frontend
npm install

# Create .env.local with:
# VITE_API_URL=http://localhost:5000

npm run dev
# ✅ Frontend runs on http://localhost:5173
```

---

## 🎯 What You Now Have

| Component | What It Does | Where to Access | Deploy To |
|-----------|-------------|-----------------|-----------|
| **Frontend** | Portfolio + AI chatbot | localhost:5173 | Vercel, Netlify, AWS |
| **Backend** | API + Database | localhost:5000 | Vercel, Heroku, AWS |
| **Admin** | Manage data | localhost:5174 | Vercel, Netlify, AWS |
| **Database** | Store all data | Cloud (MongoDB) | MongoDB Atlas |
| **AI** | Answer questions | Cloud (Groq) | Groq API |

---

## 📝 Workflow

### **For Visitors**

```
1. Visit your portfolio (frontend)
2. See your projects, experience, skills
3. Click chat button (💬)
4. Ask questions about you
5. AI responds with your portfolio info
```

### **For You (Maintenance)**

```
1. Go to Admin Dashboard (http://localhost:5174)
2. Add/Edit/Delete:
   - Projects
   - Experience
   - Skills
3. Changes instantly reflect:
   - In your portfolio (frontend)
   - In AI chatbot knowledge
   - In database
```

---

## 🌐 Deploy Each Project Separately

### **Deploy Frontend**

```bash
cd frontend
npm run build
npm install -g vercel
vercel deploy --prod
# URL: https://your-portfolio.vercel.app
```

### **Deploy Backend**

```bash
cd backend
npm run build
npm install -g vercel
vercel deploy --prod
# Add env variables in Vercel dashboard
# URL: https://your-backend.vercel.app
```

### **Deploy Admin**

```bash
cd admin
npm run build
# Update VITE_API_URL to your backend URL
npm install -g vercel
vercel deploy --prod
# URL: https://your-admin.vercel.app
```

### **Update Frontend API URL (after deploying backend)**

In `frontend/.env.local`:
```
VITE_API_URL=https://your-backend.vercel.app
```

---

## 📌 Important Files

| File | Purpose |
|------|---------|
| `frontend/.env.local` | Frontend API URL |
| `backend/.env` | Backend config (MongoDB, Groq, etc) |
| `admin/.env.local` | Admin config (Backend URL, password) |
| `SETUP_GUIDE.md` | Detailed setup guide |

---

## ✅ Checklist

- [ ] MongoDB cluster created
- [ ] Groq API key obtained
- [ ] Backend `.env` created
- [ ] Admin `.env.local` created
- [ ] Frontend `.env.local` created
- [ ] Backend `npm install` & `npm run dev` ✅
- [ ] Admin `npm install` & `npm run dev` ✅
- [ ] Frontend `npm install` & `npm run dev` ✅
- [ ] Test admin dashboard
- [ ] Add your portfolio data
- [ ] Test chatbot on frontend
- [ ] Deploy to production (optional)

---

## 🆘 Quick Troubleshooting

**Q: Backend won't start?**
```bash
# Check MongoDB URI in backend/.env
# Make sure MongoDB Atlas allows connections
# Restart: npm run dev
```

**Q: Admin can't reach backend?**
```bash
# Check VITE_API_URL in admin/.env.local
# Should be: http://localhost:5000
# Or your deployed backend URL
```

**Q: Frontend chatbot not working?**
```bash
# Check VITE_API_URL in frontend/.env.local
# Should be: http://localhost:5000
# Or your deployed backend URL
```

**Q: Chatbot not responding?**
```bash
# Check Groq API key in backend/.env
# Ensure MongoDB has portfolio data
# Test API: curl http://localhost:5000/api/health
```

---

## 🎉 You're All Set!

Your full-stack portfolio with AI chatbot is ready! 🚀

**Next:** 
1. Add your data in Admin Dashboard
2. Test on portfolio website
3. Deploy to Vercel for live portfolio

**Questions?** Check `SETUP_GUIDE.md` for detailed instructions!
