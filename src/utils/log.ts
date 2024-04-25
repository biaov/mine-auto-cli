import chalk from 'chalk'
import logSymbols from 'log-symbols'
import { name } from '~/package.json'

/**
 * 成功日志
 */
export const success = (text?: string | number) => {
  console.log(`${logSymbols.success} ${chalk.green('SUCCESS')} ${text}`)
}

/**
 * 失败日志
 */
export const error = (text?: string | number) => {
  console.log(`${name} ${logSymbols.error} ${chalk.red('ERROR')} ${text}`)
}

/**
 * 信息日志
 */
export const info = (text?: string | number) => {
  console.log(text ?? '')
}
