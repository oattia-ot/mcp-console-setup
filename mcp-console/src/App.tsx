import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Activity, Search, ChevronRight, X, Plus, Trash2, RefreshCw, Eye, EyeOff, Power, Database,
  Link2, SlidersHorizontal, Zap, AlertCircle, CheckCircle2, Circle, ArrowUpRight, ArrowDownRight,
  MoreVertical, Save, PlayCircle, BarChart3, LayoutGrid, Terminal, Mail, Calendar, FileSearch,
  MessageSquare, FolderOpen, ShieldAlert, KeyRound, Gauge, Wand2, LogOut, Clock, Hash, Cpu,
  FileText, ChevronDown, ChevronUp, Bell, Settings
} from 'lucide-react';

// Types & Data
import type {
  Page, User, Tool, Integration, SecuritySettings, AdminTab, KdConfig, StudioOutput, Toast, ToastTone
} from './types';
import {
  INITIAL_USERS, INITIAL_TOOLS, INITIAL_INTEGRATIONS, ROLES, NAV_ITEMS, PAGE_TITLES, DEFAULT_PROMPT_TEMPLATE,
  DEFAULT_OLLAMA_URL, DEFAULT_OLLAMA_MODEL, OLLAMA_MODEL_OPTIONS
} from './data/constants';
import { estimateTokens, countWords } from './utils/helpers';

// Common UI
import { Btn, Modal, Badge, Switch, Led, Field, CornerTicks } from './components/common';

// Pages
import { OverviewPage } from './pages/OverviewPage';
import { AdminPage } from './pages/AdminPage';
import { ToolsPage } from './pages/ToolsPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { StudioPage } from './pages/StudioPage';

/* ----------------------------- DESIGN TOKENS (kept as CSS string for self-contained demo) ---------------------------- */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

.mcp-root {
  --bg: #0B0E14;
  --bg-elevated: #0F1320;
  --surface: #11151D;
  --surface-2: #161B25;
  --border: #232938;
  --border-soft: #1A2030;
  --text: #E8EAED;
  --text-muted: #8B93A3;
  --text-faint: #5C6478;
  --accent: #E8A33D;
  --accent-strong: #F5C065;
  --accent-dim: rgba(232,163,61,0.14);
  --success: #4ADE80;
  --success-dim: rgba(74,222,128,0.12);
  --danger: #F2545B;
  --danger-dim: rgba(242,84,91,0.12);
  --info: #5B9DF0;
  --info-dim: rgba(91,157,240,0.12);
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', system-ui, sans-serif;
  min-height: 100vh;
  width: 100%;
}
.mcp-root * { box-sizing: border-box; }
.mcp-display { font-family: 'Space Grotesk', 'Inter', sans-serif; }
.mcp-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; letter-spacing: 0.02em; }

.mcp-thin-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
.mcp-thin-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 999px; }
.mcp-thin-scroll::-webkit-scrollbar-track { background: transparent; }

.mcp-sidebar { background: var(--bg-elevated); border-right: 1px solid var(--border); }
.mcp-nav-item {
  display: flex; align-items: center; gap: 0.65rem;
  padding: 0.55rem 0.75rem; border-radius: 8px;
  color: var(--text-muted); cursor: pointer; transition: all 0.15s ease;
  font-size: 0.84rem;
}
.mcp-nav-item:hover { background: var(--surface-2); color: var(--text); }
.mcp-nav-item.active { background: var(--accent-dim); color: var(--accent); }

.mcp-led { width: 6px; height: 6px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.mcp-led-on { background: var(--success); box-shadow: 0 0 0 3px var(--success-dim); }
.mcp-led-warn { background: var(--accent); box-shadow: 0 0 0 3px var(--accent-dim); }
.mcp-led-off { background: var(--text-faint); }
.mcp-led-danger { background: var(--danger); box-shadow: 0 0 0 3px var(--danger-dim); }
.mcp-led-pulse { animation: mcpledpulse 1.7s ease-in-out infinite; }
@keyframes mcpledpulse { 0%,100% { opacity: 1 } 50% { opacity: .35 } }

.mcp-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  position: relative;
}
.mcp-corner {
  position: absolute; width: 10px; height: 10px; pointer-events: none; opacity: .55;
}
.mcp-corner-tl { top: -1px; left: -1px; border-top: 1.5px solid var(--accent); border-left: 1.5px solid var(--accent); border-radius: 3px 0 0 0; }
.mcp-corner-tr { top: -1px; right: -1px; border-top: 1.5px solid var(--accent); border-right: 1.5px solid var(--accent); border-radius: 0 3px 0 0; }
.mcp-corner-bl { bottom: -1px; left: -1px; border-bottom: 1.5px solid var(--accent); border-left: 1.5px solid var(--accent); border-radius: 0 0 0 3px; }
.mcp-corner-br { bottom: -1px; right: -1px; border-bottom: 1.5px solid var(--accent); border-right: 1.5px solid var(--accent); border-radius: 0 0 3px 0; }

