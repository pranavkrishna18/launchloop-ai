/**
 * API client for Organizer Campaign Analytics & AI Growth Intelligence.
 */

const API_BASE = '/api/v1/analytics';

function getAuthHeaders(authCredential) {
  const cred = authCredential || localStorage.getItem('launchloop_admin_credential') || '';
  if (!cred) return {};
  
  // If credential looks like a JWT or Bearer token
  if (cred.startsWith('Bearer ') || cred.includes('.')) {
    return {
      'Authorization': cred.startsWith('Bearer ') ? cred : `Bearer ${cred}`,
      'Content-Type': 'application/json'
    };
  }
  
  // Otherwise treat as X-Admin-Secret (for development / local evaluation)
  return {
    'X-Admin-Secret': cred,
    'Content-Type': 'application/json'
  };
}

async function handleResponse(res) {
  if (!res.ok) {
    let errorDetail = 'Request failed';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    }
    const error = new Error(errorDetail);
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export async function fetchCampaignOverview(authCredential, slug = 'ai-in-60-mins') {
  const headers = getAuthHeaders(authCredential);
  const res = await fetch(`${API_BASE}/overview?campaign_slug=${encodeURIComponent(slug)}`, {
    headers
  });
  return handleResponse(res);
}

export async function fetchDailyTrend(authCredential, slug = 'ai-in-60-mins', dateFrom = null, dateTo = null) {
  const headers = getAuthHeaders(authCredential);
  let url = `${API_BASE}/registrations/daily?campaign_slug=${encodeURIComponent(slug)}`;
  if (dateFrom) url += `&date_from=${encodeURIComponent(dateFrom)}`;
  if (dateTo) url += `&date_to=${encodeURIComponent(dateTo)}`;
  const res = await fetch(url, { headers });
  return handleResponse(res);
}

export async function fetchChannelAttribution(authCredential, slug = 'ai-in-60-mins') {
  const headers = getAuthHeaders(authCredential);
  const res = await fetch(`${API_BASE}/channels?campaign_slug=${encodeURIComponent(slug)}`, {
    headers
  });
  return handleResponse(res);
}

export async function fetchReferralAnalytics(authCredential, slug = 'ai-in-60-mins') {
  const headers = getAuthHeaders(authCredential);
  const res = await fetch(`${API_BASE}/referrals?campaign_slug=${encodeURIComponent(slug)}`, {
    headers
  });
  return handleResponse(res);
}

export async function fetchAIUsageTelemetry(authCredential) {
  const headers = getAuthHeaders(authCredential);
  const res = await fetch(`${API_BASE}/ai-usage`, { headers });
  return handleResponse(res);
}

export async function fetchCopyVariants(authCredential, slug = 'ai-in-60-mins') {
  const headers = getAuthHeaders(authCredential);
  const res = await fetch(`${API_BASE}/copy-variants?campaign_slug=${encodeURIComponent(slug)}`, {
    headers
  });
  return handleResponse(res);
}

export async function generateGrowthInsights(authCredential, slug = 'ai-in-60-mins') {
  const headers = getAuthHeaders(authCredential);
  const res = await fetch(`${API_BASE}/ai-growth-insights?campaign_slug=${encodeURIComponent(slug)}`, {
    method: 'POST',
    headers
  });
  return handleResponse(res);
}
