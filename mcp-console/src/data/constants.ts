import {
  FileSearch, Mail, Terminal, MessageSquare, Database, Bell, Calendar,
  FolderOpen, Users, ShieldCheck, Wrench, Plug, LayoutGrid, Wand2
} from 'lucide-react';
import type { User, Role, Tool, Integration, ActivityLogEntry } from '../types';

export const INITIAL_USERS: User[] = [
  { id: 1, name: "Sarah Chen", email: "sarah.chen@company.com", role: "Admin", status: "active", lastActive: "2 min ago" },
  { id: 2, name: "Marcus Webb", email: "marcus.webb@company.com", role: "Integration Manager", status: "active", lastActive: "18 min ago" },
  { id: 3, name: "Priya Nair", email: "priya.nair@company.com", role: "Editor", status: "active", lastActive: "1 hr ago" },
  { id: 4, name: "Diego Alvarez", email: "diego.alvarez@company.com", role: "Viewer", status: "invited", lastActive: "—" },
  { id: 5, name: "Lena Kowalski", email: "lena.kowalski@company.com", role: "Editor", status: "suspended", lastActive: "4 days ago" },
];

export const ROLES: Role[] = [
  {
    name: "Admin",
    desc: "Full access to all modules, billing, and security settings.",
    perms: ["Manage users", "Manage integrations", "Manage tools", "Manage billing", "View audit log"]
  },
  {
    name: "Integration Manager",
    desc: "Connect and configure third-party platforms and sync schedules.",
    perms: ["Manage integrations", "View audit log"]
  },
  {
    name: "Editor",
    desc: "Build and edit prompt templates and tool configurations.",
    perms: ["Manage tools", "Edit prompts"]
  },
  {
    name: "Viewer",
    desc: "Read-only access to dashboards and activity logs.",
    perms: ["View dashboards"]
  },
];

export const INITIAL_TOOLS: Tool[] = [
  {
    id: "t1",
    name: "Knowledge Search",
    desc: "Semantic search across every connected knowledge base.",
    icon: FileSearch,
    category: "Data",
    enabled: true,
    promptTemplates: [
      {
        id: "t1-default",
        name: "Default",
        description: "Balanced retrieval answer with citations.",
        template: "You are a retrieval assistant for OpenText Knowledge Discovery.\nUser role: {{user_role}}\nContext: {{context}}\nQuestion: {{query}}\n\nAnswer using only the supplied context. Cite source titles.",
      },
      {
        id: "t1-concise",
        name: "Concise",
        description: "Short, no-fluff answers.",
        template: "Using Knowledge Search results, answer in 2-3 sentences max.\nContext: {{context}}\nQuestion: {{query}}",
      },
    ],
  },
  {
    id: "t2",
    name: "Email Drafting Assistant",
    desc: "Generates contextual email drafts from a short prompt.",
    icon: Mail,
    category: "Productivity",
    enabled: true,
    promptTemplates: [
      {
        id: "t2-default",
        name: "Default",
        description: "Professional tone, ready to send.",
        template: "You are an email drafting assistant.\nRecipient context: {{context}}\nRequest: {{query}}\n\nDraft a clear, professional email. Include a subject line.",
      },
    ],
  },
  { id: "t3", name: "Code Review Bot", desc: "Flags style and security issues in pull requests.", icon: Terminal, category: "Engineering", enabled: false },
  { id: "t4", name: "Meeting Summarizer", desc: "Turns call transcripts into action items automatically.", icon: MessageSquare, category: "Productivity", enabled: true },
  { id: "t5", name: "Data Export", desc: "Scheduled exports of structured records to CSV or Parquet.", icon: Database, category: "Data", enabled: false },
  { id: "t6", name: "Slack Notifications", desc: "Pushes workflow events into Slack channels in real time.", icon: Bell, category: "Communication", enabled: true },
  { id: "t7", name: "Calendar Scheduler", desc: "Finds and books meeting slots across shared calendars.", icon: Calendar, category: "Productivity", enabled: false },
  { id: "t8", name: "Document Classifier", desc: "Tags inbound documents by type and sensitivity level.", icon: FolderOpen, category: "Security", enabled: true },
];

