# Decisionly — Personal Decision Intelligence Platform

> **"Your Life. Your Context. Your Decisions."**

Decisionly is a full-stack, AI-powered personal decision intelligence platform. It turns complex life and career crossroads into structured, transparent comparisons powered by deterministic Multi-Attribute Utility Theory (MAUT), user-approved personal context, and grounded AI language synthesis.

---

## 📸 Reference Designs & UI Architecture

High-resolution visual reference mockups and theme specifications are documented in:
[Decisionly Design Reference Guide](C:\Users\amish\.gemini\antigravity-ide\brain\452caad7-4582-431d-9310-6f8cb30fac9b\design_references.md)

1. **Landing & Authentication**: Split-screen glassmorphic design with instant 1-click Demo Account access.
2. **Decision Workspace (Dark Mode)**: Multi-criteria comparison matrix, deterministic score bars, grounded trade-offs, and what-if simulation sliders.
3. **Personal Space (Light Mode)**: Card-based library organizing long-term and temporary factors with review date indicators and switchable theme toggle.

---

## 🌟 Key Features

1. **Authentication & Data Isolation**
   - Secure sign-up, sign-in, session management with HTTP-only cookies and bearer fallback.
   - Strict server-side user scoping on every database query and transaction.
   - Fast 1-click demo login for immediate exploration.

2. **Private Personal Space**
   - Manage life background, goals, circumstances, preferences, constraints, responsibilities, and notes.
   - Categorize entries as long-term or temporary with review dates and automated alerts when review is due.
   - AI inferences are never silently turned into confirmed facts.

3. **Guided Decision Creation Wizard**
   - Step-by-step authoring: Situation & Desired Outcome, Alternatives, Criteria & Weights, Value Matrix, and Context Selection.
   - Save drafts at any stage without requiring an AI call.
   - Dedicated support for the **9 Target Categories**:
     - *Career*
     - *Finance* (with financial advisory safeguards)
     - *Health and Fitness* (with non-clinical guidance safeguards)
     - *Travel*
     - *Personal Development*
     - *Lifestyle*
     - *Relationships* (non-coercive personal decision guidance)
     - *Education*
     - *Custom* (with professional legal consultation reminders)

4. **Deterministic Scoring Engine**
   - Mathematical Multi-Attribute Utility Theory (MAUT) executed on the server/client domain layer—never hallucinated by an LLM.
   - Normalized weights ($\sum w_i = 1.0$).
   - Direction-aware normalization (`higher_better`, `lower_better` for costs/risks, and `judgment`).
   - Transparent handling of unknown values without zero-penalties.

5. **Explicit Context Consent & Snapshotting**
   - Suggests matching Personal Space items using semantic keyword and category heuristics.
   - Requires explicit per-entry user confirmation before data is processed.
   - Creates immutable context snapshots permanently preserved with each analysis.

6. **Grounded AI Analysis via Groq SDK**
   - Backend-only execution using official `groq-sdk` with strict Zod validation.
   - Comprehensive structured response: Executive Summary, Alternative Deep-Dives, Trade-offs, Grounded Risk Factors (with likelihood and basis), Uncertainties, Missing Information, Assumptions, and Follow-Up Questions.
   - Mandatory ethical disclaimer: *"This is decision support; you make the final choice."*

7. **What-If Simulation Sandbox**
   - Real-time sliders to adjust criteria weights and parameter assumptions.
   - Instant deterministic recalculations showing divergence from baseline without altering original records.
   - Optional AI sensitivity explanations and scenario persistence.

8. **Decision History & Outcome Retrospectives**
   - Searchable, filterable history across categories, statuses, and dates.
   - User-authored outcome logging: record real-life choice made, timestamp, and retrospective reflection.

9. **Privacy & Data Portability**
   - Full JSON export of all personal data via `/api/export`.
   - Irreversible account deletion with cascading cleanup via `/api/account`.

10. **Switchable Dark & Light Mode**
    - Seamless toggle with persistent preference in `localStorage`.
    - Fully styled for both deep contrast (Dark) and crisp readability (Light).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, TypeScript, Helmet, Cookie-Parser, Rate-Limiting
- **Database**: PostgreSQL (pg pool) with schema migrations + automatic local persistent store fallback
- **AI Engine**: Groq SDK (`groq-sdk`), Zod Schema Validation
- **Testing**: Vitest

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your variables:
```env
PORT=3000
SESSION_SECRET=your-random-session-secret-at-least-32-chars
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/decisionly
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

> **Note**: If `DATABASE_URL` is not provided in development, Decisionly automatically initializes a persistent local data store in `.data/decisionly_store.json`. It will seamlessly connect to PostgreSQL whenever a valid `DATABASE_URL` is set.
> **Note**: If `GROQ_API_KEY` is not set, Decisionly automatically activates its built-in local deterministic intelligence engine, ensuring zero crashes and full evaluation capabilities even offline.

### 3. Installation
```bash
npm install
```

### 4. Running the Application
Run both the Express backend and the Vite frontend simultaneously:
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000](http://localhost:3000)

### 5. Running Tests
```bash
npm test
```

---

## 🔒 Security & Privacy Architecture

- **No Secret Leaks**: `GROQ_API_KEY`, database credentials, and session secrets are kept strictly server-side.
- **Strict Authorization**: Every route resolves identity from a verified session cookie or bearer token. All database queries scope records by `user_id`.
- **Zod Validation**: All inbound payloads and outbound AI responses are strictly validated before persistence.
- **Zero Training**: User context is never used to train public machine learning models.

---

## 📄 License
MIT © 2026 Decisionly Team.
