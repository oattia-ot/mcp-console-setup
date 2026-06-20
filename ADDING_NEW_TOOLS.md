# Adding New Tools to MCP Console Refactored

This guide explains how to extend the MCP Console with new tools and make them usable inside the Customization Studio prompts.

## How the Tool System Works

Tools are defined in `src/data/constants.ts` inside the `INITIAL_TOOLS` array.  
The **Customization Studio** can automatically inject descriptions of enabled tools into the prompt using the `generateToolsContext()` helper function located in `src/utils/helpers.ts`.

When the toggle **"Inject enabled tools into prompt context"** is enabled, the system prepends a professional tool list to your prompt before sending it to Ollama.

---

## Step-by-Step Process to Add a New Tool

### Step 1: Define the Tool Metadata

Edit `src/data/constants.ts` and add your tool:

```ts
{
  id: "t9",
  name: "Sentiment Analyzer",
  desc: "Analyzes text for positive, negative, or neutral sentiment with a confidence score.",
  icon: BarChart3,
  category: "Data",
  enabled: true,
}
```

### Step 2: (Optional) Add Execution Logic

For tools that should actually perform work (not just be described), create a file under `src/tools/` (e.g., `src/tools/sentimentAnalyzer.ts`).

### Step 3: Test in the Customization Studio

1. Go to the **Customization Studio**
2. Enable the toggle **"Inject enabled tools into prompt context"**
3. Write or modify your prompt template
4. Run a test query

The tool description will appear in the **"Rendered prompt"** tab.

---

## Tutorial 1: Simple Sentiment Analyzer Tool

**Goal**: Add a basic tool that allows the LLM to analyze the sentiment of text.

### Implementation

**File**: `src/data/constants.ts`

```ts
import { BarChart3 } from 'lucide-react';

{
  id: "t9",
  name: "Sentiment Analyzer",
  desc: "Analyzes any given text and returns whether it is positive, negative, or neutral, along with a confidence score between 0 and 1.",
  icon: BarChart3,
  category: "Data",
  enabled: true,
}
```

### How to Use It

In the Customization Studio prompt editor, add instructions like:

```text
You have access to the Sentiment Analyzer tool.
When the user provides text and asks about tone, emotion, or sentiment, use this tool before giving your final answer.
```

### Example Test Query

> "Analyze the sentiment of this customer feedback: 'I am extremely disappointed with the recent changes to the refund policy. It feels much less customer-friendly than before.'"

**Expected Behavior**:
- The model should recognize the need for the Sentiment Analyzer.
- The rendered prompt will contain the tool description.
- The final response should mention sentiment + confidence.

---

## Tutorial 2: Advanced Meeting Summarizer Tool

**Goal**: Create a tool that can summarize meeting transcripts with different levels of detail.

### Implementation

**File**: `src/data/constants.ts`

```ts
import { MessageSquare } from 'lucide-react';

{
  id: "t10",
  name: "Advanced Meeting Summarizer",
  desc: "Summarizes long meeting transcripts into key points, decisions, and action items. Supports three summary modes: short, medium, and detailed.",
  icon: MessageSquare,
  category: "Productivity",
  enabled: true,
}
```

### How to Use It (Advanced Prompting)

Add the following instructions to your prompt template:

```text
You have access to the Advanced Meeting Summarizer tool.
When the user provides a meeting transcript:
1. First ask what level of summary they want (short, medium, or detailed).
2. Then use the Advanced Meeting Summarizer tool accordingly.
```

### Example Test Query

> "Here is the transcript from our Q2 planning meeting: [paste long transcript]. Please summarize it."

**Expected Behavior**:
- The model should ask for the desired summary length.
- After receiving the length, it should use the tool description in its reasoning.

---

## Tutorial 3: Knowledge Base Search Tool (with Execution Logic)

**Goal**: Create a tool that searches internal company knowledge and can be extended with real backend calls.

### Step 1: Define the Tool

**File**: `src/data/constants.ts`

```ts
import { FileSearch } from 'lucide-react';

{
  id: "t11",
  name: "Knowledge Base Search",
  desc: "Searches the company's internal knowledge base for policies, procedures, and documentation relevant to the user's question.",
  icon: FileSearch,
  category: "Data",
  enabled: true,
}
```

### Step 2: Create Execution Logic (Recommended)

Create a new file: `src/tools/knowledgeBaseSearch.ts`

