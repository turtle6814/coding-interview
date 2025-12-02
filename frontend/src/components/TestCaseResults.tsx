import React from 'react';
import { CheckCircle, XCircle, Clock, HardDrive, AlertCircle } from 'lucide-react';

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

interface Props {
  results: TestResult[];
  showHiddenTests?: boolean;
}

const TestCaseResults: React.FC<Props> = ({ results, showHiddenTests = false }) => {
  const visibleResults = showHiddenTests
    ? results
    : results.filter((r) => !r.isHidden);

  if (results.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No test results available. Run the tests to see results.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visibleResults.map((result, index) => (
        <div
          key={result.id}
          className={`border-2 rounded-lg p-4 ${
            result.passed
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-300'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {result.passed ? (
                <CheckCircle className="text-green-600" size={20} />
              ) : (
                <XCircle className="text-red-600" size={20} />
              )}
              <span className="font-semibold text-gray-900">
                Test Case {index + 1}
                {result.isHidden && (
                  <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                    Hidden
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <Clock size={14} />
                <span>{result.executionTime}ms</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <HardDrive size={14} />
                <span>{(result.memoryUsed / 1024).toFixed(1)}KB</span>
              </div>
              <div
                className={`font-semibold ${
                  result.passed ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {result.points} pts
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-3">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                result.passed
                  ? 'bg-green-200 text-green-800'
                  : 'bg-red-200 text-red-800'
              }`}
            >
              {result.passed ? '✓ Passed' : '✗ Failed'}
            </span>
          </div>

          {/* Error Message (if any) */}
          {result.error && (
            <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                <div className="flex-1">
                  <div className="font-semibold text-red-800 text-sm mb-1">Error:</div>
                  <pre className="text-xs text-red-700 whitespace-pre-wrap font-mono">
                    {result.error}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Input/Output Details (for non-hidden tests) */}
          {!result.isHidden && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Input:</div>
                <pre className="bg-white border border-gray-200 rounded p-2 text-xs font-mono overflow-x-auto max-h-32 overflow-y-auto">
                  {result.input || '(empty)'}
                </pre>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Expected Output:</div>
                <pre className="bg-white border border-gray-200 rounded p-2 text-xs font-mono overflow-x-auto max-h-32 overflow-y-auto">
                  {result.expectedOutput || '(empty)'}
                </pre>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-1">Actual Output:</div>
                <pre
                  className={`bg-white border rounded p-2 text-xs font-mono overflow-x-auto max-h-32 overflow-y-auto ${
                    result.passed ? 'border-green-300' : 'border-red-300'
                  }`}
                >
                  {result.actualOutput || '(no output)'}
                </pre>
              </div>
            </div>
          )}

          {/* Hidden Test Placeholder */}
          {result.isHidden && showHiddenTests && (
            <div className="text-sm text-gray-600 italic">
              Test case details are hidden from the candidate
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TestCaseResults;
