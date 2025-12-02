import { useState, useEffect, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

interface TimerState {
  timeRemaining: number;
  timerStatus: 'IDLE' | 'RUNNING' | 'PAUSED' | 'EXPIRED';
  timerDuration: number;
}

interface UseTimerReturn extends TimerState {
  startTimer: () => Promise<void>;
  pauseTimer: () => Promise<void>;
  isConnected: boolean;
}

export const useTimer = (sessionId: number): UseTimerReturn => {
  const [timerState, setTimerState] = useState<TimerState>({
    timeRemaining: 0,
    timerStatus: 'IDLE',
    timerDuration: 0,
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Create WebSocket connection
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('✅ Timer WebSocket connected');
      setIsConnected(true);

      // Subscribe to timer updates for this session
      client.subscribe(`/topic/session/${sessionId}/timer`, (message) => {
        const timerData = JSON.parse(message.body);
        console.log('⏱️ Timer update received:', timerData);
        setTimerState({
          timeRemaining: timerData.timeRemaining || 0,
          timerStatus: timerData.timerStatus || 'IDLE',
          timerDuration: timerData.timerDuration || 0,
        });
      });
    };

    client.onDisconnect = () => {
      console.log('❌ Timer WebSocket disconnected');
      setIsConnected(false);
    };

    client.onStompError = (frame) => {
      console.error('STOMP error:', frame);
    };

    client.activate();

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [sessionId]);

  const startTimer = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8080/api/interview-sessions/${sessionId}/timer/start`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to start timer');
      }

      const data = await response.json();
      setTimerState({
        timeRemaining: data.timerRemaining || 0,
        timerStatus: data.timerStatus || 'RUNNING',
        timerDuration: data.timerDuration || 0,
      });
    } catch (error) {
      console.error('Error starting timer:', error);
      throw error;
    }
  }, [sessionId]);

  const pauseTimer = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8080/api/interview-sessions/${sessionId}/timer/pause`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to pause timer');
      }

      const data = await response.json();
      setTimerState({
        timeRemaining: data.timerRemaining || 0,
        timerStatus: data.timerStatus || 'PAUSED',
        timerDuration: data.timerDuration || 0,
      });
    } catch (error) {
      console.error('Error pausing timer:', error);
      throw error;
    }
  }, [sessionId]);

  return {
    ...timerState,
    startTimer,
    pauseTimer,
    isConnected,
  };
};
