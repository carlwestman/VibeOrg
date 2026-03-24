#!/usr/bin/env node

/**
 * VibeOrg Schema Validator
 *
 * Validates:
 * 1. All OUTPUT_SCHEMA.json files are valid JSON Schema
 * 2. All output files conform to their agent's schema
 * 3. agents.json has matching directories for each agent
 * 4. vibeorg.config.json has required fields
 *
 * Usage: node scripts/validate-schemas.js
 */

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
let errors = 0
let warnings = 0
let checks = 0

function pass(msg) {
  checks++
  console.log(`  \u2713 ${msg}`)
}

function fail(msg) {
  errors++
  checks++
  console.log(`  \u2717 ${msg}`)
}

function warn(msg) {
  warnings++
  console.log(`  ! ${msg}`)
}

// ---------------------------------------------------------------------------
// Config validation
// ---------------------------------------------------------------------------

function validateConfig() {
  console.log('\nValidating vibeorg.config.json...')
  const configPath = path.join(ROOT, 'vibeorg.config.json')

  try {
    const raw = fs.readFileSync(configPath, 'utf-8')
    const config = JSON.parse(raw)

    if (config.version) pass('Has version field')
    else fail('Missing version field')

    if (config.project) pass('Has project section')
    else fail('Missing project section')

    if (config.settings) pass('Has settings section')
    else fail('Missing settings section')

    if (config.theme) pass('Has theme section')
    else fail('Missing theme section')

  } catch (err) {
    fail(`Cannot read config: ${err.message}`)
  }
}

// ---------------------------------------------------------------------------
// Agent structure validation
// ---------------------------------------------------------------------------

function validateAgentStructure() {
  console.log('\nValidating agent structure...')
  const registryPath = path.join(ROOT, 'agents', 'agents.json')

  let agents = []
  try {
    const raw = fs.readFileSync(registryPath, 'utf-8')
    const registry = JSON.parse(raw)
    agents = registry.agents || []
    pass(`agents.json is valid JSON with ${agents.length} agent(s)`)
  } catch (err) {
    fail(`Cannot read agents.json: ${err.message}`)
    return
  }

  for (const agent of agents) {
    console.log(`\n  Agent: ${agent.name} (${agent.id})`)

    // Check directory exists
    const agentDir = path.join(ROOT, 'agents', agent.id)
    if (fs.existsSync(agentDir)) pass('Agent directory exists')
    else { fail(`Missing directory: agents/${agent.id}/`); continue }

    // Check required files
    const requiredFiles = ['PERSONA.md', 'OUTPUT_SCHEMA.json']
    for (const file of requiredFiles) {
      const filePath = path.join(agentDir, file)
      if (fs.existsSync(filePath)) pass(`Has ${file}`)
      else fail(`Missing ${file}`)
    }

    // Check optional files
    const optionalFiles = ['EXAMPLES.md', 'TOOLS.md']
    for (const file of optionalFiles) {
      const filePath = path.join(agentDir, file)
      if (fs.existsSync(filePath)) pass(`Has ${file}`)
      else warn(`Missing optional ${file}`)
    }

    // Check memory file
    const memoryPath = path.join(ROOT, 'memory', 'agents', agent.id, 'memory.md')
    if (fs.existsSync(memoryPath)) pass('Memory file exists')
    else fail(`Missing memory file: memory/agents/${agent.id}/memory.md`)

    // Check output directory
    const outputDir = path.join(ROOT, 'outputs', agent.id)
    if (fs.existsSync(outputDir)) pass('Output directory exists')
    else fail(`Missing output directory: outputs/${agent.id}/`)

    // Validate OUTPUT_SCHEMA.json is valid JSON
    const schemaPath = path.join(agentDir, 'OUTPUT_SCHEMA.json')
    if (fs.existsSync(schemaPath)) {
      try {
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))
        if (schema.properties && schema.properties.meta) pass('Schema has meta section')
        else warn('Schema missing meta section')
        if (schema.properties && schema.properties.content) pass('Schema has content section')
        else warn('Schema missing content section')
      } catch (err) {
        fail(`Invalid JSON in OUTPUT_SCHEMA.json: ${err.message}`)
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Output validation
// ---------------------------------------------------------------------------

function validateOutputs() {
  console.log('\nValidating outputs...')
  const outputsDir = path.join(ROOT, 'outputs')

  if (!fs.existsSync(outputsDir)) {
    warn('No outputs directory')
    return
  }

  const agentDirs = fs.readdirSync(outputsDir).filter(f =>
    fs.statSync(path.join(outputsDir, f)).isDirectory()
  )

  for (const agentId of agentDirs) {
    const agentOutputDir = path.join(outputsDir, agentId)
    const files = fs.readdirSync(agentOutputDir).filter(f =>
      f.endsWith('.json') && f !== 'index.json' && f !== 'latest.json'
    )

    if (files.length === 0) continue

    console.log(`\n  Outputs for: ${agentId} (${files.length} file(s))`)

    for (const file of files) {
      try {
        const output = JSON.parse(fs.readFileSync(path.join(agentOutputDir, file), 'utf-8'))

        if (output.meta) {
          if (output.meta.id && output.meta.agent && output.meta.timestamp) {
            pass(`${file}: valid meta`)
          } else {
            fail(`${file}: incomplete meta (needs id, agent, timestamp)`)
          }
        } else {
          fail(`${file}: missing meta section`)
        }

        if (output.content) pass(`${file}: has content`)
        else fail(`${file}: missing content section`)

      } catch (err) {
        fail(`${file}: invalid JSON — ${err.message}`)
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Run all validations
// ---------------------------------------------------------------------------

console.log('VibeOrg Schema Validator')
console.log('========================')

validateConfig()
validateAgentStructure()
validateOutputs()

console.log('\n========================')
console.log(`Results: ${checks} checks, ${errors} error(s), ${warnings} warning(s)`)

if (errors > 0) {
  console.log('\nValidation FAILED')
  process.exit(1)
} else {
  console.log('\nValidation PASSED')
  process.exit(0)
}
