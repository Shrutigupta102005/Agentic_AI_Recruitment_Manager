import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, TrendingDown, Award, CheckCircle, XCircle, Clock, User, Target } from 'lucide-react';
import type { Candidate } from '../types';

interface InterviewResultsProps {
  candidates: Candidate[];
}

interface InterviewResult {
  sessionId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  skills: string[];
  overallScore: number;
  totalQuestions: number;
  questionsAnswered: number;
  skillScores: { skill: string; score: number; percentage: number }[];
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  completedAt: string;
  duration?: string;
  transcript: Array<{
    question: string;
    answer: string;
    score: number;
    feedback: string;
  }>;
}

export default function InterviewResults({ candidates }: InterviewResultsProps) {
  const [results, setResults] = useState<InterviewResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<InterviewResult | null>(null);

  // Mock data for demonstration - in production, fetch from backend
  useEffect(() => {
    // Filter candidates who have been interviewed
    const interviewedCandidates = candidates.filter(c => c.status === 'interviewed' && c.score > 0);

    const mockResults: InterviewResult[] = interviewedCandidates.map(candidate => {
      const overallScore = candidate.score;
      const skills = ['React', 'TypeScript', 'Node.js'];

      return {
        sessionId: `session-${candidate.id}`,
        candidateId: candidate.id,
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        skills: skills,
        overallScore: overallScore,
        totalQuestions: 5,
        questionsAnswered: 5,
        skillScores: skills.map(skill => ({
          skill,
          score: Math.floor(Math.random() * 3) + 7, // 7-10
          percentage: Math.floor(Math.random() * 30) + 70 // 70-100%
        })),
        strengths: [
          'Strong technical knowledge',
          'Clear communication',
          'Problem-solving approach'
        ],
        weaknesses: [
          'Could improve on advanced concepts',
          'More practical examples needed'
        ],
        recommendation: overallScore >= 80 ? 'Highly Recommended' : overallScore >= 65 ? 'Recommended' : 'Consider for Review',
        completedAt: new Date().toISOString(),
        duration: '15 minutes',
        transcript: [
          {
            question: 'What is the difference between state and props in React?',
            answer: 'State is internal and controlled by the component itself, while props are external and controlled by parent components.',
            score: 9,
            feedback: 'Excellent answer with clear distinction.'
          },
          {
            question: 'Explain TypeScript interfaces.',
            answer: 'Interfaces define the structure of objects and can be used for type checking.',
            score: 7,
            feedback: 'Good basic understanding, could elaborate more.'
          }
        ]
      };
    });

    setResults(mockResults);
  }, [candidates]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 65) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 65) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getRecommendationColor = (recommendation: string) => {
    if (recommendation.includes('Highly')) return 'bg-green-100 text-green-800';
    if (recommendation.includes('Recommended')) return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Trophy className="h-8 w-8 mr-3 text-yellow-500" />
          Interview Results
        </h1>
        <p className="mt-2 text-gray-600">View detailed performance analysis and recommendations</p>
      </div>

      {results.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-12 text-center">
          <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Interview Results Yet</h3>
          <p className="text-gray-500">Complete interviews to see results here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Results List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Completed Interviews</h2>
            {results.map((result) => (
              <div
                key={result.sessionId}
                onClick={() => setSelectedResult(result)}
                className={`bg-white shadow-sm rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${selectedResult?.sessionId === result.sessionId
                    ? 'border-blue-500'
                    : 'border-gray-200'
                  }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{result.candidateName}</h3>
                    <p className="text-xs text-gray-500">{result.candidateEmail}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreBgColor(result.overallScore)} ${getScoreColor(result.overallScore)}`}>
                    {result.overallScore}%
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-500 space-x-3">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {result.duration}
                  </span>
                  <span className="flex items-center">
                    <Target className="h-3 w-3 mr-1" />
                    {result.questionsAnswered}/{result.totalQuestions}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Results */}
          {selectedResult ? (
            <div className="lg:col-span-2 space-y-6">
              {/* Overview Card */}
              <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedResult.candidateName}</h2>
                    <p className="text-gray-500">{selectedResult.candidateEmail}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-lg text-2xl font-bold ${getScoreBgColor(selectedResult.overallScore)} ${getScoreColor(selectedResult.overallScore)}`}>
                    {selectedResult.overallScore}%
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Questions</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedResult.questionsAnswered}/{selectedResult.totalQuestions}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Duration</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedResult.duration}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Skills Tested</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedResult.skills.length}</p>
                  </div>
                </div>

                {/* Recommendation */}
                <div className={`px-4 py-3 rounded-lg ${getRecommendationColor(selectedResult.recommendation)}`}>
                  <p className="text-sm font-medium">Recommendation: {selectedResult.recommendation}</p>
                </div>
              </div>

              {/* Skill Breakdown */}
              <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Skill Performance</h3>
                <div className="space-y-4">
                  {selectedResult.skillScores.map((skillScore) => (
                    <div key={skillScore.skill}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700">{skillScore.skill}</span>
                        <span className={`font-semibold ${getScoreColor(skillScore.score * 10)}`}>
                          {skillScore.score}/10
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${skillScore.score >= 8 ? 'bg-green-500' : skillScore.score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                          style={{ width: `${skillScore.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {selectedResult.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {selectedResult.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="flex items-start">
                        <XCircle className="h-5 w-5 mr-2 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Interview Transcript */}
              <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Interview Transcript</h3>
                <div className="space-y-4">
                  {selectedResult.transcript.map((item, idx) => (
                    <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                      <p className="text-sm font-medium text-gray-900 mb-2">Q{idx + 1}: {item.question}</p>
                      <p className="text-sm text-gray-700 mb-2 bg-gray-50 p-3 rounded">
                        <span className="font-medium">Answer:</span> {item.answer}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${getScoreColor(item.score * 10)}`}>
                          Score: {item.score}/10
                        </span>
                        <span className="text-xs text-gray-500">{item.feedback}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 bg-white shadow-sm rounded-lg border border-gray-200 p-12 text-center">
              <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Interview</h3>
              <p className="text-gray-500">Choose an interview from the list to view detailed results</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
