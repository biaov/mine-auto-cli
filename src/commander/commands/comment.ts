import { program } from 'commander'
import { readFileSync, existsSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import chalk from 'chalk'
import { success, error, info } from '@/utils/log'
import { getAutoCliConfig } from '@/utils/functions'

const userConfig = getAutoCliConfig()
const comitName = 'comment.md'
const jsonFiles = ['package.json', comitName]
const [packagePath, commentMdPath] = jsonFiles.map(name => resolve(process.cwd(), name))

/**
 * 升级
 */
const simplifyCommit = () => {
  if (!existsSync(packagePath)) return error('package.json 文件不存在')

  const packageJsonString = readFileSync(packagePath).toString()
  const packageJson: Record<string, any> = JSON.parse(packageJsonString)
  const keys = ['dependencies', 'devDependencies', 'optionalDependencies']
  let commentContent = '### 依赖解析\n\n'

  keys.forEach(key => {
    if (!packageJson[key]) return
    commentContent += `#### ${key}\n\n`
    Object.keys(packageJson[key]).forEach(name => {
      commentContent += `- \`${name}\`: ${userConfig.comment[name] || ''}\n`
    })
    commentContent += '\n'
  })
  commentContent = commentContent.slice(0, -1)

  writeFileSync(commentMdPath, commentContent)
  info()
  success(`${comitName} 文件创建成功`)
  info()
  info(chalk.green(`文件目录  ${commentMdPath}`))
}

program.command('comment').description('生成依赖注释文件').action(simplifyCommit)
