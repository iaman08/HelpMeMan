# HelpMeMan — Full-Stack Prompt for Antigravity

> Paste everything below this line into Antigravity as your project prompt.

---

## Project Overview

Build **HelpMeMan** — a premium mentorship platform where students and professionals book one-on-one video sessions with verified mentors from IITs, AIIMS, NLUs, FAANG companies, and elite startups.

**Tech stack:**
- Backend: Node.js + Express (REST API)
- Database: PostgreSQL with Prisma ORM
- Auth: JWT (access + refresh tokens) + bcrypt password hashing
- Email: Nodemailer (SMTP) or SendGrid
- Payments: Razorpay (primary) with Stripe fallback
- Meetings: Google Calendar API + Google Meet link generation
- File storage: Cloudinary (profile photos, verification docs)
- Search: Prisma full-text search + category/tag filtering
- Real-time chat: Socket.io (pre-booking chat threads)
- Frontend: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- Deployment-ready: environment variables for all secrets

---

## Database Schema (PostgreSQL + Prisma)

```prisma
model User {
  id              String    @id @default(cuid())
  name            String
  email           String    @unique
  passwordHash    String
  phone           String?
  avatar          String?
  role            Role      @default(USER)
  isEmailVerified Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  bookings        Booking[]
  reviews         Review[]
  notifications   Notification[]
  refreshTokens   RefreshToken[]
  chatThreads     ChatThread[]
  chatMessages    ChatMessage[]
}

model Mentor {
  id                String          @id @default(cuid())
  userId            String          @unique
  user              User            @relation(fields: [userId], references: [id])
  displayName       String
  bio               String          @db.Text
  avatar            String?
  institutionType   InstitutionType  // COLLEGE | COMPANY | STARTUP
  institutionName   String
  institutionEmail  String          @unique   // college/company email for verification
  department        String?
  graduationYear    Int?
  currentRole       String?
  company           String?
  linkedinUrl       String?
  expertise         String[]        // array of tags
  categoryId        String
  category          Category        @relation(fields: [categoryId], references: [id])
  approvalStatus    ApprovalStatus  @default(PENDING)
  rejectionReason   String?
  isActive          Boolean         @default(false)
  pricePerSession   Int             // in paise (₹)
  sessionDuration   Int             @default(30) // minutes
  googleCalendarId  String?
  totalSessions     Int             @default(0)
  rating            Float           @default(0)
  availabilities    Availability[]
  bookings          Booking[]
  reviews           Review[]
  verificationDocs  VerificationDoc[]
  notifications     Notification[]
  earnings          Earning[]
  chatThreads       ChatThread[]
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
}

model Category {
  id          String    @id @default(cuid())
  name        String    @unique   // e.g. "JEE/NEET Prep", "Campus Placements", "FAANG", "MBA", "Law", "Startup"
  slug        String    @unique
  icon        String?
  description String?
  isActive    Boolean   @default(true)
  mentors     Mentor[]
}

model Availability {
  id         String   @id @default(cuid())
  mentorId   String
  mentor     Mentor   @relation(fields: [mentorId], references: [id])
  dayOfWeek  Int      // 0=Sun … 6=Sat
  startTime  String   // "09:00"
  endTime    String   // "17:00"
  isActive   Boolean  @default(true)
}

model Booking {
  id              String        @id @default(cuid())
  userId          String
  user            User          @relation(fields: [userId], references: [id])
  mentorId        String
  mentor          Mentor        @relation(fields: [mentorId], references: [id])
  scheduledAt     DateTime
  durationMinutes Int           @default(30)
  status          BookingStatus @default(PENDING)
  meetLink        String?
  googleEventId   String?
  paymentId       String?
  paymentStatus   PaymentStatus @default(UNPAID)
  amountPaid      Int           // in paise
  userNotes       String?
  mentorNotes     String?
  cancelledBy     String?
  cancellationReason String?
  review          Review?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model Review {
  id         String   @id @default(cuid())
  bookingId  String   @unique
  booking    Booking  @relation(fields: [bookingId], references: [id])
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  mentorId   String
  mentor     Mentor   @relation(fields: [mentorId], references: [id])
  rating     Int      // 1–5
  comment    String?  @db.Text
  isVisible  Boolean  @default(true)
  createdAt  DateTime @default(now())
}

model VerificationDoc {
  id         String   @id @default(cuid())
  mentorId   String
  mentor     Mentor   @relation(fields: [mentorId], references: [id])
  docType    String   // "id_card" | "offer_letter" | "marksheet"
  fileUrl    String
  uploadedAt DateTime @default(now())
}

model Notification {
  id         String   @id @default(cuid())
  userId     String?
  user       User?    @relation(fields: [userId], references: [id])
  mentorId   String?
  mentor     Mentor?  @relation(fields: [mentorId], references: [id])
  type       String   // "BOOKING_CONFIRMED" | "MENTOR_APPROVED" | "SESSION_REMINDER" etc.
  title      String
  body       String
  isRead     Boolean  @default(false)
  createdAt  DateTime @default(now())
}

model Earning {
  id         String   @id @default(cuid())
  mentorId   String
  mentor     Mentor   @relation(fields: [mentorId], references: [id])
  bookingId  String
  amount     Int      // in paise (after platform cut)
  status     String   @default("PENDING") // PENDING | PAID
  paidAt     DateTime?
  createdAt  DateTime @default(now())
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime
  createdAt DateTime @default(now())
}

// ─── Pre-booking chat (free intro chat before payment) ───

model ChatThread {
  id           String      @id @default(cuid())
  userId       String
  user         User        @relation(fields: [userId], references: [id])
  mentorId     String
  mentor       Mentor      @relation(fields: [mentorId], references: [id])
  status       ThreadStatus @default(OPEN)
  // Hard limits to keep it free and bounded
  userMsgCount  Int         @default(0)  // max 3 messages from user
  mentorMsgCount Int        @default(0)  // max 3 replies from mentor
  isLockedForBooking Boolean @default(false)  // true once limit hit
  bookingId    String?     // set if user went on to book
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  messages     ChatMessage[]

  @@unique([userId, mentorId])  // one thread per user-mentor pair
}

model ChatMessage {
  id         String      @id @default(cuid())
  threadId   String
  thread     ChatThread  @relation(fields: [threadId], references: [id])
  senderId   String      // userId or mentor's userId
  senderRole SenderRole
  body       String      @db.Text  // max 500 chars enforced in API
  isRead     Boolean     @default(false)
  createdAt  DateTime    @default(now())
}

enum ThreadStatus {
  OPEN        // actively chatting
  LOCKED      // message limit reached, user must book to continue
  BOOKED      // user booked a session
  CLOSED      // mentor or admin closed it
}

enum SenderRole {
  USER
  MENTOR
}

enum Role {
  USER
  MENTOR
  ADMIN
}

enum InstitutionType {
  COLLEGE
  COMPANY
  STARTUP
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}

enum BookingStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
  NO_SHOW
}

enum PaymentStatus {
  UNPAID
  PAID
  REFUNDED
}
```

