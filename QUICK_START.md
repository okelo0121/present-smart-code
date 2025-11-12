# Quick Start Guide - MERN Stack

## 🚀 Fastest Way to Get Running (5 minutes)

### 1️⃣ Install Dependencies
```bash
# Backend
cd backend && npm install && cd ..

# Frontend
npm install
```

### 2️⃣ Setup MongoDB Locally (Optional - Skip if using MongoDB Atlas)

**Windows:**
```powershell
# Download from https://www.mongodb.com/try/download/community
# Or use Chocolatey:
choco install mongodb-community
mongod  # Start the service
```

**Mac:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

### 3️⃣ Create Environment Files

**backend/.env**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/present-smart
JWT_SECRET=development-secret-key-change-in-production
FRONTEND_URL=http://localhost:5173
RESEND_API_KEY=re_test_key  # Get from https://resend.com
RESEND_FROM_EMAIL=test@resend.dev
```

**.env (Frontend)**
```env
VITE_API_URL=http://localhost:5000/api
```

### 4️⃣ Run Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# ✓ Server running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# ✓ Frontend running on http://localhost:5173
```

### 5️⃣ Test It Out!

1. Open `http://localhost:5173`
2. Sign up as a Teacher or Student
3. Teacher: Create attendance codes, invite students
4. Student: Mark attendance with codes

---

## 📦 MongoDB Atlas Setup (Cloud - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster (M0 free tier)
4. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/present-smart
   ```
5. Update `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/present-smart
   ```

---

## 🔑 Resend Email Setup

1. Sign up at https://resend.com
2. Create API key
3. Verify sender domain (or use test domain `test@resend.dev`)
4. Update `backend/.env`:
   ```env
   RESEND_API_KEY=re_your_key_here
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

---

## 🗂️ Project Files Reference

| File | Purpose |
|------|---------|
| `backend/src/server.ts` | Express app entry point |
| `backend/src/models/*.ts` | MongoDB schemas |
| `backend/src/controllers/*.ts` | API business logic |
| `backend/src/routes/*.ts` | API endpoints |
| `src/hooks/useAuth.tsx` | Auth context (JWT-based) |
| `src/components/TeacherDashboard.tsx` | Teacher UI with API calls |
| `src/components/StudentInterface.tsx` | Student UI with API calls |

---

## 🐛 Common Issues & Fixes

### "Cannot find module 'mongoose'"
```bash
cd backend && npm install && cd ..
```

### "MongoDB connection refused"
Make sure MongoDB is running:
```bash
# Check if running
mongosh  # or mongo

# If not, start it:
mongod
```

### "CORS error"
Check that `FRONTEND_URL` in `backend/.env` matches your frontend URL

### "Email not sending"
- Verify `RESEND_API_KEY` is correct
- Check email inbox and spam folder
- For testing, use `test@resend.dev`

### "Token expired" on page refresh
- Token expires in 7 days
- User will need to sign in again
- This is normal behavior

---

## 📡 API Testing

### Test Backend Health
```bash
curl http://localhost:5000/api/health
# Expected: {"status":"OK","timestamp":"..."}
```

### Test Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"teacher@test.com",
    "password":"SecurePass123",
    "name":"Test Teacher",
    "userType":"teacher",
    "department":"Computer Science"
  }'
```

### Test Signin
```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@test.com","password":"SecurePass123"}'
```

---

## 🌐 Deploy to Production

### Backend (Render)
```bash
# 1. Push to GitHub
git push origin main

# 2. Go to render.com
# 3. Create new Web Service
# 4. Connect GitHub repo
# 5. Add env vars (see backend/.env.example)
# 6. Deploy!
```

### Frontend (Vercel)
```bash
# 1. Push to GitHub
git push origin main

# 2. Go to vercel.com
# 3. Import project from GitHub
# 4. Add env var: VITE_API_URL=https://your-backend.render.com/api
# 5. Deploy!
```

---

## ✅ You're Done!

Your MERN stack is running! 🎉

### Next Steps:
- [ ] Add more validation in backend
- [ ] Set up logging (Winston, Morgan)
- [ ] Add database indexes
- [ ] Configure email templates
- [ ] Set up error tracking (Sentry)
- [ ] Add rate limiting
- [ ] Write API tests

---

## 📚 Useful Resources

- API Routes: `MERN_CONVERSION_GUIDE.md`
- MongoDB Schema: `MERN_CONVERSION_GUIDE.md` (Database Schema section)
- Express Docs: https://expressjs.com
- React Docs: https://react.dev
- Mongoose Docs: https://mongoosejs.com

**Happy coding!** 🚀
