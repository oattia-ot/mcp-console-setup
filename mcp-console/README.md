# MCP Console — Refactored Professional Edition

A modern, modular React + TypeScript dashboard for managing AI tools, integrations, users, and prompt engineering (with live Ollama testing).

This is a **professional refactor** of the original monolithic `App.tsx` (62KB single file). It demonstrates clean architecture, separation of concerns, TypeScript types, reusable components, and — most importantly — **how to properly define and use tools inside prompts**.

## Project Structure (Professional Layout)

```
mcp-console-refactored/
├── src/
│   ├── App.tsx                 # Main orchestrator (state, handlers, layout)
│   ├── types/
│   │   └── index.ts            # All interfaces & type aliases
│   ├── data/
│   │   └── constants.ts        # INITIAL_USERS, TOOLS, INTEGRATIONS, ROLES, defaults
│   ├── utils/
│   │   └── helpers.ts          # estimateTokens, generateToolsContext, etc.
│   ├── components/
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       ├── Badge.tsx
│   │       ├── Switch.tsx
│   │       ├── Led.tsx
│   │       ├── Field.tsx
│   │       ├── CornerTicks.tsx
│   │       ├── StatPill.tsx
│   │       └── index.ts        # Barrel export
│   ├── pages/
│   │   ├── OverviewPage.tsx
│   │   ├── AdminPage.tsx
│   │   ├── ToolsPage.tsx
│   │   ├── IntegrationsPage.tsx
│   │   └── StudioPage.tsx      # Enhanced with tool context injection
│   └── hooks/                  # (future) useToast, useKDConfig, etc.
├── README.md
└── package.json (suggested)
```

## Key Professional Improvements

- **Strong TypeScript** everywhere (`User`, `Tool`, `Integration`, `StudioOutput`, etc.)
- **Single Responsibility**: Each page and common component has one clear job.
- **Reusable UI primitives** in `components/common/`
- **Data & constants centralized** — easy to mock or replace with API calls.
- **Pure utility functions** (token counting, tools context generation)
- **Enhanced Customization Studio**: New "Inject enabled tools into prompt context" toggle that automatically prepends a professional tool description block. This is the core pattern for **using tools in prompts**.
- **Self-contained**: Still works as a single-file drop-in if you copy `App.tsx` + styles (for demos), but now easily scalable.
- **Future-ready**: `configTool` modal stub, prepared field mapping UI, sync progress, etc.

### Core TypeScript Interface (from `src/types/index.ts`)

```ts
import { LucideIcon } from 'lucide-react';

export interface Tool {
  id: string;
  name: string;
  desc: string;
  icon: LucideIcon;
  category: string;
  enabled: boolean;
}
```

This interface is used everywhere (state, props, `generateToolsContext`, etc.). Adding a new tool automatically satisfies it.

## Step-by-Step Guide: Adding a Simple New Tool and Using It in the Prompt

> **Example used throughout this guide**: We will add a **"Sentiment Analyzer"** tool (`id: "t9"`) and make it automatically appear in the Customization Studio prompt context.

This is the **recommended professional workflow** for extending the platform.

### Step 1: Define the Tool (in `src/data/constants.ts`)

Add your new tool to the `INITIAL_TOOLS` array. Keep the shape consistent with the `Tool` interface.

```ts
// src/data/constants.ts
import { BarChart3 } from 'lucide-react'; // or any lucide icon

export const INITIAL_TOOLS: Tool[] = [
  // ... existing tools
  {
    id: "t9",
    name: "Sentiment Analyzer",
    desc: "Analyzes text for positive, negative, or neutral sentiment with confidence score.",
    icon: BarChart3,
    category: "Data",
    enabled: true,
  },
];
```

> **Why here?** Central data file makes it easy to later load from an API or CMS.

### Step 2: (Optional but Recommended) Add Tool-Specific Logic

If your tool needs its own configuration UI, validation, or real backend execution, create a dedicated module:

**Example: `src/tools/sentimentAnalyzer.ts`**

```ts
// src/tools/sentimentAnalyzer.ts
import type { Tool } from '../types';

export const sentimentAnalyzerTool: Tool = {
  id: 't9',
  name: 'Sentiment Analyzer',
  desc: 'Analyzes text for positive, negative, or neutral sentiment with confidence score.',
  icon: BarChart3, // imported from lucide-react
  category: 'Data',
  enabled: true,
};

// Future: real execution (called from an agent loop or Studio)
export async function runSentimentAnalyzer(text: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  explanation: string;
}> {
  // In production: call your backend, Hugging Face, or another LLM
  // For demo we can even call Ollama again with a specialized prompt.
  console.log('Running sentiment analysis on:', text);
  
  // Mock implementation
  return {
    sentiment: 'positive',
    confidence: 0.87,
    explanation: 'The refund policy changes are presented as customer-friendly improvements.',
  };
}

// Optional: per-tool system prompt fragment (more advanced than generic list)
export const sentimentSystemPrompt = `
When the user asks about tone, emotion, or customer feedback, call the Sentiment Analyzer tool.
Return results in this exact format: SENTIMENT: positive|negative|neutral | CONFIDENCE: 0.xx
`;
```

