# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

`node-switch` 是一个基于 `nvm` 切换 Node.js 版本的 CLI 工具。发布名为 `ns`，本质上是对 `nvm ls` / `nvm use` 的一个薄封装：读取目标版本号，解析 `nvm ls` 输出找到匹配的已安装版本，再执行 `nvm use`。

## 命令

- 运行（本地直接执行）：`node bin/node-switch.js <version>`，`<version>` 支持 `18` / `18.17` / `18.17.1` 三种粒度。
- 运行（安装后）：`npm i -g .` 之后使用 `ns <version>`。
- 依赖 `nvm` 已安装且 `nvm` 命令在 PATH 中，否则工具无法工作。
- 项目没有 build / lint / test 脚本（`package.json` 的 `scripts` 为空），也没有依赖项。

## 架构

- 这是一个纯 ESM 项目（`package.json` 里 `"type": "module"`），零依赖、零构建步骤。
- `dist/index.js` 是**唯一**的源码文件，同时也是 `package.json` 中 `exports` / `main` 指向的发布入口——没有 `src/` 目录，改动直接落在 `dist/index.js`。
- `bin/node-switch.js` 只有三行：`#!/usr/bin/env node` 的 shebang + `import '../dist/index.js'`，是 CLI 命令 `ns` 的入口封装。
- 版本匹配逻辑（`dist/index.js` 的 `main()`）：
  - 从 `process.argv[2]` 读取版本号，按 `.` 拆成 major/minor/patch 三段，缺失的段（如 `18` 或 `18.17`）表示宽松匹配。
  - 解析 `nvm ls` 输出：逐行 `trim`，含 `*` 的行（当前激活版本）取其空格分割后的第二段，其余行直接作为版本号。
  - 用 `list.find` 匹配第一个满足粒度的版本，未命中时打印 `${version} 不存在` 并退出。
  - 命中后执行 `execSync(\`nvm use ${target}\`)` 并打印 `${target} 已切换`。
- 发布信息：npm registry 为官方源，启用 `provenance`；仓库为 GitHub 上的 `biaov/mine-auto-cli`（本目录是其下 `node-switch` 子项目）。
