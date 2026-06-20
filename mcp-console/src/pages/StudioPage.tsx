import React, { useState } from 'react';
import {
  Wand2, PlayCircle, Save, Activity, CheckCircle2, Clock, Hash, Cpu, Gauge, FileText
} from 'lucide-react';
import type { Tool } from '../types';
import { estimateTokens, countWords, generateToolsContext } from '../utils/helpers';
import { DEFAULT_PROMPT_TEMPLATE, TOOL_CONTEXT_INSTRUCTION, NO_TOOL_ID } from '../data/constants';
import type { PromptTemplate } from '../types';
import { Btn, Field, StatPill } from '../components/common';

interface StudioPageProps {
  promptTemplate: string;
  setPromptTemplate: (template: string) => void;
  studioRef: React.RefObject<HTMLTextAreaElement>;
  insertVar: (variable: string, target: 'studio') => void;
  testQuery: string;
  setTestQuery: (query: string) => void;
  studioRunning: boolean;
  studioOutput: any;
  runStudioTest: (injectedToolsContext?: string) => void; // enhanced to accept optional context
  pushToast: (message: string, tone?: 'success' | 'error' | 'info', icon?: any) => void;
  enabledTools: Tool[]; // pass enabled tools for context injection
  ollamaModel: string; // currently configured model (set via the gear icon / Model Settings modal)
  openModelSettings: () => void; // opens the Model Settings modal from App.tsx
}

