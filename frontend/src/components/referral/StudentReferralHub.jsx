import { useState, useEffect } from 'react';
import {
  Users,
  MousePointerClick,
  TrendingUp,
  Award,
  Copy,
  Share2,
  MessageCircle,
  RefreshCw,
  Key,
  AlertCircle,
  Check,
  ArrowRight,
  Sparkles,
  UserCheck,
  BookOpen,
  Layers,
  ChevronDown,
  UserPlus,
  ShieldCheck,
  Clock,
  Compass
} from 'lucide-react';
import { getStudentReferralStats } from '../../api/registration';
import {
  getStudentProfiles,
  getActiveStudentProfile,
  setActiveStudentProfile
} from '../../utils/studentStorage';

export default function StudentReferralHub({ onGoToRegister, onGoToMagnet }) {
  const [profiles, setProfiles] = useState(() => getStudentProfiles());
  const [activeProfile, setActiveProfile] = useState(() => getActiveStudentProfile());
  const [tokenInput, setTokenInput] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('project'); // 'project' | 'ambassador' | 'referrals'
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Sync with student storage and external events
  useEffect(() => {
    const handleProfileUpdate = () => {
      const all = getStudentProfiles();
      const current = getActiveStudentProfile();
      setProfiles(all);
      setActiveProfile(current);
      if (current?.student_access_token) {
        fetchStats(current.student_access_token);
      }
    };

    window.addEventListener('launchloop_profile_updated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);

    if (activeProfile?.student_access_token) {
      fetchStats(activeProfile.student_access_token);
    } else {
      const fallbackToken = localStorage.getItem('launchloop_student_token');
      if (fallbackToken) {
        fetchStats(fallbackToken);
      }
    }

    return () => {
      window.removeEventListener('launchloop_profile_updated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, [activeProfile?.student_access_token]);

  const fetchStats = async (tokenToUse) => {
    if (!tokenToUse) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getStudentReferralStats(tokenToUse.trim());
      setStats(data);
    } catch (err) {
      setError(err.message || 'Unable to fetch your referral metrics. Please verify your token.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = (token) => {
    setActiveStudentProfile(token);
    const updated = getActiveStudentProfile();
    setActiveProfile(updated);
    setShowProfileDropdown(false);
    fetchStats(token);
  };

  const handleManualTokenSubmit = (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setActiveStudentProfile(tokenInput.trim());
    fetchStats(tokenInput.trim());
  };

  const referralUrl =
    stats?.referral_url ||
    activeProfile?.referral_url ||
    (activeProfile?.referral_code
      ? `http://localhost:5173/?ref=${activeProfile.referral_code}`
      : 'http://localhost:5173');

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentProject = activeProfile?.recommended_project;
  const currentAmbassador = activeProfile?.ambassador;

  const whatsappMessage = encodeURIComponent(
    `Hey! I just registered for NxtWave's free live workshop: "Build Your First AI Project in 60 Minutes".\n\nI got my personalized AI capstone blueprint for placements! Claim your free seat and verified certificate with my invite link:\n${referralUrl}`
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. TOP BAR: MULTI-USER COHORT PROFILE SWITCHER */}
      {profiles.length > 0 && (
        <div className="atelier-card rounded-2xl p-4 sm:p-5 border border-[#3D4034] bg-graphite flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-lime-muted border border-lime/30 flex items-center justify-center font-display font-bold text-lime text-base shrink-0">
              {activeProfile?.student_name ? activeProfile.student_name[0].toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-lime font-bold uppercase tracking-wider">
                  ACTIVE STUDENT PROFILE
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-lime-muted text-lime border border-lime/20">
                  COHORT VERIFIED
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-display font-bold text-white tracking-tight">
                {activeProfile?.student_name || 'Registered Student'}
              </h2>
              <p className="text-xs text-[#A9B49B] font-mono">
                {activeProfile?.college || 'Engineering Institute'} • Batch of {activeProfile?.graduation_year || 2026}
              </p>
            </div>
          </div>

          {/* Profile Dropdown Selector */}
          <div className="flex items-center space-x-2 w-full sm:w-auto relative">
            <div className="relative flex-1 sm:flex-none">
              <button
                type="button"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="w-full sm:w-64 bg-[#1A1B16] hover:bg-graphite-light border border-[#3D4034] rounded-xl px-3.5 py-2 text-xs font-mono text-white flex items-center justify-between transition cursor-pointer"
              >
                <span className="truncate mr-2 font-medium">
                  Switch User ({profiles.length})
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-lime transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-1.5 w-full sm:w-72 bg-[#1A1B16] border border-[#3D4034] rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                  <div className="px-3 py-1.5 text-[10px] font-mono text-[#8D8E84] uppercase border-b border-border-atelier">
                    REGISTERED COHORT STUDENTS
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-border-atelier">
                    {profiles.map((p) => {
                      const isActive = p.student_access_token === activeProfile?.student_access_token;
                      return (
                        <button
                          key={p.student_access_token}
                          type="button"
                          onClick={() => handleSelectProfile(p.student_access_token)}
                          className={`w-full text-left px-3.5 py-2.5 text-xs transition flex items-center justify-between cursor-pointer ${
                            isActive ? 'bg-graphite-light text-lime font-bold' : 'text-[#EFEAE1] hover:bg-graphite'
                          }`}
                        >
                          <div className="truncate mr-2">
                            <div className="font-semibold">{p.student_name}</div>
                            <div className="text-[10px] text-[#A9B49B] truncate font-mono">
                              {p.college} • {p.referral_code}
                            </div>
                          </div>
                          {isActive && <Check className="w-3.5 h-3.5 text-lime shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="p-2 border-t border-border-atelier bg-obsidian">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileDropdown(false);
                        if (onGoToRegister) onGoToRegister();
                      }}
                      className="w-full py-2 px-3 rounded-lg text-xs font-mono font-bold text-obsidian bg-lime hover:bg-lime-hover transition flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Register Another Peer</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onGoToRegister}
              className="btn-outline-atelier px-3 py-2 rounded-xl text-xs font-mono font-bold shrink-0 hidden sm:flex items-center space-x-1 cursor-pointer"
              title="Register a new student to test the referral engine"
            >
              <UserPlus className="w-3.5 h-3.5 text-lime" />
              <span>+ NEW</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. IF NO REGISTERED PROFILES YET */}
      {!activeProfile && !stats && !loading && (
        <div className="atelier-card rounded-2xl p-6 sm:p-10 border border-[#3D4034] text-center max-w-lg mx-auto bg-graphite shadow-xl">
          <div className="w-12 h-12 mx-auto rounded-xl bg-graphite-light text-lime border border-[#3D4034] flex items-center justify-center mb-4">
            <Key className="w-5 h-5 text-lime" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-lime font-bold">
            STUDENT PORTAL
          </span>
          <h3 className="text-xl font-display font-bold text-white mt-1 mb-2">
            Access Your Workshop & Ambassador Hub
          </h3>
          <p className="text-xs text-[#EFEAE1] mb-6 leading-relaxed">
            Registered students receive an access token to view their personalized AI capstone blueprint, connect with their campus ambassador, and track live peer invites.
          </p>

          <form onSubmit={handleManualTokenSubmit} className="space-y-3">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste your student access token..."
              className="w-full bg-[#1A1B16] border border-[#3D4034] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#7E8075] font-mono focus:outline-none focus:border-lime"
            />
            <button
              type="submit"
              disabled={!tokenInput.trim()}
              className="w-full btn-lime py-2.5 px-4 rounded-xl text-xs font-mono font-bold transition disabled:opacity-40 cursor-pointer"
            >
              ACCESS MY STUDENT PORTAL
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#3D4034] text-xs text-[#A9B49B]">
            Haven't registered yet?{' '}
            <button
              onClick={onGoToRegister}
              className="text-lime hover:underline font-bold ml-1 cursor-pointer"
            >
              Register here free →
            </button>
          </div>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="rounded-xl p-3.5 bg-obsidian border border-tangerine text-tangerine text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-tangerine shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchStats(activeProfile?.student_access_token)}
            className="text-xs underline text-tangerine hover:text-white cursor-pointer font-mono"
          >
            RETRY
          </button>
        </div>
      )}

      {/* 3. MAIN STUDENT DASHBOARD SECTIONS */}
      {(activeProfile || stats) && (
        <div className="space-y-6">
          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-[#3D4034] space-x-2 sm:space-x-4 pb-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('project')}
              className={`pb-2 text-xs sm:text-sm font-mono font-bold transition flex items-center space-x-2 cursor-pointer ${
                activeSubTab === 'project'
                  ? 'text-lime border-b-2 border-lime'
                  : 'text-[#A9B49B] hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>MY AI CAPSTONE PROJECT</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('ambassador')}
              className={`pb-2 text-xs sm:text-sm font-mono font-bold transition flex items-center space-x-2 cursor-pointer ${
                activeSubTab === 'ambassador'
                  ? 'text-lime border-b-2 border-lime'
                  : 'text-[#A9B49B] hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>MY PERSONAL AMBASSADOR</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('referrals')}
              className={`pb-2 text-xs sm:text-sm font-mono font-bold transition flex items-center space-x-2 cursor-pointer ${
                activeSubTab === 'referrals'
                  ? 'text-lime border-b-2 border-lime'
                  : 'text-[#A9B49B] hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>REFERRAL ENGINE & PERKS</span>
            </button>
          </div>

          {/* SUB-TAB 1: RECOMMENDED AI CAPSTONE PROJECT */}
          {activeSubTab === 'project' && (
            <div className="atelier-card rounded-2xl p-6 sm:p-8 border border-[#3D4034] space-y-6 bg-graphite shadow-xl animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-[#3D4034]">
                <div>
                  <span className="text-[10px] font-mono text-lime font-bold uppercase tracking-wider">
                    PERSONALIZED FOR {activeProfile?.student_name || 'YOU'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight mt-1">
                    {currentProject?.title || 'Autonomous Multi-Agent RAG Research Assistant'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-mono text-[#A9B49B]">
                    <span className="px-2 py-0.5 rounded bg-obsidian text-lime border border-lime/30">
                      {currentProject?.domain || 'Generative AI & LLMs'}
                    </span>
                    <span>•</span>
                    <span>Difficulty: <strong className="text-white">{currentProject?.difficulty_level || 'Intermediate'}</strong></span>
                    <span>•</span>
                    <span>Build Time: <strong className="text-lime">{currentProject?.estimated_build_time_minutes || 60} Mins</strong></span>
                  </div>
                </div>

                {onGoToMagnet && (
                  <button
                    type="button"
                    onClick={onGoToMagnet}
                    className="btn-outline-atelier px-3.5 py-2 rounded-xl text-xs font-mono font-bold shrink-0 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 text-lime" />
                    <span>Customize in Magnet</span>
                  </button>
                )}
              </div>

              {/* Architecture & Problem Statement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#1A1B16] border border-[#3D4034] space-y-2">
                  <h4 className="text-xs font-mono text-lime font-bold uppercase">PROBLEM STATEMENT</h4>
                  <p className="text-xs text-[#EFEAE1] leading-relaxed">
                    {currentProject?.problem_statement ||
                      'Engineering teams waste hours parsing disparate API documentation and PDF whitepapers. Build a fast, local semantic retrieval agent.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#1A1B16] border border-[#3D4034] space-y-2">
                  <h4 className="text-xs font-mono text-lime font-bold uppercase">ARCHITECTURE & RUNTIME</h4>
                  <p className="text-xs text-[#EFEAE1] leading-relaxed">
                    {currentProject?.architecture_overview ||
                      'FastAPI client runtime connecting via zero-shot JSON schema prompting to Google Gemini. In-memory vector embeddings and structured citations.'}
                  </p>
                </div>
              </div>

              {/* Recommended Tech Stack */}
              <div>
                <h4 className="text-xs font-mono text-[#EFEAE1] font-bold uppercase mb-2">
                  TARGET TECH STACK & FOUNDATION MODEL
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-lg bg-lime-muted border border-lime/30 text-lime font-mono text-xs font-bold">
                    Model: {currentProject?.foundation_model || 'Gemini 3.5 Flash'}
                  </span>
                  {(currentProject?.recommended_tech_stack || ['Python', 'FastAPI', 'LangChain', 'ChromaDB']).map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 rounded-lg bg-obsidian border border-[#3D4034] text-white font-mono text-xs font-semibold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* 3-Step Live Build Roadmap */}
              <div>
                <h4 className="text-xs font-mono text-[#EFEAE1] font-bold uppercase mb-3">
                  60-MINUTE WORKSHOP BUILD STAGES
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(
                    currentProject?.three_step_build_plan || [
                      { step_number: 1, step_title: 'Document Ingestion Pipeline', description: 'Parse unstructured engineering papers into semantic chunks with token metadata.' },
                      { step_number: 2, step_title: 'Vector Retrieval Engine', description: 'Compute dense similarity vectors and extract top-3 relevant context chunks.' },
                      { step_number: 3, step_title: 'Zero-Shot JSON Synthesis', description: 'Instruct foundation model to generate cited answers with strict JSON contracts.' }
                    ]
                  ).map((step, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#1A1B16] border border-[#3D4034] space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-lime font-bold">STAGE 0{step.step_number || idx + 1}</span>
                        <span className="text-[#8D8E84]">{(idx + 1) * 20}m</span>
                      </div>
                      <h5 className="font-display font-bold text-xs text-white">{step.step_title}</h5>
                      <p className="text-[11px] text-[#A9B49B] leading-relaxed">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recruiter Placement Value */}
              <div className="p-4 rounded-xl bg-obsidian border border-lime/30 flex items-start space-x-3">
                <Award className="w-5 h-5 text-lime shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-mono text-lime font-bold uppercase">WHY RECRUITERS VALUE THIS IN INTERVIEWS</h5>
                  <p className="text-xs text-[#EFEAE1] mt-1 leading-relaxed">
                    {currentProject?.why_recruiters_value_this ||
                      'Demonstrates enterprise RAG patterns, structured LLM output contracts, token optimization, and zero-hallucination safeguards instead of trivial chat interfaces.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: PERSONALIZED CAMPUS AMBASSADOR */}
          {activeSubTab === 'ambassador' && (
            <div className="atelier-card rounded-2xl p-6 sm:p-8 border border-[#3D4034] space-y-6 bg-graphite shadow-xl animate-fadeIn">
              <div className="flex items-center space-x-3 pb-5 border-b border-[#3D4034]">
                <div className="w-12 h-12 rounded-xl bg-lime-muted border border-lime/30 flex items-center justify-center text-lime shrink-0">
                  <UserCheck className="w-6 h-6 text-lime" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-lime font-bold uppercase tracking-wider">
                    {currentAmbassador?.is_peer_invite ? 'YOUR INVITING CLASSMATE & AMBASSADOR' : 'YOUR ASSIGNED CAMPUS MENTOR'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight mt-0.5">
                    {currentAmbassador?.name || 'Rahul Verma'}
                  </h3>
                  <p className="text-xs text-[#A9B49B] font-mono">
                    {currentAmbassador?.role || 'Campus Peer Advocate'} • {currentAmbassador?.college || activeProfile?.college}
                  </p>
                </div>
              </div>

              {/* Ambassador Relationship Details */}
              <div className="rounded-xl p-5 bg-[#1A1B16] border border-[#3D4034] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#EFEAE1] font-bold">STATUS:</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-lime-muted text-lime border border-lime/30 font-bold">
                    {currentAmbassador?.badge || 'Verified Study Buddy'}
                  </span>
                </div>

                <p className="text-xs text-[#EFEAE1] leading-relaxed">
                  {currentAmbassador?.description ||
                    'You are paired with a campus advocate for the live 60-minute workshop. Both of you will build your AI capstone together and receive verified certificates.'}
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(currentAmbassador?.whatsapp_message || 'Hey! Ready for Sunday AI workshop!')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-lime py-2.5 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-obsidian" />
                    <span>CONNECT WITH {currentAmbassador?.name?.toUpperCase() || 'AMBASSADOR'}</span>
                  </a>
                </div>
              </div>

              {/* Study Buddy Workshop Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-obsidian border border-[#3D4034] space-y-1.5">
                  <span className="text-[10px] font-mono text-lime font-bold uppercase">WORKSHOP DATE</span>
                  <h5 className="font-display font-bold text-sm text-white">Sunday • 7:00 PM IST</h5>
                  <p className="text-xs text-[#A9B49B]">Live Interactive Coding & Deployment</p>
                </div>

                <div className="p-4 rounded-xl bg-obsidian border border-[#3D4034] space-y-1.5">
                  <span className="text-[10px] font-mono text-lime font-bold uppercase">MUTUAL BENEFIT</span>
                  <h5 className="font-display font-bold text-sm text-white">Cohort Collaboration</h5>
                  <p className="text-xs text-[#A9B49B]">Both seats verified; peer Q&A access unlocked</p>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: REFERRAL ENGINE & MILESTONES */}
          {activeSubTab === 'referrals' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Share & Code Header */}
              <div className="atelier-card rounded-2xl p-6 sm:p-8 border border-[#3D4034] bg-graphite shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#3D4034]">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-lime tracking-wider uppercase">
                      YOUR UNIQUE REFERRAL ATTRIBUTION
                    </span>
                    <h3 className="text-2xl font-display font-bold text-white tracking-tight mt-0.5">
                      {activeProfile?.student_name || 'Student Advocate'}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-[#A9B49B] font-mono">
                      <span>CODE: <strong className="text-lime">{activeProfile?.referral_code || stats?.referral_code || 'NXT'}</strong></span>
                      {stats?.rank && (
                        <span className="px-2 py-0.5 rounded bg-graphite-light text-white border border-[#3D4034]">
                          CAMPUS RANK #{stats.rank}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => fetchStats(activeProfile?.student_access_token)}
                    disabled={loading}
                    className="px-3.5 py-1.5 rounded-lg bg-[#1A1B16] border border-[#3D4034] hover:border-lime text-white text-xs font-mono transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-lime' : ''}`} />
                    <span>REFRESH STATS</span>
                  </button>
                </div>

                {/* Quick Share Link */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralUrl}
                    className="w-full bg-[#1A1B16] border border-[#3D4034] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white select-all focus:outline-none"
                  />
                  <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={handleCopy}
                      className="btn-lime flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'COPIED' : 'COPY LINK'}</span>
                    </button>

                    <a
                      href={`https://wa.me/?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline-atelier px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center space-x-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-lime" />
                      <span>WHATSAPP</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Metric KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="atelier-card rounded-2xl p-5 border border-[#3D4034] bg-graphite shadow-md">
                  <div className="flex items-center space-x-2 text-[#A9B49B] text-xs mb-1 font-mono">
                    <MousePointerClick className="w-4 h-4 text-lime" />
                    <span>LINK CLICKS</span>
                  </div>
                  <div className="text-3xl font-display font-bold text-white font-mono">
                    {stats?.clicks_count ?? 0}
                  </div>
                  <div className="text-[11px] text-[#A9B49B] mt-1">Unique peer visits tracked</div>
                </div>

                <div className="atelier-card rounded-2xl p-5 border border-lime/40 bg-graphite shadow-md">
                  <div className="flex items-center space-x-2 text-lime text-xs mb-1 font-mono">
                    <Users className="w-4 h-4 text-lime" />
                    <span>VERIFIED REGISTRATIONS</span>
                  </div>
                  <div className="text-3xl font-display font-bold text-lime font-mono">
                    {stats?.conversions_count ?? 0}
                  </div>
                  <div className="text-[11px] text-[#A9B49B] mt-1">Classmates confirmed via your link</div>
                </div>

                <div className="atelier-card rounded-2xl p-5 border border-[#3D4034] bg-graphite shadow-md">
                  <div className="flex items-center space-x-2 text-[#A9B49B] text-xs mb-1 font-mono">
                    <TrendingUp className="w-4 h-4 text-tangerine" />
                    <span>CONVERSION RATE</span>
                  </div>
                  <div className="text-3xl font-display font-bold text-white font-mono">
                    {stats?.conversion_rate_percentage ?? 0}%
                  </div>
                  <div className="text-[11px] text-[#A9B49B] mt-1">Click-to-seat conversion</div>
                </div>
              </div>

              {/* Milestone Rewards Unlocks */}
              <div className="atelier-card rounded-2xl p-6 sm:p-8 border border-[#3D4034] bg-graphite shadow-xl">
                <h4 className="text-sm font-display font-bold text-white mb-4 flex items-center space-x-2">
                  <Award className="w-4 h-4 text-lime" />
                  <span>Advocate Milestone Perks</span>
                </h4>

                <div className="space-y-3">
                  {(
                    stats?.milestones || [
                      { target: 3, reward: 'Priority Workshop Q&A Pass', achieved: (stats?.conversions_count ?? 0) >= 3 },
                      { target: 5, reward: 'NxtWave AI Starter Kit Blueprint', achieved: (stats?.conversions_count ?? 0) >= 5 },
                      { target: 10, reward: '1-on-1 Placement Resume Review', achieved: (stats?.conversions_count ?? 0) >= 10 }
                    ]
                  ).map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-4 rounded-xl border transition ${
                        m.achieved
                          ? 'bg-graphite-light border-lime text-white'
                          : 'bg-[#1A1B16] border-[#3D4034] text-[#A9B49B]'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                            m.achieved ? 'bg-lime text-obsidian' : 'bg-obsidian text-[#A9B49B] border border-[#3D4034]'
                          }`}
                        >
                          {m.target}
                        </div>
                        <div>
                          <div className={`text-xs font-display font-bold ${m.achieved ? 'text-lime' : 'text-white'}`}>
                            {m.reward}
                          </div>
                          <div className="text-[11px] text-[#A9B49B] font-mono">
                            Target: {m.target} verified registrations
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          m.achieved
                            ? 'bg-lime text-obsidian'
                            : 'bg-obsidian text-[#A9B49B] border border-[#3D4034]'
                        }`}
                      >
                        {m.achieved ? 'UNLOCKED' : `${stats?.conversions_count ?? 0} / ${m.target}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}