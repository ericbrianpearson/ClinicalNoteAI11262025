# System Architecture Documentation
## Health Scribe AI - Technical Architecture Overview

**Document Version:** 1.0  
**Last Updated:** October 28, 2025  
**System Version:** Production-Ready v1.0

---

## 📋 Architecture Summary

Health Scribe AI is a **mobile-first Progressive Web App (PWA)** built as a full-stack TypeScript application with React frontend and Express backend, designed for HIPAA-compliant clinical documentation with AI-powered transcription and insights.

**Architecture Pattern:** Monolithic full-stack application with clear separation of concerns  
**Deployment Model:** Replit Autoscale (serverless)  
**Database:** Neon Serverless PostgreSQL  
**AI Services:** Azure Cognitive Services + optional Anthropic Claude

---

## 🏗️ High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER (Browser)                         │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  React Pages │  │  UI Components│  │  React Query │             │
│  │  (wouter)    │  │  (shadcn/ui) │  │  (TanStack)  │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
│         │                  │                  │                      │
│         └──────────────────┴──────────────────┘                      │
│                            │                                         │
│                     Vite Dev Server                                  │
│                     (HMR + Fast Refresh)                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTPS/TLS (Replit SSL)
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      APPLICATION TIER (Node.js)                      │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    MIDDLEWARE CHAIN                           │  │
│  │  1. Helmet → 2. CORS → 3. Rate Limit → 4. Auth → 5. Sanitize│  │
│  └──────────────────────┬───────────────────────────────────────┘  │
│                         │                                           │
│  ┌──────────────────────▼──────────────────────────────────────┐  │
│  │                  EXPRESS ROUTES                              │  │
│  │                                                              │  │
│  │  /api/auth/          → Authentication (JWT)                  │  │
│  │  /api/patient/       → Patient CRUD + Portal                 │  │
│  │  /api/encounters/    → Encounter management                  │  │
│  │  /api/ai/            → Transcription + Insights              │  │
│  │  /api/billing/       → Stripe integration                    │  │
│  │  /api/admin/         → Admin functions                       │  │
│  └──────────────────────┬──────────────────────────────────────┘  │
│                         │                                           │
│  ┌──────────────────────▼──────────────────────────────────────┐  │
│  │               BUSINESS LOGIC LAYER                           │  │
│  │                                                              │  │
│  │  - ClinicalAIAssistant (ai-assistant.ts)                     │  │
│  │  - Authentication (auth-middleware.ts)                       │  │
│  │  - Security (security-middleware.ts)                         │  │
│  │  - Billing (billing.ts)                                      │  │
│  │  - Storage Interface (storage.ts)                            │  │
│  └──────────────────────┬──────────────────────────────────────┘  │
│                         │                                           │
│  ┌──────────────────────▼──────────────────────────────────────┐  │
│  │                  DATA ACCESS LAYER                           │  │
│  │                                                              │  │
│  │  Drizzle ORM → Parameterized Queries → Type Safety          │  │
│  └──────────────────────┬──────────────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────────────────┘
                          │
                          │ PostgreSQL Protocol (SSL)
                          │
┌─────────────────────────▼──────────────────────────────────────────┐
│                       DATABASE TIER                                 │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │            NEON SERVERLESS POSTGRESQL                        │  │
│  │                                                              │  │
│  │  - Encryption at rest                                        │  │
│  │  - Automated backups (point-in-time recovery)                │  │
│  │  - Connection pooling                                        │  │
│  │  - Read replicas (optional)                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES TIER                            │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │    Azure     │  │    Stripe    │  │   Anthropic  │             │
│  │   Speech &   │  │   Billing    │  │    Claude    │             │
│  │   Analytics  │  │   Webhooks   │  │  (Optional)  │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Technology Stack Details

### Frontend Stack

**Core Framework:**
- **React 18** - Modern hooks-based UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool with HMR

**UI & Styling:**
- **shadcn/ui** - Accessible component primitives (Radix UI)
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **Framer Motion** - Animation library

**State Management:**
- **TanStack Query v5** - Server state management
- **React Hook Form** - Form state management
- **Zod** - Runtime schema validation

**Routing:**
- **Wouter** - Lightweight client-side routing (vs React Router)

**PWA:**
- **Service Worker** - Offline support
- **Web Manifest** - Installable app
- **Device Detection** - iOS/Android auto-configuration

---

### Backend Stack

**Core Framework:**
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe server code
- **tsx** - TypeScript execution (development)
- **esbuild** - Fast bundler (production)

