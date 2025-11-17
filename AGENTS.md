# 🤖 AGENTS.md - AI Agent Governance

Welcome, AI agent. You are modifying the "Gold Standard Worker" template. Your goal is to maintain and extend this project while adhering to its strict architectural rules.

Absolutely — here is a clean, production-quality AGENTS.md designed specifically for your jh-api / job-hunt ecosystem, aligned with:
	•	Cloudflare Workers + Durable Objects
	•	Cloudflare AI
	•	OpenAI Assistants / Responses API
	•	Your phased architecture (0–6)
	•	Future expansion (temporal graph, orchestration worker, vector memory)

It’s structured so you can drop it directly into your repo.

⸻

AGENTS.md

AI Agent Architecture for the Job-Hunt & Interview System

This document defines the multi-agent architecture used across the job-hunt platform.
Agents operate across Cloudflare Workers, Durable Objects, Vectorize, D1, R2, and OpenAI.

Each agent has:
	•	Role
	•	Responsibilities
	•	Inputs / Outputs
	•	Execution Environment
	•	Tools
	•	Relevant Workers / Modules

This file represents the canonical single source of truth for your agent ecosystem.

⸻

🌐 High-Level Agent Overview

Agent	Purpose	Phase
Orchestrator Agent	Oversees job-hunt lifecycle pipeline & triggers other agents	4
Interview Question Agent	Generates tailored questions from JD + context	1
Interview Evaluation Agent	Analyzes answers using STAR + custom scorecards	1
Tone & Delivery Agent	Scores vocal delivery (pace, pitch, confidence)	2
Vector Memory Agent	Embeds transcripts & retrieves historical patterns	3
Temporal Graph Agent	Builds long-term competency graph from D1	5
Realtime Coach Agent (optional)	Provides adaptive guidance during live mock sessions	6
System/Utility Agents	Health checks, routing, schema validation, etc.	All


⸻

📦 Agents in Detail

⸻

1. Orchestrator Agent

Phase 4 — The brain of the entire job-hunt system.

Role

Coordinates the full job-hunt lifecycle:
	1.	JD ingestion
	2.	Role analysis
	3.	Resume tailoring
	4.	Interview preparation
	5.	Mock interview sessions
	6.	Evaluation
	7.	Long-term improvement plans

Runs inside a Cloudflare Worker + Durable Object.

Responsibilities
	•	Maintain job pipeline state (worker/do/orchestrator.ts)
	•	Trigger downstream agents via Worker bindings
	•	Enforce ordering of tasks and dependencies
	•	Generate session “plans” (tasks, subtasks, phases)
	•	Store progress & history in D1

Inputs
	•	Job description
	•	User preferences
	•	Resume context
	•	Past interview data

Outputs
	•	Next tasks
	•	Explanations
	•	Session flows

Tools
	•	OpenAI Responses API
	•	Worker AI (classification)
	•	D1, R2, DO state

⸻

2. Interview Question Agent

Phase 1 — Generates high-quality, role-specific mock interview questions.

Role

Generate one custom interview question based on:
	•	Job title
	•	Company
	•	Full JD text
	•	Previous questions asked
	•	Historical weak areas (optional Phase 3–5)

Responsibilities
	•	Produce question JSON + scorecard
	•	Align question difficulty to user progress
	•	Avoid duplicates

Implementation Path

worker/modules/ai/prompts.ts → generateInterviewQuestion()

⸻

3. Interview Evaluation Agent

Phase 1 — Evaluates transcript content (STAR, clarity, relevance).

Role

Given:
	•	Transcript
	•	Question
	•	Scorecard

Produce:
	•	Strengths
	•	Weaknesses
	•	Competency scores (1–5)
	•	Coaching notes
	•	Improvement plan

Tools
	•	OpenAI Responses API

Implementation Path

worker/modules/ai/prompts.ts → analyzeAnswer()

⸻

4. Tone & Delivery Agent

Phase 2 — Evaluates how the answer was spoken.

Role

Analyze the audio recording for:
	•	Pace (words per minute)
	•	Pitch variance (monotone vs dynamic)
	•	Volume & clarity
	•	Filler words
	•	Hesitation / pauses
	•	Confidence markers

