<p align="center">
  <img src="./icons/icon.png" alt="logo" />
</p>

# Recorder

**[JUST DO ONCE](https://recorder.tokenroll.ai/blog/just-do-once)** | [SOP Coding](https://recorder.tokenroll.ai/blog/sop-coding)

## Overview

Recorder is a powerful VS Code extension that intelligently captures your entire development process - from terminal commands to file operations and code modifications. Never repeat complex workflows again. Record once, replay knowledge forever.

## Documentation

* [official website](https://recorder.tokenroll.ai/)
* [Document](https://recorder.tokenroll.ai/docs)

## Usage

* [Install uvx and SPEC-mcp](https://recorder.tokenroll.ai/docs/prerequisites)
* Install Recorder Plugin
  * [VsCode](https://recorder.tokenroll.ai/docs/vscode/installation)
  * [Jetbrains](https://recorder.tokenroll.ai/docs/jetbrains/installation)
* Click start recording and work, then click stop, get generated operation.json
* enable SPEC-mcp, input `call generate_operation_md` , generate SOP
* Use SOP on next repeat

## Features

- **Complete Workflow Capture**: Records terminal commands, file operations, and code changes in real-time
- **Intelligent Git Integration**: Automatically detects Git-tracked files and captures meaningful diffs instead of full content
- **Smart Filtering**: Respects `.gitignore` patterns and excludes `.git` directories automatically
- **Structured Output**: Generates clean, timestamped JSON logs ready for automation and documentation
- **Zero Configuration**: Works out of the box with any workspace
- **Performance Optimized**: Minimal overhead during recording sessions

## Usage

### Start Recording
- Click the `$(record) Start Recording` button in the status bar
- Open a workspace folder to begin capturing operations

### Stop Recording
- Click the `$(debug-stop) Recording` button to stop
- Your complete workflow is automatically saved to `operation.json`

### What Gets Recorded

**Terminal Commands**
```json
{
  "timestamp": 1703123456789,
  "type": "COMMAND",
  "command": "npm run build",
  "output": "Build completed successfully..."
}
```

**File Operations**
```json
{
  "timestamp": 1703123456790,
  "type": "FILE_CREATE",
  "path": "src/components/Button.tsx",
  "data": ""
}
```

**Code Changes**
```json
{
  "timestamp": 1703123456791,
  "type": "FILE_DIFF",
  "path": "src/utils/helpers.ts",
  "data": "@@ -15,3 +15,7 @@\n+export const formatDate = (date: Date) => {\n+  return date.toISOString();\n+};"
}
```

## Output Structure

The generated `operation.json` contains a chronological array of all captured operations:

- `COMMAND`: Terminal executions with full output
- `FILE_CREATE`: New file creation events
- `FILE_DELETE`: File deletion events
- `FILE_DIFF`: Git diff for tracked files
- `FILE_CONTENT`: Full content for untracked files

## Requirements

- VS Code 1.90.0+
- Git (for diff detection)

## License

Licensed under CC-BY-NC-4.0

## Contributing

Issues and contributions welcome at: https://github.com/TokenRollAI/recorder

---

**Record once. Automate forever.**