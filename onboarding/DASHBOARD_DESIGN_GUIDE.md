# Dashboard Design Guide

Instructions for Claude to follow when generating domain-specific dashboard pages during onboarding Phase 7. This guide ensures generated dashboards are high-quality, domain-appropriate, and maintainable.

---

## Core Principles

1. **Each page is a React Server Component** reading from the filesystem via `@/lib/fs-reader`
2. **Domain-appropriate layouts** — not generic output lists. A portfolio page has a holdings table and allocation chart, not a JSON viewer.
3. **Import only from** `@/components/common/`, `@/lib/`, or the page's own directory. No cross-page imports.
4. **Use Tailwind classes** matching the configured theme via CSS variables
5. **TypeScript types** must match the actual output schemas in `@/lib/types.ts`
6. **Idiomatic, readable code** — the user or Claude should be able to edit it later

---

## Theme Application

The theme is defined in `vibeorg.config.json` and applied via CSS variables in `globals.css`.

### CSS Variable Mapping

```css
:root {
  --color-primary: [from theme.primary_color];
  --color-accent: [from theme.accent_color];
  --color-bg: [derived from theme.mode];
  --color-bg-secondary: [derived];
  --color-text: [derived from theme.mode];
  --color-text-secondary: [derived];
  --color-border: [derived];
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --font-body: [from theme.font_body];
  --font-mono: [from theme.font_mono];
  --radius: [from theme.border_radius mapped to rem];
}
```

### Tailwind Integration

In `tailwind.config.ts`, extend the theme:

```typescript
theme: {
  extend: {
    colors: {
      primary: 'var(--color-primary)',
      accent: 'var(--color-accent)',
      background: 'var(--color-bg)',
      'background-secondary': 'var(--color-bg-secondary)',
      foreground: 'var(--color-text)',
      'foreground-secondary': 'var(--color-text-secondary)',
      border: 'var(--color-border)',
    },
    fontFamily: {
      body: ['var(--font-body)', 'sans-serif'],
      mono: ['var(--font-mono)', 'monospace'],
    },
    borderRadius: {
      DEFAULT: 'var(--radius)',
    }
  }
}
```

### Theme Direction Guidelines

| Direction | Tailwind Patterns |
|-----------|-------------------|
| professional-finance | `bg-slate-900`, dense grids, `font-mono` for numbers, minimal color, border-heavy tables |
| warm-playful | `rounded-xl`, `bg-amber-50`, spacious `p-6`, larger text, card-based layouts |
| minimal-technical | `bg-zinc-950`, `font-mono`, compact `p-2`, high-density data, minimal decoration |
| calm-trustworthy | `bg-sky-50`, `rounded-lg`, generous `space-y-6`, clear hierarchy, soft shadows |
| modern-neutral | `bg-zinc-900`/`bg-white`, subtle borders, `rounded-md`, balanced density |

---

## Page Layout Patterns

### Overview / Dashboard Page (`/`)
The main landing page. Should show:
- **Key metrics** — 3-5 big numbers or KPIs at the top
- **Recent activity** — last 5-10 agent outputs as a compact list
- **Quick status** — agent health indicators
- **Domain highlights** — the most important domain-specific content

```tsx
// Pattern: Overview page
export default async function OverviewPage() {
  const agents = getAgents()
  const recentOutputs = getOutputs({ limit: 10 })
  const status = getSystemStatus()

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="..." value="..." />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Primary content area */}
        </div>
        <div>
          {/* Sidebar: recent activity, status */}
        </div>
      </div>
    </div>
  )
}
```

### List / Browser Page (e.g., `/reports`, `/lessons`)
Shows a filterable, sortable list of items.

```tsx
// Pattern: List page
export default async function ListPage() {
  const items = getOutputs({ agent: 'agent-id' })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1>Page Title</h1>
        {/* Filter controls */}
      </div>
      <DataTable
        columns={columns}
        data={items}
        // sortable, filterable
      />
    </div>
  )
}
```

### Detail Page (e.g., `/reports/[id]`, `/portfolio/[position]`)
Shows a single item in full detail.

```tsx
// Pattern: Detail page with dynamic route
export default async function DetailPage({ params }: { params: { id: string } }) {
  const item = getOutput('agent-id', params.id)
  if (!item) return <NotFound />

  return (
    <div className="space-y-6">
      <header>
        <h1>{item.content.title}</h1>
        <StatusBadge status={item.meta.status} />
        <time>{item.meta.timestamp}</time>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Main content */}
          <MarkdownRenderer content={item.content.body} />
        </div>
        <aside>
          {/* Metadata, related items, tags */}
        </aside>
      </div>
    </div>
  )
}
```

### Data / Metrics Page (e.g., `/portfolio`, `/analytics`)
Shows quantitative data with charts and tables.

```tsx
// Pattern: Data dashboard page
export default async function DataPage() {
  const data = getOutputs({ agent: 'analyst-id', limit: 30 })

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="..." value={...} trend="up" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper type="line" data={...} />
        <ChartWrapper type="bar" data={...} />
      </div>

      {/* Detail table */}
      <DataTable columns={...} data={...} />
    </div>
  )
}
```

