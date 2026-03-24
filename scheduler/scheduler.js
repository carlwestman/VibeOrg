#!/usr/bin/env node

/**
 * VibeOrg Scheduler
 *
 * A lightweight task runner using node-cron. Reads task definitions from
 * tasks.json and executes them on schedule. Supports four task types:
 * - data_fetch: HTTP requests to save data to files
 * - agent_workflow: triggers a named workflow via Claude Code CLI
 * - agent_task: sends a task prompt to Claude Code CLI
 * - shell_command: runs an arbitrary shell command
 *
 * Usage: node scheduler.js
 */

const cron = require('node-cron')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const { notify } = require('./notify')

// Load environment variables from project root
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') })

const TASKS_FILE = path.join(__dirname, 'tasks.json')
const LOG_DIR = path.join(__dirname, 'logs')
const PROJECT_ROOT = path.resolve(__dirname, '..')

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

function log(level, message, taskId) {
  const timestamp = new Date().toISOString()
  const prefix = taskId ? `[${taskId}]` : '[scheduler]'
  const line = `${timestamp} ${level.toUpperCase()} ${prefix} ${message}`

  console.log(line)

  const logFile = path.join(LOG_DIR, 'scheduler.log')
  fs.appendFileSync(logFile, line + '\n')
}

// ---------------------------------------------------------------------------
// Task Handlers
// ---------------------------------------------------------------------------

async function handleDataFetch(config, taskId) {
  const url = resolveEnvVars(config.url)
  const headers = {}
  if (config.headers) {
    for (const [key, val] of Object.entries(config.headers)) {
      headers[key] = resolveEnvVars(val)
    }
  }

  log('info', `Fetching data from ${url}`, taskId)

  try {
    const response = await fetch(url, {
      method: config.method || 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.text()
    const outputDir = path.join(PROJECT_ROOT, config.output_path)

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const filename = config.filename_pattern
      ? config.filename_pattern.replace('{date}', new Date().toISOString().split('T')[0])
      : `fetch-${Date.now()}.json`

    const outputPath = path.join(outputDir, filename)
    fs.writeFileSync(outputPath, data)

    log('info', `Data saved to ${outputPath}`, taskId)
  } catch (err) {
    log('error', `Data fetch failed: ${err.message}`, taskId)
  }
}

function handleAgentWorkflow(config, taskId) {
  return new Promise((resolve) => {
    const command = `echo "${escapeShell(config.claude_command)}" | claude --print`
    log('info', `Triggering workflow: ${config.workflow || config.claude_command}`, taskId)

    exec(command, { cwd: PROJECT_ROOT, timeout: 600000 }, (err, stdout, stderr) => {
      if (err) {
        log('error', `Workflow failed: ${err.message}`, taskId)
      } else {
        log('info', `Workflow completed. Output: ${stdout.slice(0, 200)}...`, taskId)
      }
      if (stderr) {
        log('warn', `Stderr: ${stderr.slice(0, 200)}`, taskId)
      }
      resolve()
    })
  })
}

function handleAgentTask(config, taskId) {
  return new Promise((resolve) => {
    const command = `echo "${escapeShell(config.task)}" | claude --print`
    log('info', `Running agent task: ${config.task.slice(0, 100)}...`, taskId)

    exec(command, { cwd: PROJECT_ROOT, timeout: 600000 }, (err, stdout, stderr) => {
      if (err) {
        log('error', `Agent task failed: ${err.message}`, taskId)
      } else {
        log('info', `Task completed. Output: ${stdout.slice(0, 200)}...`, taskId)
      }
      if (stderr) {
        log('warn', `Stderr: ${stderr.slice(0, 200)}`, taskId)
      }
      resolve()
    })
  })
}

function handleShellCommand(config, taskId) {
  return new Promise((resolve) => {
    log('info', `Running shell command: ${config.command}`, taskId)

    exec(config.command, { cwd: PROJECT_ROOT, timeout: 300000 }, (err, stdout, stderr) => {
      if (err) {
        log('error', `Shell command failed: ${err.message}`, taskId)
      } else {
        log('info', `Command completed. Output: ${stdout.slice(0, 200)}`, taskId)
      }
      if (stderr) {
        log('warn', `Stderr: ${stderr.slice(0, 200)}`, taskId)
      }
      resolve()
    })
  })
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function resolveEnvVars(str) {
  if (typeof str !== 'string') return str
  return str.replace(/\$\{env\.(\w+)\}/g, (_, key) => process.env[key] || '')
}

function escapeShell(str) {
  return str.replace(/"/g, '\\"').replace(/\n/g, ' ')
}

function checkDependency(taskId, tasks) {
  const task = tasks.find(t => t.id === taskId)
  if (!task || !task.depends_on) return true

  const dep = tasks.find(t => t.id === task.depends_on)
  if (!dep || !dep.enabled) return false

  // Simple dependency check: the dependent task should have a later schedule
  // In a more robust implementation, we'd track completion status
  return true
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function loadTasks() {
  try {
    const raw = fs.readFileSync(TASKS_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch (err) {
    log('error', `Failed to load tasks.json: ${err.message}`)
    return { tasks: [] }
  }
}

function start() {
  const { tasks } = loadTasks()

  if (tasks.length === 0) {
    log('info', 'No tasks configured. Scheduler running but idle.')
    log('info', 'Add tasks to scheduler/tasks.json to get started.')
    return
  }

  log('info', `Loading ${tasks.length} task(s)...`)

  for (const task of tasks) {
    if (!task.enabled) {
      log('info', `Skipping disabled task: ${task.name}`, task.id)
      continue
    }

    if (!cron.validate(task.schedule)) {
      log('error', `Invalid cron expression: ${task.schedule}`, task.id)
      continue
    }

    log('info', `Scheduling: ${task.name} (${task.schedule})`, task.id)

    cron.schedule(task.schedule, async () => {
      log('info', `Task triggered: ${task.name}`, task.id)

      if (!checkDependency(task.id, tasks)) {
        log('warn', `Dependency not met, skipping`, task.id)
        return
      }

      try {
        switch (task.type) {
          case 'data_fetch':
            await handleDataFetch(task.config, task.id)
            break
          case 'agent_workflow':
            await handleAgentWorkflow(task.config, task.id)
            break
          case 'agent_task':
            await handleAgentTask(task.config, task.id)
            break
          case 'shell_command':
            await handleShellCommand(task.config, task.id)
            break
          default:
            log('error', `Unknown task type: ${task.type}`, task.id)
        }
        await notify(`✅ *${task.name}* completed successfully.`)
      } catch (err) {
        log('error', `Unhandled error: ${err.message}`, task.id)
        await notify(`❌ *${task.name}* failed: ${err.message}`)
      }
    })
  }

  log('info', `Scheduler started with ${tasks.filter(t => t.enabled).length} active task(s).`)
}

// Start the scheduler
start()

// Keep the process alive
process.on('SIGINT', () => {
  log('info', 'Scheduler shutting down...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  log('info', 'Scheduler shutting down...')
  process.exit(0)
})
