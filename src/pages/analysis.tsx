import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CompetencyScore = {
  competency: string;
  score: number;
};

type AnalysisSummary = {
  sessionId: string;
  overallNotes: string;
  strengths: string[];
  weaknesses: string[];
  competencyScores: CompetencyScore[];
};

const API_BASE = "/api/interview";

export default function Analysis() {
  const [sessionId, setSessionId] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAnalysis() {
    if (!sessionId) {
      setError("Enter a session ID.");
      return;
    }
    setError(null);
    setLoading(true);
    setAnalysis(null);

    try {
      const res = await fetch(
        `${API_BASE}/session/${encodeURIComponent(sessionId)}/results`,
      );
      if (!res.ok) {
        throw new Error(`Failed to load analysis: ${res.status}`);
      }
      const data = await res.json();

      // This is a simple aggregation placeholder; you can refine it once API shape is final.
      const items = data.items ?? [];
      const strengths = new Set<string>();
      const weaknesses = new Set<string>();
      const competencyMap = new Map<string, { total: number; count: number }>();

      for (const item of items) {
        const a = item.analysis;
        if (!a) continue;
        (a.strengths ?? []).forEach((s: string) => strengths.add(s));
        (a.weaknesses ?? []).forEach((w: string) => weaknesses.add(w));

        const scores = a.scores ?? {};
        for (const [k, v] of Object.entries(scores)) {
          const numeric = typeof v === "number" ? v : Number(v);
          if (!Number.isFinite(numeric)) continue;
          const existing = competencyMap.get(k) ?? { total: 0, count: 0 };
          existing.total += numeric;
          existing.count += 1;
          competencyMap.set(k, existing);
        }
      }

      const competencyScores: CompetencyScore[] = Array.from(
        competencyMap.entries(),
      ).map(([competency, { total, count }]) => ({
        competency,
        score: count ? total / count : 0,
      }));

      setAnalysis({
        sessionId,
        overallNotes:
          "Aggregated results from session. Refine once the API includes richer metadata.",
        strengths: Array.from(strengths),
        weaknesses: Array.from(weaknesses),
        competencyScores,
      });
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to load analysis");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Analysis Overview</h1>

      <Card className="p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-2 md:space-y-0">
          <div className="flex-1">
            <Label htmlFor="sessionId">Session ID</Label>
            <Input
              id="sessionId"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Paste session ID from Mock Interview or History"
            />
          </div>
          <Button onClick={loadAnalysis} disabled={loading}>
            {loading ? "Loading…" : "Load Analysis"}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </Card>

      {analysis && (
        <Card className="p-4 space-y-4">
          <div>
            <h2 className="font-semibold mb-1">Session</h2>
            <p className="text-xs font-mono">{analysis.sessionId}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {analysis.overallNotes}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium mb-1">Strengths</h3>
              {analysis.strengths.length === 0 ? (
                <p className="text-sm text-muted-foreground">None recorded yet.</p>
              ) : (
                <ul className="list-disc list-inside text-sm">
                  {analysis.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="font-medium mb-1">Weaknesses</h3>
              {analysis.weaknesses.length === 0 ? (
                <p className="text-sm text-muted-foreground">None recorded yet.</p>
              ) : (
                <ul className="list-disc list-inside text-sm">
                  {analysis.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Competency Scores (avg)</h3>
            {analysis.competencyScores.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No scored competencies yet.
              </p>
            ) : (
              <div className="space-y-1">
                {analysis.competencyScores.map((c) => (
                  <div
                    key={c.competency}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{c.competency}</span>
                    <span className="font-mono">
                      {c.score.toFixed(2)} / 5
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
