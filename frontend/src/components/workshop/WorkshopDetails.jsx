import { useState } from 'react';
import {
  Clock,
  Code2,
  CheckCircle,
  HelpCircle,
  Shield,
  Award,
  ChevronDown,
  Layers,
  Sparkles,
  Zap,
  ArrowRight,
  Briefcase,
  Share2,
  Terminal,
  FileCode2,
  Users
} from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: 'Is this workshop completely free of charge?',
    a: 'Yes, 100% free. There are no hidden fees, paywalls, or credit card requirements. A verified digital Certificate of Completion is awarded to all students who build and submit their 60-minute prototype.'
  },
  {
    q: 'Who is this workshop specifically designed for?',
    a: 'Final-year and pre-final year engineering students across all branches (CSE, IT, ECE, EEE, Mechanical, etc.) who need a demonstrable, practical AI project for campus placement drives and technical resumes.'
  },
  {
    q: 'Do I need prior Machine Learning or Data Science experience?',
    a: 'No advanced ML background is required. Basic familiarity with programming logic (Python or JavaScript) is sufficient. We guide you step-by-step through calling pre-trained foundational models, structuring inputs, and rendering outputs.'
  },
  {
    q: 'What is the difference between the 60-minute prototype and the weekend extension?',
    a: 'During the 60-minute live session, you will build and run a functional, working AI prototype with API integration. We also provide a free, self-paced weekend extension guide showing you how to add database persistence, custom CSS styling, and GitHub deployment to showcase on your resume.'
  },
  {
    q: 'What prerequisites or software do I need to prepare?',
    a: 'A laptop with an active internet connection, a modern web browser, and a free GitHub account. Detailed quickstart setup instructions are sent directly to your registered email.'
  },
  {
    q: 'How does LaunchLoop AI protect my personal data?',
    a: 'We adhere to strict data minimization. Your email and college information are used exclusively for workshop logistics and certificate issuance. We never share student data with third-party advertisers. IP addresses are hashed with salted SHA-256 and never stored in raw text.'
  }
];

