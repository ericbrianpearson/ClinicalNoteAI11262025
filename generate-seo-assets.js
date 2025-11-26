// Generate SEO-optimized images and assets for ClinicalNoteAI

import fs from 'fs';
import path from 'path';

// Create Open Graph image as SVG (will be converted to PNG for production)
const ogImageSVG = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563EB;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1E40AF;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Grid Pattern -->
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  </pattern>
  <rect width="1200" height="630" fill="url(#grid)"/>
  
  <!-- Logo Area -->
  <circle cx="200" cy="315" r="60" fill="rgba(255,255,255,0.2)"/>
  <path d="M200 275 L200 355 M175 315 L225 315" stroke="white" stroke-width="4" stroke-linecap="round"/>
  <circle cx="185" cy="300" r="8" fill="white"/>
  <circle cx="215" cy="330" r="8" fill="white"/>
  
  <!-- Main Text -->
  <text x="320" y="280" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="white">
    Health Scribe AI
  </text>
  
  <!-- Subtitle -->
  <text x="320" y="330" font-family="Arial, sans-serif" font-size="32" fill="rgba(255,255,255,0.9)">
    AI-Powered Clinical Documentation
  </text>
  
  <!-- Features -->
  <text x="320" y="380" font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.8)">
    ✓ Voice Transcription  ✓ E/M Coding  ✓ HIPAA Compliant
  </text>
  
  <!-- Call to Action -->
  <rect x="320" y="420" width="200" height="50" rx="25" fill="white"/>
  <text x="420" y="450" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#2563EB">
    Try Demo
  </text>
  
  <!-- Medical Icons -->
  <g transform="translate(950, 200)">
    <!-- Stethoscope -->
    <circle cx="0" cy="20" r="12" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="3"/>
    <path d="M12 20 Q30 0 50 20 Q50 40 30 50 L20 40" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="3"/>
  </g>
  
  <g transform="translate(950, 320)">
    <!-- Heart Monitor -->
    <path d="M0 0 L10 0 L15 -15 L25 30 L35 -20 L45 10 L60 10" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="3"/>
  </g>
</svg>
`;

// Create favicon as SVG
const faviconSVG = `
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="6" fill="#2563EB"/>
  <path d="M16 8 L16 24 M10 16 L22 16" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="12" cy="12" r="2" fill="white"/>
  <circle cx="20" cy="20" r="2" fill="white"/>
</svg>
`;

// Platform screenshot SVG (simplified representation)
const platformScreenshotSVG = `
<svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1280" height="720" fill="#F8FAFC"/>
  
  <!-- Header -->
  <rect width="1280" height="80" fill="white"/>
  <rect x="0" y="80" width="1280" height="2" fill="#E2E8F0"/>
  
  <!-- Logo -->
  <rect x="40" y="25" width="120" height="30" rx="4" fill="#2563EB"/>
  <text x="50" y="45" font-family="Arial, sans-serif" font-size="14" fill="white" font-weight="bold">Health Scribe AI</text>
  
  <!-- Navigation -->
  <rect x="200" y="30" width="60" height="20" rx="10" fill="#EEF2FF"/>
  <rect x="280" y="30" width="80" height="20" rx="10" fill="#DBEAFE"/>
  <rect x="380" y="30" width="70" height="20" rx="10" fill="#EEF2FF"/>
  
  <!-- Main Content Area -->
  <rect x="40" y="120" width="800" height="520" rx="8" fill="white"/>
  <rect x="40" y="120" width="800" height="2" fill="#E2E8F0"/>
  
  <!-- Tabs -->
  <rect x="60" y="140" width="100" height="30" rx="6" fill="#2563EB"/>
  <text x="110" y="160" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="white">Encounter</text>
  <rect x="180" y="140" width="80" height="30" rx="6" fill="#F1F5F9"/>
  <text x="220" y="160" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#64748B">Analytics</text>
  
  <!-- Form Elements -->
  <rect x="80" y="200" width="300" height="40" rx="6" fill="#F8FAFC" stroke="#E2E8F0"/>
  <text x="90" y="215" font-family="Arial, sans-serif" font-size="10" fill="#64748B">Patient ID</text>
  <text x="90" y="230" font-family="Arial, sans-serif" font-size="12" fill="#1E293B">P-12345</text>
  
  <!-- Voice Recorder -->
  <circle cx="450" cy="280" r="30" fill="#EF4444"/>
  <circle cx="450" cy="280" r="15" fill="white"/>
  
  <!-- Results Panel -->
  <rect x="80" y="340" width="720" height="120" rx="6" fill="#F0F9FF" stroke="#0EA5E9"/>
  <text x="100" y="365" font-family="Arial, sans-serif" font-size="14" fill="#0369A1" font-weight="bold">AI Transcription Results</text>
  <text x="100" y="385" font-family="Arial, sans-serif" font-size="10" fill="#64748B">Patient presents with chest pain radiating to left arm...</text>
  
  <!-- Sidebar -->
  <rect x="880" y="120" width="320" height="520" rx="8" fill="white"/>
  
  <!-- AI Insights Panel -->
  <rect x="900" y="140" width="280" height="150" rx="6" fill="#FEF3C7"/>
  <text x="920" y="165" font-family="Arial, sans-serif" font-size="12" fill="#92400E" font-weight="bold">🧠 AI Clinical Insights</text>
  <rect x="920" y="180" width="100" height="15" rx="3" fill="#FCD34D"/>
  <rect x="920" y="200" width="150" height="15" rx="3" fill="#FCD34D"/>
  
  <!-- Performance Stats -->
  <rect x="900" y="310" width="280" height="100" rx="6" fill="#ECFDF5"/>
  <text x="920" y="335" font-family="Arial, sans-serif" font-size="12" fill="#065F46" font-weight="bold">⚡ Performance</text>
  <text x="920" y="355" font-family="Arial, sans-serif" font-size="10" fill="#047857">Processing Time: 1.2s</text>
  <text x="920" y="375" font-family="Arial, sans-serif" font-size="10" fill="#047857">Accuracy: 94%</text>
  <text x="920" y="395" font-family="Arial, sans-serif" font-size="10" fill="#047857">Time Saved: 7 min</text>
  
  <!-- Bottom Banner -->
  <rect x="0" y="660" width="1280" height="60" fill="#1E40AF"/>
  <text x="40" y="685" font-family="Arial, sans-serif" font-size="14" fill="white" font-weight="bold">Enterprise Ready</text>
  <text x="40" y="705" font-family="Arial, sans-serif" font-size="11" fill="#BFDBFE">HIPAA Compliant • Azure Integration • Production Scalable</text>
</svg>
`;

// Write files
const publicDir = './client/public';

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write SVG files
fs.writeFileSync(path.join(publicDir, 'og-image.svg'), ogImageSVG);
fs.writeFileSync(path.join(publicDir, 'logo-icon.svg'), faviconSVG);
fs.writeFileSync(path.join(publicDir, 'platform-screenshot.svg'), platformScreenshotSVG);

console.log('✅ SEO assets generated successfully:');
console.log('  - og-image.svg (Open Graph image)');
console.log('  - logo-icon.svg (Favicon)');
console.log('  - platform-screenshot.svg (Platform preview)');
console.log('\nFor production, convert SVGs to PNG for better compatibility.');