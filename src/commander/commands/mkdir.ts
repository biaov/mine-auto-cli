import { program } from 'commander'
import { readdirSync, writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import type { MkdirTree } from '@/types'

const topIgnore = ['dist', 'node_modules', '.git', 'miniprogram_npm']

/**
 * 最大值
 */
let maxLength = 0
/**
 * 是否计算了最大值
 */
let isMax = false
/**
 * 是否有横线
 */
let hasLine = false
/**
 * 初始化横线数量
 */
let initLine = 20

/**
 * 获取 suffix
 */
const getItemText = ({ prev, i, index, arr, curText }: Record<string, any>) => {
  const prefix = Array.from({ length: i }).reduce(prev => prev + `${i === 1 && index === arr.length - 1 ? '└ ' : '│ '}   `, '') as string
  const newPrev = prev + prefix
  const curLen = (prefix + curText).length
  const suffix = Array.from({ length: initLine + maxLength - curLen }).reduce(prev => `${prev}-`, ' ')
  !isMax && (maxLength = Math.max(maxLength, curLen))
  return `${newPrev}${curText}${hasLine ? suffix : ''}\n`
}
/**
 * 获取文本
 */
const getText = (tree: MkdirTree[], i = 0): string =>
  tree.reduce((prev, item, index, arr) => {
    let curText
    if (item.children) {
      curText = `├── ${item.name}`
      return getItemText({ prev, i, index, arr, curText }) + getText(item.children, i + 1)
    } else {
      curText = `${index === arr.length - 1 ? '└── ' : '├── '}${item.name}`
      return getItemText({ prev, i, index, arr, curText })
    }
  }, '')

/**
 * 排序，文件夹在文件的前面
 */
const sort = (path: string) => readdirSync(path, { withFileTypes: true }).sort((a, b) => +b.isDirectory() - +a.isDirectory())

/**
 * 简化 mkdir 操作
 */
export const simplifyMkdir = ({ line, name }: Record<string, string | boolean>) => {
  hasLine = !!line
  typeof line === 'string' && (initLine = +line)

  const rootDir = process.cwd()

  const gitignorePath = join(rootDir, '.gitignore')
  if (existsSync(gitignorePath)) {
    const ignoreFile = readFileSync(gitignorePath).toString().split('\r\n')
    topIgnore.push(...ignoreFile)
  }
  const rootName = rootDir.split('\\').at(-1)!
  const dirs = sort(rootDir)
  const children = dirs.map(dir => {
    const { name } = dir
    const item: MkdirTree = { name }
    !topIgnore.includes(name) && dir.isDirectory() && (item.children = sort(join(dir.path, name)).map(({ name }) => ({ name })))
    return item
  })

  const tree: MkdirTree[] = [{ name: rootName, children }]

  if (hasLine) {
    getText(tree)
    isMax = true
  }
  writeFileSync(join(rootDir, `${(typeof name === 'string' && name) || 'directory'}.md`), getText(tree))
}

program
  .command('mkdir')
  .option('-l, --line [数量]', '数量', false)
  .option('-n, --name [文件名称]', '文件名称', false)
  .option('-d, --depth [深度值]', '深度值', '3')
  .description('生成目录结构文件')
  .action(simplifyMkdir)
