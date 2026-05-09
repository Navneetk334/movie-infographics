const fs = require('fs');
const path = require('path');

// --- UTILS ---
function getFontBase64(fontName) {
  const fontPath = path.join(__dirname, 'fonts', fontName);
  return fs.existsSync(fontPath) ? fs.readFileSync(fontPath).toString('base64') : '';
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
}

// --- DATA ---
const dataPath = path.join(__dirname, 'data', 'movie_extended.json');
const { movies } = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// --- CONFIG ---
const width = 1200;
const height = 1600;
const padding = 60;
const colors = {
  bg: '#0A0A0A',
  primary: '#F5C518', // IMDb Yellow
  secondary: '#666',
  text: '#FFFFFF',
  sciFi: '#00A8E1',
  action: '#E50914',
  drama: '#8A2BE2',
  crime: '#FFA500',
  grid: '#222'
};

const fonts = {
  'Bebas Neue': getFontBase64('BebasNeue-Regular.ttf'),
  'Anton': getFontBase64('Anton-Regular.ttf'),
  'Inter': getFontBase64('Inter-Regular.ttf'),
  'Oswald': getFontBase64('Oswald-Regular.ttf'),
  'Poppins': getFontBase64('Poppins-Regular.ttf')
};

// --- RENDERERS ---

function renderHeader() {
  return `
    <text x="${width/2}" y="100" class="title-main" text-anchor="middle">IMDb CINEMATIC REPORT</text>
    <text x="${width/2}" y="140" class="subtitle" text-anchor="middle">ANNUAL DATA VISUALIZATION • EDITION 2024</text>
    <line x1="${padding}" y1="170" x2="${width-padding}" y2="170" stroke="${colors.primary}" stroke-width="2" />
  `;
}

function renderRadialTimeline(cx, cy, r) {
  const startYear = 1950;
  const endYear = 2024;
  const yearRange = endYear - startYear;
  
  let out = `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colors.grid}" stroke-width="1" />
    <circle cx="${cx}" cy="${cy}" r="${r/2}" fill="none" stroke="${colors.grid}" stroke-width="1" stroke-dasharray="4" />
    <text x="${cx}" y="${cy - r - 20}" class="caption" text-anchor="middle">1950 — 2024 TIMELINE</text>
  `;

  movies.forEach(movie => {
    const angle = ((movie.year - startYear) / yearRange) * 360;
    const p = polarToCartesian(cx, cy, r * (movie.rating / 10), angle);
    const color = movie.genre === 'Action' ? colors.action : (movie.genre === 'Sci-Fi' ? colors.sciFi : colors.primary);
    
    out += `
      <line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="${color}" stroke-width="0.5" opacity="0.3" />
      <circle cx="${p.x}" cy="${p.y}" r="${Math.sqrt(movie.popularity)/2}" fill="${color}" opacity="0.8">
        <title>${movie.title} (${movie.year})</title>
      </circle>
    `;
  });
  
  return out;
}

function renderPerformanceMatrix(x, y, w, h) {
  let out = `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${colors.grid}" />
    <text x="${x}" y="${y - 15}" class="module-title">PERFORMANCE MATRIX</text>
    <text x="${x + w/2}" y="${y + h + 25}" class="caption" text-anchor="middle">RATING (X) vs POPULARITY (Y)</text>
  `;
  
  // Axes
  out += `<line x1="${x}" y1="${y+h}" x2="${x+w}" y2="${y+h}" stroke="${colors.secondary}" />`;
  out += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y+h}" stroke="${colors.secondary}" />`;

  movies.forEach(m => {
    const mx = x + (m.rating - 7) / 3 * w; // Map 7-10 range
    const my = y + h - (m.popularity / 100 * h);
    out += `<circle cx="${mx}" cy="${my}" r="4" fill="${colors.primary}" opacity="0.6" />`;
  });
  
  return out;
}

function renderLanguageDiversity(x, y, r) {
  const langs = {};
  movies.forEach(m => langs[m.language] = (langs[m.language] || 0) + 1);
  const total = movies.length;
  
  let out = `<text x="${x}" y="${y - r - 20}" class="module-title" text-anchor="middle">GLOBAL DIVERSITY</text>`;
  let currentAngle = 0;
  
  Object.entries(langs).forEach(([lang, count], i) => {
    const sliceAngle = (count / total) * 360;
    const path = describeArc(x, y, r, currentAngle, currentAngle + sliceAngle);
    const color = `hsl(${i * 40}, 70%, 50%)`;
    out += `<path d="${path}" fill="none" stroke="${color}" stroke-width="20" />`;
    
    // Label
    const midAngle = currentAngle + sliceAngle / 2;
    const lp = polarToCartesian(x, y, r + 30, midAngle);
    out += `<text x="${lp.x}" y="${lp.y}" class="mini-label" text-anchor="middle">${lang}</text>`;
    
    currentAngle += sliceAngle;
  });
  
  return out;
}

