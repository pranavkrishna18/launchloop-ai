/**
 * API methods for the AI Project Magnet feature.
 */

import { apiClient } from './client';

/**
 * Submits student preferences and retrieves tailored AI project recommendation.
 * @param {Object} payload { interests: string[], skill_level: string, technologies_known: string[], career_goal: string }
 */
export async function getProjectRecommendation(payload) {
  return apiClient('/magnet/recommend', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Retrieves public configuration and allowed domain lists.
 */
export async function getMagnetConfig() {
  return apiClient('/magnet/config');
}
