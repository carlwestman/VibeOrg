'use client'

import { useState } from 'react'

interface JsonViewerProps {
  data: unknown
  initialExpanded?: boolean
}

export function JsonViewer({ data, initialExpanded = false }: JsonViewerProps) {
  const [expanded, setExpanded] = useState(initialExpanded)

  const formatted = JSON.stringify(data, null, 2)
  const lineCount = formatted.split('\n').length

  if (lineCount <= 5) {
    return (
      <pre className="overflow-x-auto rounded bg-background p-3 font-mono text-xs text-foreground">
        {formatted}
      </pre>
    )
  }

  return (
    <div className="overflow-hidden rounded border border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between bg-background-secondary px-3 py-2 text-xs text-foreground-secondary hover:text-foreground transition-colors"
      >
        <span>JSON ({lineCount} lines)</span>
        <span>{expanded ? 'Collapse' : 'Expand'}</span>
      </button>
      {expanded && (
        <pre className="max-h-96 overflow-auto bg-background p-3 font-mono text-xs text-foreground">
          {formatted}
        </pre>
      )}
    </div>
  )
}
