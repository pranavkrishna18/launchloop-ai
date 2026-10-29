/**
 * API methods for student registration and referral tracking.
 */

import { apiClient } from './client';

/**
 * Registers student for workshop and generates referral link.
 */
export async function registerStudent(payload) {
  return apiClient('/registrations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Records referral link click attribution.
 */
export async function recordReferralClick(referralCode) {
  try {
    return await apiClient('/referrals/click', {
      method: 'POST',
      body: JSON.stringify({ referral_code: referralCode }),
    });
  } catch (err) {
    console.warn('Click attribution error:', err.message);
    return null;
  }
}

/**
 * Validates a referral code and retrieves inviter display name.
 */
export async function validateReferralCode(code) {
  return apiClient(`/referrals/validate/${encodeURIComponent(code)}`);
}

/**
 * Retrieves protected personal referral stats for authenticated student.
 */
export async function getStudentReferralStats(token) {
  return apiClient('/referrals/stats', {
    headers: {
      'X-Student-Token': token,
    },
  });
}

/**
 * Retrieves public campus advocate leaderboard.
 */
export async function getLeaderboard(limit = 10) {
  return apiClient(`/referrals/leaderboard?limit=${limit}`);
}
