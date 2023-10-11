import { program } from 'commander'
import { version } from '@/../package.json'
import { simplifyGit, handleArguments } from './actions'

/**
 * 重置版本
 */
program.usage('[commands] [options]').version(version, '-v, --version', '输出版本号').helpOption('-h, --help', '输出所有命令')
program.command('git [描述]').description('简化 Git 提交命令').action(simplifyGit)
program.command('build[:环境] [描述]').description('简化打包提交命令')

/**
 * 定义顶级命令的参数语法
 */
program.arguments('<cmd> [env]').action((cmd: any, env: any) => {
  handleArguments(cmd, env)
})

/**
 * 处理参数
 */
process.argv.length < 3 ? program.help() : program.parse(process.argv)
