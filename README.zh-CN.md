[English](./README.md) | [简体中文](./README.zh-CN.md)

<p align="center">
  <img src="./icons/icon.png" alt="logo" />
</p>

# Recorder

**[JUST DO ONCE](https://recorder.tokenroll.ai/blog/just-do-once)** | [SOP Coding](https://recorder.tokenroll.ai/blog/sop-coding)

## 概述

Recorder 是一款旨在消除您日常工作流程中重复性“拧螺丝”任务的开发工具。它能智能地捕获您的整个开发过程——从终端命令到文件操作和代码修改。无需再手动创建新的API、组件、数据表或编写样板SQL。**Recorder 会向您学习一次，然后永久自动化该过程。** 记录一次，永久复用。

## 文档

* [官方网站](https://recorder.tokenroll.ai/zh-Hans)
* [文档](https://recorder.tokenroll.ai/zh-Hans/docs/intro)

## 使用方法

* [安装 uvx 和 SPEC-mcp](https://recorder.tokenroll.ai/docs/prerequisites)
* 安装 Recorder 插件
  * [VsCode](https://recorder.tokenroll.ai/docs/vscode/installation)
  * [Jetbrains](https://recorder.tokenroll.ai/docs/jetbrains/installation)
* 点击状态栏的 `$(record) 开始录制` 按钮开始工作，然后点击 `$(debug-stop) 停止录制`。
* 录制停止后，您的完整工作流将自动保存到 `operation.json` 文件中。
* 启用 SPEC-mcp, 输入 `call generate_operation_md and follow the instruction` , 生成SOP。
* 在下次重复工作时使用 SOP。

## 特性

- **完整工作流捕获**: 实时记录终端命令、文件操作和代码更改。
- **智能 Git 集成**: 自动检测 Git 跟踪的文件，并捕获有意义的差异（diff）而不是完整文件内容。
- **智能过滤**: 自动遵循 `.gitignore` 模式并排除 `.git` 目录。
- **结构化输出**: 生成清晰、带时间戳的 JSON 日志，可用于自动化和文档生成。
- **零配置**: 开箱即用，适用于任何工作区。
- **性能优化**: 录制会话期间开销极小。

## 记录内容

### 终端命令
```json
{
  "timestamp": 1703123456789,
  "type": "COMMAND",
  "command": "npm run build",
  "output": "Build completed successfully..."
}
```

### 文件操作
```json
{
  "timestamp": 1703123456790,
  "type": "FILE_CREATE",
  "path": "src/components/Button.tsx",
  "data": ""
}
```

### 代码变更
```json
{
  "timestamp": 1703123456791,
  "type": "FILE_DIFF",
  "path": "src/utils/helpers.ts",
  "data": "@@ -15,3 +15,7 @@\n+export const formatDate = (date: Date) => {\n+  return date.toISOString();\n+};"
}
```

## 输出结构

生成的 `operation.json` 包含一个按时间顺序排列的所有捕获操作的数组：

- `COMMAND`: 终端执行命令及完整输出
- `FILE_CREATE`: 新文件创建事件
- `FILE_DELETE`: 文件删除事件
- `FILE_DIFF`: Git 跟踪文件的差异
- `FILE_CONTENT`: 未跟踪文件的完整内容

## 要求

- VS Code 1.90.0+
- Git (用于差异检测)

## 许可证

根据 CC-BY-NC-4.0 许可证授权

## 贡献

欢迎在以下地址提交 Issue 和贡献：https://github.com/TokenRollAI/recorder

---

**记录一次，自动化永恒。**
