# Team Design Guide

Heuristics and templates for proposing agent teams during onboarding. Claude reads this during Phase 2.

---

## Agent Archetypes

These are the fundamental roles agents can fill. Most teams combine 2-4 of these.

### Researcher
Gathers and synthesizes information from external sources. Uses web search, document analysis, API data. Produces structured research outputs with sources cited.

**Best for:** market research, competitive analysis, news monitoring, due diligence, literature reviews.

### Analyst
Processes data, builds models, finds patterns, and draws conclusions. Works with structured data. Produces quantitative analyses with supporting evidence.

**Best for:** financial analysis, data analysis, trend detection, risk assessment, performance evaluation.

### Writer
Produces polished reports, communications, content, and documentation. Takes raw findings and turns them into readable, actionable outputs.

**Best for:** report writing, content creation, executive summaries, email drafts, documentation.

### Engineer
Writes code, builds tools, manages technical infrastructure. Produces working code, scripts, and technical documentation.

**Best for:** automation scripts, data pipelines, tool building, code reviews, infrastructure management.

### Monitor
Watches for changes, tracks KPIs, triggers alerts. Checks data sources on schedule and flags anomalies or important events.

**Best for:** price monitoring, news alerts, compliance tracking, system health checks, deadline tracking.

### Coordinator
Manages multi-step processes, ensures quality, handles cross-cutting concerns. Reviews other agents' work and ensures consistency.

**Best for:** workflow management, quality assurance, process compliance, multi-agent coordination.

---

## Team Size Guidelines

| Team Size | When to Use |
|-----------|-------------|
| 2 agents | Simple, linear workflow. Input → Process → Output. |
| 3 agents | Standard workflow with distinct phases (gather → analyze → produce). |
| 4 agents | Complex domain with parallel workstreams or quality review needs. |
| 5-6 agents | Large scope with multiple output types and specialized expertise. |
| 7+ agents | NOT recommended for initial setup. Complexity grows nonlinearly. |

**Rules:**
- Every agent must have a clear, distinct responsibility
- If two agents would overlap >30% in their work, merge them
- Start small — the user can always `/add-agent` later
- Each agent should produce at least one distinct output type

---

## Domain Templates

### Finance / Investment Research
**Agents:** 3-4
| Name | Role | Responsibilities | Hands Off To |
|------|------|-------------------|-------------|
| IRIS | Researcher | Market research, news monitoring, competitive analysis | FINN |
| FINN | Analyst | Financial analysis, valuation, risk assessment | EDNA |
| EDNA | Writer | Research reports, executive summaries, briefings | — |
| VIGIL | Monitor (optional) | Price alerts, regulatory changes, deadline tracking | IRIS, FINN |

**Flow:** Data → IRIS (research) → FINN (analyze) → EDNA (report)

### Content Marketing
**Agents:** 3
| Name | Role | Responsibilities | Hands Off To |
|------|------|-------------------|-------------|
| SCOUT | Researcher | Trend research, competitor content analysis, SEO research | SAGE |
| SAGE | Strategist/Analyst | Content strategy, topic prioritization, audience analysis | QUILL |
| QUILL | Writer | Blog posts, social content, email sequences, landing copy | — |

**Flow:** SCOUT (research trends) → SAGE (strategize) → QUILL (write)

### Engineering / DevOps
**Agents:** 3
| Name | Role | Responsibilities | Hands Off To |
|------|------|-------------------|-------------|
| RECON | Monitor | System health, dependency updates, security advisories | ARCH |
| ARCH | Analyst/Architect | Architecture decisions, code review, technical planning | BOLT |
| BOLT | Engineer | Code implementation, automation scripts, infrastructure | — |

**Flow:** RECON (detect) → ARCH (plan) → BOLT (build)

### Education / Teaching Assistant
**Agents:** 3
| Name | Role | Responsibilities | Hands Off To |
|------|------|-------------------|-------------|
| ATLAS | Researcher | Curriculum research, resource discovery, standards alignment | PLATO |
| PLATO | Analyst/Designer | Lesson planning, assessment design, learning objectives | REED |
| REED | Writer | Lesson materials, student handouts, worksheets, rubrics | — |

