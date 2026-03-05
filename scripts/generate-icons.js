const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ─── Drawing helpers ───

function drawGradientBackground(ctx, size) {
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#4F46E5'); // Indigo
  gradient.addColorStop(1, '#7C3AED'); // Purple
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawWalletIcon(ctx, size) {
  const s = size / 1024; // scale factor
  ctx.save();
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'white';

  // Main wallet body - rounded rectangle
  const walletX = 220 * s;
  const walletY = 280 * s;
  const walletW = 584 * s;
  const walletH = 420 * s;
  const walletR = 40 * s;

  // Draw wallet body
  drawRoundedRect(ctx, walletX, walletY, walletW, walletH, walletR);
  ctx.fill();

  // Draw wallet flap (top part)
  const flapX = 260 * s;
  const flapY = 220 * s;
  const flapW = 504 * s;
  const flapH = 120 * s;
  const flapR = 36 * s;

  drawRoundedRect(ctx, flapX, flapY, flapW, flapH, flapR);
  ctx.fill();

  // Card slot detail - dark indigo rectangle inside wallet
  ctx.fillStyle = '#6D5FED'; // slightly lighter for contrast
  const slotX = 560 * s;
  const slotY = 430 * s;
  const slotW = 220 * s;
  const slotH = 100 * s;
  const slotR = 20 * s;

  drawRoundedRect(ctx, slotX, slotY, slotW, slotH, slotR);
  ctx.fill();

  // Small circle on the card slot (button/clasp)
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(610 * s, 480 * s, 16 * s, 0, Math.PI * 2);
  ctx.fill();

  // Coin symbols at bottom-left to add visual interest
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.arc(340 * s, 600 * s, 36 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(400 * s, 620 * s, 28 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawWalletIconOnly(ctx, size) {
  // For splash logo: transparent background, all-white wallet symbol
  const s = size / 1024;
  ctx.save();
  ctx.fillStyle = 'white';

  // Main wallet body
  const walletX = 220 * s;
  const walletY = 280 * s;
  const walletW = 584 * s;
  const walletH = 420 * s;
  const walletR = 40 * s;
  drawRoundedRect(ctx, walletX, walletY, walletW, walletH, walletR);
  ctx.fill();

  // Wallet flap
  const flapX = 260 * s;
  const flapY = 220 * s;
  const flapW = 504 * s;
  const flapH = 120 * s;
  const flapR = 36 * s;
  drawRoundedRect(ctx, flapX, flapY, flapW, flapH, flapR);
  ctx.fill();

  // Card slot detail - slightly transparent white for subtle contrast
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  const slotX = 560 * s;
  const slotY = 430 * s;
  const slotW = 220 * s;
  const slotH = 100 * s;
  const slotR = 20 * s;
  drawRoundedRect(ctx, slotX, slotY, slotW, slotH, slotR);
  ctx.fill();

  // Small circle on card slot
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.arc(610 * s, 480 * s, 16 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ─── Generate icon PNG ───

function generateAppIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  drawGradientBackground(ctx, size);
  drawWalletIcon(ctx, size);
  return canvas.toBuffer('image/png');
}

function generateRoundIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Clip to circle
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  drawGradientBackground(ctx, size);
  drawWalletIcon(ctx, size);
  return canvas.toBuffer('image/png');
}

function generateSplashLogo(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  // Transparent background - just draw the white wallet
  drawWalletIconOnly(ctx, size);
  return canvas.toBuffer('image/png');
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, buffer) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, buffer);
  console.log(`  ✓ ${path.relative(ROOT, filePath)}`);
}

// ─── Android icons ───

function generateAndroidIcons() {
  console.log('\n📱 Android App Icons:');
  const androidRes = path.join(ROOT, 'android/app/src/main/res');
  const densities = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
  };

  for (const [dir, size] of Object.entries(densities)) {
    writeFile(path.join(androidRes, dir, 'ic_launcher.png'), generateAppIcon(size));
    writeFile(path.join(androidRes, dir, 'ic_launcher_round.png'), generateRoundIcon(size));
  }
}

// ─── Android splash logos ───

function generateAndroidSplashLogos() {
  console.log('\n📱 Android Splash Logos:');
  const androidRes = path.join(ROOT, 'android/app/src/main/res');
  const densities = {
    'drawable-mdpi': 100,
    'drawable-hdpi': 150,
    'drawable-xhdpi': 200,
    'drawable-xxhdpi': 300,
    'drawable-xxxhdpi': 400,
  };

  for (const [dir, size] of Object.entries(densities)) {
    writeFile(path.join(androidRes, dir, 'splash_logo.png'), generateSplashLogo(size));
  }
}

// ─── iOS icons ───

function generateiOSIcons() {
  console.log('\n🍎 iOS App Icons:');
  const iosIconDir = path.join(ROOT, 'ios/HouseholdBudget/Images.xcassets/AppIcon.appiconset');

  const sizes = [40, 58, 60, 80, 87, 120, 180, 1024];
  for (const size of sizes) {
    writeFile(path.join(iosIconDir, `icon-${size}x${size}.png`), generateAppIcon(size));
  }
}

// ─── iOS splash logo ───

function generateiOSSplashLogo() {
  console.log('\n🍎 iOS Splash Logo:');
  const splashDir = path.join(ROOT, 'ios/HouseholdBudget/Images.xcassets/SplashLogo.imageset');

  writeFile(path.join(splashDir, 'splash_logo.png'), generateSplashLogo(200));
  writeFile(path.join(splashDir, 'splash_logo@2x.png'), generateSplashLogo(400));
  writeFile(path.join(splashDir, 'splash_logo@3x.png'), generateSplashLogo(600));

  const contents = {
    images: [
      { idiom: 'universal', filename: 'splash_logo.png', scale: '1x' },
      { idiom: 'universal', filename: 'splash_logo@2x.png', scale: '2x' },
      { idiom: 'universal', filename: 'splash_logo@3x.png', scale: '3x' },
    ],
    info: { version: 1, author: 'xcode' },
  };
  writeFile(path.join(splashDir, 'Contents.json'), Buffer.from(JSON.stringify(contents, null, 2)));
}

// ─── Main ───

console.log('🎨 Generating app icons and splash assets...');
generateAndroidIcons();
generateAndroidSplashLogos();
generateiOSIcons();
generateiOSSplashLogo();
console.log('\n✅ All icons generated!');
