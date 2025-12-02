import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Play, MessageSquare } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import LanguageSelector from '../components/LanguageSelector';
import TimerDisplay from '../components/TimerDisplay';
import QuestionPanel from '../components/QuestionPanel';
import ChatPanel from '../components/ChatPanel';
import { useCollaboration } from '../hooks/useCollaboration';
import { useTimer } from '../hooks/useTimer';
import { useChat } from '../hooks/useChat';
import { getSession, updateSession, executeCode } from '../services/api';

export default function CandidateSessionPage() {
    const { id } = useParams<{ id: string }>();
    const sessionId = id ? parseInt(id) : 0;
    
    // User info from auth context (mock for now - integrate with real auth)
    const userId = 2; // Replace with actual auth user ID
    
    // Code editor state
    const [code, setCode] = useState('// Loading...');
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLocalChange = useRef(false);

    // Session data
    const [questionData, setQuestionData] = useState<any>(null);

    // Custom hooks for real-time features
    const { connected, sendCodeUpdate } = useCollaboration(id || '', (newCode) => {
        isLocalChange.current = false;
        setCode(newCode);
    });

    const { timeRemaining, timerStatus, timerDuration } = useTimer(sessionId);

    const { 
        messages, 
        loading: chatLoading, 
        sendChatMessage 
    } = useChat(sessionId, userId);

    // Default code templates
    const getDefaultCode = (lang: string): string => {
        const templates: Record<string, string> = {
            javascript: '// JavaScript\nfunction solution() {\n    // Your code here\n}\n',
            typescript: '// TypeScript\nfunction solution(): any {\n    // Your code here\n}\n',
            python: '# Python\ndef solution():\n    # Your code here\n    pass\n',
            java: '// Java\npublic class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}\n',
            cpp: '// C++\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}\n',
        };
        return templates[lang] || '// Start coding...';
    };

    // Load session data
    useEffect(() => {
        if (sessionId) {
            getSession(sessionId)
                .then(session => {
                    setLanguage(session.language || 'javascript');
                    setCode(session.code || getDefaultCode(session.language || 'javascript'));
                    
                    // Mock question data - replace with actual API call to get question by session.questionId
                    setQuestionData({
                        id: 1,
                        title: 'Coding Challenge',
                        description: 'Solve the given problem...',
                        difficulty: 'Medium',
                        timeLimit: 45,
                        sampleInput: 'Input: [1, 2, 3]',
                        sampleOutput: 'Output: 6',
                        hints: ['Consider edge cases', 'Think about time complexity'],
                        starterCode: { javascript: '// Start here' }
                    });
                    
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to load session:', err);
                    setCode('// Error: Session not found');
                    setLoading(false);
                });
        }

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [sessionId]);

    const saveCodeToBackend = async (newCode: string) => {
        if (!sessionId) return;
        
        try {
            await updateSession(sessionId, newCode);
        } catch (error) {
            console.error('Failed to save:', error);
        }
    };

    const handleCodeChange = (newCode: string) => {
        isLocalChange.current = true;
        setCode(newCode);
        sendCodeUpdate(newCode);
        
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            saveCodeToBackend(newCode);
        }, 1000);
    };

    const handleLanguageChange = (newLanguage: string) => {
        setLanguage(newLanguage);
        saveCodeToBackend(code);
    };

    const runCode = async () => {
        setOutput(['⏳ Executing...']);
        setExecuting(true);
        
        try {
            const result = await executeCode(code, language);
            setExecuting(false);
            
            if (result.success) {
                const outputLines = result.output.trim().split('\n');
                setOutput([
                    '--- Execution Start ---',
                    ...outputLines,
                    '--- Execution End ---'
                ]);
            } else {
                const outputLines = result.output ? result.output.trim().split('\n') : [];
                setOutput([
                    '--- Execution Start ---',
                    ...outputLines,
                    `❌ ${result.error}`,
                    '--- Execution End ---'
                ]);
            }
        } catch (error) {
            setExecuting(false);
            setOutput([
                '--- Execution Start ---',
                `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                '--- Execution End ---'
            ]);
        }
    };

    const handleSendMessage = async (content: string) => {
        await sendChatMessage(content);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-lg">Loading session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-bold">Coding Interview</h1>
                    <TimerDisplay
                        timeRemaining={timeRemaining}
                        timerStatus={timerStatus}
                        timerDuration={timerDuration}
                        showControls={false} // Candidates cannot control timer
                    />
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${connected ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                        {connected ? '● Live' : '○ Disconnected'}
                    </span>
                </div>
                <div className="flex items-center space-x-3">
                    <LanguageSelector 
                        value={language} 
                        onChange={handleLanguageChange}
                    />
                    <button
                        onClick={() => setShowChat(!showChat)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                            showChat
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                    >
                        <MessageSquare size={18} />
                        <span>Chat</span>
                    </button>
                    <button 
                        onClick={runCode} 
                        disabled={executing}
                        className="flex items-center space-x-2 px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-all shadow-lg"
                    >
                        <Play size={18} />
                        <span>{executing ? 'Running...' : 'Run Code'}</span>
                    </button>
                </div>
            </header>

            {/* Main content - Two panel layout */}
            <main className="flex-1 flex overflow-hidden">
                {/* Left Panel - Question */}
                <div className="w-80 border-r border-gray-700 overflow-y-auto">
                    {questionData && (
                        <QuestionPanel
                            question={questionData}
                        />
                    )}
                </div>

                {/* Right Panel - Code Editor */}
                <div className="flex-1 flex flex-col">
                    <CodeEditor 
                        code={code} 
                        language={language} 
                        onChange={handleCodeChange} 
                    />
                    
                    {/* Console Output */}
                    {output.length > 0 && (
                        <div className="h-48 border-t border-gray-700 bg-gray-950 p-4 overflow-auto">
                            <div className="text-xs font-semibold text-gray-400 mb-2">Console Output</div>
                            <div className="font-mono text-sm text-gray-300 whitespace-pre-wrap">
                                {output.map((line, i) => (
                                    <div 
                                        key={i} 
                                        className={`mb-1 ${
                                            line.includes('❌') || line.startsWith('ERROR:') 
                                                ? 'text-red-400 font-semibold' 
                                                : line.startsWith('---')
                                                ? 'text-gray-500 border-t border-gray-800 pt-2 mt-2'
                                                : ''
                                        }`}
                                    >
                                        {line}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Chat Overlay (when toggled) */}
                {showChat && (
                    <div className="absolute right-4 bottom-4 w-96 h-96 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl flex flex-col">
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700 rounded-t-lg">
                            <div className="flex items-center space-x-2">
                                <MessageSquare size={18} className="text-blue-400" />
                                <span className="font-semibold text-sm">Chat with Interviewer</span>
                            </div>
                            <button
                                onClick={() => setShowChat(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <ChatPanel
                                messages={messages}
                                loading={chatLoading}
                                onSendMessage={handleSendMessage}
                                currentUserId={userId}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
