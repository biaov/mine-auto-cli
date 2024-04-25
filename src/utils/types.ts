import { InstallToolKey, TemplateUrlKey } from '@/types'


/**
 * 预设信息
 */
export interface PresetInfo extends Record<string, any> {
  installTool: InstallToolKey
  template: TemplateUrlKey
}
