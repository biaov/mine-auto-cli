import { program } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import log from '@/utils/log'
import { gitCmds, buildCmds } from './cmds'

const { success, info, error } = log

/**
 * 执行命令
 */
const execCommand = (cmd: string) => {
  info(`开始执行 ${chalk.cyanBright(cmd)} 命令`)
  const spinner = ora({ text: '正在执行命令中...', color: 'yellow' })
  spinner.start()
  const childProcess = execSync(cmd, { cwd: process.cwd() })
  info(childProcess.toString())
  spinner.succeed(`${chalk.green(cmd)} 命令执行成功`)
  info()
}

/**
 * 简化 Git 提交命令
 */
export const simplifyGit = async (desc = '更新代码') => {
  info()
  info(`${chalk.yellow('>>')} 开始依次执行命令...`)
  info()
  gitCmds(desc).forEach(execCommand)
  success('全部命令执行完成')
  info()
}

/**
 * 简化打包提交命令
 */
export const simplifyBuild = async (cmd: string, desc = '打包') => {
  info()
  info(`${chalk.yellow('>>')} 开始依次执行命令...`)
  info()
  buildCmds(cmd, desc).map(execCommand)
  success('全部命令执行完成')
  info()
}

const errorTips = (cmd: string) => {
  info()
  error(`\`${cmd}\` 命令错误，请检查你的命令`)
  info()
  program.help()
}

/**
 * 更新版本号
 */
const updateVersion = (customVersion: string) => {
  const fileList: Record<string, string>[] = ['package.json', 'README.md'].map(name => {
    const path = join(process.cwd(), name)
    const content = readFileSync(path).toString()
    return { path, content }
  })
  const [packageJsonItem, readmeItem] = fileList
  const packageJson = JSON.parse(packageJsonItem.content)

  // 修改 package.json
  if (customVersion) {
    packageJson.version = customVersion
  } else {
    const newVersion = packageJson.version.split('.').reduce((prev: string, item: string, i: number, arr: string[]) => prev + (i === arr.length - 1 ? +item + 1 : `${item}.`), '')
    packageJson.version = newVersion
  }
  writeFileSync(packageJsonItem.path, JSON.stringify(packageJson, null, 2))

  // 修改 README.md
  readmeItem.content = readmeItem.content.replace(/version\-v.+\-blue/, () => `version-v${packageJson.version}-blue`)
  writeFileSync(readmeItem.path, readmeItem.content)
}

/**
 * 简化手动修改版本号命令
 */
export const simplifyVersion = async (cmd: string) => {
  const arg = cmd.split('version')[1]
  if (!arg) return errorTips(cmd)

  const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'))
  if (arg === '++') {
    const newVersion = packageJson.version.split('.').reduce((prev: string, item: string, i: number, arr: string[]) => prev + (i === arr.length - 1 ? +item + 1 : `${item}.`), '')
    updateVersion(newVersion)
    info()
    success('命令执行完成')
    return
  }
  const customVersion = arg.split('@')[1]
  if (customVersion) {
    updateVersion(customVersion)
    info()
    success('命令执行完成')
  } else {
    errorTips(cmd)
  }
}

/**
 * 定义顶级命令的 action
 */
export const handleArguments = (cmd: string, env?: string) => {
  /**
   * 处理 build[:环境] 命令
   */
  if (cmd.includes('build')) return simplifyBuild(cmd, env)

  /**
   * 处理 version[++][@<版本> 命令
   */
  if (cmd.includes('version')) return simplifyVersion(cmd)

  /**
   * 输出错误
   */
  error(chalk.hex('#f56c6c')(`\`auto ${cmd}${env ? ` ${env}` : ''}\` 命令不存在`))
  /**
   * 显示全部命令
   */
  program.help()
}
