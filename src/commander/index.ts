import { program } from 'commander'
import { version } from '@/../package.json'
import { SimpleGit, Arguments } from './actions'

/**
 * 重置版本
 */
program.usage('[commands] [options]').version(version, '-v, --version', '输出版本号').helpOption('-h, --help', '输出所有命令')

/**
 * 定义命令
 * 简化 git 提交命令
 */
program.command('auto git [desc]').description('简化 git 提交命令').action(SimpleGit)

/**
 * 定义顶级命令的参数语法
 */
program.arguments('<cmd> [env]').action(Arguments)
if (process.argv.length < 3) {
  // Create()
  console.log(process.argv, '--process.argv')
} else {
  /**
   * 处理参数
   */
  program.parse(process.argv)
}
// process.argv.length < 3 && program.help() // 如果后序没有输入命令，执行帮助指令
// program.parse(process.argv) // 处理参数
