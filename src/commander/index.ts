import { Command, Help, program } from 'commander'
import stringWidth from 'string-width'
import { version } from '~/package.json'
import { handleArguments } from './actions'
import './commands'

/**
 * 重置版本
 */
program.usage('[commands] [options]').version(version, '-v, --version', '输出版本号')
program.command('build[:环境] [描述]').description('简化打包提交命令')
program.command('version<[++]|[@<版本号>]>').description('例如：version++ 或者 version@1.0.0；自动更新 package.json 版本号，自动更新 `README.md` 中的 `version-v<version>-blue` 图标版本')

class ChineseHelp extends Help {
  // 核心：重写宽度计算，使用终端可视宽度（中文字符按 2 列计算）
  displayWidth(str: string) {
    return stringWidth(str)
  }
  // 新增：每条item后面多加换行，拉开上下间距
  formatItem(term: string, termWidth: number, description: string, helper: Help): string {
    // 调用父类原生排版
    const line = super.formatItem(term, termWidth, description, helper)
    // 追加换行，拉开条目间距
    return line + '\n'
  }
}

/**
 * 统一所有命令（含子命令）的帮助输出格式
 */
Command.prototype.createHelp = function (this: Command) {
  return Object.assign(new ChineseHelp(), this.configureHelp())
}

/**
 * 统一所有命令（含子命令）的帮助选项文案
 */
const configureHelpOption = (cmd: Command) => {
  cmd.helpOption('-h, --help', '输出帮助信息')
  cmd.commands.forEach(configureHelpOption)
}
configureHelpOption(program)

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