.mcp-btn {
  font-family: 'Inter'; font-size: 0.8rem; font-weight: 600;
  padding: 0.5rem 0.9rem; border-radius: 8px;
  display: inline-flex; align-items: center; gap: 0.4rem;
  cursor: pointer; transition: all .15s ease; border: 1px solid transparent; white-space: nowrap;
}
.mcp-btn-primary { background: var(--accent); color: #1A1304; }
.mcp-btn-primary:hover { background: var(--accent-strong); }
.mcp-btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text); }
.mcp-btn-ghost:hover { background: var(--surface-2); }
.mcp-btn-danger { background: transparent; border: 1px solid var(--danger); color: var(--danger); }
.mcp-btn-danger:hover { background: var(--danger-dim); }
.mcp-btn:disabled { opacity: .5; cursor: not-allowed; }
.mcp-btn-sm { font-size: 0.72rem; padding: 0.32rem 0.6rem; }

.mcp-badge {
  font-family: 'JetBrains Mono'; font-size: 0.66rem; letter-spacing: .03em;
  padding: 0.18rem 0.5rem; border-radius: 5px;
  display: inline-flex; align-items: center; gap: 0.35rem;
  text-transform: uppercase; white-space: nowrap;
}
.mcp-badge-success { background: var(--success-dim); color: var(--success); }
.mcp-badge-muted { background: var(--surface-2); color: var(--text-muted); border: 1px solid var(--border); }
.mcp-badge-danger { background: var(--danger-dim); color: var(--danger); }
.mcp-badge-info { background: var(--info-dim); color: var(--info); }
.mcp-badge-accent { background: var(--accent-dim); color: var(--accent); }

.mcp-switch {
  width: 38px; height: 21px; border-radius: 999px;
  background: var(--surface-2); border: 1px solid var(--border);
  position: relative; cursor: pointer; transition: background .15s, border-color .15s;
  flex-shrink: 0; padding: 0;
}
.mcp-switch.on { background: var(--accent-dim); border-color: var(--accent); }
.mcp-switch-thumb {
  position: absolute; top: 2px; left: 2px;
  width: 15px; height: 15px; border-radius: 50%;
  background: var(--text-faint); transition: transform .15s, background .15s;
}
.mcp-switch.on .mcp-switch-thumb { transform: translateX(17px); background: var(--accent); }

.mcp-tabstrip { display: flex; gap: 0.2rem; border-bottom: 1px solid var(--border); overflow-x: auto; }
.mcp-tab {
  font-family: 'JetBrains Mono'; font-size: 0.72rem; letter-spacing: .03em;
  text-transform: uppercase; padding: 0.65rem 0.9rem;
  color: var(--text-muted); cursor: pointer;
  border-bottom: 2px solid transparent; transition: color .15s, border-color .15s; white-space: nowrap;
}
.mcp-tab:hover { color: var(--text); }
.mcp-tab.active { color: var(--accent); border-color: var(--accent); }

.mcp-label { font-size: 0.74rem; color: var(--text-muted); margin-bottom: 0.35rem; display: block; font-weight: 500; }
.mcp-input, .mcp-select, .mcp-textarea {
  width: 100%; background: var(--surface-2); border: 1px solid var(--border);
  border-radius: 7px; padding: 0.55rem 0.7rem; color: var(--text);
  font-size: 0.8rem; font-family: 'Inter'; transition: border-color .15s, background .15s;
}
.mcp-input:focus, .mcp-select:focus, .mcp-textarea:focus { outline: none; border-color: var(--accent); background: var(--surface); }
.mcp-input::placeholder, .mcp-textarea::placeholder { color: var(--text-faint); }
.mcp-mono-field { font-family: 'JetBrains Mono'; font-size: 0.78rem; }

.mcp-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
.mcp-table th {
  text-align: left; font-family: 'JetBrains Mono'; font-size: 0.64rem;
  text-transform: uppercase; letter-spacing: .04em; color: var(--text-muted);
  padding: 0.55rem 0.7rem; border-bottom: 1px solid var(--border); font-weight: 500;
}
.mcp-table td { padding: 0.6rem 0.7rem; border-bottom: 1px solid var(--border-soft); color: var(--text); vertical-align: middle; }
.mcp-table tr:hover td { background: var(--surface-2); }

.mcp-overlay {
  position: fixed; inset: 0; background: rgba(5,7,12,0.72); backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center; z-index: 50;
  animation: mcpFade .15s ease; padding: 1rem;
}
.mcp-modal {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 14px; width: 100%; max-width: 660px; max-height: 90vh;
  display: flex; flex-direction: column;
  animation: mcpModalIn .18s ease; box-shadow: 0 25px 70px rgba(0,0,0,0.55);
}
@keyframes mcpFade { from { opacity: 0 } to { opacity: 1 } }
@keyframes mcpModalIn { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: none; } }

