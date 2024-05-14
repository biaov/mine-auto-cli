import { program } from 'commander'
import { existsSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import chalk from 'chalk'
import { success, info } from '@/utils/log'
import { getDefaultConfigFile } from '@/utils/functions'
import { autoCliName } from '@/config'

/**
 * 初始化配置文件
 */
const simplifyInit = ({ yml, uncomment, force }: Record<string, boolean>) => {
  info()
  const fileName = autoCliName(yml ? 'yml' : 'jsonc')
  const filePath = resolve(process.cwd(), fileName)

  if (existsSync(filePath) && !force) {
    info(chalk.yellow(`${fileName} 文件已存在`))
    info()
    info(chalk.yellow(`文件目录  ${filePath}`))
    return
  }
  writeFileSync(filePath, getDefaultConfigFile(fileName, uncomment))
  success(`${fileName} 文件创建成功`)
  info()
  info(chalk.green(`文件目录  ${filePath}`))
}

program
  .command('init')
  .option('-f, --force', `强制替换 ${autoCliName()} 文件内容`, false)
  .option('-unc, --uncomment', `取消生成 ${autoCliName()} 带注释`, false)
  .option('-y, --yml', `生成 ${autoCliName('yml')} 文件`, false)
  .description('初始化配置文件')
  .action(simplifyInit)
