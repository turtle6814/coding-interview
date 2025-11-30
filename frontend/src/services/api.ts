const API_BASE_URL = 'http://localhost:8080/api';

export interface Session {
  id: string;
  code: string;
  language: string;
}

export const createSession = async (): Promise<Session> => {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error('Failed to create session');
  }

  return response.json();
};

export const getSession = async (id: string): Promise<Session> => {
  const response = await fetch(`${API_BASE_URL}/sessions/${id}`);

  if (!response.ok) {
    throw new Error('Failed to get session');
  }

  return response.json();
};

export const updateSession = async (id: string, code: string): Promise<Session> => {
  const response = await fetch(`${API_BASE_URL}/sessions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    throw new Error('Failed to update session');
  }

  return response.json();
};

export const executeCode = async (code: string, language: string): Promise<{
  success: boolean;
  output: string;
  error: string;
}> => {
  const response = await fetch(`${API_BASE_URL}/execute`, {
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
};
