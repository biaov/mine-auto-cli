import { execSync } from 'child_process'

const main = () => {
  console.log()
  const version = process.argv[2]
  if (!version) return
  const ls = execSync(`nvm ls`).toString().trim()
  const list = ls.split('\n').map(item => {
    const ver = item.trim()
    if (!ver.includes('*')) return ver
    return ver.split(' ')[1]
  })
  const [major, minor, patch] = version.split('.')
  const target = list.find(item => {
    const [majorVer, minorVer, patchVer] = item.split('.')
    const isMajor = majorVer === major
    const isMinor = minorVer === minor
    const isPatch = patchVer === patch
    if (!minor) return isMajor
    if (!patch) return isMajor && isMinor
    return isMajor && isMinor && isPatch
  })
  if (!target) {
    console.log(`${version} 不存在`)
    return
  }
  execSync(`nvm use ${target}`)
  execSync(`node -v`).toString().trim()
  console.log(`${target} 已切换`)
}

main()
