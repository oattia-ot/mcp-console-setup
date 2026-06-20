import { LucideIcon } from 'lucide-react';

export type Page = 'overview' | 'admin' | 'tools' | 'integrations' | 'studio';

export type UserStatus = 'active' | 'invited' | 'suspended';
export type IntegrationStatus = 'connected' | 'disconnected';
export type AdminTab = 'users' | 'roles' | 'security';
export type ToolCategory = 'Data' | 'Productivity' | 'Engineering' | 'Communication' | 'Security' | 'All';
export type KdTab = 'connection' | 'advanced' | 'mapping' | 'sync';
export type ResponseTab = 'response' | 'prompt';
export type ToastTone = 'success' | 'error' | 'info';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  lastActive: string;
}

export interface Role {
  name: string;
  desc: string;
  perms: string[];
}

export interface Tool {
  id: string;
  name: string;
  desc: string;
  icon: LucideIcon;
  category: ToolCategory extends 'All' ? string : ToolCategory;
  enabled: boolean;
  /** Optional prompt template variants for this tool (shown in Customization Studio) */
  promptTemplates?: PromptTemplate[];
}

export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  template: string;
}

export interface Integration {
  id: string;
  name: string;
  desc: string;
  letter: string;
  status: IntegrationStatus;
  category: string;
}

export interface SecuritySettings {
  twoFA: boolean;
  sso: boolean;
  ipAllowlist: boolean;
  ipList: string;
  sessionTimeout: string;
}

export interface FieldMapping {
  src: string;
  dst: string;
  type: string;
}

export interface SyncLogEntry {
  time: string;
  msg: string;
}

export interface KdConfig {
  serverUrl: string;
  apiKey: string;
  tenantId: string;
  showKey: boolean;
  resultSize: number;
  confidence: number;
  richMedia: boolean;
  depth: string;
  fields: FieldMapping[];
  queryTemplate: string;
  syncFrequency: string;
  lastSync: string;
  syncLog: SyncLogEntry[];
}

export interface StudioStats {
  latencyMs: number;
  promptTokens: number;
  promptWords: number;
  promptChars: number;
  responseTokens: number;
  responseWords: number;
  responseChars: number;
  tokensPerSec: number | null;
  ollamaPromptTokens: number | null;
  ollamaResponseTokens: number | null;
}

export interface StudioOutput {
  rendered: string;
  response: string;
  model: string;
  stats: StudioStats;
}

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
  icon?: LucideIcon;
}

export interface ActivityLogEntry {
  time: string;
  msg: string;
  tone: 'success' | 'info' | 'muted' | 'danger';
}

// For tool injection in prompts (new professional enhancement)
export interface ToolContext {
  id: string;
  name: string;
  description: string;
  category: string;
}