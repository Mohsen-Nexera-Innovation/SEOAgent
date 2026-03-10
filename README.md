# AI SEO Agent – MVP

This repository implements the **Cursor AI SEO Agent Guide** found in `CURSOR_AI_SEO_AGENT_GUIDE.md`.

It is a small MVP that lets you:

- Enter **dynamic keywords** from the UI
- Run placeholder **keyword research**
- Trigger an **AI-style SEO workflow** via chat
- View **keyword clusters** in a results table
- Export results to an **Excel file**

## Folder structure

- `frontend/` – Next.js 14 app (React, TailwindCSS)
  - `app/page.tsx` – main dashboard
  - `components/KeywordInput.tsx`
  - `components/ResultsTable.tsx`
  - `components/ChatUI.tsx`
  - `components/ExportButton.tsx`
- `backend/` – Node.js + Express API
  - `server.ts` – API endpoints
  - `agent/` – master, keyword, competitor, content planner agents
  - `services/` – keyword, competitor, SERP services
  - `utils/excelExporter.ts` – Excel export logic
- `.cursor/skills/` – Cursor skills for SEO workflows

## Running the backend

```bash
cd backend
npm install
# copy env template and add your own key (do NOT commit .env)
cp .env.example .env
# then edit .env and set OPENAI_API_KEY and optional OPENAI_MODEL
npm run dev
```

The backend listens on `http://localhost:4000`.

## Running the frontend

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Notes

- All keywords are **runtime data** coming from the UI or chat; nothing is hardcoded.
- The SEO logic is intentionally simple and mock-based so you can swap in real SEO APIs (SERP, keyword data, etc.) later.
- Excel exports are written to `backend/exports/seo-results.xlsx` by default.

