import { program } from 'commander'
import { version } from '@/../package.json'
import { simplifyGit, handleArguments } from './actions'
import { simplifyMkdir } from './mkdir'

/**
 * 重置版本
 */
program.usage('[commands] [options]').version(version, '-v, --version', '输出版本号').helpOption('-h, --help', '输出所有命令')
program.command('git [描述]').description('简化 Git 提交命令').action(simplifyGit)
program.command('build[:环境] [描述]').description('简化打包提交命令')
program.command('version<[++]|[@<版本号>]>').description('例如：version++ 或者 version@1.0.0；自动更新 package.json 版本号，自动更新 `README.md` 中的 `version-v<version>-blue` 图标版本')
program.command('mkdir').option('-l, --line [数量]', '数量', false).option('-n, --name [文件名称]', '文件名称', false).description('生成目录结构文件').action(simplifyMkdir)

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
