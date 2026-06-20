import React from 'react';
import { Plus, Save, ShieldCheck, KeyRound, ShieldAlert, MoreVertical, CheckCircle2, Mail, AlertCircle } from 'lucide-react';
import type { User, Role, SecuritySettings, AdminTab } from '../types';
import { ROLES } from '../data/constants';
import { Btn, Badge, Switch, Field, Modal } from '../components/common';

interface AdminPageProps {
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  showInvite: boolean;
  setShowInvite: (show: boolean) => void;
  inviteName: string;
  setInviteName: (name: string) => void;
  inviteEmail: string;
  setInviteEmail: (email: string) => void;
  inviteRole: string;
  setInviteRole: (role: string) => void;
  sendInvite: () => void;
  security: SecuritySettings;
  setSecurity: React.Dispatch<React.SetStateAction<SecuritySettings>>;
  saveSecurity: () => void;
  pushToast: (message: string, tone?: 'success' | 'error' | 'info', icon?: any) => void;
}

function SecurityRow({ icon: Icon, title, desc, on, onChange }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
      <div className="mcp-icon-tile"><Icon size={16} /></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{desc}</div>
      </div>
      <Switch on={on} onChange={onChange} />
    </div>
  );
}

export function AdminPage({
  adminTab,
  setAdminTab,
  users,
  setUsers,
  showInvite,
  setShowInvite,
  inviteName,
  setInviteName,
  inviteEmail,
  setInviteEmail,
  inviteRole,
  setInviteRole,
  sendInvite,
  security,
  setSecurity,
  saveSecurity,
  pushToast,
}: AdminPageProps) {
  return (
    <div>
      <div className="mcp-tabstrip" style={{ marginBottom: '1.2rem' }}>
        {[
          { id: 'users' as const, label: 'Users' },
          { id: 'roles' as const, label: 'Roles' },
          { id: 'security' as const, label: 'Security' },
        ].map((t) => (
          <div
            key={t.id}
            className={`mcp-tab ${adminTab === t.id ? 'active' : ''}`}
            onClick={() => setAdminTab(t.id)}
          >
            {t.label}
          </div>
        ))}
      </div>

      {/* USERS TAB */}
      {adminTab === 'users' && (
        <div className="mcp-panel" style={{ padding: '1.1rem 1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span className="mcp-mono" style={{ fontSize: '0.68rem', color: 'var(--text-faint)' }}>
              {users.length} TOTAL USERS
            </span>
            <Btn variant="primary" icon={Plus} size="sm" onClick={() => setShowInvite(!showInvite)}>
              Invite user
            </Btn>
          </div>

          {showInvite && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 1fr auto', gap: '0.6rem', marginBottom: '1.1rem', alignItems: 'end' }}>
              <Field label="Name">
                <input
                  className="mcp-input"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Jordan Reyes"
                />
              </Field>
              <Field label="Email">
                <input
                  className="mcp-input"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="jordan.reyes@company.com"
                />
              </Field>
              <Field label="Role">
                <select className="mcp-select" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                  {ROLES.map((r) => (
                    <option key={r.name}>{r.name}</option>
                  ))}
                </select>
              </Field>
              <Btn variant="primary" onClick={sendInvite}>
                Send invite
              </Btn>
            </div>
          )}

          <table className="mcp-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                  <td>
                    <select
                      className="mcp-select"
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.76rem' }}
                      value={u.role}
                      onChange={(e) =>
                        setUsers((arr) =>
                          arr.map((x) => (x.id === u.id ? { ...x, role: e.target.value } : x))
                        )
                      }
                    >
                      {ROLES.map((r) => (
                        <option key={r.name}>{r.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {u.status === 'active' && <Badge tone="success" icon={CheckCircle2}>Active</Badge>}
                    {u.status === 'invited' && <Badge tone="info" icon={Mail}>Invited</Badge>}
                    {u.status === 'suspended' && <Badge tone="danger" icon={AlertCircle}>Suspended</Badge>}
                  </td>
                  <td className="mcp-mono" style={{ fontSize: '0.74rem', color: 'var(--text-faint)' }}>
                    {u.lastActive}
                  </td>
                  <td>
                    <span
                      style={{ cursor: 'pointer', color: 'var(--text-faint)' }}
                      onClick={() => {
                        setUsers((arr) =>
                          arr.map((x) =>
                            x.id === u.id
                              ? { ...x, status: x.status === 'suspended' ? 'active' : 'suspended' }
                              : x
                          )
                        );
                        pushToast(
                          u.status === 'suspended' ? `${u.name} reactivated` : `${u.name} suspended`,
                          u.status === 'suspended' ? 'success' : 'info'
                        );
                      }}
                    >
                      <MoreVertical size={15} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ROLES TAB */}
      {adminTab === 'roles' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.9rem' }}>
          {ROLES.map((r, i) => (
            <div key={i} className="mcp-panel" style={{ padding: '1.05rem 1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <ShieldCheck size={15} color="var(--accent)" />
                <span className="mcp-display" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.name}</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.7rem' }}>{r.desc}</p>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {r.perms.map((p, j) => (
                  <Badge key={j} tone="muted">{p}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECURITY TAB */}
      {adminTab === 'security' && (
        <div className="mcp-panel" style={{ padding: '1.1rem 1.2rem', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SecurityRow
            icon={KeyRound}
            title="Require two-factor authentication"
            desc="All members must verify with a second factor at login."
            on={security.twoFA}
            onChange={(v: boolean) => setSecurity({ ...security, twoFA: v })}
          />
          <SecurityRow
            icon={ShieldAlert}
            title="Enforce single sign-on"
            desc="Block password logins and route through your SSO provider."
            on={security.sso}
            onChange={(v: boolean) => setSecurity({ ...security, sso: v })}
          />
          <SecurityRow
            icon={ShieldCheck}
            title="IP allowlist"
            desc="Restrict console access to approved network ranges."
            on={security.ipAllowlist}
            onChange={(v: boolean) => setSecurity({ ...security, ipAllowlist: v })}
          />
          {security.ipAllowlist && (
            <Field label="Allowed CIDR ranges">
              <textarea
                className="mcp-textarea mcp-mono-field"
                rows={2}
                value={security.ipList}
                onChange={(e) => setSecurity({ ...security, ipList: e.target.value })}
              />
            </Field>
          )}
          <Field label="Session timeout">
            <select
              className="mcp-select"
              value={security.sessionTimeout}
              onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
              style={{ maxWidth: 200 }}
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="480">8 hours</option>
            </select>
          </Field>
          <div>
            <Btn variant="primary" icon={Save} onClick={saveSecurity}>
              Save security settings
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}
