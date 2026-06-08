/**
 * Unicode ↔ Preeti Conversion Engine
 * Production version with correct ि (i-matra) handling
 */

// ─── UNICODE → PREETI MAP ────────────────────────────────────────────────────

const UNICODE_TO_PREETI = {
  // Independent vowels
  'अ': 'c', 'आ': 'cf', 'इ': 'O', 'ई': 'O{',
  'उ': 'p', 'ऊ': 'pm', 'ए': 'P', 'ऐ': 'P]',
  'ओ': 'cf]', 'औ': 'cf}',

  // Matras (vowel signs)
  // NOTE: ि is NOT here — handled separately in the loop
  'ा': 'f',
  'ी': 'L',
  'ु': "'",
  'ू': '"',
  'ृ': '[',
  'े': ']',
  'ै': '}',
  'ो': 'f]',
  'ौ': 'f}',

  // Nasal / breathing marks
  'ं': '+',
  'ः': ',',
  'ँ': 'F',

  // Halanta (virama — joins consonants)
  '्': '\\',

  // Consonants
  'क': 's', 'ख': 'v', 'ग': 'u', 'घ': '3', 'ङ': 'ª',
  'च': 'r', 'छ': '5', 'ज': 'h', 'झ': '´', 'ञ': '`',
  'ट': '6', 'ठ': '7', 'ड': '8', 'ढ': '9', 'ण': '0',
  'त': 't', 'थ': 'y', 'द': 'b', 'ध': 'w', 'न': 'g',
  'प': 'k', 'फ': 'km', 'ब': 'a', 'भ': 'e', 'म': 'd',
  'य': 'o', 'र': '/', 'ल': 'n', 'व': 'j',
  'श': 'z', 'ष': 'if', 'स': ';', 'ह': 'x',

  // Special conjuncts (must be checked BEFORE individual chars)
  'क्ष': 'If',
  'त्र': 'q',
  'ज्ञ': '1',
  'श्र': 'Zo',

  // Punctuation & numbers
  '।': '.',
  '॥': '..',
  '०': ')', '१': '!', '२': '@', '३': '#', '४': '$',
  '५': '%', '६': '^', '७': '&', '८': '*', '९': '(',

  // Invisible characters — strip them
  '\u200c': '',
  '\u200d': '',
};

// ─── PREETI → UNICODE MAP (auto-reversed) ───────────────────────────────────

const PREETI_TO_UNICODE = {
  // Manually defined (longer keys first to avoid conflicts)
  'cf]': 'ओ', 'cf}': 'औ', 'cf': 'आ',
  'O{': 'ई', 'O': 'इ',
  'pm': 'ऊ', 'p': 'उ',
  'P]': 'ऐ', 'P': 'ए',
  'km': 'फ', 'If': 'क्ष', 'if': 'ष',
  'Zo': 'श्र',
  'f]': 'ो', 'f}': 'ौ', 'f': 'ा',
  'l': 'ि', 'L': 'ी',
  "'": 'ु', '"': 'ू',
  '[': 'ृ', ']': 'े', '}': 'ै',
  '+': 'ं', ',': 'ः', 'F': 'ँ',
  '\\': '्',
  's': 'क', 'v': 'ख', 'u': 'ग', '3': 'घ', 'ª': 'ङ',
  'r': 'च', '5': 'छ', 'h': 'ज', '´': 'झ', '`': 'ञ',
  '6': 'ट', '7': 'ठ', '8': 'ड', '9': 'ढ', '0': 'ण',
  't': 'त', 'y': 'थ', 'b': 'द', 'w': 'ध', 'g': 'न',
  'k': 'प', 'a': 'ब', 'e': 'भ', 'd': 'म',
  'o': 'य', '/': 'र', 'n': 'ल', 'j': 'व',
  'z': 'श', ';': 'स', 'x': 'ह',
  'q': 'त्र', '1': 'ज्ञ',
  '.': '।',
  ')': '०', '!': '१', '@': '२', '#': '३', '$': '४',
  '%': '५', '^': '६', '&': '७', '*': '८', '(': '९',
};

// I_MATRA unicode codepoint
const I_MATRA = 'ि'; // U+093F

