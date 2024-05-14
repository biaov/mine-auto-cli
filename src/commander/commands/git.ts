import { program } from 'commander'
import chalk from 'chalk'
import { success, info } from '@/utils/log'
import { execCommand } from '@/commander/common'
import { gitCmds } from '@/config/cmds'

/**
 * 简化 Git 提交命令
 */
const simplifyGit = async (desc = '更新代码') => {
  info()
  info(`${chalk.yellow('>>')} 开始依次执行命令...`)
  info()
  gitCmds(desc).forEach(execCommand)
  success('全部命令执行完成')
  info()
}

program.command('git [描述]').description('简化 Git 提交命令').action(simplifyGit)
