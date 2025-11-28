import React, { useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, Trophy, Star, Eye, Trash2, RefreshCw } from 'lucide-react';
import { getApiUrl } from '../config';
import type { Candidate } from '../types';

interface ResumeManagerProps {
  candidates: Candidate[];
  onCandidatesUpdate: (candidates: Candidate[]) => void;
}

export default function ResumeManager({ candidates, onCandidatesUpdate }: ResumeManagerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isRanking, setIsRanking] = useState(false);
  const [selectedJobId] = useState('job-1'); // Mock job selection

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    // Process files
    const newCandidates: Candidate[] = Array.from(files).map((file, index) => ({
      id: `candidate-${Date.now()}-${index}`,
      name: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '),
      email: `${file.name.split('.')[0].toLowerCase()}@email.com`,
      resume: file.name,
      score: 0,
      status: 'new' as const,
      jobId: selectedJobId,
      appliedAt: new Date(),
      file: file // Store the actual file object
    }));

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

  const handleRankResumes = async () => {
    setIsRanking(true);

    try {
      const formData = new FormData();
      // In a real app, you'd get the actual JD text.
      const jdText = "Software Engineer with React and Node.js experience.";
      formData.append('jd', jdText);

      // Append files
      let hasFiles = false;
      candidates.forEach(c => {
        if (c.file) {
          formData.append('files', c.file);
          hasFiles = true;
        }
      });

      if (!hasFiles) {
        alert("No new files to rank (files must be uploaded in this session to be ranked).");
        setIsRanking(false);
        return;
      }

      const response = await fetch(getApiUrl('rank'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ranking failed');
      }

      const data = await response.json();
      // data.rankings is array of { resume: filename, score: number, analysis: {...} }

      // Update candidates with scores and analysis
      const updatedCandidates = candidates.map(candidate => {
        const rankResult = data.rankings.find((r: any) => r.resume === candidate.resume);
        if (rankResult) {
          return {
            ...candidate,
            score: Math.round(rankResult.score),
            status: 'reviewed' as const,
            analysis: rankResult.analysis
          };
        }
        return candidate;
      });

      // Sort by score descending
      updatedCandidates.sort((a, b) => b.score - a.score);

      onCandidatesUpdate(updatedCandidates);

    } catch (error) {
      console.error("Ranking error:", error);
      alert("Failed to rank resumes.");
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
            className={`h-4 w-4 ${star <= stars ? 'text-yellow-400 fill-current' : 'text-gray-300'
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
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${isDragging
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
                  <React.Fragment key={candidate.id}>
                    <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {candidate.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                            <div className="text-sm text-gray-500">{candidate.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {candidate.score}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < Math.round(candidate.score / 20)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                                }`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${candidate.status === 'reviewed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}>
                          {candidate.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteCandidate(candidate.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>

                    {/* Analysis Row */}
                    {candidate.analysis && (
                      <tr className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td colSpan={5} className="px-6 py-4">
                          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                            {/* Recommendation Badge */}
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-gray-900">Detailed Analysis</h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${candidate.score >= 80 ? 'bg-green-100 text-green-800' :
                                candidate.score >= 65 ? 'bg-blue-100 text-blue-800' :
                                  candidate.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                {candidate.analysis.recommendation}
                              </span>
                            </div>

                            {/* Skills Section */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-xs font-medium text-gray-700 mb-2">✅ Matched Skills</h5>
                                <div className="flex flex-wrap gap-1">
                                  {candidate.analysis.matched_skills.length > 0 ? (
                                    candidate.analysis.matched_skills.map((skill, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                                        {skill}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-gray-500">None identified</span>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h5 className="text-xs font-medium text-gray-700 mb-2">❌ Missing Skills</h5>
                                <div className="flex flex-wrap gap-1">
                                  {candidate.analysis.missing_skills.length > 0 ? (
                                    candidate.analysis.missing_skills.map((skill, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-md">
                                        {skill}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-gray-500">None</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Experience & Education */}
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                              <div>
                                <h5 className="text-xs font-medium text-gray-700">📊 Experience</h5>
                                <p className="text-sm text-gray-600 mt-1">{candidate.analysis.experience_years}</p>
                              </div>
                              <div>
                                <h5 className="text-xs font-medium text-gray-700">🎓 Education</h5>
                                <p className="text-sm text-gray-600 mt-1">{candidate.analysis.education}</p>
                              </div>
                            </div>

                            {/* Strengths & Weaknesses */}
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                              <div>
                                <h5 className="text-xs font-medium text-gray-700 mb-2">💪 Strengths</h5>
                                <ul className="space-y-1">
                                  {candidate.analysis.strengths.map((strength, idx) => (
                                    <li key={idx} className="text-xs text-gray-600 flex items-start">
                                      <span className="text-green-500 mr-1">•</span>
                                      {strength}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="text-xs font-medium text-gray-700 mb-2">⚠️ Areas for Improvement</h5>
                                <ul className="space-y-1">
                                  {candidate.analysis.weaknesses.map((weakness, idx) => (
                                    <li key={idx} className="text-xs text-gray-600 flex items-start">
                                      <span className="text-orange-500 mr-1">•</span>
                                      {weakness}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}