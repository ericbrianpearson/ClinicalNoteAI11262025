---
description: Setup local development environment
---

# Local Development Environment Setup

## Quick Start (Automated)

**Recommended**: Use the automated setup script:

```powershell
.\setup-dev.ps1
```

This script will:
- ✓ Check Node.js installation
- ✓ Install all dependencies
- ✓ Create .env file with generated JWT_SECRET
- ✓ Initialize database schema (if DATABASE_URL is configured)

After running the script, you only need to:
1. Edit `.env` to add your DATABASE_URL
2. Run `npm run db:push` (if not done automatically)
3. Run `npm run dev` to start the server

---

## Manual Setup

If you prefer manual setup or need more control:

### Prerequisites
1. Node.js (v18+) - Download from https://nodejs.org/
2. PostgreSQL database (Neon recommended for development)
3. Git (already installed)

### Setup Steps

// turbo
1. Install dependencies
```powershell
npm install
```

2. Create environment file
```powershell
# Copy the example file
Copy-Item .env.example .env

# Generate a secure JWT secret
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Edit .env and configure:
notepad .env
```

Required variables:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: Use the generated secret from above
- `NODE_ENV`: Set to "development"

3. Initialize database schema
```powershell
npm run db:push
```

4. Start development server
```powershell
npm run dev
```

5. Access the application
   - Frontend: http://localhost:5000 (or the port shown in console)
   - API: http://localhost:5000/api

---

## Development Mode Features
- Hot module reloading for both client and server
- Demo mode for transcription (if Azure keys not configured)
- Detailed logging
- No rate limiting

## Documentation
- **Complete Guide**: See `LOCAL_SETUP_GUIDE.md`
- **Quick Reference**: See `DEV_QUICK_REFERENCE.md`
- **Architecture**: See `ARCHITECTURE.md`

## Troubleshooting
- **Node.js not found**: Install from https://nodejs.org/ and restart terminal
- **Port in use**: Server will auto-select next available port
- **Database errors**: Verify DATABASE_URL format in .env
- **Module errors**: Delete node_modules and run `npm install` again

For detailed troubleshooting, see `LOCAL_SETUP_GUIDE.md`
