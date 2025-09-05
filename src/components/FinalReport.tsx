import React, { useState } from 'react';
import { ClipboardList, Download, Eye, Filter, Search } from 'lucide-react';
import type { Candidate } from '../types';

interface FinalReportProps {
  candidates: Candidate[];
  onCandidatesUpdate: (candidates: Candidate[]) => void;
}

export default function FinalReport({ candidates, onCandidatesUpdate }: FinalReportProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter candidates who have been interviewed
  const interviewedCandidates = candidates.filter(c => 
    c.status === 'interviewed' && c.sentimentScore
  );

  // Apply filters
  const filteredCandidates = interviewedCandidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || candidate.finalDecision === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const selectedCandidateData = selectedCandidate 
    ? candidates.find(c => c.id === selectedCandidate)
    : null;

  const handleMakeFinalDecision = (candidateId: string, decision: 'hire' | 'reject' | 'on-hold', notes?: string) => {
    const updatedCandidates = candidates.map(c =>
      c.id === candidateId
        ? { 
            ...c, 
            finalDecision: decision,
            status: decision === 'hire' ? 'hired' as const : 
                   decision === 'reject' ? 'rejected' as const : 'on-hold' as const,
            notes
          }
        : c
    );
    onCandidatesUpdate(updatedCandidates);
  };

  const generatePDFReport = (candidate: Candidate) => {
    // Mock PDF generation
    const reportData = {
      candidateName: candidate.name,
      email: candidate.email,
      resumeScore: candidate.score,
      sentimentScore: candidate.sentimentScore,
      finalDecision: candidate.finalDecision,
      notes: candidate.notes,
      interviewDate: candidate.interviewDate,
      generatedAt: new Date().toISOString()
    };

    console.log('Generating PDF report for:', reportData);
    alert(`PDF report generated for ${candidate.name}. In a real application, this would download a PDF file.`);
  };

  const getDecisionColor = (decision?: string) => {
    switch (decision) {
      case 'hire': return 'bg-green-100 text-green-800 border-green-200';
      case 'reject': return 'bg-red-100 text-red-800 border-red-200';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const calculateOverallScore = (candidate: Candidate) => {
    if (!candidate.sentimentScore) return candidate.score;
    
    const resumeWeight = 0.6;
    const sentimentWeight = 0.4;
    
    // Convert sentiment to score (positive bias)
    const sentimentScore = candidate.sentimentScore.positive * 1.0 + 
                          candidate.sentimentScore.neutral * 0.5 + 
                          candidate.sentimentScore.negative * 0.0;
    
    return Math.round(candidate.score * resumeWeight + sentimentScore * sentimentWeight);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Final Decision Reports</h1>
        <p className="mt-2 text-gray-600">Make final hiring decisions and generate reports</p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="hire">Hire</option>
              <option value="reject">Reject</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidates List */}
        <div className="lg:col-span-2 bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Interviewed Candidates ({filteredCandidates.length})
            </h2>
          </div>
          
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No candidates match your criteria</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredCandidates.map((candidate) => {
                const overallScore = calculateOverallScore(candidate);
                
                return (
                  <div key={candidate.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{candidate.name}</h3>
                          <p className="text-sm text-gray-500">{candidate.email}</p>
                          
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Resume Score:</span>
                              <span className="ml-1 font-medium">{candidate.score}/100</span>
                            </div>
                            {candidate.sentimentScore && (
                              <div>
                                <span className="text-gray-600">Interview:</span>
                                <span className={`ml-1 font-medium capitalize ${getSentimentColor(candidate.sentimentScore.overall)}`}>
                                  {candidate.sentimentScore.overall}
                                </span>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-600">Overall:</span>
                              <span className="ml-1 font-medium">{overallScore}/100</span>
                            </div>
                          </div>

                          {candidate.finalDecision && (
                            <div className="mt-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getDecisionColor(candidate.finalDecision)}`}>
                                {candidate.finalDecision.replace('-', ' ').toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => setSelectedCandidate(candidate.id)}
                          className="flex items-center px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                        <button
                          onClick={() => generatePDFReport(candidate)}
                          className="flex items-center px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download Report
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Candidate Details */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Candidate Details</h2>
          </div>
          
          {!selectedCandidateData ? (
            <div className="p-6 text-center text-gray-500">
              <ClipboardList className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>Select a candidate to view details</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Candidate Info */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-white">
                      {selectedCandidateData.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">{selectedCandidateData.name}</h3>
                    <p className="text-gray-500">{selectedCandidateData.email}</p>
                  </div>
                </div>
              </div>

              {/* Scores */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Assessment Scores</h4>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Resume Score</span>
                      <span>{selectedCandidateData.score}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${selectedCandidateData.score}%` }}
                      ></div>
                    </div>
                  </div>

                  {selectedCandidateData.sentimentScore && (
                    <>
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Interview Positive</span>
                          <span>{selectedCandidateData.sentimentScore.positive}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-green-500"
                            style={{ width: `${selectedCandidateData.sentimentScore.positive}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Overall Score</span>
                          <span>{calculateOverallScore(selectedCandidateData)}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-purple-500"
                            style={{ width: `${calculateOverallScore(selectedCandidateData)}%` }}
                          ></div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Final Decision */}
              {!selectedCandidateData.finalDecision ? (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Make Final Decision</h4>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => handleMakeFinalDecision(selectedCandidateData.id, 'hire')}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                      Hire
                    </button>
                    <button
                      onClick={() => handleMakeFinalDecision(selectedCandidateData.id, 'on-hold')}
                      className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
                    >
                      On Hold
                    </button>
                    <button
                      onClick={() => handleMakeFinalDecision(selectedCandidateData.id, 'reject')}
                      className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Final Decision</h4>
                  <div className={`p-4 rounded-lg border ${getDecisionColor(selectedCandidateData.finalDecision)}`}>
                    <p className="font-medium capitalize">{selectedCandidateData.finalDecision.replace('-', ' ')}</p>
                    {selectedCandidateData.notes && (
                      <p className="text-sm mt-2">{selectedCandidateData.notes}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Generate Report */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => generatePDFReport(selectedCandidateData)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate PDF Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}