.mcp-signal {
  position: relative; height: 34px; border-radius: 7px;
  background: var(--surface-2); border: 1px solid var(--border);
  overflow: hidden; display: flex; align-items: center; padding: 0 0.75rem;
}
.mcp-signal-grid {
  position: absolute; inset: 0;
  background-image: repeating-linear-gradient(90deg, var(--border-soft) 0 1px, transparent 1px 14px);
  opacity: .7;
}
.mcp-signal-bar {
  position: absolute; top: 0; bottom: 0; width: 35%;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  animation: mcpSweep 1s linear infinite; opacity: .85;
}
@keyframes mcpSweep { from { left: -35%; } to { left: 100%; } }

.mcp-progress { height: 6px; border-radius: 999px; background: var(--surface-2); overflow: hidden; border: 1px solid var(--border); }
.mcp-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-strong)); transition: width .12s linear; }

.mcp-toast-stack { position: fixed; bottom: 1.25rem; right: 1.25rem; display: flex; flex-direction: column; gap: 0.6rem; z-index: 200; max-width: 90vw; }
.mcp-toast {
  display: flex; gap: 0.6rem; align-items: flex-start;
  background: var(--surface); border: 1px solid var(--border);
  border-left: 3px solid var(--accent); border-radius: 9px;
  padding: 0.7rem 0.85rem; min-width: 260px; max-width: 340px;
  box-shadow: 0 14px 36px rgba(0,0,0,.45);
  animation: mcpToastIn .18s ease;
}
.mcp-toast.success { border-left-color: var(--success); }
.mcp-toast.error { border-left-color: var(--danger); }
.mcp-toast.info { border-left-color: var(--info); }
@keyframes mcpToastIn { from { opacity: 0; transform: translateX(18px); } to { opacity: 1; transform: none; } }

.mcp-chip {
  font-family: 'JetBrains Mono'; font-size: 0.66rem;
  background: var(--surface-2); border: 1px solid var(--border);
  color: var(--accent); padding: 0.25rem 0.5rem; border-radius: 6px;
  cursor: pointer; transition: border-color .15s, background .15s;
}
.mcp-chip:hover { border-color: var(--accent); background: var(--accent-dim); }

.mcp-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; transition: all .15s ease; }
.mcp-card:hover { border-color: var(--border-soft); background: var(--surface-2); }

.mcp-icon-tile {
  width: 38px; height: 38px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface-2); border: 1px solid var(--border);
  color: var(--accent); flex-shrink: 0;
}
.mcp-letter-tile {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Space Grotesk'; font-weight: 700; font-size: 0.85rem;
  flex-shrink: 0; border: 1px solid var(--border);
}

/* ---- Studio-specific ---- */
.studio-stat-pill {
  display: flex; align-items: center; gap: 0.4rem;
  background: var(--surface-2); border: 1px solid var(--border);
  border-radius: 7px; padding: 0.45rem 0.7rem;
  font-family: 'JetBrains Mono'; font-size: 0.7rem;
  color: var(--text-muted); white-space: nowrap;
}
.studio-stat-pill span { color: var(--text); font-weight: 600; }