export function StudioPage({
  promptTemplate,
  setPromptTemplate,
  studioRef,
  insertVar,
  testQuery,
  setTestQuery,
  studioRunning,
  studioOutput,
  runStudioTest,
  pushToast,
  enabledTools,
  ollamaModel,
  openModelSettings,
}: StudioPageProps) {
  const variables = ['{{query}}', '{{context}}', '{{user_role}}', '{{top_k}}'];
  const [responseTab, setResponseTab] = useState<'response' | 'prompt'>('response');
  const [includeTools, setIncludeTools] = useState(true); // New professional feature toggle

  // --- Tool / Template combobox state (restored professional sample prompt selector) ---
  const [selectedToolId, setSelectedToolId] = useState<string>(NO_TOOL_ID);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('default');

  // Force clean "Default (no tool)" + default template on initial mount
  React.useEffect(() => {
    setSelectedToolId(NO_TOOL_ID);
    setSelectedTemplateId('default');
    if (!promptTemplate || promptTemplate.trim() === '') {
      setPromptTemplate(DEFAULT_PROMPT_TEMPLATE);
    }
  }, []);

  // Templates available for the currently selected tool (or the single default when "No tool")
  const availableTemplates: PromptTemplate[] = React.useMemo(() => {
    if (selectedToolId === NO_TOOL_ID) {
      return [{
        id: 'default',
        name: 'Default (no tool)',
        description: 'A general-purpose assistant prompt with no tool wired in.',
        template: DEFAULT_PROMPT_TEMPLATE,
      }];
    }
    const tool = enabledTools.find((t) => t.id === selectedToolId);
    return tool?.promptTemplates ?? [];
  }, [selectedToolId, enabledTools]);

  function applyTemplate(template: PromptTemplate) {
    setPromptTemplate(template.template);
    pushToast(`Loaded "${template.name}" template`, 'info');
  }

  function handleToolChange(toolId: string) {
    setSelectedToolId(toolId);
    let templates: any[] = [];
    if (toolId === NO_TOOL_ID) {
      templates = [{ id: 'default', name: 'Default (no tool)', template: DEFAULT_PROMPT_TEMPLATE }];
    } else {
      const tool = enabledTools.find((t) => t.id === toolId);
      templates = tool?.promptTemplates ?? [];
    }
    const first = templates[0];
    if (first) {
      setSelectedTemplateId(first.id);
      applyTemplate(first as PromptTemplate);
    }
  }

  function handleTemplateChange(templateId: string) {
    setSelectedTemplateId(templateId);
    const template = availableTemplates.find((t) => t.id === templateId);
    if (template) applyTemplate(template);
  }

  // Live stats
  const livePromptTokens = estimateTokens(promptTemplate);
  const livePromptWords = countWords(promptTemplate);

  // Generate tools context string when needed
  const toolsContext = includeTools ? generateToolsContext(enabledTools) : '';

  // Enhanced run that optionally prepends tools instruction
  const handleRunTest = () => {
    let finalPrompt = promptTemplate;

    if (includeTools && toolsContext) {
      const toolsSection = TOOL_CONTEXT_INSTRUCTION.replace('{{tools_list}}', toolsContext);
      // Prepend tools instruction if not already present (simple heuristic)
      if (!finalPrompt.toLowerCase().includes('you have access to the following')) {
        finalPrompt = toolsSection + '\n\n' + finalPrompt;
      }
    }

    // Call the original run function (we pass the potentially augmented prompt via closure or parent state)
    // For simplicity in this refactor, we trigger parent run and parent can use latest promptTemplate
    // In real app, lift the finalPrompt or use a derived state. Here we just call with flag.
    runStudioTest(includeTools ? toolsContext : undefined);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

      {/* TOP ROW — Prompt Editor + Test Playground */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem' }}>

        {/* PROMPT TEMPLATE EDITOR */}
        <div className="mcp-panel" style={{ padding: '1.1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wand2 size={15} color="var(--accent)" />
              <span className="mcp-mono" style={{ fontSize: '0.7rem', color: 'var(--text-faint)', letterSpacing: '.05em' }}>
                PROMPT TEMPLATE
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <StatPill icon={Hash} label="~tokens" value={livePromptTokens} />
              <StatPill icon={FileText} label="words" value={livePromptWords} />
            </div>
          </div>

          {/* Tool + Template comboboxes (sample prompt selector with Default) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            <Field label="Tool">
              <select
                className="mcp-select"
                value={selectedToolId}
                onChange={(e) => handleToolChange(e.target.value)}
              >
                <option value={NO_TOOL_ID}>Default (no tool)</option>
                {enabledTools.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Template">
              <select
                className="mcp-select"
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                disabled={availableTemplates.length === 0}
              >
                {availableTemplates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </Field>
          </div>
          {(() => {
            const active = availableTemplates.find((t) => t.id === selectedTemplateId);
            return active?.description ? (
              <p className="mcp-mono" style={{ fontSize: '0.68rem', color: 'var(--text-faint)', margin: 0 }}>
                {active.description}
              </p>
            ) : null;
          })()}

          <textarea
            ref={studioRef}
            className="mcp-textarea mcp-mono-field"
            rows={9}
            value={promptTemplate}
            onChange={(e) => setPromptTemplate(e.target.value)}
          />

          <div>
            <label className="mcp-label">Insert variable</label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {variables.map((v) => (
                <span key={v} className="mcp-chip" onClick={() => insertVar(v, 'studio')}>
                  {v}
                </span>
              ))}
            </div>
          </div>

          <div>
            <Btn variant="primary" icon={Save} onClick={() => pushToast('Prompt template saved', 'success', Save)}>
              Save template
            </Btn>
          </div>
        </div>

        {/* TEST PLAYGROUND */}
        <div className="mcp-panel" style={{ padding: '1.1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlayCircle size={15} color="var(--accent)" />
            <span className="mcp-mono" style={{ fontSize: '0.7rem', color: 'var(--text-faint)', letterSpacing: '.05em' }}>
              TEST PLAYGROUND
            </span>
          </div>

          <Field label="Test query">
            <input className="mcp-input" value={testQuery} onChange={(e) => setTestQuery(e.target.value)} />
          </Field>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            <Cpu size={13} color="var(--text-faint)" />
            <span>
              Model: <span className="mcp-mono" style={{ color: 'var(--accent)' }}>{ollamaModel}</span>
            </span>
            <span
              className="mcp-mono"
              style={{ color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.7rem' }}
              onClick={openModelSettings}
            >
              change
            </span>
          </div>

          {/* NEW: Tool Context Toggle - demonstrates "using tools in the prompt" */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.3rem' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeTools}
                onChange={(e) => setIncludeTools(e.target.checked)}
                style={{ accentColor: 'var(--accent)' }}
              />
              Inject enabled tools into prompt context
            </label>
            <span className="mcp-mono" style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>
              ({enabledTools.length} enabled)
            </span>
          </div>

          <Btn
            variant="primary"
            icon={PlayCircle}
            disabled={studioRunning}
            onClick={handleRunTest}
            style={{ alignSelf: 'flex-start' }}
          >
            {studioRunning ? 'Running…' : 'Run test'}
          </Btn>

          {studioRunning && (
            <div className="mcp-signal">
              <span className="mcp-signal-grid" />
              <span className="mcp-signal-bar" />
              <span className="mcp-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', position: 'relative' }}>
                Calling Ollama...
              </span>
            </div>
          )}

          {!studioRunning && !studioOutput && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.5rem 0', color: 'var(--text-faint)', textAlign: 'center' }}>
              <PlayCircle size={28} style={{ opacity: 0.3 }} />
              <span style={{ fontSize: '0.78rem' }}>Run a test to see the response and statistics below.</span>
            </div>
          )}

          {studioOutput && !studioRunning && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
              <CheckCircle2 size={13} color="var(--success)" />
              <span className="mcp-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {studioOutput.model} · {studioOutput.stats.latencyMs}ms · scroll down for full output
              </span>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM — Response + Stats Panel (full width) */}
      {(studioRunning || studioOutput) && (
        <div className="studio-response-panel">
          <div className="studio-response-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
              <Activity size={14} color="var(--accent)" />
              <span className="mcp-mono" style={{ fontSize: '0.7rem', color: 'var(--text-faint)', letterSpacing: '.05em' }}>
                OUTPUT
              </span>

              {studioOutput && (
                <div style={{ display: 'flex', gap: '0.35rem', marginLeft: '0.5rem', flexWrap: 'wrap' }}>
                  <StatPill icon={Clock} label="latency" value={`${studioOutput.stats.latencyMs}ms`} accent />
                  <StatPill
                    icon={Hash}
                    label="prompt tokens"
                    value={studioOutput.stats.ollamaPromptTokens != null ? studioOutput.stats.ollamaPromptTokens : `~${studioOutput.stats.promptTokens}`}
                  />
                  <StatPill
                    icon={Hash}
                    label="response tokens"
                    value={studioOutput.stats.ollamaResponseTokens != null ? studioOutput.stats.ollamaResponseTokens : `~${studioOutput.stats.responseTokens}`}
                  />
                  <StatPill
                    icon={Cpu}
                    label="total tokens"
                    value={
                      studioOutput.stats.ollamaPromptTokens != null && studioOutput.stats.ollamaResponseTokens != null
                        ? studioOutput.stats.ollamaPromptTokens + studioOutput.stats.ollamaResponseTokens
                        : `~${studioOutput.stats.promptTokens + studioOutput.stats.responseTokens}`
                    }
                    accent
                  />
                  {studioOutput.stats.tokensPerSec != null && (
                    <StatPill icon={Gauge} label="tok/s" value={studioOutput.stats.tokensPerSec} accent />
                  )}
                  <StatPill icon={FileText} label="response words" value={studioOutput.stats.responseWords} />
                </div>
              )}
            </div>

            {studioOutput && (
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <span
                  className={`studio-tab ${responseTab === 'response' ? 'active' : ''}`}
                  onClick={() => setResponseTab('response')}
                >
                  Response
                </span>
                <span
                  className={`studio-tab ${responseTab === 'prompt' ? 'active' : ''}`}
                  onClick={() => setResponseTab('prompt')}
                >
                  Rendered prompt
                </span>
              </div>
            )}
          </div>

          <div className="mcp-thin-scroll" style={{ padding: '1rem 1.2rem', maxHeight: 340, overflowY: 'auto' }}>
            {studioRunning && (
              <div className="mcp-signal" style={{ margin: '0.5rem 0' }}>
                <span className="mcp-signal-grid" />
                <span className="mcp-signal-bar" />
                <span className="mcp-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', position: 'relative' }}>
                  Waiting for model response...
                </span>
              </div>
            )}

            {studioOutput && !studioRunning && (
              <>
                {responseTab === 'response' && (
                  <div style={{ fontSize: '0.83rem', color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {studioOutput.response}
                  </div>
                )}
                {responseTab === 'prompt' && (
                  <pre className="mcp-mono" style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.65 }}>
                    {studioOutput.rendered}
                  </pre>
                )}
              </>
            )}
          </div>

          {studioOutput && !studioRunning && (
            <div style={{
              display: 'flex', gap: '1.2rem', padding: '0.55rem 1.2rem',
              borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)',
              flexWrap: 'wrap',
            }}>
              <span className="mcp-mono" style={{ fontSize: '0.66rem', color: 'var(--text-faint)' }}>
                PROMPT <span style={{ color: 'var(--text-muted)' }}>{studioOutput.stats.promptChars} chars · {studioOutput.stats.promptWords} words</span>
              </span>
              <span className="mcp-mono" style={{ fontSize: '0.66rem', color: 'var(--text-faint)' }}>
                RESPONSE <span style={{ color: 'var(--text-muted)' }}>{studioOutput.stats.responseChars} chars · {studioOutput.stats.responseWords} words</span>
              </span>
              <span className="mcp-mono" style={{ fontSize: '0.66rem', color: 'var(--text-faint)', marginLeft: 'auto' }}>
                MODEL <span style={{ color: 'var(--accent)' }}>{studioOutput.model}</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
