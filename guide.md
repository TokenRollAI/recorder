# Recorder 项目开发指南

## 🎯 项目概述

Recorder 是一个强大的 VS Code 扩展，能够智能捕获开发者的整个开发过程——从终端命令到文件操作和代码修改。帮助开发者记录复杂的工作流程，生成标准操作流程（SOP），实现"记录一次，永久重用"的目标。

### 核心特性

- **完整工作流捕获**: 实时记录终端命令、文件操作和代码变更
- **智能 Git 集成**: 自动检测 Git 跟踪文件，捕获有意义的差异而不是完整内容
- **智能过滤**: 自动遵循 `.gitignore` 模式，排除 `.git` 目录
- **结构化输出**: 生成清晰、带时间戳的 JSON 日志，便于自动化和文档生成
- **零配置**: 开箱即用，支持任何工作空间
- **性能优化**: 录制过程中开销最小

## 🛠 技术栈

### 开发语言与框架
- **TypeScript**: 主要开发语言，提供类型安全
- **Node.js**: 运行时环境
- **VS Code Extension API**: 扩展开发框架

### 核心依赖
- **simple-git**: Git 操作库，用于获取文件差异
- **ignore**: 解析和处理 `.gitignore` 规则

### 开发工具链
- **Webpack**: 模块打包工具
- **ts-loader**: TypeScript 编译器
- **ESLint**: 代码质量检查
- **Mocha**: 测试框架
- **@vscode/vsce**: VS Code 扩展打包发布工具

## 🏗 项目架构

### 目录结构
```
recorder/
├── src/                    # 源代码目录
│   ├── extension.ts        # 扩展主入口文件
│   └── test/              # 测试文件
│       └── extension.test.ts
├── dist/                  # 编译输出目录
├── icons/                 # 扩展图标
│   └── icon.png
├── package.json           # 项目配置和依赖
├── tsconfig.json          # TypeScript 配置
├── webpack.config.js      # Webpack 打包配置
├── eslint.config.mjs      # ESLint 配置
└── README.md             # 项目文档
```

### 核心模块架构

#### 1. 主要接口定义
```typescript
interface LogEntry {
  timestamp: number;
  type: "COMMAND" | "FILE_CREATE" | "FILE_DELETE" | "FILE_DIFF" | "FILE_CONTENT" | "FILE_FOCUS";
  path?: string;      // 文件操作路径
  command?: string;   // 终端命令
  output?: string;    // 命令输出
  data?: string;      // 文件内容或差异
}
```

#### 2. 核心功能模块

- **状态管理**: 管理录制状态和操作日志
- **事件监听器**: 监听终端、文件系统和编辑器事件
- **Git 集成**: 智能检测文件状态并生成差异
- **过滤系统**: 基于 `.gitignore` 的智能文件过滤
- **输出管理**: 结构化日志生成和保存

#### 3. 事件监听系统

- **Terminal Shell Execution**: 捕获终端命令执行
- **File System Watcher**: 监听文件创建/删除事件
- **Text Document Save**: 监听文件保存事件
- **Active Text Editor Change**: 监听文件焦点变化

## 🚀 本地开发与测试

### 环境要求

- **Node.js**: 20.x 或更高版本
- **VS Code**: 1.90.0 或更高版本
- **Git**: 用于差异检测功能

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/TokenRollAI/recorder.git
cd recorder

# 安装依赖
npm install
```

### 开发命令

```bash
# 编译项目
npm run compile

# 监听文件变化并自动编译
npm run watch

# 代码质量检查
npm run lint

# 编译测试文件
npm run compile-tests

# 监听测试文件变化
npm run watch-tests

# 运行测试
npm run test

# 预发布构建
npm run pretest
```

### 调试运行

1. 在 VS Code 中打开项目
2. 按 `F5` 或使用 "Run Extension" 调试配置
3. 这将打开一个新的 VS Code 扩展开发主机窗口
4. 在新窗口中测试扩展功能

### 测试工作流

1. **单元测试**: 运行 `npm run test` 执行所有测试用例
2. **集成测试**: 在扩展开发主机中手动测试各项功能
3. **性能测试**: 监控录制过程中的资源使用情况

## 📦 打包与发布

### 本地打包

```bash
# 生产环境打包
npm run package

# 这将生成优化后的代码到 dist/ 目录
```

### 扩展打包 (.vsix)

```bash
# 安装 vsce 工具（如果未安装）
npm install -g @vscode/vsce

# 打包扩展
vsce package

# 这将生成 recorder-0.0.3.vsix 文件
```

### 发布到市场

```bash
# 发布到 VS Code Marketplace
vsce publish

# 或发布指定版本
vsce publish patch  # 补丁版本
vsce publish minor  # 小版本
vsce publish major  # 大版本
```

### 发布前检查

1. **版本号**: 确保 `package.json` 中的版本号正确
2. **更新日志**: 更新 `CHANGELOG.md`
3. **测试**: 运行完整测试套件
4. **文档**: 确保 README 和文档是最新的
5. **许可证**: 确认 CC-BY-NC-4.0 许可证信息

## 🔧 配置说明

### package.json 关键配置

- **engines.vscode**: 最低支持的 VS Code 版本
- **activationEvents**: 扩展激活事件（启动时激活）
- **contributes.commands**: 注册的命令
- **enabledApiProposals**: 使用的实验性 API

### Webpack 配置

- **target**: `node` - Node.js 环境
- **entry**: `./src/extension.ts` - 入口文件
- **output**: 输出到 `dist/extension.js`
- **externals**: 排除 vscode 模块

### TypeScript 配置

- **target**: ES2022
- **module**: Node16
- **strict**: 启用严格类型检查

## 🐛 故障排除

### 常见问题

1. **扩展无法激活**
   - 检查 VS Code 版本是否满足要求
   - 确保已打开工作区文件夹

2. **Git 功能不工作**
   - 确保系统已安装 Git
   - 检查工作区是否为 Git 仓库

3. **文件过滤不正确**
   - 检查 `.gitignore` 文件格式
   - 验证文件路径是否正确

4. **编译错误**
   - 清除 `dist/` 目录并重新编译
   - 检查 TypeScript 版本兼容性

### 调试技巧

1. **启用开发者工具**: `Help > Toggle Developer Tools`
2. **查看输出面板**: 选择 "Extension Host" 频道
3. **设置断点**: 在源代码中设置断点进行调试
4. **日志输出**: 使用 `console.log` 进行调试输出

## 📝 贡献指南

### 开发流程

1. Fork 项目到个人仓库
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交变更：`git commit -am 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 创建 Pull Request

### 代码规范

- 遵循 ESLint 配置的代码规范
- 使用 TypeScript 严格模式
- 添加适当的注释和文档
- 编写单元测试覆盖新功能

## 📄 许可证

本项目采用 CC-BY-NC-4.0 许可证。详情请查看 [LICENSE](LICENSE) 文件。

## 🔗 相关链接

- **GitHub 仓库**: https://github.com/TokenRollAI/recorder
- **问题反馈**: https://github.com/TokenRollAI/recorder/issues
- **完整文档**: https://recorder-doc.pdjjq.org/
- **VS Code Marketplace**: [待发布]

---

**记录一次，自动化永远。**