---

## Backend API — All Endpoints

### Auth (`/api/auth`)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/register` | Register user (role: USER). Send email verification link. |
| POST | `/register/mentor` | Register mentor with institutionEmail. If college/university, validate email domain against known edu domains. Send OTP to institutionEmail. Create mentor in PENDING state. Notify admin. |
| POST | `/verify-email` | Verify email via token |
| POST | `/login` | Login (any role). Returns accessToken (15m) + refreshToken (7d). |
| POST | `/refresh` | Exchange refreshToken for new accessToken |
| POST | `/logout` | Invalidate refreshToken |
| POST | `/forgot-password` | Send reset link |
| POST | `/reset-password` | Reset with token |

**Mentor signup rules:**
- If `institutionType === COLLEGE`, enforce that `institutionEmail` ends in a known `.edu`, `.ac.in`, or whitelisted university domain (maintain a list). Send OTP to that email to verify they actually own it.
- If `institutionType === COMPANY`, verify domain matches `company` field (e.g. @google.com, @amazon.com).
- After OTP verified → status = PENDING, admin gets email + in-app notification.

### Admin (`/api/admin`) — role: ADMIN only

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/dashboard` | Total users, mentors, sessions, revenue today/week/month, pending approvals count |
| GET | `/mentors/pending` | Paginated list of pending mentor applications |
| GET | `/mentors/:id` | Full mentor profile + uploaded docs |
| POST | `/mentors/:id/approve` | Approve mentor → set `approvalStatus=APPROVED`, `isActive=true`, send approval email |
| POST | `/mentors/:id/reject` | Body: `{ reason: string }` → set `approvalStatus=REJECTED`, send rejection email with reason |
| GET | `/mentors` | All mentors with filters: status, category, institutionType |
| PUT | `/mentors/:id/toggle-active` | Suspend / reactivate a mentor |
| GET | `/users` | All users with search + pagination |
| DELETE | `/users/:id` | Soft-delete user |
| GET | `/bookings` | All bookings with filters: status, date range, mentor |
| GET | `/categories` | List categories |
| POST | `/categories` | Create category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Soft-delete |
| GET | `/earnings` | Platform earnings by period |
| POST | `/earnings/payout` | Mark mentor earnings as paid |
| GET | `/reviews` | All reviews, flag/hide |
| GET | `/chats` | All chat threads with search (filter by status: OPEN, LOCKED, BOOKED, CLOSED) |
| POST | `/chats/:threadId/close` | Force-close a thread (abuse, spam) |
| GET | `/chats/stats` | Threads opened today, conversion rate (threads → bookings) |

### Users (`/api/users`) — role: USER

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/me` | Get own profile |
| PUT | `/me` | Update name, phone, avatar |
| PUT | `/me/password` | Change password |
| GET | `/me/bookings` | Own bookings with status filter |
| GET | `/me/bookings/:id` | Single booking detail + Meet link |
| POST | `/me/bookings/:id/cancel` | Cancel booking (refund if >24h before) |
| POST | `/me/bookings/:id/review` | Submit review after session |
| GET | `/me/notifications` | Paginated notifications |
| PUT | `/me/notifications/:id/read` | Mark as read |
| PUT | `/me/notifications/read-all` | Mark all read |

