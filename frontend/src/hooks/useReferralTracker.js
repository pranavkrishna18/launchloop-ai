import { useState, useEffect } from 'react';
import { recordReferralClick, validateReferralCode } from '../api/registration';

export function useReferralTracker() {
  const [referralCode, setReferralCode] = useState(null);
  const [inviterName, setInviterName] = useState(null);
  const [utmParams, setUtmParams] = useState({
    utm_source: 'direct',
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
  });

  useEffect(() => {
    // 1. Parse Query Parameters
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || sessionStorage.getItem('launchloop_referral_code');
    const source = params.get('utm_source') || (ref ? 'referral' : 'direct');
    const medium = params.get('utm_medium');
    const campaign = params.get('utm_campaign');
    const content = params.get('utm_content');

    setUtmParams({
      utm_source: source,
      utm_medium: medium,
      utm_campaign: campaign,
      utm_content: content,
    });

    if (ref) {
      const cleanRef = ref.trim().toUpperCase();
      setReferralCode(cleanRef);
      sessionStorage.setItem('launchloop_referral_code', cleanRef);

      // Track click once per session for this code
      const clickKey = `launchloop_tracked_${cleanRef}`;
      if (!sessionStorage.getItem(clickKey)) {
        recordReferralClick(cleanRef).then(() => {
          sessionStorage.setItem(clickKey, 'true');
        });
      }

      // Validate code and retrieve inviter display name
      validateReferralCode(cleanRef)
        .then((data) => {
          const isValid = data?.valid || data?.is_valid;
          const name = data?.inviter_display_name || data?.inviter_name;
          if (isValid && name) {
            setInviterName(name);
          }
        })
        .catch((err) => {
          console.debug('Referral code validation failed:', err.message);
        });
    }
  }, []);

  return { referralCode, inviterName, utmParams };
}
