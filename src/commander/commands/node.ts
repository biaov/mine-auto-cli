import { program } from 'commander'
import { execSync } from 'child_process'
import { parseRange } from 'semver-utils'
import type { SemVer } from 'semver-utils'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { success, info } from '@/utils/log'

interface Option {
  install: boolean
}

/**
 * 深度查找
 */
const findDeep = (field: string, base: Record<string, string | undefined>, item: SemVer): boolean | undefined => {
  const values = Object.entries(base)
  const index = values.findIndex(([key]) => field === key)
  const [key, value] = values[index]

  if (value) {
    if (item[key as keyof SemVer] === value) return index === values.length - 1 ? true : findDeep(values[index + 1][0], base, item)
  } else {
    return true
  }
}

/**
 * 切换 node
 */
const switchNode = (version?: string) => {
  if (!version) return
  execSync(`nvm use ${version}`)
  info()
  success(`切换成功 当前版本：${version}`)
  info()
}

/**
 * 安装 node
 */
const installNode = (version?: string) => {
  if (!version) return
  execSync(`nvm install ${version}`)
}

/**
 * 切换 node 版本
 */
export const simplifyNodeSwitch = (version: string, option: Option) => {
  const res = execSync('nvm ls').toString()
  const allVersion = parseRange(res)
  const [{ major, minor, patch }] = parseRange(version)
  const similarVersion: SemVer[] = []
  const item = allVersion.find(item => {
    if (item.major === major) {
      similarVersion.push(item)
      return findDeep('minor', { minor, patch }, item)
    }
  })
  if (item) {
    switchNode(item.semver)
  } else {
    info()
    info(chalk.red(`输入的版本 ${version} 不存在`))
    info()
    if (similarVersion.length) {
      const options = similarVersion.map(item => item.semver as string)
      inquirer
        .prompt({
          type: 'list',
          name: 'preset',
          message: `请选择相似版本或输入版本进行安装:`,
          choices: [...options, version, '取消']
        })
        .then(({ preset }) => {
          if (preset === '取消') return
          if (preset === version) {
            if (!patch) return
            installNode(preset)
          } else {
            switchNode(preset)
          }
        })
    } else {
      if (!patch) return
      if (option.install) {
        installNode(version)
        return
      }
      inquirer
        .prompt({
          type: 'confirm',
          name: 'isInstall',
          message: `是否安装 ${version}？`
        })
        .then(({ isInstall }) => {
          isInstall && installNode(version)
        })
    }
  }
}

program.command('node [版本号]').option('-i, --install', `是否安装此版本`, false).description('切换 node 版本，默认选择第一个版本').action(simplifyNodeSwitch)
