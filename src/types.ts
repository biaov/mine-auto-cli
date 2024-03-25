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
