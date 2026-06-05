import { program } from 'commander'
import chalk from 'chalk'
import { success, info, error } from '@/utils/log'
import { loadJSONCFile, getSeparatorStr } from '@/utils/functions'
import { readFileSync, existsSync, writeFileSync, cpSync } from 'fs'
import { resolve } from 'path'
import os from 'os'
import { execSync } from 'child_process'

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

/**
 * 获取 Claude Code CLI 路径
 */
const getCliPath = () => {
  const pkgname = '@anthropic-ai/claude-code'
  try {
    const log = execSync(`npm list -g ${pkgname} --depth=0`).toString().trim()
    const result = log.includes(pkgname)
    if (!result) {
      error(chalk.red(`请使用 nodejs 安装 ${pkgname}`))
      process.exit(1)
    }
    const npmRoot = execSync('npm root -g').toString().trim()
    const cliPath = resolve(npmRoot, pkgname, 'cli.js')
    const cliPathBak = resolve(npmRoot, pkgname, 'cli.bak.js')
    const exePath = resolve(npmRoot, pkgname, 'bin/claude.exe')
    const exePathBak = resolve(npmRoot, pkgname, 'bin/claude.bak.exe')
    /**
     * 是否存在 exe 文件
     */
    let isExistExe = false
    if (existsSync(exePath)) {
      !existsSync(exePathBak) && cpSync(exePath, exePathBak)
      isExistExe = true
    } else {
      !existsSync(cliPathBak) && cpSync(cliPath, cliPathBak)
    }

    return { cliPath, cliPathBak, exePath, exePathBak, isExistExe }
  } catch {
    error(chalk.red(`请使用 nodejs 安装 ${pkgname}`))
    process.exit(1)
  }
}

/**
 * 汉化 Claude Code
 */
const useZH = async () => {
  info()
  info('开始汉化 Claude Code')
  const { cliPath, exePath, exePathBak, isExistExe } = getCliPath()
  if (isExistExe) {
    const buffer = readFileSync(exePathBak)
    const keyword = (await import('@/config/keyword-latest')).default
    Object.entries(keyword).forEach(([key, value]) => {
      const enBuf = Buffer.from(key, 'utf8')
      const cnBuf = Buffer.from(value, 'utf8') // 强制UTF8，保证不乱码
      const hasMatch = buffer.includes(enBuf)
      if (!hasMatch) {
        // console.log(`ℹ️ 未找到：${enBuf} → 跳过/`)
        return
      }

      // 安全检查：中文不能比英文长
      if (cnBuf.length > enBuf.length) {
        // console.log(`❌ 跳过：${key} → ${value}（中文字节超长）`)
        return
      }

      let pos = 0

      // 搜索所有匹配位置并替换
      while ((pos = buffer.indexOf(enBuf, pos)) !== -1) {
        // 写入中文
        cnBuf.copy(buffer, pos)
        // 多余空间填 0x00 防止损坏EXE
        buffer.fill(0x20, pos + cnBuf.length, pos + enBuf.length)
        pos += enBuf.length
      }
    })

    // 写入新文件
    writeFileSync(exePath, buffer)
  } else {
    const content = readFileSync(cliPath).toString()
    const keyword = (await import('@/config/keyword')).default
    const newContent = Object.entries(keyword).reduce((prev, [key, value]) => {
      const escapedKey = key.replace(/\n/g, '\\\\n').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const newValue = value.replace(/\n/g, '\\n')

      return ['`', '\\'].includes(escapedKey[0])
        ? prev.replace(new RegExp(escapedKey, 'g'), value)
        : prev.replace(new RegExp(`\"${escapedKey}\"`, 'g'), `\"${newValue}\"`).replace(new RegExp(`(\'${escapedKey}\')`, 'g'), `\'${newValue}\'`)
    }, content)
    writeFileSync(cliPath, newContent)
  }
  success('Claude Code 已汉化')
}

/**
 *  Claude Code 恢复成英文
 */
const useZHRestore = () => {
  info()
  info('开始恢复 Claude Code')
  const { cliPath, cliPathBak, exePath, exePathBak, isExistExe } = getCliPath()
  if (isExistExe) {
    cpSync(exePathBak, exePath)
  } else {
    cpSync(cliPathBak, cliPath)
  }

  success('Claude Code 已恢复成英文')
}

const aiCommand = program.command('ai').description('AI 命令，详细操作请查看 ai -h').helpOption('-h, --help', '输出所有命令').helpCommand(false)
aiCommand.command('init').description('初始化 AI 模型配置').action(initAIModelConfig)
aiCommand.command('ls').description('查看当前已配置的 AI 模型').action(lsAIModel)
aiCommand.command('use <模型>').description('切换 AI 模型').action(useAIModel)
aiCommand.command('zh').description('汉化 Claude Code').action(useZH)
aiCommand.command('zh-restore').description('恢复汉化 Claude Code').action(useZHRestore)
