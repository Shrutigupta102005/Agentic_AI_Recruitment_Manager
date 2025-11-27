import React, { useState } from 'react';
import { MessageSquare, Upload, Play, BarChart3, FileText } from 'lucide-react';
import type { Candidate, Interview } from '../types';

interface InterviewAgentProps {
  candidates: Candidate[];
  interviews: Interview[];
  onCandidatesUpdate: (candidates: Candidate[]) => void;
  onInterviewsUpdate: (interviews: Interview[]) => void;
}

export default function InterviewAgent({ 
  candidates, 
  interviews, 
  onCandidatesUpdate,
  onInterviewsUpdate 
}: InterviewAgentProps) {
  const [selectedInterview, setSelectedInterview] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Get scheduled interviews that can have transcripts
  const availableInterviews = interviews.filter(i => 
    i.status === 'scheduled' || i.status === 'completed'
  );

  const selectedInterviewData = selectedInterview 
    ? interviews.find(i => i.id === selectedInterview)
    : null;

  const selectedCandidate = selectedInterviewData 
    ? candidates.find(c => c.id === selectedInterviewData.candidateId)
    : null;

  const handleRunSentimentAnalysis = async () => {
    if (!selectedInterview || (!transcript && !liveTranscript)) return;

    setIsAnalyzing(true);
    
    // Mock sentiment analysis
    setTimeout(() => {
      const mockSentiment = {
        positive: Math.floor(Math.random() * 40) + 30, // 30-70%
        negative: Math.floor(Math.random() * 20) + 10, // 10-30%
        neutral: Math.floor(Math.random() * 30) + 20,  // 20-50%
        overall: 'positive' as const // Will be calculated based on scores
      };

      // Determine overall sentiment
      const max = Math.max(mockSentiment.positive, mockSentiment.negative, mockSentiment.neutral);
      if (max === mockSentiment.positive) mockSentiment.overall = 'positive';
      else if (max === mockSentiment.negative) mockSentiment.overall = 'negative';
      else mockSentiment.overall = 'neutral';

      // Update interview with transcript and sentiment
      const updatedInterviews = interviews.map(i =>
        i.id === selectedInterview
          ? { 
              ...i, 
              transcript: transcript || liveTranscript,
              sentimentAnalysis: mockSentiment,
              status: 'completed' as const
            }
          : i
      );
      onInterviewsUpdate(updatedInterviews);

      // Update candidate with sentiment score
      const updatedCandidates = candidates.map(c =>
        c.id === selectedInterviewData?.candidateId
          ? { ...c, sentimentScore: mockSentiment }
          : c
      );
      onCandidatesUpdate(updatedCandidates);

      setIsAnalyzing(false);
    }, 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Mock file reading
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setTranscript(content || 'Mock transcript content from uploaded file...');
      };
      reader.readAsText(file);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Start mock live transcription
      const mockWords = [
        "Thank you for joining us today.",
        "Can you tell me about your experience with React?",
        "I have been working with React for about 3 years now.",
        "That's great. What challenges have you faced?",
        "The main challenge was managing state in complex applications.",
        "How did you solve that?",
        "I used Redux and later moved to React Context API.",
        "Excellent. Tell me about your problem-solving approach.",
        "I like to break down complex problems into smaller parts.",
        "That sounds like a good methodology."
      ];

      let wordIndex = 0;
      const interval = setInterval(() => {
        if (wordIndex < mockWords.length && isRecording) {
          setLiveTranscript(prev => prev + mockWords[wordIndex] + ' ');
          wordIndex++;
        } else {
          clearInterval(interval);
        }
      }, 2000);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const renderSentimentChart = (sentimentData: any) => {
    const total = sentimentData.positive + sentimentData.negative + sentimentData.neutral;
    
    return (
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-900">Sentiment Analysis Results</h3>
        
        {/* Overall Sentiment */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Overall Sentiment</span>
          <span className={`text-lg font-semibold capitalize ${getSentimentColor(sentimentData.overall)}`}>
            {sentimentData.overall}
          </span>
        </div>

        {/* Sentiment Breakdown */}
        <div className="space-y-3">
          {[
            { label: 'Positive', value: sentimentData.positive, color: 'bg-green-500' },
            { label: 'Negative', value: sentimentData.negative, color: 'bg-red-500' },
            { label: 'Neutral', value: sentimentData.neutral, color: 'bg-yellow-500' },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{item.label}</span>
                <span>{Math.round((item.value / total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${item.color}`}
                  style={{ width: `${(item.value / total) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Interview Agent</h1>
        <p className="mt-2 text-gray-600">Analyze interview transcripts and sentiment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interview Selection */}
        <div className="lg:col-span-1 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Select Interview</h2>
          
          <div className="space-y-4">
            <select
              value={selectedInterview || ''}
              onChange={(e) => setSelectedInterview(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose an interview...</option>
              {availableInterviews.map((interview) => {
                const candidate = candidates.find(c => c.id === interview.candidateId);
                return (
                  <option key={interview.id} value={interview.id}>
                    {candidate?.name} - {new Date(interview.scheduledDate).toLocaleDateString()}
                  </option>
                );
              })}
            </select>

            {selectedCandidate && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {selectedCandidate.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{selectedCandidate.name}</h3>
                    <p className="text-xs text-gray-500">Score: {selectedCandidate.score}/100</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transcript Input */}
        <div className="lg:col-span-2 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
            Interview Transcript
          </h2>

          <div className="space-y-4">
            {/* Upload Option */}
            <div>
              <label htmlFor="transcript-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Upload Transcript File
              </label>
              <input
                type="file"
                id="transcript-upload"
                accept=".txt,.doc,.docx"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="text-center text-gray-500">OR</div>

            {/* Live Recording */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Live Recording
                </label>
                <button
                  onClick={toggleRecording}
                  className={`flex items-center px-3 py-1 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isRecording
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </button>
              </div>
              <div className="min-h-32 p-3 border border-gray-300 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600">
                  {liveTranscript || 'Live transcript will appear here during recording...'}
                </p>
              </div>
            </div>

            <div className="text-center text-gray-500">OR</div>

            {/* Manual Input */}
            <div>
              <label htmlFor="transcript" className="block text-sm font-medium text-gray-700 mb-2">
                Manual Transcript Input
              </label>
              <textarea
                id="transcript"
                rows={8}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Paste or type the interview transcript here..."
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleRunSentimentAnalysis}
              disabled={!selectedInterview || (!transcript && !liveTranscript) || isAnalyzing}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isAnalyzing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </div>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Run Sentiment Analysis
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sentiment Analysis Results */}
      {selectedInterviewData?.sentimentAnalysis && (
        <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          {renderSentimentChart(selectedInterviewData.sentimentAnalysis)}
        </div>
      )}

      {/* Completed Analyses */}
      <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Completed Analyses</h2>
        
        {interviews.filter(i => i.sentimentAnalysis).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No sentiment analyses completed yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {interviews
              .filter(i => i.sentimentAnalysis)
              .map((interview) => {
                const candidate = candidates.find(c => c.id === interview.candidateId);
                if (!candidate) return null;
                
                return (
                  <div key={interview.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{candidate.name}</h3>
                        <p className="text-xs text-gray-500">
                          {new Date(interview.scheduledDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-sm font-medium capitalize ${getSentimentColor(interview.sentimentAnalysis!.overall)}`}>
                        {interview.sentimentAnalysis!.overall}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {['positive', 'negative', 'neutral'].map((type) => {
                        const value = interview.sentimentAnalysis![type as keyof typeof interview.sentimentAnalysis];
                        const total = interview.sentimentAnalysis!.positive + 
                                    interview.sentimentAnalysis!.negative + 
                                    interview.sentimentAnalysis!.neutral;
                        const percentage = Math.round((value / total) * 100);
                        
                        return (
                          <div key={type} className="flex items-center justify-between text-xs">
                            <span className="capitalize text-gray-600">{type}</span>
                            <span className="font-medium">{percentage}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}