import { ThemeColors, ChatThemeMode } from '../types';

export const THEME_COLORS: Record<ChatThemeMode, ThemeColors> = {
  dark: {
    mode: 'dark',
    background: '#111b21',
    header: '#202c33',
    headerText: '#e9edef',
    headerSubtext: '#8696a0',
    sentBubble: '#005c4b',
    receivedBubble: '#202c33',
    sentText: '#e9edef',
    receivedText: '#e9edef',
    timeSentText: 'rgba(233, 237, 239, 0.6)',
    timeReceivedText: '#8696a0',
    inputBackground: '#2a3942',
    inputText: '#d1d7db',
    inputPlaceholder: '#8696a0',
    iconColor: '#8696a0',
    checkMarkGray: '#8696a0',
    checkMarkBlue: '#53bdeb',
    dateBadgeBg: '#182229',
    dateBadgeText: '#8696a0',
    typingDotColor: '#8696a0',
  },
  light: {
    mode: 'light',
    background: '#efeae2',
    header: '#008069',
    headerText: '#ffffff',
    headerSubtext: 'rgba(255, 255, 255, 0.85)',
    sentBubble: '#d9fdd3',
    receivedBubble: '#ffffff',
    sentText: '#111b21',
    receivedText: '#111b21',
    timeSentText: '#667781',
    timeReceivedText: '#667781',
    inputBackground: '#ffffff',
    inputText: '#111b21',
    inputPlaceholder: '#8696a0',
    iconColor: '#54656f',
    checkMarkGray: '#8696a0',
    checkMarkBlue: '#53bdeb',
    dateBadgeBg: '#ffffff',
    dateBadgeText: '#54656f',
    typingDotColor: '#667781',
  },
};

// Seamless repeating WhatsApp doodle pattern SVG
export const WHATSAPP_DOODLE_SVG = `
<svg width="240" height="240" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
  <!-- Coffee cup -->
  <path d="M30 40h22v14a11 11 0 0 1-11 11 11 11 0 0 1-11-11V40zm22 3h5a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4h-5v-12z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Speech bubble -->
  <path d="M140 30c-12 0-22 8-22 18 0 6 4 11 9 14l-3 8 9-4c2 1 4 1 7 1 12 0 22-8 22-18s-10-19-22-19z" fill="none" stroke="currentColor" stroke-width="1.8"/>
  <!-- Musical note -->
  <path d="M210 50v-18l14-4v18m-14-10l14-4m-14 14a4 4 0 1 1-4-4 4 4 0 0 1 4 4zm14-4a4 4 0 1 1-4-4 4 4 0 0 1 4 4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Star -->
  <path d="M60 120l2 6 6 1-5 4 1 6-4-3-4 3 1-6-5-4 6-1z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <!-- Heart -->
  <path d="M185 105c-3-4-8-4-11 0l-1 1-1-1c-3-4-8-4-11 0-4 4-3 10 1 14l11 10 11-10c4-4 5-10 1-14z" fill="none" stroke="currentColor" stroke-width="1.8"/>
  <!-- Camera -->
  <path d="M35 180h24a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H35a3 3 0 0 1-3-3v-16a3 3 0 0 1 3-3zm4-4h6l2 4h-10l2-4zm8 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" fill="none" stroke="currentColor" stroke-width="1.8"/>
  <!-- Gamepad -->
  <path d="M125 185c-3-8-12-8-17 0-4 6-1 14 3 16l4 2 4-2c4-2 7-10 3-16zm-12 8h-4m2-2v4m10 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm3-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <!-- Clock -->
  <circle cx="205" cy="180" r="10" fill="none" stroke="currentColor" stroke-width="1.8"/>
  <path d="M205 174v6l4 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Sparkles -->
  <circle cx="95" cy="45" r="1.5"/>
  <circle cx="25" cy="115" r="1.5"/>
  <circle cx="115" cy="115" r="2"/>
  <circle cx="160" cy="165" r="1.5"/>
</svg>
`;

export const DOODLE_DATA_URL_DARK = `data:image/svg+xml;utf8,${encodeURIComponent(
  WHATSAPP_DOODLE_SVG.replace(/currentColor/g, 'rgba(255, 255, 255, 0.05)')
)}`;

export const DOODLE_DATA_URL_LIGHT = `data:image/svg+xml;utf8,${encodeURIComponent(
  WHATSAPP_DOODLE_SVG.replace(/currentColor/g, 'rgba(11, 20, 26, 0.06)')
)}`;
