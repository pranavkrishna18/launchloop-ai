import { useState } from 'react';
import { ShieldCheck, Key, Lock, AlertCircle, Eye, EyeOff, X, Sparkles } from 'lucide-react';

export default function AdminAuthModal({ onAuthenticate, onClose, defaultError = null }) {
  const [credential, setCredential] = useState(
    localStorage.getItem('launchloop_admin_credential') || 'dev-demo-admin-passkey-change-me'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(defaultError);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanCred = credential.trim();
    if (!cleanCred) {
      setError('Please provide a valid passkey or bearer token.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      localStorage.setItem('launchloop_admin_credential', cleanCred);
      if (onAuthenticate) {
        await onAuthenticate(cleanCred);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your passkey.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = () => {
    setCredential('dev-demo-admin-passkey-change-me');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/85 backdrop-blur-sm animate-fadeIn">
      <div className="atelier-card w-full max-w-md p-6 sm:p-8 rounded-2xl border border-lime shadow-2xl relative text-left">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-soft-gray hover:text-warm-paper p-1.5 rounded-lg hover:bg-graphite-light transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-graphite-light border border-border-atelier flex items-center justify-center text-lime">
            <Lock className="w-5 h-5 text-lime" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-lime">
              RESTRICTED WORKSPACE
            </span>
            <h2 className="text-lg font-display font-bold text-warm-paper tracking-tight">
              Organizer Operations Gate
            </h2>
          </div>
        </div>

        <p className="text-xs text-soft-gray leading-relaxed mb-5">
          Access to student growth analytics, viral k-factors, and AI strategic recommendations requires organizer authorization.
        </p>

        {error && (
          <div className="mb-4 rounded-xl p-3 bg-obsidian border border-tangerine text-tangerine text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-tangerine shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-semibold text-soft-gray uppercase tracking-wider flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-lime" />
                <span>Admin Passkey or Bearer Token</span>
              </label>
              <button
                type="button"
                onClick={handleAutoFill}
                className="text-[10px] font-mono text-lime hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-fill Demo Key</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                placeholder="dev-demo-admin-passkey-change-me"
                className="w-full bg-[#1A1B16] border border-[#3D4034] rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-[#7E8075] focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime font-mono transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-soft-gray hover:text-warm-paper p-1 transition cursor-pointer"
                title={showPassword ? 'Hide passkey' : 'Show passkey'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-lime" />}
              </button>
            </div>

            <div className="mt-2 text-[11px] text-soft-gray font-mono flex items-center justify-between">
              <span>Demo passkey:</span>
              <button
                type="button"
                onClick={handleAutoFill}
                className="text-lime bg-obsidian hover:bg-graphite-light border border-border-atelier px-2 py-0.5 rounded text-[10px] transition cursor-pointer"
              >
                dev-demo-admin-passkey-change-me
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-lime py-2.5 px-4 rounded-xl font-mono font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'VERIFYING CREDENTIAL...' : 'VERIFY & UNLOCK DASHBOARD'}</span>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl text-xs font-mono text-soft-gray hover:text-warm-paper bg-obsidian border border-border-atelier transition cursor-pointer"
              >
                CANCEL
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
