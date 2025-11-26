const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

// Create 512x512 PNG from SVG
async function generatePNG() {
  const canvas = createCanvas(512, 512);
  const ctx = canvas.getContext('2d');
  
  // Set background to transparent
  ctx.clearRect(0, 0, 512, 512);
  
  // Draw microphone with gradient
  const gradient = ctx.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, '#14b8a6');
  gradient.addColorStop(1, '#2563eb');
  
  // Microphone body
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(180, 120, 152, 228, 76);
  ctx.fill();
  
  // Microphone grille lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  
  for (let i = 0; i < 5; i++) {
    const y = 160 + (i * 40);
    ctx.beginPath();
    ctx.moveTo(210, y);
    ctx.lineTo(302, y);
    ctx.stroke();
  }
  
  // Microphone stand
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 20;
  ctx.beginPath();
  ctx.moveTo(256, 348);
  ctx.lineTo(256, 420);
  ctx.moveTo(200, 420);
  ctx.lineTo(312, 420);
  ctx.stroke();
  
  // Audio waves
  ctx.strokeStyle = '#14b8a6';
  ctx.lineWidth = 16;
  ctx.globalAlpha = 0.6;
  
  // Wave 1
  ctx.beginPath();
  ctx.arc(380, 200, 30, -Math.PI/4, Math.PI/4, false);
  ctx.stroke();
  
  // Wave 2
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.arc(400, 200, 50, -Math.PI/3, Math.PI/3, false);
  ctx.stroke();
  
  // Wave 3
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.arc(420, 200, 70, -Math.PI/2.5, Math.PI/2.5, false);
  ctx.stroke();
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('client/public/logo-512.png', buffer);
  console.log('Generated logo-512.png');
}

// Create 32x32 favicon
async function generateFavicon() {
  const canvas = createCanvas(32, 32);
  const ctx = canvas.getContext('2d');
  
  // Set background to transparent
  ctx.clearRect(0, 0, 32, 32);
  
  // Draw simplified microphone
  const gradient = ctx.createLinearGradient(0, 0, 32, 32);
  gradient.addColorStop(0, '#14b8a6');
  gradient.addColorStop(1, '#2563eb');
  
  // Microphone body
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(11, 7, 10, 15, 5);
  ctx.fill();
  
  // Microphone grille lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 0.8;
  ctx.lineCap = 'round';
  
  for (let i = 0; i < 3; i++) {
    const y = 10 + (i * 3);
    ctx.beginPath();
    ctx.moveTo(13, y);
    ctx.lineTo(19, y);
    ctx.stroke();
  }
  
  // Microphone stand
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(16, 22);
  ctx.lineTo(16, 27);
  ctx.moveTo(12, 27);
  ctx.lineTo(20, 27);
  ctx.stroke();
  
  // Single audio wave
  ctx.strokeStyle = '#14b8a6';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.arc(24, 12, 3, -Math.PI/4, Math.PI/4, false);
  ctx.stroke();
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('client/public/favicon-32x32.png', buffer);
  console.log('Generated favicon-32x32.png');
}

// Check if canvas module is available
try {
  generatePNG();
  generateFavicon();
} catch (error) {
  console.log('Canvas module not available, creating simplified versions...');
  
  // Create base64 encoded PNG data for 512x512
  const png512Base64 = 'iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAACAASURBVHic7N15nFxVnTfw73OrbqW6O51Op5N0QhayQAhbwhIIyOIwKuqgOCqOy+g4Oo7bOC7jNs44jjPjOI6Ojls0ynMCPiouwLglJCwJJBAJkIT0kk4n3ekl3V1d91bdOu+P9SRGtMIbDLCfVwz8ASiALsQDIsJCoAAAB';
  
  // Write placeholder files
  fs.writeFileSync('client/public/logo-512.png', Buffer.from(png512Base64, 'base64'));
  fs.writeFileSync('client/public/favicon-32x32.png', Buffer.from(png512Base64, 'base64'));
  
  console.log('Created placeholder PNG files');
}

console.log('Asset generation complete!');