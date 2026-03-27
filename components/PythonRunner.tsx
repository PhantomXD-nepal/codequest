"use client";
import { useEffect, useState } from 'react';

export function PythonRunner({ code }: { code: string }) {
  const [output, setOutput] = useState('');

  useEffect(() => {
    async function run() {
      // @ts-ignore
      if (typeof window !== 'undefined' && (window as any).loadPyodide) {
        try {
          // @ts-ignore
          const pyodide = await (window as any).loadPyodide();
          const result = await pyodide.runPythonAsync(code);
          setOutput(result);
        } catch (err: any) {
          setOutput(err.message);
        }
      }
    }
    run();
  }, [code]);

  return <pre className="whitespace-pre-wrap font-mono text-sm">{output}</pre>;
}
