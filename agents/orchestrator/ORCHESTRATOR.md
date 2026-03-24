# Orchestrator — Detailed Behavior Guide

This file supplements the root CLAUDE.md with detailed orchestrator behavior. Read this when you need to make nuanced delegation or coordination decisions.

---

## Agent Prompt Composition Template

When composing a prompt for a subagent, use this structure:

```
--- AGENT IDENTITY ---
[Full contents of agents/[name]/PERSONA.md]

--- YOUR MEMORY ---
[Contents of memory/agents/[name]/memory.md]

--- PROJECT CONTEXT ---
[Contents of memory/shared/PROJECT_CONTEXT.md]

--- TASK ---
[Specific, actionable task description]

--- INPUT ---
Read the following files for input data:
- [file path 1]: [brief description of what it contains]
- [file path 2]: [brief description]

--- OUTPUT REQUIREMENTS ---
- Write your output to: outputs/[name]/YYYY-MM-DDTHH-MM.json
- Also update: outputs/[name]/latest.json (copy of the above)
- Also update: outputs/[name]/index.json (add entry to the manifest)
- Your output MUST conform to: agents/[name]/OUTPUT_SCHEMA.json
- Include all required meta fields: id, agent, timestamp, task_id, status, version, tags

--- HANDOFF (if applicable) ---
Your output will be read by [next agent name].
Include a handoff section with: task_completed, key_findings, open_questions, suggested_next_steps.

--- SELF-VERIFICATION ---
Before writing your output:
1. Verify all required schema fields are populated
2. Verify JSON is valid
3. Check that all claims have sources or are marked as estimates
4. Rate your overall confidence: HIGH / MEDIUM / LOW
```

---

## Handoff Management

When orchestrating a multi-agent workflow:

1. **Before each handoff**: read the completing agent's return summary (short, from Task return)
2. **Decision gate**: does the output quality warrant forwarding?
   - If YES: compose the next agent's task with file path references
   - If NO: ask the completing agent to revise (one retry)
   - If STILL NO: log the issue, inform the user, skip the step if possible
3. **After each handoff**: log the handoff in memory with: source agent, target agent, file path, timestamp
4. **End of workflow**: synthesize a summary for the user covering all steps

---

## Ad-Hoc Workflow Creation

When a user task spans multiple agents but no named workflow exists:

1. Identify which agents are needed and in what order
2. Determine data dependencies (who needs whose output)
3. Plan the execution sequence (sequential, not parallel — Claude Code constraint)
4. Execute step by step using the Delegation Protocol
5. If this workflow is likely to recur, ask the user if you should save it as a named workflow

---

## Error Recovery

| Situation | Action |
|-----------|--------|
| Agent produces invalid JSON | Ask agent to retry with explicit schema reminder |
| Agent can't find input file | Check the file path, verify the previous step completed |
| Agent exceeds timeout | Log the timeout, inform the user, suggest breaking the task down |
| Agent produces empty output | Check the task instructions, retry with more specific guidance |
| Workflow step fails | Follow the workflow's `on_failure` strategy; default: log, continue, notify |
| Memory file corrupted | Rebuild from the Summary section; log the incident |

---

## When to Act Directly vs. Delegate

**Act directly (no delegation):**
- System configuration changes (vibeorg.config.json, agents.json)
- Memory management (pruning, summarizing)
- Answering questions about the system itself
- Slash command execution
- Dashboard modifications (editing generated pages)
- Creating new agents or workflows (the structure, not the content)

**Always delegate:**
- Research and information gathering
- Data analysis and processing
- Content creation and writing
- Code generation (if an engineer agent exists)
- Monitoring and alerting tasks
- Any task that matches an agent's defined capabilities

---

## Context Window Budget

Subagents are spawned fresh each time. Budget the injected context:

| Component | Target Tokens |
|-----------|--------------|
| PERSONA.md | 500-800 |
| Agent memory.md | 500-1500 |
| PROJECT_CONTEXT.md | 300-500 |
| Task instructions + file refs | 200-500 |
| Output schema reference | 200-400 |
| **Total injected** | **1700-3700** |

Keep injected context minimal. Agents read input files from disk — don't paste file contents into the prompt.
