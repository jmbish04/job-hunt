// worker/do/orchestrator.ts

export interface OrchestratorState {
  pipelines: Record<string, Pipeline>;
}

export interface Pipeline {
  id: string;
  createdAt: number;
  jobTitle: string;
  company: string;
  jd: string;
  status: "pending" | "in_progress" | "complete";
  currentPhase: string;
  notes: string[];
}

export class OrchestratorDO {
  state: DurableObjectState;
  env: Env;
  private data: OrchestratorState = { pipelines: {} };

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    if (this.state.storage) {
      const stored = await this.state.storage.get<OrchestratorState>("state");
      if (stored) this.data = stored;
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    try {
      if (request.method === "POST" && pathname === "/pipeline/start") {
        const body = await request.json<any>();
        const id = crypto.randomUUID();
        const pipeline: Pipeline = {
          id,
          createdAt: Date.now(),
          jobTitle: body.job_title,
          company: body.company,
          jd: body.jd,
          status: "pending",
          currentPhase: "analysis",
          notes: []
        };
        this.data.pipelines[id] = pipeline;
        await this.persist();
        return new Response(JSON.stringify({ pipeline_id: id, pipeline }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      if (request.method === "GET" && pathname.startsWith("/pipeline/status/")) {
        const id = pathname.split("/").pop()!;
        const pipeline = this.data.pipelines[id];
        if (!pipeline) {
          return new Response(JSON.stringify({ error: "not_found" }), { status: 404 });
        }
        return new Response(JSON.stringify({ pipeline }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      return new Response("Not found", { status: 404 });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err?.message || "unknown_error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  private async persist() {
    await this.state.storage.put("state", this.data);
  }
}
