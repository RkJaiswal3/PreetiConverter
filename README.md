<div align="center">

# 🇳🇵 PreetiConverter

**Unicode ↔ Preeti Nepali Font Converter**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-brightgreen)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://postgresql.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Free, open-source tool used by Nepali newspapers, printers, and government offices to convert between modern Unicode and legacy Preeti font encoding.

</div>

---

## What is this?

Many Nepali newspapers and government offices still use the **Preeti font** from the 1990s. Modern computers use **Unicode**. This tool converts between them instantly.

| Format  | Example stored | What you see                    |
| ------- | -------------- | ------------------------------- |
| Unicode | नमस्ते नेपाल   | नमस्ते नेपाल                    |
| Preeti  | gd:St] g]kfn   | नमस्ते नेपाल (with Preeti font) |

## Features

- 🔄 Two-way conversion — Unicode → Preeti and Preeti → Unicode
- ⚡ Auto-converts as you type
- 👁 Live preview of Preeti output
- 📋 One-click copy and download
- 🕐 Conversion history per session
- 📊 Daily and all-time stats
- 🐳 Docker support

## Tech Stack

| Layer    | Technology            |
| -------- | --------------------- |
| Frontend | React 18, CSS Modules |
| Backend  | Node.js, Express      |
| Database | PostgreSQL 16         |

---

## Getting Started

### Option 1 — Docker (easiest)

```bash
git clone https://github.com/YOUR_USERNAME/PreetiConverter.git
cd PreetiConverter
docker-compose up --build
```

Then create the database tables:

```bash
# Connect to the database
docker exec -it preeti_db psql -U postgres -d preeti_converter

# Run this SQL inside psql to create tables
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(64),
  input_text TEXT NOT NULL,
  output_text TEXT NOT NULL,
  mode VARCHAR(20) NOT NULL DEFAULT 'unicode-to-preeti',
  char_count INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stats (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE DEFAULT CURRENT_DATE,
  total_conversions INTEGER DEFAULT 0,
  total_characters BIGINT DEFAULT 0
);

# Exit psql
\q
```

Open `http://localhost:3000`

### Option 2 — Manual

**Requirements:** Node.js 18+, PostgreSQL 14+

```bash
git clone https://github.com/YOUR_USERNAME/PreetiConverter.git
cd PreetiConverter
```

**Backend:**

```bash
cd backend
cp .env.example .env        # then edit .env with your DB password
npm install
npm run dev                 # runs on port 5000
```

**Frontend** (new terminal):

```bash
cd frontend
cp .env.example .env
npm install
npm start                   # runs on port 3000
```

---

## Environment Variables

**backend/.env** (for manual/local setup — Docker sets this automatically)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/preeti_converter
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**frontend/.env**

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## API

| Method | Endpoint                   | Description         |
| ------ | -------------------------- | ------------------- |
| POST   | `/api/convert`             | Convert text        |
| GET    | `/api/history/:session_id` | Get session history |
| GET    | `/api/stats`               | Get usage stats     |
| GET    | `/api/health`              | Health check        |

**Convert example:**

```json
POST /api/convert
{
  "text": "नमस्ते",
  "mode": "unicode-to-preeti"
}
```

---

## Project Structure

```
preeti-converter/
├── backend/
│   └── src/
│       ├── controllers/    # Request handlers
│       ├── db/             # PostgreSQL setup
│       ├── routes/         # API routes
│       └── utils/
│           └── converter.js  # Core conversion engine
├── frontend/
│   └── src/
│       ├── components/     # React UI components
│       ├── hooks/          # Custom React hooks
│       └── utils/          # API helpers
└── docker-compose.yml
```

---

## Contributing

Pull requests are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT — free to use, modify, and distribute. See [LICENSE](LICENSE).

---

<div align="center">
Made with ❤️ for Nepal 🇳🇵 — if this helped you, please ⭐ star the repo!
</div>
