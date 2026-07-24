/**
 * versionLogs
 */
export interface VersionLog {
  name: string
  value: string
  newVersion: string
  tag: string
}

/**
 * Claude Code CLI 路径组
 */
export interface CliPathGroup {
  cliPath: string
  cliPathBak: string
  exePath: string
  exeZhPath: string
  exePathBak: string
  isExistExe: boolean
}
