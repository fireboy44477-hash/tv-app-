import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const publicDir = path.resolve('public');

const featureSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 500" width="1024" height="500">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#181a20" />
      <stop offset="50%" stop-color="#0f1013" />
      <stop offset="100%" stop-color="#08090a" />
    </linearGradient>
    <linearGradient id="crimsonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff2a5f" />
      <stop offset="100%" stop-color="#b3002d" />
    </linearGradient>
    <radialGradient id="redGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ff2a5f" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="1024" height="500" fill="url(#bg)" />
  <circle cx="512" cy="250" r="320" fill="url(#redGlow)" />

  <!-- Diagonal Tech Lines -->
  <g stroke="#ffffff" stroke-opacity="0.05" stroke-width="1.5">
    <line x1="0" y1="100" x2="1024" y2="400" />
    <line x1="0" y1="200" x2="1024" y2="500" />
    <line x1="200" y1="0" x2="900" y2="500" />
  </g>

  <!-- Fuji Ch 8 Badge Left Graphic -->
  <g transform="translate(140, 110)">
    <rect width="160" height="280" rx="36" fill="#15171d" stroke="#2a2e3a" stroke-width="4" />
    <!-- IR LED -->
    <rect x="62" y="-4" width="36" height="8" rx="4" fill="#ff2a5f" />
    <!-- 8 Button -->
    <rect x="30" y="40" width="100" height="90" rx="20" fill="url(#crimsonGrad)" stroke="#ff6b8b" stroke-width="2" />
    <text x="80" y="102" font-family="system-ui, sans-serif" font-weight="900" font-size="52" fill="#ffffff" text-anchor="middle">8</text>
    <text x="80" y="122" font-family="system-ui, sans-serif" font-weight="800" font-size="9" fill="#ffffff" text-anchor="middle" letter-spacing="2">FUJI TV</text>
    <!-- 4 dots -->
    <circle cx="45" cy="170" r="6" fill="#2563eb" />
    <circle cx="68" cy="170" r="6" fill="#dc2626" />
    <circle cx="91" cy="170" r="6" fill="#16a34a" />
    <circle cx="114" cy="170" r="6" fill="#eab308" />
    <!-- D-Pad -->
    <circle cx="80" cy="225" r="28" fill="#1e222a" stroke="#374151" stroke-width="2" />
    <circle cx="80" cy="225" r="12" fill="#ff2a5f" />
  </g>

  <!-- Typography Right Side -->
  <g transform="translate(360, 150)">
    <!-- Station Callout -->
    <rect x="0" y="0" width="150" height="28" rx="14" fill="#2a0f16" stroke="#ff2a5f" stroke-width="1.5" />
    <text x="75" y="19" font-family="system-ui, sans-serif" font-weight="800" font-size="11" fill="#ff6b8b" text-anchor="middle" letter-spacing="1">CX CHANNEL 8</text>

    <!-- Main Title -->
    <text x="0" y="80" font-family="system-ui, sans-serif" font-weight="900" font-size="46" fill="#ffffff" letter-spacing="-0.5">FUJI TV REMOTE</text>
    <text x="0" y="118" font-family="system-ui, sans-serif" font-weight="700" font-size="20" fill="#ff4d79">Smart TV Controller &amp; Interactive Companion</text>

    <!-- Bullets -->
    <g transform="translate(0, 150)" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#cbd5e1">
      <text x="0" y="0">✦ Direct Channel 8 Fuji Television Key</text>
      <text x="0" y="26">✦ Interactive d-Data Broadcast &amp; Mezamashi Janken</text>
      <text x="0" y="52">✦ Multi-Brand TV Pairing &amp; Voice Commands</text>
    </g>

    <!-- Google Play Badge Text -->
    <g transform="translate(0, 240)">
      <rect x="0" y="0" width="180" height="38" rx="10" fill="#059669" />
      <text x="90" y="24" font-family="system-ui, sans-serif" font-weight="800" font-size="13" fill="#ffffff" text-anchor="middle">Google Play Ready</text>
    </g>
  </g>
</svg>
`;

async function run() {
  fs.writeFileSync(path.join(publicDir, 'feature-graphic.svg'), featureSvg);
  await sharp(Buffer.from(featureSvg))
    .resize(1024, 500)
    .png()
    .toFile(path.join(publicDir, 'feature-graphic.png'));
  console.log('Generated feature-graphic.png (1024x500) for Google Play Store!');
}

run().catch(console.error);
