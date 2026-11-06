// Vygeneruje ukážkové „fotky“ (SVG ilustrácie) pre ukážkové dáta.
// Spustenie: node scripts/gen-demo-images.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const icons = {
  car: `<path d="M60 150h240M78 150c0-26 18-40 36-40h70c16 0 30 8 44 22l18 18h20c14 0 22 8 22 18v14H60v-14c0-10 8-18 18-18z"/><circle cx="116" cy="168" r="20"/><circle cx="262" cy="168" r="20"/><path d="M130 112l-10 38M200 112v38"/>`,
  bike: `<circle cx="110" cy="160" r="44"/><circle cx="270" cy="160" r="44"/><path d="M110 160l46-72h78l36 72M156 88l40 72h-86M196 160l38-72M146 74h28M226 72h22"/>`,
  phone: `<rect x="140" y="40" width="100" height="190" rx="18"/><path d="M178 56h24"/><circle cx="190" cy="210" r="6"/>`,
  headphones: `<path d="M110 170v-30a80 80 0 0 1 160 0v30"/><rect x="92" y="160" width="40" height="64" rx="14"/><rect x="248" y="160" width="40" height="64" rx="14"/>`,
  laptop: `<rect x="110" y="60" width="160" height="110" rx="10"/><path d="M80 196h220l-16-26H96z"/>`,
  watch: `<rect x="146" y="90" width="88" height="104" rx="22"/><path d="M162 90l8-44h40l8 44M162 194l8 44h40l8-44M190 128v18l12 8"/>`,
  sofa: `<path d="M90 190v-60a20 20 0 0 1 20-20h160a20 20 0 0 1 20 20v60M70 150a18 18 0 0 1 36 0v30h168v-30a18 18 0 0 1 36 0v50H70z M86 200v20M294 200v20"/>`,
  tag: `<path d="M120 80h90l70 70-90 90-70-70z"/><circle cx="150" cy="110" r="10"/>`,
};

const items = [
  ["camry", "car", 214, 6],
  ["domane", "bike", 196, 6],
  ["bmw", "car", 228, 5],
  ["marlin", "bike", 150, 4],
  ["iphone", "phone", 260, 1],
  ["octavia", "car", 205, 5],
  ["legion", "laptop", 270, 3],
  ["sony", "headphones", 30, 4],
  ["watch", "watch", 340, 3],
  ["sofa", "sofa", 25, 3],
  ["generic", "tag", 220, 1],
];

mkdirSync("public/demo", { recursive: true });

for (const [slug, icon, hue, count] of items) {
  for (let n = 1; n <= count; n++) {
    const h = (hue + n * 14) % 360;
    const s = 0.8 + (n % 3) * 0.08;
    const dx = (n % 2 ? -1 : 1) * n * 6;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
<defs>
<radialGradient id="g" cx="${50 + dx / 4}%" cy="38%" r="80%"><stop offset="0" stop-color="hsl(${h} 32% 30%)"/><stop offset=".55" stop-color="hsl(${h} 26% 16%)"/><stop offset="1" stop-color="hsl(${h} 22% 8%)"/></radialGradient>
<linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>
</defs>
<rect width="800" height="600" fill="url(#g)"/>
<ellipse cx="400" cy="395" rx="${250 * s}" ry="26" fill="#000" opacity=".35"/>
<rect y="380" width="800" height="220" fill="url(#f)"/>
<g transform="translate(${400 - 190 * s * 1.55 + dx} ${215 - 140 * s * 1.55}) scale(${1.55 * s})" fill="none" stroke="hsl(${h} 70% 88%)" stroke-opacity=".9" stroke-width="${6 / s}" stroke-linecap="round" stroke-linejoin="round">${icons[icon]}</g>
</svg>`;
    writeFileSync(`public/demo/${slug}-${n}.svg`, svg);
  }
}
console.log("hotovo");