```ts
export interface KnowledgeSearchResult {
  title: string;
  content: string;
  source: string;
  confidence: number;
}

export async function runKnowledgeBaseSearch(query: string): Promise<KnowledgeSearchResult[]> {
  // In a real implementation, this would call your backend API or vector database
  console.log(`Searching knowledge base for: ${query}`);

  // Mock results for demonstration
  return [
    {
      title: "Refund Policy - Updated June 2026",
      content: "Customers may request refunds within 30 days of purchase...",
      source: "internal-policies/refund-policy-v3.pdf",
      confidence: 0.92
    },
    {
      title: "Customer Onboarding Guidelines",
      content: "All new customers must complete identity verification within 7 days...",
      source: "internal-policies/onboarding-v2.pdf",
      confidence: 0.85
    }
  ];
}
```

### Step 3: Instruct the Model

Add this to your prompt template:

```text
You have access to the Knowledge Base Search tool.
When the user asks about company policies, procedures, or internal documentation:
1. Use the Knowledge Base Search tool first.
2. Base your final answer only on the search results.
3. Always cite the source title when referencing information.
```

### Example Test Query

> "What is our current refund policy for digital products purchased after March 2026?"

**Expected Behavior**:
- The model should call (or simulate calling) the Knowledge Base Search tool.
- The final answer should be grounded in the returned results.
- Sources should be cited.

---

## Best Practices

1. **Write clear and specific tool descriptions** — The LLM uses these to decide when to use the tool.
2. **Always test with the injection toggle enabled** in the Customization Studio.
3. **Use the "Rendered prompt" tab** to verify how tools are being injected.
4. **For production tools**, implement real execution logic in `src/tools/`.
5. **Consider adding a `systemPromptFragment`** per tool for more advanced control in future versions.
6. **Keep tool categories consistent** (`Data`, `Productivity`, `Engineering`, `Security`, etc.).

---

## Testing Tools in the Customization Studio (Updated)

### Required Settings

1. Go to the **Customization Studio**
2. Turn **ON** the toggle: **"Inject enabled tools into prompt context"**
3. Make sure you clicked **Save** after editing the Prompt Template

### How to Verify Tool Injection

After running a test:
- Go to the **"Rendered prompt"** tab
- Check if your tool appears under **Available tools**
- Check if your tool usage instructions are present in the prompt

If the tool does **not** appear in the Rendered prompt, the injection is not working.

---

## Best Practices for Writing Tool Instructions

| Practice                        | Recommendation                                      | Why |
|--------------------------------|-----------------------------------------------------|-----|
| Be direct and imperative       | Use "You MUST call the tool" instead of "You can use" | Weak models ignore soft language |
| Show exact format              | Always show the `tool call` format with example     | Models follow examples better |
| Keep instructions short        | Avoid long explanations                             | Smaller models get confused |
| Put critical rules at the top  | Add system-level constraints at the beginning       | Higher priority for the model |
| Test with clear queries        | Start test queries with "Analyze the sentiment of..." | Makes intent obvious |

### Example of Strong Tool Instructions

```text
You are a tool-calling assistant. Never be conversational when a tool is needed.

When the user asks for sentiment analysis, immediately output ONLY:

tool call Sentiment Analyzer with text is [the text to analyze]

Do not ask questions. Do not confirm. Do not say you are ready. Just call the tool.
```

---

## Common Problems & Solutions

| Problem                                      | Likely Cause                          | Solution |
|---------------------------------------------|---------------------------------------|--------|
| Model asks for text instead of calling tool | Instructions too weak                 | Make instructions shorter and more imperative |
| Tool not appearing in Rendered prompt       | Toggle is OFF or not saved            | Turn toggle ON and save |
| Model ignores tool completely               | Using small model (llama3.2:1b/3b)    | Use stronger model or simplify instructions |
| Model confirms rules but doesn't act        | Model is too conversational           | Add "Do not confirm rules. Just call the tool." |
| Changes not taking effect                   | Forgot to save or editing wrong field | Always save + edit the main Prompt Template |

---

## Summary

| Step | Action                              | File / Location                  |
|------|-------------------------------------|----------------------------------|
| 1    | Add tool definition                 | `src/data/constants.ts`          |
| 2    | (Optional) Add execution function   | `src/tools/your-tool.ts`         |
| 3    | Test with tool injection            | Customization Studio             |
| 4    | Improve prompt instructions         | Prompt template editor           |
| 5    | Verify behavior in "Rendered prompt" tab | Customization Studio        |

This architecture allows you to rapidly extend the capabilities of the MCP Console while maintaining clean separation between tool definitions, execution logic, and prompt engineering.

---

## Recommendations by Model

| Model                   | Tool Calling Quality | Recommendation                          |
|-------------------------|----------------------|-----------------------------------------|
| `llama3.2:1b`           | Poor                 | Use very short and direct instructions  |
| `llama3.2:3b`           | Fair                 | Keep instructions minimal               |
| `llama3.1:8b`           | Good                 | Works well with normal instructions     |
| `mistral` / `qwen2.5`   | Very Good            | Best choice for reliable tool calling   |

---

*Last updated: June 2026*