import React, { useState } from 'react';
import { Play, Trophy, Target, TrendingUp, Eye, EyeOff } from 'lucide-react';
import TestCaseResults from './TestCaseResults';

interface TestResult {
  id: number;
  testCaseId: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  points: number;
  executionTime: number;
  memoryUsed: number;
  error?: string;
  isHidden?: boolean;
}

interface EvaluationResult {
  sessionId: number;
  totalTests: number;
  passedTests: number;
  score: number;
  maxScore: number;
  percentage: number;
  results: TestResult[];
}

interface Props {
  evaluationResult: EvaluationResult | null;
  isEvaluating: boolean;
  error: string | null;
  onEvaluate: () => Promise<void>;
  showEvaluateButton?: boolean;
}

const GradingPanel: React.FC<Props> = ({
  evaluationResult,
  isEvaluating,
  error,
  onEvaluate,
  showEvaluateButton = true,
}) => {
  const [showHiddenTests, setShowHiddenTests] = useState(false);

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-50 border-green-300';
    if (percentage >= 60) return 'bg-yellow-50 border-yellow-300';
    return 'bg-red-50 border-red-300';
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-600" size={20} />
            <h3 className="font-semibold text-gray-900">Auto-Grading</h3>
          </div>
          {showEvaluateButton && (
            <button
              onClick={onEvaluate}
              disabled={isEvaluating}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <Play size={16} />
              {isEvaluating ? 'Evaluating...' : 'Run Tests'}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {isEvaluating && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Running test cases...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </div>
        )}

        {!isEvaluating && !evaluationResult && !error && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 font-medium mb-2">No test results yet</p>
            <p className="text-sm text-gray-500">
              {showEvaluateButton
                ? 'Click "Run Tests" to evaluate the code'
                : 'Waiting for evaluation...'}
            </p>
          </div>
        )}

        {!isEvaluating && evaluationResult && (
          <>
            {/* Score Summary */}
            <div className={`rounded-lg border-2 p-6 mb-6 ${getScoreBgColor(evaluationResult.percentage)}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Overall Score</h4>
                <div className="flex items-center gap-2">
                  <TrendingUp className={getScoreColor(evaluationResult.percentage)} size={24} />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(evaluationResult.percentage)}`}>
                    {evaluationResult.percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Percentage</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {evaluationResult.score}/{evaluationResult.maxScore}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {evaluationResult.passedTests}/{evaluationResult.totalTests}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Tests Passed</div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${
                    evaluationResult.passedTests === evaluationResult.totalTests
                      ? 'text-green-600'
                      : 'text-gray-900'
                  }`}>
                    {evaluationResult.totalTests}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Total Tests</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      evaluationResult.percentage >= 80
                        ? 'bg-green-500'
                        : evaluationResult.percentage >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${evaluationResult.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Hidden Tests Toggle */}
            {evaluationResult.results.some((r) => r.isHidden) && (
              <div className="mb-4">
                <button
                  onClick={() => setShowHiddenTests(!showHiddenTests)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {showHiddenTests ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showHiddenTests ? 'Hide' : 'Show'} Hidden Test Cases
                </button>
              </div>
            )}

            {/* Test Results */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Test Case Results</h4>
              <TestCaseResults results={evaluationResult.results} showHiddenTests={showHiddenTests} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GradingPanel;
