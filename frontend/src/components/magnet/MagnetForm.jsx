import { useState } from 'react';
import { Sparkles, Code2, Compass, Award, Plus, X, ArrowRight, Check, Terminal } from 'lucide-react';

const POPULAR_DOMAINS = [
  'Generative AI & LLMs',
  'Computer Vision',
  'Natural Language Processing',
  'Web & Fullstack AI',
  'Healthcare AI',
  'FinTech & Trading',
  'Cybersecurity AI',
  'IoT & Embedded AI',
];

const COMMON_TECHS = [
  'Python',
  'JavaScript',
  'React',
  'FastAPI',
  'OpenCV',
  'PyTorch',
  'Node.js',
  'SQL',
  'HTML/CSS',
];

const STARTER_GOALS = [
  'Build an impressive AI capstone project for campus placement drives',
  'Build and deploy my first real-world deep learning portfolio app',
  'Prepare for AI/ML engineering interviews at top product startups',
  'Learn practical LLM application development from scratch',
];

export default function MagnetForm({ onSubmit, loading }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [interests, setInterests] = useState(['Generative AI & LLMs']);
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [technologies, setTechnologies] = useState(['Python']);
  const [customTech, setCustomTech] = useState('');
  const [careerGoal, setCareerGoal] = useState(
    'Build an impressive AI capstone project for campus placement drives'
  );
  const [errors, setErrors] = useState({});

  const toggleInterest = (domain) => {
    if (interests.includes(domain)) {
      if (interests.length > 1) {
        setInterests(interests.filter((i) => i !== domain));
      }
    } else {
      if (interests.length < 5) {
        setInterests([...interests, domain]);
      }
    }
  };

  const toggleTech = (tech) => {
    if (technologies.includes(tech)) {
      if (technologies.length > 1) {
        setTechnologies(technologies.filter((t) => t !== tech));
      }
    } else {
      if (technologies.length < 8) {
        setTechnologies([...technologies, tech]);
      }
    }
  };

  const handleAddCustomTech = (e) => {
    e.preventDefault();
    const trimmed = customTech.trim();
    if (trimmed && !technologies.includes(trimmed) && technologies.length < 8) {
      setTechnologies([...technologies, trimmed]);
      setCustomTech('');
    }
  };

  const removeTech = (tech) => {
    if (technologies.length > 1) {
      setTechnologies(technologies.filter((t) => t !== tech));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (interests.length === 0) {
      newErrors.interests = 'Select at least 1 area of interest.';
    }
    if (technologies.length === 0) {
      newErrors.technologies = 'Specify at least 1 technology you know.';
    }
    if (!careerGoal || careerGoal.trim().length < 5) {
      newErrors.careerGoal = 'Share your career or learning goal (min 5 characters).';
    } else if (careerGoal.trim().length > 300) {
      newErrors.careerGoal = 'Goal cannot exceed 300 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        interests,
        skill_level: skillLevel,
        technologies_known: technologies,
        career_goal: careerGoal.trim(),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Step Navigation Bar */}
      <div className="flex items-center justify-between border-b border-border-atelier pb-4">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-center space-x-1.5 text-xs font-mono transition ${
              currentStep === 1
                ? 'text-lime font-bold'
                : 'text-soft-gray hover:text-warm-paper'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              currentStep === 1 ? 'bg-lime text-obsidian font-bold' : 'bg-graphite-light text-soft-gray'
            }`}>
              01
            </span>
            <span className="hidden sm:inline">DOMAIN</span>
          </button>

          <span className="text-border-atelier font-mono">/</span>

          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`flex items-center space-x-1.5 text-xs font-mono transition ${
              currentStep === 2
                ? 'text-lime font-bold'
                : 'text-soft-gray hover:text-warm-paper'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              currentStep === 2 ? 'bg-lime text-obsidian font-bold' : 'bg-graphite-light text-soft-gray'
            }`}>
              02
            </span>
            <span className="hidden sm:inline">STACK & LEVEL</span>
          </button>

          <span className="text-border-atelier font-mono">/</span>

          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className={`flex items-center space-x-1.5 text-xs font-mono transition ${
              currentStep === 3
                ? 'text-lime font-bold'
                : 'text-soft-gray hover:text-warm-paper'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              currentStep === 3 ? 'bg-lime text-obsidian font-bold' : 'bg-graphite-light text-soft-gray'
            }`}>
              03
            </span>
            <span className="hidden sm:inline">OBJECTIVE</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-soft-gray">
          STEP {currentStep} OF 3
        </span>
      </div>

      {/* STEP 1: AI DOMAIN FOCUS */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-fadeIn">
          <div>
            <label className="block text-sm font-display font-bold text-warm-paper mb-1 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-lime" />
                <span>Select Target AI Domains</span>
              </span>
              <span className="text-xs font-mono text-soft-gray">
                {interests.length} / 5 selected
              </span>
            </label>
            <p className="text-xs text-soft-gray mb-3">
              Choose the problem spaces you want to build a capstone in.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {POPULAR_DOMAINS.map((domain) => {
                const isSelected = interests.includes(domain);
                return (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => toggleInterest(domain)}
                    className={`p-3 rounded-xl text-left text-xs font-medium transition flex flex-col justify-between h-20 ${
                      isSelected
                        ? 'bg-graphite-light border-2 border-lime text-warm-paper shadow-sm'
                        : 'bg-obsidian border border-border-atelier text-soft-gray hover:border-border-light hover:text-warm-paper'
                    }`}
                  >
                    <span className="font-semibold text-xs leading-snug">{domain}</span>
                    <div className="flex justify-end">
                      {isSelected ? (
                        <span className="w-4 h-4 rounded-full bg-lime text-obsidian flex items-center justify-center text-[10px]">
                          ✓
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-border-atelier" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.interests && (
              <p className="mt-2 text-xs text-tangerine font-mono">{errors.interests}</p>
            )}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="btn-lime py-2.5 px-5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 cursor-pointer"
            >
              <span>CONTINUE TO STACK</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SKILL LEVEL & TECH STACK */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-fadeIn">
          {/* Skill Level Selection */}
          <div>
            <label className="block text-sm font-display font-bold text-warm-paper mb-1 flex items-center space-x-2">
              <Award className="w-4 h-4 text-lime" />
              <span>Current Technical Proficiency</span>
            </label>
            <p className="text-xs text-soft-gray mb-3">
              We adjust prompt depth and starter code complexity accordingly.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'beginner',
                  title: 'Beginner',
                  desc: 'Know fundamental loops & syntax; ready to write my first AI inference script.',
                  tag: 'LEVEL // 01'
                },
                {
                  id: 'intermediate',
                  title: 'Intermediate',
                  desc: 'Built web/backend applications; looking to integrate structured LLM pipelines.',
                  tag: 'LEVEL // 02'
                },
                {
                  id: 'advanced',
                  title: 'Advanced',
                  desc: 'Comfortable with API architectures; looking to design specialized capstone systems.',
                  tag: 'LEVEL // 03'
                },
              ].map((level) => {
                const isSelected = skillLevel === level.id;
                return (
                  <div
                    key={level.id}
                    onClick={() => setSkillLevel(level.id)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-graphite-light border-2 border-lime text-warm-paper'
                        : 'bg-obsidian border-border-atelier text-soft-gray hover:border-border-light hover:text-warm-paper'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display font-bold text-sm text-warm-paper">{level.title}</span>
                      <span className="text-[10px] font-mono text-lime bg-lime-muted px-1.5 py-0.5 rounded">
                        {level.tag}
                      </span>
                    </div>
                    <p className="text-xs text-soft-gray leading-relaxed">{level.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Known Technologies */}
          <div>
            <label className="block text-sm font-display font-bold text-warm-paper mb-1 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-lime" />
                <span>Technologies You Know</span>
              </span>
              <span className="text-xs font-mono text-soft-gray">
                {technologies.length} / 8 selected
              </span>
            </label>
            <p className="text-xs text-soft-gray mb-3">
              We ensure the project recommendation matches your existing comfort zone.
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {COMMON_TECHS.map((tech) => {
                const isSelected = technologies.includes(tech);
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleTech(tech)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                      isSelected
                        ? 'bg-lime text-obsidian font-bold border border-lime'
                        : 'bg-obsidian border border-border-atelier text-soft-gray hover:border-border-light hover:text-warm-paper'
                    }`}
                  >
                    {tech}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag input */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={customTech}
                onChange={(e) => setCustomTech(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCustomTech(e);
                }}
                placeholder="Add another technology (e.g. Docker, Flutter, PostgreSQL)..."
                className="flex-1 bg-[#1A1B16] border border-[#3D4034] rounded-lg px-3 py-2 text-xs text-white placeholder-[#7E8075] focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime font-mono transition"
                maxLength={30}
              />
              <button
                type="button"
                onClick={handleAddCustomTech}
                disabled={!customTech.trim() || technologies.length >= 8}
                className="px-3.5 py-2 rounded-lg bg-graphite-light hover:bg-border-light text-warm-paper text-xs font-mono transition disabled:opacity-40 flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Active Tags list */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {technologies.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-graphite-light border border-border-atelier text-xs font-mono text-warm-paper"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => removeTech(t)}
                    className="hover:text-tangerine ml-1 text-soft-gray"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            {errors.technologies && (
              <p className="mt-2 text-xs text-tangerine font-mono">{errors.technologies}</p>
            )}
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="btn-outline-atelier py-2.5 px-4 rounded-xl text-xs font-mono"
            >
              ← BACK
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="btn-lime py-2.5 px-5 rounded-xl text-xs font-mono font-bold flex items-center space-x-2 cursor-pointer"
            >
              <span>CONTINUE TO OBJECTIVE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CAREER OBJECTIVE & SUBMIT */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <label className="block text-sm font-display font-bold text-warm-paper mb-1 flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-lime" />
                <span>What is your placement or project goal?</span>
              </span>
              <span className="text-xs font-mono text-soft-gray">
                {careerGoal.length}/300 chars
              </span>
            </label>
            <p className="text-xs text-soft-gray mb-3">
              We tailor the problem statement and scope around this exact milestone.
            </p>

            <textarea
              rows={3}
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              placeholder="E.g., I want to build a working AI project to stand out in upcoming campus placements..."
              className="w-full bg-[#1A1B16] border border-[#3D4034] rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-[#7E8075] focus:outline-none focus:border-lime focus:ring-1 focus:ring-lime leading-relaxed transition"
              maxLength={300}
            />
            {errors.careerGoal && (
              <p className="mt-1.5 text-xs text-tangerine font-mono">{errors.careerGoal}</p>
            )}

            {/* Quick Suggestion Pills */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {STARTER_GOALS.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => setCareerGoal(starter)}
                  className="text-[11px] text-soft-gray hover:text-lime bg-obsidian hover:bg-graphite-light border border-border-atelier px-2.5 py-1 rounded-lg transition text-left"
                >
                  "{starter.slice(0, 48)}..."
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-border-atelier">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="btn-outline-atelier py-2.5 px-4 rounded-xl text-xs font-mono"
            >
              ← BACK
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn-lime py-3.5 px-6 rounded-xl font-display font-bold text-sm tracking-tight flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" />
                  <span className="font-mono text-xs uppercase">Synthesizing Blueprint with Gemini...</span>
                </>
              ) : (
                <>
                  <span>Generate AI Project Blueprint</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
