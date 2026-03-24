#!/usr/bin/env node

/**
 * VibeOrg Test Data Seeder
 *
 * Generates realistic sample outputs for all configured agents.
 * Run after onboarding to populate the dashboard with example data.
 *
 * Usage: node scripts/seed-test-data.js
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')

function loadAgents() {
  try {
    const raw = fs.readFileSync(path.join(ROOT, 'agents', 'agents.json'), 'utf-8')
    return JSON.parse(raw).agents || []
  } catch {
    console.log('No agents configured. Run /init first.')
    process.exit(0)
  }
}

function generateId(agentId, date) {
  const d = date.toISOString().replace(/[-:]/g, '').slice(0, 15)
  return `${agentId}-${d}`
}

function generateTimestamp(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(7 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0)
  return d
}

function generateOutput(agent, date, index) {
  const id = generateId(agent.id, date)

  return {
    meta: {
      id,
      agent: agent.id,
      timestamp: date.toISOString(),
      task_id: `task-${agent.id}-${index}`,
      status: index === 0 ? 'final' : Math.random() > 0.3 ? 'final' : 'draft',
      version: 1,
      tags: [agent.role.toLowerCase().replace(/\s+/g, '-')],
    },
    content: {
      title: `${agent.name} output #${index + 1}`,
      summary: `Sample output from ${agent.name} (${agent.role}). This is seed data generated for dashboard preview.`,
      data: {
        generated: true,
        agent_role: agent.role,
        sample_metric: Math.round(Math.random() * 100),
      },
    },
  }
}

function seed() {
  const agents = loadAgents()

  if (agents.length === 0) {
    console.log('No agents found. Run /init first.')
    return
  }

  console.log(`Seeding test data for ${agents.length} agent(s)...`)

  for (const agent of agents) {
    const outputDir = path.join(ROOT, 'outputs', agent.id)
    fs.mkdirSync(outputDir, { recursive: true })

    const outputs = []

    // Generate 5 sample outputs per agent
    for (let i = 0; i < 5; i++) {
      const date = generateTimestamp(i)
      const output = generateOutput(agent, date, i)
      const filename = date.toISOString().replace(/:/g, '-').slice(0, 16) + '.json'

      fs.writeFileSync(
        path.join(outputDir, filename),
        JSON.stringify(output, null, 2)
      )

      outputs.push({
        id: output.meta.id,
        timestamp: output.meta.timestamp,
        status: output.meta.status,
        tags: output.meta.tags,
        file: filename,
      })

      // Update latest.json for the most recent output
      if (i === 0) {
        fs.writeFileSync(
          path.join(outputDir, 'latest.json'),
          JSON.stringify(output, null, 2)
        )
      }
    }

    // Write index.json
    fs.writeFileSync(
      path.join(outputDir, 'index.json'),
      JSON.stringify({ agent_id: agent.id, outputs }, null, 2)
    )

    console.log(`  ${agent.name}: ${outputs.length} outputs generated`)
  }

  // Seed memory entries
  for (const agent of agents) {
    const memoryDir = path.join(ROOT, 'memory', 'agents', agent.id)
    fs.mkdirSync(memoryDir, { recursive: true })

    const memoryPath = path.join(memoryDir, 'memory.md')
    const today = new Date().toISOString().split('T')[0]

    const memoryContent = `# ${agent.name} — Agent Memory

## Summary (auto-updated)
Last active: ${today}. Total tasks completed: 5.
Key expertise developed: Sample domain knowledge from seed data.

## Recent Entries

### ${today} — Seed Data Generation
- **Task:** Generate sample outputs for dashboard preview
- **Key findings:** Dashboard is functional with test data
- **Sources used:** Internal seed data generator
- **Lessons:** Seed data helps verify dashboard layouts before real agent work begins
- **Confidence:** HIGH
`

    fs.writeFileSync(memoryPath, memoryContent)
    console.log(`  ${agent.name}: memory seeded`)
  }

  console.log('\nSeed data generation complete.')
  console.log('Start the dashboard with: npm run dev')
}

seed()
