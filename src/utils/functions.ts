import { writeFile, readFileSync, existsSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import chalk from 'chalk'
import jsYaml from 'js-yaml'
import stripJsonComments from 'strip-json-comments'
import { autoCliName } from '@/config'
import type { PresetInfo } from './types'
import type { DefaultConfig } from '../types'

/**
 * 预设数据路径
 */
const presetPath = resolve(import.meta.dirname, './presetData.json')

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

/**
 * 获取 JSONC 文件
 */
export const loadJSONCFile = <T extends Record<string, any> | string = Record<string, any>>(path: string, uncomment = false): T => {
  if (!existsSync(path)) return (uncomment ? {} : '') as T
  const content = readFileSync(path).toString()
  return (uncomment ? stripJsonComments(content) : content) as T
}

/**
 * 获取 yml 文件
 */
export const loadYMLFile = <T extends Record<string, any> = Record<string, any>>(path: string): T => {
  if (!existsSync(path)) return {} as T
  const content = readFileSync(path).toString()
  try {
    return jsYaml.load(content) as T
  } catch (error) {
    return {} as T
  }
}

/**
 * 加载默认配置
 */
export const loadDefaultConfig = <T extends Record<string, any> | string>(uncomment = false) => loadJSONCFile<T>(resolve(import.meta.dirname, autoCliName()), uncomment)

/**
 * 获取 auto-cli 配置文件内容
 */
export const getAutoCliConfig = () => {
  const [jsonCPath, ymlPath] = [autoCliName(), autoCliName('yml')].map(name => resolve(process.cwd(), name))

  return Object.assign(loadDefaultConfig(), loadYMLFile(ymlPath), loadJSONCFile(jsonCPath)) as DefaultConfig
}

/**
 * 加载默认配置文件内容
 */
export const getDefaultConfigFile = (name: string, uncomment = false) => {
  const content = uncomment ? loadDefaultConfig<string>(true) : loadDefaultConfig().toString()
  if (name.includes('.yml')) {
    return content
      .trim()
      .split('\n')
      .slice(1, -1)
      .reduce((prev, item) => prev + item.trim().replace(/[",]/g, '').replace('// ', '# ') + '\n', '')
  } else {
    return content
  }
}
