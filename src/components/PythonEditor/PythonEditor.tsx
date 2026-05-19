import { useState, useEffect, useRef } from "react";
import { EditorView } from "codemirror";
import { EditorState } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { Button, Spin } from "antd";
import { withBase } from "../../i18n/utils.ts";

interface PythonEditorProps {
  defaultValue?: string;
  lang: string;
}

interface PyodideRuntime {
  loadPackage: (packages: string[]) => Promise<unknown>;
  runPython: (code: string) => string;
  runPythonAsync: (code: string) => Promise<unknown>;
}

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<PyodideRuntime>;
  }
}

const LOCALE_UI: Record<
  string,
  { run: string; reset: string; loading: string; output: string }
> = {
  "zh-hans": {
    run: "运行代码",
    reset: "重置",
    loading: "正在加载 Python 环境...",
    output: "输出",
  },
  "zh-hant": {
    run: "執行代碼",
    reset: "重設",
    loading: "正在載入 Python 環境...",
    output: "輸出",
  },
  "en-us": {
    run: "Run Code",
    reset: "Reset",
    loading: "Loading Python environment...",
    output: "Output",
  },
  "ja-jp": {
    run: "コードを実行",
    reset: "リセット",
    loading: "Python環境を読み込み中...",
    output: "出力",
  },
};

export default function PythonEditor({
  defaultValue = "",
  lang,
}: PythonEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [pyodide, setPyodide] = useState<PyodideRuntime | null>(null);
  const [loadingPyodide, setLoadingPyodide] = useState(false);
  const ui = LOCALE_UI[lang] || LOCALE_UI["zh-hans"];

  async function ensurePyodideScript() {
    if (typeof window === "undefined") return;
    if (window.loadPyodide) return;

    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[data-pyodide="true"]',
      );
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error("Failed to load Pyodide script.")),
          {
            once: true,
          },
        );
        return;
      }

      const script = document.createElement("script");
      script.src = withBase("/vendor/pyodide/pyodide.js");
      script.async = true;
      script.dataset.pyodide = "true";
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Failed to load Pyodide script."));
      document.head.appendChild(script);
    });
  }

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

    await ensurePyodideScript();
    if (!window.loadPyodide) {
      throw new Error("loadPyodide is unavailable after loading local script.");
    }

    const instance = await window.loadPyodide({
      indexURL: withBase("/vendor/pyodide/"),
    });

    await instance.loadPackage(["micropip", "numpy", "sympy", "matplotlib"]);
    setPyodide(instance);
    setLoadingPyodide(false);
    return instance;
  }

  async function handleRun() {
    const code = viewRef.current?.state.doc.toString() || "";
    setIsRunning(true);
    setOutput("");

    try {
      const py = pyodide ?? (await loadPyodide());

      py.runPython(`
import sys
from io import StringIO
import math

import numpy as np
import sympy as sp
import matplotlib
matplotlib.use("AGG")
import matplotlib.pyplot as plt

sys.stdout = StringIO()
sys.stderr = StringIO()

try:
    import micropip
except Exception:
    micropip = None

try:
    import plotly
    HAS_PLOTLY = True
except Exception:
    plotly = None
    HAS_PLOTLY = False
`);

      await py.runPythonAsync(code);

      const stdout = py.runPython("sys.stdout.getvalue()");
      const stderr = py.runPython("sys.stderr.getvalue()");
      setOutput(stdout || stderr || "(no output)");
    } catch (error: unknown) {
      setOutput(error instanceof Error ? error.message : String(error));
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
        <Button
          type="primary"
          onClick={handleRun}
          loading={isRunning}
          disabled={loadingPyodide}
        >
          {ui.run}
        </Button>
        <Button onClick={handleReset}>{ui.reset}</Button>
        {loadingPyodide && <Spin description={ui.loading} />}
      </div>
      {output && (
        <div className="editor-output">
          <h4>{ui.output}</h4>
          <pre>{output}</pre>
        </div>
      )}
      <style>{`
        .python-editor {
          margin: 14px 0;
          border: 1px solid #cdd8f2;
          border-radius: 12px;
          overflow: hidden;
          background: #ffffff;
          box-shadow: 0 4px 16px rgba(24, 53, 123, 0.08);
        }
        .editor-container {
          min-height: 160px;
        }
        .editor-container .cm-editor {
          height: auto;
        }
        .editor-container .cm-scroller {
          font-size: 13.5px;
        }
        .editor-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-top: 1px solid #dbe4f8;
          background: linear-gradient(180deg, #f6f9ff, #f0f6ff);
        }
        .editor-output {
          padding: 12px;
          border-top: 1px solid #dbe4f8;
          background: #f8fbff;
        }
        .editor-output h4 {
          margin: 0 0 8px;
          font-size: 0.85rem;
          color: #435377;
        }
        .editor-output pre {
          margin: 0;
          font-family: 'SFMono-Regular', Consolas, monospace;
          font-size: 0.85rem;
          white-space: pre-wrap;
          color: #1f2b42;
        }
      `}</style>
    </div>
  );
}
