const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface Session {
  id: string;
  language: string;
  code: string;
  users: string[];
}

export interface ExecutionResult {
  output: string;
  error?: string;
}

export async function createSession(): Promise<Session> {
  const response = await fetch(`${API_URL}/api/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      language: 'javascript',
      code: '// Start coding...'
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create session');
  }

  return response.json();
}

export async function getSession(id: string): Promise<Session> {
  const response = await fetch(`${API_URL}/api/sessions/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch session');
  }

  return response.json();
}

export async function executeCode(sessionId: string, code: string, language: string): Promise<ExecutionResult> {
  const response = await fetch(`${API_URL}/api/sessions/${sessionId}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, language }),
  });

  if (!response.ok) {
    throw new Error('Failed to execute code');
  }

  return response.json();
}
