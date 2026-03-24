import { getConfig } from '@/lib/config'
import { getAgents } from '@/lib/fs-reader'
import { Header } from '@/components/layout/Header'

export const revalidate = 5

export default function SettingsPage() {
  const config = getConfig()
  const agents = getAgents()

  return (
    <div className="space-y-6">
      <Header title="Settings" subtitle="View and edit project configuration" />

      {/* Project Info */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-foreground-secondary">Project</h2>
        <div className="card space-y-3">
          <div>
            <label className="text-xs font-medium text-foreground-secondary">Name</label>
            <p className="text-foreground">{config?.project.name || 'Not configured'}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground-secondary">Description</label>
            <p className="text-foreground">{config?.project.description || 'Not configured'}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground-secondary">Created</label>
            <p className="text-foreground">
              {config?.project.created
                ? new Date(config.project.created).toLocaleDateString()
                : 'Not configured'}
            </p>
          </div>
        </div>
      </section>

      {/* Theme */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-foreground-secondary">Theme</h2>
        <div className="card">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-foreground-secondary">Direction</label>
              <p className="text-foreground">{config?.theme.direction || 'modern-neutral'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground-secondary">Mode</label>
              <p className="text-foreground">{config?.theme.mode || 'dark'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground-secondary">Density</label>
              <p className="text-foreground">{config?.theme.density || 'comfortable'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground-secondary">Primary Color</label>
              <div className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded border border-border"
                  style={{ backgroundColor: config?.theme.primary_color }}
                />
                <span className="font-mono text-sm text-foreground">
                  {config?.theme.primary_color}
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground-secondary">Accent Color</label>
              <div className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded border border-border"
                  style={{ backgroundColor: config?.theme.accent_color }}
                />
                <span className="font-mono text-sm text-foreground">
                  {config?.theme.accent_color}
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground-secondary">Border Radius</label>
              <p className="text-foreground">{config?.theme.border_radius || 'md'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Agents */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-foreground-secondary">
          Agents ({agents.length})
        </h2>
        {agents.length === 0 ? (
          <p className="text-sm text-foreground-secondary">No agents configured.</p>
        ) : (
          <div className="space-y-2">
            {agents.map((agent) => (
              <div key={agent.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">{agent.name}</h3>
                    <p className="text-sm text-foreground-secondary">{agent.role}</p>
                    <p className="mt-1 text-xs text-foreground-secondary">{agent.description}</p>
                  </div>
                  <code className="text-xs text-foreground-secondary">{agent.id}</code>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {agent.capabilities.map((cap) => (
                    <span key={cap} className="badge-neutral">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* System Settings */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-foreground-secondary">System</h2>
        <div className="card">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-foreground-secondary">Deployment Mode</label>
              <p className="text-foreground">{config?.settings.deployment_mode || 'local'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground-secondary">Dashboard Port</label>
              <p className="font-mono text-foreground">{config?.settings.dashboard_port || 3000}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground-secondary">Scheduler</label>
              <p className="text-foreground">
                {config?.settings.scheduler_enabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground-secondary">SQLite</label>
              <p className="text-foreground">
                {config?.settings.use_sqlite ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <p className="text-xs text-foreground-secondary">
        To modify settings, edit <code className="font-mono">vibeorg.config.json</code> directly
        or tell Claude Code to update it.
      </p>
    </div>
  )
}
