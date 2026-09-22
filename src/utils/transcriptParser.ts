import { ParsedMessage, ParserConfig, SenderRole, TaggedLine, TaggedSender } from '../types';
import {
  DEFAULT_SCREENSHOT_URL,
  SCREENSHOT_PRESETS,
} from '../constants/screenshotLibrary';

// Match <image attachment>, <image: URL>, <screenshot>, [image: URL], etc.
const IMAGE_TAG_REGEX = /<(?:image|screenshot)(?:\s+attachment)?(?::\s*([^>]+))?>|\[(?:image|screenshot)(?::\s*([^\]]+))?\]/i;

/**
 * Parses uploaded transcription or chat export files (.txt, .srt, .vtt, .json, .csv)
 */
export function parseUploadedFileContent(
  fileName: string,
  rawContent: string,
  currentConfig: ParserConfig,
  currentNameA: string,
  currentNameB: string
): {
  rawTranscript: string;
  taggedLines: TaggedLine[];
  detectedPrefixA?: string;
  detectedPrefixB?: string;
  detectedNameA?: string;
  detectedNameB?: string;
  detectedCount: number;
} {
  const ext = fileName.split('.').pop()?.toLowerCase() || 'txt';
  let processedLines: string[] = [];

  // 1. JSON parsing
  if (ext === 'json') {
    try {
      const parsed = JSON.parse(rawContent);
      if (Array.isArray(parsed)) {
        processedLines = parsed.map((item) => {
          if (typeof item === 'string') return item;
          const speaker = item.speaker || item.sender || item.name || item.role || item.from || '';
          const text = item.text || item.message || item.content || item.line || '';
          return speaker ? `${speaker}: ${text}` : text;
        });
      } else if (typeof parsed === 'object' && parsed !== null) {
        const list = parsed.messages || parsed.dialogue || parsed.transcript || parsed.lines || [];
        if (Array.isArray(list)) {
          processedLines = list.map((item: any) => {
            if (typeof item === 'string') return item;
            const speaker = item.speaker || item.sender || item.name || item.role || '';
            const text = item.text || item.message || item.content || '';
            return speaker ? `${speaker}: ${text}` : text;
          });
        }
      }
    } catch {
      processedLines = rawContent.split('\n');
    }
  }
  // 2. Subtitles SRT / VTT parsing
  else if (ext === 'srt' || ext === 'vtt') {
    const rawLines = rawContent.split('\n');
    processedLines = [];
    for (const line of rawLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (/^WEBVTT/i.test(trimmed)) continue;
      if (/^\d+$/.test(trimmed)) continue; // SRT cue numbers
      if (/^\d{2}:\d{2}/.test(trimmed) || /-->/.test(trimmed)) continue; // Timestamps

      // Strip tags like <v SpeakerName> or [Speaker]:
      const cleanLine = trimmed.replace(/<v\s+([^>]+)>/gi, '$1: ').replace(/<\/v>/gi, '');
      processedLines.push(cleanLine);
    }
  }
  // 3. CSV parsing
  else if (ext === 'csv') {
    const rows = rawContent.split('\n');
    processedLines = [];
    for (const row of rows) {
      const trimmed = row.trim();
      if (!trimmed) continue;
      // If header row, skip
      if (/^(speaker|sender|role|time|name),(text|message|content)/i.test(trimmed)) continue;

      const parts = trimmed.split(',');
      if (parts.length >= 2) {
        const speaker = parts[0].replace(/^["']|["']$/g, '').trim();
        const text = parts.slice(1).join(',').replace(/^["']|["']$/g, '').trim();
        processedLines.push(speaker ? `${speaker}: ${text}` : text);
      } else {
        processedLines.push(trimmed);
      }
    }
  }
  // 4. WhatsApp Export .txt or standard plaintext
  else {
    const rawLines = rawContent.split('\n');
    processedLines = [];

    // WhatsApp export patterns:
    // "[12/04/2026, 10:42:01] Sarah: Hello there"
    // "12/04/26, 10:42 - Sarah: Hello there"
    const waPattern1 = /^\[?\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?\]?\s*(?:-\s*)?([^:]+):\s*(.+)$/i;

    for (const line of rawLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Ignore standard WhatsApp system messages
      if (
        /Messages and calls are end-to-end encrypted/i.test(trimmed) ||
        /created group/i.test(trimmed) ||
        /security code changed/i.test(trimmed)
      ) {
        continue;
      }

      const waMatch = trimmed.match(waPattern1);
      if (waMatch) {
        const speaker = waMatch[1].trim();
        const message = waMatch[2].trim();
        processedLines.push(`${speaker}: ${message}`);
      } else {
        processedLines.push(trimmed);
      }
    }
  }

  const cleanRawText = processedLines.filter(Boolean).join('\n');

  // Auto-detect speakers / prefixes
  const prefixCounts: Record<string, number> = {};
  for (const line of processedLines) {
    const match = line.match(/^(\[?[a-zA-Z0-9\s_-]+\]?:?)/);
    if (match) {
      const p = match[1].trim();
      prefixCounts[p] = (prefixCounts[p] || 0) + 1;
    }
  }

  const sortedPrefixes = Object.entries(prefixCounts).sort((a, b) => b[1] - a[1]);
  let detectedPrefixA = currentConfig.prefixA;
  let detectedPrefixB = currentConfig.prefixB;
  let detectedNameA = currentNameA;
  let detectedNameB = currentNameB;

  if (sortedPrefixes.length >= 2) {
    const pA = sortedPrefixes[0][0].endsWith(':') ? sortedPrefixes[0][0] : `${sortedPrefixes[0][0]}:`;
    const pB = sortedPrefixes[1][0].endsWith(':') ? sortedPrefixes[1][0] : `${sortedPrefixes[1][0]}:`;
    detectedPrefixA = pA;
    detectedPrefixB = pB;
    detectedNameA = pA.replace(/[:\[\]]/g, '').trim();
    detectedNameB = pB.replace(/[:\[\]]/g, '').trim();
  } else if (sortedPrefixes.length === 1) {
    const pB = sortedPrefixes[0][0].endsWith(':') ? sortedPrefixes[0][0] : `${sortedPrefixes[0][0]}:`;
    detectedPrefixB = pB;
    detectedNameB = pB.replace(/[:\[\]]/g, '').trim();
  }

  const finalConfig: ParserConfig = {
    prefixA: detectedPrefixA,
    prefixB: detectedPrefixB,
  };

  const taggedLines = analyzeRawTextToTaggedLines(
    cleanRawText,
    finalConfig,
    detectedNameA || currentNameA,
    detectedNameB || currentNameB
  );

  return {
    rawTranscript: cleanRawText,
    taggedLines,
    detectedPrefixA,
    detectedPrefixB,
    detectedNameA,
    detectedNameB,
    detectedCount: taggedLines.length,
  };
}

/**
 * Analyze raw lines of text and extract TaggedLine objects with detected Person A/B tags.
 */
export function analyzeRawTextToTaggedLines(
  rawText: string,
  config: ParserConfig,
  personAName: string,
  personBName: string
): TaggedLine[] {
  if (!rawText.trim()) return [];

  const rawLines = rawText.split('\n');
  const taggedLines: TaggedLine[] = [];

  const cleanPrefixA = (config.prefixA || '').trim().toLowerCase();
  const cleanPrefixB = (config.prefixB || '').trim().toLowerCase();
  const cleanNameA = (personAName || '').trim().toLowerCase();
  const cleanNameB = (personBName || '').trim().toLowerCase();

  let lastSender: TaggedSender = 'B';

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i].trim();
    if (!rawLine) continue;

    let sender: TaggedSender = 'A';
    let text = rawLine;

    const lower = rawLine.toLowerCase();

    // Check [Person A] or [Person B] or [Untagged] explicit tags
    if (lower.startsWith('[person a]:') || lower.startsWith('[person a]')) {
      sender = 'A';
      text = rawLine.replace(/^\[person a\]:?/i, '').trim();
    } else if (lower.startsWith('[person b]:') || lower.startsWith('[person b]')) {
      sender = 'B';
      text = rawLine.replace(/^\[person b\]:?/i, '').trim();
    } else if (lower.startsWith('[untagged]:') || lower.startsWith('[untagged]')) {
      sender = 'NONE';
      text = rawLine.replace(/^\[untagged\]:?/i, '').trim();
    }
    // Check configured prefix A
    else if (cleanPrefixA && lower.startsWith(cleanPrefixA)) {
      sender = 'A';
      text = rawLine.slice(cleanPrefixA.length).trim();
    }
    // Check configured prefix B
    else if (cleanPrefixB && lower.startsWith(cleanPrefixB)) {
      sender = 'B';
      text = rawLine.slice(cleanPrefixB.length).trim();
    }
    // Check Name A
    else if (cleanNameA && lower.startsWith(`${cleanNameA}:`)) {
      sender = 'A';
      text = rawLine.slice(`${cleanNameA}:`.length).trim();
    }
    // Check Name B
    else if (cleanNameB && lower.startsWith(`${cleanNameB}:`)) {
      sender = 'B';
      text = rawLine.slice(`${cleanNameB}:`.length).trim();
    }
    // Check [A]: or [B]: or generic [Speaker]: or Speaker:
    else {
      const match = rawLine.match(/^\[?([^:\]]+)\]?:\s*(.+)$/i);
      if (match) {
        const detectedSpeaker = match[1].trim().toLowerCase();
        text = match[2].trim();

        if (
          detectedSpeaker === 'me' ||
          detectedSpeaker === 'a' ||
          detectedSpeaker === 'user1' ||
          detectedSpeaker === 'person a' ||
          detectedSpeaker === cleanNameA
        ) {
          sender = 'A';
        } else if (
          detectedSpeaker === 'you' ||
          detectedSpeaker === 'b' ||
          detectedSpeaker === 'user2' ||
          detectedSpeaker === 'person b' ||
          detectedSpeaker === cleanNameB
        ) {
          sender = 'B';
        } else {
          // Alternating default
          sender = lastSender === 'A' ? 'B' : 'A';
        }
      } else {
        // Alternating fallback if no prefix present
        sender = lastSender === 'A' ? 'B' : 'A';
      }
    }

    // Check image tags
    let hasImage = false;
    let imageUrl: string | undefined = undefined;
    const imgMatch = text.match(IMAGE_TAG_REGEX);
    if (imgMatch) {
      hasImage = true;
      const rawUrlOrPreset = (imgMatch[1] || imgMatch[2] || '').trim();
      if (rawUrlOrPreset) {
        const foundPreset = SCREENSHOT_PRESETS.find(
          (p) =>
            p.id.toLowerCase() === rawUrlOrPreset.toLowerCase() ||
            p.name.toLowerCase() === rawUrlOrPreset.toLowerCase()
        );
        imageUrl = foundPreset ? foundPreset.url : rawUrlOrPreset;
      } else {
        imageUrl = DEFAULT_SCREENSHOT_URL;
      }
    }

    if (sender !== 'NONE') {
      lastSender = sender;
    }

    taggedLines.push({
      id: `line-${i}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender,
      text,
      hasImage,
      imageUrl,
    });
  }

  return taggedLines;
}

/**
 * Convert TaggedLine array back to formatted raw transcript text.
 */
export function taggedLinesToRawText(
  lines: TaggedLine[],
  config: ParserConfig
): string {
  return lines
    .map((line) => {
      const prefix =
        line.sender === 'A'
          ? config.prefixA || 'Me:'
          : line.sender === 'B'
          ? config.prefixB || 'Alex:'
          : '';
      const text = line.text.trim();
      return prefix ? `${prefix} ${text}` : text;
    })
    .join('\n');
}

/**
 * Convert TaggedLine array directly into ParsedMessage array for rendering.
 */
export function parseTaggedLinesToMessages(
  lines: TaggedLine[],
  personAName: string,
  personBName: string,
  baseTimeStr: string = '10:42 AM',
  speedMultiplier: number = 1
): ParsedMessage[] {
  const validLines = lines.filter((l) => l.text.trim().length > 0);
  if (validLines.length === 0) return [];

  // Parse time components
  let currentHour = 10;
  let currentMinute = 42;
  let currentPeriod = 'AM';

  const timeMatch = baseTimeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (timeMatch) {
    currentHour = parseInt(timeMatch[1], 10);
    currentMinute = parseInt(timeMatch[2], 10);
    if (timeMatch[3]) {
      currentPeriod = timeMatch[3].toUpperCase();
    }
  }

  let accumulatedTimeMs = 0;
  const messages: ParsedMessage[] = [];

  let fallbackSender: SenderRole = 'A';

  for (let i = 0; i < validLines.length; i++) {
    const item = validLines[i];
    let content = item.text.trim();

    const sender: SenderRole =
      item.sender === 'NONE'
        ? (fallbackSender = fallbackSender === 'A' ? 'B' : 'A')
        : item.sender;
    fallbackSender = sender;

    let hasImage = item.hasImage || false;
    let imageUrl = item.imageUrl;
    let caption: string | undefined = undefined;

    const imgMatch = content.match(IMAGE_TAG_REGEX);
    if (imgMatch) {
      hasImage = true;
      const rawUrlOrPreset = (imgMatch[1] || imgMatch[2] || '').trim();
      if (rawUrlOrPreset) {
        const foundPreset = SCREENSHOT_PRESETS.find(
          (p) =>
            p.id.toLowerCase() === rawUrlOrPreset.toLowerCase() ||
            p.name.toLowerCase() === rawUrlOrPreset.toLowerCase()
        );
        imageUrl = foundPreset ? foundPreset.url : rawUrlOrPreset;
      } else {
        imageUrl = imageUrl || DEFAULT_SCREENSHOT_URL;
      }

      caption = content.replace(IMAGE_TAG_REGEX, '').trim();
      content = caption;
    }

    // Advance time slightly every 3 messages
    if (i > 0 && i % 3 === 0) {
      currentMinute += 1;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
        if (currentHour === 12) {
          currentPeriod = currentPeriod === 'AM' ? 'PM' : 'AM';
        } else if (currentHour > 12) {
          currentHour = 1;
        }
      }
    }

    const formattedTime = `${currentHour}:${currentMinute.toString().padStart(2, '0')} ${currentPeriod}`;

    const charCount = (content || (hasImage ? 'Screenshot attachment' : '')).length;
    const rawTypingDelay = 450;
    const rawTypingDuration = hasImage
      ? 1100
      : Math.max(500, Math.min(charCount * 28, 2200));
    const rawPauseAfter = 850;

    const typingDelayMs = Math.round(rawTypingDelay / speedMultiplier);
    const typingDurationMs = Math.round(rawTypingDuration / speedMultiplier);
    const pauseAfterMs = Math.round(rawPauseAfter / speedMultiplier);

    const startMs = accumulatedTimeMs;
    const endMs = startMs + typingDelayMs + typingDurationMs + pauseAfterMs;
    accumulatedTimeMs = endMs;

    messages.push({
      id: item.id || `msg-${i}-${Date.now()}`,
      sender,
      senderName: sender === 'A' ? personAName : personBName,
      text: content,
      hasImage,
      imageUrl,
      caption,
      timestamp: formattedTime,
      typingDelayMs,
      typingDurationMs,
      startMs,
      endMs,
    });
  }

  return messages;
}

export function parseTranscript(
  rawText: string,
  config: ParserConfig,
  personAName: string,
  personBName: string,
  baseTimeStr: string = '10:42 AM',
  speedMultiplier: number = 1
): ParsedMessage[] {
  const taggedLines = analyzeRawTextToTaggedLines(
    rawText,
    config,
    personAName,
    personBName
  );
  return parseTaggedLinesToMessages(
    taggedLines,
    personAName,
    personBName,
    baseTimeStr,
    speedMultiplier
  );
}

// Check if string contains only emojis
const EMOJI_REGEX = /^(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\s)+$/u;

export function getEmojiRenderTier(text: string): 'single' | 'few' | 'normal' {
  const trimmed = text.trim();
  if (!EMOJI_REGEX.test(trimmed)) {
    return 'normal';
  }

  // Count code points of emojis (using Intl.Segmenter or Array.from)
  const segments = Array.from(trimmed).filter((ch) => ch.trim().length > 0);
  if (segments.length === 1 || (segments.length === 2 && trimmed.includes('\uFE0F'))) {
    return 'single'; // huge emoji
  }
  if (segments.length <= 4) {
    return 'few'; // medium emoji
  }
  return 'normal';
}
