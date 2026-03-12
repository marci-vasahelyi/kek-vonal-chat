"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const MODELS = [
  { id: "deepseek/deepseek-v3.2", name: "DeepSeek V3.2" },
];

// DeepSeek V3.2 pricing (USD per token) + rough HUF rate
const PRICE_INPUT = 0.00000026;
const PRICE_OUTPUT = 0.00000038;
const HUF_PER_USD = 335;

// ~4 chars per token rough estimate
function estimateTokens(text: string) {
  return Math.ceil(text.length / 4);
}

interface BasePrompt {
  id: string;
  name: string;
  content: string;
}

const DEFAULT_PROMPT: BasePrompt = {
  id: "default",
  name: "Alapértelmezett",
  content: "You are a helpful assistant. Be concise and clear.",
};

export default function Chat() {
  const [model, setModel] = useState(MODELS[0].id);
  const [basePrompts, setBasePrompts] = useState<BasePrompt[]>([DEFAULT_PROMPT]);
  const [activePromptId, setActivePromptId] = useState("default");
  const [showPromptPanel, setShowPromptPanel] = useState(false);
  const [editName, setEditName] = useState("");
  const [editContent, setEditContent] = useState("");

  // Load saved prompts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("basePrompts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBasePrompts(parsed);
        }
      } catch {}
    }
    const savedActive = localStorage.getItem("activePromptId");
    if (savedActive) setActivePromptId(savedActive);
  }, []);

  // Save prompts to localStorage
  useEffect(() => {
    localStorage.setItem("basePrompts", JSON.stringify(basePrompts));
  }, [basePrompts]);

  useEffect(() => {
    localStorage.setItem("activePromptId", activePromptId);
  }, [activePromptId]);

  const activePrompt = basePrompts.find((p) => p.id === activePromptId) || DEFAULT_PROMPT;

  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } =
    useChat({
      body: { model, systemPrompt: activePrompt.content },
    });

  // Cost estimation
  const inputTokens = messages
    .filter((m) => m.role === "user")
    .reduce((sum, m) => sum + estimateTokens(m.content), 0);
  const outputTokens = messages
    .filter((m) => m.role === "assistant")
    .reduce((sum, m) => sum + estimateTokens(m.content), 0);
  const costUsd = inputTokens * PRICE_INPUT + outputTokens * PRICE_OUTPUT;
  const costHuf = costUsd * HUF_PER_USD;

  function saveNewPrompt() {
    if (!editName.trim() || !editContent.trim()) return;
    const newPrompt: BasePrompt = {
      id: Date.now().toString(),
      name: editName.trim(),
      content: editContent.trim(),
    };
    setBasePrompts((prev) => [...prev, newPrompt]);
    setEditName("");
    setEditContent("");
  }

  function deletePrompt(id: string) {
    if (id === "default") return;
    setBasePrompts((prev) => prev.filter((p) => p.id !== id));
    if (activePromptId === id) setActivePromptId("default");
  }

  return (
    <div className="flex h-dvh flex-col" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">Kek Vonal Chat</h1>
          {messages.length > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
            >
              ~{costHuf < 0.01 ? "<0,01" : costHuf.toFixed(2).replace(".", ",")} Ft
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPromptPanel(!showPromptPanel)}
            className="rounded-md border px-3 py-1.5 text-sm"
            style={{
              background: showPromptPanel ? "var(--user-bubble)" : "var(--muted)",
              color: showPromptPanel ? "var(--user-text)" : "var(--foreground)",
              borderColor: "var(--border)",
            }}
          >
            {activePrompt.name}
          </button>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="rounded-md border px-3 py-1.5 text-sm outline-none"
            style={{
              background: "var(--muted)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Base Prompt Panel */}
      {showPromptPanel && (
        <div
          className="border-b px-4 py-4"
          style={{ borderColor: "var(--border)", background: "var(--muted)" }}
        >
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-medium mb-3">Alap promptok</p>

            {/* Existing prompts */}
            <div className="flex flex-wrap gap-2 mb-4">
              {basePrompts.map((p) => (
                <div key={p.id} className="flex items-center gap-1">
                  <button
                    onClick={() => setActivePromptId(p.id)}
                    className="rounded-lg px-3 py-1.5 text-sm"
                    style={{
                      background: activePromptId === p.id ? "var(--user-bubble)" : "var(--background)",
                      color: activePromptId === p.id ? "var(--user-text)" : "var(--foreground)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {p.name}
                  </button>
                  {p.id !== "default" && (
                    <button
                      onClick={() => deletePrompt(p.id)}
                      className="text-xs px-1 rounded hover:opacity-70"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Active prompt preview */}
            <p
              className="text-xs mb-4 p-2 rounded"
              style={{ background: "var(--background)", color: "var(--muted-foreground)" }}
            >
              <span className="font-medium" style={{ color: "var(--foreground)" }}>
                Aktív:
              </span>{" "}
              {activePrompt.content}
            </p>

            {/* New prompt form */}
            <div className="flex flex-col gap-2">
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                Új alap prompt hozzáadása
              </p>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Prompt neve..."
                className="rounded-lg border px-3 py-2 text-sm outline-none"
                style={{
                  background: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Prompt tartalma..."
                rows={3}
                className="rounded-lg border px-3 py-2 text-sm outline-none resize-none"
                style={{
                  background: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              />
              <button
                onClick={saveNewPrompt}
                disabled={!editName.trim() || !editContent.trim()}
                className="self-end rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-40"
                style={{
                  background: "var(--user-bubble)",
                  color: "var(--user-text)",
                }}
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-8">
          {messages.length === 0 && (
            <div
              className="flex h-full items-center justify-center pt-32 text-center"
              style={{ color: "var(--muted-foreground)" }}
            >
              <div>
                <p className="text-2xl font-medium mb-2">Miben segíthetek?</p>
                <p className="text-sm">Küldj egy üzenetet a kezdéshez.</p>
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className="mb-6">
              {m.role === "user" ? (
                <div className="flex justify-end">
                  <div
                    className="max-w-[80%] rounded-2xl px-4 py-2.5"
                    style={{
                      background: "var(--user-bubble)",
                      color: "var(--user-text)",
                    }}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ) : (
                <div className="max-w-[80%]">
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="mb-6">
              <div className="flex gap-1" style={{ color: "var(--muted-foreground)" }}>
                <span className="animate-bounce">.</span>
                <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t p-4" style={{ borderColor: "var(--border)" }}>
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl gap-2"
        >
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Írj egy üzenetet..."
            className="flex-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/20"
            style={{
              background: "var(--muted)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
            autoFocus
          />
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="rounded-xl px-5 py-3 text-sm font-medium"
              style={{ background: "var(--muted)", color: "var(--foreground)" }}
            >
              Állj
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-xl px-5 py-3 text-sm font-medium disabled:opacity-40"
              style={{
                background: "var(--user-bubble)",
                color: "var(--user-text)",
              }}
            >
              Küldés
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
