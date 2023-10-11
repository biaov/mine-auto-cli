import chalk from 'chalk'
import logSymbols from 'log-symbols' // 显示出 √ 或 × 等的图标
import { LogAags } from './types'
import { name } from '@/../package.json'

const log: Record<string, any> = {}

/**
 * 管理命令 log 颜色
 */
const logTypes: Array<Record<string, any>> = [
  {
    name: 'success',
    color: chalk.green
  },
  {
    name: 'error',
    color: chalk.red,
    prefix: name
  },
  {
    name: 'warning',
    color: chalk.red
  },
  {
    name: 'info'
  }
]

/**
 * 循环遍历
 */
logTypes.forEach(({ name: logName, color, prefix = '' }: Record<string, any>): void => {
  log[logName] = (text: string | LogAags = ''): void => {
    /**
     * 是否为对象
     */
    if (typeof text === 'object') {
      const { text: content = '', prefix: prefixTxt = '' } = text
      content && console.log(`${prefixTxt + ' '}${text}`)
    } else if (color) {
      /**
       * 是否有颜色
       */
      console.log(`${prefix + ' '}${color(logName.toUpperCase())} ${text}`)
    } else {
      console.log(text)
    }
  }
})
log.iconError = logSymbols.error
log.iconSuccess = logSymbols.success

export default log
