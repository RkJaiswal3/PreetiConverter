import React, { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import Converter from "./components/Converter";
import History from "./components/History";
import { useSession } from "./hooks/useSession";
import { getStats } from "./utils/api";
import "./styles/globals.css";
import styles from "./App.module.css";

function App() {
  const sessionId = useSession();
  const [stats, setStats] = useState(null);
  const [historyKey, setHistoryKey] = useState(0);

  const fetchStats = useCallback(() => {
    getStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleConvertSuccess = () => {
    setHistoryKey((k) => k + 1);
    fetchStats();
  };

  return (
    <div className={styles.app}>
      <Header stats={stats} />

      <main className={styles.main}>
        <div className={styles.hero}>
          <h2 className={styles.heroTitle}>
            Convert Nepali Unicode
            <br />
            <span className={styles.heroAccent}>
              to Preeti font — instantly
            </span>
          </h2>
          <p className={styles.heroSub}>
            Used by newspapers, printers &amp; government offices across Nepal.
          </p>
        </div>

        <div className={styles.layout}>
          <div className={styles.converterCol}>
            <Converter
              sessionId={sessionId}
              onConvertSuccess={handleConvertSuccess}
            />
          </div>
          <div className={styles.historyCol}>
            <History sessionId={sessionId} refresh={historyKey} />
          </div>
        </div>

        <footer className={styles.footer}>
          <p>
            Built for Nepal's publishing industry ·
            <span className={styles.footerAccent}> Free &amp; open to use</span>
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
