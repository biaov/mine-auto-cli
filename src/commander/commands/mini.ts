import { program } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import stringWidth from 'string-width'
import { readdirSync, statSync, mkdirSync, copyFileSync, renameSync, unlinkSync, existsSync } from 'fs'
import { resolve, join, relative, dirname, extname, basename } from 'path'
import sharp from 'sharp'
import { success, info, error } from '@/utils/log'

/**
 * 支持的图片扩展名（小写，不含点）
 */
const sourceExtensions = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff', 'tif']

/**
 * 支持的目标扩展名
 */
const targetExtensions = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff', 'tif']

interface MiniResult {
  file: string
  from: number
  to: number
  status: '压缩' | '转换' | '跳过' | '失败'
}

/**
 * 获取文件大小
 */
const getSize = (path: string) => statSync(path).size

/**
 * 格式化文件大小
 */
const formatSize = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  let size = bytes
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return `${size.toFixed(index === 0 ? 0 : 2)} ${units[index]}`
}

/**
 * 递归收集图片
 */
const collectImages = (dir: string, excludePaths: string[]): string[] => {
  return readdirSync(dir, { withFileTypes: true }).reduce((prev, item) => {
    const itemPath = join(dir, item.name)
    if (item.isDirectory()) {
      if (!excludePaths.includes(resolve(itemPath))) prev.push(...collectImages(itemPath, excludePaths))
      return prev
    }
    if (sourceExtensions.includes(extname(item.name).slice(1).toLowerCase())) prev.push(itemPath)
    return prev
  }, [] as string[])
}

/**
 * 重编码图片
 * 默认 TinyPNG 风格智能有损；lossless 为真无损（JPEG 无真正无损模式，退化为视觉无损）
 */
const compressImage = async (srcPath: string, outPath: string, extension: string, lossless: boolean) => {
  const image = sharp(srcPath)
  const metadata = await image.metadata()

  if ((metadata.pages ?? 1) > 1) return false

  const pipeline = image.rotate()
  switch (extension) {
    case 'png':
      await pipeline
        .png(lossless ? { compressionLevel: 9, adaptiveFiltering: true } : { palette: true, quality: 100, effort: 10, dither: 1, compressionLevel: 9, adaptiveFiltering: true })
        .toFile(outPath)
      break
    case 'webp':
      await pipeline.webp(lossless ? { lossless: true, effort: 6 } : { quality: 80, effort: 6 }).toFile(outPath)
      break
    case 'avif':
      await pipeline.avif(lossless ? { lossless: true, effort: 9 } : { quality: 60, effort: 9 }).toFile(outPath)
      break
    case 'tiff':
    case 'tif':
      await pipeline.tiff({ compression: 'lzw' }).toFile(outPath)
      break
    default:
      await pipeline.jpeg(lossless ? { quality: 100, mozjpeg: true, chromaSubsampling: '4:4:4' } : { quality: 80, mozjpeg: true, progressive: true, chromaSubsampling: '4:2:0' }).toFile(outPath)
  }
  return true
}

/**
 * 输出结果表格
 */
const printTable = (results: MiniResult[]) => {
  if (!results.length) return
  const rows: Record<string, string>[] = results.map(({ file, from, to, status }) => {
    const saved = status === '失败' ? '-' : `${from ? (((from - to) / from) * 100).toFixed(1) : '0.0'}%`
    return { file, from: formatSize(from), to: status === '失败' ? '-' : formatSize(to), saved, status }
  })
  const headers: Record<string, string> = { file: '文件', from: '原大小', to: '新大小', saved: '节省', status: '状态' }
  const widths = Object.keys(headers).reduce(
    (prev, key) => {
      prev[key] = Math.max(stringWidth(headers[key]), ...rows.map(row => stringWidth(row[key])))
      return prev
    },
    {} as Record<string, number>
  )

  const pad = (text: string, width: number) => text + ' '.repeat(width - stringWidth(text))
  const statusColor = (status: string) => (status === '压缩' ? chalk.green(status) : status === '转换' ? chalk.cyan(status) : status === '跳过' ? chalk.yellow(status) : chalk.red(status))

  info()
  info(chalk.bold(`${pad(headers.file, widths.file)}  ${pad(headers.from, widths.from)}  ${pad(headers.to, widths.to)}  ${pad(headers.saved, widths.saved)}  ${headers.status}`))
  info(chalk.gray('─'.repeat(widths.file + widths.from + widths.to + widths.saved + widths.status + 8)))
  rows.forEach(({ file, from, to, saved, status }) => {
    info(`${pad(file, widths.file)}  ${pad(from, widths.from)}  ${pad(to, widths.to)}  ${pad(saved, widths.saved)}  ${statusColor(status)}`)
  })
}

