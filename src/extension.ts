// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import ignore from "ignore";
import * as path from "path";
import { simpleGit, SimpleGit } from "simple-git";

interface LogEntry {
  timestamp: number;
  type:
    | "COMMAND"
    | "FILE_CREATE"
    | "FILE_DELETE"
    | "FILE_DIFF"
    | "FILE_CONTENT"
    | "FILE_FOCUS";
  path?: string; // For file operations
  command?: string;
  output?: string;
  data?: string; // For terminal output or diff content
}

let statusBarItem: vscode.StatusBarItem;
let isRecording = false;
let operationLog: LogEntry[] = [];
let listeners: vscode.Disposable[] = [];
let ig = ignore();
let git: SimpleGit;

function stripAnsi(data: string): string {
  // A more robust regex to strip ANSI escape codes
  const ansiRegex =
    /[\u001b\u009b][[()#;?]*.{0,2}(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
  return data.replace(ansiRegex, "");
}

export function activate(context: vscode.ExtensionContext) {
  const commandId = "recorder.toggleRecording";

  context.subscriptions.push(
    vscode.commands.registerCommand(commandId, async () => {
      if (isRecording) {
        // Stop recording
        isRecording = false;
        updateStatusBar();
        listeners.forEach((l) => l.dispose());
        listeners = [];

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
          return;
        }

        if (operationLog.length > 0) {
          const logContent = JSON.stringify(operationLog, null, 2);
          const logFilePath = vscode.Uri.joinPath(
            workspaceFolder.uri,
            "operation.json"
          );
          await vscode.workspace.fs.writeFile(
            logFilePath,
            new TextEncoder().encode(logContent)
          );
          vscode.window.showInformationMessage(
            "Recording saved to operation.json"
          );
        } else {
          vscode.window.showInformationMessage(
            "Recording stopped. No activity recorded."
          );
        }
      } else {
        // Start recording logic...
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
          vscode.window.showErrorMessage(
            "Please open a folder to start recording."
          );
          return;
        }
        const workspacePath = workspaceFolder.uri.fsPath;
        git = simpleGit(workspacePath);

        isRecording = true;
        updateStatusBar();
        operationLog = [];

        console.log("[Recorder] Initializing listeners...");

        // Setup .gitignore
        ig = ignore();
        try {
          const gitignoreContent = await vscode.workspace.fs.readFile(
            vscode.Uri.joinPath(workspaceFolder.uri, ".gitignore")
          );
          ig.add(new TextDecoder().decode(gitignoreContent));
          console.log("[Recorder] .gitignore loaded successfully.");
        } catch (e) {
          console.log("[Recorder] No .gitignore file found.");
        }

        // High-level Terminal Command Listener
        listeners.push(
          vscode.window.onDidStartTerminalShellExecution(
            async (e: vscode.TerminalShellExecutionStartEvent) => {
              console.log(
                "[Recorder] Event: onDidStartTerminalShellExecution fired."
              );
              const execution = e.execution;
              const commandLine = String(execution.commandLine);

              let output = "";
              for await (const chunk of execution.read()) {
                output += chunk;
              }

              console.log(`[Recorder] Command "${commandLine}" finished.`);
              const logEntry: LogEntry = {
                timestamp: Date.now(),
                type: "COMMAND",
                command: e.execution.commandLine.value,
                output: stripAnsi(output),
              };
              console.log("[Recorder] Pushing COMMAND entry:", logEntry);
              operationLog.push(logEntry);
            }
          )
        );

        // File Focus Listener
        listeners.push(
          vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor) {
              const relativePath = path.relative(
                workspacePath,
                editor.document.uri.fsPath
              );
              const isGitPath = relativePath.startsWith(".git");
              const isIgnored = ig.ignores(relativePath);

              if (relativePath && !isGitPath && !isIgnored) {
                const logEntry: LogEntry = {
                  timestamp: Date.now(),
                  type: "FILE_FOCUS",
                  path: relativePath,
                };
                console.log("[Recorder] Pushing FILE_FOCUS entry:", logEntry);
                operationLog.push(logEntry);
              }
            }
          })
        );

        // File Create/Delete Listener
        const fileWatcher = vscode.workspace.createFileSystemWatcher("**/*");

        const handleFileEvent = (
          uri: vscode.Uri,
          type: "FILE_CREATE" | "FILE_DELETE"
        ) => {
          console.log(`[Recorder] Event: ${type} fired for URI:`, uri.fsPath);
          const relativePath = path.relative(workspacePath, uri.fsPath);

          const isGitPath = relativePath.startsWith(".git");
          const isIgnored = ig.ignores(relativePath);
          console.log(
            `[Recorder] File Event Check: path=${relativePath}, isGitPath=${isGitPath}, isIgnored=${isIgnored}`
          );

          if (relativePath && !isGitPath && !isIgnored) {
            const logEntry: LogEntry = {
              timestamp: Date.now(),
              type,
              path: relativePath,
              data: "",
            };
            console.log(
              "[Recorder] Pushing FILE_CREATE/DELETE entry:",
              logEntry
            );
            operationLog.push(logEntry);
          }
        };

        fileWatcher.onDidCreate((uri) => handleFileEvent(uri, "FILE_CREATE"));
        fileWatcher.onDidDelete((uri) => handleFileEvent(uri, "FILE_DELETE"));
        listeners.push(fileWatcher);

        // File Save Listener
        listeners.push(
          vscode.workspace.onDidSaveTextDocument(async (document) => {
            console.log(
              "[Recorder] Event: onDidSaveTextDocument fired for URI:",
              document.uri.fsPath
            );
            const relativePath = path.relative(
              workspacePath,
              document.uri.fsPath
            );

            const isGitPath = relativePath.startsWith(".git");
            const isIgnored = ig.ignores(relativePath);
            console.log(
              `[Recorder] Save Event Check: path=${relativePath}, isGitPath=${isGitPath}, isIgnored=${isIgnored}`
            );

            if (relativePath && !isGitPath && !isIgnored) {
              console.log(
                "[Recorder] Save event passed checks. Checking git status..."
              );
              try {
                // Check if the file is tracked by git
                await git.raw(
                  "ls-files",
                  "--error-unmatch",
                  document.uri.fsPath
                );

                // File is tracked, get the diff
                console.log(
                  "[Recorder] File IS tracked. Executing git diff..."
                );
                const diff = await git.diff([
                  `HEAD`,
                  "--",
                  document.uri.fsPath,
                ]);
                if (diff) {
                  const logEntry: LogEntry = {
                    timestamp: Date.now(),
                    type: "FILE_DIFF",
                    path: relativePath,
                    data: diff,
                  };
                  console.log("[Recorder] Pushing FILE_DIFF entry:", logEntry);
                  operationLog.push(logEntry);
                } else {
                  console.log("[Recorder] git diff produced no output.");
                }
              } catch (err) {
                // ls-files throws an error if the file is not tracked
                console.log(
                  "[Recorder] File is NOT tracked. Recording full content."
                );
                const logEntry: LogEntry = {
                  timestamp: Date.now(),
                  type: "FILE_CONTENT",
                  path: relativePath,
                  data: document.getText(),
                };
                console.log("[Recorder] Pushing FILE_CONTENT entry:", logEntry);
                operationLog.push(logEntry);
              }
            }
          })
        );

        vscode.window.showInformationMessage("Recording started.");
      }
    })
  );

  // Setup status bar item
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.command = commandId;
  context.subscriptions.push(statusBarItem);

  updateStatusBar();
  statusBarItem.show();
}

function updateStatusBar(): void {
  if (isRecording) {
    statusBarItem.text = `$(debug-stop) Recording`;
    statusBarItem.tooltip = "Click to Stop Recording";
    statusBarItem.backgroundColor = new vscode.ThemeColor(
      "statusBarItem.errorBackground"
    );
  } else {
    statusBarItem.text = `$(record) Start Recording`;
    statusBarItem.tooltip = "Click to Start Recording";
    statusBarItem.backgroundColor = undefined;
  }
}

export function deactivate() {
  // Clean up resources if needed
}
