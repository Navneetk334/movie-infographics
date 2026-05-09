# Cinematic Movie Infographics 🎬

A professional data visualisation project that generates high-density, print-ready editorial infographics from movie datasets. This project uses custom Node.js scripts to generate portable SVGs with embedded premium typography.

## 🌟 Key Features
- **Editorial Infographic**: A 1200x1600 multi-module layout featuring:
  - **Radial Timeline**: 74 years of cinematic history (1950–2024).
  - **Performance Matrix**: Rating vs. Popularity analysis.
  - **Actor Constellation**: Network graph showing actor connections across films.
  - **Language Diversity**: Global cinema distribution donut chart.
- **Portable SVGs**: All fonts are embedded as Base64 within the SVG `<defs>`, ensuring perfect rendering everywhere.
- **Premium Aesthetics**: IMDb-inspired dark mode design system.

## 📂 Project Structure
- `/data`: JSON datasets for movies and metrics.
- `/svg`: Exported vector infographics.
- `/pdf`: Exported print reports.
- `/fonts`: Premium source fonts (Bebas Neue, Anton, etc.).
- `/assets`: Brand assets and supplementary images.

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Generate Infographics
To generate the latest editorial report:
```bash
node generate_editorial.js
```

### 3. View Showcase
Open `index.html` or `showcase.html` in your browser to view the interactive gallery.

## 🛠️ Built With
- **Node.js**: Core generation logic.
- **SVG**: High-fidelity vector layout.
- **Vanilla CSS**: Premium web presentation.
- **Google Fonts**: Inter, Bebas Neue, Anton, Oswald, Poppins.

---
Created by **Antigravity Visuals Lab**