/**
 * 压缩图片
 */
const useMini = async (src: string, dist?: string, options?: { extension?: string; lossless?: boolean }) => {
  const inputPath = resolve(process.cwd(), src)
  if (!existsSync(inputPath) || !statSync(inputPath).isDirectory()) return error(`图片目录不存在：${inputPath}`)

  const lossless = !!options?.lossless

  const targetExtension = typeof options?.extension === 'string' ? options.extension.replace(/^\./, '').trim().toLowerCase() : ''
  if (targetExtension && !targetExtensions.includes(targetExtension)) return error(`不支持的扩展名：${targetExtension}，可选值：${targetExtensions.join(' / ')}`)

  const outputPath = resolve(process.cwd(), dist || join(inputPath, 'mini'))
  const files = collectImages(inputPath, [outputPath, resolve(inputPath, 'mini')])
  if (!files.length) return info('未找到可处理的图片')

  const spinner = ora({ text: '正在压缩图片...', color: 'yellow' }).start()
  const results: MiniResult[] = []

  for (const file of files) {
    const from = getSize(file)
    const fileRel = relative(inputPath, file)
    const outDir = join(outputPath, dirname(fileRel))
    const sourceExtension = extname(file).slice(1).toLowerCase()
    const extension = targetExtension || sourceExtension
    const isConverting = extension !== sourceExtension
    const outPath = join(outDir, `${basename(file, extname(file))}.${extension}`)
    const isSamePath = resolve(outPath) === resolve(file)
    const tempPath = `${outPath}.mini-temp`
    const resultPath = isSamePath ? tempPath : outPath

    spinner.text = `正在处理 ${chalk.cyan(fileRel)}`

    try {
      mkdirSync(outDir, { recursive: true })
      const isCompressed = await compressImage(file, resultPath, extension, lossless)

      // 格式转换时即使体积变大也保留转换结果；同格式时压缩无效则复制原图
      if (isCompressed && (isConverting || getSize(resultPath) < from)) {
        isSamePath && renameSync(tempPath, outPath)
        results.push({ file: fileRel, from, to: getSize(outPath), status: isConverting ? '转换' : '压缩' })
      } else {
        existsSync(tempPath) && unlinkSync(tempPath)
        if (isCompressed || isSamePath) {
          results.push({ file: fileRel, from, to: from, status: '跳过' })
        } else {
          // 动图等无法重编码的文件，保持原样输出
          const keepPath = isConverting ? join(outDir, basename(file)) : outPath
          resolve(keepPath) !== resolve(file) && copyFileSync(file, keepPath)
          results.push({ file: fileRel, from, to: from, status: '跳过' })
        }
      }
    } catch (e: any) {
      existsSync(tempPath) && unlinkSync(tempPath)
      results.push({ file: fileRel, from, to: 0, status: '失败' })
      spinner.stop()
      error(`${fileRel} 处理失败：${e?.message || e}`)
      spinner.start()
    }
  }

  spinner.stop()
  printTable(results)

  const compressed = results.filter(({ status }) => status === '压缩')
  const converted = results.filter(({ status }) => status === '转换')
  const skipped = results.filter(({ status }) => status === '跳过')
  const failed = results.filter(({ status }) => status === '失败')
  const fromTotal = results.reduce((prev, { from }) => prev + from, 0)
  const toTotal = results.reduce((prev, { from, to, status }) => prev + (status === '失败' ? from : to), 0)
  const saved = fromTotal ? (((fromTotal - toTotal) / fromTotal) * 100).toFixed(1) : '0.0'

  info()
  success(`共 ${results.length} 张图片，压缩 ${compressed.length} 张，转换 ${converted.length} 张，跳过 ${skipped.length} 张，失败 ${failed.length} 张`)
  info(`${chalk.gray('模式')}  ${lossless ? '无损' : '智能有损（TinyPNG 风格）'}`)
  info(`${chalk.gray('总计')}  ${formatSize(fromTotal)} ${chalk.gray('→')} ${formatSize(toTotal)}  ${chalk.green(`节省 ${saved}%`)}`)
  info(chalk.green(`输出目录  ${outputPath}`))
}

program
  .command('mini <图片目录> [输出目录]')
  .option('-e, --extension [扩展名]', '目标扩展名，如 png / jpg / webp / avif / tiff，默认保持原格式', '')
  .option('--lossless', '使用无损压缩（体积更大，画质完全不变）', false)
  .description('压缩图片（默认 TinyPNG 风格智能有损，支持格式转换）')
  .action(useMini)
