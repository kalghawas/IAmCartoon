import React, { useState, useRef, useCallback } from 'react';
import {
  FileText,
  Wand2,
  Trash2,
  Copy,
  CheckCircle2,
  Image as ImageIcon,
  Plus,
  ChevronUp,
  ChevronDown,
  Tag,
  Code2,
  RefreshCw,
  ArrowRightLeft,
  Check,
  MessageSquare,
  UploadCloud,
  FileUp,
} from 'lucide-react';
import { AppThemeMode, ParserConfig, TaggedLine, TaggedSender, UserSubscriptionState } from '../types';
import { SAMPLE_TRANSCRIPTS } from '../constants/sampleTranscripts';
import { ImageAttachmentModal } from './ImageAttachmentModal';
import { ButtonBubblesAnimation } from './ButtonBubblesAnimation';
import {
  analyzeRawTextToTaggedLines,
  taggedLinesToRawText,
  parseUploadedFileContent,
} from '../utils/transcriptParser';

interface TranscriptEditorProps {
  rawTranscript: string;
  onChangeTranscript: (val: string) => void;
  taggedLines: TaggedLine[];
  onChangeTaggedLines: (lines: TaggedLine[]) => void;
  parserConfig: ParserConfig;
  onChangeParserConfig: (cfg: ParserConfig) => void;
  personAName: string;
  personBName: string;
  onUpdateSpeakerNames: (nameA: string, nameB: string) => void;
  appliedMessageCount: number;
  hasPendingChanges: boolean;
  isGenerating?: boolean;
  onMakeBubbles: () => void;
  onLoadSample: (sampleId: string) => void;
  onAutoDetectPrefixes: () => void;
  appThemeMode?: AppThemeMode;
  subscription: UserSubscriptionState;
  onOpenUpgradeModal: () => void;
}

