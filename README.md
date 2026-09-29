# Decisionly 🧭
> **Like thinking through tough choices with a smart, caring friend who also does the math.**

Making big life choices—switching jobs, moving cities, or changing careers—is exhausting. You're overwhelmed by opinions, trapped in endless pros-and-cons lists, or getting generic advice from chatbots that don't know your real life.

**Decisionly** changes that. It listens to what’s stressing you out, helps you figure out what actually matters, and gives you an honest, clear recommendation grounded in your everyday reality.

---

## 💭 The Problem: Why Big Decisions Are Hard

- **Overthinking & Decision Paralysis**: When everything feels important, you freeze. Standard pros-and-cons lists treat "saves $50 a month" and "I’ll never see my family" like equal bullet points.
- **Chatbots Give Bland Answers**: Most AI tools reply with generic platitudes like *"it depends on your personal priorities"*, without taking a stance or remembering your daily constraints.
- **Spreadsheets Lack Soul**: Ranking options on a spreadsheet feels robotic and misses how a decision actually feels to live with day-to-day.

---

## 💡 The Solution: How Decisionly Helps

Decisionly combines **human empathy** with **smart decision science**:

1. **It Listens Like a Friend**: Instead of cold charts, Decisionly reflects back what it hears: *"It sounds like the higher salary is exciting, but being far from family is what's really keeping you up at night."*
2. **Asks the Right Questions**: Gives you 2–3 thought-provoking questions to help untangle your thoughts.
3. **Interactive Priority Pills**: Click on what matters most right now (e.g. *Career Growth*, *Family*, *Peace of Mind*) to immediately reshape the recommendation.
4. **Honest, Unfiltered Verdict**: Tells you plainly which option makes the most sense, points out the key trade-off, and suggests a concrete next step.
5. **Private & Safe**: Your background notes and personal constraints are stored safely on your machine and only used when you explicitly say so.

---

## ✨ What You Can Do

- 🎙️ **Speak Your Mind**: Too tired to type? Hit the microphone button to dictate your thoughts naturally.
- 🎯 **Choose What Matters**: Weigh salary, commute, daily peace, or long-term growth with simple sliders and tags.
- ⚖️ **See the Real Trade-Offs**: Clear breakdown of pros, cons, and hidden risks for each option.
- 📊 **Optional Deep Dive**: Expand the comparison matrix if you want to see the underlying scores and numbers.
- 🌿 **Warm, Calming Design**: Designed with soothing cream and forest green tones to calm decision anxiety—day or night.

---

## ⚡ Quick Start (Run Locally in 2 Minutes)

### 1. Get the Code
```bash
git clone https://github.com/AmishaOnMain/Decisionly.git
cd Decisionly
```

### 2. Install Packages
```bash
npm install
```

### 3. Add Your Keys
Create a file named `.env` in the root folder with:
```env
PORT=3000

# Google Gemini (for deep thinking)
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-2.5-flash

# Groq (instant fallback)
GROQ_API_KEY=your_groq_key
GROQ_MODEL=openai/gpt-oss-120b

# AssemblyAI (for voice dictation)
ASSEMBLYAI_API_KEY=your_assemblyai_key

SESSION_SECRET=super_secret_key_123
```

### 4. Start the App
```bash
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

> **Tip**: Click **"Use Instant Demo Space"** on the sign-in screen to try it immediately with realistic sample dilemmas!

---

## 🧰 How It's Built

- **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js, Express, TypeScript
- **AI Brain**: Google Gemini 2.5 Flash + Groq backup
- **Voice**: AssemblyAI Speech-to-Text
- **Data**: Lightweight local storage (no heavy database setup required)

---

## 💌 Made For
Anyone standing at a crossroads who just needs clarity, calm, and a grounded path forward.
