export interface AvatarItem {
  id: string;
  name: string;
  category: 'arabic' | 'cartoon' | 'realistic';
  emoji: string;
  url: string;
  description: string;
}

// High-fidelity, self-contained SVG avatars with vibrant palettes & clear cultural / cartoon iconography
export const ARABIC_AVATARS: AvatarItem[] = [
  {
    id: 'arabic-ghutra-white',
    name: 'Gulf Youth (Ghutra)',
    category: 'arabic',
    emoji: '🧔🏻‍♂️',
    description: 'Young Gulf Arab in pristine white Ghutra and black Agal',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f766e" />
            <stop offset="100%" stop-color="#042f2e" />
          </linearGradient>
          <linearGradient id="skin" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fcd34d" />
            <stop offset="100%" stop-color="#f59e0b" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#bg)" stroke="#14b8a6" stroke-width="2"/>
        <!-- White Thobe Body -->
        <path d="M25 116 Q60 90 95 116 L95 120 L25 120 Z" fill="#f8fafc" />
        <path d="M54 98 L66 98 L64 120 L56 120 Z" fill="#e2e8f0" />
        <!-- Neck -->
        <rect x="50" y="70" width="20" height="22" rx="4" fill="#f59e0b" />
        <!-- Face -->
        <ellipse cx="60" cy="62" rx="24" ry="26" fill="#fcd34d" />
        <!-- Beard & Moustache -->
        <path d="M42 66 Q60 92 78 66 Q74 86 60 88 Q46 86 42 66 Z" fill="#1e293b" />
        <path d="M48 68 Q60 74 72 68 Q60 71 48 68 Z" fill="#0f172a" />
        <!-- Smile -->
        <path d="M52 74 Q60 80 68 74" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none"/>
        <!-- Eyes -->
        <ellipse cx="48" cy="58" rx="3.5" ry="4" fill="#0f172a" />
        <circle cx="49" cy="56.5" r="1.2" fill="#ffffff" />
        <ellipse cx="72" cy="58" rx="3.5" ry="4" fill="#0f172a" />
        <circle cx="73" cy="56.5" r="1.2" fill="#ffffff" />
        <!-- Eyebrows -->
        <path d="M43 51 Q48 48 54 52" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none" />
        <path d="M66 52 Q72 48 77 51" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none" />
        <!-- White Ghutra Cloth -->
        <path d="M30 38 Q60 16 90 38 Q96 68 88 96 L82 86 Q86 60 84 46 Q60 36 36 46 Q34 60 38 86 L32 96 Q24 68 30 38 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
        <!-- Black Agal (Double Ring) -->
        <ellipse cx="60" cy="33" rx="27" ry="8" fill="none" stroke="#09090b" stroke-width="6" />
        <ellipse cx="60" cy="38" rx="28" ry="8" fill="none" stroke="#27272a" stroke-width="5" />
      </svg>
    `)}`,
  },
  {
    id: 'arabic-shemagh-red',
    name: 'Arabian Shemagh (Red)',
    category: 'arabic',
    emoji: '👳🏻‍♂️',
    description: 'Classic red and white checkered Shemagh with agal',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <defs>
          <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#991b1b" />
            <stop offset="100%" stop-color="#450a0a" />
          </linearGradient>
          <pattern id="checkers" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="#ffffff" />
            <rect x="4" width="4" height="4" fill="#dc2626" />
            <rect y="4" width="4" height="4" fill="#dc2626" />
            <rect x="4" y="4" width="4" height="4" fill="#ffffff" />
          </pattern>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#bg2)" stroke="#f87171" stroke-width="2"/>
        <!-- White Thobe Body -->
        <path d="M22 118 Q60 90 98 118 L98 120 L22 120 Z" fill="#f8fafc" />
        <rect x="52" y="72" width="16" height="20" fill="#f59e0b" />
        <!-- Face -->
        <ellipse cx="60" cy="62" rx="23" ry="25" fill="#fed7aa" />
        <!-- Sharp Goatee -->
        <path d="M46 72 Q60 92 74 72 Q60 84 46 72 Z" fill="#18181b" />
        <path d="M50 69 Q60 73 70 69" stroke="#18181b" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <!-- Smile -->
        <path d="M54 75 Q60 79 66 75" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" fill="none"/>
        <!-- Eyes with confident expression -->
        <ellipse cx="49" cy="58" rx="3.5" ry="4" fill="#18181b" />
        <circle cx="50" cy="56.5" r="1.2" fill="#ffffff" />
        <ellipse cx="71" cy="58" rx="3.5" ry="4" fill="#18181b" />
        <circle cx="72" cy="56.5" r="1.2" fill="#ffffff" />
        <!-- Red Shemagh Drapes -->
        <path d="M28 40 Q60 16 92 40 Q98 70 88 98 L80 88 Q86 62 84 48 Q60 38 36 48 Q34 62 40 88 L32 98 Q22 70 28 40 Z" fill="url(#checkers)" stroke="#ef4444" stroke-width="1.5" />
        <!-- Black Agal -->
        <ellipse cx="60" cy="34" rx="27" ry="8" fill="none" stroke="#09090b" stroke-width="6" />
        <ellipse cx="60" cy="39" rx="28" ry="8" fill="none" stroke="#27272a" stroke-width="5" />
      </svg>
    `)}`,
  },
  {
    id: 'arabic-woman-hijab',
    name: 'Modern Hijab & Abaya',
    category: 'arabic',
    emoji: '🧕🏻',
    description: 'Chic emerald hijab with gold brooch and warm smile',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <defs>
          <linearGradient id="bgH" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#064e3b" />
            <stop offset="100%" stop-color="#022c22" />
          </linearGradient>
          <linearGradient id="hijab" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#059669" />
            <stop offset="100%" stop-color="#047857" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#bgH)" stroke="#34d399" stroke-width="2"/>
        <!-- Abaya / Shoulders -->
        <path d="M20 118 Q60 92 100 118 L100 120 L20 120 Z" fill="#0f172a" />
        <!-- Hijab Outer Wrap -->
        <path d="M26 50 Q24 16 60 16 Q96 16 94 50 Q96 90 78 106 Q60 114 42 106 Q24 90 26 50 Z" fill="url(#hijab)" />
        <!-- Face oval cutout -->
        <ellipse cx="60" cy="60" rx="20" ry="24" fill="#fed7aa" />
        <!-- Gentle Hijab Inner Frame -->
        <path d="M42 48 Q60 42 78 48 Q82 66 76 80 Q60 88 44 80 Q38 66 42 48 Z" fill="none" stroke="#047857" stroke-width="3" />
        <!-- Eyes & Eyelashes -->
        <ellipse cx="51" cy="58" rx="3.5" ry="4" fill="#1e293b" />
        <circle cx="52.2" cy="56.5" r="1.3" fill="#ffffff" />
        <path d="M45 54 Q51 51 57 53" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" fill="none" />
        <ellipse cx="69" cy="58" rx="3.5" ry="4" fill="#1e293b" />
        <circle cx="70.2" cy="56.5" r="1.3" fill="#ffffff" />
        <path d="M63 53 Q69 51 75 54" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" fill="none" />
        <!-- Cheeks Blush -->
        <circle cx="46" cy="65" r="4" fill="#f43f5e" opacity="0.3" />
        <circle cx="74" cy="65" r="4" fill="#f43f5e" opacity="0.3" />
        <!-- Lips -->
        <path d="M54 72 Q60 76 66 72" stroke="#e11d48" stroke-width="2.5" stroke-linecap="round" fill="none" />
        <!-- Gold Brooch pin -->
        <circle cx="60" cy="94" r="5" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.5" />
        <circle cx="60" cy="94" r="2" fill="#ffffff" />
      </svg>
    `)}`,
  },
  {
    id: 'arabic-falconer',
    name: 'Desert Falconer (صقار)',
    category: 'arabic',
    emoji: '🦅',
    description: 'Arab hunter with golden falcon on leather armguard',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <defs>
          <linearGradient id="bgF" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#b45309" />
            <stop offset="100%" stop-color="#78350f" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#bgF)" stroke="#f59e0b" stroke-width="2"/>
        <!-- Desert dunes in background -->
        <path d="M0 90 Q30 78 65 92 Q90 102 120 85 L120 120 L0 120 Z" fill="#92400e" opacity="0.6"/>
        <!-- Falconer Person -->
        <path d="M20 120 Q50 96 85 120 Z" fill="#f8fafc" />
        <ellipse cx="50" cy="60" rx="18" ry="21" fill="#fed7aa" />
        <!-- Beard -->
        <path d="M38 65 Q50 82 62 65 Q50 78 38 65 Z" fill="#27272a" />
        <!-- Eyes -->
        <ellipse cx="44" cy="57" rx="3" ry="3.5" fill="#18181b" />
        <ellipse cx="58" cy="57" rx="3" ry="3.5" fill="#18181b" />
        <!-- Ghutra & Agal -->
        <path d="M30 44 Q50 24 70 44 Q74 65 68 85 L64 78 Q66 58 64 48 Q50 40 36 48 Q34 58 36 78 L32 85 Q26 65 30 44 Z" fill="#ffffff" />
        <ellipse cx="50" cy="38" rx="20" ry="6" fill="none" stroke="#09090b" stroke-width="5" />
        <!-- Golden Falcon on Right -->
        <g transform="translate(72, 45) scale(0.45)">
          <path d="M30 10 Q50 0 65 20 Q70 45 60 70 L40 65 Q30 40 30 10 Z" fill="#78350f" />
          <circle cx="45" cy="20" r="18" fill="#92400e" />
          <!-- Falcon Beak -->
          <path d="M30 20 Q18 24 22 34 Q28 30 32 26 Z" fill="#f59e0b" />
          <!-- Falcon Eye -->
          <circle cx="42" cy="18" r="4" fill="#000000" />
          <circle cx="43" cy="17" r="1.5" fill="#ffffff" />
          <!-- Chest feathers -->
          <path d="M40 38 Q50 60 48 85 Q35 70 40 38 Z" fill="#fef3c7" />
        </g>
      </svg>
    `)}`,
  },
  {
    id: 'arabic-dallah-cartoon',
    name: 'Dallah & Finjan (دلة وفنجان)',
    category: 'arabic',
    emoji: '☕️',
    description: 'Hilarious animated golden Arabic coffee pot winking',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <defs>
          <linearGradient id="bgD" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#d97706" />
            <stop offset="100%" stop-color="#b45309" />
          </linearGradient>
          <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fef08a" />
            <stop offset="50%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#b45309" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#bgD)" stroke="#fbbf24" stroke-width="2"/>
        <!-- Dallah Body -->
        <path d="M44 48 L76 48 L70 82 Q60 88 50 82 Z" fill="url(#gold)" stroke="#78350f" stroke-width="2" />
        <path d="M50 48 L46 36 L74 36 L70 48 Z" fill="url(#gold)" stroke="#78350f" stroke-width="1.5" />
        <!-- Spire Top -->
        <path d="M60 14 L65 36 L55 36 Z" fill="#fef08a" stroke="#78350f" stroke-width="1.5" />
        <circle cx="60" cy="14" r="3.5" fill="#f59e0b" />
        <!-- Long Curved Spout -->
        <path d="M46 54 C24 50 20 28 32 20 C24 32 30 58 48 64 Z" fill="url(#gold)" stroke="#78350f" stroke-width="1.5" />
        <!-- Big Handle -->
        <path d="M72 50 Q96 60 78 80 Q90 62 70 56 Z" fill="url(#gold)" stroke="#78350f" stroke-width="1.5" />
        <!-- Funny Googly Cartoon Eyes on Dallah -->
        <circle cx="53" cy="60" r="6" fill="#ffffff" stroke="#78350f" stroke-width="1.5" />
        <circle cx="54" cy="60" r="2.8" fill="#18181b" />
        <!-- Winking Eye -->
        <path d="M63 60 Q67 56 71 60" stroke="#78350f" stroke-width="3" stroke-linecap="round" fill="none" />
        <!-- Cute Cartoon Tongue Smile -->
        <path d="M54 70 Q60 76 66 70" stroke="#78350f" stroke-width="2" stroke-linecap="round" fill="none" />
        <path d="M57 73 Q60 78 63 73 Z" fill="#f43f5e" />
        <!-- Mini Coffee Finjan on bottom right -->
        <path d="M78 88 L94 88 L90 102 L82 102 Z" fill="#ffffff" stroke="#78350f" stroke-width="1.5" />
        <path d="M80 92 Q86 86 92 92" stroke="#f59e0b" stroke-width="1.5" fill="none" />
        <!-- Coffee Steam Hearts -->
        <path d="M84 82 Q86 78 84 74" stroke="#fef08a" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.8" />
      </svg>
    `)}`,
  },
  {
    id: 'arabic-elder-bisht',
    name: 'Wise Elder in Bisht (شيخ وقور)',
    category: 'arabic',
    emoji: '🧓🏻',
    description: 'Distinguished elder in golden-embroidered royal Bisht',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <defs>
          <linearGradient id="bgE" x1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1e1b4b" />
            <stop offset="100%" stop-color="#0f172a" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#bgE)" stroke="#eab308" stroke-width="2"/>
        <!-- Black Bisht with Gold Zari Collar -->
        <path d="M15 120 Q60 90 105 120 Z" fill="#18181b" />
        <path d="M48 94 L60 120 L72 94 Z" fill="#ffffff" />
        <path d="M44 94 L58 120 L62 120 L48 94" stroke="#eab308" stroke-width="3" fill="none" />
        <path d="M76 94 L62 120 L58 120 L72 94" stroke="#eab308" stroke-width="3" fill="none" />
        <!-- Face -->
        <ellipse cx="60" cy="60" rx="22" ry="24" fill="#fed7aa" />
        <!-- Full White Majestic Beard -->
        <path d="M42 66 Q60 98 78 66 Q72 92 60 95 Q48 92 42 66 Z" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />
        <path d="M46 66 Q60 72 74 66" stroke="#f8fafc" stroke-width="3" stroke-linecap="round" fill="none" />
        <!-- Wise Eyes with laugh wrinkles -->
        <ellipse cx="50" cy="56" rx="3" ry="3" fill="#18181b" />
        <ellipse cx="70" cy="56" rx="3" ry="3" fill="#18181b" />
        <path d="M44 58 L41 59" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M76 58 L79 59" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/>
        <!-- White Ghutra and Thick Black Agal -->
        <path d="M32 40 Q60 18 88 40 Q94 66 88 92 L82 82 Q86 60 84 46 Q60 36 36 46 Q34 60 38 82 L32 92 Q26 66 32 40 Z" fill="#ffffff" />
        <ellipse cx="60" cy="34" rx="26" ry="8" fill="none" stroke="#09090b" stroke-width="6" />
        <ellipse cx="60" cy="39" rx="27" ry="8" fill="none" stroke="#27272a" stroke-width="5" />
      </svg>
    `)}`,
  },
];

