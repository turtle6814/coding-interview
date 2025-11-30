import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getSession } from '../services/api';
import { useCollaboration } from '../hooks/useCollaboration';
import CodeEditor from '../components/CodeEditor';
import { Play, Share2, Terminal } from 'lucide-react';

export default function EditorPage() {
    const { id } = useParams<{ id: string }>();
    const [code, setCode] = useState('// Loading...');
    const [output, setOutput] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        if (id) {
            getSession(id).then(session => {
                setCode(session.code);
                setLoading(false);
            }).catch(err => {
                console.error('Failed to load session:', err);
                setCode('// Error: Session not found. Please create a new session.');
                setLoading(false);
            });
        }

        // Initialize worker
        workerRef.current = new Worker(new URL('../workers/executor.js', import.meta.url), { type: 'module' });
        workerRef.current.onmessage = (e) => {
            const { type, logs, error } = e.data;
            if (type === 'success') {
                setOutput(prev => [...prev, '--- Execution Start ---', ...logs, '--- Execution End ---']);
            } else {
                setOutput(prev => [...prev, '--- Execution Start ---', ...logs, `Error: ${error}`, '--- Execution End ---']);
            }
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, [id]);

    const { connected, sendCodeUpdate } = useCollaboration(id || '', (newCode) => {
        setCode(newCode);
    });

    const handleCodeChange = (newCode: string) => {
        setCode(newCode);
        sendCodeUpdate(newCode);
    };

    const runCode = () => {
        setOutput([]);
        workerRef.current?.postMessage(code);
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    if (loading) return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            <header className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-bold">Session: {id}</h1>
                    <span className={`px-2 py-1 text-xs rounded ${connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {connected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={copyLink} className="p-2 hover:bg-gray-700 rounded-lg transition-colors" title="Share Session">
                        <Share2 size={20} />
                    </button>
                    <button onClick={runCode} className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors">
                        <Play size={18} />
                        <span>Run</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                <div className="flex-1 border-r border-gray-700">
                    <CodeEditor code={code} onChange={handleCodeChange} />
                </div>
                <div className="w-1/3 flex flex-col bg-gray-950">
                    <div className="flex items-center px-4 py-2 bg-gray-900 border-b border-gray-800">
                        <Terminal size={16} className="mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-300">Output</span>
                    </div>
                    <div className="flex-1 p-4 font-mono text-sm overflow-auto text-gray-300">
                        {output.length === 0 ? (
                            <span className="text-gray-600 italic">Run code to see output...</span>
                        ) : (
                            output.map((line, i) => (
                                <div key={i} className="mb-1">{line}</div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
