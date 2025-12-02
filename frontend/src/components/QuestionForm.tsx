import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { createQuestion, updateQuestion, getTestCases, addTestCase, deleteTestCase, type Question } from '../services/api';
import Editor from '@monaco-editor/react';

interface TestCase {
  id?: number;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  points: number;
}

interface Props {
  question: Question | null;
  onClose: () => void;
}

const QuestionForm: React.FC<Props> = ({ question, onClose }) => {
  const [formData, setFormData] = useState<Partial<Question> & { difficulty: 'EASY' | 'MEDIUM' | 'HARD' }>({
    title: '',
    description: '',
    difficulty: 'MEDIUM',
    topic: '',
    timeLimit: 45,
    sampleInput: '',
    sampleOutput: '',
    hints: '',
    starterCode: ''
  });

  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [newTestCase, setNewTestCase] = useState<TestCase>({
    input: '',
    expectedOutput: '',
    isHidden: false,
    points: 10
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'testcases'>('details');

  useEffect(() => {
    if (question) {
      setFormData(question);
      loadTestCases(question.id!);
    }
  }, [question]);

  const loadTestCases = async (questionId: number) => {
    try {
      const cases = await getTestCases(questionId);
      setTestCases(cases);
    } catch (err) {
      console.error('Failed to load test cases:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (question?.id) {
        await updateQuestion(question.id, formData as Partial<Question>);
      } else {
        const created = await createQuestion(formData as Omit<Question, 'id'>);
        // Add test cases for new question
        for (const tc of testCases) {
          await addTestCase(created.id, tc);
        }
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestCase = async () => {
    if (!newTestCase.input || !newTestCase.expectedOutput) {
      alert('Please fill in both input and expected output');
      return;
    }

    if (question?.id) {
      // Add to existing question
      try {
        const added = await addTestCase(question.id, newTestCase);
        setTestCases([...testCases, added]);
        setNewTestCase({ input: '', expectedOutput: '', isHidden: false, points: 10 });
      } catch (err) {
        alert('Failed to add test case');
      }
    } else {
      // Add to local state for new question
      setTestCases([...testCases, { ...newTestCase }]);
      setNewTestCase({ input: '', expectedOutput: '', isHidden: false, points: 10 });
    }
  };

  const handleDeleteTestCase = async (index: number) => {
    const testCase = testCases[index];
    
    if (testCase.id && question?.id) {
      try {
        await deleteTestCase(testCase.id);
        setTestCases(testCases.filter((_, i) => i !== index));
      } catch (err) {
        alert('Failed to delete test case');
      }
    } else {
      setTestCases(testCases.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {question ? 'Edit Question' : 'Create New Question'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'details'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Question Details
          </button>
          <button
            onClick={() => setActiveTab('testcases')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'testcases'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Test Cases ({testCases.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {activeTab === 'details' && (
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>

                {/* Row: Difficulty, Topic, Time Limit */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty *</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Topic *</label>
                    <input
                      type="text"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="e.g., Arrays, Trees"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (min) *</label>
                    <input
                      type="number"
                      value={formData.timeLimit}
                      onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      min="1"
                      required
                    />
                  </div>
                </div>

                {/* Sample Input/Output */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sample Input</label>
                    <textarea
                      value={formData.sampleInput}
                      onChange={(e) => setFormData({ ...formData, sampleInput: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm text-gray-900"
                      placeholder="Example input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sample Output</label>
                    <textarea
                      value={formData.sampleOutput}
                      onChange={(e) => setFormData({ ...formData, sampleOutput: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm text-gray-900"
                      placeholder="Expected output"
                    />
                  </div>
                </div>

                {/* Hints */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hints</label>
                  <textarea
                    value={formData.hints}
                    onChange={(e) => setFormData({ ...formData, hints: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Optional hints for candidates"
                  />
                </div>

                {/* Starter Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Starter Code (Optional)</label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <Editor
                      height="200px"
                      defaultLanguage="python"
                      value={formData.starterCode}
                      onChange={(value) => setFormData({ ...formData, starterCode: value || '' })}
                      theme="vs-light"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'testcases' && (
              <div className="space-y-6">
                {/* Existing Test Cases */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Existing Test Cases</h3>
                  {testCases.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No test cases yet</p>
                  ) : (
                    <div className="space-y-3">
                      {testCases.map((tc, index) => (
                        <div key={index} className="border border-gray-300 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex gap-2 items-center">
                              <span className="font-semibold">Test Case {index + 1}</span>
                              {tc.isHidden && (
                                <span className="text-xs bg-gray-200 px-2 py-1 rounded">Hidden</span>
                              )}
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {tc.points} pts
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteTestCase(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <div className="font-medium text-gray-600 mb-1">Input:</div>
                              <pre className="bg-gray-50 p-2 rounded border border-gray-200 overflow-x-auto">
                                {tc.input}
                              </pre>
                            </div>
                            <div>
                              <div className="font-medium text-gray-600 mb-1">Expected Output:</div>
                              <pre className="bg-gray-50 p-2 rounded border border-gray-200 overflow-x-auto">
                                {tc.expectedOutput}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add New Test Case */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Add New Test Case</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Input *</label>
                        <textarea
                          value={newTestCase.input}
                          onChange={(e) => setNewTestCase({ ...newTestCase, input: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm text-gray-900"
                          placeholder="Test input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expected Output *</label>
                        <textarea
                          value={newTestCase.expectedOutput}
                          onChange={(e) => setNewTestCase({ ...newTestCase, expectedOutput: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm text-gray-900"
                          placeholder="Expected output"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 items-center">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                        <input
                          type="number"
                          value={newTestCase.points}
                          onChange={(e) => setNewTestCase({ ...newTestCase, points: parseInt(e.target.value) })}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                          min="1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isHidden"
                          checked={newTestCase.isHidden}
                          onChange={(e) => setNewTestCase({ ...newTestCase, isHidden: e.target.checked })}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isHidden" className="text-sm text-gray-700">
                          Hidden (not visible to candidate)
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddTestCase}
                        className="ml-auto flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        <Plus size={16} />
                        Add Test Case
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : question ? 'Update Question' : 'Create Question'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionForm;
