import React, { useEffect, useState } from "react";
import { getHistory } from "../utils/api";
import styles from "./History.module.css";

const History = ({ sessionId, refresh }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    getHistory(sessionId)
      .then((d) => setItems(d.history || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [sessionId, refresh]);

  const fmt = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sideHeader}>
        <span className={styles.sideTitle}>Recent</span>
        <span className={styles.count}>{items.length}</span>
      </div>

      {loading && <div className={styles.empty}>Loading…</div>}

      {!loading && items.length === 0 && (
        <div className={styles.empty}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ opacity: 0.3 }}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <p>No conversions yet</p>
        </div>
      )}

      <div className={styles.list}>
        {items.map((item) => (
          <div key={item.id} className={styles.item}>
            <div className={styles.itemMeta}>
              <span className={styles.modePill}>
                {item.mode === "unicode-to-preeti" ? "U→P" : "P→U"}
              </span>
              <span className={styles.itemTime}>{fmt(item.created_at)}</span>
            </div>
            <div
              className={styles.itemPreview}
              style={{
                fontFamily:
                  item.mode === "unicode-to-preeti" ? "inherit" : "Preeti",
              }}
            >
              {item.input_text.substring(0, 60)}
              {item.input_text.length > 60 ? "…" : ""}
            </div>
            <div className={styles.itemStats}>
              {item.char_count} chars · {item.word_count} words
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default History;
