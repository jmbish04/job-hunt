Absolutely — here is your fully merged, production-ready AGENTS.md, combining:
	•	Your Gold Standard Worker governance rules
	•	The complete multi-agent job-hunt AI architecture
	•	Cloudflare Workers + Durable Objects + D1 + Vectorize conventions
	•	All phase-based agent definitions (0–6)
	•	Frontend/Backend separation rules
	•	Testing rules (Playwright + shadcn/ui)

This is written as a single authoritative file you can drop directly into your repo.

⸻

🤖 AGENTS.md — AI Agent Governance & System Architecture

Welcome, AI agent.
You are modifying the Job-Hunt Gold Standard Worker template.

Your goal is to maintain and extend this project while adhering to strict architectural rules.
You operate inside a system that combines:
	•	Cloudflare Workers (Hono-based API)
	•	Durable Objects
	•	Cloudflare D1, R2, Vectorize
	•	Cloudflare Workers AI (Whisper, embeddings)
	•	OpenAI (Responses, Assistants, Realtime)
	•	Vite React SPA (frontend)
	•	Shadcn UI
	•	Drizzle + Kysely (hybrid ORM)
	•	Playwright (testing)
	•	MCP server (tooling access)

This document defines:
	1.	Core infrastructure rules (Gold Standard Worker)
	2.	Multi-agent architecture (phases 0–6)
	3.	How agents interact with the Worker and SPA
	4.	File system governance
	5.	Testing requirements

This file is your canonical source of truth.

⸻

============================

📡 1. MULTI-AGENT ARCHITECTURE

============================

Below are the AI agents that operate across the job-hunt system.

Agents always act modularly, predictably, and non-destructively.
No agent should break the template or exceed the Worker security model.

⸻

🌐 High-Level Agent Overview

Agent	Purpose	Phase
Orchestrator Agent	Oversees job-hunt lifecycle, coordinates tasks	4
Interview Question Agent	Generates tailored questions from JD	1
Interview Evaluation Agent	Analyzes transcripts using STAR	1
Tone & Delivery Agent	Analyzes vocal delivery metrics	2
Vector Memory Agent	Embeds transcripts; retrieves insights	3
Temporal Graph Agent	Tracks long-term competency growth	5
Realtime Coach Agent	Optional real-time adaptive guidance	6
System Agents	Health, MCP, routing, OpenAPI, schemas	All

These agents function across Cloudflare Workers, DOs, D1, R2, Vectorize, and OpenAI.

⸻

============================

🧠 2. AGENTS IN DETAIL

============================

Below is a merged, comprehensive description of each agent, its role, responsibilities, tools, and file locations.

⸻

2.1 Orchestrator Agent (Phase 4)

The brain of the system.

Location
	•	worker/do/orchestrator.ts
	•	worker/modules/orchestrator/index.ts

Role
Coordinates the entire job-hunt workflow:
	1.	JD ingestion
	2.	Role + resume analysis
	3.	Tailoring plan
	4.	Interview preparation
	5.	Mock sessions
	6.	Evaluation
	7.	Long-term growth plan

Responsibilities
	•	Maintain pipeline state in DO & D1
	•	Generate phase tasks
	•	Trigger sub-agents
	•	Emit events to WebSocket
	•	Enable start/pause/resume of pipelines

Tools
	•	D1
	•	R2
	•	Vectorize
	•	Workers AI
	•	OpenAI Responses

⸻

2.2 Interview Question Agent (Phase 1)

Role
Generate one custom mock interview question based on:
	•	Job title
	•	Company
	•	JD
	•	Previous questions
	•	Weak areas (from vector memory or temporal graph)

Output

{
  "question": "...",
  "scorecard": {
    "competencies": [...],
    "signals": [...],
    "failure_modes": [...]
  }
}

Implementation
	•	worker/modules/ai/prompts.ts → buildQuestionPrompt()

⸻

2.3 Interview Evaluation Agent (Phase 1)

Role
Evaluate answer transcripts using STAR:
	•	Situation
	•	Task
	•	Action
	•	Result

Output

{
  "scores": {...},
  "strengths": [...],
  "weaknesses": [...],
  "coaching_notes": "...",
  "improvement_plan": [...]
}

Implementation
	•	worker/modules/ai/prompts.ts → buildEvaluationPrompt()

⸻

2.4 Tone & Delivery Agent (Phase 2)

Role
Analyze audio delivery:
	•	Pace (WPM)
	•	Pitch variance
	•	Volume baseline
	•	Hesitations / pauses
	•	Filler words
	•	Confidence markers

Tools
	•	Workers AI Whisper
	•	DSP heuristics in worker/utils/audio.ts

