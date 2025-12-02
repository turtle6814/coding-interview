import React from 'react';
import { BookOpen, Lightbulb, Code } from 'lucide-react';
import type { Question } from '../services/api';

interface Props {
  question: Question;
}

const QuestionPanel: React.FC<Props> = ({ question }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'HARD':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="text-blue-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">{question.title}</h2>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(
              question.difficulty
            )}`}
          >
            {question.difficulty}
          </span>
        </div>

        {/* Topic */}
        <div className="mb-4">
          <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
            {question.topic}
          </span>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Problem Description</h3>
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {question.description}
          </div>
        </div>

        {/* Sample Input/Output */}
        {(question.sampleInput || question.sampleOutput) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Examples</h3>
            <div className="space-y-3">
              {question.sampleInput && (
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Sample Input:</div>
                  <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm overflow-x-auto font-mono">
                    {question.sampleInput}
                  </pre>
                </div>
              )}
              {question.sampleOutput && (
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Sample Output:</div>
                  <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm overflow-x-auto font-mono">
                    {question.sampleOutput}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hints */}
        {question.hints && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="text-yellow-500" size={20} />
              <h3 className="text-lg font-semibold">Hints</h3>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{question.hints}</p>
            </div>
          </div>
        )}

        {/* Starter Code */}
        {question.starterCode && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Code className="text-blue-500" size={20} />
              <h3 className="text-lg font-semibold">Starter Code</h3>
            </div>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm overflow-x-auto font-mono">
              {question.starterCode}
            </pre>
          </div>
        )}

        {/* Time Limit Info */}
        {question.timeLimit && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">Suggested Time:</span>
              <span>{question.timeLimit} minutes</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPanel;
