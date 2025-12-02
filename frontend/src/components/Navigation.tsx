import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Code, LogOut, User, BookOpen, ClipboardList } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { isAuthenticated, user, logout, isInterviewer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Hide navigation on welcome page
  if (location.pathname === '/') {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <Code className="h-6 w-6" />
              <span className="font-bold text-xl">CodeInterview</span>
            </Link>

            {isInterviewer && (
              <>
                <Link
                  to="/questions"
                  className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Question Bank</span>
                </Link>
                <Link
                  to="/sessions"
                  className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
                >
                  <ClipboardList className="h-5 w-5" />
                  <span>My Sessions</span>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">{user?.username}</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {user?.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-700 hover:text-red-600"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
