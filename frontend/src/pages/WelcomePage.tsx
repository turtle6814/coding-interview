import { Link } from 'react-router-dom';
import { Code2, Users, Zap, Shield, Globe, Award } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center">
            {/* Logo/Badge */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-50"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full">
                  <Code2 size={48} className="text-white" />
                </div>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                Ace Your
              </span>
              <br />
              <span className="text-white">Coding Interviews</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              The ultimate platform for conducting live technical interviews with real-time collaboration,
              auto-grading, and comprehensive feedback.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                to="/register"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-lg"
              >
                <span className="relative z-10">Get Started Free</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg border-2 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-200 text-lg"
              >
                Sign In
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">50+</div>
                <div className="text-sm md:text-base text-gray-400">Languages</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">Real-time</div>
                <div className="text-sm md:text-base text-gray-400">Collaboration</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">AI-Powered</div>
                <div className="text-sm md:text-base text-gray-400">Grading</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative bg-slate-900/50 backdrop-blur-sm py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything you need for technical interviews
            </h2>
            <p className="text-xl text-gray-400">
              Professional tools for both interviewers and candidates
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all duration-300">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Code2 className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Live Code Editor</h3>
              <p className="text-gray-400">
                Monaco-powered editor with syntax highlighting, auto-completion, and support for 50+ programming languages.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all duration-300">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Real-time Collaboration</h3>
              <p className="text-gray-400">
                See code changes instantly with WebSocket-powered synchronization. Chat, share notes, and collaborate seamlessly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all duration-300">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Auto-Grading</h3>
              <p className="text-gray-400">
                Automated test execution powered by Judge0. Run test cases and get instant feedback on code correctness.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all duration-300">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Secure & Private</h3>
              <p className="text-gray-400">
                Role-based access control, private notes for interviewers, and secure session management.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all duration-300">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Session Management</h3>
              <p className="text-gray-400">
                Built-in timer, session recording, and comprehensive review tools with exportable feedback.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all duration-300">
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 w-14 h-14 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Award className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Question Bank</h3>
              <p className="text-gray-400">
                Curated collection of coding problems with test cases, difficulty levels, and detailed solutions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-400">
              Three simple steps to conduct professional technical interviews
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Create Session</h3>
              <p className="text-gray-400">
                Select a question from the question bank or create your own. Set the duration and invite candidates.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Conduct Interview</h3>
              <p className="text-gray-400">
                Watch candidates code in real-time, chat, take notes, and run automated tests as they progress.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-pink-500 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Review & Decide</h3>
              <p className="text-gray-400">
                Access detailed session review with code snapshot, test results, and comprehensive feedback.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to transform your technical interviews?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of companies conducting better interviews
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 text-lg shadow-lg"
              >
                Start Free Trial
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white hover:bg-white/10 transition-all duration-200 text-lg"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2025 Coding Interview Platform. Built for better technical interviews.</p>
          </div>
        </div>
      </div>

      {/* Add animation styles */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