// ─── UNICODE → PREETI ────────────────────────────────────────────────────────

function unicodeToPreeti(text) {
  if (!text) return '';

  const chars = [...text]; // spread handles multi-byte unicode properly
  let result = '';
  let i = 0;

  while (i < chars.length) {
    const ch = chars[i];

    // ── RULE 1: ि (i-matra) must be placed BEFORE its consonant in Preeti ──
    // In Unicode:  consonant + ि  (e.g. न + ि = नि)
    // In Preeti:   l + consonant  (e.g. l + g = lg)
    // So when we see ि, we insert 'l' then go back and re-check the char
    // Actually: when we see a consonant followed by ि, we output 'l' FIRST
    // then the consonant.
    // Check: is the NEXT char ि?
    if (chars[i + 1] === I_MATRA) {
      // Try 3-char conjunct first (e.g. क्ष + ि)
      const three = ch + (chars[i + 1] || '') + (chars[i + 2] || '');
      const two = ch + (chars[i + 1] || '');

      // Check if current char is part of a conjunct with ि
      // e.g. क् + ष + ि — but ि follows the full conjunct
      // So: skip ि handling here, handle at conjunct level
      // Simple case: single consonant + ि
      const consonantPreeti = UNICODE_TO_PREETI[ch];
      if (consonantPreeti !== undefined) {
        // Output: 'l' + consonant_preeti
        result += 'l' + consonantPreeti;
        i += 2; // skip consonant AND ि
        continue;
      }
    }

    // ── RULE 2: Check 3-char sequences (conjuncts like क्ष) ──
    const three = ch + (chars[i + 1] || '') + (chars[i + 2] || '');
    if (UNICODE_TO_PREETI[three] !== undefined) {
      // Check if ि follows this conjunct
      if (chars[i + 3] === I_MATRA) {
        result += 'l' + UNICODE_TO_PREETI[three];
        i += 4;
        continue;
      }
      result += UNICODE_TO_PREETI[three];
      i += 3;
      continue;
    }

    // ── RULE 3: Check 2-char sequences ──
    const two = ch + (chars[i + 1] || '');
    if (UNICODE_TO_PREETI[two] !== undefined) {
      result += UNICODE_TO_PREETI[two];
      i += 2;
      continue;
    }

    // ── RULE 4: ि alone (no preceding consonant found above) ──
    if (ch === I_MATRA) {
      result += 'l';
      i++;
      continue;
    }

    // ── RULE 5: Single character ──
    if (UNICODE_TO_PREETI[ch] !== undefined) {
      result += UNICODE_TO_PREETI[ch];
    } else {
      result += ch; // unknown chars pass through as-is
    }
    i++;
  }

  return result;
}

// ─── PREETI → UNICODE ────────────────────────────────────────────────────────

function preetToUnicode(text) {
  if (!text) return '';

  // Sort keys longest-first so longer sequences match before shorter ones
  const keys = Object.keys(PREETI_TO_UNICODE).sort((a, b) => b.length - a.length);

  let result = '';
  let i = 0;

  while (i < text.length) {
    let matched = false;

    for (const key of keys) {
      if (text.startsWith(key, i)) {
        const unicodeChar = PREETI_TO_UNICODE[key];

        // Fix ि position: in Preeti 'l' comes before consonant
        // In Unicode ि comes AFTER consonant
        // So when we see 'l', peek at next chars to get the consonant first
        if (key === 'l') {
          // Find what consonant follows
          let nextMatched = false;
          for (const k2 of keys) {
            if (k2 !== 'l' && text.startsWith(k2, i + 1)) {
              result += PREETI_TO_UNICODE[k2] + 'ि';
              i += 1 + k2.length;
              nextMatched = true;
              break;
            }
          }
          if (!nextMatched) {
            result += 'ि';
            i += 1;
          }
          matched = true;
          break;
        }

        result += unicodeChar;
        i += key.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      result += text[i];
      i++;
    }
  }

  return result;
}

// ─── WORD COUNT ───────────────────────────────────────────────────────────────

function countWords(text) {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

module.exports = { unicodeToPreeti, preetToUnicode, countWords };