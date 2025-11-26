# ClinicalNoteAI - Local Development Environment Setup Guide

## 🎯 Overview
This guide will help you set up a complete local development environment for the ClinicalNoteAI application on Windows.

## 📋 Prerequisites

### 1. Install Node.js (Required)
**Status: ⚠️ NOT INSTALLED**

Node.js is required to run this application. Install it before proceeding:

1. Download Node.js LTS (v18 or higher) from: https://nodejs.org/
2. Run the installer and follow the prompts
3. **Important**: Check "Automatically install necessary tools" during installation
4. Restart your terminal/PowerShell after installation
5. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

### 2. PostgreSQL Database (Required)
You need a PostgreSQL database. Choose one option:

**Option A: Use Neon (Recommended for development)**
- Sign up at https://neon.tech (free tier available)
- Create a new project
- Copy the connection string (starts with `postgresql://`)

**Option B: Install PostgreSQL locally**
- Download from https://www.postgresql.org/download/windows/
- Install and note your credentials
- Connection string format: `postgresql://username:password@localhost:5432/clinicalnoteai`

### 3. Git (Already Installed ✅)
Git is already available on your system.

---

## 🚀 Setup Steps

### Step 1: Install Dependencies
Once Node.js is installed, run:
```powershell
cd "c:\Users\ericb\Projects\ClinicalNoteAI"
npm install
```

This will install all required packages (~100+ dependencies). This may take 2-5 minutes.

### Step 2: Configure Environment Variables
Create a `.env` file in the project root:

```powershell
# Copy the example file
Copy-Item .env.example .env

# Open in notepad to edit
notepad .env
```

**Minimum required configuration for development:**
```env
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Security (REQUIRED)
JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters-long"

# Environment
NODE_ENV="development"

# Azure Services (OPTIONAL - will use demo mode if not provided)
# AZURE_SPEECH_KEY="your-key-here"
# AZURE_SPEECH_REGION="eastus"
# AZURE_TEXT_ANALYTICS_KEY="your-key-here"
# AZURE_TEXT_ANALYTICS_ENDPOINT="https://your-resource.cognitiveservices.azure.com/"
```

**To generate a secure JWT_SECRET:**
```powershell
# Option 1: Use OpenSSL (if installed)
openssl rand -base64 32

# Option 2: Use PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Step 3: Initialize Database
Push the database schema to your PostgreSQL database:
```powershell
npm run db:push
```

This creates all necessary tables, indexes, and constraints.

### Step 4: Start Development Server
```powershell
npm run dev
```

The application will start on http://localhost:5000 (or next available port).

You should see output like:
```
Server running on http://localhost:5000
Database connected successfully
Running in DEVELOPMENT mode
```

---

## 🎨 Application Features

### Development Mode Benefits
- **Hot Module Reloading**: Changes to code automatically refresh
- **Demo Mode**: If Azure keys aren't configured, realistic simulated transcriptions are used
- **Detailed Logging**: All API calls and operations are logged
- **No Rate Limiting**: Unlimited API requests for testing

### Available Scripts
```powershell
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run check        # Type-check TypeScript
npm run db:push      # Push database schema changes
```

---

## 🏗️ Project Structure

```
ClinicalNoteAI/
├── client/              # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities
├── server/              # Express backend (Node.js + TypeScript)
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── middleware/      # Express middleware
│   └── db/              # Database schema (Drizzle ORM)
├── shared/              # Shared types and utilities
├── .env                 # Environment variables (create this)
├── .env.example         # Environment template
├── package.json         # Dependencies and scripts
└── vite.config.ts       # Vite configuration
```

---

## 🔧 Troubleshooting

### "npm is not recognized"
- Node.js is not installed or not in PATH
- Solution: Install Node.js from https://nodejs.org/
- Restart your terminal after installation

### "Cannot connect to database"
- Check DATABASE_URL format
- Ensure PostgreSQL is running (if local)
- Verify credentials and network access
- Test connection string in a database client

### "Port 5000 already in use"
- The server will automatically try the next available port
- Check console output for the actual URL
- Or manually specify a port: `PORT=3000 npm run dev`

### "Module not found" errors
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`
- Ensure you're in the correct directory

### Azure Speech errors (in production mode)
- If you see Azure-related errors but want to use demo mode:
  - Set `NODE_ENV="development"` in `.env`
  - Or remove Azure keys from `.env`
- Demo mode provides realistic simulated transcriptions for testing

---

## 🎯 Next Steps

Once your development environment is running:

1. **Access the Application**
   - Open http://localhost:5000 in your browser
   - Create a test account (practitioner or patient)

2. **Test Core Features**
   - Upload audio files for transcription
   - Try the real-time recording feature
   - Generate clinical notes
   - Explore E&M coding suggestions

3. **Review Documentation**
   - `ARCHITECTURE.md` - System architecture and design
   - `SECURITY.md` - Security features and best practices
   - `HIPAA_READINESS.md` - HIPAA compliance information

4. **Development Workflow**
   - Make changes to code
   - Changes auto-reload in browser
   - Check console for errors
   - Use browser DevTools for debugging

---

## 📚 Additional Resources

- **Technology Stack**
  - Frontend: React 18, TypeScript, TailwindCSS, Shadcn/UI
  - Backend: Express, Node.js, TypeScript
  - Database: PostgreSQL (via Drizzle ORM)
  - AI Services: Azure Cognitive Services, Anthropic Claude

- **Key Dependencies**
  - `express` - Web server
  - `react` - UI framework
  - `drizzle-orm` - Database ORM
  - `vite` - Build tool and dev server
  - `passport` - Authentication
  - `stripe` - Payment processing (optional)

- **Documentation**
  - Project docs in `/ARTIFACTS/`
  - API documentation: See `server/routes/`
  - Component docs: See `client/src/components/`

---

## ✅ Setup Checklist

- [ ] Node.js installed (v18+)
- [ ] PostgreSQL database available
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and configured
- [ ] Database schema initialized (`npm run db:push`)
- [ ] Development server running (`npm run dev`)
- [ ] Application accessible in browser
- [ ] Test account created

---

## 🆘 Getting Help

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review error messages in the console
3. Check `ARCHITECTURE.md` for system design details
4. Review `SECURITY.md` for security-related questions
5. Check the logs in the `logs/` directory

---

**Happy Coding! 🚀**