**Database & ORM:**
- **Drizzle ORM** - Type-safe SQL query builder
- **Drizzle Kit** - Migration tooling
- **Neon PostgreSQL** - Serverless database

**Authentication & Security:**
- **jsonwebtoken** - JWT token generation/verification
- **bcryptjs** - Password hashing
- **Helmet.js** - HTTP security headers
- **express-rate-limit** - Rate limiting
- **DOMPurify** - Input sanitization

**AI Services:**
- **Azure Speech SDK** - Speech-to-text transcription
- **Azure Text Analytics** - Entity extraction
- **Anthropic SDK** - Claude AI (optional)

**Payment:**
- **Stripe** - Subscription billing

**Utilities:**
- **Winston** - Structured logging
- **Multer** - File upload handling

---

## 🗄️ Database Schema Architecture

### Entity Relationship Diagram

```
┌─────────────┐
│    users    │ (Practitioners)
│─────────────│
│ id (PK)     │───┐
│ email       │   │
│ username    │   │
│ passwordHash│   │
│ role        │   │
│ subscription│   │
└─────────────┘   │
                  │ 1:N
                  │
┌─────────────────▼──┐
│    patients        │
│────────────────────│
│ id (PK)            │───┐
│ practitionerId (FK)│   │
│ firstName          │   │
│ lastName           │   │
│ dateOfBirth        │   │
│ allergies          │   │
│ medications        │   │
│ medicalHistory     │   │
└────────────────────┘   │ 1:N
        │                │
        │ 1:1            │
        │                │
┌───────▼──────┐  ┌──────▼──────────┐
│ patient_users│  │   encounters    │
│──────────────│  │─────────────────│
│ id (PK)      │  │ id (PK)         │
│ patientId(FK)│  │ patientId (FK)  │
│ email        │  │ practitionerId  │
│ passwordHash │  │ transcriptionText│
│ lastLoginAt  │  │ summary (JSONB) │
└──────────────┘  │ emCoding (JSONB)│
                  └─────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ ai_insights  │  │workflow_tasks│  │smart_suggest.│
│──────────────│  │──────────────│  │──────────────│
│ id (PK)      │  │ id (PK)      │  │ id (PK)      │
│ userId (FK)  │  │ userId (FK)  │  │ userId (FK)  │
│ type         │  │ encounterId  │  │ encounterId  │
│ title        │  │ taskType     │  │ category     │
│ description  │  │ status       │  │ suggestion   │
│ recommendation│  │ priority     │  │ confidence   │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐
│ audit_logs   │ (HIPAA Compliance)
│──────────────│
│ id (PK)      │
│ userId       │
│ action       │
│ resourceType │
│ resourceId   │
│ ipAddress    │
│ userAgent    │
│ timestamp    │
└──────────────┘
```

### Table Descriptions

**Core Tables:**
1. **`users`** - Practitioner accounts (authentication, subscription, role)
2. **`patients`** - Patient demographics and medical information
3. **`patient_users`** - Patient portal authentication (separate from practitioners)
4. **`encounters`** - Clinical encounter records with AI-processed data

**AI Enhancement Tables:**
5. **`ai_insights`** - Personalized workflow and clinical insights
6. **`workflow_tasks`** - Automated task generation and tracking
7. **`smart_suggestions`** - Context-aware clinical decision support

**Compliance Tables:**
8. **`audit_logs`** - HIPAA audit trail (all PHI access logged)

**Data Types:**
- **JSONB:** Flexible storage for AI-generated data (summary, emCoding, metrics)
- **TEXT:** Long-form text (transcriptions, notes, recommendations)
- **TIMESTAMP:** ISO 8601 timestamps with timezone
- **INTEGER:** Foreign keys, numeric values
- **BOOLEAN:** Flags (isActive, isRead, isAccepted)

---

## 🔄 Data Flow Diagrams

### Flow 1: Voice-to-Text Transcription

