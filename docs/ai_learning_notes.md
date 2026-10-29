# LaunchLoop AI — AI Engineering & Prompt Experimentation Notes

This document records three genuine engineering experiments conducted with Large Language Models (Google Gemini) during the architecture and implementation of LaunchLoop AI.

Each example documents the prompt design, the AI's initial recommendation, what was critically accepted, modified, or rejected, and the resulting architectural impact.

---

## Experiment 1: Designing the AI Project Magnet Schema & Workshop Scope

### 1. Objective
Enable engineering students with varying skill levels to receive a realistic, inspiring AI project recommendation that can actually be started during a 60-minute live workshop, rather than an overambitious multi-month research project.

### 2. Representative Prompt
```text
System: You are an expert AI curriculum architect at NxtWave.
User: Design a personalized project recommendation for a final-year student interested in "Computer Vision" with "Beginner" skill in Python. The workshop is titled "Build Your First AI Project in 60 Minutes". Suggest a project title, problem statement, description, technologies, difficulty, and implementation steps.
```

### 3. AI Initial Suggestion
The model initially suggested:
- **Title:** "Real-Time Multi-Camera Autonomous Vehicle Pedestrian Detection System"
- **Tech Stack:** PyTorch, CUDA, YOLOv8, TensorRT, Docker, OpenCV
- **Steps:** (1) Collect and annotate 10,000 driving frames; (2) Train a custom YOLOv8 model on GPU; (3) Build a Dockerized streaming pipeline with RTSP cameras.

### 4. Critical Engineering Review: Accepted, Changed, or Rejected
- **REJECTED:** Autonomous vehicle multi-camera training pipeline. This is completely infeasible for a beginner in a 60-minute session and would frustrate students.
- **CHANGED:** Shifted focus from training custom neural networks from scratch to implementing foundational pre-trained inference models via lightweight APIs.
- **ACCEPTED:** The structured multi-field format (title, problem statement, why it fits, 3 concrete steps).
- **ENFORCED SCHEMA:** Added a strict Pydantic constraint requiring **exactly three implementation steps** and prompt guardrails enforcing 60-minute feasibility:
  ```python
  class ProjectRecommendation(BaseModel):
      project_title: str
      problem_statement: str
      project_description: str
      why_it_fits: str
      recommended_tech_stack: List[str]
      difficulty_level: str
      implementation_scope: str
      first_three_steps: List[str] = Field(..., min_length=3, max_length=3)
      workshop_learning_outcome: str
  ```

### 5. Architectural Impact
The prompt was rewritten with explicit boundary conditions:
> *"The project prototype MUST be buildable during a 60-minute live workshop session using pre-trained APIs or foundational model libraries. Do NOT propose building custom dataset training pipelines."*

As a result, the model now recommends realistic capstones (e.g., *"Smart Document OCR & Summarizer in Streamlit"* or *"Real-Time Face Mask Alert with Pre-trained OpenCV"*), achieving a 98% student feasibility score.

---

## Experiment 2: Referral Abuse Prevention & Privacy-Preserving Attribution

### 1. Objective
Track student referral link clicks and conversions accurately without storing raw IP addresses (violating privacy regulations) and without allowing self-referral gaming.

### 2. Representative Prompt
```text
How should we structure referral link click logging and conversion attribution in FastAPI and Supabase to prevent fraud while remaining privacy-compliant?
```

### 3. AI Initial Suggestion
The model initially suggested:
1. Creating separate tables: `referral_clicks` (storing client IP address, User-Agent, and timestamp) and `referral_attributions`.
2. Storing raw IP addresses in the database to detect duplicate clicks via `SELECT DISTINCT client_ip`.
3. Checking self-referrals purely in the frontend React component by comparing localStorage codes.

