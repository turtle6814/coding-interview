import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface CodeUpdate {
  code: string;
  userId: string;
  timestamp: number;
}

export function useCollaboration(
  sessionId: string,
  onCodeUpdate: (code: string) => void
) {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;
  
  // Store the callback in a ref to avoid effect re-runs
  const onCodeUpdateRef = useRef(onCodeUpdate);
  
  // Update the ref when the callback changes
  useEffect(() => {
    onCodeUpdateRef.current = onCodeUpdate;
  }, [onCodeUpdate]);

  useEffect(() => {
    if (!sessionId) return;

    const client = new Client({
      webSocketFactory: () => {
        const wsUrl = 'http://localhost:8080/ws';
        console.log('🔌 Attempting WebSocket connection:', wsUrl, `(Attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
        return new SockJS(wsUrl);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectionTimeout: 15000,
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      
      onConnect: () => {
        console.log('✅ WebSocket Connected to session:', sessionId);
        setConnected(true);
        reconnectAttempts.current = 0;
        
        // Subscribe to session updates
        try {
          client.subscribe(`/topic/session/${sessionId}`, (message) => {
            console.log('📨 Received message:', message.body);
            try {
              const update: CodeUpdate = JSON.parse(message.body);
              // Use the ref to call the latest callback
              onCodeUpdateRef.current(update.code);
            } catch (error) {
              console.error('Failed to parse message:', error);
            }
          });
          console.log('📡 Subscribed to /topic/session/' + sessionId);
        } catch (error) {
          console.error('❌ Failed to subscribe:', error);
        }
      },
      
      onDisconnect: () => {
        console.log('❌ WebSocket Disconnected');
        setConnected(false);
        reconnectAttempts.current++;
      },
      
      onStompError: (frame) => {
        console.error('❌ STOMP error:');
        console.error('  Command:', frame.command);
        console.error('  Headers:', frame.headers);
        console.error('  Body:', frame.body);
        setConnected(false);
        reconnectAttempts.current++;
      },
      
      onWebSocketError: (error) => {
        console.error('❌ WebSocket error:', error);
        setConnected(false);
        reconnectAttempts.current++;
      },
      
      onWebSocketClose: (event) => {
        console.log('❌ WebSocket closed:');
        console.log('  Code:', event.code);
        console.log('  Reason:', event.reason || 'No reason provided');
        console.log('  Was Clean:', event.wasClean);
        console.log('  Type:', event.type);
        setConnected(false);
        
        // If we've exceeded max attempts, stop trying
        if (reconnectAttempts.current >= maxReconnectAttempts) {
          console.warn('⚠️ Max reconnection attempts reached. WebSocket collaboration disabled.');
          console.warn('⚠️ The app will still work, but real-time collaboration is unavailable.');
        }
      }
    });

    clientRef.current = client;
    
    // Activate the client
    try {
      client.activate();
    } catch (error) {
      console.error('❌ Failed to activate WebSocket client:', error);
      reconnectAttempts.current++;
    }

    return () => {
      console.log('🔌 Deactivating WebSocket client');
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [sessionId]); // Removed onCodeUpdate from dependencies

  const sendCodeUpdate = useCallback((code: string) => {
    if (clientRef.current?.connected) {
      try {
        clientRef.current.publish({
          destination: `/app/session/${sessionId}/code`,
          body: JSON.stringify({
            code,
            userId: 'user-' + Math.random().toString(36).substr(2, 9),
            timestamp: Date.now()
          })
        });
        console.log('📤 Sent code update');
      } catch (error) {
        console.error('❌ Failed to send code update:', error);
      }
    } else {
      console.warn('⚠️ Cannot send update: WebSocket not connected (attempts:', reconnectAttempts.current + ')');
    }
  }, [sessionId]);

  return { connected, sendCodeUpdate };
}
