# 🔧 Backend Setup & Troubleshooting

## Prerequisites Check

### 1. MongoDB Installation

**Windows:**
```bash
# Download MongoDB Community Edition
# https://www.mongodb.com/try/download/community

# After installation, MongoDB should start automatically
# Or start it manually with:
mongod
```

**Check if MongoDB is running:**
```bash
# Open another PowerShell and run:
mongosh
# You should see a MongoDB shell connection
```

## Starting the Backend

### Step 1: Create `.env` file
The `.env` file has been created at `backend/.env` with default settings.

### Step 2: Ensure MongoDB is running
```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Verify MongoDB connection
mongosh
```

### Step 3: Start backend development server
```bash
# Terminal 3: Start backend
cd backend
npm run dev
```

You should see:
```
✓ Connected to MongoDB
✓ Server running on http://localhost:5000
```

## Common Issues & Solutions

### Issue: "MongoDB connection refused"

**Solution 1: Install MongoDB**
- Download from: https://www.mongodb.com/try/download/community
- Run the installer
- MongoDB should start automatically

**Solution 2: Start MongoDB manually**
```bash
mongod
```

**Solution 3: Use MongoDB Atlas (Cloud)**
- Create account at: https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string
- Update `backend/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/present-smart
```

---

### Issue: "Port 5000 already in use"

**Solution: Use a different port**
```bash
# In backend/.env, change:
PORT=5001
```

---

### Issue: "ts-node errors"

**Solution: Clear and reinstall**
```bash
cd backend
rm -r node_modules
npm install
npm run dev
```

---

## Environment Variables (.env)

```
# Server Configuration
PORT=5000                           # Server port
NODE_ENV=development                # Environment: development/production

# Database
MONGODB_URI=mongodb://localhost:27017/present-smart
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/present-smart

# Authentication
JWT_SECRET=your-super-secret-key    # CHANGE THIS IN PRODUCTION!

# Frontend
FRONTEND_URL=http://localhost:5173  # Frontend URL for CORS

# Email (Optional - leave blank for dev mode)
RESEND_API_KEY=                     # Get from https://resend.com
RESEND_FROM_EMAIL=onboarding@resend.dev
```

## Verify Backend is Working

Once running, test in another terminal:

```bash
# Health check
curl http://localhost:5000/api/health

# Should return:
# {"status":"OK","timestamp":"2025-11-11T..."}
```

## Frontend Configuration

Create `.env` in root directory:

```
VITE_API_URL=http://localhost:5000
```

## Running Both Servers

**Terminal 1: MongoDB**
```bash
mongod
```

**Terminal 2: Backend**
```bash
cd backend
npm run dev
```

**Terminal 3: Frontend**
```bash
npm run dev
```

Then visit: http://localhost:5173

---

## Database Collections

Once connected, MongoDB automatically creates:
- Users
- Teachers
- Students
- StudentInvites
- AttendanceCodes (auto-expire after 2 minutes)
- AttendanceRecords

Use MongoDB Compass to view data:
1. Download: https://www.mongodb.com/products/compass
2. Connect to: `mongodb://localhost:27017`
3. Browse collections

---

## Next Steps

1. ✅ Install MongoDB
2. ✅ Create backend/.env
3. ✅ Start MongoDB (mongod)
4. ✅ Start Backend (npm run dev)
5. ✅ Create frontend/.env
6. ✅ Start Frontend (npm run dev)
7. ✅ Test at http://localhost:5173
