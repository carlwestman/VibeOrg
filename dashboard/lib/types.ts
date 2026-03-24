// Base types for VibeOrg dashboard
// Domain-specific types are added during onboarding Phase 7

export interface VibeOrgConfig {
  version: string
  project: {
    name: string
    description: string
    created: string
  }
  settings: {
    use_sqlite: boolean
    memory_max_entries_per_agent: number
    memory_summarize_after: number
    output_archive_days: number
    dashboard_port: number
    scheduler_enabled: boolean
    deployment_mode: 'local' | 'remote'
  }
  theme: {
    direction: string
    primary_color: string
    accent_color: string
    mode: 'dark' | 'light'
    density: 'compact' | 'comfortable' | 'spacious'
    font_body: string
    font_mono: string
    border_radius: string
    custom_notes: string
  }
  data_sources: DataSource[]
  channels?: {
    enabled: boolean
    platform: string
    plugin: string
    startup_command: string
    tmux_session_name: string
  }
}

export interface DataSource {
  id: string
  type: string
  url?: string
  schedule?: string
  output_path?: string
}

export interface Agent {
  id: string
  name: string
  role: string
  description: string
  persona_file: string
  memory_path: string
  output_dir: string
  output_schema: string
  capabilities: string[]
  receives_from: string[]
  hands_off_to: string[]
  tools: string[]
}

export interface AgentRegistry {
  agents: Agent[]
  interaction_rules: {
    handoff_protocol: string
    conflict_resolution: string
    memory_update_trigger: string
    output_validation: string
  }
}

export interface OutputMeta {
  id: string
  agent: string
  timestamp: string
  task_id: string
  status: 'draft' | 'final' | 'superseded'
  version: number
  tags: string[]
}

export interface OutputHandoff {
  target_agent: string
  source_file: string
  task_completed: string
  key_findings: string[]
  open_questions: string[]
  suggested_next_steps: string[]
}

export interface Output {
  meta: OutputMeta
  content: Record<string, unknown>
  handoff?: OutputHandoff
}

export interface OutputIndex {
  agent_id: string
  outputs: {
    id: string
    timestamp: string
    status: string
    tags: string[]
    file: string
  }[]
}

export interface Workflow {
  id: string
  name: string
  description: string
  trigger: {
    type: string
    cron?: string
    can_trigger_manually?: boolean
  }
  steps: WorkflowStep[]
  on_failure: string
}

export interface WorkflowStep {
  step: number
  agent: string
  task: string
  input_from: string | string[]
  output_to: string
  timeout_minutes: number
}

export interface SharedMemory {
  project_context: string
  decisions_log: string
  glossary: string
  lessons_learned: string
}

export interface AgentStatus {
  id: string
  name: string
  role: string
  last_active: string | null
  output_count: number
  memory_words: number
}

export interface SystemStatus {
  configured: boolean
  agents: AgentStatus[]
  workflows: {
    id: string
    name: string
    last_run: string | null
    status: string
  }[]
  data_sources: {
    id: string
    last_fetch: string | null
    status: 'ok' | 'stale' | 'error'
  }[]
  scheduler_running: boolean
}

export interface NavItem {
  label: string
  href: string
  icon?: string
}