### Mentors (public) (`/api/mentors`)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Search + filter mentors (see below) |
| GET | `/:id` | Public mentor profile |
| GET | `/:id/availability` | Available time slots for a given date range |
| GET | `/:id/reviews` | Paginated reviews |

**Search & filter parameters:**
```
GET /api/mentors?
  q=string              (full-text: name, bio, expertise)
  category=slug
  institutionType=COLLEGE|COMPANY|STARTUP
  institution=string    (IIT Delhi, Google, etc.)
  minPrice=number
  maxPrice=number
  minRating=number
  expertise[]=tag
  sortBy=rating|price|sessions|newest
  page=1&limit=12
```

### Mentor Dashboard (`/api/mentor`) — role: MENTOR

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/me` | Own mentor profile |
| PUT | `/me` | Update bio, expertise, price, duration, linkedinUrl |
| PUT | `/me/avatar` | Upload avatar to Cloudinary |
| POST | `/me/docs` | Upload verification doc to Cloudinary |
| GET | `/me/availability` | Get weekly availability slots |
| PUT | `/me/availability` | Set/update weekly availability |
| GET | `/me/bookings` | Bookings with filter: upcoming, past, cancelled |
| PUT | `/me/bookings/:id/notes` | Add session notes |
| POST | `/me/bookings/:id/reschedule` | Propose new time (user must confirm) |
| GET | `/me/earnings` | Earnings summary + transaction list |
| GET | `/me/reviews` | Own reviews |
| GET | `/me/stats` | Sessions count, rating, response rate |

### Bookings (`/api/bookings`)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/` | Create booking: body `{ mentorId, scheduledAt, durationMinutes }` → returns Razorpay order |
| POST | `/:id/verify-payment` | Verify Razorpay signature → confirm booking, create Google Meet link, send emails |
| GET | `/:id/meet-link` | Get Meet link (only for booking owner or mentor) |

### Payments (`/api/payments`)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/create-order` | Create Razorpay order for a booking |
| POST | `/verify` | Verify payment signature |
| POST | `/webhook` | Razorpay webhook handler |

### Categories (`/api/categories`) — public

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | All active categories |

---

### Pre-booking Chat (`/api/chat`) — role: USER or MENTOR

This is the **free intro chat** feature. A user can send up to **3 messages** to a mentor before booking. The mentor can reply up to **3 times**. Once either limit is hit, the thread locks and the user sees a "Book a session to continue the conversation" CTA. This is real-time via Socket.io.

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/threads` | Start a chat thread with a mentor. Body: `{ mentorId }`. Creates thread if none exists. Returns existing thread if already started. Only authenticated USERs can initiate. |
| GET | `/threads` | List all of the caller's threads (USER sees their threads; MENTOR sees all incoming threads) |
| GET | `/threads/:threadId` | Get thread detail + all messages. Only thread participants can access. |
| POST | `/threads/:threadId/messages` | Send a message. Body: `{ body: string }` (max 500 chars). Enforces message count limits. After sending, emits Socket.io event to the other participant. |
| PUT | `/threads/:threadId/read` | Mark all unread messages in thread as read (called when user opens thread) |
| POST | `/threads/:threadId/close` | Mentor or admin can close a thread (e.g. spam, irrelevant). Sets status = CLOSED. |

**Business rules (enforce in API, not just frontend):**
- A user may only have **one thread per mentor**. If thread already exists, `POST /threads` returns it.
- `POST /threads/:threadId/messages` checks `userMsgCount` or `mentorMsgCount` (based on sender role) against the limit of **3**. If at limit, return `403` with `{ locked: true, reason: "MESSAGE_LIMIT_REACHED" }`.
- When either side hits their limit, set `thread.status = LOCKED` and `thread.isLockedForBooking = true`.
- A mentor can only reply to a thread if the user has sent at least 1 message first (no cold messages from mentors).
- Message body max 500 characters — validate server-side with zod.
- Mentor is notified (in-app + email) when a new thread is started and when the user sends a message.
- User is notified (in-app + email) when mentor replies.
- When a booking is completed by the user for this mentor, set `thread.bookingId` and `thread.status = BOOKED`. The thread UI shows a "Session booked ✓" state.

**Socket.io events for real-time chat:**

```javascript
// Server emits to room `chat:${threadId}`
socket.to(`chat:${threadId}`).emit('new_message', {
  id: message.id,
  body: message.body,
  senderRole: message.senderRole,
  senderId: message.senderId,
  createdAt: message.createdAt,
  threadStatus: thread.status,
  userMsgCount: thread.userMsgCount,
  mentorMsgCount: thread.mentorMsgCount,
});

