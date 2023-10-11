/// <reference path="./module.d.ts" />

import updateNotifier from 'update-notifier'
import chalk from 'chalk'
import pkg from '../package.json'
import './commander' // 命令

const notifier = updateNotifier({ pkg })

if (notifier.update && notifier.update.latest !== pkg.version) {
  let msg = ''
  switch (notifier.update.type) {
    case 'major':
      msg = chalk.red('{latestVersion}')
      break
    case 'minor':
      msg = chalk.yellow('{latestVersion}')
      break
    default:
      msg = chalk.green('{latestVersion}')
      break
  }
  const compareUrl = `https://github.com/biaov/${pkg.name}/compare/v${pkg.version}...v{latestVersion}`
  notifier.notify({
    defer: false,
    isGlobal: true,
    message: `有更新 ${chalk.dim('{currentVersion}')}${chalk.reset(' → ')}${msg}\n运行 ${chalk.cyan('{updateCommand}')} 命令更新\n${chalk.dim.underline(compareUrl)}`
  })
}
