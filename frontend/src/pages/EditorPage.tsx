import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Share2, Terminal, Check } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import { useCollaboration } from '../hooks/useCollaboration';
import { getSession, updateSession } from '../services/api';

export default function EditorPage() {
    const { id } = useParams<{ id: string }>();
    const [code, setCode] = useState('// Loading...');
    const [output, setOutput] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [linkCopied, setLinkCopied] = useState(false);
    const [executing, setExecuting] = useState(false);
    const workerRef = useRef<Worker | null>(null);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        try {
            workerRef.current = new Worker(
                new URL('../workers/executor.js', import.meta.url), 
                { type: 'module' }
            );
            
            workerRef.current.onmessage = (e) => {
                const { type, logs, error } = e.data;
                setExecuting(false);
                
                if (type === 'success') {
                    setOutput(prev => [...prev, '--- Execution Start ---', ...logs, '--- Execution End ---']);
                } else {
                    setOutput(prev => [...prev, '--- Execution Start ---', ...logs, `Error: ${error}`, '--- Execution End ---']);
                }
            };

            workerRef.current.onerror = (error) => {
                console.error('Worker error:', error);
                setExecuting(false);
                setOutput(prev => [...prev, '--- Execution Start ---', `Worker Error: ${error.message}`, '--- Execution End ---']);
            };
        } catch (error) {
            console.error('Failed to create worker:', error);
        }

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            workerRef.current?.terminate();
        };
    }, [id]);

    const { connected, sendCodeUpdate } = useCollaboration(id || '', (newCode) => {
        setCode(newCode);
    });

    const saveCodeToBackend = async (newCode: string) => {
        if (!id) return;
        
        try {
            await updateSession(id, newCode);
            console.log('✅ Code saved to backend');
        } catch (error) {
            console.error('❌ Failed to save code:', error);
        }
    };

    const handleCodeChange = (newCode: string) => {
        setCode(newCode);
        
        // Send to WebSocket for real-time collaboration
        sendCodeUpdate(newCode);
        
        // Debounce saving to backend (save after 1 second of no typing)
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            saveCodeToBackend(newCode);
        }, 1000);
    };

    const runCode = () => {
        if (!workerRef.current) {
            setOutput(['Error: Code executor not initialized']);
            return;
        }

        setOutput([]);
        setExecuting(true);
        
        try {
            workerRef.current.postMessage(code);
        } catch (error) {
            console.error('Failed to execute code:', error);
            setExecuting(false);
            setOutput([`Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
        }
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy link:', error);
            const textArea = document.createElement('textarea');
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>Loading session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            <header className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-bold">Session: {id?.slice(0, 8)}...</h1>
                    <span className={`px-2 py-1 text-xs rounded ${connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {connected ? '● Connected' : '○ Disconnected'}
                    </span>
                </div>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={copyLink} 
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                            linkCopied 
                                ? 'bg-green-600 text-white' 
                                : 'hover:bg-gray-700'
                        }`}
                        title={linkCopied ? 'Link Copied!' : 'Share Session'}
                    >
                        {linkCopied ? (
                            <>
                                <Check size={20} />
                                <span className="text-sm font-medium">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Share2 size={20} />
                                <span className="text-sm font-medium hidden sm:inline">Share</span>
                            </>
                        )}
                    </button>
                    <button 
                        onClick={runCode} 
                        disabled={executing}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                    >
                        <Play size={18} />
                        <span>{executing ? 'Running...' : 'Run'}</span>
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
                            <p className="text-gray-500 italic">Run code to see output...</p>
                        ) : (
                            output.map((line, i) => (
                                <div 
                                    key={i} 
                                    className={
                                        line.startsWith('Error:') || line.startsWith('ERROR:') 
                                            ? 'text-red-400' 
                                            : line.startsWith('WARNING:')
                                            ? 'text-yellow-400'
                                            : ''
                                    }
                                >
                                    {line}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