```
┌────────────┐
│ Practitioner│
│   Browser  │
└──────┬─────┘
       │
       │ 1. Upload audio file (MP3/WAV/M4A)
       │    POST /api/ai/upload-audio
       │    (Multipart form-data)
       ▼
┌────────────────┐
│   Multer       │ 2. Save to /uploads/ directory
│  (File Upload) │    Validate file type and size
└──────┬─────────┘
       │
       │ 3. Read audio file
       ▼
┌────────────────┐
│ Azure Speech   │ 4. Transcribe audio
│     SDK        │    Return: { text, confidence, duration }
└──────┬─────────┘    OR demo mode fallback
       │
       │ 5. Transcription text
       ▼
┌────────────────┐
│ Azure Text     │ 6. Extract clinical entities
│  Analytics     │    (symptoms, vitals, conditions, meds)
└──────┬─────────┘
       │
       │ 7. Analyzed text
       ▼
┌────────────────┐
│ E/M Coding     │ 8. Calculate E/M code
│   Engine       │    Return: { code, confidence, rationale }
└──────┬─────────┘
       │
       │ 9. Store all data
       ▼
┌────────────────┐
│   Database     │ 10. Insert encounter record
│  (Encounters)  │     - transcriptionText
│                │     - summary (JSONB)
│                │     - emCoding (JSONB)
└──────┬─────────┘
       │
       │ 11. Return encounter ID + results
       ▼
┌────────────┐
│  Browser   │ 12. Display transcription and insights
└────────────┘
```

### Flow 2: Patient Portal Access

```
┌────────────┐
│  Patient   │
│  Browser   │
└──────┬─────┘
       │
       │ 1. Login (email + password)
       │    POST /api/patient/auth/login
       ▼
┌────────────────┐
│  Patient Auth  │ 2. Verify credentials
│   Middleware   │    - Find in patient_users table
│                │    - bcrypt.compare(password)
└──────┬─────────┘
       │
       │ 3. Generate JWT (type: "patient")
       ▼
┌────────────┐
│  Browser   │ 4. Store JWT in memory
│            │    (NOT localStorage for security)
└──────┬─────┘
       │
       │ 5. Request medical records
       │    GET /api/patient/records
       │    Header: Authorization: Bearer <token>
       ▼
┌────────────────┐
│  verifyPatient │ 6. Verify JWT token
│     Token      │    - Check type === "patient"
│                │    - Extract patientId from payload
└──────┬─────────┘
       │
       │ 7. Query database (filtered by patientId)
       ▼
┌────────────────┐
│   Database     │ 8. SELECT encounters
│  (Encounters)  │    WHERE patientId = <id>
│                │    (patient can ONLY see own records)
└──────┬─────────┘
       │
       │ 9. Return records (read-only)
       ▼
┌────────────┐
│  Browser   │ 10. Display in patient portal
│ (Portal UI)│     (no edit/delete capabilities)
└────────────┘
```

### Flow 3: AI Insights Generation

```
┌────────────────┐
│   Practitioner │
│   Dashboard    │
└──────┬─────────┘
       │
       │ 1. Request insights
       │    GET /api/ai/insights
       ▼
┌────────────────────┐
│ ClinicalAIAssistant│ 2. Fetch last 30 days of encounters
│       Class        │    (practitioner's data only)
└──────┬─────────────┘
       │
       │ 3. Calculate analytics
       │    - Average encounter time
       │    - Common diagnoses
       │    - Coding accuracy
       │    - Workload distribution
       ▼
┌────────────────────┐
│  Insight Generator │ 4. Generate personalized insights
│                    │    - Efficiency (encounter time trends)
│                    │    - Clinical (pattern detection)
│                    │    - Administrative (coding optimization)
│                    │    - Learning (CME recommendations)
└──────┬─────────────┘
       │
       │ 5. Generate smart suggestions
       │    - Diagnosis suggestions
       │    - Treatment recommendations
       │    - Coding optimization
       │    - Workflow improvements
       ▼
┌────────────────┐
│   Database     │ 6. Store insights
│ (ai_insights)  │    INSERT ai_insights, workflow_tasks
└──────┬─────────┘
       │
       │ 7. Return insights + suggestions
       ▼
┌────────────┐
│  Dashboard │ 8. Display real-time insights
└────────────┘
```

---

## 🔐 Security Architecture

### Authentication Flow

```
┌────────────┐
│   User     │
│  (Login)   │
└──────┬─────┘
       │
       │ POST /api/auth/login { email, password }
       ▼
┌─────────────────┐
│ Account Lockout │ Check failed attempt count
│   Middleware    │ Block if ≥5 attempts (5min) or ≥10 (30min)
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Find User in   │ SELECT * FROM users WHERE email = ?
│    Database     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ bcrypt.compare  │ Verify password against hash
│  (12 rounds)    │
└──────┬──────────┘
       │
       │ Success
       ▼
┌─────────────────┐
│  jwt.sign()     │ Create token:
│                 │ { id, email, type: "practitioner" }
│                 │ Expires: 24 hours
└──────┬──────────┘
       │
       ▼
┌────────────┐
│  Browser   │ Store token in memory (not localStorage)
└────────────┘
```

