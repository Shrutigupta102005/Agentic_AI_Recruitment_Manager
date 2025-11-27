import React from 'react';
import { 
  Users, 
  FileText, 
  Upload, 
  Calendar, 
  MessageSquare, 
  ClipboardList,
  LogOut,
  Home
} from 'lucide-react';

interface NavbarProps {
  currentScreen: string;
  onScreenChange: (screen: string) => void;
  user?: { name: string; email: string };
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'job-generator', label: 'Job Generator', icon: FileText },
  { id: 'resume-manager', label: 'Resume Manager', icon: Upload },
  { id: 'scheduler', label: 'Interview Scheduler', icon: Calendar },
  { id: 'interview-agent', label: 'Interview Agent', icon: MessageSquare },
  { id: 'final-report', label: 'Final Reports', icon: ClipboardList },
];

export default function Navbar({ currentScreen, onScreenChange, user }: NavbarProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">HireFlow</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onScreenChange(item.id)}
                    className={`${
                      currentScreen === item.id
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">{user.name}</span>
                <button className="text-gray-400 hover:text-gray-500">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}