import React from 'react';
import styles from './Header.module.css';

const Header = ({ stats }) => {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoNep}>प्र</span>
          </div>
          <div>
            <h1 className={styles.name}>PreetiConverter</h1>
            <p className={styles.tagline}>Unicode ↔ Preeti · Nepali Font Tool</p>
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statChip}>
            <span className={styles.statNum}>
              {stats?.today?.total_conversions?.toLocaleString() ?? '—'}
            </span>
            <span className={styles.statLabel}>today</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.statChip}>
            <span className={styles.statNum}>
              {stats?.all_time?.total_all?.toLocaleString() ?? '—'}
            </span>
            <span className={styles.statLabel}>total</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
