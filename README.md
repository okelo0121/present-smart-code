# 📱 Present Smart Code - MERN Stack

A full-stack MERN (MongoDB, Express, React, Node.js) attendance tracking system for teachers and students.

## 🎯 Features

### Teacher Dashboard
- 👨‍🏫 Create and manage class profiles
- 🔐 Generate 2-minute attendance codes
- 📧 Invite students via email
- 📊 View real-time attendance statistics
- 📈 Track attendance history and trends
- 👥 Manage enrolled students

### Student Interface
- 📚 View class information and teacher details
- ✅ Submit attendance with codes
- 📝 Track attendance history
- 📊 View attendance percentage
- 🔔 Receive invitation emails
- 💾 Auto-login on page refresh

### System Features
- 🔐 **JWT Authentication** - Secure token-based login
- 🔒 **Password Security** - bcryptjs hashing
- 📧 **Email Integration** - Resend for invitations and notifications
- 💾 **MongoDB** - NoSQL database with Mongoose
- ⚡ **Express.js** - RESTful API backend
- ⚛️ **React** - Modern frontend with TypeScript
- 🎨 **Tailwind CSS** - Beautiful responsive UI
- 🧩 **shadcn/ui** - Pre-built UI components

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ and **npm** 7+
- **MongoDB** (local or MongoDB Atlas)
- **Resend API Key** (from https://resend.com)

### 1️⃣ Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
npm install
```

### 2️⃣ Setup MongoDB

**Option A: Local MongoDB**
- Download: https://www.mongodb.com/try/download/community
- Run `mongod` in a terminal

**Option B: MongoDB Atlas (Cloud)**
- Create account at https://www.mongodb.com/cloud/atlas
- Create free cluster
- Get connection string

### 3️⃣ Create Environment Files

```bash
# Copy backend example
cp backend/.env.example backend/.env

# Copy frontend example
cp .env.example .env
```

### 4️⃣ Configure Environment Variables

**backend/.env**
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/present-smart
JWT_SECRET=your-secret-key-change-this-in-production
FRONTEND_URL=http://localhost:5173
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**.env**
```
VITE_API_URL=http://localhost:5000
```

### 5️⃣ Run Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Visit http://localhost:5173 in your browser.

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[QUICK_START.md](./QUICK_START.md)** | 5-minute setup guide |
---

## 🏗️ Project Structure

```
present-smart-code/
├── backend/
│   ├── src/
│   │   ├── server.ts              # Express app
│   │   ├── config/                # Database config
│   │   ├── models/                # MongoDB schemas (6 models)
│   │   ├── controllers/           # Business logic (3 controllers)
│   │   ├── routes/                # API endpoints (3 route files)
│   │   ├── middleware/            # Auth middleware
│   │   └── utils/                 # Helpers (JWT, password, email)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── src/
│   ├── components/                # React components
│   │   ├── TeacherDashboard.tsx
│   │   ├── StudentInterface.tsx
│   │   ├── InviteStudentForm.tsx
│   │   └── ui/                    # shadcn/ui components
│   ├── hooks/
│   │   └── useAuth.tsx            # Auth hook
│   ├── pages/                     # Page components
│   ├── App.tsx
│   └── main.tsx
│
├── QUICK_START.md
├── package.json
└── vite.config.ts
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/signin` - Login user
- `POST /api/auth/signout` - Logout
- `GET /api/auth/me` - Get current user

### Teachers
- `GET /api/users/teacher/profile` - Get teacher profile
- `GET /api/users/teacher/students` - Get teacher's students
- `POST /api/users/teacher/invite-student` - Invite student

### Students
- `GET /api/users/student/profile` - Get student profile

### Attendance
- `POST /api/attendance/generate-code` - Create attendance code
- `POST /api/attendance/submit` - Submit attendance
- `GET /api/attendance/history` - Get student history
- `GET /api/attendance/stats` - Get attendance stats

## 🗄️ Database Schema

### Collections

**User** - Authentication users
- email (unique)
- password (hashed)
- userType (teacher/student)
- emailVerified

**Teacher** - Teacher profiles
- userId (links to User)
- name
- department
- class

**Student** - Student profiles
- userId (optional, links to User)
- name
- email
- department
- class
- teacherId (links to Teacher)

**StudentInvite** - Invitation tokens
- email
- token (unique)
- teacherId
- expiresAt (7 days)

**AttendanceCode** - 2-minute codes
- code (unique)
- teacherId
- expiresAt (2 minutes, TTL index)

**AttendanceRecord** - Student submissions
- studentId
- code
- submitDate
- status


---

## 🔐 Security Features

✅ **Password Security**
- bcryptjs with 10 salt rounds
- Passwords never logged or exposed
- Hashed before storage

✅ **JWT Authentication**
- 7-day token expiry
- Signed with secret
- Verified on each request

✅ **Email Security**
- One-time invitation tokens
- 7-day token expiry
- Email verification recommended

✅ **API Security**
- CORS restricted to frontend URL
- Input validation
- Error messages sanitized
- No sensitive data in responses

✅ **Database Security**
- Indexed queries
- TTL auto-cleanup
- Auto-expiring codes and invites

---

## 🚀 Deployment

### Deploy Backend (Render.com)
1. Push code to GitHub
2. Connect repo to Render
3. Set environment variables
4. Deploy (auto on push)

### Deploy Frontend (Vercel)
1. Push code to GitHub
2. Connect repo to Vercel
3. Set `VITE_API_URL` to backend URL
4. Deploy (auto on push)

---

## 🧪 Testing

### Test Signup Flow
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "password": "password123",
    "userType": "teacher"
  }'
```

### Test Attendance Code
```bash
curl -X POST http://localhost:5000/api/attendance/generate-code \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🛠️ Development Commands

### Frontend
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview build locally
npm run lint     # Run ESLint
```

### Backend
```bash
cd backend
npm run dev      # Start dev server with nodemon
npm run build    # Build TypeScript
npm run start    # Run compiled code
npm run lint     # Run ESLint
```

---

## 📦 Tech Stack

### Frontend
- **React** 18.3.1
- **TypeScript** 5.8.3
- **Vite** 5.4.19 (build tool)
- **Tailwind CSS** 3.4.17
- **shadcn/ui** (component library)
- **React Router** 6.30.1
- **React Hook Form** 7.61.1
- **Zod** 3.25.76 (validation)

### Backend
- **Express.js** 4.18.2
- **TypeScript** 5.3.3
- **MongoDB** 4.0+
- **Mongoose** 8.0.0 (ODM)
- **JWT** 9.1.2 (jsonwebtoken)
- **bcryptjs** 2.4.3 (password hashing)
- **Resend** 3.0.0 (email service)
- **Cors** 2.8.5
- **dotenv** 16.3.1 (env config)

---

## 📖 Learning Outcomes

This project demonstrates:

### Backend
- Express.js routing and middleware
- MongoDB/Mongoose schema design
- Controller pattern for business logic
- JWT authentication implementation
- Password security with bcryptjs
- Error handling and validation

### Frontend
- React with TypeScript
- REST API consumption
- Token-based authentication
- React hooks and state management
- Form handling with validation
- Responsive UI design

### Full-Stack
- Client-server architecture
- RESTful API design
- Authentication flows
- Database relationships
- Error handling across layers

---

## ❓ Frequently Asked Questions

**Q: Why MERN instead of Supabase?**
A: More control, better for learning, easier customization, and great for portfolio projects.

**Q: Can I deploy for free?**
A: Yes! MongoDB Atlas (free tier), Render (free tier), Vercel (free tier).


**Q: Is this production-ready?**
A: Yes! With proper environment variables and deployment setup.

---

## 📞 Support

- 🚀 **Quick Setup:** See [QUICK_START.md](./QUICK_START.md)

---

## 🎓 Educational Use

This project is designed for:
- Portfolio demonstrations
- Learning full-stack development
- PLP (Practical Learning Program) submissions
- Interview preparation
- Production-ready code examples

---

## 📝 License

This project is open source and available for educational use.

---

## ✨ Key Highlights

✅ Full MERN stack implementation
✅ JWT authentication with security
✅ Email integration with Resend
✅ MongoDB with Mongoose ODM
✅ TypeScript for type safety
✅ Responsive React UI
✅ RESTful API design
✅ Production deployment ready
✅ Comprehensive documentation
✅ Clean, professional code structure

---

**Built with ❤️ for learning and production use.**

Start here → [QUICK_START.md](./QUICK_START.md)
