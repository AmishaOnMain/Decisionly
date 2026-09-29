# Decisionly 🧭
> **A thoughtful, context-aware decision intelligence platform designed to help you think through life and career crossroads like a wise friend.**

---

## 📌 Problem Statement

Every day, people face high-stakes life decisions—such as changing careers, relocating, balancing relationships, or making major purchases. 
Traditional approaches fall short:
- **Decision Paralysis & Cognitive Overload**: Pros-and-cons lists fail to capture nuanced weights, personal values, and everyday trade-offs.
- **Generic AI Hallucinations**: Standard chatbots offer surface-level advice with generic summaries, ignoring individual personal context, daily constraints, and mathematical objectivity.
- **Lack of Transparency**: Most tools either force rigid spreadsheets without intuition or black-box AI responses without verifiable reasoning.

---

## 💡 Solution

**Decisionly** bridges human empathy with structured decision science:
1. **Conversational "Think Together" Interface**: Instead of cold data tables, Decisionly speaks like an honest, trusted friend—reflecting back what it hears, asking clarifying questions, and pinpointing core tensions.
2. **Deterministic Mathematical Grounding**: Multi-Attribute Utility Theory (MAUT) computes objective scores, normalized weights, and rank orders without LLM hallucinations.
3. **Multi-Model Intelligence with Automatic Fallback**:
   - **Primary**: Google Gemini 2.5 Flash (`gemini-2.5-flash`)
   - **Secondary**: Groq Llama 3 / GPT-OSS (`openai/gpt-oss-120b`)
   - **Tertiary**: Local Zero-Failure Deterministic Engine
4. **Voice-First Input**: Integrated AssemblyAI speech-to-text allowing users to speak their reflections freely.
5. **Private Personal Context Space**: Stores persistent values, goals, and constraints with strict consent gating—no context is ever used without your explicit approval.

---

## ✨ Features

- **Warm Editorial UI**: Curated warm cream `#F5F0E8` palette, forest green accents, Playfair Display typography, and fluid responsive design (Light & Dark modes).
- **Interactive Decision Workspace**:
  - **What I'm Hearing**: Empathic summary of the core dilemma.
  - **Questions to Ask Yourself**: Numbered thought prompts tailored to the situation.
  - **Selectable Priority Pills**: Interactive value tags (*"Career Growth"*, *"Family & Friends"*, *"Daily Comfort"*) with micro-animations.
  - **My Honest Suggestion**: Actionable bottom-line verdict with key trade-offs and concrete next steps.
  - **Deeper Breakdown**: Per-option advantages/drawbacks, risk likelihoods, and follow-up considerations.
  - **Optional Technical Matrix**: Mathematical comparison table for users who want raw scores.
- **Voice Dictation**: One-click microphone recording powered by AssemblyAI and Web Speech API.
- **Personal Space**: Persistent catalog of personal principles, constraints, and long-term goals.
- **Instant Demo Account**: 1-click sandbox access to explore pre-loaded sample decisions instantly.

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js, Express, TypeScript, tsx
- **AI & Speech**:
  - Google Gemini API (`gemini-2.5-flash`)
  - Groq SDK (`openai/gpt-oss-120b`)
  - AssemblyAI (Voice Transcription)
- **Validation & State**: Zod schema validation, local persistent JSON store

---

## 🚀 Installation Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/AmishaOnMain/Decisionly.git
cd Decisionly
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root:
```env
PORT=3000
NODE_ENV=development

# Google Gemini API (Primary Engine)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Groq API (Secondary Fallback Engine)
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b

# AssemblyAI (Voice Dictation)
ASSEMBLYAI_API_KEY=your_assemblyai_api_key

# Security & Session
SESSION_SECRET=your_random_secret_string
```

### 4. Run the Development Server
```bash
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`

### 5. Instant Exploration
Navigate to `http://localhost:5173`, click **Sign in**, and choose **"Use Instant Demo Space"** to test immediately without manual setup.
