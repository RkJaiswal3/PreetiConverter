import React, { useState, useRef, useCallback } from "react";
import styles from "./Converter.module.css";
import { convertText } from "../utils/api";

const MODES = [
  {
    id: "unicode-to-preeti",
    label: "Unicode → Preeti",
    inputLang: "Unicode Nepali",
    outputLang: "Preeti Font",
    inputFont: "unicodeFont", // input = Unicode → use Devanagari font
    outputFont: "preetiFont", // output = Preeti  → use Preeti font
    inputBadge: "Unicode",
    outputBadge: "Preeti",
  },
  {
    id: "preeti-to-unicode",
    label: "Preeti → Unicode",
    inputLang: "Preeti Font",
    outputLang: "Unicode Nepali",
    inputFont: "preetiFont", // input = Preeti   → use Preeti font
    outputFont: "unicodeFont", // output = Unicode → use Devanagari font
    inputBadge: "Preeti",
    outputBadge: "Unicode",
  },
];

const Converter = ({ sessionId, onConvertSuccess }) => {
  const [mode, setMode] = useState("unicode-to-preeti");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [meta, setMeta] = useState(null);
  const toastTimer = useRef(null);
  const autoTimer = useRef(null);

  const activeMode = MODES.find((m) => m.id === mode);

  const showToast = (msg, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(""), 2500);
  };

  const handleConvert = useCallback(
    async (text = inputText) => {
      if (!text.trim()) return;
      setLoading(true);
      setError("");
      try {
        const data = await convertText({ text, mode, session_id: sessionId });
        setOutputText(data.output);
        setMeta({ chars: data.char_count, words: data.word_count });
        onConvertSuccess?.();
      } catch (err) {
        const msg =
          err.response?.data?.error ||
          "Conversion failed. Is the server running?";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [inputText, mode, sessionId, onConvertSuccess],
  );

  const handleInput = (e) => {
    const val = e.target.value;
    setInputText(val);
    setError("");
    if (val.length > 0 && val.length < 1000) {
      clearTimeout(autoTimer.current);
      autoTimer.current = setTimeout(() => handleConvert(val), 400);
    }
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setInputText("");
    setOutputText("");
    setMeta(null);
    setError("");
  };

  const handleSwap = () => {
    const newMode =
      mode === "unicode-to-preeti" ? "preeti-to-unicode" : "unicode-to-preeti";
    setMode(newMode);
    setInputText(outputText);
    setOutputText(inputText);
  };

  const copyOutput = async () => {
    if (!outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      showToast("Copied to clipboard!");
    } catch {
      showToast("Copy failed — select & copy manually.", "error");
    }
  };

  const downloadOutput = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: "text/plain; charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `preeti-converted-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded!");
  };

  const clearAll = () => {
    setInputText("");
    setOutputText("");
    setMeta(null);
    setError("");
  };

  return (
    <div className={styles.wrapper}>
      {/* Mode Tabs */}
      <div className={styles.modeTabs} role="tablist">
        {MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            className={`${styles.modeTab} ${mode === m.id ? styles.activeTab : ""}`}
            onClick={() => handleModeSwitch(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Editor Grid */}
      <div className={styles.editorGrid}>
        {/* ── Input Panel ── */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelLabel}>{activeMode.inputLang}</span>
            <div className={styles.panelActions}>
              <button
                className={styles.iconBtn}
                onClick={clearAll}
                title="Clear all"
                aria-label="Clear all"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* textarea font switches based on mode */}
          <textarea
            className={`${styles.textarea} ${styles[activeMode.inputFont]}`}
            value={inputText}
            onChange={handleInput}
            placeholder={
              mode === "unicode-to-preeti"
                ? "यहाँ युनिकोड नेपाली टाइप वा पेस्ट गर्नुहोस्…"
                : "Paste Preeti font text here…"
            }
            aria-label="Input text"
            spellCheck={false}
          />

          <div className={styles.panelFooter}>
            <span className={styles.charInfo}>{inputText.length} chars</span>
            <span className={styles.fontBadge}>{activeMode.inputBadge}</span>
          </div>
        </div>

        {/* ── Swap Button ── */}
        <div className={styles.swapWrap}>
          <button
            className={styles.swapBtn}
            onClick={handleSwap}
            title="Swap direction"
            aria-label="Swap input and output"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M7 16V4m0 0L3 8m4-4l4 4" />
              <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </button>
        </div>

        {/* ── Output Panel ── */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelLabel}>{activeMode.outputLang}</span>
            <div className={styles.panelActions}>
              <button
                className={styles.iconBtn}
                onClick={copyOutput}
                title="Copy output"
                aria-label="Copy output"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
              <button
                className={styles.iconBtn}
                onClick={downloadOutput}
                title="Download .txt"
                aria-label="Download as text file"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            </div>
          </div>

          {/* output font switches based on mode */}
          <div
            className={`${styles.outputArea} ${styles[activeMode.outputFont]}`}
            aria-live="polite"
            aria-label="Converted output"
          >
            {loading ? (
              <span className={styles.loadingDots}>
                Converting<span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            ) : (
              outputText || (
                <span className={styles.placeholder}>
                  Converted text will appear here…
                </span>
              )
            )}
          </div>

          <div className={styles.panelFooter}>
            <span className={styles.charInfo}>
              {meta ? `${meta.chars} chars · ${meta.words} words` : ""}
            </span>
            <span className={styles.fontBadge}>{activeMode.outputBadge}</span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className={styles.errorBanner} role="alert">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Convert Button */}
      <button
        className={styles.convertBtn}
        onClick={() => handleConvert()}
        disabled={loading || !inputText.trim()}
        aria-label="Convert text"
      >
        {loading ? "Converting…" : "Convert"}
        {!loading && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        )}
      </button>

      {/* Toast */}
      {toast && (
        <div
          className={`${styles.toast} ${toast.type === "error" ? styles.toastError : ""}`}
          role="status"
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default Converter;