// If thread just got locked, also emit:
socket.to(`chat:${threadId}`).emit('thread_locked', {
  threadId,
  reason: 'MESSAGE_LIMIT_REACHED',
});

// Client joins room on thread open:
socket.emit('join_thread', { threadId });
```

---

## Core Business Logic

### 1. Mentor Email Verification (College vs Company)

```javascript
// services/mentorVerification.js

const EDU_DOMAINS = [
  'iitb.ac.in', 'iitd.ac.in', 'iitm.ac.in', 'iitkgp.ac.in', 'iitk.ac.in',
  'iitg.ac.in', 'iith.ac.in', 'iiti.ac.in', 'iitbbs.ac.in', 'iitmandi.ac.in',
  'iitpkd.ac.in', 'iitropar.ac.in', 'iitrpr.ac.in', 'iitjammu.ac.in',
  'aiims.edu', 'aiimsnagpur.edu.in', 'aiimspatna.edu.in', 'aiimsbhopal.edu.in',
  'nlsiu.ac.in', 'nujs.edu', 'nalsar.ac.in', 'nlujodhpur.ac.in',
  'bits-pilani.ac.in', 'pilani.bits-pilani.ac.in', 'goa.bits-pilani.ac.in',
  'hyderabad.bits-pilani.ac.in', 'dubai.bits-pilani.ac.in',
  'du.ac.in', 'iisc.ac.in', 'iimb.ac.in', 'iima.ac.in', 'iimc.ac.in',
  // ... add more
];

const FAANG_DOMAINS = [
  'google.com', 'amazon.com', 'meta.com', 'apple.com', 'netflix.com',
  'microsoft.com', 'linkedin.com', 'uber.com', 'airbnb.com', 'stripe.com',
  'razorpay.com', 'flipkart.com', 'zomato.com', 'swiggy.in', 'paytm.com',
  // ...
];

function getEmailDomain(email) {
  return email.split('@')[1]?.toLowerCase();
}

function isValidCollegeEmail(email) {
  const domain = getEmailDomain(email);
  return EDU_DOMAINS.includes(domain) || domain?.endsWith('.ac.in') || domain?.endsWith('.edu');
}

function isValidCompanyEmail(email, companyName) {
  const domain = getEmailDomain(email);
  // check domain matches stated company, or is in known list
  return FAANG_DOMAINS.includes(domain);
}
```

### 2. Admin Approval & Email Notifications

```javascript
// services/mentorApproval.js

async function approveMentor(mentorId, adminId) {
  const mentor = await prisma.mentor.update({
    where: { id: mentorId },
    data: { approvalStatus: 'APPROVED', isActive: true },
    include: { user: true }
  });

  await sendEmail({
    to: mentor.user.email,
    subject: '🎉 You are approved on HelpMeMan!',
    html: approvalEmailTemplate(mentor)
  });

  // Also email to institutionEmail as secondary confirmation
  await sendEmail({
    to: mentor.institutionEmail,
    subject: 'HelpMeMan mentor verification confirmed',
    html: institutionConfirmTemplate(mentor)
  });

  await createNotification({
    mentorId: mentor.id,
    type: 'MENTOR_APPROVED',
    title: 'Your profile is live!',
    body: 'Congratulations! Students can now book sessions with you.'
  });

  return mentor;
}

async function rejectMentor(mentorId, reason, adminId) {
  const mentor = await prisma.mentor.update({
    where: { id: mentorId },
    data: { approvalStatus: 'REJECTED', rejectionReason: reason },
    include: { user: true }
  });

  await sendEmail({
    to: mentor.user.email,
    subject: 'Update on your HelpMeMan mentor application',
    html: rejectionEmailTemplate(mentor, reason)
  });

  await createNotification({
    mentorId: mentor.id,
    type: 'MENTOR_REJECTED',
    title: 'Application update',
    body: `Your application was not approved: ${reason}`
  });

  return mentor;
}
```

### 3a. Pre-booking Chat Service

```javascript
// services/chat.service.js

async function startOrGetThread(userId, mentorId) {
  // One thread per user-mentor pair
  let thread = await prisma.chatThread.findUnique({
    where: { userId_mentorId: { userId, mentorId } },
    include: { messages: { orderBy: { createdAt: 'asc' } } }
  });

  if (!thread) {
    thread = await prisma.chatThread.create({
      data: { userId, mentorId },
      include: { messages: true }
    });

    // Notify mentor: new chat started
    await createNotification({
      mentorId,
      type: 'NEW_CHAT_THREAD',
      title: 'Someone wants to chat',
      body: `A student has started a conversation with you before booking.`
    });
    // Also send email to mentor
    await sendNewChatThreadEmail(mentorId, userId);
  }

  return thread;
}

