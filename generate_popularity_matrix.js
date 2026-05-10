const fs = require('fs');
const path = require('path');

// --- UTILS ---
function getFontBase64(fontName) {
  const fontPath = path.join(__dirname, 'fonts', fontName);
  return fs.existsSync(fontPath) ? fs.readFileSync(fontPath).toString('base64') : '';
}

// CSV Parser (Simple)
function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  const data = [];
  let currentYear = '';
  
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',');
    if (row[0].trim()) currentYear = row[0].trim();
    
    const obj = {
      year: currentYear,
      title: row[1]?.trim(),
      rating: parseFloat(row[2]),
      lang: row[3]?.trim()
    };
    if (obj.title) data.push(obj);
  }
  return data;
}

// Diversity Score Logic
function getDiversityScore(lang) {
  if (!lang) return 0.2;
  if (lang.includes('/')) return 0.95; // Multi-language
  const mapping = {
    'hi': 0.2, // Hindi (Mainstream)
    'te': 0.55, // Telugu
    'ta': 0.65, // Tamil
    'kn': 0.75, // Kannada
    'ml': 0.85  // Malayalam
  };
  return mapping[lang] || 0.5;
}

// --- DATA ---
const csvPath = path.join(__dirname, 'data', 'Sample Data for Fluid_4.26.csv');
const rawContent = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, ''); // Remove BOM
const movies = parseCSV(rawContent);

// --- CONFIG ---
const width = 1200;
const height = 1200;
const padding = 100;
const chartArea = {
  x: padding,
  y: padding + 100,
  w: width - padding * 2,
  h: height - padding * 2 - 100
};

const colors = {
  bg: '#0A0A0A',
  card: '#141414',
  primary: '#F5C518', // IMDb Yellow
  secondary: '#888',
  grid: '#222',
  q1: 'rgba(255, 255, 255, 0.02)', // Mainstream
  q2: 'rgba(0, 168, 225, 0.03)',   // Critical Darlings
  q3: 'rgba(229, 9, 20, 0.03)',    // Commercial
  q4: 'rgba(138, 43, 226, 0.03)'   // Regional Gems
};

const fonts = {
  'Bebas Neue': getFontBase64('BebasNeue-Regular.ttf'),
  'Anton': getFontBase64('Anton-Regular.ttf'),
  'Inter': getFontBase64('Inter-Regular.ttf'),
  'Oswald': getFontBase64('Oswald-Regular.ttf')
};

