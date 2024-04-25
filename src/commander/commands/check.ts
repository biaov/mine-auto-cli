import { program } from 'commander'
import { readFileSync, existsSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import chalk from 'chalk'
import pacote from 'pacote'
import stripJsonComments from 'strip-json-comments'
import { success, error, info } from '@/utils/log'
import type { NPMResponse } from '@/types'
import type { DefaultConfig, VersionLog } from '../types'

const fileOption: Record<string, string> = { encoding: 'utf-8' }

const checkConfigDefault = readFileSync(resolve(import.meta.dirname, './check.config.jsonc')).toString()
const defaultConfig: DefaultConfig = JSON.parse(stripJsonComments(checkConfigDefault.toString()))
const checkConfigName = 'check.config.jsonc'
const jsonFiles = [checkConfigName, 'package.json']
const [checkConfigPath, packagePath] = jsonFiles.map(name => resolve(process.cwd(), name))

/**
 * 初始化
 */
const initConfigJson = () => {
  info()
  if (existsSync(checkConfigPath)) {
    info(chalk.yellow(`${checkConfigName} 文件已存在`))
    info()
    info(chalk.yellow(`文件目录  ${checkConfigPath}`))
    return
  }
  writeFileSync(checkConfigPath, checkConfigDefault)
  success(`${checkConfigName} 文件创建成功`)
  info()
  info(chalk.green(`文件目录  ${checkConfigPath}`))
}

/**
 * 进度条日志
 */
const progressLog = (progress: number, total: number) => {
  const equal = Array.from({ length: total }, (_, i) => (i < progress ? '=' : ' ')).join('')
  const percentage = ~~((progress / total) * 100)
  const text = `\r查找进度：[${equal}] ${progress}/${total} ${percentage}%\r`
  const outText = progress === total ? chalk.green(text) : chalk.yellow(text)
  process.stdout.write(outText)
}

/**
 * 获取版本日志
 */
const getVersionLog = (name: string, value: string, distTags: NPMResponse['dist-tags']) => {
  let tag = 'latest'
  defaultConfig.resolve.some(item => {
    const spaceIndex = item.lastIndexOf('@')
    if (spaceIndex <= 0) return true
    const curName = item.slice(0, spaceIndex)
    const curTag = item.slice(spaceIndex + 1)
    if (name === curName) {
      tag = curTag
      return true
    }
  })
  const newVersion = defaultConfig.prefix + distTags[tag]
  return { name, value, newVersion, tag }
}

/**
 * 获取空格
 */
const getSpace = (length: number, maxLength: number) => Array.from({ length: maxLength - length }, () => ' ').join('')

/**
 * 获取长度
 */
const getValueLength = (value: string, i: number) => (+!i + 1) * value.length

/**
 * 格式化版本
 */
export const formatterVersion = (oldVersion: string, newVersion: string): string | false => {
  const oldV = oldVersion.match(/\d.+/g)![0].split('.')
  const newV = newVersion.match(/\d.+/g)![0].split('.')
  const index = newV.slice(0, -1).findIndex((item, i) => +item > +oldV[i])
  const mainName = defaultConfig.prefix + newV[0]
  switch (index) {
    case 0:
      return chalk.red(newVersion)
    case 1:
      return `${mainName}.${chalk.yellow(newV[1])}.${chalk.yellow(newV[2])}`
    default:
      const oldVLast = oldV.at(-1) as string
      const newVLast = newV.at(-1) as string
      return oldVLast !== newVLast && parseInt(newVLast) >= parseInt(oldVLast) ? `${mainName}.${newV[1]}.${chalk.green(newV[2])}` : false
  }
}

/**
 * 计算版本日志
 */
const outVersionLog = (versionLogs: VersionLog[]) => {
  const fieldMax: Record<string, number> = {}
  versionLogs.forEach(item => {
    Object.entries(item).forEach(([key, value]) => {
      fieldMax[key] = Math.max(value.length, fieldMax[key] ?? 0)
    })
  })

  versionLogs.unshift({ name: '包名', value: '版本', newVersion: '新版本', tag: '标签' })

  const outLog: string[] = []
  versionLogs.forEach(({ name, value, newVersion, tag }, i) => {
    const [nameSpace, valueSpace, newVersionSpace, tagSpace] = Object.entries({ name, value, newVersion, tag }).map(([key, value]) => getSpace(getValueLength(value, i), fieldMax[key]))
    let spacer = chalk.yellow('→')
    let showLog = true
    if (i) {
      const formatVer = formatterVersion(value, newVersion)
      if (formatVer) {
        newVersion = formatVer
      } else {
        showLog = false
      }
    } else {
      name = chalk.green(name)
      value = chalk.green(value)
      newVersion = chalk.green(newVersion)
      tag = chalk.green(tag)
      spacer = ' '
    }

    const text = `${name + nameSpace}  ${valueSpace + value}  ${spacer}  ${newVersionSpace + newVersion}  ${tagSpace + tag}`
    showLog && outLog.push(text)
  })
  if (outLog.length > 1) {
    outLog.forEach(info)
  } else {
    success('所有版本已是最新')
  }
}

/**
 * 进度条任务
 */
const taskProgress = async (allPackages: Record<string, string>, keys: string[], newPackages: Record<string, any>) => {
  info()
  /**
   * 进度条
   */
  let progress = 0
  const versionLogs: VersionLog[] = []
  const allPackagesArray = Object.entries(allPackages)
  const packageTask = allPackagesArray.map(async ([name, value]) => {
    /**
     * 获取包最新消息
     */
    const data = await pacote.packument(name, { registry: defaultConfig.registry })

    /**
     * 获取日志信息
     */
    const logItem = getVersionLog(name, value, data['dist-tags'])
    versionLogs.push(logItem)

    /**
     * 收集新包信息
     */
    keys.forEach(key => {
      const item = newPackages[key]
      item && item[name] && (item[name] = logItem.newVersion)
    })

    /**
     * 开启进度条
     */
    progress++
    await progressLog(progress, allPackagesArray.length)
  })
  await Promise.all(packageTask)
  info()
  info()
  return versionLogs
}

/**
 * 升级
 */
const simplifyUpgrade = async ({ update, init }: Record<string, boolean>) => {
  if (init) return initConfigJson()
  if (!existsSync(packagePath)) return error('package.json 文件不存在')

  existsSync(checkConfigPath) && Object.assign(defaultConfig, JSON.parse(stripJsonComments(readFileSync(checkConfigPath, fileOption).toString())))

  const newUpdate = update || defaultConfig.check
  const packageJsonString = readFileSync(packagePath, fileOption).toString()
  const packageJson: Record<string, any> = JSON.parse(packageJsonString)
  const keys = ['dependencies', 'devDependencies', 'optionalDependencies']
  const allPackages: Record<string, string> = {}
  const newPackages = JSON.parse(packageJsonString)

  /**
   * 收集所有的包
   */
  keys.forEach(key => {
    if (!packageJson[key]) return
    Object.entries(packageJson[key]).forEach(([key, value]) => {
      !defaultConfig.reject.includes(key) && (allPackages[key] = value as string)
    })
  })

  /**
   * 进度条
   */
  const versionLogs = await taskProgress(allPackages, keys, newPackages)

  /**
   * 更新包内容
   */
  if (newUpdate) {
    writeFileSync(packagePath, JSON.stringify(newPackages, null, 2))
    success('文件 package.json 已更新')
    info()
  }

  /**
   * 输出包信息
   */
  outVersionLog(versionLogs)
}

program
  .command('check')
  .option('-u, --update', `更新 package.json 依赖内容 或者配置 ${checkConfigName} 文件`, false)
  .option('-i, --init', `仅初始化 ${checkConfigName} 文件，不检查依赖版本`, false)
  .description('升级 package.json 依赖版本')
  .action(simplifyUpgrade)
