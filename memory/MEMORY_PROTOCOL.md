# Memory Protocol

This document defines how all agents and the orchestrator read and write memory. Follow these rules exactly.

---

## Reading Memory

At the start of every task, read:

1. **Your own memory file** — always (`memory/agents/[your-id]/memory.md`)
2. **Project context** — always (`memory/shared/PROJECT_CONTEXT.md`)
3. **Glossary** — if domain-specific terms appear in the task (`memory/shared/GLOSSARY.md`)
4. **Decisions log** — if you're making a decision that could set precedent (`memory/shared/DECISIONS_LOG.md`)
5. **Other agents' memory** — only if explicitly collaborating with them or reviewing their prior work

---

## Writing Memory

After completing any task, append an entry to your memory file:

```markdown
### YYYY-MM-DD — [Task Title]
- **Task:** [One-line description]
- **Key findings:** [Bullet points of what was discovered or produced]
- **Sources used:** [Where data came from]
- **Lessons:** [What to do differently next time, what worked well]
- **Confidence:** [HIGH / MEDIUM / LOW with brief justification]
```

Additionally:
- **Significant decisions** → append to `memory/shared/DECISIONS_LOG.md`
- **New domain terms** → append to `memory/shared/GLOSSARY.md`
- **Patterns or mistakes** → append to `memory/shared/LESSONS_LEARNED.md`

---

## Memory Hygiene

The orchestrator runs periodic memory maintenance:

- **Entries older than 14 days**: summarize into the Summary section at the top of the memory file, then remove the detailed entry
- **Summary section**: should never exceed 500 words per agent
- **Individual entries**: keep to 5-10 lines maximum
- **Total memory file**: aim for under 3,000 words; prune if exceeding 5,000

---

## Memory Size Limits

| Memory Type | Soft Limit | Hard Limit | Action at Hard Limit |
|-------------|-----------|------------|---------------------|
| Agent memory file | 3,000 words | 5,000 words | Orchestrator prunes oldest entries |
| Shared PROJECT_CONTEXT.md | 1,000 words | 2,000 words | Rewrite to be more concise |
| Shared DECISIONS_LOG.md | 1,500 words | 3,000 words | Archive old decisions |
| Shared GLOSSARY.md | 500 words | 1,000 words | No action needed |
| Shared LESSONS_LEARNED.md | 1,000 words | 2,000 words | Consolidate similar lessons |

---

## Memory Entry Format for Shared Files

### DECISIONS_LOG.md

```markdown
### YYYY-MM-DD — [Decision Title]
- **Decision:** [What was decided]
- **Context:** [Why this came up]
- **Alternatives considered:** [What else was on the table]
- **Rationale:** [Why this option was chosen]
- **Made by:** [orchestrator / agent-name / user]
```

### GLOSSARY.md

```markdown
**[Term]** — [Definition]. Used in [context where this matters].
```

### LESSONS_LEARNED.md

```markdown
### YYYY-MM-DD — [Lesson Title]
- **What happened:** [Brief description]
- **What we learned:** [The takeaway]
- **Applies to:** [Which agents or workflows this affects]
```
