export interface ScreenshotPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
}

// 1. Mobile Banking Transfer Receipt (Vector SVG data URL)
const BANK_RECEIPT_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="400" height="320">
  <rect width="400" height="320" fill="#0f172a" rx="16"/>
  <!-- Success Badge -->
  <circle cx="200" cy="64" r="32" fill="#10b981" opacity="0.2"/>
  <circle cx="200" cy="64" r="24" fill="#10b981"/>
  <path d="M190 64 L197 71 L211 57" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  
  <text x="200" y="118" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="18" font-weight="700" text-anchor="middle">Transfer Successful</text>
  <text x="200" y="138" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">Transaction ID: #TX-984210</text>
  
  <!-- Amount Box -->
  <rect x="30" y="156" width="340" height="74" fill="#1e293b" rx="12" stroke="#334155" stroke-width="1"/>
  <text x="50" y="186" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12">Amount Sent</text>
  <text x="50" y="214" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="22" font-weight="800">$850.00 USD</text>
  <rect x="270" y="174" width="80" height="26" fill="#065f46" rx="6"/>
  <text x="310" y="191" fill="#34d399" font-family="system-ui, sans-serif" font-size="11" font-weight="700" text-anchor="middle">INSTANT</text>
  
  <!-- Recipient -->
  <rect x="30" y="240" width="340" height="56" fill="#1e293b" rx="12" stroke="#334155" stroke-width="1"/>
  <circle cx="60" cy="268" r="14" fill="#3b82f6"/>
  <text x="60" y="273" fill="#ffffff" font-family="system-ui, sans-serif" font-size="11" font-weight="700" text-anchor="middle">AR</text>
  <text x="86" y="262" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="13" font-weight="600">Alex Rivers</text>
  <text x="86" y="280" fill="#64748b" font-family="system-ui, sans-serif" font-size="11">Chase Bank •••• 4912</text>
</svg>
`)}`;

// 2. Mobile Analytics & Traffic Spike Screenshot
const ANALYTICS_CHART_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="400" height="320">
  <rect width="400" height="320" fill="#090d16" rx="16"/>
  <!-- Top Header -->
  <text x="24" y="38" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12" font-weight="600">LIVE DASHBOARD</text>
  <text x="24" y="68" fill="#ffffff" font-family="system-ui, sans-serif" font-size="24" font-weight="800">2,840 Active</text>
  <rect x="180" y="48" width="70" height="24" fill="#064e3b" rx="6"/>
  <text x="215" y="64" fill="#34d399" font-family="system-ui, sans-serif" font-size="12" font-weight="700" text-anchor="middle">+142.8%</text>

  <!-- Glowing Line Chart -->
  <defs>
    <linearGradient id="gradChart" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
    </linearGradient>
  </defs>
  <path d="M 24 220 C 70 210, 110 190, 150 170 C 190 150, 230 180, 270 120 C 310 80, 340 70, 376 45 L 376 250 L 24 250 Z" fill="url(#gradChart)"/>
  <path d="M 24 220 C 70 210, 110 190, 150 170 C 190 150, 230 180, 270 120 C 310 80, 340 70, 376 45" fill="none" stroke="#10b981" stroke-width="4" stroke-linecap="round"/>
  <circle cx="376" cy="45" r="5" fill="#34d399" stroke="#ffffff" stroke-width="2"/>

  <!-- Metric Badges Bottom -->
  <rect x="24" y="260" width="166" height="44" fill="#151d2c" rx="8"/>
  <text x="36" y="278" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">PAGE VIEWS</text>
  <text x="36" y="296" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="13" font-weight="700">48,290 / hr</text>

  <rect x="210" y="260" width="166" height="44" fill="#151d2c" rx="8"/>
  <text x="222" y="278" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">AVG LATENCY</text>
  <text x="222" y="296" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="13" font-weight="700">28 ms (Healthy)</text>
</svg>
`)}`;

// 3. Arabic Coffee & Majlis Scene
const ARABIC_MAJLIS_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="400" height="320">
  <defs>
    <linearGradient id="bgMajlis" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2d1200"/>
      <stop offset="100%" stop-color="#0f0700"/>
    </linearGradient>
  </defs>
  <rect width="400" height="320" fill="url(#bgMajlis)" rx="16"/>
  <!-- Golden Ornament border -->
  <rect x="14" y="14" width="372" height="292" fill="none" stroke="#d97706" stroke-width="1.5" stroke-dasharray="8,4" opacity="0.4" rx="12"/>
  
  <!-- Glowing Embers / Charcoal -->
  <ellipse cx="200" cy="250" rx="120" ry="30" fill="#7c2d12" opacity="0.6"/>
  <ellipse cx="200" cy="246" rx="90" ry="20" fill="#dc2626" opacity="0.8"/>
  <ellipse cx="195" cy="244" rx="50" ry="12" fill="#f59e0b" opacity="0.9"/>
  <ellipse cx="190" cy="242" rx="25" ry="6" fill="#fef08a"/>

  <!-- Dallah Pot Silhouette -->
  <path d="M 180 240 L 175 160 Q 185 140 195 100 Q 200 90 205 100 Q 215 140 225 160 L 220 240 Z" fill="#d97706"/>
  <!-- Dallah Spout -->
  <path d="M 215 150 Q 255 120 245 80 Q 235 75 220 95" fill="none" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>
  <!-- Dallah Handle -->
  <path d="M 175 140 Q 130 170 160 220" fill="none" stroke="#f59e0b" stroke-width="6" stroke-linecap="round"/>
  <!-- Dallah Lid Finial -->
  <circle cx="200" cy="85" r="8" fill="#fbbf24"/>
  <path d="M 200 77 L 200 60" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>

  <!-- Finjan Cups on the side -->
  <path d="M 260 250 L 265 230 L 285 230 L 290 250 Z" fill="#ffffff" stroke="#d97706" stroke-width="1.5"/>
  <path d="M 120 250 L 125 230 L 145 230 L 150 250 Z" fill="#ffffff" stroke="#d97706" stroke-width="1.5"/>

  <!-- Caption overlay text -->
  <rect x="25" y="24" width="350" height="42" fill="rgba(0,0,0,0.6)" rx="8"/>
  <text x="200" y="50" fill="#fef3c7" font-family="system-ui, sans-serif" font-size="15" font-weight="700" text-anchor="middle">☕️ دلة القهوة على الجمر والمجلس عامر</text>
