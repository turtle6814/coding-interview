import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, BookOpen, Send } from 'lucide-react';
import { getQuestions, getCandidates, createInterviewSession } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Question {
  id: string;
  title: string;
  difficulty: string;
  topic: string;
  timeLimit?: number;
}

interface Candidate {
  id: string;
  username: string;
  email: string;
  role: string;
}

const InterviewSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    questionId: '',
    candidateId: '',
    scheduledStartTime: '',
    timerDuration: 45
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [questionsData, candidatesData] = await Promise.all([
        getQuestions(),
        getCandidates()
      ]);
      setQuestions(questionsData);
      setCandidates(candidatesData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.questionId || !formData.candidateId) {
      setError('Please select both a question and a candidate');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const session = await createInterviewSession({
        questionId: formData.questionId,
        candidateId: formData.candidateId,
        interviewerId: user!.id,
        timerDuration: formData.timerDuration
      });

      // Navigate to the interview session
      navigate(`/session/${session.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create interview session');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedQuestion = questions.find(q => q.id === formData.questionId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule Interview Session</h1>
        <p className="text-gray-600 mb-8">
          Create a new coding interview session with a candidate
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Question */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <BookOpen size={18} />
              Select Question *
            </label>
            <select
              value={formData.questionId}
              onChange={(e) => setFormData({ ...formData, questionId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              required
            >
              <option value="">Choose a question...</option>
              {questions.map((question) => (
                <option key={question.id} value={question.id}>
                  {question.title} - {question.difficulty} - {question.topic}
                </option>
              ))}
            </select>

            {selectedQuestion && (
              <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Difficulty:</span>
                    <div className={`mt-1 inline-block px-2 py-1 rounded text-xs font-semibold ${
                      selectedQuestion.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                      selectedQuestion.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {selectedQuestion.difficulty}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Topic:</span>
                    <div className="font-medium text-gray-900">{selectedQuestion.topic}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Suggested Time:</span>
                    <div className="font-medium text-gray-900">{selectedQuestion.timeLimit} min</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Select Candidate */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User size={18} />
              Select Candidate *
            </label>
            <select
              value={formData.candidateId}
              onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              required
            >
              <option value="">Choose a candidate...</option>
              {candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.username} ({candidate.email})
                </option>
              ))}
            </select>

            {candidates.length === 0 && (
              <p className="mt-2 text-sm text-orange-600">
                No active candidates found. Please create a candidate first.
              </p>
            )}
          </div>

          {/* Schedule Time */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar size={18} />
              Scheduled Start Time (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledStartTime}
              onChange={(e) => setFormData({ ...formData, scheduledStartTime: e.target.value })}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
            <p className="mt-1 text-sm text-gray-500">
              Leave empty to start the session immediately
            </p>
          </div>

          {/* Timer Duration */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Clock size={18} />
              Interview Duration (minutes) *
            </label>
            <input
              type="number"
              value={formData.timerDuration}
              onChange={(e) => setFormData({ ...formData, timerDuration: parseInt(e.target.value) })}
              min="15"
              max="180"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Suggested: {selectedQuestion?.timeLimit || 45} minutes based on question
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || questions.length === 0 || candidates.length === 0}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Send size={18} />
              {submitting ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>

        {/* Help Section */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Before you start:</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>✓ Ensure you have questions added to the question bank</li>
            <li>✓ Make sure the candidate has been invited and activated their account</li>
            <li>✓ The candidate will receive an email notification about the session</li>
            <li>✓ You can adjust the timer during the session if needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetupPage;