Dependencies
	•	Whisper transcript
	•	Audio uploaded to R2
	•	DSP signal analysis (simple heuristics)
	•	Optional OpenAI subjective evaluation

Implementation Path

worker/modules/ai/prompts.ts → analyzeTone()
worker/utils/audio.ts

⸻

5. Vector Memory Agent

Phase 3 — Builds semantic memory & retrieval.

Role

Store and retrieve:
	•	Transcripts
	•	Analysis
	•	Coaching notes
	•	Competency strengths/weaknesses

Using:
	•	Cloudflare Vectorize for embeddings
	•	Worker AI embedding models

Capabilities
	•	Identify recurring mistakes
	•	Suggest focus topics
	•	Provide cross-session insights
	•	Generate tailored next questions

Implementation Path

worker/modules/vector/index.ts
worker/modules/ai/prompts.ts → adaptive question generation

⸻

6. Temporal Graph Agent

Phase 5 — Competency evolution over time.

Role

Build and maintain a directed knowledge graph with nodes:
	•	Session
	•	Question
	•	Answer
	•	Scorecard
	•	Competency
	•	Audio metrics

Edges include:
	•	session_has_question
	•	question_has_answer
	•	answer_has_analysis
	•	analysis_signals_strength
	•	analysis_signals_weakness
	•	competency_improving/declining

Uses
	•	Identify long-term improvement trends
	•	Predict interview readiness
	•	Generate targeted improvement curriculum

Implementation Path