function renderYearlyDistribution(x, y, w, h) {
  const brackets = {};
  movies.forEach(m => {
    const b = Math.floor(m.year / 10) * 10;
    brackets[b] = (brackets[b] || 0) + 1;
  });
  
  const sorted = Object.entries(brackets).sort();
  const barW = w / sorted.length - 10;
  const max = Math.max(...Object.values(brackets));
  
  let out = `<text x="${x}" y="${y - 15}" class="module-title">YEARLY MOMENTUM</text>`;
  sorted.forEach(([year, count], i) => {
    const bh = (count / max) * h;
    out += `
      <rect x="${x + i * (barW + 10)}" y="${y + h - bh}" width="${barW}" height="${bh}" fill="${colors.primary}" opacity="0.8" />
      <text x="${x + i * (barW + 10) + barW/2}" y="${y + h + 20}" class="mini-label" text-anchor="middle">${year}s</text>
    `;
  });
  
  return out;
}

function renderActorConstellation(x, y, r) {
  const actorMap = {};
  movies.forEach(m => {
    m.actors.forEach(a => {
      if (!actorMap[a]) actorMap[a] = [];
      actorMap[a].push(m);
    });
  });

  let out = `<text x="${x}" y="${y - r - 20}" class="module-title" text-anchor="middle">ACTOR CONSTELLATION</text>`;
  
  // Only show actors with multiple movies in this set for clarity
  const commonActors = Object.entries(actorMap).filter(([_, films]) => films.length > 1);
  
  commonActors.forEach(([actor, films], i) => {
    const color = `hsl(${200 + i * 30}, 80%, 60%)`;
    for (let j = 0; j < films.length - 1; j++) {
      const startYear = 1950;
      const endYear = 2024;
      const angle1 = ((films[j].year - startYear) / (endYear - startYear)) * 360;
      const angle2 = ((films[j+1].year - startYear) / (endYear - startYear)) * 360;
      
      const p1 = polarToCartesian(x, y, r * 0.8, angle1);
      const p2 = polarToCartesian(x, y, r * 0.8, angle2);
      
      out += `<path d="M ${p1.x} ${p1.y} Q ${x} ${y} ${p2.x} ${p2.y}" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.6" />`;
    }
    
    // Add actor label at the end of their first film's arc
    const firstAngle = ((films[0].year - 1950) / 74) * 360;
    const lp = polarToCartesian(x, y, r * 0.9, firstAngle);
    out += `<text x="${lp.x}" y="${lp.y}" class="mini-label" fill="${color}">${actor.toUpperCase()}</text>`;
  });

  return out;
}

// --- MAIN ASSEMBLY ---

let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      ${Object.entries(fonts).map(([name, base64]) => base64 ? `
      @font-face {
        font-family: '${name}';
        src: url(data:font/ttf;charset=utf-8;base64,${base64}) format('truetype');
      }` : '').join('')}
      
      .title-main { font-family: 'Bebas Neue', sans-serif; font-size: 80px; fill: ${colors.primary}; letter-spacing: 8px; }
      .subtitle { font-family: 'Oswald', sans-serif; font-size: 18px; fill: ${colors.secondary}; letter-spacing: 4px; font-weight: 300; }
      .module-title { font-family: 'Anton', sans-serif; font-size: 24px; fill: ${colors.primary}; text-transform: uppercase; }
      .caption { font-family: 'Oswald', sans-serif; font-size: 14px; fill: ${colors.secondary}; letter-spacing: 1px; }
      .label { font-family: 'Inter', sans-serif; font-size: 12px; fill: ${colors.text}; }
      .mini-label { font-family: 'Poppins', sans-serif; font-size: 10px; fill: #888; }
    </style>
  </defs>
  
  <rect width="100%" height="100%" fill="${colors.bg}" />
  
  <!-- Content -->
  ${renderHeader()}
  
  <!-- Left Column -->
  ${renderPerformanceMatrix(padding, 250, 300, 300)}
  ${renderYearlyDistribution(padding, 1300, 300, 200)}
  
  <!-- Center -->
  ${renderRadialTimeline(width/2, height/2 + 50, 350)}
  
  <!-- Right Column -->
  <g transform="translate(${width - padding - 150}, 400)">
    ${renderLanguageDiversity(0, 0, 100)}
  </g>
  
  <g transform="translate(${width - padding - 150}, 1300)">
    ${renderActorConstellation(0, 0, 150)}
  </g>
  
  <!-- Decorative Grid -->
  <line x1="${width/2}" y1="200" x2="${width/2}" y2="350" stroke="${colors.grid}" stroke-dasharray="2,2" />
  <line x1="${width/2}" y1="${height - 250}" x2="${width/2}" y2="${height - 50}" stroke="${colors.grid}" stroke-dasharray="2,2" />
  
  <!-- Bottom Branding -->
  <text x="${width-padding}" y="${height-padding}" class="caption" text-anchor="end">IMDb SOURCE DATA • VERIFIED 2024</text>
  <text x="${padding}" y="${height-padding}" class="caption">PORTABLE VECTOR COMPOSITION</text>

</svg>`;

const outputPath = path.join(__dirname, 'public', 'svg', 'editorial_infographic.svg');
fs.writeFileSync(outputPath, svg);
console.log(`Editorial infographic generated: ${outputPath}`);
