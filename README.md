# mine-auto-cli

一个将多个命令简化成一个命令的项目 😆

<h2 align="center">
  <a href="https://www.npmjs.com/package/mine-auto-cli"><img src="https://img.shields.io/npm/v/mine-auto-cli.svg?logo=npm" /></a>
  <a href="https://www.npmjs.com/package/mine-auto-cli"><img src="https://img.shields.io/npm/dt/mine-auto-cli?logo=Markdown" /></a>
  <a href="https://www.npmjs.com/package/mine-auto-cli"><img src="https://packagephobia.com/badge?p=mine-auto-cli" /></a>
  <a href="https://github.com/biaov/mine-auto-cli/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?logo=Unlicense" /></a>
</h2>

## 全局安装

```sh
npm i -g mine-auto-cli
```

## 使用

### 查看版本

```sh
auto -v
```

### 查看所有命令

```sh
auto -h
```

### 简化 Git 提交命令

```sh
auto git [描述]
# 等同于
git add -A
git commit -m [描述]
git push
```

### 简化打包提交命令

```sh
auto build[:环境] [描述]
# 等同于
npm run build:staging
git add -A
git commit -m [描述]
git push
```

### 技术栈

- `Vite` + `TypeScript` + `Node`

### 依赖特性

- `chalk`: 字体颜色
- `commander`: 命令
- `log-symbols`: 图标
- `ora`: 动画效果
- `update-notifier`: 检查更新
- `@types/node`: `node` 类型
- `@types/update-notifier`: `update-notifier` 类型
- `chokidar`: 监听文件更改
- `prettier`: 格式化工具
- `typescript`: 编程语言
- `vite`: 项目构建工具

## 贡献者们

[![贡献者](https://contrib.rocks/image?repo=biaov/mine-auto-cli)](https://github.com/biaov/mine-auto-cli/graphs/contributors)
