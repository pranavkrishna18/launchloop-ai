# LaunchLoop AI — 3-Minute Video Demonstration Script

**Title:** LaunchLoop AI: Engineering-Driven Student Acquisition & Viral Referral Engine  
**Target Duration:** Exactly 3 minutes (180 seconds)  
**Presenter:** Growth Engineering Candidate  
**Context:** NxtWave Growth Intern Challenge — "Build Your First AI Project in 60 Minutes" (Goal: 500 final-year registrations in 7 days, ₹2,000 budget).

---

## Visual & Speaking Timeline

### 0:00 – 0:25 (25s) | Campaign Problem & Product Overview
- **Visual:** Open browser on `http://localhost:5173`. Show the hero title: *"Discover Your First AI Project in 60 Seconds"* with the sleek dark glassmorphic UI.
- **Presenter (Natural & Confident):**
  > "Hello! Today, I'm presenting **LaunchLoop AI**, an AI-powered student acquisition platform engineered for NxtWave's free online workshop: *'Build Your First AI Project in 60 Minutes'*.
  >
  > Our challenge is ambitious: acquire **500 verified final-year engineering students in 7 days with just ₹2,000**. Generic social ads would cost ₹50 per student and exhaust our budget in hours. 
  >
  > Instead, LaunchLoop turns the learning value proposition into a viral loop: an **AI Project Magnet** hooks the student, a frictionless registration assigns a **unique referral link**, and an **evidence-based AI Growth Intelligence engine** guides the organizers."

---

### 0:25 – 0:55 (30s) | The AI Project Magnet (Interactive Entry Hook)
- **Visual:** Click on the profile fields in the AI Project Magnet.
  - Interests: Select *"Computer Vision"* & *"Generative AI"*.
  - Skill level: Select *"Beginner"*.
  - Technologies: Select *"Python"* & *"OpenCV"*.
  - Career Goal: Type *"Clear campus placement technical round with a working AI capstone"*.
  - Click **"Architect My 60-Minute AI Project"**. Show the instant generation response.
- **Presenter:**
  > "Instead of asking students to fill a boring form, we give them immediate value with the **AI Project Magnet**.
  >
  > Built on FastAPI with Google's Gemini Flash model, it analyzes their exact technical background. Notice what it delivers: a tailored project title, a clear problem statement, why it matches their career goals, and **exactly three sequential steps** buildable in 60 minutes.
  >
  > If the AI provider is offline or rate-limited, our backend seamlessly activates a verified 15-item curated fallback catalogue with sub-millisecond latency—guaranteeing zero student drop-off."

---

### 0:55 – 1:25 (30s) | Registration & Viral Referral Loop
- **Visual:** Click **"Register for Workshop with this Project"**.
  - Notice the project technologies are pre-filled in the registration form.
  - Enter test student: `Aarav Sharma`, `aarav@iitm.ac.in`, `IIT Madras`, `2026`.
  - Click **"Confirm Workshop Registration (Free)"**.
  - Show the **Success Modal** with personalized referral code (`NXTAAR01`) and 1-click **WhatsApp** and **LinkedIn** share buttons.
  - Switch to **"My Referral Hub"** tab; show verified referral count, conversion rate, and milestone tier progress (Priority Q&A, AI Starter Kit).
- **Presenter:**
  > "Clicking register carries their project context directly into the registration flow. 
  >
  > Submitting persists the registration to Supabase, enforces duplicate checks, and instantly provisions an 8-character referral code with a private student access token.
  >
  > With 1 click, the student can share a pre-composed message with their project partners on WhatsApp. When peers register through that link, our backend logs the click using a privacy-preserving salted SHA-256 IP hash and attributes the conversion to the advocate without ever allowing self-referrals."

---

### 1:25 – 2:05 (40s) | Organizer Analytics & Target Tracking
- **Visual:** Click on the **"Organizer"** tab in navigation.
  - Enter development passkey: `dev-demo-admin-passkey-change-me` (or show authenticated session).
  - Show the 4 KPI cards: Authentic Registrations, Progress toward 500, Referral Conversion Rate, and Budget Allocation per student.
  - Point to the **Daily Registration Trend Chart** (toggle Daily vs. Cumulative) and the **Channel Attribution Breakdown** (WhatsApp, LinkedIn, Referral, Direct).
- **Presenter:**
  > "Now let's switch to the protected **Organizer Analytics Dashboard**.
  >
  > Notice the security: this route requires verified administrator authorization and is inaccessible to public users.
  >
  > The dashboard tracks our live KPIs in real-time: authentic registrations strictly excluding seed records, pace toward 500, and our budget allocation ceiling against our ₹2,000 budget. 
  >
  > We see our daily registration velocity, channel distribution across WhatsApp and LinkedIn, and the full viral conversion funnel from initial link click down to active student advocates."

---

### 2:05 – 2:35 (30s) | AI Growth Intelligence Engine
- **Visual:** Scroll down to the **"AI Growth Intelligence Engine"** panel.
  - Click **"Generate AI Growth Recommendations"**.
  - Display the generated recommendation cards:
    - Card 1: *Cold-Start Experiment: Activate Department WhatsApp Placement Groups*.
    - Point out the **Measured Telemetry Evidence**, **Proposed Tactical Action**, **Effort Badge**, and **Expected Impact Hypothesis**.
- **Presenter:**
  > "Here is our core innovation: **AI Growth Intelligence**.
  >
  > Rather than relying on generic guesswork, organizers click one button. The backend sanitizes our telemetry—stripping all student identities to guarantee zero PII transmission—and prompts Gemini to evaluate our conversion funnel.
  >
  > Notice the discipline: every recommendation cites real measured telemetry, proposes a low-cost tactical intervention, labels expected impact as a testable hypothesis, and explicitly states confidence limitations."

---

### 2:35 – 3:00 (25s) | Growth Execution, Lessons & Closing
- **Visual:** Show the live **Leaderboard** tab, highlighting anonymized campus advocates (`Aarav S.`, `IIT Madras`). Scroll to the bottom footer: *"Goal: 500 Final-Year Engineering Registrations in 7 Days (₹2,000 Budget)"*.
- **Presenter:**
  > "To reach 500 students, our growth plan combines 20 campus ambassadors across college placement groups, an incentivized peer referral loop, and targeted ₹500 story ads for final urgency.
  >
  > LaunchLoop AI bridges product engineering, data privacy, and growth marketing into an integrated system that can realistically achieve NxtWave's challenge.
  >
  > Thank you!"

---

## Backup Demonstration Plan (Contingency Protocol)

If any external cloud dependency experiences network latency or downtime during the recording:
1. **If Google Gemini API is unconfigured/offline:** The AI Project Magnet seamlessly serves its curated 15-item blueprint catalogue with verified steps, and the AI Growth Intelligence engine displays its rule-based heuristic diagnostic. State clearly: *"Notice how our backend detects the offline state and transparently serves a deterministic fallback without breaking the user experience."*
2. **If Supabase database is offline/pending:** The application safely displays the *"Schema Pending"* guidance indicator with zero crashes. You can demonstrate the full UI workflows and highlight our 63 automated unit and integration tests passing in 6 seconds.
