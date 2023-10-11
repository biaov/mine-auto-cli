/**
 * 默认的模板地址，也可以配置其它模板地址
 */
const defaultTemplateUrl = 'https://gitee.com/biaovorg/project-template.git'

/**
 * 模板下载地址
 */
export const templateUrls = {
  vue: defaultTemplateUrl,
  react: defaultTemplateUrl,
  'uni-app': defaultTemplateUrl,
  electron: defaultTemplateUrl,
  node: defaultTemplateUrl,
  'node-simple': defaultTemplateUrl
}

/**
 * 工具对应命令
 */
export const toolCommands = {
  npm: {
    install: 'npm i',
    start: 'npm start'
  },
  cnpm: {
    install: 'cnpm i',
    start: 'cnpm start'
  },
  pnpm: {
    install: 'pnpm i',
    start: 'pnpm start'
  },
  yarn: {
    install: 'yarn',
    start: 'yarn start'
  }
}
