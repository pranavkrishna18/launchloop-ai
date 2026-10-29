import { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Compass,
  UserCheck,
  Users,
  Trophy,
  AlertCircle,
  ArrowLeft,
  HeartHandshake,
  BarChart3,
  Terminal,
  ArrowDown,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import MagnetForm from './components/magnet/MagnetForm';
import ProjectCard from './components/magnet/ProjectCard';
import RegistrationForm from './components/registration/RegistrationForm';
import SuccessModal from './components/registration/SuccessModal';
import StudentReferralHub from './components/referral/StudentReferralHub';
import Leaderboard from './components/referral/Leaderboard';
import OrganizerDashboard from './components/dashboard/OrganizerDashboard';
import WorkshopDetails from './components/workshop/WorkshopDetails';
import { getProjectRecommendation, getMagnetConfig } from './api/magnet';
import { useReferralTracker } from './hooks/useReferralTracker';
import { getActiveStudentProfile, getStudentProfiles } from './utils/studentStorage';

function App() {
  const { referralCode, inviterName } = useReferralTracker();

  const [activeTab, setActiveTab] = useState('magnet'); // 'magnet' | 'register' | 'referral' | 'leaderboard' | 'dashboard'
  const [activeProfile, setActiveProfile] = useState(() => getActiveStudentProfile());
  const [config, setConfig] = useState(null);
  const [recommendationData, setRecommendationData] = useState(null);
  const [prefilledTech, setPrefilledTech] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Registration success modal state
  const [registeredData, setRegisteredData] = useState(null);

  const discoverySectionRef = useRef(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await getMagnetConfig();
        setConfig(data);
      } catch (err) {
        console.warn('Unable to load magnet config:', err.message);
      }
    }
    loadConfig();

    const updateProfile = () => {
      setActiveProfile(getActiveStudentProfile());
    };
    window.addEventListener('launchloop_profile_updated', updateProfile);
    window.addEventListener('storage', updateProfile);

    // Direct routing parameters
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'register' || (params.get('ref') && !tabParam)) {
      setActiveTab('register');
    } else if (tabParam === 'leaderboard') {
      setActiveTab('leaderboard');
    } else if (tabParam === 'referral') {
      setActiveTab('referral');
    } else if (tabParam === 'dashboard' || tabParam === 'analytics') {
      setActiveTab('dashboard');
    }

    return () => {
      window.removeEventListener('launchloop_profile_updated', updateProfile);
      window.removeEventListener('storage', updateProfile);
    };
  }, []);

  const handleGenerate = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProjectRecommendation(formData);
      setRecommendationData(result);
      if (discoverySectionRef.current) {
        discoverySectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      setError(err.message || 'Failed to generate project recommendation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetMagnet = () => {
    setRecommendationData(null);
    setError(null);
    if (discoverySectionRef.current) {
      discoverySectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRegisterForProject = (rec) => {
    setPrefilledTech(rec.recommended_tech_stack);
    setActiveTab('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToDiscovery = () => {
    if (discoverySectionRef.current) {
      discoverySectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-warm-paper flex flex-col justify-between selection:bg-lime selection:text-obsidian atelier-grid-bg">
      {/* Top Peer Invitation Banner if arriving via referral */}
      {referralCode && (
        <div className="bg-graphite border-b border-tangerine py-2.5 px-4 text-center text-xs text-warm-paper">
          <div className="max-w-6xl mx-auto flex items-center justify-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-tangerine animate-pulse" />
            <span className="font-mono">
              PEER INVITATION // You were invited by <strong className="text-tangerine">{inviterName || 'a classmate'}</strong>! Free live seat + verified workshop credential included.
            </span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <header className="border-b border-border-atelier bg-obsidian/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Custom Brand Wordmark */}
          <div
            onClick={() => setActiveTab('magnet')}
            className="flex items-center space-x-3 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-graphite border border-border-atelier flex items-center justify-center font-mono font-bold text-warm-paper group-hover:border-lime transition">
              <span className="text-lime text-sm font-bold">L²</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-bold text-base sm:text-lg tracking-tight text-warm-paper">
                  LAUNCHLOOP
                </span>
                <span className="text-[11px] font-mono font-bold px-1.5 py-0.2 bg-lime text-obsidian rounded">
                  AI
                </span>
              </div>
              <span className="text-[9px] font-mono text-soft-gray block uppercase tracking-wider">
                STUDIO // PHASE 6
              </span>
            </div>
          </div>

          {/* Verified Campaign Status Label */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-full bg-graphite border border-border-atelier text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
            <span className="text-soft-gray">CAMPAIGN:</span>
            <span className="text-warm-paper font-bold">7-DAY ACCELERATOR</span>
            <span className="text-soft-gray">•</span>
            <span className="text-lime font-bold">500 COHORT SEATS</span>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5">
            <button
              onClick={() => setActiveTab('magnet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'magnet'
                  ? 'bg-lime text-obsidian shadow-sm'
                  : 'text-soft-gray hover:text-warm-paper hover:bg-graphite'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden md:inline">PROJECT MAGNET</span>
            </button>

            <button
              onClick={() => setActiveTab('register')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-lime text-obsidian shadow-sm'
                  : 'text-soft-gray hover:text-warm-paper hover:bg-graphite'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>REGISTER</span>
            </button>

            <button
              onClick={() => setActiveTab('referral')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'referral'
                  ? 'bg-lime text-obsidian shadow-sm'
                  : 'text-soft-gray hover:text-warm-paper hover:bg-graphite'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>
                {activeProfile ? `${activeProfile.student_name.split(' ')[0]}'S PORTAL` : 'STUDENT PORTAL'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-lime text-obsidian shadow-sm'
                  : 'text-soft-gray hover:text-warm-paper hover:bg-graphite'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden md:inline">LEADERBOARD</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-warm-paper text-obsidian shadow-sm'
                  : 'text-soft-gray hover:text-warm-paper hover:bg-graphite'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-lime" />
              <span>ORGANIZER</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`${activeTab === 'dashboard' ? 'max-w-6xl' : 'max-w-4xl'} mx-auto px-4 py-8 sm:py-12 flex-1 w-full transition-all duration-300`}>
        {/* Error Notification Banner */}
        {error && (
          <div className="mb-6 rounded-xl p-4 bg-obsidian border border-tangerine text-tangerine text-xs flex items-start space-x-3 font-mono">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">SYSTEM ALERT</p>
              <p className="text-soft-gray mt-0.5 font-sans">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs text-tangerine hover:text-warm-paper underline ml-2 cursor-pointer"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* TAB 1: AI Project Magnet & High-Conversion Landing Page */}
        {activeTab === 'magnet' && (
          <div className="space-y-12 animate-fadeIn">
            {/* HERO COMPOSITION: Electric Atelier Creative Direction */}
            <section className="text-center space-y-6 pt-4 pb-8">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-graphite border border-border-atelier text-lime text-xs font-mono font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-lime" />
                <span>NxtWave Live Workshop Accelerator</span>
              </div>

              <h1 className="text-3xl sm:text-6xl font-display font-bold tracking-tight text-warm-paper leading-[1.08] max-w-4xl mx-auto">
                BUILD YOUR FIRST REAL AI PROJECT IN{' '}
                <span className="text-lime underline decoration-border-atelier decoration-2 underline-offset-8">
                  60 MINUTES.
                </span>
              </h1>

              <p className="text-soft-gray max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                Engineered for final-year engineering students. Skip superficial chatbot tutorials. Discover a personalized capstone blueprint matched to your tech stack, connect real foundation models, and secure a verified credential for campus placements.
              </p>

              {/* Call-to-action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={scrollToDiscovery}
                  className="btn-lime w-full sm:w-auto py-3.5 px-8 rounded-xl font-display font-bold text-sm tracking-tight flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Discover Your AI Project Blueprint</span>
                  <ArrowDown className="w-4 h-4 text-obsidian" />
                </button>

                <button
                  onClick={() => setActiveTab('register')}
                  className="btn-outline-atelier w-full sm:w-auto py-3.5 px-6 rounded-xl font-mono text-xs font-bold cursor-pointer"
                >
                  DIRECT REGISTRATION →
                </button>
              </div>

              {/* Custom Modular Prototype Assembly Visual Composition (CSS & Inline SVG) */}
              <div className="pt-8 max-w-3xl mx-auto">
                <div className="atelier-card rounded-2xl p-5 border border-border-atelier relative overflow-hidden text-left font-mono">
                  {/* Top Schematic Status Bar */}
                  <div className="flex items-center justify-between text-[11px] pb-3 border-b border-border-atelier text-soft-gray">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                      <span className="text-lime font-bold">ASSEMBLY PIPELINE // ACTIVE</span>
                    </div>
                    <span>COHORT BLUEPRINT: CSE_ECE_2026</span>
                  </div>

                  {/* 3 Modular Wireframe Nodes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                    <div className="p-3.5 rounded-xl bg-obsidian border border-border-atelier space-y-1.5">
                      <span className="text-[10px] text-lime font-bold">NODE // 01</span>
                      <h4 className="text-xs font-display font-bold text-warm-paper">Input Tokenizer</h4>
                      <p className="text-[11px] text-soft-gray font-sans">
                        Validates student branch, programming stack, and placement goal.
                      </p>
                      <div className="pt-1 text-[9px] text-lime">STATUS: BOUND</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-obsidian border border-border-atelier space-y-1.5">
                      <span className="text-[10px] text-lime font-bold">NODE // 02</span>
                      <h4 className="text-xs font-display font-bold text-warm-paper">Model Inference</h4>
                      <p className="text-[11px] text-soft-gray font-sans">
                        Zero-shot prompt structure with strict JSON schema response contract.
                      </p>
                      <div className="pt-1 text-[9px] text-lime">LATENCY: 320ms</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-obsidian border border-border-atelier space-y-1.5">
                      <span className="text-[10px] text-tangerine font-bold">NODE // 03</span>
                      <h4 className="text-xs font-display font-bold text-warm-paper">Client Runtime</h4>
                      <p className="text-[11px] text-soft-gray font-sans">
                        Interactive UI binding with reproducible GitHub repository code.
                      </p>
                      <div className="pt-1 text-[9px] text-tangerine">OUTCOME: 60-MIN PROTOTYPE</div>
                    </div>
                  </div>

                  {/* Geometric Flow Vector SVG */}
                  <div className="w-full pt-1">
                    <svg viewBox="0 0 600 30" className="w-full h-6 text-border-atelier">
                      <line x1="100" y1="15" x2="250" y2="15" stroke="#2D2E26" strokeWidth="2" strokeDasharray="4 4" />
                      <polygon points="255,15 245,10 245,20" fill="#D5FF45" />
                      <line x1="350" y1="15" x2="490" y2="15" stroke="#2D2E26" strokeWidth="2" strokeDasharray="4 4" />
                      <polygon points="495,15 485,10 485,20" fill="#D5FF45" />
                    </svg>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 02: GUIDED PROJECT DISCOVERY WORKSPACE */}
            <div ref={discoverySectionRef} className="pt-4 space-y-6 scroll-mt-24">
              <div className="flex items-center space-x-3 border-b border-border-atelier pb-3">
                <span className="text-xs font-mono font-bold text-lime bg-lime-muted px-2 py-0.5 rounded">
                  WORKSPACE
                </span>
                <h2 className="text-lg font-display font-bold text-warm-paper tracking-tight">
                  AI Project Discovery Studio
                </h2>
              </div>

              {recommendationData ? (
                <div>
                  <div className="mb-4">
                    <button
                      onClick={handleResetMagnet}
                      className="inline-flex items-center space-x-1.5 text-xs font-mono text-soft-gray hover:text-lime transition cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>MODIFY PROFILE PARAMETERS</span>
                    </button>
                  </div>
                  <ProjectCard
                    data={recommendationData}
                    onReset={handleResetMagnet}
                    onRegisterForProject={handleRegisterForProject}
                  />
                </div>
              ) : (
                <div className="atelier-card rounded-2xl p-6 sm:p-10 border border-border-atelier">
                  <div className="mb-6 pb-6 border-b border-border-atelier">
                    <h3 className="text-lg font-display font-bold text-warm-paper tracking-tight">
                      Configure Your Engineering Parameters
                    </h3>
                    <p className="text-xs text-soft-gray mt-1">
                      No resume uploads required. We match your language comfort zone to an actionable capstone blueprint.
                    </p>
                  </div>
                  <MagnetForm onSubmit={handleGenerate} loading={loading} />
                </div>
              )}
            </div>

            {/* SECTIONS 03-07: Workshop Curriculum, Scope Blueprint, Placement Advantage, Referral Program & FAQ */}
            <WorkshopDetails onRegisterClick={() => setActiveTab('register')} />
          </div>
        )}

        {/* TAB 2: Student Registration */}
        {activeTab === 'register' && (
          <div className="space-y-8 animate-fadeIn max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-graphite border border-border-atelier text-lime text-xs font-mono font-semibold uppercase tracking-wider mb-3">
                <UserCheck className="w-3.5 h-3.5 text-lime" />
                <span>Live Cohort Registration</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-bold text-warm-paper tracking-tight mb-2">
                Build Your First AI Project in 60 Minutes
              </h1>
              <p className="text-xs sm:text-sm text-soft-gray font-mono">
                Sunday • 7:00 PM IST • Live Online • Verified Certificate Included
              </p>
            </div>

            <div className="atelier-card rounded-2xl p-6 sm:p-10 border border-border-atelier">
              <RegistrationForm
                onSuccess={(data) => setRegisteredData(data)}
                prefillTech={prefilledTech}
                prefillProject={recommendationData}
              />
            </div>

            {/* Workshop Details below Registration */}
            <WorkshopDetails onRegisterClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
          </div>
        )}

        {/* TAB 3: Student & Ambassador Portal */}
        {activeTab === 'referral' && (
          <StudentReferralHub
            onGoToRegister={() => setActiveTab('register')}
            onGoToMagnet={() => {
              setActiveTab('magnet');
              if (discoverySectionRef.current) {
                discoverySectionRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />
        )}

        {/* TAB 4: Public Leaderboard */}
        {activeTab === 'leaderboard' && <Leaderboard />}

        {/* TAB 5: Organizer Growth Dashboard & AI Intelligence */}
        {activeTab === 'dashboard' && <OrganizerDashboard />}
      </main>

      {/* Post-Registration Success Modal */}
      {registeredData && (
        <SuccessModal
          data={registeredData}
          onClose={() => setRegisteredData(null)}
          onViewStats={() => setActiveTab('referral')}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-border-atelier py-6 text-center text-xs text-soft-gray font-mono bg-obsidian">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>LAUNCHLOOP [AI] — NXTWAVE GROWTH CHALLENGE</span>
          <span>CAMPAIGN TARGET: 500 REGISTRATIONS IN 7 DAYS (₹2,000 ALLOCATED BUDGET)</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
