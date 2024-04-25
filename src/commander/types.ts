/**
 * defaultConfig
 */
export interface DefaultConfig {
  prefix: string
  registry: string
  check: boolean
  reject: string[]
  resolve: string[]
}

/**
 * versionLogs
 */
export interface VersionLog {
  name: string
  value: string
  newVersion: string
  tag: string
}
