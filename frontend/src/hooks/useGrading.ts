import { useState, useEffect, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { evaluateSession, getSessionResults } from '../services/api';

interface TestResult {
  id: number;
  testCaseId: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  points: number;
  executionTime: number;
  memoryUsed: number;
  error?: string;
}

interface EvaluationResult {
  sessionId: number;
  totalTests: number;
  passedTests: number;
  score: number;
  maxScore: number;
  percentage: number;
  results: TestResult[];
}

interface UseGradingReturn {
  evaluationResult: EvaluationResult | null;
  isEvaluating: boolean;
  error: string | null;
  evaluateCode: () => Promise<void>;
  refreshResults: () => Promise<void>;
}

export const useGrading = (sessionId: number): UseGradingReturn => {
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create WebSocket connection for real-time evaluation updates
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log('STOMP Debug (Grading):', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('✅ Grading WebSocket connected');

      // Subscribe to evaluation results
      client.subscribe(`/topic/session/${sessionId}/evaluation`, (message) => {
        const result = JSON.parse(message.body);
        console.log('📊 Evaluation result received:', result);
        setEvaluationResult(result);
        setIsEvaluating(false);
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP error:', frame);
    };

    client.activate();

    // Load initial results if available
    loadResults();

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [sessionId]);

  const loadResults = async () => {
    try {
      const results = await getSessionResults(sessionId);
      if (results && results.length > 0) {
        // Transform results into evaluation format
        const passedTests = results.filter((r: any) => r.passed).length;
        const totalScore = results.reduce((sum: number, r: any) => sum + (r.passed ? r.points : 0), 0);
        const maxScore = results.reduce((sum: number, r: any) => sum + r.points, 0);

        setEvaluationResult({
          sessionId,
          totalTests: results.length,
          passedTests,
          score: totalScore,
          maxScore,
          percentage: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
          results,
        });
      }
    } catch (err) {
      console.error('Error loading results:', err);
    }
  };

  const evaluateCode = useCallback(async () => {
    setIsEvaluating(true);
    setError(null);

    try {
      await evaluateSession(sessionId);
      // Results will come via WebSocket
    } catch (err: any) {
      setError(err.message || 'Failed to evaluate code');
      setIsEvaluating(false);
      throw err;
    }
  }, [sessionId]);

  const refreshResults = useCallback(async () => {
    await loadResults();
  }, [sessionId]);

  return {
    evaluationResult,
    isEvaluating,
    error,
    evaluateCode,
    refreshResults,
  };
};