### Timeline / Feed Page (e.g., `/activity`, `/alerts`)
Shows chronological entries.

```tsx
// Pattern: Timeline page
export default async function TimelinePage() {
  const entries = getOutputs({ limit: 50 })

  return (
    <div className="space-y-2">
      {entries.map(entry => (
        <div key={entry.meta.id} className="flex gap-4 p-4 border-b">
          <div className="text-sm text-foreground-secondary whitespace-nowrap">
            {formatTime(entry.meta.timestamp)}
          </div>
          <div>
            <p className="font-medium">{entry.content.title}</p>
            <p className="text-sm text-foreground-secondary">{entry.content.summary}</p>
          </div>
          <StatusBadge status={entry.meta.status} />
        </div>
      ))}
    </div>
  )
}
```

---

## Component Mapping: Output Schema → UI

| Schema Field Type | Component |
|-------------------|-----------|
| String (short) | `<span>` or `<p>` |
| String (Markdown) | `<MarkdownRenderer>` |
| String (status/enum) | `<StatusBadge>` |
| Number (metric) | `<MetricCard>` or inline with formatting |
| Number (currency) | Formatted with locale, `font-mono` class |
| Array of objects | `<DataTable>` |
| Array of strings | Comma-separated or tag list |
| Nested object | Card or expandable section |
| ISO timestamp | Formatted date/time with `<time>` element |
| Confidence level | Color-coded badge (HIGH=green, MEDIUM=yellow, LOW=red) |
| URL | Clickable link |
| File path | Link to related output |

---

## Domain-Specific Page Examples

### Finance: Portfolio Overview

```
┌─────────────────────────────────────────────┐
│ Portfolio Overview                           │
├─────────────────────────────────────────────┤
│ Total Value    Day Change   YTD Return      │
│ $1,234,567     +$12,345     +15.2%          │
├─────────────────────────────────────────────┤
│ Holdings Table                               │
│ Name    | Shares | Price  | Value   | P&L   │
│ ERIC-B  | 500    | 89.50  | 44,750  | +12%  │
│ VOLV-B  | 200    | 245.00 | 49,000  | +8%   │
├─────────────────────────────────────────────┤
│ Allocation Chart (pie)  │ Recent Activity   │
│ [Technology: 45%]       │ - IRIS report     │
│ [Healthcare: 30%]       │ - FINN analysis   │
│ [Energy: 25%]           │ - Price alert     │
└─────────────────────────────────────────────┘
```

### Education: Lesson Plans Browser

```
┌─────────────────────────────────────────────┐
│ Lesson Plans                    [+ New] [🔍] │
├─────────────────────────────────────────────┤
│ Filter: [All Subjects ▼] [All Grades ▼]    │
├─────────────────────────────────────────────┤
│ 📚 Introduction to Fractions    Grade 4     │
│    Math · 45 min · Created Mar 20           │
│    Standards: CCSS.MATH.4.NF.1              │
│                                              │
│ 🧪 States of Matter Lab         Grade 5     │
│    Science · 60 min · Created Mar 19        │
│    Standards: NGSS.5-PS1-3                  │
│                                              │
│ ✍️ Persuasive Essay Structure    Grade 6     │
│    ELA · 50 min · Created Mar 18            │
│    Standards: CCSS.ELA-W.6.1                │
└─────────────────────────────────────────────┘
```

### Content Marketing: Content Calendar

```
┌─────────────────────────────────────────────┐
│ Content Calendar              March 2026     │
├─────────────────────────────────────────────┤
│ Mon   Tue   Wed   Thu   Fri                  │
│                     ·     ·                  │
│  ·     ·    Blog   ·    Social               │
│  ·    Email  ·     Blog  ·                   │
│  ·     ·    Social  ·    Report              │
├─────────────────────────────────────────────┤
│ Pipeline          │ Performance              │
│ Draft: 3          │ Published: 12            │
│ Review: 2         │ Avg engagement: 4.2%     │
│ Scheduled: 5      │ Top post: "How to..."    │
│ Published: 12     │ Email open rate: 28%     │
└─────────────────────────────────────────────┘
```

---

## Auto-Refresh Strategy

1. **Server-side**: set `export const revalidate = 5` on data-fetching pages
2. **Client-side**: on the overview page, poll `/api/outputs?since=<timestamp>` every 10 seconds
3. **Show a banner**: "New outputs available — click to refresh" (don't auto-reload)
4. **No live streaming**: intentionally not real-time. The user checks after agents run.

---

## Generated File Checklist

When generating a domain-specific page, ensure you create:
- [ ] `dashboard/app/[page-name]/page.tsx` — the page component
- [ ] `dashboard/components/[domain]/` — any domain-specific components
- [ ] Types in `dashboard/lib/types.ts` — domain-specific interfaces
- [ ] Entry in `dashboard/navigation.json` — so the sidebar includes it
- [ ] For detail pages: `dashboard/app/[page-name]/[id]/page.tsx`
