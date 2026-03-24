import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { getProjectRoot, getConfig, isConfigured } from './config'
import type {
  Agent,
  AgentRegistry,
  AgentStatus,
  Output,
  OutputIndex,
  SharedMemory,
  SystemStatus,
  Workflow,
  NavItem,
} from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function projectPath(...segments: string[]): string {
  return path.join(getProjectRoot(), ...segments)
}

function readJsonSafe<T>(filePath: string, fallback: T): T {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function readTextSafe(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    return ''
  }
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

function getLatestTimestamp(dirPath: string): string | null {
  try {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json') && f !== 'index.json' && f !== 'latest.json')
    if (files.length === 0) return null
    // Files are named YYYY-MM-DDTHH-MM.json, so sorting gives chronological order
    files.sort()
    const latest = files[files.length - 1]
    // Parse timestamp from filename: 2026-03-23T08-00.json → 2026-03-23T08:00
    return latest.replace('.json', '').replace(/T(\d{2})-(\d{2})/, 'T$1:$2')
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Agent Data
// ---------------------------------------------------------------------------

export function getAgents(): Agent[] {
  const registry = readJsonSafe<AgentRegistry>(
    projectPath('agents', 'agents.json'),
    { agents: [], interaction_rules: {} as AgentRegistry['interaction_rules'] }
  )
  return registry.agents
}

export function getAgent(id: string): (Agent & { memory: string; recentOutputs: Output[] }) | null {
  const agents = getAgents()
  const agent = agents.find(a => a.id === id)
  if (!agent) return null

  const memory = readTextSafe(projectPath('memory', 'agents', id, 'memory.md'))
  const recentOutputs = getOutputs({ agent: id, limit: 10 })

  return { ...agent, memory, recentOutputs }
}

// ---------------------------------------------------------------------------
// Output Data
// ---------------------------------------------------------------------------

export function getOutputs(options?: {
  agent?: string
  limit?: number
  after?: string
}): Output[] {
  const agents = options?.agent ? [options.agent] : getAgents().map(a => a.id)
  const allOutputs: Output[] = []

  for (const agentId of agents) {
    const outputDir = projectPath('outputs', agentId)
    try {
      const files = fs.readdirSync(outputDir)
        .filter(f => f.endsWith('.json') && f !== 'index.json' && f !== 'latest.json')
        .sort()
        .reverse() // newest first

      for (const file of files) {
        const output = readJsonSafe<Output>(path.join(outputDir, file), null as unknown as Output)
        if (!output) continue

        if (options?.after && output.meta.timestamp <= options.after) continue

        allOutputs.push(output)
      }
    } catch {
      // Directory doesn't exist yet — skip
    }
  }

  // Sort all outputs by timestamp descending
  allOutputs.sort((a, b) => b.meta.timestamp.localeCompare(a.meta.timestamp))

  if (options?.limit) {
    return allOutputs.slice(0, options.limit)
  }

  return allOutputs
}

export function getOutput(agentId: string, outputId: string): Output | null {
  const outputDir = projectPath('outputs', agentId)
  try {
    const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.json'))
    for (const file of files) {
      const output = readJsonSafe<Output>(path.join(outputDir, file), null as unknown as Output)
      if (output && output.meta.id === outputId) return output
    }
  } catch {
    // Directory doesn't exist
  }
  return null
}

// ---------------------------------------------------------------------------
// Memory Data
// ---------------------------------------------------------------------------

export function getSharedMemory(): SharedMemory {
  return {
    project_context: readTextSafe(projectPath('memory', 'shared', 'PROJECT_CONTEXT.md')),
    decisions_log: readTextSafe(projectPath('memory', 'shared', 'DECISIONS_LOG.md')),
    glossary: readTextSafe(projectPath('memory', 'shared', 'GLOSSARY.md')),
    lessons_learned: readTextSafe(projectPath('memory', 'shared', 'LESSONS_LEARNED.md')),
  }
}

// ---------------------------------------------------------------------------
// Workflow Data
// ---------------------------------------------------------------------------

export function getWorkflows(): Workflow[] {
  const workflowDir = projectPath('workflows')
  try {
    const files = fs.readdirSync(workflowDir).filter(f => f.endsWith('.json'))
    return files
      .map(f => readJsonSafe<Workflow>(path.join(workflowDir, f), null as unknown as Workflow))
      .filter(Boolean) as Workflow[]
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// System Status
// ---------------------------------------------------------------------------

export function getSystemStatus(): SystemStatus {
  const configured = isConfigured()
  const agents = getAgents()

  const agentStatuses: AgentStatus[] = agents.map(agent => {
    const outputDir = projectPath('outputs', agent.id)
    const memoryPath = projectPath('memory', 'agents', agent.id, 'memory.md')
    const memoryText = readTextSafe(memoryPath)

    let outputCount = 0
    try {
      const index = readJsonSafe<OutputIndex>(path.join(outputDir, 'index.json'), { agent_id: '', outputs: [] })
      outputCount = index.outputs.length
    } catch {
      // No outputs yet
    }

    return {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      last_active: getLatestTimestamp(outputDir),
      output_count: outputCount,
      memory_words: countWords(memoryText),
    }
  })

  const workflows = getWorkflows().map(w => ({
    id: w.id,
    name: w.name,
    last_run: null as string | null, // Would come from a run log if we track it
    status: 'idle',
  }))

  const config = getConfig()
  const dataSources = (config?.data_sources ?? []).map(ds => ({
    id: ds.id,
    last_fetch: null as string | null,
    status: 'ok' as const,
  }))

  return {
    configured,
    agents: agentStatuses,
    workflows,
    data_sources: dataSources,
    scheduler_running: false, // Would check process status in a real implementation
  }
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export function getNavigation(): NavItem[] {
  return readJsonSafe<NavItem[]>(
    path.join(process.cwd(), 'navigation.json'),
    [
      { label: 'Overview', href: '/' },
      { label: 'Status', href: '/status' },
      { label: 'Settings', href: '/settings' },
    ]
  )
}
