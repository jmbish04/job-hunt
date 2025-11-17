// worker/modules/orchestrator/index.ts

export async function startPipeline(env: Env, stub: DurableObjectStub, input: {
  job_title: string;
  company: string;
  jd: string;
}) {
  const res = await stub.fetch("https://orchestrator/pipeline/start", {
    method: "POST",
    body: JSON.stringify(input),
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) {
    throw new Error(`Failed to start pipeline: ${res.status}`);
  }
  return res.json<any>();
}

export async function getPipelineStatus(stub: DurableObjectStub, pipelineId: string) {
  const res = await stub.fetch(`https://orchestrator/pipeline/status/${pipelineId}`, {
    method: "GET"
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch pipeline status: ${res.status}`);
  }
  return res.json<any>();
}
