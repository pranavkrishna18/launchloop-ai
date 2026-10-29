import { useState } from 'react';
import { CheckCircle2, Copy, Share2, MessageCircle, ExternalLink, ArrowRight, X, Check, UserCheck, Sparkles, BookOpen } from 'lucide-react';

export default function SuccessModal({ data, onClose, onViewStats }) {
  const [copied, setCopied] = useState(false);

  const referralUrl = data.referral_url || `http://localhost:5173/?ref=${data.referral_code}`;
  const ambassador = data?.profile?.ambassador;
  const project = data?.profile?.recommended_project;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Hey! I just registered for NxtWave's free live workshop: "Build Your First AI Project in 60 Minutes".\n\nI generated an AI project blueprint for placements! Claim your free seat and verified certificate with my invite link:\n${referralUrl}`
  );

  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg atelier-card rounded-2xl p-6 sm:p-8 border border-lime shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-soft-gray hover:text-warm-paper p-1.5 rounded-lg hover:bg-graphite-light transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Tag */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 mx-auto rounded-xl bg-lime-muted border border-lime/30 text-lime flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-lime" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-lime font-bold">
            REGISTRATION CONFIRMED // SEAT SECURED
          </span>
          <h2 className="text-2xl font-display font-bold text-warm-paper tracking-tight mt-1">
            Welcome to the Cohort, {data.student_name}!
          </h2>
          <p className="text-xs text-soft-gray mt-1 leading-relaxed">
            Your live workshop seat is reserved for <strong className="text-warm-paper">Sunday at 7:00 PM IST</strong>. Verified completion certificate included.
          </p>
        </div>

        {/* Personalized Ambassador Highlight */}
        {ambassador && (
          <div className="mb-4 rounded-xl p-3.5 bg-[#1A1B16] border border-[#3D4034] text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-lime font-bold uppercase flex items-center space-x-1.5">
                <UserCheck className="w-3.5 h-3.5 text-lime" />
                <span>{ambassador.is_peer_invite ? 'YOUR INVITING AMBASSADOR' : 'YOUR CAMPUS MENTOR'}</span>
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-lime-muted text-lime border border-lime/20">
                {ambassador.badge}
              </span>
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <div>
                <h4 className="font-display font-bold text-sm text-white">{ambassador.name}</h4>
                <p className="text-[11px] text-soft-gray">{ambassador.role} • {ambassador.college}</p>
              </div>
            </div>
            <p className="text-[11px] text-soft-gray leading-relaxed pt-1 border-t border-border-atelier">
              {ambassador.description}
            </p>
          </div>
        )}

        {/* Recommended Project Blueprint Preview */}
        {project && (
          <div className="mb-4 rounded-xl p-3.5 bg-[#1A1B16] border border-border-atelier text-xs space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-soft-gray">
              <span className="flex items-center space-x-1 text-lime font-bold">
                <Sparkles className="w-3 h-3 text-lime" />
                <span>PERSONALIZED AI CAPSTONE</span>
              </span>
              <span>60 MIN BUILD</span>
            </div>
            <h4 className="font-display font-bold text-sm text-warm-paper">{project.title}</h4>
            <div className="flex flex-wrap gap-1 pt-1">
              {(project.recommended_tech_stack || ['Python', 'FastAPI', 'Gemini']).slice(0, 4).map((tech) => (
                <span key={tech} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-graphite text-[#E5E0D3]">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Unique Referral Card */}
        <div className="bg-[#1A1B16] rounded-xl p-4 border border-[#3D4034] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#EFEAE1] font-bold">YOUR REFERRAL LINK:</span>
            <span className="font-bold text-xs text-lime bg-lime-muted px-2 py-0.5 rounded border border-lime/30">
              {data.referral_code}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={referralUrl}
              className="flex-1 bg-obsidian border border-[#3D4034] rounded-lg px-3 py-2 text-xs font-mono text-white select-all focus:outline-none"
            />
            <button
              onClick={copyToClipboard}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                copied
                  ? 'bg-lime text-obsidian'
                  : 'bg-graphite-light hover:bg-border-light text-white border border-[#3D4034]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>COPY</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-soft-gray leading-relaxed">
            Invite classmates to build capstones together. Reach <strong className="text-lime">3 verified registrations</strong> to unlock the VIP Q&A Pass!
          </p>
        </div>

        {/* Primary Action: Go to Student Portal */}
        <div className="mt-5 space-y-2.5">
          <button
            onClick={() => {
              onClose();
              if (onViewStats) onViewStats();
            }}
            className="w-full btn-lime py-3 px-4 rounded-xl font-display font-bold text-xs tracking-tight flex items-center justify-center space-x-2 cursor-pointer shadow-md"
          >
            <BookOpen className="w-4 h-4 text-obsidian" />
            <span>Open My Personalized Student Portal</span>
            <ArrowRight className="w-4 h-4 text-obsidian" />
          </button>

          <a
            href={`https://wa.me/?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl font-mono font-bold text-xs text-warm-paper bg-[#1A1B16] hover:bg-graphite-light border border-[#3D4034] transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-lime" />
            <span>SHARE ON WHATSAPP WITH FRIENDS</span>
          </a>
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-border-atelier flex items-center justify-between text-xs text-soft-gray font-mono">
          <span>Profile saved locally</span>
          <button
            onClick={onClose}
            className="text-soft-gray hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
