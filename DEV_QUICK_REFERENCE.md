# ClinicalNoteAI - Developer Quick Reference

## 🚀 Quick Start
```powershell
# First time setup
.\setup-dev.ps1

# Start development server
npm run dev
```

## 📝 Common Commands

### Development
```powershell
npm run dev          # Start dev server with hot reload (http://localhost:5000)
npm run build        # Build for production
npm run start        # Start production server
npm run check        # Type-check TypeScript without building
```

### Database
```powershell
npm run db:push      # Push schema changes to database
                     # (Creates/updates tables based on server/db/schema.ts)
```

### Useful PowerShell Commands
```powershell
# Open .env file for editing
notepad .env

# View running processes on port 5000
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue

# Kill process on port 5000 (if stuck)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# Generate new JWT secret
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Check Node.js and npm versions
node --version
npm --version

# Clear npm cache (if having issues)
npm cache clean --force
```

## 🔧 Environment Variables

### Required (Minimum for Development)
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
NODE_ENV="development"
```

### Optional (Production Features)
```env
# Azure Speech-to-Text (otherwise uses demo mode)
AZURE_SPEECH_KEY="..."
AZURE_SPEECH_REGION="eastus"

# Azure Text Analytics
AZURE_TEXT_ANALYTICS_KEY="..."
AZURE_TEXT_ANALYTICS_ENDPOINT="..."

# Stripe Payments
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## 📁 Project Structure

```
client/src/
├── components/     # Reusable UI components
├── pages/          # Page components (routes)
├── hooks/          # Custom React hooks
└── lib/            # Utilities and helpers

server/
├── routes/         # API endpoints
├── services/       # Business logic
├── middleware/     # Express middleware
└── db/             # Database schema (Drizzle ORM)

shared/             # Shared types between client/server
```

## 🌐 Default URLs

- **Frontend**: http://localhost:5000
- **API**: http://localhost:5000/api
- **WebSocket**: ws://localhost:5000

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Find and kill process
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
```

### Module Not Found
```powershell
# Reinstall dependencies
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json
npm install
```

### Database Connection Issues
```powershell
# Verify DATABASE_URL in .env
Get-Content .env | Select-String "DATABASE_URL"

# Test database connection (requires psql)
# psql "your-database-url-here"
```

### TypeScript Errors
```powershell
# Run type checker
npm run check

# Clear build cache
Remove-Item dist -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item client/dist -Recurse -Force -ErrorAction SilentlyContinue
```

## 📚 Key Files

- `package.json` - Dependencies and scripts
- `vite.config.ts` - Frontend build configuration
- `tsconfig.json` - TypeScript configuration
- `drizzle.config.ts` - Database ORM configuration
- `tailwind.config.ts` - TailwindCSS styling configuration
- `.env` - Environment variables (DO NOT COMMIT)
- `.env.example` - Environment template

## 🔐 Security Notes

- Never commit `.env` file
- Use strong JWT_SECRET (32+ characters)
- Rotate secrets every 90 days in production
- Use test Stripe keys in development
- Keep Azure keys secure

## 📖 Documentation

- `LOCAL_SETUP_GUIDE.md` - Complete setup guide
- `ARCHITECTURE.md` - System architecture
- `SECURITY.md` - Security features
- `HIPAA_READINESS.md` - HIPAA compliance
- `ARTIFACTS/` - Additional documentation

## 🎯 Development Workflow

1. Make code changes
2. Changes auto-reload in browser (Vite HMR)
3. Check browser console for errors
4. Check terminal for server logs
5. Use browser DevTools for debugging
6. Run `npm run check` before committing

## 🧪 Testing Features

### Demo Mode (No Azure Keys)
- Simulated transcriptions with realistic medical content
- No external API calls
- Perfect for UI/UX development

### With Azure Keys
- Real speech-to-text transcription
- Clinical entity extraction
- Medical terminology recognition

## 💡 Tips

- Use VS Code with TypeScript extension
- Install "Tailwind CSS IntelliSense" extension
- Enable "Format on Save" for consistent code style
- Use React DevTools browser extension
- Check `logs/` directory for detailed logs
- Database schema is in `server/db/schema.ts`

---

**Need help?** See `LOCAL_SETUP_GUIDE.md` for detailed instructions.