</svg>
`)}`;

// 4. Product Hunt #1 Badge Screenshot
const PRODUCT_HUNT_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="400" height="320">
  <rect width="400" height="320" fill="#18181b" rx="16"/>
  <!-- Brand Bar -->
  <rect x="24" y="24" width="36" height="36" fill="#da552f" rx="18"/>
  <text x="42" y="48" fill="#ffffff" font-family="system-ui, sans-serif" font-size="20" font-weight="800" text-anchor="middle">P</text>
  <text x="70" y="47" fill="#ffffff" font-family="system-ui, sans-serif" font-size="16" font-weight="700">Product Hunt</text>

  <!-- Golden Medal #1 of the Day -->
  <rect x="24" y="76" width="352" height="150" fill="#27272a" rx="12" stroke="#3f3f46" stroke-width="1"/>
  <circle cx="70" cy="140" r="32" fill="#f59e0b"/>
  <text x="70" y="148" fill="#18181b" font-family="system-ui, sans-serif" font-size="24" font-weight="900" text-anchor="middle">#1</text>
  
  <text x="118" y="125" fill="#f59e0b" font-family="system-ui, sans-serif" font-size="11" font-weight="700">PRODUCT OF THE DAY</text>
  <text x="118" y="152" fill="#ffffff" font-family="system-ui, sans-serif" font-size="20" font-weight="800">ChatAnimate App</text>
  <text x="118" y="174" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="12">Pixel-accurate chat animator & 60fps export</text>

  <!-- Upvotes Box -->
  <rect x="24" y="242" width="352" height="54" fill="#da552f" rx="10"/>
  <text x="200" y="275" fill="#ffffff" font-family="system-ui, sans-serif" font-size="16" font-weight="800" text-anchor="middle">▲ 1,842 UPVOTES • RANKED #1</text>
</svg>
`)}`;

// 5. Food Delivery Route Tracking Screenshot
const FOOD_DELIVERY_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="400" height="320">
  <rect width="400" height="320" fill="#0f172a" rx="16"/>
  <!-- Map stylings -->
  <path d="M 0 80 L 400 120 M 0 200 L 400 160 M 120 0 L 160 320 M 280 0 L 240 320" stroke="#1e293b" stroke-width="12" fill="none"/>
  
  <!-- Glowing delivery route -->
  <path d="M 80 80 Q 180 140 310 210" fill="none" stroke="#10b981" stroke-width="5" stroke-dasharray="8,6" stroke-linecap="round"/>
  
  <!-- Courier pin -->
  <circle cx="190" cy="140" r="16" fill="#10b981" stroke="#ffffff" stroke-width="3"/>
  <text x="190" y="146" font-size="16" text-anchor="middle">🛵</text>

  <!-- Destination pin -->
  <circle cx="310" cy="210" r="14" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
  <text x="310" y="215" font-size="12" text-anchor="middle">📍</text>

  <!-- Status Card Bottom -->
  <rect x="20" y="236" width="360" height="66" fill="#1e293b" rx="12" stroke="#334155" stroke-width="1"/>
  <text x="38" y="262" fill="#38bdf8" font-family="system-ui, sans-serif" font-size="11" font-weight="700">ESTIMATED ARRIVAL</text>
  <text x="38" y="286" fill="#ffffff" font-family="system-ui, sans-serif" font-size="18" font-weight="800">8 - 12 mins (On the way!)</text>
  <circle cx="340" cy="269" r="16" fill="#10b981"/>
  <path d="M 334 269 L 338 273 L 347 264" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none"/>
</svg>
`)}`;

export const SCREENSHOT_PRESETS: ScreenshotPreset[] = [
  {
    id: 'analytics-spike',
    name: 'Analytics Spike Dashboard',
    category: 'Work & Tech 🚀',
    description: 'Growth spike graph with +142% traffic and live visitors',
    url: ANALYTICS_CHART_SVG,
  },
  {
    id: 'bank-transfer',
    name: 'Bank Transfer Receipt',
    category: 'Finance & Payments 💳',
    description: 'Instant transfer confirmation of $850.00 to Alex',
    url: BANK_RECEIPT_SVG,
  },
  {
    id: 'arabic-majlis',
    name: 'سهرة القهوة والمجلس (Majlis)',
    category: 'Arabic Culture 🇸🇦',
    description: 'Traditional Arabic coffee dallah on embers',
    url: ARABIC_MAJLIS_SVG,
  },
  {
    id: 'product-hunt-1',
    name: 'Product Hunt #1 Milestone',
    category: 'Milestone 🎉',
    description: 'Gold medal #1 Product of the Day with 1,842 upvotes',
    url: PRODUCT_HUNT_SVG,
  },
  {
    id: 'food-delivery',
    name: 'Courier Delivery Map',
    category: 'Lifestyle 🛵',
    description: 'Live GPS scooter courier route tracking map',
    url: FOOD_DELIVERY_SVG,
  },
];

// Default fallback when user specifies <image attachment> or <screenshot> without URL
export const DEFAULT_SCREENSHOT_URL = ANALYTICS_CHART_SVG;
