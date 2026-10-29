/**
 * Utility for persisting and switching multiple student cohort profiles in localStorage.
 * Ensures each registered student retains their personalized recommended project,
 * their assigned or inviting ambassador, verified workshop seat, and referral metrics.
 */

const PROFILES_KEY = 'launchloop_student_profiles';
const ACTIVE_TOKEN_KEY = 'launchloop_active_token';

// Curated capstone project blueprints by degree / technical interest
const DOMAIN_BLUEPRINTS = {
  'Generative AI & LLMs': {
    title: 'Autonomous Multi-Agent RAG Research Assistant',
    domain: 'Generative AI & LLMs',
    difficulty_level: 'Intermediate',
    estimated_build_time_minutes: 60,
    problem_statement: 'Engineering teams waste hours parsing disparate API documentation and PDF whitepapers. Build a fast, local semantic retrieval agent that synthesizes accurate citations.',
    architecture_overview: 'FastAPI client runtime connecting via zero-shot JSON schema prompting to Google Gemini Flash. Vector embeddings with in-memory cosine similarity and structured source attribution.',
    why_recruiters_value_this: 'Demonstrates enterprise RAG patterns, structured LLM output contracts, token optimization, and zero hallucination safeguards instead of trivial chat interfaces.',
    foundation_model: 'Gemini 3.5 Flash / Claude Sonnet',
    recommended_tech_stack: ['Python', 'FastAPI', 'LangChain', 'ChromaDB'],
    three_step_build_plan: [
      { step_number: 1, step_title: 'Document Ingestion & Chunking Pipeline', description: 'Parse unstructured engineering whitepapers into semantic token windows with metadata.' },
      { step_number: 2, step_title: 'Vector Embedding & Query Retrieval Engine', description: 'Compute dense similarity vectors and extract top-3 relevant context chunks for synthesis.' },
      { step_number: 3, step_title: 'Zero-Shot JSON Synthesis & Grounding Guardrails', description: 'Instruct foundation model to generate cited answers with strict JSON contract.' },
    ]
  },
  'Computer Vision': {
    title: 'Edge AI Visual Defect Inspector & Quality Classifier',
    domain: 'Computer Vision',
    difficulty_level: 'Intermediate',
    estimated_build_time_minutes: 60,
    problem_statement: 'Manual manufacturing quality inspection is error-prone. Build a real-time visual inspection classifier running at 30 FPS on standard webcam frames.',
    architecture_overview: 'Lightweight OpenCV preprocessing pipeline streaming tensor frames to a quantized MobileNet / YOLO model with sub-50ms inference latency.',
    why_recruiters_value_this: 'Demonstrates low-latency edge AI processing, camera frame buffer management, and production inference optimization.',
    foundation_model: 'YOLOv8-nano / MobileNetV3',
    recommended_tech_stack: ['Python', 'OpenCV', 'PyTorch', 'FastAPI'],
    three_step_build_plan: [
      { step_number: 1, step_title: 'Video Stream Capture & Tensor Normalization', description: 'Capture 720p stream, crop region of interest, and normalize RGB pixel tensors.' },
      { step_number: 2, step_title: 'Quantized Edge Inference Pipeline', description: 'Run feedforward evaluation with confidence thresholding and bounding-box drawing.' },
      { step_number: 3, step_title: 'Telemetry Event Dispatcher & Alert Webhook', description: 'Log defect detections to local JSON event log and trigger threshold alerts.' },
    ]
  },
  'Web & Fullstack AI': {
    title: 'Automated Fullstack Code Security & Vulnerability Auditor',
    domain: 'Web & Fullstack AI',
    difficulty_level: 'Intermediate',
    estimated_build_time_minutes: 60,
    problem_statement: 'Junior developers frequently introduce SQL injection and hardcoded API keys into repositories. Build an automated PR code reviewer.',
    architecture_overview: 'GitHub webhook consumer parsing unified diffs, running AST static analysis, and querying Gemini for targeted remediation snippets.',
    why_recruiters_value_this: 'Proves understanding of CI/CD developer tooling, AST parsing, and actionable LLM developer assistance with code diffs.',
    foundation_model: 'Gemini 3.5 Flash',
    recommended_tech_stack: ['JavaScript', 'React', 'Node.js', 'FastAPI'],
    three_step_build_plan: [
      { step_number: 1, step_title: 'Git Diff Parser & Syntax Highlighter', description: 'Extract added and removed line chunks from pull requests with line numbers.' },
      { step_number: 2, step_title: 'Security Vulnerability Heuristic Scanner', description: 'Scan for hardcoded secrets, dangerous evals, and unparameterized SQL queries.' },
      { step_number: 3, step_title: 'One-Click AI Remediation Patch Generator', description: 'Generate unified git patch suggestions with explanations of the security risk.' },
    ]
  }
};

/**
 * Returns a tailored AI project blueprint matching student interests or default domain.
 */
export function getTailoredProject(interests, techStack, college) {
  if (Array.isArray(interests) && interests.length > 0) {
    for (const interest of interests) {
      if (DOMAIN_BLUEPRINTS[interest]) {
        return DOMAIN_BLUEPRINTS[interest];
      }
    }
  }
  if (Array.isArray(techStack)) {
    if (techStack.includes('OpenCV') || techStack.includes('PyTorch')) {
      return DOMAIN_BLUEPRINTS['Computer Vision'];
    }
    if (techStack.includes('React') || techStack.includes('JavaScript') || techStack.includes('Node.js')) {
      return DOMAIN_BLUEPRINTS['Web & Fullstack AI'];
    }
  }
  return DOMAIN_BLUEPRINTS['Generative AI & LLMs'];
}

