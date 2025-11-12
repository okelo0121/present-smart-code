# 🔧 Configuration Guide - Resend + MongoDB Atlas

## Your Setup

✅ **Resend API Key** - You have it
✅ **MongoDB Atlas** - You have it
✅ **Backend Ready** - All code is fixed

---

## 📝 Configure backend/.env

Edit `backend/.env` and replace the placeholders with your actual credentials:

### Step 1: Get MongoDB Atlas Connection String

1. Go to: https://www.mongodb.com/cloud/atlas
2. Log in to your account
3. Click your cluster
4. Click "Connect"
5. Select "Drivers"
6. Copy the connection string
7. It looks like: `mongodb+srv://username:password@cluster.mongodb.net/...`

### Step 2: Get Resend API Key

1. Go to: https://resend.com
2. Log in
3. Copy your API key
4. It looks like: `re_1234567890abcdef...`

### Step 3: Update backend/.env

```properties
PORT=5000
NODE_ENV=development

# MongoDB Atlas - paste your connection string here
MONGODB_URI=mongodb+srv://your_username:your_password@your-cluster.mongodb.net/present-smart?retryWrites=true&w=majority

# JWT Secret - can keep as is or change to something unique
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# Frontend URL - leave as is for local development
FRONTEND_URL=http://localhost:5173

# Resend API Key - paste your key here
RESEND_API_KEY=re_YOUR_ACTUAL_KEY_HERE

# Resend Email - can change if you verified a domain
RESEND_FROM_EMAIL=onboarding@resend.dev
```

---

## ✅ Verify Configuration

### Check MongoDB Connection

```bash
cd backend
npm run dev
```

You should see:
```
[nodemon] starting `ts-node src/server.ts`
✓ Connected to MongoDB
✓ Server running on http://localhost:5000
```

If you see connection errors:
1. Double-check MongoDB Atlas URI
2. Ensure you added the IP address to MongoDB Atlas whitelist:
   - MongoDB Atlas → Network Access → IP Whitelist
   - Add: `0.0.0.0/0` (for development)

### Test Resend Email

Once backend is running, create an account:

1. Start frontend: `npm run dev`
2. Go to http://localhost:5173
3. Sign up as a teacher
4. Check your email (should get welcome email)
5. If you see `[EMAIL] Dev mode` in backend logs, Resend key isn't set

---

## 🚀 Complete Setup Steps

### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```

Expected output:
```
✓ Connected to MongoDB
✓ Server running on http://localhost:5000
```

### Terminal 2: Start Frontend
```bash
npm run dev
```

Expected output:
```
  ➜  Local:   http://localhost:5173/
```

### Terminal 3: Test Everything

1. Open http://localhost:5173
2. Sign up as Teacher
3. Enter name, department, class
4. Check email for welcome message
5. Generate attendance code
6. Share code with student
7. Student signs up with code
8. Student submits attendance with code

---

## 🔑 Configuration Checklist

- [ ] MongoDB Atlas URI in `MONGODB_URI`
- [ ] Resend API key in `RESEND_API_KEY`
- [ ] Resend sender email in `RESEND_FROM_EMAIL`
- [ ] JWT secret set (change in production)
- [ ] Frontend URL is `http://localhost:5173`
- [ ] Backend runs without connection errors
- [ ] Email received on signup

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
MongoNetworkError: connect ECONNREFUSED
```

**Solution:**
1. Copy connection string from MongoDB Atlas (with password)
2. Make sure IP `0.0.0.0/0` is whitelisted
3. Check username and password have no special characters (or properly escaped)
4. Restart backend: `npm run dev`

---

### Resend Email Not Sending
```
[EMAIL] Dev mode - Would send email
```

**Solution:**
1. Check `RESEND_API_KEY` is set in `backend/.env`
2. Make sure key starts with `re_`
3. Restart backend: `npm run dev`
4. Try again

---

### Frontend Can't Connect
```
Error: Failed to connect to API
```

**Solution:**
1. Check `VITE_API_URL=http://localhost:5000` in root `.env`
2. Backend must be running: `cd backend && npm run dev`
3. Check backend logs for errors
4. Restart frontend: `npm run dev`

---

## 📊 Environment Files

### backend/.env (from MongoDB Atlas + Resend)
```properties
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/present-smart?retryWrites=true&w=majority
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
RESEND_API_KEY=re_your_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### .env (root, for frontend)
```
VITE_API_URL=http://localhost:5000
```

---

## 🎯 Next Steps

1. ✅ Update `backend/.env` with MongoDB Atlas URI
2. ✅ Update `backend/.env` with Resend API Key
3. ✅ Run `npm run dev` in `backend/`
4. ✅ Run `npm run dev` in root
5. ✅ Test at http://localhost:5173

---

## 📚 Resources

- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas
- **Resend**: https://resend.com
- **API Docs**: See `API_DOCUMENTATION.md`
- **Full Guide**: See `MERN_CONVERSION_GUIDE.md`

**Status: 🟢 READY TO CONFIGURE**

Just add your credentials to `backend/.env` and you're good to go! 🚀