.studio-response-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}
.studio-response-header {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.85rem 1.1rem;
  border-bottom: 1px solid var(--border);
  background: var(--bg-elevated);
}
.studio-tab { 
  font-family: 'JetBrains Mono'; font-size: 0.68rem; letter-spacing: .04em;
  text-transform: uppercase; padding: 0.35rem 0.65rem; border-radius: 6px;
  color: var(--text-faint); cursor: pointer; transition: all .15s;
}
.studio-tab:hover { color: var(--text-muted); background: var(--surface-2); }
.studio-tab.active { color: var(--accent); background: var(--accent-dim); }
`;

/* ================================ MAIN APP ===================================== */
export default function MCPConsole() {
  const [page, setPage] = useState<Page>('overview');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const pushToast = useCallback((message: string, tone: ToastTone = 'info', icon?: any) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message, tone, icon }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  /* ---- Model (Ollama) settings — wired to the gear icon in the top bar ---- */
  const [modelSettingsOpen, setModelSettingsOpen] = useState(false);
  const [ollamaUrl, setOllamaUrl] = useState<string>(
    () => localStorage.getItem('mcp.ollamaUrl') || DEFAULT_OLLAMA_URL
  );
  const [ollamaModel, setOllamaModel] = useState<string>(
    () => localStorage.getItem('mcp.ollamaModel') || DEFAULT_OLLAMA_MODEL
  );
  // Draft values edited inside the modal; only committed to ollamaUrl/ollamaModel on Save.
  const [draftOllamaUrl, setDraftOllamaUrl] = useState(ollamaUrl);
  const [draftOllamaModel, setDraftOllamaModel] = useState(ollamaModel);

  function openModelSettings() {
    setDraftOllamaUrl(ollamaUrl);
    setDraftOllamaModel(ollamaModel);
    setModelSettingsOpen(true);
  }

  function saveModelSettings() {
    const nextUrl = draftOllamaUrl.trim() || DEFAULT_OLLAMA_URL;
    const nextModel = draftOllamaModel.trim() || DEFAULT_OLLAMA_MODEL;

    const previousModel = ollamaModel;
    const isNewModel = nextModel !== previousModel;

    setOllamaUrl(nextUrl);
    setOllamaModel(nextModel);
    localStorage.setItem('mcp.ollamaUrl', nextUrl);
    localStorage.setItem('mcp.ollamaModel', nextModel);
    setModelSettingsOpen(false);

    pushToast(`Model set to ${nextModel}`, 'success', CheckCircle2);

    // Automatically pull the new model if it changed (fixes the "model not pulled" error)
    if (isNewModel) {
      pullModel(nextUrl, nextModel);
    }
  }

  async function pullModel(baseUrl: string, modelName: string) {
    const cleanUrl = baseUrl.replace(/\/$/, '');
    pushToast(`Pulling model "${modelName}" in background...`, 'info', RefreshCw);

    try {
      const res = await fetch(`${cleanUrl}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName, stream: false }),
      });

      if (!res.ok) {
        throw new Error(`Pull failed with status ${res.status}`);
      }

      // Ollama returns status updates; a successful pull ends with status "success"
      const data = await res.json().catch(() => ({}));
      if (data.status === 'success' || !data.error) {
        pushToast(`Model "${modelName}" pulled successfully!`, 'success', CheckCircle2);
      } else {
        pushToast(`Pull started for "${modelName}". Check Ollama logs if it takes long.`, 'info');
      }
    } catch (err: any) {
      console.error('Model pull error:', err);
      pushToast(
        `Could not auto-pull "${modelName}". Run manually: docker compose run --rm ollama-pull (after editing OLLAMA_MODEL) or ollama pull ${modelName}`,
        'error',
        AlertCircle
      );
    }
  }

  /* ---- Admin state ---- */
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [adminTab, setAdminTab] = useState<AdminTab>('users');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Viewer');
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFA: true,
    sso: false,
    ipAllowlist: false,
    ipList: '203.0.113.0/24',
    sessionTimeout: '30',
  });

  /* ---- Tools state ---- */
  const [tools, setTools] = useState<Tool[]>(INITIAL_TOOLS);
  const [toolFilter, setToolFilter] = useState<'All' | string>('All');
  const [configTool, setConfigTool] = useState<Tool | null>(null); // prepared for future config modal

  /* ---- Integrations state ---- */
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [kdOpen, setKdOpen] = useState(false);
  const [kdTab, setKdTab] = useState<'connection' | 'advanced' | 'mapping' | 'sync'>('connection');
  const [kd, setKd] = useState<KdConfig>({
    serverUrl: 'https://kd.opentext.example.com/api/v2',
    apiKey: 'ot_live_8f2b1c9e4d7a6f3b',
    tenantId: 'acme-corp-prod',
    showKey: false,
    resultSize: 25,
    confidence: 0.65,
    richMedia: true,
    depth: 'Standard',
    fields: [
      { src: 'title', dst: 'title', type: 'string' },
      { src: 'abstract', dst: 'summary', type: 'string' },
      { src: 'doc_id', dst: 'source_id', type: 'string' },
      { src: 'modified_date', dst: 'updated_at', type: 'datetime' },
    ],
    queryTemplate: 'Search the OpenText Knowledge Discovery index for: {{query}}\nReturn the top {{top_k}} results above a confidence of {{confidence_threshold}}.',
    syncFrequency: 'Every 6 hours',
    lastSync: '2026-06-17 06:12 UTC',
    syncLog: [
      { time: '2026-06-17 06:12 UTC', msg: 'Synced 1,204 documents' },
      { time: '2026-06-17 00:12 UTC', msg: 'Synced 1,198 documents' },
      { time: '2026-06-16 18:12 UTC', msg: 'Synced 1,191 documents' },
    ],
  });
  const [testingConn, setTestingConn] = useState(false);
  const [connResult, setConnResult] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  /* ---- Customization Studio state ---- */
  const [promptTemplate, setPromptTemplate] = useState(DEFAULT_PROMPT_TEMPLATE);
  const studioRef = useRef<HTMLTextAreaElement>(null);
  const [testQuery, setTestQuery] = useState('What changed in our refund policy this quarter?');
  const [studioRunning, setStudioRunning] = useState(false);
  const [studioOutput, setStudioOutput] = useState<StudioOutput | null>(null);

  function insertVar(variable: string, target: 'studio') {
    if (target === 'studio' && studioRef.current) {
      const el = studioRef.current;
      const start = el.selectionStart ?? promptTemplate.length;
      const end = el.selectionEnd ?? promptTemplate.length;
      const next = promptTemplate.slice(0, start) + variable + promptTemplate.slice(end);
      setPromptTemplate(next);
      setTimeout(() => {
        if (studioRef.current) {
          studioRef.current.selectionStart = studioRef.current.selectionEnd = start + variable.length;
          studioRef.current.focus();
        }
      }, 0);
    }
  }

  /* ---- Integrations handlers ---- */
  function toggleIntegration(id: string) {
    const integ = integrations.find((i) => i.id === id);
    if (!integ) return;
    if (integ.status === 'connected') {
      setIntegrations((arr) => arr.map((i) => (i.id === id ? { ...i, status: 'disconnected' } : i)));
      pushToast(`Disconnected from ${integ.name}`, 'info', Power);
    } else {
      pushToast(`Connecting to ${integ.name}…`, 'info', RefreshCw);
      setTimeout(() => {
        setIntegrations((arr) => arr.map((i) => (i.id === id ? { ...i, status: 'connected' } : i)));
        pushToast(`Connected to ${integ.name}`, 'success', CheckCircle2);
      }, 1100);
    }
  }

  function runConnectionTest() {
    setTestingConn(true);
    setConnResult(null);
    setTimeout(() => {
      const latency = 28 + Math.floor(Math.random() * 40);
      setTestingConn(false);
      setConnResult({ ok: true, latency });
      pushToast(`OpenText KD connection succeeded (${latency}ms)`, 'success', CheckCircle2);
    }, 1400);
  }

  function runManualSync() {
    setSyncing(true);
    setSyncProgress(0);
    const interval = setInterval(() => {
      setSyncProgress((p) => {
        const next = p + 100 / 18;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setSyncing(false);
            const docs = 1180 + Math.floor(Math.random() * 80);
            const now = '2026-06-17 14:08 UTC';
            setKd((k) => ({
              ...k,
              lastSync: now,
              syncLog: [{ time: now, msg: `Synced ${docs.toLocaleString()} documents` }, ...k.syncLog].slice(0, 5),
            }));
            pushToast('Manual sync completed', 'success', RefreshCw);
          }, 250);
          return 100;
        }
        return next;
      });
    }, 90);
  }

  /* ---- Tools handlers ---- */
  function toggleTool(id: string) {
    setTools((arr) => arr.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)));
    const t = tools.find((x) => x.id === id);
    if (t) {
      pushToast(`${t.name} ${t.enabled ? 'disabled' : 'enabled'}`, t.enabled ? 'info' : 'success', t.enabled ? Power : CheckCircle2);
    }
  }

  /* ---- Admin handlers ---- */
  function sendInvite() {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      pushToast('Name and email are required', 'error', AlertCircle);
      return;
    }
    setUsers((u) => [
      {
        id: Date.now(),
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
        status: 'invited',
        lastActive: '—',
      },
      ...u,
    ]);
    pushToast(`Invitation sent to ${inviteEmail}`, 'success', Mail);
    setInviteName('');
    setInviteEmail('');
    setInviteRole('Viewer');
    setShowInvite(false);
  }

  function saveSecurity() {
    pushToast('Security settings saved', 'success', ShieldCheck);
  }

  /* ---- Studio: Ollama test with optional tools context support ---- */
  async function runStudioTest(toolsContext?: string) {
    setStudioRunning(true);
    setStudioOutput(null);

    let finalPrompt = promptTemplate;

    // If toolsContext provided from Studio toggle, inject it
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

    const startTime = Date.now();

    try {
      const response = await fetch(`${ollamaUrl.replace(/\/$/, '')}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: ollamaModel,
          prompt: renderedPrompt,
          stream: false,
          options: { temperature: 0.7, num_predict: 800 },
        }),
      });

      if (!response.ok) throw new Error(`Ollama responded with status: ${response.status}`);

      const data = await response.json();
      const elapsed = Date.now() - startTime;
      const responseText: string = data.response || 'No response from Ollama';

      setStudioOutput({
        rendered: renderedPrompt,
        response: responseText,
        model: ollamaModel,
        stats: {
          latencyMs: elapsed,
          promptTokens: estimateTokens(renderedPrompt),
          promptWords: countWords(renderedPrompt),
          promptChars: renderedPrompt.length,
          responseTokens: estimateTokens(responseText),
          responseWords: countWords(responseText),
          responseChars: responseText.length,
          tokensPerSec: data.eval_count && data.eval_duration
            ? Math.round(data.eval_count / (data.eval_duration / 1e9))
            : null,
          ollamaPromptTokens: data.prompt_eval_count ?? null,
          ollamaResponseTokens: data.eval_count ?? null,
        },
      });

      pushToast('Response received from Ollama', 'success', CheckCircle2);
    } catch (error: any) {
      const elapsed = Date.now() - startTime;
      console.error('Ollama Error:', error);
      pushToast(`Ollama Error: ${error.message}`, 'error', AlertCircle);
      setStudioOutput({
        rendered: renderedPrompt,
        response: `Failed to connect to Ollama at ${ollamaUrl} with model "${ollamaModel}".

Common causes & fixes:
• Ollama container not running → docker compose up -d ollama
• Model not pulled → docker compose run --rm ollama-pull   (or ollama pull ${ollamaModel})
• CORS blocked (browser dev + Docker Ollama) → we added OLLAMA_ORIGINS=* in docker-compose.yml. Rebuild/restart the ollama service after editing.
• Wrong URL (e.g. inside another container) → use http://host.docker.internal:11434 or the gear icon to change it.
• Firewall / VPN interfering with localhost:11434

Check browser DevTools → Network tab for the exact fetch error, then open Model Settings (gear icon) and test your URL/model.`,
        model: 'Error',
        stats: {
          latencyMs: elapsed,
          promptTokens: estimateTokens(renderedPrompt),
          promptWords: countWords(renderedPrompt),
          promptChars: renderedPrompt.length,
          responseTokens: 0,
          responseWords: 0,
          responseChars: 0,
          tokensPerSec: null,
          ollamaPromptTokens: null,
          ollamaResponseTokens: null,
        },
      });
    } finally {
      setStudioRunning(false);
    }
  }

  /* ---- Derived values ---- */
  const connectedCount = integrations.filter((i) => i.status === 'connected').length;
  const enabledToolsCount = tools.filter((t) => t.enabled).length;
  const enabledTools = tools.filter((t) => t.enabled);

  /* ---- Render ---- */
  return (
    <div className="mcp-root" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <style>{STYLES}</style>

      {/* SIDEBAR */}
      <aside className="mcp-sidebar mcp-thin-scroll" style={{ width: 232, flexShrink: 0, padding: '1.1rem 0.9rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', padding: '0 0.2rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--accent-dim)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={15} color="var(--accent)" />
          </div>
          <div>
            <div className="mcp-display" style={{ fontWeight: 700, fontSize: '0.92rem', letterSpacing: '.01em' }}>MCP Console</div>
            <div className="mcp-mono" style={{ fontSize: '0.6rem', color: 'var(--text-faint)', letterSpacing: '.06em' }}>CONTROL PANEL</div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {NAV_ITEMS.map((n) => (
            <div key={n.id} className={`mcp-nav-item ${page === n.id ? 'active' : ''}`} onClick={() => setPage(n.id)}>
              <n.icon size={15} />
              <span style={{ flex: 1 }}>{n.label}</span>
              {n.id === 'integrations' && <Led tone={connectedCount > 0 ? 'on' : 'off'} pulse={connectedCount > 0} />}
            </div>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div className="mcp-panel" style={{ padding: '0.6rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Led tone="on" pulse />
            <span className="mcp-mono" style={{ fontSize: '0.65rem', letterSpacing: '.05em', color: 'var(--text-muted)' }}>PRODUCTION · STABLE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', padding: '0.3rem 0.2rem' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)' }}>SC</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>Sarah Chen</div>
              <div className="mcp-mono" style={{ fontSize: '0.62rem', color: 'var(--text-faint)' }}>Admin</div>
            </div>
            <LogOut size={14} color="var(--text-faint)" style={{ cursor: 'pointer' }} />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* TOP BAR */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1.4rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', flexShrink: 0 }}>
          <div className="mcp-mono" style={{ fontSize: '0.68rem', letterSpacing: '.08em', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            MCP <ChevronRight size={11} /> <span style={{ color: 'var(--text-muted)' }}>{PAGE_TITLES[page][0].toUpperCase()}</span>
          </div>
          <div style={{ flex: 1, maxWidth: 360, position: 'relative', marginLeft: '0.5rem' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input className="mcp-input" placeholder="Search settings, tools, integrations…" style={{ paddingLeft: 30, fontSize: '0.78rem' }} />
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={17} color="var(--text-muted)" />
              <span style={{ position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }} />
            </div>
            <Settings
              size={17}
              color="var(--text-muted)"
              style={{ cursor: 'pointer' }}
              onClick={openModelSettings}
            />
          </div>
        </div>

        {/* PAGE BODY */}
        <div className="mcp-thin-scroll" style={{ flex: 1, overflowY: 'auto', padding: '1.6rem' }}>
          <div style={{ marginBottom: '1.4rem' }}>
            <h1 className="mcp-display" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{PAGE_TITLES[page][0]}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '0.3rem' }}>{PAGE_TITLES[page][1]}</p>
          </div>

          {page === 'overview' && (
            <OverviewPage
              users={users}
              tools={tools}
              integrations={integrations}
              connectedCount={connectedCount}
              enabledToolsCount={enabledToolsCount}
              setPage={setPage}
              setKdOpen={setKdOpen}
            />
          )}

          {page === 'admin' && (
            <AdminPage
              adminTab={adminTab}
              setAdminTab={setAdminTab}
              users={users}
              setUsers={setUsers}
              showInvite={showInvite}
              setShowInvite={setShowInvite}
              inviteName={inviteName}
              setInviteName={setInviteName}
              inviteEmail={inviteEmail}
              setInviteEmail={setInviteEmail}
              inviteRole={inviteRole}
              setInviteRole={setInviteRole}
              sendInvite={sendInvite}
              security={security}
              setSecurity={setSecurity}
              saveSecurity={saveSecurity}
              pushToast={pushToast}
            />
          )}

          {page === 'tools' && (
            <ToolsPage
              tools={tools}
              toolFilter={toolFilter}
              setToolFilter={setToolFilter}
              toggleTool={toggleTool}
              setConfigTool={setConfigTool}
            />
          )}

          {page === 'integrations' && (
            <IntegrationsPage
              integrations={integrations}
              toggleIntegration={toggleIntegration}
              setKdOpen={setKdOpen}
            />
          )}

          {page === 'studio' && (
            <StudioPage
              promptTemplate={promptTemplate}
              setPromptTemplate={setPromptTemplate}
              studioRef={studioRef}
              insertVar={insertVar}
              testQuery={testQuery}
              setTestQuery={setTestQuery}
              studioRunning={studioRunning}
              studioOutput={studioOutput}
              runStudioTest={runStudioTest}
              pushToast={pushToast}
              enabledTools={enabledTools}
              ollamaModel={ollamaModel}
              openModelSettings={openModelSettings}
            />
          )}
        </div>
      </div>

      {/* KD CONFIG MODAL (kept in main for complex state, could be extracted further) */}
      <Modal open={kdOpen} onClose={() => setKdOpen(false)} width={720}>
        <div style={{ padding: '1.4rem 1.6rem 1.2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="mcp-display" style={{ fontSize: '1.15rem', fontWeight: 700 }}>OpenText Knowledge Discovery</div>
            <div className="mcp-mono" style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>Enterprise Connector • v2.4.1</div>
          </div>
          <button onClick={() => setKdOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div className="mcp-tabstrip" style={{ padding: '0 1.6rem', marginTop: '0.4rem' }}>
          {(['connection', 'advanced', 'mapping', 'sync'] as const).map((t) => (
            <div key={t} className={`mcp-tab ${kdTab === t ? 'active' : ''}`} onClick={() => setKdTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </div>
          ))}
        </div>

        <div style={{ padding: '1.4rem 1.6rem', flex: 1, overflowY: 'auto' }} className="mcp-thin-scroll">
          {kdTab === 'connection' && (
            <div style={{ display: 'grid', gap: '1.1rem' }}>
              <Field label="Server URL">
                <input className="mcp-input mcp-mono-field" value={kd.serverUrl} onChange={(e) => setKd({ ...kd, serverUrl: e.target.value })} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="API Key">
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      className="mcp-input mcp-mono-field"
                      type={kd.showKey ? 'text' : 'password'}
                      value={kd.apiKey}
                      onChange={(e) => setKd({ ...kd, apiKey: e.target.value })}
                      style={{ flex: 1 }}
                    />
                    <Btn variant="ghost" size="sm" onClick={() => setKd({ ...kd, showKey: !kd.showKey })}>
                      {kd.showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                    </Btn>
                  </div>
                </Field>
                <Field label="Tenant ID">
                  <input className="mcp-input mcp-mono-field" value={kd.tenantId} onChange={(e) => setKd({ ...kd, tenantId: e.target.value })} />
                </Field>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-end' }}>
                <Btn variant="primary" icon={RefreshCw} onClick={runConnectionTest} disabled={testingConn}>
                  {testingConn ? 'Testing…' : 'Test Connection'}
                </Btn>
                {connResult && (
                  <Badge tone={connResult.ok ? 'success' : 'danger'}>
                    {connResult.ok ? `Connected • ${connResult.latency}ms` : 'Failed'}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {kdTab === 'advanced' && (
            <div style={{ display: 'grid', gap: '1.1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Result size (top_k)">
                  <input type="number" className="mcp-input" value={kd.resultSize} onChange={(e) => setKd({ ...kd, resultSize: parseInt(e.target.value) || 10 })} />
                </Field>
                <Field label="Min confidence">
                  <input type="number" step="0.05" className="mcp-input" value={kd.confidence} onChange={(e) => setKd({ ...kd, confidence: parseFloat(e.target.value) || 0.5 })} />
                </Field>
              </div>
              <Field label="Query depth">
                <select className="mcp-select" value={kd.depth} onChange={(e) => setKd({ ...kd, depth: e.target.value })}>
                  <option>Standard</option>
                  <option>Deep</option>
                  <option>Shallow</option>
                </select>
              </Field>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Return rich media snippets</span>
                <Switch on={kd.richMedia} onChange={(v) => setKd({ ...kd, richMedia: v })} />
              </div>
            </div>
          )}

          {kdTab === 'mapping' && (
            <div>
              <div style={{ marginBottom: '0.8rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Field mappings define how source attributes are projected into your internal schema.
              </div>
              <table className="mcp-table">
                <thead><tr><th>Source Field</th><th>Destination</th><th>Type</th></tr></thead>
                <tbody>
                  {kd.fields.map((f, idx) => (
                    <tr key={idx}>
                      <td><input className="mcp-input mcp-mono-field" style={{ padding: '0.35rem 0.5rem' }} value={f.src} onChange={(e) => {
                        const next = [...kd.fields]; next[idx] = { ...f, src: e.target.value }; setKd({ ...kd, fields: next });
                      }} /></td>
                      <td><input className="mcp-input mcp-mono-field" style={{ padding: '0.35rem 0.5rem' }} value={f.dst} onChange={(e) => {
                        const next = [...kd.fields]; next[idx] = { ...f, dst: e.target.value }; setKd({ ...kd, fields: next });
                      }} /></td>
                      <td><input className="mcp-input mcp-mono-field" style={{ padding: '0.35rem 0.5rem' }} value={f.type} onChange={(e) => {
                        const next = [...kd.fields]; next[idx] = { ...f, type: e.target.value }; setKd({ ...kd, fields: next });
                      }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: '1rem' }}>
                <Btn variant="ghost" size="sm" icon={Plus} onClick={() => setKd({ ...kd, fields: [...kd.fields, { src: '', dst: '', type: 'string' }] })}>
                  Add mapping
                </Btn>
              </div>
            </div>
          )}

          {kdTab === 'sync' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Sync frequency</div>
                  <div style={{ fontWeight: 600 }}>{kd.syncFrequency}</div>
                </div>
                <Btn variant="primary" icon={RefreshCw} onClick={runManualSync} disabled={syncing}>
                  {syncing ? 'Syncing…' : 'Run manual sync'}
                </Btn>
              </div>

              {syncing && (
                <div>
                  <div className="mcp-progress"><div className="mcp-progress-fill" style={{ width: `${syncProgress}%` }} /></div>
                  <div className="mcp-mono" style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: '0.3rem' }}>{Math.round(syncProgress)}% complete</div>
                </div>
              )}

              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Recent sync history</div>
                {kd.syncLog.map((log, i) => (
                  <div key={i} className="mcp-mono" style={{ fontSize: '0.74rem', padding: '0.35rem 0', borderBottom: '1px solid var(--border-soft)', display: 'flex', gap: '1rem' }}>
                    <span style={{ color: 'var(--text-faint)', width: 170, flexShrink: 0 }}>{log.time}</span>
                    <span>{log.msg}</span>
                  </div>
                ))}
              </div>
              <div className="mcp-mono" style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                Last successful sync: {kd.lastSync}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '1rem 1.6rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
          <Btn variant="ghost" onClick={() => setKdOpen(false)}>Close</Btn>
          <Btn variant="primary" onClick={() => { pushToast('Settings saved (demo)', 'success'); setKdOpen(false); }}>Save changes</Btn>
        </div>
      </Modal>

      {/* MODEL SETTINGS MODAL — wired to the gear icon in the top bar */}
      <Modal open={modelSettingsOpen} onClose={() => setModelSettingsOpen(false)} width={520}>
        <div style={{ padding: '1.4rem 1.6rem 1.2rem', borderBottom: '1px solid var(--border)' }}>
          <div className="mcp-display" style={{ fontSize: '1.15rem', fontWeight: 700 }}>Model Settings</div>
          <div className="mcp-mono" style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>
            Ollama connection used by the Customization Studio
          </div>
        </div>

        <div style={{ padding: '1.4rem 1.6rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field label="Ollama server URL">
            <input
              className="mcp-input mcp-mono-field"
              value={draftOllamaUrl}
              onChange={(e) => setDraftOllamaUrl(e.target.value)}
              placeholder={DEFAULT_OLLAMA_URL}
            />
          </Field>

          <Field label="Model">
            <input
              className="mcp-input mcp-mono-field"
              list="ollama-model-options"
              value={draftOllamaModel}
              onChange={(e) => setDraftOllamaModel(e.target.value)}
              placeholder={DEFAULT_OLLAMA_MODEL}
            />
            <datalist id="ollama-model-options">
              {OLLAMA_MODEL_OPTIONS.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </Field>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {OLLAMA_MODEL_OPTIONS.map((m) => (
              <span
                key={m}
                className="mcp-chip"
                style={{ cursor: 'pointer' }}
                onClick={() => setDraftOllamaModel(m)}
              >
                {m}
              </span>
            ))}
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.6, margin: 0 }}>
            Type any tag your Ollama container has pulled (e.g. <code className="mcp-mono">gemma3:12b</code>).
            Pull a new model first with <code className="mcp-mono">ollama pull {draftOllamaModel || 'gemma3:12b'}</code>,
            or set it permanently in your <code className="mcp-mono">docker-compose.yml</code> — see the README section
            "Changing the LLM model" for both options.
          </p>
        </div>

        <div style={{ padding: '1rem 1.6rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
          <Btn variant="ghost" onClick={() => setModelSettingsOpen(false)}>Cancel</Btn>
          <Btn variant="primary" onClick={saveModelSettings}>Save changes</Btn>
        </div>
      </Modal>

      {/* Simple Config Tool Modal stub (for future extension) */}
      <Modal open={!!configTool} onClose={() => setConfigTool(null)} width={520}>
        <div style={{ padding: '1.4rem 1.6rem' }}>
          <h3 style={{ marginTop: 0 }}>Configure {configTool?.name}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            This is a placeholder. In a full implementation you would load tool-specific settings here (rate limits, API keys, prompt fragments, etc).
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setConfigTool(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={() => { pushToast('Tool configuration saved (demo)', 'success'); setConfigTool(null); }}>Save</Btn>
          </div>
        </div>
      </Modal>

      {/* TOASTS */}
      <div className="mcp-toast-stack">
        {toasts.map((t) => {
          const Icon = t.icon || (t.tone === 'success' ? CheckCircle2 : t.tone === 'error' ? AlertCircle : Activity);
          return (
            <div key={t.id} className={`mcp-toast ${t.tone}`}>
              <Icon size={16} color={t.tone === 'success' ? 'var(--success)' : t.tone === 'error' ? 'var(--danger)' : 'var(--info)'} style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem' }}>{t.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