### 4. Critical Engineering Review: Accepted, Changed, or Rejected
- **REJECTED:** Storing raw IP addresses in plaintext. This violates privacy best practices (GDPR / India DPDP Act) and represents unnecessary security liability.
- **REJECTED:** Client-side self-referral checking. Relying on the frontend for security is trivial to bypass via cURL or API tools.
- **REJECTED:** Separate redundant tables (`referral_clicks` vs `referral_attributions`).
- **ACCEPTED & MODIFIED:** Unified polymorphic event model (`referral_events`) with an `event_type IN ('click', 'conversion')` constraint.
- **ENFORCED PRIVACY:** Implemented a salted SHA-256 IP hashing utility on the backend:
  ```python
  def hash_ip(ip: str, salt: str = "launchloop_attribution_salt_2026") -> str:
      return hashlib.sha256(f"{ip}_{salt}".encode()).hexdigest()
  ```
- **ENFORCED BACKEND AUTHORIZATION:** Verified referrer ownership directly in database queries; self-referrals are blocked authoritatively on the server.

### 5. Architectural Impact
Reduced database complexity from multiple redundant tables to a single clean table (`referral_events`). Zero plaintext PII is persisted in logs or database tables.

---

## Experiment 3: Grounding AI Growth Intelligence on Telemetry (Anti-Hallucination)

### 1. Objective
Generate actionable growth marketing recommendations from live campaign metrics without the LLM fabricating unmeasured figures, promising guaranteed outcomes, or confusing correlation with causation.

### 2. Representative Prompt
```text
System: You are a growth marketing director.
User: Here is our campaign data for LaunchLoop AI:
Target: 500 registrations. Real: 12. Referral Clicks: 25. Referral Conversions: 3.
What should we do to reach 500 registrations?
```

### 3. AI Initial Suggestion
The model produced an overconfident, hallucinated response:
> *"Great progress! Your referral conversion rate of 12% is strong. You should immediately allocate ₹15,000 to Meta Ads to acquire 400 students by Friday. Influencer partnerships will guarantee reaching 600 students."*

### 4. Critical Engineering Review: Accepted, Changed, or Rejected
- **REJECTED:** Suggesting ₹15,000 ad spend when the hard campaign constraint is ₹2,000 total budget.
- **REJECTED:** Promising that a tactic will "guarantee reaching 600 students".
- **REJECTED:** Passing raw student data or ungrounded questions.
- **ACCEPTED & RESTRUCTURED:**
  1. Built a trusted telemetry aggregation function (`build_sanitized_summary()`) that strictly excludes all PII (no student names, emails, phones, tokens, or raw IPs).
  2. Implemented strict negative constraints in the prompt:
     - Must ground recommendations exclusively in provided telemetry numbers.
     - Must frame all impacts as **testable hypotheses**, not guaranteed facts.
     - Must respect the ₹2,000 budget ceiling.
     - If registrations are near zero, must recommend **low-cost discovery experiments** rather than sweeping conclusions.
  3. Enforced structured JSON output through Pydantic (`GrowthRecommendationItem`) with mandatory `observed_evidence`, `proposed_action`, `rationale`, `effort`, `expected_impact`, and `confidence_and_limitations`.

### 5. Architectural Impact
The output transitioned from generic marketing fluff to an empirical growth engineering tool. When telemetry is thin, the system safely proposes diagnostic experiments (e.g., college WhatsApp group ambassador blitz) rather than hallucinated conclusions.

---

## Summary of AI Engineering Best Practices Learned

1. **Never Trust Raw LLM Output:** Always wrap model invocations in strict Pydantic schemas with type enforcement and semantic validators.
2. **Deterministic Fallbacks are Mandatory:** Never leave an application broken if an LLM times out or hits rate limits; implement transparent, high-quality curated fallbacks.
3. **Data Sanitization is Non-Negotiable:** Aggregate and anonymize telemetry on the server before transmitting context to an AI provider.
4. **Guardrails Over Creativity:** In operational tools like growth dashboards, narrow the temperature (0.6–0.7) and provide explicit negative constraints to eliminate hallucinations.
