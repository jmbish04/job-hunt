// worker/modules/ai/prompts.ts

export type QuestionScorecard = {
  competencies: string[];
  signals: string[];
  failure_modes: string[];
};

export type GeneratedQuestion = {
  question: string;
  scorecard: QuestionScorecard;
};

export type EvaluationResult = {
  scores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  coaching_notes: string;
  improvement_plan: string[];
};

export type ToneMetrics = {
  speed_wpm: number | null;
  pitch_variance: number | null; // 0–1 approximate
  volume_avg: number | null;
  filler_count: number;
  pauses_ratio: number | null;
};

export type ToneResult = {
  metrics: ToneMetrics;
  summary: string;
  suggestions: string[];
};

export function buildQuestionPrompt(args: {
  jobTitle: string;
  company: string;
  jd: string;
  previousQuestions?: string[];
  knownWeakAreas?: string[];
}) {
  const { jobTitle, company, jd, previousQuestions = [], knownWeakAreas = [] } = args;

  const system = `
You are an expert interview question generator for high-level tech roles.

You MUST:
- Ask ONE question per call.
- Tailor it to the role and job description.
- Prefer behavior / systems / execution questions over trivia.
- Return a STRICT JSON object with "question" and "scorecard".

The scorecard must define:
- "competencies": skills/behaviors being assessed.
- "signals": what good looks like.
- "failure_modes": what bad answers look like.
`.trim();

  const user = {
    job_title: jobTitle,
    company,
    job_description: jd.slice(0, 8000),
    previous_questions: previousQuestions,
    known_weak_areas: knownWeakAreas,
    response_format_example: {
      question: "Tell me about a time you had to align misaligned stakeholders in a complex cross-functional project.",
      scorecard: {
        competencies: ["stakeholder management", "communication", "ownership"],
        signals: [
          "clearly identifies stakeholders and their incentives",
          "uses structured communication to align them",
          "shows ownership for outcome"
        ],
        failure_modes: [
          "vague story, no clear stakeholders",
          "no clear conflict or misalignment",
          "blames others, no ownership"
        ]
      }
    }
  };

  return { system, user };
}

export function buildEvaluationPrompt(args: {
  question: string;
  transcript: string;
  scorecard: QuestionScorecard;
}) {
  const { question, transcript, scorecard } = args;

  const system = `
You are an expert interview evaluator.

You MUST:
- Use the STAR framework (Situation, Task, Action, Result).
- Evaluate the candidate answer to the given question.
- Use the provided scorecard.
- Be specific and concrete in feedback.
- Return STRICT JSON with keys: scores, strengths, weaknesses, coaching_notes, improvement_plan.

Scoring:
- scores is a map of competency -> 1 to 5.
- 1 = very weak, 3 = acceptable, 5 = excellent.
`.trim();

  const user = {
    question,
    transcript,
    scorecard,
    instructions: [
      "Identify whether the candidate covered S, T, A, and R.",
      "Highlight specific strengths with quotes or paraphrases.",
      "Highlight specific weaknesses (missing details, vague results, no metrics, etc.).",
      "Give coaching_notes as a paragraph.",
      "Give improvement_plan as a list of concrete actions the candidate can take."
    ],
    response_format_example: {
      scores: {
        "stakeholder management": 4,
        "communication": 3
      },
      strengths: ["Clearly identified stakeholders and conflict", "Demonstrated proactive communication"],
      weaknesses: ["Result metrics were vague", "Did not clearly state their unique contribution"],
      coaching_notes: "Overall a solid answer with good structure, but the Result portion needs more concrete metrics.",
      improvement_plan: [
        "Practice quantifying outcomes: time saved, risk reduced, dollars saved.",
        "Explicitly call out 'my role' and 'what I did' separate from the team."
      ]
    }
  };

  return { system, user };
}

export function buildTonePrompt(args: {
  transcript: string;
  metrics: ToneMetrics;
}) {
  const { transcript, metrics } = args;

  const system = `
You are an interview communication coach.

You receive:
- The transcript of the answer.
- Low-level numeric metrics about delivery (pace, pitch, volume, filler words, pauses).

You MUST:
- Interpret the metrics.
- Combine them with the content to assess delivery quality.
- Return STRICT JSON with: metrics, summary, suggestions.

"summary" is a short paragraph overview.
"suggestions" is a list of concrete actions, specific to speaking style (not content).
`.trim();

  const user = {
    transcript,
    metrics,
    guidance: [
      "If pace is very high, mention rushing.",
      "If filler_count is high, mention filler words explicitly.",
      "If pitch_variance is low, suggest adding more vocal variety.",
      "If pauses_ratio is low or zero, suggest natural pauses."
    ],
    response_format_example: {
      metrics,
      summary: "You spoke at a slightly fast pace with moderate filler usage and somewhat flat intonation.",
      suggestions: [
        "Slow down slightly and leave a short pause between STAR sections.",
        "Reduce filler words like 'um' and 'like' by practicing with a timer.",
        "Add more vocal emphasis when describing the 'Result' to make impact clear."
      ]
    }
  };

  return { system, user };
}
