import { ArtStyleId, PoseId, WardrobeId, ExpressionId } from '../types';

interface MockRenderParams {
  artStyle: ArtStyleId;
  pose: PoseId;
  wardrobe: WardrobeId;
  customWardrobeText?: string;
  expression: ExpressionId;
  seed: number;
  hasFacialHair?: boolean;
  hairTone?: 'black' | 'dark-brown' | 'brown' | 'blonde';
}

// Generate stylized SVG artwork matching the chosen art style, pose, and wardrobe
export function generateMockCartoonSvg(params: MockRenderParams): string {
  const { artStyle, pose, wardrobe, expression, seed, hasFacialHair = true } = params;

  // Style-specific colors and aesthetic settings
  let bgGradient1 = '#1e1b4b';
  let bgGradient2 = '#0f172a';
  let bgGlow = '#6366f1';
  let skinTone = '#fcd34d';
  let skinShadow = '#f59e0b';
  let strokeColor = '#0f172a';
  let strokeWidth = '3';
  let isCellShaded = false;
  let hasHalftone = false;
  let isCyberpunk = false;
  let isClaymation = false;

  switch (artStyle) {
    case 'pixar-3d':
      bgGradient1 = '#0284c7';
      bgGradient2 = '#0369a1';
      bgGlow = '#38bdf8';
      skinTone = '#fed7aa';
      skinShadow = '#fb923c';
      strokeWidth = '0'; // Soft 3D lighting without harsh ink outlines
      break;
    case 'modern-vector':
      bgGradient1 = '#0f766e';
      bgGradient2 = '#134e4a';
      bgGlow = '#2dd4bf';
      skinTone = '#fef08a';
      skinShadow = '#fde047';
      strokeColor = '#134e4a';
      strokeWidth = '4';
      break;
    case 'classic-anime':
      bgGradient1 = '#831843';
      bgGradient2 = '#4c0519';
      bgGlow = '#f43f5e';
      skinTone = '#ffedd5';
      skinShadow = '#fed7aa';
      strokeColor = '#1c1917';
      strokeWidth = '2.5';
      isCellShaded = true;
      break;
    case 'comic-novel':
      bgGradient1 = '#1e3a8a';
      bgGradient2 = '#0f172a';
      bgGlow = '#3b82f6';
      skinTone = '#fef3c7';
      skinShadow = '#fde68a';
      strokeColor = '#000000';
      strokeWidth = '5';
      hasHalftone = true;
      break;
    case 'cyberpunk-toon':
      bgGradient1 = '#2e1065';
      bgGradient2 = '#09090b';
      bgGlow = '#d946ef';
      skinTone = '#e0e7ff';
      skinShadow = '#a5b4fc';
      strokeColor = '#06b6d4';
      strokeWidth = '3';
      isCyberpunk = true;
      break;
    case 'claymation-3d':
      bgGradient1 = '#78350f';
      bgGradient2 = '#451a03';
      bgGlow = '#f59e0b';
      skinTone = '#fdba74';
      skinShadow = '#ea580c';
      strokeWidth = '1.5';
      isClaymation = true;
      break;
  }

  // Wardrobe colors
  let clothesColor = '#3b82f6';
  let clothesShadow = '#1d4ed8';
  let clothesDetail = '#93c5fd';

  switch (wardrobe) {
    case 'saudi-thobe-shemagh':
    case 'bahraini-thobe-ghutra':
      clothesColor = '#f8fafc';
      clothesShadow = '#e2e8f0';
      clothesDetail = '#94a3b8';
      break;
    case 'royal-bisht-mishlah':
      clothesColor = '#0f172a';
      clothesShadow = '#020617';
      clothesDetail = '#fbbf24'; // Gold zari
      break;
    case 'gulf-luxury-abaya':
      clothesColor = '#09090b';
      clothesShadow = '#000000';
      clothesDetail = '#f59e0b';
      break;
    case 'bahrain-pearl-heritage':
      clothesColor = '#d6d3d1';
      clothesShadow = '#a8a29e';
      clothesDetail = '#0284c7';
      break;
    case 'saudi-founding-dagla':
    case 'ardah-ceremonial':
      clothesColor = '#78350f';
      clothesShadow = '#451a03';
      clothesDetail = '#fbbf24';
      break;
    case 'modern-gulf-formal':
      clothesColor = '#1e3a8a';
      clothesShadow = '#172554';
      clothesDetail = '#f8fafc';
      break;
    case 'casual-hoodie':
      clothesColor = '#ec4899';
      clothesShadow = '#be185d';
      clothesDetail = '#f472b6';
      break;
    case 'professional-suit':
      clothesColor = '#1e293b';
      clothesShadow = '#0f172a';
      clothesDetail = '#e2e8f0';
      break;
    case 'streetwear-tech':
      clothesColor = '#18181b';
      clothesShadow = '#09090b';
      clothesDetail = '#06b6d4';
      break;
    case 'traditional-robes':
      clothesColor = '#e0e7ff';
      clothesShadow = '#c7d2fe';
      clothesDetail = '#6366f1';
      break;
    case 'custom-override':
    default:
      clothesColor = '#2563eb';
      clothesShadow = '#1d4ed8';
      clothesDetail = '#93c5fd';
      break;
  }

  // Pose elements: Arms, Hands, Head tilt
  let poseSvg = '';
  switch (pose) {
    case 'salam-hand-on-heart':
      poseSvg = `
        <!-- Left arm natural, Right arm respectfully over heart / chest -->
        <path d="M150 490 Q180 540 210 590" stroke="${clothesColor}" stroke-width="40" stroke-linecap="round"/>
        <path d="M430 480 Q360 410 300 420" stroke="${clothesColor}" stroke-width="42" stroke-linecap="round"/>
        <g transform="translate(300, 420) rotate(-20)">
          <ellipse cx="0" cy="0" rx="26" ry="20" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
          <rect x="-14" y="-8" width="28" height="14" rx="6" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        </g>
      `;
      break;
    case 'saudi-ardah-sword':
      poseSvg = `
        <!-- Ardah Celebratory Sword Pose -->
        <path d="M150 490 Q180 540 210 590" stroke="${clothesColor}" stroke-width="40" stroke-linecap="round"/>
        <path d="M420 450 Q480 340 490 260" stroke="${clothesColor}" stroke-width="40" stroke-linecap="round"/>
        <!-- Hand holding sword aloft -->
        <g transform="translate(490, 240)">
          <circle cx="0" cy="0" r="22" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
          <!-- Golden Hilt & Silver Sword Blade -->
          <rect x="-6" y="-120" width="12" height="120" rx="3" fill="#e2e8f0" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
          <path d="M-22 y-10 L22 y-10" stroke="#f59e0b" stroke-width="8" stroke-linecap="round"/>
          <circle cx="0" cy="18" r="7" fill="#f59e0b"/>
        </g>
      `;
      break;
    case 'gahwa-dallah-pour':
      poseSvg = `
        <!-- Left hand holding finjan, Right hand pouring traditional Dallah -->
        <path d="M180 500 Q220 450 250 430" stroke="${clothesColor}" stroke-width="38" stroke-linecap="round"/>
        <circle cx="250" cy="430" r="18" fill="${skinTone}"/>
        <polygon points="240,430 260,430 255,445 245,445" fill="#fef08a" stroke="#d97706" stroke-width="2"/>
        <!-- Right arm with Dallah -->
        <path d="M420 480 Q380 400 350 380" stroke="${clothesColor}" stroke-width="38" stroke-linecap="round"/>
        <g transform="translate(350, 360)">
          <!-- Golden Dallah coffee pot -->
          <path d="M-15 -10 Q0 -25 15 -10 L12 25 L-12 25 Z" fill="#fbbf24" stroke="#b45309" stroke-width="2"/>
          <path d="M-12 0 Q-28 -5 -20 -25 Q-14 -15 -8 -10" fill="none" stroke="#fbbf24" stroke-width="3"/>
          <path d="M10 5 Q24 10 18 20" fill="none" stroke="#fbbf24" stroke-width="3"/>
        </g>
      `;
      break;
    case 'falconry-arm':
      poseSvg = `
        <!-- Falconer forearm forward with majestic falcon -->
        <path d="M150 490 Q180 540 210 590" stroke="${clothesColor}" stroke-width="40" stroke-linecap="round"/>
        <path d="M410 460 Q480 430 460 360" stroke="${clothesColor}" stroke-width="42" stroke-linecap="round"/>
        <!-- Leather Glove & Falcon -->
        <ellipse cx="460" cy="360" rx="30" ry="22" fill="#78350f" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        <g transform="translate(460, 310)">
          <!-- Stylized noble falcon perched -->
          <path d="M-15 40 Q0 0 20 20 Q15 50 -10 50 Z" fill="#451a03" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
          <polygon points="20,15 32,22 18,26" fill="#f59e0b"/>
          <circle cx="12" cy="16" r="3.5" fill="#000000"/>
        </g>
      `;
      break;
    case 'shemagh-adjust':
      poseSvg = `
        <!-- Hand gracefully adjusting Shemagh / Agal -->
        <path d="M150 490 Q180 540 210 590" stroke="${clothesColor}" stroke-width="40" stroke-linecap="round"/>
        <path d="M420 460 Q460 340 380 200" stroke="${clothesColor}" stroke-width="38" stroke-linecap="round"/>
        <g transform="translate(380, 190) rotate(25)">
          <ellipse cx="0" cy="0" rx="20" ry="16" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
          <rect x="-10" y="-18" width="10" height="18" rx="5" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        </g>
      `;
      break;
    case 'karak-chai-toast':
      poseSvg = `
        <!-- Holding warm glass of Karak Chai -->
        <path d="M150 490 Q180 540 210 590" stroke="${clothesColor}" stroke-width="40" stroke-linecap="round"/>
        <path d="M420 480 Q450 420 410 370" stroke="${clothesColor}" stroke-width="38" stroke-linecap="round"/>
        <g transform="translate(410, 360)">
          <ellipse cx="0" cy="8" rx="18" ry="14" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
          <!-- Glass teacup with Karak chai color -->
          <rect x="-10" y="-24" width="20" height="26" rx="3" fill="#d97706" opacity="0.9" stroke="#ffffff" stroke-width="1.5"/>
          <path d="M-6 -28 Q0 -34 6 -28" stroke="#cbd5e1" stroke-width="2" fill="none" opacity="0.6"/>
        </g>
      `;
      break;
    case 'arms-crossed':
      poseSvg = `
        <!-- Crossed Arms Forearms & Hands -->
        <path d="M160 480 Q250 510 340 480 Q320 440 230 440 Q160 440 160 480 Z" fill="${clothesShadow}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        <path d="M440 480 Q350 510 260 480 Q280 440 370 440 Q440 440 440 480 Z" fill="${clothesColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        <ellipse cx="230" cy="460" rx="24" ry="18" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        <ellipse cx="370" cy="460" rx="24" ry="18" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
      `;
      break;
    case 'waving-friendly':
      poseSvg = `
        <!-- Left arm resting, Right arm raised waving -->
        <path d="M140 480 Q190 530 220 580" stroke="${clothesColor}" stroke-width="45" stroke-linecap="round"/>
        <path d="M410 420 Q480 340 500 240" stroke="${clothesColor}" stroke-width="42" stroke-linecap="round"/>
        <!-- Waving Hand with 4 cartoon fingers -->
        <g transform="translate(500, 220) rotate(15)">
          <ellipse cx="0" cy="0" rx="28" ry="24" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
          <rect x="-24" y="-35" width="12" height="24" rx="6" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
          <rect x="-8" y="-42" width="12" height="30" rx="6" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
          <rect x="8" y="-38" width="12" height="26" rx="6" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
          <rect x="22" y="-28" width="11" height="20" rx="5" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        </g>
      `;
      break;
    case 'dynamic-pointing':
      poseSvg = `
        <!-- Left arm natural, Right arm foreshortened pointing forward -->
        <path d="M150 490 Q180 540 210 590" stroke="${clothesColor}" stroke-width="40" stroke-linecap="round"/>
        <!-- Dramatic foreshortened forearm pointing toward camera -->
        <ellipse cx="420" cy="410" rx="55" ry="45" fill="${clothesColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        <g transform="translate(420, 390)">
          <circle cx="0" cy="0" r="32" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
          <!-- Pointing index finger coming at camera -->
          <ellipse cx="0" cy="-18" rx="14" ry="18" fill="${skinShadow}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
          <circle cx="0" cy="-22" r="9" fill="${skinTone}"/>
          <ellipse cx="-16" cy="6" rx="10" ry="14" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
          <ellipse cx="0" cy="14" rx="11" ry="14" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
          <ellipse cx="16" cy="6" rx="10" ry="14" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        </g>
      `;
      break;
    case 'thinking-chin':
      poseSvg = `
        <!-- Hand under chin thinking -->
        <path d="M380 500 Q420 400 370 330" stroke="${clothesColor}" stroke-width="40" stroke-linecap="round"/>
        <g transform="translate(340, 330) rotate(-15)">
          <ellipse cx="0" cy="0" rx="20" ry="16" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
          <rect x="-10" y="-26" width="10" height="22" rx="5" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
          <ellipse cx="-16" cy="-4" rx="7" ry="12" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        </g>
      `;
      break;
    default: // neutral-portrait
      poseSvg = `
        <path d="M150 480 Q190 540 220 600" stroke="${clothesColor}" stroke-width="44" stroke-linecap="round"/>
        <path d="M450 480 Q410 540 380 600" stroke="${clothesColor}" stroke-width="44" stroke-linecap="round"/>
      `;
      break;
  }

  // Mouth & Eyes based on expression
  let mouthSvg = '';
  let eyesSvg = '';
  switch (expression) {
    case 'playful-wink':
      eyesSvg = `
        <!-- Left Eye Open Big -->
        <ellipse cx="260" cy="225" rx="22" ry="26" fill="#ffffff" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        <circle cx="264" cy="225" r="14" fill="${artStyle === 'cyberpunk-toon' ? '#06b6d4' : '#6366f1'}"/>
        <circle cx="264" cy="225" r="7" fill="#0f172a"/>
        <circle cx="268" cy="218" r="4.5" fill="#ffffff"/>
        <!-- Right Eye Cheeky Wink -->
        <path d="M322 225 Q342 208 362 225" fill="none" stroke="${strokeColor}" stroke-width="${Number(strokeWidth) + 3}" stroke-linecap="round"/>
      `;
      mouthSvg = `
        <path d="M280 295 Q305 315 330 290 Q305 295 280 295 Z" fill="#e11d48" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
      `;
      break;
    case 'cheerful-laugh':
      eyesSvg = `
        <path d="M240 225 Q260 210 280 225" fill="none" stroke="${strokeColor}" stroke-width="${Number(strokeWidth) + 3}" stroke-linecap="round"/>
        <path d="M320 225 Q340 210 360 225" fill="none" stroke="${strokeColor}" stroke-width="${Number(strokeWidth) + 3}" stroke-linecap="round"/>
      `;
      mouthSvg = `
        <path d="M265 285 Q300 330 335 285 Z" fill="#be123c" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        <path d="M272 285 Q300 298 328 285 Z" fill="#ffffff"/>
        <path d="M285 315 Q300 325 315 315 Q300 305 285 315 Z" fill="#fb7185"/>
      `;
      break;
    case 'serious-stoic':
      eyesSvg = `
        <ellipse cx="260" cy="225" rx="20" ry="18" fill="#ffffff" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        <ellipse cx="340" cy="225" rx="20" ry="18" fill="#ffffff" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        <circle cx="262" cy="225" r="10" fill="#334155"/>
        <circle cx="338" cy="225" r="10" fill="#334155"/>
        <circle cx="264" cy="222" r="3" fill="#ffffff"/>
        <circle cx="340" cy="222" r="3" fill="#ffffff"/>
      `;
      mouthSvg = `
        <line x1="275" y1="295" x2="325" y2="295" stroke="${strokeColor}" stroke-width="${Number(strokeWidth) + 1}" stroke-linecap="round"/>
      `;
      break;
    default: // confident-smile
      eyesSvg = `
        <ellipse cx="260" cy="225" rx="23" ry="26" fill="#ffffff" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        <ellipse cx="340" cy="225" rx="23" ry="26" fill="#ffffff" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        <circle cx="263" cy="225" r="14" fill="${artStyle === 'cyberpunk-toon' ? '#a855f7' : '#0284c7'}"/>
        <circle cx="337" cy="225" r="14" fill="${artStyle === 'cyberpunk-toon' ? '#a855f7' : '#0284c7'}"/>
        <circle cx="263" cy="225" r="7" fill="#0f172a"/>
        <circle cx="337" cy="225" r="7" fill="#0f172a"/>
        <circle cx="267" cy="218" r="4.5" fill="#ffffff"/>
        <circle cx="341" cy="218" r="4.5" fill="#ffffff"/>
        <circle cx="258" cy="229" r="2" fill="#ffffff"/>
        <circle cx="332" cy="229" r="2" fill="#ffffff"/>
      `;
      mouthSvg = `
        <path d="M272 290 Q300 320 328 290" fill="#be123c" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
        <path d="M276 290 Q300 304 324 290" fill="#ffffff"/>
      `;
      break;
  }

  // Halftone pattern for comic style
  const halftoneDef = hasHalftone
    ? `
    <pattern id="comic-dots" width="12" height="12" patternUnits="userSpaceOnUse">
      <circle cx="6" cy="6" r="2" fill="#000000" opacity="0.12"/>
    </pattern>
    `
    : '';

  // Cyberpunk HUD details
  const cyberpunkOverlays = isCyberpunk
    ? `
    <path d="M210 240 L235 240 L245 255" stroke="#06b6d4" stroke-width="2.5" fill="none" opacity="0.8"/>
    <circle cx="245" cy="255" r="3" fill="#f43f5e"/>
    <text x="430" y="80" fill="#06b6d4" font-size="14" font-family="monospace" letter-spacing="2">SYS.SYNC:OK</text>
    <rect x="425" y="90" width="110" height="4" fill="#06b6d4" opacity="0.4"/>
    <circle cx="300" cy="250" r="275" fill="none" stroke="#d946ef" stroke-width="1.5" stroke-dasharray="8 12" opacity="0.4"/>
    `
    : '';

  // Return complete self-contained SVG
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="1024" height="1024">
  <defs>
    <linearGradient id="char-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgGradient1}"/>
      <stop offset="100%" stop-color="${bgGradient2}"/>
    </linearGradient>
    <radialGradient id="char-glow" cx="50%" cy="30%" r="55%">
      <stop offset="0%" stop-color="${bgGlow}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    ${halftoneDef}
  </defs>

  <!-- Background Canvas -->
  <rect width="600" height="600" fill="url(#char-bg)"/>
  <circle cx="300" cy="250" r="280" fill="url(#char-glow)"/>
  ${hasHalftone ? '<rect width="600" height="600" fill="url(#comic-dots)"/>' : ''}

  <!-- Torso & Wardrobe Base -->
  <path d="M120 600 C140 450 200 410 300 410 C400 410 460 450 480 600 Z" fill="${clothesColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>

  <!-- Wardrobe Details -->
  ${
    wardrobe === 'saudi-thobe-shemagh' || wardrobe === 'bahraini-thobe-ghutra'
      ? `
    <!-- Crisp White Thobe Collar & Placket Buttons -->
    <path d="M275 405 L300 445 L325 405 Z" fill="#ffffff" stroke="${clothesDetail}" stroke-width="2"/>
    <rect x="294" y="440" width="12" height="110" rx="3" fill="#ffffff" stroke="${clothesDetail}" stroke-width="1.5"/>
    <circle cx="300" cy="460" r="2.5" fill="#64748b"/>
    <circle cx="300" cy="490" r="2.5" fill="#64748b"/>
    <circle cx="300" cy="520" r="2.5" fill="#64748b"/>
    <!-- Flowing Red/White Shemagh / Ghutra Draping Over Shoulders -->
    <path d="M160 300 C150 420 180 520 220 560 L245 420 Z" fill="#ef4444" opacity="0.9" stroke="#ffffff" stroke-width="2"/>
    <path d="M440 300 C450 420 420 520 380 560 L355 420 Z" fill="#ef4444" opacity="0.9" stroke="#ffffff" stroke-width="2"/>
  `
      : wardrobe === 'royal-bisht-mishlah'
        ? `
    <!-- Royal Bisht with Hand-Embroidered Gold Zari Trim -->
    <path d="M260 410 L300 500 L340 410 Z" fill="#ffffff" stroke="${strokeColor}" stroke-width="2"/>
    <path d="M140 420 L280 430 L300 600 L120 600 Z" fill="#0f172a" stroke="#fbbf24" stroke-width="4"/>
    <path d="M460 420 L320 430 L300 600 L480 600 Z" fill="#0f172a" stroke="#fbbf24" stroke-width="4"/>
    <line x1="300" y1="430" x2="300" y2="600" stroke="#fbbf24" stroke-width="8"/>
    <!-- Golden Zari Braided Tassels -->
    <circle cx="300" cy="490" r="6" fill="#fbbf24"/>
    <line x1="300" y1="490" x2="285" y2="530" stroke="#fbbf24" stroke-width="3"/>
    <line x1="300" y1="490" x2="315" y2="530" stroke="#fbbf24" stroke-width="3"/>
  `
      : wardrobe === 'gulf-luxury-abaya'
        ? `
    <!-- Luxury Embroidered Gulf Abaya -->
    <path d="M120 600 C140 430 200 410 300 410 C400 410 460 430 480 600 Z" fill="#09090b"/>
    <line x1="300" y1="410" x2="300" y2="600" stroke="#f59e0b" stroke-width="4"/>
    <path d="M200 450 Q300 480 400 450" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 6"/>
  `
      : wardrobe === 'casual-hoodie'
        ? `
    <!-- Hoodie Pocket & Drawstrings -->
    <path d="M220 410 C240 460 360 460 380 410 C350 435 250 435 220 410 Z" fill="${clothesShadow}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
    <line x1="280" y1="420" x2="276" y2="470" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
    <circle cx="276" cy="472" r="4" fill="#cbd5e1"/>
    <line x1="320" y1="420" x2="324" y2="470" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
    <circle cx="324" cy="472" r="4" fill="#cbd5e1"/>
    <path d="M200 520 Q300 560 400 520 L380 600 L220 600 Z" fill="${clothesShadow}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
  `
        : wardrobe === 'professional-suit'
          ? `
    <!-- Shirt, Tie & Lapels -->
    <path d="M260 410 L300 480 L340 410 Z" fill="#ffffff" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
    <path d="M292 425 L308 425 L304 530 L300 550 L296 530 Z" fill="#dc2626" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
    <path d="M220 410 L275 490 L240 490 Z" fill="${clothesShadow}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
    <path d="M380 410 L325 490 L360 490 Z" fill="${clothesShadow}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
  `
          : wardrobe === 'streetwear-tech'
            ? `
    <!-- Techwear Vest Straps & Buckles -->
    <rect x="230" y="440" width="40" height="70" rx="6" fill="#27272a" stroke="${clothesDetail}" stroke-width="2"/>
    <rect x="330" y="440" width="40" height="70" rx="6" fill="#27272a" stroke="${clothesDetail}" stroke-width="2"/>
    <line x1="270" y1="460" x2="330" y2="460" stroke="${clothesDetail}" stroke-width="3"/>
    <line x1="270" y1="490" x2="330" y2="490" stroke="${clothesDetail}" stroke-width="3"/>
    <rect x="290" y="454" width="20" height="12" rx="3" fill="#06b6d4"/>
  `
            : `
    <!-- Minimalist Zen Robe Drape -->
    <path d="M220 410 L350 560" stroke="${clothesDetail}" stroke-width="6"/>
    <path d="M380 410 L280 520" stroke="${clothesDetail}" stroke-width="6"/>
    <rect x="260" y="520" width="80" height="24" rx="4" fill="${clothesShadow}"/>
  `
  }

  <!-- Neck -->
  <rect x="268" y="300" width="64" height="120" rx="20" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
  <path d="M268 335 Q300 365 332 335" fill="none" stroke="${skinShadow}" stroke-width="4" opacity="0.5"/>

  <!-- Character Hair Behind -->
  <ellipse cx="300" cy="210" rx="140" ry="155" fill="${seed % 2 === 0 ? '#451a03' : '#18181b'}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>

  <!-- Head Base (Stylized Shape) -->
  <path d="M205 190 C205 105 395 105 395 190 C395 295 355 365 300 365 C245 365 205 295 205 190 Z" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>

  <!-- Stylized Ears -->
  <ellipse cx="200" cy="235" rx="16" ry="24" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
  <ellipse cx="400" cy="235" rx="16" ry="24" fill="${skinTone}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>

  <!-- Eyebrows -->
  <path d="M236 195 Q262 178 284 192" stroke="${strokeColor}" stroke-width="${Number(strokeWidth) + 2.5}" stroke-linecap="round" fill="none"/>
  <path d="M316 192 Q338 178 364 195" stroke="${strokeColor}" stroke-width="${Number(strokeWidth) + 2.5}" stroke-linecap="round" fill="none"/>

  <!-- Eyes based on expression -->
  ${eyesSvg}

  <!-- Nose (Stylized Cute or Comic) -->
  <path d="M296 230 L294 258 Q300 264 306 258" fill="none" stroke="${skinShadow}" stroke-width="3" stroke-linecap="round"/>

  <!-- Cheeks Blush -->
  <ellipse cx="238" cy="256" rx="16" ry="9" fill="#f43f5e" opacity="0.35"/>
  <ellipse cx="362" cy="256" rx="16" ry="9" fill="#f43f5e" opacity="0.35"/>

  <!-- Mouth based on expression -->
  ${mouthSvg}

  <!-- Facial Hair (Beard & Mustache) for realistic masculine avatar likeness -->
  ${
    hasFacialHair
      ? `
    <!-- Groomed Mustache -->
    <path d="M272 278 Q300 286 328 278 Q316 288 300 285 Q284 288 272 278 Z" fill="#18181b" stroke="${strokeColor}" stroke-width="1.5"/>
    <!-- Sculpted Beard / Stubble along Jawline and Chin -->
    <path d="M210 240 C210 320 240 375 300 375 C360 375 390 320 390 240 C382 300 348 355 300 355 C252 355 218 300 210 240 Z" fill="#18181b" opacity="0.85" stroke="${strokeColor}" stroke-width="2"/>
    <!-- Chin Goatee / Patch -->
    <ellipse cx="300" cy="335" rx="14" ry="16" fill="#18181b"/>
  `
      : ''
  }

  <!-- Traditional Agal and Ghutra / Shemagh Headwear (if traditional wardrobe chosen) -->
  ${
    wardrobe === 'saudi-thobe-shemagh' || wardrobe === 'bahraini-thobe-ghutra' || wardrobe === 'royal-bisht-mishlah'
      ? `
    <!-- Flowing Ghutra / Shemagh Base -->
    <path d="M170 190 C170 90 430 90 430 190 C435 290 440 390 450 490 L400 520 L380 250 C370 150 230 150 220 250 L200 520 L150 490 C160 390 165 290 170 190 Z" fill="${wardrobe === 'bahraini-thobe-ghutra' ? '#ffffff' : '#ef4444'}" stroke="${strokeColor}" stroke-width="2.5"/>
    <!-- Black Double-Ring Royal Agal -->
    <ellipse cx="300" cy="140" rx="90" ry="18" fill="none" stroke="#09090b" stroke-width="10"/>
    <ellipse cx="300" cy="148" rx="92" ry="18" fill="none" stroke="#09090b" stroke-width="10"/>
    <ellipse cx="300" cy="144" rx="90" ry="18" fill="none" stroke="#fbbf24" stroke-width="1.5" opacity="0.6"/>
  `
      : `
    <!-- Modern Hair Forefront / Pompadour Bangs -->
    <path d="M200 170 C220 80 380 80 400 170 C370 140 330 135 300 155 C270 135 230 140 200 170 Z" fill="${seed % 2 === 0 ? '#18181b' : '#27272a'}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
    <path d="M205 175 Q240 220 220 265 Q205 210 205 175 Z" fill="${seed % 2 === 0 ? '#18181b' : '#27272a'}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
    <path d="M395 175 Q360 220 380 265 Q395 210 395 175 Z" fill="${seed % 2 === 0 ? '#18181b' : '#27272a'}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
  `
  }

  <!-- Pose Specific Arms and Gestures -->
  ${poseSvg}

  <!-- Cyberpunk / Sci-Fi Overlays if active -->
  ${cyberpunkOverlays}

  <!-- Style Watermark Badge -->
  <g transform="translate(30, 45)">
    <rect width="170" height="32" rx="16" fill="rgba(15,23,42,0.75)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <circle cx="20" cy="16" r="6" fill="${bgGlow}"/>
    <text x="35" y="21" fill="#f8fafc" font-size="12" font-family="sans-serif" font-weight="600">${artStyle.toUpperCase()}</text>
  </g>
</svg>
  `;
}

// Convert SVG string to data URL
export function mockSvgToDataUrl(svg: string): string {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}
