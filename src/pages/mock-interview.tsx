import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Session = {
  id: string;
  jobTitle: string;
  company: string;
  createdAt: number;
};

type Question = {
  id: string;
  questionText: string;
};

type Analysis = {
  strengths: string[];
  weaknesses: string[];
  coaching_notes: string;
  improvement_plan: string[];
};

const API_BASE = "/api/interview";

export default function MockInterview() {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jd, setJd] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isFetchingQuestion, setIsFetchingQuestion] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startSession() {
    setError(null);
    setIsStarting(true);
    setCurrentQuestion(null);
    setTranscript("");
    setAnalysis(null);

    try {
      const res = await fetch(`${API_BASE}/session/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: jobTitle,
          company,
          jd,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to start session: ${res.status}`);
      }

      const data = await res.json();
      setSession({
        id: data.session_id,
        jobTitle,
        company,
        createdAt: Date.now(),
      });
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to start session");
    } finally {
      setIsStarting(false);
    }
  }

  async function fetchNextQuestion() {
    if (!session) {
      setError("Start a session first.");
      return;
    }
    setError(null);
    setIsFetchingQuestion(true);
    setTranscript("");
    setAnalysis(null);

    try {
      const res = await fetch(
        `${API_BASE}/session/${encodeURIComponent(session.id)}/next-question`,
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch next question: ${res.status}`);
      }
      const data = await res.json();
      setCurrentQuestion({
        id: data.question_id,
        questionText: data.question,
      });
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to fetch question");
    } finally {
      setIsFetchingQuestion(false);
    }
  }

  async function uploadAnswer() {
    if (!session || !currentQuestion) {
      setError("You need an active session and question.");
      return;
    }
    if (!file) {
      setError("Select an audio file to upload.");
      return;
    }

    setError(null);
    setIsUploading(true);
    setTranscript("");
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("question_id", currentQuestion.id);

      const res = await fetch(
        `${API_BASE}/session/${encodeURIComponent(session.id)}/answer`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status}`);
      }

      const data = await res.json();
      setTranscript(data.transcript ?? "");
      // Optionally kick off analysis automatically if API supports it.
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to upload answer");
    } finally {
      setIsUploading(false);
    }
  }

  async function runAnalysis() {
    if (!session || !currentQuestion) {
      setError("You need an active session and question.");
      return;
    }
    if (!transcript) {
      setError("No transcript available to analyze.");
      return;
    }

    setError(null);

    try {
      const res = await fetch(`${API_BASE}/analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: session.id,
          question_id: currentQuestion.id,
          transcript,
        }),
      });

      if (!res.ok) {
        throw new Error(`Analysis failed: ${res.status}`);
      }

      const data = await res.json();
      setAnalysis({
        strengths: data.strengths ?? [],
        weaknesses: data.weaknesses ?? [],
        coaching_notes: data.coaching_notes ?? "",
        improvement_plan: data.improvement_plan ?? [],
      });
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to run analysis");
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">Mock Interview</h1>

      {/* Session Setup */}
      <Card className="p-4 space-y-4">
        <h2 className="font-semibold">1. Session Setup</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Manager, Legal Operations Strategic Programs"
            />
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Apple"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="jd">Job Description</Label>
          <textarea
            id="jd"
            className="mt-1 w-full min-h-[120px] rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the full JD here…"
          />
        </div>
        <Button onClick={startSession} disabled={isStarting}>
          {isStarting ? "Starting…" : "Start Session"}
        </Button>
        {session && (
          <p className="text-xs text-muted-foreground mt-2">
            Active session: <span className="font-mono">{session.id}</span>
          </p>
        )}
      </Card>

      {/* Question */}
      <Card className="p-4 space-y-4">
        <h2 className="font-semibold">2. Question</h2>
        <Button
          onClick={fetchNextQuestion}
          disabled={!session || isFetchingQuestion}
        >
          {isFetchingQuestion ? "Loading…" : "Get Next Question"}
        </Button>
        {currentQuestion && (
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-1">
              Question ID: <span className="font-mono">{currentQuestion.id}</span>
            </p>
            <p className="text-base">{currentQuestion.questionText}</p>
          </div>
        )}
      </Card>

      {/* Answer Upload */}
      <Card className="p-4 space-y-4">
        <h2 className="font-semibold">3. Answer Audio Upload</h2>
        <div className="space-y-2">
          <Label htmlFor="audio">Upload audio file</Label>
          <Input
            id="audio"
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <Button onClick={uploadAnswer} disabled={isUploading || !file}>
          {isUploading ? "Uploading…" : "Upload & Transcribe"}
        </Button>
        {transcript && (
          <div className="mt-3">
            <h3 className="font-medium mb-1">Transcript</h3>
            <p className="whitespace-pre-wrap text-sm border rounded-md p-2 bg-muted">
              {transcript}
            </p>
          </div>
        )}
      </Card>

      {/* Analysis */}
      <Card className="p-4 space-y-4">
        <h2 className="font-semibold">4. Analysis</h2>
        <Button onClick={runAnalysis} disabled={!transcript}>
          Run Analysis
        </Button>
        {analysis && (
          <div className="space-y-3 mt-3">
            <div>
              <h3 className="font-medium">Strengths</h3>
              <ul className="list-disc list-inside text-sm">
                {analysis.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium">Weaknesses</h3>
              <ul className="list-disc list-inside text-sm">
                {analysis.weaknesses.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium">Coaching Notes</h3>
              <p className="text-sm whitespace-pre-wrap">
                {analysis.coaching_notes}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Improvement Plan</h3>
              <ul className="list-disc list-inside text-sm">
                {analysis.improvement_plan.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Card>

      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
