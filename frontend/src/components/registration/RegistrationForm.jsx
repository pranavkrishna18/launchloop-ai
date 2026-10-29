import { useState, useEffect } from 'react';
import { User, Mail, GraduationCap, Building2, Tag, ArrowRight, AlertCircle, Sparkles, Check, Shield } from 'lucide-react';
import { registerStudent } from '../../api/registration';
import { useReferralTracker } from '../../hooks/useReferralTracker';
import { saveStudentProfile } from '../../utils/studentStorage';

export default function RegistrationForm({ onSuccess, prefillInterests, prefillTech, prefillProject }) {
  const { referralCode: trackedRefCode, inviterName, utmParams } = useReferralTracker();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    college: '',
    graduation_year: 2026,
    referral_code_used: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [duplicateNotice, setDuplicateNotice] = useState(null);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (trackedRefCode) {
      setFormData((prev) => ({
        ...prev,
        referral_code_used: trackedRefCode,
      }));
    }
  }, [trackedRefCode]);

  const validate = () => {
    const errs = {};
    if (!formData.full_name || formData.full_name.trim().length < 2) {
      errs.full_name = 'Provide your full name (min 2 characters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Provide a valid university or personal email.';
    }
    if (!formData.college || formData.college.trim().length < 2) {
      errs.college = 'Provide your engineering college or institute.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDuplicateNotice(null);
    setServerError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        college: formData.college.trim(),
        graduation_year: parseInt(formData.graduation_year, 10),
        referral_code_used: formData.referral_code_used?.trim() || null,
        utm_source: utmParams.utm_source || 'direct',
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
        utm_content: utmParams.utm_content,
        interests: prefillInterests || null,
        technologies_known: prefillTech || null,
      };

      const response = await registerStudent(payload);

      // Save student profile in multi-student store without overwriting previous users
      const savedProfile = saveStudentProfile(response, payload, prefillProject || null, inviterName);

      onSuccess({
        ...response,
        payload,
        inviterName,
        profile: savedProfile
      });
    } catch (err) {
      if (err.status === 409 || err.details?.code === 'DUPLICATE_REGISTRATION') {
        const existingCode = err.details?.existing_referral_code || 'NXT';
        setDuplicateNotice({
          message: err.message || 'You have already registered for this workshop cohort.',
          existingCode,
        });
      } else {
        const msg = err.details?.message || err.message || 'Registration failed. Check your network connection and retry.';
        setServerError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Referral Attribution Banner if arriving via peer link */}
      {trackedRefCode && (
        <div className="rounded-xl p-3.5 bg-obsidian border border-lime text-xs text-warm-paper flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
            <span>
              Invited by <strong className="text-lime">{inviterName || 'Classmate'}</strong> (Code: <code className="font-mono text-lime font-bold">{trackedRefCode}</code>)
            </span>
          </div>
          <span className="text-[10px] font-mono text-lime bg-lime-muted px-2 py-0.5 rounded uppercase">
            VERIFIED PEER INVITE
          </span>
        </div>
      )}

      {/* Prefilled Tech Indicator from AI Project Magnet */}
      {prefillTech && prefillTech.length > 0 && (
        <div className="rounded-xl p-3 bg-obsidian border border-border-atelier text-xs flex items-center space-x-2">
          <span className="text-lime font-mono text-[10px] uppercase font-bold">PROJECT TARGET:</span>
          <div className="flex flex-wrap gap-1">
            {prefillTech.map((t) => (
              <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-graphite-light text-warm-paper">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Duplicate Registration Notice */}
      {duplicateNotice && (
        <div className="rounded-xl p-4 bg-obsidian border border-tangerine text-xs text-warm-paper space-y-2">
          <div className="flex items-center space-x-2 text-tangerine font-mono font-bold">
            <AlertCircle className="w-4 h-4" />
            <span>REGISTRATION ALREADY ACTIVE</span>
          </div>
          <p className="text-soft-gray">{duplicateNotice.message}</p>
          <div className="pt-1">
            <span className="text-soft-gray text-[11px]">Your existing referral code: </span>
            <code className="font-mono text-lime font-bold bg-graphite-light px-2 py-0.5 rounded">
              {duplicateNotice.existingCode}
            </code>
          </div>
        </div>
      )}

      {/* Server Error Notice */}
      {serverError && (
        <div className="rounded-xl p-3.5 bg-obsidian border border-tangerine text-xs text-tangerine flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-mono font-bold text-[#EFEAE1] uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-lime" />
            <span>Full Name (for certificate)</span>
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="e.g. Rahul Sharma"
            className="w-full bg-[#1A1B16] border border-[#3D4034] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#7E8075] focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime font-sans transition"
            required
          />
          {errors.full_name && (
            <p className="mt-1 text-xs text-tangerine font-mono">{errors.full_name}</p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-mono font-bold text-[#EFEAE1] uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
            <Mail className="w-3.5 h-3.5 text-lime" />
            <span>Email Address (workshop link sent here)</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="e.g. rahul@college.edu"
            className="w-full bg-[#1A1B16] border border-[#3D4034] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#7E8075] focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime font-sans transition"
            required
          />
          {errors.email && (
            <p className="mt-1 text-xs text-tangerine font-mono">{errors.email}</p>
          )}
        </div>

        {/* College & Graduation Year Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono font-bold text-[#EFEAE1] uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-lime" />
              <span>College / University</span>
            </label>
            <input
              type="text"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              placeholder="e.g. IIT Madras, BITS Pilani"
              className="w-full bg-[#1A1B16] border border-[#3D4034] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#7E8075] focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime font-sans transition"
              required
            />
            {errors.college && (
              <p className="mt-1 text-xs text-tangerine font-mono">{errors.college}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#EFEAE1] uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-lime" />
              <span>Grad Year</span>
            </label>
            <select
              value={formData.graduation_year}
              onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
              className="w-full bg-[#1A1B16] border border-[#3D4034] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime font-mono transition cursor-pointer"
            >
              <option value={2024} className="bg-[#24251F] text-white">2024</option>
              <option value={2025} className="bg-[#24251F] text-white">2025</option>
              <option value={2026} className="bg-[#24251F] text-white">2026 (Final Year)</option>
              <option value={2027} className="bg-[#24251F] text-white">2027</option>
              <option value={2028} className="bg-[#24251F] text-white">2028</option>
            </select>
          </div>
        </div>

        {/* Optional Referral Code field */}
        <div>
          <label className="block text-xs font-mono font-bold text-[#EFEAE1] uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
            <Tag className="w-3.5 h-3.5 text-lime" />
            <span>Referral Code (Optional)</span>
          </label>
          <input
            type="text"
            value={formData.referral_code_used}
            onChange={(e) => setFormData({ ...formData, referral_code_used: e.target.value })}
            placeholder="e.g. NXT7X9"
            className="w-full bg-[#1A1B16] border border-[#3D4034] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#7E8075] focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime font-mono transition"
            maxLength={20}
          />
        </div>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="p-3 rounded-xl bg-obsidian border border-border-atelier flex items-start space-x-2 text-[11px] text-soft-gray leading-relaxed">
        <Shield className="w-4 h-4 text-lime shrink-0 mt-0.5" />
        <span>
          Strict privacy architecture: Data is used solely for workshop logistics and verified certificate issuance. IP addresses are hashed using salted SHA-256 and never retained in raw text.
        </span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full btn-lime py-3.5 px-6 rounded-xl font-display font-bold text-sm tracking-tight flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" />
            <span className="font-mono text-xs uppercase">Securing Your Cohort Seat...</span>
          </>
        ) : (
          <>
            <span>Confirm Free Workshop Registration</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </>
        )}
      </button>
    </form>
  );
}
