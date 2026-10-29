import { useState, useEffect } from 'react';
import {
  BarChart3,
  RefreshCw,
  Lock,
  LogOut,
  Calendar,
  AlertCircle,
  Database,
  CheckCircle,
  Sparkles,
  Info,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import KPICardGrid from './KPICardGrid';
import DailyTrendChart from './DailyTrendChart';
import ChannelBreakdown from './ChannelBreakdown';
import ReferralFunnel from './ReferralFunnel';
import CopyLabVariants from './CopyLabVariants';
import AIGrowthInsightsPanel from './AIGrowthInsightsPanel';
import AdminAuthModal from './AdminAuthModal';
import {
  fetchCampaignOverview,
  fetchDailyTrend,
  fetchChannelAttribution,
  fetchCopyVariants,
  fetchAIUsageTelemetry
} from '../../api/analytics';

export default function OrganizerDashboard() {
  const [authCredential, setAuthCredential] = useState(
    localStorage.getItem('launchloop_admin_credential') || ''
  );
  const [showAuthModal, setShowAuthModal] = useState(!authCredential);

  // Analytics states
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState(null);
  const [channels, setChannels] = useState(null);
  const [variants, setVariants] = useState(null);
  const [aiUsage, setAiUsage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('7d'); // '7d' | '30d' | 'all'
  const [dismissBanner, setDismissBanner] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const loadDashboardData = async (credentialToUse = authCredential) => {
    if (!credentialToUse) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate date filters
      let dateFrom = null;
      const now = new Date();
      if (dateFilter === '7d') {
        const d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFrom = d.toISOString().slice(0, 10);
      } else if (dateFilter === '30d') {
        const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFrom = d.toISOString().slice(0, 10);
      }

      const [overviewData, trendData, channelsData, variantsData, aiData] = await Promise.all([
        fetchCampaignOverview(credentialToUse),
        fetchDailyTrend(credentialToUse, 'ai-in-60-mins', dateFrom),
        fetchChannelAttribution(credentialToUse),
        fetchCopyVariants(credentialToUse),
        fetchAIUsageTelemetry(credentialToUse).catch(() => null),
      ]);

      setOverview(overviewData);
      setTrend(trendData);
      setChannels(channelsData);
      setVariants(variantsData);
      setAiUsage(aiData);
      setShowAuthModal(false);
    } catch (err) {
      const msg = (err.status === 401 || err.status === 403)
        ? 'Unauthorized: Invalid organizer passkey. Use: dev-demo-admin-passkey-change-me'
        : (err.message || 'Failed to load dashboard metrics.');
      setError(msg);
      setShowAuthModal(true);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authCredential) {
      loadDashboardData(authCredential).catch(() => {});
    }
  }, [authCredential, dateFilter]);

  const handleAuthenticated = async (newCred) => {
    setAuthCredential(newCred);
    await loadDashboardData(newCred);
  };

  const handleLogout = () => {
    localStorage.removeItem('launchloop_admin_credential');
    setAuthCredential('');
    setOverview(null);
    setShowAuthModal(true);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-atelier">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-graphite-light border border-border-atelier flex items-center justify-center text-lime">
              <BarChart3 className="w-4 h-4 text-lime" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-warm-paper tracking-tight">
              Organizer Growth Analytics
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-soft-gray mt-1 font-mono">
            Campaign: Build Your First AI Project in 60 Minutes • Target: 500 Registrations • ₹2,000 Allocated Budget
          </p>
        </div>

        {/* Controls: Date range, Refresh, Telemetry status, Logout */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Telemetry Status Badge */}
          {overview && (
            <div
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border ${
                overview.data_status === 'live'
                  ? 'bg-lime-muted text-lime border-lime/30'
                  : 'bg-graphite-light text-tangerine border-tangerine/30'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>
                {overview.data_status === 'live' ? 'LIVE SUPABASE SYNC' : 'SCHEMA PENDING'}
              </span>
            </div>
          )}

          {/* Date Filter */}
          <div className="flex items-center bg-obsidian border border-border-atelier rounded-xl p-1 text-xs font-mono">
            <button
              onClick={() => setDateFilter('7d')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                dateFilter === '7d' ? 'bg-lime text-obsidian' : 'text-soft-gray hover:text-warm-paper'
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setDateFilter('30d')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                dateFilter === '30d' ? 'bg-lime text-obsidian' : 'text-soft-gray hover:text-warm-paper'
              }`}
            >
              30D
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                dateFilter === 'all' ? 'bg-lime text-obsidian' : 'text-soft-gray hover:text-warm-paper'
              }`}
            >
              ALL
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => loadDashboardData()}
            disabled={loading}
            className="p-2 rounded-xl bg-obsidian hover:bg-graphite-light border border-border-atelier text-warm-paper transition disabled:opacity-50 cursor-pointer"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Logout / Switch credentials */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-obsidian hover:bg-graphite-light hover:text-tangerine border border-border-atelier text-soft-gray transition cursor-pointer"
            title="Lock Dashboard / Change Credentials"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="rounded-xl p-4 bg-obsidian border border-tangerine text-tangerine text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-tangerine shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setShowAuthModal(true)}
            className="underline font-mono font-semibold hover:text-warm-paper ml-2"
          >
            Re-authenticate
          </button>
        </div>
      )}

      {/* Schema Pending Guidance Banner */}
      {overview && overview.data_status === 'schema_pending' && !dismissBanner && (
        <div className="rounded-xl p-4 sm:p-5 bg-[#1A1B16] border border-tangerine/60 text-white text-xs space-y-3 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-tangerine shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <strong className="text-tangerine font-display text-sm font-bold">Supabase Cloud Schema Pending</strong>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-lime-muted text-lime border border-lime/30 font-bold">
                    DEMO STORE ACTIVE
                  </span>
                </div>
                <p className="text-xs text-[#EFEAE1] leading-relaxed">
                  Your Supabase credentials are valid and connected. Currently running in <strong>high-fidelity development mode</strong> (all registrations, peer invites, and AI insights work in real-time). To activate permanent Supabase PostgreSQL storage, execute the setup script in your Supabase SQL Editor.
                </p>
              </div>
            </div>

            <button
              onClick={() => setDismissBanner(true)}
              className="text-[#8D8E84] hover:text-white p-1 rounded-lg hover:bg-graphite text-xs font-mono transition"
              title="Dismiss banner"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#3D4034]">
            <a
              href="https://supabase.com/dashboard/project/alspsjdgtacgmacrzmfh/sql/new"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-lime py-1.5 px-3.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5 text-obsidian" />
              <span>Open Supabase SQL Editor</span>
            </a>

            <button
              onClick={() => {
                const sqlPath = 'database/RUN_ALL_IN_SUPABASE.sql';
                fetch('/' + sqlPath)
                  .then(r => r.text())
                  .catch(() => {
                    return `-- Copy and run database/RUN_ALL_IN_SUPABASE.sql in Supabase SQL editor`;
                  })
                  .then(text => {
                    navigator.clipboard.writeText(text);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 3000);
                  });
              }}
              className="btn-outline-atelier py-1.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 cursor-pointer"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-lime" /> : <Copy className="w-3.5 h-3.5 text-lime" />}
              <span>{copiedSql ? 'SQL COPIED TO CLIPBOARD!' : 'Copy database/RUN_ALL_IN_SUPABASE.sql'}</span>
            </button>

            <button
              onClick={() => setDismissBanner(true)}
              className="py-1.5 px-3 rounded-lg text-xs font-mono text-[#8D8E84] hover:text-white transition ml-auto"
            >
              Keep Demo Mode & Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !overview && (
        <div className="py-20 text-center space-y-3 font-mono">
          <div className="w-8 h-8 border-2 border-border-atelier border-t-lime rounded-full animate-spin mx-auto" />
          <p className="text-xs text-soft-gray">LOADING CAMPAIGN ANALYTICS...</p>
        </div>
      )}

      {/* Dashboard Body */}
      {overview && (
        <div className="space-y-8">
          {/* 1. Core KPIs */}
          <KPICardGrid data={overview} />

          {/* 2. Daily Trend Chart */}
          <DailyTrendChart trendData={trend} />

          {/* 3. Channel Breakdown & Funnel Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChannelBreakdown data={channels} />
            <ReferralFunnel funnelData={overview.funnel} />
          </div>

          {/* 4. Copy Lab Variants */}
          <CopyLabVariants variantsData={variants} />

          {/* 5. AI Growth Intelligence Panel */}
          <AIGrowthInsightsPanel authCredential={authCredential} />

          {/* 6. AI Invocations Telemetry Bar */}
          {aiUsage && (
            <div className="rounded-xl p-4 bg-obsidian border border-border-atelier text-[11px] font-mono text-soft-gray flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-lime" />
                <span>
                  <strong className="text-warm-paper">AI Magnet Telemetry:</strong> {aiUsage.total_requests} total invocations • {aiUsage.fallback_rate_percentage}% fallback rate • {aiUsage.avg_latency_ms}ms avg latency
                </span>
              </div>
              <span className="text-soft-gray">
                Source: <code className="text-lime">ai_generation_logs</code>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Organizer Auth Modal */}
      {showAuthModal && (
        <AdminAuthModal
          onAuthenticate={handleAuthenticated}
          onClose={overview ? () => setShowAuthModal(false) : null}
          defaultError={error}
        />
      )}
    </div>
  );
}
