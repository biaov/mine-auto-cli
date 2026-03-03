import { program } from 'commander'
import chalk from 'chalk'
import { success, info, error } from '@/utils/log'
import { loadJSONCFile, getSeparatorStr } from '@/utils/functions'
import { readFileSync, existsSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import os from 'os'

interface InitAIEnv {
  env: {
    ANTHROPIC_BASE_URL: string // 模型 API 基础 URL
    ANTHROPIC_AUTH_TOKEN: string // 模型 API 认证 token
    API_TIMEOUT_MS: string // API 请求超时时间，单位毫秒，默认为 10 分钟
    ANTHROPIC_MODEL: string // 模型名称
    ANTHROPIC_SMALL_FAST_MODEL: string // 小模型名称
    CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: string // 是否禁用非必要流量，默认为 `1`
  }
}

const keys = ['ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_BASE_URL', 'ANTHROPIC_MODEL', 'ANTHROPIC_SMALL_FAST_MODEL'] as const
const aiJsonc = loadJSONCFile(resolve(import.meta.dirname, 'ai.jsonc'), true)
const initAIJson = Object.entries(aiJsonc)[0] as [string, InitAIEnv]
const claudeConfigPath = resolve(os.homedir(), '.claude/settings.json')
const aiModelPath = resolve(os.homedir(), '.ai-model.json')

const loadClaudeConfig = () => {
  if (!existsSync(claudeConfigPath)) {
    error(`${claudeConfigPath} 文件不存在，请先检查或者去安装 Claude Code`)
    process.exit(1)
  }
  const content = JSON.parse(readFileSync(claudeConfigPath).toString())
  !content.env && (content.env = {})
  return content as InitAIEnv
}

/**
 * 加载 AI 模型配置
 */
const loadAIModelConfig = () => {
  info()
  if (!existsSync(aiModelPath)) {
    error('配置不存在，请先使用 `ai init` 初始化 AI 模型配置')
    process.exit(1)
  }
  const content = JSON.parse(readFileSync(aiModelPath).toString()) as Record<string, InitAIEnv>
  const models = Object.entries(content).filter(([key, value]) => {
    if (key === initAIJson[0]) return false
    const env = (value as InitAIEnv).env
    const defaultEnv = initAIJson[1].env
    if (!env) return false
    const result = keys.some(key => !env[key] || env[key] === defaultEnv[key])
    if (result) return false
    return true
  })

  if (!models.length) {
    info(`暂无已配置的 AI 模型，请先配置，路径 ${chalk.green(aiModelPath)}`)
    process.exit(1)
  }

  return [models, content] as const
}

/**
 * 初始化 AI 模型配置
 */
const initAIModelConfig = () => {
  info()
  if (existsSync(aiModelPath)) {
    info(`配置已存在，路径 ${chalk.green(aiModelPath)}`)
    return
  }
  writeFileSync(aiModelPath, JSON.stringify(aiJsonc, null, 2))
  success(`配置已初始化，路径 ${chalk.green(aiModelPath)}`)
}

/**
 * 计算字符串长度，中文字符算 2 个字符
 */
const calcStrLength = (str: string) => str.replace(/[\u4e00-\u9fa5]/g, 'aa').length

/**
 * 查看当前已配置的 AI 模型
 */
const lsAIModel = () => {
  const [models] = loadAIModelConfig()
  let fieldMax = 0
  let current = -1
  const claudeConfig = loadClaudeConfig()
  models.forEach(([name, value], i) => {
    fieldMax = Math.max(fieldMax, calcStrLength(name))

    // 找到第一个和当前环境变量一致的模型
    if (current < 0 && !keys.some(key => claudeConfig.env[key] !== value.env[key])) {
      current = i
    }
  })

  models.forEach(([name, value], i) => {
    const { ANTHROPIC_BASE_URL } = value.env
    const prefix = i === current ? chalk.green('*') : ' '
    const separator = getSeparatorStr(calcStrLength(name), fieldMax + 4, '-')
    const str = `${prefix} ${name} ${separator} ${ANTHROPIC_BASE_URL}`
    info(str)
  })
}

/**
 * 切换 AI 模型
 */
const useAIModel = async (value: string) => {
  const claudeConfig = loadClaudeConfig()
  const [models, content] = loadAIModelConfig()
  // 检查模型是否存在
  if (!models.some(([name]) => name === value)) {
    info(`模型 ${chalk.red(value)} 不存在`)
    process.exit(1)
  }

  // 检查当前环境变量是否和目标模型一致
  if (!keys.some(key => claudeConfig.env[key] !== content[value].env[key])) {
    info(`当前正处于 ${chalk.green(value)} 模型，无需切换`)
  } else {
    claudeConfig.env = content[value].env
    writeFileSync(claudeConfigPath, JSON.stringify(claudeConfig, null, 2))
    success(`模型 ${chalk.green(value)} 已切换`)
  }
}

const aiCommand = program.command('ai').description('AI 命令，详细操作请查看 ai -h').helpOption('-h, --help', '输出所有命令').helpCommand(false)
aiCommand.command('init').description('初始化 AI 模型配置').action(initAIModelConfig)
aiCommand.command('ls').description('查看当前已配置的 AI 模型').action(lsAIModel)
aiCommand.command('use <模型>').description('切换 AI 模型').action(useAIModel)
