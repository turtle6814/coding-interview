import React from 'react';
import { Clock, Play, Pause, AlertCircle } from 'lucide-react';

interface Props {
  timeRemaining: number;
  timerStatus: 'IDLE' | 'RUNNING' | 'PAUSED' | 'EXPIRED';
  timerDuration: number;
  onStart?: () => void;
  onPause?: () => void;
  showControls?: boolean;
}

const TimerDisplay: React.FC<Props> = ({
  timeRemaining,
  timerStatus,
  timerDuration,
  onStart,
  onPause,
  showControls = false,
}) => {
  const formatTime = (seconds: number): string => {
    if (seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (timerDuration === 0) return 0;
    return ((timerDuration - timeRemaining) / timerDuration) * 100;
  };

  const getStatusColor = (): string => {
    if (timerStatus === 'EXPIRED') return 'text-red-600';
    if (timeRemaining <= 300 && timerStatus === 'RUNNING') return 'text-orange-600'; // 5 minutes warning
    if (timerStatus === 'PAUSED') return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getStatusBgColor = (): string => {
    if (timerStatus === 'EXPIRED') return 'bg-red-100 border-red-300';
    if (timeRemaining <= 300 && timerStatus === 'RUNNING') return 'bg-orange-100 border-orange-300';
    if (timerStatus === 'PAUSED') return 'bg-yellow-100 border-yellow-300';
    return 'bg-blue-100 border-blue-300';
  };

  const getProgressColor = (): string => {
    if (timerStatus === 'EXPIRED') return 'bg-red-500';
    if (timeRemaining <= 300 && timerStatus === 'RUNNING') return 'bg-orange-500';
    return 'bg-blue-500';
  };

  const getStatusText = (): string => {
    switch (timerStatus) {
      case 'RUNNING':
        return 'Running';
      case 'PAUSED':
        return 'Paused';
      case 'EXPIRED':
        return 'Time Expired';
      case 'IDLE':
        return 'Not Started';
      default:
        return '';
    }
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${getStatusBgColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={24} className={getStatusColor()} />
          <span className={`font-semibold ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        {timeRemaining <= 300 && timeRemaining > 0 && timerStatus === 'RUNNING' && (
          <div className="flex items-center gap-1 text-orange-600 text-sm">
            <AlertCircle size={16} />
            <span>5 min warning</span>
          </div>
        )}
      </div>

      {/* Timer Display */}
      <div className="text-center mb-3">
        <div className={`text-4xl font-bold font-mono ${getStatusColor()}`}>
          {formatTime(timeRemaining)}
        </div>
        <div className="text-sm text-gray-600 mt-1">
          {formatTime(timerDuration)} total
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor()}`}
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>

      {/* Controls (Interviewer Only) */}
      {showControls && (
        <div className="flex gap-2">
          {(timerStatus === 'IDLE' || timerStatus === 'PAUSED') && (
            <button
              onClick={onStart}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play size={18} />
              {timerStatus === 'IDLE' ? 'Start' : 'Resume'}
            </button>
          )}
          {timerStatus === 'RUNNING' && (
            <button
              onClick={onPause}
              className="flex-1 flex items-center justify-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <Pause size={18} />
              Pause
            </button>
          )}
        </div>
      )}

      {/* Status Messages */}
      {timerStatus === 'EXPIRED' && (
        <div className="mt-2 text-center text-sm text-red-600 font-semibold">
          Interview time has expired
        </div>
      )}
    </div>
  );
};

export default TimerDisplay;
