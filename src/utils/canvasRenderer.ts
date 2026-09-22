import { ParsedMessage, ContactSettings, ThemeColors } from '../types';
import { getEmojiRenderTier } from './transcriptParser';

// Cache for loaded avatar images and screenshot images
const avatarImageCache: Record<string, HTMLImageElement> = {};
const screenshotImageCache: Record<string, HTMLImageElement> = {};

export function preloadAvatar(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    if (!url) {
      resolve(new Image());
      return;
    }
    if (avatarImageCache[url] && avatarImageCache[url].complete) {
      resolve(avatarImageCache[url]);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      avatarImageCache[url] = img;
      resolve(img);
    };
    img.onerror = () => {
      resolve(img); // Fallback to letter avatar
    };
    img.src = url;
  });
}

export function preloadScreenshot(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    if (!url) {
      resolve(new Image());
      return;
    }
    if (screenshotImageCache[url] && screenshotImageCache[url].complete) {
      resolve(screenshotImageCache[url]);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      screenshotImageCache[url] = img;
      resolve(img);
    };
    img.onerror = () => {
      resolve(img);
    };
    img.src = url;
  });
}

// Offscreen pattern canvas for the doodle wallpaper
let doodlePatternCanvas: HTMLCanvasElement | null = null;
let doodlePatternColor = '';

function getOrCreateDoodlePattern(theme: ThemeColors): HTMLCanvasElement {
  const currentKey = `${theme.mode}-${theme.background}`;
  if (doodlePatternCanvas && doodlePatternColor === currentKey) {
    return doodlePatternCanvas;
  }

  const pCanvas = document.createElement('canvas');
  pCanvas.width = 320;
  pCanvas.height = 320;
  const pCtx = pCanvas.getContext('2d');
  if (!pCtx) return pCanvas;

  const strokeCol =
    theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.035)' : 'rgba(11, 20, 26, 0.04)';
  pCtx.strokeStyle = strokeCol;
  pCtx.fillStyle = strokeCol;
  pCtx.lineWidth = 3;
  pCtx.lineCap = 'round';
  pCtx.lineJoin = 'round';

  // Cup
  pCtx.strokeRect(30, 40, 24, 20);
  pCtx.beginPath();
  pCtx.arc(54, 50, 6, -Math.PI / 2, Math.PI / 2);
  pCtx.stroke();

  // Speech bubble
  pCtx.beginPath();
  pCtx.arc(180, 50, 20, 0, Math.PI * 2);
  pCtx.stroke();
  pCtx.beginPath();
  pCtx.moveTo(170, 68);
  pCtx.lineTo(162, 80);
  pCtx.lineTo(178, 70);
  pCtx.stroke();

  // Music note
  pCtx.beginPath();
  pCtx.arc(80, 160, 6, 0, Math.PI * 2);
  pCtx.fill();
  pCtx.moveTo(86, 160);
  pCtx.lineTo(86, 130);
  pCtx.lineTo(110, 122);
  pCtx.lineTo(110, 150);
  pCtx.stroke();
  pCtx.beginPath();
  pCtx.arc(104, 150, 6, 0, Math.PI * 2);
  pCtx.fill();

  // Heart
  pCtx.beginPath();
  pCtx.moveTo(250, 150);
  pCtx.bezierCurveTo(250, 140, 235, 135, 235, 145);
  pCtx.bezierCurveTo(235, 155, 250, 168, 250, 172);
  pCtx.bezierCurveTo(250, 168, 265, 155, 265, 145);
  pCtx.bezierCurveTo(265, 135, 250, 140, 250, 150);
  pCtx.stroke();

  // Gamepad
  pCtx.strokeRect(140, 230, 44, 24);

  // Sparkles
  pCtx.beginPath();
  pCtx.arc(50, 260, 3, 0, Math.PI * 2);
  pCtx.arc(260, 60, 3, 0, Math.PI * 2);
  pCtx.fill();

  doodlePatternCanvas = pCanvas;
  doodlePatternColor = currentKey;
  return pCanvas;
}

