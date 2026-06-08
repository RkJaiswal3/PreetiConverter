const { query } = require('../db/pool');
const { unicodeToPreeti, preetToUnicode, countWords } = require('../utils/converter');

const convert = async (req, res) => {
  const { text, mode = 'unicode-to-preeti', session_id } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required.' });
  }
  if (text.length > 50000) {
    return res.status(400).json({ error: 'Text too long. Max 50,000 characters.' });
  }

  let output;
  if (mode === 'unicode-to-preeti') {
    output = unicodeToPreeti(text);
  } else if (mode === 'preeti-to-unicode') {
    output = preetToUnicode(text);
  } else {
    return res.status(400).json({ error: 'Invalid mode. Use unicode-to-preeti or preeti-to-unicode.' });
  }

  const charCount = text.length;
  const wordCount = countWords(text);
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

  try {
    const result = await query(
      `INSERT INTO conversions (session_id, input_text, output_text, mode, char_count, word_count, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, created_at`,
      [session_id || null, text, output, mode, charCount, wordCount, ip]
    );

    // Upsert daily stats
    await query(
      `INSERT INTO stats (date, total_conversions, total_characters)
       VALUES (CURRENT_DATE, 1, $1)
       ON CONFLICT (date)
       DO UPDATE SET
         total_conversions = stats.total_conversions + 1,
         total_characters = stats.total_characters + $1`,
      [charCount]
    );

    return res.json({
      id: result.rows[0].id,
      input: text,
      output,
      mode,
      char_count: charCount,
      word_count: wordCount,
      created_at: result.rows[0].created_at,
    });
  } catch (err) {
    console.error('DB error during convert:', err.message);
    // Still return result even if DB fails
    return res.json({ output, mode, char_count: charCount, word_count: wordCount });
  }
};

const getHistory = async (req, res) => {
  const { session_id } = req.params;
  if (!session_id) return res.status(400).json({ error: 'Session ID required.' });

  try {
    const result = await query(
      `SELECT id, input_text, output_text, mode, char_count, word_count, created_at
       FROM conversions
       WHERE session_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [session_id]
    );
    return res.json({ history: result.rows });
  } catch (err) {
    console.error('DB error fetching history:', err.message);
    return res.status(500).json({ error: 'Failed to fetch history.' });
  }
};

const getStats = async (req, res) => {
  try {
    const today = await query(
      `SELECT total_conversions, total_characters FROM stats WHERE date = CURRENT_DATE`
    );
    const total = await query(
      `SELECT SUM(total_conversions)::int as total_all, SUM(total_characters)::bigint as chars_all FROM stats`
    );
    return res.json({
      today: today.rows[0] || { total_conversions: 0, total_characters: 0 },
      all_time: total.rows[0] || { total_all: 0, chars_all: 0 },
    });
  } catch (err) {
    console.error('Stats error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch stats.' });
  }
};

module.exports = { convert, getHistory, getStats };