export const CARTOON_AVATARS: AvatarItem[] = [
  {
    id: 'cartoon-cool-cat',
    name: 'Cool Sunglasses Cat',
    category: 'cartoon',
    emoji: '😎',
    description: 'Chic meme orange cat wearing dark aviator shades',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <defs>
          <linearGradient id="bgCat" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f97316" />
            <stop offset="100%" stop-color="#c2410c" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#bgCat)" stroke="#fdba74" stroke-width="2"/>
        <!-- Cat Ears -->
        <polygon points="32,24 48,50 20,44" fill="#fb923c" stroke="#9a3412" stroke-width="2" />
        <polygon points="32,28 44,48 24,44" fill="#f43f5e" />
        <polygon points="88,24 100,44 72,50" fill="#fb923c" stroke="#9a3412" stroke-width="2" />
        <polygon points="88,28 96,44 76,48" fill="#f43f5e" />
        <!-- Cat Face -->
        <circle cx="60" cy="68" r="34" fill="#fb923c" stroke="#9a3412" stroke-width="2" />
        <ellipse cx="60" cy="78" rx="18" ry="14" fill="#ffedd5" />
        <!-- Dark Cool Sunglasses -->
        <rect x="30" y="52" width="26" height="20" rx="6" fill="#09090b" stroke="#3b82f6" stroke-width="2" />
        <rect x="64" y="52" width="26" height="20" rx="6" fill="#09090b" stroke="#3b82f6" stroke-width="2" />
        <line x1="54" y1="60" x2="66" y2="60" stroke="#3b82f6" stroke-width="3" />
        <!-- White lens shine -->
        <line x1="34" y1="56" x2="42" y2="66" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.8" />
        <line x1="68" y1="56" x2="76" y2="66" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.8" />
        <!-- Cute Nose & Mouth -->
        <polygon points="57,75 63,75 60,78" fill="#f43f5e" />
        <path d="M55 79 Q60 83 60 79 Q60 83 65 79" stroke="#9a3412" stroke-width="2" stroke-linecap="round" fill="none" />
        <!-- Whiskers -->
        <line x1="20" y1="74" x2="36" y2="76" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" />
        <line x1="18" y1="82" x2="36" y2="80" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" />
        <line x1="102" y1="74" x2="84" y2="76" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" />
        <line x1="104" y1="82" x2="84" y2="80" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    `)}`,
  },
  {
    id: 'cartoon-cheeky-monkey',
    name: 'Laughing Cheeky Monkey',
    category: 'cartoon',
    emoji: '🐒',
    description: 'Hilarious cheeky monkey sticking tongue out',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <defs>
          <linearGradient id="bgM" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#15803d" />
            <stop offset="100%" stop-color="#14532d" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#bgM)" stroke="#4ade80" stroke-width="2"/>
        <!-- Big Ears -->
        <circle cx="24" cy="58" r="16" fill="#78350f" stroke="#451a03" stroke-width="2" />
        <circle cx="24" cy="58" r="9" fill="#fed7aa" />
        <circle cx="96" cy="58" r="16" fill="#78350f" stroke="#451a03" stroke-width="2" />
        <circle cx="96" cy="58" r="9" fill="#fed7aa" />
        <!-- Head -->
        <circle cx="60" cy="60" r="34" fill="#78350f" stroke="#451a03" stroke-width="2" />
        <!-- Tan Face mask -->
        <path d="M42 46 Q60 52 78 46 Q86 64 80 82 Q60 92 40 82 Q34 64 42 46 Z" fill="#fed7aa" />
        <!-- Googly Funny Eyes -->
        <circle cx="48" cy="54" r="7" fill="#ffffff" stroke="#451a03" stroke-width="1.5" />
        <circle cx="50" cy="54" r="3.5" fill="#000000" />
        <circle cx="51" cy="52" r="1.2" fill="#ffffff" />
        <circle cx="72" cy="54" r="7" fill="#ffffff" stroke="#451a03" stroke-width="1.5" />
        <circle cx="70" cy="54" r="3.5" fill="#000000" />
        <circle cx="71" cy="52" r="1.2" fill="#ffffff" />
        <!-- Nostrils -->
        <ellipse cx="56" cy="66" rx="1.5" ry="2" fill="#451a03" />
        <ellipse cx="64" cy="66" rx="1.5" ry="2" fill="#451a03" />
        <!-- Huge Happy Smile with Tongue Out -->
        <path d="M44 72 Q60 88 76 72" stroke="#451a03" stroke-width="3" stroke-linecap="round" fill="none" />
        <path d="M54 77 Q60 92 66 77 Z" fill="#ef4444" stroke="#451a03" stroke-width="1.5" />
        <line x1="60" y1="77" x2="60" y2="86" stroke="#b91c1c" stroke-width="1.5" />
      </svg>
    `)}`,
  },
  {
    id: 'cartoon-chill-capybara',
    name: 'Zen Capybara & Orange',
    category: 'cartoon',
    emoji: '🍊',
    description: 'Ultra relaxed capybara with an orange balancing on its head',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <defs>
          <linearGradient id="bgCapy" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0284c7" />
            <stop offset="100%" stop-color="#0369a1" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#bgCapy)" stroke="#38bdf8" stroke-width="2"/>
        <!-- Orange on Head -->
        <circle cx="60" cy="26" r="13" fill="#f97316" stroke="#c2410c" stroke-width="1.5" />
        <path d="M60 13 Q64 8 68 11" stroke="#15803d" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <!-- Tiny Capy Ears -->
        <ellipse cx="36" cy="48" rx="6" ry="4" fill="#92400e" />
        <ellipse cx="84" cy="48" rx="6" ry="4" fill="#92400e" />
        <!-- Capybara Head (Squareish snout) -->
        <path d="M38 48 Q60 38 82 48 Q88 70 82 92 Q60 100 38 92 Q32 70 38 48 Z" fill="#b45309" stroke="#78350f" stroke-width="2" />
        <!-- Muzzle -->
        <rect x="42" y="68" width="36" height="24" rx="8" fill="#d97706" />
        <!-- Half Closed Zen Eyes (-_-) -->
        <path d="M44 56 L54 56" stroke="#451a03" stroke-width="3.5" stroke-linecap="round" />
        <path d="M66 56 L76 56" stroke="#451a03" stroke-width="3.5" stroke-linecap="round" />
        <!-- Nostrils -->
        <ellipse cx="53" cy="76" rx="2" ry="3" fill="#451a03" />
        <ellipse cx="67" cy="76" rx="2" ry="3" fill="#451a03" />
        <!-- Chill Flat Mouth -->
        <path d="M52 84 Q60 86 68 84" stroke="#451a03" stroke-width="2.5" stroke-linecap="round" fill="none" />
      </svg>
    `)}`,
  },
  {
    id: 'cartoon-quacking-duck',
    name: 'Derpy Yellow Duck',
    category: 'cartoon',
    emoji: '🦆',
    description: 'Funny derpy duck with giant orange bill and cute tuft',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <defs>
          <linearGradient id="bgDuck" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#8b5cf6" />
            <stop offset="100%" stop-color="#6d28d9" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#bgDuck)" stroke="#c4b5fd" stroke-width="2"/>
        <!-- Feather Tuft on Top -->
        <path d="M60 26 Q54 14 62 10 Q66 18 64 26" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />
        <path d="M56 26 Q48 18 54 14 Q58 20 58 26" fill="#facc15" stroke="#ca8a04" stroke-width="1.5" />
        <!-- Head -->
        <circle cx="60" cy="60" r="36" fill="#fde047" stroke="#ca8a04" stroke-width="2" />
        <!-- Big Derpy Googly Eyes -->
        <circle cx="46" cy="50" r="10" fill="#ffffff" stroke="#ca8a04" stroke-width="1.5" />
        <circle cx="48" cy="50" r="4.5" fill="#09090b" />
        <circle cx="49" cy="48" r="1.5" fill="#ffffff" />
        <circle cx="74" cy="50" r="10" fill="#ffffff" stroke="#ca8a04" stroke-width="1.5" />
        <circle cx="72" cy="50" r="4.5" fill="#09090b" />
        <circle cx="73" cy="48" r="1.5" fill="#ffffff" />
        <!-- Huge Orange Beak -->
        <ellipse cx="60" cy="74" rx="24" ry="14" fill="#fb923c" stroke="#c2410c" stroke-width="2" />
        <ellipse cx="53" cy="70" rx="2" ry="1.5" fill="#c2410c" />
        <ellipse cx="67" cy="70" rx="2" ry="1.5" fill="#c2410c" />
        <path d="M42 74 Q60 82 78 74" stroke="#c2410c" stroke-width="2" fill="none" />
      </svg>
    `)}`,
  },
  {
    id: 'cartoon-quirky-alien',
    name: 'Friendly Space Alien',
    category: 'cartoon',
    emoji: '👽',
    description: 'Cute neon green extraterrestrial with antenna and stars',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <defs>
          <linearGradient id="bgAl" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#312e81" />
            <stop offset="100%" stop-color="#1e1b4b" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#bgAl)" stroke="#818cf8" stroke-width="2"/>
        <!-- Antenna -->
        <path d="M60 38 Q50 18 60 14" stroke="#22c55e" stroke-width="3.5" fill="none" stroke-linecap="round" />
        <circle cx="60" cy="14" r="6" fill="#eab308" stroke="#ca8a04" stroke-width="1.5" />
        <!-- Head -->
        <path d="M32 44 Q60 22 88 44 Q98 76 60 98 Q22 76 32 44 Z" fill="#4ade80" stroke="#16a34a" stroke-width="2" />
        <!-- Big Glossy Purple Alien Eyes -->
        <ellipse cx="46" cy="56" rx="9" ry="14" transform="rotate(-15 46 56)" fill="#312e81" />
        <ellipse cx="45" cy="53" rx="3" ry="5" transform="rotate(-15 45 53)" fill="#ffffff" opacity="0.8" />
        <ellipse cx="74" cy="56" rx="9" ry="14" transform="rotate(15 74 56)" fill="#312e81" />
        <ellipse cx="75" cy="53" rx="3" ry="5" transform="rotate(15 75 53)" fill="#ffffff" opacity="0.8" />
        <!-- Tiny Cute Mouth -->
        <path d="M54 78 Q60 84 66 78" stroke="#15803d" stroke-width="2.5" stroke-linecap="round" fill="none" />
      </svg>
    `)}`,
  },
  {
    id: 'cartoon-grumpy-doge',
    name: 'Doge Meme Classic',
    category: 'cartoon',
    emoji: '🐕',
    description: 'Such chat, very text, wow shiba inu doge',
    url: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <defs>
          <linearGradient id="bgDoge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ca8a04" />
            <stop offset="100%" stop-color="#854d0e" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="58" fill="url(#bgDoge)" stroke="#fde047" stroke-width="2"/>
        <!-- Shiba Ears -->
        <polygon points="34,22 48,46 22,42" fill="#d97706" stroke="#78350f" stroke-width="2" />
        <polygon points="34,26 44,44 26,42" fill="#ffffff" />
        <polygon points="86,22 98,42 72,46" fill="#d97706" stroke="#78350f" stroke-width="2" />
        <polygon points="86,26 94,42 76,44" fill="#ffffff" />
        <!-- Head -->
        <circle cx="60" cy="64" r="35" fill="#f59e0b" stroke="#78350f" stroke-width="2" />
        <!-- White Muzzle & Eyebrow patches -->
        <ellipse cx="60" cy="74" rx="20" ry="16" fill="#ffffff" />
        <ellipse cx="44" cy="46" rx="5" ry="3" fill="#ffffff" />
        <ellipse cx="76" cy="46" rx="5" ry="3" fill="#ffffff" />
        <!-- Side Eye Look -->
        <circle cx="46" cy="54" r="5.5" fill="#09090b" />
        <circle cx="44" cy="52" r="1.8" fill="#ffffff" />
        <circle cx="74" cy="54" r="5.5" fill="#09090b" />
        <circle cx="72" cy="52" r="1.8" fill="#ffffff" />
        <!-- Cute Black Nose -->
        <polygon points="56,66 64,66 60,71" fill="#09090b" />
        <!-- Smirk Mouth -->
        <path d="M54 74 Q60 78 66 74" stroke="#78350f" stroke-width="2" stroke-linecap="round" fill="none" />
      </svg>
    `)}`,
  },
];

export const REALISTIC_AVATARS: AvatarItem[] = [
  {
    id: 'sarah',
    name: 'Sarah (Creative)',
    category: 'realistic',
    emoji: '👩🏼',
    description: 'Designer & Content Creator',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces&auto=format',
  },
  {
    id: 'alex',
    name: 'Alex (Dev)',
    category: 'realistic',
    emoji: '👨🏻‍💻',
    description: 'Fullstack Software Engineer',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces&auto=format',
  },
  {
    id: 'elena',
    name: 'Elena (Design)',
    category: 'realistic',
    emoji: '👩🏻',
    description: 'Product Designer & Architect',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces&auto=format',
  },
  {
    id: 'marcus',
    name: 'Marcus (Founder)',
    category: 'realistic',
    emoji: '👨🏽',
    description: 'Tech Founder & Investor',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop&crop=faces&auto=format',
  },
  {
    id: 'maya',
    name: 'Maya (Product)',
    category: 'realistic',
    emoji: '👩🏽',
    description: 'Growth & Strategy Lead',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces&auto=format',
  },
];

export const ALL_AVATARS = [...ARABIC_AVATARS, ...CARTOON_AVATARS, ...REALISTIC_AVATARS];