async function sendMessage(threadId, senderId, senderRole, body) {
  if (body.length > 500) throw new Error('BODY_TOO_LONG');

  const thread = await prisma.chatThread.findUnique({ where: { id: threadId } });
  if (!thread) throw new Error('THREAD_NOT_FOUND');
  if (thread.status === 'LOCKED' || thread.status === 'CLOSED') {
    throw new AppError(403, 'THREAD_LOCKED');
  }

  // Check message limits
  const isUser = senderRole === 'USER';
  const countField = isUser ? 'userMsgCount' : 'mentorMsgCount';
  if (thread[countField] >= 3) {
    throw new AppError(403, 'MESSAGE_LIMIT_REACHED');
  }

  // Create message + increment count
  const [message, updatedThread] = await prisma.$transaction([
    prisma.chatMessage.create({
      data: { threadId, senderId, senderRole, body }
    }),
    prisma.chatThread.update({
      where: { id: threadId },
      data: {
        [countField]: { increment: 1 },
        // Lock thread if this was the 3rd message from either side
        status: thread[countField] + 1 >= 3 ? 'LOCKED' : thread.status,
        isLockedForBooking: thread[countField] + 1 >= 3 ? true : thread.isLockedForBooking,
        updatedAt: new Date(),
      }
    })
  ]);

  // Notify the other participant
  if (isUser) {
    await createNotification({
      mentorId: thread.mentorId,
      type: 'CHAT_MESSAGE',
      title: 'New message',
      body: body.substring(0, 80) + (body.length > 80 ? '…' : '')
    });
  } else {
    await createNotification({
      userId: thread.userId,
      type: 'CHAT_REPLY',
      title: `Your mentor replied`,
      body: body.substring(0, 80) + (body.length > 80 ? '…' : '')
    });
  }

  return { message, thread: updatedThread };
}
```

### 3. Google Meet Link Generation

```javascript
// services/googleMeet.js
// Uses Google Calendar API with conferencing

const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Use a service account or stored OAuth tokens for the platform's Google account
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

