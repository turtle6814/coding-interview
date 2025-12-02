import { useState, useEffect, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { sendMessage, getSessionMessages } from '../services/api';

interface Message {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  type: 'TEXT' | 'SYSTEM';
  createdAt: string;
}

interface UseChatReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendChatMessage: (content: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
}

export const useChat = (sessionId: number, userId: number): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create WebSocket connection
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log('STOMP Debug (Chat):', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('✅ Chat WebSocket connected');

      // Subscribe to chat messages
      client.subscribe(`/topic/session/${sessionId}/chat`, (message) => {
        const chatMessage = JSON.parse(message.body);
        console.log('💬 Chat message received:', chatMessage);
        setMessages((prev) => {
          // Check if message already exists
          const exists = prev.some((m) => m.id === chatMessage.id);
          if (exists) {
            return prev;
          }
          return [...prev, chatMessage];
        });
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP error:', frame);
    };

    client.activate();

    // Load initial messages
    loadMessages();

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [sessionId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const fetchedMessages = await getSessionMessages(sessionId);
      setMessages(fetchedMessages);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = useCallback(
    async (content: string) => {
      try {
        await sendMessage({
          sessionId,
          senderId: userId,
          content,
          type: 'TEXT',
        });
        // Message will be added via WebSocket
      } catch (err: any) {
        setError(err.message || 'Failed to send message');
        throw err;
      }
    },
    [sessionId, userId]
  );

  const refreshMessages = useCallback(async () => {
    await loadMessages();
  }, [sessionId]);

  return {
    messages,
    loading,
    error,
    sendChatMessage,
    refreshMessages,
  };
};
