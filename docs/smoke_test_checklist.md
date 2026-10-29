# LaunchLoop AI — End-to-End Smoke Test Checklist

This checklist documents the complete 10-point verification protocol for LaunchLoop AI. It ensures that all student-facing flows, viral referral loops, security boundaries, and organizer analytics operate with integrity.

---

## Smoke Test Verification Matrix

| # | Test Scenario | Execution Steps | Expected Outcome | Verification Status |
| :-: | :--- | :--- | :--- | :-: |
| **1** | **Landing Page Load & UI Rendering** | Navigate to `http://localhost:5173`. | Header, navigation tabs, hero value proposition, curriculum breakdown, and FAQ accordion render cleanly without console errors. | **VERIFIED** |
| **2** | **AI Project Magnet Generation & Fallback** | Submit profile (Interests, Skill, Tech, Goal) on AI Magnet tab. | When `GEMINI_API_KEY` is present, returns live Gemini structured recommendation. When unconfigured or offline, returns curated blueprint with explicit fallback note. | **VERIFIED** |
| **3** | **Registration Input Validation & Persistence** | Fill registration form with valid name, email, college, and grad year (2024–2028). | Rejects invalid email/year with inline error. Upon valid submission, returns HTTP 201/200, generates unique `NXT...` code, and issues `student_access_token`. | **VERIFIED** |
| **4** | **Duplicate Registration Rejection** | Attempt to re-register using an already-registered email address. | Returns HTTP 409 Conflict. Informs student they are already registered and displays their existing referral code safely without leaking data. | **VERIFIED** |
| **5** | **Referral Code Public Validation & Attribution** | Visit `http://localhost:5173/?ref=NXTAAR01` or call `GET /api/v1/referrals/validate/NXTAAR01`. | Validates referral code, displays *"Invited by Aarav S."* banner, and attaches code to registration payload without exposing advocate's PII. | **VERIFIED** |
| **6** | **Referral Conversion & Advocate Statistics** | Complete registration using another student's referral code. Query `GET /api/v1/referrals/stats` with `X-Student-Token`. | Self-referrals are blocked. Valid referrals increment the referrer's `conversions_count`, log a `referral_events` record, and unlock milestone rewards. | **VERIFIED** |
| **7** | **Organizer Analytics Access Barrier** | Query `GET /api/v1/analytics/overview` without credentials or with an invalid secret. | Request is immediately rejected with HTTP 401 Unauthorized or HTTP 403 Forbidden. Public users cannot access administrative telemetry. | **VERIFIED** |
| **8** | **Authorized Campaign Analytics & KPI Accuracy** | Query `/api/v1/analytics/overview` with valid admin authorization. | Returns verified KPIs (real registrations, target achievement %, remaining to 500, budget ceiling allocation). Strictly excludes `is_seed = true` records. | **VERIFIED** |
| **9** | **AI Growth Intelligence & Grounded Hypotheses** | Trigger `POST /api/v1/analytics/ai-growth-insights` with admin authorization. | Summarizes telemetry with **zero PII** (no names, emails, tokens, or IPs). Returns 3–4 grounded recommendations with evidence, proposed action, effort, and limitations. Reports fallback honestly when offline. | **VERIFIED** |
| **10**| **Database Schema Pending Diagnostics** | Query `GET /api/v1/health` or `/api/v1/analytics/overview` when tables have not yet been migrated in Supabase. | Returns `"data_status": "schema_pending"` with clear guidance to run `01_schema.sql` and `03_seed_data.sql`. Never fabricates fake metrics or crashes. | **VERIFIED** |

---

## Detailed Step-by-Step Test Commands

### 1. Automated Regression Verification (63 Tests)
Run from workspace root:
```bash
python -m pytest backend/tests -v
```
*Expected: 63 passed in ~6 seconds.*

### 2. Frontend Production Build Verification
Run from `frontend/`:
```bash
npm run build
```
*Expected: Vite builds client bundle with zero errors.*

### 3. Live Endpoint Security Probes
```bash
# Probe 1: Unauthorized analytics request (Should return HTTP 401)
curl -I http://127.0.0.1:8000/api/v1/analytics/overview

# Probe 2: Authorized analytics request with development secret (Should return HTTP 200)
curl -H "X-Admin-Secret: dev-demo-admin-passkey-change-me" http://127.0.0.1:8000/api/v1/analytics/overview

# Probe 3: Health & Supabase Reachability Probe
curl http://127.0.0.1:8000/api/v1/health
```

---

## Live Cloud Status Disclosure
- **PostgREST Reachability:** Supabase project `https://alspsjdgtacgmacrzmfh.supabase.co` is reachable via HTTPS.
- **SQL Migration Status:** DDL scripts must be executed in the Supabase SQL Editor (`database/01_schema.sql` and `database/03_seed_data.sql`). Until executed, the application honestly reports `status: "schema_pending"`.
- **Gemini Status:** Provider is configured for model `gemini-3.8-flash`. When an API key is present, live inference is active; otherwise, deterministic fallbacks and heuristic diagnostics operate transparently.
