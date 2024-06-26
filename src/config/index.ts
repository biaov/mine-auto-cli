import type { InstallToolKey, TemplateUrlKey, AutoCliNameExt } from '@/types'
import { templateUrls, toolCommands } from './config'

/**
 * 模板名称
 */
export const templateNames = Object.keys(templateUrls) as TemplateUrlKey[]

/**
 * 模板名称拼接
 */
export const templateNameString = templateNames.reduce((prev, item, i) => prev + (i ? ', ' : '') + item, '')

/**
 * 工具名称
 */
export const installTools = Object.keys(toolCommands) as InstallToolKey[]

export { templateUrls, toolCommands }

/**
 * auto-cli 配置名称
 */
export const autoCliName = (ext: AutoCliNameExt = 'jsonc') => `auto-cli.${ext}`
