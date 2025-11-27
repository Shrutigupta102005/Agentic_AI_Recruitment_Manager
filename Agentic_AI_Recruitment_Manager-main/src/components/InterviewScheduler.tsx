import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Mail, Check, X } from 'lucide-react';
import type { Candidate, Interview } from '../types';

// ADD THIS LINE
const API_URL = 'http://127.0.0.1:8000';

// NEW: Backend Candidate interface
interface BackendCandidate {
  id: number;
  name: string;
  email: string;
  score: number;
  rating: number;
  status: string;
}

interface InterviewSchedulerProps {
  candidates: Candidate[];
  interviews: Interview[];
  onInterviewsUpdate: (interviews: Interview[]) => void;
  onCandidatesUpdate: (candidates: Candidate[]) => void;
}

export default function InterviewScheduler({ 
  candidates, 
  interviews, 
  onInterviewsUpdate,
  onCandidatesUpdate 
}: InterviewSchedulerProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);
  
  // NEW: Backend candidates state
  const [backendCandidates, setBackendCandidates] = useState<BackendCandidate[]>([]);
  const [loadingBackendCandidates, setLoadingBackendCandidates] = useState(true);

  // NEW: Load candidates from backend
  useEffect(() => {
    loadCandidatesFromBackend();
  }, []);

  const loadCandidatesFromBackend = async () => {
    setLoadingBackendCandidates(true);
    try {
      const response = await fetch(`${API_URL}/api/candidates`);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded candidates from backend:', data);
        setBackendCandidates(data);
      } else {
        console.error('Failed to fetch candidates from backend');
      }
    } catch (error) {
      console.error('Error loading candidates from backend:', error);
    } finally {
      setLoadingBackendCandidates(false);
    }
  };

  // Filter candidates who are eligible for interviews (reviewed status and score > 70)
  const eligibleCandidates = candidates.filter(c => 
    c.status === 'reviewed' && c.score >= 70
  );

  // NEW: Combine local and backend candidates for dropdown
  const allEligibleCandidates = [
    ...eligibleCandidates,
    ...backendCandidates.filter(bc => bc.score >= 70)
  ];

  const handleScheduleInterview = async () => {
    if (!selectedCandidate || !selectedDate || !selectedTime) return;

    setIsScheduling(true);
    
    try {
      // Check if this is a backend candidate (numeric ID)
      const isBackendCandidate = !isNaN(Number(selectedCandidate));
      
      if (isBackendCandidate) {
        // NEW: Schedule with backend API
        const response = await fetch(`${API_URL}/api/interviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            candidate_id: Number(selectedCandidate),
            date: selectedDate,
            time: selectedTime,
            type: 'technical'
          })
        });

        if (response.ok) {
          alert('✅ Interview scheduled successfully with backend!');
          
          // Also create local interview record
          const interviewDate = new Date(`${selectedDate}T${selectedTime}`);
          const backendCandidate = backendCandidates.find(c => c.id === Number(selectedCandidate));
          
          if (backendCandidate) {
            const newInterview: Interview = {
              id: `interview-${Date.now()}`,
              candidateId: `backend-${selectedCandidate}`,
              scheduledDate: interviewDate,
              status: 'scheduled'
            };
            onInterviewsUpdate([...interviews, newInterview]);
          }
        } else {
          const errorData = await response.json();
          alert(`❌ Failed to schedule: ${errorData.detail || 'Unknown error'}`);
        }
      } else {
        // Original local scheduling logic
        const interviewDate = new Date(`${selectedDate}T${selectedTime}`);
        
        const newInterview: Interview = {
          id: `interview-${Date.now()}`,
          candidateId: selectedCandidate,
          scheduledDate: interviewDate,
          status: 'scheduled'
        };

        onInterviewsUpdate([...interviews, newInterview]);
        
        const updatedCandidates = candidates.map(c => 
          c.id === selectedCandidate 
            ? { ...c, status: 'interviewed' as const, interviewDate }
            : c
        );
        onCandidatesUpdate(updatedCandidates);
      }

      // Reset form
      setSelectedCandidate(null);
      setSelectedDate('');
      setSelectedTime('');
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert('❌ Network error. Make sure backend is running on port 8000');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleCancelInterview = (interviewId: string) => {
    const interview = interviews.find(i => i.id === interviewId);
    if (!interview) return;

    const updatedInterviews = interviews.map(i =>
      i.id === interviewId ? { ...i, status: 'cancelled' as const } : i
    );
    onInterviewsUpdate(updatedInterviews);

    const updatedCandidates = candidates.map(c =>
      c.id === interview.candidateId 
        ? { ...c, status: 'reviewed' as const, interviewDate: undefined }
        : c
    );
    onCandidatesUpdate(updatedCandidates);
  };

  const getInterviewStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Generate time slots
  const timeSlots = [];
  for (let hour = 9; hour <= 17; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 17) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  // NEW: Get candidate name helper
  const getCandidateName = (candidateId: string) => {
    if (candidateId.startsWith('backend-')) {
      const backendId = Number(candidateId.replace('backend-', ''));
      const backendCandidate = backendCandidates.find(c => c.id === backendId);
      return backendCandidate?.name || 'Unknown';
    }
    return candidates.find(c => c.id === candidateId)?.name || 'Unknown';
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Interview Scheduler</h1>
        <p className="mt-2 text-gray-600">Schedule interviews with qualified candidates</p>
      </div>

      {/* NEW: Backend Status Indicator */}
      {loadingBackendCandidates && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-sm text-blue-800">Loading candidates from backend...</span>
        </div>
      )}

      {!loadingBackendCandidates && backendCandidates.length === 0 && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ No candidates found in backend. Go to Resume Manager and click "Rank Resumes" first!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduling Form */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Schedule New Interview
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="candidate" className="block text-sm font-medium text-gray-700 mb-2">
                Select Candidate
              </label>
              <select
                id="candidate"
                value={selectedCandidate || ''}
                onChange={(e) => setSelectedCandidate(e.target.value)}
                className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a candidate...</option>
                
                {/* Backend Candidates */}
                {backendCandidates.length > 0 && (
                  <optgroup label="📊 Ranked Candidates (Backend)">
                    {backendCandidates.map((candidate) => (
                      <option key={`backend-${candidate.id}`} value={candidate.id}>
                        {candidate.name} (Score: {candidate.score}/100)
                      </option>
                    ))}
                  </optgroup>
                )}
                
                {/* Local Candidates */}
                {eligibleCandidates.length > 0 && (
                  <optgroup label="📝 Local Candidates">
                    {eligibleCandidates.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.name} (Score: {candidate.score}/100)
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Interview Date
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Interview Time
              </label>
              <select
                id="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select time...</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleScheduleInterview}
              disabled={!selectedCandidate || !selectedDate || !selectedTime || isScheduling}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isScheduling ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Scheduling...
                </div>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule Interview
                </>
              )}
            </button>

            {selectedCandidate && selectedDate && selectedTime && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email confirmation will be sent automatically
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Scheduled Interviews */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Scheduled Interviews</h2>
          
          {interviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No interviews scheduled yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews
                .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                .map((interview) => {
                  const candidate = candidates.find(c => c.id === interview.candidateId);
                  const candidateName = candidate?.name || getCandidateName(interview.candidateId);
                  const candidateEmail = candidate?.email || 'N/A';
                  
                  return (
                    <div key={interview.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {candidateName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{candidateName}</h3>
                            <p className="text-xs text-gray-500">{candidateEmail}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {formatDateTime(new Date(interview.scheduledDate))}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getInterviewStatusColor(interview.status)}`}>
                            {interview.status}
                          </span>
                          {interview.status === 'scheduled' && (
                            <button
                              onClick={() => handleCancelInterview(interview.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Eligible Candidates List */}
      {(allEligibleCandidates.length > 0) && (
        <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">All Eligible Candidates (Score ≥ 70)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Backend candidates */}
            {backendCandidates.map((candidate) => (
              <div key={`display-backend-${candidate.id}`} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {candidate.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{candidate.name}</h3>
                      <p className="text-xs text-gray-500">Score: {candidate.score}/100</p>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Backend</span>
                </div>
              </div>
            ))}
            
            {/* Local candidates */}
            {eligibleCandidates.map((candidate) => (
              <div key={`display-local-${candidate.id}`} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{candidate.name}</h3>
                    <p className="text-xs text-gray-500">Score: {candidate.score}/100</p>
                  </div>
                  {candidate.status === 'interviewed' && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}