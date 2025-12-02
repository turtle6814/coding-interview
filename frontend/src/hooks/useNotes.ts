import { useState, useEffect, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { createNote, getSessionNotes } from '../services/api';

interface Note {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  isPrivate: boolean;
  type: 'GENERAL' | 'CODE_COMMENT' | 'OBSERVATION';
  codeSnapshot?: string;
  lineNumber?: number;
  createdAt: string;
}

interface UseNotesReturn {
  notes: Note[];
  loading: boolean;
  error: string | null;
  addNote: (content: string, isPrivate: boolean, type?: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
}

export const useNotes = (sessionId: number, userId: number, isInterviewer: boolean): UseNotesReturn => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create WebSocket connection
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log('STOMP Debug (Notes):', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('✅ Notes WebSocket connected');

      // Subscribe to public notes
      client.subscribe(`/topic/session/${sessionId}/notes`, (message) => {
        const note = JSON.parse(message.body);
        console.log('📝 Public note received:', note);
        setNotes((prev) => {
          // Check if note already exists
          const exists = prev.some((n) => n.id === note.id);
          if (exists) {
            return prev.map((n) => (n.id === note.id ? note : n));
          }
          return [...prev, note];
        });
      });

      // Subscribe to private notes (interviewer only)
      if (isInterviewer) {
        client.subscribe(`/topic/session/${sessionId}/notes/private`, (message) => {
          const note = JSON.parse(message.body);
          console.log('🔒 Private note received:', note);
          setNotes((prev) => {
            const exists = prev.some((n) => n.id === note.id);
            if (exists) {
              return prev.map((n) => (n.id === note.id ? note : n));
            }
            return [...prev, note];
          });
        });
      }
    };

    client.onStompError = (frame) => {
      console.error('STOMP error:', frame);
    };

    client.activate();

    // Load initial notes
    loadNotes();

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [sessionId, isInterviewer]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const fetchedNotes = await getSessionNotes(sessionId, isInterviewer);
      setNotes(fetchedNotes);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load notes');
      console.error('Error loading notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const addNote = useCallback(
    async (content: string, isPrivate: boolean, type: string = 'GENERAL') => {
      try {
        const note = await createNote({
          sessionId,
          authorId: userId,
          content,
          isPrivate,
          type,
        });
        // Note will be added via WebSocket
        return note;
      } catch (err: any) {
        setError(err.message || 'Failed to add note');
        throw err;
      }
    },
    [sessionId, userId]
  );

  const refreshNotes = useCallback(async () => {
    await loadNotes();
  }, [sessionId, isInterviewer]);

  return {
    notes,
    loading,
    error,
    addNote,
    refreshNotes,
  };
};
