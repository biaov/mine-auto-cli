/**
 * git 命令集合
 */
export const gitCmds = (desc: string) => ['git add -A', `git commit -m ${desc}`, 'git push']

/**
 * 打包的命令
 */
export const buildCmds = (suffix: string, desc: string) => [`npm run ${suffix}`, 'git add -A', `git commit -m ${desc}`, 'git push']
