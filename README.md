<div align="center">

# 📱 Present Smart Code

### Full-Stack MERN Attendance Tracking System


**A production-ready attendance system built with MongoDB, Express, React, and Node.js**

[🚀 Live Demo](https://www.edutrack.store)  • [🐛 Report Bug](https://github.com/okelo0121/present-smart-code/issues) • [✨ Request Feature](https://github.com/okelo0121/present-smart-code/issues)

</div>

---

## 🎯 Features

<table>
<tr>
<td width="50%">

### 👨‍🏫 Teacher Dashboard

- 📝 Create and manage class profiles
- 🔐 Generate 2-minute attendance codes
- 📧 Invite students via email
- 📊 Real-time attendance statistics
- 📈 Track attendance history and trends
- 👥 Manage enrolled students

</td>
<td width="50%">

### 📚 Student Interface

- 📖 View class information and teacher details
- ✅ Submit attendance with codes
- 📝 Track attendance history
- 📊 View attendance percentage
- 🔔 Receive invitation emails
- 💾 Auto-login on page refresh

</td>
</tr>
</table>

### 🔐 System Features

```
🔒 JWT Authentication          📧 Email Integration (Resend)
🔑 Password Security (bcryptjs) 💾 MongoDB with Mongoose
⚡ Express.js REST API          ⚛️ React + TypeScript
🎨 Tailwind CSS + shadcn/ui    🚀 Production-Ready
```

## 🚀 Quick Start

> **📌 Note:** For a detailed step-by-step guide, see [`QUICK_START.md`](QUICK_START.md)

### Prerequisites

```bash
Node.js 16+  |  npm 7+  |  MongoDB  |  Resend API Key
```

### ⚡ Quick Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/present-smart-code.git
cd present-smart-code

# Install dependencies
cd backend && npm install && cd ..
npm install

# Setup environment files
cp backend/.env.example backend/.env
cp .env.example .env
```

<details>
<summary><b>🔧 Configuration Details</b></summary>

### 2️⃣ Setup MongoDB

**Option A: Local MongoDB**

- Download: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- Run `mongod` in a terminal

**Option B: MongoDB Atlas (Cloud)**

- Create account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
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

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/present-smart
JWT_SECRET=your-secret-key-change-this-in-production
FRONTEND_URL=http://localhost:5173
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**.env**

```env
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

Visit `http://localhost:5173` in your browser.

### 📚 Documentation & Resources

| Resource | Description |
|:---------|:------------|
| 📖 [Quick Start Guide](QUICK_START.md) | 5-minute setup tutorial |
| 🚀 [Live Demo](https://www.edutrack.store) | Try the application |
| 📦 [Latest Release](https://github.com/okelo0121/present-smart-code/releases/latest) | Download v1.0.0 |
| 🐛 [Issue Tracker](https://github.com/okelo0121/present-smart-code/issues) | Report bugs |
| 💬 [Discussions](https://github.com/okelo0121/present-smart-code/discussions) | Community support |

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

- **User** - Authentication users
  - `email` (unique)
  - `password` (hashed)
  - `userType` (teacher/student)
  - `emailVerified`

- **Teacher** - Teacher profiles
  - `userId` (links to User)
  - `name`
  - `department`
  - `class`

- **Student** - Student profiles
  - `userId` (optional, links to User)
  - `name`
  - `email`
  - `department`
  - `class`
  - `teacherId` (links to Teacher)

- **StudentInvite** - Invitation tokens
  - `email`
  - `token` (unique)
  - `teacherId`
  - `expiresAt` (7 days)

- **AttendanceCode** - 2-minute codes
  - `code` (unique)
  - `teacherId`
  - `expiresAt` (2 minutes, TTL index)

- **AttendanceRecord** - Student submissions
  - `studentId`
  - `code`
  - `submitDate`
  - `status`

## 🔐 Security Features

- ✅ **Password Security**
  - `bcryptjs` with 10 salt rounds
  - Passwords never logged or exposed
  - Hashed before storage

- ✅ **JWT Authentication**
  - 7-day token expiry
  - Signed with secret
  - Verified on each request

- ✅ **Email Security**
  - One-time invitation tokens
  - 7-day token expiry
  - Email verification recommended

- ✅ **API Security**
  - CORS restricted to frontend URL
  - Input validation
  - Error messages sanitized
  - No sensitive data in responses

- ✅ **Database Security**
  - Indexed queries
  - TTL auto-cleanup
  - Auto-expiring codes and invites

## 🚀 Deployment

<table>
<tr>
<td width="50%">

### 🔵 Backend (Render)

1. Push to [GitHub](https://github.com)
2. Connect to [Render](https://render.com)
3. Set environment variables
4. Deploy automatically



</td>
<td width="50%">

### ▲ Frontend (Vercel)

1. Push to [GitHub](https://github.com)
2. Connect to [Vercel](https://vercel.com)
3. Set `VITE_API_URL`
4. Deploy automatically


</td>
</tr>
</table>

> **💡 Pro Tip:** Use MongoDB Atlas free tier for production database

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

## 📦 Tech Stack


<details>
<summary><b>📋 Complete Dependencies</b></summary>

#### Frontend Stack
- **React** `18.3.1` - UI library
- **TypeScript** `5.8.3` - Type safety
- **Vite** `5.4.19` - Build tool
- **Tailwind CSS** `3.4.17` - Styling
- **shadcn/ui** - Component library
- **React Router** `6.30.1` - Routing
- **React Hook Form** `7.61.1` - Form handling
- **Zod** `3.25.76` - Validation

#### Backend Stack
- **Express.js** `4.18.2` - Web framework
- **TypeScript** `5.3.3` - Type safety
- **MongoDB** `4.0+` - Database
- **Mongoose** `8.0.0` - ODM
- **JWT** `9.1.2` - Authentication
- **bcryptjs** `2.4.3` - Password hashing
- **Resend** `3.0.0` - Email service
- **Cors** `2.8.5` - Cross-origin
- **dotenv** `16.3.1` - Environment config

</details>

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

## ❓ Frequently Asked Questions

- **Q: Why MERN instead of Supabase?**
  - A: More control, better for learning, easier customization, and great for portfolio projects.

- **Q: Can I deploy for free?**
  - A: Yes! MongoDB Atlas (free tier), Render (free tier), Vercel (free tier).

- **Q: Is this production-ready?**
  - A: Yes! With proper environment variables and deployment setup.

## 📞 Support

- 🚀 **Quick Setup:** See `QUICK_START.md`

## 🎓 Educational Use

This project is designed for:

- Portfolio demonstrations
- Learning full-stack development
- PLP (Practical Learning Program) submissions
- Interview preparation
- Production-ready code examples

---

<div align="center">

## ✨ Key Highlights

```
✅ Full MERN Stack          ✅ JWT Authentication       ✅ Email Integration
✅ MongoDB + Mongoose        ✅ TypeScript Support       ✅ Responsive UI
✅ RESTful API Design        ✅ Production Ready         ✅ Clean Code Structure
```

### 🎓 Perfect For

🎯 Portfolio Projects • 📚 Learning Full-Stack • 🏆 PLP Submissions • 💼 Interview Prep

---

### 📞 Support & Community



**[Report Bug](https://github.com/okelo0121/present-smart-code/issues)** • **[Request Feature](https://github.com/okelo0121/present-smart-code/issues)** • **[Join Discussion](https://github.com/okelo0121/present-smart-code/discussions)**

---

### 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

<sub>Built with ❤️ for learning and production use • [⭐ Star this repo](https://github.com/okelo0121/present-smart-code) if you found it helpful!</sub>

**[🚀 Get Started](QUICK_START.md)** • **[📦 Latest Release](https://github.com/okelo0121/present-smart-code/releases)** • **[🌐 Live Demo](https://www.edutrack.store)**

</div>