Then register it in `constants.ts` (Step 1) and import the `run*` function where needed (e.g. future agent executor in `App.tsx` or a new `hooks/useToolExecutor.ts`). 

For the initial version, **prompt injection alone is enough** — the LLM becomes aware of the tool and can reason about when to use it.

### Step 3: Make the Tool Appear in the UI

Nothing else needed! Because:

- `ToolsPage` reads from the `tools` state (which comes from `INITIAL_TOOLS`)
- Users can enable/disable it with the toggle
- The Studio automatically sees enabled tools via the `enabledTools` prop

### Step 4: Use the Tool **Inside Prompts** (The Magic — Professional Pattern)

This is where the refactor shines.

Open the **Customization Studio**.

1. Toggle **"Inject enabled tools into prompt context"** (new feature added in this refactor).
2. Write or edit your prompt template. You can still use variables like `{{query}}`.
3. Click **Run test**.

**What happens under the hood** (real code from this refactor):

**1. `src/utils/helpers.ts` — the reusable context generator**

```ts
import type { Tool } from '../types';

export function generateToolsContext(tools: Tool[]): string {
  const enabledTools = tools.filter(t => t.enabled);
  if (enabledTools.length === 0) return 'No tools currently enabled.';

  return enabledTools
    .map(tool => `- ${tool.name} (${tool.category}): ${tool.desc}`)
    .join('\n');
}
```

**2. `src/pages/StudioPage.tsx` — the UI toggle + injection trigger**

```tsx
// Inside StudioPage component
const [includeTools, setIncludeTools] = useState(true);

const toolsContext = includeTools ? generateToolsContext(enabledTools) : '';

const handleRunTest = () => {
  let finalPrompt = promptTemplate;

  if (includeTools && toolsContext) {
    const toolsSection = `
You have access to the following internal tools. Use them when appropriate by calling them in the format:
TOOL_CALL: tool_name with args if needed.

Available tools:
${toolsContext}
`;
    if (!finalPrompt.toLowerCase().includes('you have access to the following')) {
      finalPrompt = toolsSection + '\n\n' + finalPrompt;
    }
  }

  // Pass to parent which performs the actual Ollama call
  runStudioTest(includeTools ? toolsContext : undefined);
};
```

**3. `src/App.tsx` — receives the context and builds the final prompt for Ollama**

```ts
async function runStudioTest(toolsContext?: string) {
  // ...
  let finalPrompt = promptTemplate;

  if (toolsContext) {
    const toolsInstruction = `
You have access to the following internal tools. Use them when appropriate.

Available tools:
${toolsContext}
`;
    if (!finalPrompt.toLowerCase().includes('you have access to the following internal tools')) {
      finalPrompt = toolsInstruction + finalPrompt;
    }
  }

  const renderedPrompt = finalPrompt
    .replaceAll('{{query}}', testQuery)
    .replaceAll('{{user_role}}', 'Editor')
    .replaceAll('{{context}}', '[Retrieved context from knowledge base would go here]');

  // ... fetch to Ollama with renderedPrompt
}
```

The LLM now **knows** about your new `Sentiment Analyzer` and can decide to "use" it.