/**
 * Generates personalized ambassador details for a student.
 */
export function getPersonalizedAmbassador(referralCodeUsed, inviterName, studentCollege) {
  if (referralCodeUsed) {
    const displayName = inviterName || `Campus Advocate (${referralCodeUsed})`;
    return {
      is_peer_invite: true,
      name: displayName,
      role: 'Classmate & Campus Peer Advocate',
      college: studentCollege || 'Engineering College',
      badge: 'Verified Peer Inviter',
      code: referralCodeUsed,
      description: `You were invited by ${displayName} using code ${referralCodeUsed}. You are in the same cohort and can team up for the 60-minute build!`,
      whatsapp_message: `Hey ${displayName}! I just registered using your NxtWave referral link (${referralCodeUsed}). Let's build our AI capstone together this Sunday at 7:00 PM!`
    };
  }

  // Default Assigned Senior Campus Mentor for direct registrations
  const collegeMentors = [
    { name: 'Arjun Reddy', college: studentCollege || 'Engineering College', role: 'NxtWave Senior Placement Fellow' },
    { name: 'Ananya Sharma', college: studentCollege || 'Engineering College', role: 'AI Track Lead & Campus Mentor' },
  ];
  const mentor = collegeMentors[Math.abs((studentCollege || '').length) % collegeMentors.length];

  return {
    is_peer_invite: false,
    name: mentor.name,
    role: mentor.role,
    college: mentor.college,
    badge: 'Assigned Campus Cohort Mentor',
    code: 'NXT-COHORT',
    description: `Assigned as your dedicated NxtWave mentor for ${studentCollege || 'your college'}. Available for live Q&A and project guidance during the workshop.`,
    whatsapp_message: `Hi ${mentor.name}, I'm registered for Sunday's NxtWave 60-minute AI workshop from ${studentCollege || 'college'}. Looking forward to connecting!`
  };
}

/**
 * Retrieves all saved student profiles from localStorage.
 */
export function getStudentProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse student profiles from storage:', err);
    return [];
  }
}

/**
 * Retrieves the currently active student profile.
 */
export function getActiveStudentProfile() {
  const profiles = getStudentProfiles();
  if (profiles.length === 0) return null;

  const activeToken = localStorage.getItem(ACTIVE_TOKEN_KEY);
  if (activeToken) {
    const match = profiles.find((p) => p.student_access_token === activeToken);
    if (match) return match;
  }

  return profiles[0]; // default to latest / first profile
}

/**
 * Sets the active student profile by token.
 */
export function setActiveStudentProfile(token) {
  if (!token) return;
  localStorage.setItem(ACTIVE_TOKEN_KEY, token);

  const profiles = getStudentProfiles();
  const active = profiles.find((p) => p.student_access_token === token);
  if (active) {
    localStorage.setItem('launchloop_student_token', active.student_access_token);
    localStorage.setItem('launchloop_student_name', active.student_name);
    localStorage.setItem('launchloop_student_code', active.referral_code);
  }

  // Broadcast change to all UI subscribers
  window.dispatchEvent(new CustomEvent('launchloop_profile_updated', { detail: active }));
  return active;
}

/**
 * Saves a new student profile without overwriting existing ones.
 * Automatically marks this student as active.
 */
export function saveStudentProfile(registrationResponse, payload, recommendationData = null, inviterName = null) {
  const profiles = getStudentProfiles();

  const token = registrationResponse.student_access_token;
  if (!token) return null;

  // Determine personalized project blueprint
  const projectBlueprint = recommendationData?.project || recommendationData || getTailoredProject(
    payload.interests,
    payload.technologies_known,
    payload.college
  );

  // Determine personalized ambassador
  const ambassador = getPersonalizedAmbassador(
    payload.referral_code_used,
    inviterName,
    payload.college
  );

  const newProfile = {
    student_access_token: token,
    registration_id: registrationResponse.registration_id,
    student_name: registrationResponse.student_name,
    email: registrationResponse.email,
    college: payload.college,
    graduation_year: payload.graduation_year,
    referral_code: registrationResponse.referral_code,
    referral_url: registrationResponse.referral_url,
    referral_code_used: payload.referral_code_used || null,
    registered_at: new Date().toISOString(),
    recommended_project: projectBlueprint,
    ambassador: ambassador,
  };

  // Upsert profile
  const existingIdx = profiles.findIndex(
    (p) => p.student_access_token === token || p.email === newProfile.email
  );

  if (existingIdx >= 0) {
    profiles[existingIdx] = { ...profiles[existingIdx], ...newProfile };
  } else {
    profiles.unshift(newProfile); // Prepend so new one is first
  }

  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  setActiveStudentProfile(token);

  return newProfile;
}

/**
 * Clears stored profiles (for testing resets if needed).
 */
export function clearStudentProfiles() {
  localStorage.removeItem(PROFILES_KEY);
  localStorage.removeItem(ACTIVE_TOKEN_KEY);
  localStorage.removeItem('launchloop_student_token');
  localStorage.removeItem('launchloop_student_name');
  localStorage.removeItem('launchloop_student_code');
  window.dispatchEvent(new CustomEvent('launchloop_profile_updated', { detail: null }));
}
