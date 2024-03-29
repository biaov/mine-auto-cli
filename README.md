# mine-auto-cli

一个将多个命令简化成一个命令的项目 😆

<h2 align="center">
  <a href="https://www.npmjs.com/package/mine-auto-cli"><img src="https://img.shields.io/npm/v/mine-auto-cli.svg?logo=npm" alt="版本" /></a>
  <a href="https://www.npmjs.com/package/mine-auto-cli"><img src="https://img.shields.io/npm/dt/mine-auto-cli?logo=Markdown" alt="下载量" /></a>
  <a href="https://www.npmjs.com/package/mine-auto-cli"><img src="https://packagephobia.com/badge?p=mine-auto-cli" alt="安装大小" /></a>
  <a href="https://github.com/biaov/mine-auto-cli/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green?logo=Unlicense" alt="版权" /></a>
</h2>

## 特性

- [x] [简化 `Git` 提交命令](#简化-git-提交命令)
- [x] [简化打包提交命令](#简化打包提交命令)
- [x] [简化手动更改版本号命令](#简化手动更改版本号命令)
- [x] [生成工作目录结构文件](#生成工作目录结构文件)

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

### 简化手动更改版本号命令

```sh
# 版本号自增
auto version++
# 或者指定具体的版本号
auto version@1.0.0
```

### 生成工作目录结构文件

- 可以在工作目录生成 `directory.md` 文件

```sh
auto mkdir
```

- `directory.md`

```MD
├── mine-auto-cli
│    ├── src
│    │    └── commander
└    └── README.md
```

- 通过 `-l, --line` 生成的结构文件带横线，默认数量为 `20`
- 通过 `-n, --name` 自定义生成的结构文件名称，默认名称为 `directory`

```sh
auto mkdir -l 10 -n demo
```

- `demo.md`

```MD
├── mine-auto-cli  ----------------------
│    ├── src  ---------------------------
│    │    └── commander -----------------
└    └── README.md ----------------------
```

### 技术栈

- `Vite` + `TypeScript` + `Node`

### 依赖特性

#### dependencies

- `chalk`: 字体颜色
- `commander`: 命令
- `log-symbols`: 图标
- `ora`: 动画效果
- `update-notifier`: 检查更新

#### devDependencies

- `@types/node`: `node` 类型
- `@types/update-notifier`: `update-notifier` 类型
- `prettier`: 格式化工具
- `typescript`: 编程语言
- `vite`: 项目构建工具

## 贡献者们

[![贡献者](https://contrib.rocks/image?repo=biaov/mine-auto-cli)](https://github.com/biaov/mine-auto-cli/graphs/contributors)
