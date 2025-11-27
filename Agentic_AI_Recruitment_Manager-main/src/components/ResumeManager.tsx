import React, { useState } from 'react';
import { Upload, FileText, Star, Eye, Trash2, RefreshCw, Edit2, Check, X } from 'lucide-react';
import type { Candidate } from '../types';

const API_URL = 'http://127.0.0.1:8000';

interface ResumeManagerProps {
  candidates: Candidate[];
  onCandidatesUpdate: (candidates: Candidate[]) => void;
}

export default function ResumeManager({ candidates, onCandidatesUpdate }: ResumeManagerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isRanking, setIsRanking] = useState(false);
  const [selectedJobId] = useState('job-1');
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [tempEmail, setTempEmail] = useState('');

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    // Mock file processing with better email format
    const newCandidates: Candidate[] = Array.from(files).map((file, index) => {
      const fileName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
      const emailName = fileName.toLowerCase().replace(/\s+/g, '.');
      
      return {
        id: `candidate-${Date.now()}-${index}`,
        name: fileName,
        email: `${emailName}@example.com`, // Better email format
        resume: file.name,
        score: 0,
        status: 'new' as const,
        jobId: selectedJobId,
        appliedAt: new Date(),
      };
    });

    onCandidatesUpdate([...candidates, ...newCandidates]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const startEditEmail = (candidateId: string, currentEmail: string) => {
    setEditingEmail(candidateId);
    setTempEmail(currentEmail);
  };

  const saveEmail = (candidateId: string) => {
    if (!tempEmail || !tempEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    const updatedCandidates = candidates.map(c => 
      c.id === candidateId ? { ...c, email: tempEmail } : c
    );
    onCandidatesUpdate(updatedCandidates);
    setEditingEmail(null);
    setTempEmail('');
  };

  const cancelEditEmail = () => {
    setEditingEmail(null);
    setTempEmail('');
  };

  const handleRankResumes = async () => {
    setIsRanking(true);
    
    try {
      // Mock ranking process
      const updatedCandidates = candidates.map(candidate => ({
        ...candidate,
        score: Math.floor(Math.random() * 40) + 60, // 60-100 score range
        status: 'reviewed' as const
      }));
      
      // Sort by score descending
      updatedCandidates.sort((a, b) => b.score - a.score);
      
      // Save each candidate to backend
      console.log('Saving candidates to backend...', API_URL);
      for (const candidate of updatedCandidates) {
        const rating = Math.floor(candidate.score / 20); // Convert score to 5-star rating
        
        console.log('Saving:', candidate.name, '- Email:', candidate.email);
        
        await fetch(`${API_URL}/api/candidates`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: candidate.name,
            email: candidate.email, // Uses the correct/edited email
            score: candidate.score,
            rating: rating,
            status: candidate.status
          })
        });
      }
      
      onCandidatesUpdate(updatedCandidates);
      alert('✅ Candidates ranked and saved to backend successfully!');
    } catch (error) {
      console.error('Error saving candidates to backend:', error);
      alert('❌ Failed to save candidates. Make sure backend is running on port 8000');
    } finally {
      setIsRanking(false);
    }
  };

  const handleDeleteCandidate = (id: string) => {
    onCandidatesUpdate(candidates.filter(c => c.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-gray-100 text-gray-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'interviewed': return 'bg-yellow-100 text-yellow-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderScoreStars = (score: number) => {
    const stars = Math.floor(score / 20); // Convert to 5-star rating
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= stars ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Resume Management</h1>
        <p className="mt-2 text-gray-600">Upload and rank candidate resumes</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Resumes</h2>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Drop resume files here
          </h3>
          <p className="text-gray-500 mb-4">
            Or click to browse (PDF, DOC, DOCX supported)
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="resume-upload"
          />
          <label
            htmlFor="resume-upload"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors duration-200"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Files
          </label>
        </div>
      </div>

      {/* Ranking Section */}
      {candidates.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Candidate Ranking</h2>
            <button
              onClick={handleRankResumes}
              disabled={isRanking}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isRanking ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Ranking...
                </div>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Rank Resumes
                </>
              )}
            </button>
          </div>

          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {candidates.map((candidate, index) => (
                  <tr key={candidate.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                          {editingEmail === candidate.id ? (
                            <div className="flex items-center gap-1 mt-1">
                              <input
                                type="email"
                                value={tempEmail}
                                onChange={(e) => setTempEmail(e.target.value)}
                                className="text-xs border border-blue-300 rounded px-2 py-1 w-48"
                                placeholder="Enter email"
                                autoFocus
                              />
                              <button
                                onClick={() => saveEmail(candidate.id)}
                                className="text-green-600 hover:text-green-800"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                              <button
                                onClick={cancelEditEmail}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <div className="text-sm text-gray-500">{candidate.email}</div>
                              <button
                                onClick={() => startEditEmail(candidate.id, candidate.email)}
                                className="text-gray-400 hover:text-blue-600"
                                title="Edit email"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {candidate.score > 0 ? `${candidate.score}/100` : 'Not ranked'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {candidate.score > 0 ? renderScoreStars(candidate.score) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(candidate.status)}`}>
                        {candidate.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCandidate(candidate.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}