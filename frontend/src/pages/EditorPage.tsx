import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Share2, Terminal, Check } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import LanguageSelector from '../components/LanguageSelector';
import { useCollaboration } from '../hooks/useCollaboration';
import { getSession, updateSession, executeCode } from '../services/api';

export default function EditorPage() {
    const { id } = useParams<{ id: string }>();
    const [code, setCode] = useState('// Loading...');
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [linkCopied, setLinkCopied] = useState(false);
    const [executing, setExecuting] = useState(false);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLocalChange = useRef(false);

    // Default code templates for different languages
    const getDefaultCode = (lang: string): string => {
        const templates: Record<string, string> = {
            javascript: '// JavaScript\nconsole.log("Hello, World!");',
            typescript: '// TypeScript\nconst message: string = "Hello, World!";\nconsole.log(message);',
            python: '# Python\nprint("Hello, World!")',
            java: '// Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
            cpp: '// C++\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
            c: '// C\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
            csharp: '// C#\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}',
            go: '// Go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
            rust: '// Rust\nfn main() {\n    println!("Hello, World!");\n}',
            php: '<?php\n// PHP\necho "Hello, World!";\n?>',
            ruby: '# Ruby\nputs "Hello, World!"',
            swift: '// Swift\nprint("Hello, World!")',
            kotlin: '// Kotlin\nfun main() {\n    println("Hello, World!")\n}',
        };
        return templates[lang] || '// Start coding...';
    };

    useEffect(() => {
        console.log('📍 EditorPage mounted for session:', id);
        
        if (id) {
            console.log('🔄 Fetching session data...');
            getSession(id)
                .then(session => {
                    console.log('✅ Session loaded:', session);
                    setLanguage(session.language || 'javascript');
                    setCode(session.code || getDefaultCode(session.language || 'javascript'));
                    setLoading(false);
                })
                .catch(err => {
                    console.error('❌ Failed to load session:', err);
                    setCode('// Error: Session not found. Please create a new session.');
                    setLoading(false);
                });
        }

        return () => {
            console.log('🧹 Cleaning up EditorPage...');
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [id]);

    const { connected, sendCodeUpdate } = useCollaboration(id || '', (newCode) => {
        console.log('📨 Received code update from WebSocket');
        isLocalChange.current = false;
        setCode(newCode);
    });

    const saveCodeToBackend = async (newCode: string) => {
        if (!id) return;
        
        console.log('💾 Saving to backend...');
        try {
            await updateSession(id, newCode);
            console.log('✅ Saved successfully');
        } catch (error) {
            console.error('❌ Failed to save:', error);
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
        console.log('🔄 Changing language to:', newLanguage);
        setLanguage(newLanguage);
        
        // Save the language change
        saveCodeToBackend(code);
    };

    const runCode = async () => {
        console.log('▶️ Running code with language:', language);
        
        setOutput(['⏳ Executing...']);
        setExecuting(true);
        
        try {
            // Use backend Judge0 execution for ALL languages
            console.log('📤 Sending to Judge0 for execution...');
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
            console.error('❌ Failed to execute:', error);
            setExecuting(false);
            setOutput([
                '--- Execution Start ---',
                `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'Make sure the backend is running and Judge0 API key is configured.',
                '--- Execution End ---'
            ]);
        }
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (error) {
            const textArea = document.createElement('textarea');
            textArea.value = window.location.href;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
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
                    <p className="text-lg">Loading session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            <header className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-bold">Session: {id?.slice(0, 8)}...</h1>
                    <LanguageSelector 
                        value={language} 
                        onChange={handleLanguageChange}
                    />
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${connected ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                        {connected ? '● Live' : '○ Disconnected'}
                    </span>
                </div>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={copyLink} 
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                            linkCopied 
                                ? 'bg-green-600 text-white shadow-lg' 
                                : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                    >
                        {linkCopied ? (
                            <>
                                <Check size={20} />
                                <span className="text-sm">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Share2 size={20} />
                                <span className="text-sm hidden sm:inline">Share</span>
                            </>
                        )}
                    </button>
                    <button 
                        onClick={runCode} 
                        disabled={executing}
                        className="flex items-center space-x-2 px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                    >
                        <Play size={18} />
                        <span>{executing ? 'Running...' : 'Run Code'}</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                <div className="flex-1 border-r border-gray-700">
                    <CodeEditor code={code} language={language} onChange={handleCodeChange} />
                </div>
                <div className="w-1/3 flex flex-col bg-gray-950">
                    <div className="flex items-center px-4 py-3 bg-gray-900 border-b border-gray-800">
                        <Terminal size={18} className="mr-2 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-300">Console Output</span>
                        <span className="ml-auto text-xs text-green-400">
                            ✓ All languages supported
                        </span>
                    </div>
                    <div className="flex-1 p-4 font-mono text-sm overflow-auto text-gray-300 whitespace-pre-wrap">
                        {output.length === 0 ? (
                            <div className="text-center text-gray-500 italic mt-8">
                                <Terminal size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Click "Run Code" to execute...</p>
                                <p className="mt-4 text-green-400 text-xs">
                                    All languages execute via Judge0
                                </p>
                            </div>
                        ) : (
                            output.map((line, i) => (
                                <div 
                                    key={i} 
                                    className={`mb-1 ${
                                        line.includes('❌') || line.startsWith('ERROR:') 
                                            ? 'text-red-400 font-semibold' 
                                            : line.startsWith('WARNING:')
                                            ? 'text-yellow-400'
                                            : line.startsWith('---')
                                            ? 'text-gray-500 border-t border-gray-800 pt-2 mt-2'
                                            : ''
                                    }`}
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
