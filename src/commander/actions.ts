import { program } from 'commander'
import inquirer from 'inquirer'
import chalk from 'chalk'
import ora from 'ora'
import { execSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { exec } from 'child_process'
import log from '@/utils/log'
import { templateUrls, templateNames, installTools, toolCommands } from '@/config'
import { SavePresetInfo, GetPresetInfo, FormatePreset } from '@/utils/functions'
import { version } from '@/../package.json'
import { PresetInfo, Template } from './types'
import { gitCmds } from './cmds'

const { iconError, iconSuccess, success, info, error, warning } = log

/**
 * 简化 git 提交命令
 */
export const SimpleGit = async (desc = '更新代码') => {
  info()
  info(`${chalk.yellow('>>')} 开始依次执行命令...`)
  info()
  // 执行命令
  gitCmds.forEach(cmd => {
    info(`开始执行 ${chalk.cyanBright(cmd)} 命令`)
    const spinner = ora({ text: '正在执行命令中...', color: 'yellow' })
    spinner.start()
    cmd.includes('-m') && (cmd += ` ${desc}`)
    execSync(cmd, { cwd: process.cwd() })
    spinner.succeed(`${chalk.green(cmd)} 命令执行成功`)
    info()
  })
  success('全部命令执行完成')
  info()
}

/**
 * 定义顶级命令的 action
 */
export const Arguments = (cmd: any, env: any) => {
  /**
   * 输出错误
   */
  error(`\`auto ${cmd}${env ? ` ${env}` : ''}\` 命令不存在`)
  /**
   * 显示全部命令
   */
  program.help()
}
