import chalk from 'chalk'
import { success, info } from '@/utils/log'
import { execCommand } from '@/commander/common'
import { buildCmds } from '@/config/cmds'

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
