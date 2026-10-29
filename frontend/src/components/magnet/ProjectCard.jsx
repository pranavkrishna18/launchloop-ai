import { useState } from 'react';
import { CheckCircle2, Clock, Cpu, Layers, Sparkles, RefreshCw, BookOpen, AlertTriangle, Copy, ArrowRight, Check } from 'lucide-react';

export default function ProjectCard({ data, onReset, onRegisterForProject }) {
  const { recommendation, metadata } = data;
  const [copied, setCopied] = useState(false);

  const handleCopyBlueprint = () => {
    const text = `# Project Blueprint: ${recommendation.project_title}
**Difficulty**: ${recommendation.difficulty_level}
**Estimated Scope**: ${recommendation.estimated_scope}

## Problem Statement
${recommendation.problem_statement}

## Architecture & Fit
${recommendation.project_description}

**Why this fits your profile**:
${recommendation.fit_explanation}

## Recommended Stack
${recommendation.recommended_tech_stack?.join(', ')}

## First 3 Implementation Steps
1. ${recommendation.first_three_steps?.[0] || 'Configure API credentials and virtual environment'}
2. ${recommendation.first_three_steps?.[1] || 'Design zero-shot prompt with strict JSON schema'}
3. ${recommendation.first_three_steps?.[2] || 'Connect inference pipeline to interactive UI'}

## Workshop Scope vs Extension
- **60-Minute Prototype**: Core API integration & working single-feature UI
- **Weekend Extension**: PostgreSQL database persistence, deployment to Vercel/Render, and resume showcase
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Fallback Notice Banner if applicable (Honest Telemetry) */}
      {metadata.is_fallback ? (
        <div className="rounded-xl p-3.5 bg-graphite border border-tangerine text-tangerine text-xs flex items-start space-x-2.5">
          <AlertTriangle className="w-4 h-4 text-tangerine shrink-0 mt-0.5" />
          <div>
            <span className="font-mono font-bold uppercase tracking-wider">Curated Curriculum Blueprint: </span>
            <span className="text-warm-paper">
              {metadata.note ||
                'This recommendation was matched from our verified curriculum catalogue of beginner-friendly AI projects.'}
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-xl p-3 bg-graphite border border-border-atelier text-xs flex items-center justify-between text-soft-gray font-mono">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
            <span className="text-lime font-bold">LIVE GEMINI INFERENCE</span>
            <span>({metadata.model || 'Gemini Flash'})</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span>LATENCY: {metadata.latency_ms}ms</span>
            {metadata.cached && <span className="text-lime">[CACHED]</span>}
          </div>
        </div>
      )}

      {/* Main Architectural Blueprint Container */}
      <div className="atelier-card rounded-2xl p-6 sm:p-8 border border-border-atelier space-y-6">
        {/* Header Tag Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-border-atelier">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-graphite-light text-lime border border-border-atelier uppercase">
              {recommendation.difficulty_level}
            </span>
            <span className="px-2.5 py-1 rounded text-xs font-mono text-soft-gray border border-border-atelier flex items-center space-x-1.5">
              <Clock className="w-3 h-3 text-lime" />
              <span>{recommendation.estimated_scope}</span>
            </span>
          </div>

          <button
            onClick={handleCopyBlueprint}
            className="px-3 py-1.5 rounded-lg bg-obsidian border border-border-atelier hover:border-lime text-warm-paper text-xs font-mono flex items-center space-x-1.5 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-lime" />
                <span className="text-lime">COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-soft-gray" />
                <span>COPY BLUEPRINT</span>
              </>
            )}
          </button>
        </div>

        {/* Title */}
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-lime">
            PROJECT BLUEPRINT // CAPSTONE SPECIFICATION
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-warm-paper tracking-tight mt-1">
            {recommendation.project_title}
          </h2>
        </div>

        {/* Problem Statement */}
        <div className="bg-obsidian rounded-xl p-4 sm:p-5 border border-border-atelier space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-soft-gray">
            Problem Statement
          </span>
          <p className="text-xs sm:text-sm text-warm-paper leading-relaxed">
            {recommendation.problem_statement}
          </p>
        </div>

        {/* Architectural Description */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-soft-gray">
            System Architecture
          </span>
          <p className="text-xs sm:text-sm text-warm-paper/90 leading-relaxed">
            {recommendation.project_description}
          </p>
        </div>

        {/* Why this fits the student */}
        <div className="p-4 rounded-xl bg-graphite-light border border-border-atelier space-y-2">
          <span className="text-[11px] font-mono font-bold text-lime flex items-center space-x-1.5 uppercase">
            <Sparkles className="w-3.5 h-3.5 text-lime" />
            <span>Profile Match Rationale</span>
          </span>
          <p className="text-xs sm:text-sm text-warm-paper/90 leading-relaxed">
            {recommendation.fit_explanation}
          </p>
        </div>

        {/* Recommended Technology Stack */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-soft-gray flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-lime" />
            <span>Recommended Technology Stack</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {recommendation.recommended_tech_stack?.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded bg-obsidian border border-border-atelier text-xs font-mono text-lime"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* First 3 Implementation Steps */}
        <div className="space-y-3 pt-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-soft-gray">
            First 3 Implementation Steps
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recommendation.first_three_steps?.map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-obsidian border border-border-atelier space-y-1.5"
              >
                <span className="text-xs font-mono font-bold text-lime">
                  STEP 0{idx + 1}
                </span>
                <p className="text-xs text-soft-gray leading-relaxed">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-border-atelier flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onReset}
            className="w-full sm:w-auto btn-outline-atelier py-3 px-5 rounded-xl text-xs font-mono"
          >
            ← RE-ARCHITECT BLUEPRINT
          </button>

          <button
            onClick={() => onRegisterForProject(recommendation)}
            className="w-full sm:w-auto btn-lime py-3.5 px-6 rounded-xl font-display font-bold text-sm tracking-tight flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Register to Build This Project Free</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
