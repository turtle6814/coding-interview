import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Download, 
    ArrowLeft, 
    Clock, 
    CheckCircle, 
    XCircle,
    FileText,
    MessageSquare,
    Code
} from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import TestCaseResults from '../components/TestCaseResults';
import { getSession, getSessionResults, getSessionNotes, getSessionMessages } from '../services/api';

interface SessionReview {
    code: string;
    language: string;
    questionTitle: string;
    questionDescription: string;
    difficulty: string;
    candidateName: string;
    interviewerName: string;
    startedAt: string;
    endedAt: string;
    duration: number;
    status: string;
}

export default function SessionReviewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const sessionId = id ? parseInt(id) : 0;
    
    const [loading, setLoading] = useState(true);
    const [sessionData, setSessionData] = useState<SessionReview | null>(null);
    const [results, setResults] = useState<any[]>([]);
    const [notes, setNotes] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(0);
    const [activeSection, setActiveSection] = useState<'code' | 'results' | 'notes' | 'chat'>('code');

    useEffect(() => {
        if (sessionId) {
            loadSessionData();
        }
    }, [sessionId]);

    const loadSessionData = async () => {
        try {
            setLoading(true);
            
            // Load session details
            const session = await getSession(sessionId);
            
            // Mock session review data - replace with actual API
            setSessionData({
                code: session.code || '// No code submitted',
                language: session.language || 'javascript',
                questionTitle: 'Two Sum Problem',
                questionDescription: 'Find two numbers that add up to target...',
                difficulty: 'Medium',
                candidateName: 'John Doe',
                interviewerName: 'Jane Smith',
                startedAt: new Date().toISOString(),
                endedAt: new Date().toISOString(),
                duration: 45,
                status: 'COMPLETED'
            });

            // Load test results
            try {
                const testResults = await getSessionResults(sessionId);
                setResults(testResults || []);
            } catch (err) {
                console.error('Failed to load results:', err);
            }

            // Load notes
            try {
                const sessionNotes = await getSessionNotes(sessionId, true);
                setNotes(sessionNotes || []);
            } catch (err) {
                console.error('Failed to load notes:', err);
            }

            // Load chat messages
            try {
                const chatMessages = await getSessionMessages(sessionId);
                setMessages(chatMessages || []);
            } catch (err) {
                console.error('Failed to load messages:', err);
            }

            setLoading(false);
        } catch (error) {
            console.error('Failed to load session review:', error);
            setLoading(false);
        }
    };

    const calculateScore = () => {
        if (results.length === 0) return { passed: 0, total: 0, percentage: 0 };
        
        const passed = results.filter(r => r.passed).length;
        const total = results.length;
        const percentage = Math.round((passed / total) * 100);
        
        return { passed, total, percentage };
    };

    const exportToPDF = () => {
        // Placeholder for PDF export functionality
        alert('PDF export feature coming soon!');
    };

    const exportToJSON = () => {
        const exportData = {
            session: sessionData,
            results,
            notes,
            messages,
            feedback,
            rating,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `interview-session-${sessionId}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-lg">Loading session review...</p>
                </div>
            </div>
        );
    }

    if (!sessionData) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <XCircle size={64} className="mx-auto mb-4 text-red-500" />
                    <p className="text-xl">Session not found</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const score = calculateScore();

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="px-6 py-4 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold">Session Review</h1>
                            <p className="text-sm text-gray-400 mt-1">
                                {sessionData.candidateName} • {sessionData.questionTitle}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={exportToJSON}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            <Download size={18} />
                            <span>Export JSON</span>
                        </button>
                        <button
                            onClick={exportToPDF}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            <Download size={18} />
                            <span>Export PDF</span>
                        </button>
                    </div>
                </div>

                {/* Session Summary */}
                <div className="mt-4 grid grid-cols-4 gap-4">
                    <div className="bg-gray-900 p-4 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Status</div>
                        <div className="flex items-center space-x-2">
                            <CheckCircle size={20} className="text-green-500" />
                            <span className="font-semibold">{sessionData.status}</span>
                        </div>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Duration</div>
                        <div className="flex items-center space-x-2">
                            <Clock size={20} className="text-blue-500" />
                            <span className="font-semibold">{formatDuration(sessionData.duration)}</span>
                        </div>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Test Score</div>
                        <div className="flex items-center space-x-2">
                            {score.percentage >= 70 ? (
                                <CheckCircle size={20} className="text-green-500" />
                            ) : (
                                <XCircle size={20} className="text-red-500" />
                            )}
                            <span className="font-semibold">
                                {score.passed}/{score.total} ({score.percentage}%)
                            </span>
                        </div>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Difficulty</div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            sessionData.difficulty === 'Easy'
                                ? 'bg-green-500/20 text-green-400'
                                : sessionData.difficulty === 'Medium'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                        }`}>
                            {sessionData.difficulty}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden flex">
                {/* Left Panel - Sections */}
                <div className="w-64 border-r border-gray-700 bg-gray-800">
                    <nav className="p-4 space-y-2">
                        <button
                            onClick={() => setActiveSection('code')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                activeSection === 'code'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            <Code size={20} />
                            <span>Code Snapshot</span>
                        </button>
                        <button
                            onClick={() => setActiveSection('results')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                activeSection === 'results'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            <CheckCircle size={20} />
                            <span>Test Results</span>
                        </button>
                        <button
                            onClick={() => setActiveSection('notes')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                activeSection === 'notes'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            <FileText size={20} />
                            <span>Notes ({notes.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveSection('chat')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                activeSection === 'chat'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-400 hover:bg-gray-700'
                            }`}
                        >
                            <MessageSquare size={20} />
                            <span>Chat History ({messages.length})</span>
                        </button>
                    </nav>
                </div>

                {/* Right Panel - Content */}
                <div className="flex-1 overflow-y-auto">
                    {activeSection === 'code' && (
                        <div className="h-full">
                            <CodeEditor 
                                code={sessionData.code} 
                                language={sessionData.language}
                                onChange={() => {}} // Read-only, no-op onChange
                            />
                        </div>
                    )}

                    {activeSection === 'results' && (
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Test Results</h2>
                            {results.length > 0 ? (
                                <TestCaseResults results={results} />
                            ) : (
                                <div className="text-center text-gray-500 py-12">
                                    <p>No test results available</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'notes' && (
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Interview Notes</h2>
                            {notes.length > 0 ? (
                                <div className="space-y-4">
                                    {notes.map((note, index) => (
                                        <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-semibold text-blue-400">
                                                    {note.authorName || 'Anonymous'}
                                                </span>
                                                <div className="flex items-center space-x-2 text-xs text-gray-400">
                                                    {note.isPrivate && (
                                                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                                                            Private
                                                        </span>
                                                    )}
                                                    <span>{new Date(note.createdAt).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <p className="text-gray-300">{note.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-12">
                                    <FileText size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>No notes recorded</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'chat' && (
                        <div className="p-6">
                            <h2 className="text-xl font-bold mb-4">Chat History</h2>
                            {messages.length > 0 ? (
                                <div className="space-y-3">
                                    {messages.map((msg, index) => (
                                        <div key={index} className="flex space-x-3">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-semibold">
                                                {msg.senderName?.charAt(0) || '?'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className="text-sm font-semibold">{msg.senderName}</span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-300 bg-gray-800 p-3 rounded-lg">
                                                    {msg.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-12">
                                    <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>No messages exchanged</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Feedback Panel */}
                <div className="w-96 border-l border-gray-700 bg-gray-800 p-6 overflow-y-auto">
                    <h3 className="text-lg font-bold mb-4">Interviewer Feedback</h3>
                    
                    {/* Rating */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">Overall Rating</label>
                        <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`text-3xl ${
                                        star <= rating ? 'text-yellow-500' : 'text-gray-600'
                                    } hover:text-yellow-400 transition-colors`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Feedback Text */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">Comments</label>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Share your feedback about the candidate's performance..."
                            className="w-full h-48 bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        onClick={() => alert('Feedback saved! (Backend integration needed)')}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                    >
                        Save Feedback
                    </button>
                </div>
            </main>
        </div>
    );
}
