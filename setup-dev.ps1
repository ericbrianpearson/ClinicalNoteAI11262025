# ClinicalNoteAI - Development Environment Setup Script
# This script automates the setup of your local development environment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ClinicalNoteAI - Dev Environment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-CommandExists {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Step 1: Check Node.js installation
Write-Host "[1/6] Checking Node.js installation..." -ForegroundColor Yellow
if (Test-CommandExists node) {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
    
    if (Test-CommandExists npm) {
        $npmVersion = npm --version
        Write-Host "✓ npm is installed: $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "✗ npm is not found. Please reinstall Node.js." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js (v18 or higher) from:" -ForegroundColor Yellow
    Write-Host "https://nodejs.org/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "After installation, restart this terminal and run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 2: Install dependencies
Write-Host "[2/6] Installing npm dependencies..." -ForegroundColor Yellow
Write-Host "This may take 2-5 minutes..." -ForegroundColor Gray

try {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
    } else {
        throw "npm install failed"
    }
} catch {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Check for .env file
Write-Host "[3/6] Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
    Write-Host "  Skipping creation to preserve existing configuration" -ForegroundColor Gray
} else {
    Write-Host "Creating .env file from template..." -ForegroundColor Gray
    Copy-Item .env.example .env
    
    # Generate a random JWT secret
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $jwtSecret = [Convert]::ToBase64String($bytes)
    
    # Update .env with generated JWT secret
    $envContent = Get-Content .env -Raw
    $envContent = $envContent -replace 'JWT_SECRET="your-super-secret-jwt-key-change-me-in-production"', "JWT_SECRET=`"$jwtSecret`""
    $envContent = $envContent -replace 'NODE_ENV="production"', 'NODE_ENV="development"'
    Set-Content .env $envContent
    
    Write-Host "✓ .env file created with random JWT_SECRET" -ForegroundColor Green
    Write-Host "⚠ IMPORTANT: You must configure DATABASE_URL in .env" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Check database configuration
Write-Host "[4/6] Checking database configuration..." -ForegroundColor Yellow
$envContent = Get-Content .env -Raw
if ($envContent -match 'DATABASE_URL="postgresql://[^"]+@[^"]+/[^"]+"') {
    $dbUrl = $matches[0]
    if ($dbUrl -notmatch 'user:password@host') {
        Write-Host "✓ DATABASE_URL appears to be configured" -ForegroundColor Green
        
        # Try to push database schema
        Write-Host ""
        Write-Host "[5/6] Initializing database schema..." -ForegroundColor Yellow
        try {
            npm run db:push
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Database schema initialized successfully" -ForegroundColor Green
            } else {
                Write-Host "⚠ Database push completed with warnings" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "✗ Failed to initialize database" -ForegroundColor Red
            Write-Host "  You may need to run 'npm run db:push' manually after configuring DATABASE_URL" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠ DATABASE_URL needs to be configured" -ForegroundColor Yellow
        Write-Host "  Edit .env and set your PostgreSQL connection string" -ForegroundColor Gray
        Write-Host ""
        Write-Host "[5/6] Skipping database initialization" -ForegroundColor Yellow
        Write-Host "  Run 'npm run db:push' after configuring DATABASE_URL" -ForegroundColor Gray
    }
} else {
    Write-Host "⚠ DATABASE_URL not found or invalid" -ForegroundColor Yellow
    Write-Host "  Edit .env and set your PostgreSQL connection string" -ForegroundColor Gray
    Write-Host ""
    Write-Host "[5/6] Skipping database initialization" -ForegroundColor Yellow
    Write-Host "  Run 'npm run db:push' after configuring DATABASE_URL" -ForegroundColor Gray
}

Write-Host ""

# Step 6: Summary
Write-Host "[6/6] Setup Summary" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow
Write-Host ""
Write-Host "✓ Node.js and npm verified" -ForegroundColor Green
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host "✓ Environment file created" -ForegroundColor Green
Write-Host ""

if ($envContent -match 'DATABASE_URL="postgresql://[^"]+@[^"]+/[^"]+"' -and $dbUrl -notmatch 'user:password@host') {
    Write-Host "✓ Database configured" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Setup Complete! 🎉" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To start the development server, run:" -ForegroundColor Yellow
    Write-Host "  npm run dev" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "The application will be available at:" -ForegroundColor Yellow
    Write-Host "  http://localhost:5000" -ForegroundColor Cyan
} else {
    Write-Host "⚠ Database not configured" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Configure your database:" -ForegroundColor Yellow
    Write-Host "   - Edit .env file" -ForegroundColor Gray
    Write-Host "   - Set DATABASE_URL to your PostgreSQL connection string" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Initialize database schema:" -ForegroundColor Yellow
    Write-Host "   npm run db:push" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. Start development server:" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "For detailed setup instructions, see:" -ForegroundColor Gray
Write-Host "  LOCAL_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
