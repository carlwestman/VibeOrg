import { isConfigured } from '@/lib/config'
import { getSystemStatus, getOutputs, getAgents } from '@/lib/fs-reader'
import { Header } from '@/components/layout/Header'
import { StatusBadge } from '@/components/common/StatusBadge'

export const revalidate = 5

export default function OverviewPage() {
  const configured = isConfigured()

  if (!configured) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome to VibeOrg
          </h1>
          <p className="max-w-md text-foreground-secondary">
            Your AI agent team framework is ready to be configured.
            Open Claude Code in this project directory and run{' '}
            <code className="rounded bg-background-secondary px-1.5 py-0.5 font-mono text-sm text-primary">
              /init
            </code>{' '}
            to set up your team.
          </p>
        </div>
        <div className="card max-w-sm space-y-3 text-left text-sm">
          <p className="font-medium text-foreground">Quick start:</p>
          <ol className="list-inside list-decimal space-y-1.5 text-foreground-secondary">
            <li>Open a terminal in this project</li>
            <li>
              Run <code className="font-mono text-primary">claude</code> to start Claude Code
            </li>
            <li>
              Type <code className="font-mono text-primary">/init</code> to begin setup
            </li>
            <li>Answer the onboarding questions</li>
            <li>Your dashboard will be customized automatically</li>
          </ol>
        </div>
      </div>
    )
  }

  const status = getSystemStatus()
  const recentOutputs = getOutputs({ limit: 5 })
  const agents = getAgents()

  return (
    <div className="space-y-6">
      <Header title="Overview" subtitle={`${agents.length} agents active`} />

      {/* Agent summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {status.agents.map((agent) => (
          <div key={agent.id} className="card space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">{agent.name}</h3>
              <StatusBadge
                status={agent.last_active ? 'ok' : 'idle'}
              />
            </div>
            <p className="text-sm text-foreground-secondary">{agent.role}</p>
            <div className="flex gap-4 text-xs text-foreground-secondary">
              <span>{agent.output_count} outputs</span>
              <span>{agent.memory_words} words in memory</span>
            </div>
            {agent.last_active && (
              <p className="text-xs text-foreground-secondary">
                Last active: {new Date(agent.last_active).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Recent outputs */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-foreground-secondary">
          Recent Activity
        </h2>
        {recentOutputs.length === 0 ? (
          <p className="text-sm text-foreground-secondary">
            No outputs yet. Give your agents a task via Claude Code.
          </p>
        ) : (
          <div className="space-y-2">
            {recentOutputs.map((output) => (
              <div
                key={output.meta.id}
                className="card-hover flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {output.meta.task_id}
                  </p>
                  <p className="text-xs text-foreground-secondary">
                    {output.meta.agent} &middot;{' '}
                    {new Date(output.meta.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {output.meta.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="badge-neutral"
                    >
                      {tag}
                    </span>
                  ))}
                  <StatusBadge status={output.meta.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
