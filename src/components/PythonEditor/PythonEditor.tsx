import { useState, useEffect, useRef } from "react";
import { EditorView } from "codemirror";
import { EditorState } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { Button, Spin } from "antd";

interface PythonEditorProps {
  defaultValue?: string;
  lang: string;
}

const LOCALE_UI: Record<string, { run: string; reset: string; loading: string; output: string }> = {
  "zh-Hans": { run: "运行代码", reset: "重置", loading: "正在加载 Python 环境...", output: "输出" },
  "zh-Hant": { run: "執行代碼", reset: "重設", loading: "正在載入 Python 環境...", output: "輸出" },
  en: { run: "Run Code", reset: "Reset", loading: "Loading Python environment...", output: "Output" },
  ja: { run: "コードを実行", reset: "リセット", loading: "Python環境を読み込み中...", output: "出力" },
};

export default function PythonEditor({ defaultValue = "", lang }: PythonEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);
  const [loadingPyodide, setLoadingPyodide] = useState(false);
  const ui = LOCALE_UI[lang] || LOCALE_UI.en;

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: defaultValue,
      extensions: [python(), oneDark, EditorView.lineWrapping],
    });

    viewRef.current = new EditorView({
      state,
      parent: editorRef.current,
    });

    return () => {
      viewRef.current?.destroy();
    };
  }, [defaultValue]);

  async function loadPyodide() {
    if (pyodide) return pyodide;
    setLoadingPyodide(true);

    const pyodideModule = await import("https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js");
    const instance = await pyodideModule.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/",
    });

    await instance.loadPackage(["numpy", "sympy", "matplotlib"]);
    setPyodide(instance);
    setLoadingPyodide(false);
    return instance;
  }

  async function handleRun() {
    const code = viewRef.current?.state.doc.toString() || "";
    setIsRunning(true);
    setOutput("");

    try {
      let py: any = pyodide;
      if (!py) {
        py = await loadPyodide();
      }

      py.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
`);

      await py.runPythonAsync(code);

      const stdout = py.runPython("sys.stdout.getvalue()");
      const stderr = py.runPython("sys.stderr.getvalue()");
      setOutput(stdout || stderr || "(no output)");
    } catch (err: any) {
      setOutput(err.message || String(err));
    } finally {
      setIsRunning(false);
    }
  }

  function handleReset() {
    if (viewRef.current) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: defaultValue,
        },
      });
    }
    setOutput("");
  }

  return (
    <div className="python-editor">
      <div ref={editorRef} className="editor-container" />
      <div className="editor-actions">
        <Button type="primary" onClick={handleRun} loading={isRunning} disabled={loadingPyodide}>
          {ui.run}
        </Button>
        <Button onClick={handleReset}>{ui.reset}</Button>
        {loadingPyodide && <Spin tip={ui.loading} />}
      </div>
      {output && (
        <div className="editor-output">
          <h4>{ui.output}</h4>
          <pre>{output}</pre>
        </div>
      )}
      <style>{`
        .python-editor {
          margin: 16px 0;
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          overflow: hidden;
        }
        .editor-container {
          min-height: 120px;
        }
        .editor-container .cm-editor {
          height: auto;
        }
        .editor-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-top: 1px solid #e8e8e8;
          background: #fafafa;
        }
        .editor-output {
          padding: 12px;
          border-top: 1px solid #e8e8e8;
          background: #f6f8fa;
        }
        .editor-output h4 {
          margin: 0 0 8px;
          font-size: 0.85rem;
          color: #666;
        }
        .editor-output pre {
          margin: 0;
          font-family: 'SFMono-Regular', Consolas, monospace;
          font-size: 0.85rem;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  );
}