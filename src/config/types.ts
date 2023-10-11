import type { templateUrls, toolCommands } from './config'

/**
 * 安装工具 key
 */
export type InstallToolKey = keyof typeof toolCommands

/**
 * 模板 key
 */
export type TemplateUrlKey = keyof typeof templateUrls
