import { getSystemStatus, getSharedMemory } from '@/lib/fs-reader'
import { isConfigured } from '@/lib/config'
import { Header } from '@/components/layout/Header'
import { StatusBadge } from '@/components/common/StatusBadge'

export const revalidate = 5

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

export default function StatusPage() {
  const configured = isConfigured()
  const status = getSystemStatus()
  const memory = getSharedMemory()

  return (
    <div className="space-y-6">
      <Header
        title="System Status"
        subtitle={configured ? 'All systems operational' : 'Not configured'}
        actions={
          <StatusBadge
            status={configured ? 'ok' : 'idle'}
            size="md"
          />
        }
      />

      {!configured && (
        <div className="card text-center">
          <p className="text-foreground-secondary">
            Run <code className="font-mono text-primary">/init</code> in Claude Code to configure your agent team.
          </p>
        </div>
      )}

      {/* Agents */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-foreground-secondary">Agents</h2>
        {status.agents.length === 0 ? (
          <p className="text-sm text-foreground-secondary">No agents configured.</p>
        ) : (
          <div className="overflow-x-auto rounded border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background-secondary">
                  <th className="px-4 py-2.5 text-left font-medium text-foreground-secondary">Agent</th>
                  <th className="px-4 py-2.5 text-left font-medium text-foreground-secondary">Role</th>
                  <th className="px-4 py-2.5 text-left font-medium text-foreground-secondary">Last Active</th>
                  <th className="px-4 py-2.5 text-right font-medium text-foreground-secondary">Outputs</th>
                  <th className="px-4 py-2.5 text-right font-medium text-foreground-secondary">Memory</th>
                </tr>
              </thead>
              <tbody>
                {status.agents.map((agent) => (
                  <tr key={agent.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 font-medium text-foreground">{agent.name}</td>
                    <td className="px-4 py-2.5 text-foreground-secondary">{agent.role}</td>
                    <td className="px-4 py-2.5 text-foreground-secondary">
                      {agent.last_active
                        ? new Date(agent.last_active).toLocaleString()
                        : 'Never'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-foreground">
                      {agent.output_count}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span
                        className={`font-mono ${
                          agent.memory_words > 3000
                            ? 'text-warning'
                            : agent.memory_words > 5000
                              ? 'text-error'
                              : 'text-foreground'
                        }`}
                      >
                        {agent.memory_words.toLocaleString()} words
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Workflows */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-foreground-secondary">Workflows</h2>
        {status.workflows.length === 0 ? (
          <p className="text-sm text-foreground-secondary">No workflows configured.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {status.workflows.map((wf) => (
              <div key={wf.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{wf.name}</p>
                  <p className="text-xs text-foreground-secondary">
                    {wf.last_run
                      ? `Last run: ${new Date(wf.last_run).toLocaleString()}`
                      : 'Never run'}
                  </p>
                </div>
                <StatusBadge status={wf.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Data Sources */}
      {status.data_sources.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-foreground-secondary">Data Sources</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {status.data_sources.map((ds) => (
              <div key={ds.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{ds.id}</p>
                  <p className="text-xs text-foreground-secondary">
                    {ds.last_fetch
                      ? `Last fetch: ${new Date(ds.last_fetch).toLocaleString()}`
                      : 'Never fetched'}
                  </p>
                </div>
                <StatusBadge status={ds.status} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Memory Health */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-foreground-secondary">Memory Health</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="card">
            <p className="text-sm font-medium text-foreground">Shared: Project Context</p>
            <p className="text-xs text-foreground-secondary">
              {countWords(memory.project_context).toLocaleString()} words
            </p>
          </div>
          <div className="card">
            <p className="text-sm font-medium text-foreground">Shared: Decisions Log</p>
            <p className="text-xs text-foreground-secondary">
              {countWords(memory.decisions_log).toLocaleString()} words
            </p>
          </div>
          <div className="card">
            <p className="text-sm font-medium text-foreground">Shared: Glossary</p>
            <p className="text-xs text-foreground-secondary">
              {countWords(memory.glossary).toLocaleString()} words
            </p>
          </div>
          <div className="card">
            <p className="text-sm font-medium text-foreground">Shared: Lessons Learned</p>
            <p className="text-xs text-foreground-secondary">
              {countWords(memory.lessons_learned).toLocaleString()} words
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
