// lib/execute.ts
export async function runCode(language: string, code: string) {
  const res = await fetch('https://emkc.org/api/v2/piston/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language,          // 'python', 'c', 'javascript', etc.
      version: '*',
      files: [{ content: code }],
    }),
  });

  const data = await res.json();
  
  if (!data.run) {
    throw new Error(data.message || 'Failed to execute code');
  }

  return {
    stdout: data.run.stdout,
    stderr: data.run.stderr,
    exitCode: data.run.code,
  };
}
