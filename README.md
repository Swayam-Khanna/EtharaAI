# Ethara.AI — Project Management Platform

A full-stack, production-ready **Project Management Web Application** with Role-Based Access Control (RBAC), interactive Kanban boards, team management, and real-time analytics dashboards.

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based secure authentication (signup / login / logout)
- Password hashing with **bcryptjs**
- Protected routes with middleware-based token verification
- Role-Based Access Control — **Admin** and **Member** roles

### 📊 Dashboard & Analytics
- High-density bento-grid metrics panel (active projects, task completion, overdue alerts)
- Interactive **Recharts** bar and pie charts for task status and priority distribution
- Upcoming deadlines tracker with real-time countdown

### 📁 Project Management
- Create, read, update, delete projects (Admin only)
- Assign and revoke team members per project
- Project detail view with task breakdowns and member rosters

### 📋 Task Kanban Board
- Swimlane columns: **Todo → In Progress → Done**
- Role-aware status editing (Members can only update their own assigned tasks)
- Filter tasks by project
- Admin can create, edit, and delete tasks

### 👥 Team Management
- Full user directory with role labels and registration dates
- Real-time search filter
- Admin-only access

### 👤 User Profile
- Personal workspace summary
- Session info and task completion statistics

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), Tailwind CSS, React Router DOM |
| State Management | React Context API |
| Forms & Validation | React Hook Form + Zod |
| HTTP Client | Axios |
| Charts | Recharts |
| Notifications | React Hot Toast |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose ODM |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Security | Helmet, CORS, express-rate-limit |
| Logging | Morgan |

---

## 📂 Project Structure

```
Ethara.AI/
├── client/                     # React Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── context/            # AuthContext (global auth state)
│   │   ├── layouts/            # DashboardLayout (sidebar + header shell)
│   │   ├── pages/              # Route-level page components
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── ProjectDetails.jsx
│   │   │   ├── Tasks.jsx
│   │   │   ├── TeamManagement.jsx
│   │   │   └── Profile.jsx
│   │   ├── routes/             # AppRoutes + ProtectedRoute guard
│   │   ├── services/           # Axios API client (api.js)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                    # Client environment variables
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── server/                     # Express REST API backend
    ├── src/
    │   ├── config/             # MongoDB connection (db.js)
    │   ├── controllers/        # MVC controller logic
    │   │   ├── authController.js
    │   │   ├── projectController.js
    │   │   ├── taskController.js
    │   │   ├── dashboardController.js
    │   │   └── userController.js
    │   ├── middleware/         # Auth, role, validation, error handlers
    │   ├── models/             # Mongoose schemas (User, Project, Task)
    │   ├── routes/             # Express route definitions
    │   ├── utils/              # asyncHandler, ErrorResponse, seed script
    │   ├── validators/         # Zod validation schemas
    │   └── index.js            # Express app entry point
    ├── .env                    # Server environment variables
    ├── .env.example            # Environment variable template
    └── package.json
```

---

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) running locally (or a MongoDB Atlas URI)
- npm

---

### 1. Clone the Repository

```bash
git clone https://github.com/Swayam-Khanna/EtharaAI
cd ethara-ai
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Create the `.env` file (copy from the example):

```bash
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/project-management
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Seed the database with default users, projects, and tasks:

```bash
npm run seed
```

Start the development server:

```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

> **Health check:** `GET http://localhost:5000/health`

---

### 3. Frontend Setup

```bash
cd client
npm install
```

Create the `.env` file:

```bash
# client/.env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

The app will be running at `http://localhost:5173`.

---

### 4. Default Login Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@workspace.com` | `password123` |
| Member | `member1@workspace.com` | `password123` |

---

## 🔑 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/signup` | Register a new user | Public |
| POST | `/api/auth/login` | Login and receive JWT | Public |
| GET | `/api/auth/me` | Get current user profile | Protected |

### Projects
| Method | Endpoint | Description | Role |
|---|---|---|---|
| GET | `/api/projects` | List all projects | Admin / Member |
| POST | `/api/projects` | Create a project | Admin |
| GET | `/api/projects/:id` | Get project details | Admin / Member |
| PUT | `/api/projects/:id` | Update project | Admin |
| DELETE | `/api/projects/:id` | Delete project | Admin |
| POST | `/api/projects/:id/members` | Add member to project | Admin |
| DELETE | `/api/projects/:id/members/:userId` | Remove member | Admin |

### Tasks
| Method | Endpoint | Description | Role |
|---|---|---|---|
| GET | `/api/tasks` | List tasks (filtered by project) | Admin / Member |
| POST | `/api/tasks` | Create a task | Admin |
| PUT | `/api/tasks/:id` | Update task | Admin |
| PATCH | `/api/tasks/:id/status` | Update task status | Admin / Assigned Member |
| DELETE | `/api/tasks/:id` | Delete task | Admin |

### Dashboard
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/dashboard` | Get aggregated analytics data | Protected |

### Users
| Method | Endpoint | Description | Role |
|---|---|---|---|
| GET | `/api/users` | List all users | Admin |

---

## 🔒 RBAC — Role-Based Access Control

| Capability | Admin | Member |
|---|:---:|:---:|
| Create / Edit / Delete Projects | ✅ | ❌ |
| Manage Team Members | ✅ | ❌ |
| Create / Edit / Delete Tasks | ✅ | ❌ |
| Update Status on Own Tasks | ✅ | ✅ |
| View Dashboard Analytics | ✅ | ✅ |
| View Team Management Page | ✅ | ❌ |

---

## 🚀 Production Build

Build the client for production:

```bash
cd client
npm run build
```

The optimized static assets will be output to `client/dist/`. You can serve this with any static file host (Vercel, Netlify, Nginx, etc.) and set the `VITE_API_URL` environment variable to point to your live backend URL.

---

## 🌐 Deployment Guide

### Frontend (Vercel)
1. Push to GitHub
2. Connect repo to Vercel
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-api-domain.com/api`

### Backend (Railway)
1. Connect repo to your hosting provider
2. Set start command: `npm start`
3. Add all environment variables from `.env.example`
4. Set `NODE_ENV=production`
5. Update `CLIENT_URL` to your deployed frontend URL

---