export default function WorkshopDetails({ onRegisterClick }) {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="mt-20 space-y-16 animate-fadeIn">
      {/* 1. What You Will Build — 4 Stage Architectural Pipeline */}
      <div className="atelier-card rounded-2xl p-6 sm:p-10 border border-border-atelier">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-graphite-light border border-border-atelier text-lime text-xs font-mono font-medium uppercase tracking-wider mb-3">
            <Code2 className="w-3.5 h-3.5 text-lime" />
            <span>Curriculum Pipeline</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-warm-paper tracking-tight">
            What You Build in 60 Minutes
          </h2>
          <p className="text-xs sm:text-sm text-soft-gray mt-2">
            Zero theoretical slide lectures. Wire live APIs to production endpoints and ship a runnable prototype.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-obsidian border border-border-atelier space-y-3 relative group hover:border-lime transition duration-150">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-lime bg-lime-muted px-2 py-0.5 rounded border border-lime/20">
                STAGE 01
              </span>
              <span className="text-[10px] font-mono text-soft-gray">00:00 – 00:15</span>
            </div>
            <h4 className="text-sm font-display font-bold text-warm-paper">API & Schema Blueprint</h4>
            <p className="text-xs text-soft-gray leading-relaxed">
              Initialize runtime, authenticate free foundation model access, and establish strict JSON schema parameters.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-obsidian border border-border-atelier space-y-3 relative group hover:border-lime transition duration-150">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-warm-paper bg-graphite-light px-2 py-0.5 rounded border border-border-atelier">
                STAGE 02
              </span>
              <span className="text-[10px] font-mono text-soft-gray">00:15 – 00:35</span>
            </div>
            <h4 className="text-sm font-display font-bold text-warm-paper">Prompt & Logic Engine</h4>
            <p className="text-xs text-soft-gray leading-relaxed">
              Implement structured zero-shot prompting, parse typed JSON payloads, and safeguard against model hallucination.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-obsidian border border-border-atelier space-y-3 relative group hover:border-lime transition duration-150">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-warm-paper bg-graphite-light px-2 py-0.5 rounded border border-border-atelier">
                STAGE 03
              </span>
              <span className="text-[10px] font-mono text-soft-gray">00:35 – 00:50</span>
            </div>
            <h4 className="text-sm font-display font-bold text-warm-paper">Interactive Client Interface</h4>
            <p className="text-xs text-soft-gray leading-relaxed">
              Bind backend endpoints to a responsive UI so placement recruiters and peers can interact with live model output.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-obsidian border border-border-atelier space-y-3 relative group hover:border-tangerine transition duration-150">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-tangerine bg-tangerine-muted px-2 py-0.5 rounded border border-tangerine/20">
                STAGE 04
              </span>
              <span className="text-[10px] font-mono text-soft-gray">00:50 – 01:00</span>
            </div>
            <h4 className="text-sm font-display font-bold text-warm-paper">Verification & Certificate</h4>
            <p className="text-xs text-soft-gray leading-relaxed">
              Submit your project repository hash, receive automated verification, and unlock your capstone credential.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Alternating Section: High-Contrast Scope Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prototype Scope Panel */}
        <div className="atelier-card rounded-2xl p-6 sm:p-8 space-y-4 border border-border-atelier">
          <div className="flex items-center justify-between border-b border-border-atelier pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-lime" />
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-lime">
                Built Live in 60 Mins
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-graphite-light text-lime font-semibold border border-lime/20">
              REALISTIC SCOPE
            </span>
          </div>

          <h3 className="text-xl font-display font-bold text-warm-paper">
            The 60-Minute Prototype Scope
          </h3>
          <p className="text-xs text-soft-gray leading-relaxed">
            Deliberately constrained to guarantee completion. Every student leaves the live workshop with a working, testable AI tool.
          </p>

          <ul className="space-y-3 text-xs text-warm-paper/90 pt-2">
            <li className="flex items-start space-x-2.5">
              <CheckCircle className="w-4 h-4 text-lime shrink-0 mt-0.5" />
              <span>Single-feature AI application connected to high-speed LLM endpoint</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <CheckCircle className="w-4 h-4 text-lime shrink-0 mt-0.5" />
              <span>Strict input sanitation and validated JSON response parsing</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <CheckCircle className="w-4 h-4 text-lime shrink-0 mt-0.5" />
              <span>Runnable local development server and initial GitHub commit</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <CheckCircle className="w-4 h-4 text-lime shrink-0 mt-0.5" />
              <span>Official NxtWave Workshop Certificate of Participation</span>
            </li>
          </ul>
        </div>

        {/* Dark Surface Panel: Weekend Extension */}
        <div className="atelier-card rounded-2xl p-6 sm:p-8 space-y-4 border border-border-atelier">
          <div className="flex items-center justify-between border-b border-border-atelier pb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-lime" />
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-lime">
                Self-Paced Takeaway
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-graphite-light text-warm-paper font-semibold">
              CAPSTONE EXTENSION
            </span>
          </div>

          <h3 className="text-xl font-display font-bold text-warm-paper">
            The Weekend Capstone Blueprint
          </h3>
          <p className="text-xs text-soft-gray leading-relaxed">
            Step-by-step post-workshop extension guide to expand your prototype into a flagship portfolio highlight for interviews.
          </p>

          <ul className="space-y-3 text-xs text-warm-paper/90 pt-2">
            <li className="flex items-start space-x-2.5">
              <Sparkles className="w-4 h-4 text-lime shrink-0 mt-0.5" />
              <span>Add PostgreSQL / Supabase storage for persistent multi-user session history</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <Sparkles className="w-4 h-4 text-lime shrink-0 mt-0.5" />
              <span>Deploy live to cloud hosting (Vercel / Render) with a permanent demo URL</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <Sparkles className="w-4 h-4 text-lime shrink-0 mt-0.5" />
              <span>Resume bullet points & technical interview talking points cheatsheet</span>
            </li>
            <li className="flex items-start space-x-2.5">
              <Sparkles className="w-4 h-4 text-lime shrink-0 mt-0.5" />
              <span>Priority review from NxtWave engineering mentors via referral perk</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. Placement Advantage Section — Why this is useful for student placements */}
      <div className="atelier-card rounded-2xl p-6 sm:p-10 border border-border-atelier">
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-graphite-light text-sage text-xs font-mono font-medium uppercase tracking-wider mb-3 border border-border-atelier">
            <Briefcase className="w-3.5 h-3.5 text-sage" />
            <span>Placement Advantage</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-warm-paper tracking-tight">
            Why Final-Year Recruiters Value Real Prototypes Over Tutorials
          </h3>
          <p className="text-xs sm:text-sm text-soft-gray mt-2">
            Most college resumes list identical generic projects copied from identical videos. A structured AI application with error-handling and telemetry sets you apart immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-obsidian border border-border-atelier space-y-2">
            <div className="text-lime font-mono font-bold text-sm">01 / ARCHITECTURE</div>
            <h4 className="text-sm font-display font-bold text-warm-paper">API Architecture vs Wrapper</h4>
            <p className="text-xs text-soft-gray leading-relaxed">
              Show hiring managers you understand structured contracts, JSON schemas, rate-limiting, and error fallback modes.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-obsidian border border-border-atelier space-y-2">
            <div className="text-lime font-mono font-bold text-sm">02 / CODE REPOSITORY</div>
            <h4 className="text-sm font-display font-bold text-warm-paper">Verifiable GitHub History</h4>
            <p className="text-xs text-soft-gray leading-relaxed">
              Your git commit history proves you wrote the application logic, debugged edge cases, and configured environment variables.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-obsidian border border-border-atelier space-y-2">
            <div className="text-tangerine font-mono font-bold text-sm">03 / INTERVIEW READINESS</div>
            <h4 className="text-sm font-display font-bold text-warm-paper">Defensible Technical Answers</h4>
            <p className="text-xs text-soft-gray leading-relaxed">
              Explain latency trade-offs, token economics, and model selection choices with confidence in campus technical rounds.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Peer Referral Program Breakdown */}
      <div className="atelier-card rounded-2xl p-6 sm:p-8 border border-border-atelier flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center space-x-2 text-lime font-mono text-xs uppercase tracking-wider">
            <Users className="w-4 h-4 text-lime" />
            <span>Student Ambassador Network</span>
          </div>
          <h4 className="text-xl font-display font-bold text-warm-paper">
            Build Projects Together. Unlock Campus Ambassador Perks.
          </h4>
          <p className="text-xs text-soft-gray leading-relaxed">
            Invite engineering peers with your verified referral code. Mobilize 3 classmates to unlock the VIP Workshop Q&A Pass and priority mentor review.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <div className="px-4 py-3 rounded-xl bg-obsidian border border-border-atelier text-center font-mono">
            <span className="block text-lg font-bold text-lime">3 Peers</span>
            <span className="text-[10px] text-soft-gray">VIP Q&A PASS</span>
          </div>
          <div className="px-4 py-3 rounded-xl bg-obsidian border border-border-atelier text-center font-mono">
            <span className="block text-lg font-bold text-tangerine">5 Peers</span>
            <span className="text-[10px] text-soft-gray">MENTOR REVIEW</span>
          </div>
        </div>
      </div>

      {/* 5. Frequently Asked Questions (Accordion) */}
      <div className="atelier-card rounded-2xl p-6 sm:p-10 border border-border-atelier">
        <div className="flex items-center space-x-2 mb-2">
          <HelpCircle className="w-4 h-4 text-lime" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-lime">FAQ</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-display font-bold text-warm-paper tracking-tight mb-6">
          Frequently Asked Questions
        </h3>

        <div className="divide-y divide-border-atelier">
          {FAQ_ITEMS.map((faq, idx) => (
            <div key={idx} className="py-4">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-warm-paper hover:text-lime transition cursor-pointer"
                aria-expanded={openFaq === idx}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-soft-gray transition-transform duration-150 shrink-0 ml-4 ${
                    openFaq === idx ? 'rotate-180 text-lime' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <p className="mt-3 text-xs text-soft-gray leading-relaxed pr-6 animate-fadeIn">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 6. Final High-Contrast Registration CTA */}
      <div className="atelier-card rounded-2xl p-8 sm:p-12 text-center space-y-4 border border-lime/40 bg-gradient-to-b from-graphite to-obsidian">
        <span className="inline-block px-3 py-1 rounded-full bg-lime-muted border border-lime/30 text-lime text-xs font-mono font-bold tracking-wider uppercase">
          LIMITED LIVE COHORT
        </span>
        <h3 className="text-2xl sm:text-4xl font-display font-bold text-warm-paper tracking-tight max-w-xl mx-auto">
          Claim Your Free Workshop Seat Before Capacity Reaches 500
        </h3>
        <p className="text-xs sm:text-sm text-soft-gray max-w-lg mx-auto leading-relaxed">
          Sunday • 7:00 PM IST • 100% Free • Verified Digital Certificate of Completion Included.
        </p>
        <div className="pt-2">
          <button
            onClick={onRegisterClick}
            className="btn-lime py-3.5 px-8 rounded-xl font-display font-bold text-sm tracking-tight cursor-pointer inline-flex items-center space-x-2"
          >
            <span>Register Free For Workshop</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