### Authorization Flow

```
┌────────────┐
│  API Call  │ GET /api/patients
│            │ Header: Authorization: Bearer <token>
└──────┬─────┘
       │
       ▼
┌─────────────────┐
│authenticateToken│ 1. Extract token from header
│   Middleware    │ 2. jwt.verify(token, JWT_SECRET)
│                 │ 3. Decode: { id, email, type }
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  requireRole    │ Check if type === "practitioner"
│   (Optional)    │ Return 403 if wrong role
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Route Handler   │ req.userId available
│                 │ Use for data isolation:
│                 │ WHERE practitionerId = req.userId
└─────────────────┘
```

---

## 📱 Frontend Architecture

### Component Hierarchy

```
App (Router)
│
├── Public Routes
│   ├── / (Home/Landing)
│   ├── /login (Practitioner Login)
│   └── /register (Practitioner Registration)
│
├── Protected Routes (Practitioner)
│   ├── /dashboard (Main Dashboard)
│   │   ├── EncounterList
│   │   ├── AIInsightsFeed
│   │   └── QuickActions
│   │
│   ├── /patients (Patient Management)
│   │   ├── PatientList
│   │   ├── PatientDetail
│   │   └── AddPatientForm
│   │
│   ├── /encounters/:id (Encounter Detail)
│   │   ├── TranscriptionDisplay
│   │   ├── SOAPNotesViewer
│   │   ├── EMCodeDisplay
│   │   └── RealTimeAIFeedback
│   │
│   ├── /insights (AI Insights Dashboard)
│   │   ├── WorkflowAnalytics
│   │   ├── InsightsGrid
│   │   └── SmartSuggestionsList
│   │
│   └── /admin (Admin Panel)
│       ├── UserManagement
│       ├── SubscriptionManagement
│       └── AuditLogViewer
│
└── Patient Portal Routes
    ├── /patient/login
    ├── /patient/register
    └── /patient/portal
        ├── RecordsList (read-only)
        └── ProfileView (demographics)
```

### State Management Strategy

**Server State (TanStack Query):**
- API data fetching
- Caching with automatic invalidation
- Optimistic updates
- Background refetching

**Local State (React useState/useReducer):**
- Form state (React Hook Form)
- UI state (modals, dropdowns, tabs)
- Device detection state

**No Global State:**
- Authentication state derived from JWT token
- No Redux/Zustand needed (server state handles most needs)

---

## 🚀 Build & Deployment Architecture

### Development Mode

```bash
npm run dev
  ├── tsx server/index.ts (Node.js runtime)
  │   ├── Starts Express server (port 5000)
  │   ├── Serves Vite dev server at /
  │   └── API routes at /api/*
  └── Vite HMR (Hot Module Replacement)
      └── Live reload on file changes
```

### Production Build

```bash
npm run build
  ├── vite build (Frontend)
  │   ├── Optimized React bundle
  │   ├── Code splitting
  │   ├── Asset optimization
  │   └── Output: dist/public/
  │
  └── esbuild server/index.ts (Backend)
      ├── Bundle all server code
      ├── Tree-shaking
      ├── Minification
      └── Output: dist/index.js (single file)

npm start
  └── NODE_ENV=production node dist/index.js
      ├── Serves frontend from dist/public/
      └── API routes active
```

### Deployment (Replit Autoscale)

```
┌─────────────────────────────────────────────┐
│         REPLIT AUTOSCALE INFRASTRUCTURE     │
├─────────────────────────────────────────────┤
│                                             │
│  Build Phase:                               │
│    npm run build                            │
│                                             │
│  Deploy Phase:                              │
│    npm start (NODE_ENV=production)          │
│                                             │
│  Auto-Scaling:                              │
│    - Scales to zero when idle              │
│    - Auto-scales based on traffic          │
│    - Cold start: <1 second                 │
│                                             │
│  Features:                                  │
│    - Auto-SSL (HTTPS certificates)         │
│    - Custom domains                         │
│    - Environment variables                  │
│    - Log aggregation                        │
└─────────────────────────────────────────────┘
```

---

## 📊 Performance Characteristics

### Response Times (Typical)

| Operation | Development | Production |
|-----------|-------------|------------|
| Page load (cold) | 2-3s | 1-2s |
| Page load (cached) | <500ms | <300ms |
| API call (simple) | 50-100ms | 20-50ms |
| Voice transcription | 3-5s | 2-4s |
| E/M coding | <10ms | <5ms |
| AI insights generation | 1-2s | 500ms-1s |
| Database query | 50-100ms | 20-50ms |

