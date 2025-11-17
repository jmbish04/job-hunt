import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SessionSummary = {
  id: string;
  jobTitle: string;
  company: string;
  createdAt: number;
  questionCount?: number;
  answerCount?: number;
};

const API_BASE = "/api/interview";

export default function InterviewHistory() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadSessions();
  }, []);

  async function loadSessions() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/sessions`);
      if (!res.ok) {
        throw new Error(`Failed to load sessions: ${res.status}`);
      }
      const data = await res.json();
      setSessions(
        (data.sessions ?? []).map((s: any) => ({
          id: s.id,
          jobTitle: s.job_title,
          company: s.company,
          createdAt: s.created_at,
          questionCount: s.question_count,
          answerCount: s.answer_count,
        })),
      );
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Interview History</h1>
        <Button onClick={loadSessions} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      <Card className="p-4">
        {error && <p className="text-sm text-destructive mb-3">{error}</p>}

        {sessions.length === 0 && !loading && !error && (
          <p className="text-sm text-muted-foreground">
            No sessions found yet. Run a mock interview first.
          </p>
        )}

        {sessions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Session ID</th>
                  <th className="text-left py-2">Role</th>
                  <th className="text-left py-2">Company</th>
                  <th className="text-left py-2">Questions</th>
                  <th className="text-left py-2">Answers</th>
                  <th className="text-left py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b last:border-none">
                    <td className="py-2 font-mono text-xs">{s.id}</td>
                    <td className="py-2">{s.jobTitle}</td>
                    <td className="py-2">{s.company}</td>
                    <td className="py-2">{s.questionCount ?? "-"}</td>
                    <td className="py-2">{s.answerCount ?? "-"}</td>
                    <td className="py-2 text-xs text-muted-foreground">
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {loading && (
          <p className="text-sm text-muted-foreground mt-2">
            Loading sessions…
          </p>
        )}
      </Card>
    </div>
  );
}
