import type { templateUrls, toolCommands } from './config/config'

/**
 * 安装工具 key
 */
export type InstallToolKey = keyof typeof toolCommands

/**
 * 模板 key
 */
export type TemplateUrlKey = keyof typeof templateUrls

/**
 * mkdir tree
 */
export interface MkdirTree {
  name: string
  children?: MkdirTree[]
}

/**
 * `https://registry.npmjs.org/包名/` 返回信息
 */
export interface NPMResponse {
  'dist-tags': Record<string, string>
}

/**
 * defaultConfig
 */
export interface DefaultConfig {
  prefix: string
  registry: string
  check: boolean
  reject: string[]
  resolve: string[]
  comment: Record<string, string>
}

/**
 * auto-cli 配置名称
 */
export type AutoCliNameExt = 'jsonc' | 'yml'