**Flow:** ATLAS (research) → PLATO (design) → REED (produce materials)

### Operations / Business Management
**Agents:** 3-4
| Name | Role | Responsibilities | Hands Off To |
|------|------|-------------------|-------------|
| SCOUT | Researcher | Market intelligence, vendor research, regulatory updates | NEXUS |
| NEXUS | Analyst | Process analysis, KPI tracking, operational metrics | SCRIBE |
| SCRIBE | Writer | Operations reports, process docs, status updates | — |
| PULSE | Monitor (optional) | KPI alerts, deadline tracking, compliance checks | NEXUS |

**Flow:** SCOUT/PULSE (gather) → NEXUS (analyze) → SCRIBE (report)

### Legal / Compliance
**Agents:** 3
| Name | Role | Responsibilities | Hands Off To |
|------|------|-------------------|-------------|
| LEXIS | Researcher | Legal research, regulatory monitoring, case analysis | JURIS |
| JURIS | Analyst | Risk assessment, compliance gap analysis, policy review | BRIEF |
| BRIEF | Writer | Legal memos, compliance reports, policy summaries | — |

**Flow:** LEXIS (research) → JURIS (analyze) → BRIEF (write)

### Healthcare / Wellness
**Agents:** 3
| Name | Role | Responsibilities | Hands Off To |
|------|------|-------------------|-------------|
| MEDIS | Researcher | Clinical research, guideline monitoring, evidence review | PRAXIS |
| PRAXIS | Analyst | Evidence assessment, protocol review, outcome analysis | VITA |
| VITA | Writer | Clinical summaries, patient materials, protocol docs | — |

**Flow:** MEDIS (research) → PRAXIS (analyze) → VITA (write)

### Real Estate / Property
**Agents:** 3
| Name | Role | Responsibilities | Hands Off To |
|------|------|-------------------|-------------|
| LOCUS | Researcher | Market research, property data, demographic analysis | VALOR |
| VALOR | Analyst | Valuation, ROI analysis, risk assessment, comparables | HAVEN |
| HAVEN | Writer | Property reports, investment memos, market summaries | — |

**Flow:** LOCUS (research) → VALOR (analyze) → HAVEN (report)

### Consulting / Advisory
**Agents:** 3
| Name | Role | Responsibilities | Hands Off To |
|------|------|-------------------|-------------|
| PROBE | Researcher | Client industry research, benchmark data, best practices | FRAME |
| FRAME | Analyst/Strategist | Framework application, gap analysis, recommendation design | DRAFT |
| DRAFT | Writer | Client deliverables, presentations, executive summaries | — |

**Flow:** PROBE (research) → FRAME (analyze) → DRAFT (deliver)

### E-commerce / Retail
**Agents:** 3-4
| Name | Role | Responsibilities | Hands Off To |
|------|------|-------------------|-------------|
| SCOUT | Researcher | Competitor pricing, product trends, customer review analysis | METRIC |
| METRIC | Analyst | Sales analysis, inventory optimization, pricing strategy | SPARK |
| SPARK | Writer | Product descriptions, marketing copy, campaign briefs | — |
| PULSE | Monitor (optional) | Price changes, stock alerts, review sentiment shifts | METRIC |

**Flow:** SCOUT/PULSE (gather) → METRIC (analyze) → SPARK (create)

---

## Naming Conventions

- Agent names should be 3-6 characters, all caps
- Names should be evocative of the role (IRIS = vision/insight, FINN = finance, etc.)
- Avoid generic names (AGENT1, HELPER, ASSISTANT)
- Names should be distinct from each other (no FINN and FENN on the same team)
- The user can always rename agents — these are suggestions

---

## Interaction Pattern Rules

1. **Every agent must have at least one consumer** of its outputs (another agent or the user via dashboard)
2. **Avoid circular dependencies** — data flows in one direction through the pipeline
3. **The orchestrator is always the hub** — agents don't talk to each other directly
4. **File-based handoffs only** — agents pass file paths, not inline data
5. **Each handoff includes**: task_completed, key_findings, open_questions, suggested_next_steps
