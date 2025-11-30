import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface CodeUpdate {
    content: string;
}

export function useCollaboration(sessionId: string, onCodeUpdate: (code: string) => void) {
    const clientRef = useRef<Client | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            onConnect: () => {
                setConnected(true);
                client.subscribe(`/topic/session/${sessionId}`, (message) => {
                    const body: CodeUpdate = JSON.parse(message.body);
                    onCodeUpdate(body.content);
                });
            },
            onDisconnect: () => {
                setConnected(false);
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [sessionId, onCodeUpdate]);

    const sendCodeUpdate = (code: string) => {
        if (clientRef.current && clientRef.current.connected) {
            clientRef.current.publish({
                destination: `/app/session/${sessionId}/code`,
                body: JSON.stringify({ content: code }),
            });
        }
    };

    return { connected, sendCodeUpdate };
}
