const fs = require('fs');
const path = require('path');

// Function to get base64 of a font
function getFontBase64(fontName) {
  const fontPath = path.join(__dirname, 'fonts', fontName);
  if (fs.existsSync(fontPath)) {
    return fs.readFileSync(fontPath).toString('base64');
  }
  return null;
}

// Read data from JSON
const dataPath = path.join(__dirname, 'data', 'movies.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const { movies, labels } = JSON.parse(rawData);

// Embed fonts
const fonts = {
  'Bebas Neue': getFontBase64('BebasNeue-Regular.ttf'),
  'Anton': getFontBase64('Anton-Regular.ttf'),
  'Inter': getFontBase64('Inter-Regular.ttf'),
  'Oswald': getFontBase64('Oswald-Regular.ttf'),
  'Poppins': getFontBase64('Poppins-Regular.ttf')
};

const size = 600;
const center = size / 2;
const radius = size * 0.4;
const levels = 5;

function getPoint(angle, value, max = 100) {
  const r = (value / max) * radius;
  return {
    x: center + r * Math.cos(angle - Math.PI / 2),
    y: center + r * Math.sin(angle - Math.PI / 2)
  };
}

let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      ${Object.entries(fonts).map(([name, base64]) => base64 ? `
      @font-face {
        font-family: '${name}';
        src: url(data:font/ttf;charset=utf-8;base64,${base64}) format('truetype');
        font-weight: normal;
        font-style: normal;
      }` : '').join('')}
      
      .label { font-family: 'Inter', sans-serif; font-size: 13px; fill: #aaa; text-anchor: middle; }
      .title { font-family: 'Bebas Neue', sans-serif; font-size: 32px; fill: #fff; text-anchor: middle; letter-spacing: 2px; }
      .legend-text { font-family: 'Poppins', sans-serif; font-size: 14px; fill: #fff; }
      .caption { font-family: 'Oswald', sans-serif; font-size: 12px; fill: #666; text-anchor: middle; }
    </style>
  </defs>
  
  <rect width="100%" height="100%" fill="#121212" />
  
  <text x="${center}" y="50" class="title">NOLAN MASTERPIECES</text>
  <text x="${center}" y="80" class="caption">DATA VISUALIZATION EXPERIMENT VOL. 1</text>
  
  <!-- Grid levels -->
  ${Array.from({ length: levels }).map((_, i) => {
    const r = ((i + 1) / levels) * radius;
    const points = labels.map((_, j) => {
      const angle = (j / labels.length) * 2 * Math.PI;
      const p = getPoint(angle, (i + 1) * 20);
      return `${p.x},${p.y}`;
    }).join(' ');
    return `<polygon points="${points}" fill="none" stroke="#333" stroke-width="1" />`;
  }).join('\n  ')}
  
  <!-- Axis lines -->
  ${labels.map((label, i) => {
    const angle = (i / labels.length) * 2 * Math.PI;
    const p = getPoint(angle, 100);
    const lp = getPoint(angle, 110);
    return `
    <line x1="${center}" y1="${center}" x2="${p.x}" y2="${p.y}" stroke="#333" stroke-width="1" />
    <text x="${lp.x}" y="${lp.y}" class="label">${label.toUpperCase()}</text>`;
  }).join('')}
  
  <!-- Movie shapes -->
  ${movies.map(movie => {
    const points = movie.values.map((v, i) => {
      const angle = (i / labels.length) * 2 * Math.PI;
      const p = getPoint(angle, v);
      return `${p.x},${p.y}`;
    }).join(' ');
    return `<polygon points="${points}" fill="${movie.color}" stroke="${movie.stroke}" stroke-width="2" />`;
  }).join('\n  ')}
  
  <!-- Legend -->
  ${movies.map((movie, i) => `
    <rect x="20" y="${size - 100 + i * 25}" width="15" height="15" fill="${movie.stroke}" rx="2" />
    <text x="45" y="${size - 100 + i * 25 + 12}" class="legend-text">${movie.name}</text>
  `).join('')}
</svg>`;

const outputPath = path.join(__dirname, 'public', 'svg', 'movie_infographic.svg');
fs.writeFileSync(outputPath, svg);
console.log(`Portable SVG generated with embedded fonts: ${outputPath}`);
