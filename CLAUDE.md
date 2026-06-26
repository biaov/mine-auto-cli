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

最终发布的 npm 包是 `dist/` 目录（而非仓库根目录）。

Vite 构建细节：

- `scripts/external.ts` 自动从 `package.json` 的 `dependencies` 提取外部依赖列表，所有运行时依赖（加上 Node 内置模块 `path`/`child_process`/`fs`/`os`）不会被打包进 bundle
- 构建 target 为 `node20`（虽然 `engines` 要求 `>=24.x`）
- `.env` 中的 `VITE_VSCODE_GIT_URL` 在构建时通过 `import.meta.env` 注入，指向 vscode 配置模板的 Git 仓库地址

### CI/CD

两个 GitHub Actions 工作流，均在推送 `v*` 标签时触发：

- **`.github/workflows/publish.yml`**：使用 Node 24.x 构建并发布到 npmjs.org。从 `dist/` 目录发布，版本号含 "beta" 时以 `--tag=beta` 发布，否则发布为 `latest`。需要 `NPM_TOKEN` secret 和 `id-token: write` 权限（用于 npm provenance）。
- **`.github/workflows/release.yml`**：使用 `softprops/action-gh-release@v2` 创建 GitHub Release，release 内容取自 `log.md`。

## 架构

### 入口与启动

- `bin/mine-auto-cli.js` → `dist/index.js`（构建后）
- `src/index.ts` 是整个应用的入口，仅做两件事：导入 `./commander`（注册所有 CLI 命令）和 `./update`（启动更新通知检查）
- `src/module.d.ts`：为无类型声明的 `download-git-repo` 包提供 ambient 声明

### 命令注册（副作用模式）

每个命令文件在导入时即通过 `program.command()` 自行注册到 Commander 的全局 `program` 实例，无需手动组装。

- `src/commander/index.ts` — 创建 `program` 实例，设置版本/帮助选项，导入 `./commands`（触发所有子命令注册），定义顶级 `build[:env]` 和 `version[++|@<ver>]` 的参数语法
- `src/commander/actions.ts` — 顶级命令的 action 处理：将 `build*` 路由到 `simplifyBuild`，`version*` 路由到 `simplifyVersion`，其余报错。**注意**：`simplifyVersion` 会同时更新 `package.json` 和 `README.md`（替换版本 badge URL），不仅仅是修改 package.json
- `src/commander/common/index.ts` — 导出 `execCommand(cmd)`，用 `ora` spinner 包装 `execSync`，多个命令（git、build、node、tag）共用
- `src/commander/commands/index.ts` — 导入所有子命令文件以触发注册
- `src/commander/commands/*.ts` — 每个文件注册一个命令：`init`、`git`、`check`、`comment`、`mkdir`、`vscode`、`node`、`ai`（`ai` 是带有自己子命令的命令组）

### 核心类型

- `src/types.ts` — 所有共享的 TypeScript 接口：`DefaultConfig`（auto-cli 配置结构）、`MkdirTree`、`NPMResponse` 等
- `src/commander/types.ts` — `VersionLog` 接口，用于 check 命令的版本比较输出

### 配置系统

项目配置从工作目录的 `auto-cli.jsonc` 或 `auto-cli.yml` 加载（JSONC 优先于 YAML，两者合并到 `auto-cli.jsonc` 中的默认值上）。合并顺序：内置默认值 → 用户 `auto-cli.yml` → 用户 `auto-cli.jsonc`（JSONC 优先级最高）。

配置字段：

| 字段       | 说明                                                          |
| ---------- | ------------------------------------------------------------- |
| `prefix`   | 版本前缀，默认 `^`                                            |
| `registry` | npm 镜像源，默认 `https://registry.npmmirror.com/`            |
| `check`    | 为 `true` 时 `auto check` 默认更新 package.json               |
| `reject`   | 跳过检查的依赖名列表                                          |
| `resolve`  | 指定特定包使用非 `latest` 标签检查（如 `mine-auto-cli@beta`） |
| `comment`  | `auto comment` 生成依赖注释时的预设说明                       |

### 工具函数

- `src/utils/functions.ts` — 核心工具集：JSONC/YML 文件加载、配置合并 (`getAutoCliConfig`)、表格对齐、预设数据持久化。**注意**：`SavePresetInfo`/`GetPresetInfo` 使用的 `presetData.json` 路径相对于模块文件位置 (`import.meta.dirname`)，不是用户工作目录
- `src/utils/log.ts` — 三个日志函数：`success`、`error`、`info`。`error` 会加上项目名前缀（`mine-auto-cli`），`success` 和 `info` 不加

### 命令序列配置

`src/config/cmds.ts` 提供两个纯函数，返回 shell 命令数组：

- `gitCmds(desc)` → `['git add -A', 'git commit -m <desc>', 'git push']`
- `buildCmds(suffix, desc)` → `['npm run <suffix>', 'git add -A', 'git commit -m <desc>', 'git push']`

被 `git` 和 `build` 命令共同引用。

### AI 命令与 Claude Code 汉化

`auto ai` 是一个命令组，管理 Claude Code 的模型配置和汉化：

- **模型切换**：读取 `~/.claude/settings.json` 的环境变量，与 `~/.ai-model.json`（从 `src/config/ai.jsonc` 初始化）中存储的模型配置进行匹配和切换
- **`auto ai config`**：将 `src/config/claude.settings.json` 写入 `~/.claude/settings.local.json`，配置 Claude Code 的默认权限（允许 Read/Write/Edit/Delete/Bash，拒绝 `Bash(git *)`）、插件、语言和主题
- **汉化（`auto ai zh`）**：支持 JS 文件和 EXE 文件两种路径：
  - **JS 路径**：正则替换 Claude Code 全局安装的 `cli.js` 中的英文字符串
  - **EXE 路径**（检测到 `.exe` 文件时）：直接操作二进制 buffer，将英文 UTF-8 字符串替换为中文，多余字节填充 `0x20`
  - 汉化前自动备份原文件（`.bak.js` / `.bak.exe`），恢复命令 (`auto ai zh-restore`) 从备份还原
  - 关键词映射位于 `src/config/keyword.ts`（JS 版，约 140 条）和 `src/config/keyword-latest.ts`（EXE 版，约 96 条，译文更简短以适配原始字节长度限制）

### 路径别名

- `@/` → `src/`
- `~/` → 仓库根目录
