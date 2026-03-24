#!/usr/bin/env node

/**
 * VibeOrg SQLite Rebuild Script
 *
 * Rebuilds the SQLite database from filesystem data.
 * Run this if the database gets corrupted or out of sync.
 *
 * Requires: better-sqlite3 (npm install better-sqlite3)
 * Usage: node scripts/rebuild-db.js
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')

// Check if SQLite is enabled
try {
  const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'vibeorg.config.json'), 'utf-8'))
  if (!config.settings.use_sqlite) {
    console.log('SQLite is not enabled in vibeorg.config.json. Nothing to rebuild.')
    process.exit(0)
  }
} catch {
  console.log('Cannot read vibeorg.config.json')
  process.exit(1)
}

// Check for better-sqlite3
let Database
try {
  Database = require('better-sqlite3')
} catch {
  console.log('better-sqlite3 is not installed.')
  console.log('Run: npm install better-sqlite3')
  process.exit(1)
}

const DB_PATH = path.join(ROOT, 'db', 'vibeorg.db')
const MIGRATION = path.join(ROOT, 'db', 'migrations', '001-initial.sql')

// Create/recreate database
console.log('Rebuilding SQLite database...')

if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH)
  console.log('  Removed existing database')
}

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
const db = new Database(DB_PATH)

// Run migration
const migration = fs.readFileSync(MIGRATION, 'utf-8')
db.exec(migration)
console.log('  Schema created')

// Index outputs
const outputsDir = path.join(ROOT, 'outputs')
if (fs.existsSync(outputsDir)) {
  const insertOutput = db.prepare(
    'INSERT OR REPLACE INTO outputs (id, agent_id, timestamp, status, tags, content_path, summary) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )

  const agentDirs = fs.readdirSync(outputsDir).filter(f =>
    fs.statSync(path.join(outputsDir, f)).isDirectory()
  )

  let count = 0
  for (const agentId of agentDirs) {
    const agentDir = path.join(outputsDir, agentId)
    const files = fs.readdirSync(agentDir).filter(f =>
      f.endsWith('.json') && f !== 'index.json' && f !== 'latest.json'
    )

    for (const file of files) {
      try {
        const output = JSON.parse(fs.readFileSync(path.join(agentDir, file), 'utf-8'))
        insertOutput.run(
          output.meta.id,
          output.meta.agent,
          output.meta.timestamp,
          output.meta.status,
          JSON.stringify(output.meta.tags || []),
          path.join('outputs', agentId, file),
          output.content?.summary || output.content?.title || ''
        )
        count++
      } catch {
        // Skip invalid files
      }
    }
  }

  console.log(`  Indexed ${count} output(s)`)
}

db.close()
console.log(`\nDatabase rebuilt at: ${DB_PATH}`)
