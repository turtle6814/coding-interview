const API_BASE_URL = 'http://localhost:8080/api';

// Helper to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper to create headers with auth
const getHeaders = (includeAuth: boolean = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Generic API request helper
const apiRequest = async <T>(
  url: string,
  options: RequestInit = {},
  requireAuth: boolean = false
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(requireAuth),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  return response.json();
};

// Types
export interface Session {
  id: string;
  code: string;
  language: string;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  sampleInput?: string;
  sampleOutput?: string;
  hints?: string;
  starterCode?: string;
  timeLimit?: number;
  createdBy?: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  points: number;
  timeLimit?: number;
  memoryLimit?: number;
  description?: string;
}

export interface InterviewSession {
  id: string;
  question?: Question;
  candidate?: any;
  interviewer?: any;
  language: string;
  code: string;
  status: string;
  timerDuration?: number;
  timerRemaining?: number;
  timerStatus?: string;
  score?: number;
  createdAt: string;
}

// Session APIs
export const createSession = async (): Promise<Session> => {
  return apiRequest<Session>(`${API_BASE_URL}/sessions`, {
    method: 'POST',
    body: JSON.stringify({}),
  }, true);
};

export const getSession = async (id: string | number): Promise<Session> => {
  return apiRequest<Session>(`${API_BASE_URL}/sessions/${id}`, {}, true);
};

export const updateSession = async (id: string | number, code: string): Promise<Session> => {
  return apiRequest<Session>(`${API_BASE_URL}/sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ code }),
  }, true);
};

export const executeCode = async (code: string, language: string): Promise<{
  success: boolean;
  output: string;
  error: string;
}> => {
  return apiRequest(`${API_BASE_URL}/execute`, {
    method: 'POST',
    body: JSON.stringify({ code, language }),
  }, true);
};

// Question APIs
export const getQuestions = async (filters?: { difficulty?: string; topic?: string }): Promise<Question[]> => {
  let url = `${API_BASE_URL}/questions`;
  if (filters) {
    const params = new URLSearchParams(filters as any);
    url += `?${params.toString()}`;
  }
  return apiRequest<Question[]>(url, {}, true);
};

export const getQuestion = async (id: string): Promise<Question> => {
  return apiRequest<Question>(`${API_BASE_URL}/questions/${id}`, {}, true);
};

export const createQuestion = async (question: Omit<Question, 'id'>): Promise<Question> => {
  return apiRequest<Question>(`${API_BASE_URL}/questions`, {
    method: 'POST',
    body: JSON.stringify(question),
  }, true);
};

export const updateQuestion = async (id: string, question: Partial<Question>): Promise<Question> => {
  return apiRequest<Question>(`${API_BASE_URL}/questions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(question),
  }, true);
};

export const deleteQuestion = async (id: string): Promise<void> => {
  await fetch(`${API_BASE_URL}/questions/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
};

export const getTestCases = async (questionId: string, includeHidden: boolean = false): Promise<TestCase[]> => {
  return apiRequest<TestCase[]>(
    `${API_BASE_URL}/questions/${questionId}/test-cases?includeHidden=${includeHidden}`,
    {},
    true
  );
};

export const addTestCase = async (questionId: string, testCase: Omit<TestCase, 'id'>): Promise<TestCase> => {
  return apiRequest<TestCase>(`${API_BASE_URL}/questions/${questionId}/test-cases`, {
    method: 'POST',
    body: JSON.stringify(testCase),
  }, true);
};

export const deleteTestCase = async (testCaseId: string): Promise<void> => {
  await fetch(`${API_BASE_URL}/questions/test-cases/${testCaseId}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
};

// Candidate APIs (using users endpoint with role filter)
export const getCandidates = async (): Promise<any[]> => {
  return apiRequest<any[]>(`${API_BASE_URL}/users?role=CANDIDATE`, {}, true);
};

export const getCandidate = async (id: string): Promise<any> => {
  return apiRequest(`${API_BASE_URL}/candidates/${id}`, {}, true);
};

export const createCandidate = async (data: any): Promise<any> => {
  return apiRequest(`${API_BASE_URL}/candidates`, {
    method: 'POST',
    body: JSON.stringify(data),
  }, true);
};

export const updateCandidate = async (id: string, data: any): Promise<any> => {
  return apiRequest(`${API_BASE_URL}/candidates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, true);
};

export const deleteCandidate = async (id: string): Promise<void> => {
  await fetch(`${API_BASE_URL}/candidates/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });
};

// Interview Session APIs
export const createInterviewSession = async (data: {
  questionId: string;
  candidateId: string;
  interviewerId: string;
  timerDuration: number;
}): Promise<InterviewSession> => {
  return apiRequest<InterviewSession>(`${API_BASE_URL}/interview-sessions`, {
    method: 'POST',
    body: JSON.stringify(data),
  }, true);
};

export const getInterviewSession = async (id: string): Promise<InterviewSession> => {
  return apiRequest<InterviewSession>(`${API_BASE_URL}/interview-sessions/${id}`, {}, true);
};

export const startSession = async (id: string): Promise<InterviewSession> => {
  return apiRequest<InterviewSession>(`${API_BASE_URL}/interview-sessions/${id}/start`, {
    method: 'PUT',
  }, true);
};

export const endSession = async (id: string): Promise<InterviewSession> => {
  return apiRequest<InterviewSession>(`${API_BASE_URL}/interview-sessions/${id}/end`, {
    method: 'PUT',
  }, true);
};

export const startTimer = async (id: string): Promise<InterviewSession> => {
  return apiRequest<InterviewSession>(`${API_BASE_URL}/interview-sessions/${id}/timer/start`, {
    method: 'PUT',
  }, true);
};

export const pauseTimer = async (id: string): Promise<InterviewSession> => {
  return apiRequest<InterviewSession>(`${API_BASE_URL}/interview-sessions/${id}/timer/pause`, {
    method: 'PUT',
  }, true);
};

// Evaluation APIs
export const evaluateSession = async (sessionId: string): Promise<any> => {
  return apiRequest(`${API_BASE_URL}/evaluation/session/${sessionId}`, {
    method: 'POST',
  }, true);
};

export const getSessionResults = async (sessionId: string): Promise<any> => {
  return apiRequest(`${API_BASE_URL}/evaluation/session/${sessionId}/results`, {}, true);
};

// Notes and Chat APIs
export const createNote = async (data: {
  sessionId: string;
  authorId: string;
  content: string;
  isPrivate?: boolean;
  codeSnapshot?: string;
  lineNumber?: number;
  type?: string;
}): Promise<any> => {
  return apiRequest(`${API_BASE_URL}/notes`, {
    method: 'POST',
    body: JSON.stringify(data),
  }, true);
};

export const getSessionNotes = async (sessionId: string, includePrivate: boolean = false): Promise<any[]> => {
  return apiRequest(
    `${API_BASE_URL}/notes/session/${sessionId}?includePrivate=${includePrivate}`,
    {},
    true
  );
};

export const sendMessage = async (data: {
  sessionId: string;
  senderId: string;
  content: string;
  type?: string;
}): Promise<any> => {
  return apiRequest(`${API_BASE_URL}/chat`, {
    method: 'POST',
    body: JSON.stringify(data),
  }, true);
};

export const getSessionMessages = async (sessionId: string): Promise<any[]> => {
  return apiRequest(`${API_BASE_URL}/chat/session/${sessionId}`, {}, true);
};
