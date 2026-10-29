import { program } from 'commander'
import { version } from '~/package.json'
import { handleArguments } from './actions'
import './commands'

/**
 * 重置版本
 */
program.usage('[commands] [options]').version(version, '-v, --version', '输出版本号').helpOption('-h, --help', '输出所有命令')
program.command('build[:环境] [描述]').description('简化打包提交命令')
program.command('version<[++]|[@<版本号>]>').description('例如：version++ 或者 version@1.0.0；自动更新 package.json 版本号，自动更新 `README.md` 中的 `version-v<version>-blue` 图标版本')

import stringWidth from 'string-width'
import { Help } from 'commander'

class ChineseHelp extends Help {
  // 核心：重写宽度计算，使用终端可视宽度（中文字符按 2 列计算）
  displayWidth(str: string) {
    return stringWidth(str)
  }
}

program.createHelp = () => new ChineseHelp()

program.configureHelp({
  // helpWidth: 1000, // 整行总宽度，根据你的终端调整
  sortSubcommands: false // 不自动排序，保持你定义顺序
})

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
