import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import JobGenerator from './components/JobGenerator';
import ResumeManager from './components/ResumeManager';
import InterviewScheduler from './components/InterviewScheduler';
import InterviewAgent from './components/InterviewAgent';
import InterviewResults from './components/InterviewResults';
import FinalReport from './components/FinalReport';
import { mockCandidates, mockInterviews, mockDashboardStats } from './data/mockData';
import type { Candidate, Interview, User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [interviews, setInterviews] = useState<Interview[]>(mockInterviews);

  const handleLogin = (email: string, password: string) => {
    // Mock authentication
    if (email === 'hr@company.com' && password === 'password123') {
      setUser({
        id: 'user-1',
        name: 'Sarah Johnson',
        email: 'hr@company.com',
        role: 'hr'
      });
    } else {
      alert('Invalid credentials. Use: hr@company.com / password123');
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <Dashboard
            stats={mockDashboardStats}
            recentCandidates={candidates.slice(0, 5)}
            onScreenChange={setCurrentScreen}
          />
        );
      case 'job-generator':
        return <JobGenerator />;
      case 'resume-manager':
        return (
          <ResumeManager
            candidates={candidates}
            onCandidatesUpdate={setCandidates}
          />
        );
      case 'scheduler':
        return (
          <InterviewScheduler
            candidates={candidates}
            interviews={interviews}
            onInterviewsUpdate={setInterviews}
            onCandidatesUpdate={setCandidates}
          />
        );
      case 'interview-agent':
        return (
          <InterviewAgent
            candidates={candidates}
            interviews={interviews}
            onCandidatesUpdate={setCandidates}
            onInterviewsUpdate={setInterviews}
          />
        );
      case 'interview-results':
        return (
          <InterviewResults
            candidates={candidates}
          />
        );
      case 'final-report':
        return (
          <FinalReport
            candidates={candidates}
            onCandidatesUpdate={setCandidates}
          />
        );
      default:
        return (
          <Dashboard
            stats={mockDashboardStats}
            recentCandidates={candidates.slice(0, 5)}
            onScreenChange={setCurrentScreen}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
        user={user}
      />
      {renderCurrentScreen()}
    </div>
  );
}

export default App;