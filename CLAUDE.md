# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

`mine-auto-cli` 是一个通过 `auto` 命令将多个常用命令简化成一个命令的 CLI 工具。使用 Vite + TypeScript + Commander.js 构建，目标环境 Node.js 24.x，ESM 模块。

## 常用命令

```sh
npm run build          # 构建生产版本
npm run dev            # 开发模式（watch 构建）
npm run prettier       # 格式化代码
node scripts/tag       # 创建并推送 git tag（版本号取自 package.json）
```

没有测试套件。

## 构建产物与发布

Vite 构建输出到 `dist/dist/`，然后自定义 Rollup 插件 (`scripts/rollup-plugin-copy.ts`) 做后处理：
1. **重写 package.json**：剥离 `devDependencies` 和 `scripts`，写入 `dist/package.json`
2. **复制资源文件**：将 `bin/`、`README.md`、`LICENSE`、`auto-cli.jsonc`、`ai.jsonc` 复制到 `dist/`

最终发布的 npm 包是 `dist/` 目录（而非仓库根目录）。CI 在推送 `v*` 标签时触发，使用 Node 24.x 构建并发布到 npmjs.org（beta 版本以 `--tag=beta` 发布）。

## 架构

### 入口与启动

- `bin/mine-auto-cli.js` → `dist/index.js`（构建后）
- `src/index.ts` 是整个应用的入口，仅做两件事：导入 `./commander`（注册所有 CLI 命令）和 `./update`（启动更新通知检查）

### 命令注册（副作用模式）

每个命令文件在导入时即通过 `program.command()` 自行注册到 Commander 的全局 `program` 实例，无需手动组装。

- `src/commander/index.ts` — 创建 `program` 实例，设置版本/帮助选项，导入 `./commands`（触发所有子命令注册），定义顶级 `build[:env]` 和 `version[++|@<ver>]` 的参数语法
- `src/commander/actions.ts` — 顶级命令的 action 处理：将 `build*` 路由到 `simplifyBuild`，`version*` 路由到 `simplifyVersion`，其余报错
- `src/commander/commands/index.ts` — 导入所有子命令文件以触发注册
- `src/commander/commands/*.ts` — 每个文件注册一个命令：`init`、`git`、`check`、`comment`、`mkdir`、`vscode`、`node`、`ai`（`ai` 是带有自己子命令的命令组）

### 配置系统

项目配置从工作目录的 `auto-cli.jsonc` 或 `auto-cli.yml` 加载（JSONC 优先于 YAML，两者合并到 `auto-cli.jsonc` 中的默认值上）。配置字段：

| 字段 | 说明 |
|------|------|
| `prefix` | 版本前缀，默认 `^` |
| `registry` | npm 镜像源，默认 `https://registry.npmmirror.com/` |
| `check` | 为 `true` 时 `auto check` 默认更新 package.json |
| `reject` | 跳过检查的依赖名列表 |
| `resolve` | 指定特定包使用非 `latest` 标签检查（如 `mine-auto-cli@beta`） |
| `comment` | `auto comment` 生成依赖注释时的预设说明 |

### AI 命令与 Claude Code 汉化

`auto ai` 是一个命令组，管理 Claude Code 的模型配置和汉化：

- **模型切换**：读取 `~/.claude/settings.json` 的环境变量，与 `~/.ai-model.json`（从 `src/config/ai.jsonc` 初始化）中存储的模型配置进行匹配和切换
- **汉化（`auto ai zh`）**：支持 JS 文件和 EXE 文件两种路径：
  - **JS 路径**：正则替换 Claude Code 全局安装的 `cli.js` 中的英文字符串
  - **EXE 路径**（检测到 `.exe` 文件时）：直接操作二进制 buffer，将英文 UTF-8 字符串替换为中文，多余字节填充 `0x20`
  - 汉化前自动备份原文件（`.bak.js` / `.bak.exe`），恢复命令 (`auto ai zh-restore`) 从备份还原
  - 关键词映射位于 `src/config/keyword.ts`（JS 版）和 `src/config/keyword-latest.ts`（EXE 版）

### 日志工具

`src/utils/log.ts` 提供三个统一的日志函数：`success`、`error`、`info`，其中 `error` 会加上项目名前缀。

### 路径别名

- `@/` → `src/`
- `~/` → 仓库根目录