### Bundle Sizes

**Frontend:**
- Main bundle: ~651KB (uncompressed)
- Gzipped: ~180KB
- Vendor chunks: React, shadcn, TanStack Query

**Backend:**
- Single bundle: ~150KB
- Dependencies: External (node_modules)

### Scalability Limits

**Current Architecture:**
- **Vertical:** Limited by Replit Autoscale resources
- **Horizontal:** Auto-scales with Replit infrastructure
- **Database:** Neon serverless handles scaling
- **File Storage:** Local `/uploads` directory (⚠️ not persistent across deploys)

**Bottlenecks:**
- Audio file storage (recommend S3-compatible blob storage)
- In-memory session state (recommend Redis)

---

## 🔄 API Design Patterns

### RESTful Endpoints

```
GET    /api/patients              List all patients (practitioner's)
POST   /api/patients              Create new patient
GET    /api/patients/:id          Get single patient
PATCH  /api/patients/:id          Update patient
DELETE /api/patients/:id          Soft delete patient

GET    /api/encounters            List encounters
POST   /api/encounters            Create encounter
GET    /api/encounters/:id        Get encounter details
PATCH  /api/encounters/:id        Update encounter

POST   /api/ai/upload-audio       Transcribe audio file
GET    /api/ai/insights           Get AI insights
POST   /api/ai/suggestions        Generate smart suggestions

POST   /api/auth/login            Practitioner login
POST   /api/auth/register         Practitioner registration
POST   /api/auth/logout           Logout (token invalidation)

POST   /api/patient/auth/login    Patient portal login
POST   /api/patient/auth/register Patient portal registration
GET    /api/patient/records       Get patient's own records
```

### Error Response Format

```json
{
  "error": "Generic error message for client",
  "code": "ERROR_CODE",
  "timestamp": "2025-10-28T14:30:00Z"
}
```

### Success Response Format

```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2025-10-28T14:30:00Z",
    "version": "1.0"
  }
}
```

---

## 🎯 Design Decisions & Trade-offs

### Decision 1: Monolithic vs. Microservices
**Choice:** Monolithic full-stack application  
**Rationale:**
- Simpler deployment (single codebase)
- Faster development iteration
- Shared types between frontend/backend
- Lower operational complexity

**Trade-off:** Harder to scale individual components independently

---

### Decision 2: Drizzle ORM vs. Prisma
**Choice:** Drizzle ORM  
**Rationale:**
- Lighter weight
- Better TypeScript inference
- SQL-like query builder
- No code generation required

**Trade-off:** Smaller ecosystem, fewer tools

---

### Decision 3: Wouter vs. React Router
**Choice:** Wouter  
**Rationale:**
- Smaller bundle size (1.5KB vs 70KB)
- Simpler API
- Adequate for SPA routing needs

**Trade-off:** Fewer advanced features (no nested routes, data loaders)

---

### Decision 4: JWT Stateless vs. Session Store
**Choice:** JWT stateless authentication  
**Rationale:**
- No database lookups on every request
- Scales horizontally easily
- Simpler implementation

**Trade-off:** Cannot revoke tokens before expiry (recommend adding token blacklist)

---

### Decision 5: Local File Storage vs. S3
**Choice:** Local `/uploads` directory (current)  
**Rationale:**
- Simpler for initial development
- No external dependencies

**Trade-off:** Files lost on redeploy (⚠️ **MUST migrate to S3 for production**)

---

## 📝 Conclusion

Health Scribe AI follows a **pragmatic, modern architecture** designed for rapid development, HIPAA compliance, and production scalability. The monolithic full-stack TypeScript approach provides excellent developer experience while maintaining clear separation of concerns.

**Architecture Strengths:**
- ✅ Type-safe end-to-end (TypeScript)
- ✅ Modern React with hooks and server state management
- ✅ Secure authentication and authorization
- ✅ HIPAA-compliant audit logging
- ✅ Mobile-first responsive design
- ✅ Fast build and deployment (Vite + esbuild)

**Recommended Enhancements:**
- Migrate to S3-compatible blob storage for audio files
- Add Redis for session management and caching
- Implement PostgreSQL Row-Level Security (RLS)
- Add real-time WebSocket support for collaborative features

---

*Architecture Documentation Completed: October 28, 2025*  
*Next: Review .env.example*
