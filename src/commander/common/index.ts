import chalk from 'chalk'
import ora from 'ora'
import { execSync } from 'child_process'
import { info } from '@/utils/log'

/**
 * 执行命令
 */
export const execCommand = (cmd: string) => {
  info(`开始执行 ${chalk.cyanBright(cmd)} 命令`)
  const spinner = ora({ text: '正在执行命令中...', color: 'yellow' })
  spinner.start()
  const childProcess = execSync(cmd, { cwd: process.cwd() })
  info(childProcess.toString())
  spinner.succeed(`${chalk.green(cmd)} 命令执行成功`)
  info()
}