async function createMeetingEvent({ booking, mentor, user }) {
  const event = {
    summary: `HelpMeMan Session: ${user.name} with ${mentor.displayName}`,
    description: `Your mentorship session on HelpMeMan.\n\nMentor: ${mentor.displayName}\nStudent: ${user.name}\n\nBooking ID: ${booking.id}`,
    start: {
      dateTime: booking.scheduledAt.toISOString(),
      timeZone: 'Asia/Kolkata',
    },
    end: {
      dateTime: new Date(booking.scheduledAt.getTime() + booking.durationMinutes * 60000).toISOString(),
      timeZone: 'Asia/Kolkata',
    },
    attendees: [
      { email: user.email, displayName: user.name },
      { email: mentor.user.email, displayName: mentor.displayName },
    ],
    conferenceData: {
      createRequest: {
        requestId: `helpmeman-${booking.id}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 60 },
        { method: 'popup', minutes: 15 },
      ],
    },
    guestsCanModify: false,
    guestsCanInviteOthers: false,
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
    conferenceDataVersion: 1,
    sendUpdates: 'all', // sends Google Calendar invites to all attendees
  });

  return {
    googleEventId: response.data.id,
    meetLink: response.data.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri,
    htmlLink: response.data.htmlLink,
  };
}

async function cancelMeetingEvent(googleEventId) {
  await calendar.events.delete({
    calendarId: 'primary',
    eventId: googleEventId,
    sendUpdates: 'all',
  });
}
```

### 4. Booking Flow (Payment → Meet Link → Emails)

```javascript
// services/booking.js

async function confirmBookingAfterPayment(bookingId, paymentData) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      mentor: { include: { user: true } }
    }
  });

  // Verify Razorpay signature
  verifyRazorpaySignature(paymentData);

  // Create Google Meet event
  const { googleEventId, meetLink } = await createMeetingEvent({
    booking,
    mentor: booking.mentor,
    user: booking.user,
  });

  // Update booking
  const confirmed = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentId: paymentData.razorpay_payment_id,
      googleEventId,
      meetLink,
    }
  });

  // Create earning record for mentor (platform takes 20%)
  await prisma.earning.create({
    data: {
      mentorId: booking.mentorId,
      bookingId: booking.id,
      amount: Math.floor(booking.amountPaid * 0.80),
      status: 'PENDING'
    }
  });

  // Increment mentor session count
  await prisma.mentor.update({
    where: { id: booking.mentorId },
    data: { totalSessions: { increment: 1 } }
  });

  // Send confirmation emails with Meet link
  await Promise.all([
    sendBookingConfirmationToUser(booking.user, booking.mentor, confirmed),
    sendBookingConfirmationToMentor(booking.mentor.user, booking.user, confirmed),
  ]);

  // Create notifications
  await Promise.all([
    createNotification({
      userId: booking.userId,
      type: 'BOOKING_CONFIRMED',
      title: 'Session confirmed!',
      body: `Your session with ${booking.mentor.displayName} is confirmed. Google Meet link is ready.`
    }),
    createNotification({
      mentorId: booking.mentorId,
      type: 'NEW_BOOKING',
      title: 'New session booked',
      body: `${booking.user.name} has booked a session with you on ${booking.scheduledAt.toLocaleDateString()}.`
    }),
  ]);

  // Schedule reminder 1 hour before (use a job queue like Bull/BullMQ)
  await scheduleSessionReminder(confirmed);

  return confirmed;
}
```

### 5. Session Reminder Job (BullMQ)

```javascript
// jobs/sessionReminder.js
// Schedule email + notification 1 hour before session

const { Queue, Worker } = require('bullmq');

const reminderQueue = new Queue('session-reminders', { connection: redisConnection });

async function scheduleSessionReminder(booking) {
  const fireAt = new Date(booking.scheduledAt.getTime() - 60 * 60 * 1000);
  const delay = fireAt.getTime() - Date.now();
  if (delay > 0) {
    await reminderQueue.add('remind', { bookingId: booking.id }, { delay });
  }
}

const worker = new Worker('session-reminders', async (job) => {
  const booking = await prisma.booking.findUnique({
    where: { id: job.data.bookingId },
    include: { user: true, mentor: { include: { user: true } } }
  });
  if (booking?.status === 'CONFIRMED') {
    await sendReminderEmail(booking.user, booking.mentor, booking);
    await sendReminderEmail(booking.mentor.user, booking.user, booking);
  }
}, { connection: redisConnection });
```

---

## Email Templates (HTML)

Build these 6 email templates with inline CSS (compatible with Gmail):

1. **Welcome email** — for new user/mentor signup
2. **Email verification** — OTP or magic link
3. **Mentor approved** — celebrate, show "Go Live" CTA button
4. **Mentor rejected** — polite, show rejection reason, invite to reapply
5. **Booking confirmed** — include Meet link (big CTA button), date/time, mentor/student details, calendar add link
6. **Session reminder** — 1 hour before, show Meet link prominently

---

## Frontend — Page Structure (Next.js 14 App Router)

### Public pages
```
/                         → Landing page (existing design)
/mentors                  → Browse + search + filter mentors
/mentors/[id]             → Mentor public profile + booking CTA
/login                    → Login (user or mentor toggle)
/signup                   → User signup
/mentor/signup            → Mentor signup (multi-step form)
/verify-email             → Email verification page
/forgot-password
/reset-password
```

### User dashboard (`/dashboard/...`)
```
/dashboard                → Overview: upcoming sessions, recent activity
/dashboard/bookings       → All bookings (upcoming / past / cancelled tabs)
/dashboard/bookings/[id]  → Single booking: Meet link (big button), details, review
/dashboard/chats          → All pre-booking chat threads list
/dashboard/chats/[threadId] → Single chat thread (real-time, shows lock CTA when limit hit)
/dashboard/notifications  → All notifications
/dashboard/profile        → Edit profile, change password
```

### Mentor dashboard (`/mentor/dashboard/...`)
```
/mentor/dashboard                  → Stats: sessions, rating, earnings overview, pending state banner
/mentor/dashboard/inbox            → Pre-booking chat inbox (all threads, unread badges)
/mentor/dashboard/inbox/[threadId] → Single chat thread with reply input
/mentor/dashboard/bookings         → Upcoming / past sessions
/mentor/dashboard/bookings/[id]    → Session detail, add notes
/mentor/dashboard/availability     → Weekly schedule builder
/mentor/dashboard/profile          → Edit bio, expertise, price, avatar
/mentor/dashboard/earnings         → Earnings table, payout history
/mentor/dashboard/notifications    → All notifications
```

### Admin dashboard (`/admin/...`)
```
/admin                           → Overview: key metrics, pending approvals alert
/admin/mentors/pending           → Approval queue (cards with docs viewer)
/admin/mentors                   → All mentors table with search/filter
/admin/mentors/[id]              → Full profile + approve/reject action
/admin/users                     → User management table
/admin/bookings                  → All bookings
/admin/categories                → Category CRUD
/admin/earnings                  → Revenue, mentor payouts
/admin/reviews                   → Review moderation
/admin/chats                     → Chat thread oversight (flag/close abuse threads)
```

---

## Admin Panel — Detailed Features

### Dashboard metrics cards
- Total users (with % growth this week)
- Total mentors (approved / pending / rejected breakdown)
- Total sessions (today / this week / this month)
- Total revenue (with platform cut breakdown)
- Pending approval count (red badge if > 0)

### Mentor approval queue (`/admin/mentors/pending`)
Each mentor card shows:
- Profile photo, name, institution, role
- Institution email (verified ✓ badge if OTP verified)
- Expertise tags, price per session
- Uploaded docs (click to preview in modal)
- **Approve** (green) and **Reject** (red) buttons
- Reject opens a modal with a required `Reason` textarea

### Mentor profile detail (`/admin/mentors/:id`)
Full view with:
- All profile fields
- Verification doc gallery (PDF/image preview)
- Activity log (when applied, emails sent)
- Approve / Reject / Suspend / Reactivate actions
- If already approved: link to public profile

---

## User Panel — Detailed Features

### Mentor search & filter (`/mentors`)
**Search bar:** full-text across name, bio, institution, expertise tags

**Filter sidebar:**
- Category (checkboxes with counts)
- Institution type: College / Company / Startup
- Specific institution (IIT Delhi, Google, etc.)
- Price range (slider: ₹0 – ₹1000)
- Min rating (star selector)
- Expertise tags (multi-select)
- Session duration: 30 min / 60 min

**Sort options:** Best rated · Lowest price · Most sessions · Newest

**Mentor cards show:** avatar, name, institution badge, expertise chips, rating stars, price, "Book" CTA

### Booking flow
1. User clicks "Book" on mentor profile
2. Calendar opens → picks date → sees available slots (30/60 min)
3. Confirm booking details page → pay via Razorpay
4. After payment: confirmation page with Meet link + "Add to Google Calendar" button
5. Reminder email sent 1 hour before

### Pre-booking chat (on mentor profile page)
- Every approved mentor profile shows a **"Chat before booking"** button
- Opens a slide-over / modal chat panel (real-time via Socket.io)
- Shows message counter: "2 of 3 messages used"
- When limit is hit, chat input is replaced with: "You've used your free messages. Book a session to keep the conversation going." + a "Book Now" CTA button
- If a booking already exists for this mentor, the thread shows a "Session booked ✓" banner
- Chat history is always accessible from `/dashboard/chats`

### Dashboard
- **Upcoming sessions** widget: next session countdown, Meet link button
- **Past sessions** with review prompts
- **Chats** tab: list of all chat threads (mentor avatar, last message preview, unread badge, "Book" CTA if locked)
- **Notification bell** with unread count

---

## Mentor Panel — Detailed Features

### Onboarding state (pending approval)
- Show banner: "Your profile is under review. We'll email you within 48 hours."
- Allow editing bio, expertise, availability (saved but not shown publicly)

### Availability builder
- Weekly grid (Sun–Sat × time slots in 30-min blocks)
- Click to toggle available/unavailable
- Set recurring weekly schedule

### Booking management
- Upcoming sessions list with countdown timers
- "Join Meet" button appears 15 minutes before session
- After session: prompt to add notes
- Cancel button (auto-notifies user, triggers refund if eligible)

### Pre-booking chat inbox
- Dedicated **Inbox** tab in mentor dashboard
- Lists all chat threads sorted by most recent message
- Each thread shows: user avatar, name, last message snippet, time, unread count badge
- Thread detail view: full message history, reply input (up to 3 replies)
- When mentor has replied 3 times, their input is disabled with note: "Message limit reached. The student must book a session to continue."
- Mentor can **close** a thread (e.g. spam) — thread becomes CLOSED, user sees "This conversation was closed by the mentor."
- Mentor can tap "Suggest booking" to send a system message: "Ready to go deeper? Book a session with me!"

### Earnings
- Summary: total earned, pending payout, platform fee (20%)
- Per-session breakdown table
- Payout request button (admin processes manually or auto)

---

## Mentor Signup — Multi-Step Form

**Step 1: Basic info**
- Full name, phone, password

**Step 2: Institution**
- Institution type: College | Company | Startup
- Institution name (searchable dropdown)
- If College: department, graduation year, student/alumni toggle
- If Company: current role/designation
- Institution email (the verified email)
- "Send OTP to this email" button

**Step 3: OTP verification**
- 6-digit OTP input
- Resend option (60s cooldown)

**Step 4: Profile**
- Category (dropdown)
- Expertise tags (multi-select with custom input)
- Bio (rich text, 100–500 words)
- LinkedIn URL
- Price per session (₹), duration (30 or 60 min)
- Profile photo upload

**Step 5: Verification docs**
- Upload ID card / offer letter / marksheet (PDF or image)
- At least 1 required

**Step 6: Review & submit**
- Summary of all entered info
- "Submit for review" → POST to `/api/auth/register/mentor`

---

## Environment Variables

```env
# App
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://helpmeman.vercel.app
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Database
DATABASE_URL=postgresql://user:pass@host:5432/helpmeman

# Email (SMTP / SendGrid)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
FROM_EMAIL=noreply@helpmeman.com

# Google OAuth / Calendar
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://helpmeman.vercel.app/api/auth/google/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token  # platform account's token

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis (for BullMQ job queue)
REDIS_URL=redis://localhost:6379

# Admin
ADMIN_EMAIL=admin@helpmeman.com
ADMIN_NOTIFICATION_EMAIL=admin@helpmeman.com
PLATFORM_FEE_PERCENT=20
```

---

## Security Requirements

1. **JWT auth middleware** on all protected routes — check role (USER / MENTOR / ADMIN)
2. **Rate limiting** — `express-rate-limit`: 100 req/15min general, 5 req/15min on auth routes
3. **Input validation** — `zod` or `joi` on all request bodies
4. **Helmet.js** — secure HTTP headers
5. **CORS** — whitelist only frontend domain
6. **File upload validation** — check MIME type + max size (5MB) before Cloudinary upload
7. **Mentor email ownership** — OTP sent to institution email before account is created
8. **Meet link access control** — `/api/bookings/:id/meet-link` only returns link to booking owner or the booked mentor
9. **Admin-only routes** — middleware checks `req.user.role === 'ADMIN'`
10. **Razorpay signature verification** — always verify `hmac_sha256` before marking payment as confirmed

---

## Additional Features to Build

### Real-time notifications
- Use **Socket.io** or **Server-Sent Events** for live notification badge updates

### Review & rating system
- Only the booking owner can leave a review, only after session is COMPLETED
- Auto-calculate mentor rating (average of all reviews) on each new review

### Refund policy
- If mentor cancels: full refund automatically via Razorpay
- If user cancels > 24h before: full refund
- If user cancels < 24h before: no refund
- Implement in `POST /bookings/:id/cancel`

### Search autocomplete
- `GET /api/mentors/suggestions?q=string` → returns top 5 mentor names + institutions

### Admin analytics charts
- Sessions per day (line chart, last 30 days)
- Revenue per day (bar chart)
- Category distribution (pie chart)
- **Chat-to-booking conversion rate** (threads that resulted in a booking ÷ total threads, shown as a stat card + trend line)
- Use recharts on frontend

### Mentor badge system
Auto-assign badges based on milestones:
- "Verified IITian", "Verified AIIMSian", "FAANG Engineer"
- "10 Sessions", "50 Sessions", "Top Rated" (avg rating ≥ 4.8)

---

## Folder Structure

```
helpmeman/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── index.js
│   │   ├── config/
│   │   │   └── env.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── roleGuard.js
│   │   │   ├── rateLimiter.js
│   │   │   └── validate.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── mentor.routes.js
│   │   │   ├── booking.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── admin.routes.js
│   │   │   ├── chat.routes.js
│   │   │   └── category.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── mentor.controller.js
│   │   │   ├── booking.controller.js
│   │   │   ├── payment.controller.js
│   │   │   ├── chat.controller.js
│   │   │   └── admin.controller.js
│   │   ├── services/
│   │   │   ├── email.service.js
│   │   │   ├── googleMeet.service.js
│   │   │   ├── payment.service.js
│   │   │   ├── upload.service.js
│   │   │   ├── mentorApproval.service.js
│   │   │   ├── chat.service.js
│   │   │   └── notification.service.js
│   │   ├── sockets/
│   │   │   └── chat.socket.js
│   │   ├── jobs/
│   │   │   └── sessionReminder.job.js
│   │   ├── templates/
│   │   │   ├── approvalEmail.html
│   │   │   ├── rejectionEmail.html
│   │   │   ├── bookingConfirmed.html
│   │   │   └── sessionReminder.html
│   │   └── utils/
│   │       ├── jwt.js
│   │       ├── hash.js
│   │       ├── otp.js
│   │       └── emailDomains.js
├── frontend/ (Next.js 14)
│   ├── app/
│   │   ├── (public)/
│   │   ├── dashboard/
│   │   ├── mentor/
│   │   └── admin/
│   ├── components/
│   │   ├── ui/           (shadcn)
│   │   ├── mentor/
│   │   ├── booking/
│   │   ├── chat/         (ChatWindow, MessageBubble, ThreadList, LockPrompt)
│   │   ├── admin/
│   │   └── shared/
│   └── lib/
│       ├── api.ts
│       └── auth.ts
└── README.md
```

---

## Design Guidelines (Frontend)

- Font: **Inter** (body) + **Bricolage Grotesque** (headings)
- Color: `#0f0f0f` dark, `#ffffff` light, `#6366f1` primary (indigo), `#10b981` success
- Style: Minimal, editorial. Cards with subtle shadows. No gradients except hero.
- Mobile-first, responsive breakpoints: 375 / 768 / 1280px
- Mentor cards: avatar + institution badge chip (color-coded: IIT=blue, AIIMS=red, NLU=purple, FAANG=amber)
- Booking confirmation page: full-screen success state with Meet link as primary CTA (big green button)
- Admin panel: data-dense table views, sidebar nav, status badges

---

*End of HelpMeMan Antigravity Prompt*
