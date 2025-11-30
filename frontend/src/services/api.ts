const API_URL = 'http://localhost:8080/api';

export interface Session {
    id: string;
    language: string;
    code: string;
}

export const createSession = async (): Promise<Session> => {
    const response = await fetch(`${API_URL}/sessions`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to create session');
    return response.json();
};

export const getSession = async (id: string): Promise<Session> => {
    const response = await fetch(`${API_URL}/sessions/${id}`);
    if (!response.ok) throw new Error('Failed to get session');
    return response.json();
};