export interface RenderFrameOptions {
  canvas: HTMLCanvasElement;
  messages: ParsedMessage[];
  currentTimeMs: number;
  contact: ContactSettings;
  theme: ThemeColors;
  width?: number;
  height?: number;
  showTypingBubble?: boolean;
  isPro?: boolean;
}

export function renderChatFrame({
  canvas,
  messages,
  currentTimeMs,
  contact,
  theme,
  width = 1080,
  height = 1920,
  showTypingBubble = true,
  isPro = false,
}: RenderFrameOptions) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  // 1. Draw Background
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, width, height);

  // 2. Draw Doodle Wallpaper Pattern
  const patternCanvas = getOrCreateDoodlePattern(theme);
  const pattern = ctx.createPattern(patternCanvas, 'repeat');
  if (pattern) {
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);
  }

  // Layout Boundaries (1080 x 1920 reference)
  const statusBarHeight = 110;
  const headerHeight = 160;
  const topBarTotal = statusBarHeight + headerHeight; // 270px
  const bottomBarHeight = 180;
  const chatAreaTop = topBarTotal;
  const chatAreaBottom = height - bottomBarHeight;

  // Find active message state
  let activeIndex = -1;
  let activeState: 'none' | 'typing-delay' | 'typing-text' | 'completed' = 'none';
  let activeTypewriterLength = 0;
  let isPersonBTyping = false;
  let isPersonATyping = false;
  let personADraftText = '';

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (currentTimeMs >= msg.startMs && currentTimeMs < msg.endMs) {
      activeIndex = i;
      const elapsedInMsg = currentTimeMs - msg.startMs;
      if (elapsedInMsg < msg.typingDelayMs) {
        activeState = 'typing-delay';
      } else {
        activeState = 'typing-text';
        const typingElapsed = elapsedInMsg - msg.typingDelayMs;
        const typingRatio = Math.min(1, typingElapsed / msg.typingDurationMs);
        activeTypewriterLength = Math.max(1, Math.floor(typingRatio * msg.text.length));
      }

      if (msg.sender === 'B') {
        isPersonBTyping = true;
      } else {
        isPersonATyping = true;
        if (activeState === 'typing-delay' || activeState === 'typing-text') {
          personADraftText = msg.text.slice(0, activeTypewriterLength || 1);
        }
      }
      break;
    }
  }

  // If time past all messages
  const lastMsg = messages[messages.length - 1];
  const allCompleted = lastMsg && currentTimeMs >= lastMsg.endMs;

  // 3. Prepare Chat Message Bubbles & Measure Layout
  interface PreparedBubble {
    msg: ParsedMessage;
    revealedText: string;
    hasImage: boolean;
    imageUrl?: string;
    imageWidth?: number;
    imageHeight?: number;
    isSingleEmoji: boolean;
    isFewEmojis: boolean;
    bubbleWidth: number;
    bubbleHeight: number;
    lines: string[];
    isBlueCheck: boolean;
  }

  const preparedBubbles: PreparedBubble[] = [];
  const maxBubbleWidth = 720;
  const paddingX = 36;
  const paddingY = 24;
  const fontSize = 42;
  const lineHeight = 56;
  const timeWidth = 140;

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    // Requirement 1: Only show message once it has been sent! No typewriter character-by-character animation.
    const sendMoment = msg.startMs + msg.typingDelayMs + msg.typingDurationMs;
    const isSentToChat = currentTimeMs >= sendMoment;
    if (!isSentToChat) continue;

    const revealedText = msg.text;
    const hasImage = Boolean(msg.hasImage && msg.imageUrl);

    const emojiTier = getEmojiRenderTier(revealedText);
    const isSingleEmoji = emojiTier === 'single' && !hasImage;
    const isFewEmojis = emojiTier === 'few' && !hasImage;

    // Wrap text into lines
    ctx.font = isSingleEmoji
      ? '100px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
      : isFewEmojis
      ? '64px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
      : `400 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;

    const lines: string[] = [];
    if (isSingleEmoji || isFewEmojis) {
      lines.push(revealedText);
    } else if (revealedText) {
      const words = revealedText.split(' ');
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxBubbleWidth - paddingX * 2 - 20) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
    }

    // Determine bubble size
    let bWidth = 0;
    let bHeight = 0;

    if (hasImage) {
      bWidth = 620;
      const imgHeight = 360;
      bHeight =
        imgHeight +
        20 +
        (lines.length > 0 ? lines.length * lineHeight + 20 : 0) +
        40; // padding + timestamp
    } else {
      let maxLineWidth = 0;
      for (const line of lines) {
        const w = ctx.measureText(line).width;
        if (w > maxLineWidth) maxLineWidth = w;
      }

      bWidth = maxLineWidth + paddingX * 2;
      if (lines.length === 1 && !isSingleEmoji && !isFewEmojis) {
        bWidth += timeWidth;
      }
      bWidth = Math.min(maxBubbleWidth, Math.max(bWidth, 180));

      bHeight = isSingleEmoji
        ? 140
        : isFewEmojis
        ? 110
        : paddingY * 2 + lines.length * lineHeight + (lines.length > 1 ? 24 : 0);
    }

    // Blue check logic: turns blue 400ms after message was sent
    const messageAge = currentTimeMs - msg.startMs;
    const isBlueCheck = messageAge > msg.typingDelayMs + msg.typingDurationMs + 300;

    preparedBubbles.push({
      msg,
      revealedText,
      hasImage,
      imageUrl: msg.imageUrl,
      imageWidth: 600,
      imageHeight: 360,
      isSingleEmoji,
      isFewEmojis,
      bubbleWidth: bWidth,
      bubbleHeight: bHeight,
      lines,
      isBlueCheck,
    });
  }

  // Calculate total height of messages + optional 3-dot typing bubble
  const bubbleSpacing = 24;
  let totalContentHeight = 90; // for top date badge
  for (const b of preparedBubbles) {
    totalContentHeight += b.bubbleHeight + bubbleSpacing;
  }

  const showBouncingTypingBubble =
    showTypingBubble && isPersonBTyping;

  const typingBubbleHeight = 84;
  if (showBouncingTypingBubble) {
    totalContentHeight += typingBubbleHeight + bubbleSpacing;
  }

  // Auto-scroll calculation: keep the bottom anchored with 40px padding above input bar
  const availableChatHeight = chatAreaBottom - chatAreaTop - 60;
  let scrollOffsetY = 0;
  if (totalContentHeight > availableChatHeight) {
    scrollOffsetY = totalContentHeight - availableChatHeight;
  }

  // 4. Render Chat Content with Clipping
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, chatAreaTop, width, chatAreaBottom - chatAreaTop);
  ctx.clip();

  let currentY = chatAreaTop + 30 - scrollOffsetY;

  // Render "TODAY" date badge
  ctx.save();
  ctx.font = '500 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const dateText = 'TODAY';
  const dateWidth = ctx.measureText(dateText).width + 36;
  const dateHeight = 52;
  const dateX = (width - dateWidth) / 2;
  drawRoundedRect(ctx, dateX, currentY, dateWidth, dateHeight, 14);
  ctx.fillStyle = theme.dateBadgeBg;
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = theme.dateBadgeText;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(dateText, width / 2, currentY + dateHeight / 2);
  ctx.restore();

  currentY += dateHeight + 36;

  // Render Bubbles
  for (const bubble of preparedBubbles) {
    const isSent = bubble.msg.sender === 'A';
    const bubbleX = isSent ? width - 50 - bubble.bubbleWidth : 50;

    if (bubble.isSingleEmoji) {
      // Large standalone emoji without background box (authentic WhatsApp style)
      ctx.save();
      ctx.font = '100px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = isSent ? 'right' : 'left';
      ctx.textBaseline = 'top';
      const emojiX = isSent ? width - 70 : 70;
      ctx.fillText(bubble.revealedText, emojiX, currentY);
      ctx.restore();
    } else {
      // Draw WhatsApp message bubble with tail
      ctx.save();
      ctx.fillStyle = isSent ? theme.sentBubble : theme.receivedBubble;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 2;

      drawWhatsAppBubble(
        ctx,
        bubbleX,
        currentY,
        bubble.bubbleWidth,
        bubble.bubbleHeight,
        18,
        isSent
      );
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // If bubble has an image screenshot (Requirement 3)
      if (bubble.hasImage && bubble.imageUrl) {
        const cachedImg = screenshotImageCache[bubble.imageUrl];
        const imgX = bubbleX + 10;
        const imgY = currentY + 10;
        const imgW = bubble.bubbleWidth - 20;
        const imgH = 340;

        ctx.save();
        drawRoundedRect(ctx, imgX, imgY, imgW, imgH, 14);
        ctx.clip();
        if (cachedImg && cachedImg.complete) {
          ctx.drawImage(cachedImg, imgX, imgY, imgW, imgH);
        } else {
          // Preload on the fly
          preloadScreenshot(bubble.imageUrl);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(imgX, imgY, imgW, imgH);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '32px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('📷 Screenshot', imgX + imgW / 2, imgY + imgH / 2);
        }
        ctx.restore();

        // Caption text underneath image if any
        if (bubble.lines.length > 0) {
          ctx.fillStyle = isSent ? theme.sentText : theme.receivedText;
          ctx.font = `400 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';

          for (let l = 0; l < bubble.lines.length; l++) {
            const lineY = currentY + 365 + l * lineHeight;
            ctx.fillText(bubble.lines[l], bubbleX + paddingX, lineY);
          }
        }
      } else {
        // Draw Text
        ctx.fillStyle = isSent ? theme.sentText : theme.receivedText;
        ctx.font = bubble.isFewEmojis
          ? '56px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
          : `400 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        for (let l = 0; l < bubble.lines.length; l++) {
          const lineY = currentY + paddingY + l * lineHeight;
          ctx.fillText(bubble.lines[l], bubbleX + paddingX, lineY);
        }
      }

      // Draw Timestamp and Checkmarks
      const timeY = currentY + bubble.bubbleHeight - 32;
      const timeX = bubbleX + bubble.bubbleWidth - (isSent ? 96 : 38);

      ctx.font = '400 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = isSent ? theme.timeSentText : theme.timeReceivedText;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(bubble.msg.timestamp, timeX, timeY);

      if (isSent) {
        // Draw Double Checkmark
        drawDoubleCheckmark(
          ctx,
          bubbleX + bubble.bubbleWidth - 54,
          timeY - 10,
          bubble.isBlueCheck ? theme.checkMarkBlue : theme.checkMarkGray
        );
      }
      ctx.restore();
    }

    currentY += bubble.bubbleHeight + bubbleSpacing;
  }

  // Draw 3-Dot Bouncing Typing Bubble if Contact is typing
  if (showBouncingTypingBubble) {
    const tBubbleWidth = 140;
    const tBubbleHeight = 72;
    const tBubbleX = 50;

    ctx.save();
    ctx.fillStyle = theme.receivedBubble;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    drawWhatsAppBubble(ctx, tBubbleX, currentY, tBubbleWidth, tBubbleHeight, 18, false);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // 3 Bouncing dots
    const dotRadius = 7;
    const dotCenterY = currentY + tBubbleHeight / 2;
    const dotStartX = tBubbleX + 42;
    const dotSpacing = 26;

    for (let d = 0; d < 3; d++) {
      // Sine wave bounce calculation based on currentTimeMs
      const bouncePhase = (currentTimeMs / 180 + d * 0.8) % (Math.PI * 2);
      const bounceOffset = Math.sin(bouncePhase) * 6;
      ctx.beginPath();
      ctx.arc(dotStartX + d * dotSpacing, dotCenterY + bounceOffset, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = theme.typingDotColor;
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore(); // end chat clipping

  // 5. Render Top Status Bar (Smartphone Bezel & Status Bar)
  renderStatusBar(ctx, width, statusBarHeight, contact, theme);

  // 6. Render WhatsApp Header Bar
  renderHeaderBar(
    ctx,
    width,
    statusBarHeight,
    headerHeight,
    contact,
    theme,
    isPersonBTyping && !allCompleted
  );

  // 7. Render Bottom Input Bar
  renderBottomBar(ctx, width, height, bottomBarHeight, theme, personADraftText, isPersonATyping);

  // 8. Render Free Tier Watermark Badge (Suppressed for Pro subscribers)
  // Positioned on the top-left area outwards from the corner
  if (!isPro) {
    ctx.save();
    const watermarkText = 'Created with I Am WhatsApp';
    ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Roboto", sans-serif';
    const textW = ctx.measureText(watermarkText).width;
    const badgeW = textW + 36;
    const badgeH = 46;
    const badgeX = 48; // Top left corner slightly outwards
    const badgeY = topBarTotal + 28;

    drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 12);
    ctx.fillStyle = theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.72)' : 'rgba(255, 255, 255, 0.85)';
    ctx.fill();
    ctx.strokeStyle = theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.16)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = theme.mode === 'dark' ? '#34d399' : '#059669';
    ctx.beginPath();
    ctx.arc(badgeX + 18, badgeY + badgeH / 2, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = theme.mode === 'dark' ? '#f4f4f5' : '#18181b';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(watermarkText, badgeX + 30, badgeY + badgeH / 2);
    ctx.restore();
  }
}

// Helper to draw rounded rectangle
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Helper to draw WhatsApp bubble with tail
function drawWhatsAppBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  isSent: boolean
) {
  const tailSize = 14;
  ctx.beginPath();
  if (isSent) {
    // Top right tail
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w + tailSize, y);
    ctx.quadraticCurveTo(x + w + 2, y + 10, x + w, y + 16);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  } else {
    // Top left tail
    ctx.moveTo(x, y + 16);
    ctx.quadraticCurveTo(x - 2, y + 10, x - tailSize, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + 16);
  }
  ctx.closePath();
}

// Helper to draw double checkmark
function drawDoubleCheckmark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // First check
  ctx.beginPath();
  ctx.moveTo(x, y + 10);
  ctx.lineTo(x + 7, y + 17);
  ctx.lineTo(x + 22, y + 2);
  ctx.stroke();

  // Second check (offset right)
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 10);
  ctx.lineTo(x + 17, y + 17);
  ctx.lineTo(x + 32, y + 2);
  ctx.stroke();
  ctx.restore();
}

// Render Smartphone Top Status Bar
function renderStatusBar(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  contact: ContactSettings,
  theme: ThemeColors
) {
  ctx.save();
  ctx.fillStyle = theme.header;
  ctx.fillRect(0, 0, width, height);

  // Android Time on left
  ctx.fillStyle = theme.headerText;
  ctx.font = '600 36px -apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(contact.phoneTime || '09:41', 60, height / 2 + 6);

  // Android Tiny Circular Punch-Hole Front Camera Cutout in Center
  const holeRadius = 14;
  const holeCenterX = width / 2;
  const holeCenterY = height / 2 + 4;

  // Outer camera aperture ring
  ctx.beginPath();
  ctx.arc(holeCenterX, holeCenterY, holeRadius + 3, 0, Math.PI * 2);
  ctx.fillStyle = '#05070a';
  ctx.fill();

  // Dark lens
  ctx.beginPath();
  ctx.arc(holeCenterX, holeCenterY, holeRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#000000';
  ctx.fill();

  // Optical coating blue reflection
  ctx.beginPath();
  ctx.arc(holeCenterX - 3, holeCenterY - 3, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#1e3a8a';
  ctx.fill();

  // Cellular & WiFi & Battery on right (Android OneUI / HyperOS style)
  const rightX = width - 60;
  const centerY = height / 2 + 6;

  // Battery outer frame
  const batW = 54;
  const batH = 26;
  ctx.strokeStyle = theme.headerText;
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, rightX - batW, centerY - batH / 2, batW, batH, 5);
  ctx.stroke();

  // Battery fill level
  const fillPct = Math.max(0.1, Math.min(1, contact.batteryLevel / 100));
  ctx.fillStyle = contact.batteryLevel < 20 ? '#ef4444' : '#22c55e';
  drawRoundedRect(
    ctx,
    rightX - batW + 4,
    centerY - batH / 2 + 4,
    (batW - 8) * fillPct,
    batH - 8,
    3
  );
  ctx.fill();

  // Battery Percentage text beside battery
  ctx.font = '600 28px -apple-system, BlinkMacSystemFont, "Roboto", monospace';
  ctx.fillStyle = theme.headerText;
  ctx.textAlign = 'right';
  ctx.fillText(`${contact.batteryLevel}%`, rightX - batW - 14, centerY);

  // Wifi icon
  const wifiX = rightX - batW - 110;
  ctx.strokeStyle = theme.headerText;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(wifiX, centerY + 8, 22, -Math.PI * 0.75, -Math.PI * 0.25);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(wifiX, centerY + 8, 14, -Math.PI * 0.75, -Math.PI * 0.25);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(wifiX, centerY + 8, 3, 0, Math.PI * 2);
  ctx.fillStyle = theme.headerText;
  ctx.fill();

  // 5G icon text
  ctx.font = '700 26px -apple-system, BlinkMacSystemFont, "Roboto", sans-serif';
  ctx.fillStyle = theme.headerText;
  ctx.textAlign = 'right';
  ctx.fillText('5G', wifiX - 22, centerY);

  // VoLTE badge
  ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Roboto", sans-serif';
  ctx.fillStyle = theme.headerText;
  ctx.fillText('VoLTE', wifiX - 70, centerY);

  ctx.restore();
}

// Render Header Bar
function renderHeaderBar(
  ctx: CanvasRenderingContext2D,
  width: number,
  topY: number,
  height: number,
  contact: ContactSettings,
  theme: ThemeColors,
  isTypingNow: boolean
) {
  ctx.save();
  ctx.fillStyle = theme.header;
  ctx.fillRect(0, topY, width, height);

  // Bottom border line for header in light mode
  if (theme.mode === 'light') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(0, topY + height - 1, width, 1);
  }

  const centerY = topY + height / 2;

  // Back arrow
  ctx.strokeStyle = theme.headerText;
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(68, centerY - 18);
  ctx.lineTo(50, centerY);
  ctx.lineTo(68, centerY + 18);
  ctx.stroke();

  // Avatar circle
  const avatarRadius = 48;
  const avatarX = 145;
  const avatarY = centerY;

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
  ctx.clip();

  const cachedImg = avatarImageCache[contact.avatarUrl];
  if (cachedImg && cachedImg.complete && cachedImg.naturalWidth > 0) {
    ctx.drawImage(
      cachedImg,
      avatarX - avatarRadius,
      avatarY - avatarRadius,
      avatarRadius * 2,
      avatarRadius * 2
    );
  } else {
    // Initial letter avatar
    ctx.fillStyle = '#00a884';
    ctx.fillRect(avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 44px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(contact.contactName.charAt(0).toUpperCase() || 'C', avatarX, avatarY);
  }
  ctx.restore();

  // Online indicator dot on avatar border
  ctx.beginPath();
  ctx.arc(avatarX + 34, avatarY + 34, 11, 0, Math.PI * 2);
  ctx.fillStyle = '#25d366';
  ctx.fill();
  ctx.strokeStyle = theme.header;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Contact Name
  ctx.fillStyle = theme.headerText;
  ctx.font = '600 42px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(contact.contactName, 215, centerY - 16);

  // Status subtitle: "typing..." or "online"
  if (isTypingNow) {
    ctx.fillStyle = '#25d366'; // WhatsApp Green for typing
    ctx.font = '500 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('typing...', 215, centerY + 24);
  } else {
    ctx.fillStyle = theme.headerSubtext;
    ctx.font = '400 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const statusText =
      contact.statusMode === 'online'
        ? 'online'
        : contact.statusMode === 'typing'
        ? 'typing...'
        : contact.customStatusText || 'last seen recently';
    ctx.fillText(statusText, 215, centerY + 24);
  }

  // Right action icons: Video call, Phone call, 3 Dots
  const iconY = centerY;
  ctx.strokeStyle = theme.headerText;
  ctx.fillStyle = theme.headerText;
  ctx.lineWidth = 3.5;

  // 3 Dots menu
  const menuX = width - 60;
  for (let m = -1; m <= 1; m++) {
    ctx.beginPath();
    ctx.arc(menuX, iconY + m * 16, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Phone icon
  const phoneX = width - 140;
  ctx.beginPath();
  ctx.arc(phoneX, iconY, 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(phoneX - 8, iconY - 8);
  ctx.lineTo(phoneX + 8, iconY + 8);
  ctx.stroke();

  // Video Camera icon
  const camX = width - 230;
  drawRoundedRect(ctx, camX - 22, iconY - 14, 30, 28, 6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(camX + 12, iconY - 8);
  ctx.lineTo(camX + 24, iconY - 14);
  ctx.lineTo(camX + 24, iconY + 14);
  ctx.lineTo(camX + 12, iconY + 8);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// Render Bottom Input Bar
function renderBottomBar(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  barHeight: number,
  theme: ThemeColors,
  draftText: string,
  isPersonATyping: boolean
) {
  const barY = height - barHeight;
  ctx.save();

  // Input background pill
  const inputLeft = 24;
  const inputRight = width - 130;
  const inputWidth = inputRight - inputLeft;
  const inputHeight = 100;
  const inputY = barY + 20;

  drawRoundedRect(ctx, inputLeft, inputY, inputWidth, inputHeight, 48);
  ctx.fillStyle = theme.inputBackground;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Emoji Smiley Icon inside input
  const smileX = inputLeft + 54;
  const inputCenterY = inputY + inputHeight / 2;
  ctx.strokeStyle = theme.iconColor;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(smileX, inputCenterY, 20, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(smileX - 7, inputCenterY - 6, 2.5, 0, Math.PI * 2);
  ctx.arc(smileX + 7, inputCenterY - 6, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = theme.iconColor;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(smileX, inputCenterY + 2, 11, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // Draft Text or Placeholder
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  if (draftText) {
    ctx.fillStyle = theme.inputText;
    ctx.font = '400 38px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    // Truncate if draft exceeds input width
    const maxTextW = inputWidth - 260;
    let displayText = draftText;
    while (ctx.measureText(displayText).width > maxTextW && displayText.length > 0) {
      displayText = displayText.slice(1);
    }
    ctx.fillText(displayText, smileX + 42, inputCenterY);

    // Blinking cursor
    const textW = ctx.measureText(displayText).width;
    ctx.fillStyle = '#00a884';
    ctx.fillRect(smileX + 46 + textW, inputCenterY - 22, 4, 44);
  } else {
    ctx.fillStyle = theme.inputPlaceholder;
    ctx.font = '400 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Message', smileX + 42, inputCenterY);
  }

  // Paperclip attachment icon
  const attachX = inputRight - 110;
  ctx.strokeStyle = theme.iconColor;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(attachX, inputCenterY, 14, 0, Math.PI * 2);
  ctx.stroke();

  // Camera icon inside input
  const camX = inputRight - 50;
  drawRoundedRect(ctx, camX - 16, inputCenterY - 12, 32, 24, 5);
  ctx.stroke();

  // Right round action button (Mic or Send Plane)
  const actionBtnRadius = 48;
  const actionBtnX = width - 66;
  const actionBtnY = inputCenterY;

  ctx.beginPath();
  ctx.arc(actionBtnX, actionBtnY, actionBtnRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#00a884'; // WhatsApp Green button
  ctx.shadowColor = 'rgba(0, 168, 132, 0.35)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.fill();
  ctx.shadowColor = 'transparent';

  if (draftText || isPersonATyping) {
    // Send plane icon
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(actionBtnX - 16, actionBtnY - 20);
    ctx.lineTo(actionBtnX + 22, actionBtnY);
    ctx.lineTo(actionBtnX - 16, actionBtnY + 20);
    ctx.lineTo(actionBtnX - 8, actionBtnY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else {
    // Microphone icon
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    drawRoundedRect(ctx, actionBtnX - 8, actionBtnY - 18, 16, 26, 8);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(actionBtnX, actionBtnY - 4, 16, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(actionBtnX, actionBtnY + 12);
    ctx.lineTo(actionBtnX, actionBtnY + 20);
    ctx.stroke();
    ctx.restore();
  }

  // Home bar / gesture bar at the very bottom
  const homeBarWidth = 280;
  const homeBarHeight = 8;
  const homeBarY = height - 24;
  drawRoundedRect(ctx, (width - homeBarWidth) / 2, homeBarY, homeBarWidth, homeBarHeight, 4);
  ctx.fillStyle = theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)';
  ctx.fill();

  ctx.restore();
}
