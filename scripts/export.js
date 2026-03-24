#!/usr/bin/env node

/**
 * VibeOrg Output Exporter
 *
 * Exports agent outputs to common formats.
 *
 * Usage:
 *   node scripts/export.js --agent iris --format csv
 *   node scripts/export.js --all --format json
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')

function loadOutputs(agentId) {
  const outputDir = path.join(ROOT, 'outputs', agentId)
  if (!fs.existsSync(outputDir)) return []

  return fs.readdirSync(outputDir)
    .filter(f => f.endsWith('.json') && f !== 'index.json' && f !== 'latest.json')
    .sort()
    .map(f => {
      try {
        return JSON.parse(fs.readFileSync(path.join(outputDir, f), 'utf-8'))
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

function loadAllAgentIds() {
  try {
    const raw = fs.readFileSync(path.join(ROOT, 'agents', 'agents.json'), 'utf-8')
    return (JSON.parse(raw).agents || []).map(a => a.id)
  } catch {
    return []
  }
}

function toCsv(outputs) {
  if (outputs.length === 0) return ''

  const rows = outputs.map(o => ({
    id: o.meta.id,
    agent: o.meta.agent,
    timestamp: o.meta.timestamp,
    status: o.meta.status,
    tags: (o.meta.tags || []).join(';'),
    title: o.content?.title || '',
    summary: o.content?.summary || '',
  }))

  const headers = Object.keys(rows[0])
  const lines = [
    headers.join(','),
    ...rows.map(r => headers.map(h => `"${String(r[h]).replace(/"/g, '""')}"`).join(',')),
  ]

  return lines.join('\n')
}

// Parse args
const args = process.argv.slice(2)
const agentFlag = args.indexOf('--agent')
const formatFlag = args.indexOf('--format')
const allFlag = args.includes('--all')

const agentId = agentFlag >= 0 ? args[agentFlag + 1] : null
const format = formatFlag >= 0 ? args[formatFlag + 1] : 'json'

if (!agentId && !allFlag) {
  console.log('Usage:')
  console.log('  node scripts/export.js --agent <agent-id> --format csv|json')
  console.log('  node scripts/export.js --all --format csv|json')
  process.exit(0)
}

const agentIds = allFlag ? loadAllAgentIds() : [agentId]
let allOutputs = []

for (const id of agentIds) {
  allOutputs = allOutputs.concat(loadOutputs(id))
}

if (allOutputs.length === 0) {
  console.log('No outputs found.')
  process.exit(0)
}

const exportDir = path.join(ROOT, 'exports')
fs.mkdirSync(exportDir, { recursive: true })

const timestamp = new Date().toISOString().split('T')[0]
const filename = `export-${allFlag ? 'all' : agentId}-${timestamp}.${format}`
const exportPath = path.join(exportDir, filename)

if (format === 'csv') {
  fs.writeFileSync(exportPath, toCsv(allOutputs))
} else {
  fs.writeFileSync(exportPath, JSON.stringify(allOutputs, null, 2))
}

console.log(`Exported ${allOutputs.length} output(s) to ${exportPath}`)
