import { InstallToolKey, TemplateUrlKey } from '@/config/types'

/**
 * 日志 API
 */
export interface LogAags {
  text: string
  prefix?: string
}

/**
 * 预设信息
 */
export interface PresetInfo extends Record<string, any> {
  installTool: InstallToolKey
  template: TemplateUrlKey
}
