import { writeFile, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import { PresetInfo } from './types'

export const __dirname = dirname(fileURLToPath(import.meta.url))
/**
 * 预设数据路径
 */
const presetPath = resolve(__dirname, './presetData.json')

/**
 * 保存本地预设信息
 * @param { string } name - 对象名称
 * @param { PresetInfo } data - 对象值
 * @returns { void }
 */
export const SavePresetInfo = (name: string, data: PresetInfo) => {
  /**
   * 保存对象键值对
   */
  const saveData = GetPresetInfo()
  saveData[name] = data
  writeFile(presetPath, JSON.stringify(saveData), err => {
    err && console.log('保存预设失败')
  })
}

/**
 * 读取本地预设信息
 * @param { void }
 * @returns { Partial<PresetInfo> }
 */
export const GetPresetInfo = (): Partial<PresetInfo> => {
  let info: Buffer
  try {
    info = readFileSync(presetPath) // 读取文件
  } catch {
    return {} // 返回空对象
  }
  return JSON.parse(`${info}`)
}

/**
 * 格式化预设值
 * @param { Partial<PresetInfo> }
 * @returns { string[] }
 */
export const FormatePreset = (presetInfo: Partial<PresetInfo>): string[] =>
  Object.entries(presetInfo).map(
    ([key, value]) =>
      `${key}（${Object.values(value)
        .map(item => `${chalk.yellow(item)}`)
        .join(', ')}）`
  )