Output

{
  "metrics": {...},
  "summary": "...",
  "suggestions": [...]
}


⸻

2.5 Vector Memory Agent (Phase 3)

Role
Provide semantic memory across sessions via Vectorize.

Sources
	•	transcripts
	•	analysis
	•	scorecards
	•	coaching history

Capabilities
	•	Cluster weak areas
	•	Recommend next questions
	•	Identify repeated patterns
	•	Perform similarity search

Implementation
	•	worker/modules/vector/index.ts (to be added)
	•	worker/modules/ai/prompts.ts → adaptive question generation

⸻

2.6 Temporal Graph Agent (Phase 5)

Role
Build a longitudinal knowledge graph covering:

Nodes:
	•	session
	•	question
	•	answer
	•	analysis
	•	competencies
	•	audio metrics

Edges:
	•	session_has_question
	•	question_has_answer
	•	answer_has_analysis
	•	competency_trend
	•	weakness_repeated

Use cases
	•	Show improvement trajectory
	•	Identify growth bottlenecks
	•	Generate personalized curriculum

Files
	•	temporal-graph/models/*
	•	temporal-graph/ingestion/*

⸻

2.7 Realtime Coach Agent (Phase 6)

Optional, expensive, but extremely powerful.

Role
Live adaptive guidance via RTC + OpenAI Realtime:
	•	Detect rambling
	•	Detect missing STAR components
	•	Insert nudges
	•	Respond to tone in real-time

Triggers
Via WebSocket or DO event stream.

⸻

2.8 System / Utility Agents

Locations
	•	worker/modules/health/*
	•	worker/modules/mcp/*
	•	worker/utils/*
	•	worker/utils/openapi.ts

Roles
	•	Route validation
	•	OpenAPI generation
	•	MCP tools
	•	Logging & instrumentation
	•	Schema/Data validation

⸻

=====================================

🔄 3. END-TO-END DATA FLOW SUMMARY

=====================================

Session Start → Question Agent → (Audio Upload)
     → Whisper (Transcription)
     → Evaluation Agent → D1
                          ↳ Vector Memory Agent
                                ↳ Adaptive next question
                          ↳ Temporal Graph Agent

Optional real-time branch:

User Answer → RTC/WebSocket → Realtime Coach Agent → Feedback


⸻

=====================================

🏗️ 4. INFRASTRUCTURE GOVERNANCE

=====================================

This section merges your Gold Standard Worker rules.

These rules are mandatory.
Agents must follow them when generating or modifying code.

⸻

4.1 Core Architecture: SPA + API

The project is hybrid:

Frontend (SPA)

Located in /src/
	•	React (Vite)
	•	Shadcn UI
	•	Client-only logic

Backend (API)

Located in /worker/
	•	Cloudflare Worker + Hono
	•	Durable Objects
	•	D1 / R2 / Vectorize
	•	AI calls
	•	MCP server
	•	OpenAPI generation

❌ Never mix layers:
	•	Do NOT import /worker from /src
	•	Do NOT import /src from /worker
	•	Only communicate via HTTP fetch calls (/api/...)

⸻

4.2 Rules for Modifying Backend (/worker)
	1.	Modularity Required
Every new feature = new folder under worker/modules/<feature>/.
	2.	Routing Rules
All route handlers live inside the module, then mounted in worker/index.ts.
	3.	OpenAPI Required
Every route must have Zod schemas + .openapi().
	4.	Database Access Rules
	•	Use Drizzle for simple queries
	•	Use Kysely for dynamic/complex queries
	•	Never write raw SQL
	•	Schema changes require a migration generated by:

bun run db:gen


	5.	Health Checks Required
If new dependencies are introduced, update health checks.
	6.	Shadcn Fidelity
UI changes must use official src/components/ui only.

⸻

=====================================

🧪 5. TESTING REQUIREMENTS (MANDATORY)

=====================================

All pages and modules must include Playwright tests.

For every new page:
	•	Add tests/<page>.spec.ts
	•	Add data-testid attributes
	•	Update tests/navigation.spec.ts

Test requirements:
	•	Navigation
	•	API calls
	•	Error states
	•	Loading UI
	•	Interaction workflows

Rule: A page is not considered complete until Playwright tests pass.

⸻

=====================================

🧭 6. ROADMAP SUMMARY (PHASES 0–6)

=====================================

Phase	Agents Introduced
0	Foundation (infra only)
1	Question Agent, Evaluation Agent
2	Tone & Delivery Agent
3	Vector Memory Agent
4	Orchestrator Agent
5	Temporal Graph Agent
6	Realtime Coach Agent (optional)
