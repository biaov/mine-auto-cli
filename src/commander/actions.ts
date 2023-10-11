import { program } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import { execSync } from 'child_process'
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
  execSync(cmd, { cwd: process.cwd() })
  spinner.succeed(`${chalk.green(cmd)} 命令执行成功`)
  info()
}

/**
 * 简化 git 提交命令
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

/**
 * 定义顶级命令的 action
 */
export const handleArguments = (cmd: string, env?: string) => {
  /**
   * 处理 build[:环境] 命令
   */
  if (cmd.includes('build')) return simplifyBuild(cmd, env)

  /**
   * 输出错误
   */
  error(chalk.hex('#f56c6c')(`\`auto ${cmd}${env ? ` ${env}` : ''}\` 命令不存在`))
  /**
   * 显示全部命令
   */
  program.help()
}
