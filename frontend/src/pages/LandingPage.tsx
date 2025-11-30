import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Users, Zap, Share2 } from 'lucide-react';
import { createSession } from '../services/api';

export default function LandingPage() {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Code2 size={48} className="text-blue-400" />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Collaborative Code Editor
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Create instant coding interview sessions. Share a link. Collaborate in real-time.
          </p>
        </header>

        {/* CTA Section */}
        <div className="max-w-md mx-auto mb-20">
          <button
            onClick={handleCreateSession}
            disabled={creating}
            className="w-full py-4 px-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
          >
            {creating ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Creating Session...</span>
              </>
            ) : (
              <>
                <Code2 size={24} />
                <span>Create New Session</span>
              </>
            )}
          </button>
          <p className="text-center text-gray-400 text-sm mt-4">
            No sign-up required • Free to use • Instant setup
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600/20 rounded-lg mb-4">
              <Users size={24} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-time Collaboration</h3>
            <p className="text-gray-400">
              Multiple users can code together simultaneously with instant synchronization.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-center w-12 h-12 bg-green-600/20 rounded-lg mb-4">
              <Zap size={24} className="text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Run Code Instantly</h3>
            <p className="text-gray-400">
              Execute JavaScript, Python, and Java code directly in the browser.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-600/20 rounded-lg mb-4">
              <Share2 size={24} className="text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Sharing</h3>
            <p className="text-gray-400">
              Share a simple link with candidates. No installation or setup required.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Create a Session</h4>
                <p className="text-gray-400">Click "Create New Session" to generate a unique interview room.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Share the Link</h4>
                <p className="text-gray-400">Copy and send the session link to your candidate via email or chat.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Code Together</h4>
                <p className="text-gray-400">Both you and your candidate can write, edit, and run code in real-time.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