export const INITIAL_INTEGRATIONS: Integration[] = [
  { id: "opentext", name: "OpenText Knowledge Discovery", desc: "Enterprise knowledge retrieval and content intelligence.", letter: "OT", status: "connected", category: "Knowledge" },
  { id: "salesforce", name: "Salesforce", desc: "Sync accounts, contacts, and opportunities.", letter: "SF", status: "disconnected", category: "CRM" },
  { id: "slack", name: "Slack", desc: "Real-time alerts and conversational workflows.", letter: "SL", status: "connected", category: "Communication" },
  { id: "jira", name: "Jira", desc: "Two-way sync of issues and sprint status.", letter: "JR", status: "disconnected", category: "Engineering" },
  { id: "teams", name: "Microsoft Teams", desc: "Channel notifications and meeting bots.", letter: "MT", status: "connected", category: "Communication" },
  { id: "gdrive", name: "Google Drive", desc: "Index and retrieve files from shared drives.", letter: "GD", status: "disconnected", category: "Storage" },
];

export const ACTIVITY_LOG: ActivityLogEntry[] = [
  { time: "14:02:11", msg: "Sarah Chen enabled Slack Notifications", tone: "success" },
  { time: "13:47:55", msg: "Connection test passed for OpenText Knowledge Discovery (42ms)", tone: "success" },
  { time: "13:30:02", msg: "Marcus Webb updated the Field Mapping for OpenText KD", tone: "info" },
  { time: "12:58:41", msg: "Manual sync completed — 1,204 documents indexed", tone: "success" },
  { time: "12:10:17", msg: "Diego Alvarez was invited as Viewer", tone: "info" },
  { time: "11:44:09", msg: "Code Review Bot disabled by Priya Nair", tone: "muted" },
  { time: "10:02:55", msg: "Failed login attempt blocked from 203.0.113.4", tone: "danger" },
];

export const LETTER_COLORS: Record<string, string> = {
  opentext: "#E8A33D",
  salesforce: "#5B9DF0",
  slack: "#4ADE80",
  jira: "#F2545B",
  teams: "#9b8cff",
  gdrive: "#4ADE80",
};

export const DEFAULT_PROMPT_TEMPLATE = `You are a retrieval assistant for OpenText Knowledge Discovery.
User role: {{user_role}}
Context: {{context}}
Question: {{query}}

Answer using only the supplied context. Cite source titles.`;

/** Sentinel value for "no specific tool selected" in the Studio template combobox */
export const NO_TOOL_ID = 'none';

// New: Default tools context injection template (for professional tool-aware prompts)
export const TOOL_CONTEXT_INSTRUCTION = `
You have access to the following internal tools. Use them when appropriate by calling them in the format:
TOOL_CALL: tool_name with args if needed.

Available tools:
{{tools_list}}
`;

// Navigation items (moved from component for reusability)
export const NAV_ITEMS = [
  { id: 'overview' as const, label: 'Overview', icon: LayoutGrid },
  { id: 'admin' as const, label: 'Admin Configuration', icon: ShieldCheck },
  { id: 'tools' as const, label: 'Tools Library', icon: Wrench },
  { id: 'integrations' as const, label: 'Integrations', icon: Plug },
  { id: 'studio' as const, label: 'Customization Studio', icon: Wand2 },
];

// Ollama connection defaults + model picker options (Settings modal / Customization Studio)
// Smart default for Ollama URL
// Priority: VITE_OLLAMA_URL (build time) → internal Docker hostname (when running in container) → localhost
const getDefaultOllamaUrl = () => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_OLLAMA_URL) {
    return (import.meta as any).env.VITE_OLLAMA_URL;
  }
  // Heuristic: if we're likely inside Docker (common in this setup), try the service name first
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // When running the dev server inside Docker, prefer the compose service name
    return 'http://ollama:11434';
  }
  return 'http://localhost:11434';
};

export const DEFAULT_OLLAMA_URL = getDefaultOllamaUrl();

export const DEFAULT_OLLAMA_MODEL = 'llama3.2';

// Shown as quick-pick suggestions in the Model Settings modal. Any model tag can still be
// typed in manually (e.g. "gemma3:12b") as long as it has been pulled in the Ollama container.
export const OLLAMA_MODEL_OPTIONS: string[] = [
  'llama3.2',
  'llama3.1',
  'llama3.1:70b',
  'gemma3:4b',
  'gemma3:12b',
  'gemma3:27b',
  'mistral',
  'qwen2.5',
  'phi4',
];

export const PAGE_TITLES: Record<string, [string, string]> = {
  overview: ["System Overview", "A snapshot of platform usage and health."],
  admin: ["Admin Configuration", "Manage users, roles, and security policy."],
  tools: ["Tools Library", "Enable, disable, and configure internal tools."],
  integrations: ["Integrations", "Connect and manage third-party platforms."],
  studio: ["Customization Studio", "Engineer prompts and test them against live data."],
};