**Example rendered prompt the model actually receives** (you can verify this in the Studio's "Rendered prompt" tab):

```text
You have access to the following internal tools. Use them when appropriate by calling them in the format:
TOOL_CALL: tool_name with args if needed.

Available tools:
- Knowledge Search (Data): Semantic search across every connected knowledge base.
- Email Drafting Assistant (Productivity): Generates contextual email drafts from a short prompt.
- Sentiment Analyzer (Data): Analyzes text for positive, negative, or neutral sentiment with confidence score.
- ...

You are a retrieval assistant for OpenText Knowledge Discovery.
User role: Editor
Context: [Retrieved context from knowledge base would go here]
Question: What changed in our refund policy this quarter?

Answer using only the supplied context. Cite source titles.
```

**Pro tip:** Update your base prompt template (in the left editor) to include usage guidance:

```text
You are a retrieval assistant...
If the user's question involves tone, emotion, customer feedback, or policy perception,
first reason about whether the Sentiment Analyzer tool would be helpful, then answer.
```

This combination (automatic tool list + explicit instructions in your template) gives you very reliable tool-aware behavior.

### Step 5: Test & Iterate

- Run the test in Studio.
- Switch to the **"Rendered prompt"** tab to verify the tools section was injected.
- Adjust your base prompt template to include instructions like:
  > "If the question requires sentiment, call the Sentiment Analyzer tool first."

### Bonus: Making It Production-Ready (Code Examples)

**1. Real tool schemas (upgrade `generateToolsContext`)**

Instead of plain text, return structured data the model (or a future function-calling endpoint) can use:

```ts
// Enhanced version in utils/helpers.ts
export function generateToolSchemas(tools: Tool[]) {
  return tools
    .filter(t => t.enabled)
    .map(t => ({
      name: t.id,
      description: t.desc,
      parameters: { type: "object", properties: { query: { type: "string" } } } // example
    }));
}
```

**2. Minimal tool execution loop (add to `App.tsx` or a new hook)**

```ts
// Very simplified ReAct-style loop (pseudo-code you can implement)
async function runWithTools(userQuery: string, enabledTools: Tool[]) {
  let prompt = buildInitialPrompt(userQuery, enabledTools);
  let response = await callOllama(prompt);

  // Naive parser - in production use regex or a small state machine
  const toolCallMatch = response.match(/TOOL_CALL:\s*(\w+)\s*(.*)/);
  if (toolCallMatch) {
    const [_, toolId, args] = toolCallMatch;
    const result = await executeTool(toolId, args);           // your registry
    const followUp = `Tool result: ${JSON.stringify(result)}\n\nNow answer the original question.`;
    response = await callOllama(prompt + "\n\n" + followUp);
  }
  return response;
}

async function executeTool(toolId: string, args: string) {
  if (toolId === 't9') return runSentimentAnalyzer(args); // from your tool module
  // ... other tools
  return { error: 'Unknown tool' };
}
```

**3. Persist tools** — replace `INITIAL_TOOLS` import with an API call:

```ts
const [tools, setTools] = useState<Tool[]>([]);
useEffect(() => {
  fetch('/api/tools').then(r => r.json()).then(setTools);
}, []);
```

**4. Per-tool system fragments** (advanced)

Add an optional `systemPromptFragment?: string` field to the `Tool` interface and concatenate only the enabled ones at the top of every rendered prompt. This gives each tool a chance to "teach" the model how to use it.

## Changing the LLM Model

The Customization Studio talks to a local [Ollama](https://ollama.com) server over HTTP and asks it to run a model (`llama3.2` by default). There are two independent things that need to agree:

1. **Which model is actually pulled/running in Ollama.**
2. **Which model name the app sends in its request.**

You can change either or both. The easiest path is #2 via the UI — Ollama doesn't have to be restarted, you just need the model already pulled.

### Option A — Change the model from the UI (recommended)

1. Click the **gear icon** in the top-right of the app (top bar, next to the bell icon). This opens the **Model Settings** modal.
2. Set the **Ollama server URL** (defaults to `http://localhost:11434` — change this if Ollama runs on a different host/port).
3. Set **Model** to any tag your Ollama container has pulled, e.g. `gemma3:12b`. You can either type it directly or click one of the quick-pick chips.
4. Click **Save changes**.

The selected model is stored in your browser (`localStorage`) and is sent with every subsequent **Run test** in the Customization Studio — no rebuild or restart required. This setting was previously hardcoded to `llama3.2` and ignored anything you typed in the UI; that's now fixed — the gear icon is wired up and the Studio reads from this setting instead of a hardcoded string.

> If the model hasn't been pulled yet, the test will fail with a connection/model error. Pull it first (see below), then try again.

### Option B — Change the default model via Docker Compose

This repo includes a `docker-compose.yml` that runs Ollama as a container and an `ollama-pull` helper that pulls a model into it. To switch the default model (e.g. to `gemma3:12b`):

```yaml
# docker-compose.yml
  ollama-pull:
    image: ollama/ollama:latest
    depends_on:
      - ollama
    environment:
      - OLLAMA_HOST=ollama:11434
      - OLLAMA_MODEL=gemma3:12b   # <-- change this line
    entrypoint: ["/bin/sh", "-c"]
    command: ["sleep 3 && ollama pull \"$OLLAMA_MODEL\""]
    volumes:
      - ollama-data:/root/.ollama
```

Then start (or re-run) the pull:

```bash
docker compose up -d ollama
docker compose run --rm ollama-pull
```

This downloads `gemma3:12b` into the shared `ollama-data` volume. After it finishes, open the app's **Model Settings** modal (Option A) and set **Model** to `gemma3:12b` so the Studio actually requests it.

### Pulling a model manually (no Docker Compose)

If you're running Ollama directly on your machine instead of via Docker Compose:

```bash
ollama pull gemma3:12b
```

If Ollama is running inside a plain `docker run` container instead:

```bash
docker exec -it ollama ollama pull gemma3:12b
```

Either way, once the pull finishes, set the same model name in the **Model Settings** modal in the UI.

## Running the App

This is a standard Vite + React + TypeScript project.

```bash
npm create vite@latest . -- --template react-ts
npm install lucide-react
# copy the src/ folder contents
npm run dev
```

Start Ollama (via the included `docker-compose.yml`, or your own install) and pull a model:

```bash
docker compose up -d ollama
docker compose run --rm ollama-pull   # pulls llama3.2 by default
```

Then open the app and use the **gear icon → Model Settings** to point the Studio at your Ollama URL/model — see [Changing the LLM Model](#changing-the-llm-model) above for details and other ways to switch models (e.g. `gemma3:12b`).

## Summary

By refactoring into small, focused pieces we gained:

- Maintainability
- Type safety
- Reusability
- A **clear, documented pattern** for adding tools **and making them usable inside prompts**

The "Inject tools into prompt" toggle in the Studio is the concrete example of the professional approach you should follow when building agentic or tool-augmented LLM features.

Happy building! 🚀

---

*Refactored & documented on 2026-06-19 by Grok*