temporal-graph/models/*
temporal-graph/ingestion/*

⸻

7. Realtime Coach Agent (Optional)

Phase 6 — Adds adaptive live coaching.

Role

In real-time:
	•	Listen to ongoing response
	•	Detect deviation (rambling, missing STAR “Result”)
	•	Trigger subtle prompts:
	•	“Can you expand on results?”
	•	“Give me more detail on your role.”

Dependencies
	•	Cloudflare RTC/WebRTC
	•	WebSocket events
	•	OpenAI Realtime model

Not needed early due to cost constraints.

⸻

8. System / Utility Agents

Across all phases.

Includes
	•	Health agent
	•	MCP agent
	•	Chat router agent
	•	Assistant prompts manager
	•	Schema validator
	•	Logging & telemetry agent

Implementation Path

worker/modules/health/*
worker/modules/mcp/*
worker/utils/*

⸻

📚 Data Flow Summary

Session Start → Question Agent → (audio upload)
  → Whisper (transcript)
  → Evaluation Agent → D1 ↘
                         ↳ Vector Memory Agent ↘
                                                   Temporal Graph Agent

Optional realtime:

           ↘ RTC/WS → Realtime Coach Agent ↗


⸻

🔧 Integration with Job-Hunt Template

Worker Routes
	•	worker/index.ts should register interview routes under /api/interview.
	•	Use existing worker/modules/mcp/ for MCP-compatible actions.
	•	Build on existing worker/do/websocket.ts for debug/event streaming.

Frontend Pages (optional later)
	•	src/pages/mock-interview.tsx
	•	src/pages/interview-history.tsx
	•	src/pages/analysis.tsx

⸻

🧭 Roadmap Summary (Agents by Phase)

Phase	Agents Introduced
0	none (infra only)
1	Interview Question Agent, Interview Evaluation Agent
2	Tone & Delivery Agent
3	Vector Memory Agent
4	Orchestrator Agent
5	Temporal Graph Agent
6	Realtime Coach Agent (optional)


# =================

# Infrastructure

## 1. Core Architecture: SPA + API

This project is a **hybrid application**, not a monolith.
* **Frontend (SPA):** The `/src` directory. This is a Vite-built React app. All UI code (React components, pages, CSS) goes here.
* **Backend (API):** The `/worker` directory. This is a Hono API running on Cloudflare Workers. All backend logic (API endpoints, database queries, AI calls, DOs) goes here.

**Your primary rule: NEVER mix frontend and backend code.**
* Do not `import` from `/worker` into `/src`.
* Do not `import` from `/src` into `/worker`.
* The frontend (client) communicates with the backend (worker) *only* via `fetch` calls to its API (e.g., `/api/chat`).

## 2. Rules for Modifying the Backend (`/worker`)

1.  **Maintain Modularity:** All new API features must be encapsulated within a new directory in `/worker/modules/`.
    * **Bad:** Adding `app.get('/api/todos', ...)` directly to `worker/index.ts`.
    * **Good:** Creating `/worker/modules/todos/index.ts`, defining the route there, and mounting it in `worker/index.ts` (`app.route('/api/todos', todoApi)`).
2.  **Update Schemas:** After adding or modifying an API endpoint, you *must* update its Zod schema (`createRoute`) and ensure it has a unique `operationId`. This is required for the OpenAPI spec.
3.  **Update Health Checks:** If a new module adds a critical dependency (e.g., a new D1 database, a new AI provider), you *must* add a new check function to `/worker/modules/health/service.ts` and call it from `runAllHealthChecks`.
4.  **ORM Only (Drizzle + Kysely):** Never bypass the ORM.
    * **FORBIDDEN:** `env.DB.prepare(...)`, `env.DB.exec(...)`, raw SQL strings.
    * **REQUIRED:** Use the hybrid client from `initDb(env.DB)`.
    * Use `db.select()...` (Drizzle) for simple queries.
    * Use `kysely.selectFrom(...` (Kysely) for complex, dynamic queries.
    * All schema changes *must* be in `worker/db/schema.ts` and require a new migration (`bun run db:gen`).
5.  **Shadcn Fidelity:** All UI *must* look and feel exactly like Shadcn. Use the components from `/src/components/ui` for all elements. Do not use plain `<button>` or `<input>`. Ensure all fonts, themes, and Tailwind configs match the Shadcn defaults.

## 3. How to Add a New Page (Example: "Todos")

1.  **API First (Backend):**
    * Create `worker/db/schema.ts`: Add the `todos` table.
    * Run `bun run db:gen` to create the migration.
    * Create `worker/modules/todos/service.ts`: Write the Drizzle/Kysely logic to `getTodos()`, `createTodo()`, etc.
    * Create `worker/modules/todos/index.ts`: Define a new `Hono` app. Create Zod schemas and `.openapi` routes (e.g., `GET /api/todos`, `POST /api/todos`) that call your service.
    * Update `worker/index.ts`: Import `todoApi` and mount it: `app.route('/api/todos', todoApi)`.
2.  **UI Second (Frontend):**
    * Create `src/pages/todos.tsx`: Build the new React component.
    * Fetch data from the API: `fetch('/api/todos')`.
    * Use Shadcn components: `<Card>`, `<Input>`, `<Button>`, etc.
    * Update `src/App.tsx`:
        * Add `'todos'` to the `Page` type.
        * Add a new `<Button>` to the sidebar in `MainLayout`.
        * Add a `case 'todos': return <Todos />` to the `renderPage` switch.
3.  **Test:** Run `bun run dev` to verify HMR and API proxying work.
4.  **Add Tests (Required):** After creating a new page, you *must* add Playwright tests.
    * Create `tests/[page-name].spec.ts` with tests for navigation, API calls, and user interactions.
    * Add `data-testid` attributes to key UI elements for reliable testing.
    * Update `tests/navigation.spec.ts` to include the new route.
    * See **[tests/AGENTS.md](tests/AGENTS.md)** for detailed testing guidelines.

## 4. Testing Requirements

**CRITICAL:** Every new page or modified page *must* have corresponding Playwright tests.

### When You Add or Modify a Page:

1. **Create/Update Test File:** `tests/[page-name].spec.ts`
2. **Add data-testid Attributes:** Add to all interactive elements and key UI components
3. **Test Coverage Must Include:**
   * Page navigation and routing
   * API endpoint calls (success and error states)
   * User interactions (clicks, form submissions)
   * Data display and loading states
4. **Update Navigation Tests:** Add the new route to `tests/navigation.spec.ts`
5. **Run Tests Before Committing:** `npm test` must pass

### Testing Resources:

* **Detailed Guidelines:** [tests/AGENTS.md](tests/AGENTS.md) - Complete testing patterns and examples
* **Test Templates:** [tests/README.md](tests/README.md) - Setup and running tests
* **Documentation:** [docs/testing-instructions.md](docs/testing-instructions.md) - Quick reference

**Rule:** Do not consider a page "complete" until its tests are written and passing.