export const TranscriptEditor: React.FC<TranscriptEditorProps> = ({
  rawTranscript,
  onChangeTranscript,
  taggedLines,
  onChangeTaggedLines,
  parserConfig,
  onChangeParserConfig,
  personAName,
  personBName,
  onUpdateSpeakerNames,
  appliedMessageCount,
  hasPendingChanges,
  isGenerating = false,
  onMakeBubbles,
  onLoadSample,
  onAutoDetectPrefixes,
  appThemeMode = 'dark',
  subscription,
  onOpenUpgradeModal,
}) => {
  const isDark = appThemeMode === 'dark';
  const [editorMode, setEditorMode] = useState<'tagged' | 'raw'>('tagged');
  const [copied, setCopied] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [targetLineIndexForImage, setTargetLineIndexForImage] = useState<number | null>(null);
  const [activeTagMenuIndex, setActiveTagMenuIndex] = useState<number | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize when switching to raw mode
  const handleSwitchToRaw = () => {
    const raw = taggedLinesToRawText(taggedLines, parserConfig);
    onChangeTranscript(raw);
    setEditorMode('raw');
  };

  // Synchronize when switching to tagged mode
  const handleSwitchToTagged = () => {
    const lines = analyzeRawTextToTaggedLines(
      rawTranscript,
      parserConfig,
      personAName,
      personBName
    );
    onChangeTaggedLines(lines);
    setEditorMode('tagged');
  };

  // Copy transcript
  const handleCopy = () => {
    const textToCopy =
      editorMode === 'tagged'
        ? taggedLinesToRawText(taggedLines, parserConfig)
        : rawTranscript;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // File Upload Handler (supports .txt, .json, .csv, .srt, .vtt, .chat, .log, .md)
  const processUploadedFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      const result = parseUploadedFileContent(
        file.name,
        content,
        parserConfig,
        personAName,
        personBName
      );

      onChangeTranscript(result.rawTranscript);
      onChangeTaggedLines(result.taggedLines);

      if (result.detectedPrefixA && result.detectedPrefixB) {
        onChangeParserConfig({
          prefixA: result.detectedPrefixA,
          prefixB: result.detectedPrefixB,
        });
      }

      if (result.detectedNameA && result.detectedNameB) {
        onUpdateSpeakerNames(result.detectedNameA, result.detectedNameB);
      }

      setUploadFeedback(`Imported "${file.name}" (${result.detectedCount} lines detected)`);
      setTimeout(() => setUploadFeedback(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
      e.target.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  }, [parserConfig, personAName, personBName]);

  // Tag adjustments
  const handleSetSender = (index: number, sender: TaggedSender) => {
    const updated = [...taggedLines];
    updated[index] = { ...updated[index], sender };
    onChangeTaggedLines(updated);
    setActiveTagMenuIndex(null);
  };

  const handleToggleSender = (index: number) => {
    const current = taggedLines[index].sender;
    const next: TaggedSender = current === 'A' ? 'B' : current === 'B' ? 'A' : 'A';
    handleSetSender(index, next);
  };

  const handleUpdateLineText = (index: number, text: string) => {
    const updated = [...taggedLines];
    updated[index] = { ...updated[index], text };
    onChangeTaggedLines(updated);
  };

  const handleAddLine = (sender: TaggedSender = 'A', insertAfterIndex?: number) => {
    const newLine: TaggedLine = {
      id: `line-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sender,
      text: '',
    };

    if (insertAfterIndex !== undefined && insertAfterIndex >= 0) {
      const updated = [...taggedLines];
      updated.splice(insertAfterIndex + 1, 0, newLine);
      onChangeTaggedLines(updated);
    } else {
      onChangeTaggedLines([...taggedLines, newLine]);
    }
  };

  const handleDeleteLine = (index: number) => {
    const updated = taggedLines.filter((_, i) => i !== index);
    onChangeTaggedLines(updated);
  };

  const handleMoveLine = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === taggedLines.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...taggedLines];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChangeTaggedLines(updated);
  };

  const handleInvertAllSenders = () => {
    const updated = taggedLines.map((l) => ({
      ...l,
      sender: l.sender === 'A' ? ('B' as TaggedSender) : l.sender === 'B' ? ('A' as TaggedSender) : l.sender,
    }));
    onChangeTaggedLines(updated);
  };

  const handleAutoTagAll = () => {
    const raw = taggedLinesToRawText(taggedLines, parserConfig);
    const analyzed = analyzeRawTextToTaggedLines(
      raw,
      parserConfig,
      personAName,
      personBName
    );
    onChangeTaggedLines(analyzed);
  };

  const handleOpenImageModalForLine = (index: number) => {
    setTargetLineIndexForImage(index);
    setIsImageModalOpen(true);
  };

  const handleSelectImageTag = (tag: string) => {
    if (targetLineIndexForImage !== null && targetLineIndexForImage < taggedLines.length) {
      const updated = [...taggedLines];
      const currentText = updated[targetLineIndexForImage].text.trim();
      updated[targetLineIndexForImage] = {
        ...updated[targetLineIndexForImage],
        text: currentText ? `${currentText} ${tag}` : tag,
      };
      onChangeTaggedLines(updated);
    } else {
      const newLine: TaggedLine = {
        id: `line-${Date.now()}`,
        sender: 'A',
        text: tag,
      };
      onChangeTaggedLines([...taggedLines, newLine]);
    }
    setTargetLineIndexForImage(null);
  };

  // Raw text change: update raw string
  const handleRawTextChange = (val: string) => {
    onChangeTranscript(val);
  };

  // Analyze raw text and switch to tagged
  const handleAnalyzeRawText = () => {
    const lines = analyzeRawTextToTaggedLines(
      rawTranscript,
      parserConfig,
      personAName,
      personBName
    );
    onChangeTaggedLines(lines);
    setEditorMode('tagged');
  };

  // Quick stats
  const countA = taggedLines.filter((l) => l.sender === 'A').length;
  const countB = taggedLines.filter((l) => l.sender === 'B').length;
  const totalLines = taggedLines.filter((l) => l.text.trim().length > 0).length;

  return (
    <div
      id="transcript-editor-card"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex flex-col h-full space-y-3 ${
        isDraggingFile ? 'ring-2 ring-emerald-500 rounded-2xl bg-emerald-500/5' : ''
      }`}
    >
      {/* Hidden File Input for uploading conversation files */}
      <input
        ref={fileInputRef}
        id="file-upload-transcript-input"
        type="file"
        accept=".txt,.json,.csv,.srt,.vtt,.chat,.log,.md,text/plain,application/json,text/csv"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Drag & Drop Visual Overlay */}
      {isDraggingFile && (
        <div className="absolute inset-0 z-40 bg-emerald-950/80 backdrop-blur-xs border-2 border-dashed border-emerald-400 rounded-2xl flex flex-col items-center justify-center text-emerald-200 pointer-events-none animate-in fade-in duration-100">
          <UploadCloud className="w-12 h-12 mb-2 animate-bounce" />
          <p className="text-sm font-bold">Drop your conversation file here</p>
          <p className="text-xs text-emerald-300/80">Supports .txt, WhatsApp export, .json, .csv, .srt, .vtt</p>
        </div>
      )}

      {/* Upload Feedback Toast */}
      {uploadFeedback && (
        <div className="p-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{uploadFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadFeedback(null)}
            className="text-white/80 hover:text-white p-0.5 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header: Title, Demo Dropdown, Upload File Button & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2
              className={`text-sm font-semibold tracking-tight truncate flex items-center gap-1.5 ${
                isDark ? 'text-zinc-100' : 'text-zinc-900'
              }`}
            >
              <span>Conversation Transcript & Tags</span>
              {hasPendingChanges && (
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full">
                  Ready to Update
                </span>
              )}
            </h2>
            <p className={`text-[11px] truncate ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {editorMode === 'tagged'
                ? `Tagged Line Editor (${totalLines} lines • A: ${countA}, B: ${countB})`
                : 'Raw text editor with speaker detection'}
            </p>
          </div>
        </div>

        {/* Top Right Controls: Upload Button, Mode Toggle & Demo Dropdown */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* UPLOAD TRANSCRIPT FILE BUTTON (Prominent Button) */}
          <button
            id="btn-upload-transcript-file"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer ${
              isDark
                ? 'bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border-zinc-700/80'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
            }`}
            title="Upload conversation file (.txt, WhatsApp export, .json, .csv, .srt, .vtt)"
          >
            <FileUp className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span className="whitespace-nowrap">Upload File</span>
          </button>

          {/* Mode Tabs (Tagged vs Raw) */}
          <div
            className={`flex items-center border rounded-xl p-0.5 text-xs font-medium ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-300'
            }`}
          >
            <button
              type="button"
              onClick={handleSwitchToTagged}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                editorMode === 'tagged'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : isDark
                  ? 'text-zinc-400 hover:text-zinc-200'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title="Visual Tagged Lines Editor"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Tags View</span>
            </button>

            <button
              type="button"
              onClick={handleSwitchToRaw}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                editorMode === 'raw'
                  ? isDark
                    ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-xs'
                    : 'bg-white text-emerald-700 font-semibold shadow-xs border border-zinc-200'
                  : isDark
                  ? 'text-zinc-400 hover:text-zinc-200'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title="Raw Plain Text / Paste Area"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Raw Text</span>
            </button>
          </div>

          {/* Demo Dropdown */}
          <select
            id="select-demo-transcript"
            aria-label="Select Demo Transcript"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                onLoadSample(e.target.value);
                e.target.value = '';
              }
            }}
            className={`text-xs border rounded-xl px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors shadow-xs ${
              isDark
                ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700/80'
                : 'bg-white hover:bg-zinc-50 text-zinc-800 border-zinc-300'
            }`}
          >
            <option value="" disabled>
              ⚡ Load Demo...
            </option>
            {SAMPLE_TRANSCRIPTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Parser Configuration Box */}
      <div
        className={`border rounded-xl p-2.5 space-y-2 shadow-xs ${
          isDark
            ? 'bg-zinc-900/90 border-zinc-800 text-zinc-300'
            : 'bg-zinc-50 border-zinc-200 text-zinc-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium flex items-center gap-1.5">
            <span>Prefix Matcher</span>
            <span className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
              (Auto-identifies Person A vs Person B)
            </span>
          </span>
          <button
            id="btn-auto-detect-prefixes"
            type="button"
            onClick={onAutoDetectPrefixes}
            className="text-[11px] text-emerald-500 hover:text-emerald-400 flex items-center gap-1 font-medium hover:underline cursor-pointer"
          >
            <Wand2 className="w-3 h-3" />
            Auto-Detect
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Prefix A */}
          <div>
            <label className="text-[10px] flex items-center justify-between mb-0.5">
              <span className="font-semibold text-emerald-500 truncate">
                Person A ({personAName} • Sent)
              </span>
              <span className={`text-[9px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Right Bubble
              </span>
            </label>
            <input
              id="input-prefix-a"
              type="text"
              value={parserConfig.prefixA}
              onChange={(e) =>
                onChangeParserConfig({ ...parserConfig, prefixA: e.target.value })
              }
              placeholder="e.g. Me:"
              className={`w-full border rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                isDark
                  ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-500'
                  : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400'
              }`}
            />
          </div>

          {/* Prefix B */}
          <div>
            <label className="text-[10px] flex items-center justify-between mb-0.5">
              <span className="font-semibold text-cyan-500 truncate">
                Person B ({personBName} • Received)
              </span>
              <span className={`text-[9px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Left Bubble
              </span>
            </label>
            <input
              id="input-prefix-b"
              type="text"
              value={parserConfig.prefixB}
              onChange={(e) =>
                onChangeParserConfig({ ...parserConfig, prefixB: e.target.value })
              }
              placeholder="e.g. Alex:"
              className={`w-full border rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 ${
                isDark
                  ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-500'
                  : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* VIEW 1: VISUAL TAGGED LINES EDITOR */}
      {editorMode === 'tagged' ? (
        <div
          className={`flex-1 flex flex-col min-h-[380px] border rounded-xl overflow-hidden shadow-inner ${
            isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'
          }`}
        >
          {/* Action bar for Tagged View */}
          <div
            className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b text-xs ${
              isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Add Person A Line */}
              <button
                type="button"
                onClick={() => handleAddLine('A')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold text-[11px] transition-colors cursor-pointer"
                title="Add new message for Person A"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Person A ({personAName})</span>
              </button>

              {/* Add Person B Line */}
              <button
                type="button"
                onClick={() => handleAddLine('B')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-semibold text-[11px] transition-colors cursor-pointer"
                title="Add new message for Person B"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Person B ({personBName})</span>
              </button>

              {/* Screenshot Attachment */}
              <button
                type="button"
                onClick={() => {
                  setTargetLineIndexForImage(null);
                  setIsImageModalOpen(true);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg border font-medium text-[11px] transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300'
                }`}
                title="Insert screenshot attachment"
              >
                <ImageIcon className="w-3 h-3 text-emerald-500" />
                <span className="hidden sm:inline">+ Screenshot</span>
              </button>
            </div>

            {/* Quick Line Utilities */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleInvertAllSenders}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
                }`}
                title="Swap all Person A ↔ Person B senders"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleAutoTagAll}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? 'text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800'
                    : 'text-zinc-600 hover:text-emerald-600 hover:bg-zinc-200'
                }`}
                title="Re-analyze and auto-tag lines"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
                }`}
                title="Copy full transcript"
              >
                {copied ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => onChangeTaggedLines([])}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? 'text-zinc-400 hover:text-rose-400 hover:bg-zinc-800'
                    : 'text-zinc-600 hover:text-rose-600 hover:bg-zinc-200'
                }`}
                title="Clear all lines"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List of Tagged Lines */}
          <div
            className={`flex-1 overflow-y-auto p-2.5 space-y-2 max-h-[420px] divide-y ${
              isDark ? 'divide-zinc-800/40' : 'divide-zinc-200'
            }`}
          >
            {taggedLines.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-center p-4 space-y-2.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isDark ? 'bg-zinc-900 text-zinc-600' : 'bg-zinc-100 text-zinc-400'
                  }`}
                >
                  <Tag className="w-6 h-6" />
                </div>
                <p
                  className={`text-xs font-semibold ${
                    isDark ? 'text-zinc-300' : 'text-zinc-700'
                  }`}
                >
                  No conversation lines yet.
                </p>
                <p className={`text-[11px] max-w-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Click <strong>"Upload File"</strong> to import a transcript (.txt, .json, .csv, WhatsApp export), drag-and-drop a file, or add lines below.
                </p>
                <div className="flex gap-2 pt-1 flex-wrap justify-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow-xs hover:bg-emerald-500 cursor-pointer flex items-center gap-1.5"
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddLine('A')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold cursor-pointer"
                  >
                    + Add Person A Line
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddLine('B')}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-xs font-semibold cursor-pointer"
                  >
                    + Add Person B Line
                  </button>
                </div>
              </div>
            ) : (
              taggedLines.map((line, idx) => {
                const isA = line.sender === 'A';
                const isB = line.sender === 'B';
                const isNone = line.sender === 'NONE';

                return (
                  <div
                    key={line.id || `line-${idx}`}
                    className={`group pt-2 flex items-start gap-2 transition-colors rounded-lg p-1.5 ${
                      isDark
                        ? isA
                          ? 'bg-emerald-950/10 hover:bg-emerald-950/20 border border-emerald-900/20'
                          : isB
                          ? 'bg-cyan-950/10 hover:bg-cyan-950/20 border border-cyan-900/20'
                          : 'bg-zinc-900/40 hover:bg-zinc-900/70 border border-zinc-800/40'
                        : isA
                        ? 'bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-200'
                        : isB
                        ? 'bg-cyan-50/70 hover:bg-cyan-50 border border-cyan-200'
                        : 'bg-zinc-50 hover:bg-zinc-100 border border-zinc-200'
                    }`}
                  >
                    {/* Line Index */}
                    <span
                      className={`text-[10px] font-mono pt-1 w-4 flex-shrink-0 text-right ${
                        isDark ? 'text-zinc-600' : 'text-zinc-400'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    {/* INTERACTIVE TAG BADGE */}
                    <div className="relative flex-shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveTagMenuIndex(activeTagMenuIndex === idx ? null : idx)
                        }
                        className={`px-2 py-1 rounded-lg text-[10.5px] font-bold tracking-tight border flex items-center gap-1 shadow-xs transition-all cursor-pointer ${
                          isA
                            ? isDark
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                            : isB
                            ? isDark
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                              : 'bg-cyan-100 text-cyan-800 border-cyan-300 hover:bg-cyan-200'
                            : isDark
                            ? 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-200'
                            : 'bg-zinc-200 text-zinc-700 border-zinc-300 hover:bg-zinc-300'
                        }`}
                        title="Click to change or remove sender tag"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        <span>
                          {isA
                            ? `Person A (${personAName || 'Me'})`
                            : isB
                            ? `Person B (${personBName || 'Alex'})`
                            : 'Untagged'}
                        </span>
                      </button>

                      {/* Tag Dropdown Menu */}
                      {activeTagMenuIndex === idx && (
                        <div
                          className={`absolute left-0 top-full mt-1 z-30 w-48 border rounded-xl shadow-2xl p-1 space-y-0.5 text-xs animate-in fade-in zoom-in-95 duration-100 ${
                            isDark
                              ? 'bg-zinc-900 border-zinc-700 text-zinc-200'
                              : 'bg-white border-zinc-300 text-zinc-800'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div
                            className={`px-2 py-1 text-[10px] font-semibold border-b ${
                              isDark
                                ? 'text-zinc-400 border-zinc-800'
                                : 'text-zinc-500 border-zinc-200'
                            }`}
                          >
                            Set Line Sender Tag:
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSetSender(idx, 'A')}
                            className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                              isA
                                ? isDark
                                  ? 'bg-emerald-950/60 text-emerald-300 font-semibold'
                                  : 'bg-emerald-50 text-emerald-800 font-semibold'
                                : isDark
                                ? 'text-zinc-300 hover:bg-zinc-800'
                                : 'text-zinc-700 hover:bg-zinc-100'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span>Person A ({personAName})</span>
                            </span>
                            {isA && <Check className="w-3 h-3 text-emerald-500" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSetSender(idx, 'B')}
                            className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                              isB
                                ? isDark
                                  ? 'bg-cyan-950/60 text-cyan-300 font-semibold'
                                  : 'bg-cyan-50 text-cyan-800 font-semibold'
                                : isDark
                                ? 'text-zinc-300 hover:bg-zinc-800'
                                : 'text-zinc-700 hover:bg-zinc-100'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-cyan-500" />
                              <span>Person B ({personBName})</span>
                            </span>
                            {isB && <Check className="w-3 h-3 text-cyan-500" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSetSender(idx, 'NONE')}
                            className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                              isNone
                                ? isDark
                                  ? 'bg-zinc-800 text-zinc-200 font-semibold'
                                  : 'bg-zinc-100 text-zinc-900 font-semibold'
                                : isDark
                                ? 'text-zinc-400 hover:bg-zinc-800'
                                : 'text-zinc-600 hover:bg-zinc-100'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-zinc-500" />
                              <span>Remove Tag (Auto)</span>
                            </span>
                            {isNone && <Check className="w-3 h-3 text-zinc-500" />}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Line Text Input */}
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={line.text}
                        onChange={(e) => handleUpdateLineText(idx, e.target.value)}
                        placeholder={
                          isA
                            ? 'Type message from Person A (right bubble)...'
                            : 'Type message from Person B (left bubble)...'
                        }
                        className={`w-full border rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-sans ${
                          isDark
                            ? 'bg-zinc-900/90 border-zinc-800/90 text-zinc-100 placeholder-zinc-600'
                            : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400'
                        }`}
                      />
                    </div>

                    {/* Line Actions */}
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleSender(idx)}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          isDark
                            ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                            : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200'
                        }`}
                        title="Swap Sender (A ↔ B)"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenImageModalForLine(idx)}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          isDark
                            ? 'text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800'
                            : 'text-zinc-500 hover:text-emerald-600 hover:bg-zinc-200'
                        }`}
                        title="Attach Screenshot to this line"
                      >
                        <ImageIcon className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveLine(idx, 'up')}
                        className={`p-1 rounded disabled:opacity-30 transition-colors cursor-pointer ${
                          isDark
                            ? 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
                            : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200'
                        }`}
                        title="Move Up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        disabled={idx === taggedLines.length - 1}
                        onClick={() => handleMoveLine(idx, 'down')}
                        className={`p-1 rounded disabled:opacity-30 transition-colors cursor-pointer ${
                          isDark
                            ? 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
                            : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200'
                        }`}
                        title="Move Down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddLine(isA ? 'B' : 'A', idx)}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          isDark
                            ? 'text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800'
                            : 'text-zinc-500 hover:text-emerald-600 hover:bg-zinc-200'
                        }`}
                        title="Insert reply below"
                      >
                        <Plus className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteLine(idx)}
                        className={`p-1 rounded transition-colors cursor-pointer ${
                          isDark
                            ? 'text-zinc-500 hover:text-rose-400 hover:bg-zinc-800'
                            : 'text-zinc-400 hover:text-rose-600 hover:bg-zinc-200'
                        }`}
                        title="Delete line"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* VIEW 2: RAW TEXTAREA MODE */
        <div
          className={`relative flex-1 flex flex-col min-h-[380px] border rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-emerald-500/70 transition-all shadow-inner ${
            isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'
          }`}
        >
          <div
            className={`flex flex-wrap items-center justify-between px-3 py-2 border-b text-xs ${
              isDark ? 'bg-zinc-900/70 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <button
                id="btn-insert-image-tag"
                type="button"
                onClick={() => {
                  setTargetLineIndexForImage(null);
                  setIsImageModalOpen(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold text-[11px] transition-colors cursor-pointer"
                title="Insert screenshot or image attachment"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>+ Image Attachment</span>
              </button>

              <span className={isDark ? 'text-zinc-700' : 'text-zinc-300'}>|</span>

              <div className="flex items-center gap-1 text-sm">
                {['❤️', '😂', '🔥', '🚀', '☕️', '👍', '😱', '✨'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      const updated =
                        rawTranscript +
                        (rawTranscript.endsWith('\n') || !rawTranscript ? '' : ' ') +
                        emoji;
                      onChangeTranscript(updated);
                    }}
                    className="hover:scale-125 transition-transform p-0.5 rounded cursor-pointer"
                    title={`Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAnalyzeRawText}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors shadow-xs cursor-pointer"
                title="Analyze lines and convert into interactive tags"
              >
                <Tag className="w-3 h-3" />
                <span>Apply Tags</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  isDark
                    ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    : 'hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900'
                }`}
                title="Copy transcript"
              >
                {copied ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => onChangeTranscript('')}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  isDark
                    ? 'hover:bg-zinc-800 text-zinc-400 hover:text-rose-400'
                    : 'hover:bg-zinc-200 text-zinc-500 hover:text-rose-600'
                }`}
                title="Clear transcript"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <textarea
            id="textarea-transcript"
            value={rawTranscript}
            onChange={(e) => handleRawTextChange(e.target.value)}
            placeholder={`Me: Check this screenshot: <image attachment>\nAlex: Wow, that looks amazing!\nMe: ❤️`}
            className={`flex-1 w-full p-3.5 text-xs font-mono leading-relaxed bg-transparent resize-none focus:outline-none ${
              isDark
                ? 'text-zinc-200 placeholder-zinc-600'
                : 'text-zinc-800 placeholder-zinc-400'
            }`}
            spellCheck={false}
          />
        </div>
      )}

      {/* "MAKE BUBBLES" ACTION BAR (Clean button with in-button bubble animation) */}
      <div
        className={`relative border rounded-xl p-3 flex items-center justify-between gap-3 shadow-md ${
          isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
        }`}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-bold flex items-center gap-1.5 ${
                isDark ? 'text-zinc-100' : 'text-zinc-900'
              }`}
            >
              <span>WhatsApp Message Generator</span>
            </span>

            {/* Quota / Pending Status Badge */}
            {!subscription.isPro ? (
              <button
                type="button"
                onClick={onOpenUpgradeModal}
                className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 font-semibold hover:bg-amber-500/25 transition-colors cursor-pointer"
                title="Click to view upgrade options or enter promo code"
              >
                {Math.max(0, subscription.freeGenerationsLimit - subscription.freeGenerationsUsed)} free left
              </button>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 font-semibold">
                PRO Unlimited
              </span>
            )}

            {hasPendingChanges ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold">
                Ready to update
              </span>
            ) : (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                  isDark
                    ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    : 'bg-zinc-100 text-zinc-600 border-zinc-300'
                }`}
              >
                In Sync ({appliedMessageCount} msgs)
              </span>
            )}
          </div>
          <p className={`text-[11px] truncate ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {hasPendingChanges
              ? 'Click to compile dialogue and update WhatsApp view'
              : 'The WhatsApp view is currently in sync with your transcript'}
          </p>
        </div>

        {/* The "Make Bubbles" Action Button Container with in-place floating bubble animation */}
        <div className="relative flex-shrink-0">
          {isGenerating && <ButtonBubblesAnimation />}

          <button
            id="btn-make-bubbles"
            type="button"
            disabled={isGenerating}
            onClick={onMakeBubbles}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors shadow-md flex-shrink-0 cursor-pointer ${
              isGenerating
                ? 'bg-emerald-700 text-white cursor-wait opacity-90'
                : hasPendingChanges
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
                : isDark
                ? 'bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300'
            }`}
            title="Generate WhatsApp bubbles and update preview"
          >
            <MessageSquare className="w-4 h-4 text-emerald-300" />
            <span>{isGenerating ? 'Making bubbles...' : 'Make Bubbles!'}</span>
          </button>
        </div>
      </div>

      {/* Image attachment selection modal */}
      <ImageAttachmentModal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setTargetLineIndexForImage(null);
        }}
        onSelectTag={handleSelectImageTag}
      />
    </div>
  );
};
