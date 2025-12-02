import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Users, Zap, Calendar } from 'lucide-react';
import { createSession } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
    const navigate = useNavigate();
    const { isInterviewer } = useAuth();
    const [creating, setCreating] = useState(false);

    const handleCreateSession = async () => {
        setCreating(true);
        try {
            const session = await createSession();
            navigate(`/session/${session.id}`);
        } catch (error) {
            console.error('Failed to create session:', error);
            alert('Failed to create session. Please try again.');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center mb-4">
                        <Code2 size={64} className="text-blue-400" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Code Interview Platform
                    </h1>
                    <p className="text-xl text-gray-300">
                        Real-time collaborative coding with multi-language support
                    </p>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700">
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="flex flex-col items-center text-center p-4">
                            <Users size={48} className="text-blue-400 mb-3" />
                            <h3 className="text-lg font-semibold text-white mb-2">Real-time Collaboration</h3>
                            <p className="text-gray-400 text-sm">
                                Code together with live updates
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center p-4">
                            <Code2 size={48} className="text-green-400 mb-3" />
                            <h3 className="text-lg font-semibold text-white mb-2">13+ Languages</h3>
                            <p className="text-gray-400 text-sm">
                                Syntax highlighting for all major languages
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center p-4">
                            <Zap size={48} className="text-yellow-400 mb-3" />
                            <h3 className="text-lg font-semibold text-white mb-2">Instant Execution</h3>
                            <p className="text-gray-400 text-sm">
                                Execute code securely via Judge0
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        {isInterviewer && (
                            <button
                                onClick={() => navigate('/setup-interview')}
                                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                            >
                                <Calendar size={24} />
                                Schedule Interview
                            </button>
                        )}
                        <button
                            onClick={handleCreateSession}
                            disabled={creating}
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            {creating ? (
                                <span className="flex items-center space-x-2">
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                    <span>Creating...</span>
                                </span>
                            ) : (
                                'Quick Practice Session'
                            )}
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center text-gray-400 text-sm">
                    <p>Supported languages: JavaScript, TypeScript, Python, Java, C++, C, C#, Go, Rust, PHP, Ruby, Swift, Kotlin</p>
                    <p className="mt-2 text-green-400">✓ All languages execute securely via Judge0</p>
                </div>
            </div>
        </div>
    );
}
