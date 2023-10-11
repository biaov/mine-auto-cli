import { InstallToolKey, TemplateUrlKey } from '@/config/types'

/**
 * 模板
 */
export interface Template {
  template: TemplateUrlKey
}

/**
 * 预设信息
 */
export interface PresetInfo extends Template {
  projectName: string
  installTool: InstallToolKey
}
