import React, { useState } from 'react';
import { StickyNote, Plus, Lock, Unlock } from 'lucide-react';

interface Note {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  isPrivate: boolean;
  type: 'GENERAL' | 'CODE_COMMENT' | 'OBSERVATION';
  createdAt: string;
}

interface Props {
  notes: Note[];
  currentUserId: number;
  isInterviewer: boolean;
  onAddNote: (content: string, isPrivate: boolean) => Promise<void>;
  loading?: boolean;
}

const NotesPanel: React.FC<Props> = ({
  notes,
  currentUserId,
  isInterviewer,
  onAddNote,
  loading = false,
}) => {
  const [newNote, setNewNote] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleAdd = async () => {
    if (!newNote.trim() || adding) return;

    setAdding(true);
    try {
      await onAddNote(newNote.trim(), isPrivate);
      setNewNote('');
      setIsPrivate(false);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setAdding(false);
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNoteIcon = () => {
    return <StickyNote size={16} className="text-yellow-500" />;
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <StickyNote className="text-yellow-600" size={20} />
          <h3 className="font-semibold text-gray-900">Notes</h3>
          <span className="text-sm text-gray-500">({notes.length})</span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-sm bg-yellow-600 text-white px-3 py-1 rounded-lg hover:bg-yellow-700 transition-colors"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {/* Add Note Form */}
      {showForm && (
        <div className="p-4 border-b border-gray-200 bg-yellow-50">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a note..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            disabled={adding}
          />
          
          {/* Privacy Toggle (Interviewer Only) */}
          {isInterviewer && (
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setIsPrivate(!isPrivate)}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                  isPrivate
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isPrivate ? <Lock size={14} /> : <Unlock size={14} />}
                {isPrivate ? 'Private' : 'Public'}
              </button>
              <span className="text-xs text-gray-600">
                {isPrivate ? 'Only you can see this' : 'Visible to everyone'}
              </span>
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                setShowForm(false);
                setNewNote('');
                setIsPrivate(false);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={adding}
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!newNote.trim() || adding}
              className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {adding ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && notes.length === 0 ? (
          <div className="text-center text-gray-500 py-8">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No notes yet. Add your first note!
          </div>
        ) : (
          notes.map((note) => {
            const isOwn = note.authorId === currentUserId;
            const canSee = !note.isPrivate || isInterviewer || isOwn;

            if (!canSee) return null;

            return (
              <div
                key={note.id}
                className={`p-3 rounded-lg border-2 ${
                  note.isPrivate
                    ? 'bg-gray-50 border-gray-300'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getNoteIcon()}
                    <span className="text-sm font-medium text-gray-700">
                      {isOwn ? 'You' : note.authorName}
                    </span>
                    {note.isPrivate && (
                      <span className="flex items-center gap-1 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                        <Lock size={12} />
                        Private
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{formatTime(note.createdAt)}</span>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap text-sm">{note.content}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotesPanel;
