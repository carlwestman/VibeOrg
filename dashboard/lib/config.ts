import fs from 'fs'
import path from 'path'
import type { VibeOrgConfig } from './types'

const PROJECT_ROOT = path.resolve(process.cwd(), '..')

let cachedConfig: VibeOrgConfig | null = null
let cacheTime = 0
const CACHE_TTL = 5000 // 5 seconds

export function getProjectRoot(): string {
  return PROJECT_ROOT
}

export function getConfig(): VibeOrgConfig | null {
  const now = Date.now()
  if (cachedConfig && now - cacheTime < CACHE_TTL) {
    return cachedConfig
  }

  const configPath = path.join(PROJECT_ROOT, 'vibeorg.config.json')
  try {
    const raw = fs.readFileSync(configPath, 'utf-8')
    cachedConfig = JSON.parse(raw) as VibeOrgConfig
    cacheTime = now
    return cachedConfig
  } catch {
    return null
  }
}

export function isConfigured(): boolean {
  const config = getConfig()
  return config !== null && config.project.name !== ''
}
