import { writeFileSync, copyFileSync, existsSync, readdirSync, mkdirSync, statSync, unlinkSync } from 'fs'
import { join } from 'path'
import { resetPath } from './path.js'
import packageJson from '../package.json' assert { type: 'json' }

/**
 * 重写 package.json
 */
export const rewritePackage = () => {
  /**
   * 重置输出目录
   */
  const output = resetPath('@/dist')
  !existsSync(output) && mkdirSync(output)

  packageJson.devDependencies = packageJson.scripts = {}
  /**
   * 写入最新的
   */
  writeFileSync(resetPath('@/dist/package.json'), JSON.stringify(packageJson, null, 2))
}

/**
 * 拷贝目录
 */
const copyDirectory = (source, destination) => {
  const stat = statSync(source)
  if (stat.isFile()) {
    /**
     * 复制文件
     */
    existsSync(destination) && unlinkSync(destination)
    copyFileSync(source, destination)
  } else if (stat.isDirectory()) {
    /**
     * 创建目录
     */
    !existsSync(destination) && mkdirSync(destination)

    /**
     * 原有目录
     */
    const directory = readdirSync(source)
    directory.forEach(file => {
      copyDirectory(join(source, file), join(destination, file))
    })
  }
}

/**
 * 复制资源
 */
export const copyAssets = () => {
  /**
   * 根目录需要复制的文件和目录
   */
  const filePaths = ['bin', 'README.md', 'LICENSE']
  filePaths.forEach(path => {
    copyDirectory(resetPath(`@/${path}`), resetPath(`@/dist/${path}`))
  })
}