// --- RENDER ---
let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      ${Object.entries(fonts).map(([name, base64]) => base64 ? `
      @font-face {
        font-family: '${name}';
        src: url(data:font/ttf;charset=utf-8;base64,${base64}) format('truetype');
      }` : '').join('')}
      
      .title { font-family: 'Bebas Neue', sans-serif; font-size: 64px; fill: ${colors.primary}; letter-spacing: 4px; }
      .subtitle { font-family: 'Oswald', sans-serif; font-size: 16px; fill: ${colors.secondary}; letter-spacing: 6px; text-transform: uppercase; }
      .axis-label { font-family: 'Oswald', sans-serif; font-size: 14px; fill: ${colors.secondary}; letter-spacing: 2px; text-transform: uppercase; }
      .movie-label { font-family: 'Inter', sans-serif; font-size: 10px; fill: #fff; font-weight: 400; }
      .quadrant-title { font-family: 'Anton', sans-serif; font-size: 20px; fill: ${colors.primary}; opacity: 0.5; text-transform: uppercase; }
      .stat-text { font-family: 'Inter', sans-serif; font-size: 12px; fill: ${colors.primary}; }
    </style>
    
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="#151515" />
    </pattern>
  </defs>

  <rect width="100%" height="100%" fill="${colors.bg}" />
  <rect width="100%" height="100%" fill="url(#dotGrid)" />

  <!-- Header -->
  <text x="${padding}" y="100" class="title">POPULARITY MATRIX</text>
  <text x="${padding}" y="140" class="subtitle">IMDb EDITORIAL DATA REPORT • EDITION 2024</text>
  <line x1="${padding}" y1="160" x2="${width - padding}" y2="160" stroke="${colors.primary}" stroke-width="2" />

  <!-- Quadrants Shading -->
  <rect x="${chartArea.x}" y="${chartArea.y}" width="${chartArea.w/2}" height="${chartArea.h/2}" fill="${colors.q1}" />
  <rect x="${chartArea.x + chartArea.w/2}" y="${chartArea.y}" width="${chartArea.w/2}" height="${chartArea.h/2}" fill="${colors.q2}" />
  <rect x="${chartArea.x}" y="${chartArea.y + chartArea.h/2}" width="${chartArea.w/2}" height="${chartArea.h/2}" fill="${colors.q3}" />
  <rect x="${chartArea.x + chartArea.w/2}" y="${chartArea.y + chartArea.h/2}" width="${chartArea.w/2}" height="${chartArea.h/2}" fill="${colors.q4}" />

  <!-- Quadrant Titles -->
  <text x="${chartArea.x + 30}" y="${chartArea.y + 40}" class="quadrant-title">1. Mainstream Blockbusters</text>
  <text x="${chartArea.x + chartArea.w/2 + 30}" y="${chartArea.y + 40}" class="quadrant-title">2. Critical Darlings</text>
  <text x="${chartArea.x + 30}" y="${chartArea.y + chartArea.h/2 + 40}" class="quadrant-title">3. Commercial Entertainers</text>
  <text x="${chartArea.x + chartArea.w/2 + 30}" y="${chartArea.y + chartArea.h/2 + 40}" class="quadrant-title">4. Regional Gems</text>

  <!-- Grid -->
  <line x1="${chartArea.x + chartArea.w/2}" y1="${chartArea.y}" x2="${chartArea.x + chartArea.w/2}" y2="${chartArea.y + chartArea.h}" stroke="${colors.grid}" stroke-width="1" stroke-dasharray="5,5" />
  <line x1="${chartArea.x}" y1="${chartArea.y + chartArea.h/2}" x2="${chartArea.x + chartArea.w}" y2="${chartArea.y + chartArea.h/2}" stroke="${colors.grid}" stroke-width="1" stroke-dasharray="5,5" />
  
  <!-- Axes -->
  <line x1="${chartArea.x}" y1="${chartArea.y + chartArea.h}" x2="${chartArea.x + chartArea.w}" y2="${chartArea.y + chartArea.h}" stroke="#444" stroke-width="2" />
  <line x1="${chartArea.x}" y1="${chartArea.y}" x2="${chartArea.x}" y2="${chartArea.y + chartArea.h}" stroke="#444" stroke-width="2" />
  
  <text x="${width/2}" y="${height - padding/2}" class="axis-label" text-anchor="middle">Language Diversity Score (Diversity →)</text>
  <text x="${padding/3}" y="${height/2}" class="axis-label" transform="rotate(-90, ${padding/3}, ${height/2})" text-anchor="middle">User Rating (High →)</text>

  <!-- Plot Points -->
  ${movies.map(m => {
    const score = getDiversityScore(m.lang);
    const cx = chartArea.x + score * chartArea.w;
    const cy = chartArea.y + chartArea.h - ((m.rating - 5.5) / 4 * chartArea.h); // Range 5.5 to 9.5
    
    return `
      <g>
        <circle cx="${cx}" cy="${cy}" r="4" fill="${colors.primary}" filter="url(#glow)" />
        <text x="${cx + 8}" y="${cy + 4}" class="movie-label">${m.title.toUpperCase()}</text>
      </g>
    `;
  }).join('\n')}

  <!-- Legend / Footnote -->
  <text x="${padding}" y="${height - padding/2}" class="axis-label" style="font-size: 10px;">DATA SOURCE: Sample Data for Fluid_4.26.csv • TOTAL ENTRIES: ${movies.length}</text>
  <text x="${width - padding}" y="${height - padding/2}" class="axis-label" text-anchor="end" style="font-size: 10px;">VECTOR COMPOSITION BY ANTIGRAVITY</text>

</svg>`;

const outputPath = path.join(__dirname, 'public', 'svg', 'popularity_matrix.svg');
fs.writeFileSync(outputPath, svg);
console.log(`Popularity matrix infographic generated: ${outputPath}`);
