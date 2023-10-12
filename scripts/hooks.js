import { writeFileSync, copyFileSync, existsSync, readdirSync, mkdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { resetPath } from './path.js'

const pkg = JSON.parse(readFileSync(resetPath('@/package.json')))
const packageJson = pkg

/**
 * 重写 package.json
 */
export const rewritePackage = () => {
  packageJson.devDependencies = packageJson.scripts = {}
  /**
   * 写入最新的
   */
  writeFileSync(resetPath('@/dist/package.json'), JSON.stringify(packageJson, null, 2))
}

/**
 * 复制资源
 */
export const copyAssets = () => {
  /**
   * 根目录需要复制文件夹
   */
  const needDirs = ['bin']
  /**
   * 根目录需要复制的文件
   */
  const filePaths = ['README.md', 'LICENSE']
  /**
   * 根目录
   */
  const inputDir = resetPath('@')
  /**
   * 输出目录
   */
  const outputDir = resetPath('@/dist')

  !existsSync(outputDir) && mkdirSync(outputDir)
  needDirs.forEach(dir => {
    const dirPath = resetPath(`@/${dir}`)
    /**
     * 创建目录
     */
    mkdirSync(join(outputDir, dir))
    readdirSync(dirPath).forEach(file => {
      filePaths.push(`${dir}/${file}`)
    })
  })

  filePaths.forEach(path => {
    copyFileSync(join(inputDir, path), join(outputDir, path))
  })
}
