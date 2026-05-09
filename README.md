# HelpMeMan — Premium Mentorship Platform

> Book 1-on-1 video sessions with verified mentors from IITs, AIIMS, NLUs, FAANG companies, and elite startups.

## Tech Stack

### Backend
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (access + refresh tokens) + bcrypt
- **Email**: Nodemailer (SMTP/SendGrid)
- **Payments**: Razorpay
- **Meetings**: Google Calendar API + Google Meet
- **File Storage**: Cloudinary
- **Real-time**: Socket.io
- **Job Queue**: BullMQ (Redis)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State**: React Context
- **HTTP**: Axios
- **Charts**: Recharts

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis (optional, for job queue)

### Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your database URL and API keys
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Default Admin
- Email: `admin@helpmeman.com`
- Password: `admin123`

## Project Structure
```
helpmeman/
├── backend/
│   ├── prisma/          # Schema + migrations + seed
│   └── src/
│       ├── config/      # Environment config
│       ├── middleware/   # Auth, roleGuard, rateLimiter, validate
│       ├── routes/      # Express routes
│       ├── controllers/ # Request handlers
│       ├── services/    # Business logic (email, payment, etc.)
│       ├── sockets/     # Socket.io chat
│       ├── jobs/        # BullMQ workers
│       └── utils/       # JWT, hash, OTP, email domains
├── frontend/
│   └── src/
│       ├── app/         # Next.js pages
│       ├── components/  # React components
│       └── lib/         # API client, auth context, utils
└── README.md
```

## Features
- ✅ User & mentor registration with email verification
- ✅ Mentor email verification (OTP to institution email)
- ✅ Admin approval workflow
- ✅ Mentor search with filters (category, institution, price, rating)
- ✅ Pre-booking chat (3 free messages per user)
- ✅ Razorpay payment integration
- ✅ Google Meet link generation
- ✅ Session reminders (1 hour before)
- ✅ Review & rating system
- ✅ Earnings tracking & payouts
- ✅ Real-time notifications (Socket.io)
- ✅ Admin dashboard with analytics
- ✅ Responsive, dark-themed UI

## License
Private — All rights reserved.
