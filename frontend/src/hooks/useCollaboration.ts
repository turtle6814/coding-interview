import { useEffect, useRef, useState } from 'react';
import { Client, type IMessage } from '@stomp/stompjs';
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
  const subscriptionRef = useRef<any>(null); // Changed from StompSubscription to any
  const onCodeUpdateRef = useRef(onCodeUpdate);
  const isActivatingRef = useRef(false);

  // Update callback ref
  useEffect(() => {
    onCodeUpdateRef.current = onCodeUpdate;
  }, [onCodeUpdate]);

  useEffect(() => {
    if (!sessionId || isActivatingRef.current) return;

    console.log('🔌 Setting up WebSocket for session:', sessionId);
    isActivatingRef.current = true;

    const client = new Client({
      webSocketFactory: () => {
        console.log('🔌 Creating WebSocket connection to http://localhost:8080/ws');
        return new SockJS('http://localhost:8080/ws');
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectionTimeout: 15000,
      
      onConnect: () => {
        console.log('✅ WebSocket Connected!');
        setConnected(true);
        
        try {
          // Subscribe to session updates
          subscriptionRef.current = client.subscribe(
            `/topic/session/${sessionId}`, 
            (message: IMessage) => {
              console.log('📨 Received message:', message.body);
              try {
                const update: CodeUpdate = JSON.parse(message.body);
                onCodeUpdateRef.current(update.code);
              } catch (error) {
                console.error('Failed to parse message:', error);
              }
            }
          );
          console.log('📡 Subscribed to /topic/session/' + sessionId);
        } catch (error) {
          console.error('❌ Failed to subscribe:', error);
        }
      },
      
      onDisconnect: () => {
        console.log('❌ WebSocket Disconnected');
        setConnected(false);
      },
      
      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame);
        setConnected(false);
      },
      
      onWebSocketError: (error) => {
        console.error('❌ WebSocket error:', error);
      },
      
      onWebSocketClose: (event) => {
        console.log('❌ WebSocket closed:', event.code, event.reason);
        setConnected(false);
      }
    });

    clientRef.current = client;
    
    try {
      client.activate();
      console.log('✅ WebSocket client activated');
    } catch (error) {
      console.error('❌ Failed to activate client:', error);
      isActivatingRef.current = false;
    }

    return () => {
      console.log('🔌 Cleaning up WebSocket connection');
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
      isActivatingRef.current = false;
    };
  }, [sessionId]);

  const sendCodeUpdate = (code: string) => {
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
      console.warn('⚠️ Cannot send update: WebSocket not connected');
    }
  };

  return { connected, sendCodeUpdate };
}
