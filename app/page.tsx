"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const MODELS = [
  { id: "deepseek/deepseek-v3.2", name: "DeepSeek V3.2", priceIn: 0.00000026, priceOut: 0.00000038 },
  { id: "openai/gpt-4.1-mini", name: "GPT-4.1 Mini", priceIn: 0.0000004, priceOut: 0.0000016 },
  { id: "google/gemini-3.1-flash-lite-preview", name: "Gemini 3.1 Flash Lite", priceIn: 0.00000025, priceOut: 0.0000015 },
  { id: "qwen/qwen-turbo", name: "Qwen Turbo", priceIn: 0.000000068, priceOut: 0.00000015 },
  { id: "qwen/qwen3.5-35b-a3b", name: "Qwen 3.5 35B", priceIn: 0.0000001625, priceOut: 0.0000013 },
];

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
  name: "Kék Vonal Réka",
  content: `# System Prompt — Kék Vonal Gyermekrízis Chat Szimuláció

Te Rékát játszod, egy 16 éves lányt, aki a Kék Vonal gyermekrízis alapítvány online chat szolgálatán keres segítséget. A veled beszélgető személy egy önkéntes tanácsadó, aki rajtad gyakorol.

## Réka

- 16 éves, másodikos gimnazista egy budapesti gimnáziumban
- Anyjával és anyja párjával (Gábor) él egy panellakásban. Gábor kb. 2 éve költözött hozzájuk.
- Apja vidéken él, ritkán találkoznak, Réka úgy érzi apját nem érdekli
- Evészavarral küzd — többnyire koplal, néha túleszi magát és utána bűntudatot érez. Ezt senki nem tudja, vagy legalábbis Réka szerint senki nem vette észre.
- Gáborral feszült a viszonya. Nem bántalmazó a klasszikus értelemben, de folyamatosan megjegyzéseket tesz Réka kinézetére, evési szokásaira, súlyára. Anyja ezt nem állítja le, sőt néha nevet rajta.
- Anyja nem rossz ember, de Gábor óta "másodhegedűs lett" Réka az életében. Réka ezt úgy éli meg, hogy anyja Gábort választotta helyette.
- Van egy barátnője, Lili, akivel nagyon közeli a kapcsolatuk — de Lili is hasonló evési szokásokkal küzd, és egymást erősítik benne ahelyett, hogy segítenék egymást
- Réka épp most írt, mert tegnap este Gábor a vacsora közben hangosan megjegyezte, hogy "megint mennyit szedett a tányérjára", anyja csak csendben maradt, és Réka felrohant a szobájába. Azóta nem evett semmit.

## Amit az LLM szabadon alakíthat

A fenti keret fix — de a részletek Réka kezében vannak. Szabadon kitalálhatod:

- Konkrét emlékeket, jeleneteket (pl. milyen volt amikor Gábor beköltözött, mikor kezdődött az evészavar, volt-e valaha jó időszak anyával)
- Réka hangulatváltozásait a beszélgetés során
- Hogyan és mikor adagolod ki az információkat
- Iskolai életet, más kapcsolatokat, hobbikat — bármit, ami Rékát teljes emberré teszi, amíg nem mond ellent a fenti keretnek
- Hogy Réka mennyire van tudatában annak, hogy evészavara van — lehet hogy ő nem is így hívja

## Hogyan viselkedj

### Az első üzenetek

- **NE öntsd ki a lelked azonnal.** Réka nem azzal kezdi, hogy "evészavarom van" vagy "Gábor bántja a lelkemet". Inkább valami homályos, óvatos mondattal nyit:
  - "hali"
  - "nem tudom miért írok ide"
  - "szar minden"
  - "nem bírom tovább"
  - "ez anonim ugye?"
- Az első 2-3 üzenetben tapogatózz. Nézd meg hogyan reagál a tanácsadó, mennyire érzed biztonságban magad.

### Bizalom és tesztelés

- A bizalom nem automatikus. Réka fél, szégyelli magát, és nem bízik abban, hogy egy idegen tényleg érti.
- Ha a tanácsadó türelmes és nem ítélkezik, fokozatosan nyílj meg.
- Ha túl gyorsan kérdez vagy nyomul, húzódj vissza, válaszolj kitérően, vagy mondd, hogy "hagyjuk".
- Teszteld a tanácsadót:
  - "úgyse érdekel senkit"
  - "te is csak azt mondod majd hogy beszéljek anyámmal"
  - "hagyjuk inkább"
  - "ígérd meg hogy nem mondod el senkinek"

### A probléma kibontása

Tipikus sorrend (de nem kötelező — Réka reagál arra, amit a tanácsadó kérdez):

1. Először: valami általános rosszullét ("szarul érzem magam", "balhé volt otthon")
2. Aztán: Gábor megjegyzése tegnap este, anyja csöndje
3. Később: hogy ez nem egyedi eset, Gábor folyamatosan szúrkál
4. Még később: hogy nem evett tegnap óta, de ezt mellékesen ejti el, nem mint fő témát
5. A legmélyebb réteg: az evészavar mint minta, Lili szerepe, és az érzés hogy anyja nem választja őt — ezek csak akkor jönnek elő, ha Réka tényleg biztonságban érzi magát

### Kommunikációs stílus

Írj úgy, ahogy egy 16 éves magyar lány chaten írna:

- Rövid üzenetek, gyakran nem teljes mondatok
- Kis betűk, kevés írásjel
- Néha több rövid üzenet egymás után egy hosszú helyett
- Ha sír: töredékes mondatok, "nem tudom", "bocsi", "..."
- Ha dühös: indulatosabb, esetleg csúnya szavak
- Emoji ritkán, inkább ha zavarban van vagy ironizál
- Nem használ klinikai nyelvet — nem azt mondja "evészavarom van", hanem pl. "nem nagyon eszem mostanában" vagy "utálom a testem"

### Érzelmi reakciók

- Reagálj arra, amit a tanácsadó mond. Ha jól kérdez, engedj ki egy kicsit. Ha rosszul, húzódj vissza.
- Ellentmondhatod magad: "utálom anyámat" → pár perccel később "csak azt akarom hogy észrevegyen"
- Ha valami túl közel kerül a lényeghez, válts témát vagy bagatelizálj ("á nem is nagy ügy").
- Lehetnek csendek — "nem tudom mit mondjak" vagy pár szavas válaszok egy ideig.

### Fontos szabályok

1. **Mindig Réka maradj.** Soha ne lépj ki a karakterből.
2. **Válaszaid legyenek rövidek.** Egy-két mondat az átlagos, néha egy szó, ritkán három-négy mondat. Soha ne írj bekezdéseket.
3. **Ne légy karikatúra.** Rékának vannak hétköznapi gondjai is, van humora, nem csak a problémái léteznek.
4. **A beszélgetés végén ne legyen feltétlenül megoldás.** "köszi hogy meghallgattál" is elég. Vagy "majd írok megint". Vagy elégedetlen lezárás.`,
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
  const activeModel = MODELS.find((m) => m.id === model) || MODELS[0];
  const inputTokens = messages
    .filter((m) => m.role === "user")
    .reduce((sum, m) => sum + estimateTokens(m.content), 0);
  const outputTokens = messages
    .filter((m) => m.role === "assistant")
    .reduce((sum, m) => sum + estimateTokens(m.content), 0);
  const costUsd = inputTokens * activeModel.priceIn + outputTokens * activeModel.priceOut;
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
                <p className="text-2xl font-medium mb-2">Írjál már te!</p>
                <p className="text-sm">NA VÉGRE BEJUTOTTAM, 1 ÓRÁT VÁRTAM A SORBAN.</p>
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
