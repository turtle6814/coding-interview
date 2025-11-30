import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../services/api';
import { Code2, Loader2 } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleCreateSession = async () => {
        setLoading(true);
        try {
            const session = await createSession();
            navigate(`/session/${session.id}`);
        } catch (error) {
            console.error(error);
            alert('Failed to create session');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <div className="text-center space-y-6">
                <div className="flex items-center justify-center space-x-3">
                    <Code2 size={64} className="text-blue-500" />
                    <h1 className="text-5xl font-bold">CodeInterview</h1>
                </div>
                <p className="text-xl text-gray-400">Real-time collaborative coding interview platform</p>
                <button
                    onClick={handleCreateSession}
                    disabled={loading}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <span>Start New Interview</span>}
                </button>
            </div>
        </div>
    );
}
